# Release Testing

After every version bump, the release summary must be followed by a
version-specific **What to test** checklist. Update this file whenever a release
adds or changes a testable path.

## Automated checks

```powershell
npm run check
npm run build
npm run test:sites
npm run tauri:build
```

## What to test for v0.2.1

### Installed Windows launch

- Install v0.2.1 using the NSIS setup executable.
- Launch Wine King from the Start menu and confirm only the game window opens.
- Confirm no Command Prompt, PowerShell, Windows Terminal, or console window
  remains attached to the game.
- Close the game window and confirm Wine King exits normally.
- Repeat the same checks after installing with the MSI package.
- Run `npm run tauri:dev` and confirm development logging remains available in
  the terminal that started the command.

### v0.2.0 updater regression

- From an installed v0.2.0 build, accept the v0.2.1 update.
- Confirm the current season is saved before installation.
- Confirm v0.2.1 restarts with only the game window and the saved season can be
  loaded.

## What to test for v0.2.0

### Bootstrap and update discovery

- Install v0.2.0 manually from GitHub Releases; v0.1.x does not contain the
  updater and therefore cannot discover v0.2.0 itself.
- Launch the installed game and confirm startup update checking does not block
  the Estate Overview.
- Open Settings and confirm the background interval defaults to five minutes.
- Select 15, 30, 60, Off, and then 5 minutes; restart and confirm the final
  choice persists.
- Click **Check now** and confirm an up-to-date status and last-checked time
  appear without interrupting play.
- Disconnect the network, check manually, and confirm the error remains
  recoverable and normal gameplay continues.

### End-to-end update

- Publish a higher test version such as v0.2.1 before validating this section;
  an installed v0.2.0 correctly reports no update while v0.2.0 is latest.
- Launch v0.2.0 and confirm the newer version appears in a polished
  bottom-right update card with release notes.
- Choose **Later** and confirm the card stays dismissed for the current app
  session.
- Relaunch, make a gameplay change, and choose **Update & restart**.
- Confirm the card reports saving before download progress begins.
- After restart, load the saved season and confirm week, cash, inventory,
  vineyards, rival state, and remaining actions match the pre-update state.
- Simulate or force a save failure and confirm installation does not begin and
  the card offers a retry.

### Release artifacts and authenticity

- Confirm the v0.2.0 GitHub Release contains NSIS and MSI installers,
  updater-signature assets, and `latest.json`.
- Confirm `latest.json` describes v0.2.0 and points to the NSIS updater package.
- Confirm a package with an invalid or missing updater signature is rejected.
- Confirm Windows may still show Unknown Publisher because updater signing is
  not the same as Authenticode installer signing.
- Run `npm run dev`, open `/?update-preview=1`, and confirm the browser-only
  preview demonstrates the notification, save-first state, progress, and
  completion without restarting the browser.

## What to test for v0.1.2

### GitHub release automation

- Confirm the Windows Release workflow starts after the v0.1.2 commit reaches
  `master`.
- Confirm the release-check job reports version `0.1.2` and tag `v0.1.2`.
- Confirm the Windows job passes all tests and builds both installer formats.
- Confirm GitHub creates the `v0.1.2` tag on the release commit.
- Confirm the Wine King v0.1.2 release is public and contains both an NSIS
  `-setup.exe` and an `.msi` asset.
- Download each installer on Windows, install Wine King, launch it, start a new
  season, and uninstall it.
- Push or manually run the workflow again without changing the version and
  confirm the Windows build job is skipped instead of creating a duplicate
  release.
- Confirm any Unknown Publisher or SmartScreen warning is understood as the
  current unsigned-installer limitation.

## What to test for v0.1.1

### Windows development startup

- Start from a clean checkout and run `npm install`.
- Run `npm run tauri:dev` and confirm Cargo compiles past `toml_parser` without
  a Vite `EBUSY` watcher error.
- Leave the first Rust build running until the native Wine King window opens.
- Edit a React source file and confirm Vite hot reload still works.
- Edit a Rust source file and confirm Tauri recompiles and restarts the native
  application.
- Run `npm run dev` and confirm browser-only development still starts normally.

### v0.1.0 regression

- Confirm the Estate Overview opens in the native application.
- Advance one week, save, advance again, and load the saved state.
- Complete one vineyard-to-market production loop.

## What to test for v0.1.0

### First launch and estate navigation

- Start the Tauri application and confirm the Estate Overview fills the window.
- Click all ten sidebar destinations and confirm each management panel opens.
- Click every vineyard and facility hotspot on the estate artwork.
- Resize down to the supported minimum of 1180×720 and confirm the footer,
  sidebar, and End Week button remain available.

### Complete production loop

- Tend an unharvested vineyard and confirm cash and actions decrease.
- Attempt to harvest a parcel below 70% ripeness and confirm the action is
  rejected without charging cash.
- Harvest South Fields and confirm a new must-stage batch appears.
- Advance a week, process that batch, advance again, and bottle it.
- Sell the bottled batch through Local Cellar Door.
- Confirm inventory decreases, cash and revenue increase, and reputation rises.

### Markets and rival

- Compare estimated sale values across all three market channels.
- Advance to Week 6 and confirm the cinematic price-war event blocks End Week.
- Test each response from a fresh season:
  - Match the price changes cash and rival pressure.
  - Host a private tasting increases reputation.
  - Hold the premium line raises pressure and improves premium pricing.
- Confirm the event closes and the season can continue.

### Save and load

- Save during Week 3 after making one action.
- Advance the week and change inventory or cash.
- Load the save and confirm week, cash, inventory, plots, rival state, and
  actions return to the saved values.
- Restart the application and load again.

### Season result

- Finish a profitable season ahead of Monte Verde and confirm victory.
- Finish with negative operating profit and confirm defeat.
- Finish profitable but below Monte Verde's estate value and confirm defeat.
- Start a new season from the results dialog and confirm all state resets.

### Visual packs

- Rename one referenced image temporarily and confirm pack validation blocks
  startup with a clear asset-pack error.
- Restore it and verify all five required artwork keys load.
- Replace one wine image through `pack.json` without editing a React component.
- Replace one icon slot with another supported Phosphor name.
- Replace one icon slot with `asset:icons/<file>.svg`.
- Change a theme color and font file in the manifest and confirm the interface
  updates after reload.

### Regression and polish

- Confirm there are no browser-console errors in the development preview.
- Confirm keyboard focus is visible on navigation, action, event, and footer
  controls.
- Confirm text remains readable over both the bright estate and dark event art.
- Confirm no Falcon Crest trademarks, actors, logos, or character likenesses
  appear.
