#!/usr/bin/env python3
"""Build baseline_v1.json from normalized indicator observations.

Inputs:
- data/processed/world_bank_observations.csv

Outputs:
- data/calibrated/baseline_v1.json
- data/calibrated/elasticities_v1.json
"""

from __future__ import annotations

import csv
import json
import statistics
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parents[1]
OBS_PATH = ROOT / "data" / "processed" / "observations_v1.csv"
OBS_FALLBACK_PATH = ROOT / "data" / "processed" / "world_bank_observations.csv"
OUT_BASELINE = ROOT / "data" / "calibrated" / "baseline_v1.json"
OUT_ELASTICITIES = ROOT / "data" / "calibrated" / "elasticities_v1.json"

BASELINE_WINDOW = (2015, 2024)

# Maps game state variable -> preferred indicator chain.
STATE_MAP = {
    "debt_to_gdp": ["DEBT_GDP"],
    "deficit_to_gdp": ["DEFICIT_GDP", "CURRENT_ACCOUNT"],
    "health_outcome": ["UHC_INDEX", "LIFE_EXPECTANCY"],
    "education_outcome": ["HUMAN_CAPITAL", "LOWER_SEC_COMPLETION", "PRIMARY_COMPLETION"],
    "public_safety": ["HOMICIDE_RATE"],
    "institutional_integrity": ["CONTROL_CORRUPTION", "RULELAW_PROXY"],
    "economic_output": ["GDP_PC_PPP"],
    "employment": ["UNEMPLOYMENT"],
    "external_stability": ["CURRENT_ACCOUNT", "FX_RESERVES_MONTHS"],
}

# Direction transforms to 0-100 score where higher is better.
TRANSFORMS = {
    "DEBT_GDP": ("inverse_cap", 0.0, 180.0),
    "DEFICIT_GDP": ("target_band", -3.0, 1.0),
    "UHC_INDEX": ("identity", 0.0, 100.0),
    "HUMAN_CAPITAL": ("scale_0_1", 0.0, 1.0),
    "HOMICIDE_RATE": ("inverse_cap", 0.0, 12.0),
    "PM25": ("inverse_cap", 0.0, 35.0),
    "CONTROL_CORRUPTION": ("scale_wgi", -2.5, 2.5),
    "GDP_PC_PPP": ("log_cap", 2000.0, 80000.0),
    "UNEMPLOYMENT": ("inverse_cap", 0.0, 20.0),
    "CURRENT_ACCOUNT": ("target_band", -4.0, 4.0),
    "LIFE_EXPECTANCY": ("linear_cap", 60.0, 85.0),
    "PRIMARY_COMPLETION": ("identity", 0.0, 100.0),
    "LOWER_SEC_COMPLETION": ("identity", 0.0, 100.0),
    "FX_RESERVES_MONTHS": ("target_band", 3.0, 12.0),
}

# Initial hand-tuned values from the design spec; tune after playtests.
ELASTICITIES = {
    "health_spend_pp_to_health_outcome": 0.15,
    "education_spend_pp_to_education_outcome": 0.12,
    "infrastructure_spend_pp_to_infra_quality": 0.18,
    "integrity_pts_to_leakage_pp": -0.06,
    "deficit_pp_to_debt_trend_pressure": 0.35,
    "surveillance_strictness_10_to_liberties": -4.0,
    "surveillance_strictness_10_to_safety": 1.0,
    "ai_governance_10_to_productivity": 2.0,
    "ai_governance_10_to_misuse_risk": -1.0,
}


def load_observations() -> Dict[str, List[Tuple[int, float]]]:
    by_indicator: Dict[str, List[Tuple[int, float]]] = defaultdict(list)
    path = OBS_PATH if OBS_PATH.exists() else OBS_FALLBACK_PATH
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            indicator = row["indicator_id"]
            year = int(row["year"])
            value = float(row["value"])
            if BASELINE_WINDOW[0] <= year <= BASELINE_WINDOW[1]:
                by_indicator[indicator].append((year, value))
    return by_indicator


def percentile(values: List[float], q: float) -> float:
    if not values:
        return 0.0
    sorted_values = sorted(values)
    idx = max(0, min(len(sorted_values) - 1, int(round((len(sorted_values) - 1) * q))))
    return sorted_values[idx]


def transform(indicator: str, x: float) -> float:
    mode, lo, hi = TRANSFORMS[indicator]
    if mode == "identity":
        return max(0.0, min(100.0, x))
    if mode == "scale_0_1":
        return max(0.0, min(100.0, x * 100.0))
    if mode == "scale_wgi":
        return max(0.0, min(100.0, ((x - lo) / (hi - lo)) * 100.0))
    if mode == "inverse_cap":
        clamped = max(lo, min(hi, x))
        return max(0.0, min(100.0, 100.0 * (1.0 - (clamped - lo) / (hi - lo))))
    if mode == "target_band":
        if lo <= x <= hi:
            return 100.0
        dist = min(abs(x - lo), abs(x - hi))
        # Penalty: 10 points per unit away from target band.
        return max(0.0, 100.0 - dist * 10.0)
    if mode == "linear_cap":
        clamped = max(lo, min(hi, x))
        return ((clamped - lo) / (hi - lo)) * 100.0
    if mode == "log_cap":
        import math

        clamped = max(lo, min(hi, x))
        return ((math.log(clamped) - math.log(lo)) / (math.log(hi) - math.log(lo))) * 100.0
    return 50.0


