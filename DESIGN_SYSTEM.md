# SPILL Platform — Design System & Layout Guidelines

This document defines the core styling, layout patterns, and component rules established on the **Homepage** and **Confessional** pages. Use this specification to ensure consistent aesthetic, typography, responsiveness, and contrast across all other pages (`/podcast`, `/livestream`, `/about`, `/invest`, `/whats-on`, etc.).

---

## 1. Brand Tokens & Color Palette

### Colors
```css
:root {
  --black: #090909;
  --ink: #111216;
  --red: #ff1838;
  --cyan: #00d9ef;
  --white: #f7f7f4;
  --grey: #9a9ca3;
  --font-display: "Neuropol X", var(--font-space-grotesk), sans-serif;

  /* Confessional & Editorial Themes */
  --conf-paper: #ece7df;  /* Warm cream/paper */
  --conf-silver: #16171a; /* Dark tinted graphite */
  --conf-ink: #09090b;    /* Pure deep black */
  --conf-deep: #070708;   /* Pitch black */
}
```

### Contrast & Wordmark Rules
The SPILL logo exists in two tones:
- `<SpillWordmark tone="bright" />` (`/assets/spill/brand/wordmark-bright.png` — white text)
- `<SpillWordmark tone="dark" />` (`/assets/spill/brand/wordmark-dark.png` — black text)

| Section Background | Background Value | Text / Logo Rule |
| :--- | :--- | :--- |
| **Dark / Photo** | `#090909`, `#111216`, `--conf-ink` | Use `<SpillWordmark tone="bright" />` (white). Heading accents in `var(--red)` or white. |
| **Electric Red** | `var(--red)` (`#ff1838`) | **ALWAYS** use `<SpillWordmark tone="dark" />` (black). White logos are forbidden on red backgrounds. Text is `#111` or `#fff`. Kickers are `#111; opacity: .72;`. |
| **Paper / Cream** | `var(--conf-paper)` (`#ece7df`) | Use `<SpillWordmark tone="dark" />` or `<BrandedText text="..." tone="dark" />`. Headings use `#111` with stroked or transparent accents. |

---

## 2. Typography Rules

### Sitewide Rules
- **Minimum Font Size**: **15px** minimum across the entire site (no tiny 11px-13px text).
- **Display Font**: `var(--font-display)` for titles, numbers, badges, and kickers.
- **Headings**: Uppercase, tight leading (`line-height: .92 – .95`), negative tracking (`letter-spacing: -.045em – -.055em`).

### Heading Scale & Clamping
```css
/* Standard Section H2 on Desktop */
.sectionHeading h2 {
  font-size: clamp(36px, 4.6vw, 72px);
  line-height: .93;
  letter-spacing: -.05em;
  text-transform: uppercase;
}

/* Accented Italic Line inside H2 */
h2 em {
  font-style: normal;
  /* On dark backgrounds: */
  color: var(--red);
  /* On red backgrounds: */
  color: #fff;
  /* On paper backgrounds: */
  color: transparent;
  -webkit-text-stroke: 1.2px #111;
}
```

### Critical Mobile Heading Rule
> [!IMPORTANT]
> Desktop `white-space: nowrap` **MUST ALWAYS** be reset on mobile breakpoints.
> Never allow long lines in headings to run off the screen on phone dimensions.

```css
@media (max-width: 820px) {
  h1, h2, h3 {
    white-space: normal !important;
    overflow-wrap: break-word;
    word-break: normal;
  }
  h2 {
    font-size: clamp(24px, 7.5vw, 36px) !important;
  }
}
```

### Section Kickers / Eyebrows
Kickers appear above every section heading:
```html
<p className="confKicker">01 / Section Name</p>
```
```css
.confKicker, .sectionNumber {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: .15em;
  text-transform: uppercase;
  color: var(--red); /* On dark */
}
```

---

## 3. Core Layout Templates

### Pattern A: Split Editorial (Left Copy, Right Media)
Used for primary showcase sections (e.g. Homepage Hero/Connections, Confessional Section 01, 7 Modes).

```
+------------------------------------+---------------------------------------+
|  LEFT COPY COLUMN                  |  RIGHT MEDIA COLUMN                   |
|  - minmax(390px, .82fr)            |  - minmax(0, 1.18fr)                  |
|  - padding: clamp(90px, 11vw)      |  - Full bleed video or photo          |
|  - position: relative; z-index: 10 |  - position: relative; z-index: 1     |
|  - Kicker + H2 + Steps/Features    |  - Left-edge gradient overlay (90deg) |
+------------------------------------+---------------------------------------+
```

#### CSS Implementation:
```css
.editorialSplit {
  min-height: 900px;
  display: grid;
  grid-template-columns: minmax(390px, .82fr) minmax(0, 1.18fr);
  gap: 0;
  align-items: stretch;
  overflow: hidden;
}

.editorialCopy {
  padding: clamp(90px, 11vw, 170px) clamp(40px, 6vw, 96px);
  align-self: center;
  position: relative;
  z-index: 10;
}

.editorialCopy h2 {
  width: 100%;
  margin: 34px 0 0;
  font-size: clamp(36px, 4.6vw, 72px);
  white-space: normal;
}

.editorialMedia {
  min-height: 900px;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.editorialMedia img,
.editorialMedia video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: right center; /* Or center, never let it clip awkwardly */
}

/* Edge blend overlay */
.editorialMedia::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--bg-color) 0%, transparent 18%);
  pointer-events: none;
}

/* Mobile responsive collapse */
@media (max-width: 900px) {
  .editorialSplit {
    grid-template-columns: 1fr;
    min-height: 0;
  }
  .editorialCopy {
    padding: 72px clamp(22px, 6vw, 96px) 36px;
  }
  .editorialMedia {
    min-height: 0;
    aspect-ratio: 3/2;
    width: 100%;
  }
  .editorialMedia::after {
    background: linear-gradient(180deg, var(--bg-color) 0%, transparent 16%);
  }
}
```

