# BD Commission View — Design Specification

Date: 2026-07-15

## Objective

Add an easy Client/BD presentation toggle to the existing pricing calculator. The calculator must open in Client view on every page load. BD view reveals an estimated commission calculated from final Year-1 TCV using a rate determined only by employee headcount.

The feature supports internal sales work while reducing the risk of accidentally displaying commission information during a client presentation.

## Audience and Safety Boundary

- Client view is the default and contains no commission information.
- BD view is intended for Jobseeker Business Development team members under Sales.
- The selected view is session-only page state and is not saved to local storage, cookies, URL parameters, or a backend.
- Reloading, reopening, or sharing the calculator URL always returns to Client view.
- The toggle is a presentation safeguard, not authentication. Anyone with access to the public calculator can activate BD view.

## User Interface

Add a compact segmented control to the calculator header:

- `Client view` is selected initially.
- `BD view` reveals the internal commission panel.
- The active option is visually clear and exposed through `aria-pressed` or equivalent native accessible state.
- The control is keyboard accessible and retains the calculator’s existing strong focus treatment.

Place the BD commission panel beneath the primary quote KPIs and above the price-construction table. The panel shows:

- Estimated BD commission amount.
- Applied percentage rate.
- Headcount band and commission tier name.
- Final Year-1 TCV used as the commission basis.
- A short explanation that the rate is determined by headcount and discounts reduce the commission amount.
- A clear action to return to Client view.

When Client view is active, the panel must be hidden visually and from the accessibility tree. No commission labels or amounts appear in the client presentation.

## Commission Rules

Commission is calculated as:

```text
BD commission = final Year-1 TCV × headcount commission rate
```

The commission rate is selected exclusively from the employee headcount input:

| Commission tier | Employee headcount | Rate on final Year-1 TCV |
|---|---:|---:|
| Essential | 1–500 | 6% |
| Growth | 501–2,000 | 7% |
| Enterprise | 2,001–10,000 | 8% |
| Enterprise Scale | 10,001+ | 8% |

The commission tier must not be derived from hiring volume, invoice value, the quote tier, or selected modules.

## Commission Basis

Use the calculator’s final Year-1 TCV after all pricing rules have been applied. The basis includes:

- Platform fee after any selected platform discount.
- Workforce usage fee when HRIS is active.
- Hiring usage fee when ATS is active.
- Selected add-on modules.
- Minimum-contract adjustment where applicable.
- Mandatory setup fee.

Because the final discounted TCV is the basis, an applied discount reduces the estimated commission.

## Tier Independence

The quote tier and commission tier are separate decisions:

- Quote tier continues to use the current higher-of-active-meters logic.
- Commission tier uses employee headcount only, whether HRIS is on or off.
- If hiring volume raises the quote tier above the headcount commission tier, BD view displays both labels explicitly, for example `Quote tier: Growth · Commission band: Essential (6%)`.
- No existing quote-tier logic, price formula, discount rule, minimum contract, add-on behavior, or output changes.

## Edge Cases

- Headcount `0`: do not assign the Essential rate. Show `Enter the committed headcount to calculate commission` and no amount.
- Neither ATS nor HRIS active: preserve the existing empty quote state and do not show a commission result.
- HRIS off with ATS on: headcount still determines the commission rate because it represents the client’s employee band, not an active pricing meter.
- Discount changes, module changes, meter changes, employee changes, and hiring-volume changes recalculate the commission immediately when BD view is active.
- Boundary values must be exact: 500/501, 2,000/2,001, and 10,000/10,001.
- Large allowed headcount values continue using the 8% Enterprise Scale rate.

## Data and Code Boundaries

- Add a dedicated commission-band data structure instead of reusing the quote tier’s `comm` fields. This prevents hiring-driven quote tiers from selecting the commission rate accidentally.
- Add a pure helper that accepts headcount and returns the commission band or no band for zero.
- Calculate the amount from the already-derived final `tcv` value inside the existing build cycle.
- Keep the existing quote calculation as the source of truth; do not duplicate pricing formulas for commission.
- Retain the two-page client-safety regression checks. Update them to permit commission terms only in the calculator’s explicitly hidden BD panel while ensuring Client view is the default and the panel is excluded from the accessibility tree until activated.

## Accessibility and Responsive Behavior

- Use native buttons or an equivalent accessible segmented control.
- Expose the active view programmatically.
- The BD panel must become available to assistive technology only when BD view is active.
- Toggling views must not move keyboard focus unexpectedly.
- At a 360px viewport, the segmented control and commission panel stack without page-level horizontal overflow.
- Respect the existing reduced-motion preference.

## Verification

Automated source and browser verification must cover:

- Client view is active on initial load and after reload.
- Commission panel is hidden visually and from the accessibility tree in Client view.
- BD view reveals the panel and Client view hides it again.
- Headcount boundaries return 6%, 7%, 8%, and 8% at the exact thresholds.
- Zero headcount shows guidance and no amount.
- The default 1,200-employee, 300-hire quote uses the Growth commission band at 7% of final Year-1 TCV.
- Hiring volume can change quote tier without changing the headcount-derived commission band.
- Discounts lower both final TCV and commission.
- Setup and selected add-ons increase both final TCV and commission.
- ATS-only quotes still use employee headcount for the commission band.
- Both-meters-off behavior remains unchanged.
- Existing representative quote outputs remain unchanged.
- No runtime errors, inaccessible toggle states, external HTTP resources, mojibake, or page-level mobile overflow are introduced.

## Out of Scope

- Authentication, authorization, or PIN protection.
- Persisting BD view across reloads.
- Changing when commission is paid or reconciling it with cash collection.
- Splitting commission among multiple BD employees.
- Adding manager approval workflows or commission exports.
- Changing the public product guide.
- Changing the underlying pricing model.
