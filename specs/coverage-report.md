# Test Coverage Report

**Generated:** 2026-08-19

## Summary

- Planned scenarios: 15
- Covered: 15
- Partial: 0
- Missing: 0
- Unplanned tests: 0

## Scenario Mapping

| Plan scenario | Status | Implementing test | Evidence / gap |
| --- | --- | --- | --- |
| SauceDemo Login 1.1 | Covered | `tests/auth/login.spec.ts` — standard user reaches inventory | Verifies inventory visibility and inventory URL. |
| SauceDemo Login 1.2 | Covered | `tests/auth/login.spec.ts` — locked user receives a clear error | Verifies locked-user error copy. |
| SauceDemo Login 1.3 | Covered | `tests/auth/login.spec.ts` — missing username is rejected | Verifies username-required error. |
| SauceDemo Login 1.4 | Covered | `tests/auth/login.spec.ts` — missing password is rejected | Verifies password-required error. |
| SauceDemo Login 1.5 | Covered | `tests/auth/login.spec.ts` — invalid user is rejected | Verifies invalid-credentials error. |
| SauceDemo Login 1.6 | Covered | `tests/accessibility/login-accessibility.spec.ts` — keyboard users can reach all login controls | Verifies tab order and focus for username, password, and Login. |
| SauceDemo Shopping 1.1 | Covered | `tests/inventory/inventory.spec.ts` — standard user sees all six products | Verifies six product cards. |
| SauceDemo Shopping 1.2 | Covered | `tests/inventory/inventory.spec.ts` — standard user can sort products by price | Verifies displayed prices are ascending. |
| SauceDemo Shopping 2.1 | Covered | `tests/checkout/checkout.spec.ts` — standard user completes a backpack purchase | Verifies cart, overview, and completion confirmation. |
| SauceDemo Shopping 2.2 | Covered | `tests/checkout/checkout.spec.ts` — standard user can remove a product before checkout | Verifies removed cart item is absent. |
| SauceDemo Shopping 2.3 | Covered | `tests/checkout/checkout.spec.ts` — checkout requires customer details | Verifies first-name validation error. |
| SauceDemo Shopping 3.1 | Covered | `tests/inventory/inventory.spec.ts` — standard user can log out safely | Verifies return to application root URL. |
| JSONPlaceholder API 1.1 | Covered | `tests/api/jsonplaceholder.spec.ts` — returns users from the public API | Verifies 200 response and user collection size. |
| JSONPlaceholder API 1.2 | Covered | `tests/api/jsonplaceholder.spec.ts` — returns the expected contract for a known post | Verifies 200 status and required response fields. |
| JSONPlaceholder API 1.3 | Covered | `tests/api/jsonplaceholder.spec.ts` — returns not found for an unknown post | Verifies 404 negative path. |

## Priority Gaps

1. None in the current plans. Future plans should add authenticated API and accessibility-audit scenarios only when safe credentials and an approved target are available.

## Unplanned Tests

- None.

## Recommendation

Add an automated WCAG scan with an approved accessibility engine, then plan API authentication and write-operation coverage against a safe, owned test environment.
