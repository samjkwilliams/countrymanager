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

function departmentFeature(id, lvl, roofTopY, roofMidY) {
  if (id === "health") {
    return `<rect x="75" y="${roofTopY - 7}" width="10" height="10" rx="2" fill="#f4f8ff" stroke="#5a616c" stroke-width="1.2"/><rect x="78.5" y="${roofTopY - 5.5}" width="3" height="7" fill="#d96f6a"/><rect x="76.2" y="${roofTopY - 3.2}" width="7.5" height="3" fill="#d96f6a"/>`;
  }
  if (id === "education") {
    return `<polygon points="80,${roofTopY - 9} 90,${roofTopY - 2} 80,${roofTopY + 5} 70,${roofTopY - 2}" fill="#f1d084" stroke="#5a616c" stroke-width="1.1"/><rect x="78" y="${roofTopY + 5}" width="4" height="${6 + lvl * 3}" fill="#5a616c"/>`;
  }
  if (id === "transport") {
    return `<rect x="72" y="${roofTopY + 1}" width="16" height="6" rx="2" fill="#7bd1bf" stroke="#4e5963" stroke-width="1.1"/><rect x="74" y="${roofTopY - 6}" width="12" height="5" rx="1.5" fill="#d9f4ff" stroke="#4e5963" stroke-width="1"/>`;
  }
  if (id === "welfare") {
    return `<circle cx="80" cy="${roofTopY - 2}" r="${3 + lvl}" fill="#ffe0a3" stroke="#4e5963" stroke-width="1.1"/><circle cx="${74}" cy="${roofTopY + 2}" r="2.4" fill="#ffe0a3" stroke="#4e5963" stroke-width="1"/>`;
  }
  if (id === "security") {
    return `<rect x="75" y="${roofTopY - 8}" width="10" height="${10 + lvl * 2}" rx="2" fill="#8396b3" stroke="#4e5963" stroke-width="1.1"/><path d="M80 ${roofTopY - 10} L86 ${roofTopY - 5} L74 ${roofTopY - 5} Z" fill="#a7b6cf"/>`;
  }
  if (id === "climate") {
    return `<ellipse cx="80" cy="${roofTopY - 3}" rx="${6 + lvl}" ry="${3 + lvl * 0.6}" fill="#8fe2cb" stroke="#4e5963" stroke-width="1.1"/><rect x="79" y="${roofTopY}" width="2" height="${8 + lvl * 2}" fill="#5f8578"/>`;
  }
  if (id === "treasury") {
    return `<rect x="74" y="${roofTopY - 8}" width="12" height="8" rx="2" fill="#f4d29e" stroke="#4e5963" stroke-width="1.1"/><text x="80" y="${roofTopY - 2}" font-size="7" text-anchor="middle" fill="#7c5a2f" font-family="Verdana">$</text>`;
  }
  if (id === "integrity") {
    return `<path d="M80 ${roofTopY - 10} L88 ${roofTopY - 5} L85 ${roofTopY + 4} L75 ${roofTopY + 4} L72 ${roofTopY - 5} Z" fill="#cdb3df" stroke="#4e5963" stroke-width="1.1"/><line x1="80" y1="${roofTopY - 4}" x2="80" y2="${roofTopY + 4}" stroke="#6f528d" stroke-width="1"/>`;
  }
  return "";
}

