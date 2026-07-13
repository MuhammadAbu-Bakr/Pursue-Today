# Testing Guide

This project has an automated backend test suite (Jest + Supertest + an in-memory MongoDB) covering authentication, authorization, per-user data isolation, storage quota enforcement, utility functions, model methods, and middleware behavior.

## Running the tests

```bash
cd server
npm install
npm test
```

The first run downloads a local MongoDB binary (via `mongodb-memory-server`) — this requires internet access once and is then cached locally. Tests run against a temporary in-memory database and never touch production data.

---

# Test Coverage

## Unit Tests

### Storage Utilities (`utils/storage.js`)

#### `getTodoSize()`

| Case                            | Expected Result                                               |
| ------------------------------- | ------------------------------------------------------------- |
| Plain ASCII text                | Returns correct byte count                                    |
| Multi-byte text (emoji/unicode) | Uses `Buffer.byteLength()` and reports accurate size          |
| Empty string text               | Returns small non-zero size because metadata is still counted |

#### `assertWithinQuota()`

| Case                                       | Expected Result                                                         |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| New content exceeds `MAX_STORAGE_BYTES`    | Throws error with `status = 413`                                        |
| New content stays under quota              | Does not throw                                                          |
| Editing an existing todo to a smaller size | Previous size is subtracted correctly and quota is not falsely exceeded |

#### `adjustUsage()`

| Case                                      | Expected Result                                            |
| ----------------------------------------- | ---------------------------------------------------------- |
| Positive delta (todo created or expanded) | Calls `User.findByIdAndUpdate()` with correct `$inc` value |
| Negative delta (todo deleted or reduced)  | Usage decreases correctly                                  |

---

### User Model (`models/User.js`)

#### Password Hashing Hook

| Case                        | Expected Result                |
| --------------------------- | ------------------------------ |
| Password field modified     | Password is hashed before save |
| Password field not modified | Password is not re-hashed      |

#### `comparePassword()`

| Case               | Expected Result |
| ------------------ | --------------- |
| Correct password   | Returns `true`  |
| Incorrect password | Returns `false` |

#### `createVerificationToken()`

| Case             | Expected Result                                                            |
| ---------------- | -------------------------------------------------------------------------- |
| Token generation | Raw token differs from stored value because stored token is SHA-256 hashed |
| Expiry creation  | `verificationTokenExpires` is approximately 24 hours in the future         |

---

### Authentication Middleware (`middleware/auth.js`)

#### `requireAuth()`

| Case                            | Expected Result            |
| ------------------------------- | -------------------------- |
| Valid JWT and verified user     | Calls `next()`             |
| No token present                | Returns `401 Unauthorized` |
| Invalid or expired JWT          | Returns `401 Unauthorized` |
| User no longer exists           | Returns `401 Unauthorized` |
| User exists but is not verified | Returns `403 Forbidden`    |

Mocks are used for:

* `jwt.verify()`
* `User.findById()`

to isolate middleware behavior from external dependencies.

---

## Integration Tests

### Auth — Signup (`POST /api/auth/signup`)

| Case                              | Expected Result                               |
| --------------------------------- | --------------------------------------------- |
| Valid email + password (8+ chars) | 201, account created, verification email sent |
| Email already registered          | 409, account already exists                   |
| Missing email or password         | 400                                           |
| Password under 8 characters       | 400                                           |

---

### Auth — Email Verification

| Case                                           | Expected Result                                       |
| ---------------------------------------------- | ----------------------------------------------------- |
| Valid token within 24h                         | `isVerified` becomes true, 200                        |
| Tampered/random token                          | 400                                                   |
| Missing token in query string                  | 400                                                   |
| Resend for already verified/non-existent email | Generic success response (prevents email enumeration) |

---

### Auth — Login (`POST /api/auth/login`)

| Case                               | Expected Result                               |
| ---------------------------------- | --------------------------------------------- |
| Correct email + password, verified | 200, authentication cookie set                |
| Correct email, wrong password      | 401, generic invalid credentials message      |
| Non-existent email                 | 401, same generic invalid credentials message |
| Correct credentials but unverified | 403, please verify your email                 |

---

### Auth — Session and Logout

| Case                                 | Expected Result                 |
| ------------------------------------ | ------------------------------- |
| `GET /api/auth/me` with valid cookie | 200, returns authenticated user |
| `GET /api/auth/me` without cookie    | 401                             |
| Logout                               | Authentication cookie cleared   |
| `/me` after logout                   | 401                             |

---

### Todos — CRUD Operations

| Case                                          | Expected Result                                     |
| --------------------------------------------- | --------------------------------------------------- |
| Create and list todos while authenticated     | Works correctly and is scoped to the logged-in user |
| Create todo without authentication            | 401                                                 |
| Create todo with empty text                   | 400                                                 |
| Toggle, update, and delete own todo           | Success                                             |
| Fetch, update, or delete non-existent todo ID | 404                                                 |

---

### Cross-User Data Isolation

| Case                               | Expected Result                         |
| ---------------------------------- | --------------------------------------- |
| User B lists todos                 | Never receives User A's todos           |
| User B fetches User A's todo by ID | 404                                     |
| User B updates User A's todo       | 404 and original todo remains unchanged |
| User B deletes User A's todo       | 404 and original todo remains unchanged |

This is one of the most important security tests in the suite.

---

### Storage Quota (30 MB)

| Case                          | Expected Result                                 |
| ----------------------------- | ----------------------------------------------- |
| Small todos                   | Accepted and usage counter increases            |
| Single todo exceeds quota     | 413, rejected and not persisted                 |
| Deleting a todo               | Usage counter decreases                         |
| Editing a todo beyond quota   | 413 and original content remains unchanged      |
| Different users               | Usage tracked independently                     |
| `POST /api/usage/recalculate` | Recalculated value matches stored usage counter |

---

## Current Gaps

The following areas are not currently covered by automated tests:

* Frontend component testing (React Testing Library)
* Frontend integration testing
* End-to-end browser testing (Playwright/Cypress)
* Rate limiting behavior on authentication endpoints
* Real cross-origin cookie/CORS behavior between deployed domains
* Email delivery provider integration testing

---

## Test Infrastructure

The test suite:

1. Uses Jest as the test runner.
2. Uses Supertest for HTTP endpoint testing.
3. Uses `mongodb-memory-server` for isolated database instances.
4. Mocks `utils/sendEmail.js` so no real emails are sent.
5. Creates a fresh database for each test run.
6. Provides helper utilities such as `createVerifiedUser()` for authenticated test scenarios.

---

## Adding New Tests

Test files live in:

```text
server/tests/*.test.js
```

When creating new tests:

1. Mock external services whenever possible.
2. Use the in-memory MongoDB instance provided by `tests/setup.js`.
3. Use `tests/helpers.js` utilities to reduce authentication boilerplate.
4. Follow the existing unit and integration test patterns.
5. Ensure both success paths and failure paths are covered.

Current coverage includes utility functions, model methods, authentication middleware, authentication flows, authorization checks, CRUD operations, user isolation, and storage quota enforcement.
