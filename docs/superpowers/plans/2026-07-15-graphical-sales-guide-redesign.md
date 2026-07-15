# Graphical Sales Guide Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the bilingual sales guide into a warm, pricing-first visual reference with readable typography, concise progressive disclosure, and zero overlap across desktop, zoomed, and mobile layouts.

**Architecture:** Recompose the existing single-file static guide around a compact hero, three primary package cards, icon-led feature summaries, and accessible disclosures containing the complete workbook-derived details. Keep the existing translation-dictionary controller and extend its exact-key validator. Use browser-computed style and geometry checks to enforce readability rather than relying on screenshots alone.

**Tech Stack:** Semantic HTML5, CSS custom properties and container-safe grids, vanilla JavaScript, Node.js standard library assertions, bundled Playwright for browser verification, existing local PNG assets.

## Global Constraints

- Use the approved B-led pricing-first structure with A’s warm Aming hero and friendly tone.
- Foundation prices are Essential Rp135 juta/Rp110 juta renewal, Growth Rp225 juta/Rp175 juta renewal, and Enterprise Rp450 juta/Rp350 juta renewal.
- Retain all 14 tier-comparison rows, 14 add-ons, seven overages, nine payment terms, and four positive scope notes through progressive disclosure.
- Indonesian is the default after every reload; English switching covers every visible and accessible string.
- Body text is at least 16px; navigation, buttons, chips, captions, table cells, and supporting labels are at least 14px; decorative overlines are at least 13px.
- Package prices are at least 36px mobile/42px desktop; section headings are at least 30px mobile/38px desktop.
- Do not shrink text to fit. Wrap, grow, or stack content.
- No overlapping text, clipped translated labels, clipped artwork, or page-level horizontal overflow at 320px, 360px, 768px, 1440px, or 200% zoom.
- Keep all content client-safe; never show commission, internal economics, approval rules, or commercial verdicts.
- Use only local relative assets and zero external HTTP resources, fonts, frameworks, or runtime dependencies.
- Preserve the public path `/sales-guide.html`, the calculator link, visible focus, and reduced-motion support.
- Do not change calculator pricing behavior in this plan.
- Do not edit the source workbook.

---

## File Structure

- Modify `sales-guide.html`: pricing-first semantic layout, graphical CSS system, accessible Year 1/Renewal switch, disclosure groups, translations, and responsive behavior.
- Modify `tests/validate-pages.mjs`: graphical-structure, content-count, local-resource, typography-token, disclosure, and bilingual parity contracts.
- Use ignored `.superpowers/verification/` for browser scripts, screenshots, logs, and JSON evidence.

### Task 1: Define the Graphical Guide Contract

**Files:**
- Modify: `tests/validate-pages.mjs`
- Test: `tests/validate-pages.mjs`

**Interfaces:**
- Consumes: UTF-8 `sales-guide.html` and its inline translation object.
- Produces: static guarantees for the approved layout, exact content counts, typography floor tokens, Year 1/Renewal behavior hooks, disclosures, local-only assets, and exact translation parity.

- [ ] **Step 1: Add failing structural and typography assertions**

Add after the existing guide language assertions:

```js
for (const id of ["packages", "compare", "addons", "payments", "guideCta"]) {
  assert.match(guide, new RegExp(`id=["']${id}["']`), `Missing graphical guide section: ${id}`);
}

for (const id of ["priceYear1", "priceRenewal"]) {
  assert.match(guide, new RegExp(`id=["']${id}["']`), `Missing price-context control: ${id}`);
}

