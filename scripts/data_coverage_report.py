#!/usr/bin/env python3
"""Summarize indicator coverage by domain for the normalized dataset."""

from __future__ import annotations

import csv
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data" / "indicator_catalog_v1.csv"
OBS = ROOT / "data" / "processed" / "observations_v1.csv"
OBS_FALLBACK = ROOT / "data" / "processed" / "world_bank_observations.csv"
OUT = ROOT / "data" / "processed" / "coverage_report.json"


def main() -> int:
    catalog = {}
    by_domain_total = defaultdict(int)
    by_domain_found = defaultdict(int)
    found_indicators = set()

    with CATALOG.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for row in r:
            ind = row["indicator_id"]
            catalog[ind] = row
            by_domain_total[row["domain"]] += 1

    obs_path = OBS if OBS.exists() else OBS_FALLBACK
    with obs_path.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for row in r:
            found_indicators.add(row["indicator_id"])

    for ind in found_indicators:
        row = catalog.get(ind)
        if row:
            by_domain_found[row["domain"]] += 1

    report = {
        "domain_coverage": {},
        "missing_indicators": [],
        "found_indicator_count": len(found_indicators),
        "catalog_indicator_count": len(catalog),
    }

    for domain, total in sorted(by_domain_total.items()):
        found = by_domain_found.get(domain, 0)
        report["domain_coverage"][domain] = {
            "found": found,
            "total": total,
            "coverage_pct": round((found / total) * 100.0, 1) if total else 0.0,
        }

    for ind, row in catalog.items():
        if ind not in found_indicators and row["source"] in {"World Bank", "WGI"}:
            report["missing_indicators"].append(
                {
                    "indicator_id": ind,
                    "source_code": row["source_code"],
                    "domain": row["domain"],
                    "source": row["source"],
                }
            )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
