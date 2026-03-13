# Statecraft Asset Export Pipeline

This is the single standard to keep all isometric buildings consistent in scale, placement, upgrades, and click behavior.

## 1) Project Tile Standard (do not change per asset)

- `tile_w = 64`
- `tile_h = 32`
- Isometric ratio: `2:1`
- All buildings must be exported into a **footprint class**:
  - `1x1`
  - `2x2`
  - `3x3`
  - `4x4`

## 2) Canonical Export Canvas + Anchor

Use these exact canvas sizes and anchor points.

| Footprint | Canvas (W x H) | Anchor (x, y) | Ground footprint area (W x H) |
|---|---:|---:|---:|
| 1x1 | 192 x 192 | (96, 168) | 64 x 32 |
| 2x2 | 256 x 224 | (128, 200) | 128 x 64 |
| 3x3 | 320 x 256 | (160, 232) | 192 x 96 |
| 4x4 | 384 x 288 | (192, 264) | 256 x 128 |

Rules:
- Keep anchor centered on x (`canvas_w / 2`).
- Keep anchor near bottom (`canvas_h - 24`).
- The building base must lock to anchor; only the top can grow upward.

## 3) Upgrade Consistency Rules

- If upgrade is same footprint:
  - Keep same canvas size and same anchor.
  - Increase detail/height upward, not base shift.
- If upgrade needs more land:
  - Export as a new footprint class (`2x2 -> 3x3`, etc).
  - Treat as an explicit in-game expansion, not a silent swap.

## 4) Placement and Clickability Rules

Never use sprite alpha alone for interaction.

Per building define:
- `footprint_tiles`: true occupied tiles
- `select_bounds_px`: clickable rectangle/shape around base + key silhouette
- `occlusion_priority`: draw order tie-break for tall assets

When crowded:
- Fade non-selected overlapping tall buildings (`~0.65` alpha).
- Keep selected building full alpha + outline.
- Optional: add X-ray toggle for dense zones.

## 5) File Naming Standard

Use:

`building_<domain>_fp<footprint>_lvl<level>.png`

Examples:
- `building_integrity_fp1x1_lvl1.png`
- `building_integrity_fp1x1_lvl2.png`
- `building_economy_fp3x3_lvl4.png`

## 6) Metadata Sidecar (required)

For each exported sprite, include metadata:

```json
{
  "id": "building_integrity_fp1x1_lvl1",
  "image": "building_integrity_fp1x1_lvl1.png",
  "footprint": [1, 1],
  "canvas": [192, 192],
  "anchor_px": [96, 168],
  "ground_bbox_px": [64, 32],
  "select_bounds_px": {
    "x": 52,
    "y": 86,
    "w": 88,
    "h": 98
  },
  "z_offset": 0,
  "occlusion_priority": 10
}
```

## 7) Artist Export Checklist (quick)

For every asset:
- Correct footprint class chosen
- Correct canvas size used
- Anchor matches table exactly
- Base sits on footprint correctly
- Upgrade variant keeps same anchor
- File name follows standard
- Sidecar metadata present

## 8) Practical Layout Rule for Anti-Spam

To keep map readable when players spam buildings:
- For `3x3` and `4x4`, enforce minimum gap of 1 tile from another `3x3+`.
- Prefer road adjacency requirements on at least one edge.
- For very tall buildings, soft-limit cluster density per district (or add efficiency penalty if stacked too tightly).

This preserves visual clarity and makes placement strategy meaningful.