assert.match(guide, /id="priceYear1"[^>]*aria-pressed="true"/);
assert.match(guide, /id="priceRenewal"[^>]*aria-pressed="false"/);
assert.match(guide, /function setPriceContext\s*\(/);
assert.match(guide, /data-year1="Rp135 juta"[^>]*data-renewal="Rp110 juta"/);
assert.match(guide, /data-year1="Rp225 juta"[^>]*data-renewal="Rp175 juta"/);
assert.match(guide, /data-year1="Rp450 juta"[^>]*data-renewal="Rp350 juta"/);

assert.match(guide, /--font-body:\s*16px/);
assert.match(guide, /--font-support:\s*14px/);
assert.match(guide, /--font-overline:\s*13px/);
assert.match(guide, /--font-price-mobile:\s*36px/);
assert.match(guide, /--font-price-desktop:\s*42px/);
assert.match(guide, /--font-heading-mobile:\s*30px/);
assert.match(guide, /--font-heading-desktop:\s*38px/);

assert.equal((guide.match(/class="comparison-row"/g) || []).length, 14);
assert.equal((guide.match(/class="addon-item"/g) || []).length, 14);
assert.equal((guide.match(/class="overage-item"/g) || []).length, 7);
assert.equal((guide.match(/class="payment-item"/g) || []).length, 9);
assert.equal((guide.match(/class="scope-note"/g) || []).length, 4);

for (const disclosure of ["comparisonDetails", "addonDetails", "paymentDetails"]) {
  assert.match(guide, new RegExp(`id=["']${disclosure}["']`));
}
```

Retain the existing exact translation-key parity, no-unused-key, sensitive-content, local-resource, pricing, and mojibake checks.

- [ ] **Step 2: Run the validator to prove RED**

```powershell
& 'C:\Users\haloy\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\tests\validate-pages.mjs'
```

Expected: FAIL on missing `packages` section or `priceYear1` control.

- [ ] **Step 3: Commit the failing contract**

```powershell
git add tests/validate-pages.mjs
git commit -m "test: define graphical sales guide contract"
```

### Task 2: Rebuild the Guide Around Foundation Pricing

**Files:**
- Modify: `sales-guide.html`
- Test: `tests/validate-pages.mjs`

**Interfaces:**
- Consumes: existing logo and Aming PNGs, all current client-safe workbook content, current `translations` object and `setLanguage(language)` behavior.
- Produces: semantic sections with fixed IDs, `setPriceContext(context)`, translated accessible disclosures, exact content-count classes, and responsive B+A visual presentation.

- [ ] **Step 1: Establish readable design tokens and base layout rules**

Define these exact tokens at the top of the existing `:root` block:

```css
--font-body:16px;
--font-support:14px;
--font-overline:13px;
--font-price-mobile:36px;
--font-price-desktop:42px;
--font-heading-mobile:30px;
--font-heading-desktop:38px;
--border-subtle:#dfe3f1;
--border-strong:#c9cfe4;
```

Apply:

```css
body{font-size:var(--font-body);line-height:1.5}
.support-text,.chip,.button,.site-header a,.guide-table th,.guide-table td{font-size:var(--font-support)}
.overline{font-size:var(--font-overline)}
.section-title{font-size:clamp(var(--font-heading-mobile),4vw,var(--font-heading-desktop));line-height:1.08}
.package-price{font-size:clamp(var(--font-price-mobile),5vw,var(--font-price-desktop));line-height:1}
.layout-grid>*{min-width:0}
```

Remove every CSS declaration that sets visible text below 13px. Remove fixed heights from content cards and text sections. Preserve reduced-motion handling.

- [ ] **Step 2: Replace the hero with the approved warm concise composition**

Build this semantic shape:

```html
<section class="hero" id="top" aria-labelledby="heroTitle">
  <div class="hero-copy">
    <span class="overline" data-i18n="hero.eyebrow">Panduan paket Jobseeker</span>
    <h1 id="heroTitle" data-i18n="hero.title">Tiga paket. Satu pilihan yang tepat.</h1>
    <p data-i18n="hero.body">Bandingkan harga, kapasitas, dan dukungan dalam hitungan detik.</p>
    <a class="button button-accent" href="#packages" data-i18n="hero.cta">Lihat paket</a>
  </div>
  <div class="hero-art" aria-hidden="true">
    <span class="hero-orbit"></span>
    <img src="aming-official-transparent.png" alt="" fetchpriority="high">
  </div>
</section>
```

Keep meaningful translated Aming alternative text on one non-`aria-hidden` image instance if the hero art is not purely decorative; do not expose duplicate names.

- [ ] **Step 3: Build pricing-first package cards and context control**

Create `section#packages` with:

```html
<div class="price-context" role="group" aria-label="Price context" data-i18n-aria="pricing.contextAria">
  <button type="button" id="priceYear1" aria-pressed="true" data-i18n="pricing.year1">Year 1</button>
  <button type="button" id="priceRenewal" aria-pressed="false" data-i18n="pricing.renewal">Renewal</button>
</div>
```

Create exactly three `.package-card` elements. Their visible `.package-price` nodes must carry:

```html
<span class="package-price" data-year1="Rp135 juta" data-renewal="Rp110 juta">Rp135 juta</span>
<span class="package-price" data-year1="Rp225 juta" data-renewal="Rp175 juta">Rp225 juta</span>
<span class="package-price" data-year1="Rp450 juta" data-renewal="Rp350 juta">Rp450 juta</span>
```

Add `data-price-label` nodes that switch between translated Year-1 and renewal context. Each card contains a CSS-only three-bar scale visual, a one-sentence translated best-fit description, and a button linking to that tier’s full comparison column. Growth may show a translated popular label.

- [ ] **Step 4: Implement the non-persistent price-context controller**

Add:

```js
var priceContext = "year1";

function setPriceContext(context){
  priceContext = context === "renewal" ? "renewal" : "year1";
  var isRenewal = priceContext === "renewal";
  document.getElementById("priceYear1").setAttribute("aria-pressed", String(!isRenewal));
  document.getElementById("priceRenewal").setAttribute("aria-pressed", String(isRenewal));
  document.querySelectorAll(".package-price").forEach(function(price){
    price.textContent = isRenewal ? price.dataset.renewal : price.dataset.year1;
  });
  document.querySelectorAll("[data-price-label]").forEach(function(label){
    label.textContent = translations[document.documentElement.lang][isRenewal ? "pricing.renewalLabel" : "pricing.year1Label"];
  });
}

document.getElementById("priceYear1").addEventListener("click", function(){ setPriceContext("year1"); });
document.getElementById("priceRenewal").addEventListener("click", function(){ setPriceContext("renewal"); });
setPriceContext("year1");
```

At the end of `setLanguage`, call `setPriceContext(priceContext)` so price-context labels retranslate without changing the selected context. Do not persist price context.

- [ ] **Step 5: Build icon-led comparison with complete disclosure**

Create `section#compare` with five `.feature-symbol` summaries for Admin, AI Screening, Workflow, Support, and Integration. Use inline text/CSS symbols or small accessible inline SVG; do not add external icon dependencies.

Add an accessible disclosure button controlling `#comparisonDetails`:

```html
<button type="button" class="disclosure-toggle" aria-expanded="false" aria-controls="comparisonDetails" data-disclosure="comparisonDetails" data-i18n="compare.showAll">Lihat semua perbedaan</button>
<div id="comparisonDetails" class="disclosure-panel" hidden>
  <div class="comparison-scroll" tabindex="0" role="region" aria-label="Perbandingan lengkap paket" data-i18n-aria="compare.tableAria">
    <table class="guide-table">
      <thead><tr><th data-i18n="compare.component">Komponen</th><th>Essential</th><th>Growth</th><th>Enterprise</th></tr></thead>
      <tbody>
        <tr class="comparison-row"><th data-i18n="compare.ats">ATS</th><td data-i18n="compare.included">Termasuk</td><td data-i18n="compare.included">Termasuk</td><td data-i18n="compare.included">Termasuk</td></tr>
        <tr class="comparison-row"><th>HRIS</th><td data-i18n="compare.hrisBasic">Dasar / terbatas</td><td data-i18n="compare.included">Termasuk</td><td data-i18n="compare.included">Termasuk</td></tr>
        <tr class="comparison-row"><th data-i18n="compare.careersite">Careersite</th><td data-i18n="compare.standard">Standar</td><td data-i18n="compare.standardConfig">Standar + konfigurasi</td><td data-i18n="compare.enterpriseConfig">Konfigurasi enterprise</td></tr>
        <tr class="comparison-row"><th>Dashboard</th><td data-i18n="compare.basic">Dasar</td><td data-i18n="compare.standard">Standar</td><td data-i18n="compare.enterpriseDashboard">Dashboard enterprise</td></tr>
        <tr class="comparison-row"><th data-i18n="compare.aiScreening">AI screening</th><td data-i18n="compare.limitedQuota">Kuota terbatas</td><td data-i18n="compare.standardQuota">Kuota standar</td><td data-i18n="compare.higherQuota">Kuota lebih tinggi</td></tr>
        <tr class="comparison-row"><th data-i18n="compare.workflow">Workflow WhatsApp / email</th><td data-i18n="compare.basic">Dasar</td><td data-i18n="compare.priorityWorkflow">Workflow prioritas</td><td data-i18n="compare.advancedWorkflow">Workflow lanjutan</td></tr>
        <tr class="comparison-row"><th data-i18n="compare.adminUsers">Pengguna admin</th><td data-i18n="compare.upTo3">Hingga 3</td><td data-i18n="compare.upTo10">Hingga 10</td><td data-i18n="compare.upTo50">Hingga 50</td></tr>
        <tr class="comparison-row"><th data-i18n="compare.locations">Cabang / lokasi</th><td data-i18n="compare.upTo3">Hingga 3</td><td data-i18n="compare.upTo10">Hingga 10</td><td data-i18n="compare.upTo100">Hingga 100</td></tr>
        <tr class="comparison-row"><th data-i18n="compare.candidates">Pemrosesan kandidat</th><td data-i18n="compare.candidates1500">Hingga 1.500/bulan</td><td data-i18n="compare.candidates5000">Hingga 5.000/bulan</td><td data-i18n="compare.candidates20000">Hingga 20.000/bulan</td></tr>
        <tr class="comparison-row"><th data-i18n="compare.mandays">Mandays konfigurasi</th><td data-i18n="compare.minimal">Tidak ada / minimal</td><td data-i18n="compare.mandays5">5 mandays</td><td data-i18n="compare.mandays10">10 mandays</td></tr>
        <tr class="comparison-row"><th data-i18n="compare.support">Dukungan</th><td data-i18n="compare.ticketEmail">Tiket/email</td><td data-i18n="compare.whatsappPriority">Prioritas WhatsApp, jam kerja</td><td data-i18n="compare.dedicatedAm">Dedicated AM, SLA jam kerja</td></tr>
        <tr class="comparison-row"><th data-i18n="compare.review">Pertemuan review</th><td data-i18n="compare.quarterly">Kuartalan</td><td data-i18n="compare.monthly">Bulanan</td><td data-i18n="compare.executiveQuarterly">Review eksekutif kuartalan</td></tr>
        <tr class="comparison-row"><th data-i18n="compare.integration">Integrasi</th><td data-i18n="compare.notIncluded">Tidak termasuk</td><td data-i18n="compare.addon">Add-on</td><td data-i18n="compare.integrationSupport">Dukungan standar; integrasi lebih dalam sebagai add-on</td></tr>
        <tr class="comparison-row"><th data-i18n="compare.onPremise">On-premise</th><td data-i18n="compare.notAvailable">Tidak tersedia</td><td data-i18n="compare.notAvailable">Tidak tersedia</td><td data-i18n="compare.customQuote">Penawaran khusus</td></tr>
      </tbody>
    </table>
  </div>
</div>
```

The table body contains exactly 14 rows with `class="comparison-row"`, preserving all existing translated values.

- [ ] **Step 6: Recompose add-ons, overages, payments, and scope notes**

Create `section#addons` and `section#payments`.

- Use concise group summaries outside disclosures.
- Put all details in `#addonDetails` and `#paymentDetails`.
- Mark exactly 14 add-on rows with `class="addon-item"`.
- Mark exactly seven overage rows with `class="overage-item"`.
- Mark exactly nine payment rows with `class="payment-item"`.
- Mark exactly four positive scope notes with `class="scope-note"`.
- Keep each price visible in its row; disclosure hides detail notes, not the price itself.
- Use consistent subtle borders and no fixed-height rows.

Add one shared disclosure controller:

```js
document.querySelectorAll("[data-disclosure]").forEach(function(button){
  button.addEventListener("click", function(){
    var panel = document.getElementById(button.dataset.disclosure);
    var expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;
  });
});
```

- [ ] **Step 7: Add the concise calculator CTA and update translations**

Create `section#guideCta` with one short heading, one supporting sentence, and one relative `index.html` button. Update both `id` and `en` dictionaries so every used `data-i18n`, `data-i18n-alt`, and `data-i18n-aria` key exists as a string and neither dictionary has unused keys.

Remove obsolete translation keys from the old layout rather than retaining dead entries.

- [ ] **Step 8: Implement overlap-safe responsive CSS**

Required rules:

```css
.package-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.hero{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr);align-items:center}
.hero-copy,.hero-art,.package-card,.feature-summary,.catalogue-group{min-width:0}
.package-card,.catalogue-row,.payment-item{height:auto;overflow-wrap:anywhere}
.comparison-scroll{max-width:100%;overflow-x:auto;overscroll-behavior-inline:contain}
@media(max-width:760px){
  .hero,.package-grid{grid-template-columns:minmax(0,1fr)}
  .hero-art{min-height:260px}.hero-art img{max-width:min(100%,360px)}
  .site-header{flex-wrap:wrap}.site-header nav{width:100%}
}
```

Decorative art must sit behind an isolated hero-art region and never overlap `.hero-copy` at mobile sizes. Use `clamp()` for spacing, not for values below the required font floors.

- [ ] **Step 9: Run source validation and commit**

```powershell
& 'C:\Users\haloy\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\tests\validate-pages.mjs'
git diff --check
```

Expected: `Page validation passed.` and no whitespace errors.

```powershell
git add sales-guide.html
git commit -m "feat: redesign sales guide around foundation pricing"
```

### Task 3: Verify Readability, Responsiveness, and Integrated Behavior

**Files:**
- Modify if defects exist: `sales-guide.html`, `tests/validate-pages.mjs`
- Test: `tests/validate-pages.mjs`

**Interfaces:**
- Consumes: completed graphical guide and previously completed commission calculator.
- Produces: browser evidence for typography floors, no-overlap geometry, bilingual and price-context switching, disclosures, mobile/zoom behavior, client safety, and cross-page navigation.

- [ ] **Step 1: Start the hidden local static server**

Serve the project on `127.0.0.1:4173` with bundled Python. Capture server logs under ignored `.superpowers/verification/` and stop the server at completion.

- [ ] **Step 2: Verify graphical content and interactions at desktop**

At 1440×1000:

- Page loads with no console/page errors or overlays.
- Logo and Aming have non-zero natural dimensions.
- Indonesian loads first and all required sections render.
- Exactly three package cards, 14 comparison rows, 14 add-ons, seven overages, nine payments, and four scope notes exist.
- Year 1 shows 135/225/450; Renewal shows 110/175/350; pressed states update.
- Language switching updates all visible/accessibility strings while preserving selected price context.
- Each disclosure updates `aria-expanded`, reveals its panel, and closes cleanly.
- Calculator CTA navigates successfully to `index.html`, and browser back returns to the guide.

- [ ] **Step 3: Enforce computed typography floors**

Use Playwright to collect every visible element containing non-whitespace text, excluding script/style/noscript and purely decorative hidden content. Categorize by selectors:

```text
.package-price → minimum 42px desktop / 36px mobile
.section-title → minimum 38px desktop / 30px mobile
.overline → minimum 13px
all other visible text → minimum 14px
body paragraphs and long-form disclosure notes → minimum 16px
```

Fail the check with selector, text, and computed size for any violation. At 200% zoom, repeat geometry/overlap checks and confirm text remains readable without clipping.

- [ ] **Step 4: Verify no overlap or clipping at all target sizes**

At 320×568, 360×800, 768×1024, and 1440×1000:

- `document.documentElement.scrollWidth === document.documentElement.clientWidth`.
- No two visible text-bearing sibling elements overlap by more than 1 CSS pixel unless the parent is an explicitly approved decorative overlay.
- Every visible text element’s `scrollWidth <= clientWidth + 1` or has a wrapping height greater than one line; no `overflow:hidden` clips text.
- Package cards and catalogue rows grow vertically.
- Aming’s bounding box does not intersect hero headline, paragraph, or CTA.
- Full comparison wrapper owns horizontal scrolling; the document does not.
- Borders remain visible, evenly aligned, and do not collide with focus outlines.

Capture full-page screenshots at 1440×1000, 360×800, 320×568, and 200% zoom and visually inspect each.

- [ ] **Step 5: Verify client safety and integrated calculator behavior**

- Scan both pages for prohibited internal terms outside the calculator’s BD panel.
- Confirm `sales-guide.html` contains no commission content.
- Confirm calculator Client view is default after reload and BD commission panel remains hidden from visual/accessibility output until toggled.
- Re-run the default quote and one commission boundary case to ensure the two workstreams coexist without runtime errors.
- Confirm zero external HTTP(S) resource requests on both pages.

- [ ] **Step 6: Run final automated checks and commit fixes**

```powershell
& 'C:\Users\haloy\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\tests\validate-pages.mjs'
git diff --check
git status --short
```

Expected: validator passes and only the untouched user workbook/backup remain untracked. Commit verified fixes only if needed.

### Task 4: Merge, Publish, and Verify Vercel

**Files:**
- No source changes unless deployment exposes a reproducible defect.

**Interfaces:**
- Consumes: review-approved feature branch.
- Produces: merged `main`, pushed repository, completed Vercel deployment, and verified public calculator and guide routes.

- [ ] **Step 1: Complete branch review and merge**

Use the subagent-driven final whole-branch review and `superpowers:finishing-a-development-branch`. Merge locally only after the validator and browser checks pass with no open Important findings.

- [ ] **Step 2: Push `main` and monitor Vercel**

Push the reviewed merge to `origin/main`. Use the connected Vercel project or CLI to identify the deployment created from that commit and wait for a Ready state. Do not create a second project or change production aliases.

- [ ] **Step 3: Verify production URLs**

Verify:

```text
https://bd-calc.vercel.app/
https://bd-calc.vercel.app/sales-guide.html
```

Check HTTP 200, deployed commit/version where available, both PNG assets, default Client view, BD toggle behavior, Indonesian-first guide, Year 1/Renewal switch, English switch, disclosures, typography floors, mobile containment, zero external requests, and no runtime errors.
