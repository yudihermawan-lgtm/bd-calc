# Graphical Sales Guide Redesign — Design Specification

Date: 2026-07-15

## Objective

Redesign `sales-guide.html` into a faster, more graphical reference for Business Development users. The approved direction combines the pricing-first clarity of visual concept B with the warm Aming-led tone of concept A.

The page must help a BD user confirm foundation pricing within seconds, remain suitable for client presentation, and retain access to all approved client-safe workbook content without presenting it as long blocks of text.

## Relationship to the Commission Feature

This is a separate workstream from the approved BD commission view in `index.html`.

- `sales-guide.html` remains fully client-safe and contains no commission information.
- `index.html` gains the session-only Client/BD view toggle defined in `2026-07-15-bd-commission-view-design.md`.
- Both workstreams share the existing Jobseeker visual language, responsive standards, local assets, and regression suite.

## Approved Visual Direction

Use a pricing-first page structure with warm editorial personality:

- Jobseeker navy and magenta remain the dominant brand colors.
- A warm cream page background and restrained pink highlights keep the tone approachable.
- Aming appears prominently in the hero as a friendly guide, without being repeated as decoration throughout the page.
- Foundation prices are the primary visual hierarchy immediately below the hero.
- Graphical indicators, icons, short labels, chips, and progressive disclosure replace explanatory paragraphs.
- Preserve the current polished depth, hover feedback, scroll reveals, and subtle texture.
- Avoid glassmorphism, generic gradients, dense spreadsheet presentation, and card overload.

## Page Structure

### 1. Compact Branded Navigation

- Jobseeker logo.
- Short anchors for Packages, Compare, and Add-ons.
- Indonesian/English language switch.
- Primary button to the calculator.
- On mobile, keep the logo, language control, and calculator action visible without crowding or overlap.

### 2. Warm Hero

- Short Indonesian headline equivalent to `Tiga paket. Satu pilihan yang tepat.`
- One concise supporting sentence.
- One action leading directly to package pricing.
- Aming positioned asymmetrically with decorative shapes that do not obstruct text.
- The hero must fit comfortably on a 360px viewport without tiny text or clipped artwork.

### 3. Foundation Pricing — Primary Section

Display exactly three package cards:

- Essential: Rp135 juta Year 1; Rp110 juta renewal.
- Growth: Rp225 juta Year 1; Rp175 juta renewal.
- Enterprise: Rp450 juta Year 1; Rp350 juta renewal.

Each card shows:

- Package name.
- Large price.
- Year-1 or renewal context.
- Short best-fit description.
- A simple graphical scale indicator.
- A concise action to view the package summary.

Provide an accessible Year 1/Renewal control that changes the displayed price context without reloading. Growth may receive a visually prominent `Most popular / Paling populer` treatment, but the label must not imply that it is always the correct recommendation.

### 4. Graphical Feature Comparison

Show five high-value comparison categories as icon-led summaries:

- Admin capacity.
- AI screening.
- Workflow automation.
- Support level.
- Integration capability.

Provide a clear `See all differences / Lihat semua perbedaan` action that reveals the complete 14-row tier comparison. The full comparison remains accessible, readable, and horizontally contained on mobile.

### 5. Visual Add-ons and Overage Catalogue

- Show product modules, automation/analytics, services/integrations, and usage overages as compact labelled groups.
- Use chips or concise rows for initial scanning.
- Prices remain visible without requiring hover.
- Longer explanatory notes appear through an accessible disclosure, not permanently expanded prose.
- Preserve all 14 add-ons and seven overage items from the approved client-safe guide.

### 6. Payment and Scope Guidance

- Replace the current large text area with a compact visual grid of payment options and surcharges.
- Use short labels for annual, quarterly, monthly, Net-30, Net-60, card/MDR, financing, PPh 23, and setup/implementation.
- Preserve all nine payment terms and four positive scope notes.
- Additional explanation appears only when expanded.

### 7. Calculator CTA

End with one high-contrast call to action:

