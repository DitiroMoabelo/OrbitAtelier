# Drop-in 3D models & textures

Put free `.glb` files in `models/` and PBR maps in `textures/`.
Missing files fall back to the procedural room.

## Models (`/models`)

| File | Replaces | Where |
| --- | --- | --- |
| `chair.glb` | gaming chair | Helpdesk |
| `plant.glb` | plant | left wall |
| `bed.glb` | bed frame | right side |
| `frame-a.glb` / `frame-b.glb` | wall posters | back wall |
| `window.glb` | window frame | BirdTrail |
| `kitchen.glb` | cabinets / counter | Thedimogane Gas |
| `stove.glb` | stove | Thedimogane Gas |
| `cylinder.glb` | LPG tanks | Thedimogane Gas |
| `bookshelf.glb` | shelf | TwiceAsBooks |
| `nightstand.glb` | nightstand | MediBook |
| `desk.glb` | desk surface | Helpdesk |

Bundled Poly Haven (CC0) assets: plant, bed, hanging frames, window, kitchen cabinet, stove, propane tank.
Chair sample: Khronos SheenChair.

## Textures (`/textures`)

| File | Surface |
| --- | --- |
| `floor_diff.jpg` / `_nor` / `_rough` | wood floorboards |
| `carpet_diff.jpg` / `_nor` / `_rough` | circular rug |

Bundled: Poly Haven `wood_floor` + `wool_boucle` (1k, CC0).

## Free places to download

1. [Poly Haven](https://polyhaven.com/) — CC0 models + textures
2. [Kenney](https://kenney.nl/assets) — CC0 game packs
3. [Quaternius](https://quaternius.com/) — CC0 stylized
4. [Sketchfab](https://sketchfab.com/) — Downloadable + Free, prefer CC0

Export models as **glTF Binary (`.glb`)**. Keep each under ~5 MB when you can.

## Tips

- Prefer real-world scale (1 unit = 1 metre). The loader auto-fits height.
- Wall pieces need `ground: false` in `src/assets/slots.ts` so they stay off the floor.
- HDRI lighting: `public/hdri/studio_small_09_1k.hdr` (Poly Haven, CC0).

## Licence note

All bundled Poly Haven files are CC0.  
`chair.glb` (SheenChair) — [Khronos glTF Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models).
