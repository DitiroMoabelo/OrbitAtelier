# Charm Atelier

A kinetic WebGL sculpture of Ditiro Moabelo’s work.

This is **not** a solar-system portfolio demo. Projects hang as porcelain-like
charms from a ceiling rail — each with its own silhouette (ticket stub, open
book, capsule, wing, lantern) — and sway on soft pendulum physics. Pull a
charm forward to open its case study.

## What makes it distinct

- Soft cream **atelier room** instead of dark outer space
- **Custom velvet/fresnel GLSL** materials (not stock `MeshStandardMaterial`)
- **Unique charm geometries** per project, not a row of spheres
- **Pendulum sway + click impulse** on hanging threads
- Dust motes in window light, brass-pink rail, pastel rug

## Stack

TypeScript · Vite · Three.js · custom shaders · CSS2D labels

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
| Drag | Look around the atelier |
| Scroll | Zoom |
| Click charm | Pull it forward + open panel |
| Esc / Release | Return the mobile to rest |
