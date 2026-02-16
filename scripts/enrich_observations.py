#!/usr/bin/env python3
"""Enrich observations with fallback/derived indicators to close v1 gaps.

Inputs:
- data/processed/world_bank_observations.csv

Outputs:
- data/raw/owid/owid_co2_data.csv
- data/processed/observations_v1.csv
- data/processed/enrichment_report.json
"""

from __future__ import annotations

import csv
import json
import math
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parents[1]
IN_PATH = ROOT / "data" / "processed" / "world_bank_observations.csv"
OUT_PATH = ROOT / "data" / "processed" / "observations_v1.csv"
REPORT_PATH = ROOT / "data" / "processed" / "enrichment_report.json"
PEERS_PATH = ROOT / "data" / "peer_countries_v1.csv"
OWID_RAW = ROOT / "data" / "raw" / "owid" / "owid_co2_data.csv"
OWID_URL = "https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv"


def load_peers() -> set[str]:
    peers = set()
    with PEERS_PATH.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for row in r:
            iso = (row.get("iso3") or "").strip().upper()
            if iso:
                peers.add(iso)
    return peers


def load_rows(path: Path) -> List[dict]:
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def index_values(rows: List[dict]) -> Dict[Tuple[str, int, str], float]:
    out: Dict[Tuple[str, int, str], float] = {}
    for row in rows:
        key = (row["country_id"], int(row["year"]), row["indicator_id"])
        try:
            out[key] = float(row["value"])
        except ValueError:
            continue
    return out


def make_row(template: dict, indicator_id: str, indicator_name: str, source_code: str, value: float, source: str, quality_tier: str, quality_flag: str) -> dict:
    row = dict(template)
    row["indicator_id"] = indicator_id
    row["indicator_name"] = indicator_name
    row["source_code"] = source_code
    row["value"] = f"{value:.6f}"
    row["source"] = source
    row["quality_tier"] = quality_tier
    row["quality_flag"] = quality_flag
    return row


def nearest_year_value(idx: Dict[Tuple[str, int, str], float], country: str, year: int, indicator: str, max_gap: int = 3) -> float | None:
    if (country, year, indicator) in idx:
        return idx[(country, year, indicator)]
    best = None
    best_gap = 10**9
    for y in range(year - max_gap, year + max_gap + 1):
        key = (country, y, indicator)
        if key in idx:
            g = abs(y - year)
            if g < best_gap:
                best = idx[key]
                best_gap = g
    return best


def append_derived(rows: List[dict], peers: set[str]) -> List[dict]:
    idx = index_values(rows)
    out = list(rows)

    # find template per country/year for metadata fields
    templates: Dict[Tuple[str, int], dict] = {}
    for r in rows:
        c = r["country_id"]
        if c not in peers:
            continue
        y = int(r["year"])
        templates.setdefault((c, y), r)

    # DEFICIT_GDP proxy from debt dynamics when direct series unavailable.
    for c in peers:
        years = sorted({y for (cc, y, ind) in idx if cc == c and ind == "DEBT_GDP"})
        for y in years:
            if (c, y, "DEFICIT_GDP") in idx:
                continue
            if y - 1 not in years:
                continue
            d_t = idx.get((c, y, "DEBT_GDP"))
            d_prev = idx.get((c, y - 1, "DEBT_GDP"))
            g = idx.get((c, y, "GDP_GROWTH"), 2.0)
            if d_t is None or d_prev is None:
                continue
            # Approximate from debt dynamics with assumed (r-g) term for advanced peers.
            deficit = (d_t - d_prev) - 0.015 * d_prev + 0.1 * (g - 2.0)
            deficit = max(-15.0, min(15.0, deficit))
            tpl = templates.get((c, y))
            if tpl is None:
                continue
            out.append(
                make_row(
                    tpl,
                    "DEFICIT_GDP",
                    "Fiscal balance proxy (% of GDP)",
                    "DERIVED.DEFICIT.DYNAMICS",
                    deficit,
                    "Derived",
                    "Tier3",
                    "derived_proxy",
                )
            )

    # UHC index proxy from life expectancy and out-of-pocket burden.
    for c in peers:
        years = sorted({y for (cc, y, ind) in idx if cc == c and ind == "LIFE_EXPECTANCY"})
        for y in years:
            if (c, y, "UHC_INDEX") in idx:
                continue
            life = idx.get((c, y, "LIFE_EXPECTANCY"))
            oop = nearest_year_value(idx, c, y, "OOPEXP_SHARE", max_gap=3)
            if life is None or oop is None:
                continue
            life_score = max(0.0, min(100.0, ((life - 60.0) / 25.0) * 100.0))
            uhc = max(0.0, min(100.0, life_score - 0.45 * oop + 12.0))
            tpl = templates.get((c, y))
            if tpl is None:
                continue
            out.append(
                make_row(
                    tpl,
                    "UHC_INDEX",
                    "UHC service coverage proxy index",
                    "DERIVED.UHC.PROXY",
                    uhc,
                    "Derived",
                    "Tier3",
                    "derived_proxy",
                )
            )

    # Lower-secondary completion proxy from primary completion + human capital.
    for c in peers:
        years = sorted({y for (cc, y, ind) in idx if cc == c and ind == "PRIMARY_COMPLETION"})
        for y in years:
            if (c, y, "LOWER_SEC_COMPLETION") in idx:
                continue
            primary = idx.get((c, y, "PRIMARY_COMPLETION"))
            hci = nearest_year_value(idx, c, y, "HUMAN_CAPITAL", max_gap=4)
            if primary is None or hci is None:
                continue
            lower_sec = max(0.0, min(100.0, 0.7 * primary + 0.3 * (hci * 100.0) - 4.0))
            tpl = templates.get((c, y))
            if tpl is None:
                continue
            out.append(
                make_row(
                    tpl,
                    "LOWER_SEC_COMPLETION",
                    "Lower secondary completion proxy",
                    "DERIVED.EDU.LOWERSEC",
                    lower_sec,
                    "Derived",
                    "Tier3",
                    "derived_proxy",
                )
            )

    return out


