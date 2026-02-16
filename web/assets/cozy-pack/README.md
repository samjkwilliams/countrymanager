# Cozy Civic Asset Pack v1

This pack contains stylized SVG assets for the Country Manager isometric prototype.

## Folders
- `tiles/`: isometric ground tiles and roads
- `buildings/`: department buildings with `lvl1/lvl2/lvl3` variants
- `actors/`: civilians and vehicle/responder sprites
- `fx/`: incident markers and visual effects

## Naming
- Building IDs match gameplay department ids where possible:
  - `health`, `education`, `transport`, `welfare`, `security`, `climate`, `treasury`, `integrity`
- Building file format: `<id>_lvl<1|2|3>.svg`

## Regeneration
Run:

```bash
node /Users/samwilliams/Documents/Country Manager/scripts/generate_cozy_asset_pack.mjs
```

## Preview
Open:

- `/Users/samwilliams/Documents/Country Manager/web/assets/cozy-pack/preview.html`
