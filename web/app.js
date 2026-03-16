const TICK_MS = 1000;
const DAYS_PER_YEAR = 365;
const TILE_W = 64;
const TILE_H = 32;
const MAP_W = 40;
const MAP_H = 40;
const ASSET_BASE = "./assets/cozy-pack";
const AP_REGEN_DAYS = 4;
const RAPID_INTERVAL_DAYS = 24;
const RAPID_WINDOW_DAYS = 28;
const MONTHLY_REPORT_DAYS = 120;
const MAJOR_EVENT_INTERVAL_DAYS = 18;
const MAX_ACTIVE_MAJOR_EVENTS = 2;
const ELECTION_INTERVAL_DAYS = 540;
const CAMPAIGN_LEAD_DAYS = 90;
const ELECTION_DEBATE_MARKS = [60, 30, 10];
const ELECTION_FINAL_SPRINT_DAYS = 7;
const CITY_CORE_TILE = [12, 12];
const AUDIO_BASE = "./assets/audio";
const DEPARTMENT_ART_BASE = "./assets/departments";
const TERRAIN_TILE_BASE = "./assets/terrain";
const TERRAIN_TILE_VARIANTS = {
  undeveloped: ["tile_006", "tile_009"],
  frontier: ["tile_006", "tile_009"],
  grass: ["tile_040"],
  lush: ["tile_040"],
  park: ["tile_040"],
  road: ["tile_063"],
  plaza: ["tile_115"],
  sidewalk: ["tile_115"],
  water: ["tile_104"],
  flowers: ["tile_033"],
};
const AUDIO_LIBRARY = {
  music: {
    bgm: `${AUDIO_BASE}/music/bgm_deep_waters.wav`,
  },
  sfx: {
    uiSelect: [`${AUDIO_BASE}/sfx/ui_select.wav`],
    uiConfirm: [`${AUDIO_BASE}/sfx/ui_confirm.wav`],
    uiDenied: [`${AUDIO_BASE}/sfx/ui_denied.wav`],
    uiPositive: [`${AUDIO_BASE}/sfx/ui_positive.wav`],
    uiNegative: [`${AUDIO_BASE}/sfx/ui_negative.wav`],
    econMoney: [`${AUDIO_BASE}/sfx/econ_money.wav`],
    econTax: [`${AUDIO_BASE}/sfx/econ_tax.wav`],
    econUp: [`${AUDIO_BASE}/sfx/econ_turn_up.wav`],
    econDown: [`${AUDIO_BASE}/sfx/econ_turn_down.wav`],
    placeBasic: [`${AUDIO_BASE}/sfx/build_place_basic.wav`],
    buildLow: [`${AUDIO_BASE}/sfx/build_complete_low.wav`],
    buildMid: [`${AUDIO_BASE}/sfx/build_complete_mid.wav`],
    buildHigh: [`${AUDIO_BASE}/sfx/build_complete_high.wav`],
    upgrade: [`${AUDIO_BASE}/sfx/build_upgrade.wav`],
    sell: [`${AUDIO_BASE}/sfx/build_sell.wav`],
    warnMajor: [`${AUDIO_BASE}/sfx/warn_major.wav`],
    warnDisaster: [`${AUDIO_BASE}/sfx/warn_disaster.wav`],
    ambBirds: [`${AUDIO_BASE}/sfx/amb_birds.wav`],
    ambTraffic: [`${AUDIO_BASE}/sfx/amb_traffic_beep.wav`],
  },
};

const ELECTION_OPPOSITION = [
  {
    name: "Rhea Harlow",
    bloc: "Civic Conservative Front",
    style: "cost-of-living pressure attack",
    baseSwing: -0.9,
    demBias: { poverty: -0.6, working: -0.2, middle: 0.1, business: 0.8, elite: 0.9 },
  },
  {
    name: "Milo Ventor",
    bloc: "Liberty Growth Coalition",
    style: "anti-regulation growth narrative",
    baseSwing: -0.3,
    demBias: { poverty: -0.3, working: 0.1, middle: 0.2, business: 1.0, elite: 0.8 },
  },
  {
    name: "Priya Calder",
    bloc: "Community Futures Bloc",
    style: "public-services and fairness critique",
    baseSwing: 0.2,
    demBias: { poverty: 0.8, working: 0.5, middle: 0.2, business: -0.4, elite: -0.5 },
  },
  {
    name: "Dax Rowe",
    bloc: "National Order Alliance",
    style: "law-and-order fear campaign",
    baseSwing: -0.5,
    demBias: { poverty: -0.2, working: -0.1, middle: 0.5, business: 0.7, elite: 0.6 },
  },
  {
    name: "Sonia Vale",
    bloc: "Green Civic Network",
    style: "climate accountability push",
    baseSwing: 0.1,
    demBias: { poverty: 0.5, working: 0.2, middle: 0.4, business: -0.5, elite: -0.3 },
  },
  {
    name: "Grant Aster",
    bloc: "Centrist Reform Movement",
    style: "competence and delivery audit",
    baseSwing: -0.1,
    demBias: { poverty: 0.1, working: 0.2, middle: 0.3, business: 0.1, elite: 0.1 },
  },
];

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

const FOUNDATION_DEFS = [
  { id: "power", label: "Grid Reliability", emoji: "⚡", help: "Climate + Transport + Treasury coordination keeps power dependable." },
  { id: "freight", label: "Freight Capacity", emoji: "🚛", help: "Transport throughput and treasury discipline keep goods moving." },
  { id: "skills", label: "Workforce Skills", emoji: "👷", help: "Education quality and welfare stability provide trained workers." },
  { id: "water", label: "Water Security", emoji: "💧", help: "Climate resilience and transport maintenance reduce supply disruption." },
  { id: "trust", label: "Policy Certainty", emoji: "🧭", help: "Integrity and stability influence investor confidence and long-term planning." },
];

const INDUSTRY_PROJECT_DEFS = [
  {
    id: "food_hub",
    name: "Food Processing Hub",
    desc: "Mid-scale food processing for local supply and exports.",
    size: 2,
    tier: 0,
    cost: 26,
    buildDays: 10,
    baseRevenue: 10.5,
    baseUpkeep: 4.2,
    jobs: 0.35,
    art: "prop_market",
    impact: { climate: -0.18, stability: 0.22, economy: 0.45 },
    needs: { power: 42, freight: 46, skills: 40, water: 52, trust: 36 },
  },
  {
    id: "assembly_plant",
    name: "Assembly Plant",
    desc: "Large manufacturing plant. Strong upside, high dependency pressure.",
    size: 3,
    tier: 1,
    cost: 72,
    buildDays: 16,
    baseRevenue: 27,
    baseUpkeep: 12.5,
    jobs: 0.6,
    art: "prop_shop_corner",
    impact: { climate: -0.4, stability: 0.28, economy: 0.95 },
    needs: { power: 60, freight: 62, skills: 58, water: 44, trust: 48 },
  },
  {
    id: "tech_park",
    name: "Tech Services Campus",
    desc: "High-value services district with lower climate load.",
    size: 3,
    tier: 1,
    cost: 84,
    buildDays: 18,
    baseRevenue: 31,
    baseUpkeep: 13.2,
    jobs: 0.68,
    art: "prop_apartment",
    impact: { climate: 0.08, stability: 0.34, economy: 1.05 },
    needs: { power: 56, freight: 42, skills: 68, water: 32, trust: 58 },
  },
  {
    id: "battery_complex",
    name: "Battery Gigafactory",
    desc: "Mega-project with high risk/reward and heavy land demand.",
    size: 4,
    tier: 2,
    cost: 148,
    buildDays: 24,
    baseRevenue: 56,
    baseUpkeep: 25,
    jobs: 1.1,
    art: "prop_skyscraper",
    impact: { climate: -0.2, stability: 0.44, economy: 1.6 },
    needs: { power: 72, freight: 74, skills: 70, water: 58, trust: 62 },
  },
];

const DEFENSE_BASE_DEFS = [
  {
    id: "cyber",
    name: "Cyber Defense Grid",
    desc: "Protects power, banking, and hospitals from coordinated digital attacks.",
    size: 3,
    tier: 1,
    cost: 64,
    buildDays: 16,
    baseUpkeep: 3.4,
    anchorKpi: "integrity",
    buildingArtPrefix: "defense_cyber_lvl",
    tileArtPrefix: "defense_plot_cyber_",
  },
  {
    id: "air",
    name: "Air Defense Wing",
    desc: "Tracks and intercepts incursions near strategic airspace corridors.",
    size: 4,
    tier: 1,
    cost: 88,
    buildDays: 20,
    baseUpkeep: 4.9,
    anchorKpi: "safety",
    buildingArtPrefix: "defense_air_lvl",
    tileArtPrefix: "defense_plot_air_",
  },
  {
    id: "garrison",
    name: "Critical Infrastructure Guard",
    desc: "Ground response units that deter sabotage against freight and utilities.",
    size: 3,
    tier: 0,
    cost: 58,
    buildDays: 14,
    baseUpkeep: 3.1,
    anchorKpi: "economy",
    buildingArtPrefix: "defense_garrison_lvl",
    tileArtPrefix: "defense_plot_garrison_",
  },
];

const INCIDENT_TYPES = [
  { id: "crime", title: "Street Crime Spike", kpi: "safety", perDayPenalty: 0.55, responder: "police", color: "#cc5b5b", icon: "!" },
  { id: "medical", title: "Medical Overflow", kpi: "health", perDayPenalty: 0.6, responder: "ambulance", color: "#d46a6a", icon: "+" },
  { id: "fire", title: "Substation Fire", kpi: "economy", perDayPenalty: 0.5, responder: "utility", color: "#d47f38", icon: "*" },
  { id: "flood", title: "Flash Flooding", kpi: "climate", perDayPenalty: 0.52, responder: "utility", color: "#4f91d8", icon: "~" },
  { id: "corruption", title: "Procurement Leak", kpi: "integrity", perDayPenalty: 0.58, responder: "audit", color: "#9c6bc7", icon: "?" },
  { id: "cyber_grid_attack", title: "Grid Cyber Assault", kpi: "integrity", perDayPenalty: 0.68, responder: "audit", color: "#6f8ef3", icon: "⌁" },
  { id: "airspace_incursion", title: "Airspace Incursion", kpi: "safety", perDayPenalty: 0.66, responder: "police", color: "#f0a95d", icon: "▲" },
  { id: "infra_sabotage", title: "Infrastructure Sabotage", kpi: "economy", perDayPenalty: 0.7, responder: "utility", color: "#e86767", icon: "✖" },
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
  { id: "resolve", label: "Resolve 2 incidents in 14 days", target: 2, days: 14, rewardAP: 2, rewardCash: 10 },
  { id: "actions", label: "Take 4 actions in 12 days", target: 4, days: 12, rewardAP: 2, rewardCash: 8 },
  { id: "stability", label: "Keep stability above 66 for 6 days", target: 6, days: 10, rewardAP: 1, rewardCash: 12 },
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
const DEMOGRAPHIC_SHORT = Object.fromEntries(
  DEMOGRAPHICS.map((d) => [d.id, d.label.split(" ")[0]])
);

const INITIATIVE_ICONS = {
  rent_relief: "🏠",
  skills_grants: "🎓",
  small_business: "💼",
  integrity_blitz: "🕵️",
  green_retrofit: "🌿",
  corp_tax_holiday: "🏦",
  community_safety: "🛡️",
  flood_shield: "🌊",
  transit_relief: "🚌",
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

const IDENTITY_AXIS_KEYS = ["careAusterity", "libertyControl", "publicDonor", "truthSpin"];
const TUTORIAL_STEPS = [
  {
    id: "founding",
    short: "Place core departments",
    title: "Founding: Build Your Core Government",
    body: "Start with Health, Treasury, and Transport. Then place the remaining departments before launch.",
    tab: null,
  },
  {
    id: "budget",
    short: "Tune one budget",
    title: "Step 1: Tune One Department Budget",
    body: "Click a department, set a budget target, then apply it. The radar shows your city balance: weak spokes mark the systems you need to pull back toward center.",
    tab: null,
  },
  {
    id: "upgrade",
    short: "Upgrade one facility",
    title: "Step 2: Upgrade a Facility",
    body: "Upgrade one department to raise service capacity. Use the radar as your balance board: your buildings and interventions are what move those category lines.",
    tab: null,
  },
  {
    id: "industry",
    short: "Build first industry",
    title: "Step 3: Start Your First Industry",
    body: "Arm a recommended project, then click a glowing green block on the map to start earning future revenue.",
    tab: null,
  },
  {
    id: "incident",
    short: "Resolve one incident",
    title: "Step 4: Handle Your First Incident",
    body: "A manual incident is now live. Click the alert badge on the building, then stop the response meter in the green zone.",
    tab: "incidents",
  },
  {
    id: "rapid",
    short: "Resolve one rapid brief",
    title: "Step 5: Make an Evidence Call",
    body: "Read clues, choose a response, and see how trust and demographics react.",
    tab: "incidents",
  },
  {
    id: "freeplay",
    short: "Full simulation unlocked",
    title: "Freeplay Unlocked",
    body: "All systems are now live: random incidents, major events, and full policy pressure.",
    tab: null,
  },
];
const TUTORIAL_STEP_INDEX = Object.fromEntries(TUTORIAL_STEPS.map((s, i) => [s.id, i]));
const FOUNDING_STARTER_IDS = ["health", "treasury", "transport"];

function emptyDemImpact() {
  return { poverty: 0, working: 0, middle: 0, business: 0, elite: 0 };
}

function emptyAxisImpact() {
  return { careAusterity: 0, libertyControl: 0, publicDonor: 0, truthSpin: 0 };
}

function pickOppositionCandidate(previousName = "") {
  const pool = ELECTION_OPPOSITION.filter((c) => c.name !== previousName);
  const source = pool.length ? pool : ELECTION_OPPOSITION;
  const picked = source[Math.floor(Math.random() * source.length)] || ELECTION_OPPOSITION[0];
  return {
    ...picked,
    demBias: { ...(picked.demBias || {}) },
  };
}

const state = {
  day: 0,
  year: 2026,
  paused: false,
  tierIndex: 0,
  selectedBuildingId: null,
  selectedIndustryId: null,
  selectedDefenseId: null,
  buildings: BUILDING_DEFS.map((b) => ({ ...b, homeTile: [...b.tile], tile: null, placed: false, level: 1, budget: 60, state: "unbuilt" })),
  kpi: { stability: 70, health: 70, education: 70, safety: 70, climate: 66, integrity: 64, economy: 70 },
  services: null,
  budget: { revenue: 100, expenditure: 103, deficit: -3, debt: 72, treasury: 48 },
  netHistory: [],
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
  rapid: { active: null, momentum: 0, nextAtDay: 6 },
  resources: { actionPoints: 3, maxActionPoints: 4, streak: 0, bestStreak: 0 },
  onboarding: {
    selectedBuilding: false,
    budgetApplied: false,
    upgradedOrDispatched: false,
    rapidResolved: false,
    rewarded: false,
    initiativesPrompted: false,
  },
  tutorial: {
    enabled: true,
    completed: false,
    phase: "founding",
    enteredDay: 0,
    firstIncidentSpawned: false,
    firstRapidSpawned: false,
    manualIncidentId: null,
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
  election: {
    term: 1,
    nextElectionDay: ELECTION_INTERVAL_DAYS,
    campaignLeadDays: CAMPAIGN_LEAD_DAYS,
    campaignActive: false,
    campaignStartDay: null,
    momentum: 0,
    debateTriggered: Object.fromEntries(ELECTION_DEBATE_MARKS.map((d) => [d, false])),
    finalSprintLastDay: 0,
    debateUsedIds: [],
    currentOpponent: null,
    report: null,
    modalOpen: false,
  },
  decisionLog: [],
  ideology: { careAusterity: 0, libertyControl: 0, publicDonor: 0, truthSpin: 0, trust: 62 },
  truth: { wins: 0, misses: 0, neutral: 0, total: 0, score: 50, streak: 0, bestStreak: 0, played: 0, speakerReads: {} },
  ops: { heat: { health: 0.2, education: 0.2, safety: 0.2, climate: 0.25, integrity: 0.25, economy: 0.2 } },
  content: { scenarioLibrary: [], truthChecks: [] },
  majorEvents: [],
  major: {
    nextAtDay: 14,
    recentIds: [],
  },
  people: DEMOGRAPHICS.map((d) => ({ id: d.id, label: d.label, happiness: 65, trend: 0, note: "Watching policy signals." })),
  gameOver: { active: false, reason: "", facts: [] },
  sim: {
    started: false,
  },
  housing: {
    active: null,
    zones: [],
    nextAtDay: 16,
  },
  industry: {
    zones: [],
    foundations: { power: 40, freight: 40, skills: 40, water: 40, trust: 40 },
    metrics: { revenue: 0, upkeep: 0, net: 0, utilization: 0, missing: [] },
    selectedProjectId: null,
  },
  defense: {
    bases: [],
    selectedBaseTypeId: null,
    metrics: { upkeep: 0, readiness: 42, netRisk: 0.55 },
  },
  growth: {
    radius: 10.5,
    maxRadius: 18.5,
    lastExpandDay: 0,
    score: 60,
  },
  districts: [
    { id: "NW", label: "Northwest", stress: 0 },
    { id: "NE", label: "Northeast", stress: 0 },
    { id: "SW", label: "Southwest", stress: 0 },
    { id: "SE", label: "Southeast", stress: 0 },
  ],
  visual: {
    hour: 7,
    vehicles: [],
    traffic: null,
    civilians: [],
    responders: [],
    decorProps: [],
    clouds: [
      { x: 120, y: 90, speed: 16, size: 62 },
      { x: 520, y: 130, speed: 11, size: 78 },
      { x: 940, y: 72, speed: 14, size: 58 },
    ],
    lastFrameTs: performance.now(),
    haze: 0,
  },
  camera: { x: 0, y: -80, zoom: 1, dragging: false, lastX: 0, lastY: 0, vx: 0, vy: 0, targetX: null, targetY: null, viewW: 1280, viewH: 760 },
  audio: {
    enabled: true,
    unlocked: false,
    bgmStarted: false,
    bgmVolume: 0.34,
    sfxVolume: 0.72,
    bgm: null,
    lastPlayed: {},
  },
  ui: {
    focusMode: false,
    hoveredBuildingId: null,
    hoverTile: null,
    placementBuildingId: null,
    ripples: [],
    apToasts: [],
    decisionToasts: [],
    pausedByModal: false,
    placementRecommendations: [],
    budgetDraftByBuilding: {},
    autoBudgetByBuilding: {},
    focusedMajorEventId: null,
    housingPlacement: null,
    industryPlacement: null,
    defensePlacement: null,
    quickBuildCollapsed: false,
    quickBuildHover: null,
    toolboxSpotlightUntilMs: 0,
    foundingFirstPickDone: false,
    mapRevealUntilMs: 0,
    mapSpotlightUntilMs: 0,
    introBriefingOpen: true,
    lastSeenIncidentAlertId: null,
    initiativeGuideActive: false,
    initiativeGuideUntilDay: 0,
    buildingButtons: [],
    activeSkillCheck: null,
    skillBursts: [],
    deferredMonthlyReport: null,
    deferredElectionReport: null,
    mapHudCollapsed: false,
    mapHudInfoOpen: false,
    mapHudOpen: false,
    audioPanelOpen: false,
    mouse: {
      down: false,
      startX: 0,
      startY: 0,
      moved: false,
      suppressClickUntil: 0,
    },
    touch: {
      mode: null,
      tapStartX: 0,
      tapStartY: 0,
      tapMoved: false,
      tapStartAt: 0,
      pinchStartDistance: 0,
      pinchStartZoom: 1,
      suppressClickUntil: 0,
    },
  },
};

const canvas = document.getElementById("isoCanvas");
const ctx = canvas.getContext("2d");

const els = {
  mapPanel: document.querySelector(".map-panel"),
  tierLabel: document.getElementById("tierLabel"),
  dayLabel: document.getElementById("dayLabel"),
  stabilityLabel: document.getElementById("stabilityLabel"),
  stabilityPill: document.getElementById("stabilityPill"),
  stabilityTrend: document.getElementById("stabilityTrend"),
  treasuryLabel: document.getElementById("treasuryLabel"),
  dailyNetLabel: document.getElementById("dailyNetLabel"),
  actionPoints: document.getElementById("actionPoints"),
  pauseBtn: document.getElementById("pauseBtn"),
  refreshBtn: document.getElementById("refreshBtn"),
  audioSettingsBtn: document.getElementById("audioSettingsBtn"),
  audioPanel: document.getElementById("audioPanel"),
  audioPanelCloseBtn: document.getElementById("audioPanelCloseBtn"),
  bgmVolumeSlider: document.getElementById("bgmVolumeSlider"),
  sfxVolumeSlider: document.getElementById("sfxVolumeSlider"),
  statusBanner: document.getElementById("statusBanner"),
  mapTip: document.getElementById("mapTip"),
  selectedName: document.getElementById("selectedName"),
  selectedMeta: document.getElementById("selectedMeta"),
  selectedDesc: document.getElementById("selectedDesc"),
  selectedLevel: document.getElementById("selectedLevel"),
  selectedBudget: document.getElementById("selectedBudget"),
  selectedStatus: document.getElementById("selectedStatus"),
  selectedCost: document.getElementById("selectedCost"),
  budgetCurrent: document.getElementById("budgetCurrent"),
  budgetTarget: document.getElementById("budgetTarget"),
  budgetDelta: document.getElementById("budgetDelta"),
  budgetImpact: document.getElementById("budgetImpact"),
  budgetGauge: document.getElementById("budgetGauge"),
  budgetRequiredMarker: document.getElementById("budgetRequiredMarker"),
  budgetZoneLabel: document.getElementById("budgetZoneLabel"),
  budgetNeedLabel: document.getElementById("budgetNeedLabel"),
  budgetSlider: document.getElementById("budgetSlider"),
  autoBudgetBtn: document.getElementById("autoBudgetBtn"),
  applyBudgetBtn: document.getElementById("applyBudgetBtn"),
  upgradeBtn: document.getElementById("upgradeBtn"),
  sellBtn: document.getElementById("sellBtn"),
  mapSelectionHud: document.getElementById("mapSelectionHud"),
  mapSelectionBody: document.getElementById("mapSelectionBody"),
  mapHudToggleBtn: document.getElementById("mapHudToggleBtn"),
  mapHudInfoBtn: document.getElementById("mapHudInfoBtn"),
  selectedDescWrap: document.getElementById("selectedDescWrap"),
  rapidTitle: document.getElementById("rapidTitle"),
  rapidWhat: document.getElementById("rapidWhat"),
  rapidWho: document.getElementById("rapidWho"),
  rapidBody: document.getElementById("rapidBody"),
  rapidEvidence: document.getElementById("rapidEvidence"),
  rapidTimer: document.getElementById("rapidTimer"),
  rapidMomentum: document.getElementById("rapidMomentum"),
  rapidBtnA: document.getElementById("rapidBtnA"),
  rapidBtnB: document.getElementById("rapidBtnB"),
  rapidBtnC: document.getElementById("rapidBtnC"),
  rapidCard: document.querySelector(".rapid-card"),
  kpiGrid: document.getElementById("kpiGrid"),
  buildQueue: document.getElementById("buildQueue"),
  advisorBrief: document.getElementById("advisorBrief"),
  apFeedback: document.getElementById("apFeedback"),
  tabControlAlert: document.getElementById("tabControlAlert"),
  tabIncidentsAlert: document.getElementById("tabIncidentsAlert"),
  tabPeopleAlert: document.getElementById("tabPeopleAlert"),
  peopleGrid: document.getElementById("peopleGrid"),
  initiativeGrid: document.getElementById("initiativeGrid"),
  initiativesCard: document.getElementById("initiativesCard"),
  initiativeHubCard: document.getElementById("initiativeHubCard"),
  initiativeHubHint: document.getElementById("initiativeHubHint"),
  initiativeQuickGrid: document.getElementById("initiativeQuickGrid"),
  initiativeOpenBtn: document.getElementById("initiativeOpenBtn"),
  monthlyModal: document.getElementById("monthlyModal"),
  monthlyHeadline: document.getElementById("monthlyHeadline"),
  monthlySubhead: document.getElementById("monthlySubhead"),
  monthlyLead: document.getElementById("monthlyLead"),
  monthlySummaryList: document.getElementById("monthlySummaryList"),
  monthlyBullets: document.getElementById("monthlyBullets"),
  monthlyQuotes: document.getElementById("monthlyQuotes"),
  monthlyDecisionList: document.getElementById("monthlyDecisionList"),
  monthlyCloseBtn: document.getElementById("monthlyCloseBtn"),
  electionModal: document.getElementById("electionModal"),
  electionHeadline: document.getElementById("electionHeadline"),
  electionSubhead: document.getElementById("electionSubhead"),
  electionLead: document.getElementById("electionLead"),
  electionPollBars: document.getElementById("electionPollBars"),
  electionFacts: document.getElementById("electionFacts"),
  electionCloseBtn: document.getElementById("electionCloseBtn"),
  electionCloseTopBtn: document.getElementById("electionCloseTopBtn"),
  gameOverModal: document.getElementById("gameOverModal"),
  gameOverHeadline: document.getElementById("gameOverHeadline"),
  gameOverReason: document.getElementById("gameOverReason"),
  gameOverFacts: document.getElementById("gameOverFacts"),
  gameOverRestartBtn: document.getElementById("gameOverRestartBtn"),
  tickerLine: document.getElementById("tickerLine"),
  eventRail: document.getElementById("eventRail"),
  dockPeople: document.getElementById("dockPeople"),
  dockRadarSvg: document.getElementById("dockRadarSvg"),
  dockHeatList: document.getElementById("dockHeatList"),
  decisionFlash: document.getElementById("decisionFlash"),
  majorEventCard: document.getElementById("majorEventCard"),
  majorEventTitle: document.getElementById("majorEventTitle"),
  majorEventSnapshot: document.getElementById("majorEventSnapshot"),
  majorEventBody: document.getElementById("majorEventBody"),
  majorEventHint: document.getElementById("majorEventHint"),
  majorEventTimer: document.getElementById("majorEventTimer"),
  majorEventImpact: document.getElementById("majorEventImpact"),
  majorEventRespondBtn: document.getElementById("majorEventRespondBtn"),
  majorEventDismissBtn: document.getElementById("majorEventDismissBtn"),
  housingCard: document.getElementById("housingCard"),
  housingTitle: document.getElementById("housingTitle"),
  housingBody: document.getElementById("housingBody"),
  housingTimer: document.getElementById("housingTimer"),
  housingImpact: document.getElementById("housingImpact"),
  housingBtnSmall: document.getElementById("housingBtnSmall"),
  housingBtnMedium: document.getElementById("housingBtnMedium"),
  housingBtnLarge: document.getElementById("housingBtnLarge"),
  housingBtnDefer: document.getElementById("housingBtnDefer"),
  quickBuildToolbox: document.getElementById("quickBuildToolbox"),
  quickBuildToggleBtn: document.getElementById("quickBuildToggleBtn"),
  quickBuildBody: document.getElementById("quickBuildBody"),
  quickPrimarySection: document.getElementById("quickPrimarySection"),
  quickSecondarySection: document.getElementById("quickSecondarySection"),
  quickPrimaryTitle: document.getElementById("quickPrimaryTitle"),
  quickSecondaryTitle: document.getElementById("quickSecondaryTitle"),
  quickIndustryGrid: document.getElementById("quickIndustryGrid"),
  quickDefenseGrid: document.getElementById("quickDefenseGrid"),
  setupOverlay: document.getElementById("setupOverlay"),
  setupTitle: document.getElementById("setupTitle"),
  setupBody: document.getElementById("setupBody"),
  startPlacementBtn: document.getElementById("startPlacementBtn"),
  launchGovBtn: document.getElementById("launchGovBtn"),
  tutorialOverlay: document.getElementById("tutorialOverlay"),
  tutorialKicker: document.getElementById("tutorialKicker"),
  tutorialTitle: document.getElementById("tutorialTitle"),
  tutorialBody: document.getElementById("tutorialBody"),
  tutorialProgress: document.getElementById("tutorialProgress"),
  tutorialFocusBtn: document.getElementById("tutorialFocusBtn"),
  tutorialSkipBtn: document.getElementById("tutorialSkipBtn"),
  industrySummary: document.getElementById("industrySummary"),
  industryGuide: document.getElementById("industryGuide"),
  foundationGrid: document.getElementById("foundationGrid"),
  industryProjects: document.getElementById("industryProjects"),
  defenseSummary: document.getElementById("defenseSummary"),
  defenseProjects: document.getElementById("defenseProjects"),
  actionDock: document.getElementById("actionDock"),
  nowStrip: document.getElementById("nowStrip"),
  nowStripText: document.getElementById("nowStripText"),
  nowStripGo: document.getElementById("nowStripGo"),
  tabBar: document.querySelector(".tab-bar"),
  livePulseDock: document.querySelector(".news-strip.compact-dock"),
  gameLayout: document.querySelector(".game-layout"),
  sidePanel: document.querySelector(".side-panel"),
  introBriefingModal: document.getElementById("introBriefingModal"),
  introBriefingStartBtn: document.getElementById("introBriefingStartBtn"),
};

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function round(v) { return Math.round(v * 100) / 100; }
function rand(min, max) { return min + Math.random() * (max - min); }
function tileDist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
function formatMoneyMillions(v) {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) {
    const t = abs / 1_000_000;
    const mag = t >= 10 ? Math.round(t) : round(t);
    return `$${mag}t`;
  }
  if (abs >= 1_000) {
    const b = abs / 1_000;
    const mag = b >= 10 ? Math.round(b) : round(b);
    return `$${mag}b`;
  }
  return `$${Math.round(abs)}m`;
}
function escapeHtml(v) {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function formatSignedMoneyMillions(v) {
  const n = round(v);
  if (Math.abs(n) < 0.01) return "~$0m";
  const sign = n > 0 ? "+" : "-";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    const t = abs / 1_000_000;
    const mag = t >= 10 ? Math.round(t) : round(t);
    return `${sign}$${mag}t`;
  }
  if (abs >= 1_000) {
    const b = abs / 1_000;
    const mag = b >= 10 ? Math.round(b) : round(b);
    return `${sign}$${mag}b`;
  }
  const mag = abs >= 10 ? String(Math.round(abs)) : abs.toFixed(2).replace(/\.?0+$/, "");
  return `${sign}$${mag}m`;
}
function formatSignedNumber(v) {
  const n = round(v);
  if (Math.abs(n) < 0.01) return "0";
  return `${n > 0 ? "+" : ""}${n}`;
}
function setText(el, value) { if (el) el.textContent = value; }
function shorten(text, max = 96) {
  const s = String(text || "").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trimEnd()}...`;
}
function compactChoiceLabel(text, maxWords = 3) {
  const s = String(text || "").replace(/[,:]/g, " ").replace(/\s+/g, " ").trim();
  if (!s) return "";
  const lower = s.toLowerCase();
  if (lower.includes("show receipts")) return "Show Receipts";
  if (lower.includes("deny everything") || lower.includes("deny claim")) return "Deny Claim";
  if (lower.includes("form committee")) return "Delay + Review";
  if (lower.includes("ask for proof")) return "Ask For Proof";
  if (lower.includes("call bluff")) return "Call Bluff";
  if (lower.includes("back it now")) return "Back It";
  return s.split(" ").slice(0, maxWords).join(" ");
}
function prettifyTag(tag) {
  return String(tag || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}
function setTabAlert(el, active = false, critical = false) {
  if (!el) return;
  el.hidden = !active;
  el.classList.toggle("critical", critical);
}
function pickAudioClip(key) {
  const clips = AUDIO_LIBRARY.sfx[key];
  if (!clips || clips.length === 0) return null;
  return clips[Math.floor(Math.random() * clips.length)];
}
function unlockAudio() {
  if (!state.audio.enabled) return;
  state.audio.unlocked = true;
  if (!state.audio.bgm) {
    const bgm = new Audio(AUDIO_LIBRARY.music.bgm);
    bgm.loop = true;
    bgm.preload = "auto";
    bgm.volume = state.audio.bgmVolume;
    state.audio.bgm = bgm;
  }
  ensureBgm(true);
}
function ensureBgm(forceAttempt = false) {
  if (!state.audio.enabled) return;
  if (!state.audio.unlocked && !forceAttempt) return;
  if (!state.audio.bgm) {
    const bgm = new Audio(AUDIO_LIBRARY.music.bgm);
    bgm.loop = true;
    bgm.preload = "auto";
    bgm.volume = state.audio.bgmVolume;
    state.audio.bgm = bgm;
  }
  if (!state.audio.bgmStarted || state.audio.bgm.paused) {
    state.audio.bgm.volume = state.audio.bgmVolume;
    state.audio.bgm.play().then(() => {
      state.audio.bgmStarted = true;
    }).catch(() => {});
  }
}
function playSfx(key, opts = {}) {
  if (!state.audio.enabled || !state.audio.unlocked) return;
  const clip = pickAudioClip(key);
  if (!clip) return;
  const throttleMs = opts.throttleMs ?? 120;
  const now = Date.now();
  const last = state.audio.lastPlayed[key] || 0;
  if (now - last < throttleMs) return;
  state.audio.lastPlayed[key] = now;
  const a = new Audio(clip);
  a.preload = "auto";
  a.volume = clamp((opts.volumeMul ?? 1) * state.audio.sfxVolume, 0, 1);
  a.play().catch(() => {});
}
function incidentSupportsDirectPlayerAction(inc) {
  if (!inc) return false;
  if (inc.tutorialManual) return true;
  const autoOnlyTypes = new Set(["cyber_grid_attack", "airspace_incursion", "infra_sabotage"]);
  return !autoOnlyTypes.has(inc.type?.id);
}
function manualActionIncidents() {
  return state.incidents.filter(
    (i) => i.requiresPlayerAction
      && incidentSupportsDirectPlayerAction(i)
      && !i.resolved
      && !i.contained
      && !i.assignedResponderId
  );
}

function incidentAnchorBuilding(inc) {
  if (!inc) return null;
  if (inc.anchorBuildingId) return findBuilding(inc.anchorBuildingId);
  const mapKeyToBuilding = {
    health: "health",
    education: "education",
    safety: "security",
    climate: "climate",
    integrity: "integrity",
    economy: "transport",
  };
  return findBuilding(mapKeyToBuilding[inc.type?.kpi] || "");
}

function actionableIncidentForBuilding(buildingId) {
  return actionableManualIncidents()
    .filter((inc) => incidentAnchorBuilding(inc)?.id === buildingId)
    .sort((a, b) => (b.severity || 0) - (a.severity || 0) || (a.daysOpen || 0) - (b.daysOpen || 0))[0] || null;
}

function buildingActionContext(building) {
  if (!building?.placed) return null;
  const inc = actionableIncidentForBuilding(building.id);
  if (inc) {
    return {
      type: "manualIncident",
      incidentId: inc.id,
      priority: inc.severity >= 3 ? "high" : "medium",
      label: "!",
      title: inc.type?.title || "Issue",
    };
  }
  return null;
}

function actionableManualIncidents() {
  return manualActionIncidents().filter((i) => canPlayerActOnIncidentNow(i));
}
function hasActionableRapidBrief() {
  const rapid = state.rapid.active;
  if (!rapid || rapid.expiresDay <= state.day) return false;
  if (Array.isArray(rapid.options)) return rapid.options.length > 0;
  return Boolean(rapid.optionA || rapid.optionB || rapid.optionC);
}
function currentActionableIncidentAlertId() {
  if (!hasActionableRapidBrief()) return null;
  const rapid = state.rapid.active;
  const id = rapid?.incidentCode || rapid?.id || `rapid-${state.day}`;
  return `rapid:${id}`;
}

function renderOnboardingLayout() {
  const phase = state.sim.started ? state.tutorial.phase : "founding";
  const dayPill = els.dayLabel?.closest(".pill");
  const treasuryPill = els.treasuryLabel?.closest(".pill");
  const dailyNetPill = els.dailyNetLabel?.closest(".pill");
  const actionPointsPill = els.actionPoints?.closest(".pill");
  const hudDividers = document.querySelectorAll(".hud-divider");
  const showLiteHud = state.ui.introBriefingOpen || !state.sim.started || tutorialIsActive();
  const mapOnlyMode = state.ui.introBriefingOpen || !state.sim.started || (tutorialIsActive() && phase === "industry");
  const layoutModeChanged = state.ui.lastMapOnlyMode !== mapOnlyMode;
  state.ui.lastMapOnlyMode = mapOnlyMode;

  document.querySelectorAll(".guided-focus").forEach((node) => node.classList.remove("guided-focus"));
  if (els.refreshBtn) els.refreshBtn.hidden = showLiteHud;
  if (els.pauseBtn) els.pauseBtn.hidden = state.ui.introBriefingOpen || !state.sim.started;
  if (dayPill) dayPill.hidden = false;
  if (treasuryPill) treasuryPill.hidden = false;
  if (dailyNetPill) dailyNetPill.hidden = showLiteHud;
  if (els.stabilityPill) els.stabilityPill.hidden = false;
  if (actionPointsPill) actionPointsPill.hidden = showLiteHud;
  hudDividers.forEach((divider) => {
    divider.hidden = showLiteHud;
  });
  if (els.gameLayout) els.gameLayout.classList.toggle("onboarding-map-only", mapOnlyMode);
  if (els.sidePanel) els.sidePanel.hidden = mapOnlyMode;
  if (els.statusBanner) els.statusBanner.hidden = state.ui.introBriefingOpen;
  if (layoutModeChanged) requestAnimationFrame(() => resizeCanvas());

  if (state.ui.introBriefingOpen) {
    if (els.tabBar) els.tabBar.hidden = true;
    if (els.livePulseDock) els.livePulseDock.hidden = true;
    if (els.mapTip) els.mapTip.hidden = true;
    return;
  }
  const allowedTabs = onboardingAllowedTabs();
  if (allowedTabs) {
    const activeTab = document.querySelector(".side-tab.is-active")?.getAttribute("data-tab");
    if (!activeTab || !allowedTabs.includes(activeTab)) {
      setActiveSideTab(allowedTabs[0]);
    }
  }
  document.querySelectorAll(".side-tab").forEach((btn) => {
    const tab = btn.getAttribute("data-tab");
    const locked = Boolean(allowedTabs && tab && !allowedTabs.includes(tab));
    btn.disabled = locked;
    btn.classList.toggle("is-locked", locked);
    btn.title = locked ? "Complete the current guided step to unlock this tab." : "";
  });

  const selectedCard = document.querySelector(".selected-card");
  const initiativeHubCard = els.initiativeHubCard || document.getElementById("initiativeHubCard");
  const industryCard = document.getElementById("industryCard");
  const defenseCard = document.getElementById("defenseCard");
  const peoplePane = document.querySelector('[data-pane="people"]');
  const showSidePanelEarly = tutorialIsActive() && (phase === "incident" || phase === "rapid");

  if (!tutorialIsActive()) {
    if (initiativeHubCard) initiativeHubCard.hidden = false;
    if (industryCard) industryCard.hidden = true;
    if (defenseCard) defenseCard.hidden = true;
    if (peoplePane) peoplePane.hidden = false;
    if (els.mapTip) els.mapTip.hidden = false;
    if (els.tabBar) els.tabBar.hidden = false;
    if (els.livePulseDock) els.livePulseDock.hidden = false;
    if (els.sidePanel) els.sidePanel.hidden = false;
    if (els.refreshBtn) els.refreshBtn.hidden = false;
    if (els.statusBanner) els.statusBanner.hidden = false;
    if (dailyNetPill) dailyNetPill.hidden = false;
    if (actionPointsPill) actionPointsPill.hidden = false;
    hudDividers.forEach((divider) => {
      divider.hidden = false;
    });
    return;
  }

  const showSelected = ["budget", "upgrade"].includes(phase);
  const showIncidents = phase === "incident" || phase === "rapid";
  const showMapTip = !tutorialIsActive();
  const showTabBar = !allowedTabs || allowedTabs.length > 1;
  const showDock = !tutorialIsActive();

  if (initiativeHubCard) initiativeHubCard.hidden = true;
  if (defenseCard) defenseCard.hidden = true;
  if (industryCard) industryCard.hidden = true;
  if (selectedCard) selectedCard.hidden = !showSelected;
  if (peoplePane) peoplePane.hidden = !allowedTabs?.includes("people");
  if (els.mapTip) els.mapTip.hidden = !showMapTip;
  if (els.tabBar) els.tabBar.hidden = !showTabBar;
  if (els.livePulseDock) els.livePulseDock.hidden = !showDock;
  if (els.sidePanel) els.sidePanel.hidden = !showSidePanelEarly;
  if (showSelected && selectedCard) selectedCard.classList.add("guided-focus");
  if (showIncidents) {
    const incidentsPane = document.querySelector('[data-pane="incidents"]');
    incidentsPane?.classList.add("guided-focus");
  }
}

function tutorialPulseBuildingIds() {
  if (!tutorialIsActive() || !state.sim.started) return [];
  if (state.tutorial.phase === "budget" || state.tutorial.phase === "upgrade") {
    if (state.selectedBuildingId) return [state.selectedBuildingId];
    return state.buildings.filter((b) => b.placed && SERVICE_KEYS.includes(b.kpi)).map((b) => b.id);
  }
  if (state.tutorial.phase === "incident") {
    const inc = state.incidents.find((i) => i.id === state.tutorial.manualIncidentId && !i.resolved && !i.contained);
    const anchor = incidentAnchorBuilding(inc);
    return anchor ? [anchor.id] : [];
  }
  return [];
}

function applyTutorialHighlights() {
  if (!tutorialIsActive() || !state.sim.started) return;
  const phase = state.tutorial.phase;
  if ((phase === "budget" || phase === "upgrade") && state.selectedBuildingId) {
    els.budgetSlider?.classList.add("guided-focus");
    document.querySelector(".dock-radar-wrap")?.classList.add("guided-focus");
    if (phase === "budget") {
      els.applyBudgetBtn?.classList.add("guided-focus");
    }
    if (phase === "upgrade") {
      els.upgradeBtn?.classList.add("guided-focus");
    }
  }
  if (phase === "rapid") {
    const incidentsPane = document.querySelector('[data-pane="incidents"]');
    incidentsPane?.classList.add("guided-focus");
    els.rapidCard?.classList.add("guided-focus");
  }
}

function canPlayerActOnIncidentNow(inc) {
  if (!inc || !inc.requiresPlayerAction || !incidentSupportsDirectPlayerAction(inc) || inc.resolved || inc.contained || inc.assignedResponderId) return false;
  if (state.resources.actionPoints < 1) return false;
  const cost = 6 + (inc.severity || 1) * 2;
  return state.budget.treasury >= cost;
}
function clearNowStrip() {
  if (els.nowStrip) els.nowStrip.hidden = true;
  if (els.nowStripGo) els.nowStripGo.disabled = true;
  if (!state.ui.nowStripTracker) state.ui.nowStripTracker = { candidateId: null, sinceMs: 0 };
  state.ui.nowStripTracker.candidateId = null;
  state.ui.nowStripTracker.sinceMs = 0;
}

function hasBlockingMapOverlay() {
  return Boolean(
    state.ui.introBriefingOpen
    || (els.setupOverlay && !els.setupOverlay.hidden)
    || (els.housingCard && !els.housingCard.hidden)
    || (els.majorEventCard && !els.majorEventCard.hidden)
  );
}

function hasMomentFocusLock() {
  return Boolean(state.ui.activeSkillCheck);
}

function setActiveSideTab(tab) {
  const allowed = onboardingAllowedTabs();
  let targetTab = allowed && !allowed.includes(tab) ? allowed[0] : tab;
  const hasTab = Boolean(document.querySelector(`.side-tab[data-tab="${targetTab}"]`));
  if (!hasTab) {
    targetTab = document.querySelector(".side-tab")?.getAttribute("data-tab") || "incidents";
  }
  document.querySelectorAll(".side-tab").forEach((btn) => {
    btn.classList.toggle("is-active", btn.getAttribute("data-tab") === targetTab);
  });
  document.querySelectorAll(".tab-pane").forEach((pane) => {
    pane.classList.toggle("is-active", pane.getAttribute("data-pane") === targetTab);
  });
  if (targetTab === "incidents") {
    const alertId = currentActionableIncidentAlertId();
    if (alertId) state.ui.lastSeenIncidentAlertId = alertId;
    setTabAlert(els.tabIncidentsAlert, false, false);
  }
}
function focusControlPanel() {
  state.ui.mapHudOpen = true;
  state.ui.mapHudCollapsed = false;
  positionSelectionHud();
}
function focusInitiativeHubCard() {
  setActiveSideTab("incidents");
  const pane = document.querySelector('[data-pane="incidents"]');
  const card = els.initiativesCard || document.getElementById("initiativesCard");
  if (pane && card) {
    pane.scrollTo({ top: Math.max(0, card.offsetTop - 8), behavior: "smooth" });
  }
}
function focusInitiativesPanel() {
  setActiveSideTab("incidents");
  const pane = document.querySelector('[data-pane="incidents"]');
  const card = els.initiativesCard || document.getElementById("initiativesCard");
  if (pane && card) {
    pane.scrollTo({ top: Math.max(0, card.offsetTop - 8), behavior: "smooth" });
  }
  state.ui.initiativeGuideActive = false;
}
function setCardCollapsed(cardId, collapsed) {
  const card = document.getElementById(cardId);
  if (!card) return;
  card.classList.toggle("collapsed", collapsed);
  const btn = card.querySelector(".collapse-btn");
  if (btn) btn.textContent = card.classList.contains("collapsed") ? "Expand" : "Minimize";
}

function syncMapHudToggleButton() {
  if (!els.mapHudToggleBtn) return;
  els.mapHudToggleBtn.textContent = state.ui.mapHudCollapsed ? "Expand" : "Minimize";
}

function buildingTile(b) {
  return b?.tile || b?.homeTile || [12, 12];
}
function selectionAnchorTile() {
  const base = defenseBaseById(state.selectedDefenseId);
  if (base) return [base.x + (base.size - 1) / 2, base.y + (base.size - 1) / 2];
  const zone = findIndustryZone(state.selectedIndustryId);
  if (zone) return [zone.x + (zone.size - 1) / 2, zone.y + (zone.size - 1) / 2];
  const building = findBuilding(state.selectedBuildingId);
  if (building) return buildingTile(building);
  return null;
}
function cityRadius() {
  return state.growth?.radius || 10;
}
function onboardingEaseFactor() {
  // 0 = easiest onboarding window, 1 = full simulation pressure.
  if (!state.sim.started) return 0;
  const phase = clamp(state.day / 180, 0, 1);
  return tutorialIsActive() && state.tutorial.phase !== "freeplay"
    ? Math.min(phase, 0.45)
    : phase;
}
function activeRoadLines() {
  const r = cityRadius();
  const lines = [10];
  if (r > 12.5) lines.push(14);
  if (r > 15.5) lines.push(18);
  if (r > 18.5) lines.push(22);
  if (r > 22) lines.push(26);
  if (r > 25) lines.push(30);
  return lines.filter((v) => v > 1 && v < MAP_W - 2);
}
function isRoadTile(x, y) {
  return getSpatialTileCache().roadTiles.has(tileKey(x, y));
}
function activeRailLines() {
  const roads = activeRoadLines();
  if (roads.length < 2) return [];
  return [roads[roads.length - 1]];
}
function tileKey(x, y) {
  return `${x},${y}`;
}
function addRectToSet(set, x0, y0, x1, y1) {
  const minX = Math.max(0, x0);
  const minY = Math.max(0, y0);
  const maxX = Math.min(MAP_W - 1, x1);
  const maxY = Math.min(MAP_H - 1, y1);
  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) set.add(tileKey(x, y));
  }
}
function invalidateSpatialTileCache() {
  state.ui.spatialTileCache = null;
}
function getSpatialTileCache() {
  const roadKey = activeRoadLines().join(",");
  const railKey = activeRailLines().join(",");
  const cached = state.ui.spatialTileCache;
  if (cached && cached.roadKey === roadKey && cached.railKey === railKey) return cached;

  const buildingTiles = new Set();
  const housingTiles = new Set();
  const industryTiles = new Set();
  const defenseTiles = new Set();
  const foundationTiles = new Set();

  const footprints = [];
  for (const b of state.buildings) {
    if (!b.placed || !b.tile) continue;
    const [x, y] = b.tile;
    buildingTiles.add(tileKey(x, y));
    addRectToSet(foundationTiles, x, y, x, y);
    footprints.push({ minX: x, minY: y, maxX: x, maxY: y });
  }
  for (const z of state.housing.zones) {
    addRectToSet(housingTiles, z.x, z.y, z.x + z.size - 1, z.y + z.size - 1);
    addRectToSet(foundationTiles, z.x, z.y, z.x + z.size - 1, z.y + z.size - 1);
    footprints.push({ minX: z.x, minY: z.y, maxX: z.x + z.size - 1, maxY: z.y + z.size - 1 });
  }
  for (const z of state.industry.zones) {
    addRectToSet(industryTiles, z.x, z.y, z.x + z.size - 1, z.y + z.size - 1);
    addRectToSet(foundationTiles, z.x, z.y, z.x + z.size - 1, z.y + z.size - 1);
    footprints.push({ minX: z.x, minY: z.y, maxX: z.x + z.size - 1, maxY: z.y + z.size - 1 });
  }
  for (const z of state.defense.bases) {
    const size = z.size || 3;
    addRectToSet(defenseTiles, z.x, z.y, z.x + size - 1, z.y + size - 1);
    addRectToSet(foundationTiles, z.x, z.y, z.x + size - 1, z.y + size - 1);
    footprints.push({ minX: z.x, minY: z.y, maxX: z.x + size - 1, maxY: z.y + size - 1 });
  }

  const roadLines = activeRoadLines();
  const railLines = activeRailLines();
  const roadTiles = new Set();
  const railTiles = new Set();

  for (let x = 0; x < MAP_W; x += 1) {
    for (let y = 0; y < MAP_H; y += 1) {
      if (!isDevelopedTile(x, y, 0.2)) continue;
      const key = tileKey(x, y);
      if ((roadLines.includes(x) || roadLines.includes(y)) && !foundationTiles.has(key)) roadTiles.add(key);
      if ((railLines.includes(x) || railLines.includes(y)) && !foundationTiles.has(key)) railTiles.add(key);
    }
  }

  // If a larger lot cuts through a main road, route a single-tile bypass around the footprint.
  for (const fp of footprints) {
    const lotW = fp.maxX - fp.minX + 1;
    const lotH = fp.maxY - fp.minY + 1;
    if (lotW === 1 && lotH === 1) continue;
    const chooseBypass = (line, low, high, maxBound) => {
      const options = [low - 1, high + 1]
        .filter((v) => v > 0 && v < maxBound - 1)
        .map((v) => ({ v, d: Math.abs(v - line) }))
        .sort((a, b) => a.d - b.d);
      return options[0]?.v ?? null;
    };

    const blockedVertical = roadLines.filter((line) => line >= fp.minX && line <= fp.maxX);
    for (const lineX of blockedVertical) {
      const bypassX = chooseBypass(lineX, fp.minX, fp.maxX, MAP_W);
      if (bypassX == null) continue;
      const topY = fp.minY - 1;
      const bottomY = fp.maxY + 1;
      for (let y = topY; y <= bottomY; y += 1) {
        if (y < 0 || y >= MAP_H) continue;
        const key = tileKey(bypassX, y);
        if (foundationTiles.has(key) || !isDevelopedTile(bypassX, y, 0.7)) continue;
        roadTiles.add(key);
      }
      for (const y of [topY, bottomY]) {
        if (y < 0 || y >= MAP_H) continue;
        const minX = Math.min(lineX, bypassX);
        const maxX = Math.max(lineX, bypassX);
        for (let x = minX; x <= maxX; x += 1) {
          const key = tileKey(x, y);
          if (foundationTiles.has(key) || !isDevelopedTile(x, y, 0.7)) continue;
          roadTiles.add(key);
        }
      }
    }

    const blockedHorizontal = roadLines.filter((line) => line >= fp.minY && line <= fp.maxY);
    for (const lineY of blockedHorizontal) {
      const bypassY = chooseBypass(lineY, fp.minY, fp.maxY, MAP_H);
      if (bypassY == null) continue;
      const leftX = fp.minX - 1;
      const rightX = fp.maxX + 1;
      for (let x = leftX; x <= rightX; x += 1) {
        if (x < 0 || x >= MAP_W) continue;
        const key = tileKey(x, bypassY);
        if (foundationTiles.has(key) || !isDevelopedTile(x, bypassY, 0.7)) continue;
        roadTiles.add(key);
      }
      for (const x of [leftX, rightX]) {
        if (x < 0 || x >= MAP_W) continue;
        const minY = Math.min(lineY, bypassY);
        const maxY = Math.max(lineY, bypassY);
        for (let y = minY; y <= maxY; y += 1) {
          const key = tileKey(x, y);
          if (foundationTiles.has(key) || !isDevelopedTile(x, y, 0.7)) continue;
          roadTiles.add(key);
        }
      }
    }
  }

  state.ui.spatialTileCache = {
    roadKey,
    railKey,
    buildingTiles,
    housingTiles,
    industryTiles,
    defenseTiles,
    foundationTiles,
    roadTiles,
    railTiles,
  };
  return state.ui.spatialTileCache;
}
function isRailTile(x, y) {
  return getSpatialTileCache().railTiles.has(tileKey(x, y));
}
function isHousingTile(x, y) {
  return getSpatialTileCache().housingTiles.has(tileKey(x, y));
}
function isIndustryTile(x, y) {
  return getSpatialTileCache().industryTiles.has(tileKey(x, y));
}
function isDefenseTile(x, y) {
  return getSpatialTileCache().defenseTiles.has(tileKey(x, y));
}
function isFoundationTile(x, y) {
  return getSpatialTileCache().foundationTiles.has(tileKey(x, y));
}
function isDevelopedTile(x, y, margin = 0) {
  const dx = x - CITY_CORE_TILE[0];
  const dy = y - CITY_CORE_TILE[1];
  const dist = Math.hypot(dx, dy);
  return dist <= cityRadius() + margin;
}
function isTileBuildable(x, y) {
  if (x < 1 || y < 1 || x > MAP_W - 2 || y > MAP_H - 2) return false;
  if (!isDevelopedTile(x, y, 0.25)) return false;
  if (isFoundationTile(x, y)) return false;
  if (isHousingTile(x, y)) return false;
  if (isIndustryTile(x, y)) return false;
  if (isDefenseTile(x, y)) return false;
  return !getSpatialTileCache().buildingTiles.has(tileKey(x, y));
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
function addDecisionToast(text, kind = "good") {
  state.ui.decisionToasts.unshift({ id: `dc_${Date.now()}_${Math.random()}`, text, kind, ttl: 3.2 });
  state.ui.decisionToasts = state.ui.decisionToasts.slice(0, 3);
}
function truthVerdict(q) {
  if (q > 0) return "RIGHT";
  if (q < 0) return "WRONG";
  return "NEUTRAL";
}
function truthConfidence(options = []) {
  const q = options.map((o) => Math.abs(o.truth_quality || 0));
  if (q.length === 0) return "Low";
  const max = Math.max(...q);
  const nonZero = q.filter((v) => v > 0).length;
  if (max >= 1 && nonZero === 2) return "High";
  if (max >= 1) return "Medium";
  return "Low";
}

const BUILDING_STATE_META = {
  thriving: { label: "Strong ✅", icon: "🌟" },
  stable: { label: "Balanced 🟢", icon: "🟢" },
  strained: { label: "Needs Support 🟠", icon: "🟠" },
  overloaded: { label: "At Risk 🔴", icon: "🔴" },
  unbuilt: { label: "Not Built ⚪", icon: "⚪" },
};

const SERVICE_KEYS = ["health", "education", "safety", "climate", "integrity", "economy"];

function createInitialServiceState(seed = {}) {
  const out = {};
  for (const key of SERVICE_KEYS) {
    const health = clamp(seed[key] ?? 60, 0, 100);
    out[key] = {
      demand: 0,
      capacity: 0,
      coverage: 0,
      pressure: 0,
      reserve: clamp(2.5 + Math.max(0, health - 55) * 0.05, 0, 12),
      reserveCap: 12,
      health,
    };
  }
  return out;
}

function ensureServiceState() {
  if (!state.services) {
    state.services = createInitialServiceState(state.kpi);
    return;
  }
  for (const key of SERVICE_KEYS) {
    if (!state.services[key]) state.services[key] = createInitialServiceState({ [key]: state.kpi[key] })[key];
    if (!Number.isFinite(state.services[key].health)) state.services[key].health = clamp(state.kpi[key] ?? 60, 0, 100);
    if (!Number.isFinite(state.services[key].reserve)) state.services[key].reserve = 0;
    if (!Number.isFinite(state.services[key].reserveCap)) state.services[key].reserveCap = 12;
    if (!Number.isFinite(state.services[key].demand)) state.services[key].demand = 0;
    if (!Number.isFinite(state.services[key].capacity)) state.services[key].capacity = 0;
    if (!Number.isFinite(state.services[key].coverage)) state.services[key].coverage = 0;
    if (!Number.isFinite(state.services[key].pressure)) state.services[key].pressure = 0;
  }
}

function syncServiceHealthFromKpi() {
  ensureServiceState();
  for (const key of SERVICE_KEYS) {
    state.services[key].health = clamp(state.kpi[key] ?? state.services[key].health ?? 60, 0, 100);
  }
}

function serviceStateForKey(key) {
  ensureServiceState();
  return state.services[key] || null;
}

function decayServicePressure() {
  ensureServiceState();
  for (const key of SERVICE_KEYS) {
    const svc = state.services[key];
    svc.pressure = clamp((svc.pressure || 0) * 0.62 - 0.14, 0, 12);
  }
}

function applyServicePressureMap(map, scale = 1) {
  if (!map) return;
  ensureServiceState();
  for (const [key, value] of Object.entries(map)) {
    const delta = value * scale;
    if (key === "stability") {
      state.kpi.stability = clamp(state.kpi.stability + delta, 0, 100);
      continue;
    }
    if (!SERVICE_KEYS.includes(key)) {
      if (Object.hasOwn(state.kpi, key)) state.kpi[key] = clamp(state.kpi[key] + delta, 0, 100);
      continue;
    }
    const svc = serviceStateForKey(key);
    if (!svc) continue;
    if (delta < 0) {
      const hit = Math.abs(delta);
      svc.pressure = clamp((svc.pressure || 0) + hit * 0.52, 0, 12);
      svc.reserve = clamp((svc.reserve || 0) - hit * 0.24, 0, svc.reserveCap || 12);
      svc.health = clamp((svc.health ?? state.kpi[key] ?? 60) - hit * 0.02, 0, 100);
    } else if (delta > 0) {
      svc.pressure = clamp((svc.pressure || 0) - delta * 0.85, 0, 16);
      svc.reserve = clamp((svc.reserve || 0) + delta * 0.55, 0, svc.reserveCap || 12);
      svc.health = clamp((svc.health ?? state.kpi[key] ?? 60) + delta * 0.44, 0, 100);
    }
    state.kpi[key] = svc.health;
  }
}

const DEPARTMENT_LOAD_PROFILE = {
  health: { base: 0.82, growth: 0.11, time: 0.05, industry: 0.03, incident: 0.14, major: 0.18 },
  education: { base: 0.78, growth: 0.1, time: 0.045, industry: 0.02, incident: 0.1, major: 0.14 },
  safety: { base: 0.8, growth: 0.1, time: 0.05, industry: 0.02, incident: 0.16, major: 0.2 },
  climate: { base: 0.82, growth: 0.11, time: 0.05, industry: 0.05, incident: 0.14, major: 0.22 },
  integrity: { base: 0.72, growth: 0.09, time: 0.055, industry: 0.02, incident: 0.16, major: 0.2 },
  economy: { base: 0.86, growth: 0.12, time: 0.05, industry: 0.05, incident: 0.1, major: 0.16 },
};

const SERVICE_LOAD_SCHEDULE = {
  health: { startDay: 18, rampDays: 24, radiusStart: 10, radiusRamp: 5, growthStart: 64, growthRamp: 18 },
  education: { startDay: 28, rampDays: 28, radiusStart: 11, radiusRamp: 5, growthStart: 68, growthRamp: 18 },
  safety: { startDay: 16, rampDays: 22, radiusStart: 10, radiusRamp: 4, growthStart: 63, growthRamp: 16 },
  climate: { startDay: 36, rampDays: 32, radiusStart: 12, radiusRamp: 6, growthStart: 72, growthRamp: 18 },
  integrity: { startDay: 24, rampDays: 28, radiusStart: 10, radiusRamp: 5, growthStart: 66, growthRamp: 16 },
  economy: { startDay: 14, rampDays: 20, radiusStart: 10, radiusRamp: 4, growthStart: 62, growthRamp: 14 },
};

function serviceLoadActivation(key) {
  const schedule = SERVICE_LOAD_SCHEDULE[key] || SERVICE_LOAD_SCHEDULE.health;
  return {
    day: clamp((state.day - schedule.startDay) / schedule.rampDays, 0, 1),
    radius: clamp((cityRadius() - schedule.radiusStart) / schedule.radiusRamp, 0, 1),
    growth: clamp(((state.growth.score || 60) - schedule.growthStart) / schedule.growthRamp, 0, 1),
  };
}

function departmentBudgetCeiling(building) {
  if (!building) return 120;
  const growthLift = Math.max(0, cityRadius() - 10) * 5;
  const timeLift = Math.max(0, state.day - 30) * 0.45;
  return round(clamp(140 + growthLift + timeLift, 140, 280));
}

function departmentDemandLoad(building) {
  if (!building?.placed) return 0;
  const profile = DEPARTMENT_LOAD_PROFILE[building.kpi] || DEPARTMENT_LOAD_PROFILE.health;
  const activation = serviceLoadActivation(building.kpi);
  const radiusLoad = Math.max(0, cityRadius() - 10);
  const timeLoad = Math.max(0, state.day - 24) / 30;
  const growthLoad = Math.max(0, (state.growth.score || 60) - 60) / 12;
  const industryLoad = Math.max(0, state.industry.metrics.utilization || 0) / 100;
  const incidentLoad = state.incidents.filter((inc) => !inc.resolved && inc.type.kpi === building.kpi).length;
  const majorLoad = state.majorEvents.filter((ev) => (ev.domain || "").includes(building.kpi === "safety" ? "security" : building.kpi)).length;
  const instabilityLoad = building.kpi === "integrity"
    ? Math.max(0, (58 - state.kpi.stability) / 34) + (state.election.campaignActive ? 0.12 : 0)
    : building.kpi === "economy"
      ? Math.max(0, (state.budget.debt - 90) / 80)
      : 0;
  return profile.base
    + radiusLoad * profile.growth * (0.18 + activation.radius * 0.82)
    + timeLoad * profile.time * (0.16 + activation.day * 0.84)
    + growthLoad * 0.1 * (0.18 + activation.growth * 0.82)
    + industryLoad * profile.industry
    + incidentLoad * profile.incident
    + majorLoad * profile.major
    + instabilityLoad;
}

function departmentCapacityScore(building, targetBudget = building?.budget, targetLevel = building?.level) {
  if (!building?.placed) return 0;
  const level = Math.max(1, targetLevel || 1);
  const budget = clamp(round(targetBudget ?? building.budget ?? 60), 20, departmentBudgetCeiling(building));
  const levelFactor = 1.08 + Math.max(0, level - 1) * 0.78;
  const budgetFactor = 0.8 + Math.max(0, budget - 20) / 95;
  return levelFactor * budgetFactor;
}

function departmentServiceMetrics(building, targetBudget = building?.budget, targetLevel = building?.level) {
  if (!building?.placed) {
    return { demand: 0, capacity: 0, coverage: -1, reserveCap: 0 };
  }
  const budget = clamp(round(targetBudget ?? building.budget ?? 60), 20, departmentBudgetCeiling(building));
  const level = Math.max(1, targetLevel || building.level || 1);
  const svc = serviceStateForKey(building.kpi);
  const treasury = findBuilding("treasury");
  const defenseReadiness = (state.defense.metrics.readiness || 0) / 100;
  const industryUtil = (state.industry.metrics.utilization || 0) / 100;
  const industryNet = Math.max(0, state.industry.metrics.net || 0);
  let demand = departmentDemandLoad(building);
  let capacity = departmentCapacityScore(building, budget, level);

  if (building.kpi === "safety") {
    capacity += defenseReadiness * 1.6;
  } else if (building.kpi === "integrity") {
    capacity += defenseReadiness * 0.9;
    capacity += Math.max(0, (treasury?.level || 1) - 1) * 0.18;
    capacity += Math.max(0, (treasury?.budget || 60) - 60) * 0.01;
  } else if (building.kpi === "economy") {
    const treasuryLevelSupport = Math.max(0, (treasury?.level || 1) - 1) * 0.55;
    const treasuryBudgetSupport = Math.max(0, (treasury?.budget || 60) - 60) * 0.03;
    const treasuryCashSupport = clamp(((state.budget.treasury || 0) - 80) / 90, 0, 3.2);
    capacity += industryUtil * 2.2 + industryNet * 0.01;
    capacity += treasuryLevelSupport + treasuryBudgetSupport + treasuryCashSupport;
  } else if (building.kpi === "climate") {
    demand += industryNet * 0.012 + Math.max(0, state.kpi.economy - 74) * 0.022;
  } else if (building.kpi === "health") {
    demand += Math.max(0, cityRadius() - 11) * 0.05;
  } else if (building.kpi === "education") {
    demand += Math.max(0, (state.growth.score || 60) - 64) * 0.012;
  }

  if (building.kpi === "economy") {
    demand += industryNet * 0.006 + Math.max(0, state.kpi.economy - 74) * 0.012;
  }

  demand += clamp((svc?.pressure || 0) * 0.28, 0, 4.4);

  const reserveCap = clamp(3 + level * 1.2 + Math.max(0, budget - 60) * 0.08, 3, 32);
  return {
    demand,
    capacity,
    coverage: capacity - demand,
    reserveCap,
  };
}

function departmentCoverageMargin(building, targetBudget = building?.budget, targetLevel = building?.level) {
  if (!building?.placed) return -1;
  return departmentServiceMetrics(building, targetBudget, targetLevel).coverage;
}

function currentGoal() {
  return SESSION_GOALS.find((g) => g.id === state.session.goalId) || SESSION_GOALS[0];
}

function tutorialIsActive() {
  return Boolean(state.tutorial?.enabled) && !Boolean(state.tutorial?.completed);
}

function tutorialStepMeta(phase = state.tutorial.phase) {
  return TUTORIAL_STEPS.find((s) => s.id === phase) || TUTORIAL_STEPS[0];
}

function foundingStarterPlacedCount() {
  return FOUNDING_STARTER_IDS.filter((id) => findBuilding(id)?.placed).length;
}

function foundingStarterComplete() {
  return foundingStarterPlacedCount() >= FOUNDING_STARTER_IDS.length;
}

function unlockedFoundingDepartmentIds() {
  return BUILDING_DEFS.map((b) => b.id);
}

function nextFoundingDepartmentId() {
  const unlocked = new Set(unlockedFoundingDepartmentIds());
  return state.buildings.find((b) => unlocked.has(b.id) && !b.placed)?.id || null;
}

function isFoundingDepartmentUnlocked(id) {
  return unlockedFoundingDepartmentIds().includes(id);
}

function onboardingAllowedTabs() {
  if (!tutorialIsActive()) return null;
  if (state.tutorial.phase === "incident" || state.tutorial.phase === "rapid") return ["incidents"];
  return null;
}

function triggerToolboxSpotlight(ms = 2800) {
  state.ui.toolboxSpotlightUntilMs = Date.now() + ms;
}

function triggerMapSpotlight(ms = 2800) {
  state.ui.mapSpotlightUntilMs = Date.now() + ms;
}

function setTutorialPhase(phase, announce = true) {
  if (!tutorialIsActive()) return;
  if (!Object.hasOwn(TUTORIAL_STEP_INDEX, phase)) return;
  if (state.tutorial.phase === phase) return;
  state.tutorial.phase = phase;
  state.tutorial.enteredDay = state.day;
  state.ui.toolboxSpotlightUntilMs = 0;

  const meta = tutorialStepMeta(phase);
  if (announce) {
    addTicker(`Guided step: ${meta.title}.`);
    addRailEvent("🧭 Guided Step", meta.short, true);
  }
  if (phase === "budget" || phase === "upgrade") {
    addTicker("Watch the radar: each spoke is a city system, and your funding, upgrades, and responses are what rebalance it.");
  }

  if (meta.tab) setActiveSideTab(meta.tab);
  if (phase === "industry") state.ui.quickBuildCollapsed = true;
  if (phase === "freeplay") {
    for (const inc of state.incidents) {
      if (inc.tutorialManual) inc.tutorialManual = false;
    }
    if (state.rapid.active?.incidentCode?.startsWith("BRIEF-")) {
      state.rapid.active = null;
    }
    state.tutorial.completed = true;
    state.rapid.nextAtDay = Math.max(state.rapid.nextAtDay, state.day + 8);
    state.major.nextAtDay = Math.max(state.major.nextAtDay, state.day + 10);
    state.housing.nextAtDay = Math.max(state.housing.nextAtDay, state.day + 12);
    if (!state.onboarding.initiativesPrompted) {
      state.onboarding.initiativesPrompted = true;
      state.ui.initiativeGuideActive = true;
      state.ui.initiativeGuideUntilDay = state.day + 24;
      focusInitiativeHubCard();
      setCardCollapsed("initiativeHubCard", false);
      addRailEvent(
        "🧩 Initiatives Unlocked",
        "Use AP + treasury to directly shift demographic mood. Open the Initiatives tab to launch targeted social programs.",
        true
      );
      addTicker("Initiatives unlocked: open the Initiatives tab to launch targeted social programs.");
    }
    addTicker("Guided mode complete. Full simulation chaos is now unlocked.");
    addRailEvent("✅ Tutorial Complete", "All systems unlocked: random incidents, major events, and rapid briefs.", true);
  }
}

function tutorialFocusCurrentStep() {
  if (!tutorialIsActive()) return;
  const phase = state.tutorial.phase;
  if (phase === "budget" || phase === "upgrade") {
    const target = state.selectedBuildingId
      ? findBuilding(state.selectedBuildingId)
      : state.buildings.find((b) => b.placed) || findBuilding("health");
    if (target?.id) {
      state.selectedBuildingId = target.id;
      state.selectedIndustryId = null;
      markOnboarding("selectedBuilding");
      focusCameraOnTile(buildingTile(target));
    }
    focusControlPanel();
    return;
  }
  if (phase === "industry") {
    focusControlPanel();
    state.ui.quickBuildCollapsed = false;
    triggerToolboxSpotlight(6500);
    triggerMapSpotlight(6500);
    setCardCollapsed("industryCard", false);
    const recId = recommendedIndustryProjectId();
    if (recId) {
      chooseIndustryProject(recId);
      addTicker("Recommended industry armed. Click a glowing green block on the map to place it.");
    }
    const pane = document.querySelector('[data-pane="control"]');
    const card = document.getElementById("industryCard");
    if (pane && card) {
      pane.scrollTo({ top: Math.max(0, card.offsetTop - 8), behavior: "smooth" });
    }
    return;
  }
  if (phase === "incident") {
    setActiveSideTab("incidents");
    const inc = state.incidents.find((i) => i.id === state.tutorial.manualIncidentId && !i.resolved);
    if (inc) focusCameraOnTile(inc.tile);
    return;
  }
  if (phase === "rapid") {
    setActiveSideTab("incidents");
    if (state.rapid.active?.mapMarkerTile) focusCameraOnTile(state.rapid.active.mapMarkerTile);
  }
}

function maybeSpawnTutorialIncident() {
  if (!tutorialIsActive()) return;
  if (state.tutorial.phase !== "incident") return;
  if (state.tutorial.firstIncidentSpawned) return;
  if (state.incidents.some((i) => !i.resolved && !i.contained && i.tutorialManual)) return;

  const byRisk = [
    { id: "medical", k: state.kpi.health },
    { id: "crime", k: state.kpi.safety },
    { id: "flood", k: state.kpi.climate },
    { id: "corruption", k: state.kpi.integrity },
  ].sort((a, b) => a.k - b.k);
  const typeId = byRisk[0]?.id || "medical";
  const inc = spawnIncident(typeId, { severity: 2, tutorialManual: true, codePrefix: "DRILL" });
  if (!inc) return;
  state.tutorial.firstIncidentSpawned = true;
  state.tutorial.manualIncidentId = inc.id;
  addTicker("Guided incident spawned. Click the building alert badge to run a manual response.");
  addRailEvent("❗ Tutorial Incident", "Manual response required. Click the building alert badge.", true);
  setActiveSideTab("incidents");
  focusCameraOnTile(inc.tile);
}

function maybeSpawnTutorialRapid() {
  if (!tutorialIsActive()) return;
  if (state.tutorial.phase !== "rapid") return;
  if (state.onboarding.rapidResolved) return;
  if (state.rapid.active) return;
  if (state.tutorial.firstRapidSpawned && state.day - state.tutorial.enteredDay < 4) return;

  const focus = findBuilding("treasury") || findBuilding("integrity") || state.buildings.find((b) => b.placed);
  const marker = focus ? buildingTile(focus) : [12, 12];
  const pass = Math.max(1, state.day - state.tutorial.enteredDay + 1);
  state.rapid.active = {
    mode: "scenario",
    incidentCode: `BRIEF-${String(pass).padStart(2, "0")}`,
    title: "Rumor Storm Before Budget Vote",
    speaker: "Press Desk",
    claim: "A viral clip says clinics were secretly defunded overnight.",
    clues: {
      data: "Published ledger shows no clinical cut, but prevention funds were delayed.",
      street: "Emergency rooms are busy and citizens feel ignored.",
      motive: "Opposition influencers amplified an out-of-context chart.",
    },
    options: [
      {
        id: "show_receipts",
        key: "a",
        label: "Show receipts + fix delay",
        outcome_blurb: "Trust rises. You own the delay and fix it with evidence.",
        truth_quality: 1,
        dem_now: { poverty: 3, working: 3, middle: 2, business: 0, elite: 0 },
        treasury_delta_now: -4,
        kpi_now: { integrity: 1.2, health: 0.4, stability: 0.4 },
        axis_drift: { careAusterity: 1, libertyControl: 0, publicDonor: 0.2, truthSpin: 1.1 },
        risk_flags: [],
      },
      {
        id: "deny_hard",
        key: "b",
        label: "Deny everything",
        outcome_blurb: "Short-term noise drops, but fact-check backlash hurts trust.",
        truth_quality: -1,
        dem_now: { poverty: -2, working: -2, middle: -2, business: 1, elite: 1 },
        treasury_delta_now: 0,
        kpi_now: { integrity: -1.1, stability: -0.6 },
        axis_drift: { careAusterity: -0.4, libertyControl: -0.1, publicDonor: -0.2, truthSpin: -1.2 },
        risk_flags: ["credibility_backlash"],
      },
      {
        id: "stall_committee",
        key: "c",
        label: "Form committee, no action",
        outcome_blurb: "Neutral optics now, but frustration lingers in affected suburbs.",
        truth_quality: 0,
        dem_now: { poverty: -1, working: -1, middle: 0, business: 0, elite: 0 },
        treasury_delta_now: -1,
        kpi_now: { stability: -0.2 },
        axis_drift: { careAusterity: 0, libertyControl: 0, publicDonor: 0, truthSpin: -0.2 },
        risk_flags: [],
      },
    ],
    defaultChoice: "c",
    focusBuildingId: focus?.id || "treasury",
    mapMarkerTile: marker,
    expiresDay: state.day + RAPID_WINDOW_DAYS + 8,
  };
  state.tutorial.firstRapidSpawned = true;
  state.rapid.nextAtDay = Math.max(state.rapid.nextAtDay, state.day + RAPID_INTERVAL_DAYS);
  addTicker("Guided civic brief live. Read clues and pick the most evidence-based response.");
  addRailEvent("🧠 Tutorial Brief", "Use clues to judge what is true, spin, or uncertain.", true);
  setActiveSideTab("incidents");
  focusCameraOnTile(marker);
}

function updateTutorialProgress() {
  if (!tutorialIsActive()) return;
  if (!state.sim.started) {
    state.tutorial.phase = "founding";
    return;
  }

  if (state.tutorial.phase === "founding") {
    setTutorialPhase("budget");
    return;
  }
  if (state.tutorial.phase === "budget") {
    if (state.onboarding.selectedBuilding && state.onboarding.budgetApplied) setTutorialPhase("upgrade");
    return;
  }
  if (state.tutorial.phase === "upgrade") {
    if (state.onboarding.upgradedOrDispatched) setTutorialPhase("industry");
    return;
  }
  if (state.tutorial.phase === "industry") {
    if (state.industry.zones.length > 0) setTutorialPhase("incident");
    return;
  }
  if (state.tutorial.phase === "incident") {
    const inc = state.incidents.find((i) => i.id === state.tutorial.manualIncidentId && !i.resolved);
    if (!inc || inc.contained) setTutorialPhase("rapid");
    return;
  }
  if (state.tutorial.phase === "rapid") {
    if (state.onboarding.rapidResolved) setTutorialPhase("freeplay");
  }
}

function tutorialStepDone(stepId) {
  if (stepId === "founding") return allBuildingsPlaced();
  if (stepId === "budget") return state.onboarding.selectedBuilding && state.onboarding.budgetApplied;
  if (stepId === "upgrade") return state.onboarding.upgradedOrDispatched;
  if (stepId === "industry") return state.industry.zones.length > 0;
  if (stepId === "incident") {
    const inc = state.incidents.find((i) => i.id === state.tutorial.manualIncidentId);
    return Boolean(inc && (inc.contained || inc.resolved)) || (state.tutorial.phase === "rapid" || state.tutorial.phase === "freeplay");
  }
  if (stepId === "rapid") return state.onboarding.rapidResolved;
  if (stepId === "freeplay") return state.tutorial.completed;
  return false;
}

function skipTutorial() {
  if (!tutorialIsActive()) return;
  for (const inc of state.incidents) {
    if (inc.tutorialManual) inc.tutorialManual = false;
  }
  state.tutorial.firstIncidentSpawned = true;
  state.tutorial.firstRapidSpawned = true;
  state.tutorial.manualIncidentId = null;
  setTutorialPhase("freeplay");
}

function markOnboarding(step) {
  if (!Object.hasOwn(state.onboarding, step)) return;
  state.onboarding[step] = true;
}

function spendActionPoints(cost, reason) {
  if (state.gameOver.active) return false;
  if (state.resources.actionPoints < cost) {
    addTicker(`Need ${cost} action points for ${reason}.`);
    playSfx("uiDenied");
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
  const pool = SESSION_GOALS.filter((goal) => goal.id !== state.session.goalId);
  const options = pool.length ? pool : SESSION_GOALS;
  const g = options[Math.floor(Math.random() * options.length)];
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

const DEPARTMENT_PNG_LEVELS = {
  treasury: 10,
  education: 10,
  welfare: 10,
  transport: 10,
  climate: 10,
  security: 10,
  integrity: 10,
  health: 10,
};

function departmentArtSrc(id, lvl = 1) {
  const pngCap = DEPARTMENT_PNG_LEVELS[id] || 1;
  if (lvl >= 2 && lvl <= pngCap) {
    const title = id.charAt(0).toUpperCase() + id.slice(1);
    return `${DEPARTMENT_ART_BASE}/${title} ${lvl}.png`;
  }
  if (lvl === 1) return `${DEPARTMENT_ART_BASE}/${id}_lvl1.png`;
  return `./assets/cozy-pack/buildings/${id}_lvl${lvl}.svg`;
}

async function loadDepartmentPngOverrides() {
  const tasks = BUILDING_DEFS.flatMap((def) => {
    const levels = Array.from({ length: DEPARTMENT_PNG_LEVELS[def.id] || 1 }, (_, i) => i + 1);
    return levels.map(async (lvl) => {
      try {
        const img = await loadSvgImage(departmentArtSrc(def.id, lvl));
        state.assets.buildings[`${def.id}_lvl${lvl}`] = img;
      } catch {
        // Keep existing fallback if png is missing.
      }
    });
  });
  await Promise.all(tasks);
}

async function loadTerrainTileOverrides() {
  const tileIds = [...new Set(Object.values(TERRAIN_TILE_VARIANTS).flat())];
  const tasks = tileIds.map(async (tileId) => {
    try {
      const img = await loadSvgImage(`${TERRAIN_TILE_BASE}/${tileId}.png`);
      state.assets.tiles[tileId] = img;
    } catch {
      // Keep fallback/cozy-pack tile if missing.
    }
  });
  await Promise.all(tasks);
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

function drawSpriteContained(img, x, y, maxW, maxH) {
  if (!img) return;
  const srcW = img.naturalWidth || img.width || maxW;
  const srcH = img.naturalHeight || img.height || maxH;
  if (!srcW || !srcH) {
    drawSpriteCentered(img, x, y, maxW, maxH);
    return;
  }
  const scale = Math.min(maxW / srcW, maxH / srcH);
  drawSpriteCentered(img, x, y, srcW * scale, srcH * scale);
}

function drawTerrainTopSprite(img, x, y, w, h, fullDepth = false, alpha = 1) {
  if (!img) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (fullDepth) {
    ctx.drawImage(img, x - w / 2, y - h, w, h * 2);
  } else {
    ctx.beginPath();
    ctx.moveTo(x, y - h / 2);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x, y + h / 2);
    ctx.lineTo(x - w / 2, y);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, x - w / 2, y - h, w, h * 2);
  }
  ctx.restore();
}

function terrainUnderpaintColor(kind, developed, frontier) {
  if (kind === "water") return frontier ? "#8fbfe6" : "#7eb4df";
  if (kind === "road" || kind === "plaza" || kind === "sidewalk") return "#8f9897";
  if (kind === "undeveloped") return frontier ? "#7e8e72" : "#6f7c62";
  if (kind === "frontier") return "#88a06f";
  if (kind === "lush" || kind === "park") return developed ? "#97c767" : "#7aa05d";
  return developed ? "#a5cf66" : frontier ? "#88a06f" : "#6f7c62";
}

function isoToScreen(ix, iy) {
  const centerX = state.camera.viewW / 2 + state.camera.x;
  const centerY = state.camera.viewH / 2 + state.camera.y;
  return {
    x: (ix - iy) * (TILE_W / 2) * state.camera.zoom + centerX,
    y: (ix + iy) * (TILE_H / 2) * state.camera.zoom + centerY,
  };
}

function isScreenPointVisible(x, y, margin = 48) {
  return x >= -margin && x <= state.camera.viewW + margin && y >= -margin && y <= state.camera.viewH + margin;
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
  const ease = onboardingEaseFactor();
  const overloadedCutoff = 44 + ease * 7;
  const strainedCutoff = 54 + ease * 7;
  const thrivingCutoff = 80 - ease * 4;
  for (const b of state.buildings) {
    if (!b.placed) {
      b.state = "unbuilt";
      continue;
    }
    const svc = serviceStateForKey(b.kpi);
    const coverage = departmentCoverageMargin(b);
    const reserveRatio = svc?.reserveCap ? clamp((svc.reserve || 0) / svc.reserveCap, 0, 1) : 0;
    const signal = state.kpi[b.kpi] + coverage * 5 + reserveRatio * 10;
    if (signal < overloadedCutoff) b.state = "overloaded";
    else if (signal < strainedCutoff) b.state = "strained";
    else if (signal > thrivingCutoff) b.state = "thriving";
    else b.state = "stable";
  }
}

function findBuilding(id) {
  return state.buildings.find((b) => b.id === id);
}

function allBuildingsPlaced() {
  return state.buildings.every((b) => b.placed);
}

function beginSimulation() {
  if (state.sim.started) return true;
  if (!allBuildingsPlaced()) return false;
  state.sim.started = true;
  initTrafficVehicles();
  initCivilians(220);
  initResponders();
  updateTutorialProgress();
  tutorialFocusCurrentStep();
  addTicker("Government launched. Time is now running and system pressures are live.");
  addRailEvent("▶ Simulation Live", "Founding complete. Incidents, trends, and consequences are now active.", true);
  playSfx("uiConfirm");
  ensureBgm();
  return true;
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

function resolveDepartmentPlacementTile(buildingId, tile) {
  if (!buildingId || !Array.isArray(tile)) return null;
  const [x, y] = tile;
  if (isTileBuildable(x, y)) return [x, y];

  const recommendations = computePlacementRecommendations(buildingId);
  if (recommendations.length) {
    const nearestRec = recommendations
      .map((rec) => ({ ...rec, dist: tileDist(tile, rec.tile) }))
      .sort((a, b) => a.dist - b.dist)[0];
    if (nearestRec?.tile && nearestRec.dist <= 7) return nearestRec.tile;
  }

  let best = null;
  for (let dx = -3; dx <= 3; dx += 1) {
    for (let dy = -3; dy <= 3; dy += 1) {
      const nx = x + dx;
      const ny = y + dy;
      if (!isTileBuildable(nx, ny)) continue;
      const evaln = placementEvaluation(buildingId, [nx, ny]);
      const dist = tileDist(tile, [nx, ny]);
      const score = evaln.score - dist * 0.35;
      if (!best || score > best.score) best = { tile: [nx, ny], score };
    }
  }
  return best?.tile || null;
}

function placeBuilding(buildingId, tile) {
  const b = findBuilding(buildingId);
  if (!b) return false;
  const resolvedTile = resolveDepartmentPlacementTile(buildingId, tile);
  if (!resolvedTile) return false;
  const [x, y] = resolvedTile;
  if (!isTileBuildable(x, y)) return false;
  const evaln = placementEvaluation(buildingId, resolvedTile);
  b.tile = [x, y];
  b.placed = true;
  b.state = "stable";
  b.siteScore = evaln.score;
  invalidateSpatialTileCache();
  state.kpi[b.kpi] = clamp(state.kpi[b.kpi] + evaln.score * 0.45, 0, 100);
  addTicker(`Placed ${b.name} at tile ${x},${y} (${evaln.label} site).`);
  addRailEvent("🧱 Department Placed", `${b.name} opened at tile ${x},${y}. Site quality: ${evaln.label}.`, false);
  addDecisionToast(`${b.name} online`, "good");
  playSfx("placeBasic", { throttleMs: 80 });
  state.ui.placementBuildingId = nextFoundingDepartmentId() || state.buildings.find((d) => !d.placed)?.id || null;
  state.ui.placementRecommendations = computePlacementRecommendations(state.ui.placementBuildingId);
  if (allBuildingsPlaced()) {
    state.ui.quickBuildCollapsed = true;
    addRailEvent("🏙️ Founding Complete", "All core departments placed. Press Launch Government to begin time.", true);
    addTicker("All departments placed. Launch Government when ready.");
    playSfx("uiPositive");
  }
  return true;
}

function departmentBudgetDraftValue(building) {
  if (!building) return 60;
  const draft = state.ui.budgetDraftByBuilding[building.id];
  if (!Number.isFinite(draft)) return Math.round(building.budget);
  return Math.round(clamp(draft, 20, departmentBudgetCeiling(building)));
}

function departmentRequiredBudget(building, targetCoverage = 0.3) {
  if (!building?.placed) return 60;
  const ceiling = departmentBudgetCeiling(building);
  let best = ceiling;
  for (let budget = 20; budget <= ceiling; budget += 1) {
    const coverage = departmentServiceMetrics(building, budget, building.level).coverage;
    if (coverage >= targetCoverage) {
      best = budget;
      break;
    }
  }
  return round(clamp(best, 20, ceiling));
}

function departmentGaugeState(building, targetBudget) {
  if (!building?.placed) return { tone: "neutral", label: "Balanced", required: 60 };
  const required = departmentRequiredBudget(building, 0.35);
  const gap = round(targetBudget - required);
  if (gap < -8) return { tone: "bad", label: "Underfunded", required };
  if (gap < -2) return { tone: "warn", label: "Tight", required };
  if (gap <= 10) return { tone: "good", label: "Green Zone", required };
  if (gap <= 26) return { tone: "warn", label: "Overfunded", required };
  return { tone: "bad", label: "Burning Cash", required };
}

function autoBudgetProfile(building) {
  if (!building?.placed) {
    return { targetCoverage: 0.35, buffer: 3, riseStep: 4, fallStep: 2, label: "Hold" };
  }
  const svc = serviceStateForKey(building.kpi);
  const reserveRatio = svc?.reserveCap ? clamp((svc.reserve || 0) / svc.reserveCap, 0, 1) : 0;
  const pressure = clamp(svc?.pressure || 0, 0, 16);
  const health = clamp(svc?.health ?? state.kpi[building.kpi] ?? 60, 0, 100);
  const incidentPressure = state.incidents.filter((inc) => !inc.resolved && inc.type.kpi === building.kpi).length;
  const majorPressure = state.majorEvents.filter((ev) => (ev.domain || "").includes(building.kpi === "safety" ? "security" : building.kpi)).length;
  if (health < 46 || pressure > 5.2) {
    return { targetCoverage: 1.2, buffer: 10, riseStep: 10, fallStep: 2, label: "Recover" };
  }
  if (health < 58 || pressure > 2.8 || incidentPressure > 0 || majorPressure > 0) {
    return { targetCoverage: 0.95, buffer: 8, riseStep: 8, fallStep: 2, label: "Recover" };
  }
  if (health < 70 || reserveRatio < 0.28) {
    return { targetCoverage: 0.65, buffer: 6, riseStep: 6, fallStep: 2, label: "Rebuild" };
  }
  return { targetCoverage: 0.35, buffer: 3, riseStep: 4, fallStep: 1, label: "Hold" };
}

function syncBudgetGauge(building, targetBudget) {
  if (!els.budgetGauge || !els.budgetNeedLabel || !els.budgetZoneLabel || !els.autoBudgetBtn) return;
  if (!building?.placed) {
    els.budgetGauge.style.setProperty("--required-pos", "50%");
    els.budgetNeedLabel.textContent = "Need -";
    els.budgetZoneLabel.textContent = "Balanced";
    els.budgetZoneLabel.className = "";
    els.autoBudgetBtn.hidden = true;
    return;
  }
  const max = departmentBudgetCeiling(building);
  const gauge = departmentGaugeState(building, targetBudget);
  const requiredPos = ((gauge.required - 20) / Math.max(1, max - 20)) * 100;
  els.budgetGauge.style.setProperty("--required-pos", `${clamp(requiredPos, 0, 100)}%`);
  els.budgetNeedLabel.textContent = `Need ${gauge.required}`;
  els.budgetZoneLabel.textContent = gauge.label;
  els.budgetZoneLabel.className = gauge.tone;
  const autoOn = Boolean(state.ui.autoBudgetByBuilding?.[building.id]);
  const autoProfile = autoBudgetProfile(building);
  els.autoBudgetBtn.hidden = false;
  els.autoBudgetBtn.classList.toggle("is-on", autoOn);
  els.autoBudgetBtn.setAttribute("aria-pressed", autoOn ? "true" : "false");
  els.autoBudgetBtn.textContent = autoOn ? "Auto On" : "Auto";
  els.autoBudgetBtn.title = autoOn
    ? `Auto-fund is in ${autoProfile.label.toLowerCase()} mode for this department.`
    : "Enable auto-fund to keep this department near the green zone if treasury allows.";
}

function estimateBudgetTreasuryDeltaPerDay(building, targetBudget) {
  if (!building) return 0;
  const placed = state.buildings.filter((b) => b.placed);
  const active = placed.length ? placed.length : state.buildings.length;
  const delta = targetBudget - building.budget;
  const loadWeight = clamp(departmentDemandLoad(building) / 3.4, 0.7, 1.55);
  const expenditureShift = (delta / Math.max(1, active)) * 0.26 * loadWeight;
  return round(-expenditureShift * 0.25);
}

function departmentSellRefund(building) {
  if (!building || building.level <= 1) return 0;
  const paidForCurrentLevel = 12 + (building.level - 1) * 8;
  return round(paidForCurrentLevel * 0.55);
}

function industrySellRefund(zone) {
  if (!zone) return 0;
  const project = projectById(zone.projectId);
  const projectCost = project?.cost || 0;
  const investedBase = Math.max(zone.paid || 0, round(projectCost * 0.55));
  const upgradeInvestment = Math.max(0, (zone.level || 1) - 1) * round(projectCost * 0.28);
  const invested = investedBase + upgradeInvestment;
  const rate = zone.status === "building"
    ? 0.62
    : zone.status === "upgrading"
      ? 0.52
      : clamp(0.44 + Math.max(0, (zone.level || 1) - 1) * 0.04, 0.44, 0.62);
  return round(invested * rate);
}

function applyDepartmentBudget() {
  const base = defenseBaseById(state.selectedDefenseId);
  if (base) {
    const target = Math.round(clamp(Number(els.budgetSlider.value), 30, 140));
    const delta = target - (base.budget || 70);
    if (Math.abs(delta) < 1) {
      addTicker("No defense budget change applied.");
      playSfx("uiDenied");
      return;
    }
    if (!spendActionPoints(1, "defense budget adjustment")) return;
    base.budget = target;
    const treasuryShift = round(-delta * 0.08);
    addTicker(`${base.name} budget target set to ${target} (${formatSignedNumber(delta)}).`);
    addDecisionToast(`${base.name} budget ${formatSignedNumber(delta)} · Treasury ${formatSignedMoneyMillions(treasuryShift)}/day`, delta < 0 ? "good" : "neutral");
    playSfx(delta > 0 ? "econTax" : "econUp");
    logDecisionImpact({
      title: `${base.name} Budget Adjustment`,
      category: "security",
      choice: delta > 0 ? "Increase Funding" : "Reduce Funding",
      demNow: {
        poverty: delta > 0 ? 0.2 : -0.5,
        working: delta > 0 ? 0.5 : -0.2,
        middle: delta > 0 ? 0.9 : -0.7,
        business: delta > 0 ? 0.8 : -0.6,
        elite: delta > 0 ? 0.4 : -0.2,
      },
      trustDelta: delta > 0 ? 0.15 : -0.1,
      axisDrift: { careAusterity: delta > 0 ? 0.1 : -0.1, libertyControl: -0.7, publicDonor: 0.1, truthSpin: 0 },
      treasuryDeltaNow: treasuryShift,
      kpiNow: { safety: delta > 0 ? 0.4 : -0.3, integrity: delta > 0 ? 0.3 : -0.2 },
      confidence: "medium",
      explain: "Defense readiness and operational pressure changed with funding.",
    });
    return;
  }
  const b = findBuilding(state.selectedBuildingId);
  if (!b) return;
  markOnboarding("selectedBuilding");
  const target = departmentBudgetDraftValue(b);
  const delta = target - b.budget;
  if (Math.abs(delta) < 1) {
    addTicker("No budget change applied.");
    playSfx("uiDenied");
    return;
  }
  if (!spendActionPoints(1, "budget adjustment")) return;
  const treasuryShift = estimateBudgetTreasuryDeltaPerDay(b, target);
  b.budget = target;
  state.ui.budgetDraftByBuilding[b.id] = b.budget;
  markOnboarding("budgetApplied");
  recordAction(b.id);
  addTicker(`${b.name} budget target set to ${round(b.budget)} (${formatSignedNumber(delta)}).`);
  addDecisionToast(`${b.name} budget ${formatSignedNumber(delta)} · Treasury ${formatSignedMoneyMillions(treasuryShift)}/day`, delta < 0 ? "good" : "neutral");
  playSfx(delta > 0 ? "econTax" : "econUp");
  const moodBoost = delta > 0 ? 3 : -3;
  const dem = emptyDemImpact();
  if (b.id === "welfare" || b.id === "health") {
    dem.poverty += moodBoost;
    dem.working += round(moodBoost * 0.8);
  } else if (b.id === "education") {
    dem.working += moodBoost;
    dem.middle += round(moodBoost * 0.8);
  } else if (b.id === "transport") {
    dem.working += round(moodBoost * 0.8);
    dem.business += round(moodBoost * 0.9);
  } else if (b.id === "security") {
    dem.middle += round(moodBoost * 0.7);
    dem.business += round(moodBoost * 0.5);
  } else if (b.id === "integrity") {
    dem.poverty += round(moodBoost * 0.4);
    dem.middle += round(moodBoost * 0.6);
  } else if (b.id === "treasury") {
    dem.business += round(moodBoost * -0.4);
    dem.elite += round(moodBoost * -0.6);
  } else if (b.id === "climate") {
    dem.poverty += round(moodBoost * 0.5);
    dem.working += round(moodBoost * 0.5);
    dem.middle += round(moodBoost * 0.4);
  }
  logDecisionImpact({
    title: `${b.name} Budget Adjustment`,
    category: b.id,
    choice: delta > 0 ? "Increase Funding" : "Reduce Funding",
    demNow: dem,
    trustDelta: delta > 0 ? 0.2 : -0.2,
    axisDrift: {
      careAusterity: delta > 0 ? 0.8 : -0.8,
      libertyControl: 0,
      publicDonor: b.id === "treasury" ? -0.5 : 0.3,
      truthSpin: 0.1,
    },
    treasuryDeltaNow: treasuryShift,
    kpiNow: { [b.kpi]: round((delta > 0 ? 0.4 : -0.4)) },
    confidence: "medium",
    explain: `${delta > 0 ? "Expanded" : "Tightened"} ${b.name} funding signal; demographic trust moved accordingly.`,
  });
  updateTutorialProgress();
}

function applyBudgetAvailabilityState() {
  if (els.applyBudgetBtn) els.applyBudgetBtn.textContent = "Apply";
  if (state.selectedDefenseId) {
    const base = defenseBaseById(state.selectedDefenseId);
    if (!base) {
      els.applyBudgetBtn.disabled = true;
      els.applyBudgetBtn.title = "Select a defense base first.";
      return;
    }
    const target = Math.round(clamp(Number(els.budgetSlider.value), 30, 140));
    const delta = target - (base.budget || 70);
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
    const treasuryShift = round(-delta * 0.08);
    els.applyBudgetBtn.textContent = `Apply ${formatSignedNumber(delta)}`;
    els.applyBudgetBtn.title = `Spend 1 AP. Estimated treasury trend: ${formatSignedMoneyMillions(treasuryShift)}/day.`;
    return;
  }
  if (state.selectedIndustryId) {
    els.applyBudgetBtn.disabled = true;
    els.applyBudgetBtn.title = "Budget slider applies to departments, not industry facilities.";
    return;
  }
  const b = findBuilding(state.selectedBuildingId);
  if (!b) {
    els.applyBudgetBtn.disabled = true;
    els.applyBudgetBtn.title = "Select a department first.";
    return;
  }
  const target = departmentBudgetDraftValue(b);
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
  const treasuryShift = estimateBudgetTreasuryDeltaPerDay(b, target);
    els.applyBudgetBtn.textContent = `Apply ${formatSignedNumber(delta)}`;
  els.applyBudgetBtn.title = `Spend 1 AP. Estimated treasury trend: ${formatSignedMoneyMillions(treasuryShift)}/day.`;
}

function applyUpgradeAvailabilityState() {
  if (state.selectedDefenseId) {
    const base = defenseBaseById(state.selectedDefenseId);
    if (!base) {
      els.upgradeBtn.disabled = true;
      els.upgradeBtn.title = "Select a defense base first.";
      return;
    }
    if (base.status !== "active") {
      els.upgradeBtn.disabled = true;
      els.upgradeBtn.title = "Base must be active before upgrading.";
      return;
    }
    if ((base.level || 1) >= 5) {
      els.upgradeBtn.disabled = true;
      els.upgradeBtn.title = "Base is at max level.";
      return;
    }
    const { cost } = defenseUpgradeCostDays(base);
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
    els.upgradeBtn.title = `Spend 2 AP and ${formatMoneyMillions(cost)} to upgrade base.`;
    return;
  }
  if (state.selectedIndustryId) {
    const z = findIndustryZone(state.selectedIndustryId);
    if (!z) {
      els.upgradeBtn.disabled = true;
      els.upgradeBtn.title = "Select an industry facility first.";
      return;
    }
    if (z.status !== "active") {
      els.upgradeBtn.disabled = true;
      els.upgradeBtn.title = "Facility must be active before upgrading.";
      return;
    }
    if ((z.level || 1) >= 5) {
      els.upgradeBtn.disabled = true;
      els.upgradeBtn.title = "Industry facility is at max level.";
      return;
    }
    const { cost } = industryUpgradeCostDays(z);
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
    els.upgradeBtn.title = `Spend 2 AP and ${formatMoneyMillions(cost)} to upgrade facility.`;
    return;
  }
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

function applySellAvailabilityState() {
  if (!els.sellBtn) return;
  els.sellBtn.textContent = "Remove";
  if (state.resources.actionPoints < 1) {
    els.sellBtn.disabled = true;
    els.sellBtn.title = "Need 1 Action Point.";
    return;
  }

  if (state.selectedIndustryId) {
    const zone = findIndustryZone(state.selectedIndustryId);
    if (!zone) {
      els.sellBtn.disabled = true;
      els.sellBtn.title = "Select an asset first.";
      return;
    }
    const refund = industrySellRefund(zone);
    els.sellBtn.disabled = false;
    els.sellBtn.textContent = `Remove +${formatMoneyMillions(refund)}`;
    els.sellBtn.title = "Removes this facility, refunds part of capital, and lowers output.";
    return;
  }

  if (state.selectedDefenseId) {
    const base = defenseBaseById(state.selectedDefenseId);
    if (!base) {
      els.sellBtn.disabled = true;
      els.sellBtn.title = "Select an asset first.";
      return;
    }
    const def = defenseTypeById(base.baseTypeId);
    const invested = (def?.cost || 0) + Math.max(0, (base.level || 1) - 1) * round((def?.cost || 0) * 0.28);
    const refund = round(invested * (base.status === "active" ? 0.5 : 0.58));
    els.sellBtn.disabled = false;
    els.sellBtn.textContent = `Remove +${formatMoneyMillions(refund)}`;
    els.sellBtn.title = "Removes this defense base, refunds capital, and increases external risk.";
    return;
  }

  const b = findBuilding(state.selectedBuildingId);
  if (!b) {
    els.sellBtn.disabled = true;
    els.sellBtn.title = "Select a department first.";
    return;
  }
  if (b.level <= 1) {
    els.sellBtn.disabled = true;
    els.sellBtn.title = "Base level cannot be sold further.";
    return;
  }
  const refund = departmentSellRefund(b);
  els.sellBtn.disabled = false;
  els.sellBtn.textContent = `Sell +${formatMoneyMillions(refund)}`;
  els.sellBtn.title = "Drops one level, refunds part of build cost, and weakens service output.";
}

function upgradeSelected() {
  if (state.selectedDefenseId) {
    upgradeSelectedDefenseBase();
    return;
  }
  if (state.selectedIndustryId) {
    upgradeSelectedIndustry();
    return;
  }
  const b = findBuilding(state.selectedBuildingId);
  if (!b) return;
  if (b.level >= 10) {
    addTicker(`${b.name} is already at max level.`);
    playSfx("uiDenied");
    return;
  }
  const cost = 12 + b.level * 8;
  if (!spendActionPoints(2, "building upgrade")) return;
  if (state.budget.treasury < cost) {
    addTicker(`Not enough treasury for upgrade (${formatMoneyMillions(cost)} required).`);
    state.resources.actionPoints = clamp(state.resources.actionPoints + 2, 0, state.resources.maxActionPoints);
    playSfx("uiDenied");
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
  playSfx("upgrade");
  logDecisionImpact({
    title: `${b.name} Upgrade`,
    category: b.id,
    choice: `Upgrade to L${b.level}`,
    demNow: {
      poverty: b.id === "health" || b.id === "welfare" ? 3 : 0,
      working: b.id === "transport" || b.id === "education" ? 3 : 1,
      middle: 2,
      business: b.id === "transport" || b.id === "treasury" ? 3 : 1,
      elite: b.id === "treasury" ? 2 : 1,
    },
    trustDelta: 0.6,
    axisDrift: { careAusterity: 1.2, libertyControl: 0, publicDonor: 0.4, truthSpin: 0.2 },
    treasuryDeltaNow: -(skill.cost || 0),
    kpiNow: { [b.kpi]: 1.2, stability: 0.3 },
    riskFlags: cost > 26 ? ["capital_spend_pressure"] : [],
    confidence: "high",
    explain: `Capital upgrade improves long-run service delivery and visible state capacity.`,
  });
  scheduleDelayed(5, `${b.name} expansion came online and boosted outcomes.`, () => {
    state.kpi[b.kpi] = clamp(state.kpi[b.kpi] + 1.7 + b.level * 0.22, 0, 100);
  });
  updateTutorialProgress();
}

function sellSelectedAsset() {
  if (state.selectedDefenseId) {
    const base = defenseBaseById(state.selectedDefenseId);
    if (!base) return;
    if (!spendActionPoints(1, "defense decommission")) return;
    const def = defenseTypeById(base.baseTypeId);
    const invested = (def?.cost || 0) + Math.max(0, (base.level || 1) - 1) * round((def?.cost || 0) * 0.28);
    const refund = round(invested * (base.status === "active" ? 0.5 : 0.58));
    state.budget.treasury = round(state.budget.treasury + refund);
    state.defense.bases = state.defense.bases.filter((b) => b.id !== base.id);
    invalidateSpatialTileCache();
    state.buildQueue = state.buildQueue.filter((q) => q.id !== base.id && !q.id.includes(base.id));
    state.selectedDefenseId = null;
    initDecorProps();
    normalizeTrafficLanes();
    addTicker(`Decommissioned ${base.name}. Treasury recovered ${formatMoneyMillions(refund)}.`);
    addDecisionToast(`Decommissioned ${base.name} · ${formatSignedMoneyMillions(refund)}`, "neutral");
    logDecisionImpact({
      title: `${base.name} Decommissioned`,
      category: "security",
      choice: "Sell / Decommission",
      demNow: { poverty: -0.4, working: -0.8, middle: -1.1, business: -1.0, elite: -0.5 },
      trustDelta: -0.2,
      axisDrift: { careAusterity: -0.2, libertyControl: 0.7, publicDonor: -0.1, truthSpin: 0 },
      treasuryDeltaNow: refund,
      kpiNow: { safety: -0.7, integrity: -0.5 },
      confidence: "medium",
      explain: "Short-run fiscal relief traded against deterrence and readiness.",
    });
    playSfx("sell");
    playSfx("econMoney", { volumeMul: 0.75, throttleMs: 100 });
    return;
  }
  if (state.selectedIndustryId) {
    const zone = findIndustryZone(state.selectedIndustryId);
    if (!zone) return;
    if (!spendActionPoints(1, "facility decommission")) return;
    const refund = industrySellRefund(zone);
    const project = projectById(zone.projectId);
    state.budget.treasury = round(state.budget.treasury + refund);
    state.industry.zones = state.industry.zones.filter((z) => z.id !== zone.id);
    invalidateSpatialTileCache();
    state.buildQueue = state.buildQueue.filter((q) => q.id !== zone.id && !q.id.startsWith(`upg_${zone.id}_`));
    state.selectedIndustryId = null;
    initDecorProps();
    normalizeTrafficLanes();
    updateIndustryPerDay();
    const demNow = zone.status === "active"
      ? { poverty: -1, working: -2, middle: -1, business: -2, elite: -1 }
      : { poverty: -0.3, working: -0.7, middle: -0.4, business: -0.7, elite: -0.3 };
    applyDemographicShiftMap(demNow, 1);
    addTicker(`Decommissioned ${zone.name}. Treasury recovered ${formatMoneyMillions(refund)}.`);
    addDecisionToast(`Decommissioned ${zone.name} · ${formatSignedMoneyMillions(refund)}`, "neutral");
    logDecisionImpact({
      title: `${zone.name} Decommissioned`,
      category: project?.domain || "economy",
      choice: "Sell / Decommission",
      demNow,
      trustDelta: -0.25,
      axisDrift: { careAusterity: -0.9, libertyControl: 0, publicDonor: -0.1, truthSpin: 0 },
      treasuryDeltaNow: refund,
      kpiNow: { economy: -0.5, stability: -0.3 },
      confidence: "medium",
      explain: "You recovered cash immediately, but local confidence and output dipped.",
    });
    playSfx("sell");
    playSfx("econMoney", { volumeMul: 0.75, throttleMs: 100 });
    return;
  }

  const b = findBuilding(state.selectedBuildingId);
  if (!b) {
    playSfx("uiDenied");
    return;
  }
  if (b.level <= 1) {
    addTicker(`${b.name} is already at base level. Nothing to sell.`);
    playSfx("uiDenied");
    return;
  }
  if (!spendActionPoints(1, "department sell-down")) return;
  const refund = departmentSellRefund(b);
  b.level = Math.max(1, b.level - 1);
  b.budget = clamp(b.budget, 20, 110);
  state.ui.budgetDraftByBuilding[b.id] = b.budget;
  state.budget.treasury = round(state.budget.treasury + refund);
  state.kpi[b.kpi] = clamp(state.kpi[b.kpi] - 1.1, 0, 100);
  recordAction(b.id);
  const demNow = emptyDemImpact();
  if (b.id === "health" || b.id === "welfare") {
    demNow.poverty -= 2;
    demNow.working -= 1.4;
  } else if (b.id === "education") {
    demNow.working -= 1.3;
    demNow.middle -= 1.1;
  } else if (b.id === "transport") {
    demNow.working -= 1.1;
    demNow.business -= 1.3;
  } else if (b.id === "security") {
    demNow.middle -= 1.1;
    demNow.business -= 0.9;
  } else if (b.id === "climate") {
    demNow.poverty -= 1.2;
    demNow.working -= 0.8;
    demNow.middle -= 0.7;
  } else if (b.id === "integrity") {
    demNow.middle -= 0.9;
    demNow.business -= 0.5;
  } else {
    demNow.business -= 0.8;
    demNow.elite -= 0.7;
  }
  applyDemographicShiftMap(demNow, 1);
  addTicker(`Sold one ${b.name} level. Recovered ${formatMoneyMillions(refund)}.`);
  addDecisionToast(`${b.name} sold down · ${formatSignedMoneyMillions(refund)}`, "neutral");
  logDecisionImpact({
    title: `${b.name} Sell-Down`,
    category: b.id,
    choice: "Sell one level",
    demNow,
    trustDelta: -0.2,
    axisDrift: { careAusterity: -0.7, libertyControl: 0, publicDonor: -0.2, truthSpin: 0 },
    treasuryDeltaNow: refund,
    kpiNow: { [b.kpi]: -1.1 },
    confidence: "high",
    explain: "Short-term fiscal recovery traded against service strength.",
  });
  playSfx("sell");
  playSfx("econMoney", { volumeMul: 0.75, throttleMs: 100 });
}

function triggerRapidDecision(options = {}) {
  if (state.rapid.active) return;
  if (state.day < state.rapid.nextAtDay) return;
  const shouldFocus = Boolean(options.focus);
  const truthCards = state.content.truthChecks || [];
  const useScenario = truthCards.length > 0 && Math.random() < 0.95;
  if (useScenario) {
    const scenario = truthCards[Math.floor(Math.random() * truthCards.length)];
    const idNum = Math.floor(state.day / RAPID_INTERVAL_DAYS) + 1;
    const incidentCode = `INCIDENT-${String(idNum).padStart(3, "0")}`;
    const opts = (scenario.options || []).slice(0, 3);
    const withKeys = opts.map((o, idx) => ({ ...o, key: idx === 0 ? "a" : idx === 1 ? "b" : "c" }));
    const fallbackDefault = withKeys.find((o) => o.id === "ask_proof")?.key || withKeys[0]?.key || "a";
    const focus = findBuilding(majorEventAnchorBuildingId(scenario.category?.includes("_") ? scenario.category.split("_")[0] : scenario.category)) || findBuilding("treasury");
    state.rapid.active = {
      mode: "scenario",
      incidentCode,
      title: scenario.title,
      speaker: scenario.speaker || "Advisory Desk",
      claim: scenario.claim || "",
      body: scenario.prompt,
      clues: scenario.clues || null,
      options: withKeys,
      defaultChoice: fallbackDefault,
      focusBuildingId: focus?.id || "treasury",
      mapMarkerTile: focus ? buildingTile(focus) : [12, 12],
      expiresDay: state.day + RAPID_WINDOW_DAYS,
    };
    state.rapid.nextAtDay = state.day + RAPID_INTERVAL_DAYS;
    addTicker(`${incidentCode}: ${scenario.title}`);
    addRailEvent(`🧠 ${incidentCode}`, "Truth Check live: read clues, then make the call.", true);
    if (shouldFocus) {
      setActiveSideTab("incidents");
      focusCameraOnTile(state.rapid.active.mapMarkerTile);
    }
    playSfx("warnMajor", { volumeMul: 0.85, throttleMs: 600 });
    return;
  }
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
  if (shouldFocus) {
    setActiveSideTab("incidents");
    focusCameraOnTile(state.rapid.active.mapMarkerTile);
  }
  playSfx("warnMajor", { volumeMul: 0.85, throttleMs: 600 });
}

function resolveRapid(choice, timedOut = false) {
  const active = state.rapid.active;
  if (!active) return;
  let scenarioTruthQuality = null;
  if (active.mode === "scenario" && Array.isArray(active.options)) {
    const picked = active.options.find((o) => o.key === choice) || active.options[0];
    applyDemographicShiftMap(picked.dem_now || {});
    applyKpiShiftMap(picked.kpi_now || {});
    state.budget.treasury = round(state.budget.treasury + (picked.treasury_delta_now || 0));
    const truthQuality = Number.isFinite(picked.truth_quality) ? picked.truth_quality : null;
    scenarioTruthQuality = truthQuality;
    if (truthQuality !== null) {
      state.truth.total += 1;
      if (truthQuality > 0) {
        state.truth.wins += 1;
        state.truth.streak += 1;
        state.truth.bestStreak = Math.max(state.truth.bestStreak, state.truth.streak);
      } else if (truthQuality < 0) {
        state.truth.misses += 1;
        state.truth.played += 1;
        state.truth.streak = 0;
      } else {
        state.truth.neutral += 1;
      }
      const ratio = state.truth.wins / Math.max(1, state.truth.total);
      state.truth.score = clamp(round(ratio * 100 + Math.min(10, state.truth.streak * 1.5) - state.truth.played * 0.8), 0, 100);
      if (state.truth.streak > 0 && state.truth.streak % 3 === 0) {
        state.resources.actionPoints = clamp(state.resources.actionPoints + 1, 0, state.resources.maxActionPoints);
        addApToast("+1 AP", "up");
        pulseActionPill();
        addTicker(`Credibility streak x${state.truth.streak}: bonus action point.`);
      }
      const speaker = active.speaker || "Unknown Source";
      if (!state.truth.speakerReads[speaker]) {
        state.truth.speakerReads[speaker] = { right: 0, wrong: 0, neutral: 0 };
      }
      if (truthQuality > 0) state.truth.speakerReads[speaker].right += 1;
      else if (truthQuality < 0) state.truth.speakerReads[speaker].wrong += 1;
      else state.truth.speakerReads[speaker].neutral += 1;
      const verdictLabel = truthVerdict(truthQuality);
      const verdictKind = verdictLabel === "RIGHT" ? "good" : verdictLabel === "WRONG" ? "bad" : "neutral";
      const verdictMsg =
        verdictLabel === "RIGHT"
          ? `GOOD CALL · ${shorten(picked.outcome_blurb || "You read the room correctly.", 62)}`
          : verdictLabel === "WRONG"
            ? `YOU GOT PLAYED · ${shorten(picked.outcome_blurb || "Narrative trap landed.", 62)}`
            : `FAIR HOLD · ${shorten(picked.outcome_blurb || "Data was mixed; neutral call.", 62)}`;
      addDecisionToast(verdictMsg, verdictKind);
      if (!timedOut) {
        if (verdictLabel === "RIGHT") playSfx("uiPositive");
        else if (verdictLabel === "WRONG") playSfx("uiNegative");
        else playSfx("uiConfirm");
      }
    }
    logDecisionImpact({
      title: active.title,
      category: "scenario",
      choice: picked.label || "Scenario choice",
      demNow: picked.dem_now || emptyDemImpact(),
      trustDelta: picked.trust_delta || 0,
      axisDrift: picked.axis_drift || emptyAxisImpact(),
      treasuryDeltaNow: picked.treasury_delta_now || 0,
      kpiNow: picked.kpi_now || {},
      riskFlags: picked.risk_flags || [],
      confidence: "medium",
      explain: `Scenario judgment applied via ${picked.id || "policy"} response.`,
      truthQuality,
    });
  } else if (choice === "a") active.applyA(state);
  else active.applyB(state);

  if (active.incidentCode?.startsWith("DEBATE-")) {
    let swing = 0;
    if (timedOut) swing = -0.35;
    else if (scenarioTruthQuality > 0) swing = 0.65;
    else if (scenarioTruthQuality < 0) swing = -0.75;
    else swing = 0.12;
    state.election.momentum = clamp(state.election.momentum + swing, -4, 4);
    addDecisionToast(`Campaign swing ${swing >= 0 ? "+" : ""}${round(swing * 6)}`, swing > 0 ? "good" : swing < 0 ? "bad" : "neutral");
  }

  if (!timedOut) {
    state.rapid.momentum = clamp(state.rapid.momentum + 1, 0, 12);
    awardStreak("rapid decision");
    markOnboarding("rapidResolved");
    recordAction(choice === "a" ? "integrity" : choice === "b" ? "security" : "treasury");
    state.monthly.stats.rapidDirect += 1;
  } else {
    state.rapid.momentum = clamp(state.rapid.momentum - 1, 0, 12);
    breakStreak("timed out rapid brief");
    state.monthly.stats.rapidAuto += 1;
  }

  const label = timedOut ? "🤖 Auto decision applied due to timeout." : "✅ Player rapid decision resolved.";
  addTicker(`${active.incidentCode}: ${active.title} - ${label}`);
  addRailEvent(timedOut ? "🤖 Rapid Auto-Resolved" : "✅ Rapid Player-Resolved", `${active.incidentCode}: ${active.title}`, timedOut);
  if (!timedOut && active.mode !== "scenario") {
    const supportive = choice === "a";
    const dem = emptyDemImpact();
    dem.poverty += supportive ? 2 : -2;
    dem.working += supportive ? 2 : -2;
    dem.middle += supportive ? 1 : -1;
    dem.business += supportive ? -1 : 1;
    dem.elite += supportive ? -1 : 1;
    const trustDelta = supportive ? 0.5 : -0.5;
    logDecisionImpact({
      title: active.title,
      category: "rapid",
      choice: supportive ? active.a : active.b,
      demNow: dem,
      trustDelta,
      axisDrift: {
        careAusterity: supportive ? 1 : -1,
        libertyControl: active.title.includes("Corruption") ? -0.2 : 0,
        publicDonor: supportive ? 0.2 : -0.2,
        truthSpin: active.title.includes("Corruption") && supportive ? 0.6 : -0.2,
      },
      treasuryDeltaNow: 0,
      kpiNow: { stability: supportive ? 0.6 : -0.6 },
      riskFlags: supportive ? [] : ["short_term_saving_long_term_risk"],
      confidence: "medium",
      explain: supportive ? "You absorbed short-term cost for resilience." : "You protected short-run spend but raised deferred risk.",
    });
  }
  if (timedOut) playSfx("uiNegative");
  else if (active.mode !== "scenario") playSfx("uiConfirm");
  state.rapid.active = null;
  updateTutorialProgress();
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

function axisDriftTag(axis) {
  const top = Object.entries(axis || {}).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
  if (!top || Math.abs(top[1]) < 0.2) return "Drift: Balanced";
  const labelMap = {
    careAusterity: top[1] > 0 ? "Care+" : "Austerity+",
    libertyControl: top[1] > 0 ? "Liberty+" : "Control+",
    publicDonor: top[1] > 0 ? "Public+" : "Donor+",
    truthSpin: top[1] > 0 ? "Truth+" : "Spin+",
  };
  return `Drift: ${labelMap[top[0]] || "Balanced"}`;
}

function computeDecisionPriority(decision) {
  const sumDem = Object.values(decision.demNow || {}).reduce((a, v) => a + Math.abs(v), 0);
  const sumKpi = Object.values(decision.kpiNow || {}).reduce((a, v) => a + Math.abs(v), 0);
  const riskWeight = (decision.riskFlags || []).length * 1.4;
  return round(0.35 * sumDem + 0.25 * Math.abs(decision.trustDelta || 0) + 0.2 * sumKpi + 0.2 * riskWeight);
}

function logDecisionImpact({
  title,
  category = "governance",
  choice = "Applied",
  demNow = emptyDemImpact(),
  kpiNow = {},
  treasuryDeltaNow = 0,
  trustDelta = 0,
  axisDrift = emptyAxisImpact(),
  riskFlags = [],
  confidence = "medium",
  explain = "",
  truthQuality = null,
}) {
  const persistence = category === "integrity" || category === "education" || category === "climate" ? 0.62 : 0.48;
  const dem30 = Object.fromEntries(Object.entries(demNow).map(([k, v]) => [k, round(v * persistence)]));
  for (const key of IDENTITY_AXIS_KEYS) {
    state.ideology[key] = clamp(state.ideology[key] + (axisDrift[key] || 0), -100, 100);
  }
  state.ideology.trust = clamp(state.ideology.trust + trustDelta, 0, 100);
  const decision = {
    id: `dec_${state.day}_${Math.floor(Math.random() * 10000)}`,
    day: state.day,
    title,
    category,
    choice,
    demNow,
    dem30,
    trustDelta: round(trustDelta),
    axisDrift,
    treasuryDeltaNow: round(treasuryDeltaNow),
    kpiNow,
    riskFlags,
    confidence,
    explain: explain || "Decision effects are unfolding across demographics.",
    truthQuality,
    truthVerdict: truthQuality === null ? null : truthVerdict(truthQuality),
  };
  decision.priority = computeDecisionPriority(decision);
  state.decisionLog.push(decision);
  state.decisionLog = state.decisionLog.slice(-240);
  const demSummary = [
    ["Pov", demNow.poverty || 0],
    ["Work", demNow.working || 0],
    ["Mid", demNow.middle || 0],
    ["Biz", demNow.business || 0],
    ["Elite", demNow.elite || 0],
  ]
    .filter(([, v]) => Math.abs(v) > 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 3)
    .map(([k, v]) => `${k} ${v > 0 ? "+" : ""}${round(v)}`);
  if (demSummary.length) {
    const score = Object.values(demNow).reduce((a, v) => a + v, 0);
    addDecisionToast(`${shorten(title, 26)} · ${demSummary.join("  ")}`, score >= 0 ? "good" : "bad");
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

function foundationValue(id) {
  const transport = findBuilding("transport");
  const treasury = findBuilding("treasury");
  const education = findBuilding("education");
  const welfare = findBuilding("welfare");
  const climate = findBuilding("climate");
  const integrity = findBuilding("integrity");
  const reliability =
    id === "power"
      ? state.kpi.climate * 0.34 + state.kpi.economy * 0.18 + (transport?.level || 1) * 5 + (treasury?.budget || 60) * 0.15
      : id === "freight"
        ? state.kpi.economy * 0.36 + (transport?.budget || 60) * 0.36 + (transport?.level || 1) * 6 + (treasury?.level || 1) * 4
        : id === "skills"
          ? state.kpi.education * 0.4 + (education?.budget || 60) * 0.3 + (welfare?.budget || 60) * 0.14 + (education?.level || 1) * 7
          : id === "water"
            ? state.kpi.climate * 0.42 + (climate?.budget || 60) * 0.28 + (transport?.budget || 60) * 0.18
            : state.kpi.integrity * 0.48 + state.kpi.stability * 0.24 + (integrity?.budget || 60) * 0.2 + (treasury?.level || 1) * 3;
  return clamp(round(reliability), 0, 100);
}

function updateFoundations() {
  for (const f of FOUNDATION_DEFS) {
    state.industry.foundations[f.id] = foundationValue(f.id);
  }
}

function industryTierAllowed(project) {
  return state.tierIndex >= project.tier;
}

function projectById(id) {
  return INDUSTRY_PROJECT_DEFS.find((p) => p.id === id);
}

function chooseDepartmentPlacement(id, source = "toolbox") {
  const b = findBuilding(id);
  if (!b || b.placed) return false;
  state.ui.housingPlacement = null;
  state.ui.industryPlacement = null;
  state.ui.defensePlacement = null;
  state.selectedIndustryId = null;
  state.selectedDefenseId = null;
  state.ui.placementBuildingId = id;
  state.ui.placementRecommendations = computePlacementRecommendations(id);
  if (!state.ui.foundingFirstPickDone) {
    state.ui.foundingFirstPickDone = true;
    state.ui.toolboxSpotlightUntilMs = 0;
    state.ui.mapRevealUntilMs = Date.now() + 1400;
  }
  addTicker(`${source === "setup" ? "Founding" : "Placement"} armed: ${b.name}. Click a map tile.`);
  return true;
}

function defenseBaseById(id) {
  return state.defense.bases.find((b) => b.id === id);
}

function defenseTypeById(id) {
  return DEFENSE_BASE_DEFS.find((d) => d.id === id);
}

function defenseTierAllowed(def) {
  return state.tierIndex >= (def?.tier ?? 0);
}

function defenseNetSignal(days = 14) {
  const h = state.netHistory || [];
  if (!h.length) return 0;
  const slice = h.slice(-days);
  return round(slice.reduce((a, v) => a + v, 0) / Math.max(1, slice.length));
}

function recommendedIndustryProjectId() {
  const unlocked = INDUSTRY_PROJECT_DEFS.filter((p) => industryTierAllowed(p));
  if (unlocked.length === 0) return null;
  const affordable = unlocked.filter((p) => state.budget.treasury >= round(p.cost * 0.55));
  const pool = affordable.length ? affordable : unlocked;
  return pool
    .slice()
    .sort((a, b) => a.size - b.size || a.cost - b.cost)[0]?.id || null;
}

function findIndustryZone(id) {
  return state.industry.zones.find((z) => z.id === id);
}

function canPlaceIndustryZone(tile, size) {
  const sx = Math.round(tile[0] - (size - 1) / 2);
  const sy = Math.round(tile[1] - (size - 1) / 2);
  for (let x = sx; x < sx + size; x += 1) {
    for (let y = sy; y < sy + size; y += 1) {
      if (!isTileBuildable(x, y)) return null;
      if (isRailTile(x, y)) return null;
      if (!isDevelopedTile(x, y, 0.6)) return null;
    }
  }
  return { x: sx, y: sy };
}

function resolveIndustryPlacementAnchor(tile, size) {
  if (!Array.isArray(tile)) return null;
  const direct = canPlaceIndustryZone(tile, size);
  if (direct) return direct;

  let best = null;
  for (let dx = -4; dx <= 4; dx += 1) {
    for (let dy = -4; dy <= 4; dy += 1) {
      const probe = [tile[0] + dx, tile[1] + dy];
      const anchor = canPlaceIndustryZone(probe, size);
      if (!anchor) continue;
      const dist = tileDist(tile, [anchor.x + (size - 1) / 2, anchor.y + (size - 1) / 2]);
      const score = -dist;
      if (!best || score > best.score) best = { anchor, score };
    }
  }
  return best?.anchor || null;
}

function chooseIndustryProject(id) {
  const p = projectById(id);
  if (!p) {
    playSfx("uiDenied");
    return;
  }
  state.industry.selectedProjectId = id;
  state.ui.placementBuildingId = null;
  state.ui.housingPlacement = null;
  state.ui.defensePlacement = null;
  state.selectedBuildingId = null;
  state.selectedIndustryId = null;
  state.selectedDefenseId = null;
  if (!industryTierAllowed(p)) {
    addTicker(`${p.name} is locked until ${TIER_CONFIG[p.tier].name} tier.`);
    state.ui.industryPlacement = null;
    playSfx("uiDenied");
    return;
  }
  state.ui.industryPlacement = { projectId: id, size: p.size };
  focusControlPanel();
  focusCameraOnTile([CITY_CORE_TILE[0], CITY_CORE_TILE[1]]);
  const deposit = round(p.cost * 0.55);
  if (state.budget.treasury < deposit) {
    addTicker(`Industry placement armed: ${p.name}. Need ${formatMoneyMillions(deposit)} deposit when you place.`);
  } else {
    addTicker(`Industry placement armed: ${p.name} (${p.size}x${p.size}).`);
  }
  playSfx("uiSelect");
}

function placeIndustryZone(tile) {
  const mode = state.ui.industryPlacement;
  if (!mode) return false;
  const project = projectById(mode.projectId);
  if (!project) return false;
  const anchor = resolveIndustryPlacementAnchor(tile, project.size);
  if (!anchor) return false;

  const deposit = round(project.cost * 0.55);
  if (state.budget.treasury < deposit) {
    addTicker(`Need ${formatMoneyMillions(deposit)} treasury deposit to place ${project.name}.`);
    playSfx("uiDenied");
    return false;
  }
  state.budget.treasury -= deposit;
  const zone = {
    id: `ind_${project.id}_${state.day}_${Math.floor(Math.random() * 9999)}`,
    projectId: project.id,
    name: project.name,
    x: anchor.x,
    y: anchor.y,
    size: project.size,
    status: "building",
    level: 1,
    startDay: state.day,
    completeDay: state.day + project.buildDays,
    paid: deposit,
    efficiency: 0,
    output: 0,
    why: [],
  };
  state.industry.zones.push(zone);
  invalidateSpatialTileCache();
  state.buildQueue.push({ id: zone.id, name: `${project.name} Build`, completeDay: zone.completeDay, cost: deposit, type: "industry" });
  state.ui.industryPlacement = null;
  initDecorProps();
  normalizeTrafficLanes();
  addRailEvent("🏭 Ground Broken", `${project.name} started (${project.size}x${project.size})`, true);
  addTicker(`${project.name} construction started. Completion in ${project.buildDays} days.`);
  playSfx("placeBasic", { throttleMs: 80 });
  if (project.size >= 4) playSfx("buildHigh", { volumeMul: 0.72, throttleMs: 80 });
  else if (project.size >= 3) playSfx("buildMid", { volumeMul: 0.72, throttleMs: 80 });
  else playSfx("buildLow", { volumeMul: 0.72, throttleMs: 80 });
  updateTutorialProgress();
  return true;
}

function hasRoadAdjacency(zone) {
  for (let x = zone.x - 1; x <= zone.x + zone.size; x += 1) {
    if (isRoadTile(x, zone.y - 1) || isRoadTile(x, zone.y + zone.size)) return true;
  }
  for (let y = zone.y - 1; y <= zone.y + zone.size; y += 1) {
    if (isRoadTile(zone.x - 1, y) || isRoadTile(zone.x + zone.size, y)) return true;
  }
  return false;
}

function evaluateIndustryZone(zone) {
  const project = projectById(zone.projectId);
  if (!project) return { eff: 0, revenue: 0, upkeep: 0, why: ["Unknown project"] };
  const missing = [];
  let shortage = 0;
  for (const [need, min] of Object.entries(project.needs)) {
    const got = state.industry.foundations[need] || 0;
    if (got < min) {
      const gap = min - got;
      shortage += gap;
      missing.push(`${need} -${Math.round(gap)}`);
    }
  }
  const roadAdj = hasRoadAdjacency(zone) ? 1 : 0;
  if (!roadAdj) missing.push("road access");
  const footprintPenalty = project.size >= 4 && cityRadius() < 14 ? 0.12 : 0;
  const baseEff = 1 - shortage / 220 - (roadAdj ? 0 : 0.12) - footprintPenalty;
  const eff = clamp(baseEff, 0.16, 1.12);
  const lvl = Math.max(1, zone.level || 1);
  const revenue = round(project.baseRevenue * eff * (0.9 + lvl * 0.2));
  const upkeep = round(project.baseUpkeep * (0.75 + eff * 0.45) * (0.85 + lvl * 0.18));
  return { eff, revenue, upkeep, why: missing };
}

function industryUpgradeCostDays(zone) {
  const p = projectById(zone.projectId);
  if (!p) return { cost: 0, days: 0 };
  const lvl = Math.max(1, zone.level || 1);
  return {
    cost: round(p.cost * 0.33 + lvl * 16),
    days: 5 + lvl * 2,
  };
}

function upgradeSelectedIndustry() {
  const z = findIndustryZone(state.selectedIndustryId);
  if (!z) return;
  if (z.status !== "active") {
    addTicker("Facility must be active before upgrading.");
    return;
  }
  if ((z.level || 1) >= 5) {
    addTicker(`${z.name} is already max level.`);
    return;
  }
  const { cost, days } = industryUpgradeCostDays(z);
  if (!spendActionPoints(2, "industry upgrade")) return;
  if (state.budget.treasury < cost) {
    state.resources.actionPoints = clamp(state.resources.actionPoints + 2, 0, state.resources.maxActionPoints);
    addTicker(`Need ${formatMoneyMillions(cost)} to upgrade ${z.name}.`);
    return;
  }
  state.budget.treasury -= cost;
  z.status = "upgrading";
  z.startDay = state.day;
  z.completeDay = state.day + days;
  z.targetLevel = (z.level || 1) + 1;
  state.buildQueue.push({
    id: `upg_${z.id}_${state.day}`,
    name: `${z.name} upgrade to L${z.targetLevel}`,
    completeDay: z.completeDay,
    cost,
    type: "industry-upgrade",
  });
  addTicker(`${z.name} upgrade started. ${days} days.`);
  addRailEvent("🏭 Facility Upgrade", `${z.name} upgrading to level ${z.targetLevel}.`, true);
}

function updateIndustryPerDay() {
  updateFoundations();
  let totalRevenue = 0;
  let totalUpkeep = 0;
  let utilizationAcc = 0;
  let activeCount = 0;
  const globalMissing = new Map();

  for (const zone of state.industry.zones) {
    const project = projectById(zone.projectId);
    if (!project) continue;
    const queueItem = state.buildQueue.find((q) => q.id === zone.id);
    const upgradeQueueItem = state.buildQueue.find((q) => q.id === `upg_${zone.id}_${zone.startDay}`);
    if (zone.status === "building" && state.day >= zone.completeDay) {
      const remaining = Math.max(0, round(project.cost - zone.paid));
      if (state.budget.treasury >= remaining) {
        state.budget.treasury -= remaining;
        zone.status = "active";
        zone.paid = project.cost;
        if (queueItem) queueItem.completeDay = state.day;
        addTicker(`${project.name} is now online.`);
        addRailEvent("✅ Project Online", `${project.name} completed and entered production.`, true);
        if (project.size >= 4) playSfx("buildHigh", { volumeMul: 0.86, throttleMs: 120 });
        else if (project.size >= 3) playSfx("buildMid", { volumeMul: 0.84, throttleMs: 120 });
        else playSfx("buildLow", { volumeMul: 0.82, throttleMs: 120 });
      } else {
        zone.completeDay += 3;
        if (queueItem) queueItem.completeDay = zone.completeDay;
        zone.why = [`Funding gap ${formatMoneyMillions(remaining)}`];
        addTicker(`${project.name} delayed: need ${formatMoneyMillions(remaining)} completion funds.`);
      }
    }
    if (zone.status === "upgrading" && state.day >= zone.completeDay) {
      zone.level = Math.max(zone.level || 1, zone.targetLevel || (zone.level || 1));
      zone.targetLevel = null;
      zone.status = "active";
      if (upgradeQueueItem) upgradeQueueItem.completeDay = state.day;
      addTicker(`${project.name} upgrade completed (L${zone.level}).`);
      addRailEvent("✅ Upgrade Online", `${project.name} is now level ${zone.level}.`, false);
      playSfx("upgrade");
    }
    if (zone.status !== "active") continue;
    activeCount += 1;
    const r = evaluateIndustryZone(zone);
    zone.efficiency = r.eff;
    zone.output = r.revenue - r.upkeep;
    zone.why = r.why;
    totalRevenue += r.revenue;
    totalUpkeep += r.upkeep;
    utilizationAcc += r.eff;
    for (const w of r.why) globalMissing.set(w, (globalMissing.get(w) || 0) + 1);
  }

  const utilization = activeCount ? utilizationAcc / activeCount : 0;
  state.industry.metrics = {
    revenue: round(totalRevenue),
    upkeep: round(totalUpkeep),
    net: round(totalRevenue - totalUpkeep),
    utilization: round(utilization * 100),
    missing: [...globalMissing.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k).slice(0, 3),
  };
}

function canPlaceDefenseZone(tile, size, ignoreBaseId = null) {
  const sx = Math.round(tile[0] - (size - 1) / 2);
  const sy = Math.round(tile[1] - (size - 1) / 2);
  if (sx < 1 || sy < 1 || sx + size > MAP_W - 1 || sy + size > MAP_H - 1) return null;
  for (let x = sx; x < sx + size; x += 1) {
    for (let y = sy; y < sy + size; y += 1) {
      if (!isDevelopedTile(x, y, 0.7)) return null;
      if (isRailTile(x, y)) return null;
      if (state.buildings.some((b) => b.placed && b.tile && b.tile[0] === x && b.tile[1] === y)) return null;
      if (isHousingTile(x, y) || isIndustryTile(x, y)) return null;
      const occupiedByOtherDefense = state.defense.bases.some((z) => z.id !== ignoreBaseId && x >= z.x && x < z.x + z.size && y >= z.y && y < z.y + z.size);
      if (occupiedByOtherDefense) return null;
    }
  }
  return { x: sx, y: sy };
}

function chooseDefenseBaseType(id) {
  const def = defenseTypeById(id);
  if (!def) {
    playSfx("uiDenied");
    return;
  }
  state.defense.selectedBaseTypeId = id;
  state.ui.placementBuildingId = null;
  state.ui.housingPlacement = null;
  state.ui.industryPlacement = null;
  state.selectedIndustryId = null;
  state.selectedBuildingId = null;
  state.selectedDefenseId = null;
  if (!defenseTierAllowed(def)) {
    addTicker(`${def.name} unlocks at ${TIER_CONFIG[def.tier].name} tier.`);
    state.ui.defensePlacement = null;
    playSfx("uiDenied");
    return;
  }
  state.ui.defensePlacement = { baseTypeId: id, size: def.size };
  focusControlPanel();
  focusCameraOnTile([CITY_CORE_TILE[0], CITY_CORE_TILE[1]]);
  const deposit = round(def.cost * 0.55);
  if (state.budget.treasury < deposit) {
    addTicker(`Defense placement armed: ${def.name}. Need ${formatMoneyMillions(deposit)} deposit when you place.`);
  } else {
    addTicker(`Defense placement armed: ${def.name} (${def.size}x${def.size}).`);
  }
  playSfx("uiSelect");
}

function placeDefenseZone(tile) {
  const mode = state.ui.defensePlacement;
  if (!mode) return false;
  const def = defenseTypeById(mode.baseTypeId);
  if (!def) return false;
  const anchor = canPlaceDefenseZone(tile, def.size);
  if (!anchor) return false;
  const deposit = round(def.cost * 0.55);
  if (state.budget.treasury < deposit) {
    addTicker(`Need ${formatMoneyMillions(deposit)} treasury deposit to place ${def.name}.`);
    playSfx("uiDenied");
    return false;
  }
  state.budget.treasury -= deposit;
  const base = {
    id: `def_${def.id}_${state.day}_${Math.floor(Math.random() * 9999)}`,
    baseTypeId: def.id,
    name: def.name,
    x: anchor.x,
    y: anchor.y,
    size: def.size,
    status: "building",
    level: 1,
    budget: 70,
    startDay: state.day,
    completeDay: state.day + def.buildDays,
    paid: deposit,
    readiness: 0,
  };
  state.defense.bases.push(base);
  invalidateSpatialTileCache();
  state.buildQueue.push({
    id: base.id,
    name: `${def.name} Build`,
    completeDay: base.completeDay,
    cost: deposit,
    type: "defense",
  });
  state.ui.defensePlacement = null;
  state.selectedDefenseId = base.id;
  addRailEvent("🛡️ Defense Ground Broken", `${def.name} started (${def.size}x${def.size}).`, true);
  addTicker(`${def.name} construction started. Completion in ${def.buildDays} days.`);
  playSfx("placeBasic", { throttleMs: 80 });
  if (def.size >= 4) playSfx("buildHigh", { volumeMul: 0.72, throttleMs: 80 });
  else if (def.size >= 3) playSfx("buildMid", { volumeMul: 0.72, throttleMs: 80 });
  else playSfx("buildLow", { volumeMul: 0.72, throttleMs: 80 });
  initDecorProps();
  normalizeTrafficLanes();
  return true;
}

function defenseUpgradeCostDays(base) {
  const def = defenseTypeById(base.baseTypeId);
  if (!def) return { cost: 0, days: 0 };
  const lvl = Math.max(1, base.level || 1);
  return {
    cost: round(def.cost * 0.3 + lvl * 14 + Math.max(0, base.size - def.size) * 4),
    days: 6 + lvl * 2,
  };
}

function defenseExpandCostDays(base) {
  const def = defenseTypeById(base.baseTypeId);
  if (!def) return { cost: 0, days: 0 };
  const nextSize = Math.min(24, (base.size || def.size) + 1);
  return {
    cost: round(def.cost * 0.24 + nextSize * 6 + (base.level || 1) * 4),
    days: 4 + Math.ceil(nextSize * 0.8),
    nextSize,
  };
}

function upgradeSelectedDefenseBase() {
  const base = defenseBaseById(state.selectedDefenseId);
  if (!base) return;
  if (base.status !== "active") {
    addTicker("Base must be active before upgrading.");
    return;
  }
  if ((base.level || 1) >= 5) {
    addTicker(`${base.name} is already max level.`);
    return;
  }
  const { cost, days } = defenseUpgradeCostDays(base);
  if (!spendActionPoints(2, "defense base upgrade")) return;
  if (state.budget.treasury < cost) {
    state.resources.actionPoints = clamp(state.resources.actionPoints + 2, 0, state.resources.maxActionPoints);
    addTicker(`Need ${formatMoneyMillions(cost)} to upgrade ${base.name}.`);
    return;
  }
  state.budget.treasury -= cost;
  base.status = "upgrading";
  base.startDay = state.day;
  base.completeDay = state.day + days;
  base.targetLevel = (base.level || 1) + 1;
  state.buildQueue.push({
    id: `upg_${base.id}_${state.day}`,
    name: `${base.name} upgrade to L${base.targetLevel}`,
    completeDay: base.completeDay,
    cost,
    type: "defense-upgrade",
  });
  addTicker(`${base.name} upgrade started. ${days} days.`);
  addRailEvent("🛡️ Base Upgrade", `${base.name} upgrading to level ${base.targetLevel}.`, true);
}

function expandSelectedDefenseBase() {
  const base = defenseBaseById(state.selectedDefenseId);
  if (!base) return;
  if (base.status !== "active") {
    addTicker("Base must be active before expansion.");
    return;
  }
  const { cost, days, nextSize } = defenseExpandCostDays(base);
  if ((base.size || 0) >= 24) {
    addTicker(`${base.name} has reached max footprint (24x24).`);
    return;
  }
  const anchor = canPlaceDefenseZone([base.x + (nextSize - 1) / 2, base.y + (nextSize - 1) / 2], nextSize, base.id);
  if (!anchor) {
    addTicker(`Expansion blocked around ${base.name}. Clear nearby land before expanding.`);
    return;
  }
  if (!spendActionPoints(2, "defense expansion")) return;
  if (state.budget.treasury < cost) {
    state.resources.actionPoints = clamp(state.resources.actionPoints + 2, 0, state.resources.maxActionPoints);
    addTicker(`Need ${formatMoneyMillions(cost)} to expand ${base.name}.`);
    return;
  }
  state.budget.treasury -= cost;
  base.status = "expanding";
  base.startDay = state.day;
  base.completeDay = state.day + days;
  base.targetSize = nextSize;
  base.nextAnchor = anchor;
  state.buildQueue.push({
    id: `exp_${base.id}_${state.day}`,
    name: `${base.name} expansion to ${nextSize}x${nextSize}`,
    completeDay: base.completeDay,
    cost,
    type: "defense-expand",
  });
  addTicker(`${base.name} expansion started (${nextSize}x${nextSize}).`);
  addRailEvent("🧱 Base Expansion", `${base.name} footprint expanding to ${nextSize}x${nextSize}.`, true);
}

function updateDefensePerDay() {
  const security = findBuilding("security");
  const integrity = findBuilding("integrity");
  const climate = findBuilding("climate");
  const transport = findBuilding("transport");
  let upkeep = 0;
  let readinessAcc = 0;
  let activeCount = 0;

  for (const base of state.defense.bases) {
    const def = defenseTypeById(base.baseTypeId);
    if (!def) continue;
    const queueItem = state.buildQueue.find((q) => q.id === base.id);
    const upgradeQueueItem = state.buildQueue.find((q) => q.id === `upg_${base.id}_${base.startDay}`);
    const expandQueueItem = state.buildQueue.find((q) => q.id === `exp_${base.id}_${base.startDay}`);

    if (base.status === "building" && state.day >= base.completeDay) {
      const remaining = Math.max(0, round(def.cost - base.paid));
      if (state.budget.treasury >= remaining) {
        state.budget.treasury -= remaining;
        base.status = "active";
        base.paid = def.cost;
        if (queueItem) queueItem.completeDay = state.day;
        addTicker(`${base.name} is now operational.`);
        if (base.size >= 4) playSfx("buildHigh", { volumeMul: 0.86, throttleMs: 120 });
        else if (base.size >= 3) playSfx("buildMid", { volumeMul: 0.84, throttleMs: 120 });
        else playSfx("buildLow", { volumeMul: 0.82, throttleMs: 120 });
      } else {
        base.completeDay += 3;
        if (queueItem) queueItem.completeDay = base.completeDay;
        addTicker(`${base.name} delayed: need ${formatMoneyMillions(remaining)} completion funds.`);
      }
    }
    if (base.status === "upgrading" && state.day >= base.completeDay) {
      base.level = Math.max(base.level || 1, base.targetLevel || (base.level || 1));
      base.targetLevel = null;
      base.status = "active";
      if (upgradeQueueItem) upgradeQueueItem.completeDay = state.day;
      addTicker(`${base.name} upgrade completed (L${base.level}).`);
      playSfx("upgrade");
    }
    if (base.status === "expanding" && state.day >= base.completeDay) {
      base.size = Math.max(base.size || 1, base.targetSize || (base.size || 1));
      if (base.nextAnchor) {
        base.x = base.nextAnchor.x;
        base.y = base.nextAnchor.y;
      }
      base.targetSize = null;
      base.nextAnchor = null;
      base.status = "active";
      if (expandQueueItem) expandQueueItem.completeDay = state.day;
      addTicker(`${base.name} footprint expanded to ${base.size}x${base.size}.`);
      invalidateSpatialTileCache();
      playSfx("buildMid", { volumeMul: 0.84, throttleMs: 120 });
      initDecorProps();
      normalizeTrafficLanes();
    }

    if (base.status !== "active") continue;
    activeCount += 1;
    const level = Math.max(1, base.level || 1);
    const scale = Math.max(1, base.size || def.size);
    const budget = base.budget || 70;
    const civicSupport =
      (security?.budget || 60) * 0.18 +
      (integrity?.budget || 60) * 0.18 +
      (transport?.budget || 60) * 0.12 +
      (climate?.budget || 60) * 0.1;
    const readiness = clamp(
      22 + level * 9.2 + scale * 2.1 + (budget - 70) * 0.55 + civicSupport * 0.12 + state.kpi.integrity * 0.16 + state.kpi.safety * 0.14,
      8,
      100
    );
    base.readiness = round(readiness);
    readinessAcc += base.readiness;
    upkeep += def.baseUpkeep * (0.8 + level * 0.22) * (0.8 + scale * 0.1) * (0.8 + budget / 180);
  }

  const avgReadiness = activeCount ? readinessAcc / activeCount : 32;
  const netRisk = clamp(1 - avgReadiness / 100, 0.08, 0.92);
  state.defense.metrics = {
    upkeep: round(upkeep),
    readiness: round(avgReadiness),
    netRisk: round(netRisk),
  };
}

function canPlaceHousingZone(tile, size) {
  const sx = Math.round(tile[0] - (size - 1) / 2);
  const sy = Math.round(tile[1] - (size - 1) / 2);
  for (let x = sx; x < sx + size; x += 1) {
    for (let y = sy; y < sy + size; y += 1) {
      if (!isTileBuildable(x, y)) return null;
      if (isRailTile(x, y)) return null;
    }
  }
  return { x: sx, y: sy };
}

function spawnHousingMandate() {
  if (state.housing.active) return;
  const id = `house_${state.day}_${Math.floor(Math.random() * 10000)}`;
  state.housing.active = {
    id,
    title: "Housing Supply Crisis",
    body: "Affordability pressure is rising. Approve a footprint size and place it on the map.",
    expiresDay: state.day + 14,
    size: null,
    costBySize: { 2: 14, 3: 26, 4: 42 },
  };
  addTicker("Housing mandate issued: choose development size and place it on the map.");
  addRailEvent("🏘️ Housing Mandate", "Select 2x2, 3x3, or 4x4 footprint, then place on map.", true);
}

function maybeSpawnHousingMandate() {
  if (!state.sim.started || state.housing.active) return;
  if (state.day < state.housing.nextAtDay) return;
  const housingPressure =
    clamp((62 - state.people.find((p) => p.id === "poverty")?.happiness || 0) / 62, 0, 1) +
    clamp((58 - state.people.find((p) => p.id === "working")?.happiness || 0) / 58, 0, 1);
  const chance = 0.32 + Math.min(0.4, housingPressure * 0.22);
  if (Math.random() < chance) spawnHousingMandate();
  state.housing.nextAtDay = state.day + 26 + Math.floor(Math.random() * 20);
}

function chooseHousingFootprint(size) {
  const m = state.housing.active;
  if (!m) return;
  m.size = size;
  focusControlPanel();
  state.ui.housingPlacement = { mandateId: m.id, size };
  state.ui.placementBuildingId = null;
  state.ui.industryPlacement = null;
  state.ui.defensePlacement = null;
  state.selectedIndustryId = null;
  state.selectedDefenseId = null;
  state.ui.placementRecommendations = [];
  addTicker(`Housing footprint selected: ${size}x${size}. Click map to place.`);
}

function placeHousingZone(tile) {
  const m = state.housing.active;
  const mode = state.ui.housingPlacement;
  if (!m || !mode || mode.mandateId !== m.id || !m.size) return false;
  const anchor = canPlaceHousingZone(tile, m.size);
  if (!anchor) return false;
  const cost = m.costBySize[m.size] || (m.size * m.size * 2);
  if (state.budget.treasury < cost) {
    addTicker(`Need ${formatMoneyMillions(cost)} treasury to place ${m.size}x${m.size} housing.`);
    playSfx("uiDenied");
    return false;
  }
  state.budget.treasury -= cost;
  state.housing.zones.push({ x: anchor.x, y: anchor.y, size: m.size, dayPlaced: state.day });
  invalidateSpatialTileCache();
  const area = m.size * m.size;
  const demNow = {
    poverty: round(1.2 + area * 0.35),
    working: round(0.9 + area * 0.28),
    middle: round(area >= 9 ? -0.3 : 0.2),
    business: round(area >= 16 ? -0.5 : 0.1),
    elite: round(area >= 16 ? -0.8 : 0),
  };
  applyDemographicShiftMap(demNow, 1);
  applyKpiShiftMap({ stability: 0.6 + area * 0.08, health: 0.25 + area * 0.05, climate: -0.1 * m.size, economy: 0.18 + area * 0.04 });
  logDecisionImpact({
    title: "Housing Development Approved",
    category: "welfare",
    choice: `${m.size}x${m.size} Zone`,
    demNow,
    kpiNow: { stability: 0.5 + area * 0.07, economy: 0.2 + area * 0.04, climate: -0.08 * m.size },
    treasuryDeltaNow: -cost,
    trustDelta: 0.7,
    axisDrift: { careAusterity: 1.1, libertyControl: 0.1, publicDonor: 0.4, truthSpin: 0.2 },
    confidence: "medium",
    explain: "Housing supply expansion reduced affordability stress, with short-term environmental/build costs.",
  });
  addRailEvent("🏗️ Housing Built", `${m.size}x${m.size} zone placed for ${formatMoneyMillions(cost)}.`, true);
  addTicker(`Housing zone placed (${m.size}x${m.size}).`);
  playSfx("placeBasic", { throttleMs: 80 });
  if (m.size >= 4) playSfx("buildHigh", { volumeMul: 0.72, throttleMs: 80 });
  else if (m.size >= 3) playSfx("buildMid", { volumeMul: 0.72, throttleMs: 80 });
  else playSfx("buildLow", { volumeMul: 0.72, throttleMs: 80 });
  state.housing.active = null;
  state.ui.housingPlacement = null;
  initDecorProps();
  normalizeTrafficLanes();
  return true;
}

function updateHousingMandatePerDay() {
  const m = state.housing.active;
  if (!m) return;
  if (state.day <= m.expiresDay) return;
  const penalty = m.size ? 0.8 : 1.4;
  applyDemographicShiftMap({ poverty: -2.5 * penalty, working: -2.1 * penalty, middle: -0.8 * penalty, business: 0, elite: 0 }, 1);
  applyKpiShiftMap({ stability: -1.2 * penalty, economy: -0.6 * penalty }, 1);
  addTicker("Housing mandate expired without delivery. Affordability pressure increased.");
  addRailEvent("❌ Housing Missed", "No development placed before deadline.", true);
  state.housing.active = null;
  state.ui.housingPlacement = null;
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
  playSfx("warnMajor", { volumeMul: 0.92, throttleMs: 600 });
}

function maybeSpawnMajorEvent() {
  if (state.majorEvents.length >= MAX_ACTIVE_MAJOR_EVENTS) return;
  if (state.day < state.major.nextAtDay) return;
  const stress = clamp((100 - state.kpi.stability) / 100, 0, 1);
  const moodRisk = clamp((55 - state.people.reduce((a, p) => a + p.happiness, 0) / state.people.length) / 55, 0, 1);
  const chance = 0.14 + stress * 0.14 + moodRisk * 0.08;
  if (Math.random() > chance) {
    state.major.nextAtDay = state.day + Math.max(10, MAJOR_EVENT_INTERVAL_DAYS - 2);
    return;
  }
  spawnMajorEvent();
  state.major.nextAtDay = state.day + MAJOR_EVENT_INTERVAL_DAYS + Math.floor(rand(0, 8));
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
    playSfx("uiDenied");
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
  logDecisionImpact({
    title: ev.title,
    category: ev.domain || "major",
    choice: ev.response?.label || "Fund Response",
    demNow: ev.response?.dem || emptyDemImpact(),
    trustDelta: 0.8,
    axisDrift: {
      careAusterity: 1.2,
      libertyControl: ev.domain === "security" ? -0.4 : 0.2,
      publicDonor: 0.6,
      truthSpin: 0.3,
    },
    treasuryDeltaNow: -costCash,
    kpiNow: ev.response?.kpi || {},
    riskFlags: ev.domain === "security" ? ["rights_tradeoff_risk"] : [],
    confidence: "high",
    explain: ev.hint || "Intervention reduced compounding demographic damage.",
  });
  state.majorEvents = state.majorEvents.filter((x) => x.id !== ev.id);
  if (state.ui.focusedMajorEventId === ev.id) state.ui.focusedMajorEventId = null;
  playSfx("uiConfirm");
  playSfx("econDown", { volumeMul: 0.72, throttleMs: 120 });
}

function deferMajorEventCard(eventId) {
  const ev = state.majorEvents.find((x) => x.id === eventId);
  if (!ev) return;
  ev.snoozeUntilDay = state.day + 3;
  if (state.ui.focusedMajorEventId === ev.id) state.ui.focusedMajorEventId = null;
  addTicker(`Deferred briefing: ${ev.title}. Pressure is still active.`);
  playSfx("uiSelect");
}

function updateMajorEventsPerDay() {
  const keep = [];
  for (const ev of state.majorEvents) {
    const anchorId = majorEventAnchorBuildingId(ev.domain);
    const anchor = findBuilding(anchorId);
    const mitigation = anchor
      ? clamp(1 - Math.max(0, anchor.budget - 60) * 0.004 - Math.max(0, anchor.level - 1) * 0.035, 0.52, 1)
      : 1;
    applyDemographicShiftMap(ev.perDayDem, mitigation);
    applyServicePressureMap(ev.perDayKpi, mitigation);
    const daysLeft = ev.expiresDay - state.day;
    if (daysLeft <= 0) {
      applyDemographicShiftMap(ev.perDayDem, 2.1);
      applyServicePressureMap(ev.perDayKpi, 1.65);
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

function spawnIncident(forceTypeId = null, options = {}) {
  const type = forceTypeId
    ? INCIDENT_TYPES.find((t) => t.id === forceTypeId) || INCIDENT_TYPES[0]
    : INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)];
  const opts = options || {};

  const anchorMap = {
    health: "medical",
    safety: "crime",
    climate: "flood",
    integrity: "corruption",
    economy: "fire",
    defense_cyber: "cyber_grid_attack",
    defense_air: "airspace_incursion",
    defense_guard: "infra_sabotage",
  };

  const placedBuildings = state.buildings.filter((b) => b.placed);
  let targetBuilding = (placedBuildings.length ? placedBuildings : state.buildings)[Math.floor(Math.random() * (placedBuildings.length ? placedBuildings.length : state.buildings.length))];
  let targetTile = buildingTile(targetBuilding);
  const defenseActive = state.defense.bases.filter((b) => b.status === "active");
  if (type.id === "cyber_grid_attack" && defenseActive.length) {
    const b = defenseActive.find((x) => x.baseTypeId === "cyber") || defenseActive[0];
    targetTile = [b.x + b.size / 2, b.y + b.size / 2];
  } else if (type.id === "airspace_incursion" && defenseActive.length) {
    const b = defenseActive.find((x) => x.baseTypeId === "air") || defenseActive[0];
    targetTile = [b.x + b.size / 2, b.y + b.size / 2];
  } else if (type.id === "infra_sabotage" && defenseActive.length) {
    const b = defenseActive.find((x) => x.baseTypeId === "garrison") || defenseActive[0];
    targetTile = [b.x + b.size / 2, b.y + b.size / 2];
  }
  for (const b of state.buildings) {
    if (anchorMap[b.kpi] === type.id) {
      targetBuilding = b;
      targetTile = buildingTile(targetBuilding);
      break;
    }
  }

  const severity = Number.isFinite(opts.severity) ? clamp(Math.round(opts.severity), 1, 4) : 1 + Math.floor(Math.random() * 3);
  const highImpactType = new Set(["corruption"]);
  const autoOnlyType = new Set(["cyber_grid_attack", "airspace_incursion", "infra_sabotage"]);
  const inferredManual =
    !autoOnlyType.has(type.id) && (
      severity >= 3
    || highImpactType.has(type.id)
    || (severity === 2 && Math.random() < 0.3)
    );
  const requiresPlayerAction = Boolean(
    opts.requiresPlayerAction ?? opts.tutorialManual ?? inferredManual
  );

  const incident = {
    id: `inc_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    type,
    anchorBuildingId: targetBuilding?.id || null,
    tile: [targetTile[0] + rand(-1.5, 1.5), targetTile[1] + rand(-1.5, 1.5)],
    severity,
    daysOpen: 0,
    contained: false,
    resolved: false,
    resolveSec: 0,
    assignedResponderId: null,
    districtId: districtForTile(buildingTile(targetBuilding)),
    streakBroken: false,
    tutorialManual: Boolean(opts.tutorialManual),
    requiresPlayerAction,
  };

  state.incidents.push(incident);
  state.monthly.stats.incidentsSpawned += 1;
  const prefix = opts.codePrefix || "INCIDENT";
  const code = `${prefix}-${String(state.day).padStart(3, "0")}-${String(state.incidents.length).padStart(2, "0")}`;
  incident.code = code;
  addTicker(`${code}: ${incident.type.title} near ${targetBuilding.name}.`);
  addRailEvent(incident.type.title, incident.tutorialManual ? "Guided response: click the building alert badge to intervene." : "Manual response available on the affected building.", true);
  return incident;
}

function updateIncidentsPerDay() {
  const ease = onboardingEaseFactor();
  const penaltyMult = 0.64 + ease * 0.22; // softer penalties overall
  const stabilityPenaltyMult = 0.54 + ease * 0.3; // softer stability bleed
  const escalationCadence = ease < 0.6 ? 6 : 5; // slower severity ramp
  const responseByType = {
    crime: "security",
    medical: "health",
    fire: "transport",
    flood: "climate",
    corruption: "integrity",
    cyber_grid_attack: "integrity",
    airspace_incursion: "security",
    infra_sabotage: "transport",
  };
  const autoOnlyTypes = new Set(["cyber_grid_attack", "airspace_incursion", "infra_sabotage"]);
  let stabilityDrain = 0;
  for (const d of state.districts) d.stress = Math.max(0, d.stress - 0.25);

  for (const inc of state.incidents) {
    if (inc.resolved) continue;
    inc.daysOpen += 1;
    const district = state.districts.find((d) => d.id === inc.districtId);
    if (district) district.stress += inc.contained ? 0.4 : 1.1 * inc.severity;

    if (!inc.contained) {
      const responder = findBuilding(responseByType[inc.type?.id]);
      const mitigation = responder
        ? clamp(1 - Math.max(0, responder.budget - 60) * 0.005 - Math.max(0, responder.level - 1) * 0.04, 0.45, 1)
        : 1;
      const autoOnlyMult = autoOnlyTypes.has(inc.type?.id) ? 0.72 : 1;
      const penalty = inc.type.perDayPenalty * inc.severity * penaltyMult * mitigation * autoOnlyMult;
      const svc = serviceStateForKey(inc.type.kpi);
      if (svc) {
        svc.pressure = clamp((svc.pressure || 0) + penalty * 0.9, 0, 16);
        svc.reserve = clamp((svc.reserve || 0) - penalty * 0.24, 0, svc.reserveCap || 12);
      }
      stabilityDrain += penalty * 0.35 * stabilityPenaltyMult;
      const maxSeverity = inc.requiresPlayerAction ? 3 : 4;
      if (inc.daysOpen % escalationCadence === 0 && inc.severity < maxSeverity) inc.severity += 1;
      if (inc.daysOpen >= 4 && !inc.streakBroken) {
        breakStreak(`${inc.type.title} spiraled`);
        inc.streakBroken = true;
      }
    } else {
      stabilityDrain += 0.08 * inc.severity * stabilityPenaltyMult;
    }
  }
  state.kpi.stability -= Math.min(0.95, stabilityDrain);
}

function maybeSpawnIncident() {
  const dept = {
    crime: findBuilding("security"),
    medical: findBuilding("health"),
    fire: findBuilding("transport"),
    flood: findBuilding("climate"),
    corruption: findBuilding("integrity"),
    cyber_grid_attack: findBuilding("integrity"),
    airspace_incursion: findBuilding("security"),
    infra_sabotage: findBuilding("transport"),
  };
  const weighted = INCIDENT_TYPES.map((t) => {
    const d = dept[t.id];
    const defenseReadiness = state.defense.metrics.readiness || 0;
    const defensePenalty = ["cyber_grid_attack", "airspace_incursion", "infra_sabotage"].includes(t.id)
      ? clamp((72 - defenseReadiness) * 0.06, 0, 4)
      : 0;
    if (!d) return { id: t.id, w: 1 + defensePenalty };
    let w = 1 + Math.max(0, (62 - d.budget) * 0.34) + Math.max(0, (70 - state.kpi[t.kpi]) * 0.18);
    if (d.state === "strained") w += 1.8;
    if (d.state === "overloaded") w += 3.4;
    w += defensePenalty;
    return { id: t.id, w };
  });
  const pressure = clamp((100 - state.kpi.stability) / 100, 0, 1);
  const defenseRisk = clamp((65 - (state.defense.metrics.readiness || 0)) / 100, 0, 0.12);
  const chance = 0.028 + pressure * 0.072 + defenseRisk + Math.min(0.028, state.incidents.length * 0.003);
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

function ensureOnboardingIncident() {
  if (!state.sim.started) return;
  if (tutorialIsActive()) return;
  if (state.day < 10) return;
  if (state.monthly.stats.incidentsSpawned > 0) return;
  if (state.incidents.some((i) => !i.resolved && !i.contained)) return;
  spawnIncident("medical", { severity: 2, requiresPlayerAction: true, codePrefix: "START" });
  addTicker("Starter incident triggered so you can practice response flow.");
}

function updateIncidentResolution(dt) {
  for (const inc of state.incidents) {
    if (inc.resolved || !inc.contained) continue;
    inc.resolveSec -= dt * (1 + state.rapid.momentum * 0.04);
    if (inc.resolveSec <= 0) {
      inc.resolved = true;
      applyServicePressureMap({ [inc.type.kpi]: 1.1 * inc.severity }, 1);
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

function roadKey(x, y) {
  return `${x},${y}`;
}

function parseRoadKey(key) {
  const [x, y] = key.split(",").map(Number);
  return [x, y];
}

function isDriveableRoadTile(x, y) {
  return isDevelopedTile(x, y, 0.8) && isRoadTile(x, y) && !isRailTile(x, y);
}

function isTrackTile(x, y) {
  return isDevelopedTile(x, y, 0.8) && isRailTile(x, y);
}

function rebuildTrafficNetwork() {
  const roadNodes = [];
  const railNodes = [];
  for (let x = 1; x < MAP_W - 1; x += 1) {
    for (let y = 1; y < MAP_H - 1; y += 1) {
      if (isDriveableRoadTile(x, y)) roadNodes.push([x, y]);
      if (isTrackTile(x, y)) railNodes.push([x, y]);
    }
  }
  state.visual.traffic = { roadNodes, railNodes };
}

function nearestTrafficNode(x, y, mode = "road") {
  const nodes = mode === "rail" ? (state.visual.traffic?.railNodes || []) : (state.visual.traffic?.roadNodes || []);
  if (!nodes.length) return null;
  let best = nodes[0];
  let bestDist = tileDist([x, y], best);
  for (let i = 1; i < nodes.length; i += 1) {
    const d = tileDist([x, y], nodes[i]);
    if (d < bestDist) {
      best = nodes[i];
      bestDist = d;
    }
  }
  return best;
}

function randomTrafficNode(mode = "road") {
  const nodes = mode === "rail" ? (state.visual.traffic?.railNodes || []) : (state.visual.traffic?.roadNodes || []);
  if (!nodes.length) return null;
  return nodes[Math.floor(Math.random() * nodes.length)];
}

function trafficNeighbors(node, mode = "road") {
  const [x, y] = node;
  const check = mode === "rail" ? isTrackTile : isDriveableRoadTile;
  const out = [];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const [dx, dy] of dirs) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 1 || ny < 1 || nx > MAP_W - 2 || ny > MAP_H - 2) continue;
    if (check(nx, ny)) out.push([nx, ny]);
  }
  return out;
}

function findTrafficPath(start, end, mode = "road") {
  if (!start || !end) return [];
  const sKey = roadKey(start[0], start[1]);
  const eKey = roadKey(end[0], end[1]);
  if (sKey === eKey) return [start];

  const q = [start];
  const seen = new Set([sKey]);
  const prev = new Map();
  let found = false;

  while (q.length) {
    const cur = q.shift();
    const cKey = roadKey(cur[0], cur[1]);
    if (cKey === eKey) {
      found = true;
      break;
    }
    for (const n of trafficNeighbors(cur, mode)) {
      const nKey = roadKey(n[0], n[1]);
      if (seen.has(nKey)) continue;
      seen.add(nKey);
      prev.set(nKey, cKey);
      q.push(n);
    }
  }
  if (!found) return [start];

  const path = [];
  let cursor = eKey;
  while (cursor) {
    path.push(parseRoadKey(cursor));
    if (cursor === sKey) break;
    cursor = prev.get(cursor);
  }
  return path.reverse();
}

function planVehicleRoute(v, from = null) {
  const mode = v.mode || "road";
  const start = from || nearestTrafficNode(v.x, v.y, mode) || randomTrafficNode(mode);
  if (!start) {
    v.path = [];
    v.pathIndex = 0;
    return;
  }
  let end = randomTrafficNode(mode);
  if (!end) {
    v.path = [start];
    v.pathIndex = 0;
    return;
  }
  let guard = 0;
  while (tileDist(start, end) < 5 && guard < 8) {
    end = randomTrafficNode(mode) || end;
    guard += 1;
  }
  const path = findTrafficPath(start, end, mode);
  v.path = path.length > 1 ? path : [start];
  v.pathIndex = 0;
  v.x = start[0];
  v.y = start[1];
}

function spawnVehicle(kind = "car") {
  let mode = kind === "train" ? "rail" : "road";
  if (mode === "rail" && !(state.visual.traffic?.railNodes?.length)) {
    mode = "road";
    kind = "bus";
  }
  const start = randomTrafficNode(mode) || (mode === "road" ? randomTrafficNode("rail") : randomTrafficNode("road"));
  if (!start) return null;
  const v = {
    mode,
    kind,
    x: start[0],
    y: start[1],
    speed: kind === "bus" ? 1.0 + Math.random() * 0.4 : kind === "train" ? 1.7 + Math.random() * 0.6 : 1.1 + Math.random() * 0.7,
    color: kind === "bus" ? "#ffd17b" : kind === "train" ? "#8fd8ff" : "#9dc8ff",
    sprite: kind === "bus" ? "vehicle_bus" : kind === "train" ? "vehicle_train" : "vehicle_car",
    path: [],
    pathIndex: 0,
    stopTimer: 0,
  };
  planVehicleRoute(v, start);
  return v;
}

function initTrafficVehicles() {
  rebuildTrafficNetwork();
  state.visual.vehicles = [];
  const total = 34;
  for (let i = 0; i < total; i += 1) {
    const kind = i % 11 === 0 ? "train" : i % 5 === 0 ? "bus" : "car";
    const v = spawnVehicle(kind);
    if (v) state.visual.vehicles.push(v);
  }
}

function addTrafficVehicles(count) {
  if (!state.visual.traffic) rebuildTrafficNetwork();
  for (let i = 0; i < count; i += 1) {
    const idx = state.visual.vehicles.length;
    const kind = idx % 13 === 0 ? "train" : idx % 4 === 0 ? "bus" : "car";
    const v = spawnVehicle(kind);
    if (v) state.visual.vehicles.push(v);
  }
}

function initCivilians(count = 180) {
  const civSprites = ["civ_a", "civ_b", "civ_c", "civ_d", "civ_e", "civ_f"];
  state.visual.civilians = [];
  const homeClusters = getResidentialAnchors();
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
  const homeClusters = getResidentialAnchors();
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
  const density = clamp((cityRadius() - 9) / 20, 0.24, 0.92);
  const economyBoost = clamp((state.kpi.economy - 55) / 40, 0, 1);
  const climateBoost = clamp((state.kpi.climate - 50) / 40, 0, 1);
  const highRiseChance = clamp(0.06 + economyBoost * 0.28, 0.06, 0.36);
  const parkChance = clamp(0.12 + climateBoost * 0.2 - economyBoost * 0.05, 0.08, 0.34);
  const out = [];
  for (let x = 2; x < MAP_W - 2; x += 1) {
    for (let y = 2; y < MAP_H - 2; y += 1) {
      if (!isDevelopedTile(x, y, 1.2) || isRoadTile(x, y) || isHousingTile(x, y) || isIndustryTile(x, y) || isDefenseTile(x, y)) continue;
      const dist = tileDist([x, y], CITY_CORE_TILE);
      const edgeBias = clamp((dist - (cityRadius() - 5)) / 6, 0, 1);
      const hash = ((x * 73856093) ^ (y * 19349663)) >>> 0;
      const pick = (hash % 1000) / 1000;
      const localDensity = density + edgeBias * 0.12;
      if (pick > localDensity) continue;

      let kind = "prop_tree_small";
      if (pick < parkChance * 0.55) kind = "prop_oval";
      else if (pick < parkChance) kind = ["prop_tree_tall", "prop_tree_small", "prop_playground"][hash % 3];
      else if (pick < parkChance + highRiseChance * 0.7 && dist < cityRadius() - 2.8) kind = "prop_skyscraper";
      else if (pick < parkChance + highRiseChance) kind = "prop_apartment";
      else if (pick < 0.7) kind = ["prop_house_small", "prop_house_mid", "prop_townhouse_row"][hash % 3];
      else if (pick < 0.86) kind = ["prop_shop_corner", "prop_market", "prop_banner"][hash % 3];
      else kind = ["prop_lamp", "prop_tree_small", "prop_fountain"][hash % 3];

      const jx = ((hash % 5) - 2) * 0.07;
      const jy = (((hash >> 3) % 5) - 2) * 0.07;
      out.push({ tile: [x + jx, y + jy], kind });
    }
  }
  state.visual.decorProps = out;
}

function getResidentialAnchors() {
  const homes = state.visual.decorProps
    .filter((p) => p.kind === "prop_house_small" || p.kind === "prop_house_mid" || p.kind === "prop_townhouse_row" || p.kind === "prop_apartment")
    .map((p) => [p.tile[0], p.tile[1]]);
  if (homes.length >= 8) return homes;
  return [
    [3.5, 17.5],
    [5.2, 6.3],
    [18.4, 5.6],
    [19.1, 17.3],
  ];
}

function nearestUnassignedIncidentFor(kind) {
  const relevant = state.incidents.filter(
    (i) => !i.resolved && !i.contained && !i.assignedResponderId && !i.requiresPlayerAction
  );
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

  if (!state.sim.started) return;

  for (const v of state.visual.vehicles) {
    if (v.stopTimer > 0) {
      v.stopTimer -= dt;
      continue;
    }
    if (!v.path || v.path.length < 2) {
      planVehicleRoute(v);
      continue;
    }
    const nextIdx = Math.min(v.path.length - 1, v.pathIndex + 1);
    const target = v.path[nextIdx];
    moveToward(v, target, dt, v.speed);
    if (tileDist([v.x, v.y], target) < 0.06) {
      v.pathIndex = nextIdx;
      if (v.kind === "bus" && ((target[0] + target[1]) % 7 === 0)) {
        v.stopTimer = 0.45 + Math.random() * 0.6;
      }
      if (v.kind === "train" && ((target[0] + target[1]) % 9 === 0)) {
        v.stopTimer = 0.65 + Math.random() * 0.8;
      }
      if (v.pathIndex >= v.path.length - 1) {
        planVehicleRoute(v, target);
      }
    }
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
      ? `Needs support: lift budget index toward ~${Math.max(58, b.budget + 6)}.`
      : "Holding steady with current funding.";
    lines.push(`${meta.icon} ${b.name}: ${meta.label}. ${ask}`);
  }
  state.monthly.advisorLines = lines;
}

function openMonthlyModal(report) {
  if (!els.monthlyModal) return;
  if (hasMomentFocusLock()) {
    state.ui.deferredMonthlyReport = report;
    return;
  }
  state.election.modalOpen = false;
  state.monthly.report = report;
  state.monthly.modalOpen = true;
  if (!state.paused) {
    state.paused = true;
    state.ui.pausedByModal = true;
    syncPauseButton();
  }
}

function closeMonthlyModal() {
  state.monthly.modalOpen = false;
  if (state.ui.pausedByModal) {
    state.paused = false;
    state.ui.pausedByModal = false;
    syncPauseButton();
  }
}

function openElectionModal(report) {
  if (!els.electionModal) return;
  if (hasMomentFocusLock()) {
    state.ui.deferredElectionReport = report;
    return;
  }
  state.monthly.modalOpen = false;
  state.election.report = report;
  state.election.modalOpen = true;
  if (!state.paused) {
    state.paused = true;
    state.ui.pausedByModal = true;
    syncPauseButton();
  }
}

function closeElectionModal() {
  state.election.modalOpen = false;
  if (state.ui.pausedByModal) {
    state.paused = false;
    state.ui.pausedByModal = false;
    syncPauseButton();
  }
}

function flushDeferredMomentUi() {
  if (hasMomentFocusLock()) return;
  if (state.ui.deferredElectionReport) {
    const report = state.ui.deferredElectionReport;
    state.ui.deferredElectionReport = null;
    openElectionModal(report);
    return;
  }
  if (state.ui.deferredMonthlyReport) {
    const report = state.ui.deferredMonthlyReport;
    state.ui.deferredMonthlyReport = null;
    openMonthlyModal(report);
  }
}

function electionProjection(includeNoise = false) {
  const e = state.election;
  const opponent = e.currentOpponent || pickOppositionCandidate();
  const groupWeights = { poverty: 0.22, working: 0.27, middle: 0.23, business: 0.16, elite: 0.12 };
  const groupRows = [];
  let weighted = 0;

  for (const p of state.people) {
    const groupBias = opponent.demBias?.[p.id] || 0;
    const econTilt = (state.kpi.economy - 60) * (p.id === "business" || p.id === "elite" ? 0.08 : 0.04);
    const integrityTilt = (state.kpi.integrity - 60) * (p.id === "middle" ? 0.06 : 0.04);
    const trendTilt = (p.trend || 0) * 1.8;
    const noise = includeNoise ? rand(-2.4, 2.4) : 0;
    const support = clamp(
      10
      + p.happiness * 0.56
      + state.ideology.trust * 0.15
      + state.kpi.stability * 0.1
      + groupBias
      + econTilt
      + integrityTilt
      + trendTilt
      + noise,
      12,
      88
    );
    groupRows.push({ id: p.id, label: p.label, support: round(support), trend: round(p.trend || 0) });
    weighted += support * (groupWeights[p.id] || 0.2);
  }

  const stabilityHist = state.history.stability || [];
  const stabilityTrend = stabilityHist.length > 31 ? (stabilityHist.at(-1) ?? 0) - (stabilityHist.at(-31) ?? 0) : 0;
  const treasuryAdj = clamp((state.budget.treasury - 110) * 0.02, -5, 7);
  const debtAdj = -clamp((state.budget.debt - 95) * 0.055, 0, 9);
  const trendAdj = clamp(stabilityTrend * 0.35, -4.5, 4.5);
  const kpiAdj = (state.kpi.economy - 60) * 0.06 + (state.kpi.climate - 60) * 0.03 + (state.kpi.health - 60) * 0.03;
  const oppositionAdj = opponent.baseSwing || 0;
  const momentumAdj = e.momentum * 2.4;
  const macroNoise = includeNoise ? rand(-1.6, 1.6) : 0;
  const voteBase = 50 + (weighted - 50) * 0.82;
  const national = clamp(
    voteBase
      + treasuryAdj * 0.45
      + debtAdj * 0.72
      + trendAdj * 0.82
      + kpiAdj * 0.75
      + oppositionAdj
      + momentumAdj
      + macroNoise,
    14,
    86
  );

  const offset = national - weighted;
  const adjustedGroups = groupRows.map((g) => ({ ...g, support: round(clamp(g.support + offset * 0.9, 5, 95)) }));

  return {
    national: round(national),
    challenger: round(100 - national),
    groups: adjustedGroups,
    breakdown: {
      treasuryAdj: round(treasuryAdj),
      debtAdj: round(debtAdj),
      trendAdj: round(trendAdj),
      kpiAdj: round(kpiAdj),
      oppositionAdj: round(oppositionAdj),
      momentum: round(momentumAdj),
    },
  };
}

function triggerCampaignDebate(daysLeft) {
  const e = state.election;
  if (state.rapid.active) return false;
  const deck = state.content.truthChecks || [];
  if (deck.length === 0) return false;
  const pool = deck.filter((s) => !e.debateUsedIds.includes(s.id));
  const scenario = (pool.length ? pool : deck)[Math.floor(Math.random() * (pool.length ? pool.length : deck.length))];
  if (!scenario) return false;
  e.debateUsedIds.push(scenario.id);
  e.debateUsedIds = e.debateUsedIds.slice(-24);
  const opts = (scenario.options || []).slice(0, 3);
  const withKeys = opts.map((o, idx) => ({ ...o, key: idx === 0 ? "a" : idx === 1 ? "b" : "c" }));
  const fallbackDefault = withKeys.find((o) => o.id === "ask_proof")?.key || withKeys[0]?.key || "a";
  const focus = findBuilding(majorEventAnchorBuildingId(scenario.category?.includes("_") ? scenario.category.split("_")[0] : scenario.category))
    || findBuilding("integrity")
    || findBuilding("treasury");
  state.rapid.active = {
    mode: "scenario",
    incidentCode: `DEBATE-${e.term}-${daysLeft}`,
    title: `Debate ${daysLeft}d: ${scenario.title}`,
    speaker: `${e.currentOpponent?.name || "Opposition Leader"} (${e.currentOpponent?.bloc || "Opposition"})`,
    claim: scenario.claim || "",
    body: scenario.prompt,
    clues: scenario.clues || null,
    options: withKeys,
    defaultChoice: fallbackDefault,
    focusBuildingId: focus?.id || "integrity",
    mapMarkerTile: focus ? buildingTile(focus) : [12, 12],
    expiresDay: state.day + 12,
  };
  state.rapid.nextAtDay = Math.max(state.rapid.nextAtDay, state.day + 8);
  addTicker(`Debate window open (${daysLeft}d): ${scenario.title}.`);
  addRailEvent("🗳️ Debate Brief", `Election debate frame dropped: ${scenario.title}.`, true);
  setActiveSideTab("incidents");
  focusCameraOnTile(state.rapid.active.mapMarkerTile);
  return true;
}

function concludeElectionCycle() {
  const e = state.election;
  if (state.rapid.active) {
    resolveRapid(state.rapid.active.defaultChoice || "a", true);
  }
  const projection = electionProjection(true);
  const opponent = e.currentOpponent || pickOppositionCandidate();
  let result = "coalition";
  let headline = "Coalition Retained";
  let summary = "You held enough ground to continue governing, but every bloc expects delivery.";
  let effectLine = "+1 AP now, +1 trust, slight stability bump.";
  if (projection.national >= 56) {
    result = "mandate";
    headline = "Strong Mandate Secured";
    summary = "A clear win gives you policy runway and public confidence.";
    effectLine = "+2 AP, +3 trust, +2 stability, treasury confidence bump.";
    state.resources.maxActionPoints = clamp(state.resources.maxActionPoints + 1, 3, 8);
    state.resources.actionPoints = clamp(state.resources.actionPoints + 2, 0, state.resources.maxActionPoints);
    state.ideology.trust = clamp(state.ideology.trust + 3, 0, 100);
    state.kpi.stability = clamp(state.kpi.stability + 2, 0, 100);
    state.budget.treasury = round(state.budget.treasury + 14);
    e.momentum = clamp(e.momentum + 0.7, -4, 4);
  } else if (projection.national >= 50) {
    state.resources.actionPoints = clamp(state.resources.actionPoints + 1, 0, state.resources.maxActionPoints);
    state.ideology.trust = clamp(state.ideology.trust + 1.2, 0, 100);
    state.kpi.stability = clamp(state.kpi.stability + 0.9, 0, 100);
    state.budget.treasury = round(state.budget.treasury + 6);
    e.momentum = clamp(e.momentum + 0.3, -4, 4);
  } else if (projection.national >= 46) {
    result = "hung";
    headline = "Hung Parliament Pressure";
    summary = "You fall short and must govern under a hostile chamber dynamic.";
    effectLine = "-2 trust, -1.8 stability, faster incident pressure.";
    state.ideology.trust = clamp(state.ideology.trust - 2, 0, 100);
    state.kpi.stability = clamp(state.kpi.stability - 1.8, 0, 100);
    state.rapid.nextAtDay = Math.min(state.rapid.nextAtDay, state.day + 10);
    e.momentum = clamp(e.momentum - 0.6, -4, 4);
  } else {
    result = "defeat";
    headline = "Heavy Election Defeat";
    summary = "Public confidence collapsed across key groups. You remain in office, but legitimacy is fragile.";
    effectLine = "-4 trust, -3 stability, debt pressure, stronger opposition swings.";
    state.ideology.trust = clamp(state.ideology.trust - 4, 0, 100);
    state.kpi.stability = clamp(state.kpi.stability - 3, 0, 100);
    state.budget.debt = clamp(state.budget.debt + 3, 0, 250);
    state.major.nextAtDay = Math.min(state.major.nextAtDay, state.day + 8);
    e.momentum = clamp(e.momentum - 1.1, -4, 4);
  }

  const strongest = [...projection.groups].sort((a, b) => b.support - a.support)[0];
  const weakest = [...projection.groups].sort((a, b) => a.support - b.support)[0];
  const report = {
    result,
    headline,
    subhead: `Term ${e.term} · You ${projection.national}% vs ${opponent.name} ${projection.challenger}% (${opponent.bloc})`,
    lead: `${summary} Opposition style this cycle: ${opponent.style}.`,
    effectLine,
    groups: projection.groups,
    facts: [
      `Strongest support: ${strongest?.label || "n/a"} at ${strongest?.support || 0}%.`,
      `Weakest support: ${weakest?.label || "n/a"} at ${weakest?.support || 0}%.`,
      `Breakdown: Treasury ${projection.breakdown.treasuryAdj >= 0 ? "+" : ""}${projection.breakdown.treasuryAdj}, Debt ${projection.breakdown.debtAdj}, Trend ${projection.breakdown.trendAdj >= 0 ? "+" : ""}${projection.breakdown.trendAdj}, KPI ${projection.breakdown.kpiAdj >= 0 ? "+" : ""}${projection.breakdown.kpiAdj}.`,
      `Campaign momentum on close: ${projection.breakdown.momentum >= 0 ? "+" : ""}${projection.breakdown.momentum}.`,
      `Election effects: ${effectLine}`,
      `Next election in ${ELECTION_INTERVAL_DAYS} days.`,
    ],
  };
  addTicker(`Election result: ${headline} (${projection.national}%).`);
  addRailEvent("🗳️ Election Night", `${headline} · Vote ${projection.national}%`, true);
  addDecisionToast(`Election ${projection.national}% · ${headline}`, result === "defeat" ? "bad" : result === "hung" ? "neutral" : "good");
  openElectionModal(report);

  const prevName = opponent.name;
  e.term += 1;
  e.nextElectionDay = state.day + ELECTION_INTERVAL_DAYS;
  e.campaignActive = false;
  e.campaignStartDay = null;
  e.debateTriggered = Object.fromEntries(ELECTION_DEBATE_MARKS.map((d) => [d, false]));
  e.finalSprintLastDay = 0;
  e.debateUsedIds = [];
  e.currentOpponent = pickOppositionCandidate(prevName);
}

function updateElectionCycle(allowChaos) {
  if (!allowChaos) return;
  const e = state.election;
  if (!e.currentOpponent) e.currentOpponent = pickOppositionCandidate();
  const daysLeft = e.nextElectionDay - state.day;

  if (!e.campaignActive && daysLeft <= e.campaignLeadDays && daysLeft > 0) {
    e.campaignActive = true;
    e.campaignStartDay = state.day;
    e.debateTriggered = Object.fromEntries(ELECTION_DEBATE_MARKS.map((d) => [d, false]));
    e.finalSprintLastDay = 0;
    e.debateUsedIds = [];
    e.momentum = clamp(e.momentum * 0.35, -3, 3);
    addRailEvent("🗳️ Campaign Begins", `Election in ${daysLeft} days. Opponent: ${e.currentOpponent.name} (${e.currentOpponent.bloc}).`, true);
    addTicker(`Campaign started (${daysLeft}d): ${e.currentOpponent.name} pushing ${e.currentOpponent.style}.`);
  }

  if (e.campaignActive) {
    for (const mark of ELECTION_DEBATE_MARKS) {
      if (daysLeft <= mark && !e.debateTriggered[mark]) {
        if (triggerCampaignDebate(mark)) {
          e.debateTriggered[mark] = true;
        }
      }
    }
    if (daysLeft <= ELECTION_FINAL_SPRINT_DAYS && e.finalSprintLastDay !== state.day) {
      e.finalSprintLastDay = state.day;
      const swing = round(rand(-0.22, 0.22));
      e.momentum = clamp(e.momentum + swing, -4, 4);
      if (daysLeft === ELECTION_FINAL_SPRINT_DAYS || daysLeft === 3 || daysLeft === 1) {
        addTicker(`Campaign sprint (${daysLeft}d): polling swing ${swing >= 0 ? "+" : ""}${round(swing * 6)}.`);
      }
    }
  }

  if (daysLeft <= 0) {
    concludeElectionCycle();
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

function updateOpsHeat() {
  const domains = ["health", "education", "safety", "climate", "integrity", "economy"];
  const mapKeyToBuilding = {
    health: "health",
    education: "education",
    safety: "security",
    climate: "climate",
    integrity: "integrity",
    economy: "transport",
  };
  const treasury = findBuilding("treasury");
  for (const key of domains) {
    const svc = serviceStateForKey(key);
    const coverage = svc?.coverage ?? 0;
    const reserveCap = Math.max(1, svc?.reserveCap || 0);
    const reserveRatio = clamp((svc?.reserve || 0) / reserveCap, 0, 1);
    const servicePressure = clamp((svc?.pressure || 0) / 9.5, 0, 1);
    const healthPressure = clamp((58 - state.kpi[key]) / 34, 0, 0.55);
    const shortagePressure = clamp(-coverage / 3.4, 0, 0.82);
    const reservePressure = clamp((0.44 - reserveRatio) * 0.92, 0, 0.34);
    const surplusRelief = clamp(Math.max(0, coverage) * 0.08 + reserveRatio * 0.06, 0, 0.22);
    const incidentPressure = state.incidents.filter((i) => !i.resolved && i.type.kpi === key).length * 0.08;
    const majorPressure = state.majorEvents.filter((e) => (e.domain || "").includes(key === "safety" ? "security" : key)).length * 0.12;
    const b = findBuilding(mapKeyToBuilding[key]);
    const investRelief = b ? clamp((Math.max(0, b.budget - 60) * 0.0075) + Math.max(0, b.level - 1) * 0.04, 0, 0.44) : 0;
    const climateExtraRelief = key === "climate" ? clamp((Math.max(0, (findBuilding("climate")?.budget || 60) - 60) * 0.005), 0, 0.18) : 0;
    const treasuryRelief =
      (key === "economy" || key === "integrity") && treasury
        ? clamp(Math.max(0, treasury.budget - 60) * 0.006 + Math.max(0, treasury.level - 1) * 0.03, 0, 0.24)
        : 0;
    let target = clamp(
      0.06 + servicePressure * 0.58 + healthPressure + shortagePressure + reservePressure + incidentPressure + majorPressure
      - investRelief - climateExtraRelief - treasuryRelief - surplusRelief,
      0,
      1
    );
    if ((svc?.pressure || 0) < 1.2 && coverage > 0.18 && reserveRatio > 0.36 && incidentPressure === 0 && majorPressure === 0) {
      target = Math.min(target, 0.18);
    }
    const prev = state.ops.heat[key] ?? 0.2;
    const easing = target < prev ? 0.72 : 0.18;
    state.ops.heat[key] = clamp(prev + (target - prev) * easing, 0, 1);
  }
}

function checkGameOver() {
  if (state.gameOver.active) return;
  if (tutorialIsActive() && state.tutorial.phase !== "freeplay") return;
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
  playSfx("warnDisaster", { volumeMul: 0.95, throttleMs: 800 });
  state.monthly.modalOpen = false;
  state.monthly.report = null;
  state.election.modalOpen = false;
  state.election.report = null;
  syncPauseButton();
}

function syncPauseButton() {
  if (!els.pauseBtn) return;
  const paused = Boolean(state.paused);
  els.pauseBtn.textContent = paused ? "▶" : "⏸";
  els.pauseBtn.title = paused ? "Resume simulation" : "Pause simulation";
  els.pauseBtn.setAttribute("aria-label", paused ? "Resume simulation" : "Pause simulation");
}

function buildMonthlyDecisionLedger(fromDay, toDay) {
  const entries = state.decisionLog
    .filter((d) => d.day >= fromDay && d.day <= toDay)
    .map((d) => ({ ...d, priority: computeDecisionPriority(d) }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 8);
  return entries;
}

function runMonthlySummary() {
  if (state.day === 0 || state.day % MONTHLY_REPORT_DAYS !== 0 || state.monthly.lastSummaryDay === state.day) return;
  const fromDay = Math.max(1, state.day - MONTHLY_REPORT_DAYS + 1);
  const toDay = state.day;
  const decisionLedger = buildMonthlyDecisionLedger(fromDay, toDay);
  const monthTruth = state.decisionLog.filter((d) => d.day >= fromDay && d.day <= toDay && Number.isFinite(d.truthQuality));
  const monthTruthWins = monthTruth.filter((d) => d.truthQuality > 0).length;
  const monthTruthMisses = monthTruth.filter((d) => d.truthQuality < 0).length;
  const monthTruthNeutral = monthTruth.filter((d) => d.truthQuality === 0).length;
  const monthTruthTotal = monthTruth.length;
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
      `🧭 Identity drift: ${axisDriftTag(state.ideology)} · Trust ${round(state.ideology.trust)}%.`,
      `🕵️ Truth rating: ${round(state.truth.score)}% · Right ${monthTruthWins} / Wrong ${monthTruthMisses} / Neutral ${monthTruthNeutral}.`,
      `🎯 Credibility streak: ${state.truth.streak} (best ${state.truth.bestStreak}) · Played by spin: ${state.truth.played}.`,
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
    decisions: decisionLedger,
    ideology: { ...state.ideology },
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
  const radiusFactor = cityRadius() - 10;
  const targetCivilians = clamp(Math.round(130 + state.kpi.stability * 1.25 + avgLevel * 10 + radiusFactor * 10), 150, 520);
  const targetVehicles = clamp(Math.round(18 + state.kpi.economy * 0.22 + avgLevel * 1.8 + radiusFactor * 1.5), 20, 90);

  if (state.visual.civilians.length < targetCivilians) addCivilians(Math.min(8, targetCivilians - state.visual.civilians.length));
  else if (state.visual.civilians.length > targetCivilians) state.visual.civilians.length = targetCivilians;

  if (state.visual.vehicles.length < targetVehicles) addTrafficVehicles(Math.min(4, targetVehicles - state.visual.vehicles.length));
  else if (state.visual.vehicles.length > targetVehicles) state.visual.vehicles.length = targetVehicles;
}

function maxGrowthRadius() {
  const corners = [
    [0, 0],
    [MAP_W - 1, 0],
    [0, MAP_H - 1],
    [MAP_W - 1, MAP_H - 1],
  ];
  let maxD = 10;
  for (const c of corners) {
    maxD = Math.max(maxD, tileDist(CITY_CORE_TILE, c));
  }
  return maxD - 1;
}

function computeGrowthScore(avgLevel) {
  const peopleAvg = state.people.reduce((a, p) => a + p.happiness, 0) / state.people.length;
  const treasurySignal = clamp(50 + state.budget.treasury * 0.32, 0, 100);
  const debtSignal = clamp(120 - state.budget.debt, 0, 100);
  return clamp(
    state.kpi.economy * 0.28 +
      state.kpi.stability * 0.18 +
      state.kpi.climate * 0.14 +
      peopleAvg * 0.16 +
      treasurySignal * 0.14 +
      debtSignal * 0.1 +
      avgLevel * 2.2,
    0,
    100
  );
}

function normalizeTrafficLanes() {
  rebuildTrafficNetwork();
  for (const v of state.visual.vehicles) {
    planVehicleRoute(v);
  }
}

function maybeGrowCity(avgLevel) {
  const minGap = state.kpi.economy > 78 ? 5 : state.kpi.economy > 66 ? 7 : 10;
  if (state.day - state.growth.lastExpandDay < minGap) return;
  state.growth.maxRadius = maxGrowthRadius();
  if (state.growth.radius >= state.growth.maxRadius - 0.05) return;
  const score = computeGrowthScore(avgLevel);
  state.growth.score = round(score);
  let delta = 0;
  if (score >= 82) delta = 0.95 + avgLevel * 0.03;
  else if (score >= 72) delta = 0.68 + avgLevel * 0.025;
  else if (score >= 62) delta = 0.42 + avgLevel * 0.02;
  else if (score >= 55) delta = 0.22 + avgLevel * 0.015;
  if (delta <= 0) return;
  state.growth.radius = clamp(state.growth.radius + delta, 8, state.growth.maxRadius);
  state.growth.lastExpandDay = state.day;
  initDecorProps();
  normalizeTrafficLanes();
  addCivilians(10 + Math.floor(delta * 4));
  addTrafficVehicles(2 + Math.floor(delta * 2));
  addTicker(`City footprint expanded: growth score ${round(score)} is unlocking new neighborhoods.`);
  addRailEvent("🌆 Urban Growth", `Development ring expanded to ${round(state.growth.radius)} tiles.`, true);
}

function runAutoBudgeting() {
  for (const b of state.buildings) {
    if (!b.placed) continue;
    if (!state.ui.autoBudgetByBuilding?.[b.id]) continue;
    const ceiling = departmentBudgetCeiling(b);
    const profile = autoBudgetProfile(b);
    const required = departmentRequiredBudget(b, profile.targetCoverage);
    const target = clamp(required + profile.buffer, 20, ceiling);
    const riseStep = state.budget.treasury > 0 ? profile.riseStep : 1;
    const fallStep = profile.fallStep;
    if (Math.abs(target - b.budget) < 1) continue;
    if (target > b.budget) b.budget = Math.min(target, b.budget + riseStep);
    else b.budget = Math.max(target, b.budget - fallStep);
    state.ui.budgetDraftByBuilding[b.id] = round(b.budget);
  }
}

function runDepartmentServiceTick(rows, recoverBoost, dragDampen) {
  ensureServiceState();
  for (const row of rows) {
    if (!row.building?.placed) continue;
    const svc = serviceStateForKey(row.key);
    const metrics = departmentServiceMetrics(row.building);
    const level = Math.max(1, row.building.level || 1);
    const budget = row.building.budget || 60;
    const autoOn = Boolean(state.ui.autoBudgetByBuilding?.[row.building.id]);
    const health = clamp(svc.health ?? state.kpi[row.key] ?? 60, 0, 100);
    let nextPressure = clamp(svc.pressure || 0, 0, 12);
    const reserveCap = metrics.reserveCap;
    const reserveRatio = reserveCap > 0 ? clamp((svc.reserve || 0) / reserveCap, 0, 1) : 0;
    const surplus = Math.max(0, metrics.coverage);
    const shortage = Math.max(0, -metrics.coverage);
    let nextHealth = health;
    let nextReserve = clamp(svc.reserve || 0, 0, reserveCap);

    if (surplus > 0) {
      const reserveGain = surplus * (0.32 + level * 0.018) * (0.98 + reserveRatio * 0.24);
      nextReserve = clamp(nextReserve + reserveGain, 0, reserveCap);
      const gainBand = health >= 88 ? 0.12 : health >= 76 ? 0.24 : health >= 62 ? 0.4 : 0.62;
      const capitalLift = Math.max(0, level - 1) * 0.022 + Math.max(0, budget - 70) * 0.0032;
      const autoLift = autoOn ? (health < 60 ? 0.18 : health < 72 ? 0.12 : 0.05) : 0;
      nextHealth += surplus * (gainBand + capitalLift + autoLift) * recoverBoost + (nextReserve / Math.max(1, reserveCap)) * 0.14;
      nextPressure = clamp(nextPressure - surplus * (health < 60 ? 1.65 : health < 76 ? 1.02 : 0.8) - reserveRatio * 0.62, 0, 12);

      // If a service is clearly over-covered, let it visibly recover toward healthy range.
      if (health < 78 && surplus > 0.25) {
        const recoveryTarget = 78;
        const recoveryGap = recoveryTarget - health;
        const reserveAssist = 0.16 + reserveRatio * 0.2;
        const capitalAssist = Math.max(0, level - 3) * 0.05 + Math.max(0, budget - 80) * 0.0055;
        const autoAssist = autoOn ? 0.14 : 0;
        nextHealth += recoveryGap * (reserveAssist + capitalAssist + autoAssist) * (0.26 + Math.min(0.42, surplus * 0.1));
        nextPressure = clamp(nextPressure - 0.75 - surplus * 0.24, 0, 12);
      }
    } else if (shortage > 0) {
      const reserveAbsorb = Math.min(nextReserve, shortage * (0.9 + level * 0.03));
      nextReserve = clamp(nextReserve - reserveAbsorb, 0, reserveCap);
      const unmet = Math.max(0, shortage - reserveAbsorb);
      const lossBand = health >= 85 ? 0.18 : health >= 70 ? 0.26 : health >= 54 ? 0.34 : 0.44;
      nextHealth -= unmet * lossBand * dragDampen + shortage * 0.028;
      nextPressure = clamp(nextPressure + unmet * 0.08 + shortage * 0.022, 0, 12);
    }

    nextHealth -= row.debtPenalty + row.highPenalty;

    svc.demand = round(metrics.demand * 10) / 10;
    svc.capacity = round(metrics.capacity * 10) / 10;
    svc.coverage = round(metrics.coverage * 10) / 10;
    svc.pressure = round(nextPressure * 10) / 10;
    svc.reserveCap = round(reserveCap * 10) / 10;
    svc.reserve = round(clamp(nextReserve, 0, reserveCap) * 10) / 10;
    svc.health = clamp(nextHealth, 0, 100);
    state.kpi[row.key] = svc.health;
  }
}

function applySimTick() {
  state.day += 1;
  state.year = 2026 + Math.floor(state.day / DAYS_PER_YEAR);
  if (state.ui.initiativeGuideActive && state.day >= state.ui.initiativeGuideUntilDay) {
    state.ui.initiativeGuideActive = false;
  }
  updateTutorialProgress();
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
  const momentumBonus = state.rapid.momentum * 0.2;
  const ease = onboardingEaseFactor();
  const recoverBoost = 1.18 - ease * 0.18; // stronger recovery early
  const dragDampen = 0.68 + ease * 0.32; // lighter negative drags early
  ensureServiceState();
  syncServiceHealthFromKpi();
  decayServicePressure();
  runAutoBudgeting();
  const avgBudget = activeBuildings.reduce((acc, b) => acc + b.budget, 0) / activeBuildings.length;
  const avgLevel = activeBuildings.reduce((acc, b) => acc + b.level, 0) / activeBuildings.length;

  updateIndustryPerDay();
  updateDefensePerDay();
  const baseRevenue = 68 + state.kpi.economy * 0.3 + (avgLevel - 1) * 2.8 + momentumBonus;
  const inflationDrag = Math.max(0, state.budget.treasury - 340) * 0.012;
  state.budget.revenue = round(clamp(baseRevenue + state.industry.metrics.revenue - inflationDrag, 36, 320));
  const baseExpenditure = 64 + avgBudget * 0.26 + (100 - state.kpi.health) * 0.09 + state.budget.debt * 0.03;
  state.budget.expenditure = round(clamp(baseExpenditure + state.industry.metrics.upkeep + state.defense.metrics.upkeep, 62, 420));
  state.budget.deficit = round(state.budget.revenue - state.budget.expenditure);
  state.netHistory.push(state.budget.deficit);
  state.netHistory = state.netHistory.slice(-120);
  state.budget.debt = round(clamp(state.budget.debt - state.budget.deficit * 0.05, 25, 250));
  const defenseScale = state.defense.bases.reduce((a, b) => a + (b.size || 0) * (b.level || 1), 0);
  const treasuryCeiling = 420 + state.kpi.economy * 12 + avgLevel * 110 + Math.max(0, state.resources.bestStreak * 8) + Math.max(0, state.industry.metrics.net) * 9 + defenseScale * 3;
  state.budget.treasury = round(clamp(state.budget.treasury + state.budget.deficit * 0.25, -120, treasuryCeiling));

  const healthB = findBuilding("health");
  const eduB = findBuilding("education");
  const secB = findBuilding("security");
  const climateB = findBuilding("climate");
  const integrityB = findBuilding("integrity");
  const transportB = findBuilding("transport");
  const serviceRows = [
    { key: "health", building: healthB, debtPenalty: state.budget.debt > 120 ? 0.24 * dragDampen : 0, highPenalty: 0 },
    { key: "education", building: eduB, debtPenalty: 0, highPenalty: 0 },
    { key: "safety", building: secB, debtPenalty: 0, highPenalty: 0 },
    { key: "climate", building: climateB, debtPenalty: 0, highPenalty: state.kpi.economy > 78 ? 0.1 * dragDampen : 0 },
    { key: "integrity", building: integrityB, debtPenalty: state.budget.treasury < 0 ? 0.2 * dragDampen : 0, highPenalty: 0 },
    { key: "economy", building: transportB, debtPenalty: state.budget.debt > 110 ? 0.18 * dragDampen : 0, highPenalty: 0 },
  ];
  runDepartmentServiceTick(serviceRows, recoverBoost, dragDampen);

  const industryUtil = (state.industry.metrics.utilization || 0) / 100;
  state.kpi.stability = clamp(state.kpi.stability + (industryUtil - 0.42) * 0.28 * (0.88 + (1 - ease) * 0.12), 0, 100);
  const guided = tutorialIsActive() && state.tutorial.phase !== "freeplay";
  const allowChaos = !guided;
  if (allowChaos) maybeTriggerEvents();
  if (allowChaos) maybeSpawnMajorEvent();
  if (allowChaos) maybeSpawnHousingMandate();
  if (allowChaos) maybeSpawnIncident();
  if (allowChaos) ensureOnboardingIncident();
  if (guided) {
    maybeSpawnTutorialIncident();
    maybeSpawnTutorialRapid();
  }
  updateMajorEventsPerDay();
  updateHousingMandatePerDay();
  updateIncidentsPerDay();
  updateGoalDaily();
  updatePeopleMood();
  updateOpsHeat();
  updateElectionCycle(allowChaos);
  if (allowChaos) runMonthlySummary();
  maybeGrowCity(avgLevel);
  if (state.day % 10 === 0) scaleCityActivity(avgLevel);

  if (guided) {
    state.budget.treasury = Math.max(state.budget.treasury, 42);
    state.kpi.stability = Math.max(state.kpi.stability, 54);
  }

  syncServiceHealthFromKpi();

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
  if (allowChaos) triggerRapidDecision();
  updateTutorialProgress();
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

function drawPlacementGhostSprite(sprite, x, y, w, h, ok = true) {
  if (!sprite) return;
  ctx.save();
  ctx.globalAlpha = ok ? 0.76 : 0.42;
  ctx.shadowColor = ok ? "rgba(90, 225, 170, 0.42)" : "rgba(255, 94, 87, 0.38)";
  ctx.shadowBlur = 20 * state.camera.zoom;
  drawSpriteContained(sprite, x, y, w, h);
  ctx.restore();
}

function drawConstructionOverlay(x, y, width, height, progress = 0, accent = "#ffb65e") {
  const top = y - height;
  const left = x - width / 2;
  const right = x + width / 2;
  const stripeY = y - 4 * state.camera.zoom;

  ctx.save();
  ctx.strokeStyle = "rgba(230, 241, 255, 0.52)";
  ctx.lineWidth = Math.max(1, 1.2 * state.camera.zoom);
  for (let t = 0; t <= 1; t += 0.28) {
    const sx = left + width * t;
    ctx.beginPath();
    ctx.moveTo(sx, y);
    ctx.lineTo(sx, top + 6 * state.camera.zoom);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(left, top + 10 * state.camera.zoom);
  ctx.lineTo(right, top + 10 * state.camera.zoom);
  ctx.moveTo(left, top + height * 0.45);
  ctx.lineTo(right, top + height * 0.45);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 194, 112, 0.48)";
  for (let i = 0; i < 3; i += 1) {
    const x0 = left + i * width * 0.34;
    ctx.beginPath();
    ctx.moveTo(x0, stripeY);
    ctx.lineTo(x0 + width * 0.22, stripeY + 8 * state.camera.zoom);
    ctx.stroke();
  }

  const cranePulse = (Math.sin(performance.now() / 260) + 1) / 2;
  const boomX = right - width * 0.1;
  const boomTop = top - 10 * state.camera.zoom;
  const boomLen = 18 * state.camera.zoom;
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(1.2, 1.6 * state.camera.zoom);
  ctx.beginPath();
  ctx.moveTo(boomX, y - 2 * state.camera.zoom);
  ctx.lineTo(boomX, boomTop);
  ctx.lineTo(boomX - boomLen, boomTop - 4 * state.camera.zoom);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(boomX - boomLen * (0.2 + 0.55 * progress), boomTop - 4 * state.camera.zoom);
  ctx.lineTo(boomX - boomLen * (0.2 + 0.55 * progress), boomTop + (6 + cranePulse * 8) * state.camera.zoom);
  ctx.stroke();
  ctx.restore();
}

function drawBuildingAura(x, y, h3d, stateKey, pulse) {
  const glowY = y - h3d - 10 * state.camera.zoom;
  const palette =
    stateKey === "thriving" ? ["rgba(115, 245, 190,", "#7af0bc"]
    : stateKey === "strained" ? ["rgba(255, 196, 92,", "#ffbe5c"]
      : stateKey === "overloaded" ? ["rgba(255, 102, 102,", "#ff6666"]
        : ["rgba(114, 193, 255,", "#72c1ff"];
  const alpha = stateKey === "stable" ? 0.12 : 0.18 + pulse * 0.12;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, glowY, 15 * state.camera.zoom, 8 * state.camera.zoom, 0, 0, Math.PI * 2);
  ctx.fillStyle = `${palette[0]}${alpha})`;
  ctx.fill();
  if (stateKey !== "stable") {
    ctx.strokeStyle = palette[1];
    ctx.lineWidth = 1.4 * state.camera.zoom;
    ctx.beginPath();
    ctx.moveTo(x, glowY - 4 * state.camera.zoom);
    ctx.lineTo(x, glowY - (12 + pulse * 7) * state.camera.zoom);
    ctx.stroke();
  }
  ctx.restore();
}

function drawIncidentEffect(inc, x, y, pulse) {
  const kind = inc.type?.id || "generic";
  ctx.save();
  if (kind === "flood") {
    ctx.strokeStyle = `rgba(120, 214, 255, ${0.35 + pulse * 0.2})`;
    ctx.lineWidth = 2 * state.camera.zoom;
    for (let i = 0; i < 2; i += 1) {
      ctx.beginPath();
      ctx.ellipse(x, y + i * 5 * state.camera.zoom, (13 + i * 6 + pulse * 4) * state.camera.zoom, (6 + i * 2) * state.camera.zoom, -0.18, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (kind === "crime") {
    ctx.fillStyle = `rgba(86, 176, 255, ${0.18 + pulse * 0.18})`;
    ctx.fillRect(x - 10 * state.camera.zoom, y - 12 * state.camera.zoom, 5 * state.camera.zoom, 18 * state.camera.zoom);
    ctx.fillStyle = `rgba(255, 94, 87, ${0.2 + pulse * 0.2})`;
    ctx.fillRect(x + 5 * state.camera.zoom, y - 12 * state.camera.zoom, 5 * state.camera.zoom, 18 * state.camera.zoom);
  } else if (kind === "medical") {
    ctx.strokeStyle = `rgba(255, 225, 225, ${0.45 + pulse * 0.2})`;
    ctx.lineWidth = 2.2 * state.camera.zoom;
    ctx.beginPath();
    ctx.moveTo(x, y - 12 * state.camera.zoom);
    ctx.lineTo(x, y + 12 * state.camera.zoom);
    ctx.moveTo(x - 12 * state.camera.zoom, y);
    ctx.lineTo(x + 12 * state.camera.zoom, y);
    ctx.stroke();
  } else if (kind === "corruption") {
    ctx.strokeStyle = `rgba(199, 143, 255, ${0.34 + pulse * 0.2})`;
    ctx.lineWidth = 1.8 * state.camera.zoom;
    ctx.beginPath();
    ctx.arc(x, y, (12 + pulse * 4) * state.camera.zoom, 0.2, Math.PI * 1.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 6 * state.camera.zoom, y - 4 * state.camera.zoom, 5 * state.camera.zoom, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === "fire") {
    ctx.fillStyle = `rgba(255, 151, 71, ${0.24 + pulse * 0.16})`;
    ctx.beginPath();
    ctx.arc(x - 6 * state.camera.zoom, y + 3 * state.camera.zoom, 7 * state.camera.zoom, 0, Math.PI * 2);
    ctx.arc(x + 5 * state.camera.zoom, y + 1 * state.camera.zoom, 6 * state.camera.zoom, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "cyber_grid_attack" || kind === "infra_sabotage" || kind === "airspace_incursion") {
    ctx.strokeStyle = `rgba(104, 214, 255, ${0.36 + pulse * 0.22})`;
    ctx.lineWidth = 2 * state.camera.zoom;
    ctx.beginPath();
    ctx.moveTo(x - 12 * state.camera.zoom, y - 8 * state.camera.zoom);
    ctx.lineTo(x - 2 * state.camera.zoom, y - 1 * state.camera.zoom);
    ctx.lineTo(x - 6 * state.camera.zoom, y + 8 * state.camera.zoom);
    ctx.lineTo(x + 8 * state.camera.zoom, y - 4 * state.camera.zoom);
    ctx.lineTo(x + 2 * state.camera.zoom, y + 12 * state.camera.zoom);
    ctx.stroke();
  } else {
    ctx.strokeStyle = `rgba(255, 198, 106, ${0.28 + pulse * 0.2})`;
    ctx.lineWidth = 1.8 * state.camera.zoom;
    ctx.beginPath();
    ctx.arc(x, y, (12 + pulse * 5) * state.camera.zoom, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMapBuildingLabel(text, x, y) {
  if (!text) return;
  const zoom = state.camera.zoom;
  const fontSize = Math.max(11, 12.5 * zoom);
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 ${fontSize}px "Orbitron", "Rajdhani", sans-serif`;

  const metrics = ctx.measureText(text);
  const width = Math.max(42 * zoom, metrics.width + 14 * zoom);
  const height = 16 * zoom;
  const rx = x - width / 2;
  const ry = y - height / 2;

  ctx.fillStyle = "rgba(7, 18, 30, 0.72)";
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(rx, ry, width, height, 8 * zoom);
    ctx.fill();
  } else {
    ctx.fillRect(rx, ry, width, height);
  }
  ctx.lineWidth = Math.max(0.9, 1.1 * zoom);
  ctx.strokeStyle = "rgba(255, 157, 63, 0.34)";
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(rx, ry, width, height, 8 * zoom);
    ctx.stroke();
  } else {
    ctx.strokeRect(rx, ry, width, height);
  }

  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 8 * zoom;
  ctx.fillStyle = "#ffe2c1";
  ctx.fillText(text, x, y + 0.5 * zoom);
  ctx.restore();
}

function drawBuildingPressureBar(building, x, y) {
  if (!building?.placed || !state.sim.started) return;
  const zoom = state.camera.zoom;
  const svc = serviceStateForKey(building.kpi);
  const health = clamp(svc?.health ?? state.kpi[building.kpi] ?? 60, 0, 100);
  const reserveRatio = svc?.reserveCap ? clamp((svc.reserve || 0) / svc.reserveCap, 0, 1) : 0;
  const width = 28 * zoom;
  const height = 5 * zoom;
  const rx = x - width / 2;
  const ry = y - height / 2;
  const value = clamp(health / 100, 0, 1);
  const coverage = clamp((svc?.coverage ?? departmentCoverageMargin(building)) / 1.8, -1, 1);
  const pressure = clamp(1 - value + (1 - reserveRatio) * 0.18 + Math.max(0, -coverage) * 0.2, 0, 1);
  const fillColor = pressure > 0.7 ? "#e86b68" : pressure > 0.4 ? "#f0b35c" : "#67d392";

  ctx.save();
  ctx.fillStyle = "rgba(7, 18, 30, 0.84)";
  ctx.strokeStyle = "rgba(255, 157, 63, 0.18)";
  ctx.lineWidth = Math.max(0.8, 1 * zoom);
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(rx, ry, width, height, 999);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillRect(rx, ry, width, height);
    ctx.strokeRect(rx, ry, width, height);
  }

  const innerPad = 1 * zoom;
  const innerW = Math.max(0, (width - innerPad * 2) * value);
  ctx.fillStyle = fillColor;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(rx + innerPad, ry + innerPad, innerW, Math.max(1, height - innerPad * 2), 999);
    ctx.fill();
  } else {
    ctx.fillRect(rx + innerPad, ry + innerPad, innerW, Math.max(1, height - innerPad * 2));
  }

  const markerX = rx + innerPad + (width - innerPad * 2) * value;
  ctx.strokeStyle = "rgba(235, 244, 255, 0.92)";
  ctx.lineWidth = Math.max(0.9, 1.1 * zoom);
  ctx.beginPath();
  ctx.moveTo(markerX, ry - 1 * zoom);
  ctx.lineTo(markerX, ry + height + 1 * zoom);
  ctx.stroke();
  ctx.restore();
}

function drawTutorialBuildingPulse(building, x, y, h3d) {
  if (!tutorialPulseBuildingIds().includes(building.id)) return;
  const zoom = state.camera.zoom;
  const pulse = (Math.sin(performance.now() / 240) + 1) / 2;
  const radiusX = (26 + pulse * 14) * zoom;
  const radiusY = (14 + pulse * 8) * zoom;
  const crownY = y - h3d - 24 * zoom;
  ctx.save();
  ctx.shadowColor = "rgba(255, 195, 86, 0.82)";
  ctx.shadowBlur = 22 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y - h3d - 6 * zoom, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255, 205, 92, ${0.78 + pulse * 0.2})`;
  ctx.lineWidth = Math.max(2.2, 3.2 * zoom);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, y - h3d - 6 * zoom, radiusX * 1.28, radiusY * 1.16, 0, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255, 136, 56, ${0.44 + pulse * 0.24})`;
  ctx.lineWidth = Math.max(1.4, 2 * zoom);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(x, crownY);
  ctx.lineTo(x - 11 * zoom, crownY - 18 * zoom);
  ctx.lineTo(x + 11 * zoom, crownY - 18 * zoom);
  ctx.closePath();
  ctx.fillStyle = `rgba(255, 191, 74, ${0.84 + pulse * 0.12})`;
  ctx.fill();
  ctx.fillStyle = "#102033";
  ctx.font = `900 ${Math.max(9, 11 * zoom)}px "Orbitron", "Rajdhani", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("!", x, crownY - 15 * zoom);
  ctx.restore();
}

function drawBuildingAlertBadge(priority, x, y, id, active = false, label = "!", title = "") {
  const zoom = state.camera.zoom;
  const danger = priority === "high";
  const warning = priority === "medium";
  const pulse = (Math.sin(performance.now() / (danger ? 115 : 180)) + 1) / 2;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${Math.max(15, 17 * zoom)}px "Segoe UI Symbol", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  const width = 28 * zoom;
  const height = 28 * zoom;
  const rx = x - width / 2;
  const ry = y - height / 2;
  ctx.fillStyle = active
    ? (danger ? "rgba(255, 103, 90, 0.98)" : warning ? "rgba(255, 191, 87, 0.98)" : "rgba(110, 169, 255, 0.98)")
    : (danger ? "rgba(187, 53, 53, 0.95)" : warning ? "rgba(184, 132, 36, 0.95)" : "rgba(35, 88, 154, 0.95)");
  ctx.strokeStyle = active
    ? "#fff4dc"
    : (danger ? "rgba(255, 170, 170, 0.82)" : warning ? "rgba(255, 228, 162, 0.8)" : "rgba(172, 205, 255, 0.76)");
  ctx.lineWidth = Math.max(1.1, 1.35 * zoom);
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(rx, ry, width, height, 999);
    ctx.shadowColor = active
      ? "rgba(255, 245, 220, 0.55)"
      : (danger ? "rgba(255, 95, 95, 0.55)" : warning ? "rgba(255, 202, 110, 0.5)" : "rgba(133, 185, 255, 0.5)");
    ctx.shadowBlur = 15 * zoom;
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillRect(rx, ry, width, height);
    ctx.strokeRect(rx, ry, width, height);
  }
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(x, y, width * 0.68, 0, Math.PI * 2);
  ctx.strokeStyle = danger
    ? "rgba(255, 120, 120, 0.35)"
    : warning
      ? "rgba(255, 214, 138, 0.32)"
      : "rgba(190, 220, 255, 0.28)";
  ctx.lineWidth = Math.max(1, 1.2 * zoom);
  ctx.stroke();
  if (danger) {
    ctx.beginPath();
    ctx.arc(x, y, width * (0.92 + pulse * 0.34), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 109, 109, ${0.28 + pulse * 0.26})`;
    ctx.lineWidth = Math.max(1.2, 1.8 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, width * (1.18 + pulse * 0.4), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 145, 96, ${0.16 + pulse * 0.18})`;
    ctx.lineWidth = Math.max(1, 1.4 * zoom);
    ctx.stroke();
  }
  ctx.fillStyle = danger ? "#fff3f1" : warning ? "#1a1608" : "#eef5ff";
  ctx.fillText(label, x, y + 0.5 * zoom);
  ctx.restore();
  state.ui.buildingButtons.push({ id, kind: "alertBadge", x: rx, y: ry, w: width, h: height, title });
}

function pickMapBuildingButtonAt(sx, sy) {
  return (state.ui.buildingButtons || []).find((btn) => (
    sx >= btn.x && sx <= btn.x + btn.w && sy >= btn.y && sy <= btn.y + btn.h
  )) || null;
}

function drawBuildingSkillCheck() {
  const skill = state.ui.activeSkillCheck;
  if (!skill) return;
  const building = findBuilding(skill.buildingId);
  if (!building?.placed || !building.tile) return;
  const p = isoToScreen(building.tile[0], building.tile[1]);
  const zoom = state.camera.zoom;
  const y = p.y - (64 + building.level * 11) * zoom;
  const width = 94 * zoom;
  const height = 18 * zoom;
  const x = p.x - width / 2;
  const pad = 2 * zoom;
  const value = skillCheckValue(skill);
  const markerX = x + pad + (width - pad * 2) * value;
  const start = x + pad + (width - pad * 2) * (skill.targetCenter - skill.targetWidth / 2);
  const end = x + pad + (width - pad * 2) * (skill.targetCenter + skill.targetWidth / 2);
  const titleY = y - 12 * zoom;
  const hintY = y + height + 12 * zoom;
  const pulse = (Math.sin(performance.now() / 130) + 1) / 2;
  const resolved = skill.status === "resolved";
  const grade = skill.grade || "good";
  const resultStroke = grade === "perfect"
    ? "rgba(103, 211, 146, 0.92)"
    : grade === "good"
      ? "rgba(111, 180, 255, 0.9)"
      : grade === "poor"
        ? "rgba(255, 184, 95, 0.9)"
        : "rgba(228, 107, 104, 0.9)";
  const resultFill = grade === "perfect"
    ? "rgba(17, 56, 36, 0.96)"
    : grade === "good"
      ? "rgba(19, 43, 79, 0.96)"
      : grade === "poor"
        ? "rgba(84, 52, 16, 0.96)"
        : "rgba(86, 28, 28, 0.96)";

  ctx.save();
  ctx.shadowColor = "rgba(8, 18, 28, 0.45)";
  ctx.shadowBlur = 14 * zoom;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 999);
    ctx.fillStyle = "rgba(7, 18, 30, 0.96)";
    ctx.strokeStyle = resolved ? resultStroke : `rgba(255, 157, 63, ${0.56 + pulse * 0.18})`;
    ctx.lineWidth = Math.max(1.2, 1.5 * zoom);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillStyle = "rgba(7, 18, 30, 0.96)";
    ctx.strokeStyle = resolved ? resultStroke : `rgba(255, 157, 63, ${0.56 + pulse * 0.18})`;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
  }
  ctx.shadowBlur = 0;
  const innerY = y + pad;
  const innerH = height - pad * 2;
  const innerX = x + pad;
  const innerW = width - pad * 2;
  ctx.fillStyle = resolved ? "rgba(42, 54, 68, 0.78)" : "rgba(170, 67, 67, 0.72)";
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(innerX, innerY, innerW, innerH, 999);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(Math.max(innerX, start), innerY, Math.max(4 * zoom, end - start), innerH, 999);
    ctx.fillStyle = resolved ? resultStroke : "rgba(103, 211, 146, 0.95)";
    ctx.fill();
  } else {
    ctx.fillRect(innerX, innerY, innerW, innerH);
    ctx.fillStyle = resolved ? resultStroke : "rgba(103, 211, 146, 0.95)";
    ctx.fillRect(Math.max(innerX, start), innerY, Math.max(4 * zoom, end - start), innerH);
  }
  ctx.strokeStyle = resolved ? resultStroke : "#eef7ff";
  ctx.lineWidth = Math.max(1.2, 1.6 * zoom);
  ctx.beginPath();
  ctx.moveTo(markerX, y - 4 * zoom);
  ctx.lineTo(markerX, y + height + 4 * zoom);
  ctx.stroke();
  ctx.fillStyle = resolved ? resultStroke : "#eef7ff";
  ctx.beginPath();
  ctx.arc(markerX, y + height / 2, 3.4 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = resolved ? "#f4fbff" : "#ffe7d2";
  ctx.font = `700 ${Math.max(9, 10 * zoom)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(resolved ? (skill.resultText || "RESULT") : "STOP IN GREEN", p.x, titleY);
  if (resolved) {
    if (ctx.roundRect) {
      const pillW = 58 * zoom;
      const pillH = 18 * zoom;
      ctx.beginPath();
      ctx.roundRect(p.x - pillW / 2, hintY - pillH / 2, pillW, pillH, 999);
      ctx.fillStyle = resultFill;
      ctx.strokeStyle = resultStroke;
      ctx.lineWidth = Math.max(1, 1.2 * zoom);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f7fbff";
      ctx.font = `700 ${Math.max(9, 10 * zoom)}px sans-serif`;
      ctx.fillText(skill.resultText || "RESULT", p.x, hintY + 0.5 * zoom);
    }
  } else {
    ctx.fillStyle = "#d5e7fb";
    ctx.font = `${Math.max(8, 9 * zoom)}px sans-serif`;
    ctx.fillText("Click building or bar to stop", p.x, hintY);
  }
  ctx.restore();
  state.ui.buildingButtons.push({ id: building.id, kind: "skillMeter", x, y: y - 10 * zoom, w: width, h: height + 24 * zoom, title: "Timing response" });
}

function drawLiveBuildingSkillCue(building, incident) {
  if (!building?.placed || !building.tile || !incident) return;
  if (state.ui.activeSkillCheck?.buildingId === building.id) return;
  const p = isoToScreen(building.tile[0], building.tile[1]);
  const zoom = state.camera.zoom;
  const y = p.y - (66 + building.level * 12) * zoom;
  const width = 110 * zoom;
  const height = 20 * zoom;
  const x = p.x - width / 2;
  const pad = 2 * zoom;
  const config = skillCheckConfig(building, incident);
  const start = x + pad + (width - pad * 2) * (config.targetCenter - config.targetWidth / 2);
  const end = x + pad + (width - pad * 2) * (config.targetCenter + config.targetWidth / 2);
  const pulse = (Math.sin(performance.now() / 110) + 1) / 2;

  ctx.save();
  ctx.shadowColor = "rgba(255, 162, 74, 0.56)";
  ctx.shadowBlur = 18 * zoom;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 999);
    ctx.fillStyle = "rgba(7, 18, 30, 0.97)";
    ctx.strokeStyle = `rgba(255, 167, 71, ${0.72 + pulse * 0.18})`;
    ctx.lineWidth = Math.max(1.5, 1.8 * zoom);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillStyle = "rgba(7, 18, 30, 0.97)";
    ctx.strokeStyle = `rgba(255, 167, 71, ${0.72 + pulse * 0.18})`;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
  }
  ctx.shadowBlur = 0;
  const innerX = x + pad;
  const innerY = y + pad;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(innerX, innerY, innerW, innerH, 999);
    ctx.fillStyle = "rgba(152, 44, 44, 0.82)";
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(Math.max(innerX, start), innerY, Math.max(8 * zoom, end - start), innerH, 999);
    ctx.fillStyle = "rgba(103, 211, 146, 0.98)";
    ctx.fill();
  } else {
    ctx.fillStyle = "rgba(152, 44, 44, 0.82)";
    ctx.fillRect(innerX, innerY, innerW, innerH);
    ctx.fillStyle = "rgba(103, 211, 146, 0.98)";
    ctx.fillRect(Math.max(innerX, start), innerY, Math.max(8 * zoom, end - start), innerH);
  }
  ctx.fillStyle = "#fff1de";
  ctx.font = `900 ${Math.max(9, 10 * zoom)}px "Orbitron", "Rajdhani", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PLAY RESPONSE", p.x, y - 14 * zoom);
  ctx.font = `800 ${Math.max(8, 9 * zoom)}px "Orbitron", "Rajdhani", sans-serif`;
  ctx.fillStyle = `rgba(255, 214, 168, ${0.82 + pulse * 0.18})`;
  ctx.fillText("CLICK BUILDING OR BAR", p.x, y + height + 12 * zoom);
  const playW = 68 * zoom;
  const playH = 32 * zoom;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(p.x - playW / 2, y - 54 * zoom, playW, playH, 999);
    ctx.fillStyle = `rgba(255, 185, 74, ${0.82 + pulse * 0.14})`;
    ctx.strokeStyle = `rgba(255, 239, 205, ${0.84 + pulse * 0.12})`;
    ctx.lineWidth = Math.max(1.4, 1.8 * zoom);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = "#0f2033";
  ctx.font = `900 ${Math.max(14, 16 * zoom)}px "Orbitron", "Rajdhani", sans-serif`;
  ctx.fillText("PLAY", p.x, y - 38 * zoom);
  ctx.restore();
  state.ui.buildingButtons.push({ id: building.id, kind: "skillPreview", x: x - 10 * zoom, y: y - 60 * zoom, w: width + 20 * zoom, h: height + 78 * zoom, title: "Start response" });
}

function drawSkillBursts() {
  for (const burst of state.ui.skillBursts || []) {
    const building = findBuilding(burst.buildingId);
    if (!building?.placed || !building.tile) continue;
    const p = isoToScreen(building.tile[0], building.tile[1]);
    const duration = burst.duration || 1.15;
    const progress = 1 - burst.ttl / duration;
    const radius = (18 + progress * 42) * state.camera.zoom;
    const alpha = clamp(0.86 * (1 - progress), 0, 0.86);
    const color = burst.grade === "perfect"
      ? `rgba(103, 211, 146, ${alpha})`
      : burst.grade === "good"
        ? `rgba(111, 180, 255, ${alpha})`
        : burst.grade === "poor"
        ? `rgba(255, 184, 95, ${alpha})`
        : `rgba(228, 107, 104, ${alpha})`;
    const label = burst.grade === "perfect"
      ? "PERFECT"
      : burst.grade === "good"
        ? "GOOD"
        : burst.grade === "poor"
          ? "POOR"
          : "MISS";
    const labelFill = burst.grade === "perfect"
      ? "rgba(22, 68, 43, 0.96)"
      : burst.grade === "good"
        ? "rgba(26, 48, 86, 0.96)"
        : burst.grade === "poor"
          ? "rgba(92, 58, 18, 0.96)"
          : "rgba(96, 34, 34, 0.96)";
    const impactLabel = burst.grade === "perfect"
      ? "SERVICE BOOST"
      : burst.grade === "good"
        ? "SERVICES LIFTED"
        : burst.grade === "poor"
          ? "PARTIAL RELIEF"
          : "MISSED WINDOW";
    const textY = p.y - (70 + building.level * 12) * state.camera.zoom - progress * 18 * state.camera.zoom;
    const subY = textY + 22 * state.camera.zoom;
    const pillW = 84 * state.camera.zoom;
    const pillH = 24 * state.camera.zoom;
    const glowY = p.y - (22 + building.level * 7) * state.camera.zoom;
    const glowW = (46 + (1 - progress) * 34) * state.camera.zoom;
    const glowH = (20 + (1 - progress) * 18) * state.camera.zoom;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(p.x, glowY, glowW, glowH, 0, 0, Math.PI * 2);
    ctx.fillStyle = color.replace(/, 0\.\d+\)/, `, ${Math.max(0.12, alpha * 0.55).toFixed(2)})`);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x, p.y - (36 + building.level * 10) * state.camera.zoom, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2.2, 3 * state.camera.zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(p.x, p.y - (36 + building.level * 10) * state.camera.zoom, Math.max(6 * state.camera.zoom, radius * 0.58), 0, Math.PI * 2);
    ctx.strokeStyle = color.replace(/, 0\.\d+\)/, `, ${Math.max(0.18, alpha * 0.85).toFixed(2)})`);
    ctx.lineWidth = Math.max(1.4, 2 * state.camera.zoom);
    ctx.stroke();
    for (let i = 0; i < 6; i += 1) {
      const a = (Math.PI * 2 * i) / 6 + progress * 1.4;
      const px = p.x + Math.cos(a) * radius * 0.7;
      const py = p.y - (36 + building.level * 10) * state.camera.zoom + Math.sin(a) * radius * 0.45;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(2.2, 3.4 * state.camera.zoom * (1 - progress * 0.55)), 0, Math.PI * 2);
      ctx.fillStyle = color.replace(/, 0\.\d+\)/, `, ${Math.max(0.12, alpha).toFixed(2)})`);
      ctx.fill();
    }
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(p.x - pillW / 2, textY - pillH / 2, pillW, pillH, 999);
      ctx.fillStyle = labelFill;
      ctx.strokeStyle = color.replace(/, 0\.\d+\)/, ", 0.92)");
      ctx.lineWidth = Math.max(1.2, 1.6 * state.camera.zoom);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = "#f5fbff";
    ctx.font = `900 ${Math.max(11, 13 * state.camera.zoom)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, p.x, textY + 0.5 * state.camera.zoom);
    ctx.fillStyle = "#d9ecff";
    ctx.font = `${Math.max(9, 10 * state.camera.zoom)}px sans-serif`;
    ctx.fillText(impactLabel, p.x, subY);
    ctx.restore();
  }
}

function drawClouds() {
  for (const c of state.visual.clouds) {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.size, c.size * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawOceanEdge() {
  const left = isoToScreen(0, MAP_H - 1);
  const bottom = isoToScreen(MAP_W - 1, MAP_H - 1);
  const waveT = performance.now() / 900;

  const nX = left.y - bottom.y;
  const nY = bottom.x - left.x;
  const nLen = Math.max(1, Math.hypot(nX, nY));
  const ux = (nX / nLen) * 150;
  const uy = (nY / nLen) * 150;

  const p1 = { x: left.x - ux, y: left.y - uy };
  const p2 = { x: bottom.x - ux, y: bottom.y - uy };

  const grad = ctx.createLinearGradient((left.x + bottom.x) / 2, left.y - 30, (p1.x + p2.x) / 2, p2.y + 160);
  grad.addColorStop(0, "rgba(95, 210, 238, 0.65)");
  grad.addColorStop(0.45, "rgba(49, 169, 213, 0.62)");
  grad.addColorStop(1, "rgba(18, 109, 172, 0.72)");

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(left.x, left.y);
  ctx.lineTo(bottom.x, bottom.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  for (let t = 0; t <= 1; t += 0.065) {
    const bx = left.x + (bottom.x - left.x) * t;
    const by = left.y + (bottom.y - left.y) * t;
    const swell = Math.sin(t * 17 + waveT) * 4 + Math.cos(t * 9 + waveT * 1.8) * 2.2;
    const wx = bx - (ux * 0.14 + swell * 0.7);
    const wy = by - (uy * 0.14 + swell);
    ctx.fillStyle = "rgba(234, 255, 255, 0.55)";
    ctx.beginPath();
    ctx.ellipse(wx, wy, 7, 2.4, -0.42, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawAtmosphere() {
  const smog = clamp((65 - state.kpi.climate) / 28, 0, 1);
  state.visual.haze = smog;

  if (smog > 0.05) {
    const alpha = 0.14 + smog * 0.22;
    ctx.fillStyle = `rgba(126, 104, 86, ${alpha})`;
    ctx.fillRect(0, 0, state.camera.viewW, state.camera.viewH);
  } else if (state.kpi.climate > 74) {
    ctx.fillStyle = "rgba(111, 193, 245, 0.06)";
    ctx.fillRect(0, 0, state.camera.viewW, state.camera.viewH);
  }
}

function drawTraffic() {
  for (const v of state.visual.vehicles) {
    const p = isoToScreen(v.x, v.y);
    if (!isScreenPointVisible(p.x, p.y, 48)) continue;
    const sprite = state.assets.actors[v.sprite];
    if (state.assets.loaded && sprite) {
      const w = (v.kind === "train" ? 24 : v.kind === "bus" ? 17 : 14) * state.camera.zoom;
      const h = (v.kind === "train" ? 13 : v.kind === "bus" ? 11 : 10) * state.camera.zoom;
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
    if (!isScreenPointVisible(p.x, p.y, 36)) continue;
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
    if (!isScreenPointVisible(p.x, p.y, 40)) continue;
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
    if (!isDevelopedTile(d.tile[0], d.tile[1], 1.2)) continue;
    const p = isoToScreen(d.tile[0], d.tile[1]);
    if (!isScreenPointVisible(p.x, p.y, 48)) continue;
    const img = state.assets.actors[d.kind];
    if (state.assets.loaded && img) {
      const size =
        d.kind === "prop_tree_tall" ? [20, 28]
        : d.kind === "prop_fountain" ? [24, 18]
        : d.kind === "prop_oval" ? [34, 22]
        : d.kind === "prop_skyscraper" ? [24, 38]
        : d.kind === "prop_townhouse_row" ? [30, 20]
        : d.kind === "prop_apartment" ? [24, 28]
        : d.kind === "prop_house_mid" ? [22, 20]
        : d.kind === "prop_house_small" ? [18, 16]
        : d.kind === "prop_shop_corner" ? [22, 18]
        : d.kind === "prop_playground" ? [24, 18]
        : [18, 16];
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
    if (!isScreenPointVisible(p.x, p.y, 80)) continue;
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
    if (inc.requiresPlayerAction && incidentSupportsDirectPlayerAction(inc) && !inc.contained) continue;
    const p = isoToScreen(inc.tile[0], inc.tile[1]);
    if (!isScreenPointVisible(p.x, p.y, 64)) continue;
    drawIncidentEffect(inc, p.x, p.y - 8 * state.camera.zoom, pulse);

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
  if (!isScreenPointVisible(p.x, p.y, 72)) return;
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

function terrainHash(x, y, salt = 0) {
  return (((x * 92837111) ^ (y * 689287499) ^ (salt * 2654435761)) >>> 0);
}

function pickTerrainVariant(kind, x, y, salt = 0) {
  const list = TERRAIN_TILE_VARIANTS[kind];
  if (!list?.length) return null;
  return list[terrainHash(x, y, salt) % list.length];
}

function tileVisualFor(x, y, cache = null) {
  const developedNear = cache ? tileDist([x, y], CITY_CORE_TILE) <= cache.radius + 1.6 : isDevelopedTile(x, y, 1.6);
  const developed = cache ? tileDist([x, y], CITY_CORE_TILE) <= cache.radius + 0.4 : isDevelopedTile(x, y, 0.4);
  const frontier = cache ? !developed && tileDist([x, y], CITY_CORE_TILE) <= cache.radius + 1.2 : (!developed && isDevelopedTile(x, y, 1.2));
  const distFromCore = tileDist([x, y], CITY_CORE_TILE);
  const key = tileKey(x, y);
  const isHousing = cache ? cache.housingTiles.has(key) : isHousingTile(x, y);
  const isIndustry = cache ? cache.industryTiles.has(key) : isIndustryTile(x, y);
  const isDefense = cache ? cache.defenseTiles.has(key) : isDefenseTile(x, y);
  const isFoundation = cache ? cache.foundationTiles.has(key) : isFoundationTile(x, y);
  const roadTiles = cache ? cache.roadTiles : getSpatialTileCache().roadTiles;

  if (!developedNear) {
    const remoteWet = distFromCore > Math.max(15, cityRadius() + 2) && (terrainHash(x, y, 51) % 1000) / 1000 < 0.08;
    return { base: remoteWet ? pickTerrainVariant("water", x, y) : pickTerrainVariant("undeveloped", x, y), accent: null };
  }

  if (isFoundation || isHousing || isIndustry || isDefense) {
    return { base: pickTerrainVariant("plaza", x, y), accent: null };
  }

  if (roadTiles.has(key)) {
    return { base: pickTerrainVariant("road", x, y), accent: null };
  }

  if (!developed && !frontier) {
    const remoteWet = distFromCore > Math.max(15, cityRadius() + 3) && (terrainHash(x, y, 67) % 1000) / 1000 < 0.04;
    return { base: remoteWet ? pickTerrainVariant("water", x, y) : pickTerrainVariant("undeveloped", x, y), accent: null };
  }

  const h = (terrainHash(x, y) % 1000) / 1000;
  if (h < 0.22) {
    const accent = h < 0.1 ? pickTerrainVariant("flowers", x, y, 23) : null;
    return { base: pickTerrainVariant("park", x, y), accent };
  }

  return { base: pickTerrainVariant("grass", x, y), accent: null };
}

function drawMap() {
  const pulse = (Math.sin(performance.now() / 220) + 1) / 2;
  const prosperity = computeProsperityScore();
  const spatial = getSpatialTileCache();
  const tileCache = { ...spatial, radius: cityRadius() };
  ctx.clearRect(0, 0, state.camera.viewW, state.camera.viewH);

  drawClouds();
  drawOceanEdge();

  for (let x = 0; x < MAP_W; x += 1) {
    for (let y = 0; y < MAP_H; y += 1) {
      const p = isoToScreen(x, y);
      if (!isScreenPointVisible(p.x, p.y, 96)) continue;
      const visual = tileVisualFor(x, y, tileCache);
      const tileSprite = state.assets.tiles[visual.base];
      const accentSprite = visual.accent ? state.assets.tiles[visual.accent] : null;
      const developed = isDevelopedTile(x, y, 0.4);
      const frontier = !developed && isDevelopedTile(x, y, 1.2);
      const perimeter = x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1;
      const kind =
        TERRAIN_TILE_VARIANTS.water.includes(visual.base) ? "water"
        : TERRAIN_TILE_VARIANTS.road.includes(visual.base) ? "road"
        : TERRAIN_TILE_VARIANTS.plaza.includes(visual.base) ? "plaza"
        : TERRAIN_TILE_VARIANTS.sidewalk.includes(visual.base) ? "sidewalk"
        : TERRAIN_TILE_VARIANTS.park.includes(visual.base) ? "park"
        : TERRAIN_TILE_VARIANTS.lush.includes(visual.base) ? "lush"
        : TERRAIN_TILE_VARIANTS.frontier.includes(visual.base) ? "frontier"
        : TERRAIN_TILE_VARIANTS.undeveloped.includes(visual.base) ? "undeveloped"
        : "grass";
      drawDiamond(
        p.x,
        p.y,
        TILE_W * state.camera.zoom,
        TILE_H * state.camera.zoom,
        terrainUnderpaintColor(kind, developed, frontier),
        "rgba(0,0,0,0)"
      );
      if (state.assets.loaded && tileSprite) {
        const alpha = !developed ? (frontier ? 0.54 : 0.34) : 1;
        drawTerrainTopSprite(
          tileSprite,
          p.x,
          p.y,
          TILE_W * 1.06 * state.camera.zoom,
          TILE_H * 1.02 * state.camera.zoom,
          perimeter,
          alpha
        );
        if (accentSprite && developed) {
          ctx.save();
          ctx.globalAlpha = 0.92;
          drawSpriteCentered(
            accentSprite,
            p.x,
            p.y - 2 * state.camera.zoom,
            TILE_W * 0.8 * state.camera.zoom,
            TILE_H * 0.8 * state.camera.zoom
          );
          ctx.restore();
        }
      } else {
        const alt = (x + y) % 2 === 0;
        const fill = !developed ? (frontier ? "#4f6881" : "#374a5c") : (alt ? "#9fd0b0" : "#93c5a8");
        const stroke = !developed ? "#304051" : "#6ea08a";
        drawDiamond(p.x, p.y, TILE_W * state.camera.zoom, TILE_H * state.camera.zoom, fill, stroke);
        if (developed && isRoadTile(x, y) && (x + y) % 3 !== 0) {
          drawDiamond(p.x, p.y - 1, TILE_W * 0.9 * state.camera.zoom, TILE_H * 0.7 * state.camera.zoom, "#b9b3a3", "#9b9688");
        }
      }

      if (developed && isRoadTile(x, y)) {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 247, 226, 0.42)";
        ctx.lineWidth = Math.max(0.8, 1.2 * state.camera.zoom);
        const hasLR = spatial.roadTiles.has(tileKey(x - 1, y)) || spatial.roadTiles.has(tileKey(x + 1, y));
        const hasUD = spatial.roadTiles.has(tileKey(x, y - 1)) || spatial.roadTiles.has(tileKey(x, y + 1));
        if (hasLR) {
          ctx.beginPath();
          ctx.moveTo(p.x - TILE_W * 0.14 * state.camera.zoom, p.y);
          ctx.lineTo(p.x + TILE_W * 0.14 * state.camera.zoom, p.y);
          ctx.stroke();
        }
        if (hasUD) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - TILE_H * 0.14 * state.camera.zoom);
          ctx.lineTo(p.x, p.y + TILE_H * 0.14 * state.camera.zoom);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  for (let x = 1; x < MAP_W - 1; x += 1) {
    for (let y = 1; y < MAP_H - 1; y += 1) {
      if (!isTrackTile(x, y)) continue;
      const p = isoToScreen(x, y);
      const hasLR = isTrackTile(x - 1, y) || isTrackTile(x + 1, y);
      const hasUD = isTrackTile(x, y - 1) || isTrackTile(x, y + 1);
      ctx.strokeStyle = "rgba(126, 160, 188, 0.9)";
      ctx.lineWidth = 1.8 * state.camera.zoom;
      if (hasLR) {
        ctx.beginPath();
        ctx.moveTo(p.x - TILE_W * 0.22 * state.camera.zoom, p.y);
        ctx.lineTo(p.x + TILE_W * 0.22 * state.camera.zoom, p.y);
        ctx.stroke();
      }
      if (hasUD) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - TILE_H * 0.22 * state.camera.zoom);
        ctx.lineTo(p.x, p.y + TILE_H * 0.22 * state.camera.zoom);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(64, 86, 110, 0.65)";
      ctx.lineWidth = 1 * state.camera.zoom;
      ctx.beginPath();
      ctx.moveTo(p.x - TILE_W * 0.12 * state.camera.zoom, p.y - TILE_H * 0.08 * state.camera.zoom);
      ctx.lineTo(p.x + TILE_W * 0.12 * state.camera.zoom, p.y + TILE_H * 0.08 * state.camera.zoom);
      ctx.stroke();
    }
  }

  for (const z of state.industry.zones) {
    const live = z.status === "active";
    const upgrading = z.status === "upgrading";
    const fill = live ? "rgba(122,214,178,0.23)" : "rgba(255,170,94,0.2)";
    const stroke = live ? "rgba(82,217,173,0.9)" : "rgba(255,170,94,0.9)";
    for (let x = z.x; x < z.x + z.size; x += 1) {
      for (let y = z.y; y < z.y + z.size; y += 1) {
        const p = isoToScreen(x, y);
        drawDiamond(
          p.x,
          p.y - 2 * state.camera.zoom,
          TILE_W * 0.9 * state.camera.zoom,
          TILE_H * 0.78 * state.camera.zoom,
          fill,
          stroke
        );
      }
    }
    const cp = isoToScreen(z.x + (z.size - 1) / 2, z.y + (z.size - 1) / 2);
    const pDef = projectById(z.projectId);
    const art = pDef ? state.assets.actors[pDef.art] : null;
    if (state.assets.loaded && art) {
      const w = (54 + z.size * 24) * state.camera.zoom;
      const h = (46 + z.size * 18) * state.camera.zoom;
      drawSpriteCentered(art, cp.x, cp.y - 16 * state.camera.zoom, w, h);
    }

    if (z.id === state.selectedIndustryId) {
      drawDiamond(cp.x, cp.y + 2, TILE_W * (0.66 + z.size * 0.12) * state.camera.zoom, TILE_H * (0.62 + z.size * 0.1) * state.camera.zoom, "rgba(255,220,130,0.32)", "#f0b35c");
    }

    const total = Math.max(1, (z.completeDay || 0) - (z.startDay || 0));
    const elapsed = clamp(state.day - (z.startDay || 0), 0, total);
    const progress = clamp(elapsed / total, 0, 1);
    if (!live || upgrading) {
      drawConstructionOverlay(cp.x, cp.y - 4 * state.camera.zoom, (52 + z.size * 18) * state.camera.zoom, (38 + z.size * 10) * state.camera.zoom, progress, "#ffb65e");
      const bw = (58 + z.size * 12) * state.camera.zoom;
      const bh = 5 * state.camera.zoom;
      const bx = cp.x - bw / 2;
      const by = cp.y - (32 + z.size * 3) * state.camera.zoom;
      ctx.fillStyle = "rgba(20,35,52,0.9)";
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = "rgba(255,170,94,0.9)";
      ctx.fillRect(bx, by, bw * progress, bh);
      ctx.strokeStyle = "rgba(255,210,168,0.8)";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, bw, bh);
    }

    ctx.fillStyle = "#fff2dd";
    ctx.font = `${Math.max(9, 10 * state.camera.zoom)}px sans-serif`;
    ctx.textAlign = "center";
    const short = z.name.split(" ").slice(0, 2).join(" ");
    const lvlTag = `L${z.level || 1}`;
    const tag = live && !upgrading
      ? `${short} ${lvlTag} ${Math.round(z.efficiency * 100)}%`
      : `${short} ${lvlTag} (${Math.max(0, z.completeDay - state.day)}d)`;
    ctx.fillText(tag, cp.x, cp.y - (12 + z.size * 2) * state.camera.zoom);
  }

  for (const z of state.housing.zones) {
    const cx = z.x + (z.size - 1) / 2;
    const cy = z.y + (z.size - 1) / 2;
    const cp = isoToScreen(cx, cy);
    const zoneSprite = state.assets.actors[`housing_zone_${z.size}`];
    if (state.assets.loaded && zoneSprite) {
      const w = (58 + z.size * 26) * state.camera.zoom;
      const h = (56 + z.size * 18) * state.camera.zoom;
      drawSpriteCentered(zoneSprite, cp.x, cp.y - 20 * state.camera.zoom, w, h);
    } else {
      for (let x = z.x; x < z.x + z.size; x += 1) {
        for (let y = z.y; y < z.y + z.size; y += 1) {
          const p = isoToScreen(x, y);
          drawDiamond(
            p.x,
            p.y - 2 * state.camera.zoom,
            TILE_W * 0.9 * state.camera.zoom,
            TILE_H * 0.78 * state.camera.zoom,
            "rgba(255,184,92,0.22)",
            "rgba(255,184,92,0.75)"
          );
        }
      }
    }
  }

  for (const b of state.defense.bases) {
    const def = defenseTypeById(b.baseTypeId);
    const size = b.size || def?.size || 3;
    for (let x = b.x; x < b.x + size; x += 1) {
      for (let y = b.y; y < b.y + size; y += 1) {
        const p = isoToScreen(x, y);
        drawDiamond(
          p.x,
          p.y - 2 * state.camera.zoom,
          TILE_W * 0.9 * state.camera.zoom,
          TILE_H * 0.78 * state.camera.zoom,
          b.status === "active" ? "rgba(124,178,255,0.2)" : "rgba(255,170,94,0.2)",
          b.status === "active" ? "rgba(124,178,255,0.82)" : "rgba(255,170,94,0.82)"
        );
      }
    }
    const cp = isoToScreen(b.x + (size - 1) / 2, b.y + (size - 1) / 2);
    const tileKeySize = clamp(size, 3, 8);
    const tileSprite = def ? state.assets.tiles[`${def.tileArtPrefix}${tileKeySize}`] : null;
    if (state.assets.loaded && tileSprite) {
      const tw = (50 + size * 26) * state.camera.zoom;
      const th = (38 + size * 14) * state.camera.zoom;
      drawSpriteCentered(tileSprite, cp.x, cp.y + 4 * state.camera.zoom, tw, th);
    }
    const lvl = clamp(Math.max(1, b.level || 1), 1, 5);
    const bSprite = def ? state.assets.buildings[`${def.buildingArtPrefix}${lvl}`] : null;
    if (state.assets.loaded && bSprite) {
      const w = (58 + size * 20) * state.camera.zoom;
      const h = (62 + size * 18) * state.camera.zoom;
      drawSpriteCentered(bSprite, cp.x, cp.y - 16 * state.camera.zoom, w, h);
    }
    if (b.id === state.selectedDefenseId) {
      drawDiamond(
        cp.x,
        cp.y + 2,
        TILE_W * (0.66 + size * 0.1) * state.camera.zoom,
        TILE_H * (0.62 + size * 0.1) * state.camera.zoom,
        "rgba(255,220,130,0.28)",
        "#f0b35c"
      );
    }
    const total = Math.max(1, (b.completeDay || 0) - (b.startDay || 0));
    const elapsed = clamp(state.day - (b.startDay || 0), 0, total);
    const progress = clamp(elapsed / total, 0, 1);
    if (b.status !== "active") {
      drawConstructionOverlay(cp.x, cp.y - 4 * state.camera.zoom, (58 + size * 18) * state.camera.zoom, (44 + size * 10) * state.camera.zoom, progress, "#89c5ff");
      const bw = (58 + size * 12) * state.camera.zoom;
      const bh = 5 * state.camera.zoom;
      const bx = cp.x - bw / 2;
      const by = cp.y - (34 + size * 2) * state.camera.zoom;
      ctx.fillStyle = "rgba(20,35,52,0.9)";
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = "rgba(255,170,94,0.9)";
      ctx.fillRect(bx, by, bw * progress, bh);
      ctx.strokeStyle = "rgba(255,210,168,0.8)";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, bw, bh);
    }
    ctx.fillStyle = "#e9f2ff";
    ctx.font = `${Math.max(9, 10 * state.camera.zoom)}px sans-serif`;
    ctx.textAlign = "center";
    const short = (def?.name || "Defense").split(" ").slice(0, 2).join(" ");
    const tag = b.status === "active"
      ? `${short} L${lvl} ${Math.round(b.readiness || 0)}%`
      : `${short} (${Math.max(0, b.completeDay - state.day)}d)`;
    ctx.fillText(tag, cp.x, cp.y - (12 + size * 2) * state.camera.zoom);
  }

  if (state.ui.industryPlacement && state.ui.hoverTile) {
    const size = state.ui.industryPlacement.size || 2;
    const anchor = canPlaceIndustryZone(state.ui.hoverTile, size);
    const ok = Boolean(anchor);
    const sx = anchor ? anchor.x : Math.round(state.ui.hoverTile[0] - (size - 1) / 2);
    const sy = anchor ? anchor.y : Math.round(state.ui.hoverTile[1] - (size - 1) / 2);
    for (let x = sx; x < sx + size; x += 1) {
      for (let y = sy; y < sy + size; y += 1) {
        if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) continue;
        const p = isoToScreen(x, y);
        drawDiamond(
          p.x,
          p.y - 2 * state.camera.zoom,
          TILE_W * 0.94 * state.camera.zoom,
          TILE_H * 0.84 * state.camera.zoom,
          ok ? "rgba(74,205,160,0.28)" : "rgba(255,94,87,0.3)",
          ok ? "#4aca95" : "#ff5e57"
        );
      }
    }
    const cp = isoToScreen(sx + size / 2, sy + size / 2);
    const pDef = projectById(state.ui.industryPlacement.projectId);
    const ghostArt = pDef ? state.assets.actors[pDef.art] : null;
    ctx.fillStyle = "#fff3e4";
    ctx.font = `${Math.max(10, 12 * state.camera.zoom)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`Industry ${size}x${size} ${ok ? "ready" : "blocked"}`, cp.x, cp.y - 22 * state.camera.zoom);
    if (ghostArt) {
      const w = (54 + size * 24) * state.camera.zoom;
      const h = (46 + size * 18) * state.camera.zoom;
      drawPlacementGhostSprite(ghostArt, cp.x, cp.y - 16 * state.camera.zoom, w, h, ok);
    }
  }

  if (state.ui.defensePlacement && state.ui.hoverTile) {
    const def = defenseTypeById(state.ui.defensePlacement.baseTypeId);
    const size = state.ui.defensePlacement.size || def?.size || 3;
    const anchor = canPlaceDefenseZone(state.ui.hoverTile, size);
    const ok = Boolean(anchor);
    const sx = anchor ? anchor.x : Math.round(state.ui.hoverTile[0] - (size - 1) / 2);
    const sy = anchor ? anchor.y : Math.round(state.ui.hoverTile[1] - (size - 1) / 2);
    for (let x = sx; x < sx + size; x += 1) {
      for (let y = sy; y < sy + size; y += 1) {
        if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) continue;
        const p = isoToScreen(x, y);
        drawDiamond(
          p.x,
          p.y - 2 * state.camera.zoom,
          TILE_W * 0.94 * state.camera.zoom,
          TILE_H * 0.84 * state.camera.zoom,
          ok ? "rgba(98,176,255,0.28)" : "rgba(255,94,87,0.3)",
          ok ? "#6ab2ff" : "#ff5e57"
        );
      }
    }
    const cp = isoToScreen(sx + size / 2, sy + size / 2);
    const ghostArt = def ? state.assets.buildings[`${def.buildingArtPrefix}1`] : null;
    ctx.fillStyle = "#eef5ff";
    ctx.font = `${Math.max(10, 12 * state.camera.zoom)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`Defense ${size}x${size} ${ok ? "ready" : "blocked"}`, cp.x, cp.y - 22 * state.camera.zoom);
    if (ghostArt) {
      const w = (58 + size * 20) * state.camera.zoom;
      const h = (62 + size * 18) * state.camera.zoom;
      drawPlacementGhostSprite(ghostArt, cp.x, cp.y - 16 * state.camera.zoom, w, h, ok);
    }
  }

  if (state.ui.housingPlacement && state.ui.hoverTile) {
    const size = state.ui.housingPlacement.size || 2;
    const anchor = canPlaceHousingZone(state.ui.hoverTile, size);
    const ok = Boolean(anchor);
    const sx = anchor ? anchor.x : Math.round(state.ui.hoverTile[0] - (size - 1) / 2);
    const sy = anchor ? anchor.y : Math.round(state.ui.hoverTile[1] - (size - 1) / 2);
    for (let x = sx; x < sx + size; x += 1) {
      for (let y = sy; y < sy + size; y += 1) {
        if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) continue;
        const p = isoToScreen(x, y);
        drawDiamond(
          p.x,
          p.y - 2 * state.camera.zoom,
          TILE_W * 0.94 * state.camera.zoom,
          TILE_H * 0.84 * state.camera.zoom,
          ok ? "rgba(72,212,149,0.3)" : "rgba(255,94,87,0.3)",
          ok ? "#49d895" : "#ff5e57"
        );
      }
    }
    const cp = isoToScreen(sx + size / 2, sy + size / 2);
    ctx.fillStyle = "#fff3e4";
    ctx.font = `${Math.max(10, 12 * state.camera.zoom)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`Housing ${size}x${size} ${ok ? "ready" : "blocked"}`, cp.x, cp.y - 22 * state.camera.zoom);
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
    const ghostSprite = state.assets.buildings[`${state.ui.placementBuildingId}_lvl1`];
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
    if (ghostSprite) {
      drawPlacementGhostSprite(ghostSprite, p.x, p.y - 34 * state.camera.zoom, TILE_W * 1.62 * state.camera.zoom, TILE_H * 2.9 * state.camera.zoom, ok);
    }
  }

  drawProsperityDecor(prosperity);
  drawTraffic();
  drawCivilians();
  drawMajorEvents();
  state.ui.buildingButtons = [];
  const drawOrder = state.buildings
    .filter((b) => b.placed && b.tile)
    .sort((a, b) => a.tile[0] + a.tile[1] - (b.tile[0] + b.tile[1]));
  for (const b of drawOrder) {
    const p = isoToScreen(b.tile[0], b.tile[1]);
    if (!isScreenPointVisible(p.x, p.y, 96)) continue;
    const maxArtLevel = DEPARTMENT_PNG_LEVELS[b.id] || 3;
    const lvl = Math.max(1, Math.min(maxArtLevel, b.level));
    const bSprite = state.assets.buildings[`${b.id}_lvl${lvl}`];
    const w = TILE_W * 1.62 * state.camera.zoom;
    const h = TILE_H * 2.9 * state.camera.zoom;
    const h3d = (18 + b.level * 11) * state.camera.zoom;

    if (state.assets.loaded && bSprite) {
      drawSpriteContained(bSprite, p.x, p.y - 34 * state.camera.zoom, w, h);
    } else {
      const bw = TILE_W * 0.62 * state.camera.zoom;
      const bh = TILE_H * 0.56 * state.camera.zoom;
      drawBlock(p.x, p.y - 4 * state.camera.zoom, bw, bh, h3d, buildingColor(b.color, b.state));
    }

    drawBuildingAura(p.x, p.y, h3d, b.state, pulse);

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

    if (b.state !== "thriving" && b.level >= 3 && ((performance.now() / 250 + b.tile[0] + b.tile[1]) % 1) > 0.46) {
      ctx.fillStyle = "rgba(255, 240, 190, 0.18)";
      ctx.beginPath();
      ctx.rect(p.x - 8 * state.camera.zoom, p.y - h3d - 18 * state.camera.zoom, 4 * state.camera.zoom, 7 * state.camera.zoom);
      ctx.rect(p.x + 4 * state.camera.zoom, p.y - h3d - 16 * state.camera.zoom, 4 * state.camera.zoom, 7 * state.camera.zoom);
      ctx.fill();
    }

    if (prosperity > 72 && b.level >= 2) {
      const glow = state.assets.fx.prosperity_glow;
      if (glow) drawSpriteCentered(glow, p.x, p.y - h3d - 14 * state.camera.zoom, 22 * state.camera.zoom, 22 * state.camera.zoom);
    }

    drawTutorialBuildingPulse(b, p.x, p.y, h3d);

    const iconMeta = BUILDING_STATE_META[b.state] || BUILDING_STATE_META.stable;
    ctx.fillStyle = "#1f2d39";
    ctx.font = `${Math.max(10, 12 * state.camera.zoom)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(iconMeta.icon, p.x + 20 * state.camera.zoom, p.y - h3d - 12 * state.camera.zoom);

    drawBuildingPressureBar(b, p.x, p.y - h3d - 18 * state.camera.zoom);
    const action = buildingActionContext(b);
    if (action) {
      if (action.type === "manualIncident") {
        const incident = state.incidents.find((inc) => inc.id === action.incidentId);
        drawLiveBuildingSkillCue(b, incident);
      }
      drawBuildingAlertBadge(
        action.priority,
        p.x + 24 * state.camera.zoom,
        p.y - h3d - 18 * state.camera.zoom,
        b.id,
        state.ui.activeSkillCheck?.buildingId === b.id,
        action.label,
        action.title
      );
    }
    drawMapBuildingLabel(b.name.split(" ")[0], p.x, p.y + 16 * state.camera.zoom);
  }

  drawIncidents();
  drawSkillBursts();
  drawBuildingSkillCheck();
  drawResponders();
  drawRipples();
  drawAtmosphere();
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

function pickIndustryAt(sx, sy) {
  const t = screenToTile(sx, sy);
  for (const z of state.industry.zones) {
    if (t[0] >= z.x && t[0] < z.x + z.size && t[1] >= z.y && t[1] < z.y + z.size) return z;
  }
  return null;
}

function pickDefenseAt(sx, sy) {
  const t = screenToTile(sx, sy);
  for (const z of state.defense.bases) {
    if (t[0] >= z.x && t[0] < z.x + z.size && t[1] >= z.y && t[1] < z.y + z.size) return z;
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

function clearActiveSkillCheck() {
  state.ui.activeSkillCheck = null;
  flushDeferredMomentUi();
}

function skillCheckSeed(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function skillCheckConfig(building, inc) {
  const width = clamp(0.26 - (inc?.severity || 1) * 0.03, 0.11, 0.24);
  const seed = skillCheckSeed(`${building?.id || "building"}:${inc?.id || "incident"}`);
  const center = 0.5 + (((seed % 1000) / 1000) - 0.5) * 0.2;
  return {
    speed: 1 + Math.max(0, (inc?.severity || 1) - 1) * 0.18,
    targetWidth: width,
    targetCenter: clamp(center, width / 2 + 0.04, 1 - width / 2 - 0.04),
    phaseOffset: (seed % 1000) / 1000,
  };
}

function skillCheckValue(skill, now = performance.now()) {
  if (!skill) return 0.5;
  if (Number.isFinite(skill.stopValue)) return clamp(skill.stopValue, 0, 1);
  const elapsed = Math.max(0, now - (skill.startedAt || now));
  const speed = skill.speed || 1;
  const cycleMs = 1460 / speed;
  const phase = (elapsed % cycleMs) / cycleMs;
  return phase < 0.5 ? phase * 2 : 2 - phase * 2;
}

function liveSkillCheckValue(building, inc, now = performance.now()) {
  const config = skillCheckConfig(building, inc);
  const cycleMs = 1460 / config.speed;
  const phase = (((now / cycleMs) + config.phaseOffset) % 1 + 1) % 1;
  return phase < 0.5 ? phase * 2 : 2 - phase * 2;
}

function startBuildingSkillCheck(building, inc) {
  if (!building || !inc) return false;
  if (!canPlayerActOnIncidentNow(inc)) {
    addTicker("Need 1 AP and enough treasury to intervene.");
    playSfx("uiDenied");
    return false;
  }
  if (!spendActionPoints(1, "manual intervention")) return false;
  const cost = 6 + (inc.severity || 1) * 2;
  if (state.budget.treasury < cost) {
    state.resources.actionPoints = clamp(state.resources.actionPoints + 1, 0, state.resources.maxActionPoints);
    addTicker(`Need ${formatMoneyMillions(cost)} treasury to intervene.`);
    playSfx("uiDenied");
    return false;
  }
  state.budget.treasury -= cost;
  const config = skillCheckConfig(building, inc);
  state.ui.activeSkillCheck = {
    buildingId: building.id,
    incidentId: inc.id,
    startedAt: performance.now(),
    speed: config.speed,
    targetCenter: config.targetCenter,
    targetWidth: config.targetWidth,
    cost,
    status: "running",
    phaseOffset: config.phaseOffset,
  };
  state.selectedBuildingId = building.id;
  state.ui.mapHudOpen = false;
  state.ui.mapHudCollapsed = false;
  markOnboarding("selectedBuilding");
  addTicker(`Intervention primed for ${inc.code || "INCIDENT"} ${inc.type.title}.`);
  playSfx("uiConfirm");
  return true;
}

function resolveBuildingSkillCheck() {
  const skill = state.ui.activeSkillCheck;
  if (!skill || skill.status !== "running") return false;
  const building = findBuilding(skill.buildingId);
  const inc = state.incidents.find((item) => item.id === skill.incidentId);
  if (!building || !inc || inc.resolved) {
    clearActiveSkillCheck();
    return false;
  }
  const value = skillCheckValue(skill);
  const centerGap = Math.abs(value - skill.targetCenter);
  const perfectWidth = skill.targetWidth * 0.28;
  const goodWidth = skill.targetWidth * 0.5;
  const poorWidth = skill.targetWidth * 0.95;
  let grade = "miss";
  let effect = 0.3;
  let toast = "Miss";
  if (centerGap <= perfectWidth) {
    grade = "perfect";
    effect = 1.45;
    toast = "Perfect";
  } else if (centerGap <= goodWidth) {
    grade = "good";
    effect = 1;
    toast = "Good";
  } else if (centerGap <= poorWidth) {
    grade = "poor";
    effect = 0.68;
    toast = "Poor";
  }

  state.ui.activeSkillCheck = {
    ...skill,
    status: "resolved",
    stopValue: value,
    resolvedAt: performance.now(),
    resultText: toast.toUpperCase(),
    grade,
  };

  inc.contained = true;
  inc.playerFunded = true;
  inc.resolveSec = clamp((4.1 + (inc.severity || 1) * 1.45) - effect * 2.1, 1.2, 7.4);
  applyServicePressureMap({ [inc.type.kpi]: (inc.severity || 1) * effect * 1.2 }, 1);
  state.kpi.stability = clamp(state.kpi.stability + 0.18 + effect * 0.35, 0, 100);
  state.ui.skillBursts.push({ buildingId: building.id, grade, ttl: 1.45, duration: 1.45 });
  state.ui.skillBursts = state.ui.skillBursts.slice(-8);
  clearNowStrip();
  markOnboarding("upgradedOrDispatched");
  recordAction(
    inc.type.id === "corruption" ? "integrity"
      : inc.type.id === "flood" ? "climate"
        : inc.type.id === "crime" ? "security"
          : inc.type.id === "medical" ? "health"
            : "transport"
  );
  addDecisionToast(`${toast}: ${inc.type.title}`, grade === "miss" ? "bad" : grade === "perfect" ? "good" : "warn");
  addTicker(`${toast} intervention on ${inc.code || "INCIDENT"} ${inc.type.title}.`);
  addRailEvent("⚡ Direct Response", `${toast} response on ${inc.type.title}.`, grade !== "miss");
  playSfx(grade === "miss" ? "uiDenied" : "uiConfirm");
  logDecisionImpact({
    title: inc.type.title,
    category: inc.type.id,
    choice: `${toast} Manual Response`,
    demNow: {
      poverty: effect >= 1 ? 3 : 1,
      working: effect >= 0.68 ? 2 : 1,
      middle: effect >= 1 ? 2 : 1,
      business: inc.type.id === "fire" || inc.type.id === "crime" ? (effect >= 1 ? 2 : 1) : 1,
      elite: 1,
    },
    trustDelta: 0.15 + effect * 0.35,
    axisDrift: { careAusterity: 0.5, libertyControl: inc.type.id === "crime" ? -0.3 : 0.1, publicDonor: 0.2, truthSpin: 0.1 },
    treasuryDeltaNow: -cost,
    kpiNow: { [inc.type.kpi]: round(effect * 0.8 * 10) / 10, stability: round((0.12 + effect * 0.2) * 10) / 10 },
    confidence: grade === "perfect" ? "high" : grade === "good" ? "medium" : "low",
    explain: "Hands-on intervention scaled the response quality instead of acting as an instant guaranteed fix.",
  });
  updateTutorialProgress();
  return true;
}

function emergencyTapIncident(inc) {
  if (!spendActionPoints(1, "emergency intervention")) return;
  const cost = 6 + inc.severity * 2;
  if (state.budget.treasury < cost) {
    addTicker("Not enough treasury for emergency response tap.");
    state.resources.actionPoints = clamp(state.resources.actionPoints + 1, 0, state.resources.maxActionPoints);
    playSfx("uiDenied");
    return;
  }

  state.budget.treasury -= cost;
  inc.contained = true;
  inc.playerFunded = true;
  inc.resolveSec = Math.min(inc.resolveSec || 999, 2.8 + inc.severity * 1.2);
  clearNowStrip();
  markOnboarding("upgradedOrDispatched");
  recordAction(inc.type.id === "corruption" ? "integrity" : inc.type.id === "flood" ? "climate" : inc.type.id === "crime" ? "security" : inc.type.id === "medical" ? "health" : "transport");
  addTicker(`Emergency dispatch funded for ${inc.code || "INCIDENT"} ${inc.type.title}.`);
  addRailEvent("⚡ Emergency Funded", `${inc.type.title} fast-tracked.`, true);
  playSfx("uiConfirm");
  logDecisionImpact({
    title: inc.type.title,
    category: inc.type.id,
    choice: "Emergency Dispatch",
    demNow: {
      poverty: inc.type.id === "medical" || inc.type.id === "flood" ? 3 : 1,
      working: 2,
      middle: 2,
      business: inc.type.id === "fire" || inc.type.id === "crime" ? 2 : 1,
      elite: 1,
    },
    trustDelta: 0.5,
    axisDrift: { careAusterity: 0.8, libertyControl: inc.type.id === "crime" ? -0.4 : 0.1, publicDonor: 0.3, truthSpin: 0.2 },
    treasuryDeltaNow: -cost,
    kpiNow: { [inc.type.kpi]: 0.7, stability: 0.3 },
    confidence: "medium",
    explain: "Fast funding prevented escalation and signaled active governance.",
  });
  updateTutorialProgress();
}

function rapidImpactFocusLabel(active) {
  if (!active) return "Impact focus: -";
  if (active.mode === "scenario" && Array.isArray(active.options)) {
    const totals = emptyDemImpact();
    for (const opt of active.options) {
      const dem = opt?.dem_now || {};
      for (const key of Object.keys(totals)) totals[key] += Math.abs(dem[key] || 0);
    }
    const ranked = Object.entries(totals)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([id]) => {
        const label = state.people.find((p) => p.id === id)?.label || id;
        return label.split(" ")[0];
      });
    if (ranked.length) return `Impact focus: ${ranked.join(" · ")}`;
  }
  return "Impact focus: Governance confidence and service pressure.";
}

function renderRapidCard() {
  const a = state.rapid.active;
  const incidentsPane = document.querySelector('[data-pane="incidents"]');
  els.rapidMomentum.textContent = String(state.rapid.momentum);
  if (!state.sim.started) {
    els.rapidTitle.textContent = "Founding phase active.";
    if (els.rapidWhat) els.rapidWhat.textContent = "Rapid INCIDENT briefs unlock after you launch government.";
    if (els.rapidWho) els.rapidWho.textContent = "Impact focus: -";
    els.rapidBody.textContent = "Simulation is paused during founding placement.";
    if (els.rapidEvidence) els.rapidEvidence.textContent = "";
    els.rapidTimer.textContent = "-";
    els.rapidBtnA.disabled = true;
    els.rapidBtnB.disabled = true;
    if (els.rapidBtnC) els.rapidBtnC.disabled = true;
    els.rapidBtnA.textContent = "Option A";
    els.rapidBtnB.textContent = "Option B";
    if (els.rapidBtnC) els.rapidBtnC.textContent = "Option C";
    if (els.rapidBtnC) els.rapidBtnC.style.display = "none";
    els.rapidCard.classList.remove("urgent");
    incidentsPane?.classList.remove("urgent-pane");
    return;
  }
  if (!a) {
    if (tutorialIsActive() && !["incident", "rapid", "freeplay"].includes(state.tutorial.phase)) {
      els.rapidTitle.textContent = "Guided mode in progress.";
      if (els.rapidWhat) els.rapidWhat.textContent = "Rapid INCIDENT briefs unlock after budget, upgrade, industry, and first manual incident.";
      if (els.rapidWho) els.rapidWho.textContent = "Impact focus: -";
      els.rapidBody.textContent = "Follow guided steps to unlock timed briefs.";
      if (els.rapidEvidence) els.rapidEvidence.textContent = "";
      els.rapidTimer.textContent = "-";
      els.rapidBtnA.disabled = true;
      els.rapidBtnB.disabled = true;
      if (els.rapidBtnC) els.rapidBtnC.disabled = true;
      els.rapidBtnA.textContent = "Option A";
      els.rapidBtnB.textContent = "Option B";
      if (els.rapidBtnC) els.rapidBtnC.textContent = "Option C";
      if (els.rapidBtnC) els.rapidBtnC.style.display = "none";
      els.rapidCard.classList.remove("urgent");
      incidentsPane?.classList.remove("urgent-pane");
      return;
    }
    const manualOpen = actionableManualIncidents().length;
    const manualBlocked = Math.max(0, manualActionIncidents().length - manualOpen);
    if (manualOpen > 0) {
      els.rapidTitle.textContent = "No timed civic brief right now.";
      const nextIn = Math.max(0, state.rapid.nextAtDay - state.day);
      if (els.rapidWhat) els.rapidWhat.textContent = "Manual incidents are still active on map.";
      if (els.rapidWho) els.rapidWho.textContent = "Impact focus: Resolve manual incidents first.";
      els.rapidBody.textContent = `Next major brief in ~${nextIn} days.`;
    } else if (manualBlocked > 0) {
      els.rapidTitle.textContent = "No direct incident action available.";
      const nextIn = Math.max(0, state.rapid.nextAtDay - state.day);
      if (els.rapidWhat) els.rapidWhat.textContent = "Incidents are pending while resources recover.";
      if (els.rapidWho) els.rapidWho.textContent = "Impact focus: restore AP/treasury to intervene.";
      els.rapidBody.textContent = `Next civic brief in ~${nextIn} days.`;
    } else {
      els.rapidTitle.textContent = "All clear.";
      const nextIn = Math.max(0, state.rapid.nextAtDay - state.day);
      if (els.rapidWhat) els.rapidWhat.textContent = "No manual actions required right now.";
      if (els.rapidWho) els.rapidWho.textContent = "Impact focus: -";
      els.rapidBody.textContent = `Next civic brief in ~${nextIn} days.`;
    }
    if (els.rapidEvidence) els.rapidEvidence.textContent = "";
    els.rapidTimer.textContent = "-";
    els.rapidBtnA.disabled = true;
    els.rapidBtnB.disabled = true;
    if (els.rapidBtnC) els.rapidBtnC.disabled = true;
    els.rapidBtnA.textContent = "Option A";
    els.rapidBtnB.textContent = "Option B";
    if (els.rapidBtnC) els.rapidBtnC.textContent = "Option C";
    els.rapidBtnA.title = "";
    els.rapidBtnB.title = "";
    if (els.rapidBtnC) els.rapidBtnC.title = "";
    if (els.rapidBtnC) els.rapidBtnC.style.display = "none";
    els.rapidCard.classList.toggle("urgent", manualOpen > 0);
    incidentsPane?.classList.toggle("urgent-pane", manualOpen > 0);
    return;
  }

  els.rapidTitle.textContent = a.title || "Civic Brief";
  if (a.mode === "scenario") {
    if (els.rapidWhat) els.rapidWhat.textContent = a.claim || a.prompt || a.body || "A fast-moving claim needs a call now.";
    if (els.rapidWho) els.rapidWho.textContent = rapidImpactFocusLabel(a);
    els.rapidBody.textContent = `Source: ${a.speaker || "Unknown"} · Choose your response before the timer expires.`;
  } else {
    if (els.rapidWhat) els.rapidWhat.textContent = a.body || "Rapid civic brief active.";
    if (els.rapidWho) els.rapidWho.textContent = rapidImpactFocusLabel(a);
    els.rapidBody.textContent = "Pick one option now. Delays reduce momentum.";
  }
  if (els.rapidEvidence) {
    if (a.mode === "scenario" && a.clues) {
      const parts = [];
      if (a.clues.data) parts.push(`Data: ${a.clues.data}`);
      if (a.clues.street) parts.push(`Street: ${a.clues.street}`);
      if (a.clues.motive) parts.push(`Motive: ${a.clues.motive}`);
      const conf = truthConfidence(a.options || []);
      const speaker = a.speaker || "Source";
      const reads = state.truth.speakerReads[speaker];
      const speakerLine = reads
        ? ` | You vs ${speaker}: ${reads.right}R/${reads.wrong}W`
        : "";
      els.rapidEvidence.textContent = `${parts.join("  |  ")}  |  Confidence: ${conf}${speakerLine}`;
    } else if (a.mode === "scenario" && Array.isArray(a.evidence) && a.evidence.length) {
      els.rapidEvidence.textContent = `Clues: ${a.evidence.map((x) => prettifyTag(x)).slice(0, 3).join(" · ")}`;
    } else {
      els.rapidEvidence.textContent = "";
    }
  }
  els.rapidTimer.textContent = String(Math.max(0, a.expiresDay - state.day));
  els.rapidBtnA.disabled = false;
  els.rapidBtnB.disabled = false;
  if (a.mode === "scenario" && Array.isArray(a.options)) {
    const oA = a.options.find((o) => o.key === "a");
    const oB = a.options.find((o) => o.key === "b");
    const oC = a.options.find((o) => o.key === "c");
    els.rapidBtnA.textContent = compactChoiceLabel(oA?.label, 3) || "Option A";
    els.rapidBtnB.textContent = compactChoiceLabel(oB?.label, 3) || "Option B";
    els.rapidBtnA.title = oA?.outcome_blurb || "Make your call.";
    els.rapidBtnB.title = oB?.outcome_blurb || "Make your call.";
    if (els.rapidBtnC) {
      if (oC) {
        els.rapidBtnC.style.display = "";
        els.rapidBtnC.disabled = false;
        els.rapidBtnC.textContent = compactChoiceLabel(oC.label, 3) || "Option C";
        els.rapidBtnC.title = oC.outcome_blurb || "Make your call.";
      } else {
        els.rapidBtnC.style.display = "none";
        els.rapidBtnC.disabled = true;
      }
    }
  } else {
    els.rapidBtnA.textContent = a.a;
    els.rapidBtnB.textContent = a.b;
    els.rapidBtnA.title = a.tipA;
    els.rapidBtnB.title = a.tipB;
    if (els.rapidBtnC) {
      els.rapidBtnC.style.display = "none";
      els.rapidBtnC.disabled = true;
    }
  }
  els.rapidCard.classList.add("urgent");
  incidentsPane?.classList.add("urgent-pane");
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
  if (hasMomentFocusLock()) {
    els.majorEventCard.hidden = true;
    return;
  }
  if (state.housing.active) {
    els.majorEventCard.hidden = true;
    return;
  }
  if (!state.sim.started) {
    els.majorEventCard.hidden = true;
    return;
  }
  const ev = majorEventCardTarget();
  if (!ev) {
    els.majorEventCard.hidden = true;
    return;
  }
  els.majorEventCard.hidden = false;
  els.majorEventCard.style.borderColor = ev.color;
  els.majorEventCard.style.boxShadow = `0 10px 28px rgba(0,0,0,0.34), 0 0 24px ${ev.color}55`;
  setText(els.majorEventTitle, ev.title);
  const impact = majorImpactLabel(ev);
  const days = Math.max(0, ev.expiresDay - state.day);
  setText(els.majorEventSnapshot, `${days} days left · ${impact}`);
  setText(els.majorEventBody, ev.body);
  setText(els.majorEventHint, `Hint: ${ev.hint}`);
  setText(els.majorEventTimer, `${days} days`);
  setText(els.majorEventImpact, impact);

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

function renderHousingCard() {
  if (!els.housingCard) return;
  if (hasMomentFocusLock()) {
    els.housingCard.hidden = true;
    return;
  }
  const m = state.housing.active;
  if (!state.sim.started || !m) {
    els.housingCard.hidden = true;
    return;
  }
  els.housingCard.hidden = false;
  setText(els.housingTitle, m.title);
  const selecting = !m.size;
  setText(els.housingBody, selecting
    ? `${m.body} Smaller zones are cheaper; bigger zones calm affordability faster.`
    : `Footprint selected: ${m.size}x${m.size}. Click on the map to place the development zone.`);
  setText(els.housingTimer, `${Math.max(0, m.expiresDay - state.day)} days`);
  setText(els.housingImpact, selecting ? "Affordability + stability" : `${m.size}x${m.size} pending placement`);
  if (els.housingBtnSmall) {
    const c = m.costBySize[2];
    els.housingBtnSmall.textContent = `2x2 (${formatMoneyMillions(c)})`;
    els.housingBtnSmall.disabled = !selecting;
  }
  if (els.housingBtnMedium) {
    const c = m.costBySize[3];
    els.housingBtnMedium.textContent = `3x3 (${formatMoneyMillions(c)})`;
    els.housingBtnMedium.disabled = !selecting;
  }
  if (els.housingBtnLarge) {
    const c = m.costBySize[4];
    els.housingBtnLarge.textContent = `4x4 (${formatMoneyMillions(c)})`;
    els.housingBtnLarge.disabled = !selecting;
  }
  if (els.housingBtnDefer) {
    els.housingBtnDefer.textContent = "Defer 30d";
    els.housingBtnDefer.disabled = false;
  }
}

function renderSetupOverlay() {
  if (!els.setupOverlay) return;
  if (state.sim.started || state.ui.introBriefingOpen) {
    els.setupOverlay.hidden = true;
    return;
  }
  els.setupOverlay.hidden = false;
  const remaining = state.buildings.filter((b) => !b.placed).length;
  const ready = remaining === 0;
  const starterPlaced = foundingStarterPlacedCount();
  const starterDone = foundingStarterComplete();
  if (els.setupTitle) els.setupTitle.textContent = ready ? "Ready to Launch" : "Build Your Government";
  if (els.setupBody) {
    els.setupBody.textContent = ready
      ? "All essential departments are placed. Launch Government to begin full simulation."
      : !starterDone
        ? `Start with 3 core ministries: Health, Treasury, and Transport (${starterPlaced}/3 placed). Click a flashing icon, then click one of the glowing tiles on the map.`
        : `Good. Now place the remaining ${remaining} departments to complete your government. Time and emergencies stay paused until launch.`;
  }
  if (els.launchGovBtn) {
    els.launchGovBtn.disabled = !ready;
    els.launchGovBtn.hidden = !ready;
    els.launchGovBtn.textContent = "Launch Government";
  }
  if (els.startPlacementBtn) {
    els.startPlacementBtn.hidden = ready;
    els.startPlacementBtn.textContent = !starterDone ? "Choose Starter Department" : "Choose Next Department";
  }
}

function renderTutorialOverlay() {
  if (!els.tutorialOverlay) return;
  if (state.ui.introBriefingOpen || hasMomentFocusLock()) {
    els.tutorialOverlay.hidden = true;
    return;
  }
  const guided = tutorialIsActive() && state.sim.started && state.tutorial.phase !== "founding" && state.tutorial.phase !== "freeplay";
  els.tutorialOverlay.hidden = !guided;
  if (!guided) return;

  const compact = state.tutorial.phase === "industry";
  els.tutorialOverlay.classList.toggle("compact", compact);

  const meta = tutorialStepMeta();
  const current = TUTORIAL_STEP_INDEX[state.tutorial.phase] ?? 0;
  const steps = TUTORIAL_STEPS.filter((s) => s.id !== "founding" && s.id !== "freeplay");
  const localIndex = Math.max(1, steps.findIndex((s) => s.id === state.tutorial.phase) + 1);
  if (els.tutorialKicker) els.tutorialKicker.textContent = `Guided Command · Step ${localIndex}/${steps.length}`;
  if (els.tutorialTitle) els.tutorialTitle.textContent = meta.title;
  if (els.tutorialBody) els.tutorialBody.textContent = meta.body;
  if (els.tutorialProgress) {
    els.tutorialProgress.style.display = compact ? "none" : "";
    els.tutorialProgress.innerHTML = steps
      .map((s) => {
        const idx = TUTORIAL_STEP_INDEX[s.id];
        const done = idx < current;
        const active = idx === current;
        return `<div class="tutorial-step ${done ? "done" : active ? "active" : ""}">${done ? "✔" : active ? "➜" : "•"} ${s.short}</div>`;
      })
      .join("");
  }
  if (els.tutorialFocusBtn) {
    const showFocus = !["budget", "upgrade"].includes(state.tutorial.phase);
    els.tutorialFocusBtn.hidden = !showFocus;
    if (showFocus) {
      const focusLabel = state.tutorial.phase === "industry"
        ? "Choose First Industry"
        : state.tutorial.phase === "rapid"
          ? "Review Brief"
          : "Review Incident";
      els.tutorialFocusBtn.textContent = focusLabel;
    }
  }
}

function renderIntroBriefing() {
  if (!els.introBriefingModal) return;
  els.introBriefingModal.hidden = !state.ui.introBriefingOpen;
}

function renderHud() {
  setText(els.tierLabel, TIER_CONFIG[state.tierIndex].name);
  setText(els.dayLabel, String(state.day));
  const hist = state.history.stability || [];
  const trend = hist.length > 8 ? round((hist.at(-1) ?? 0) - (hist.at(-8) ?? 0)) : 0;
  const stabilityNow = Math.round(state.kpi.stability);
  setText(els.stabilityLabel, String(stabilityNow));
  if (els.stabilityTrend) {
    els.stabilityTrend.textContent = trend > 1 ? "↑" : trend < -1 ? "↓" : "→";
    els.stabilityTrend.title = trend > 0 ? `Rising (${trend})` : trend < 0 ? `Falling (${trend})` : "Flat";
  }
  if (els.stabilityPill) {
    els.stabilityPill.classList.remove("good", "warn", "bad");
    if (stabilityNow < 50) els.stabilityPill.classList.add("bad");
    else if (stabilityNow < 66) els.stabilityPill.classList.add("warn");
    else els.stabilityPill.classList.add("good");
  }
  setText(els.treasuryLabel, formatMoneyMillions(state.budget.treasury));
  const avgNet = defenseNetSignal(14);
  if (els.dailyNetLabel) {
    setText(els.dailyNetLabel, `${formatSignedMoneyMillions(avgNet)}/d`);
    const pill = els.dailyNetLabel.closest(".pill");
    if (pill) {
      pill.classList.remove("good", "warn", "bad");
      if (avgNet < 0) pill.classList.add("bad");
      else if (avgNet < 1) pill.classList.add("warn");
      else pill.classList.add("good");
    }
  }
  setText(els.actionPoints, String(state.resources.actionPoints));
  const manualIncidentTotal = actionableManualIncidents().length;
  const incidentTotal = manualIncidentTotal + state.majorEvents.length + (hasActionableRapidBrief() ? 1 : 0);
  const worstDistrict = [...state.districts].sort((a, b) => b.stress - a.stress)[0];
  const majorOpen = state.majorEvents.length;
  const remainingToPlace = state.buildings.filter((b) => !b.placed).length;
  const weakestSystems = [
    ["health", state.kpi.health],
    ["education", state.kpi.education],
    ["safety", state.kpi.safety],
    ["climate", state.kpi.climate],
    ["integrity", state.kpi.integrity],
    ["economy", state.kpi.economy],
  ].sort((a, b) => a[1] - b[1]);
  const weakestSystem = weakestSystems[0];
  const weakSystemCount = weakestSystems.filter(([, value]) => value < 45).length;
  const weakestLabel = weakestSystem ? prettifyTag(weakestSystem[0]) : "Systems";
  const weakestValue = weakestSystem ? weakestSystem[1] : 100;
  let light = "Stable";
  let tone = "good";
  els.statusBanner?.classList.remove("warn", "bad");
  if (remainingToPlace > 0) {
    light = "Founding";
    tone = "buildout";
    els.statusBanner.textContent = `Founding: place the remaining departments (${BUILDING_DEFS.length - remainingToPlace}/${BUILDING_DEFS.length}).`;
    els.statusBanner?.classList.add("warn");
  } else if (!state.sim.started) {
    light = "Ready";
    tone = "ready";
    els.statusBanner.textContent = "Ready: founding complete. Launch government to start simulation.";
    els.statusBanner?.classList.add("warn");
  } else if (tutorialIsActive() && state.tutorial.phase !== "freeplay") {
    light = "Guide";
    tone = "guided";
    const meta = tutorialStepMeta();
    const steps = TUTORIAL_STEPS.filter((s) => s.id !== "founding" && s.id !== "freeplay");
    const stepNum = Math.max(1, steps.findIndex((s) => s.id === state.tutorial.phase) + 1);
    els.statusBanner.textContent = `Guide ${stepNum}/${steps.length}: ${meta.short}.`;
    els.statusBanner?.classList.add("warn");
  } else if (state.election.campaignActive) {
    light = "Election";
    tone = "campaign";
    const daysLeft = Math.max(0, state.election.nextElectionDay - state.day);
    const projection = electionProjection(false);
    els.statusBanner.textContent = `Election: ${daysLeft} days left · projected vote ${round(projection.national)}%.`;
    els.statusBanner?.classList.add("warn");
  } else if (state.housing.active) {
    light = "Housing";
    tone = "housing";
    const days = Math.max(0, state.housing.active.expiresDay - state.day);
    els.statusBanner.textContent = `Housing mandate: choose footprint and place before ${days} day deadline.`;
    els.statusBanner?.classList.add("warn");
  } else if (state.ui.industryPlacement) {
    light = "Placing";
    tone = "industry-placement";
    const p = projectById(state.ui.industryPlacement.projectId);
    els.statusBanner.textContent = `Placing: ${p?.name || "industry project"} on the map to start construction.`;
    els.statusBanner?.classList.add("warn");
  } else if (state.ui.defensePlacement) {
    light = "Placing";
    tone = "defense-placement";
    const d = defenseTypeById(state.ui.defensePlacement.baseTypeId);
    els.statusBanner.textContent = `Placing: ${d?.name || "defense base"} on developed land to start construction.`;
    els.statusBanner?.classList.add("warn");
  } else if (state.defense.bases.length > 0 && (state.defense.metrics.readiness || 0) < 52) {
    light = "Warning";
    tone = "defense-readiness";
    els.statusBanner.textContent = "Warning: defense readiness is low. Raise budgets or upgrade key sites.";
    els.statusBanner?.classList.add("warn");
  } else if (state.industry.zones.some((z) => z.status === "active") && (state.industry.metrics.utilization || 0) < 52) {
    light = "Warning";
    tone = "industry-bottleneck";
    els.statusBanner.textContent = "Warning: industry bottleneck. Dependencies are incomplete and output is underperforming.";
    els.statusBanner?.classList.add("warn");
  } else if (majorOpen > 0 || hasActionableRapidBrief() || manualIncidentTotal > 0 || state.kpi.stability < 40 || weakSystemCount >= 3 || weakestValue < 28) {
    els.statusBanner?.classList.add("bad");
    light = "Critical";
    tone = "critical";
    els.statusBanner.textContent = majorOpen > 0
      ? `Critical: major incident active (${majorOpen}). Rapid intervention recommended.`
      : hasActionableRapidBrief()
        ? "Critical: rapid brief waiting. Make an evidence call."
        : manualIncidentTotal > 0
          ? `Critical: manual incident${manualIncidentTotal > 1 ? "s" : ""} waiting. Open Incidents to respond.`
          : weakestValue < 28
            ? `Critical: ${weakestLabel} is in critical condition. Reinforce funding or capacity now.`
            : weakSystemCount >= 3
              ? `Critical: multiple systems are under heavy strain. Start with ${weakestLabel}.`
              : "Critical: stability is very low. Immediate intervention recommended.";
  } else if (state.kpi.stability < 58 || trend < -2 || weakSystemCount >= 1) {
    els.statusBanner?.classList.add("warn");
    light = "Warning";
    tone = "warning";
    els.statusBanner.textContent = weakSystemCount >= 1
      ? `Warning: ${weakestLabel} is trending low. Reinforce before it slips.`
      : `Warning trend: ${worstDistrict.label}.`;
  } else if (state.ui.initiativeGuideActive) {
    els.statusBanner?.classList.add("warn");
    light = "Initiatives";
    tone = "initiatives";
    els.statusBanner.textContent = "Initiatives unlocked. Open the Initiatives tab to stabilize demographics.";
  } else {
    els.statusBanner.textContent = `Stable: growth score ${round(state.growth.score || 0)}.`;
  }
  const rapidHint = state.rapid.active ? `${state.rapid.active.incidentCode} active` : "No rapid INCIDENT";
  const majorHint = majorOpen > 0 ? `${majorOpen} major event(s) active` : "No major events";
  const topIncidents = state.incidents.slice(0, 2).map((i) => i.code || i.type.title).join(", ");
  if (els.statusBanner) els.statusBanner.title = `State: ${light}. ${majorHint}. ${rapidHint}. ${topIncidents ? `Open: ${topIncidents}.` : "No open incidents."}`;
  if (els.mapTip) {
    if (!state.sim.started) {
      els.mapTip.textContent = foundingStarterComplete()
        ? "Founding phase: place the remaining departments, then launch government."
        : "Founding phase: place Health, Treasury, and Transport first. Click a flashing icon, then a glowing tile.";
    } else if (tutorialIsActive() && state.tutorial.phase !== "freeplay") {
      const meta = tutorialStepMeta();
      els.mapTip.textContent = `Guided mode: ${meta.body}`;
    } else if (state.ui.initiativeGuideActive) {
      els.mapTip.textContent = "Initiatives are now live: open the Initiatives tab to launch direct demographic support.";
    } else if (state.election.campaignActive) {
      const daysLeft = Math.max(0, state.election.nextElectionDay - state.day);
      els.mapTip.textContent = `Campaign season: ${daysLeft} days to election. Expect debate briefs, swing days, and sharper media pressure.`;
    } else if (state.ui.defensePlacement) {
      const d = defenseTypeById(state.ui.defensePlacement.baseTypeId);
      els.mapTip.textContent = `Defense placement armed: ${d?.name || "base"}. Place on clear developed land; roads will reroute around it.`;
    } else {
      els.mapTip.textContent = "Drag to pan. Scroll to zoom. Place districts, then tackle flashing MAJOR beacons and incidents.";
    }
  }
  if (els.audioPanel) els.audioPanel.hidden = !state.ui.audioPanelOpen;
  if (els.bgmVolumeSlider) els.bgmVolumeSlider.value = String(Math.round(state.audio.bgmVolume * 100));
  if (els.sfxVolumeSlider) els.sfxVolumeSlider.value = String(Math.round(state.audio.sfxVolume * 100));
  if (state.audio.bgm) state.audio.bgm.volume = state.audio.bgmVolume;
  renderApFeedback();

  if (els.tickerLine) els.tickerLine.textContent = state.tickerItems.join("  |  ");

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

  if (els.kpiGrid) {
    els.kpiGrid.innerHTML = kpiRows.map(([label, value, key]) => {
      const h = state.history[key] || [];
      const delta = h.length > 6 ? round((h.at(-1) ?? 0) - (h.at(-6) ?? 0)) : 0;
      const cls = delta > 0.2 ? "up" : delta < -0.2 ? "down" : "";
      const spark = buildSparkline(h);
      return `<div class="kpi"><div class="name">${label}</div><div class="val">${round(value)}</div><div class="trend ${cls}">${delta > 0 ? `+${delta}` : `${delta}`}</div>${spark}</div>`;
    }).join("");
  }

  if (els.eventRail) {
    els.eventRail.innerHTML = state.railEvents.map((ev) => {
      return `<article class="event-chip ${ev.hot ? "hot" : ""}"><div class="title">Day ${ev.day}: ${ev.title}</div><div class="meta">${ev.meta}</div></article>`;
    }).join("");
  }
  const unplaced = state.buildings.filter((b) => !b.placed);
  const hasUnplaced = unplaced.length > 0;
  if (!hasUnplaced && state.ui.placementBuildingId) {
    state.ui.placementBuildingId = null;
    state.ui.placementRecommendations = [];
  }
  renderIndustryPanel();
  renderDefensePanel();

  if (els.advisorBrief) {
    els.advisorBrief.innerHTML = state.monthly.advisorLines.length
      ? state.monthly.advisorLines.map((line) => `<li>${line}</li>`).join("")
      : `<li>Monthly advisor notes will appear every 30 days.</li>`;
  }

  applyBudgetAvailabilityState();
  applyUpgradeAvailabilityState();
  applySellAvailabilityState();
  renderPeoplePanel();
  renderPulseMiniBoard();
  renderOpsRadar();
  renderInitiatives();
  renderTabAlerts();
  renderMonthlyModal();
  renderElectionModal();
  renderGameOverModal();
  renderRapidCard();
  renderHousingCard();
  renderMajorEventCard();
  renderActionDock();
}

function renderTabAlerts() {
  if (!state.sim.started) {
    setTabAlert(els.tabIncidentsAlert, false);
    setTabAlert(els.tabPeopleAlert, false);
    const controlNeed = state.buildings.some((b) => !b.placed) || Boolean(state.ui.industryPlacement) || Boolean(state.ui.defensePlacement);
    setTabAlert(els.tabControlAlert, controlNeed);
    return;
  }

  if (tutorialIsActive() && state.tutorial.phase !== "freeplay") {
    setTabAlert(els.tabControlAlert, false);
    setTabAlert(els.tabIncidentsAlert, false);
    setTabAlert(els.tabPeopleAlert, false);
    if (state.tutorial.phase === "incident" || state.tutorial.phase === "rapid") {
      const alertId = currentActionableIncidentAlertId();
      const incidentsTabActive = Boolean(document.querySelector('.side-tab.is-active[data-tab="incidents"]'));
      if (incidentsTabActive && alertId) state.ui.lastSeenIncidentAlertId = alertId;
      const unseenActionable = Boolean(alertId && alertId !== state.ui.lastSeenIncidentAlertId);
      setTabAlert(els.tabIncidentsAlert, unseenActionable, unseenActionable);
    } else {
      setTabAlert(els.tabControlAlert, true);
    }
    return;
  }

  const alertId = currentActionableIncidentAlertId();
  const incidentsTabActive = Boolean(document.querySelector('.side-tab.is-active[data-tab="incidents"]'));
  if (incidentsTabActive && alertId) state.ui.lastSeenIncidentAlertId = alertId;
  const unseenActionable = Boolean(alertId && alertId !== state.ui.lastSeenIncidentAlertId);
  setTabAlert(els.tabIncidentsAlert, unseenActionable, unseenActionable);

  const initiativeReady = PEOPLE_INITIATIVES.some((i) => (
    state.resources.actionPoints >= i.costAP && state.budget.treasury >= i.costCash
  ));
  const initiativeStress = state.people.some((p) => p.happiness < 68 || p.trend < -0.12);
  const peopleNeed =
    state.people.some((p) => p.happiness < 40)
    || state.election.campaignActive
    || state.ui.initiativeGuideActive
    || (initiativeReady && initiativeStress);
  setTabAlert(
    els.tabPeopleAlert,
    peopleNeed,
    state.ui.initiativeGuideActive || (initiativeReady && initiativeStress)
  );

  const controlNeed =
    state.buildings.some((b) => !b.placed || b.state === "overloaded" || b.state === "strained")
    || state.majorEvents.length > 0
    || Boolean(state.housing.active)
    || Boolean(state.ui.industryPlacement)
    || Boolean(state.ui.defensePlacement)
    || (state.industry.metrics.utilization > 0 && state.industry.metrics.utilization < 55)
    || (state.defense.bases.length > 0 && (state.defense.metrics.readiness || 0) < 52)
    || state.ui.initiativeGuideActive;
  setTabAlert(els.tabControlAlert, controlNeed);
}

function renderPeoplePanel() {
  const markup = state.people
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
  if (els.peopleGrid) els.peopleGrid.innerHTML = markup;
}

function renderPulseMiniBoard() {
  const markup = state.people
    .map((p) => {
      const cls = p.trend > 0.2 ? "up" : p.trend < -0.2 ? "down" : "";
      const trend = p.trend > 0 ? `+${round(p.trend)}` : `${round(p.trend)}`;
      const short = p.label.split(" ")[0];
      return `<article class="pulse-chip ${cls}">
        <div class="head"><div class="name">${short}</div><div class="trend">${trend}</div></div>
        <div class="val">${round(p.happiness)}%</div>
        <div class="bar"><div class="bar-fill" style="width:${clamp(p.happiness, 0, 100)}%"></div></div>
      </article>`;
    })
    .join("");
  if (els.pulseMiniBoard) els.pulseMiniBoard.innerHTML = markup;
  if (els.dockPeople) els.dockPeople.innerHTML = markup;
}

function renderOpsRadar() {
  renderRadarInto(els.dockRadarSvg, els.dockHeatList, 4);
}

function renderRadarInto(svgEl, heatListEl, maxRows = 6) {
  if (!svgEl) return;
  const keys = ["health", "education", "safety", "climate", "integrity", "economy"];
  const labels = ["Health", "Edu", "Safety", "Climate", "Integrity", "Economy"];
  const cx = 110;
  const cy = 110;
  const maxR = 84;
  const points = keys.map((k, i) => {
    const a = -Math.PI / 2 + (i / keys.length) * Math.PI * 2;
    const heat = clamp(state.ops.heat[k] ?? 0, 0, 1);
    const r = 20 + heat * maxR;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    return { k, x, y, a, heat, label: labels[i] };
  });
  const poly = points.map((p) => `${round(p.x)},${round(p.y)}`).join(" ");
  const rings = [24, 44, 64, 84]
    .map((r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,124,36,0.16)" stroke-width="1"/>`)
    .join("");
  const rays = points
    .map((p) => `<line x1="${cx}" y1="${cy}" x2="${round(cx + Math.cos(p.a) * 88)}" y2="${round(cy + Math.sin(p.a) * 88)}" stroke="rgba(136,162,200,0.2)" stroke-width="1"/>`)
    .join("");
  const tags = points
    .map((p) => {
      const tx = cx + Math.cos(p.a) * 98;
      const ty = cy + Math.sin(p.a) * 98;
      return `<text x="${round(tx)}" y="${round(ty)}" fill="#9db7db" font-size="10" text-anchor="middle" dominant-baseline="middle">${p.label}</text>`;
    })
    .join("");
  svgEl.innerHTML = `
    ${rings}
    ${rays}
    <polygon points="${poly}" fill="rgba(255,124,36,0.25)" stroke="rgba(255,150,88,0.92)" stroke-width="2"></polygon>
    ${points
      .map((p) => `<circle cx="${round(p.x)}" cy="${round(p.y)}" r="3.2" fill="${p.heat > 0.72 ? "#ff6c64" : p.heat > 0.5 ? "#ffb14a" : "#67e8ad"}"></circle>`)
      .join("")}
    ${tags}
  `;

  if (!heatListEl) return;
  const compact = maxRows <= 4;
  const shortLabel = (label) => {
    if (!compact) return label;
    if (label === "Climate") return "Clim";
    if (label === "Integrity") return "Int";
    if (label === "Economy") return "Eco";
    return label;
  };
  const bars = points
    .map((p) => {
      const pct = Math.round(p.heat * 100);
      const cls = pct > 72 ? "hot" : pct > 50 ? "warm" : "stable";
      const status = pct > 72 ? "Critical pressure" : pct > 50 ? "Elevated pressure" : pct > 28 ? "Manageable pressure" : "Low pressure";
      return `<div class="ops-eq-col ${cls}" title="${p.label} pressure: ${pct}% (${status})">
        <div class="ops-eq-track"><div class="ops-eq-fill ${cls}" style="height:${pct}%"></div></div>
        <div class="ops-eq-label">${shortLabel(p.label)}</div>
        <div class="ops-eq-val">${pct}% P</div>
      </div>`;
    })
    .join("");
  heatListEl.innerHTML = bars;
}

function initiativePreviewShift(ini) {
  const probe = {
    kpi: { ...state.kpi },
    budget: { ...state.budget },
  };
  try {
    return ini.apply(probe) || {};
  } catch {
    return {};
  }
}

function initiativeInsights() {
  const pressureById = {};
  const pressureGroups = [];
  for (const p of state.people) {
    const pressure = Math.max(0, (72 - p.happiness) / 14) + (p.trend < 0 ? Math.min(2, Math.abs(p.trend) * 8) : 0);
    pressureById[p.id] = pressure;
    if (pressure > 0.22) pressureGroups.push({ ...p, pressure });
  }
  pressureGroups.sort((a, b) => b.pressure - a.pressure);

  const rows = PEOPLE_INITIATIVES.map((ini, idx) => {
    const shifts = initiativePreviewShift(ini);
    const canAP = state.resources.actionPoints >= ini.costAP;
    const canCash = state.budget.treasury >= ini.costCash;
    const needAP = Math.max(0, ini.costAP - state.resources.actionPoints);
    const needCash = Math.max(0, ini.costCash - state.budget.treasury);
    const needParts = [];
    if (needAP > 0) needParts.push(`${needAP} AP`);
    if (needCash > 0) needParts.push(formatMoneyMillions(needCash));
    let score = 0;
    for (const p of state.people) {
      const baseWeight = 0.45 + (pressureById[p.id] || 0);
      score += (shifts[p.id] || 0) * baseWeight;
    }
    if (ini.id === "corp_tax_holiday") score -= 2.4;
    const topEffects = Object.entries(shifts)
      .filter(([, v]) => Math.abs(v) > 0.1)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 3)
      .map(([id, v]) => `${DEMOGRAPHIC_SHORT[id] || prettifyTag(id)} ${formatSignedNumber(v)}`);
    return {
      ...ini,
      order: idx,
      score,
      shifts,
      canLaunch: canAP && canCash,
      needAP,
      needCash,
      needLabel: needParts.join(" + "),
      effectLabel: topEffects.length ? `Likely impact: ${topEffects.join(" · ")}` : "Likely impact: broad mood stabilization.",
    };
  });

  const rankedRows = rows.slice().sort((a, b) => b.score - a.score || a.order - b.order);
  const affordable = rows.filter((r) => r.canLaunch);
  const affordableRanked = rankedRows.filter((r) => r.canLaunch);
  const recommended = (affordableRanked.length ? affordableRanked : rankedRows).slice(0, 3);
  const nextUnlock = rows
    .slice()
    .sort((a, b) => (a.needAP * 16 + a.needCash) - (b.needAP * 16 + b.needCash))[0] || null;

  return {
    rows,
    affordable,
    recommended,
    pressureGroups,
    needsAttention: pressureGroups.length > 0,
    nextUnlock,
  };
}

function renderInitiativeHub() {
  if (!els.initiativeHubHint || !els.initiativeQuickGrid || !els.initiativeHubCard) return;
  const info = initiativeInsights();
  const guideActive = Boolean(state.ui.initiativeGuideActive && state.sim.started);
  els.initiativeHubCard.classList.toggle("tutorial-highlight", guideActive);

  const pressureLine = info.pressureGroups
    .slice(0, 2)
    .map((p) => `${DEMOGRAPHIC_SHORT[p.id] || p.label} ${round(p.happiness)}%`)
    .join(", ");
  const whereLine = "Where: Initiatives tab.";
  const whenLine = info.needsAttention
    ? `When: use now. Pressure in ${pressureLine}.`
    : "When: use after major events, before election windows, or whenever a group trends down.";
  const costLine = info.affordable.length > 0
    ? `${info.affordable.length} initiative${info.affordable.length > 1 ? "s" : ""} launch-ready now.`
    : info.nextUnlock
      ? `Next unlock: ${info.nextUnlock.name} needs ${info.nextUnlock.needLabel}.`
      : "No initiatives configured.";
  const guidedLine = guideActive ? "Guided unlock: this system is now live." : "";
  els.initiativeHubHint.textContent = `${guidedLine} ${whereLine} ${whenLine} ${costLine}`.replace(/\s+/g, " ").trim();

  if (els.initiativeOpenBtn) {
    const hot = guideActive || info.needsAttention || info.affordable.length > 0;
    els.initiativeOpenBtn.classList.toggle("primary", hot);
    els.initiativeOpenBtn.textContent = guideActive ? "Show Me Initiatives" : "Open Full List";
  }

  const rows = info.recommended.length ? info.recommended : info.rows.slice(0, 3);
  if (!rows.length) {
    els.initiativeQuickGrid.innerHTML = `<article class="people-row"><div class="people-note">No initiatives available in this build.</div></article>`;
    return;
  }
  els.initiativeQuickGrid.innerHTML = rows.map((row, idx) => {
    const topPick = idx === 0 ? "top-pick" : "";
    return `<article class="initiative-quick-row ${row.canLaunch ? "ready" : ""}">
      <div class="initiative-quick-head">
        <div class="people-name ${topPick}">${idx === 0 ? "⭐ " : ""}${row.name}</div>
        <div class="people-val">AP ${row.costAP} · ${formatMoneyMillions(row.costCash)}</div>
      </div>
      <div class="people-note">${row.desc}</div>
      <div class="initiative-quick-meta">${row.effectLabel}</div>
      <button class="btn initiative-btn ${row.canLaunch ? "primary" : ""}" data-initiative-id="${row.id}" ${row.canLaunch ? "" : "disabled"}>
        ${row.canLaunch ? "Launch Now" : `Need ${row.needLabel}`}
      </button>
    </article>`;
  }).join("");
}

function applyInitiative(id) {
  const ini = PEOPLE_INITIATIVES.find((x) => x.id === id);
  if (!ini) return;
  state.onboarding.initiativesPrompted = true;
  state.ui.initiativeGuideActive = false;
  if (!spendActionPoints(ini.costAP, `initiative: ${ini.name}`)) return;
  if (state.budget.treasury < ini.costCash) {
    state.resources.actionPoints = clamp(state.resources.actionPoints + ini.costAP, 0, state.resources.maxActionPoints);
    addTicker(`Need ${formatMoneyMillions(ini.costCash)} treasury for ${ini.name}.`);
    playSfx("uiDenied");
    return;
  }
  state.budget.treasury -= ini.costCash;
  const shifts = ini.apply(state) || {};
  for (const p of state.people) {
    p.happiness = clamp(p.happiness + (shifts[p.id] || 0), 0, 100);
  }
  addTicker(`Initiative launched: ${ini.name}.`);
  addRailEvent("🧩 Initiative", `${ini.name} deployed for ${formatMoneyMillions(ini.costCash)}.`, true);
  logDecisionImpact({
    title: ini.name,
    category: "initiative",
    choice: "Launch",
    demNow: shifts,
    trustDelta: ini.id === "corp_tax_holiday" ? -1 : 0.8,
    axisDrift: {
      careAusterity: ini.id === "corp_tax_holiday" ? -1.2 : 1.2,
      libertyControl: 0,
      publicDonor: ini.id === "corp_tax_holiday" ? -1.4 : 0.6,
      truthSpin: ini.id === "corp_tax_holiday" ? -0.4 : 0.3,
    },
    treasuryDeltaNow: -ini.costCash,
    kpiNow: { stability: ini.id === "corp_tax_holiday" ? -0.4 : 0.6 },
    riskFlags: ini.id === "corp_tax_holiday" ? ["inequality_backlash_risk"] : [],
    confidence: "high",
    explain: ini.desc,
  });
  playSfx("uiConfirm");
  playSfx("econDown", { volumeMul: 0.7, throttleMs: 120 });
}

function renderInitiatives() {
  if (!els.initiativeGrid) return;
  const rows = initiativeInsights().rows;
  els.initiativeGrid.innerHTML = rows.map((i) => {
    const disabled = !i.canLaunch;
    const icon = INITIATIVE_ICONS[i.id] || "✨";
    const tooltip = `${i.name}
${i.desc}
Cost: AP ${i.costAP} · ${formatMoneyMillions(i.costCash)}
${i.effectLabel}${disabled && i.needLabel ? `
Need: ${i.needLabel}` : ""}`;
    return `<button class="initiative-icon-btn ${i.canLaunch ? "ready" : ""}" data-initiative-id="${i.id}" ${disabled ? "disabled" : ""} title="${escapeHtml(tooltip)}" aria-label="${escapeHtml(i.name)}">
      <span class="initiative-emoji">${icon}</span>
      <span class="initiative-label">${i.name}</span>
      <span class="initiative-cost">AP ${i.costAP} · ${formatMoneyMillions(i.costCash)}</span>
    </button>`;
  }).join("");
}

function renderIndustryPanel() {
  if (!els.industryProjects || !els.foundationGrid || !els.industrySummary) return;
  const inIndustryTutorial = tutorialIsActive() && state.tutorial.phase === "industry";
  const industryCard = document.getElementById("industryCard");
  if (industryCard) industryCard.classList.toggle("tutorial-highlight", inIndustryTutorial);
  updateFoundations();
  const net = state.industry.metrics.net || 0;
  const util = state.industry.metrics.utilization || 0;
  const missing = state.industry.metrics.missing || [];
  els.industrySummary.textContent = state.industry.zones.length === 0
    ? "No production districts online yet. Build one and satisfy dependencies to unlock revenue."
    : `Industry net ${formatMoneyMillions(net)}/day · Utilization ${Math.round(util)}%${missing.length ? ` · Missing: ${missing.join(", ")}` : ""}`;

  if (els.industryGuide) {
    const recId = recommendedIndustryProjectId();
    const rec = recId ? projectById(recId) : null;
    els.industryGuide.hidden = !inIndustryTutorial;
    if (inIndustryTutorial) {
      els.industryGuide.innerHTML = `<div class="title">Guided Placement</div>
        <ol class="steps">
          <li>Click a project icon below (${rec?.name || "first unlocked project"} recommended).</li>
          <li>It will switch to placement mode.</li>
          <li>Click any green-valid map area to place and start construction.</li>
        </ol>
        <div class="actions">
          <button class="btn primary" data-industry-guide-arm="1">Arm Recommended Project</button>
        </div>`;
    } else {
      els.industryGuide.innerHTML = "";
    }
  }

  els.foundationGrid.innerHTML = FOUNDATION_DEFS.map((f) => {
    const v = state.industry.foundations[f.id] || 0;
    const cls = v >= 65 ? "good" : v >= 50 ? "warn" : "bad";
    return `<article class="foundation-chip ${cls}" title="${f.help}">
      <div class="head"><span>${f.emoji} ${f.label}</span><strong>${Math.round(v)}</strong></div>
      <div class="track"><div class="fill" style="width:${clamp(v, 0, 100)}%"></div></div>
    </article>`;
  }).join("");

  const palette = `<div class="industry-palette">${INDUSTRY_PROJECT_DEFS.map((p) => {
    const selected = state.ui.industryPlacement?.projectId === p.id || state.industry.selectedProjectId === p.id;
    const locked = !industryTierAllowed(p);
    const icon = `./assets/cozy-pack/actors/${p.art}.svg`;
    return `<button class="industry-palette-btn ${selected ? "active" : ""} ${locked ? "locked" : ""}" data-industry-build="${p.id}" data-industry-id="${p.id}" draggable="${locked ? "false" : "true"}" ${locked ? "disabled" : ""} title="${p.name}">
      <img src="${icon}" alt="${p.name}" />
      <span>${p.name.split(" ")[0]}</span>
    </button>`;
  }).join("")}</div>`;

  els.industryProjects.innerHTML = `${palette}${INDUSTRY_PROJECT_DEFS.map((p) => {
    const selected = state.ui.industryPlacement?.projectId === p.id || state.industry.selectedProjectId === p.id;
    const locked = !industryTierAllowed(p);
    const deposit = round(p.cost * 0.55);
    const zoneCount = state.industry.zones.filter((z) => z.projectId === p.id).length;
    const fRows = FOUNDATION_DEFS.map((f) => {
      const need = p.needs[f.id] || 0;
      const got = state.industry.foundations[f.id] || 0;
      const ok = got >= need;
      return `<span class="dep ${ok ? "ok" : "miss"}">${f.emoji} ${Math.round(got)}/${need}</span>`;
    }).join("");
    const label = locked ? `Locked (${TIER_CONFIG[p.tier].name})` : selected ? "Drag to map or click to arm" : "Build Project";
    const disabled = locked ? "disabled" : "";
    return `<article class="industry-card ${selected ? "active" : ""}">
      <div class="title">${p.name}</div>
      <div class="meta">${p.desc}</div>
      <div class="meta">Footprint ${p.size}x${p.size} · Build ${p.buildDays}d · Deposit ${formatMoneyMillions(deposit)} · Total ${formatMoneyMillions(p.cost)} · Built ${zoneCount}</div>
      <div class="dep-row">${fRows}</div>
      <button class="btn industry-build-btn ${selected && !locked ? "primary" : ""}" data-industry-build="${p.id}" data-industry-id="${p.id}" ${disabled}>${label}</button>
    </article>`;
  }).join("")}`;
}

function renderDefensePanel() {
  if (!els.defenseProjects || !els.defenseSummary) return;
  const readiness = state.defense.metrics.readiness || 0;
  const upkeep = state.defense.metrics.upkeep || 0;
  const netRisk = state.defense.metrics.netRisk || 0;
  const active = state.defense.bases.filter((b) => b.status === "active").length;
  const building = state.defense.bases.filter((b) => b.status !== "active").length;
  els.defenseSummary.textContent = state.defense.bases.length === 0
    ? "No defense sites online yet. Build cyber, air, or guard bases to reduce strategic threat pressure."
    : `Readiness ${round(readiness)}% · Upkeep ${formatMoneyMillions(upkeep)}/day · Threat pressure ${Math.round(netRisk * 100)}% · Active ${active}${building ? ` · Building ${building}` : ""}`;

  const palette = `<div class="industry-palette">${DEFENSE_BASE_DEFS.map((d) => {
    const selected = state.ui.defensePlacement?.baseTypeId === d.id || state.defense.selectedBaseTypeId === d.id;
    const locked = !defenseTierAllowed(d);
    const icon = `./assets/cozy-pack/buildings/${d.buildingArtPrefix}1.svg`;
    return `<button class="industry-palette-btn ${selected ? "active" : ""} ${locked ? "locked" : ""}" data-defense-build="${d.id}" draggable="${locked ? "false" : "true"}" ${locked ? "disabled" : ""} title="${d.name}">
      <img src="${icon}" alt="${d.name}" />
      <span>${d.name.split(" ")[0]}</span>
    </button>`;
  }).join("")}</div>`;

  const rows = DEFENSE_BASE_DEFS.map((d) => {
    const selected = state.ui.defensePlacement?.baseTypeId === d.id || state.defense.selectedBaseTypeId === d.id;
    const locked = !defenseTierAllowed(d);
    const deposit = round(d.cost * 0.55);
    const built = state.defense.bases.filter((b) => b.baseTypeId === d.id).length;
    const label = locked ? `Locked (${TIER_CONFIG[d.tier].name})` : selected ? "Drag to map or click to arm" : "Arm Base Placement";
    return `<article class="industry-card ${selected ? "active" : ""}">
      <div class="title">${d.name}</div>
      <div class="meta">${d.desc}</div>
      <div class="meta">Footprint ${d.size}x${d.size} · Build ${d.buildDays}d · Deposit ${formatMoneyMillions(deposit)} · Total ${formatMoneyMillions(d.cost)} · Built ${built}</div>
      <button class="btn industry-build-btn ${selected && !locked ? "primary" : ""}" data-defense-build="${d.id}" ${locked ? "disabled" : ""}>${label}</button>
    </article>`;
  }).join("");

  const selectedBase = defenseBaseById(state.selectedDefenseId);
  const selectedCard = selectedBase
    ? (() => {
      const expand = defenseExpandCostDays(selectedBase);
      const canExpand = selectedBase.status === "active" && selectedBase.size < 24;
      const disabled = canExpand ? "" : "disabled";
      const title = canExpand ? `Spend 2 AP and ${formatMoneyMillions(expand.cost)} to expand.` : "Select an active base below 24x24.";
      return `<article class="industry-card ${canExpand ? "active" : ""}">
        <div class="title">Selected Base: ${selectedBase.name}</div>
        <div class="meta">Footprint ${selectedBase.size}x${selectedBase.size} · Readiness ${round(selectedBase.readiness || 0)}% · Budget ${Math.round(selectedBase.budget || 70)}</div>
        <button class="btn ${canExpand ? "primary" : ""}" data-defense-expand="${selectedBase.id}" ${disabled} title="${title}">
          Expand To ${expand.nextSize}x${expand.nextSize} (${formatMoneyMillions(expand.cost)} · ${expand.days}d)
        </button>
      </article>`;
    })()
    : "";

  els.defenseProjects.innerHTML = `${palette}${rows}${selectedCard}`;
}

function industryQuickTooltip(project) {
  if (!project) return "Hover an icon to inspect footprint, costs, and dependencies.";
  const deposit = round(project.cost * 0.55);
  const needs = FOUNDATION_DEFS.map((f) => {
    const need = project.needs[f.id] || 0;
    const got = state.industry.foundations[f.id] || 0;
    return `${f.emoji} ${f.label}: ${Math.round(got)}/${need}`;
  }).join(" · ");
  return `${project.name}: ${project.desc} Footprint ${project.size}x${project.size} · Build ${project.buildDays}d · Deposit ${formatMoneyMillions(deposit)} · Total ${formatMoneyMillions(project.cost)}. Needs: ${needs}.`;
}

function defenseQuickTooltip(def) {
  if (!def) return "Hover an icon to inspect footprint, costs, and dependencies.";
  const deposit = round(def.cost * 0.55);
  return `${def.name}: ${def.desc} Footprint ${def.size}x${def.size} · Build ${def.buildDays}d · Deposit ${formatMoneyMillions(deposit)} · Total ${formatMoneyMillions(def.cost)} · Upkeep ~${formatMoneyMillions(def.baseUpkeep)}/day.`;
}

function departmentQuickTooltip(id) {
  const b = findBuilding(id);
  if (!b) return "Core department.";
  const why = {
    health: "Keeps hospitals functioning and reduces long-run social cost from preventable illness.",
    education: "Raises workforce capability and long-run productivity.",
    transport: "Improves movement, logistics, and reliability across every system.",
    welfare: "Stabilizes vulnerable households and prevents cascading poverty shocks.",
    security: "Reduces crime pressure and protects everyday safety confidence.",
    climate: "Cuts climate damage risk and improves air/environment outcomes.",
    treasury: "Maintains fiscal capacity so the state can fund everything else sustainably.",
    integrity: "Reduces corruption drag and improves policy trust and delivery efficiency.",
  };
  return `${b.name}: ${b.desc} Why build it: ${why[id] || "Provides foundational state capacity."}`;
}

function updateQuickBuildTooltip() {
  if (!els.quickBuildToolbox || els.quickBuildToolbox.hidden) return;
}

function renderQuickBuildToolbox() {
  if (!els.quickBuildToolbox || !els.quickIndustryGrid || !els.quickDefenseGrid || !els.quickBuildToggleBtn) return;
  const guided = tutorialIsActive() && state.tutorial.phase !== "freeplay";
  const guidedNeedsToolbox = state.tutorial.phase === "industry";
  const unplacedDepartments = state.buildings.filter((b) => !b.placed);
  const foundingMode = unplacedDepartments.length > 0;
  const blocked = state.gameOver.active || (state.sim.started && guided && !guidedNeedsToolbox);
  els.quickBuildToolbox.hidden = blocked;
  els.quickBuildToolbox.classList.toggle("toolbox-hidden", blocked);
  els.quickBuildToolbox.classList.toggle("founding-mode", foundingMode);
  const spotlight =
    !blocked
    && (Date.now() < (state.ui.toolboxSpotlightUntilMs || 0)
      || (!state.sim.started && foundingMode && !state.ui.foundingFirstPickDone));
  els.quickBuildToolbox.classList.toggle("spotlight", spotlight);
  if (els.mapPanel) els.mapPanel.classList.toggle("toolbox-spotlight", spotlight);
  const revealActive = !blocked && Date.now() < (state.ui.mapRevealUntilMs || 0);
  if (els.mapPanel) els.mapPanel.classList.toggle("reveal-active", revealActive);
  const mapSpotlight = !blocked && Date.now() < (state.ui.mapSpotlightUntilMs || 0);
  if (els.mapPanel) els.mapPanel.classList.toggle("map-action-spotlight", mapSpotlight);
  if (blocked) return;

  const guidedEarly = !foundingMode && guided && ["budget", "upgrade"].includes(state.tutorial.phase);
  const guidedBusyStep = !foundingMode && guided && ["budget", "upgrade", "industry", "incident", "rapid"].includes(state.tutorial.phase);
  if (foundingMode) state.ui.quickBuildCollapsed = false;
  if (!foundingMode && !state.sim.started) state.ui.quickBuildCollapsed = true;
  if (guidedEarly) state.ui.quickBuildCollapsed = true;
  if (guidedBusyStep && !spotlight) state.ui.quickBuildCollapsed = true;
  if (!foundingMode && guided && state.tutorial.phase === "industry" && spotlight) state.ui.quickBuildCollapsed = false;
  els.quickBuildToolbox.classList.toggle("is-collapsed", state.ui.quickBuildCollapsed);
  els.quickBuildToolbox.classList.toggle("guided-early", guidedEarly);
  els.quickBuildToggleBtn.textContent = state.ui.quickBuildCollapsed ? "Build +" : "Minimize";
  els.quickBuildToggleBtn.disabled = guidedEarly;
  els.quickBuildToggleBtn.title = guidedEarly ? "Unlocks fully at the industry step." : "";
  els.quickBuildToolbox.style.left = "auto";
  els.quickBuildToolbox.style.right = "12px";
  els.quickBuildToolbox.style.top = "auto";
  els.quickBuildToolbox.style.bottom = state.ui.quickBuildCollapsed ? "12px" : "10px";
  els.quickBuildToolbox.style.width = "";
  els.quickBuildToolbox.style.height = "";

  if (foundingMode) {
    if (els.quickPrimaryTitle) els.quickPrimaryTitle.textContent = "Founding Departments";
    if (els.quickSecondaryTitle) els.quickSecondaryTitle.textContent = "Progress";
    if (els.quickSecondarySection) els.quickSecondarySection.hidden = true;
    const departmentTiles = BUILDING_DEFS.map((def) => {
      const b = findBuilding(def.id);
      const placed = Boolean(b?.placed);
      const armed = state.ui.placementBuildingId === def.id;
      const icon = departmentArtSrc(def.id, 1);
      const label = `${def.name.split(" ")[0]}`;
      return `<button type="button" class="quick-build-item ${armed ? "armed" : ""} ${placed ? "placed" : "required"}" data-quick-kind="department" data-quick-id="${def.id}" title="${def.name}" ${placed ? "disabled" : ""}>
        <img src="${icon}" alt="${def.name}" />
        <span>${label}</span>
        ${placed ? '<em class="quick-build-complete" aria-hidden="true">✓</em>' : ""}
      </button>`;
    }).join("");
    els.quickIndustryGrid.innerHTML = departmentTiles;
    els.quickDefenseGrid.innerHTML = "";
  } else {
    if (els.quickPrimaryTitle) els.quickPrimaryTitle.textContent = "Industry";
    if (els.quickSecondaryTitle) els.quickSecondaryTitle.textContent = "Defense";
    if (els.quickSecondarySection) els.quickSecondarySection.hidden = false;
    const industryTiles = INDUSTRY_PROJECT_DEFS.map((p) => {
      const armed = state.ui.industryPlacement?.projectId === p.id;
      const selected = armed || state.industry.selectedProjectId === p.id;
      const locked = !industryTierAllowed(p);
      const icon = `./assets/cozy-pack/actors/${p.art}.svg`;
      const status = locked ? `Unlocks at ${TIER_CONFIG[p.tier].name}` : "Available now";
      return `<button type="button" class="quick-build-item ${selected ? "active" : ""} ${armed ? "armed" : ""} ${locked ? "locked" : ""}" data-quick-kind="industry" data-quick-id="${p.id}" title="${p.name} · ${status}" ${locked ? "disabled" : ""}>
        <img src="${icon}" alt="${p.name}" />
        <span>${p.name.split(" ")[0]}</span>
        ${locked ? `<em class="quick-lock-badge">${TIER_CONFIG[p.tier].name}</em>` : ""}
      </button>`;
    }).join("");
    els.quickIndustryGrid.innerHTML = industryTiles;

    const defenseTiles = DEFENSE_BASE_DEFS.map((d) => {
      const armed = state.ui.defensePlacement?.baseTypeId === d.id;
      const selected = armed || state.defense.selectedBaseTypeId === d.id;
      const locked = !defenseTierAllowed(d);
      const icon = `./assets/cozy-pack/buildings/${d.buildingArtPrefix}1.svg`;
      const status = locked ? `Unlocks at ${TIER_CONFIG[d.tier].name}` : "Available now";
      return `<button type="button" class="quick-build-item ${selected ? "active" : ""} ${armed ? "armed" : ""} ${locked ? "locked" : ""}" data-quick-kind="defense" data-quick-id="${d.id}" title="${d.name} · ${status}" ${locked ? "disabled" : ""}>
        <img src="${icon}" alt="${d.name}" />
        <span>${d.name.split(" ")[0]}</span>
        ${locked ? `<em class="quick-lock-badge">${TIER_CONFIG[d.tier].name}</em>` : ""}
      </button>`;
    }).join("");
    els.quickDefenseGrid.innerHTML = defenseTiles;
  }

  updateQuickBuildTooltip();
}

function renderActionDock() {
  if (!els.actionDock) return;
  if (!state.sim.started || (tutorialIsActive() && state.tutorial.phase !== "freeplay")) {
    els.actionDock.hidden = true;
    return;
  }
  const manual = manualActionIncidents();
  const overloaded = state.buildings.filter((b) => b.placed && (b.state === "overloaded" || b.state === "strained"));
  const activeMajor = state.majorEvents.length;
  const initiativeInfo = initiativeInsights();
  const electionDays = state.election.nextElectionDay - state.day;
  const items = [];
  if (state.election.campaignActive && electionDays > 0) {
    const proj = electionProjection(false);
    items.push(`<button class="action-chip hot" data-action-dock="election">🗳️ Election ${electionDays}d · ${round(proj.national)}%</button>`);
  }
  if (hasActionableRapidBrief()) {
    items.push(`<button class="action-chip hot" data-action-dock="rapid">🚨 INCIDENT ${state.rapid.active.incidentCode} (${Math.max(0, state.rapid.active.expiresDay - state.day)}d)</button>`);
  }
  if (manual.length > 0) {
    items.push(`<button class="action-chip" data-action-dock="incidents">❗ Incidents ${manual.length}</button>`);
  }
  if (activeMajor > 0) {
    items.push(`<button class="action-chip hot" data-action-dock="major">🧨 Major ${activeMajor}</button>`);
  }
  if (state.housing.active) {
    items.push(`<button class="action-chip" data-action-dock="housing">🏘️ Housing (${Math.max(0, state.housing.active.expiresDay - state.day)}d)</button>`);
  }
  if (state.ui.initiativeGuideActive) {
    items.push("<button class=\"action-chip hot\" data-action-dock=\"initiatives\">🧩 New: Initiatives</button>");
  } else if (initiativeInfo.affordable.length > 0 && (initiativeInfo.needsAttention || state.election.campaignActive || activeMajor > 0)) {
    items.push(`<button class="action-chip" data-action-dock="initiatives">🧩 Initiatives Ready ${initiativeInfo.affordable.length}</button>`);
  }
  if (overloaded.length > 0) {
    items.push(`<button class="action-chip" data-action-dock="building">🏛️ Services Need Support ${overloaded.length}</button>`);
  }
  const lowFoundations = FOUNDATION_DEFS.filter((f) => (state.industry.foundations[f.id] || 0) < 52);
  if (lowFoundations.length > 0 && state.industry.zones.some((z) => z.status === "active")) {
    items.push(`<button class="action-chip" data-action-dock="industry">🏭 Industry Bottlenecks ${lowFoundations.length}</button>`);
  }
  if (state.defense.bases.length > 0 && (state.defense.metrics.readiness || 0) < 52) {
    items.push(`<button class="action-chip hot" data-action-dock="defense">🛡️ Defense Ready ${round(state.defense.metrics.readiness || 0)}%</button>`);
  }
  if (items.length === 0) {
    els.actionDock.hidden = true;
    return;
  }
  els.actionDock.hidden = false;
  els.actionDock.innerHTML = items.join("");
}

function topManualIncident() {
  const manual = manualActionIncidents()
    .filter((i) => canPlayerActOnIncidentNow(i))
    .sort((a, b) => (b.severity - a.severity) || (b.daysOpen - a.daysOpen));
  return manual[0] || null;
}

function renderNowStrip() {
  if (!els.nowStrip || !els.nowStripText) return;
  els.nowStrip.hidden = true;
  if (els.nowStripGo) els.nowStripGo.disabled = true;
  if (!state.ui.nowStripTracker) state.ui.nowStripTracker = { candidateId: null, sinceMs: 0 };
  if (!state.sim.started) {
    return;
  }
  if (tutorialIsActive() && state.tutorial.phase !== "freeplay") {
    return;
  }
  if (hasMomentFocusLock()) {
    return;
  }
  const blockingOverlay = hasBlockingMapOverlay();
  if (blockingOverlay) {
    return;
  }
  if (!hasActionableRapidBrief()) {
    state.ui.nowStripTracker.candidateId = null;
    state.ui.nowStripTracker.sinceMs = 0;
    return;
  }
  const rapid = state.rapid.active;
  const rapidId = rapid.incidentCode || rapid.id || `rapid_${state.day}`;
  const now = Date.now();
  if (state.ui.nowStripTracker.candidateId !== rapidId) {
    state.ui.nowStripTracker.candidateId = rapidId;
    state.ui.nowStripTracker.sinceMs = now;
    return;
  }
  if (now - state.ui.nowStripTracker.sinceMs < 1200) return;
  const daysLeft = Math.max(0, rapid.expiresDay - state.day);
  els.nowStripText.textContent = `RAPID BRIEF: ${rapid.title || rapid.incidentCode || "Decision Needed"} · ${daysLeft}d left`;
  if (els.nowStripGo) els.nowStripGo.disabled = false;
  els.nowStrip.hidden = false;
}

function renderSelection() {
  const hud = els.mapSelectionHud;
  const hudBody = els.mapSelectionBody;
  const descWrap = els.selectedDescWrap;
  if (hasMomentFocusLock()) {
    state.ui.mapHudOpen = false;
    if (hud) hud.hidden = true;
    return;
  }
  if (hasBlockingMapOverlay()) {
    state.ui.mapHudOpen = false;
    if (hud) hud.hidden = true;
    return;
  }
  const setMeta = (text = "", visible = true) => {
    if (!els.selectedMeta) return;
    els.selectedMeta.textContent = text;
    els.selectedMeta.hidden = !visible || !text;
  };
  if (!state.ui.mapHudOpen) {
    if (hud) hud.hidden = true;
    return;
  }
  syncMapHudToggleButton();
  const setBudgetReadout = (current = "-", target = "-", delta = "-", impact = "-") => {
    setText(els.budgetCurrent, current);
    setText(els.budgetTarget, target);
    setText(els.budgetDelta, delta);
    setText(els.budgetImpact, impact);
  };
  const base = defenseBaseById(state.selectedDefenseId);
  if (base) {
    const def = defenseTypeById(base.baseTypeId);
    const level = base.level || 1;
    const { cost, days } = defenseUpgradeCostDays(base);
    const expand = defenseExpandCostDays(base);
    els.selectedName.textContent = base.name;
    els.selectedDesc.textContent = `${def?.desc || "Defense installation."} Readiness ${round(base.readiness || 0)}% · Footprint ${base.size}x${base.size}.`;
    els.selectedLevel.textContent = `Level ${level}`;
    els.selectedBudget.textContent = `${Math.round(base.budget || 70)}`;
    const statusText = base.status === "active"
      ? "Operational ✅"
      : base.status === "upgrading"
        ? `Upgrading (${Math.max(0, base.completeDay - state.day)}d)`
        : base.status === "expanding"
          ? `Expanding (${Math.max(0, base.completeDay - state.day)}d)`
          : `Constructing (${Math.max(0, base.completeDay - state.day)}d)`;
    els.selectedStatus.textContent = statusText;
    els.selectedCost.textContent = (level >= 5 || base.status !== "active")
      ? "-"
      : `${formatMoneyMillions(cost)} · ${days}d`;
    setMeta(
      base.status === "active"
        ? (level >= 5 ? `Level ${level} maxed` : `Level ${level} -> ${level + 1} · 2 AP · ${formatMoneyMillions(cost)}`)
        : statusText
    );
    els.budgetSlider.disabled = false;
    els.budgetSlider.min = "30";
    els.budgetSlider.max = "140";
    els.budgetSlider.step = "1";
    els.budgetSlider.value = String(Math.round(base.budget || 70));
    setBudgetReadout(
      String(Math.round(base.budget || 70)),
      String(Math.round(Number(els.budgetSlider.value))),
      formatSignedNumber(Math.round(Number(els.budgetSlider.value)) - Math.round(base.budget || 70)),
      `${formatSignedMoneyMillions(round(-(Math.round(Number(els.budgetSlider.value)) - Math.round(base.budget || 70)) * 0.08))}/day`
    );
    if (els.applyBudgetBtn) els.applyBudgetBtn.textContent = "Set Budget";
    syncBudgetGauge(null, 60);
    if (els.upgradeBtn) {
      els.upgradeBtn.textContent = level >= 5 ? "Maxed" : "Level Up";
    }
    if (els.sellBtn) els.sellBtn.textContent = "Remove";
    if (els.selectedDesc) {
      const expansionTag = base.status === "active" && base.size < 24
        ? ` Expand option: ${expand.nextSize}x${expand.nextSize} (${formatMoneyMillions(expand.cost)}, ${expand.days}d).`
        : "";
      els.selectedDesc.textContent += expansionTag;
    }
    positionSelectionHud();
    if (hud) hud.hidden = false;
    if (hudBody) hud.classList.toggle("collapsed", state.ui.mapHudCollapsed);
    if (descWrap) descWrap.hidden = !state.ui.mapHudInfoOpen;
    if (els.mapHudInfoBtn) els.mapHudInfoBtn.setAttribute("aria-expanded", state.ui.mapHudInfoOpen ? "true" : "false");
    return;
  }
  const z = findIndustryZone(state.selectedIndustryId);
  if (z) {
    const p = projectById(z.projectId);
    const { cost, days } = industryUpgradeCostDays(z);
    const lvl = z.level || 1;
    els.selectedName.textContent = z.name;
    els.selectedDesc.textContent = p
      ? `${p.desc} ${
        z.status === "active"
          ? `Current efficiency ${Math.round((z.efficiency || 0) * 100)}% · Net ${formatMoneyMillions(z.output || 0)}/day.`
          : `Status: ${z.status}.`
      }`
      : "Industry facility.";
    els.selectedLevel.textContent = `Level ${lvl}`;
    els.selectedBudget.textContent = "N/A";
    const statusText = z.status === "active"
      ? "Producing ✅"
      : z.status === "upgrading"
        ? `Upgrading (${Math.max(0, z.completeDay - state.day)}d)`
        : `Constructing (${Math.max(0, z.completeDay - state.day)}d)`;
    els.selectedStatus.textContent = statusText;
    els.selectedCost.textContent = (lvl >= 5 || z.status !== "active") ? "-" : `${formatMoneyMillions(cost)} · ${days}d`;
    setMeta(
      z.status === "active"
        ? (lvl >= 5 ? `Level ${lvl} maxed` : `Level ${lvl} -> ${lvl + 1} · 2 AP · ${formatMoneyMillions(cost)}`)
        : statusText
    );
    els.budgetSlider.disabled = true;
    els.budgetSlider.min = "20";
    els.budgetSlider.max = "120";
    els.budgetSlider.value = "60";
    setBudgetReadout();
    if (els.applyBudgetBtn) els.applyBudgetBtn.textContent = "Set Budget";
    syncBudgetGauge(null, 60);
    if (els.upgradeBtn) els.upgradeBtn.textContent = "Level Up";
    positionSelectionHud();
    if (hud) hud.hidden = false;
    if (hudBody) hud.classList.toggle("collapsed", state.ui.mapHudCollapsed);
    if (descWrap) descWrap.hidden = !state.ui.mapHudInfoOpen;
    if (els.mapHudInfoBtn) els.mapHudInfoBtn.setAttribute("aria-expanded", state.ui.mapHudInfoOpen ? "true" : "false");
    return;
  }
  const b = findBuilding(state.selectedBuildingId);
  if (!b) {
    els.selectedName.textContent = "Select a Department";
    els.selectedDesc.textContent = "Pick a building in the city to inspect funding and upgrades.";
    els.selectedLevel.textContent = "-";
    els.selectedBudget.textContent = "-";
    els.selectedStatus.textContent = "-";
    els.selectedCost.textContent = "-";
    setMeta("", false);
    els.budgetSlider.disabled = true;
    els.budgetSlider.min = "20";
    els.budgetSlider.max = "120";
    setBudgetReadout();
    if (els.applyBudgetBtn) els.applyBudgetBtn.textContent = "Set Budget";
    syncBudgetGauge(null, 60);
    if (els.upgradeBtn) els.upgradeBtn.textContent = "Level Up";
    state.ui.mapHudInfoOpen = false;
    state.ui.mapHudOpen = false;
    if (hud) hud.hidden = true;
    return;
  }

  const cost = 12 + b.level * 8;
  const budgetCeiling = departmentBudgetCeiling(b);
  els.budgetSlider.disabled = false;
  els.budgetSlider.min = "20";
  els.budgetSlider.max = String(budgetCeiling);
  els.budgetSlider.step = "1";
  if (els.upgradeBtn) els.upgradeBtn.textContent = "Level Up";
  if (!Number.isFinite(state.ui.budgetDraftByBuilding[b.id])) state.ui.budgetDraftByBuilding[b.id] = b.budget;
  const draft = departmentBudgetDraftValue(b);
  const metrics = departmentServiceMetrics(b, draft, b.level);
  const coverage = metrics.coverage;
  const demand = metrics.demand;
  const capacity = metrics.capacity;
  const reserveCap = metrics.reserveCap;
  const service = serviceStateForKey(b.kpi);
  const reserve = service ? clamp(service.reserve || 0, 0, reserveCap) : 0;
  const autoOn = Boolean(state.ui.autoBudgetByBuilding?.[b.id]);
  const delta = draft - b.budget;
  const treasuryImpact = estimateBudgetTreasuryDeltaPerDay(b, draft);
  els.selectedName.textContent = b.name;
  els.selectedDesc.textContent = b.desc;
  els.selectedLevel.textContent = `Level ${b.level}`;
  els.selectedBudget.textContent = Math.abs(draft - b.budget) >= 1
    ? `${round(b.budget)} -> ${round(draft)}${autoOn ? " · Auto" : ""}`
    : `${round(b.budget)}${autoOn ? " · Auto" : ""}`;
  const statusMeta = BUILDING_STATE_META[b.state] || BUILDING_STATE_META.stable;
  const countdown = b.state === "overloaded" ? "· 5 days to recover" : b.state === "strained" ? "· 10 days to recover" : "";
  els.selectedStatus.textContent = `${statusMeta.label} ${countdown}`.trim();
  els.selectedCost.textContent = formatMoneyMillions(cost);
  els.selectedDesc.textContent = `${b.desc} Demand ${demand.toFixed(1)} · Capacity ${capacity.toFixed(1)} · Reserve ${reserve.toFixed(1)}/${reserveCap.toFixed(1)} · Coverage ${coverage >= 0 ? "+" : ""}${coverage.toFixed(1)}. Surplus funding builds runway; shortages burn reserve before the KPI slips.`;
  setMeta(
    b.level >= 10
      ? `Level ${b.level} maxed`
      : `Level ${b.level} -> ${b.level + 1} · 2 AP · ${formatMoneyMillions(cost)}`
  );
  els.budgetSlider.value = String(draft);
  setBudgetReadout(
    String(round(b.budget)),
    String(round(draft)),
    formatSignedNumber(delta),
    `${formatSignedMoneyMillions(treasuryImpact)}/day`
  );
  syncBudgetGauge(b, draft);
  positionSelectionHud();
  if (hud) hud.hidden = false;
  if (hudBody) hud.classList.toggle("collapsed", state.ui.mapHudCollapsed);
  if (descWrap) descWrap.hidden = !state.ui.mapHudInfoOpen;
  if (els.mapHudInfoBtn) els.mapHudInfoBtn.setAttribute("aria-expanded", state.ui.mapHudInfoOpen ? "true" : "false");
}

function positionSelectionHud() {
  if (!els.mapSelectionHud || !els.mapPanel) return;
  const anchor = selectionAnchorTile();
  if (!anchor) {
    els.mapSelectionHud.hidden = true;
    return;
  }
  const p = isoToScreen(anchor[0], anchor[1]);
  const rect = els.mapPanel.getBoundingClientRect();
  const hudWidth = Math.min(236, Math.max(208, rect.width * 0.2));
  const left = clamp(p.x - hudWidth / 2, 12, Math.max(12, rect.width - hudWidth - 12));
  const top = clamp(p.y - (state.ui.mapHudCollapsed ? 118 : state.ui.mapHudInfoOpen ? 224 : 184), 12, Math.max(12, rect.height - 80));
  els.mapSelectionHud.style.width = `${hudWidth}px`;
  els.mapSelectionHud.style.left = `${left}px`;
  els.mapSelectionHud.style.top = `${top}px`;
}

function renderUI() {
  if (hasBlockingMapOverlay()) clearActiveSkillCheck();
  renderHud();
  renderOnboardingLayout();
  renderSelection();
  renderQuickBuildToolbox();
  renderSetupOverlay();
  renderTutorialOverlay();
  renderNowStrip();
  renderIntroBriefing();
  applyTutorialHighlights();
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
  const r = cityRadius() + 1.5;
  const minIX = clamp(Math.floor(CITY_CORE_TILE[0] - r), 0, MAP_W - 1);
  const maxIX = clamp(Math.ceil(CITY_CORE_TILE[0] + r), 0, MAP_W - 1);
  const minIY = clamp(Math.floor(CITY_CORE_TILE[1] - r), 0, MAP_H - 1);
  const maxIY = clamp(Math.ceil(CITY_CORE_TILE[1] + r), 0, MAP_H - 1);

  const corners = [
    { x: (minIX - minIY) * halfW, y: (minIX + minIY) * halfH },
    { x: (minIX - maxIY) * halfW, y: (minIX + maxIY) * halfH },
    { x: (maxIX - minIY) * halfW, y: (maxIX + minIY) * halfH },
    { x: (maxIX - maxIY) * halfW, y: (maxIX + maxIY) * halfH },
  ];
  const minTermX = Math.min(...corners.map((c) => c.x));
  const maxTermX = Math.max(...corners.map((c) => c.x));
  const minTermY = Math.min(...corners.map((c) => c.y));
  const maxTermY = Math.max(...corners.map((c) => c.y));
  const spanY = maxTermY - minTermY;

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

  const centerYForBottom = (state.camera.viewH - padBottom) - maxTermY;
  const centerYForTop = padTop - minTermY;
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
  if (state.ui.activeSkillCheck?.status === "resolved") {
    const resolvedFor = performance.now() - (state.ui.activeSkillCheck.resolvedAt || 0);
    if (resolvedFor >= 1150) clearActiveSkillCheck();
  }
  state.ui.ripples = state.ui.ripples
    .map((r) => ({ ...r, ttl: r.ttl - dt }))
    .filter((r) => r.ttl > 0);
  state.ui.skillBursts = (state.ui.skillBursts || [])
    .map((b) => ({ ...b, ttl: b.ttl - dt }))
    .filter((b) => b.ttl > 0);
  state.ui.apToasts = state.ui.apToasts
    .map((t) => ({ ...t, ttl: t.ttl - dt }))
    .filter((t) => t.ttl > 0);
  state.ui.decisionToasts = state.ui.decisionToasts
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
  if (els.decisionFlash) {
    els.decisionFlash.innerHTML = state.ui.decisionToasts
      .map((t) => `<div class="decision-toast ${t.kind}">${t.text}</div>`)
      .join("");
  }
}

function renderMonthlyModal() {
  if (!els.monthlyModal) return;
  const r = state.monthly.report;
  const open = state.monthly.modalOpen && Boolean(r);
  els.monthlyModal.hidden = !open;
  if (!open) return;
  const topBullet = (r.bullets || [])[0] || "No major swings this month.";
  const shortLead = (r.lead || topBullet).split(/(?<=[.!?])\s+/)[0] || topBullet;
  setText(els.monthlyHeadline, r.headline);
  setText(els.monthlySubhead, `Day ${state.day} monthly brief`);
  setText(els.monthlyLead, shortLead);

  const keyPressure = Object.entries(state.ops.heat).sort((a, b) => b[1] - a[1])[0] || ["systems", 0];
  const manualActions = actionableManualIncidents().length + (hasActionableRapidBrief() ? 1 : 0);

  if (els.monthlySummaryList) {
    els.monthlySummaryList.innerHTML = [
      { label: "Treasury", value: formatMoneyMillions(state.budget.treasury) },
      { label: "Stability", value: `${round(state.kpi.stability)}` },
      { label: "Pressure", value: `${prettifyTag(keyPressure[0])} ${Math.round(keyPressure[1] * 100)}%` },
    ].map((item) => `<div class="monthly-chip"><span class="label">${item.label}</span><strong>${item.value}</strong></div>`).join("");
  }

  if (els.monthlyBullets) {
    els.monthlyBullets.innerHTML = [topBullet, ...(r.bullets || []).slice(1, 3), `Manual decisions waiting: ${manualActions}.`]
      .filter(Boolean)
      .slice(0, 3)
      .map((b) => `<li>${b}</li>`)
      .join("");
  }

  if (els.monthlyQuotes) {
    els.monthlyQuotes.innerHTML = (r.quotes || [])
      .slice(0, 2)
      .map((q) => {
        const match = q.match(/^\(([^)]+)\)\s*[“"]?(.+?)[”"]?$/);
        if (match) {
          return `<li><span class="monthly-quote-source">${match[1]}</span>${match[2]}</li>`;
        }
        return `<li>${q}</li>`;
      })
      .join("");
  }

  if (els.monthlyDecisionList) {
    const decisions = (r.decisions || []).slice(0, 2);
    els.monthlyDecisionList.innerHTML = decisions.length
      ? decisions.map((d) => {
          const trustTag = d.trustDelta >= 0 ? `Trust +${round(d.trustDelta)}` : `Trust ${round(d.trustDelta)}`;
          return `<li><strong>${d.title}</strong><span class="monthly-call-impact">${trustTag}</span><br/>${d.choice}</li>`;
        }).join("")
      : "<li>No major calls recorded this month.</li>";
  }
}

function renderElectionModal() {
  if (!els.electionModal) return;
  const r = state.election.report;
  const open = state.election.modalOpen && Boolean(r);
  els.electionModal.hidden = !open;
  if (!open) return;
  setText(els.electionHeadline, r.headline || "Election Night");
  setText(els.electionSubhead, r.subhead || "");
  setText(els.electionLead, r.lead || "");
  if (els.electionPollBars) {
    els.electionPollBars.innerHTML = (r.groups || []).map((g) => {
      const w = clamp(g.support || 0, 0, 100);
      const trend = g.trend > 0 ? `+${round(g.trend)}` : `${round(g.trend || 0)}`;
      return `<article class="election-row">
        <div class="election-head">
          <span>${g.label}</span>
          <strong>${round(g.support)}%</strong>
        </div>
        <div class="election-track"><div class="election-fill" style="width:${w}%"></div></div>
        <div class="election-meta">Mood trend ${trend}</div>
      </article>`;
    }).join("");
  }
  if (els.electionFacts) {
    const lines = [...(r.facts || [])].slice(0, 4);
    if (r.effectLine) lines.unshift(`Election effects: ${r.effectLine}`);
    els.electionFacts.innerHTML = lines.map((f) => `<li>${f}</li>`).join("");
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

async function loadScenarioLibrary() {
  try {
    const res = await fetch("../data/calibrated/civic_scenarios_v1.json");
    if (!res.ok) throw new Error("scenario fetch failed");
    const data = await res.json();
    return data?.scenarios || [];
  } catch {
    return [];
  }
}

async function loadTruthChecks() {
  try {
    const res = await fetch("../data/calibrated/truth_checks_v1.json");
    if (!res.ok) throw new Error("truth check fetch failed");
    const data = await res.json();
    return data?.truth_checks || [];
  } catch {
    return [];
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
  syncServiceHealthFromKpi();
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

function handleCanvasPress(sx, sy) {
  if (state.gameOver.active) return;
  if (state.ui.activeSkillCheck) {
    if (state.ui.activeSkillCheck.status === "running") {
      const activeBuilding = findBuilding(state.ui.activeSkillCheck.buildingId);
      const meterHit = pickMapBuildingButtonAt(sx, sy);
      const onSameBuilding = activeBuilding && pickBuildingAt(sx, sy)?.id === activeBuilding.id;
      const onMeter = meterHit?.kind === "skillMeter" && meterHit.id === state.ui.activeSkillCheck.buildingId;
      if (onSameBuilding || onMeter) {
        state.ui.ripples.push({ x: sx, y: sy, ttl: 0.32 });
        resolveBuildingSkillCheck();
      }
    }
    renderUI();
    return;
  }
  state.ui.ripples.push({ x: sx, y: sy, ttl: 0.45 });

  if (state.ui.industryPlacement) {
    const t = screenToTile(sx, sy);
    if (placeIndustryZone(t)) {
      renderUI();
    } else {
      const p = projectById(state.ui.industryPlacement.projectId);
      addTicker(`Cannot place ${p?.name || "project"} here. Use clear developed tiles with road access nearby.`);
    }
    return;
  }

  if (state.ui.defensePlacement) {
    const t = screenToTile(sx, sy);
    if (placeDefenseZone(t)) {
      renderUI();
    } else {
      const d = defenseTypeById(state.ui.defensePlacement.baseTypeId);
      addTicker(`Cannot place ${d?.name || "defense base"} here. Use clear developed land.`);
    }
    return;
  }

  if (state.ui.housingPlacement) {
    const t = screenToTile(sx, sy);
    if (placeHousingZone(t)) {
      renderUI();
    } else {
      const s = state.ui.housingPlacement.size || state.housing.active?.size || 2;
      addTicker(`Cannot place ${s}x${s} housing here. Try a clear developed block.`);
    }
    return;
  }

  if (state.ui.placementBuildingId) {
    const t = screenToTile(sx, sy);
    if (placeBuilding(state.ui.placementBuildingId, t)) {
      renderUI();
    } else {
      addTicker("Cannot place here. Choose an empty non-road tile.");
    }
    return;
  }

  const pickedIndustry = pickIndustryAt(sx, sy);
  if (pickedIndustry) {
    state.selectedIndustryId = pickedIndustry.id;
    state.selectedDefenseId = null;
    state.selectedBuildingId = null;
    addTicker(`Selected ${pickedIndustry.name} (L${pickedIndustry.level || 1}).`);
    focusControlPanel();
    renderUI();
    return;
  }

  const pickedDefense = pickDefenseAt(sx, sy);
  if (pickedDefense) {
    state.selectedDefenseId = pickedDefense.id;
    state.selectedIndustryId = null;
    state.selectedBuildingId = null;
    addTicker(`Selected ${pickedDefense.name} (L${pickedDefense.level || 1}).`);
    focusControlPanel();
    renderUI();
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

  const buildingBtn = pickMapBuildingButtonAt(sx, sy);
  if (buildingBtn) {
    const badgeBuilding = findBuilding(buildingBtn.id);
    const badgeIncident = actionableIncidentForBuilding(buildingBtn.id);
    if (badgeBuilding && badgeIncident && startBuildingSkillCheck(badgeBuilding, badgeIncident)) {
      renderUI();
      return;
    }
  }

  const incident = pickIncidentAt(sx, sy);
  if (incident && !incidentSupportsDirectPlayerAction(incident)) {
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
    const actionIncident = actionableIncidentForBuilding(picked.id);
    if (actionIncident && startBuildingSkillCheck(picked, actionIncident)) {
      renderUI();
      return;
    }
    state.selectedDefenseId = null;
    state.selectedIndustryId = null;
    state.selectedBuildingId = picked.id;
    state.ui.mapHudOpen = true;
    state.ui.mapHudCollapsed = false;
    if (!Number.isFinite(state.ui.budgetDraftByBuilding[picked.id])) {
      state.ui.budgetDraftByBuilding[picked.id] = picked.budget;
    }
    markOnboarding("selectedBuilding");
    renderUI();
    return;
  }

  clearActiveSkillCheck();
  state.ui.mapHudOpen = false;
  renderUI();
}

function bindInput() {
  const unlock = () => unlockAudio();
  window.addEventListener("pointerdown", unlock, { once: true, capture: true });
  window.addEventListener("touchstart", unlock, { once: true, capture: true, passive: true });
  window.addEventListener("keydown", unlock, { once: true, capture: true });

  els.audioSettingsBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    state.ui.audioPanelOpen = !state.ui.audioPanelOpen;
    unlockAudio();
    ensureBgm(true);
    renderUI();
  });
  els.audioPanelCloseBtn?.addEventListener("click", () => {
    state.ui.audioPanelOpen = false;
    renderUI();
  });
  els.mapHudToggleBtn?.addEventListener("click", () => {
    state.ui.mapHudCollapsed = !state.ui.mapHudCollapsed;
    syncMapHudToggleButton();
    renderUI();
  });
  els.mapHudInfoBtn?.addEventListener("click", () => {
    state.ui.mapHudInfoOpen = !state.ui.mapHudInfoOpen;
    renderUI();
  });
  els.bgmVolumeSlider?.addEventListener("input", () => {
    state.audio.bgmVolume = clamp(Number(els.bgmVolumeSlider.value) / 100, 0, 1);
    if (state.audio.bgm) state.audio.bgm.volume = state.audio.bgmVolume;
    ensureBgm(true);
  });
  els.sfxVolumeSlider?.addEventListener("input", () => {
    state.audio.sfxVolume = clamp(Number(els.sfxVolumeSlider.value) / 100, 0, 1);
    playSfx("uiSelect", { throttleMs: 0, volumeMul: 0.8 });
  });
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Node)) return;
    let changed = false;
    if (state.ui.audioPanelOpen && els.audioPanel && els.audioSettingsBtn) {
      if (!els.audioPanel.contains(target) && !els.audioSettingsBtn.contains(target)) {
        state.ui.audioPanelOpen = false;
        changed = true;
      }
    }
    if (state.ui.mapHudOpen && els.mapSelectionHud && !els.mapSelectionHud.contains(target)) {
      const mapPanelPress = Boolean(els.mapPanel && els.mapPanel.contains(target));
      if (!mapPanelPress) {
        state.ui.mapHudOpen = false;
        changed = true;
      }
    }
    if (!state.ui.quickBuildCollapsed && els.quickBuildToolbox && !els.quickBuildToolbox.contains(target)) {
      state.ui.quickBuildCollapsed = true;
      changed = true;
    }
    if (changed) renderUI();
  });

  els.pauseBtn.addEventListener("click", () => {
    if (state.gameOver.active) return;
    state.paused = !state.paused;
    syncPauseButton();
  });
  els.refreshBtn?.addEventListener("click", () => {
    window.location.reload();
  });
  els.introBriefingStartBtn?.addEventListener("click", () => {
    state.ui.introBriefingOpen = false;
    triggerToolboxSpotlight(6500);
    triggerMapSpotlight(6500);
    const nextId = nextFoundingDepartmentId();
    if (nextId) {
      chooseDepartmentPlacement(nextId, "setup");
      const target = (state.ui.placementRecommendations || [])[0]?.tile || resolveDepartmentPlacementTile(nextId, CITY_CORE_TILE);
      if (target) focusCameraOnTile(target);
    }
    renderUI();
  });
  els.startPlacementBtn?.addEventListener("click", () => {
    focusControlPanel();
    state.ui.quickBuildCollapsed = false;
    triggerToolboxSpotlight(6500);
    triggerMapSpotlight(6500);
    const nextId = nextFoundingDepartmentId();
    if (nextId) {
      chooseDepartmentPlacement(nextId, "setup");
      const target = (state.ui.placementRecommendations || [])[0]?.tile || resolveDepartmentPlacementTile(nextId, CITY_CORE_TILE);
      if (target) focusCameraOnTile(target);
    }
    renderUI();
  });
  els.launchGovBtn?.addEventListener("click", () => {
    if (!beginSimulation()) {
      addTicker("Place all departments before launching government.");
      renderUI();
      return;
    }
    renderUI();
  });
  els.tutorialFocusBtn?.addEventListener("click", () => {
    tutorialFocusCurrentStep();
    renderUI();
  });
  els.tutorialSkipBtn?.addEventListener("click", () => {
    skipTutorial();
    renderUI();
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
      setActiveSideTab(tab);
    });
  });
  els.industryProjects?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const btn = target.closest("[data-industry-build]");
    if (!(btn instanceof HTMLElement)) return;
    const id = btn.getAttribute("data-industry-build");
    if (!id) return;
    chooseIndustryProject(id);
    focusControlPanel();
    renderUI();
  });
  els.defenseProjects?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const expandBtn = target.closest("[data-defense-expand]");
    if (expandBtn instanceof HTMLElement) {
      const id = expandBtn.getAttribute("data-defense-expand");
      if (!id) return;
      state.selectedDefenseId = id;
      expandSelectedDefenseBase();
      renderUI();
      return;
    }
    const btn = target.closest("[data-defense-build]");
    if (!(btn instanceof HTMLElement)) return;
    const id = btn.getAttribute("data-defense-build");
    if (!id) return;
    chooseDefenseBaseType(id);
    focusControlPanel();
    renderUI();
  });
  els.defenseProjects?.addEventListener("dragstart", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const btn = target.closest("[data-defense-build]");
    if (!(btn instanceof HTMLElement)) return;
    const id = btn.getAttribute("data-defense-build");
    if (!id) return;
    e.dataTransfer?.setData("text/defense-id", id);
    chooseDefenseBaseType(id);
  });
  els.industryGuide?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.getAttribute("data-industry-guide-arm")) return;
    const recId = recommendedIndustryProjectId();
    if (!recId) {
      addTicker("No industry projects unlocked yet at this tier.");
      renderUI();
      return;
    }
    chooseIndustryProject(recId);
    focusControlPanel();
    tutorialFocusCurrentStep();
    renderUI();
  });
  els.industryProjects?.addEventListener("dragstart", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const btn = target.closest("[data-industry-id]");
    if (!(btn instanceof HTMLElement)) return;
    const id = btn.getAttribute("data-industry-id");
    if (!id) return;
    e.dataTransfer?.setData("text/industry-id", id);
    chooseIndustryProject(id);
    renderUI();
  });
  els.actionDock?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.getAttribute("data-action-dock");
    if (!action) return;
    if (action === "tutorial-focus") {
      tutorialFocusCurrentStep();
    } else if (action === "rapid" && state.rapid.active) {
      setActiveSideTab("incidents");
      focusCameraOnTile(state.rapid.active.mapMarkerTile);
    } else if (action === "incidents") {
      const manual = manualActionIncidents()
        .sort((a, b) => (b.severity - a.severity) || (b.daysOpen - a.daysOpen));
      if (manual[0]) focusCameraOnTile(manual[0].tile);
      setActiveSideTab("incidents");
    } else if (action === "major") {
      const ev = state.majorEvents[0];
      if (ev) focusCameraOnTile(ev.tile);
      focusControlPanel();
    } else if (action === "housing") {
      focusControlPanel();
    } else if (action === "initiatives") {
      focusInitiativesPanel();
    } else if (action === "building") {
      const b = state.buildings
        .filter((x) => x.placed && (x.state === "overloaded" || x.state === "strained"))
        .sort((a, b2) => (a.state === "overloaded" ? -1 : 1) - (b2.state === "overloaded" ? -1 : 1))[0];
      if (b?.tile) {
        state.selectedBuildingId = b.id;
        state.selectedIndustryId = null;
        focusCameraOnTile(b.tile);
      }
      focusControlPanel();
    } else if (action === "industry") {
      const z = state.industry.zones.find((x) => x.status === "active");
      if (z) {
        state.selectedIndustryId = z.id;
        state.selectedDefenseId = null;
        state.selectedBuildingId = null;
        focusCameraOnTile([z.x + (z.size - 1) / 2, z.y + (z.size - 1) / 2]);
      }
      focusControlPanel();
    } else if (action === "defense") {
      const z = state.defense.bases.find((x) => x.status === "active") || state.defense.bases[0];
      if (z) {
        state.selectedDefenseId = z.id;
        state.selectedIndustryId = null;
        state.selectedBuildingId = null;
        focusCameraOnTile([z.x + (z.size - 1) / 2, z.y + (z.size - 1) / 2]);
      }
      focusControlPanel();
    } else if (action === "election") {
      setActiveSideTab("incidents");
      const pane = document.querySelector('[data-pane="incidents"]');
      if (pane) {
        const card = els.initiativesCard || document.getElementById("initiativesCard");
        pane.scrollTo({ top: card ? Math.max(0, card.offsetTop - 8) : 0, behavior: "smooth" });
      }
    }
    renderUI();
  });
  els.nowStripGo?.addEventListener("click", () => {
    const rapid = state.rapid.active;
    if (!rapid) {
      clearNowStrip();
      renderUI();
      return;
    }
    state.ui.mapHudOpen = false;
    setActiveSideTab("incidents");
    const pane = document.querySelector('[data-pane="incidents"]');
    if (pane) pane.scrollTo({ top: 0, behavior: "smooth" });
    if (rapid.mapMarkerTile) focusCameraOnTile(rapid.mapMarkerTile);
    addTicker(`${rapid.incidentCode || "RAPID"} ready: choose an option.`);
    renderUI();
  });
  els.initiativeGrid?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const id = target.getAttribute("data-initiative-id");
    if (!id) return;
    applyInitiative(id);
    renderUI();
  });
  els.initiativeQuickGrid?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const id = target.getAttribute("data-initiative-id");
    if (!id) return;
    applyInitiative(id);
    renderUI();
  });
  els.initiativeOpenBtn?.addEventListener("click", () => {
    focusInitiativesPanel();
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
  els.electionCloseBtn?.addEventListener("click", () => {
    closeElectionModal();
    renderUI();
  });
  els.electionCloseTopBtn?.addEventListener("click", () => {
    closeElectionModal();
    renderUI();
  });
  els.electionModal?.addEventListener("click", (e) => {
    if (e.target !== els.electionModal) return;
    closeElectionModal();
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
  els.sellBtn?.addEventListener("click", () => {
    sellSelectedAsset();
    renderUI();
  });
  els.budgetSlider.addEventListener("input", () => {
    const b = findBuilding(state.selectedBuildingId);
    if (b) state.ui.budgetDraftByBuilding[b.id] = Number(els.budgetSlider.value);
    applyBudgetAvailabilityState();
    applySellAvailabilityState();
    renderSelection();
  });
  els.autoBudgetBtn?.addEventListener("click", () => {
    const b = findBuilding(state.selectedBuildingId);
    if (!b || !b.placed || state.selectedIndustryId || state.selectedDefenseId) return;
    const next = !Boolean(state.ui.autoBudgetByBuilding?.[b.id]);
    state.ui.autoBudgetByBuilding[b.id] = next;
    if (next) {
      const profile = autoBudgetProfile(b);
      const target = clamp(departmentRequiredBudget(b, profile.targetCoverage) + profile.buffer, 20, departmentBudgetCeiling(b));
      state.ui.budgetDraftByBuilding[b.id] = target;
      addTicker(`${b.name} auto-fund enabled (${profile.label.toLowerCase()} mode). It will manage funding if treasury allows.`);
    } else {
      addTicker(`${b.name} auto-fund disabled.`);
    }
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
  els.rapidBtnC?.addEventListener("click", () => {
    resolveRapid("c", false);
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
  els.housingBtnSmall?.addEventListener("click", () => {
    chooseHousingFootprint(2);
    renderUI();
  });
  els.housingBtnMedium?.addEventListener("click", () => {
    chooseHousingFootprint(3);
    renderUI();
  });
  els.housingBtnLarge?.addEventListener("click", () => {
    chooseHousingFootprint(4);
    renderUI();
  });
  els.housingBtnDefer?.addEventListener("click", () => {
    if (!state.housing.active) return;
    const title = state.housing.active.title;
    state.ui.housingPlacement = null;
    state.housing.active = null;
    state.housing.nextAtDay = state.day + 30 + Math.floor(Math.random() * 12);
    applyDemographicShiftMap({ poverty: -1.2, working: -0.9, middle: -0.2, business: 0, elite: 0 }, 1);
    applyKpiShiftMap({ stability: -0.4 }, 1);
    addTicker(`${title} deferred. It will resurface later with higher pressure.`);
    addRailEvent("⏸️ Housing Deferred", "Mandate deferred for roughly a month.", false);
    renderUI();
  });
  els.quickBuildToggleBtn?.addEventListener("click", () => {
    state.ui.quickBuildCollapsed = !state.ui.quickBuildCollapsed;
    renderUI();
  });
  const armQuickBuildFromToolbox = (kind, id) => {
    if (!kind || !id) return;
    state.ui.quickBuildCollapsed = false;
    if (kind === "department") {
      if (chooseDepartmentPlacement(id, "toolbox")) renderUI();
      return;
    }
    if (kind === "industry") {
      const p = projectById(id);
      if (!p) return;
      if (!industryTierAllowed(p)) {
        addTicker(`${p.name} is locked until ${TIER_CONFIG[p.tier].name} tier.`);
        renderUI();
        return;
      }
      chooseIndustryProject(id);
      if (state.ui.industryPlacement?.projectId === id) {
        addTicker(`Armed from toolbox: ${p.name}. Click a clear map tile to place.`);
      }
      renderUI();
      return;
    }
    if (kind === "defense") {
      const d = defenseTypeById(id);
      if (!d) return;
      if (!defenseTierAllowed(d)) {
        addTicker(`${d.name} is locked until ${TIER_CONFIG[d.tier].name} tier.`);
        renderUI();
        return;
      }
      chooseDefenseBaseType(id);
      if (state.ui.defensePlacement?.baseTypeId === id) {
        addTicker(`Armed from toolbox: ${d.name}. Click a clear map tile to place.`);
      }
      renderUI();
    }
  };

  const handleQuickBuildArm = (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const btn = target.closest("[data-quick-kind]");
    if (!(btn instanceof HTMLElement)) return;
    e.preventDefault();
    e.stopPropagation();
    const kind = btn.getAttribute("data-quick-kind");
    const id = btn.getAttribute("data-quick-id");
    armQuickBuildFromToolbox(kind, id);
  };
  els.quickBuildToolbox?.addEventListener("click", handleQuickBuildArm);
  els.quickBuildToolbox?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    handleQuickBuildArm(e);
  });
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const btn = target.closest("#quickBuildToolbox [data-quick-kind]");
    if (!(btn instanceof HTMLElement)) return;
    handleQuickBuildArm(e);
  }, true);
  const quickHoverHandler = (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const btn = target.closest("[data-quick-kind]");
    if (!(btn instanceof HTMLElement)) return;
    const kind = btn.getAttribute("data-quick-kind");
    const id = btn.getAttribute("data-quick-id");
    if (!kind || !id) return;
    state.ui.quickBuildHover = { kind, id };
    updateQuickBuildTooltip();
  };
  els.quickBuildToolbox?.addEventListener("mouseover", quickHoverHandler);
  els.quickBuildToolbox?.addEventListener("focusin", quickHoverHandler);
  els.quickBuildToolbox?.addEventListener("mouseleave", () => {
    state.ui.quickBuildHover = null;
    updateQuickBuildTooltip();
  });
  els.quickBuildToolbox?.addEventListener("focusout", () => {
    if (document.activeElement && els.quickBuildToolbox.contains(document.activeElement)) return;
    state.ui.quickBuildHover = null;
    updateQuickBuildTooltip();
  });

  canvas.addEventListener("mousedown", (e) => {
    state.ui.mouse.down = true;
    state.ui.mouse.startX = e.clientX;
    state.ui.mouse.startY = e.clientY;
    state.ui.mouse.moved = false;
    state.camera.dragging = true;
    state.camera.lastX = e.clientX;
    state.camera.lastY = e.clientY;
    state.camera.targetX = null;
    state.camera.targetY = null;
    state.camera.vx = 0;
    state.camera.vy = 0;
  });

  window.addEventListener("mouseup", () => {
    if (state.ui.mouse.down && state.ui.mouse.moved) {
      state.ui.mouse.suppressClickUntil = Date.now() + 250;
    }
    state.ui.mouse.down = false;
    state.ui.mouse.moved = false;
    state.camera.dragging = false;
  });

  window.addEventListener("mousemove", (e) => {
    if (!state.camera.dragging) return;
    const dx = e.clientX - state.camera.lastX;
    const dy = e.clientY - state.camera.lastY;
    if (!state.ui.mouse.moved && Math.hypot(e.clientX - state.ui.mouse.startX, e.clientY - state.ui.mouse.startY) > 6) {
      state.ui.mouse.moved = true;
    }
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
    const industry = pickIndustryAt(sx, sy);
    const defense = pickDefenseAt(sx, sy);
    state.ui.hoveredBuildingId = building?.id || null;
    if (state.ui.industryPlacement) {
      const ok = Boolean(canPlaceIndustryZone(state.ui.hoverTile, state.ui.industryPlacement.size || 2));
      canvas.style.cursor = ok ? "copy" : "not-allowed";
    } else if (state.ui.defensePlacement) {
      const ok = Boolean(canPlaceDefenseZone(state.ui.hoverTile, state.ui.defensePlacement.size || 3));
      canvas.style.cursor = ok ? "copy" : "not-allowed";
    } else if (state.ui.housingPlacement) {
      const ok = Boolean(canPlaceHousingZone(state.ui.hoverTile, state.ui.housingPlacement.size || 2));
      canvas.style.cursor = ok ? "copy" : "not-allowed";
    } else if (state.ui.placementBuildingId) canvas.style.cursor = isTileBuildable(state.ui.hoverTile[0], state.ui.hoverTile[1]) ? "copy" : "not-allowed";
    else canvas.style.cursor = (building || industry || defense) ? "pointer" : "grab";
  });
  canvas.addEventListener("mouseleave", () => {
    canvas.style.cursor = "grab";
    state.ui.hoveredBuildingId = null;
    state.ui.hoverTile = null;
  });
  canvas.addEventListener("dragover", (e) => {
    if (!state.ui.placementBuildingId && !state.ui.housingPlacement && !state.ui.industryPlacement && !state.ui.defensePlacement) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    state.ui.hoverTile = screenToTile(e.clientX - rect.left, e.clientY - rect.top);
  });
  canvas.addEventListener("drop", (e) => {
    e.preventDefault();
    const industryId = e.dataTransfer?.getData("text/industry-id");
    if (industryId) {
      chooseIndustryProject(industryId);
    }
    const pid = e.dataTransfer?.getData("text/place-id");
    if (pid) {
      state.ui.placementBuildingId = pid;
      state.ui.placementRecommendations = computePlacementRecommendations(pid);
    }
    if (state.ui.industryPlacement) {
      const rect = canvas.getBoundingClientRect();
      const t = screenToTile(e.clientX - rect.left, e.clientY - rect.top);
      if (placeIndustryZone(t)) renderUI();
      return;
    }
    const defenseId = e.dataTransfer?.getData("text/defense-id");
    if (defenseId) {
      chooseDefenseBaseType(defenseId);
    }
    if (state.ui.defensePlacement) {
      const rect = canvas.getBoundingClientRect();
      const t = screenToTile(e.clientX - rect.left, e.clientY - rect.top);
      if (placeDefenseZone(t)) renderUI();
      return;
    }
    if (state.ui.housingPlacement) {
      const rect = canvas.getBoundingClientRect();
      const t = screenToTile(e.clientX - rect.left, e.clientY - rect.top);
      if (placeHousingZone(t)) renderUI();
      return;
    }
    if (!state.ui.placementBuildingId) return;
    const rect = canvas.getBoundingClientRect();
    const t = screenToTile(e.clientX - rect.left, e.clientY - rect.top);
    if (placeBuilding(state.ui.placementBuildingId, t)) renderUI();
  });

  canvas.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        state.ui.touch.mode = "pan";
        state.ui.touch.tapStartX = t.clientX;
        state.ui.touch.tapStartY = t.clientY;
        state.ui.touch.tapMoved = false;
        state.ui.touch.tapStartAt = performance.now();
        state.camera.dragging = true;
        state.camera.lastX = t.clientX;
        state.camera.lastY = t.clientY;
        state.camera.targetX = null;
        state.camera.targetY = null;
        state.camera.vx = 0;
        state.camera.vy = 0;
      } else if (e.touches.length >= 2) {
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        state.ui.touch.mode = "pinch";
        state.ui.touch.pinchStartDistance = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        state.ui.touch.pinchStartZoom = state.camera.zoom;
        state.camera.dragging = false;
      }
    },
    { passive: true }
  );

  canvas.addEventListener(
    "touchmove",
    (e) => {
      if (state.ui.touch.mode === "pan" && e.touches.length === 1) {
        e.preventDefault();
        const t = e.touches[0];
        const dx = t.clientX - state.camera.lastX;
        const dy = t.clientY - state.camera.lastY;
        state.camera.x += dx;
        state.camera.y += dy;
        state.camera.vx = dx;
        state.camera.vy = dy;
        state.camera.lastX = t.clientX;
        state.camera.lastY = t.clientY;
        if (Math.hypot(t.clientX - state.ui.touch.tapStartX, t.clientY - state.ui.touch.tapStartY) > 8) {
          state.ui.touch.tapMoved = true;
        }
        clampCamera();
      } else if (e.touches.length >= 2) {
        e.preventDefault();
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        const ratio = state.ui.touch.pinchStartDistance > 0 ? dist / state.ui.touch.pinchStartDistance : 1;
        state.camera.zoom = clamp(state.ui.touch.pinchStartZoom * ratio, 0.62, 1.45);
        clampCamera();
      }
    },
    { passive: false }
  );

  canvas.addEventListener(
    "touchend",
    (e) => {
      if (e.touches.length === 0) {
        const wasTap = state.ui.touch.mode === "pan"
          && !state.ui.touch.tapMoved
          && performance.now() - state.ui.touch.tapStartAt < 280;
        state.camera.dragging = false;
        state.ui.touch.mode = null;
        state.ui.touch.suppressClickUntil = Date.now() + 400;
        if (wasTap) {
          const rect = canvas.getBoundingClientRect();
          const sx = state.ui.touch.tapStartX - rect.left;
          const sy = state.ui.touch.tapStartY - rect.top;
          handleCanvasPress(sx, sy);
        }
      } else if (e.touches.length === 1) {
        const t = e.touches[0];
        state.ui.touch.mode = "pan";
        state.camera.dragging = true;
        state.camera.lastX = t.clientX;
        state.camera.lastY = t.clientY;
      }
    },
    { passive: true }
  );

  canvas.addEventListener("click", (e) => {
    if (Date.now() < state.ui.mouse.suppressClickUntil) return;
    if (Date.now() < state.ui.touch.suppressClickUntil) return;
    e.stopPropagation();
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    handleCanvasPress(sx, sy);
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
  if (window.ResizeObserver && els.mapPanel) {
    const mapResizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    mapResizeObserver.observe(els.mapPanel);
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.monthly.modalOpen) {
      closeMonthlyModal();
      renderUI();
    } else if (e.key === "Escape" && state.election.modalOpen) {
      closeElectionModal();
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
  if (state.ui.mapHudOpen) positionSelectionHud();
  if (!state.ui.lastNowStripRefreshAt || ts - state.ui.lastNowStripRefreshAt > 250) {
    renderNowStrip();
    state.ui.lastNowStripRefreshAt = ts;
  }
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
  const scenarios = await loadScenarioLibrary();
  const truthChecks = await loadTruthChecks();
  initFromBaseline(baseline);
  state.content.scenarioLibrary = scenarios;
  state.content.truthChecks = truthChecks;
  if (!state.election.currentOpponent) state.election.currentOpponent = pickOppositionCandidate();
  try {
    await loadAssetPack();
    await loadDepartmentPngOverrides();
    await loadTerrainTileOverrides();
    addTicker("Cozy art pack loaded.");
  } catch {
    await loadDepartmentPngOverrides();
    await loadTerrainTileOverrides();
    addTicker("Asset pack unavailable; using fallback visuals.");
  }
  initDecorProps();
  updateFoundations();
  recalcBuildingStates();
  refreshAdvisorBrief();
  bindInput();
  syncPauseButton();
  resizeCanvas();
  renderUI();
  ensureBgm(true);

  addTicker("Founding phase active: place departments, then launch government to begin simulation.");
  if (truthChecks.length > 0) addTicker(`Truth Check deck loaded: ${truthChecks.length} briefs ready.`);
  else if (scenarios.length > 0) addTicker(`Scenario library loaded: ${scenarios.length} civic briefs ready.`);
  addRailEvent("Tip", "Place all departments first. Then press Launch Government.", true);

  setInterval(() => {
    if (state.paused || !state.sim.started) return;
    applySimTick();
    renderUI();
  }, TICK_MS);

  requestAnimationFrame(animationLoop);
}

bootstrap();
