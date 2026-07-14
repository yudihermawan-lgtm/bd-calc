# Client-Safe Sales Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual, Indonesian-first, client-safe Jobseeker sales guide from all six workbook sheets and connect it to the existing calculator without changing the calculator’s pricing engine.

**Architecture:** Add a standalone static `sales-guide.html` containing the public package catalogue, bilingual copy dictionary, and language controller. Update `index.html` only around the calculator engine: shared branding, navigation, mascot guidance, responsive styling, and encoding repair. Use a small Node validation script plus browser checks to prevent sensitive-copy leakage and calculator regressions.

**Tech Stack:** Semantic HTML5, CSS custom properties and responsive CSS, vanilla JavaScript, Node.js standard library, static local assets.

## Global Constraints

- Indonesian is the default language on every first visit and reload.
- Show only client-safe information; do not expose cost lines, margins, profit, acquisition costs, internal implementation costs, support costs, commission pools, internal commercial verdicts, or approval thresholds.
- Preserve all existing calculator constants, formulas, tier selection, discounts, module logic, and outputs.
- Keep the workbook’s fixed three-tier guide and the calculator’s usage-based pricing visibly separate.
- Use only relative local paths and no application framework.
- Use `jobseeker-logo_transparent.png` in the branded header and `aming-official-transparent.png` as a purposeful sales guide.
- Provide keyboard-visible focus, useful alternative text, reduced-motion support, and a narrow-screen layout without clipped comparison content.
- Do not edit `jobseeker_v6_pricing_components.xlsx`.

---

## File Structure

- Create `sales-guide.html`: client-safe workbook content, bilingual dictionary, language controller, responsive presentation, and links to the calculator.
- Modify `index.html`: shared brand header, link to the sales guide, one Aming guidance panel, encoding repair, and responsive polish while preserving the pricing engine.
- Create `tests/validate-pages.mjs`: static checks for required assets, navigation, bilingual behavior, sensitive-copy exclusion, workbook pricing values, and calculator-engine constants.

### Task 1: Add Page-Contract Validation

**Files:**
- Create: `tests/validate-pages.mjs`
- Test: `tests/validate-pages.mjs`

**Interfaces:**
- Consumes: UTF-8 text from `index.html` and `sales-guide.html`.
- Produces: process exit code `0` with `Page validation passed.` when all page contracts hold; a thrown assertion and non-zero exit otherwise.

- [ ] **Step 1: Write the failing validation script**

Create `tests/validate-pages.mjs` with this code:

```js
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testsDir, "..");
const read = (name) => fs.readFile(path.join(root, name), "utf8");

const index = await read("index.html");
const guide = await read("sales-guide.html");

assert.match(index, /href="sales-guide\.html"/);
assert.match(guide, /href="index\.html"/);
assert.match(index, /jobseeker-logo_transparent\.png/);
assert.match(guide, /jobseeker-logo_transparent\.png/);
assert.match(index, /aming-official-transparent\.png/);
assert.match(guide, /aming-official-transparent\.png/);

assert.match(guide, /<html[^>]+lang="id"/);
assert.match(guide, /const DEFAULT_LANGUAGE = "id";/);
assert.match(guide, /aria-pressed/);
assert.match(guide, /prefers-reduced-motion/);

for (const price of ["Rp110 juta", "Rp25 juta", "Rp135 juta", "Rp175 juta", "Rp50 juta", "Rp225 juta", "Rp350 juta", "Rp100 juta", "Rp450 juta"]) {
  assert.ok(guide.includes(price), `Missing public workbook price: ${price}`);
}

for (const required of ["Essential", "Growth", "Enterprise", "ATS", "HRIS", "PMS", "LMS", "PPh 23", "Net-30", "Net-60"]) {
  assert.ok(guide.includes(required), `Missing workbook topic: ${required}`);
}

const forbidden = [
  /estimated y1 profit/i,
  /estimated y2 profit/i,
  /y1 margin/i,
  /y2 margin/i,
  /bd acquisition cost/i,
  /sales commission pool/i,
  /internal implementation cost/i,
  /commercial verdict/i,
  /ceo approval/i,
];
for (const pattern of forbidden) {
  assert.doesNotMatch(guide, pattern);
}

for (const engineToken of ["var WORKFORCE", "var HIRING", "var TIERS", "var MODULES", "var MAX_DISCOUNT = 0.15", "function build()"] ) {
  assert.ok(index.includes(engineToken), `Calculator engine token changed or missing: ${engineToken}`);
}

for (const broken of [/â€”/, /â€“/, /Ã—/, /âˆ’/, /â€™/, /â€œ/, /â€/]) {
  assert.doesNotMatch(index, broken);
  assert.doesNotMatch(guide, broken);
}

console.log("Page validation passed.");
```

