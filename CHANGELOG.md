# Changelog

All notable changes to Wine King are documented in this file.

## [0.2.1] - 2026-07-23

### Fixed

- Changed release builds to use the Windows GUI subsystem so installed Wine
  King launches only the game window and no longer opens a dependent terminal
  window.

### Added

- Added a release-configuration regression test that prevents the Windows GUI
  subsystem declaration from being removed accidentally.

## [0.2.0] - 2026-07-23

### Added

- Added signed in-game update checks at startup and on a persisted background
  interval that defaults to five minutes.
- Added update settings for 5, 15, 30, or 60 minute background checks, an off
  option, and a manual check.
- Added a polished bottom-right update card with release notes, download
  progress, retry handling, and update deferral.
- Added automatic season saving before installation; a failed save safely
  prevents the updater from continuing.
- Added replaceable semantic visual-pack icons for checking and installing
  updates.
- Added unit coverage for interval persistence and save-before-install
  ordering.

### Changed

- Updated Windows release automation to sign updater packages and publish
  `latest.json` metadata and signatures alongside NSIS and MSI installers.
- Registered the least-privilege Tauri updater and restart capabilities.

## [0.1.2] - 2026-07-23

### Added

- Added a GitHub Actions release workflow that detects an untagged application
  version, validates the project, builds Windows NSIS and MSI installers,
  creates the matching Git tag, and publishes the installers under GitHub
  Releases.
- Added release-version validation across the npm, Cargo, and Tauri
  configuration files.
- Added regression tests that prevent duplicate releases for an existing tag.

## [0.1.1] - 2026-07-23

### Fixed

- Excluded `src-tauri` from Vite's filesystem watcher so Windows does not raise
  `EBUSY` while Cargo replaces locked executables under `target`.

### Added

- Added an automated configuration regression test for the Cargo watcher
  exclusion.

## [0.1.0] - 2026-07-23

### Added

- Initial Rust/Tauri 2 application with a React and TypeScript interface.
- Playable deterministic 12-week single-player season.
- Vineyard tending, harvesting, processing, bottling, and market-sale actions.
- One computer-controlled rival with estate growth and market pressure.
- Cinematic Week 6 price-war encounter with three response strategies.
- Versioned save and load support through the Rust backend.
- Season scoring, profit requirement, estate valuation, and victory/defeat
  summary.
- Sunlit Terroir visual pack with generated estate, rival-event, and wine
  artwork.
- Manifest-driven artwork, icon, font, color-token, and scene-hotspot
  replacement.
- Browser preview gateway, frontend tests, Rust tests, and visual design-QA
  evidence.

### Changed

- Adopted the bright Option 3 interface as the everyday foundation.
- Added Option 1 burgundy, heritage typography, and restrained estate details.
- Reserved Option 2's dark cinematic language for major rival events.
