# Jobseeker Client-Safe Sales Guide — Design Specification

Date: 2026-07-14

## Objective

Create a clean, bilingual sales-reference landing page from all six worksheets in `jobseeker_v6_pricing_components.xlsx`. The page must be easy and enjoyable to use, default to Indonesian, show only client-safe information, and link clearly to the existing usage-based calculator without changing its pricing logic.

This is version 1. A later version 2 may realign the calculator with the workbook so Marketing can compare the two approaches.

## Audience and Use

The primary users are Jobseeker sales and marketing team members presenting product packages to prospects. The page may be shown directly to clients, so it must not expose internal economics, margin commentary, commission pools, approval thresholds, or other sensitive commercial reasoning.

## Architecture

- Add a standalone `sales-guide.html` in the same directory as `index.html`.
- Preserve the existing calculator engine and its current pricing model.
- Add a branded navigation bar to both pages.
- Link `index.html` to `sales-guide.html` with a “Panduan Produk / Product Guide” button.
- Link `sales-guide.html` back to `index.html` with a “Buka Kalkulator / Open Calculator” button.
- Use relative asset paths so both pages work when opened locally or hosted as static files.
- Keep the implementation dependency-free: semantic HTML, CSS, and vanilla JavaScript.

## Content Model

The sales guide must synthesize client-safe material from every workbook sheet:

### Pricing Summary and Executive Summary

- Essential: Rp110 juta platform fee, Rp25 juta setup, Rp135 juta Year 1, Rp110 juta renewal.
- Growth: Rp175 juta platform fee, Rp50 juta setup, Rp225 juta Year 1, Rp175 juta renewal.
- Enterprise: Rp350 juta platform fee, Rp100 juta setup, Rp450 juta Year 1, Rp350 juta renewal.
- Explain that Year 1 combines platform and implementation; renewal removes setup unless new implementation scope is added.

Do not display margins, profit, commercial verdicts, or minimum approval language.

### Tier Scope

Show a scannable feature comparison covering ATS, HRIS scope, careersite, dashboard, AI screening quota, WhatsApp/email workflow, admin users, branches, candidate-processing quota, configuration mandays, support, review cadence, integrations, and on-premise availability.

### Add-ons and Overage

Show every client-quotable add-on and overage price. Group them into product modules, automation and analytics, services and integrations, and usage overages. Clarify “starting from” and usage-based pricing where applicable.

### Payment and Commercial Terms

Show client-facing terms only:

- Annual upfront is preferred with no cash discount.
- Quarterly payment adds 5% to the platform fee.
- Monthly payment adds 12% and is available only for Essential and Growth.
- Net-30 adds 1%; Net-60 adds 2%.
- Client bears credit-card MDR.
- Third-party financing is grossed up so Jobseeker receives the agreed net amount.
- PPh 23 invoices are grossed up by dividing by 0.98.

Translate internal guardrails into positive scope guidance: setup is part of Year 1, custom dashboards and integrations are separate projects, usage beyond quota is billed as overage, and dedicated service levels require the appropriate tier or add-on.

### Cost Components

Use this sheet only to verify that public tier pricing is complete. Do not expose cost lines, margins, profit, acquisition costs, internal implementation costs, support costs, or commission pools.

## Language Behavior

- Indonesian is the default on every first visit and reload.
- A visible `ID / EN` toggle switches all user-facing text without reloading.
- Pricing, proper product names, and abbreviations remain consistent across languages.
- Indonesian copy should be natural sales language, not literal word-for-word translation.
- The language control must be keyboard accessible and expose its state to assistive technology.

## Visual Direction

Use a polished, playful “sales companion” aesthetic:

- Jobseeker navy is the dominant color; magenta is the energetic accent.
- Warm off-white backgrounds and subtle geometric textures keep the page friendly and legible.
- Use the provided transparent Jobseeker logo in the header.
- Use Aming as a helpful guide in the hero and selected advice callouts, not as repeated decoration.
- Pair a characterful display face with a highly readable body face, with robust fallbacks.
- Use restrained entrance motion and interactive hover/focus states, with reduced-motion support.
- Avoid glassmorphism, generic purple gradients, dense spreadsheet-style presentation, and decorative card overload.

The memorable element is Aming guiding users through a clear “choose, compare, quote” sales journey.

## Page Structure

1. Sticky branded navigation with language toggle and calculator link.
2. Hero with Jobseeker positioning, Aming, and primary actions.
3. Three-step explanation: choose a tier, adjust scope, build the quote.
4. Tier pricing overview with Year-1 and renewal values.
5. Detailed tier comparison with mobile-friendly stacked rendering.
6. Add-ons and overage catalogue grouped for quick scanning.
7. Payment options and client-safe scope notes.
8. Final CTA to open the existing calculator.
9. Compact footer identifying the guide as Jobseeker product pricing reference.

## Calculator Cleanup

Changes to `index.html` are limited to presentation and navigation:

- Add the Jobseeker logo and matching navigation.
- Add a prominent link to the product guide.
- Add a compact Aming encouragement panel where it supports the workflow.
- Repair broken character encoding in visible copy.
- Improve responsive spacing, hierarchy, focus states, and small-screen table behavior.
- Preserve all calculator constants, formulas, tier selection, discounts, module logic, and outputs.

## Data Boundaries

The workbook and calculator intentionally represent different pricing models in version 1. The UI must not imply that their tier prices are calculated from one another.

- The product guide presents the workbook’s fixed three-tier packages.
- The calculator continues presenting its existing usage-based quote.
- Navigation copy identifies them as separate tools.
- No workbook-derived pricing values are inserted into the calculator engine.

## Error and Edge Handling

- If JavaScript is unavailable, Indonesian content remains readable and navigation still works; only language switching is unavailable.
- Images include useful alternative text and must not block layout if they fail to load.
- Wide comparison content remains usable on narrow screens without clipping.
- External font failure must fall back cleanly without layout breakage.
- All buttons and toggles have visible keyboard focus states.

## Verification

- Confirm all six worksheet topics are represented or explicitly excluded for client safety.
- Confirm no sensitive cost, profit, margin, commission, approval, or internal verdict content appears in rendered HTML or source copy.
- Confirm Indonesian is the initial language and every visible content section switches to English.
- Confirm both navigation directions work with local relative URLs.
- Confirm calculator outputs match the pre-change page for representative Essential, Growth, Enterprise, and Enterprise Scale inputs.
- Check desktop and mobile layouts in a browser.
- Check keyboard navigation, visible focus, image alternative text, and reduced-motion behavior.
- Scan the final files for mojibake and broken asset references.

## Out of Scope

- Changing calculator pricing logic.
- Adding authentication or hiding the client-safe page behind a login.
- Exposing sensitive internal workbook data.
- Editing the workbook.
- Building version 2 of the pricing calculator in this implementation.
