# Country Manager v1 - Simulation and Data Specification

Last updated: 2026-02-15

## 1) Goal
Build a web-based, hybrid realtime country-management simulation that is fun and educational, while preserving policy realism through high-trust public data and transparent delayed consequences.

## 2) Source Strategy (Quality First)
Use only primary or institutionally authoritative sources for core metrics and budget structure.

Core sources:
- World Bank Data (WDI + metadata API): broad socio-economic coverage and stable API
  - https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation
  - https://api.worldbank.org/v2/
- OECD Data Explorer / COFOG (budget function structure)
  - https://data-explorer.oecd.org/
  - https://www.oecd.org/en/data/indicators/general-government-spending.html
- IMF Data API + Fiscal Monitor data pages (debt/deficit calibration)
  - https://data.imf.org/en/Resource-Pages/IMF-API
  - https://www.imf.org/en/Publications/FM/Issues/2025/04/23/fiscal-monitor-april-2025
- World Bank Worldwide Governance Indicators (WGI): control of corruption, rule of law, government effectiveness
  - https://www.worldbank.org/en/publication/worldwide-governance-indicators
- IDEA Political Finance Database (campaign finance rules/structures)
  - https://www.idea.int/data-tools/data/political-finance-database
- Open Budget Survey (budget transparency / oversight)
  - https://internationalbudget.org/open-budget-survey/
- SIPRI Military Expenditure Database (defense burden calibration)
  - https://www.sipri.org/databases/milex

## 3) Data Architecture

### 3.1 Pipelines
1. Raw ingest
- Pull CSV/JSON from source APIs into `data/raw/<source>/<date>/`.
- Save exact upstream response plus checksum.

2. Standardization
- Normalize fields into canonical schema:
  - `country_id`, `year`, `indicator_id`, `value`, `unit`, `source`, `quality_flag`, `updated_at`.
- Units standardized to either `% GDP`, `% of total budget`, `per 100k`, `index 0-100`, or absolute currency PPP.

3. Feature engineering
- Produce simulation-ready features:
  - z-scores by peer group (OECD-like advanced economies)
  - trend slopes (3y, 5y)
  - volatility bands
  - lag candidates (short, medium, long)

4. Calibration outputs
- Export `data/calibrated/baseline_v1.json`:
  - baseline state vector
  - policy elasticities
  - lag distributions
  - event probabilities

### 3.2 Quality gates
- Completeness gate: >= 90% non-null for core indicators in baseline years.
- Freshness gate: macro series updated within 18 months.
- Coherence gate: identity checks (e.g., budget shares sum near 100 with tolerance).
- Stability gate: outlier detection using robust z-score and winsorization.

## 4) Core Sim Variables (v1)

State vectors (0-100 unless noted):
- `fiscal_space` (derived)
- `debt_to_gdp` (% GDP)
- `deficit_to_gdp` (% GDP)
- `health_outcome`
- `education_outcome`
- `infrastructure_quality`
- `public_safety`
- `social_protection`
- `climate_resilience`
- `institutional_integrity`
- `civil_liberties`
- `economic_output` (index)
- `employment` (index)
- `external_stability`
- `state_stability_index` (composite)

Control vectors:
- Budget allocations by function (health, education, defense, infrastructure, policing, welfare, climate, administration)
- Tax posture (`low`, `base`, `high`) + progressive setting (0-100)
- Borrowing posture (0-100)
- Anti-corruption enforcement (0-100)
- Donation regulation strictness (0-100)
- Surveillance strictness (0-100)
- AI governance strictness (0-100)

## 5) Budget and Macro Mechanics

Weekly tick with daily sub-step accumulation; one game day every 90 seconds realtime.

### 5.1 Budget identity
- Revenue = tax_base * effective_tax_rate * compliance
- Expenditure = sum(ministry_opex + ministry_capex) + debt_service
- Deficit = Expenditure - Revenue
- Debt(t+1) = Debt(t) + Deficit + shock_adjustment

### 5.2 Growth dynamics (simplified, data-calibrated)
- `gdp_growth = base_growth + infra_mult + edu_mult + health_mult - corruption_drag - instability_drag + external_shock`
- Multipliers are capped and lagged:
  - Infrastructure: medium lag (26-104 in-game weeks)
  - Education: long lag (52-208 weeks)
  - Preventive health: medium lag (13-78 weeks)

### 5.3 Corruption leakage
- Procurement leakage reduces effective spending:
  - `effective_spend_i = allocated_spend_i * (1 - leakage_rate)`
- `leakage_rate` rises with weak integrity and permissive donations, falls with enforcement and transparency.

## 6) Suggested Elasticity Defaults (v1 starting point)
These are initial gameplay coefficients to tune by playtests, anchored by empirical directionality.

- +1 pp health spend (% GDP) -> +0.15 health_outcome over medium lag
- +1 pp education spend (% GDP) -> +0.12 education_outcome over long lag
- +1 pp infrastructure spend (% GDP) -> +0.18 infrastructure_quality over medium lag
- +10 pts integrity -> -0.6 pp leakage_rate
- +1 pp deficit sustained > 2 years -> +0.35 debt_to_gdp trend pressure
- +10 pts surveillance strictness without safeguards -> -4 civil_liberties, +1 short-run public_safety
- +10 pts AI governance quality -> +2 productivity trend, -1 misuse risk

### 6.1 OECD-like baseline budget bands for initial balancing
Use these as v1 calibration bands for a fictional advanced western country. They are not hard constraints; they are \"normal operating zones\" used for warning logic.

