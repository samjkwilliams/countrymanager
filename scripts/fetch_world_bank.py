#!/usr/bin/env python3
"""Fetch and normalize World Bank indicators listed in data/indicator_catalog_v1.csv.

Outputs:
- data/raw/world_bank/world_bank_series.json
- data/processed/world_bank_observations.csv
- data/processed/normalization_report.json
"""

from __future__ import annotations

import csv
import json
import sys
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "data" / "indicator_catalog_v1.csv"
RAW_PATH = ROOT / "data" / "raw" / "world_bank" / "world_bank_series.json"
OBS_PATH = ROOT / "data" / "processed" / "world_bank_observations.csv"
REPORT_PATH = ROOT / "data" / "processed" / "normalization_report.json"
PEERS_PATH = ROOT / "data" / "peer_countries_v1.csv"

API_ROOT = "https://api.worldbank.org/v2"
PAGE_SIZE = 20000


@dataclass
class Indicator:
    domain: str
    indicator_id: str
    indicator_name: str
    source: str
    source_code: str
    unit: str
    frequency: str
    lag_class: str
    direction_good: str
    quality_tier: str
    validation_status: str


def read_peers() -> List[str]:
    peers: List[str] = []
    with PEERS_PATH.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            iso3 = (row.get("iso3") or "").strip().upper()
            if iso3:
                peers.append(iso3)
    if not peers:
        raise RuntimeError("No peer countries found in data/peer_countries_v1.csv")
    return peers


def read_world_bank_indicators() -> List[Indicator]:
    items: List[Indicator] = []
    with CATALOG_PATH.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("source") not in {"World Bank", "WGI"}:
                continue
            code = (row.get("source_code") or "").strip()
            if not code:
                continue
            items.append(
                Indicator(
                    domain=row["domain"],
                    indicator_id=row["indicator_id"],
                    indicator_name=row["indicator_name"],
                    source=row["source"],
                    source_code=code,
                    unit=row["unit"],
                    frequency=row["frequency"],
                    lag_class=row["lag_class"],
                    direction_good=row["direction_good"],
                    quality_tier=row["quality_tier"],
                    validation_status=row["validation_status"],
                )
            )
    return items


def fetch_indicator_series(indicator_code: str, countries: Iterable[str], start_year: int, end_year: int) -> List[dict]:
    country_segment = ";".join(countries)
    params = {
        "format": "json",
        "date": f"{start_year}:{end_year}",
        "per_page": str(PAGE_SIZE),
        "page": "1",
    }
    url = (
        f"{API_ROOT}/country/{urllib.parse.quote(country_segment, safe=';')}/"
        f"indicator/{urllib.parse.quote(indicator_code)}?{urllib.parse.urlencode(params)}"
    )

    with urllib.request.urlopen(url, timeout=60) as resp:
        payload = json.loads(resp.read().decode("utf-8"))

    if not isinstance(payload, list) or len(payload) < 2:
        return []

    meta = payload[0] or {}
    pages = int(meta.get("pages") or 1)
    all_rows = list(payload[1] or [])

    for page in range(2, pages + 1):
        params["page"] = str(page)
        page_url = (
            f"{API_ROOT}/country/{urllib.parse.quote(country_segment, safe=';')}/"
            f"indicator/{urllib.parse.quote(indicator_code)}?{urllib.parse.urlencode(params)}"
        )
        with urllib.request.urlopen(page_url, timeout=60) as resp:
            page_payload = json.loads(resp.read().decode("utf-8"))
        if isinstance(page_payload, list) and len(page_payload) >= 2 and page_payload[1]:
            all_rows.extend(page_payload[1])

    return all_rows


def normalize_rows(indicator: Indicator, rows: List[dict], fetched_at: str) -> List[dict]:
    out: List[dict] = []
    for row in rows:
        value = row.get("value")
        year = row.get("date")
        country = (row.get("countryiso3code") or "").upper()
        if value is None or not country or not year:
            continue
        out.append(
            {
                "country_id": country,
                "year": int(year),
                "indicator_id": indicator.indicator_id,
                "indicator_name": indicator.indicator_name,
                "source_code": indicator.source_code,
                "domain": indicator.domain,
                "value": float(value),
                "unit": indicator.unit,
                "frequency": indicator.frequency,
                "lag_class": indicator.lag_class,
                "direction_good": indicator.direction_good,
                "source": indicator.source,
                "quality_tier": indicator.quality_tier,
                "quality_flag": indicator.validation_status,
                "updated_at": fetched_at,
            }
        )
    return out


def write_csv(rows: List[dict]) -> None:
    OBS_PATH.parent.mkdir(parents=True, exist_ok=True)
    fields = [
        "country_id",
        "year",
        "indicator_id",
        "indicator_name",
        "source_code",
        "domain",
        "value",
        "unit",
        "frequency",
        "lag_class",
        "direction_good",
        "source",
        "quality_tier",
        "quality_flag",
        "updated_at",
    ]
    with OBS_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    start_year = 2000
    end_year = datetime.now(timezone.utc).year
    if len(sys.argv) >= 2:
        start_year = int(sys.argv[1])
    if len(sys.argv) >= 3:
        end_year = int(sys.argv[2])

    peers = read_peers()
    indicators = read_world_bank_indicators()
    if not indicators:
        print("No World Bank indicators found in catalog.", file=sys.stderr)
        return 1

    fetched_at = datetime.now(timezone.utc).isoformat()
    raw_dump: Dict[str, List[dict]] = {}
    normalized: List[dict] = []
    errors: Dict[str, str] = {}

    for indicator in indicators:
        code = indicator.source_code
        try:
            series = fetch_indicator_series(code, peers, start_year, end_year)
            raw_dump[code] = series
            normalized.extend(normalize_rows(indicator, series, fetched_at))
            print(f"fetched {code}: {len(series)} raw rows")
        except Exception as exc:  # pragma: no cover
            errors[code] = str(exc)
            print(f"failed {code}: {exc}", file=sys.stderr)

    RAW_PATH.parent.mkdir(parents=True, exist_ok=True)
    with RAW_PATH.open("w", encoding="utf-8") as f:
        json.dump(raw_dump, f)

    write_csv(normalized)

    report = {
        "fetched_at": fetched_at,
        "peer_country_count": len(peers),
        "indicator_count": len(indicators),
        "normalized_row_count": len(normalized),
        "errors": errors,
        "start_year": start_year,
        "end_year": end_year,
    }
    with REPORT_PATH.open("w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(json.dumps(report, indent=2))
    return 0 if len(normalized) > 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
