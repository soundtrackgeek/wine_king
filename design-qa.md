# Design QA

**Source visual truth**

`C:\_code\wine_king\design\reference\option-3-sunlit-terroir.png`

**Implementation evidence**

`C:\_code\wine_king\design\qa\implementation-final.png`

**Comparison evidence**

- Full view: `C:\_code\wine_king\design\qa\comparison-final.png`
- Header focus: `C:\_code\wine_king\design\qa\comparison-focus-header.png`
- Management-panel focus:
  `C:\_code\wine_king\design\qa\comparison-focus-panel.png`
- Rival-event state: `C:\_code\wine_king\design\qa\rival-event.png`

## Normalization

- Viewport: 1672×941 CSS pixels.
- Source: 1672×941 pixels.
- Implementation: 1672×941 pixels.
- Device scale: 1.
- Browser: Codex in-app browser.
- State: desktop Estate Overview, Week 1, default Sunlit Terroir pack.
- Both images were combined into the same 3344×941 comparison input.

## Required fidelity surfaces

- **Fonts and typography:** Cormorant Garamond provides the heritage display
  character from Option 1; Source Sans 3 provides legible UI data. The final
  header remains on one line and hierarchy is consistent with the source.
- **Spacing and layout rhythm:** Sidebar, header, central estate, management
  rail, bottom panels, and persistent turn footer match the source hierarchy.
  Dense areas remain readable at the 1180×720 minimum.
- **Colors and visual tokens:** Parchment, navy, sage, burgundy, terracotta,
  plum, and straw are supplied by the pack manifest. Burgundy is restrained to
  emphasis and actions.
- **Image quality and asset fidelity:** The estate, wine bottles, and rival
  scene are project-local generated assets at their source resolution. No
  visible illustration was replaced with CSS art, inline SVG, emoji, or a
  placeholder.
- **Copy and content:** Labels use real v0.1.0 game state. The interface does
  not leak implementation instructions or placeholder copy.

## Interaction evidence

- Sidebar navigation and Market panel opened.
- Reserve Red sold through Local Cellar Door; cash changed from €1.28M to
  €1.33M, profit changed to +€51K, and reputation changed from 74 to 76.
- End Week advanced cleanly through Weeks 2–6.
- Week 6 price-war event appeared, blocked advancement, and closed after
  choosing Hold the premium line.
- Save captured Week 6, advancing reached Week 7, and Load restored Week 6.
- New season restored the Week 1 overview.
- Browser console error log was empty.

## Comparison history

### Pass 1

- [P2] The implementation wrapped “Estate Overview” to two lines while the
  reference used a single-line display heading.
- Fix: increased the header title track, preserved whitespace, and adjusted the
  responsive title width.

### Final pass

- The corrected header was captured at the same viewport and verified as a
  single line.
- No actionable P0, P1, or P2 differences remain.

## Follow-up polish

- [P3] Additional wine batches can fill the third inventory slot as later
  gameplay content expands.
- [P3] A future art-optimization pass can convert source PNGs to a smaller
  delivery format after visual sign-off.

final result: passed
