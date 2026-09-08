# The Setup

An explorable WebGL bedroom for Ditiro Moabelo's portfolio.

This is **not** a solar-system demo. It's a dusk-lit gamer bedroom where every
prop is a real project. Click the bookshelf, the battle station, the windowsill,
the kitchenette or the nightstand and the camera dollies in with the case study.

## The props are the projects

| Prop | Project |
| --- | --- |
| RGB-backlit bookshelf, plushie and mini arcade cabinet | TwiceAsBooks — online bookstore |
| Battle station: dual monitors, per-key RGB keyboard, cat-ear headset, boom mic, glass-panel PC | IT Asset & Helpdesk System |
| Windowsill with a bird, binoculars and a field notebook | BirdTrail — Android bird tracking |
| Kitchenette with lit burners and LPG cylinders | Thedimogane Gas — live business site |
| Nightstand with a first-aid kit and appointment card | MediBook — hospital booking |

## What makes it distinct

- Procedural room as the baseline, with **optional high-quality `.glb` drop-ins**
- **Poly Haven HDRI** environment lighting (CC0 `studio_small_09`)
- Synced RGB accents: hex panels, cove strips, keycaps, PC fans
- Soft shadows, dust, per-prop hover glow, hash deep links (`#helpdesk`)
- Works on phones / iPads; degrades cleanly without WebGL

## Higher-quality assets (free)

Drop `.glb` files into `public/models/` — see that folder's README for filenames.
Missing files fall back to the hand-built props, so the project always runs.

Free sources: [Poly Haven](https://polyhaven.com/), [Kenney](https://kenney.nl/assets),
[Quaternius](https://quaternius.com/), Sketchfab (CC0 filter).

## Stack

TypeScript · Vite · Three.js · GLTFLoader · RGBELoader · CSS2D labels

## Run

```bash
npm install
npm run dev
```

## Build for GitHub Pages

```bash
set VITE_BASE_PATH=/OrbitAtelier/
npm run build
```

## Controls

| Input | Action |
| --- | --- |
| Drag | Look around the room |
| Scroll | Zoom |
| Click a prop | Dolly in and open its case study |
| Bottom chips | Jump straight to any project |
| Esc | Step back into the room |
