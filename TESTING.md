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
