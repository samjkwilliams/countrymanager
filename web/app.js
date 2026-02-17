const TICK_MS = 1000;
const DAYS_PER_YEAR = 365;
const TILE_W = 64;
const TILE_H = 32;
const MAP_W = 24;
const MAP_H = 24;
const ASSET_BASE = "./assets/cozy-pack";
const POLICY_PACE = 0.25;
const AP_REGEN_DAYS = 4;
const RAPID_INTERVAL_DAYS = 80;
const RAPID_WINDOW_DAYS = 20;
const MONTHLY_REPORT_DAYS = 120;
const MAJOR_EVENT_INTERVAL_DAYS = 18;
const MAX_ACTIVE_MAJOR_EVENTS = 2;

const TIER_CONFIG = [
  {
    name: "City",
    goal: "Keep local services healthy and stable while learning delayed consequences.",
    checks: [
      { label: "Health and Safety above 68", pass: (s) => s.kpi.health > 68 && s.kpi.safety > 68 },
      { label: "Integrity above 64", pass: (s) => s.kpi.integrity > 64 },
    ],
  },
  {
    name: "State",
    goal: "Balance infrastructure growth and climate resilience without debt blowout.",
    checks: [
      { label: "Economy and Climate above 66", pass: (s) => s.kpi.economy > 66 && s.kpi.climate > 66 },
      { label: "Debt below 105%", pass: (s) => s.budget.debt < 105 },
    ],
  },
  {
    name: "Nation",
    goal: "Deliver long-run prosperity with resilient institutions.",
    checks: [
      { label: "Stability above 74", pass: (s) => s.kpi.stability > 74 },
      { label: "Integrity above 72 and Debt below 95%", pass: (s) => s.kpi.integrity > 72 && s.budget.debt < 95 },
    ],
  },
];

const BUILDING_DEFS = [
  { id: "health", name: "Health Ministry", desc: "Hospitals, prevention, ambulance readiness.", color: "#ef9f8f", tile: [8, 8], kpi: "health" },
  { id: "education", name: "Education Bureau", desc: "Schools, workforce skills, learning outcomes.", color: "#ffd27a", tile: [11, 7], kpi: "education" },
  { id: "transport", name: "Transport Office", desc: "Transit throughput and infrastructure reliability.", color: "#8ac7a6", tile: [14, 10], kpi: "economy" },
  { id: "welfare", name: "Welfare Agency", desc: "Social support and household stability.", color: "#afc4ff", tile: [9, 12], kpi: "health" },
  { id: "security", name: "Security Department", desc: "Public safety and surveillance pressure.", color: "#9faec9", tile: [12, 12], kpi: "safety" },
  { id: "climate", name: "Climate Office", desc: "Air quality and adaptation programs.", color: "#8fd2bb", tile: [15, 14], kpi: "climate" },
  { id: "treasury", name: "Treasury", desc: "Revenue quality, debt and budget capacity.", color: "#f0b77a", tile: [7, 15], kpi: "stability" },
  { id: "integrity", name: "Integrity Commission", desc: "Oversight and corruption control.", color: "#b98dc9", tile: [13, 16], kpi: "integrity" },
];

const INCIDENT_TYPES = [
  { id: "crime", title: "Street Crime Spike", kpi: "safety", perDayPenalty: 0.55, responder: "police", color: "#cc5b5b", icon: "!" },
  { id: "medical", title: "Medical Overflow", kpi: "health", perDayPenalty: 0.6, responder: "ambulance", color: "#d46a6a", icon: "+" },
  { id: "fire", title: "Substation Fire", kpi: "economy", perDayPenalty: 0.5, responder: "utility", color: "#d47f38", icon: "*" },
  { id: "flood", title: "Flash Flooding", kpi: "climate", perDayPenalty: 0.52, responder: "utility", color: "#4f91d8", icon: "~" },
  { id: "corruption", title: "Procurement Leak", kpi: "integrity", perDayPenalty: 0.58, responder: "audit", color: "#9c6bc7", icon: "?" },
];

const EVENT_POOL = [
  { title: "Transit Union Strike", flavor: "Commuter delays spike near central corridors.", impact: (s) => { s.kpi.economy -= 1.2; s.kpi.safety -= 0.4; } },
  { title: "Community Festival", flavor: "Local turnout boosts morale and trust.", impact: (s) => { s.kpi.stability += 1.0; s.kpi.integrity += 0.25; } },
  { title: "Clean Air Week", flavor: "Temporary restrictions cut pollution quickly.", impact: (s) => { s.kpi.climate += 1.0; s.kpi.economy -= 0.3; } },
  { title: "Construction Boom", flavor: "New worksites create jobs and noise.", impact: (s) => { s.kpi.economy += 1.3; s.kpi.climate -= 0.5; } },
  { title: "Youth Training Uptake", flavor: "Skill grants exceed expected participation.", impact: (s) => { s.kpi.education += 0.9; s.kpi.economy += 0.7; } },
  { title: "Volunteer Cleanup", flavor: "Neighborhood groups improve local amenity.", impact: (s) => { s.kpi.climate += 0.9; s.kpi.stability += 0.5; } },
];

const RAPID_DECISIONS = [
  {
    title: "Bridge Cable Fault",
    body: "Transport engineers need immediate shutdown approval.",
    a: "Close bridge now",
    b: "Keep lanes open",
    defaultChoice: "b",
    tipA: "Safer roads now, slower economy, higher spending.",
    tipB: "Economy holds, but safety can drop sharply.",
    applyA: (s) => { s.kpi.safety += 1.4; s.kpi.economy -= 0.8; s.budget.expenditure += 1.1; },
    applyB: (s) => { s.kpi.safety -= 1.8; s.kpi.economy += 0.4; },
  },
  {
    title: "Hospital Overflow",
    body: "Emergency wards request temporary overtime funding.",
    a: "Approve overtime",
    b: "Hold spending cap",
    defaultChoice: "b",
    tipA: "Health relief now, costs increase.",
    tipB: "Budget protected, health and trust can fall.",
    applyA: (s) => { s.kpi.health += 1.8; s.budget.expenditure += 1.3; },
    applyB: (s) => { s.kpi.health -= 1.5; s.kpi.stability -= 0.7; },
  },
  {
    title: "Corruption Tip-Off",
    body: "Whistleblower files suggest contract manipulation.",
    a: "Launch raid",
    b: "Quiet review",
    defaultChoice: "b",
    tipA: "Integrity rises long-term, short-term spend rises.",
    tipB: "Quieter today, trust drops later.",
    applyA: (s) => { s.kpi.integrity += 1.8; s.budget.expenditure += 0.7; },
    applyB: (s) => { s.kpi.integrity -= 1.4; s.kpi.stability -= 0.5; },
  },
  {
    title: "Sudden Heat Spike",
    body: "Two districts report transformer stress and heat illness.",
    a: "Open cool centers",
    b: "Public advisory only",
    defaultChoice: "b",
    tipA: "Better health/climate resilience, higher spend.",
    tipB: "Lower immediate spend, higher incident risk.",
    applyA: (s) => { s.kpi.health += 1.0; s.kpi.climate += 0.7; s.budget.expenditure += 0.9; },
    applyB: (s) => { s.kpi.health -= 1.1; s.kpi.climate -= 0.7; },
  },
];

const SESSION_GOALS = [
  { id: "resolve", label: "Resolve 3 incidents in 10 days", target: 3, days: 10, rewardAP: 2, rewardCash: 10 },
  { id: "actions", label: "Take 5 actions in 10 days", target: 5, days: 10, rewardAP: 2, rewardCash: 8 },
  { id: "stability", label: "Keep stability above 66 for 7 days", target: 7, days: 10, rewardAP: 1, rewardCash: 12 },
];

const DEMOGRAPHICS = [
  { id: "poverty", label: "Poverty Households", weight: { welfare: 0.45, health: 0.24, climate: 0.2, corruption: -0.25, debt: -0.16, inequality: -0.34 } },
  { id: "working", label: "Working Class", weight: { welfare: 0.26, health: 0.24, education: 0.2, climate: 0.18, corruption: -0.2, debt: -0.13, inequality: -0.28 } },
  { id: "middle", label: "Middle Class", weight: { education: 0.28, health: 0.18, economy: 0.22, climate: 0.16, corruption: -0.16, debt: -0.1, inequality: -0.2 } },
  { id: "business", label: "Business Owners", weight: { economy: 0.34, infrastructure: 0.28, integrity: 0.18, debt: -0.09, climate: 0.08, inequality: 0.1 } },
  { id: "elite", label: "High Wealth", weight: { economy: 0.36, integrity: 0.12, debt: -0.05, climate: 0.08, inequality: 0.2 } },
];

const DEMOGRAPHIC_GUIDE = {
  poverty: "Responds most to welfare reliability, health access, and anti-corruption.",
  working: "Responds to wages/services balance: welfare, health, transport, skills.",
  middle: "Responds to education quality, safe streets, and long-run stability.",
  business: "Responds to reliable infrastructure, economic momentum, and rule clarity.",
  elite: "Responds to growth confidence, low volatility, and institutional predictability.",
};

const PEOPLE_INITIATIVES = [
  {
    id: "rent_relief",
    name: "Targeted Rent Relief",
    costAP: 1,
    costCash: 10,
    desc: "Emergency rental support for high-stress districts.",
    apply: (s) => {
      const add = { poverty: 8, working: 4, middle: 1, business: -1, elite: -1 };
      s.kpi.health = clamp(s.kpi.health + 0.8, 0, 100);
      s.kpi.stability = clamp(s.kpi.stability + 0.6, 0, 100);
      return add;
    },
  },
  {
    id: "skills_grants",
    name: "Skills & Apprenticeship Grants",
    costAP: 1,
    costCash: 12,
    desc: "Fast-tracks training pathways and job matching.",
    apply: (s) => {
      const add = { poverty: 3, working: 6, middle: 5, business: 2, elite: 1 };
      s.kpi.education = clamp(s.kpi.education + 1.0, 0, 100);
      s.kpi.economy = clamp(s.kpi.economy + 0.7, 0, 100);
      return add;
    },
  },
  {
    id: "small_business",
    name: "Small Business Credit",
    costAP: 1,
    costCash: 9,
    desc: "Working-capital support for local operators, tied to payroll retention.",
    apply: (s) => {
      const add = { poverty: 1, working: 4, middle: 3, business: 6, elite: 2 };
      s.kpi.economy = clamp(s.kpi.economy + 1.1, 0, 100);
      return add;
    },
  },
  {
    id: "integrity_blitz",
    name: "Integrity Blitz",
    costAP: 1,
    costCash: 8,
    desc: "Procurement audits + anti-donation loophole enforcement.",
    apply: (s) => {
      const add = { poverty: 5, working: 4, middle: 4, business: 2, elite: 1 };
      s.kpi.integrity = clamp(s.kpi.integrity + 1.5, 0, 100);
      s.kpi.stability = clamp(s.kpi.stability + 0.5, 0, 100);
      return add;
    },
  },
  {
    id: "green_retrofit",
    name: "Green Home Retrofit",
    costAP: 1,
    costCash: 11,
    desc: "Insulation and heat-resilience upgrades for homes and schools.",
    apply: (s) => {
      const add = { poverty: 4, working: 4, middle: 4, business: 1, elite: 2 };
      s.kpi.climate = clamp(s.kpi.climate + 1.3, 0, 100);
      s.kpi.health = clamp(s.kpi.health + 0.5, 0, 100);
      return add;
    },
  },
  {
    id: "corp_tax_holiday",
    name: "Corporate Tax Holiday",
    costAP: 1,
    costCash: 0,
    desc: "Short-term investor boost. Often worsens perceived fairness if overused.",
    apply: (s) => {
      const add = { poverty: -6, working: -4, middle: -3, business: 6, elite: 8 };
      s.kpi.economy = clamp(s.kpi.economy + 0.8, 0, 100);
      s.kpi.integrity = clamp(s.kpi.integrity - 0.8, 0, 100);
      s.kpi.stability = clamp(s.kpi.stability - 0.5, 0, 100);
      s.budget.debt = clamp(s.budget.debt + 1.8, 0, 250);
      return add;
    },
  },
  {
    id: "community_safety",
    name: "Community Safety Pact",
    costAP: 1,
    costCash: 10,
    desc: "Focused patrol + youth outreach in hotspot neighborhoods.",
    apply: (s) => {
      const add = { poverty: 3, working: 5, middle: 3, business: 3, elite: 1 };
      s.kpi.safety = clamp(s.kpi.safety + 1.2, 0, 100);
      return add;
    },
  },
  {
    id: "flood_shield",
    name: "Flood Shield Program",
    costAP: 1,
    costCash: 13,
    desc: "Rapid drainage + home protection in exposed districts.",
    apply: (s) => {
      const add = { poverty: 5, working: 4, middle: 3, business: 2, elite: 1 };
      s.kpi.climate = clamp(s.kpi.climate + 1.4, 0, 100);
      s.kpi.health = clamp(s.kpi.health + 0.5, 0, 100);
      return add;
    },
  },
  {
    id: "transit_relief",
    name: "Transit Reliability Blitz",
    costAP: 1,
    costCash: 11,
    desc: "Peak-hour service rescue and maintenance surge.",
    apply: (s) => {
      const add = { poverty: 2, working: 5, middle: 4, business: 3, elite: 1 };
      s.kpi.economy = clamp(s.kpi.economy + 1.0, 0, 100);
      s.kpi.safety = clamp(s.kpi.safety + 0.4, 0, 100);
      return add;
    },
  },
];