function building(id, name, body, roof, trim, symbol, lvl) {
  const profile = {
    health: { halfW: 52, wallBase: 30, wallGain: 15 },
    education: { halfW: 46, wallBase: 30, wallGain: 15 },
    transport: { halfW: 60, wallBase: 20, wallGain: 11 },
    welfare: { halfW: 55, wallBase: 24, wallGain: 13 },
    security: { halfW: 38, wallBase: 40, wallGain: 18 },
    climate: { halfW: 54, wallBase: 26, wallGain: 13 },
    treasury: { halfW: 42, wallBase: 46, wallGain: 19 },
    integrity: { halfW: 44, wallBase: 34, wallGain: 16 },
  }[id] || { halfW: 48, wallBase: 28, wallGain: 15 };

  const roofTopY = 34 - lvl * 3;
  const roofMidY = 60 - lvl * 2;
  const roofBotY = 84 - lvl * 2;
  const wallH = profile.wallBase + lvl * profile.wallGain;

  const A = [80, roofTopY];
  const B = [80 + profile.halfW, roofMidY];
  const C = [80, roofBotY];
  const D = [80 - profile.halfW, roofMidY];
  const B2 = [B[0], B[1] + wallH];
  const C2 = [C[0], C[1] + wallH];
  const D2 = [D[0], D[1] + wallH];

  const rowCount = 1 + lvl * 2;
  let rightWindows = "";
  let leftWindows = "";
  for (let r = 0; r < rowCount; r += 1) {
    const y = roofMidY + 8 + r * 8;
    const on = (r + lvl) % 3 !== 0;
    const glass = on ? "#f8efbd" : "#cde8f8";
    rightWindows += `<polygon points="97,${y} 106,${y + 5} 106,${y + 10} 97,${y + 5}" fill="${glass}" stroke="#5f6771" stroke-width="0.9"/>`;
    rightWindows += `<polygon points="110,${y + 7} 119,${y + 12} 119,${y + 17} 110,${y + 12}" fill="${glass}" stroke="#5f6771" stroke-width="0.9"/>`;
    leftWindows += `<polygon points="63,${y + 5} 54,${y + 10} 54,${y + 15} 63,${y + 10}" fill="${glass}" stroke="#5f6771" stroke-width="0.9"/>`;
    leftWindows += `<polygon points="50,${y + 12} 41,${y + 17} 41,${y + 22} 50,${y + 17}" fill="${glass}" stroke="#5f6771" stroke-width="0.9"/>`;
  }

  const roofEquipment =
    lvl === 1
      ? `<polygon points="72,${roofTopY + 7} 80,${roofTopY + 3} 88,${roofTopY + 7} 80,${roofTopY + 11}" fill="${trim}" stroke="#424b56" stroke-width="1.2"/>`
      : lvl === 2
        ? `<rect x="73" y="${roofTopY + 4}" width="14" height="8" rx="2" fill="${trim}" stroke="#424b56" stroke-width="1.2"/><rect x="76" y="${roofTopY - 2}" width="8" height="6" rx="1.5" fill="#b9d4ea" stroke="#424b56" stroke-width="1"/>`
        : `<rect x="74" y="${roofTopY + 2}" width="12" height="9" rx="2" fill="${trim}" stroke="#424b56" stroke-width="1.2"/><rect x="78" y="${roofTopY - 8}" width="4" height="10" rx="1.6" fill="#8fa0b4"/><circle cx="80" cy="${roofTopY - 10}" r="4.2" fill="#ffe39e" stroke="#424b56" stroke-width="1"/>`;
  const uniqueFeature = departmentFeature(id, lvl, roofTopY, roofMidY);

  const facadeBands = `
    <polyline points="45,${roofMidY + 14} 80,${roofMidY + 32} 115,${roofMidY + 14}" stroke="#ffffff55" stroke-width="1.2"/>
    <polyline points="45,${roofMidY + 28} 80,${roofMidY + 46} 115,${roofMidY + 28}" stroke="#00000022" stroke-width="1.1"/>
  `;
  const silhouette =
    id === "health"
      ? `<polygon points="54,${roofMidY + 16} 80,${roofMidY + 29} 106,${roofMidY + 16} 80,${roofMidY + 3}" fill="#f8d1c7" stroke="#4e5963" stroke-width="1.2"/><rect x="77" y="${roofMidY - 4}" width="6" height="24" rx="2" fill="#f4f8ff"/><rect x="74" y="${roofMidY + 4}" width="12" height="5" rx="1.5" fill="#d96f6a"/>`
      : id === "education"
        ? `<polygon points="64,${roofTopY + 8} 80,${roofTopY - 5} 96,${roofTopY + 8}" fill="#f4db99" stroke="#4e5963" stroke-width="1.1"/><rect x="73" y="${roofMidY + 8}" width="14" height="10" rx="2" fill="#f3eddf" stroke="#4e5963" stroke-width="1"/><circle cx="80" cy="${roofMidY + 13}" r="2.2" fill="#5f7ca9"/>`
        : id === "transport"
          ? `<polygon points="42,${roofMidY + 10} 80,${roofMidY - 6} 118,${roofMidY + 10} 80,${roofMidY + 26}" fill="#bceaf2" stroke="#4e5963" stroke-width="1.2"/><line x1="54" y1="${roofMidY + 16}" x2="106" y2="${roofMidY + 16}" stroke="#5ea7ad" stroke-width="1.3"/><line x1="52" y1="${roofMidY + 20}" x2="108" y2="${roofMidY + 20}" stroke="#5ea7ad" stroke-width="1.3"/>`
          : id === "welfare"
            ? `<polygon points="50,${roofMidY + 12} 80,${roofMidY - 2} 110,${roofMidY + 12} 80,${roofMidY + 26}" fill="#d8dcff" stroke="#4e5963" stroke-width="1.2"/><circle cx="72" cy="${roofMidY + 10}" r="3.2" fill="#ffd78f"/><circle cx="88" cy="${roofMidY + 10}" r="3.2" fill="#ffd78f"/>`
            : id === "security"
              ? `<rect x="76" y="${roofTopY - 16}" width="8" height="24" rx="2" fill="#8ea0be" stroke="#4e5963" stroke-width="1.1"/><path d="M80 ${roofTopY - 21} L86 ${roofTopY - 16} L74 ${roofTopY - 16} Z" fill="#b6c6dd"/><line x1="80" y1="${roofTopY - 19}" x2="92" y2="${roofTopY - 26}" stroke="#d7e2f2" stroke-width="1.2"/>`
              : id === "climate"
                ? `<ellipse cx="80" cy="${roofMidY + 6}" rx="16" ry="8" fill="#9ee6d2" stroke="#4e5963" stroke-width="1.2"/><rect x="77" y="${roofTopY - 3}" width="6" height="16" rx="2" fill="#75b7a1"/><circle cx="80" cy="${roofTopY - 7}" r="4.5" fill="#d8fff3"/>`
                : id === "treasury"
                  ? `<ellipse cx="80" cy="${roofTopY + 2}" rx="14" ry="7" fill="#efd29e" stroke="#4e5963" stroke-width="1.2"/><rect x="70" y="${roofMidY + 8}" width="20" height="16" rx="2" fill="#f3e4c4" stroke="#4e5963" stroke-width="1.1"/><line x1="75" y1="${roofMidY + 9}" x2="75" y2="${roofMidY + 23}" stroke="#c7a779"/><line x1="80" y1="${roofMidY + 9}" x2="80" y2="${roofMidY + 23}" stroke="#c7a779"/><line x1="85" y1="${roofMidY + 9}" x2="85" y2="${roofMidY + 23}" stroke="#c7a779"/>`
                  : `<rect x="70" y="${roofMidY + 8}" width="20" height="16" rx="2.5" fill="#e8def2" stroke="#4e5963" stroke-width="1.1"/><line x1="80" y1="${roofMidY + 9}" x2="80" y2="${roofMidY + 23}" stroke="#7f5aa6" stroke-width="1.3"/><line x1="72" y1="${roofMidY + 15}" x2="88" y2="${roofMidY + 15}" stroke="#7f5aa6" stroke-width="1.3"/>`;

  return svg(`
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c7e7cd"/><stop offset="100%" stop-color="#95c8ad"/>
    </linearGradient>
    <linearGradient id="roofFace" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${roof}"/><stop offset="100%" stop-color="${trim}"/>
    </linearGradient>
    <linearGradient id="wallL" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${body}"/><stop offset="100%" stop-color="#b6c2ce"/>
    </linearGradient>
    <linearGradient id="wallR" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c6d2df"/><stop offset="100%" stop-color="${body}"/>
    </linearGradient>
    <radialGradient id="roofSpec" cx="40%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff88"/><stop offset="100%" stop-color="#ffffff00"/>
    </radialGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.6" flood-color="#122a38" flood-opacity="0.35"/>
    </filter>
  </defs>

  <ellipse cx="80" cy="122" rx="56" ry="14" fill="#173246" opacity="0.22"/>
  <polygon points="80,30 142,66 80,102 18,66" fill="url(#ground)" stroke="#6f9685" stroke-width="2"/>

  <g filter="url(#softShadow)">
    <polygon points="${D[0]},${D[1]} ${C[0]},${C[1]} ${C2[0]},${C2[1]} ${D2[0]},${D2[1]}" fill="url(#wallL)" stroke="#48545f" stroke-width="2.1"/>
    <polygon points="${B[0]},${B[1]} ${C[0]},${C[1]} ${C2[0]},${C2[1]} ${B2[0]},${B2[1]}" fill="url(#wallR)" stroke="#48545f" stroke-width="2.1"/>
    <polygon points="${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0]},${C[1]} ${D[0]},${D[1]}" fill="url(#roofFace)" stroke="#48545f" stroke-width="2.3"/>
    <polygon points="${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0]},${C[1]} ${D[0]},${D[1]}" fill="url(#roofSpec)"/>
  </g>

  <polygon points="80,${roofMidY + 6} 89,${roofMidY + 11} 89,${roofMidY + 42} 80,${roofMidY + 37}" fill="#a9754d" stroke="#564333" stroke-width="1.4"/>
  <polygon points="80,${roofMidY + 6} 71,${roofMidY + 11} 71,${roofMidY + 42} 80,${roofMidY + 37}" fill="#ca9264" stroke="#564333" stroke-width="1.4"/>

  ${facadeBands}
  ${rightWindows}
  ${leftWindows}

  <ellipse cx="80" cy="${roofMidY + 2}" rx="12" ry="7" fill="${trim}" stroke="#3d4650" stroke-width="1.5"/>
  <text x="80" y="${roofMidY + 5}" font-size="10" text-anchor="middle" fill="#ffffff" font-family="Verdana" font-weight="700">${symbol}</text>
  ${silhouette}
  ${roofEquipment}
  ${uniqueFeature}
  `, 160, 150);
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

function propHouse(body, roof) {
  return svg(`
  <ellipse cx="64" cy="108" rx="22" ry="7" fill="#153244" opacity="0.25"/>
  <polygon points="40,66 64,52 88,66 64,80" fill="${roof}" stroke="#6d4f46" stroke-width="2"/>
  <polygon points="40,66 64,80 64,102 40,88" fill="${body}" stroke="#6d4f46" stroke-width="2"/>
  <polygon points="88,66 64,80 64,102 88,88" fill="#d5e2ea" stroke="#6d4f46" stroke-width="2"/>
  <polygon points="64,84 72,88 72,104 64,100" fill="#966a4e"/>
  <polygon points="64,84 56,88 56,104 64,100" fill="#b37d59"/>
  <polygon points="52,80 58,83 58,90 52,87" fill="#eaf7ff"/>
  <polygon points="76,80 82,83 82,90 76,87" fill="#eaf7ff"/>
  `, 128, 128);
}

function propTower(body, roof, windows = 4) {
  let row = "";
  for (let i = 0; i < windows; i += 1) {
    const y = 46 + i * 11;
    row += `<polygon points="58,${y} 64,${y + 3} 64,${y + 8} 58,${y + 5}" fill="#eef9ff"/><polygon points="70,${y + 6} 76,${y + 9} 76,${y + 14} 70,${y + 11}" fill="#eef9ff"/>`;
  }
  return svg(`
  <ellipse cx="64" cy="112" rx="24" ry="8" fill="#153244" opacity="0.25"/>
  <polygon points="64,22 94,38 64,54 34,38" fill="${roof}" stroke="#536171" stroke-width="2"/>
  <polygon points="34,38 64,54 64,102 34,86" fill="${body}" stroke="#536171" stroke-width="2"/>
  <polygon points="94,38 64,54 64,102 94,86" fill="#cad8e6" stroke="#536171" stroke-width="2"/>
  ${row}
  `, 128, 128);
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
  add(`buildings/${id}_lvl1.svg`, building(id, label, body, roof, trim, symbol, 1));
  add(`buildings/${id}_lvl2.svg`, building(id, label, body, roof, trim, symbol, 2));
  add(`buildings/${id}_lvl3.svg`, building(id, label, body, roof, trim, symbol, 3));
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

add("actors/prop_house_small.svg", propHouse("#f3d9b2", "#d77c63"));
add("actors/prop_house_mid.svg", propHouse("#f4ddb8", "#cb8f55"));
add("actors/prop_townhouse_row.svg", svg(`
  <ellipse cx="64" cy="108" rx="28" ry="7" fill="#153244" opacity="0.24"/>
  <polygon points="28,68 48,56 68,68 48,80" fill="#cf7a63" stroke="#6b4a41" stroke-width="2"/>
  <polygon points="60,68 80,56 100,68 80,80" fill="#cb8f55" stroke="#6b4a41" stroke-width="2"/>
  <polygon points="28,68 48,80 48,102 28,90" fill="#efd5af" stroke="#6b4a41" stroke-width="2"/>
  <polygon points="68,68 48,80 48,102 68,90" fill="#d9e5ef" stroke="#6b4a41" stroke-width="2"/>
  <polygon points="60,68 80,80 80,102 60,90" fill="#f1dbb9" stroke="#6b4a41" stroke-width="2"/>
  <polygon points="100,68 80,80 80,102 100,90" fill="#d7e4ee" stroke="#6b4a41" stroke-width="2"/>
`));
add("actors/prop_apartment.svg", propTower("#9ccabf", "#5d9f87", 4));
add("actors/prop_skyscraper.svg", propTower("#9eb6d9", "#5e7db2", 6));
add("actors/prop_shop_corner.svg", svg(`
  <ellipse cx="64" cy="108" rx="24" ry="7" fill="#153244" opacity="0.24"/>
  <polygon points="38,70 64,56 90,70 64,84" fill="#f1a269" stroke="#7a4c3f" stroke-width="2"/>
  <polygon points="38,70 64,84 64,102 38,88" fill="#f7e8cc" stroke="#7a4c3f" stroke-width="2"/>
  <polygon points="90,70 64,84 64,102 90,88" fill="#dbe8f1" stroke="#7a4c3f" stroke-width="2"/>
  <polygon points="52,84 58,87 58,99 52,96" fill="#8d633f"/>
  <polygon points="70,84 82,90 82,96 70,90" fill="#d8f4ff"/>
`));
add("actors/prop_market.svg", svg(`
  <ellipse cx="64" cy="108" rx="24" ry="7" fill="#153244" opacity="0.24"/>
  <polygon points="42,80 64,68 86,80 64,92" fill="#f6d28e" stroke="#7c5e3f" stroke-width="2"/>
  <polygon points="46,74 64,64 82,74 64,84" fill="#d97169" stroke="#7c5e3f" stroke-width="2"/>
  <circle cx="54" cy="86" r="2" fill="#87c86a"/><circle cx="64" cy="88" r="2" fill="#f0b765"/><circle cx="72" cy="86" r="2" fill="#7ab2e8"/>
`));
add("actors/prop_banner.svg", svg(`
  <ellipse cx="64" cy="108" rx="16" ry="6" fill="#153244" opacity="0.2"/>
  <rect x="58" y="52" width="4" height="46" rx="2" fill="#a17c59"/>
  <polygon points="62,54 86,64 62,74" fill="#ffd47f" stroke="#885f39" stroke-width="2"/>
  <circle cx="80" cy="64" r="3" fill="#d96d62"/>
`));
add("actors/prop_lamp.svg", svg(`
  <ellipse cx="64" cy="108" rx="14" ry="6" fill="#153244" opacity="0.2"/>
  <rect x="61" y="58" width="6" height="40" rx="3" fill="#6f7b8f"/>
  <circle cx="64" cy="54" r="8" fill="#ffd57f" opacity="0.8"/>
  <circle cx="64" cy="54" r="4" fill="#fff3bf"/>
`));
add("actors/prop_tree_small.svg", svg(`
  <ellipse cx="64" cy="108" rx="16" ry="6" fill="#153244" opacity="0.22"/>
  <rect x="60" y="72" width="8" height="26" rx="3" fill="#7b573e"/>
  <circle cx="64" cy="66" r="18" fill="#72c390" stroke="#3f8763" stroke-width="2"/>
`));
add("actors/prop_tree_tall.svg", svg(`
  <ellipse cx="64" cy="108" rx="17" ry="6" fill="#153244" opacity="0.22"/>
  <rect x="59" y="64" width="10" height="34" rx="3" fill="#6f4d37"/>
  <polygon points="64,24 88,64 40,64" fill="#70c691" stroke="#3d805f" stroke-width="2"/>
  <polygon points="64,36 84,72 44,72" fill="#5ab47f"/>
`));
add("actors/prop_fountain.svg", svg(`
  <ellipse cx="64" cy="108" rx="24" ry="7" fill="#153244" opacity="0.22"/>
  <ellipse cx="64" cy="86" rx="20" ry="10" fill="#cfd8df" stroke="#6d7b8a" stroke-width="2"/>
  <ellipse cx="64" cy="86" rx="12" ry="6" fill="#8fd4ef"/>
  <rect x="62" y="74" width="4" height="12" rx="2" fill="#6d7b8a"/>
  <circle cx="64" cy="72" r="3" fill="#b7ebff"/>
`));
add("actors/prop_playground.svg", svg(`
  <ellipse cx="64" cy="108" rx="25" ry="7" fill="#153244" opacity="0.22"/>
  <polygon points="44,90 64,78 84,90 64,102" fill="#90d291" stroke="#4f8456" stroke-width="2"/>
  <rect x="48" y="66" width="4" height="24" rx="2" fill="#d67662"/>
  <rect x="76" y="66" width="4" height="24" rx="2" fill="#d67662"/>
  <rect x="52" y="72" width="24" height="3" rx="1.5" fill="#f5c26d"/>
`));
add("actors/prop_oval.svg", svg(`
  <ellipse cx="64" cy="102" rx="34" ry="15" fill="#2f6e4f" opacity="0.2"/>
  <ellipse cx="64" cy="88" rx="30" ry="14" fill="#90d68e" stroke="#4a8b5d" stroke-width="2"/>
  <ellipse cx="64" cy="88" rx="22" ry="9" fill="#7bc27e"/>
  <ellipse cx="64" cy="88" rx="4" ry="2" fill="#f8f8f1"/>
`));

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
add("fx/prosperity_glow.svg", decorative("prosperity_glow", `<defs><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffe7a6" stop-opacity="0.95"/><stop offset="100%" stop-color="#ffe7a6" stop-opacity="0"/></radialGradient></defs><circle cx="64" cy="64" r="52" fill="url(#g)"/>`));
add("fx/confetti.svg", decorative("confetti", `<circle cx="24" cy="24" r="4" fill="#ffd46b"/><circle cx="46" cy="38" r="3" fill="#8ac7ff"/><circle cx="84" cy="24" r="4" fill="#ff8c76"/><circle cx="96" cy="48" r="3" fill="#9de18f"/><circle cx="36" cy="86" r="3" fill="#c8a3ff"/><circle cx="78" cy="90" r="4" fill="#ffe79c"/>`));

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
