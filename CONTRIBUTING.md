# Contributing

## Local workflow

1. Install dependencies with `npm ci`.
2. Install browsers with `npx playwright install`.
3. Run the relevant test first, then the smoke suite: `npm run test:smoke`.
4. Run all browser projects before opening a pull request: `npm test`.

## Test standards

- Put test scenarios in `tests/` and data in `tests/data/`.
- Put locators and actions in a Page Object under `src/pages/`.
- Use accessible roles and names first; use the application's test IDs when needed.
- Use web-first assertions. Never add fixed waits to hide timing problems.
- Preserve the intent of a failing test. Do not skip or weaken it just to make CI green.

## Pull-request checklist

- [ ] Scenario has a meaningful assertion and an appropriate test tag.
- [ ] Test data is not hard-coded in the test.
- [ ] No credentials, auth state, trace, or report artifacts are committed.
- [ ] CI artifacts are sufficient to diagnose a failure.