const MAJOR_EVENT_LIBRARY = [
  {
    id: "storm_drain_failure",
    title: "Coastal Drainage Failure",
    body: "Tide surge is backing into low-lying housing blocks. Household losses are rising nightly.",
    hint: "Flood relief + climate resilience funding usually stabilizes this fastest.",
    domain: "climate",
    color: "#3f9ae4",
    days: 14,
    perDayDem: { poverty: -1.4, working: -0.9, middle: -0.2, business: -0.1, elite: 0 },
    perDayKpi: { climate: -0.3, health: -0.2, stability: -0.2 },
    response: { label: "Deploy flood package", costAP: 1, costCash: 14, dem: { poverty: 8, working: 5, middle: 2, business: 1, elite: 0 }, kpi: { climate: 1.2, health: 0.8 } },
  },
  {
    id: "night_crime_wave",
    title: "Night District Crime Wave",
    body: "A coordinated spree is overwhelming evening precinct coverage in high-footfall suburbs.",
    hint: "Safety initiatives and targeted policing reduce escalation risk.",
    domain: "security",
    color: "#d65e5e",
    days: 12,
    perDayDem: { poverty: -0.4, working: -1.0, middle: -0.9, business: -0.6, elite: -0.5 },
    perDayKpi: { safety: -0.35, stability: -0.18 },
    response: { label: "Authorize surge operation", costAP: 1, costCash: 12, dem: { poverty: 2, working: 6, middle: 5, business: 4, elite: 3 }, kpi: { safety: 1.3 } },
  },
  {
    id: "clinic_system_outage",
    title: "Regional Clinic Outage",
    body: "Appointment and triage systems are failing across outer districts.",
    hint: "Health funding and emergency service support prevent trust collapse.",
    domain: "health",
    color: "#e28d7f",
    days: 10,
    perDayDem: { poverty: -1.0, working: -0.8, middle: -0.5, business: -0.1, elite: -0.1 },
    perDayKpi: { health: -0.33, stability: -0.17 },
    response: { label: "Fund emergency continuity", costAP: 1, costCash: 13, dem: { poverty: 7, working: 5, middle: 3, business: 1, elite: 1 }, kpi: { health: 1.5 } },
  },
  {
    id: "school_dropout_spike",
    title: "Dropout Spike Alert",
    body: "Attendance has fallen sharply in lower-income catchments after transport disruptions.",
    hint: "Education + transport interventions compound best here.",
    domain: "education",
    color: "#f1bc63",
    days: 15,
    perDayDem: { poverty: -0.8, working: -1.0, middle: -0.6, business: -0.2, elite: -0.1 },
    perDayKpi: { education: -0.3, economy: -0.15, stability: -0.12 },
    response: { label: "Launch retention drive", costAP: 1, costCash: 11, dem: { poverty: 4, working: 7, middle: 5, business: 2, elite: 1 }, kpi: { education: 1.3 } },
  },
  {
    id: "food_price_shock",
    title: "Food Price Shock",
    body: "Staple prices jumped after logistics disruption; household pressure is spreading fast.",
    hint: "Welfare and transit reliability reduce pressure fastest.",
    domain: "welfare",
    color: "#c48948",
    days: 12,
    perDayDem: { poverty: -1.2, working: -1.0, middle: -0.5, business: -0.2, elite: 0 },
    perDayKpi: { stability: -0.22, health: -0.12 },
    response: { label: "Fund affordability buffer", costAP: 1, costCash: 12, dem: { poverty: 8, working: 6, middle: 3, business: 1, elite: 0 }, kpi: { stability: 0.9 } },
  },
  {
    id: "procurement_expose",
    title: "Procurement Exposure",
    body: "Leaked contracts suggest inflated pricing in public works.",
    hint: "Integrity spending and audit action limit long-term trust damage.",
    domain: "integrity",
    color: "#9c6bc7",
    days: 11,
    perDayDem: { poverty: -0.8, working: -0.7, middle: -0.7, business: -0.4, elite: -0.3 },
    perDayKpi: { integrity: -0.38, stability: -0.16 },
    response: { label: "Open anti-corruption taskforce", costAP: 1, costCash: 9, dem: { poverty: 5, working: 5, middle: 6, business: 2, elite: 2 }, kpi: { integrity: 1.6 } },
  },
  {
    id: "industrial_smoke",
    title: "Industrial Smoke Episode",
    body: "Air quality warnings expanded to three districts after unplanned industrial release.",
    hint: "Climate mitigation and health response together protect satisfaction broadly.",
    domain: "climate",
    color: "#79b4df",
    days: 10,
    perDayDem: { poverty: -0.7, working: -0.8, middle: -0.7, business: -0.2, elite: -0.3 },
    perDayKpi: { climate: -0.34, health: -0.2, stability: -0.1 },
    response: { label: "Fund clean-air emergency", costAP: 1, costCash: 10, dem: { poverty: 4, working: 5, middle: 5, business: 1, elite: 2 }, kpi: { climate: 1.2, health: 0.6 } },
  },
  {
    id: "power_grid_flicker",
    title: "Grid Flicker Cascade",
    body: "Rolling outages are hitting rail corridors and business strips.",
    hint: "Infrastructure and transport stabilization are key.",
    domain: "transport",
    color: "#8ec9a5",
    days: 13,
    perDayDem: { poverty: -0.3, working: -0.9, middle: -0.8, business: -1.0, elite: -0.4 },
    perDayKpi: { economy: -0.3, safety: -0.1, stability: -0.14 },
    response: { label: "Fund grid stabilization", costAP: 1, costCash: 13, dem: { poverty: 2, working: 6, middle: 6, business: 7, elite: 2 }, kpi: { economy: 1.4 } },
  },
  {
    id: "rent_spike_corridor",
    title: "Rent Spike Corridor",
    body: "Vacancy pressure and speculative pricing are displacing households near transit links.",
    hint: "Welfare stabilization and housing relief initiatives usually calm this quickly.",
    domain: "welfare",
    color: "#cf8e4b",
    days: 14,
    perDayDem: { poverty: -1.5, working: -1.1, middle: -0.4, business: -0.1, elite: 0.1 },
    perDayKpi: { stability: -0.28, health: -0.1 },
    response: { label: "Activate housing shield", costAP: 1, costCash: 15, dem: { poverty: 9, working: 6, middle: 3, business: 0, elite: -1 }, kpi: { stability: 1.0 } },
  },
  {
    id: "youth_violence_cluster",
    title: "Youth Violence Cluster",
    body: "After-school incidents are spreading across transport interchanges and shopping strips.",
    hint: "Safety pacts and education retention responses have strongest outcomes.",
    domain: "security",
    color: "#d96b62",
    days: 11,
    perDayDem: { poverty: -0.6, working: -1.0, middle: -0.9, business: -0.5, elite: -0.3 },
    perDayKpi: { safety: -0.34, stability: -0.16, education: -0.1 },
    response: { label: "Fund youth safety surge", costAP: 1, costCash: 11, dem: { poverty: 3, working: 7, middle: 5, business: 2, elite: 1 }, kpi: { safety: 1.3, education: 0.4 } },
  },
  {
    id: "nursing_shortfall",
    title: "Nursing Workforce Shortfall",
    body: "Regional clinics report staffing gaps that are pushing wait times into crisis territory.",
    hint: "Health continuity funding and training spend reduce long-term rollover risk.",
    domain: "health",
    color: "#e19384",
    days: 13,
    perDayDem: { poverty: -1.1, working: -0.9, middle: -0.5, business: -0.1, elite: -0.2 },
    perDayKpi: { health: -0.32, stability: -0.14 },
    response: { label: "Fund retention package", costAP: 1, costCash: 14, dem: { poverty: 7, working: 6, middle: 3, business: 1, elite: 1 }, kpi: { health: 1.5 } },
  },
  {
    id: "bridge_maintenance_backlog",
    title: "Bridge Maintenance Backlog",
    body: "Deferred maintenance has triggered lane closures and freight bottlenecks.",
    hint: "Transport reliability spending plus treasury discipline mitigates the drag.",
    domain: "transport",
    color: "#86c3a0",
    days: 12,
    perDayDem: { poverty: -0.2, working: -0.8, middle: -0.9, business: -1.0, elite: -0.3 },
    perDayKpi: { economy: -0.34, safety: -0.1, stability: -0.12 },
    response: { label: "Launch repair blitz", costAP: 1, costCash: 13, dem: { poverty: 1, working: 5, middle: 6, business: 7, elite: 2 }, kpi: { economy: 1.5 } },
  },
  {
    id: "wildfire_smoke_belt",
    title: "Wildfire Smoke Belt",
    body: "Smoke drift from nearby fires is causing respiratory alerts and outdoor closures.",
    hint: "Climate and health spending together reduce demographic dissatisfaction fastest.",
    domain: "climate",
    color: "#8cb3df",
    days: 10,
    perDayDem: { poverty: -0.9, working: -0.8, middle: -0.6, business: -0.2, elite: -0.2 },
    perDayKpi: { climate: -0.32, health: -0.2, stability: -0.1 },
    response: { label: "Fund smoke resilience", costAP: 1, costCash: 10, dem: { poverty: 5, working: 5, middle: 4, business: 1, elite: 1 }, kpi: { climate: 1.3, health: 0.7 } },
  },
  {
    id: "donation_scandal",
    title: "Donation Influence Scandal",
    body: "A donor-lobby leak suggests policy access was sold through shell entities.",
    hint: "Integrity enforcement and audit capacity are the clearest correction path.",
    domain: "integrity",
    color: "#a378cc",
    days: 12,
    perDayDem: { poverty: -0.9, working: -0.8, middle: -0.8, business: -0.4, elite: -0.3 },
    perDayKpi: { integrity: -0.4, stability: -0.18 },
    response: { label: "Create special inquiry", costAP: 1, costCash: 10, dem: { poverty: 6, working: 5, middle: 6, business: 2, elite: 2 }, kpi: { integrity: 1.7 } },
  },
  {
    id: "drought_supply_stress",
    title: "Drought Supply Stress",
    body: "Water pressure reductions are affecting outer suburbs and small enterprises.",
    hint: "Climate adaptation and infrastructure reinforcement prevent repeat shocks.",
    domain: "climate",
    color: "#54a2da",
    days: 15,
    perDayDem: { poverty: -0.7, working: -0.9, middle: -0.7, business: -0.8, elite: -0.2 },
    perDayKpi: { climate: -0.3, economy: -0.16, stability: -0.12 },
    response: { label: "Fund drought resilience", costAP: 1, costCash: 14, dem: { poverty: 4, working: 6, middle: 5, business: 4, elite: 1 }, kpi: { climate: 1.4 } },
  },
  {
    id: "teacher_attrition_wave",
    title: "Teacher Attrition Wave",
    body: "Staff exits are forcing rotating closures in public schools.",
    hint: "Education investment and workforce support reverse this trend.",
    domain: "education",
    color: "#e9bb62",
    days: 13,
    perDayDem: { poverty: -0.7, working: -1.0, middle: -0.9, business: -0.2, elite: -0.1 },
    perDayKpi: { education: -0.34, stability: -0.14, economy: -0.08 },
    response: { label: "Fund teacher retention", costAP: 1, costCash: 12, dem: { poverty: 3, working: 7, middle: 6, business: 1, elite: 1 }, kpi: { education: 1.5 } },
  },
  {
    id: "port_logistics_jam",
    title: "Port Logistics Jam",
    body: "Container backlog is spilling into urban freight routes and retail shelves.",
    hint: "Transport throughput investment and crisis coordination reduce fallout.",
    domain: "transport",
    color: "#7dc1a1",
    days: 11,
    perDayDem: { poverty: -0.3, working: -0.8, middle: -0.7, business: -1.1, elite: -0.4 },
    perDayKpi: { economy: -0.36, stability: -0.11 },
    response: { label: "Fund freight clearing taskforce", costAP: 1, costCash: 13, dem: { poverty: 1, working: 4, middle: 5, business: 8, elite: 3 }, kpi: { economy: 1.6 } },
  },
  {
    id: "heatwave_blackout_strip",
    title: "Heatwave Blackout Strip",
    body: "A heatwave has knocked out local transformers in dense low-income blocks.",
    hint: "Climate adaptation plus emergency health coverage is the safest response.",
    domain: "climate",
    color: "#5ea8df",
    days: 9,
    perDayDem: { poverty: -1.3, working: -0.9, middle: -0.4, business: -0.2, elite: -0.1 },
    perDayKpi: { climate: -0.28, health: -0.24, stability: -0.18 },
    response: { label: "Deploy heat resilience package", costAP: 1, costCash: 12, dem: { poverty: 8, working: 5, middle: 2, business: 1, elite: 0 }, kpi: { climate: 1.2, health: 0.9 } },
  },
  {
    id: "public_trust_slide",
    title: "Public Trust Slide",
    body: "Cross-district polling shows confidence in government transparency is collapsing.",
    hint: "Integrity enforcement and visible anti-waste action are most effective.",
    domain: "integrity",
    color: "#9e6dcb",
    days: 12,
    perDayDem: { poverty: -0.7, working: -0.7, middle: -0.8, business: -0.4, elite: -0.3 },
    perDayKpi: { integrity: -0.35, stability: -0.22 },
    response: { label: "Launch transparency drive", costAP: 1, costCash: 9, dem: { poverty: 4, working: 4, middle: 6, business: 2, elite: 2 }, kpi: { integrity: 1.4, stability: 0.5 } },
  },
  {
    id: "urban_homelessness_spike",
    title: "Urban Homelessness Spike",
    body: "Rough-sleeping numbers are rising around stations and civic precincts.",
    hint: "Welfare support and health outreach improve all-group confidence over time.",
    domain: "welfare",
    color: "#c08647",
    days: 14,
    perDayDem: { poverty: -1.4, working: -0.9, middle: -0.5, business: -0.3, elite: -0.2 },
    perDayKpi: { health: -0.16, stability: -0.24 },
    response: { label: "Fund housing-first response", costAP: 1, costCash: 15, dem: { poverty: 9, working: 5, middle: 3, business: 1, elite: 0 }, kpi: { stability: 1.1, health: 0.6 } },
  },
  {
    id: "cyber_hospital_ransom",
    title: "Hospital Cyber Ransom Event",
    body: "Clinical systems are partially encrypted, delaying diagnostics and surgeries.",
    hint: "Health continuity and integrity-backed cyber response are both required.",
    domain: "health",
    color: "#da8578",
    days: 10,
    perDayDem: { poverty: -1.0, working: -0.8, middle: -0.6, business: -0.2, elite: -0.2 },
    perDayKpi: { health: -0.36, integrity: -0.12, stability: -0.13 },
    response: { label: "Fund cyber recovery taskforce", costAP: 1, costCash: 13, dem: { poverty: 6, working: 5, middle: 4, business: 2, elite: 1 }, kpi: { health: 1.4, integrity: 0.6 } },
  },
];

const MONTHLY_MEDIA = {
  right: {
    label: "Right Wing Media",
    sources: ["Patriot Pulse", "Market Torch", "The Iron Ledger", "Nation Frontline"],
    praise: [
      "Government finally stopped hugging spreadsheets and delivered growth.",
      "At last, a month where builders and employers were not treated like villains.",
      "Productive sectors kept the lights on while critics panicked.",
      "Hard calls paid off; the city moved from slogans to output.",
    ],
    attack: [
      "Another month of soft management while real risk climbs.",
      "Costly programs everywhere, accountability nowhere.",
      "This administration spends like tomorrow is optional.",
      "Symbolic gestures continue while everyday pressure worsens.",
    ],
  },
  left: {
    label: "Left Wing Media",
    sources: ["People First Review", "Common Ground Weekly", "Union Wire", "The Social Ledger"],
    praise: [
      "Public investment translated into real relief for ordinary households.",
      "Policy finally sounded like people mattered, not just quarterly charts.",
      "Community resilience improved where spending met lived reality.",
      "Integrity plus services delivered the month’s most credible gains.",
    ],
    attack: [
      "The month exposed familiar priorities: optics up, equity down.",
      "Household stress rose where support should have arrived first.",
      "Too much deference to elite pressure, not enough social ballast.",
      "Austerity by stealth is still austerity.",
    ],
  },
  center: {
    label: "Centre Media",
    sources: ["Capital Ledger", "Civic Standard", "Metro Bulletin", "Policy Desk"],
    praise: [
      "Balanced execution this month with measurable cross-sector improvement.",
      "Government mixed restraint with targeted intervention effectively.",
      "Core services held while fiscal risk remained manageable.",
      "Outcomes improved in priority domains without dramatic trade shock.",
    ],
    attack: [
      "Execution was uneven, with material gaps in delivery.",
      "Key indicators moved in opposing directions, signaling policy strain.",
      "Stability held, but underlying stress points remain unresolved.",
      "Promises outpaced implementation in several core systems.",
    ],
  },
  independent: {
    label: "Independent Media",
    sources: ["Signal Independent", "Open Civic", "The Public Mirror", "Ledger Zero"],
    praise: [
      "Data and street-level reports both point to broad-based gains.",
      "Where policies were coherent, citizens across groups reported relief.",
      "Integrity improvements reduced leakages and improved trust signals.",
      "Climate and welfare investments produced unusually shared benefits.",
    ],
    attack: [
      "Evidence shows concentrated benefit with broad hidden costs.",
      "System stress rose in low-income districts despite headline claims.",
      "Corruption risk and service drag grew beneath glossy messaging.",
      "Independent audits suggest short-term wins are masking structural loss.",
    ],
  },
};

const MONTHLY_CHARACTERS = {
  advisors: [
    { name: "Dr. Nia Vale", dept: "Health Ministry", line: "Ward pressure eased where prevention funding stayed predictable." },
    { name: "Prof. Ivo Mercer", dept: "Education Bureau", line: "School continuity improved, but teacher retention still needs attention." },
    { name: "Cmdr. Elara Singh", dept: "Security Department", line: "Response times improved when hotspot intelligence was funded." },
    { name: "Mara Quill", dept: "Climate Office", line: "Adaptation spending reduced disruption, especially in lower districts." },
    { name: "Rafi Dunne", dept: "Treasury", line: "Short-term balance is useful only if long-term liabilities stay contained." },
    { name: "Lena Shore", dept: "Welfare Agency", line: "Household stability rose where support reached families before arrears did." },
    { name: "Oren Pike", dept: "Transport Office", line: "Throughput recovered after reliability work finally got funded." },
    { name: "Kian Holt", dept: "Integrity Commission", line: "Leakage risk declined once procurement scrutiny was not undercut." },
  ],
  opposition: [
    { name: "Alex Crowe", party: "Civic Opposition", jab: "The government celebrates averages while neighborhoods carry the downside." },
    { name: "Sen. Petra Knox", party: "National Opposition", jab: "A good headline won’t rescue a weak systems plan." },
    { name: "Milo Arden", party: "Reform Bloc", jab: "If this is strategy, it is strategy by improvisation." },
    { name: "Darya Finch", party: "People's Opposition", jab: "The month proves who gets heard first and who waits last." },
    { name: "Tom Vance", party: "Liberty Coalition", jab: "Policy looked busy, but delivery looked confused." },
    { name: "Ines Calder", party: "Green Opposition", jab: "Ignoring climate drag is just borrowing pain from next month." },
  ],
};

const state = {
  day: 0,
  year: 2026,
  paused: false,
  tierIndex: 0,
  selectedBuildingId: null,
  buildings: BUILDING_DEFS.map((b) => ({ ...b, homeTile: [...b.tile], tile: null, placed: false, level: 1, budget: 60, state: "unbuilt" })),
  kpi: { stability: 70, health: 70, education: 70, safety: 70, climate: 66, integrity: 64, economy: 70 },
  budget: { revenue: 100, expenditure: 103, deficit: -3, debt: 72, treasury: 48 },
  history: {},
  tickerItems: ["Welcome to Cozy Civic. Watch your city, then act."],
  railEvents: [],
  assets: {
    loaded: false,
    tiles: {},
    buildings: {},
    actors: {},
    fx: {},
  },
  delayed: [],
  incidents: [],
  rapid: { active: null, momentum: 0, nextAtDay: 20 },
  resources: { actionPoints: 3, maxActionPoints: 4, streak: 0, bestStreak: 0 },
  onboarding: {
    selectedBuilding: false,
    budgetApplied: false,
    upgradedOrDispatched: false,
    rapidResolved: false,
    rewarded: false,
  },
  session: { goalId: "resolve", progress: 0, daysLeft: 10, metrics: { actions: 0, resolves: 0, stabilityDays: 0 } },
  combo: { recentActions: [] },
  buildQueue: [],
  monthly: {
    advisorLines: [],
    lastSummaryDay: 0,
    modalOpen: false,
    report: null,
    pools: {},
    stats: {
      incidentsSpawned: 0,
      resolvedDirect: 0,
      resolvedAuto: 0,
      rapidDirect: 0,
      rapidAuto: 0,
      majorSpawned: 0,
      majorResolved: 0,
      majorMissed: 0,
    },
  },
  majorEvents: [],
  major: {
    nextAtDay: 14,
    recentIds: [],
  },
  people: DEMOGRAPHICS.map((d) => ({ id: d.id, label: d.label, happiness: 65, trend: 0, note: "Watching policy signals." })),
  gameOver: { active: false, reason: "", facts: [] },
  districts: [
    { id: "NW", label: "Northwest", stress: 0 },
    { id: "NE", label: "Northeast", stress: 0 },
    { id: "SW", label: "Southwest", stress: 0 },
    { id: "SE", label: "Southeast", stress: 0 },
  ],
  visual: {
    hour: 7,
    vehicles: [],
    civilians: [],
    responders: [],
    decorProps: [],
    clouds: [
      { x: 120, y: 90, speed: 16, size: 62 },
      { x: 520, y: 130, speed: 11, size: 78 },
      { x: 940, y: 72, speed: 14, size: 58 },
    ],
    lastFrameTs: performance.now(),
  },
  camera: { x: 0, y: -80, zoom: 1, dragging: false, lastX: 0, lastY: 0, vx: 0, vy: 0, targetX: null, targetY: null, viewW: 1280, viewH: 760 },
  ui: {
    focusMode: false,
    hoveredBuildingId: null,
    hoverTile: null,
    placementBuildingId: null,
    ripples: [],
    apToasts: [],
    pausedByModal: false,
    placementRecommendations: [],
    budgetDraftByBuilding: {},
    focusedMajorEventId: null,
  },
};

const canvas = document.getElementById("isoCanvas");
const ctx = canvas.getContext("2d");

