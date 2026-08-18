# Test Plan: SauceDemo Shopping and Checkout

**Target:** https://www.saucedemo.com
**Seed:** tests/auth/login.spec.ts
**Date:** 2026-08-18

## Overview

This plan validates the standard-user purchase journey from inventory to order confirmation. It also verifies that an authenticated user can end a session safely.

## Preconditions

- Browser can reach SauceDemo
- Standard user credentials are available through test data or environment variables

## Scenarios

### Scenario 1.1 — Inventory lists all products
- **Priority:** P0
- **Tags:** @smoke @regression
- **Preconditions:** Standard user is authenticated
- **Steps:**
  1. Open the inventory page — expected: product catalogue is available
- **Assertions:**
  - Six inventory items are visible
- **Edge cases considered:** Product counts should not depend on prior test state.

### Scenario 1.2 — Inventory sorts products by lowest price
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Standard user is authenticated
- **Steps:**
  1. Select the price-low-to-high option — expected: products reorder by price
- **Assertions:**
  - Prices are displayed in ascending order
- **Edge cases considered:** Equal-price products may appear in either stable order.

### Scenario 2.1 — Standard user completes a backpack purchase
- **Priority:** P0
- **Tags:** @smoke @critical
- **Preconditions:** Standard user is authenticated
- **Steps:**
  1. Add Sauce Labs Backpack to the cart — expected: item can be reviewed in cart
  2. Start checkout and enter customer details — expected: checkout overview opens
  3. Finish checkout — expected: success confirmation is shown
- **Assertions:**
  - Backpack is visible in the cart and checkout overview
  - Order confirmation heading is visible
- **Edge cases considered:** Empty checkout fields and payment failures are outside this public demo's controlled scope.

### Scenario 2.2 — Standard user removes a cart item
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Standard user is authenticated
- **Steps:**
  1. Add Sauce Labs Backpack and open the cart
  2. Remove the backpack — expected: item is no longer listed
- **Assertions:**
  - Backpack is absent from the cart
- **Edge cases considered:** The cart begins empty for every test.

### Scenario 2.3 — Checkout requires a first name
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Standard user has one item in the cart and is on checkout information
- **Steps:**
  1. Continue with empty customer details — expected: validation blocks progress
- **Assertions:**
  - First-name-required message is visible
- **Edge cases considered:** First-name validation takes precedence when all fields are empty.

### Scenario 3.1 — Standard user logs out
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Standard user is authenticated
- **Steps:**
  1. Open the navigation menu
  2. Select logout — expected: login page opens
- **Assertions:**
  - URL returns to the application root
- **Edge cases considered:** Each test begins with an independent authenticated session.

## Not covered (and why)

- Payments, user registration, and password reset: they are not present in SauceDemo.
