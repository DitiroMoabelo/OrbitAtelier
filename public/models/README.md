# Drop-in 3D models

Put free `.glb` files here and they load automatically at boot.
If a file is missing, the procedural (code-built) prop stays.

## Filenames that work today

| File | Replaces | Where |
| --- | --- | --- |
| `chair.glb` | procedural gaming chair | Helpdesk desk |
| `bookshelf.glb` | procedural shelf | TwiceAsBooks |
| `nightstand.glb` | procedural nightstand | MediBook |
| `plant.glb` | procedural plant | left wall |
| `bed.glb` | *(adds beside bed area)* | room |
| `desk.glb` | desk surface block | Helpdesk |

A sample **SheenChair** (`chair.glb`) is already included so you can see the pipeline working.
Swap it for any CC0 gaming chair you like.

## Free places to download

1. [Poly Haven](https://polyhaven.com/models) — CC0, high quality (plants, furniture)
2. [Kenney](https://kenney.nl/assets) — CC0, clean game-ready packs
3. [Quaternius](https://quaternius.com/) — CC0 stylized packs
4. [Sketchfab](https://sketchfab.com/) — filter **Downloadable + Free**, prefer **CC0**
5. [AmbientCG](https://ambientcg.com/) — free PBR textures if you texture your own models

Export / download as **glTF Binary (`.glb`)**.

## Tips

- Keep each file under ~5 MB so GitHub Pages stays fast.
- Prefer real-world scale (1 unit = 1 metre). The loader also auto-fits height.
- To add a new slot, edit `src/assets/slots.ts`.
- HDRI lighting lives in `public/hdri/` (Poly Haven `studio_small_09`, CC0).

## Licence note

`studio_small_09` HDRI — [Poly Haven](https://polyhaven.com/a/studio_small_09), CC0  
`chair.glb` (SheenChair) — [Khronos glTF Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models), used as a temporary demo asset