const els = {
  tierLabel: document.getElementById("tierLabel"),
  dayLabel: document.getElementById("dayLabel"),
  stabilityLabel: document.getElementById("stabilityLabel"),
  treasuryLabel: document.getElementById("treasuryLabel"),
  actionPoints: document.getElementById("actionPoints"),
  streakLabel: document.getElementById("streakLabel"),
  civilianCount: document.getElementById("civilianCount"),
  incidentCount: document.getElementById("incidentCount"),
  focusBtn: document.getElementById("focusBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  trafficPill: document.getElementById("trafficPill"),
  trafficLight: document.getElementById("trafficLight"),
  statusBanner: document.getElementById("statusBanner"),
  selectedName: document.getElementById("selectedName"),
  selectedDesc: document.getElementById("selectedDesc"),
  selectedLevel: document.getElementById("selectedLevel"),
  selectedBudget: document.getElementById("selectedBudget"),
  selectedStatus: document.getElementById("selectedStatus"),
  selectedCost: document.getElementById("selectedCost"),
  budgetSlider: document.getElementById("budgetSlider"),
  applyBudgetBtn: document.getElementById("applyBudgetBtn"),
  upgradeBtn: document.getElementById("upgradeBtn"),
  rapidTitle: document.getElementById("rapidTitle"),
  rapidBody: document.getElementById("rapidBody"),
  rapidTimer: document.getElementById("rapidTimer"),
  rapidMomentum: document.getElementById("rapidMomentum"),
  rapidBtnA: document.getElementById("rapidBtnA"),
  rapidBtnB: document.getElementById("rapidBtnB"),
  rapidCard: document.querySelector(".rapid-card"),
  kpiGrid: document.getElementById("kpiGrid"),
  tierGoal: document.getElementById("tierGoal"),
  missionList: document.getElementById("missionList"),
  sessionGoal: document.getElementById("sessionGoal"),
  onboardingList: document.getElementById("onboardingList"),
  buildQueue: document.getElementById("buildQueue"),
  advisorBrief: document.getElementById("advisorBrief"),
  apFeedback: document.getElementById("apFeedback"),
  tabControlAlert: document.getElementById("tabControlAlert"),
  tabIncidentsAlert: document.getElementById("tabIncidentsAlert"),
  tabPulseAlert: document.getElementById("tabPulseAlert"),
  tabPeopleAlert: document.getElementById("tabPeopleAlert"),
  tabMissionsAlert: document.getElementById("tabMissionsAlert"),
  peopleGrid: document.getElementById("peopleGrid"),
  initiativeGrid: document.getElementById("initiativeGrid"),
  monthlyModal: document.getElementById("monthlyModal"),
  monthlyHeadline: document.getElementById("monthlyHeadline"),
  monthlySubhead: document.getElementById("monthlySubhead"),
  monthlyLead: document.getElementById("monthlyLead"),
  monthlySummaryList: document.getElementById("monthlySummaryList"),
  monthlyQuotes: document.getElementById("monthlyQuotes"),
  monthlyCloseBtn: document.getElementById("monthlyCloseBtn"),
  gameOverModal: document.getElementById("gameOverModal"),
  gameOverHeadline: document.getElementById("gameOverHeadline"),
  gameOverReason: document.getElementById("gameOverReason"),
  gameOverFacts: document.getElementById("gameOverFacts"),
  gameOverRestartBtn: document.getElementById("gameOverRestartBtn"),
  incidentInbox: document.getElementById("incidentInbox"),
  tickerLine: document.getElementById("tickerLine"),
  eventRail: document.getElementById("eventRail"),
  majorEventCard: document.getElementById("majorEventCard"),
  majorEventTitle: document.getElementById("majorEventTitle"),
  majorEventBody: document.getElementById("majorEventBody"),
  majorEventHint: document.getElementById("majorEventHint"),
  majorEventTimer: document.getElementById("majorEventTimer"),
  majorEventImpact: document.getElementById("majorEventImpact"),
  majorEventRespondBtn: document.getElementById("majorEventRespondBtn"),
  majorEventDismissBtn: document.getElementById("majorEventDismissBtn"),
};

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function round(v) { return Math.round(v * 100) / 100; }
function rand(min, max) { return min + Math.random() * (max - min); }
function tileDist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
function formatMoneyMillions(v) { return `$${Math.round(v)}m`; }
function setText(el, value) { if (el) el.textContent = value; }
function setTabAlert(el, active = false, critical = false) {
  if (!el) return;
  el.hidden = !active;
  el.classList.toggle("critical", critical);
}
function buildingTile(b) {
  return b?.tile || b?.homeTile || [12, 12];
}
function isTileBuildable(x, y) {
  if (x < 1 || y < 1 || x > MAP_W - 2 || y > MAP_H - 2) return false;
  if (x === 10 || y === 10) return false;
  return !state.buildings.some((b) => b.placed && b.tile && b.tile[0] === x && b.tile[1] === y);
}
function screenToTile(sx, sy) {
  const centerX = state.camera.viewW / 2 + state.camera.x;
  const centerY = state.camera.viewH / 2 + state.camera.y;
  const halfW = (TILE_W / 2) * state.camera.zoom;
  const halfH = (TILE_H / 2) * state.camera.zoom;
  const dx = (sx - centerX) / halfW;
  const dy = (sy - centerY) / halfH;
  const ix = Math.round((dx + dy) / 2);
  const iy = Math.round((dy - dx) / 2);
  return [clamp(ix, 0, MAP_W - 1), clamp(iy, 0, MAP_H - 1)];
}
function pulseActionPill() {
  if (!els.actionPoints) return;
  const pill = els.actionPoints.closest(".pill");
  if (!pill) return;
  pill.classList.remove("flash");
  // force restart
  // eslint-disable-next-line no-unused-expressions
  pill.offsetWidth;
  pill.classList.add("flash");
}
function addApToast(text, kind = "") {
  state.ui.apToasts.unshift({ id: `ap_${Date.now()}_${Math.random()}`, text, kind, ttl: 1.8 });
  state.ui.apToasts = state.ui.apToasts.slice(0, 4);
}

const BUILDING_STATE_META = {
  thriving: { label: "Strong ✅", icon: "🌟" },
  stable: { label: "Balanced 🟢", icon: "🟢" },
  strained: { label: "Needs Support 🟠", icon: "🟠" },
  overloaded: { label: "At Risk 🔴", icon: "🔴" },
  unbuilt: { label: "Not Built ⚪", icon: "⚪" },
};

function currentGoal() {
  return SESSION_GOALS.find((g) => g.id === state.session.goalId) || SESSION_GOALS[0];
}

function markOnboarding(step) {
  if (!Object.hasOwn(state.onboarding, step)) return;
  state.onboarding[step] = true;
}

function spendActionPoints(cost, reason) {
  if (state.gameOver.active) return false;
  if (state.resources.actionPoints < cost) {
    addTicker(`Need ${cost} action points for ${reason}.`);
    return false;
  }
  state.resources.actionPoints -= cost;
  state.session.metrics.actions += 1;
  addApToast(`-${cost} AP`, "down");
  pulseActionPill();
  return true;
}

function awardStreak(source) {
  state.resources.streak += 1;
  state.resources.bestStreak = Math.max(state.resources.bestStreak, state.resources.streak);
  if (state.resources.streak % 3 === 0) {
    state.resources.actionPoints = clamp(state.resources.actionPoints + 1, 0, state.resources.maxActionPoints);
    state.budget.treasury += 4;
    addApToast("+1 AP", "up");
    pulseActionPill();
    addTicker(`Streak x${state.resources.streak}! Momentum payout from ${source}.`);
  }
}

function breakStreak(reason) {
  if (state.resources.streak >= 2) addTicker(`Streak broken: ${reason}.`);
  state.resources.streak = 0;
}

function recordAction(category) {
  state.combo.recentActions.push({ day: state.day, category });
  state.combo.recentActions = state.combo.recentActions.filter((a) => state.day - a.day <= 4);
  const uniq = [...new Set(state.combo.recentActions.map((a) => a.category))];
  if (uniq.length < 3) return;

  const has = (x) => uniq.includes(x);
  if (has("climate") && has("transport") && has("education")) {
    state.kpi.economy = clamp(state.kpi.economy + 1.5, 0, 100);
    state.kpi.climate = clamp(state.kpi.climate + 1.3, 0, 100);
    addRailEvent("Combo: Green Growth", "Transport + Climate + Education unlocked a growth bonus.", true);
  } else if (has("integrity") && has("security") && has("treasury")) {
    state.kpi.integrity = clamp(state.kpi.integrity + 1.8, 0, 100);
    state.kpi.stability = clamp(state.kpi.stability + 1.1, 0, 100);
    state.budget.treasury += 8;
    addRailEvent("Combo: Clean Mandate", "Integrity + Security + Treasury stabilized governance.", true);
  } else {
    state.kpi.stability = clamp(state.kpi.stability + 0.7, 0, 100);
    state.budget.treasury += 2;
    addRailEvent("Combo: Policy Synergy", "Cross-department actions generated bonus momentum.", false);
  }
  state.combo.recentActions = [];
}

function rollNewGoal() {
  const g = SESSION_GOALS[Math.floor(Math.random() * SESSION_GOALS.length)];
  state.session.goalId = g.id;
  state.session.progress = 0;
  state.session.daysLeft = g.days;
  state.session.metrics = { actions: 0, resolves: 0, stabilityDays: 0 };
}

function updateGoalDaily() {
  const g = currentGoal();
  state.session.daysLeft -= 1;

  if (g.id === "stability" && state.kpi.stability > 66) {
    state.session.metrics.stabilityDays += 1;
  }

  if (g.id === "actions") state.session.progress = state.session.metrics.actions;
  if (g.id === "resolve") state.session.progress = state.session.metrics.resolves;
  if (g.id === "stability") state.session.progress = state.session.metrics.stabilityDays;

  if (state.session.progress >= g.target) {
    state.resources.actionPoints = clamp(state.resources.actionPoints + g.rewardAP, 0, state.resources.maxActionPoints);
    state.budget.treasury += g.rewardCash;
    if (g.rewardAP > 0) {
      addApToast(`+${g.rewardAP} AP`, "up");
      pulseActionPill();
    }
    addTicker(`Goal complete: ${g.label}. Rewards granted.`);
    addRailEvent("Goal Complete", `${g.label}`, true);
    rollNewGoal();
    return;
  }

  if (state.session.daysLeft <= 0) {
    addTicker(`Goal failed: ${g.label}.`);
    rollNewGoal();
  }
}

function districtForTile(tile) {
  const [x, y] = tile;
  if (x < MAP_W / 2 && y < MAP_H / 2) return "NW";
  if (x >= MAP_W / 2 && y < MAP_H / 2) return "NE";
  if (x < MAP_W / 2 && y >= MAP_H / 2) return "SW";
  return "SE";
}

function maybeRewardOnboardingComplete() {
  if (state.onboarding.rewarded) return;
  const done = state.onboarding.selectedBuilding && state.onboarding.budgetApplied && state.onboarding.upgradedOrDispatched && state.onboarding.rapidResolved;
  if (!done) return;
  state.onboarding.rewarded = true;
  state.resources.actionPoints = clamp(state.resources.actionPoints + 2, 0, state.resources.maxActionPoints);
  state.budget.treasury += 12;
  addApToast("+2 AP", "up");
  pulseActionPill();
  addTicker("Onboarding complete! Bonus action points and treasury granted.");
  addRailEvent("Starter Bonus", "You completed the first-session tutorial flow.", true);
}

function loadSvgImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadAssetPack() {
  const manifestRes = await fetch(`${ASSET_BASE}/manifest.json`);
  if (!manifestRes.ok) throw new Error("asset manifest fetch failed");
  const manifest = await manifestRes.json();

  const tasks = manifest.files
    .filter((f) => f.endsWith(".svg"))
    .map(async (rel) => {
      const img = await loadSvgImage(`${ASSET_BASE}/${rel}`);
      if (rel.startsWith("tiles/")) state.assets.tiles[rel.replace("tiles/", "").replace(".svg", "")] = img;
      if (rel.startsWith("buildings/")) state.assets.buildings[rel.replace("buildings/", "").replace(".svg", "")] = img;
      if (rel.startsWith("actors/")) state.assets.actors[rel.replace("actors/", "").replace(".svg", "")] = img;
      if (rel.startsWith("fx/")) state.assets.fx[rel.replace("fx/", "").replace(".svg", "")] = img;
    });

  await Promise.all(tasks);
  state.assets.loaded = true;
}

function drawSpriteCentered(img, x, y, w, h) {
  if (!img) return;
  ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
}

function isoToScreen(ix, iy) {
  const centerX = state.camera.viewW / 2 + state.camera.x;
  const centerY = state.camera.viewH / 2 + state.camera.y;
  return {
    x: (ix - iy) * (TILE_W / 2) * state.camera.zoom + centerX,
    y: (ix + iy) * (TILE_H / 2) * state.camera.zoom + centerY,
  };
}

function pointInDiamond(px, py, cx, cy, w, h) {
  const dx = Math.abs(px - cx);
  const dy = Math.abs(py - cy);
  return dx / (w / 2) + dy / (h / 2) <= 1;
}

function moveToward(agent, target, dt, speed) {
  const dx = target[0] - agent.x;
  const dy = target[1] - agent.y;
  const d = Math.hypot(dx, dy);
  if (d < 0.001) return;
  const step = Math.min(d, speed * dt);
  agent.x += (dx / d) * step;
  agent.y += (dy / d) * step;
}

function addTicker(text) {
  state.tickerItems.unshift(`Day ${state.day}: ${text}`);
  state.tickerItems = state.tickerItems.slice(0, 14);
}

function addRailEvent(title, meta, hot = false) {
  state.railEvents.unshift({ day: state.day, title, meta, hot });
  state.railEvents = state.railEvents.slice(0, 18);
}

function scheduleDelayed(days, label, fn) {
  state.delayed.push({ at: state.day + days, label, fn });
}

function maybePromoteTier() {
  const tier = TIER_CONFIG[state.tierIndex];
  const done = tier.checks.filter((c) => c.pass(state)).length;
  if (done === tier.checks.length && state.tierIndex < TIER_CONFIG.length - 1) {
    state.tierIndex += 1;
    state.budget.treasury += 20;
    addTicker(`Promotion unlocked: ${TIER_CONFIG[state.tierIndex].name} governance.`);
    addRailEvent("Tier Promotion", `You advanced to ${TIER_CONFIG[state.tierIndex].name}.`, true);
  }
}

function recalcBuildingStates() {
  for (const b of state.buildings) {
    if (!b.placed) {
      b.state = "unbuilt";
      continue;
    }
    const signal = state.kpi[b.kpi] + (b.level - 1) * 1.8 + (b.budget - 60) * 0.12;
    if (signal < 58) b.state = "overloaded";
    else if (signal < 68) b.state = "strained";
    else if (signal > 78) b.state = "thriving";
    else b.state = "stable";
  }
}

function findBuilding(id) {
  return state.buildings.find((b) => b.id === id);
}

function allBuildingsPlaced() {
  return state.buildings.every((b) => b.placed);
}

function placementEvaluation(buildingId, tile) {
  const b = findBuilding(buildingId);
  if (!b) return { score: -3, label: "Poor", reason: "Unknown department." };
  const [x, y] = tile;
  let score = 0;

  const distToRoad = Math.min(Math.abs(x - 10), Math.abs(y - 10));
  if (distToRoad <= 2) {
    if (["transport", "education", "health", "welfare"].includes(b.id)) score += 1.5;
    else score += 0.6;
  } else if (["transport", "education", "health"].includes(b.id)) score -= 0.5;

  const nearest = (id) => {
    const t = buildingTile(findBuilding(id));
    if (!findBuilding(id)?.placed) return 999;
    return tileDist(tile, t);
  };
  if (b.id === "health" || b.id === "welfare") {
    const d = b.id === "health" ? nearest("welfare") : nearest("health");
    if (d <= 4) score += 2.2;
  }
  if (b.id === "education") {
    const d = nearest("transport");
    if (d <= 4) score += 1.8;
  }
  if (b.id === "treasury" || b.id === "integrity") {
    const d = b.id === "treasury" ? nearest("integrity") : nearest("treasury");
    if (d <= 5) score += 1.8;
  }
  if (b.id === "climate") {
    const d = nearest("transport");
    if (d <= 3) score -= 1.6;
    if (d >= 5 && d < 999) score += 1.0;
  }

  const crowded = state.buildings
    .filter((o) => o.placed && o.tile)
    .map((o) => tileDist(tile, o.tile))
    .filter((d) => d < 2.2).length;
  score -= crowded * 0.9;

  const s = round(clamp(score, -3, 4));
  const label = s >= 2 ? "Strong" : s >= 0.5 ? "Solid" : s > -1 ? "Okay" : "Poor";
  const reason = `Road access ${distToRoad <= 2 ? "good" : "limited"} · crowding ${crowded === 0 ? "low" : "high"}.`;
  return { score: s, label, reason };
}

function computePlacementRecommendations(buildingId) {
  if (!buildingId) return [];
  const options = [];
  for (let x = 1; x < MAP_W - 1; x += 1) {
    for (let y = 1; y < MAP_H - 1; y += 1) {
      if (!isTileBuildable(x, y)) continue;
      const evaln = placementEvaluation(buildingId, [x, y]);
      options.push({ tile: [x, y], ...evaln });
    }
  }
  options.sort((a, b) => b.score - a.score);
  return options.slice(0, 3);
}

function placeBuilding(buildingId, tile) {
  const b = findBuilding(buildingId);
  if (!b) return false;
  const [x, y] = tile;
  if (!isTileBuildable(x, y)) return false;
  const evaln = placementEvaluation(buildingId, tile);
  b.tile = [x, y];
  b.placed = true;
  b.state = "stable";
  b.siteScore = evaln.score;
  state.kpi[b.kpi] = clamp(state.kpi[b.kpi] + evaln.score * 0.45, 0, 100);
  addTicker(`Placed ${b.name} at tile ${x},${y} (${evaln.label} site).`);
  addRailEvent("🧱 Department Placed", `${b.name} opened at tile ${x},${y}. Site quality: ${evaln.label}.`, false);
  state.ui.placementBuildingId = state.buildings.find((d) => !d.placed)?.id || null;
  state.ui.placementRecommendations = computePlacementRecommendations(state.ui.placementBuildingId);
  if (allBuildingsPlaced()) {
    addRailEvent("🏙️ Founding Complete", "All core departments are now active.", true);
  }
  return true;
}

function applyDepartmentBudget() {
  const b = findBuilding(state.selectedBuildingId);
  if (!b) return;
  const draft = state.ui.budgetDraftByBuilding[b.id];
  const target = Number.isFinite(draft) ? draft : Number(els.budgetSlider.value);
  const delta = target - b.budget;
  if (Math.abs(delta) < 1) {
    addTicker("No budget change applied.");
    return;
  }
  if (!spendActionPoints(1, "budget adjustment")) return;
  b.budget = round(clamp(b.budget + delta * POLICY_PACE, 20, 120));
  markOnboarding("budgetApplied");
  recordAction(b.id);
  addTicker(`${b.name} budget nudged to ${b.budget} ($m/day).`);
}

function applyBudgetAvailabilityState() {
  const b = findBuilding(state.selectedBuildingId);
  if (!b) {
    els.applyBudgetBtn.disabled = true;
    els.applyBudgetBtn.title = "Select a department first.";
    return;
  }
  const draft = state.ui.budgetDraftByBuilding[b.id];
  const target = Number.isFinite(draft) ? draft : Number(els.budgetSlider.value);
  const delta = target - b.budget;
  if (Math.abs(delta) < 1) {
    els.applyBudgetBtn.disabled = true;
    els.applyBudgetBtn.title = "No change to apply.";
    return;
  }
  if (state.resources.actionPoints < 1) {
    els.applyBudgetBtn.disabled = true;
    els.applyBudgetBtn.title = "Need 1 Action Point.";
    return;
  }
  els.applyBudgetBtn.disabled = false;
  els.applyBudgetBtn.title = "Spend 1 Action Point to apply this budget change.";
}

function applyUpgradeAvailabilityState() {
  const b = findBuilding(state.selectedBuildingId);
  if (!b) {
    els.upgradeBtn.disabled = true;
    els.upgradeBtn.title = "Select a department first.";
    return;
  }
  const cost = 12 + b.level * 8;
  if (b.level >= 10) {
    els.upgradeBtn.disabled = true;
    els.upgradeBtn.title = "This building is already at max level.";
    return;
  }
  if (state.resources.actionPoints < 2) {
    els.upgradeBtn.disabled = true;
    els.upgradeBtn.title = "Need 2 Action Points.";
    return;
  }
  if (state.budget.treasury < cost) {
    els.upgradeBtn.disabled = true;
    els.upgradeBtn.title = `Need ${formatMoneyMillions(cost)} in treasury.`;
    return;
  }
  els.upgradeBtn.disabled = false;
  els.upgradeBtn.title = `Spend 2 Action Points and ${formatMoneyMillions(cost)} to upgrade.`;
}

function upgradeSelected() {
  const b = findBuilding(state.selectedBuildingId);
  if (!b) return;
  if (b.level >= 10) {
    addTicker(`${b.name} is already at max level.`);
    return;
  }
  const cost = 12 + b.level * 8;
  if (!spendActionPoints(2, "building upgrade")) return;
  if (state.budget.treasury < cost) {
    addTicker(`Not enough treasury for upgrade (${formatMoneyMillions(cost)} required).`);
    state.resources.actionPoints = clamp(state.resources.actionPoints + 2, 0, state.resources.maxActionPoints);
    return;
  }
  state.budget.treasury -= cost;
  b.level += 1;
  state.buildQueue.push({
    id: `build_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    name: `${b.name} Level ${b.level}`,
    completeDay: state.day + 5,
    cost,
  });
  markOnboarding("upgradedOrDispatched");
  recordAction(b.id);
  addTicker(`${b.name} upgraded to level ${b.level}.`);
  addRailEvent("Upgrade Complete", `${b.name} construction started.`, false);
  scheduleDelayed(5, `${b.name} expansion came online and boosted outcomes.`, () => {
    state.kpi[b.kpi] = clamp(state.kpi[b.kpi] + 1.7 + b.level * 0.22, 0, 100);
  });
}

function triggerRapidDecision() {
  if (state.rapid.active) return;
  if (state.day < state.rapid.nextAtDay) return;
  const pick = RAPID_DECISIONS[Math.floor(Math.random() * RAPID_DECISIONS.length)];
  const idNum = Math.floor(state.day / RAPID_INTERVAL_DAYS) + 1;
  const incidentCode = `INCIDENT-${String(idNum).padStart(3, "0")}`;
  let focus = findBuilding("treasury");
  if (pick.title.includes("Bridge")) focus = findBuilding("transport");
  if (pick.title.includes("Hospital")) focus = findBuilding("health");
  if (pick.title.includes("Corruption")) focus = findBuilding("integrity");
  if (pick.title.includes("Heat")) focus = findBuilding("climate");
  state.rapid.active = {
    ...pick,
    incidentCode,
    focusBuildingId: focus?.id || "treasury",
    mapMarkerTile: focus ? buildingTile(focus) : [12, 12],
    expiresDay: state.day + RAPID_WINDOW_DAYS,
  };
  state.rapid.nextAtDay = state.day + RAPID_INTERVAL_DAYS;
  addTicker(`${incidentCode}: ${pick.title}`);
  addRailEvent(`🚨 ${incidentCode}`, pick.title, true);
}

function resolveRapid(choice, timedOut = false) {
  const active = state.rapid.active;
  if (!active) return;
  if (choice === "a") active.applyA(state);
  else active.applyB(state);

  if (!timedOut) {
    state.rapid.momentum = clamp(state.rapid.momentum + 1, 0, 12);
    awardStreak("rapid decision");
    markOnboarding("rapidResolved");
    recordAction(choice === "a" ? "integrity" : "security");
    state.monthly.stats.rapidDirect += 1;
  } else {
    state.rapid.momentum = clamp(state.rapid.momentum - 1, 0, 12);
    breakStreak("timed out rapid brief");
    state.monthly.stats.rapidAuto += 1;
  }

  const label = timedOut ? "🤖 Auto decision applied due to timeout." : "✅ Player rapid decision resolved.";
  addTicker(`${active.incidentCode}: ${active.title} - ${label}`);
  addRailEvent(timedOut ? "🤖 Rapid Auto-Resolved" : "✅ Rapid Player-Resolved", `${active.incidentCode}: ${active.title}`, timedOut);
  state.rapid.active = null;
}

function majorEventAnchorBuildingId(domain) {
  if (domain === "climate") return "climate";
  if (domain === "security") return "security";
  if (domain === "health") return "health";
  if (domain === "education") return "education";
  if (domain === "welfare") return "welfare";
  if (domain === "integrity") return "integrity";
  if (domain === "transport") return "transport";
  return "treasury";
}

function applyDemographicShiftMap(map, scale = 1) {
  if (!map) return;
  for (const p of state.people) {
    const delta = (map[p.id] || 0) * scale;
    if (!delta) continue;
    p.happiness = clamp(p.happiness + delta, 0, 100);
  }
}

function applyKpiShiftMap(map, scale = 1) {
  if (!map) return;
  for (const [k, v] of Object.entries(map)) {
    if (!Object.hasOwn(state.kpi, k)) continue;
    state.kpi[k] = clamp(state.kpi[k] + v * scale, 0, 100);
  }
}

function majorImpactLabel(ev) {
  const entries = Object.entries(ev.perDayDem || {}).sort((a, b) => a[1] - b[1]);
  const worst = entries.filter((x) => x[1] < 0).slice(0, 2).map(([id, v]) => {
    const label = state.people.find((p) => p.id === id)?.label || id;
    return `${label.split(" ")[0]} ${v.toFixed(1)}/day`;
  });
  return worst.length ? worst.join(" · ") : "Systemwide pressure";
}

function pickMajorEventTemplate() {
  const used = new Set(state.majorEvents.map((e) => e.templateId));
  const recents = new Set(state.major.recentIds);
  let candidates = MAJOR_EVENT_LIBRARY.filter((e) => !used.has(e.id) && !recents.has(e.id));
  if (candidates.length === 0) candidates = MAJOR_EVENT_LIBRARY.filter((e) => !used.has(e.id));
  if (candidates.length === 0) candidates = MAJOR_EVENT_LIBRARY;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function spawnMajorEvent() {
  const tpl = pickMajorEventTemplate();
  if (!tpl) return;
  const anchorId = majorEventAnchorBuildingId(tpl.domain);
  const anchor = findBuilding(anchorId) || findBuilding("treasury");
  const tile = [
    clamp((buildingTile(anchor)[0] || 12) + rand(-1.4, 1.4), 1, MAP_W - 2),
    clamp((buildingTile(anchor)[1] || 12) + rand(-1.4, 1.4), 1, MAP_H - 2),
  ];
  const id = `major_${state.day}_${Math.floor(Math.random() * 10000)}`;
  const ev = {
    id,
    templateId: tpl.id,
    ...tpl,
    anchorBuildingId: anchorId,
    tile,
    startedDay: state.day,
    expiresDay: state.day + tpl.days,
    snoozeUntilDay: -1,
  };
  state.majorEvents.push(ev);
  state.major.recentIds.push(tpl.id);
  state.major.recentIds = state.major.recentIds.slice(-8);
  state.ui.focusedMajorEventId = ev.id;
  state.monthly.stats.majorSpawned += 1;
  addTicker(`MAJOR INCIDENT: ${tpl.title}. Demographic pressure rising now.`);
  addRailEvent("🚨 Major Event", `${tpl.title} · ${majorImpactLabel(ev)}`, true);
}

function maybeSpawnMajorEvent() {
  if (state.majorEvents.length >= MAX_ACTIVE_MAJOR_EVENTS) return;
  if (state.day < state.major.nextAtDay) return;
  const stress = clamp((100 - state.kpi.stability) / 100, 0, 1);
  const moodRisk = clamp((55 - state.people.reduce((a, p) => a + p.happiness, 0) / state.people.length) / 55, 0, 1);
  const chance = 0.55 + stress * 0.2 + moodRisk * 0.15;
  if (Math.random() > chance) {
    state.major.nextAtDay = state.day + Math.max(8, MAJOR_EVENT_INTERVAL_DAYS - 4);
    return;
  }
  spawnMajorEvent();
  state.major.nextAtDay = state.day + MAJOR_EVENT_INTERVAL_DAYS + Math.floor(rand(-4, 6));
}

function resolveMajorEvent(eventId) {
  const ev = state.majorEvents.find((x) => x.id === eventId);
  if (!ev) return;
  const costAP = ev.response?.costAP ?? 1;
  const costCash = ev.response?.costCash ?? 10;
  if (!spendActionPoints(costAP, "major event response")) return;
  if (state.budget.treasury < costCash) {
    state.resources.actionPoints = clamp(state.resources.actionPoints + costAP, 0, state.resources.maxActionPoints);
    addTicker(`Need ${formatMoneyMillions(costCash)} treasury to resolve: ${ev.title}.`);
    return;
  }
  state.budget.treasury -= costCash;
  applyDemographicShiftMap(ev.response?.dem);
  applyKpiShiftMap(ev.response?.kpi);
  state.monthly.stats.majorResolved += 1;
  awardStreak("major event response");
  recordAction(ev.domain || "treasury");
  addTicker(`Major response funded: ${ev.title}.`);
  addRailEvent("✅ Major Resolved", `${ev.title} funded (${formatMoneyMillions(costCash)}).`, true);
  state.majorEvents = state.majorEvents.filter((x) => x.id !== ev.id);
  if (state.ui.focusedMajorEventId === ev.id) state.ui.focusedMajorEventId = null;
}

function deferMajorEventCard(eventId) {
  const ev = state.majorEvents.find((x) => x.id === eventId);
  if (!ev) return;
  ev.snoozeUntilDay = state.day + 3;
  if (state.ui.focusedMajorEventId === ev.id) state.ui.focusedMajorEventId = null;
  addTicker(`Deferred briefing: ${ev.title}. Pressure is still active.`);
}

function updateMajorEventsPerDay() {
  const keep = [];
  for (const ev of state.majorEvents) {
    applyDemographicShiftMap(ev.perDayDem);
    applyKpiShiftMap(ev.perDayKpi);
    const daysLeft = ev.expiresDay - state.day;
    if (daysLeft <= 0) {
      applyDemographicShiftMap(ev.perDayDem, 2.4);
      applyKpiShiftMap(ev.perDayKpi, 1.8);
      state.monthly.stats.majorMissed += 1;
      breakStreak(`major event missed: ${ev.title}`);
      addTicker(`Major event missed: ${ev.title}. Public confidence dropped.`);
      addRailEvent("❌ Major Missed", `${ev.title} timed out and escalated.`, true);
      if (state.ui.focusedMajorEventId === ev.id) state.ui.focusedMajorEventId = null;
      continue;
    }
    keep.push(ev);
  }
  state.majorEvents = keep;
}

function maybeTriggerEvents() {
  if (state.day % 4 === 0) {
    const ev = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
    ev.impact(state);
    addTicker(`${ev.title}: ${ev.flavor}`);
    addRailEvent(ev.title, ev.flavor, Math.random() < 0.3);
  }
}

function spawnIncident(forceTypeId = null) {
  const type = forceTypeId
    ? INCIDENT_TYPES.find((t) => t.id === forceTypeId) || INCIDENT_TYPES[0]
    : INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)];

  const anchorMap = {
    health: "medical",
    safety: "crime",
    climate: "flood",
    integrity: "corruption",
    economy: "fire",
  };

  const placedBuildings = state.buildings.filter((b) => b.placed);
  let targetBuilding = (placedBuildings.length ? placedBuildings : state.buildings)[Math.floor(Math.random() * (placedBuildings.length ? placedBuildings.length : state.buildings.length))];
  for (const b of state.buildings) {
    if (anchorMap[b.kpi] === type.id) {
      targetBuilding = b;
      break;
    }
  }

  const incident = {
    id: `inc_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    type,
    tile: [buildingTile(targetBuilding)[0] + rand(-1.5, 1.5), buildingTile(targetBuilding)[1] + rand(-1.5, 1.5)],
    severity: 1 + Math.floor(Math.random() * 3),
    daysOpen: 0,
    contained: false,
    resolved: false,
    resolveSec: 0,
    assignedResponderId: null,
    districtId: districtForTile(buildingTile(targetBuilding)),
    streakBroken: false,
  };

  state.incidents.push(incident);
  state.monthly.stats.incidentsSpawned += 1;
  const code = `INCIDENT-${String(state.day).padStart(3, "0")}-${String(state.incidents.length).padStart(2, "0")}`;
  incident.code = code;
  addTicker(`${code}: ${incident.type.title} near ${targetBuilding.name}.`);
  addRailEvent(incident.type.title, "Tap incident on map for emergency intervention.", true);
}

function updateIncidentsPerDay() {
  for (const d of state.districts) d.stress = Math.max(0, d.stress - 0.25);

  for (const inc of state.incidents) {
    if (inc.resolved) continue;
    inc.daysOpen += 1;
    const district = state.districts.find((d) => d.id === inc.districtId);
    if (district) district.stress += inc.contained ? 0.4 : 1.1 * inc.severity;

    if (!inc.contained) {
      const penalty = inc.type.perDayPenalty * inc.severity;
      state.kpi[inc.type.kpi] -= penalty;
      state.kpi.stability -= penalty * 0.35;
      if (inc.daysOpen % 3 === 0 && inc.severity < 4) inc.severity += 1;
      if (inc.daysOpen >= 4 && !inc.streakBroken) {
        breakStreak(`${inc.type.title} spiraled`);
        inc.streakBroken = true;
      }
    } else {
      state.kpi.stability -= 0.08 * inc.severity;
    }
  }
}

function maybeSpawnIncident() {
  const dept = {
    crime: findBuilding("security"),
    medical: findBuilding("health"),
    fire: findBuilding("transport"),
    flood: findBuilding("climate"),
    corruption: findBuilding("integrity"),
  };
  const weighted = INCIDENT_TYPES.map((t) => {
    const d = dept[t.id];
    if (!d) return { id: t.id, w: 1 };
    let w = 1 + Math.max(0, (62 - d.budget) * 0.34) + Math.max(0, (70 - state.kpi[t.kpi]) * 0.18);
    if (d.state === "strained") w += 1.8;
    if (d.state === "overloaded") w += 3.4;
    return { id: t.id, w };
  });
  const pressure = clamp((100 - state.kpi.stability) / 100, 0, 1);
  const chance = 0.09 + pressure * 0.18 + Math.min(0.08, state.incidents.length * 0.01);
  if (Math.random() >= chance) return;
  const total = weighted.reduce((a, x) => a + x.w, 0);
  let roll = Math.random() * total;
  for (const w of weighted) {
    roll -= w.w;
    if (roll <= 0) {
      spawnIncident(w.id);
      return;
    }
  }
  spawnIncident(weighted[0]?.id);
}

function updateIncidentResolution(dt) {
  for (const inc of state.incidents) {
    if (inc.resolved || !inc.contained) continue;
    inc.resolveSec -= dt * (1 + state.rapid.momentum * 0.04);
    if (inc.resolveSec <= 0) {
      inc.resolved = true;
      state.kpi[inc.type.kpi] = clamp(state.kpi[inc.type.kpi] + 1.1 * inc.severity, 0, 100);
      state.kpi.stability = clamp(state.kpi.stability + 0.6, 0, 100);
      state.budget.treasury += 1;
      state.session.metrics.resolves += 1;
      awardStreak("incident response");
      addTicker(`Resolved ${inc.code || "INCIDENT"}: ${inc.type.title}.`);
      if (inc.playerFunded) {
        state.monthly.stats.resolvedDirect += 1;
        addRailEvent("✅ Player Resolved", `${inc.type.title} was fast-tracked by your emergency funding.`, false);
      } else {
        state.monthly.stats.resolvedAuto += 1;
        addRailEvent("🤖 Auto Resolved", `${inc.type.title} was handled by baseline services.`, false);
      }
    }
  }
  state.incidents = state.incidents.filter((i) => !i.resolved);
}

function getResponderKindColor(kind) {
  if (kind === "police") return "#4b72b8";
  if (kind === "ambulance") return "#d85b63";
  if (kind === "utility") return "#d49b47";
  return "#935cc6";
}

function initTrafficVehicles() {
  const vehicleSprites = ["vehicle_car", "vehicle_bus", "vehicle_car", "vehicle_car"];
  state.visual.vehicles = [];
  for (let i = 0; i < 34; i += 1) {
    state.visual.vehicles.push({
      lane: i % 2 === 0 ? "x" : "y",
      t: Math.random() * MAP_W,
      speed: 0.9 + Math.random() * 1.6,
      color: i % 3 === 0 ? "#f5f5f5" : i % 3 === 1 ? "#ffd17b" : "#9dc8ff",
      sprite: vehicleSprites[i % vehicleSprites.length],
    });
  }
}

function addTrafficVehicles(count) {
  const vehicleSprites = ["vehicle_car", "vehicle_bus", "vehicle_car", "vehicle_car"];
  for (let i = 0; i < count; i += 1) {
    const idx = state.visual.vehicles.length + i;
    state.visual.vehicles.push({
      lane: idx % 2 === 0 ? "x" : "y",
      t: Math.random() * MAP_W,
      speed: 0.9 + Math.random() * 1.6,
      color: idx % 3 === 0 ? "#f5f5f5" : idx % 3 === 1 ? "#ffd17b" : "#9dc8ff",
      sprite: vehicleSprites[idx % vehicleSprites.length],
    });
  }
}

function initCivilians(count = 180) {
  const civSprites = ["civ_a", "civ_b", "civ_c", "civ_d", "civ_e", "civ_f"];
  state.visual.civilians = [];
  const homeClusters = [
    [3.5, 17.5],
    [5.2, 6.3],
    [18.4, 5.6],
    [19.1, 17.3],
  ];
  const jobs = state.buildings.map((b) => buildingTile(b));

  for (let i = 0; i < count; i += 1) {
    const h = homeClusters[Math.floor(Math.random() * homeClusters.length)];
    const j = jobs[Math.floor(Math.random() * jobs.length)];
    const home = [h[0] + rand(-1.3, 1.3), h[1] + rand(-1.3, 1.3)];
    const work = [j[0] + rand(-0.9, 0.9), j[1] + rand(-0.9, 0.9)];
    state.visual.civilians.push({
      x: home[0],
      y: home[1],
      home,
      work,
      target: [...home],
      speed: 0.9 + Math.random() * 0.7,
      wanderTimer: rand(0, 2),
      commute: false,
      tone: Math.random() < 0.5 ? "#f4f4f4" : "#ffe4c0",
      sprite: civSprites[Math.floor(Math.random() * civSprites.length)],
    });
  }
}

function addCivilians(count = 8) {
  const civSprites = ["civ_a", "civ_b", "civ_c", "civ_d", "civ_e", "civ_f"];
  const homeClusters = [
    [3.5, 17.5],
    [5.2, 6.3],
    [18.4, 5.6],
    [19.1, 17.3],
  ];
  const jobs = state.buildings.map((b) => buildingTile(b));
  for (let i = 0; i < count; i += 1) {
    const h = homeClusters[Math.floor(Math.random() * homeClusters.length)];
    const j = jobs[Math.floor(Math.random() * jobs.length)];
    const home = [h[0] + rand(-1.3, 1.3), h[1] + rand(-1.3, 1.3)];
    const work = [j[0] + rand(-0.9, 0.9), j[1] + rand(-0.9, 0.9)];
    state.visual.civilians.push({
      x: home[0],
      y: home[1],
      home,
      work,
      target: [...home],
      speed: 0.9 + Math.random() * 0.7,
      wanderTimer: rand(0, 2),
      commute: false,
      tone: Math.random() < 0.5 ? "#f4f4f4" : "#ffe4c0",
      sprite: civSprites[Math.floor(Math.random() * civSprites.length)],
    });
  }
}

function initResponders() {
  const fromBuilding = (id) => buildingTile(findBuilding(id)) || [10, 10];
  const spawn = [
    { kind: "police", count: 8, tile: fromBuilding("security") },
    { kind: "ambulance", count: 6, tile: fromBuilding("health") },
    { kind: "utility", count: 6, tile: fromBuilding("transport") },
    { kind: "audit", count: 4, tile: fromBuilding("integrity") },
  ];

  state.visual.responders = [];
  let idx = 0;
  for (const s of spawn) {
    for (let i = 0; i < s.count; i += 1) {
      state.visual.responders.push({
        id: `rsp_${idx++}`,
        kind: s.kind,
        x: s.tile[0] + rand(-0.4, 0.4),
        y: s.tile[1] + rand(-0.4, 0.4),
        home: [s.tile[0], s.tile[1]],
        targetIncidentId: null,
        returning: false,
        speed: 1.5 + Math.random() * 0.6,
        sprite:
          s.kind === "ambulance"
            ? "vehicle_ambulance"
            : s.kind === "police"
              ? "vehicle_police"
              : s.kind === "utility"
                ? "responder_utility"
                : "responder_audit",
      });
    }
  }
}

function initDecorProps() {
  const kinds = ["prop_tree_small", "prop_tree_tall", "prop_lamp", "prop_market", "prop_banner", "prop_fountain"];
  const out = [];
  for (let x = 2; x < MAP_W - 2; x += 1) {
    for (let y = 2; y < MAP_H - 2; y += 1) {
      if (x === 10 || y === 10) continue;
      if ((x + y) % 6 !== 0) continue;
      const hash = (x * 31 + y * 17) % 100;
      if (hash > 34) continue;
      const kind = kinds[(x * 13 + y * 7) % kinds.length];
      out.push({ tile: [x + ((hash % 3) - 1) * 0.12, y + ((hash % 4) - 2) * 0.1], kind });
    }
  }
  state.visual.decorProps = out;
}

function nearestUnassignedIncidentFor(kind) {
  const relevant = state.incidents.filter((i) => !i.resolved && !i.contained && !i.assignedResponderId);
  if (relevant.length === 0) return null;
  const scored = relevant.map((i) => ({ i, score: i.type.responder === kind ? 0 : 1 }));
  scored.sort((a, b) => a.score - b.score);
  return scored[0].i;
}

function updateResponders(dt) {
  for (const r of state.visual.responders) {
    if (!r.targetIncidentId && !r.returning) {
      const inc = nearestUnassignedIncidentFor(r.kind);
      if (inc) {
        r.targetIncidentId = inc.id;
        inc.assignedResponderId = r.id;
      }
    }

    if (r.targetIncidentId) {
      const inc = state.incidents.find((i) => i.id === r.targetIncidentId);
      if (!inc || inc.resolved) {
        r.targetIncidentId = null;
        r.returning = true;
      } else {
        moveToward(r, inc.tile, dt, r.speed);
        if (tileDist([r.x, r.y], inc.tile) < 0.3) {
          if (!inc.contained) {
            inc.contained = true;
            inc.resolveSec = 3.5 + inc.severity * 1.8;
          }
          r.targetIncidentId = null;
          r.returning = true;
        }
      }
    } else if (r.returning) {
      moveToward(r, r.home, dt, r.speed * 0.9);
      if (tileDist([r.x, r.y], r.home) < 0.25) {
        r.returning = false;
      }
    }
  }
}

function updateCivilians(dt) {
  const hour = state.visual.hour;
  for (const c of state.visual.civilians) {
    const atWorkWindow = hour >= 9 && hour < 17;
    const commuteToWork = hour >= 7 && hour < 9;
    const commuteHome = hour >= 17 && hour < 20;
    const anchor = atWorkWindow || commuteToWork ? c.work : c.home;

    if (commuteToWork || commuteHome) c.commute = true;
    else c.commute = false;

    c.wanderTimer -= dt;
    if (c.wanderTimer <= 0 || tileDist([c.x, c.y], c.target) < 0.2) {
      c.target = [anchor[0] + rand(-1.0, 1.0), anchor[1] + rand(-1.0, 1.0)];
      c.wanderTimer = rand(0.8, 2.8);
    }

    let panicBoost = 1;
    for (const inc of state.incidents) {
      if (inc.resolved) continue;
      if (tileDist([c.x, c.y], inc.tile) < 2.2) {
        panicBoost = 1.45;
        c.target = [c.x + rand(-1.8, 1.8), c.y + rand(-1.8, 1.8)];
        break;
      }
    }

    moveToward(c, c.target, dt, c.speed * (c.commute ? 1.2 : 0.8) * panicBoost);
    c.x = clamp(c.x, 0.5, MAP_W - 0.5);
    c.y = clamp(c.y, 0.5, MAP_H - 0.5);
  }
}

function updateVisual(dt) {
  if (state.paused) return;
  state.visual.hour += dt * 3;
  if (state.visual.hour >= 24) state.visual.hour -= 24;

  for (const c of state.visual.clouds) {
    c.x += c.speed * dt;
    if (c.x > state.camera.viewW + 220) c.x = -220;
  }

  for (const v of state.visual.vehicles) {
    v.t += v.speed * dt;
    if (v.t > MAP_W + 2) v.t = -2;
  }

  updateCivilians(dt);
  updateResponders(dt);
  updateIncidentResolution(dt);
}

function buildQueueSweep() {
  const done = state.buildQueue.filter((q) => q.completeDay <= state.day);
  if (done.length === 0) return;
  state.buildQueue = state.buildQueue.filter((q) => q.completeDay > state.day);
  for (const q of done) {
    addRailEvent("🏗️ Project Complete", `${q.name} construction completed.`, false);
  }
}

function refreshAdvisorBrief() {
  const lines = [];
  const picks = ["health", "education", "security", "climate", "treasury", "integrity"];
  for (const id of picks) {
    const b = findBuilding(id);
    if (!b) continue;
    if (!b.placed) {
      lines.push(`⚪ ${b.name}: Awaiting construction site placement.`);
      continue;
    }
    const meta = BUILDING_STATE_META[b.state] || BUILDING_STATE_META.stable;
    const ask = b.budget < 55 || b.state === "overloaded" || b.state === "strained"
      ? `Needs support: lift to ~${Math.max(58, b.budget + 6)} $m/day.`
      : "Holding steady with current funding.";
    lines.push(`${meta.icon} ${b.name}: ${meta.label}. ${ask}`);
  }
  state.monthly.advisorLines = lines;
}

function openMonthlyModal(report) {
  if (!els.monthlyModal) return;
  state.monthly.report = report;
  state.monthly.modalOpen = true;
  if (!state.paused) {
    state.paused = true;
    state.ui.pausedByModal = true;
    els.pauseBtn.textContent = "Resume";
  }
}

function closeMonthlyModal() {
  state.monthly.modalOpen = false;
  if (state.ui.pausedByModal) {
    state.paused = false;
    state.ui.pausedByModal = false;
    els.pauseBtn.textContent = "Pause";
  }
}

function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffledIndices(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nextFromPool(key, arr) {
  if (!arr || arr.length === 0) return "";
  if (!state.monthly.pools[key] || state.monthly.pools[key].length === 0) {
    state.monthly.pools[key] = shuffledIndices(arr.length);
  }
  const idx = state.monthly.pools[key].pop();
  return arr[idx] ?? arr[0];
}

function updatePeopleMood() {
  const b = {
    health: findBuilding("health"),
    education: findBuilding("education"),
    transport: findBuilding("transport"),
    welfare: findBuilding("welfare"),
    security: findBuilding("security"),
    climate: findBuilding("climate"),
    treasury: findBuilding("treasury"),
    integrity: findBuilding("integrity"),
  };
  const service = {
    welfare: ((b.welfare?.budget ?? 60) - 60) * 0.05 + ((b.welfare?.level ?? 1) - 1) * 0.26 + (state.kpi.health - 60) * 0.016,
    health: ((b.health?.budget ?? 60) - 60) * 0.05 + (state.kpi.health - 60) * 0.022,
    education: ((b.education?.budget ?? 60) - 60) * 0.045 + (state.kpi.education - 60) * 0.02,
    economy: ((b.transport?.budget ?? 60) - 60) * 0.04 + (state.kpi.economy - 60) * 0.024,
    climate: ((b.climate?.budget ?? 60) - 60) * 0.04 + (state.kpi.climate - 60) * 0.02,
    integrity: ((b.integrity?.budget ?? 60) - 60) * 0.038 + (state.kpi.integrity - 60) * 0.02,
    infrastructure: ((b.transport?.level ?? 1) - 1) * 0.4 + ((b.transport?.budget ?? 60) - 60) * 0.04,
    corruption: (state.kpi.integrity - 60) * 0.02,
    debt: (100 - state.budget.debt) * 0.02,
    inequality: ((b.welfare?.budget ?? 60) - (b.treasury?.budget ?? 60)) * 0.05 + (state.kpi.integrity - 60) * 0.015,
  };

  for (const d of DEMOGRAPHICS) {
    const p = state.people.find((x) => x.id === d.id);
    if (!p) continue;
    const last = p.happiness;
    const delta =
      (d.weight.welfare || 0) * service.welfare +
      (d.weight.health || 0) * service.health +
      (d.weight.education || 0) * service.education +
      (d.weight.economy || 0) * service.economy +
      (d.weight.climate || 0) * service.climate +
      (d.weight.integrity || 0) * service.integrity +
      (d.weight.infrastructure || 0) * service.infrastructure +
      (d.weight.corruption || 0) * service.corruption +
      (d.weight.debt || 0) * service.debt +
      (d.weight.inequality || 0) * service.inequality;
    p.happiness = clamp(p.happiness + delta * 0.2, 0, 100);
    p.trend = round(p.happiness - last);
    if (p.happiness < 25) p.note = "Severe frustration is rising in this group.";
    else if (p.happiness < 45) p.note = "Confidence is fragile; services feel unreliable.";
    else if (p.happiness > 72) p.note = "This group feels policy is improving daily life.";
    else p.note = "Watching affordability, safety, and service follow-through.";
  }
}

function checkGameOver() {
  if (state.gameOver.active) return;
  const collapsedGroup = state.people.find((p) => p.happiness <= 0);
  if (state.budget.treasury <= 0) {
    state.gameOver = {
      active: true,
      reason: `Treasury hit ${formatMoneyMillions(state.budget.treasury)}. You can no longer finance core operations.`,
      facts: [
        `Day ${state.day} shutdown triggered by fiscal collapse.`,
        `Debt: ${round(state.budget.debt)}% · Stability: ${round(state.kpi.stability)}.`,
        `Top stress district: ${[...state.districts].sort((a, b) => b.stress - a.stress)[0].label}.`,
      ],
    };
  } else if (collapsedGroup) {
    state.gameOver = {
      active: true,
      reason: `${collapsedGroup.label} reached 0% happiness and public legitimacy collapsed.`,
      facts: [
        `Day ${state.day} breakdown due to social trust failure.`,
        `${collapsedGroup.label} no longer supports the governing model.`,
        `Treasury: ${formatMoneyMillions(state.budget.treasury)} · Stability: ${round(state.kpi.stability)}.`,
      ],
    };
  }
  if (!state.gameOver.active) return;
  state.paused = true;
  state.monthly.modalOpen = false;
  state.monthly.report = null;
  if (els.pauseBtn) els.pauseBtn.textContent = "Resume";
}

function runMonthlySummary() {
  if (state.day === 0 || state.day % MONTHLY_REPORT_DAYS !== 0 || state.monthly.lastSummaryDay === state.day) return;
  state.monthly.lastSummaryDay = state.day;
  const top = Object.entries(state.kpi).sort((a, b) => b[1] - a[1])[0];
  const low = Object.entries(state.kpi).sort((a, b) => a[1] - b[1])[0];
  const priorStability = (state.history.stability && state.history.stability.length > 31) ? state.history.stability[state.history.stability.length - 31] : state.kpi.stability;
  const deltaStability = round(state.kpi.stability - priorStability);
  const adviser = nextFromPool("advisor_1", MONTHLY_CHARACTERS.advisors);
  const adviser2 = nextFromPool(
    "advisor_2",
    MONTHLY_CHARACTERS.advisors.filter((a) => a.name !== adviser.name)
  );
  const opponent = nextFromPool("opposition", MONTHLY_CHARACTERS.opposition);
  const centre = MONTHLY_MEDIA.center;
  const independent = MONTHLY_MEDIA.independent;
  const right = MONTHLY_MEDIA.right;
  const left = MONTHLY_MEDIA.left;
  const centreSource = nextFromPool("center_source", centre.sources);
  const independentSource = nextFromPool("ind_source", independent.sources);
  const rightSource = nextFromPool("right_source", right.sources);
  const leftSource = nextFromPool("left_source", left.sources);
  const directActions = state.monthly.stats.resolvedDirect + state.monthly.stats.rapidDirect;
  const autoActions = state.monthly.stats.resolvedAuto + state.monthly.stats.rapidAuto;
  const majorHandled = state.monthly.stats.majorResolved;
  const majorMissed = state.monthly.stats.majorMissed;
  const fair = state.people.reduce((a, p) => a + p.happiness, 0) / state.people.length;
  const mediaTone = fair > 60 && deltaStability >= 0 ? "praise" : "attack";
  const centreLine = nextFromPool(`center_${mediaTone}`, centre[mediaTone]);
  const independentLine = nextFromPool(`ind_${mediaTone}`, independent[mediaTone]);
  const rightLine = nextFromPool(`right_${mediaTone}`, right[mediaTone]);
  const leftLine = nextFromPool(`left_${mediaTone}`, left[mediaTone]);

  const report = {
    paper: `${centreSource} / ${independentSource}`,
    headline: deltaStability >= 0 ? "Government Holds Course As City Metrics Rise" : "Mixed Month: Key Services Under Fresh Pressure",
    subhead: `Day ${state.day} Monthly Edition · Independent and Centre coverage usually tracks outcomes best. Partisan takes are visible but not scored.`,
    lead: `${top[0]} led this month at ${round(top[1])}, while ${low[0]} lagged at ${round(low[1])}. Stability ${deltaStability >= 0 ? "improved" : "fell"} by ${Math.abs(deltaStability)} points.`,
    bullets: [
      `🧭 Incidents opened: ${state.monthly.stats.incidentsSpawned}.`,
      `🟠 Major events opened: ${state.monthly.stats.majorSpawned} · handled ${majorHandled} · missed ${majorMissed}.`,
      `✅ Player-resolved outcomes: ${directActions}.`,
      `🤖 Auto-resolved outcomes: ${autoActions}.`,
      `💰 Treasury now ${formatMoneyMillions(state.budget.treasury)} · Debt ${round(state.budget.debt)}%.`,
      `👥 Mean demographic mood: ${round(fair)}%.`,
    ],
    quotes: [
      `(${centre.label} · ${centreSource}) “${centreLine}”`,
      `(${independent.label} · ${independentSource}) “${independentLine}”`,
      `(${right.label} · ${rightSource}) “${rightLine}”`,
      `(${left.label} · ${leftSource}) “${leftLine}”`,
      `“${adviser.line}” — ${adviser.name}, ${adviser.dept}`,
      `“${adviser2.line}” — ${adviser2.name}, ${adviser2.dept}`,
      `“${opponent.jab}” — ${opponent.name}, ${opponent.party} (opposition framing only)`,
    ],
  };

  addRailEvent(
    "📅 Monthly Brief",
    `Strongest: ${top[0]} ${round(top[1])}. Weakest: ${low[0]} ${round(low[1])}. ✅ ${directActions} direct vs 🤖 ${autoActions} auto outcomes.`,
    true
  );
  refreshAdvisorBrief();
  openMonthlyModal(report);
  state.monthly.stats = {
    incidentsSpawned: 0,
    resolvedDirect: 0,
    resolvedAuto: 0,
    rapidDirect: 0,
    rapidAuto: 0,
    majorSpawned: 0,
    majorResolved: 0,
    majorMissed: 0,
  };
}

function scaleCityActivity(avgLevel) {
  const targetCivilians = clamp(Math.round(130 + state.kpi.stability * 1.35 + avgLevel * 10), 150, 330);
  const targetVehicles = clamp(Math.round(18 + state.kpi.economy * 0.24 + avgLevel * 1.8), 20, 56);

  if (state.visual.civilians.length < targetCivilians) addCivilians(Math.min(8, targetCivilians - state.visual.civilians.length));
  else if (state.visual.civilians.length > targetCivilians) state.visual.civilians.length = targetCivilians;

  if (state.visual.vehicles.length < targetVehicles) addTrafficVehicles(Math.min(4, targetVehicles - state.visual.vehicles.length));
  else if (state.visual.vehicles.length > targetVehicles) state.visual.vehicles.length = targetVehicles;
}

function applySimTick() {
  state.day += 1;
  state.year = 2026 + Math.floor(state.day / DAYS_PER_YEAR);
  if (state.day % AP_REGEN_DAYS === 0) {
    state.resources.actionPoints = clamp(state.resources.actionPoints + 1, 0, state.resources.maxActionPoints);
    addApToast("+1 AP", "up");
    pulseActionPill();
    addTicker("Action Point regenerated.");
  }

  if (state.rapid.active && state.day >= state.rapid.active.expiresDay) {
    resolveRapid(state.rapid.active.defaultChoice, true);
  }

  const placedBuildings = state.buildings.filter((b) => b.placed);
  const activeBuildings = placedBuildings.length ? placedBuildings : state.buildings;
  const avgBudget = activeBuildings.reduce((acc, b) => acc + b.budget, 0) / activeBuildings.length;
  const avgLevel = activeBuildings.reduce((acc, b) => acc + b.level, 0) / activeBuildings.length;
  const momentumBonus = state.rapid.momentum * 0.2;

  state.budget.revenue = round(clamp(84 + state.kpi.economy * 0.42 + (avgLevel - 1) * 4 + momentumBonus, 70, 195));
  state.budget.expenditure = round(clamp(82 + avgBudget * 0.33 + (100 - state.kpi.health) * 0.12 + state.budget.debt * 0.03, 75, 215));
  state.budget.deficit = round(state.budget.revenue - state.budget.expenditure);
  state.budget.debt = round(clamp(state.budget.debt - state.budget.deficit * 0.05, 25, 250));
  const treasuryCeiling = 320 + state.kpi.economy * 9 + avgLevel * 90 + Math.max(0, state.resources.bestStreak * 6);
  state.budget.treasury = round(clamp(state.budget.treasury + state.budget.deficit * 0.25, -120, treasuryCeiling));

  const healthB = findBuilding("health");
  const eduB = findBuilding("education");
  const secB = findBuilding("security");
  const climateB = findBuilding("climate");
  const integrityB = findBuilding("integrity");
  const transportB = findBuilding("transport");

  state.kpi.health = clamp(state.kpi.health + (healthB.budget - 60) * 0.02 + (healthB.level - 1) * 0.15 - (state.budget.debt > 120 ? 0.28 : 0), 0, 100);
  state.kpi.education = clamp(state.kpi.education + (eduB.budget - 60) * 0.016 + (eduB.level - 1) * 0.13, 0, 100);
  state.kpi.safety = clamp(state.kpi.safety + (secB.budget - 60) * 0.018 + (secB.level - 1) * 0.14, 0, 100);
  state.kpi.climate = clamp(state.kpi.climate + (climateB.budget - 60) * 0.018 + (climateB.level - 1) * 0.12 - (state.kpi.economy > 78 ? 0.12 : 0), 0, 100);
  state.kpi.integrity = clamp(state.kpi.integrity + (integrityB.budget - 60) * 0.02 + (integrityB.level - 1) * 0.13 - (state.budget.treasury < 0 ? 0.22 : 0), 0, 100);
  state.kpi.economy = clamp(state.kpi.economy + (transportB.budget - 60) * 0.017 + (transportB.level - 1) * 0.15 - (state.budget.debt > 110 ? 0.2 : 0), 0, 100);

  maybeTriggerEvents();
  maybeSpawnMajorEvent();
  maybeSpawnIncident();
  updateMajorEventsPerDay();
  updateIncidentsPerDay();
  updateGoalDaily();
  updatePeopleMood();
  runMonthlySummary();
  if (state.day % 10 === 0) scaleCityActivity(avgLevel);

  state.kpi.stability = clamp(
    0.2 * state.kpi.health +
      0.14 * state.kpi.education +
      0.14 * state.kpi.safety +
      0.14 * state.kpi.climate +
      0.18 * state.kpi.integrity +
      0.2 * state.kpi.economy,
    0,
    100
  );

  for (const key of Object.keys(state.kpi)) {
    if (!state.history[key]) state.history[key] = [];
    state.history[key].push(state.kpi[key]);
    state.history[key] = state.history[key].slice(-120);
  }

  const ready = state.delayed.filter((d) => d.at <= state.day);
  state.delayed = state.delayed.filter((d) => d.at > state.day);
  for (const d of ready) {
    d.fn();
    addTicker(d.label);
  }

  recalcBuildingStates();
  buildQueueSweep();
  maybePromoteTier();
  triggerRapidDecision();
  maybeRewardOnboardingComplete();
  checkGameOver();

  state.kpi.health = clamp(state.kpi.health, 0, 100);
  state.kpi.education = clamp(state.kpi.education, 0, 100);
  state.kpi.safety = clamp(state.kpi.safety, 0, 100);
  state.kpi.climate = clamp(state.kpi.climate, 0, 100);
  state.kpi.integrity = clamp(state.kpi.integrity, 0, 100);
  state.kpi.economy = clamp(state.kpi.economy, 0, 100);
  state.kpi.stability = clamp(state.kpi.stability, 0, 100);
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => {
    const x = Math.round(clamp(v, 0, 255)).toString(16);
    return x.length === 1 ? `0${x}` : x;
  }).join("")}`;
}

function lighten(hex, amount) {
  const c = hexToRgb(hex);
  return rgbToHex(c.r + (255 - c.r) * amount, c.g + (255 - c.g) * amount, c.b + (255 - c.b) * amount);
}

function shade(hex, amount) {
  const c = hexToRgb(hex);
  return rgbToHex(c.r * (1 - amount), c.g * (1 - amount), c.b * (1 - amount));
}

function buildingColor(base, stateKey) {
  if (stateKey === "thriving") return lighten(base, 0.18);
  if (stateKey === "strained") return shade(base, 0.14);
  if (stateKey === "overloaded") return shade(base, 0.27);
  return base;
}

function drawDiamond(x, y, w, h, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x, y - h / 2);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x, y + h / 2);
  ctx.lineTo(x - w / 2, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawBlock(x, y, w, h, height, color) {
  const topY = y - height;
  drawDiamond(x, topY, w, h, color, shade(color, 0.3));

  ctx.beginPath();
  ctx.moveTo(x - w / 2, topY);
  ctx.lineTo(x, topY + h / 2);
  ctx.lineTo(x, y + h / 2);
  ctx.lineTo(x - w / 2, y);
  ctx.closePath();
  ctx.fillStyle = shade(color, 0.22);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + w / 2, topY);
  ctx.lineTo(x, topY + h / 2);
  ctx.lineTo(x, y + h / 2);
  ctx.lineTo(x + w / 2, y);
  ctx.closePath();
  ctx.fillStyle = shade(color, 0.1);
  ctx.fill();
}

function drawClouds() {
  for (const c of state.visual.clouds) {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.size, c.size * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTraffic() {
  for (const v of state.visual.vehicles) {
    const tileX = v.lane === "x" ? v.t : 10;
    const tileY = v.lane === "x" ? 10 : v.t;
    const p = isoToScreen(tileX, tileY);
    const sprite = state.assets.actors[v.sprite];
    if (state.assets.loaded && sprite) {
      const w = 14 * state.camera.zoom;
      const h = 10 * state.camera.zoom;
      drawSpriteCentered(sprite, p.x, p.y - 8 * state.camera.zoom, w, h);
      continue;
    }
    ctx.fillStyle = v.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y - 5 * state.camera.zoom, 2.8 * state.camera.zoom, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCivilians() {
  for (const c of state.visual.civilians) {
    const p = isoToScreen(c.x, c.y);
    const sprite = state.assets.actors[c.sprite];
    if (state.assets.loaded && sprite) {
      const w = 10 * state.camera.zoom;
      const h = 13 * state.camera.zoom;
      drawSpriteCentered(sprite, p.x, p.y - 8 * state.camera.zoom, w, h);
      continue;
    }
    const r = 2.1 * state.camera.zoom;
    ctx.fillStyle = "rgba(20, 40, 35, 0.18)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, r * 1.6, r, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = c.tone;
    ctx.beginPath();
    ctx.arc(p.x, p.y - r * 2.1, r * 1.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = c.commute ? "#5f7485" : "#6d8d78";
    ctx.beginPath();
    ctx.roundRect?.(p.x - r * 0.9, p.y - r * 1.8, r * 1.8, r * 2.2, r * 0.6);
    if (!ctx.roundRect) {
      ctx.rect(p.x - r * 0.9, p.y - r * 1.8, r * 1.8, r * 2.2);
    }
    ctx.fill();
  }
}

function drawResponders() {
  for (const r of state.visual.responders) {
    const p = isoToScreen(r.x, r.y);
    const sprite = state.assets.actors[r.sprite];
    if (state.assets.loaded && sprite) {
      const w = 16 * state.camera.zoom;
      const h = 12 * state.camera.zoom;
      drawSpriteCentered(sprite, p.x, p.y - 9 * state.camera.zoom, w, h);
      continue;
    }
    const size = 4.5 * state.camera.zoom;
    ctx.fillStyle = "rgba(20, 40, 35, 0.18)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, size * 1.5, size * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = getResponderKindColor(r.kind);
    ctx.beginPath();
    ctx.rect(p.x - size, p.y - size * 2.2, size * 2, size * 1.6);
    ctx.fill();
  }
}

function computeProsperityScore() {
  const peopleAvg = state.people.reduce((a, p) => a + p.happiness, 0) / state.people.length;
  const placed = state.buildings.filter((b) => b.placed).length;
  const placeRatio = placed / Math.max(1, state.buildings.length);
  return clamp(
    state.kpi.stability * 0.28 +
      state.kpi.economy * 0.2 +
      state.kpi.climate * 0.12 +
      state.kpi.health * 0.12 +
      state.kpi.integrity * 0.1 +
      peopleAvg * 0.18 +
      placeRatio * 8,
    0,
    100
  );
}

function drawProsperityDecor(prosperity) {
  const scale = state.camera.zoom;
  const activeShare = prosperity < 50 ? 0.2 : prosperity < 62 ? 0.45 : prosperity < 74 ? 0.72 : 1;
  const night = state.visual.hour < 6 || state.visual.hour > 19;
  const sorted = [...state.visual.decorProps].sort((a, b) => a.tile[0] + a.tile[1] - (b.tile[0] + b.tile[1]));
  const activeCount = Math.floor(sorted.length * activeShare);

  for (let i = 0; i < activeCount; i += 1) {
    const d = sorted[i];
    const p = isoToScreen(d.tile[0], d.tile[1]);
    const img = state.assets.actors[d.kind];
    if (state.assets.loaded && img) {
      const size = d.kind === "prop_tree_tall" ? [20, 28] : d.kind === "prop_fountain" ? [24, 18] : [18, 16];
      drawSpriteCentered(img, p.x, p.y - 8 * scale, size[0] * scale, size[1] * scale);
      if (night && d.kind === "prop_lamp") {
        const glow = state.assets.fx.prosperity_glow;
        if (glow) drawSpriteCentered(glow, p.x, p.y - 14 * scale, 24 * scale, 24 * scale);
      }
      continue;
    }
    ctx.fillStyle = "#d4e9c8";
    ctx.beginPath();
    ctx.arc(p.x, p.y - 8 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  if (prosperity > 70) {
    const plaza = isoToScreen(10, 10);
    const glow = state.assets.fx.prosperity_glow;
    if (glow) drawSpriteCentered(glow, plaza.x, plaza.y - 8 * scale, 70 * scale, 70 * scale);
  }
  if (prosperity > 82) {
    const fx = state.assets.fx.confetti;
    if (fx) {
      const p = isoToScreen(10, 10);
      drawSpriteCentered(fx, p.x, p.y - 40 * scale, 40 * scale, 40 * scale);
    }
  }
}

function drawMajorEvents() {
  const pulse = (Math.sin(performance.now() / 160) + 1) / 2;
  for (const ev of state.majorEvents) {
    const p = isoToScreen(ev.tile[0], ev.tile[1]);
    const base = 22 * state.camera.zoom;
    const ring = base + pulse * 10 * state.camera.zoom;
    const alpha = 0.2 + pulse * 0.22;

    ctx.beginPath();
    ctx.arc(p.x, p.y - 10 * state.camera.zoom, ring * 1.3, 0, Math.PI * 2);
    ctx.fillStyle = `${ev.color}${Math.round((alpha * 255)).toString(16).padStart(2, "0")}`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y - 10 * state.camera.zoom, ring, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(10, 24, 38, 0.78)";
    ctx.fill();
    ctx.strokeStyle = ev.color;
    ctx.lineWidth = 2.4 * state.camera.zoom;
    ctx.stroke();

    const beamH = (34 + pulse * 24) * state.camera.zoom;
    ctx.strokeStyle = `${ev.color}99`;
    ctx.lineWidth = 3 * state.camera.zoom;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 10 * state.camera.zoom);
    ctx.lineTo(p.x, p.y - 10 * state.camera.zoom - beamH);
    ctx.stroke();

    ctx.fillStyle = "#fff5e8";
    ctx.font = `${Math.max(12, 16 * state.camera.zoom)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("!", p.x, p.y - 4 * state.camera.zoom);

    const daysLeft = Math.max(0, ev.expiresDay - state.day);
    ctx.fillStyle = "#ffe7d4";
    ctx.font = `${Math.max(9, 11 * state.camera.zoom)}px sans-serif`;
    ctx.fillText(`${ev.title} (${daysLeft}d)`, p.x, p.y - 24 * state.camera.zoom - beamH);
  }
}

function drawIncidents() {
  const pulse = (Math.sin(performance.now() / 190) + 1) / 2;
  for (const inc of state.incidents) {
    if (inc.resolved) continue;
    const p = isoToScreen(inc.tile[0], inc.tile[1]);
    const r = (6 + inc.severity * 1.8 + pulse * 3.5) * state.camera.zoom;

    ctx.beginPath();
    ctx.arc(p.x, p.y - 8 * state.camera.zoom, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.06 + pulse * 0.09})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y - 8 * state.camera.zoom, r * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = `${inc.type.color}AA`;
    ctx.fill();

    const fxName = `incident_${inc.type.id}`;
    const fx = state.assets.fx[fxName];
    if (state.assets.loaded && fx) {
      drawSpriteCentered(fx, p.x, p.y - 8 * state.camera.zoom, 18 * state.camera.zoom, 18 * state.camera.zoom);
    } else {
      ctx.fillStyle = "#fff";
      ctx.font = `${Math.max(9, 10 * state.camera.zoom)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(inc.type.icon, p.x, p.y - 5 * state.camera.zoom);
    }
  }

  const rapid = state.rapid.active;
  if (!rapid) return;
  const p = isoToScreen(rapid.mapMarkerTile[0], rapid.mapMarkerTile[1]);
  const rpulse = (Math.sin(performance.now() / 140) + 1) / 2;
  const r = (10 + rpulse * 6) * state.camera.zoom;
  ctx.beginPath();
  ctx.arc(p.x, p.y - 50 * state.camera.zoom, r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(213,82,82,${0.45 + rpulse * 0.35})`;
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `${Math.max(11, 14 * state.camera.zoom)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("!", p.x, p.y - 46 * state.camera.zoom);
}

function tileSpriteFor(x, y) {
  if (x === 10 && y === 10) return "plaza";
  if (x === 10 || y === 10) {
    if ((x + y) % 7 === 0) return "road_turn";
    return "road_straight";
  }
  if ((x + y) % 13 === 0) return "water";
  if ((x + y) % 9 === 0) return "park";
  if ((x + y) % 5 === 0) return "sidewalk";
  return "grass";
}

function drawMap() {
  const pulse = (Math.sin(performance.now() / 220) + 1) / 2;
  const prosperity = computeProsperityScore();
  ctx.clearRect(0, 0, state.camera.viewW, state.camera.viewH);

  drawClouds();

  for (let x = 0; x < MAP_W; x += 1) {
    for (let y = 0; y < MAP_H; y += 1) {
      const p = isoToScreen(x, y);
      const tileKey = tileSpriteFor(x, y);
      const tileSprite = state.assets.tiles[tileKey];
      if (state.assets.loaded && tileSprite) {
        drawSpriteCentered(tileSprite, p.x, p.y, TILE_W * 1.1 * state.camera.zoom, TILE_H * 1.08 * state.camera.zoom);
      } else {
        const alt = (x + y) % 2 === 0;
        drawDiamond(p.x, p.y, TILE_W * state.camera.zoom, TILE_H * state.camera.zoom, alt ? "#9fd0b0" : "#93c5a8", "#6ea08a");
        if ((x === 10 || y === 10) && (x + y) % 3 !== 0) {
          drawDiamond(p.x, p.y - 1, TILE_W * 0.9 * state.camera.zoom, TILE_H * 0.7 * state.camera.zoom, "#b9b3a3", "#9b9688");
        }
      }
    }
  }

  if (state.ui.placementBuildingId && state.ui.hoverTile) {
    for (const rec of state.ui.placementRecommendations || []) {
      const rp = isoToScreen(rec.tile[0], rec.tile[1]);
      drawDiamond(
        rp.x,
        rp.y - 2 * state.camera.zoom,
        TILE_W * 0.76 * state.camera.zoom,
        TILE_H * 0.66 * state.camera.zoom,
        "rgba(255,178,82,0.18)",
        "#ffb65e"
      );
    }
    const [hx, hy] = state.ui.hoverTile;
    const p = isoToScreen(hx, hy);
    const ok = isTileBuildable(hx, hy);
    const evaln = ok ? placementEvaluation(state.ui.placementBuildingId, [hx, hy]) : null;
    drawDiamond(
      p.x,
      p.y - 2 * state.camera.zoom,
      TILE_W * 0.94 * state.camera.zoom,
      TILE_H * 0.84 * state.camera.zoom,
      ok ? "rgba(72,212,149,0.28)" : "rgba(255,94,87,0.28)",
      ok ? "#49d895" : "#ff5e57"
    );
    if (evaln) {
      ctx.fillStyle = "#fff3e4";
      ctx.font = `${Math.max(10, 12 * state.camera.zoom)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(`Placement: ${evaln.label} (${evaln.score})`, p.x, p.y - 20 * state.camera.zoom);
    }
  }

  drawProsperityDecor(prosperity);
  drawTraffic();
  drawCivilians();
  drawMajorEvents();

  const drawOrder = state.buildings
    .filter((b) => b.placed && b.tile)
    .sort((a, b) => a.tile[0] + a.tile[1] - (b.tile[0] + b.tile[1]));
  for (const b of drawOrder) {
    const p = isoToScreen(b.tile[0], b.tile[1]);
    const lvl = Math.max(1, Math.min(3, b.level));
    const bSprite = state.assets.buildings[`${b.id}_lvl${lvl}`];
    const w = TILE_W * 1.28 * state.camera.zoom;
    const h = TILE_H * 2.2 * state.camera.zoom;
    const h3d = (16 + b.level * 12) * state.camera.zoom;

    if (state.assets.loaded && bSprite) {
      drawSpriteCentered(bSprite, p.x, p.y - 26 * state.camera.zoom, w, h);
    } else {
      const bw = TILE_W * 0.62 * state.camera.zoom;
      const bh = TILE_H * 0.56 * state.camera.zoom;
      drawBlock(p.x, p.y - 4 * state.camera.zoom, bw, bh, h3d, buildingColor(b.color, b.state));
    }

    if (b.id === state.selectedBuildingId) {
      drawDiamond(p.x, p.y + 2, TILE_W * 0.8 * state.camera.zoom, TILE_H * 0.7 * state.camera.zoom, "rgba(255,220,130,0.35)", "#f0b35c");
    }
    if (b.id === state.ui.hoveredBuildingId && b.id !== state.selectedBuildingId) {
      drawDiamond(p.x, p.y + 2, TILE_W * 0.84 * state.camera.zoom, TILE_H * 0.74 * state.camera.zoom, "rgba(78,154,255,0.22)", "#4d93e8");
    }

    if (b.state === "overloaded" || b.state === "strained") {
      const r = (6 + pulse * 5) * state.camera.zoom;
      ctx.beginPath();
      ctx.arc(p.x, p.y - h3d - 10 * state.camera.zoom, r, 0, Math.PI * 2);
      ctx.fillStyle = b.state === "overloaded" ? `rgba(179,71,71,${0.5 + pulse * 0.3})` : `rgba(194,125,45,${0.45 + pulse * 0.25})`;
      ctx.fill();
    }

    if (b.state === "thriving") {
      ctx.fillStyle = `rgba(255,248,190,${0.35 + pulse * 0.3})`;
      ctx.beginPath();
      ctx.arc(p.x - 8 * state.camera.zoom, p.y - h3d - 8 * state.camera.zoom, 2.5 * state.camera.zoom, 0, Math.PI * 2);
      ctx.arc(p.x + 7 * state.camera.zoom, p.y - h3d - 5 * state.camera.zoom, 2.2 * state.camera.zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    if (prosperity > 72 && b.level >= 2) {
      const glow = state.assets.fx.prosperity_glow;
      if (glow) drawSpriteCentered(glow, p.x, p.y - h3d - 14 * state.camera.zoom, 22 * state.camera.zoom, 22 * state.camera.zoom);
    }

    const iconMeta = BUILDING_STATE_META[b.state] || BUILDING_STATE_META.stable;
    ctx.fillStyle = "#1f2d39";
    ctx.font = `${Math.max(10, 12 * state.camera.zoom)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(iconMeta.icon, p.x + 20 * state.camera.zoom, p.y - h3d - 12 * state.camera.zoom);

    ctx.fillStyle = "rgba(45,52,53,0.8)";
    ctx.font = `${Math.max(10, 11 * state.camera.zoom)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(b.name.split(" ")[0], p.x, p.y + 18 * state.camera.zoom);
  }

  drawIncidents();
  drawResponders();
  drawRipples();
}

function pickBuildingAt(sx, sy) {
  const ordered = state.buildings
    .filter((b) => b.placed && b.tile)
    .sort((a, b) => b.tile[0] + b.tile[1] - (a.tile[0] + a.tile[1]));
  for (const b of ordered) {
    const p = isoToScreen(b.tile[0], b.tile[1]);
    const bodyY = p.y - 26 * state.camera.zoom;
    const withinRect =
      Math.abs(sx - p.x) <= TILE_W * 0.56 * state.camera.zoom &&
      sy >= bodyY - TILE_H * 1.1 * state.camera.zoom &&
      sy <= bodyY + TILE_H * 0.9 * state.camera.zoom;
    if (withinRect) return b;
    if (pointInDiamond(sx, sy, p.x, p.y, TILE_W * 0.75 * state.camera.zoom, TILE_H * 0.8 * state.camera.zoom)) return b;
  }
  return null;
}

function pickIncidentAt(sx, sy) {
  for (const inc of state.incidents) {
    if (inc.resolved) continue;
    const p = isoToScreen(inc.tile[0], inc.tile[1]);
    const dist = Math.hypot(sx - p.x, sy - (p.y - 8 * state.camera.zoom));
    if (dist < 14 * state.camera.zoom) return inc;
  }
  return null;
}

function pickMajorEventAt(sx, sy) {
  for (const ev of state.majorEvents) {
    const p = isoToScreen(ev.tile[0], ev.tile[1]);
    const dist = Math.hypot(sx - p.x, sy - (p.y - 10 * state.camera.zoom));
    if (dist < 26 * state.camera.zoom) return ev;
  }
  return null;
}

function emergencyTapIncident(inc) {
  if (!spendActionPoints(1, "emergency intervention")) return;
  const cost = 6 + inc.severity * 2;
  if (state.budget.treasury < cost) {
    addTicker("Not enough treasury for emergency response tap.");
    state.resources.actionPoints = clamp(state.resources.actionPoints + 1, 0, state.resources.maxActionPoints);
    return;
  }

  state.budget.treasury -= cost;
  inc.contained = true;
  inc.playerFunded = true;
  inc.resolveSec = Math.min(inc.resolveSec || 999, 2.8 + inc.severity * 1.2);
  markOnboarding("upgradedOrDispatched");
  recordAction(inc.type.id === "corruption" ? "integrity" : inc.type.id === "flood" ? "climate" : inc.type.id === "crime" ? "security" : inc.type.id === "medical" ? "health" : "transport");
  addTicker(`Emergency dispatch funded for ${inc.code || "INCIDENT"} ${inc.type.title}.`);
  addRailEvent("⚡ Emergency Funded", `${inc.type.title} fast-tracked.`, true);
}

function renderRapidCard() {
  const a = state.rapid.active;
  els.rapidMomentum.textContent = String(state.rapid.momentum);
  if (!a) {
    els.rapidTitle.textContent = "No urgent brief right now.";
    const nextIn = Math.max(0, state.rapid.nextAtDay - state.day);
    els.rapidBody.textContent = `Critical INCIDENT briefs appear roughly every ${RAPID_INTERVAL_DAYS} days. Next in ~${nextIn} days.`;
    els.rapidTimer.textContent = "-";
    els.rapidBtnA.disabled = true;
    els.rapidBtnB.disabled = true;
    els.rapidBtnA.textContent = "Option A";
    els.rapidBtnB.textContent = "Option B";
    els.rapidBtnA.title = "";
    els.rapidBtnB.title = "";
    els.rapidCard.classList.remove("urgent");
    return;
  }

  els.rapidTitle.textContent = `${a.incidentCode}: ${a.title}`;
  els.rapidBody.textContent = a.body;
  els.rapidTimer.textContent = String(Math.max(0, a.expiresDay - state.day));
  els.rapidBtnA.disabled = false;
  els.rapidBtnB.disabled = false;
  els.rapidBtnA.textContent = a.a;
  els.rapidBtnB.textContent = a.b;
  els.rapidBtnA.title = a.tipA;
  els.rapidBtnB.title = a.tipB;
  els.rapidCard.classList.add("urgent");
}

function majorEventCardTarget() {
  if (state.majorEvents.length === 0) return null;
  const focused = state.majorEvents.find((e) => e.id === state.ui.focusedMajorEventId);
  if (focused) return focused;
  const visible = state.majorEvents
    .filter((e) => state.day >= (e.snoozeUntilDay || -1) || (e.expiresDay - state.day) <= 3)
    .sort((a, b) => (a.expiresDay - state.day) - (b.expiresDay - state.day));
  return visible[0] || null;
}

function renderMajorEventCard() {
  if (!els.majorEventCard) return;
  const ev = majorEventCardTarget();
  if (!ev) {
    els.majorEventCard.hidden = true;
    return;
  }
  els.majorEventCard.hidden = false;
  els.majorEventCard.style.borderColor = ev.color;
  els.majorEventCard.style.boxShadow = `0 10px 28px rgba(0,0,0,0.34), 0 0 24px ${ev.color}55`;
  setText(els.majorEventTitle, ev.title);
  setText(els.majorEventBody, ev.body);
  setText(els.majorEventHint, `Hint: ${ev.hint}`);
  setText(els.majorEventTimer, `${Math.max(0, ev.expiresDay - state.day)} days`);
  setText(els.majorEventImpact, majorImpactLabel(ev));

  const canAP = state.resources.actionPoints >= (ev.response?.costAP ?? 1);
  const canCash = state.budget.treasury >= (ev.response?.costCash ?? 0);
  const blocked = !(canAP && canCash);
  if (els.majorEventRespondBtn) {
    els.majorEventRespondBtn.disabled = blocked;
    const label = ev.response?.label || "Fund Response";
    const cost = `${ev.response?.costAP ?? 1} AP · ${formatMoneyMillions(ev.response?.costCash ?? 0)}`;
    els.majorEventRespondBtn.textContent = `${label} (${cost})`;
    if (blocked) {
      els.majorEventRespondBtn.title = !canAP ? "Need more Action Points." : "Need more treasury.";
    } else {
      els.majorEventRespondBtn.title = "Fund intervention and stop ongoing demographic damage.";
    }
  }
  if (els.majorEventDismissBtn) {
    els.majorEventDismissBtn.textContent = `Defer (${state.majorEvents.length})`;
  }
}

function renderHud() {
  setText(els.tierLabel, TIER_CONFIG[state.tierIndex].name);
  setText(els.dayLabel, String(state.day));
  setText(els.stabilityLabel, String(round(state.kpi.stability)));
  setText(els.treasuryLabel, formatMoneyMillions(state.budget.treasury));
  setText(els.actionPoints, String(state.resources.actionPoints));
  setText(els.streakLabel, String(state.resources.streak));
  setText(els.civilianCount, String(state.visual.civilians.length));
  const incidentTotal = state.incidents.length + state.majorEvents.length + (state.rapid.active ? 1 : 0);
  setText(els.incidentCount, String(incidentTotal));

  const hist = state.history.stability || [];
  const trend = hist.length > 8 ? round((hist.at(-1) ?? 0) - (hist.at(-8) ?? 0)) : 0;
  const worstDistrict = [...state.districts].sort((a, b) => b.stress - a.stress)[0];
  const majorOpen = state.majorEvents.length;
  const remainingToPlace = state.buildings.filter((b) => !b.placed).length;
  let light = "🟢";
  let tone = "good";
  els.statusBanner?.classList.remove("warn", "bad");
  els.trafficPill?.classList.remove("warn", "bad");
  if (remainingToPlace > 0) {
    light = "🟠";
    tone = "buildout";
    els.statusBanner.textContent = `Status: Founding phase - place ${remainingToPlace} remaining departments.`;
    els.statusBanner?.classList.add("warn");
    els.trafficPill?.classList.add("warn");
  } else if (state.kpi.stability < 40 || state.incidents.length >= 6 || majorOpen > 0) {
    els.statusBanner?.classList.add("bad");
    els.trafficPill?.classList.add("bad");
    light = "🔴";
    tone = "critical";
    els.statusBanner.textContent = majorOpen > 0
      ? `Status: MAJOR INCIDENT active (${majorOpen}) - rapid intervention recommended.`
      : `Status: Critical pressure (${worstDistrict.label}).`;
  } else if (state.kpi.stability < 58 || trend < -2 || state.incidents.length >= 3) {
    els.statusBanner?.classList.add("warn");
    els.trafficPill?.classList.add("warn");
    light = "🟠";
    tone = "warning";
    els.statusBanner.textContent = `Status: Warning trend (${worstDistrict.label}).`;
  } else {
    els.statusBanner.textContent = "Status: Stable systems.";
  }
  setText(els.trafficLight, light);
  const rapidHint = state.rapid.active ? `${state.rapid.active.incidentCode} active` : "No rapid INCIDENT";
  const majorHint = majorOpen > 0 ? `${majorOpen} major event(s) active` : "No major events";
  const topIncidents = state.incidents.slice(0, 2).map((i) => i.code || i.type.title).join(", ");
  if (els.trafficPill) els.trafficPill.title = `Traffic light: ${tone}. ${majorHint}. ${rapidHint}. ${topIncidents ? `Open: ${topIncidents}.` : "No open incidents."}`;
  renderApFeedback();

  els.tickerLine.textContent = state.tickerItems.join("  |  ");

  const kpiRows = [
    ["Health", state.kpi.health, "health"],
    ["Education", state.kpi.education, "education"],
    ["Safety", state.kpi.safety, "safety"],
    ["Climate", state.kpi.climate, "climate"],
    ["Integrity", state.kpi.integrity, "integrity"],
    ["Economy", state.kpi.economy, "economy"],
    ["Stability", state.kpi.stability, "stability"],
    ["Debt %", state.budget.debt, "stability"],
  ];

  els.kpiGrid.innerHTML = kpiRows.map(([label, value, key]) => {
    const h = state.history[key] || [];
    const delta = h.length > 6 ? round((h.at(-1) ?? 0) - (h.at(-6) ?? 0)) : 0;
    const cls = delta > 0.2 ? "up" : delta < -0.2 ? "down" : "";
    const spark = buildSparkline(h);
    return `<div class="kpi"><div class="name">${label}</div><div class="val">${round(value)}</div><div class="trend ${cls}">${delta > 0 ? `+${delta}` : `${delta}`}</div>${spark}</div>`;
  }).join("");

  const tier = TIER_CONFIG[state.tierIndex];
  els.tierGoal.textContent = tier.goal;
  els.missionList.innerHTML = tier.checks.map((c) => {
    const done = c.pass(state);
    return `<li class="${done ? "done" : ""}">${done ? "[Done]" : "[ ]"} ${c.label}</li>`;
  }).join("");

  els.eventRail.innerHTML = state.railEvents.map((ev) => {
    return `<article class="event-chip ${ev.hot ? "hot" : ""}"><div class="title">Day ${ev.day}: ${ev.title}</div><div class="meta">${ev.meta}</div></article>`;
  }).join("");

  const goal = currentGoal();
  els.sessionGoal.textContent = `${goal.label} (${state.session.progress}/${goal.target}) - ${state.session.daysLeft} days left`;
  els.onboardingList.innerHTML = [
    [state.onboarding.selectedBuilding, "Select any department building"],
    [state.onboarding.budgetApplied, "Spend 1 action point on budget"],
    [state.onboarding.upgradedOrDispatched, "Upgrade a building or emergency-dispatch an incident"],
    [state.onboarding.rapidResolved, "Resolve one rapid decision before timeout"],
  ]
    .map(([done, label]) => `<li class="${done ? "done" : ""}">${done ? "[Done]" : "[ ]"} ${label}</li>`)
    .join("");

  const unplaced = state.buildings.filter((b) => !b.placed);
  const hasUnplaced = unplaced.length > 0;
  if (!hasUnplaced && state.ui.placementBuildingId) {
    state.ui.placementBuildingId = null;
    state.ui.placementRecommendations = [];
  }
  const plannerHead = hasUnplaced
    ? `<article class="event-chip hot">
      <div class="title">🗺️ Founding Planner</div>
      <div class="meta">1) Click an icon below. 2) Place on map. 3) Aim for highlighted recommended tiles.</div>
      <button class="btn ${state.ui.placementBuildingId ? "primary" : ""}" data-placement-toggle="1">${state.ui.placementBuildingId ? "Placement Mode On" : "Start Placement Mode"}</button>
      <div class="planner-palette">
        ${BUILDING_DEFS.map((def) => {
          const b = findBuilding(def.id);
          const placed = b?.placed;
          const active = state.ui.placementBuildingId === def.id;
          return `<button class="planner-palette-btn ${active ? "active" : ""} ${placed ? "placed" : ""}" ${placed ? "disabled" : ""} data-place-id="${def.id}" title="${def.name}${placed ? " (Placed)" : ""}">
            <img src="./assets/cozy-pack/buildings/${def.id}_lvl1.svg" alt="${def.name}" />
            <span>${def.name.split(" ")[0]}</span>
          </button>`;
        }).join("")}
      </div>
    </article>`
    : "";
  const placementCards = hasUnplaced
    ? unplaced.map((b) => {
      const active = state.ui.placementBuildingId === b.id;
      const rec = state.ui.placementRecommendations[0] && active ? `Best tile: ${state.ui.placementRecommendations[0].tile[0]},${state.ui.placementRecommendations[0].tile[1]} (${state.ui.placementRecommendations[0].label})` : "Select from icons above, then place on map.";
      return `<article class="event-chip ${active ? "hot" : ""}">
        <div class="title planner-card" draggable="true" data-place-id="${b.id}">🧱 ${b.name}</div>
        <div class="meta">${rec}</div>
        <button class="btn place-dept" data-place-id="${b.id}">${active ? "Armed" : "Arm"}</button>
      </article>`;
    }).join("")
    : "";
  const constructionCards = state.buildQueue.map(
    (q) => `<article class="event-chip"><div class="title">🏗️ ${q.name}</div><div class="meta">Completes in ${Math.max(0, q.completeDay - state.day)} days · Cost ${formatMoneyMillions(q.cost)}</div></article>`
  ).join("");
  els.buildQueue.innerHTML = `${plannerHead}${placementCards}${constructionCards || (hasUnplaced ? "" : `<article class="event-chip"><div class="title">Queue Empty</div><div class="meta">Founding complete. Ongoing upgrades appear here with completion timers.</div></article>`)}`;

  els.advisorBrief.innerHTML = state.monthly.advisorLines.length
    ? state.monthly.advisorLines.map((line) => `<li>${line}</li>`).join("")
    : `<li>Monthly advisor notes will appear every 30 days.</li>`;

  applyBudgetAvailabilityState();
  applyUpgradeAvailabilityState();
  renderIncidentInbox();
  renderPeoplePanel();
  renderInitiatives();
  renderTabAlerts();
  renderMonthlyModal();
  renderGameOverModal();
  renderRapidCard();
  renderMajorEventCard();
}

function renderTabAlerts() {
  const manualOpen = state.incidents.filter((i) => !i.resolved && !i.contained).length;
  const hasRapid = Boolean(state.rapid.active);
  const incidentsNeed = manualOpen > 0 || hasRapid;
  setTabAlert(els.tabIncidentsAlert, incidentsNeed, hasRapid);

  const weakKpis = ["health", "education", "safety", "climate", "integrity", "economy"]
    .filter((k) => state.kpi[k] < 50);
  const pulseNeed = weakKpis.length >= 2 || state.kpi.stability < 50 || state.people.some((p) => p.happiness < 35);
  setTabAlert(els.tabPulseAlert, pulseNeed);
  if (els.tabPulseAlert) {
    if (pulseNeed) {
      const reasons = [];
      if (weakKpis.length >= 2) reasons.push(`low KPIs: ${weakKpis.join(", ")}`);
      if (state.kpi.stability < 50) reasons.push(`stability ${round(state.kpi.stability)}`);
      const strainedGroup = state.people.filter((p) => p.happiness < 35).map((p) => p.label.split(" ")[0]).slice(0, 2);
      if (strainedGroup.length) reasons.push(`people stress: ${strainedGroup.join(", ")}`);
      els.tabPulseAlert.title = `Pulse warning: ${reasons.join(" · ")}.`;
    } else {
      els.tabPulseAlert.title = "";
    }
  }

  const peopleNeed = state.people.some((p) => p.happiness < 40);
  setTabAlert(els.tabPeopleAlert, peopleNeed);

  const goalUrgent = state.session.daysLeft <= 3 && state.session.progress < currentGoal().target;
  const onboardingLeft = [
    state.onboarding.selectedBuilding,
    state.onboarding.budgetApplied,
    state.onboarding.upgradedOrDispatched,
    state.onboarding.rapidResolved,
  ].filter((x) => !x).length;
  const missionsNeed = goalUrgent || onboardingLeft > 0;
  setTabAlert(els.tabMissionsAlert, missionsNeed, goalUrgent);

  const controlNeed = state.buildings.some((b) => !b.placed || b.state === "overloaded" || b.state === "strained") || state.majorEvents.length > 0;
  setTabAlert(els.tabControlAlert, controlNeed);
}

function renderIncidentInbox() {
  if (!els.incidentInbox) return;
  const major = state.majorEvents
    .slice()
    .sort((a, b) => (a.expiresDay - state.day) - (b.expiresDay - state.day))
    .slice(0, 4);
  const manual = state.incidents
    .filter((i) => !i.resolved && !i.contained)
    .sort((a, b) => (b.severity - a.severity) || (b.daysOpen - a.daysOpen))
    .slice(0, 8);
  const auto = state.incidents
    .filter((i) => !i.resolved && i.contained)
    .sort((a, b) => (b.severity - a.severity) || (b.daysOpen - a.daysOpen))
    .slice(0, 4);

  const rapidLine = state.rapid.active
    ? `<li>🚨 ${state.rapid.active.incidentCode}: ${state.rapid.active.title} (${Math.max(0, state.rapid.active.expiresDay - state.day)}d)</li>`
    : "";
  const majorLines = major
    .map((ev) => `<li>🟠 MAJOR: ${ev.title} (${Math.max(0, ev.expiresDay - state.day)}d) · ${majorImpactLabel(ev)} · click map beacon</li>`)
    .join("");

  const incidentLines = manual.map((i) => {
    return `<li>❗ ${i.code || "INCIDENT"}: ${i.type.title} · sev ${i.severity} · action needed</li>`;
  }).join("");
  const autoLines = auto.map((i) => `<li>🤖 ${i.code || "INCIDENT"}: ${i.type.title} · responders handling</li>`).join("");

  if (!rapidLine && !majorLines && manual.length === 0 && auto.length === 0) {
    els.incidentInbox.innerHTML = "<li>No open incidents right now.</li>";
    return;
  }

  els.incidentInbox.innerHTML = `${rapidLine}${majorLines}${incidentLines}${autoLines}`;
}

function renderPeoplePanel() {
  if (!els.peopleGrid) return;
  els.peopleGrid.innerHTML = state.people
    .map((p) => {
      const trend = p.trend > 0.12 ? `+${round(p.trend)}` : `${round(p.trend)}`;
      return `<article class="people-row">
        <div class="people-head">
          <div class="people-name">${p.label}</div>
          <div class="people-val">${round(p.happiness)}% (${trend})</div>
        </div>
        <div class="people-track"><div class="people-fill" style="width:${clamp(p.happiness, 0, 100)}%"></div></div>
        <div class="people-note">${p.note}</div>
        <div class="people-note"><strong>What helps:</strong> ${DEMOGRAPHIC_GUIDE[p.id] || "Balanced policy delivery."}</div>
      </article>`;
    })
    .join("");
}

function applyInitiative(id) {
  const ini = PEOPLE_INITIATIVES.find((x) => x.id === id);
  if (!ini) return;
  if (!spendActionPoints(ini.costAP, `initiative: ${ini.name}`)) return;
  if (state.budget.treasury < ini.costCash) {
    state.resources.actionPoints = clamp(state.resources.actionPoints + ini.costAP, 0, state.resources.maxActionPoints);
    addTicker(`Need ${formatMoneyMillions(ini.costCash)} treasury for ${ini.name}.`);
    return;
  }
  state.budget.treasury -= ini.costCash;
  const shifts = ini.apply(state) || {};
  for (const p of state.people) {
    p.happiness = clamp(p.happiness + (shifts[p.id] || 0), 0, 100);
  }
  addTicker(`Initiative launched: ${ini.name}.`);
  addRailEvent("🧩 Initiative", `${ini.name} deployed for ${formatMoneyMillions(ini.costCash)}.`, true);
}

function renderInitiatives() {
  if (!els.initiativeGrid) return;
  els.initiativeGrid.innerHTML = PEOPLE_INITIATIVES.map((i) => {
    const canAP = state.resources.actionPoints >= i.costAP;
    const canCash = state.budget.treasury >= i.costCash;
    const disabled = !canAP || !canCash;
    return `<article class="people-row">
      <div class="people-head">
        <div class="people-name">${i.name}</div>
        <div class="people-val">AP ${i.costAP} · ${formatMoneyMillions(i.costCash)}</div>
      </div>
      <div class="people-note">${i.desc}</div>
      <button class="btn initiative-btn ${disabled ? "" : "primary"}" data-initiative-id="${i.id}" ${disabled ? "disabled" : ""}>Launch</button>
    </article>`;
  }).join("");
}

function renderSelection() {
  const b = findBuilding(state.selectedBuildingId);
  if (!b) {
    els.selectedName.textContent = "Select a Department";
    els.selectedDesc.textContent = "Pick a building in the city to inspect funding and upgrades.";
    els.selectedLevel.textContent = "-";
    els.selectedBudget.textContent = "-";
    els.selectedStatus.textContent = "-";
    els.selectedCost.textContent = "-";
    return;
  }

  const cost = 12 + b.level * 8;
  if (!Number.isFinite(state.ui.budgetDraftByBuilding[b.id])) {
    state.ui.budgetDraftByBuilding[b.id] = b.budget;
  }
  const draft = state.ui.budgetDraftByBuilding[b.id];
  const stars = "⭐".repeat(Math.max(1, Math.min(5, Math.ceil(b.level / 2))));
  els.selectedName.textContent = `${b.name} Level ${b.level} ${stars}`;
  els.selectedDesc.textContent = b.desc;
  els.selectedLevel.textContent = `Level ${b.level}`;
  els.selectedBudget.textContent = Math.abs(draft - b.budget) >= 1
    ? `${formatMoneyMillions(b.budget)} -> ${formatMoneyMillions(draft)}`
    : `${formatMoneyMillions(b.budget)}`;
  const statusMeta = BUILDING_STATE_META[b.state] || BUILDING_STATE_META.stable;
  const countdown = b.state === "overloaded" ? "· 5 days to recover" : b.state === "strained" ? "· 10 days to recover" : "";
  els.selectedStatus.textContent = `${statusMeta.label} ${countdown}`.trim();
  els.selectedCost.textContent = formatMoneyMillions(cost);
  els.budgetSlider.value = String(draft);
}

function renderUI() {
  renderHud();
  renderSelection();
}

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(bounds.width * dpr);
  canvas.height = Math.floor(bounds.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  state.camera.viewW = bounds.width;
  state.camera.viewH = bounds.height;
  clampCamera();
}

function cameraBounds() {
  const zoom = state.camera.zoom;
  const halfW = (TILE_W / 2) * zoom;
  const halfH = (TILE_H / 2) * zoom;

  const minTermX = -(MAP_H - 1) * halfW;
  const maxTermX = (MAP_W - 1) * halfW;
  const spanY = (MAP_W + MAP_H - 2) * halfH;

  const padX = 110;
  const padTop = 70;
  const padBottom = 120;

  const centerXForLeft = padX - minTermX;
  const centerXForRight = (state.camera.viewW - padX) - maxTermX;
  let minX = centerXForRight - state.camera.viewW / 2;
  let maxX = centerXForLeft - state.camera.viewW / 2;

  if (minX > maxX) {
    const c = (minX + maxX) / 2;
    minX = c - 40;
    maxX = c + 40;
  }

  const centerYForBottom = (state.camera.viewH - padBottom) - spanY;
  const centerYForTop = padTop;
  let minY = centerYForBottom - state.camera.viewH / 2;
  let maxY = centerYForTop - state.camera.viewH / 2;

  if (minY > maxY) {
    const c = (minY + maxY) / 2;
    minY = c - 40;
    maxY = c + 40;
  }

  return { minX, maxX, minY, maxY };
}

function clampCamera() {
  const { minX, maxX, minY, maxY } = cameraBounds();
  state.camera.x = clamp(state.camera.x, minX, maxX);
  state.camera.y = clamp(state.camera.y, minY, maxY);
}

function cameraForTile(tile) {
  const [ix, iy] = tile;
  const termX = (ix - iy) * (TILE_W / 2) * state.camera.zoom;
  const termY = (ix + iy) * (TILE_H / 2) * state.camera.zoom;
  return { x: -termX, y: 30 - termY };
}

function focusCameraOnTile(tile) {
  const t = cameraForTile(tile);
  state.camera.targetX = t.x;
  state.camera.targetY = t.y;
}

function updateCamera(dt) {
  if (state.camera.dragging) return;

  if (state.camera.targetX !== null && state.camera.targetY !== null) {
    const snap = Math.min(1, dt * 7.5);
    state.camera.x += (state.camera.targetX - state.camera.x) * snap;
    state.camera.y += (state.camera.targetY - state.camera.y) * snap;
    if (Math.hypot(state.camera.targetX - state.camera.x, state.camera.targetY - state.camera.y) < 0.6) {
      state.camera.targetX = null;
      state.camera.targetY = null;
    }
  }

  if (Math.abs(state.camera.vx) > 0.02 || Math.abs(state.camera.vy) > 0.02) {
    state.camera.x += state.camera.vx;
    state.camera.y += state.camera.vy;
    const friction = Math.max(0.84, 1 - dt * 8.5);
    state.camera.vx *= friction;
    state.camera.vy *= friction;
  } else {
    state.camera.vx = 0;
    state.camera.vy = 0;
  }

  clampCamera();
}

function updateUiFx(dt) {
  state.ui.ripples = state.ui.ripples
    .map((r) => ({ ...r, ttl: r.ttl - dt }))
    .filter((r) => r.ttl > 0);
  state.ui.apToasts = state.ui.apToasts
    .map((t) => ({ ...t, ttl: t.ttl - dt }))
    .filter((t) => t.ttl > 0);
}

function drawRipples() {
  for (const r of state.ui.ripples) {
    const progress = 1 - r.ttl / 0.45;
    const radius = 4 + progress * 24;
    const alpha = 0.35 * (1 - progress);
    ctx.beginPath();
    ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(60,130,235,${alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function renderApFeedback() {
  if (!els.apFeedback) return;
  els.apFeedback.innerHTML = state.ui.apToasts
    .map((t) => `<div class="ap-toast ${t.kind}">${t.text}</div>`)
    .join("");
}

function renderMonthlyModal() {
  if (!els.monthlyModal) return;
  const r = state.monthly.report;
  const open = state.monthly.modalOpen && Boolean(r);
  els.monthlyModal.hidden = !open;
  if (!open) return;
  setText(els.monthlyHeadline, `${r.paper} | ${r.headline}`);
  setText(els.monthlySubhead, r.subhead);
  setText(els.monthlyLead, r.lead);
  if (els.monthlySummaryList) {
    els.monthlySummaryList.innerHTML = (r.bullets || []).map((b) => `<li>${b}</li>`).join("");
  }
  if (els.monthlyQuotes) {
    els.monthlyQuotes.innerHTML = (r.quotes || []).map((q) => `<li>${q}</li>`).join("");
  }
}

function renderGameOverModal() {
  if (!els.gameOverModal) return;
  const open = state.gameOver.active;
  els.gameOverModal.hidden = !open;
  if (!open) return;
  setText(els.gameOverHeadline, "Government Collapse");
  setText(els.gameOverReason, state.gameOver.reason);
  if (els.gameOverFacts) {
    els.gameOverFacts.innerHTML = (state.gameOver.facts || []).map((f) => `<li>${f}</li>`).join("");
  }
}

async function loadBaseline() {
  try {
    const res = await fetch("../data/calibrated/baseline_v1.json");
    if (!res.ok) throw new Error("baseline fetch failed");
    return await res.json();
  } catch {
    return null;
  }
}

function initFromBaseline(base) {
  const b = base?.state || {};
  state.kpi.stability = b.state_stability_index ?? state.kpi.stability;
  state.kpi.health = b.health_outcome ?? state.kpi.health;
  state.kpi.education = b.education_outcome ?? state.kpi.education;
  state.kpi.safety = b.public_safety ?? state.kpi.safety;
  state.kpi.climate = b.climate_resilience ?? state.kpi.climate;
  state.kpi.integrity = b.institutional_integrity ?? state.kpi.integrity;
  state.kpi.economy = b.economic_output ?? state.kpi.economy;
  state.budget.debt = b.debt_to_gdp_pct ?? state.budget.debt;
  const seeds = {
    poverty: clamp(45 + (state.kpi.health - 60) * 0.5 + (state.kpi.integrity - 60) * 0.4, 20, 80),
    working: clamp(52 + (state.kpi.economy - 60) * 0.5 + (state.kpi.health - 60) * 0.3, 24, 84),
    middle: clamp(56 + (state.kpi.education - 60) * 0.4 + (state.kpi.economy - 60) * 0.4, 28, 88),
    business: clamp(60 + (state.kpi.economy - 60) * 0.55 + (state.kpi.integrity - 60) * 0.2, 30, 92),
    elite: clamp(66 + (state.kpi.economy - 60) * 0.45, 34, 96),
  };
  state.people = state.people.map((p) => ({ ...p, happiness: seeds[p.id] ?? p.happiness }));
}

function bindInput() {
  els.pauseBtn.addEventListener("click", () => {
    if (state.gameOver.active) return;
    state.paused = !state.paused;
    els.pauseBtn.textContent = state.paused ? "Resume" : "Pause";
  });
  els.focusBtn?.addEventListener("click", () => {
    state.ui.focusMode = !state.ui.focusMode;
    document.body.classList.toggle("focus-mode", state.ui.focusMode);
    els.focusBtn.textContent = state.ui.focusMode ? "Focus: On" : "Focus: Off";
  });
  document.querySelectorAll(".collapse-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      if (!targetId) return;
      const card = document.getElementById(targetId);
      if (!card) return;
      card.classList.toggle("collapsed");
      btn.textContent = card.classList.contains("collapsed") ? "Expand" : "Minimize";
    });
  });
  document.querySelectorAll(".side-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      if (!tab) return;
      document.querySelectorAll(".side-tab").forEach((x) => x.classList.toggle("is-active", x === btn));
      document.querySelectorAll(".tab-pane").forEach((pane) => {
        pane.classList.toggle("is-active", pane.getAttribute("data-pane") === tab);
      });
    });
  });
  els.buildQueue?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.getAttribute("data-placement-toggle")) {
      if (state.ui.placementBuildingId) {
        state.ui.placementBuildingId = null;
        state.ui.placementRecommendations = [];
      } else {
        state.ui.placementBuildingId = state.buildings.find((b) => !b.placed)?.id || null;
        state.ui.placementRecommendations = computePlacementRecommendations(state.ui.placementBuildingId);
      }
      renderUI();
      return;
    }
    const id = target.getAttribute("data-place-id");
    if (!id) return;
    state.ui.placementBuildingId = id;
    state.ui.placementRecommendations = computePlacementRecommendations(id);
    addTicker(`Placement armed: ${findBuilding(id)?.name || id}.`);
    renderUI();
  });
  els.buildQueue?.addEventListener("dragstart", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const id = target.getAttribute("data-place-id");
    if (!id) return;
    e.dataTransfer?.setData("text/place-id", id);
    state.ui.placementBuildingId = id;
    state.ui.placementRecommendations = computePlacementRecommendations(id);
  });
  els.initiativeGrid?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const id = target.getAttribute("data-initiative-id");
    if (!id) return;
    applyInitiative(id);
    renderUI();
  });
  els.monthlyCloseBtn?.addEventListener("click", () => {
    closeMonthlyModal();
    renderUI();
  });
  els.monthlyModal?.addEventListener("click", (e) => {
    if (e.target !== els.monthlyModal) return;
    closeMonthlyModal();
    renderUI();
  });
  els.gameOverRestartBtn?.addEventListener("click", () => {
    window.location.reload();
  });

  els.applyBudgetBtn.addEventListener("click", () => {
    applyDepartmentBudget();
    renderUI();
  });

  els.upgradeBtn.addEventListener("click", () => {
    upgradeSelected();
    renderUI();
  });
  els.budgetSlider.addEventListener("input", () => {
    const b = findBuilding(state.selectedBuildingId);
    if (b) state.ui.budgetDraftByBuilding[b.id] = Number(els.budgetSlider.value);
    applyBudgetAvailabilityState();
    renderSelection();
  });

  els.rapidBtnA.addEventListener("click", () => {
    resolveRapid("a", false);
    renderUI();
  });

  els.rapidBtnB.addEventListener("click", () => {
    resolveRapid("b", false);
    renderUI();
  });
  els.majorEventRespondBtn?.addEventListener("click", () => {
    const ev = majorEventCardTarget();
    if (!ev) return;
    resolveMajorEvent(ev.id);
    renderUI();
  });
  els.majorEventDismissBtn?.addEventListener("click", () => {
    const ev = majorEventCardTarget();
    if (!ev) return;
    deferMajorEventCard(ev.id);
    renderUI();
  });

  canvas.addEventListener("mousedown", (e) => {
    state.camera.dragging = true;
    state.camera.lastX = e.clientX;
    state.camera.lastY = e.clientY;
    state.camera.targetX = null;
    state.camera.targetY = null;
    state.camera.vx = 0;
    state.camera.vy = 0;
  });

  window.addEventListener("mouseup", () => { state.camera.dragging = false; });

  window.addEventListener("mousemove", (e) => {
    if (!state.camera.dragging) return;
    const dx = e.clientX - state.camera.lastX;
    const dy = e.clientY - state.camera.lastY;
    state.camera.x += dx;
    state.camera.y += dy;
    state.camera.vx = dx;
    state.camera.vy = dy;
    state.camera.lastX = e.clientX;
    state.camera.lastY = e.clientY;
    clampCamera();
  });
  canvas.addEventListener("mousemove", (e) => {
    if (state.camera.dragging) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    state.ui.hoverTile = screenToTile(sx, sy);
    const building = pickBuildingAt(sx, sy);
    state.ui.hoveredBuildingId = building?.id || null;
    if (state.ui.placementBuildingId) canvas.style.cursor = isTileBuildable(state.ui.hoverTile[0], state.ui.hoverTile[1]) ? "copy" : "not-allowed";
    else canvas.style.cursor = building ? "pointer" : "grab";
  });
  canvas.addEventListener("mouseleave", () => {
    canvas.style.cursor = "grab";
    state.ui.hoveredBuildingId = null;
    state.ui.hoverTile = null;
  });
  canvas.addEventListener("dragover", (e) => {
    if (!state.ui.placementBuildingId) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    state.ui.hoverTile = screenToTile(e.clientX - rect.left, e.clientY - rect.top);
  });
  canvas.addEventListener("drop", (e) => {
    e.preventDefault();
    const pid = e.dataTransfer?.getData("text/place-id");
    if (pid) {
      state.ui.placementBuildingId = pid;
      state.ui.placementRecommendations = computePlacementRecommendations(pid);
    }
    if (!state.ui.placementBuildingId) return;
    const rect = canvas.getBoundingClientRect();
    const t = screenToTile(e.clientX - rect.left, e.clientY - rect.top);
    if (placeBuilding(state.ui.placementBuildingId, t)) renderUI();
  });

  canvas.addEventListener("click", (e) => {
    if (state.gameOver.active) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    state.ui.ripples.push({ x: sx, y: sy, ttl: 0.45 });

    if (state.ui.placementBuildingId) {
      const t = screenToTile(sx, sy);
      if (placeBuilding(state.ui.placementBuildingId, t)) {
        renderUI();
      } else {
        addTicker("Cannot place here. Choose an empty non-road tile.");
      }
      return;
    }

    const major = pickMajorEventAt(sx, sy);
    if (major) {
      state.ui.focusedMajorEventId = major.id;
      focusCameraOnTile(major.tile);
      addTicker(`MAJOR INCIDENT selected: ${major.title}.`);
      renderUI();
      return;
    }

    const incident = pickIncidentAt(sx, sy);
    if (incident) {
      emergencyTapIncident(incident);
      renderUI();
      return;
    }

    if (state.rapid.active) {
      const p = isoToScreen(state.rapid.active.mapMarkerTile[0], state.rapid.active.mapMarkerTile[1]);
      const d = Math.hypot(sx - p.x, sy - (p.y - 50 * state.camera.zoom));
      if (d < 16 * state.camera.zoom) {
        addTicker(`${state.rapid.active.incidentCode}: focus marker selected.`);
        focusCameraOnTile(state.rapid.active.mapMarkerTile);
        return;
      }
    }

    const picked = pickBuildingAt(sx, sy);
    if (picked) {
      state.selectedBuildingId = picked.id;
      if (!Number.isFinite(state.ui.budgetDraftByBuilding[picked.id])) {
        state.ui.budgetDraftByBuilding[picked.id] = picked.budget;
      }
      markOnboarding("selectedBuilding");
      focusCameraOnTile(picked.tile);
      renderUI();
    }
  });

  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      state.camera.zoom = clamp(state.camera.zoom + (e.deltaY < 0 ? 0.06 : -0.06), 0.62, 1.45);
      clampCamera();
      if (state.selectedBuildingId) {
        const b = findBuilding(state.selectedBuildingId);
        if (b) focusCameraOnTile(b.tile);
      }
    },
    { passive: false }
  );

  window.addEventListener("resize", () => { resizeCanvas(); });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.monthly.modalOpen) {
      closeMonthlyModal();
      renderUI();
    }
  });
}

