# Website Test Plan: SauceDemo Storefront

## Purpose

Validate the public SauceDemo shopping journey at <https://www.saucedemo.com/> and demonstrate a risk-based QA approach through manual coverage, defect evidence, and maintainable Playwright automation.

## Scope

In scope: login, session handling, product catalogue, sorting, cart management, checkout validation, order completion, keyboard navigation, and responsive/cross-browser confidence.

Out of scope: registration, password reset, real payments, order history, backend performance, and production security testing because the public demo does not expose those capabilities.

## Quality risks and priorities

| Risk | Impact | Priority | Coverage |
| --- | --- | --- | --- |
| A valid shopper cannot sign in | Purchase journey blocked | P0 | Positive login and session tests |
| Incorrect product/cart state | Wrong order contents | P0 | Add, remove, persistence, and badge tests |
| Checkout accepts incomplete data or cannot finish | Lost conversion | P0 | Field validation and end-to-end purchase |
| Catalogue content or sorting is wrong | Poor purchase decisions | P1 | Product data, image, and all sort modes |
| Keyboard or small-screen flow is unusable | Users excluded | P1 | Keyboard and responsive checks |

## Test approach

- Run P0 smoke scenarios on every change; run P0/P1 regression across Chromium, Firefox, and WebKit in CI.
- Keep tests isolated: each browser context starts with a clean cart and session.
- Use the published SauceDemo personas for positive, negative, and deliberately defective behavior.
- Prefer accessible roles and labels, Playwright auto-waiting, and web-first assertions.
- Retain screenshot, video, and trace evidence on automated failures.

## Entry and exit criteria

Entry: the site is reachable, supported browser binaries are installed, and public test credentials work.

Exit: all P0 cases pass; no open Critical/High defect blocks login, cart, or checkout; P1 failures are triaged with evidence and an owner; automation results and artifacts are reviewable.

## Environments and data

- Desktop Chromium, Firefox, and WebKit; one current mobile viewport for exploratory coverage.
- Public users from `tests/data/users.json`; no private credentials are committed.
- Standard checkout data from `tests/data/checkout.json`.

## Deliverables

- 18 detailed manual cases in `specs/manual-test-cases.md`
- Reproducible sample defects and screenshots in `specs/bug-reports.md` and `specs/evidence/`
- Page-object-based Playwright suite under `tests/`
- HTML and Allure reports locally and in GitHub Actions

## Risks and mitigations

- Public demo availability may cause environmental failures: confirm reachability before classifying a product regression.
- Deliberately defective users are expected to expose issues: keep them out of the green smoke suite and document results as portfolio evidence.
- Third-party UI changes may invalidate selectors: centralize locators in Page Objects and diagnose before changing assertions.

