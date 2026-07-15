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
  assert.doesNotMatch(index, pattern);
}

const calculatorPresentationForbidden = [
  /floor price/i,
  /commission is paid/i,
  /cash collected/i,
  /ceo approval/i,
];
for (const pattern of calculatorPresentationForbidden) assert.doesNotMatch(index, pattern);

for (const engineToken of ["var WORKFORCE", "var HIRING", "var TIERS", "var MODULES", "var MAX_DISCOUNT = 0.15", "function build()"] ) {
  assert.ok(index.includes(engineToken), `Calculator engine token changed or missing: ${engineToken}`);
}

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

for (const broken of [/â€”/, /â€“/, /Ã—/, /âˆ’/, /â€™/, /â€œ/, /â€/]) {
  assert.doesNotMatch(index, broken);
  assert.doesNotMatch(guide, broken);
}

console.log("Page validation passed.");
