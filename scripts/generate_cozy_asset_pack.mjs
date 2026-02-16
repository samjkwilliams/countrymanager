import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "web/assets/cozy-pack");

function ensure(p) {
  fs.mkdirSync(p, { recursive: true });
}

function write(rel, content) {
  const out = path.join(OUT, rel);
  ensure(path.dirname(out));
  fs.writeFileSync(out, content, "utf8");
}

function svg(content, w = 128, h = 128) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">${content}</svg>\n`;
}

function isoTile(base, accent, detail = "") {
  return svg(`
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="${base}"/>
    </linearGradient>
  </defs>
  <polygon points="64,12 118,44 64,76 10,44" fill="url(#g1)" stroke="#5b746e" stroke-width="2"/>
  ${detail}
  `, 128, 88);
}

function building(name, body, roof, trim, symbol, lvl) {
  const h = 20 + lvl * 12;
  const y = 92 - h;
  const windowRows = lvl + 1;
  let windows = "";
  for (let r = 0; r < windowRows; r += 1) {
    const yy = y + 12 + r * 10;
    windows += `<rect x="42" y="${yy}" width="6" height="5" rx="1" fill="#fff5c9"/><rect x="54" y="${yy}" width="6" height="5" rx="1" fill="#fff5c9"/><rect x="68" y="${yy}" width="6" height="5" rx="1" fill="#fff5c9"/><rect x="80" y="${yy}" width="6" height="5" rx="1" fill="#fff5c9"/>`;
  }

  return svg(`
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#b3dbc5"/><stop offset="100%" stop-color="#95c9af"/>
    </linearGradient>
  </defs>
  <polygon points="64,22 118,54 64,86 10,54" fill="url(#ground)" stroke="#6f9685" stroke-width="2"/>

  <polygon points="38,${y} 90,${y} 90,92 38,92" fill="${body}" stroke="#564f46" stroke-width="2"/>
  <polygon points="38,${y} 64,${y - 16} 90,${y}" fill="${roof}" stroke="#564f46" stroke-width="2"/>
  <rect x="57" y="${y + 22}" width="14" height="22" rx="2" fill="${trim}"/>
  ${windows}
  <circle cx="64" cy="${y - 6}" r="6" fill="${trim}"/>
  <text x="64" y="${y - 2}" font-size="8" text-anchor="middle" fill="#ffffff" font-family="Verdana">${symbol}</text>
  <text x="64" y="110" font-size="10" text-anchor="middle" fill="#2f3a3b" font-family="Verdana">${name} L${lvl}</text>
  `, 128, 120);
}

function civilian(top, bottom, skin, hair) {
  return svg(`
  <ellipse cx="64" cy="102" rx="15" ry="6" fill="rgba(33,45,47,0.2)"/>
  <circle cx="64" cy="70" r="11" fill="${skin}"/>
  <path d="M53 86 C55 80 73 80 75 86 L78 106 L50 106 Z" fill="${top}" stroke="#455" stroke-width="1.2"/>
  <rect x="54" y="106" width="8" height="14" rx="3" fill="${bottom}"/>
  <rect x="66" y="106" width="8" height="14" rx="3" fill="${bottom}"/>
  <path d="M54 66 C57 54 71 54 74 66" stroke="${hair}" stroke-width="4" stroke-linecap="round"/>
  `, 128, 128);
}

function vehicle(color, stripe, label) {
  return svg(`
  <ellipse cx="64" cy="94" rx="28" ry="8" fill="rgba(31,45,47,0.2)"/>
  <rect x="30" y="58" width="68" height="30" rx="10" fill="${color}" stroke="#3f4548" stroke-width="2"/>
  <rect x="38" y="64" width="26" height="10" rx="4" fill="#d7f2ff"/>
  <rect x="68" y="64" width="22" height="10" rx="4" fill="#d7f2ff"/>
  <rect x="34" y="76" width="60" height="6" rx="2" fill="${stripe}"/>
  <circle cx="44" cy="90" r="6" fill="#1d2328"/><circle cx="84" cy="90" r="6" fill="#1d2328"/>
  <text x="64" y="80" font-size="9" text-anchor="middle" fill="#fff" font-family="Verdana">${label}</text>
  `, 128, 128);
}

function incident(color, icon) {
  return svg(`
  <ellipse cx="64" cy="98" rx="20" ry="8" fill="rgba(33,35,45,0.2)"/>
  <circle cx="64" cy="70" r="22" fill="${color}" opacity="0.25"/>
  <circle cx="64" cy="70" r="15" fill="${color}"/>
  <text x="64" y="75" font-size="16" text-anchor="middle" fill="#fff" font-family="Verdana" font-weight="700">${icon}</text>
  `, 128, 128);
}

function decorative(name, content) {
  return svg(content, 128, 128);
}

const manifest = {
  pack: "cozy-civic-v1",
  generatedAt: new Date().toISOString(),
  files: [],
};

function add(rel, content) {
  write(rel, content);
  manifest.files.push(rel);
}

