# The Setup

An explorable WebGL bedroom for Ditiro Moabelo's portfolio.

This is **not** a solar-system demo. It's a dusk-lit gamer bedroom, modelled
entirely in code, where every prop is a real project. Click the bookshelf, the
battle station, the windowsill, the kitchenette or the nightstand and the camera
dollies in to that corner with the case study.

## The props are the projects

| Prop | Project |
| --- | --- |
| RGB-backlit bookshelf, plushie and mini arcade cabinet | TwiceAsBooks — online bookstore |
| Battle station: dual monitors, per-key RGB keyboard, cat-ear headset, boom mic, glass-panel PC | IT Asset & Helpdesk System |
| Windowsill with a bird, binoculars and a field notebook | BirdTrail — Android bird tracking |
| Kitchenette with lit burners and LPG cylinders | Thedimogane Gas — live business site |
| Nightstand with a first-aid kit and appointment card | MediBook — hospital booking |

## What makes it distinct

- Hand-built procedural geometry — no downloaded models, no `GLTFLoader`
- **Synced RGB lighting rig**: hex wall panels, cove strips, under-desk glow,
  keyboard keys and PC fans all ride one shared hue cycle
- Dusk window light plus a neon heart, fairy lights and an RGB corner bar, so
  the room is lit almost entirely by its own fixtures
- Soft shadow mapping, drifting dust, and per-prop hover glow with a floor halo
- Hash deep links (`#helpdesk`) frame a prop instantly for sharing
- Respects `prefers-reduced-motion` and degrades to a message without WebGL

## Stack

TypeScript · Vite · Three.js · CSS2D labels

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
