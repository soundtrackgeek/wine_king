# Changelog

All notable changes to Wine King are documented in this file.

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