function animationLoop(ts) {
  const dt = Math.min(0.05, (ts - state.visual.lastFrameTs) / 1000);
  state.visual.lastFrameTs = ts;
  updateCamera(dt);
  updateUiFx(dt);
  updateVisual(dt);
  drawMap();
  renderApFeedback();
  requestAnimationFrame(animationLoop);
}

function buildSparkline(values) {
  if (!values || values.length < 2) return `<svg class="spark" viewBox="0 0 120 24" aria-hidden="true"></svg>`;
  const arr = values.slice(-20);
  let min = Infinity;
  let max = -Infinity;
  for (const v of arr) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const span = Math.max(1, max - min);
  const pts = arr.map((v, i) => {
    const x = (i / (arr.length - 1)) * 120;
    const y = 22 - ((v - min) / span) * 18;
    return `${round(x)},${round(y)}`;
  });
  return `<svg class="spark" viewBox="0 0 120 24" aria-hidden="true"><polyline points="${pts.join(" ")}"></polyline></svg>`;
}

async function bootstrap() {
  const baseline = await loadBaseline();
  initFromBaseline(baseline);
  try {
    await loadAssetPack();
    addTicker("Cozy art pack loaded.");
  } catch {
    addTicker("Asset pack unavailable; using fallback visuals.");
  }
  initTrafficVehicles();
  initCivilians(220);
  initResponders();
  initDecorProps();
  recalcBuildingStates();
  refreshAdvisorBrief();
  bindInput();
  resizeCanvas();
  renderUI();

  addTicker("Living city active: civilians commute, incidents spawn, responders dispatch in realtime.");
  addRailEvent("Tip", "Tap flashing incidents on-map to fund emergency response.", true);

  setInterval(() => {
    if (state.paused) return;
    applySimTick();
    renderUI();
  }, TICK_MS);

  requestAnimationFrame(animationLoop);
}

bootstrap();
