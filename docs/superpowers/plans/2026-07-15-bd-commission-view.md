# BD Commission View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reload-safe Client/BD view toggle to the calculator and calculate BD commission from final Year-1 TCV using a headcount-only commission band.

**Architecture:** Keep the current quote engine as the source of truth for final TCV. Add an independent commission-band lookup and a view-state controller inside `index.html`; reveal a dedicated commission panel only in BD view. Extend the existing Node contract test and verify boundary behavior with a real browser.

**Tech Stack:** Semantic HTML5, CSS custom properties, vanilla JavaScript, Node.js standard library assertions, bundled Playwright for browser verification.

## Global Constraints

- Client view is active on every initial load and reload; do not persist BD view in local storage, cookies, URL parameters, or a backend.
- The view toggle is presentation-only and is not authentication.
- Commission equals final Year-1 TCV multiplied by a rate determined only by employee headcount.
- Commission bands are 1–500 at 6%, 501–2,000 at 7%, 2,001–10,000 at 8%, and 10,001+ at 8%.
- Final TCV includes discounts, setup, minimum-contract adjustments, active usage fees, and selected add-ons.
- Headcount 0 produces guidance and no commission amount.
- Hiring volume may change quote tier but must never change the commission band.
- Preserve every existing quote price, pricing formula, discount rule, meter dependency, and empty state.
- The BD panel is hidden visually and from the accessibility tree in Client view.
- Use only local relative assets and no external HTTP resources or framework.
- Maintain 360px containment, readable typography, visible focus, and reduced-motion support.
- Do not modify `sales-guide.html` or the source workbook in this plan.

---

## File Structure

- Modify `index.html`: segmented view control, commission panel, independent commission-band logic, view-state controller, and responsive presentation.
- Modify `tests/validate-pages.mjs`: static contracts for default Client view, independent bands, required panel fields, no persistence, and continued bilingual/client-safety contracts.
- Use ignored `.superpowers/verification/` for temporary Playwright scripts, JSON, logs, and screenshots.

### Task 1: Define the Commission Contract

**Files:**
- Modify: `tests/validate-pages.mjs`
- Test: `tests/validate-pages.mjs`

**Interfaces:**
- Consumes: UTF-8 `index.html` and `sales-guide.html`.
- Produces: source-level guarantees for default Client view, commission bands, independent headcount lookup, panel semantics, no persistence, and unchanged existing safety checks.

- [ ] **Step 1: Add failing source-contract assertions**

Add these checks after the existing calculator engine-token assertions:

```js
assert.match(index, /id="viewClient"[^>]*aria-pressed="true"/);
assert.match(index, /id="viewBd"[^>]*aria-pressed="false"/);
assert.match(index, /id="bdCommissionPanel"[^>]*hidden[^>]*aria-hidden="true"/);
assert.match(index, /id="bdCommissionValue"/);
assert.match(index, /id="bdCommissionRate"/);
assert.match(index, /id="bdCommissionBand"/);
assert.match(index, /id="bdCommissionBasis"/);
assert.match(index, /var COMMISSION_BANDS\s*=\s*\[/);
assert.match(index, /function commissionBandByHeadcount\s*\(/);
assert.match(index, /function setCalculatorView\s*\(/);

for (const token of [
  '{name:"Essential",lo:1,hi:500,rate:0.06}',
  '{name:"Growth",lo:501,hi:2000,rate:0.07}',
  '{name:"Enterprise",lo:2001,hi:10000,rate:0.08}',
  '{name:"Enterprise Scale",lo:10001,hi:INF,rate:0.08}',
]) {
  assert.ok(index.includes(token), `Missing commission band: ${token}`);
}

for (const persistenceApi of [/localStorage/i, /sessionStorage/i, /document\.cookie/i, /URLSearchParams/i]) {
  assert.doesNotMatch(index, persistenceApi, `View state must not persist through ${persistenceApi}`);
}

assert.doesNotMatch(index, /t\.comm|TIERS\[[^\]]+\]\.comm/);
```

Retain every existing translation, local-resource, price, mojibake, and non-commission safety assertion. Update the existing `calculatorPresentationForbidden` list by removing only `/bd commission/i`; the approved internal phrase now exists in the hidden-by-default panel and commission script. Keep the prohibitions for floor-price, cash-collected, commission-payment, and CEO-approval language. The new default-hidden markup assertions plus Task 3 browser accessibility checks become the regression boundary that prevents accidental Client-view exposure.

- [ ] **Step 2: Run the contract test to confirm RED**

Run:

```powershell
& 'C:\Users\haloy\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\tests\validate-pages.mjs'
```

Expected: FAIL on the missing `viewClient` markup.

- [ ] **Step 3: Commit the failing contract**

```powershell
git add tests/validate-pages.mjs
git commit -m "test: define BD commission view contract"
```

### Task 2: Implement the Client/BD View and Commission Engine

**Files:**
- Modify: `index.html`
- Test: `tests/validate-pages.mjs`