add("tiles/grass.svg", isoTile("#8fc89e", "#a8dbb4", `<circle cx="56" cy="45" r="3" fill="#74b487"/><circle cx="70" cy="52" r="2.2" fill="#74b487"/>`));
add("tiles/road_straight.svg", isoTile("#8f8b82", "#a5a094", `<polygon points="64,16 85,30 64,44 43,30" fill="#d0cabb"/><polygon points="64,44 85,58 64,72 43,58" fill="#d0cabb"/>`));
add("tiles/road_turn.svg", isoTile("#8f8b82", "#a5a094", `<polygon points="64,44 85,58 64,72 43,58" fill="#d0cabb"/><polygon points="43,30 64,44 43,58 22,44" fill="#d0cabb"/>`));
add("tiles/sidewalk.svg", isoTile("#b5b1a6", "#cdc8bb", `<path d="M38 44 L64 58 L90 44" stroke="#ebe7dc" stroke-width="3"/>`));
add("tiles/park.svg", isoTile("#7ebc8d", "#96d4a4", `<circle cx="52" cy="45" r="7" fill="#5ca66e"/><rect x="50" y="45" width="4" height="9" fill="#7d5f42"/><circle cx="75" cy="56" r="6" fill="#5ca66e"/><rect x="73" y="56" width="4" height="8" fill="#7d5f42"/>`));
add("tiles/water.svg", isoTile("#67a5d8", "#8ac3ee", `<path d="M34 47 Q42 43 50 47 T66 47 T82 47" stroke="#b6deff" stroke-width="2" fill="none"/>`));
add("tiles/plaza.svg", isoTile("#c0b59f", "#d8ccb3", `<rect x="56" y="43" width="16" height="16" rx="2" fill="#efe6d2"/><circle cx="64" cy="51" r="3" fill="#6ec2dd"/>`));

const buildings = [
  ["health", "Health", "#f0b09f", "#d97966", "#cf6b5f", "+"],
  ["education", "Education", "#f6d18b", "#d19c49", "#c27f2e", "E"],
  ["transport", "Transport", "#95d2b3", "#5ba780", "#4f8f70", "T"],
  ["welfare", "Welfare", "#b6c9ff", "#7d96d8", "#647fca", "W"],
  ["security", "Security", "#b8c2d5", "#7f8faa", "#6a7b96", "S"],
  ["climate", "Climate", "#98dcc8", "#53aa8f", "#4b8e79", "C"],
  ["treasury", "Treasury", "#f5c68c", "#cf8f42", "#bc7a2f", "$"],
  ["integrity", "Integrity", "#c8a4d7", "#9a62b5", "#80499f", "I"],
];

for (const [id, label, body, roof, trim, symbol] of buildings) {
  add(`buildings/${id}_lvl1.svg`, building(label, body, roof, trim, symbol, 1));
  add(`buildings/${id}_lvl2.svg`, building(label, body, roof, trim, symbol, 2));
  add(`buildings/${id}_lvl3.svg`, building(label, body, roof, trim, symbol, 3));
}

const civilians = [
  ["civ_a", "#7aaad2", "#4f5e72", "#f3d3b0", "#41342d"],
  ["civ_b", "#d39a7a", "#5b6271", "#f3d3b0", "#2c2521"],
  ["civ_c", "#8dc498", "#445d66", "#f0c29e", "#4a392f"],
  ["civ_d", "#d68db7", "#4d5368", "#f4d9be", "#3d2b25"],
  ["civ_e", "#9ba9dd", "#465348", "#d9a77e", "#201816"],
  ["civ_f", "#f2b870", "#6a6675", "#edc89e", "#2f211f"],
];

for (const [id, top, bottom, skin, hair] of civilians) {
  add(`actors/${id}.svg`, civilian(top, bottom, skin, hair));
}

add("actors/vehicle_car.svg", vehicle("#8cb4ea", "#5f8ed4", "CAR"));
add("actors/vehicle_bus.svg", vehicle("#f2c274", "#c58c35", "BUS"));
add("actors/vehicle_ambulance.svg", vehicle("#f5f5f5", "#d6646a", "EMS"));
add("actors/vehicle_police.svg", vehicle("#89a7d6", "#395f9f", "POL"));
add("actors/responder_utility.svg", vehicle("#f0c671", "#c7902f", "UTL"));
add("actors/responder_audit.svg", vehicle("#bb9bd9", "#7f53ab", "AUD"));

add("fx/incident_crime.svg", incident("#d26464", "!"));
add("fx/incident_medical.svg", incident("#dc7b7b", "+"));
add("fx/incident_fire.svg", incident("#d4874b", "*"));
add("fx/incident_flood.svg", incident("#5b9bda", "~"));
add("fx/incident_corruption.svg", incident("#9a6cc6", "?"));
add("fx/sparkle.svg", decorative("sparkle", `<polygon points="64,32 70,56 94,64 70,72 64,96 58,72 34,64 58,56" fill="#ffef98"/><circle cx="64" cy="64" r="7" fill="#fff6b8"/>`));
add("fx/warning_ring.svg", decorative("warning", `<circle cx="64" cy="64" r="36" fill="none" stroke="#e07b5f" stroke-width="8" stroke-dasharray="8 8"/><circle cx="64" cy="64" r="16" fill="#e07b5f"/><text x="64" y="70" font-size="18" text-anchor="middle" fill="#fff" font-family="Verdana">!</text>`));

const preview = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Cozy Asset Pack Preview</title>
<style>
body{font-family:Arial,sans-serif;background:#f3f0e8;margin:0;padding:20px;color:#2e3a3c}
h1{margin-top:0}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
.card{background:#fff;border:1px solid #d7cdb8;border-radius:10px;padding:10px;text-align:center}
img{width:128px;height:128px;object-fit:contain}.lbl{font-size:12px;word-break:break-word}
</style></head><body><h1>Cozy Civic Asset Pack</h1><div class="grid">${manifest.files
  .map((f) => `<div class="card"><img src="${f}" alt="${f}"/><div class="lbl">${f}</div></div>`)
  .join("")}</div></body></html>`;

add("preview.html", preview);
write("manifest.json", JSON.stringify(manifest, null, 2));

console.log(`Generated ${manifest.files.length} assets + manifest in ${OUT}`);
