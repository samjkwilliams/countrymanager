# Country Manager Web Prototype (Cozy Civic Vertical Slice)

## Run
From project root:

```bash
python3 -m http.server 4173
```

Open:

- http://localhost:4173/web/

## Current gameplay slice
- Scrollable isometric city map (drag to pan, wheel to zoom)
- Cozy art pack integrated from `/web/assets/cozy-pack` (tiles, buildings, actors, FX)
- 8 department buildings mapped to policy categories
- Click building to inspect, adjust budget, and upgrade
- Building states are visualized as thriving/stable/strained/overloaded
- Live city simulation tick (1 sec)
- Non-blocking event system:
  - top news ticker
  - horizontal event card rail
- Rapid decision desk with timed choices and momentum bonuses
- Action-point economy with streak rewards (playtest focus)
- Rotating short-session goals and onboarding checklist rewards
- Combo buffs for cross-department decision sequences
- District-level pressure (local stress can spiral if incidents are ignored)
- Continuous animated map pass (moving traffic, drifting clouds, live hazard pulses)
- Living-city simulation layer:
  - 220 civilians with home/work/day-cycle movement
  - responder units (police/ambulance/utility/audit) auto-dispatching to incidents
  - clickable incident hotspots for emergency funding
  - live HUD counters for civilian and incident load
- Tier progression (City -> State -> Nation) via mission checks
- Baseline data initialization from `/data/calibrated/baseline_v1.json`

## Controls
- Drag map: pan
- Mouse wheel: zoom
- Click building: select department
- `Apply Budget`: set department funding priority
- `Upgrade Building`: spend treasury to increase level
- `Pause`: pause/resume simulation
