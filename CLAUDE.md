# CLAUDE.md — Budget App

Context file for Claude Code when working in this repository.

## Project Overview

A single-page budgeting web app that lets users **add, remove, and categorize expenses and incomes**. No backend — everything runs client-side.

- **Repo:** [csteveng/budget_app](https://github.com/csteveng/budget_app)
- **Stack:** Vanilla HTML / CSS / JS, kept in **separate files** (no bundler, no framework)
- **Persistence:** Browser `localStorage` only — no backend, no database
- **Categories:** Predefined fixed list (see below); not user-editable in v1
- **Core features (in scope):**
  - Add a transaction (expense or income)
  - Remove a transaction
  - Assign a category to each transaction
  - Filter / search transactions (by category, type, text, and/or date)
  - Visual summary chart (e.g. spending by category, income vs. expense)
- **Out of scope for now:** user accounts, backend/API, multi-currency, recurring transactions, budget limits/alerts

## File Structure

Keep concerns separated — do not inline CSS or JS into the HTML.

```
budget_app/
├── index.html          # Markup only
├── css/
│   └── styles.css      # All styling, uses CSS variables from design system
├── js/
│   ├── app.js           # App init, event wiring
│   ├── storage.js        # localStorage read/write helpers
│   ├── transactions.js    # Add/remove/categorize logic, state
│   └── charts.js         # Rendering of the summary chart
├── assets/
│   └── icons/            # SVG icons (see Icon Style below)
└── CLAUDE.md
```

## Data Model

Stored in `localStorage` under a single key, e.g. `budget_app_transactions`, as a JSON array:

```json
[
  {
    "id": "uuid-or-timestamp",
    "type": "expense",        // "expense" | "income"
    "amount": 45.50,
    "category": "Food",
    "description": "Groceries",
    "date": "2026-07-10"
  }
]
```

### Predefined Categories

**Expenses:** Food, Rent/Housing, Transport, Utilities, Entertainment, Health, Shopping, Other
**Income:** Salary, Freelance, Investments, Gifts, Other

## Design System

Derived from the provided reference icon set (finance/money doodle-style icon pack). Apply consistently across UI and any custom icons/illustrations.

### Color Palette

| Role | Color | Hex (approx) | Usage |
|---|---|---|---|
| Primary / Ink | Navy | `#1B2A56` | Line strokes, headings, primary text, main icon outlines |
| Accent 1 | Orange | `#F2994A` | Expenses, warnings, secondary CTAs, highlight fills |
| Accent 2 | Teal/Green | `#2ED9A0` | Income, positive states, success, secondary highlight fills |
| Background | Off-white | `#FAFAF8` | Page background |
| Surface | White | `#FFFFFF` | Cards, panels |
| Muted | Light Gray | `#D9DCE3` | Borders, dividers, disabled states |

Suggested CSS variables (`css/styles.css`):

```css
:root {
  --color-navy: #1B2A56;
  --color-orange: #F2994A;
  --color-teal: #2ED9A0;
  --color-bg: #FAFAF8;
  --color-surface: #FFFFFF;
  --color-muted: #D9DCE3;

  --color-income: var(--color-teal);
  --color-expense: var(--color-orange);
  --color-text: var(--color-navy);
}
```

**Color conventions:**
- **Income** → teal/green
- **Expense** → orange
- **Neutral UI chrome / text / icon strokes** → navy
- Never use color alone to convey meaning — pair with a `+` / `−` sign or label for accessibility

### Typography

- Clean, geometric sans-serif (e.g. `Inter`, `Poppins`, or system-ui fallback)
- Bold weights for numbers/amounts, regular for labels
- Numbers (amounts) should be visually prominent — larger size, navy or category color

### Icon & Illustration Style

Matches the reference sheet — a friendly, doodle-style line-icon system:

- **Stroke-based (outline) icons**, not solid/filled, ~2–2.5px stroke weight
- Rounded line caps and joins — soft, approachable feel
- Minimal fill: small dollar signs and small shapes may use a solid accent fill, but the outer icon body stays outlined
- Icons are monochrome per icon, colored using the palette above (navy outlines are default; orange or teal used for accent/status icons)
- Common motifs to reuse: `$` inside a circle, wallet/coin/piggy-bank shapes, gears (settings), bar/line charts, bank/building outline, shopping cart, clipboard/ledger, magnifier/eye (search/insight), clock (recurring/time), arrows (in/out flow)
- Icons sit inside simple circular or rounded-square badges when used as category markers
- Prefer simple geometric construction (circles, rounded rectangles) over intricate detail — keep icons legible at small sizes (24–32px)

**Suggested icon usage in-app:**
- Expense entries → orange-outlined icon badge
- Income entries → teal-outlined icon badge
- Category icons: Food (utensils/cart), Rent (building), Transport (car/cart), Utilities (bolt), Entertainment (play button), Health (cross), Shopping (bag/cart), Salary (bank), Freelance (gear/laptop), Investments (chart/arrow up)

### Layout Principles

- Card-based UI: white surface cards on off-white background, subtle border (`--color-muted`) rather than heavy shadows
- Generous spacing, rounded corners (8–12px radius) to match the soft/rounded icon style
- Central dashboard emphasis: a prominent balance/total display (large `$` figure, similar to the icon set's central dollar motif), with income/expense breakdowns flanking it

## Coding Conventions

- Vanilla JS (ES6+), no framework, no build step required to run the app
- Keep `storage.js` as the only module that talks to `localStorage`
- Keep DOM manipulation in `app.js`; keep business logic (calculations, filtering) out of DOM code where possible
- Use semantic HTML elements; ensure forms are keyboard-accessible
- Comment non-obvious logic, especially around `localStorage` schema/versioning

## Open Items / Assumptions

- Assuming single-user, single-currency (USD-style `$` symbol, matching the icon set)
- Assuming chart implementation will use a lightweight approach (e.g. `<canvas>` or a small dependency-free chart) — confirm before adding any external library