def pick_indicator(by_indicator: Dict[str, List[Tuple[int, float]]], choices: List[str]) -> str | None:
    for indicator in choices:
        if by_indicator.get(indicator):
            return indicator
    return None


def aggregate(by_indicator: Dict[str, List[Tuple[int, float]]]) -> dict:
    state = {}
    diagnostics = {}

    for state_var, choices in STATE_MAP.items():
        indicator = pick_indicator(by_indicator, choices)
        if indicator is None:
            state[state_var] = 50.0
            diagnostics[state_var] = {"indicator": choices[0], "missing": True}
            continue
        vals = [v for _, v in by_indicator.get(indicator, [])]

        avg = statistics.fmean(vals)
        p10 = percentile(vals, 0.10)
        p90 = percentile(vals, 0.90)
        transformed = transform(indicator, avg)

        state[state_var] = round(transformed, 2)
        diagnostics[state_var] = {
            "indicator": indicator,
            "fallback_used": indicator != choices[0],
            "preferred_indicator": choices[0],
            "raw_mean": round(avg, 4),
            "raw_p10": round(p10, 4),
            "raw_p90": round(p90, 4),
            "score_0_100": round(transformed, 2),
            "sample_count": len(vals),
        }

    # Blend climate resilience from air quality + renewable share if both available.
    climate_components = []
    pm_vals = [v for _, v in by_indicator.get("PM25", [])]
    ren_vals = [v for _, v in by_indicator.get("RENEWABLE_ENERGY", [])]
    if pm_vals:
        climate_components.append(transform("PM25", statistics.fmean(pm_vals)))
    if ren_vals:
        climate_components.append(min(100.0, statistics.fmean(ren_vals) * 1.8))
    if climate_components:
        state["climate_resilience"] = round(statistics.fmean(climate_components), 2)
        diagnostics["climate_resilience"] = {
            "indicator": "PM25+RENEWABLE_ENERGY_BLEND",
            "raw_mean_components": {
                "PM25": round(statistics.fmean(pm_vals), 4) if pm_vals else None,
                "RENEWABLE_ENERGY": round(statistics.fmean(ren_vals), 4) if ren_vals else None,
            },
            "score_0_100": state["climate_resilience"],
            "sample_count": (len(pm_vals) if pm_vals else 0) + (len(ren_vals) if ren_vals else 0),
        }
    else:
        state["climate_resilience"] = 50.0
        diagnostics["climate_resilience"] = {"indicator": "PM25+RENEWABLE_ENERGY_BLEND", "missing": True}

    # A few direct (non-normalized) values also needed in engine.
    debt_vals = [v for _, v in by_indicator.get("DEBT_GDP", [])]
    deficit_vals = [v for _, v in by_indicator.get("DEFICIT_GDP", [])]
    state["debt_to_gdp_pct"] = round(statistics.fmean(debt_vals), 2) if debt_vals else 60.0
    state["deficit_to_gdp_pct"] = round(statistics.fmean(deficit_vals), 2) if deficit_vals else -2.0

    # Composite stability score.
    economy = statistics.fmean([state["economic_output"], state["employment"]])
    social = statistics.fmean([state["health_outcome"], state["education_outcome"], state["public_safety"]])
    integrity = state["institutional_integrity"]
    fiscal = statistics.fmean([state["debt_to_gdp"], state["deficit_to_gdp"]])
    external = state["external_stability"]
    ssi = 0.20 * economy + 0.25 * social + 0.20 * integrity + 0.20 * fiscal + 0.15 * external
    state["state_stability_index"] = round(ssi, 2)

    return {
        "state": state,
        "diagnostics": diagnostics,
    }


def main() -> int:
    if not OBS_PATH.exists() and not OBS_FALLBACK_PATH.exists():
        raise SystemExit(
            f"Missing {OBS_PATH} and {OBS_FALLBACK_PATH}. Run scripts/fetch_world_bank.py first."
        )

    by_indicator = load_observations()
    aggregated = aggregate(by_indicator)

    baseline = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "window": {"start_year": BASELINE_WINDOW[0], "end_year": BASELINE_WINDOW[1]},
        "peer_model": "oecd_like_advanced_western",
        "state": aggregated["state"],
        "diagnostics": aggregated["diagnostics"],
        "notes": [
            "Scores transformed to 0-100 for gameplay comparability.",
            "Some domains are backed by non-World-Bank sources and remain external until integrated.",
            "Tune elasticity and transforms after first balancing playtests.",
        ],
    }

    OUT_BASELINE.parent.mkdir(parents=True, exist_ok=True)
    with OUT_BASELINE.open("w", encoding="utf-8") as f:
        json.dump(baseline, f, indent=2)

    elasticity = {
        "generated_at": baseline["generated_at"],
        "version": "v1_seed",
        "elasticities": ELASTICITIES,
    }
    with OUT_ELASTICITIES.open("w", encoding="utf-8") as f:
        json.dump(elasticity, f, indent=2)

    print(f"wrote {OUT_BASELINE}")
    print(f"wrote {OUT_ELASTICITIES}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