- Health: 14% to 20% of total government spending
- Education: 9% to 15%
- Social protection/welfare: 28% to 42%
- Defense: 2% to 8%
- Public order/policing: 3% to 8%
- Economic affairs + infrastructure: 8% to 16%
- General public services + debt service + administration: 10% to 20%
- Environment + climate programs: 1% to 6%

Notes:
- OECD reports social protection as the largest category and health/education as major shares in recent years; use this shape as the baseline profile.
- Defense, climate, and integrity spend should be scenario-sensitive and not locked to one ideology or country profile.

## 7) Indicator-to-System Mapping
Detailed machine-readable catalog: `data/indicator_catalog_v1.csv`.

Minimum per-system mapping requirements:
- Healthcare: spending, life expectancy, UHC/service access
- Education: public spend, completion/learning proxy
- Policing/Safety: homicide/violent-crime proxy, trust proxy
- Welfare: social assistance coverage + poverty proxy
- Debt/Fiscal: debt, deficit, interest burden
- Climate/Environment: emissions, PM2.5 exposure, disaster risk proxy
- Governance/Corruption: WGI control of corruption, rule of law, government effectiveness
- Defense: military expenditure burden
- International pressure: trade concentration + external balance proxy

## 8) Delayed Consequences and Explainability
Every policy action writes a causality record:
- `action_id`, `tick_issued`, `expected_windows`, `affected_systems`, `confidence`.

When effect triggers, surface:
- "Your policy from 3 weeks ago increased X but now decreased Y due to Z."

UI rule:
- show direction + confidence band, not exact hidden formula.

## 9) Elections and Political Economy
- Election cycle: every 3 in-game years.
- Voter blocs track weighted outcomes: cost of living, services, rights, integrity, security.
- Donations and lobbying modify policy pressure and corruption risk, but no real party labels.

## 10) Collapse and Warning System
- Composite `state_stability_index` (weighted):
  - economy 20%
  - social outcomes 25%
  - institutional integrity 20%
  - fiscal sustainability 20%
  - external stability 15%
- Collapse trigger:
  - `state_stability_index < 30` for 4 consecutive in-game weeks, OR
  - any two catastrophic subsystem breaches together.
- Warning layers:
  - Advisory: projected deterioration within 8 weeks
  - Critical: projected threshold breach within 4 weeks
  - Emergency: active collapse condition

## 11) Event Schema (JSON)
```json
{
  "event_id": "health_procurement_scandal",
  "title": "Hospital Procurement Audit Leak",
  "category": "corruption",
  "trigger": {
    "all": [
      { "var": "institutional_integrity", "op": "<", "value": 45 },
      { "var": "health_budget_share", "op": ">", "value": 0.16 }
    ],
    "chance_per_week": 0.06
  },
  "choices": [
    {
      "id": "independent_inquiry",
      "label": "Launch independent inquiry",
      "immediate": [
        { "var": "approval", "delta": -2 },
        { "var": "institutional_integrity", "delta": 4 }
      ],
      "delayed": [
        {
          "after_weeks": 6,
          "effects": [
            { "var": "leakage_rate", "delta": -0.02 },
            { "var": "health_outcome", "delta": 2 }
          ]
        }
      ]
    },
    {
      "id": "suppress_story",
      "label": "Suppress and deny",
      "immediate": [
        { "var": "approval", "delta": 1 }
      ],
      "delayed": [
        {
          "after_weeks": 4,
          "effects": [
            { "var": "institutional_integrity", "delta": -6 },
            { "var": "external_stability", "delta": -3 }
          ]
        }
      ]
    }
  ],
  "provenance": {
    "sources": ["WGI", "OBS"],
    "confidence": 0.72
  }
}
```

## 12) Guardrails (Apolitical + Legal)
- No direct attribution of harmful outcomes to named real countries/religions/ethnicities.
- Fictional country only; real-world data used for calibration patterns, not direct accusation narratives.
- Content moderation pass for events touching identity-sensitive contexts.

## 13) Implementation Starter (immediate)
1. Create ingestion scripts per source using indicator catalog.
2. Build baseline calibration notebook/script for 2010-2024 peer averages.
3. Export `baseline_v1.json` and `elasticities_v1.json`.
4. Build deterministic tick engine with lag queue and causality log.

## 14) Known Risks
- Some governance/political finance data are annual and sparse; interpolation needed.
- Cross-source methodology differences require explicit confidence scoring per indicator.
- AI policy and surveillance are partly normative; use mixed quantitative + rule-based mechanics.

## 15) References
- World Bank Indicators API: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation
- World Bank API root: https://api.worldbank.org/v2/
- World Bank WGI: https://www.worldbank.org/en/publication/worldwide-governance-indicators
- OECD Government Spending indicator page: https://www.oecd.org/en/data/indicators/general-government-spending.html
- OECD Data Explorer: https://data-explorer.oecd.org/
- IMF API resource page: https://data.imf.org/en/Resource-Pages/IMF-API
- IMF Fiscal Monitor (Apr 2025): https://www.imf.org/en/Publications/FM/Issues/2025/04/23/fiscal-monitor-april-2025
- IDEA Political Finance Database: https://www.idea.int/data-tools/data/political-finance-database
- Open Budget Survey: https://internationalbudget.org/open-budget-survey/
- SIPRI Military Expenditure Database: https://www.sipri.org/databases/milex
