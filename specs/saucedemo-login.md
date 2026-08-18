# Test Plan: SauceDemo Login

**Target:** https://www.saucedemo.com
**Seed:** tests/seed.spec.ts
**Date:** 2026-08-04

## Overview
This plan covers the SauceDemo login page and validates successful login and common failure cases for the built-in test users. It checks the page response for standard authentication, locked accounts, missing credentials, and invalid credentials.

## Preconditions
- Browser can reach `https://www.saucedemo.com`
- Test begins on the SauceDemo login page
- Password value for all scenarios is `secret_sauce`

## Scenarios

### Scenario 1.1 — Standard user login succeeds
- **Priority:** P0
- **Tags:** @smoke @regression
- **Preconditions:** Login page is visible with username and password fields
- **Steps:**
  1. Enter username `standard_user` and password `secret_sauce` — expected: credentials are accepted
  2. Click the login button — expected: navigate to the inventory page
- **Assertions:**
  - Inventory page header or title is visible and contains `Products`
  - URL includes `/inventory.html`
- **Edge cases considered:** Wrong user type in same password field is rejected elsewhere, page messaging remains consistent

### Scenario 1.2 — Locked out user shows locked error
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Login page is visible
- **Steps:**
  1. Enter username `locked_out_user` and password `secret_sauce`
  2. Click the login button — expected: login is blocked and an error message appears
- **Assertions:**
  - Error message contains `Sorry, this user has been locked out.`
- **Edge cases considered:** Error persists until the next login attempt, locked user cannot proceed even with correct credentials

### Scenario 1.3 — Empty username submission shows required error
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Login page is visible
- **Steps:**
  1. Leave username empty and enter password `secret_sauce`
  2. Click the login button — expected: login is blocked and a username-required error appears
- **Assertions:**
  - Error message contains `Username is required`
- **Edge cases considered:** When both fields are empty, username validation takes precedence over password validation

### Scenario 1.4 — Empty password submission shows required error
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Login page is visible
- **Steps:**
  1. Enter username `standard_user` and leave password empty
  2. Click the login button — expected: login is blocked and a password-required error appears
- **Assertions:**
  - Error message contains `Password is required`
- **Edge cases considered:** Password field validation should trigger only after username is present

### Scenario 1.5 — Invalid credentials show authentication error
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Login page is visible
- **Steps:**
  1. Enter username `invalid_user` and password `secret_sauce`
  2. Click the login button — expected: login is blocked and an invalid-credentials error appears
- **Assertions:**
  - Error message contains `Username and password do not match any user in this service`
- **Edge cases considered:** Same error is shown for incorrect username or incorrect password, no partial success occurs

## Not covered (and why)
- Password reset flow — not available on the public SauceDemo login page
- Remember-me or alternative authentication options — not present in the target UI