- Short statement for users who already know the client’s usage.
- Button to open `index.html`.
- Clearly describe the calculator as a separate usage-based quoting tool.

## Content Strategy

- Indonesian remains the default on every reload.
- English switching updates every visible label, price context, disclosure, accessible name, and alternative text.
- Use short natural sales language rather than literal translation.
- Keep all approved client-safe content from the workbook available, but prioritize progressive disclosure so the initial page is concise.
- Do not expose margins, profit, acquisition cost, internal implementation cost, commission pools, approval rules, internal verdicts, or BD commission.
- Do not change the package prices or introduce recommendation logic not present in the workbook.

## Readability and Typography

No essential information may rely on very small type.

- Default body text: at least 16px on desktop and mobile.
- Navigation, buttons, chips, captions, table cells, and supporting labels: at least 14px.
- Decorative overlines or nonessential section indices: at least 13px.
- Package prices: at least 36px on mobile and 42px on desktop.
- Major section headings: at least 30px on mobile and 38px on desktop.
- Line height: at least 1.4 for body and supporting copy.
- Text contrast must meet WCAG AA for its displayed size.
- Do not reduce font size to force content into a fixed-height card. Allow wrapping, card growth, or stacking instead.
- Validate the layout at 200% browser zoom as well as normal zoom.

## Layout and Border Quality

- Use consistent border radii and subtle border colors across cards, chips, disclosures, and tables.
- Borders define hierarchy and interaction, not every individual cell.
- Selected or featured states use the magenta accent with sufficient contrast.
- Every grid child that can contain long text must allow shrinking with `min-width: 0`.
- Labels and prices wrap or stack before they overlap.
- No fixed height may clip translated content.
- Horizontal scrolling is allowed only inside the full comparison table, never at page level.

## Motion and Interaction

- Preserve a coordinated hero entrance and restrained scroll reveals.
- Use hover and focus feedback on package cards, disclosures, toggles, and CTAs.
- Avoid continuous or distracting animation.
- Honor `prefers-reduced-motion` by removing nonessential transitions and reveals.
- Language, Year 1/Renewal, and disclosure controls must be native buttons or equivalent accessible controls.

## Technical Boundaries

- Keep the implementation as static semantic HTML, CSS, and vanilla JavaScript.
- Use only relative local assets; no external HTTP resources, third-party fonts, frameworks, or runtime dependencies.
- Reuse `jobseeker-logo_transparent.png` and `aming-official-transparent.png`.
- Preserve the existing public URL path `/sales-guide.html`.
- Do not change `index.html` pricing behavior as part of this redesign.
- Extend the existing source validator rather than replacing it.

## Responsive and Accessibility Verification

Verify at minimum:

- 320×568, 360×800, 768×1024, and 1440×1000 viewports.
- 200% browser zoom on a desktop viewport.
- No overlapping text, clipped prices, clipped translated labels, or page-level horizontal overflow.
- All visible text meets the defined minimum computed font sizes.
- Package cards stack cleanly on mobile.
- Aming never covers hero copy or actions.
- Full comparison scrolling is confined to its labelled wrapper.
- Focus order is logical and every interactive element has a visible focus state.
- Disclosures expose correct expanded state to assistive technology.
- Indonesian loads initially; English switching is complete; reload restores Indonesian.
- Year 1/Renewal switching updates all three package prices and accessible state.
- Both images load at non-zero natural dimensions.
- No console errors, error overlays, mojibake, external network requests, or sensitive terms appear.

## Deployment

- Merge the verified work into `main`.
- Push to the connected repository so the existing Vercel project redeploys.
- Verify `https://bd-calc.vercel.app/sales-guide.html` after deployment, including the graphical layout, readable typography, bilingual behavior, and asset loading.

## Out of Scope

- Changing package prices.
- Adding new pricing tiers.
- Creating an automated package recommendation engine.
- Adding authentication or user accounts.
- Editing the source workbook.
- Moving commission information into the sales guide.
