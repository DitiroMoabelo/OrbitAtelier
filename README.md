# Orbit Atelier

An interactive WebGL solar system for Ditiro Moabelo’s portfolio.

Each pastel planet is a real project. Drag to orbit the camera, scroll to zoom,
hover to highlight, and click to dollie in and open case-study details.

## Stack

- TypeScript
- Vite
- Three.js (WebGL renderer, custom starfield shader, raycasting, OrbitControls)

## What it demonstrates

- Scene graph, lighting, tone mapping
- Procedural shader starfield (no texture downloads)
- Raycast hover/select with drag-vs-click discrimination
- Eased camera transitions into a selected planet
- `prefers-reduced-motion` support and a WebGL fallback message
- Pixel ratio capping for performance

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

For GitHub Pages under `/OrbitAtelier/`:

```bash
set VITE_BASE_PATH=/OrbitAtelier/
npm run build
```

## Controls

| Input | Action |
| --- | --- |
| Drag | Orbit camera |
| Scroll | Zoom |
| Click planet | Focus + open panel |
| Esc / Back | Return to system view |