def append_owid_co2(rows: List[dict], peers: set[str]) -> Tuple[List[dict], int]:
    OWID_RAW.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(OWID_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as r:
        payload = r.read()
    OWID_RAW.write_bytes(payload)

    templates: Dict[Tuple[str, int], dict] = {}
    for r in rows:
        c = r["country_id"]
        if c not in peers:
            continue
        templates.setdefault((c, int(r["year"])), r)

    existing = {(r["country_id"], int(r["year"]), r["indicator_id"]) for r in rows}
    appended = 0

    with OWID_RAW.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            iso = (row.get("iso_code") or "").strip().upper()
            if iso not in peers:
                continue
            try:
                year = int(row.get("year") or 0)
            except ValueError:
                continue
            if year < 2000 or year > 2025:
                continue
            val = row.get("co2_per_capita")
            if val in (None, ""):
                continue
            key = (iso, year, "CO2_PC")
            if key in existing:
                continue
            tpl = templates.get((iso, year))
            if tpl is None:
                continue
            try:
                v = float(val)
            except ValueError:
                continue
            rows.append(
                make_row(
                    tpl,
                    "CO2_PC",
                    "CO2 emissions (metric tons per capita)",
                    "OWID.CO2_PER_CAPITA",
                    v,
                    "OWID",
                    "Tier2",
                    "fallback_external",
                )
            )
            appended += 1

    return rows, appended


def wgi_to_100(x: float) -> float:
    return max(0.0, min(100.0, ((x + 2.5) / 5.0) * 100.0))


def append_structural_proxies(rows: List[dict], peers: set[str]) -> List[dict]:
    idx = index_values(rows)
    out = list(rows)
    existing = {(r["country_id"], int(r["year"]), r["indicator_id"]) for r in out}

    templates: Dict[Tuple[str, int], dict] = {}
    for r in rows:
        c = r["country_id"]
        if c not in peers:
            continue
        templates.setdefault((c, int(r["year"])), r)

    for (country, year), tpl in sorted(templates.items()):
        cc = idx.get((country, year, "CONTROL_CORRUPTION"))
        ge = idx.get((country, year, "GOV_EFFECTIVENESS"))
        rl = idx.get((country, year, "RULE_OF_LAW"))
        va = idx.get((country, year, "VOICE_ACCOUNTABILITY"))
        pm25 = idx.get((country, year, "PM25"))
        co2 = idx.get((country, year, "CO2_PC"))
        mil = idx.get((country, year, "MIL_EXP_GDP"))
        h_exp = idx.get((country, year, "HEALTH_EXP_GDP"))
        e_exp = idx.get((country, year, "EDU_EXP_GDP"))
        g_exp = idx.get((country, year, "GGEXP_GDP"))
        gini = idx.get((country, year, "GINI"))
        ext = idx.get((country, year, "CURRENT_ACCOUNT"))

        # Budget transparency proxy (OBS_SCORE)
        if (country, year, "OBS_SCORE") not in existing and cc is not None and ge is not None and rl is not None:
            obs = 0.4 * wgi_to_100(ge) + 0.35 * wgi_to_100(cc) + 0.25 * wgi_to_100(rl)
            out.append(
                make_row(
                    tpl,
                    "OBS_SCORE",
                    "Open Budget Survey score proxy",
                    "DERIVED.OBS.PROXY",
                    obs,
                    "Derived",
                    "Tier3",
                    "derived_proxy",
                )
            )
            existing.add((country, year, "OBS_SCORE"))

        # Disaster affected proxy
        if (country, year, "DISASTER_AFFECTED") not in existing and pm25 is not None:
            co2_v = co2 if co2 is not None else 6.0
            affected = max(20.0, min(1200.0, 12.0 * pm25 + 18.0 * max(0.5, co2_v)))
            out.append(
                make_row(
                    tpl,
                    "DISASTER_AFFECTED",
                    "People affected by disasters proxy (per 100k)",
                    "DERIVED.DISASTER.PROXY",
                    affected,
                    "Derived",
                    "Tier3",
                    "derived_proxy",
                )
            )
            existing.add((country, year, "DISASTER_AFFECTED"))

        # Political finance proxies
        if cc is not None and va is not None:
            if (country, year, "DONATION_DISCLOSURE") not in existing:
                val = 0.55 * wgi_to_100(va) + 0.45 * wgi_to_100(cc)
                out.append(
                    make_row(tpl, "DONATION_DISCLOSURE", "Donation disclosure strictness proxy", "DERIVED.PF.DISC", val, "Derived", "Tier3", "derived_proxy")
                )
                existing.add((country, year, "DONATION_DISCLOSURE"))
            if (country, year, "DONATION_LIMITS") not in existing:
                val = 0.5 * wgi_to_100(cc) + 0.5 * wgi_to_100(va)
                out.append(
                    make_row(tpl, "DONATION_LIMITS", "Donation limits strictness proxy", "DERIVED.PF.LIMITS", val, "Derived", "Tier3", "derived_proxy")
                )
                existing.add((country, year, "DONATION_LIMITS"))
            if (country, year, "PUBLIC_FINANCING_SHARE") not in existing:
                val = max(10.0, min(80.0, 0.6 * wgi_to_100(va) - 0.2 * (wgi_to_100(cc) - 50.0)))
                out.append(
                    make_row(tpl, "PUBLIC_FINANCING_SHARE", "Public party financing share proxy", "DERIVED.PF.PUBLIC", val, "Derived", "Tier3", "derived_proxy")
                )
                existing.add((country, year, "PUBLIC_FINANCING_SHARE"))

        # Budget structure proxies
        if g_exp is not None and g_exp > 0:
            if (country, year, "COFOG_HEALTH_SHARE") not in existing and h_exp is not None:
                out.append(
                    make_row(
                        tpl,
                        "COFOG_HEALTH_SHARE",
                        "Health share of government spending proxy",
                        "DERIVED.COFOG.HEALTH",
                        max(0.0, min(40.0, 100.0 * h_exp / g_exp)),
                        "Derived",
                        "Tier3",
                        "derived_proxy",
                    )
                )
                existing.add((country, year, "COFOG_HEALTH_SHARE"))
            if (country, year, "COFOG_EDU_SHARE") not in existing and e_exp is not None:
                out.append(
                    make_row(
                        tpl,
                        "COFOG_EDU_SHARE",
                        "Education share of government spending proxy",
                        "DERIVED.COFOG.EDU",
                        max(0.0, min(30.0, 100.0 * e_exp / g_exp)),
                        "Derived",
                        "Tier3",
                        "derived_proxy",
                    )
                )
                existing.add((country, year, "COFOG_EDU_SHARE"))
            if (country, year, "COFOG_DEF_SHARE") not in existing and mil is not None:
                out.append(
                    make_row(
                        tpl,
                        "COFOG_DEF_SHARE",
                        "Defense share of government spending proxy",
                        "DERIVED.COFOG.DEF",
                        max(0.0, min(20.0, 100.0 * mil / g_exp)),
                        "Derived",
                        "Tier3",
                        "derived_proxy",
                    )
                )
                existing.add((country, year, "COFOG_DEF_SHARE"))
            if (country, year, "COFOG_SOCIAL_SHARE") not in existing:
                # Welfare-heavy in lower-inequality, aging advanced states.
                gini_v = gini if gini is not None else 32.0
                social = max(20.0, min(50.0, 44.0 - 0.35 * (gini_v - 30.0)))
                out.append(
                    make_row(
                        tpl,
                        "COFOG_SOCIAL_SHARE",
                        "Social protection share proxy",
                        "DERIVED.COFOG.SOCIAL",
                        social,
                        "Derived",
                        "Tier3",
                        "derived_proxy",
                    )
                )
                existing.add((country, year, "COFOG_SOCIAL_SHARE"))

        # SIPRI milex proxy
        if (country, year, "SIPRI_MILEX") not in existing and mil is not None:
            out.append(
                make_row(
                    tpl,
                    "SIPRI_MILEX",
                    "Military expenditure proxy (USD bn index)",
                    "DERIVED.SIPRI.PROXY",
                    max(1.0, mil * 35.0),
                    "Derived",
                    "Tier3",
                    "derived_proxy",
                )
            )
            existing.add((country, year, "SIPRI_MILEX"))

        # Internal policy/event indices seeded from governance/external context.
        if (country, year, "AI_GOVERNANCE_INDEX") not in existing:
            base = wgi_to_100(rq) if (rq := idx.get((country, year, "REG_QUALITY"))) is not None else 50.0
            out.append(make_row(tpl, "AI_GOVERNANCE_INDEX", "AI governance index seed", "DERIVED.AI.SEED", base, "Derived", "TierG", "derived_seed"))
            existing.add((country, year, "AI_GOVERNANCE_INDEX"))
        if (country, year, "SURVEILLANCE_STRICTNESS") not in existing:
            base = 52.0 - (wgi_to_100(va) - 50.0) * 0.25 if va is not None else 50.0
            out.append(make_row(tpl, "SURVEILLANCE_STRICTNESS", "Surveillance strictness seed", "DERIVED.SURV.SEED", base, "Derived", "TierG", "derived_seed"))
            existing.add((country, year, "SURVEILLANCE_STRICTNESS"))
        if (country, year, "CYBER_PRESSURE_INDEX") not in existing:
            base = 42.0 + (abs(ext) * 1.5 if ext is not None else 8.0)
            out.append(make_row(tpl, "CYBER_PRESSURE_INDEX", "Cyber pressure index seed", "DERIVED.CYBER.SEED", base, "Derived", "TierG", "derived_seed"))
            existing.add((country, year, "CYBER_PRESSURE_INDEX"))
        if (country, year, "TRADE_PRESSURE_INDEX") not in existing:
            base = 40.0 + (abs(ext) * 1.8 if ext is not None else 10.0)
            out.append(make_row(tpl, "TRADE_PRESSURE_INDEX", "Trade pressure index seed", "DERIVED.TRADE.SEED", base, "Derived", "TierG", "derived_seed"))
            existing.add((country, year, "TRADE_PRESSURE_INDEX"))

    return out


def write_rows(rows: List[dict], path: Path) -> None:
    if not rows:
        raise RuntimeError("No rows to write")
    fields = list(rows[0].keys())
    path.parent.mkdir(parents=True, exist_ok=True)
    rows_sorted = sorted(rows, key=lambda r: (r["country_id"], int(r["year"]), r["indicator_id"]))
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows_sorted)


def main() -> int:
    if not IN_PATH.exists():
        raise SystemExit(f"Missing {IN_PATH}. Run scripts/fetch_world_bank.py first.")

    peers = load_peers()
    rows = load_rows(IN_PATH)
    base_count = len(rows)

    rows = append_derived(rows, peers)
    derived_count = len(rows) - base_count

    rows, owid_added = append_owid_co2(rows, peers)
    before_structural = len(rows)
    rows = append_structural_proxies(rows, peers)
    structural_added = len(rows) - before_structural

    write_rows(rows, OUT_PATH)

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "input_rows": base_count,
        "derived_rows_added": derived_count,
        "owid_rows_added": owid_added,
        "structural_proxy_rows_added": structural_added,
        "output_rows": len(rows),
        "output_path": str(OUT_PATH),
    }
    with REPORT_PATH.open("w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
