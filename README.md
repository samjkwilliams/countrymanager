# Country Manager Data Pipeline (v1)

This workspace contains the initial simulation/data specification and a baseline data pipeline.

## Files
- `docs/v1-simulation-data-spec.md`: simulation and data design
- `data/indicator_catalog_v1.csv`: source catalog with validation status
- `data/peer_countries_v1.csv`: peer-country set for fictional western baseline calibration
- `scripts/fetch_world_bank.py`: fetch + normalize World Bank series
- `scripts/enrich_observations.py`: add fallback/derived indicators + OWID CO2 fallback
- `scripts/build_baseline.py`: build `baseline_v1.json` and `elasticities_v1.json`
- `scripts/data_coverage_report.py`: report coverage by domain and missing API indicators

## Run
1. Fetch + normalize World Bank indicators:

```bash
python3 scripts/fetch_world_bank.py 2000 2025
```

2. Build baseline files:

```bash
python3 scripts/enrich_observations.py
python3 scripts/build_baseline.py
```

3. Inspect coverage:

```bash
python3 scripts/data_coverage_report.py
```

## Outputs
- `data/raw/world_bank/world_bank_series.json`
- `data/processed/world_bank_observations.csv`
- `data/processed/observations_v1.csv`
- `data/processed/enrichment_report.json`
- `data/processed/normalization_report.json`
- `data/calibrated/baseline_v1.json`
- `data/calibrated/elasticities_v1.json`
- `data/processed/coverage_report.json`

## Notes
- Non-World-Bank sources in the catalog (IMF/OECD/WGI/SIPRI/IDEA/OBS/EM-DAT) are documented and ready for additional ingestors.
- Some catalog entries are intentionally marked `pending_manual_extract` or `pending_api_validation`.
- `observations_v1.csv` includes a mix of:
  - direct observed series (World Bank/WGI)
  - external fallback (`CO2_PC` from OWID)
  - derived proxies/seeds for domains where official APIs were blocked or sparse in this environment
