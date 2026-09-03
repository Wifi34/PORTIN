# PortIN — Third Party Assets & Open-Source Attribution

This document records the provenance, licensing, and usage terms of external media assets integrated into the PortIN platform for the Smart India Hackathon 2026 (Problem Statement 26006, Ministry of Steel / SAIL).

---

## 1. Hero Ocean Sailing Video
- **Filename**: `frontend/public/assets/ship_hero.mp4`
- **Source**: VideoJS Open Media Repository (`https://vjs.zencdn.net/v/oceans.mp4`)
- **License**: Creative Commons Open Use / Public Domain Sample Media
- **Usage**: Full-screen cinematic landing page background video (100vh hero) illustrating ocean vessel transit.
- **Attributes**: Muted, autoplay, loop, playsinline, optimized preload with poster fallback.

---

## 2. Hero Bulk Carrier Poster Image
- **Filename**: `frontend/public/assets/ship_hero_poster.jpg`
- **Origin**: Generated via Google DeepMind Imagen Model for PortIN Platform
- **License**: Royalty-free for PortIN SIH 2026 project presentation
- **Prompt**: Aerial cinematic perspective of a large modern bulk carrier cargo ship sailing through deep blue ocean waters with white wake and ocean waves.
- **Usage**: Responsive poster fallback for hero video and accessibility fallback under `prefers-reduced-motion`.

---

## 3. Marine Weather Data
- **Provider**: Open-Meteo Marine Weather API (`https://open-meteo.com/en/docs/marine-weather-api`)
- **License**: Open Data Commons Attribution License (ODbL) / Non-commercial Attribution
- **Usage**: Real-time wave height, swell period, and sea surface temperature for East Coast Indian ports (Bay of Bengal).

---

## 4. Port Specifications & Master Data
- **Sources**:
  - Paradip Port Authority Official Scale of Rates & Marine Berthing Guidelines
  - Visakhapatnam Port Authority Marine Dept Guidelines
  - Adani Gangavaram Port Ltd Terminal Handbook
  - Dhamra Port Company Ltd (APSEZ) Navigation Rules
  - Gopalpur Ports Ltd Master Plan
  - Syama Prasad Mookerjee Port (Kolkata & Haldia Dock Complex) Marine Gazette
- **Provenance Status**: `OFFICIAL STATIC DATA` (Gazetted Government Publications)
