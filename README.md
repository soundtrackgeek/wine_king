# Wine King

Wine King is a desktop vineyard-management and rivalry strategy game built with
Rust, Tauri 2, React, and TypeScript.

Version 0.1.0 is a complete single-player vertical slice: manage a family
estate through a deterministic 12-week season, move wine from vineyard to
market, respond to a rival price war, and finish profitable with a stronger
estate valuation than Monte Verde.

## Features in v0.1.0

- One player estate and one computer-controlled rival
- Three interactive vineyard parcels and four production facilities
- Weekly actions for tending, harvesting, processing, bottling, and selling
- Three market channels with changing demand and prices
- A cinematic Week 6 rival event with three strategic responses
- Deterministic seeded seasons
- Versioned save data and save/load controls
- Season scoring, victory, and defeat
- A manifest-driven visual-pack system for artwork, icons, fonts, colors, and
  interactive estate hotspots
- A browser preview gateway for interface development; Rust remains the
  authoritative desktop simulation

## Requirements

- Node.js 22 or newer
- npm 11 or newer
- Rust 1.95 or newer
- Windows WebView2 and the platform build tools required by Tauri

## Install and run

```powershell
npm install
npm run tauri:dev
```

For browser-only interface development:

```powershell
npm run dev
```

The browser preview stores saves in local storage. The Tauri application writes
the authoritative save to the platform application-data directory.

## Verify

```powershell
npm run check
npm run build
npm run test:sites
npm run tauri:build
```

`npm run check` runs TypeScript checking, frontend unit tests, and Rust tests.
The release checklist is maintained in [TESTING.md](TESTING.md).

## Project structure

```text
src/                         React interface and preview gateway
src-tauri/src/game.rs        Authoritative game simulation
public/packs/                Bundled visual packs
design/reference/            Approved visual target
design/qa/                   Rendered comparison evidence
```

## Visual packs

Interface components never reference artwork file paths directly. They request
semantic keys such as:

```ts
assetUrl(pack, "scene.estate.overview");
assetUrl(pack, "wine.reserveRed");
```

The pack manifest maps those keys to replaceable files. It also supplies theme
tokens, local fonts, icon slots, and normalized scene hotspots.

The default pack is:

```text
public/packs/sunlit-terroir/
├── pack.json
├── fonts/
└── images/
```

To add a bundled visual pack:

1. Copy a complete pack directory under `public/packs/<pack-id>/`.
2. Keep semantic asset and icon keys compatible with the schema.
3. Add the manifest to `public/packs/index.json`.
4. Change `defaultPack` to activate it for a build.
5. Run `npm run check` and follow the asset-pack checks in `TESTING.md`.

An icon slot may contain a supported Phosphor icon name or
`asset:icons/example.svg`. File-based icons render through an image element, so
a pack can replace the default icon language without changing React
components.

Visual packs intentionally cannot inject executable code or change gameplay.
Runtime pack importing and arbitrary interface-layout mods are outside v0.1.0.

## Release convention

Every version bump must include:

1. A dated semantic-version entry in `CHANGELOG.md`.
2. An updated feature/configuration summary in this README when applicable.
3. A user-facing **What to test** checklist immediately after the release
   summary.
4. Commit, push, and then `cargo clean` from `src-tauri` as required by the
   repository workflow.

## Design

The everyday interface uses the bright Sunlit Terroir direction with burgundy,
Cormorant Garamond typography, and restrained heritage details. Rival
encounters and major events switch to a dark cinematic presentation.

See [GAME_DESIGN.md](GAME_DESIGN.md) for the v0.1.0 rules and scope.
