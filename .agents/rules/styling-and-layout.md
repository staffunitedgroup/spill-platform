# Styling & Layout Rules for SPILL Pages

Always adhere to the established styling, layout patterns, and contrast rules documented in `DESIGN_SYSTEM.md` whenever modifying or building pages across the SPILL platform.

## 1. Brand Wordmark & Contrast
- **Red Background (`var(--red)`)**: ALWAYS use `<SpillWordmark tone="dark" />` (black logo). Never use bright (white) logos on red backgrounds.
- **Dark Backgrounds (`--black`, `--ink`, `--conf-ink`)**: Use `<SpillWordmark tone="bright" />` (white logo).
- **Paper Backgrounds (`--conf-paper`)**: Use `<SpillWordmark tone="dark" />` or `<BrandedText tone="dark" />`.

## 2. Heading Standards & Scale
- **Desktop H2**: Use `font-size: clamp(36px, 4.6vw, 72px); line-height: .93; letter-spacing: -.05em; text-transform: uppercase;`.
- **Mobile Headings (<= 820px)**: MUST ALWAYS have:
  ```css
  white-space: normal !important;
  overflow-wrap: break-word;
  word-break: normal;
  ```
  Never let desktop `white-space: nowrap` remain active on mobile.
- **Minimum Font Size**: Sitewide minimum is **15px**. Never set font sizes below 15px.

## 3. Split Editorial Pattern (Copy + Media)
- Grid layout: `grid-template-columns: minmax(390px, .82fr) minmax(0, 1.18fr);`
- Text container: `position: relative; z-index: 10;` (so text is never painted under media).
- Media container: `position: relative; z-index: 1; overflow: hidden;` with edge blend overlay `linear-gradient(90deg, [bgColor] 0%, transparent 18%)`.
- Media positioning: Explicit `object-fit: cover; object-position: right center;` (or left center depending on design intent).

## 4. Card Grids & Overlays
- **Borders**: All cards must have complete 4-sided borders (`border: 1px solid ... !important;`). Never leave `:last-child` with `border-right: 0`.
- **Card Background Vignettes**: When cards have photos/graphics, use `linear-gradient(180deg, rgba(0,0,0,.92) 0%, rgba(0,0,0,.45) 32%, ..., rgba(0,0,0,.94) 100%)` so top red eyebrow tags have high contrast.
- **Hover Z-Index Stacking**: When cards contain overlapping elements (e.g. connector arrows or badges extending across borders), maintain a strict z-index cascade (Card 1 > Card 2 > Card 3) across all hover states so elevated cards never cover neighboring connector badges.
