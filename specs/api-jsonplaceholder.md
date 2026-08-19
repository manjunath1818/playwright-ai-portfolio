# Test Plan: JSONPlaceholder Public API

**Target:** https://jsonplaceholder.typicode.com
**Seed:** tests/api/jsonplaceholder.spec.ts
**Date:** 2026-08-19

## Overview

This plan validates safe, read-only public API behavior using Playwright's API request support. It demonstrates status, contract, and negative-path coverage without writing to third-party data.

## Preconditions

- The public JSONPlaceholder API is reachable
- No credentials or write operations are required

## Scenarios

### Scenario 1.1 — Users endpoint is available
- **Priority:** P0
- **Tags:** @smoke @api
- **Preconditions:** API is reachable
- **Steps:**
  1. Request the users collection — expected: users are returned
- **Assertions:**
  - Response status is 200
  - Response contains at least one user
- **Edge cases considered:** Public API availability may be an environment failure rather than an application regression.

### Scenario 1.2 — Known post matches the expected contract
- **Priority:** P1
- **Tags:** @regression @api
- **Preconditions:** API is reachable
- **Steps:**
  1. Request post 1 — expected: post data is returned
- **Assertions:**
  - Response status is 200
  - Response contains userId, id, title, and body
- **Edge cases considered:** Contract checks validate required fields without overfitting to dynamic text values.

### Scenario 1.3 — Unknown post returns not found
- **Priority:** P1
- **Tags:** @regression @api
- **Preconditions:** API is reachable
- **Steps:**
  1. Request a non-existent post — expected: API rejects the request cleanly
- **Assertions:**
  - Response status is 404
- **Edge cases considered:** No public data is created, changed, or removed.

## Not covered (and why)

- Authenticated and write operations: a public portfolio should not commit credentials or mutate third-party data.