- [ ] **Step 2: Run the validation to verify it fails**

Run:

```powershell
& 'C:\Users\haloy\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\tests\validate-pages.mjs'
```

Expected: FAIL with `ENOENT` for `sales-guide.html`.

- [ ] **Step 3: Commit the contract test**

```powershell
git add tests/validate-pages.mjs
git commit -m "test: define sales guide page contract"
```

### Task 2: Build the Bilingual Client-Safe Sales Guide

**Files:**
- Create: `sales-guide.html`
- Test: `tests/validate-pages.mjs`

**Interfaces:**
- Consumes: `jobseeker-logo_transparent.png`, `aming-official-transparent.png`, and the approved public values in the design specification.
- Produces: `sales-guide.html`, a static page whose `setLanguage(language)` function accepts `"id" | "en"`, updates `[data-i18n]` text, updates `[data-i18n-aria]` labels, sets `<html lang>`, and synchronizes toggle `aria-pressed` state.

- [ ] **Step 1: Create the semantic page and Indonesian-first content**

Create `sales-guide.html` with these top-level landmarks and fixed identifiers:

```html
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Panduan paket dan harga Jobseeker untuk membantu tim memilih solusi yang tepat.">
  <title>Panduan Produk Jobseeker</title>
</head>
<body>
  <header class="site-header">
    <a class="brand" href="sales-guide.html" aria-label="Jobseeker product guide">
      <img src="jobseeker-logo_transparent.png" alt="Jobseeker Company">
    </a>
    <nav aria-label="Navigasi utama">
      <a href="#paket" data-i18n="nav.packages">Paket</a>
      <a href="#fitur" data-i18n="nav.features">Fitur</a>
      <a href="#tambahan" data-i18n="nav.addons">Tambahan</a>
      <a class="button" href="index.html" data-i18n="nav.calculator">Buka kalkulator</a>
    </nav>
    <div class="language-switch" aria-label="Pilihan bahasa">
      <button type="button" data-language="id" aria-pressed="true">ID</button>
      <button type="button" data-language="en" aria-pressed="false">EN</button>
    </div>
  </header>
  <main>
    <section class="hero" id="awal"></section>
    <section class="journey" aria-labelledby="journey-title"></section>
    <section class="pricing" id="paket" aria-labelledby="pricing-title"></section>
    <section class="comparison" id="fitur" aria-labelledby="comparison-title"></section>
    <section class="addons" id="tambahan" aria-labelledby="addons-title"></section>
    <section class="terms" id="pembayaran" aria-labelledby="terms-title"></section>
    <section class="final-cta" aria-labelledby="cta-title"></section>
  </main>
  <footer></footer>
</body>
</html>
```

Populate those sections with all approved client-safe values from the specification:

- The hero contains the logo context, Aming image, `Pilih. Sesuaikan. Tawarkan dengan percaya diri.`, a calculator CTA, and an anchor CTA to `#paket`.
- The journey contains three numbered steps: choose a tier, adjust the scope, build the quote.
- Pricing contains exactly three packages with platform, setup, Year-1, and renewal prices.
- Comparison contains all 14 tier-scope rows from the workbook.
- Add-ons contains all 14 add-on rows and all 7 overage rows from the workbook, grouped as product modules, automation/analytics, services/integrations, and overages.
- Terms contains all nine client-facing payment rules and four positively worded scope notes.
- Final CTA links to `index.html` and frames the calculator as a separate usage-based quote tool.

