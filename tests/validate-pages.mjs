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
for (const pattern of forbidden) assert.doesNotMatch(guide, pattern);

const calculatorPresentationForbidden = [
  /floor price/i,
  /bd commission/i,
  /commission is paid/i,
  /cash collected/i,
  /ceo approval/i,
];
for (const pattern of calculatorPresentationForbidden) assert.doesNotMatch(index, pattern);

for (const engineToken of ["var WORKFORCE", "var HIRING", "var TIERS", "var MODULES", "var MAX_DISCOUNT = 0.15", "function build()"] ) {
  assert.ok(index.includes(engineToken), `Calculator engine token changed or missing: ${engineToken}`);
}

for (const broken of [/â€”/, /â€“/, /Ã—/, /âˆ’/, /â€™/, /â€œ/, /â€/]) {
  assert.doesNotMatch(index, broken);
  assert.doesNotMatch(guide, broken);
}

console.log("Page validation passed.");
