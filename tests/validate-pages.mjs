import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testsDir, "..");
const read = (name) => fs.readFile(path.join(root, name), "utf8");

const index = await read("index.html");
const guide = await read("sales-guide.html");

assert.match(index, /Employee commitments keep the quote aligned with the client(?:'|’|&rsquo;)s expected workforce usage\./);
assert.match(index, /Annual hiring commitments keep the quote aligned with the client(?:'|’|&rsquo;)s expected recruitment usage\./);
assert.doesNotMatch(index, /No unlimited usage|We count the real one ourselves/i);

for (const [name, html] of [["index.html", index], ["sales-guide.html", guide]]) {
  assert.doesNotMatch(html, /https?:\/\//i, `${name} must not request external HTTP(S) resources`);
}

const usedTranslationKeys = new Set(
  [...guide.matchAll(/\bdata-i18n(?:-alt|-aria)?=(["'])(.*?)\1/g)].map((match) => match[2]),
);
const translationsStart = guide.indexOf("const translations =") + "const translations =".length;
const translationsEnd = guide.indexOf("const DEFAULT_LANGUAGE", translationsStart);
assert.ok(translationsStart >= "const translations =".length && translationsEnd > translationsStart, "Translations object not found");
const translationsSource = guide.slice(translationsStart, translationsEnd).trim().replace(/;$/, "");
const translationContext = vm.createContext(Object.create(null), { codeGeneration: { strings: false, wasm: false } });
const translations = vm.runInContext(`(${translationsSource})`, translationContext, { timeout: 1000 });

for (const language of ["id", "en"]) {
  assert.ok(translations[language] && typeof translations[language] === "object", `Missing ${language} dictionary`);
  const dictionaryKeys = new Set(Object.keys(translations[language]));
  for (const key of usedTranslationKeys) {
    assert.equal(typeof translations[language][key], "string", `Missing or non-string ${language} translation: ${key}`);
  }
  assert.deepEqual(
    [...dictionaryKeys].sort(),
    [...usedTranslationKeys].sort(),
    `${language} dictionary must contain every used key and no unused keys`,
  );
}

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

for (const id of ["packages", "compare", "addons", "guideCta"]) {
  assert.match(guide, new RegExp(`id=["']${id}["']`), `Missing graphical guide section: ${id}`);
}

for (const id of ["priceYear1", "priceRenewal"]) {
  assert.match(guide, new RegExp(`id=["']${id}["']`), `Missing price-context control: ${id}`);
}

assert.match(guide, /id="priceYear1"[^>]*aria-pressed="true"/);
assert.match(guide, /id="priceRenewal"[^>]*aria-pressed="false"/);
assert.match(guide, /function setPriceContext\s*\(/);
assert.match(guide, /data-year1="Rp135 juta"[^>]*data-renewal="Rp110 juta"/);
assert.match(guide, /data-year1="Rp265 juta"[^>]*data-renewal="Rp215 juta"/, "Growth Y1/renewal reflects the platform fee raised to fund free Payroll+Attendance bundling with HRIS");
assert.match(guide, /data-year1="Rp490 juta"[^>]*data-renewal="Rp390 juta"/, "Enterprise Y1/renewal reflects the platform fee raised to fund free Payroll+Attendance bundling with HRIS");

assert.match(guide, /--font-body:\s*16px/);
assert.match(guide, /--font-support:\s*14px/);
assert.match(guide, /--font-overline:\s*13px/);
assert.match(guide, /--font-price-mobile:\s*36px/);
assert.match(guide, /--font-price-desktop:\s*42px/);
assert.match(guide, /--font-heading-mobile:\s*30px/);
assert.match(guide, /--font-heading-desktop:\s*38px/);
assert.match(guide, /\.section-title\{[^}]*font-size:var\(--font-heading-desktop\)/, "Desktop section titles must use the 38px floor token");
assert.match(guide, /\.package-price\{[^}]*font-size:var\(--font-price-desktop\)/, "Desktop package prices must use the 42px floor token");
assert.match(guide, /\.section-title\{font-size:clamp\(var\(--font-heading-mobile\),[^}]*var\(--font-heading-desktop\)\)/, "Mobile section titles must retain fluid floor-safe sizing");
assert.match(guide, /\.package-price\{font-size:clamp\(var\(--font-price-mobile\),[^}]*var\(--font-price-desktop\)\)/, "Mobile package prices must retain fluid floor-safe sizing");
assert.match(guide, /<link\s+rel="icon"\s+href="data:image\/svg\+xml,[^"]+">/, "Guide must declare a self-contained favicon");
assert.match(index, /<link\s+rel="icon"\s+href="data:image\/svg\+xml,[^"]+">/, "Calculator must declare a self-contained favicon");

assert.equal((guide.match(/class="comparison-row"/g) || []).length, 7, "Comparison table now 7 rows — added Integration (included on every tier) as its own row instead of a footnote mention");
assert.equal((guide.match(/class="addon-item"/g) || []).length, 13, "WhatsApp automation and AI screening automation removed — neither has launched yet");
assert.doesNotMatch(guide, /class="overage-item"|class="overage"/, "Usage-above-quota section removed — overage specifics live in the calculator, not the static guide");
assert.doesNotMatch(guide, /class="payment-item"|class="scope-note"|id=["']payments["']/, "Payment terms section removed — now handled directly by BD Sales, not documented in the guide");

// Comparison table is short enough (7 rows) to show directly — no disclosure/toggle needed.
assert.doesNotMatch(guide, /id=["']comparisonDetails["']/, "Comparison table must not be hidden behind a disclosure again");
assert.match(guide, /id=["']addonDetails["']/);

for (const price of ["Rp110 juta", "Rp25 juta", "Rp135 juta", "Rp215 juta", "Rp50 juta", "Rp265 juta", "Rp390 juta", "Rp100 juta", "Rp490 juta"]) {
  assert.ok(guide.includes(price), `Missing tier price: ${price}`);
}

for (const required of ["Essential", "Growth", "Enterprise", "ATS", "HRIS", "PMS", "LMS"]) {
  assert.ok(guide.includes(required), `Missing workbook topic: ${required}`);
}

// Reimbursement reappears as of 2026-08-20 as a line item inside the new Payroll feature card
// (payslip/allowance/reimbursement/taxes/business trip) — an explicit, deliberate reversal of the
// 2026-08-19 removal of the standalone Reimbursement card, not a regression.
assert.match(guide, /"feat\.payroll":"Payroll","feat\.payroll\.desc":"[^"]*[Rr]eimbursement[^"]*"/);
assert.match(guide, /"feat\.attendance":"Kehadiran","feat\.attendance\.desc":"[^"]*shift[^"]*"/i);
const hrisCardOrder = guide.match(/id="hrisFeatures"[^>]*>(.*?)<\/div><\/div>/s)?.[1] ?? "";
assert.deepEqual(
  [...hrisCardOrder.matchAll(/data-i18n="(feat\.\w+)"/g)].map((m) => m[1]),
  ["feat.hrisSetting", "feat.ess", "feat.payroll", "feat.attendance", "feat.hrisReports"],
  "HRIS feature card order must be Setting, ESS, Payroll, Attendance, then Reports last",
);
assert.doesNotMatch(index, /adminsCap|scAdmins|<dt>Admin users<\/dt>/, "Admin users are unlimited — cap removed from the scope box and pricing engine");
assert.doesNotMatch(index, /scCandidates|<dt>Candidate processing<\/dt>|candidates:"/, "Candidate processing removed from the scope box — read-only stat, didn't drive pricing, cut for less UI friction");
assert.match(index, /support:"WhatsApp, working hours"/, "Essential tier now includes WhatsApp support");
assert.match(index, /<dt>ATS<\/dt><dd id="scAts">/, "Scope box must show ATS inclusion status alongside HRIS — product selection can deselect either independently");
assert.match(index, /\$\("scAts"\)\.textContent\s*=\s*ats \? "Included" : "Not selected"/);
assert.equal((index.match(/<div><dt>[^<]+<\/dt><dd id="sc\w+">/g) || []).length, 4, "Scope box item count changed — check .scope-grid's grid-template-columns still matches");
assert.match(index, /\.scope-grid\{[^}]*grid-template-columns:repeat\(4,/, "Scope box column count must match its 4 items");

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
  assert.doesNotMatch(index, pattern);
}

const calculatorPresentationForbidden = [
  /floor price/i,
  /commission is paid/i,
  /cash collected/i,
  /ceo approval/i,
];
for (const pattern of calculatorPresentationForbidden) assert.doesNotMatch(index, pattern);

for (const engineToken of ["var TIERS", "var MODULES", "var MAX_DISCOUNT = 0.15", "var VERY_HIGH_EMP", "function build()"] ) {
  assert.ok(index.includes(engineToken), `Calculator engine token changed or missing: ${engineToken}`);
}
// Flat-tier engine (approved V6 book): no per-employee/per-hire marginal meters.
for (const removedToken of ["var WORKFORCE", "var HIRING", "function slices("]) {
  assert.ok(!index.includes(removedToken), `Calculator engine must not reintroduce marginal usage meter: ${removedToken}`);
}
// No dead-end "Custom quote" tier — every input resolves to Essential/Growth/Enterprise.
assert.doesNotMatch(index, /needs a custom quote/i, "Calculator must not reintroduce the dead-end Custom tier");
// Very-high-headcount deals stay labeled plain "Enterprise" — no separate tier name;
// the provisional note is the only signal that the price is extrapolated.
assert.doesNotMatch(index, /Enterprise\+/, "Very-high tier must not reintroduce a distinct \"Enterprise+\" name");

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

// Commission bands now mirror the three approved tiers 1:1 (no separate "Enterprise Scale" split).
for (const [name, lo, hi, rate] of [
  ["Essential", "1", "500", "0.06"],
  ["Growth", "501", "2000", "0.07"],
  ["Enterprise", "2001", "INF", "0.08"],
]) {
  const pattern = new RegExp(`\\{name:"${name}",\\s*lo:${lo},\\s*hi:${hi},\\s*rate:${rate}\\}`);
  assert.match(index, pattern, `Missing commission band: ${name}`);
}
assert.doesNotMatch(index, /Enterprise Scale/, "Calculator must not reintroduce the unapproved fourth tier");

for (const persistenceApi of [/localStorage/i, /sessionStorage/i, /document\.cookie/i, /URLSearchParams/i]) {
  assert.doesNotMatch(index, persistenceApi, `View state must not persist through ${persistenceApi}`);
}

assert.doesNotMatch(index, /t\.comm|TIERS\[[^\]]+\]\.comm/);

for (const broken of [/â€”/, /â€“/, /Ã—/, /âˆ’/, /â€™/, /â€œ/, /â€/]) {
  assert.doesNotMatch(index, broken);
  assert.doesNotMatch(guide, broken);
}

console.log("Page validation passed.");
