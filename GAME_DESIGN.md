# Wine King v0.1.0 Game Design

## Player promise

Run Bellavigna Estate through one tense harvest season. Read the land, choose
where to spend limited attention, turn grapes into marketable wine, and finish
profitable while outmaneuvering Monte Verde.

## Season structure

- A season lasts 12 weekly turns.
- The player receives two management actions per week.
- Advancing a week charges €12,000 in fixed operating costs.
- Weather advances ripeness while untended vines gradually lose health.
- Market demand and price multipliers change deterministically by seed.
- Monte Verde grows its estate value and applies increasing pressure each week.
- A major price-war event interrupts Week 6 and must be resolved.

## Player actions

| Action | Requirement | Cost | Result |
| --- | --- | ---: | --- |
| Tend vineyard | Unharvested parcel | €18,000 | Improves health and expected yield |
| Harvest | At least 70% ripeness | €24,000 | Creates a must-stage wine batch |
| Process wine | Must-stage batch | €14,000 | Moves wine into the cellar |
| Bottle wine | Cellar-stage batch | €11,000 | Creates sellable bottles with 4% loss |
| Sell wine | Bottled batch | — | Realizes revenue through a chosen market |

Local sales improve reputation. Premium Export requires at least 70 reputation.

## Victory

At the end of Week 12, the player wins only when:

1. Operating profit is positive.
2. Bellavigna's estate value exceeds Monte Verde's estate value.

Estate value equals cash plus conservative inventory value. Unsold inventory is
discounted according to its production stage.

## Visual interaction

The estate artwork is part of the control surface:

- Vineyard labels open the matching parcel.
- Winery, cellar, bottling, and equipment labels open operational panels.
- Plot and facility status appears directly on the scene.
- Inventory artwork opens a batch's market workflow.
- Rival activity opens competitive intelligence.

## Technical boundaries

- Rust owns authoritative rules, AI behavior, seeded randomness, saves, and
  victory calculation.
- React renders state and submits typed player actions.
- The browser preview gateway exists for fast UI and design testing only.
- Visual packs are data and media only; they cannot execute code.

## Explicitly deferred

- Human multiplayer
- Multiple player-owned estates
- Construction, land acquisition, and debt
- Detailed employees and relationships
- Advanced fermentation chemistry
- Large story campaigns
- Runtime mod marketplace
- Arbitrary UI-layout or gameplay mods
