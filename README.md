# Recycling App

A recreation of an earlier iOS recycling app, rebuilt from scratch (the original
GitHub repos for this project were never actually pushed to, so this rebuild is
based on screen recordings and voice narration of the original app in action).

## Features

- **Onboarding** — collects your name and a 10-digit phone number before letting
  you into the app; your info is editable later from Settings.
- **Home** ("Save the planet") — the main dashboard with four sections: Scanner,
  Map, Rewards, and Settings.
- **Rewards — Recycling Cash Out Calculator** — enter the weight of paper,
  aluminum, steel, plastics, and compostables you've recycled (in lbs, g, kg, or
  oz) and get an estimated cash-out value. Rates are derived from the original
  demo (45 lbs of aluminum → $22.50, i.e. $0.50/lb); other materials use
  reasonable estimated scrap rates — see `src/data/materials.ts`.
- **Scanner** — live camera view for scanning recycling symbols/barcodes on iOS
  and Android (falls back to a message on web, where camera access isn't
  available in this context).
- **Map** — a list of nearby recycling centers and what materials each accepts.
- **Settings** — view your phone number, log out, and toggle Dark Mode (applies
  across the whole app).

## Tech stack

- [Expo](https://expo.dev) + React Native, TypeScript
- React Navigation (native-stack)
- AsyncStorage for local persistence (user info, dark mode preference)
- `expo-camera` for the Scanner screen

## Getting started

```bash
npm install
npm start        # then press i / a / w for iOS / Android / web
```
