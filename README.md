# COCMOC.RU — Cosmic WebGL Experience

An interactive 3D space journey built with React, Three.js and Web Audio API. Live at **[cocmoc.ru](https://cocmoc.ru)**.

![WebGL](https://img.shields.io/badge/WebGL-Three.js-8c50ff?style=flat-square)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square)

---

## What it is

A scroll-driven cosmic experience — the user flies through 5 crystal stations in deep space before reaching a singularity (black hole). Each station is a project or concept presented through interactive 3D crystals, atmospheric lighting and procedural shaders.

**Features:**
- WebGL scene with custom GLSL shaders, bloom, chromatic aberration
- 5 unique crystal formations with per-station color palettes
- Black hole with accretion disk, photon ring and relativistic jets
- Drag rotation with spring-back, touch swipe navigation
- Ambient space music + per-station crystal chimes (Web Audio API)
- Sci-fi HUD overlay — live UTC+3 clock, telemetry coordinates, station counter
- EN / RU localization
- Fully responsive (desktop + mobile)

---

## Stack

| Layer | Tech |
|---|---|
| Renderer | Three.js + EffectComposer (Bloom + Chroma) |
| Framework | React 19 + Vite 8 |
| Audio | Web Audio API (procedural) |
| Fonts | Space Grotesk, Space Mono |
| Deploy | GitHub Pages (custom domain) |

---


## Project structure

```
src/
  components/
    CosmosScene.jsx    — main WebGL scene, camera, crystals, black hole
    Overlay.jsx        — HUD: clock, telemetry, station info, sound toggle
    WelcomeScreen.jsx  — entry screen before the experience starts
    ContactScreen.jsx  — final screen inside the singularity
    CrystalModal.jsx   — modal with x-ray text effect on crystal click
    CrystalPreview.jsx — isolated Three.js preview inside modal
    LangDropdown.jsx   — EN/RU language switcher
    Loader.jsx         — loading screen
  utils/
    audio.js           — Web Audio API: chimes, ambient music, sound effects
    crystal.js         — procedural crystal geometry builder
    i18n.js            — EN/RU translations
  context/
    LangContext.jsx    — React context for language state
  styles/
    globals.css
public/
  music/ambient.mp3    — background ambient track (Public Domain)
```

---

## Audio

Sound is blocked by browsers until a user gesture. The system pre-unlocks the `AudioContext` on the earliest pointer/scroll event so chimes work from the first interaction.

- **Ambient** — loops from `/public/music/ambient.mp3`, fades in after Enter
- **Chimes** — crystal frequencies (432, 528, 639, 741, 852 Hz) on station change
- **Enter sound** — whoosh + harmonics on crystal click
- All controlled by the Sound On/Off toggle in the HUD

---

## License

MIT — do whatever you want with the code.  
Ambient music: Public Domain via [freepd.com](https://freepd.com).
