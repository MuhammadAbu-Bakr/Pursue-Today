# Testing Guide

This project has an automated backend test suite (Jest + Supertest + an in-memory MongoDB) covering authentication, per-user data isolation, and the 30MB storage quota. This document lists what's covered and how to run it.

## Running the tests

```bash
cd server
npm install
npm test
```

The first run downloads a local MongoDB binary (via `mongodb-memory-server`) — this needs internet access once, then it's cached. Tests run against this temporary, in-memory database, never your real one.

## What's covered

### Auth — Signup (`POST /api/auth/signup`)
| Case | Expected result |
|---|---|
| Valid email + password (8+ chars) | 201, account created, verification email sent |
| Email already registered | 409, "account already exists" |
| Missing email or password | 400 |
| Password under 8 characters | 400 |

### Auth — Email verification
| Case | Expected result |
|---|---|
| Valid token within 24h | `isVerified` becomes true, 200 |
| Tampered/random token | 400 |
| Missing token in query string | 400 |
| Resend for already-verified / non-existent email | Same generic message both times (no info leak) |

### Auth — Login (`POST /api/auth/login`)
| Case | Expected result |
|---|---|
| Correct email + password, verified | 200, cookie set |
| Correct email, wrong password | 401, generic "invalid email or password" |
| Non-existent email | 401, same generic message (no leak) |
| Correct credentials but unverified | 403, "please verify your email" |

### Auth — Session / logout
| Case | Expected result |
|---|---|
| `GET /api/auth/me` with valid cookie | 200, returns user |
| `GET /api/auth/me` with no cookie | 401 |
| Logout clears cookie | Subsequent `/me` call returns 401 |

### Todos — CRUD
| Case | Expected result |
|---|---|
| Create/list todos while logged in | Works, scoped to that user |
| Create todo with no auth cookie | 401 |
| Create todo with empty text | 400 |
| Toggle, update, delete own todo | All succeed |
| Fetch/update/delete non-existent ID | 404 |

### Cross-user data isolation (the critical one)
| Case | Expected result |
|---|---|
| User B lists todos | Never contains User A's todos |
| User B fetches User A's todo by ID | 404, not the data |
| User B tries to update User A's todo | 404, User A's todo unchanged |
| User B tries to delete User A's todo | 404, User A's todo still exists |

### Storage quota (30MB)
| Case | Expected result |
|---|---|
| Small todos | Accepted, usage counter increments |
| A single todo over the cap | 413, rejected, not persisted |
| Deleting a todo | Usage counter decrements |
| Editing a todo to exceed the cap | 413, original content unchanged |
| One user's usage vs. another's | Fully independent, per-user |
| `/api/usage/recalculate` | Matches the running counter |

## What's not covered yet
- Frontend component tests (React Testing Library) — not set up in this project yet
- Rate limiting on `/api/auth/*` (would need to fire 21+ requests in a test, currently untested)
- CORS/cookie behavior across real cross-site domains (only testable in an actual deployed environment, not in-process tests)

## Adding new tests
Test files live in `server/tests/*.test.js`. Each file:
1. Mocks `utils/sendEmail.js` so no real emails are sent (see `tests/mocks/sendEmail.js`)
2. Connects to a fresh in-memory MongoDB (`tests/setup.js`)
3. Uses `tests/helpers.js`'s `createVerifiedUser()` to skip the signup/verify/login boilerplate when a test just needs a logged-in user

Follow the existing files as a template for new ones.