- [ ] **Step 2: Implement the approved visual system**

Add page-local CSS using these design tokens and required behaviors:

```css
:root {
  --navy: #06177a;
  --navy-deep: #071252;
  --magenta: #e6007e;
  --pink-soft: #fde8f3;
  --cream: #fffaf3;
  --paper: #ffffff;
  --ink: #11194f;
  --muted: #626986;
  --line: #dfe3f1;
  --lime: #dfff66;
  --radius-lg: 30px;
  --radius-md: 18px;
  --shadow: 0 24px 70px rgba(6, 23, 122, 0.13);
}

html { scroll-behavior: smooth; }
body { margin: 0; color: var(--ink); background: var(--cream); }
:focus-visible { outline: 3px solid var(--magenta); outline-offset: 4px; }
.site-header { position: sticky; top: 0; z-index: 20; }
.hero { min-height: 680px; display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(300px, .8fr); }
.comparison-wrap { overflow-x: auto; overscroll-behavior-inline: contain; }
@media (max-width: 760px) {
  .hero { min-height: auto; grid-template-columns: 1fr; }
  .site-header nav > a:not(.button) { display: none; }
  .comparison-table { min-width: 780px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
```

Complete the styles with a navy editorial hero, magenta action accents, warm paper sections, asymmetric Aming placement, deliberate whitespace, responsive pricing columns, compact labelled add-on rows, and strong visible focus states. Do not use glass effects or purple gradients.

- [ ] **Step 3: Add complete bilingual behavior**

Add a translation dictionary with one Indonesian and one English value for every `data-i18n` key used in the page, then implement:

```js
const DEFAULT_LANGUAGE = "id";

function setLanguage(language) {
  const selected = translations[language] ? language : DEFAULT_LANGUAGE;
  document.documentElement.lang = selected;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = translations[selected][element.dataset.i18n];
    if (typeof value === "string") element.textContent = value;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    const value = translations[selected][element.dataset.i18nAria];
    if (typeof value === "string") element.setAttribute("aria-label", value);
  });
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === selected));
  });
}

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
});

setLanguage(DEFAULT_LANGUAGE);
```

Do not store the language choice: the approved behavior requires Indonesian on every reload.

- [ ] **Step 4: Run the page-contract test**

Run:

```powershell
& 'C:\Users\haloy\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\tests\validate-pages.mjs'
```

Expected: FAIL only on the missing `index.html` branding/navigation or existing mojibake checks; all guide-specific assertions pass.

- [ ] **Step 5: Commit the sales guide**

```powershell
git add sales-guide.html
git commit -m "feat: add bilingual client-safe sales guide"
```

### Task 3: Brand and Clean Up the Existing Calculator

**Files:**
- Modify: `index.html`
- Test: `tests/validate-pages.mjs`

**Interfaces:**
- Consumes: existing element IDs used by `build()` and the existing pricing constants.
- Produces: the same calculator DOM IDs and pricing behavior, plus a branded header linking to `sales-guide.html` and a compact Aming helper panel.

- [ ] **Step 1: Add shared navigation without changing calculator IDs**

Insert above the calculator card:

```html
<header class="site-nav">
  <a class="brand" href="sales-guide.html" aria-label="Jobseeker product guide">
    <img src="jobseeker-logo_transparent.png" alt="Jobseeker Company">
  </a>
  <div class="nav-actions">
    <span class="tool-label">Sales pricing tool</span>
    <a class="guide-link" href="sales-guide.html">Panduan Produk <span aria-hidden="true">→</span></a>
  </div>
</header>
```

Keep every existing calculator ID unchanged: `emp`, `hire`, `mAts`, `mHris`, `aPay`, `aPms`, `aLms`, `disc`, `tier`, `setBy`, `quote`, `rows`, `kSub`, `kSetup`, `kTcv`, `kFloor`, `kComm`, and `empty`.

- [ ] **Step 2: Add a purposeful Aming helper**

