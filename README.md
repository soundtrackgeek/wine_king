# Wine King

Wine King is a desktop vineyard-management and rivalry strategy game built with
Rust, Tauri 2, React, and TypeScript.

Version 0.2.0 is a complete single-player vertical slice: manage a family
estate through a deterministic 12-week season, move wine from vineyard to
market, respond to a rival price war, and finish profitable with a stronger
estate valuation than Monte Verde.

## Features in v0.2.0

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
- Automated tagged Windows releases with NSIS and MSI installers
- Signed in-game update checks at startup and on a configurable background
  interval
- A bottom-right update notice with release notes, download progress, and
  save-before-update protection

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

Vite does not watch `src-tauri`; Tauri and Cargo handle Rust-source changes.
This separation prevents Windows file-lock errors while Cargo replaces build
scripts under `src-tauri/target`.

For browser-only interface development:

```powershell
npm run dev
```

The browser preview stores saves in local storage. The Tauri application writes
the authoritative save to the platform application-data directory.

### In-game updates

Wine King checks GitHub Releases once at startup. By default it checks again
every five minutes while running. Open **Settings → Automatic updates** to
change the background interval to 5, 15, 30, or 60 minutes, disable background
checks, or check immediately. Disabling the interval does not disable the
startup check.

When a newer signed release is available, an update card appears in the
bottom-right corner. **Update & restart** first saves the current season. The
installer is not started if that save fails. The app then downloads the update,
installs it in passive mode, and restarts.

Version 0.2.0 is the updater bootstrap release. Existing v0.1.x installations
must install v0.2.0 manually from GitHub Releases once; v0.2.0 and later can
discover subsequent releases in the game.

## Verify

```powershell
npm run check
npm run build
npm run test:sites
npm run tauri:build
```

`npm run check` runs TypeScript checking, frontend unit tests, build
configuration tests, and Rust tests.
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
Runtime pack importing and arbitrary interface-layout mods are outside v0.2.0.

## Windows releases

Every synchronized version bump pushed to `master` is checked against the
repository's Git tags. When `v<version>` does not exist, the Windows Release
workflow:

1. Validates that npm, Cargo, and Tauri all declare the same semantic version.
2. Runs the TypeScript, frontend, configuration, Rust, and Sites tests.
3. Builds 64-bit Windows NSIS (`-setup.exe`) and MSI installers plus signed
   updater artifacts.
4. Creates the `v<version>` tag and publishes both installers, signatures, and
   `latest.json` update metadata under GitHub Releases.

Pushes that keep an already-tagged version skip the Windows build. The workflow
can also be started manually from the Actions page to retry an untagged
version.

Updater artifacts are cryptographically signed so the game rejects modified
update packages. The Windows installers are not Authenticode-signed, which is a
separate trust mechanism; Windows may still display an Unknown Publisher or
SmartScreen warning until a code-signing certificate is configured.

## Release convention

Every version bump must include:

1. A dated semantic-version entry in `CHANGELOG.md`.
2. An updated feature/configuration summary in this README when applicable.
3. A user-facing **What to test** checklist immediately after the release
   summary.
4. Commit and push. The local task is complete once that push succeeds; GitHub
   Actions owns the release build from that point.

## Design

The everyday interface uses the bright Sunlit Terroir direction with burgundy,
Cormorant Garamond typography, and restrained heritage details. Rival
encounters and major events switch to a dark cinematic presentation.

See [GAME_DESIGN.md](GAME_DESIGN.md) for the v0.1 rules and scope.