**Interfaces:**
- Consumes: final `tcv`, current quote-tier name `t.name`, employee input `emp`, and the existing build-cycle events.
- Produces: `commissionBandByHeadcount(headcount) -> {name, lo, hi, rate} | null`, `setCalculatorView(view)`, and live DOM values in `bdCommissionValue`, `bdCommissionRate`, `bdCommissionBand`, and `bdCommissionBasis`.

- [ ] **Step 1: Add the accessible view selector**

Insert in the calculator header, after the badge:

```html
<div class="view-switch" role="group" aria-label="Calculator presentation">
  <button type="button" id="viewClient" class="view-option is-active" aria-pressed="true">Client view</button>
  <button type="button" id="viewBd" class="view-option" aria-pressed="false">BD view</button>
</div>
```

The control remains visible in both views so a BD user can switch back immediately.

- [ ] **Step 2: Add the hidden-by-default commission panel**

Insert beneath `.kpis` and before the price-construction heading:

```html
<section id="bdCommissionPanel" class="commission-panel" hidden aria-hidden="true" aria-labelledby="bdCommissionTitle">
  <div class="commission-intro">
    <span class="commission-kicker">Internal · Sales division</span>
    <h2 id="bdCommissionTitle">Estimated BD commission</h2>
    <p id="bdCommissionMessage">Based on final Year-1 TCV and the committed employee headcount.</p>
  </div>
  <div class="commission-amount">
    <span>Estimated amount</span>
    <strong id="bdCommissionValue">—</strong>
  </div>
  <dl class="commission-facts">
    <div><dt>Rate</dt><dd id="bdCommissionRate">—</dd></div>
    <div><dt>Headcount band</dt><dd id="bdCommissionBand">—</dd></div>
    <div><dt>Final Y1 TCV basis</dt><dd id="bdCommissionBasis">—</dd></div>
  </dl>
  <p class="commission-note">The rate follows headcount only. Discounts lower both final TCV and commission.</p>
  <button type="button" id="returnClientView" class="commission-close">Switch to Client view</button>
</section>
```

Keep the existing hidden `kFloor` target if the unchanged pricing build uses it. Remove the obsolete hidden `kComm` target only after removing its old update call.

- [ ] **Step 3: Add independent commission data and lookup**

Remove `comm` properties from `TIERS` and add immediately after `TIERS`:

```js
var COMMISSION_BANDS = [
  {name:"Essential",lo:1,hi:500,rate:0.06},
  {name:"Growth",lo:501,hi:2000,rate:0.07},
  {name:"Enterprise",lo:2001,hi:10000,rate:0.08},
  {name:"Enterprise Scale",lo:10001,hi:INF,rate:0.08}
];

function commissionBandByHeadcount(headcount){
  if(headcount < 1) return null;
  for(var i=0;i<COMMISSION_BANDS.length;i++){
    var band = COMMISSION_BANDS[i];
    if(headcount >= band.lo && headcount <= band.hi) return band;
  }
  return null;
}
```

Do not call `tierIndexBy` for commission lookup.

- [ ] **Step 4: Add non-persistent view state**

Add inside the IIFE:

```js
var calculatorView = "client";

function setCalculatorView(view){
  calculatorView = view === "bd" ? "bd" : "client";
  var isBd = calculatorView === "bd";
  $("viewClient").classList.toggle("is-active", !isBd);
  $("viewBd").classList.toggle("is-active", isBd);
  $("viewClient").setAttribute("aria-pressed", String(!isBd));
  $("viewBd").setAttribute("aria-pressed", String(isBd));
  $("bdCommissionPanel").hidden = !isBd;
  $("bdCommissionPanel").setAttribute("aria-hidden", String(!isBd));
}
```

Bind `viewClient` and `returnClientView` to `setCalculatorView("client")`; bind `viewBd` to `setCalculatorView("bd")`. Call `setCalculatorView("client")` during initialization after all DOM references exist. Do not read or write persistence APIs.

- [ ] **Step 5: Render commission from final TCV**

Replace the old quote-tier commission calculation and hidden `kComm` update with:

```js
var commissionBand = commissionBandByHeadcount(emp);
var commission = commissionBand ? tcv * commissionBand.rate : null;

if(commissionBand){
  $("bdCommissionValue").textContent = jt(commission);
  $("bdCommissionRate").textContent = Math.round(commissionBand.rate * 100) + "%";
  $("bdCommissionBand").textContent = commissionBand.name + " · " + n0(commissionBand.lo) + (commissionBand.hi === INF ? "+ employees" : "–" + n0(commissionBand.hi) + " employees");
  $("bdCommissionBasis").textContent = jt(tcv);
  $("bdCommissionMessage").textContent = "Quote tier: " + t.name + " · Commission band: " + commissionBand.name;
}else{
  $("bdCommissionValue").textContent = "—";
  $("bdCommissionRate").textContent = "—";
  $("bdCommissionBand").textContent = "Headcount required";
  $("bdCommissionBasis").textContent = jt(tcv);
  $("bdCommissionMessage").textContent = "Enter the committed headcount to calculate commission.";
}
```

This uses the existing post-discount `tcv`, so setup and add-ons are included automatically.

- [ ] **Step 6: Style for clarity and responsive containment**

Add CSS using the existing tokens:

```css
.view-switch{display:inline-flex;gap:4px;padding:4px;background:#eef0f8;border:1px solid var(--line);border-radius:999px}
.view-option{border:0;background:transparent;color:var(--muted);font:800 13px/1 'Plus Jakarta Sans','Segoe UI',sans-serif;padding:10px 13px;border-radius:999px;cursor:pointer}
.view-option.is-active{background:var(--indigo);color:#fff;box-shadow:0 6px 16px rgba(26,31,113,.18)}
.commission-panel{margin:0 0 28px;padding:24px;border:1px solid #d8dcef;border-left:6px solid var(--magenta);border-radius:18px;background:#fff8fc;display:grid;grid-template-columns:minmax(0,1.2fr) minmax(180px,.8fr);gap:18px}
.commission-panel[hidden]{display:none}
.commission-kicker{font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--magenta)}
.commission-amount{background:var(--indigo);color:#fff;border-radius:15px;padding:18px}
.commission-amount span{display:block;font-size:13px;color:#bec3e8}.commission-amount strong{display:block;margin-top:6px;font-size:31px}
.commission-facts{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0}
.commission-facts div{background:#fff;border:1px solid var(--line);border-radius:12px;padding:13px}.commission-facts dt{font-size:13px;color:var(--muted)}.commission-facts dd{margin:5px 0 0;font-size:15px;font-weight:800}
.commission-note{grid-column:1/-1;margin:0;color:var(--muted);font-size:14px;line-height:1.5}.commission-close{justify-self:start;border:0;background:none;color:var(--magenta);font:800 14px/1.2 inherit;cursor:pointer;padding:5px 0}
@media(max-width:600px){.view-switch{width:100%}.view-option{flex:1}.commission-panel{grid-template-columns:minmax(0,1fr);padding:18px}.commission-facts{grid-template-columns:1fr}.commission-amount,.commission-facts,.commission-note{grid-column:1}}
```

Allow text wrapping; do not use fixed heights.

- [ ] **Step 7: Run the source contract to confirm GREEN**

```powershell
& 'C:\Users\haloy\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\tests\validate-pages.mjs'
git diff --check
```

Expected: `Page validation passed.` and no diff-check errors.

- [ ] **Step 8: Commit the feature**

```powershell
git add index.html
git commit -m "feat: add headcount-based BD commission view"
```

### Task 3: Verify Commission Logic and Presentation in Browser

**Files:**
- Modify if a verified defect exists: `index.html`, `tests/validate-pages.mjs`
- Test: `tests/validate-pages.mjs`

**Interfaces:**
- Consumes: completed calculator feature.
- Produces: browser evidence for rate boundaries, independent tier selection, final-TCV basis, view reset, accessibility, and responsive layout.

- [ ] **Step 1: Start a hidden local server**

```powershell
& 'C:\Users\haloy\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m http.server 4173 --bind 127.0.0.1
```

Use a hidden background process and stop it after verification.

- [ ] **Step 2: Verify default and toggle behavior**

At `http://127.0.0.1:4173/index.html`, prove:

- Client view is pressed after first load and reload.
- BD panel is `hidden`, `aria-hidden="true"`, absent from the accessibility tree, and has no layout box in Client view.
- BD view reveals the panel, sets correct pressed states, and makes the panel accessible.
- The panel’s return action restores Client view without moving focus unexpectedly.
- No storage, cookie, or URL state is created.

- [ ] **Step 3: Verify exact boundary rates**

For headcounts `0, 1, 500, 501, 2000, 2001, 10000, 10001`, set annual hires to 1, keep both meters active, no add-ons, and 0% discount. Assert displayed rates:

```text
0 → no amount, Headcount required
1 → 6%
500 → 6%
501 → 7%
2,000 → 7%
2,001 → 8%
10,000 → 8%
10,001 → 8%
```

For every nonzero case, independently calculate `displayed final TCV × rate` and compare to the displayed commission within the calculator’s Rp-juta rounding precision.

- [ ] **Step 4: Verify independent tier logic and TCV drivers**

Prove:

- Headcount 100 with 1,000 hires yields a higher hiring-driven quote tier but an Essential 6% commission band.
- At the default 1,200 employees and 300 hires, final TCV is Rp283.4jt and commission is Rp19.8jt at 7%.
- Moving discount from 0% to 15% lowers final TCV and commission.
- Selecting Payroll & Attendance increases final TCV and commission.
- ATS-only with a nonzero headcount still selects the headcount-based commission band.
- Both meters off preserves the empty quote state with no visible commission result.

- [ ] **Step 5: Verify accessibility and mobile layout**

At 360×800:

- Document scroll width equals viewport width.
- Toggle labels remain at least 13px and panel body text at least 14px.
- No label, amount, border, or focus ring overlaps.
- Commission facts stack and remain readable.
- Client view hides the panel from the accessibility tree.
- Capture and inspect both Client and BD screenshots.

- [ ] **Step 6: Run final automated checks**

```powershell
& 'C:\Users\haloy\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\tests\validate-pages.mjs'
git diff --check
git status --short
```

Expected: validator passes, no diff errors, and only intended files are committed. Commit verified fixes only if needed.