---

### Pattern B: 3-Card Comparison Rail (with Hover Elevation & Arrow Stacking)
Used for comparative formats (`/podcast`, `/livestream`, `/confessional`, revenue cards).

```
+-------------------+   →   +-------------------+   →   +-------------------+
|  CARD 1           | (red) |  CARD 2           | (red) |  CARD 3 (Active)  |
|  z-index: 5       | badge |  z-index: 4       | badge |  z-index: 3       |
|  Top dark vignette|       |  Top dark vignette|       |  Top dark vignette|
+-------------------+       +-------------------+       +-------------------+
```

#### Key Rules for Cards:
1. **Full Borders**: Every card must have a complete 4-sided border (`border: 1px solid #313134 !important;`). Never leave `:last-child` with `border-right: 0`.
2. **Top Vignette for Eyebrow Contrast**: If cards have background photos, the overlay must be dark at the top (`linear-gradient(180deg, rgba(0,0,0,.92) 0%, rgba(0,0,0,.45) 32%, ..., rgba(0,0,0,.94) 100%)`) so the red eyebrow text has vibrant contrast.
3. **Circular Arrow Stacking Hierarchy**: Because arrows sit on the right border of Card 1 and Card 2 (`right: -29px`), Card 1 must **ALWAYS** have higher z-index than Card 2, and Card 2 must **ALWAYS** have higher z-index than Card 3.

#### CSS Implementation:
```css
.cardRail {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.cardRail article {
  min-height: 520px;
  padding: 24px;
  position: relative;
  overflow: visible;
  border: 1px solid #313134 !important;
  transition: transform .8s ease, box-shadow .8s ease;
}

/* Background with dark top & bottom vignette */
.cardRail article {
  background: linear-gradient(180deg, rgba(0,0,0,.92) 0%, rgba(0,0,0,.45) 32%, rgba(0,0,0,.4) 50%, rgba(0,0,0,.94) 100%),
              url('...') center/cover !important;
}

/* Stacking hierarchy: 1 > 2 > 3 in all hover states */
.cardRail article:nth-child(1) { z-index: 5; }
.cardRail article:nth-child(2) { z-index: 4; }
.cardRail article:nth-child(3) { z-index: 3; }

.cardRail article:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 65px rgba(0,0,0,.34);
}

.cardRail:has(article:nth-child(1):hover) article:nth-child(1) { z-index: 9; }

.cardRail:has(article:nth-child(2):hover) article:nth-child(1) { z-index: 9; }
.cardRail:has(article:nth-child(2):hover) article:nth-child(2) { z-index: 8; }

.cardRail:has(article:nth-child(3):hover) article:nth-child(1) { z-index: 9; }
.cardRail:has(article:nth-child(3):hover) article:nth-child(2) { z-index: 8; }
.cardRail:has(article:nth-child(3):hover) article:nth-child(3) { z-index: 7; }

/* Circular Connector Arrow */
.cardArrow {
  width: 46px;
  height: 46px;
  position: absolute;
  z-index: 10;
  top: 50%;
  right: -29px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--red);
  color: #fff;
  font-size: 22px;
  transform: translateY(-50%);
  pointer-events: none;
}

@media (max-width: 820px) {
  .cardRail { grid-template-columns: 1fr; }
  .cardArrow {
    top: auto;
    right: 50%;
    bottom: -29px;
    transform: translateX(50%) rotate(90deg);
  }
}
```

---

### Pattern C: Numbered Step / Row Metric List
Used for processes, modes, pricing tiers, and metric lists.

```html
<div className="stepList">
  {steps.map(([num, title]) => (
    <article key={title} data-reveal>
      <span>{num}</span>
      <h3>{title}</h3>
    </article>
  ))}
</div>
```

```css
.stepList {
  margin-top: 48px;
  display: grid;
  grid-template-columns: 1fr;
  border-top: 1px solid rgba(17, 17, 17, .28);
}

.stepList article {
  padding: 16px 0;
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 12px;
  align-items: center;
  border-bottom: 1px solid rgba(17, 17, 17, .28);
}

.stepList span {
  font-family: var(--font-display);
  font-size: 15px;
  opacity: .65;
}

.stepList h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  text-transform: uppercase;
}
```

---

## 4. Checklist for New / Refactored Pages

When refactoring a page (such as `/podcast`, `/livestream`, `/about`):

- [ ] **Background Contrast**: If red background, use `<SpillWordmark tone="dark" />`. If dark, use `tone="bright"`.
- [ ] **Editorial Split**: Follow the `minmax(390px, .82fr) minmax(0, 1.18fr)` ratio for split text/media sections.
- [ ] **Z-Index Layering**: Give the text content column `position: relative; z-index: 10;` and media `z-index: 1;` so headlines never get painted under media.
- [ ] **Heading Clamp**: Desktop `h2` clamped to `clamp(36px, 4.6vw, 72px)`.
- [ ] **Mobile Headings**: Force `white-space: normal !important; overflow-wrap: break-word;` at `<= 820px`.
- [ ] **Card Borders**: Ensure all cards in grids have 4-sided borders (`border: 1px solid ... !important;`), never leaving the last card borderless.
- [ ] **Hover Overlaps**: If cards feature side-protruding badges or arrows, ensure left-to-right z-index cascade (Card 1 > Card 2 > Card 3) in all hover states.
- [ ] **Minimum Type**: Ensure no typography falls below `15px`.