Add inside the input panel, before the first employee field:

```html
<aside class="aming-tip" aria-label="Sales tip">
  <img src="aming-official-transparent.png" alt="Aming, Jobseeker’s friendly sales assistant">
  <p><strong>Mulai dari dua angka.</strong> Masukkan jumlah karyawan dan kebutuhan rekrutmen tahunan untuk membangun referensi penawaran.</p>
</aside>
```

Style it as a compact horizontal note on desktop and keep its image under 104px wide so it supports rather than dominates the calculator.

- [ ] **Step 3: Repair visible encoding and refine responsive layout**

Replace every mojibake sequence with its intended UTF-8 character:

```text
â€” → —
â€“ → –
Ã— → ×
âˆ’ → −
â€™ → ’
â€œ → “
â€ → ”
```

Update CSS so the logo header, helper panel, calculator inputs, KPI region, and price table remain readable at 360px viewport width. Preserve the existing `Plus Jakarta Sans` calculator typography and the complete pricing script.

- [ ] **Step 4: Run the complete static validation**

Run:

```powershell
& 'C:\Users\haloy\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\tests\validate-pages.mjs'
```

Expected: `Page validation passed.`

- [ ] **Step 5: Commit the calculator presentation update**

```powershell
git add index.html
git commit -m "feat: connect and brand pricing calculator"
```

### Task 4: Browser Verification and Final Safety Audit

**Files:**
- Modify if defects are found: `sales-guide.html`, `index.html`, `tests/validate-pages.mjs`
- Test: `tests/validate-pages.mjs`

**Interfaces:**
- Consumes: completed static pages.
- Produces: verified desktop/mobile pages, verified language toggle, verified bidirectional navigation, and evidence that representative calculator outputs did not change.

- [ ] **Step 1: Serve the project locally**

Run from the project root:

```powershell
& 'C:\Users\haloy\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m http.server 4173 --bind 127.0.0.1
```

Expected: a local server listening at `http://127.0.0.1:4173/`.

- [ ] **Step 2: Verify the guide on desktop and mobile**

Open `http://127.0.0.1:4173/sales-guide.html` and confirm:

- Indonesian renders first.
- ID/EN switches every section, the document language, and toggle pressed state.
- Essential, Growth, and Enterprise show the approved prices.
- Tier comparison is scannable on desktop and horizontally usable at 360px.
- Both images render with no distortion.
- Keyboard focus is visible through navigation, language controls, and CTAs.
- No sensitive cost, margin, profit, commission, approval, or internal verdict copy is visible.

- [ ] **Step 3: Verify calculator behavior against the existing baseline**

Open `http://127.0.0.1:4173/index.html` and confirm these representative cases:

```text
Employees 1,200; hires 300; ATS on; HRIS on; no add-ons; discount 0%
Expected tier: Growth
Expected annual subscription: Rp 243.4jt
Expected setup: Rp 40jt
Expected Year-1 TCV: Rp 283.4jt

Employees 400; hires 80; ATS on; HRIS on; no add-ons; discount 0%
Expected tier: Essential

Employees 5,000; hires 1,500; ATS on; HRIS on; no add-ons; discount 0%
Expected tier: Enterprise

Employees 15,000; hires 5,000; ATS on; HRIS on; no add-ons; discount 0%
Expected tier: Enterprise Scale
```

Also confirm the product-guide link opens `sales-guide.html`, toggling both meters off shows the empty state, HRIS-off disables add-ons, and the discount slider cannot reduce a quote below its minimum contract.

- [ ] **Step 4: Run final automated checks and inspect the diff**

Run:

```powershell
& 'C:\Users\haloy\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\tests\validate-pages.mjs'
git diff --check
git status --short
```

Expected: `Page validation passed.`, no diff-check errors, and only intentional project files changed.

- [ ] **Step 5: Commit any verification fixes**

If verification required changes:

```powershell
git add sales-guide.html index.html tests/validate-pages.mjs
git commit -m "fix: polish sales guide verification issues"
```

If no fixes were needed, do not create an empty commit.
