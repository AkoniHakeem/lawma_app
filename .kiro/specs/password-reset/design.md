# Design Document

## Overview

This design adds self-service password reset for Waste Manager (email/password) accounts on the WastePro platform. It spans the `lawma_app` Quasar/Vue 3 frontend and the `mother-ship-nest` NestJS backend.

The user-facing flow is:

1. A "Forgot password?" control on the Waste Manager sign-in tab navigates to a **Reset Request Page**.
2. The user submits an email; the backend always responds identically (enumeration-resistant) and, only when the email matches a real account, emails a reset link containing an opaque token.
3. The link opens the **Reset Confirmation Page**, which first validates the token, then lets the user set and confirm a new password.
4. The backend validates the token (single-use, time-limited), updates the `ProjectUserPassword` hash, and marks the token used.

The design deliberately reuses existing platform building blocks rather than introducing new infrastructure:

- The backend already defines a `Token` entity and a `TokenCreationPurpose.RESET_PASSWORD` enum value. Password-reset tokens are persisted as `Token` rows so we do not add a parallel table.
- `SharedService` already provides `hashPassword` / `comparePassword` (bcrypt) and email senders (`sendZeptoEmail`, `sendMail`). We reuse these for the password hash and the reset email.
- The frontend already uses `class-validator` models extending `BaseModel`, the `api` axios instance (`src/boot/axios.ts`), request modules under `src/lib/requests`, and `UrlPathsEnum`. New pages and models follow those same patterns.

The one new dependency is `@nestjs/throttler`, used to satisfy the rate-limiting requirements (Requirement 8). It is not currently installed.

### Requirements coverage map

| Requirement | Primary design section |
|---|---|
| 1 – Forgot password entry point | Frontend: SigninPage change, Routing |
| 2 – Request a password reset | Frontend: Reset Request Page; Backend: `requestReset` |
| 3 – Secure token generation & storage | Backend: Token generation & storage |
| 4 – Validate the reset link | Frontend: Reset Confirmation Page; Backend: `validateResetToken` |
| 5 – Set a new password | Frontend: Reset Confirmation Page; Backend: `setNewPassword` |
| 6 – Single-use & expiring tokens | Backend: Token lifecycle & `setNewPassword` |
| 7 – Success & error feedback | Frontend: feedback & state machine |
| 8 – Enumeration resistance & rate limiting | Backend: Enumeration resistance, Rate limiting |
| 9 – Accessibility | Frontend: Accessibility |

## Architecture

```
┌──────────────────────── lawma_app (Quasar / Vue 3) ────────────────────────┐
│                                                                             │
│  SigninPage.vue ──"Forgot password?"──▶ /auth/forgot-password               │
│                                          (ResetRequestPage.vue)             │
│                                                │ submit email               │
│                                                ▼                            │
│                            requestPasswordReset()  ── src/lib/requests      │
│                                                │                            │
│  Reset link email ──▶ /auth/reset-password?token=… (ResetConfirmationPage)  │
│                          │ onMounted: validateResetToken()                  │
│                          │ submit: submitNewPassword()                      │
│                          ▼                                                  │
└──────────────────────────│──────────────────────────────────────────────────┘
                           │  api (axios) → baseURL /v1
                           ▼
┌──────────────────────── mother-ship-nest (NestJS) ─────────────────────────┐
│  AuthController  @Controller('auth')   (ThrottlerGuard applied)             │
│    POST /auth/password-reset/request        → AuthService.requestReset      │
│    POST /auth/password-reset/validate       → AuthService.validateResetToken│
│    POST /auth/password-reset/confirm        → AuthService.setNewPassword    │
│                                                                             │
│  AuthService ──┬── DataSource (TypeORM): User, Token, ProjectUserPassword   │
│                ├── SharedService.hashPassword / comparePassword (bcrypt)    │
│                └── SharedService.sendZeptoEmail / sendMail (reset email)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Why these boundaries

- **All security-sensitive logic lives in the backend.** The frontend never decides whether an account exists, whether a token is valid, or whether a password is strong enough to accept — it only mirrors backend responses and provides pre-submit UX validation. This keeps enumeration resistance and single-use enforcement authoritative on the server.
- **Token plaintext leaves the system only inside the emailed link.** The backend stores a hash; the frontend forwards the plaintext token from the URL on each call but never persists it.
- **The reset pages are public (unauthenticated) routes** under the existing `/auth` layout, since a user resetting a password is by definition not signed in.

## Backend Design (`mother-ship-nest`)

### Endpoints

All endpoints are added to the existing `AuthController` (`@Controller('auth')`) and are public (no `IsAuthenticated` guard). Request bodies are validated by the existing global `ValidationPipe`.

| Method & path | Body | Success response | Purpose |
|---|---|---|---|
| `POST /auth/password-reset/request` | `{ email: string }` | `200 { message: "If an account exists for that email, a reset link has been sent." }` | Request a reset (Req 2) |
| `POST /auth/password-reset/validate` | `{ token: string }` | `200 { status: "valid" \| "invalid" \| "expired" }` | Validate the link before showing the form (Req 4) |
| `POST /auth/password-reset/confirm` | `{ token: string, newPassword: string }` | `200 { message: "Your password has been reset" }` | Set the new password (Req 5) |

Notes:
- `validate` returns `200` in all non-rate-limited cases with a `status` discriminator rather than using error status codes, so the frontend can branch cleanly and so a missing/used token is not distinguishable by status code alone.
- `confirm` returns `400` with a typed error body for an invalid/used/expired token (`{ type: 'INVALID_RESET_TOKEN' }`) or a weak password (`{ type: 'WEAK_PASSWORD', message }`), matching the existing `ValidationPipe` error shape (`{ type, message, errors? }`).

### DTOs

Added to `src/auth/dtos/dto.ts`, following the existing class-validator style:

```ts
export class RequestPasswordResetDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ValidateResetTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class ConfirmPasswordResetDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  // Password policy enforced server-side (Req 5.6). The regex mirrors the
  // frontend rules so the two stay in sync; the backend is authoritative.
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'Password must include uppercase, lowercase, a number, and a special character',
  })
  newPassword: string;
}
```

### Token model and storage

We reuse the existing `Token` entity (`src/project/entities/Token.entity.ts`) with `purpose = TokenCreationPurpose.RESET_PASSWORD` and `userId` set to the target user. The entity already has `valueOfToken`, `expiry` (seconds), `purpose`, `createdAt`, `updatedAt`, and `userId`. Two reset-specific concerns require small additions:

- **Single-use marking (Req 5.7, 6.1).** The base `Token` has no "used" flag. We add a nullable `usedAt: Date` column to `Token` via a TypeORM migration. A token is "used" when `usedAt` is non-null. This is additive and nullable, so existing token flows are unaffected.
- **Hash storage (Req 3.2).** `valueOfToken` stores the **hash** of the reset token, never the plaintext.

Token field usage for reset tokens:

| Field | Value |
|---|---|
| `valueOfToken` | `sha256(plaintextToken)` hex digest — the Token_Hash |
| `expiry` | `1800` (30 minutes, in seconds) — interpreted as a window from `createdAt` |
| `purpose` | `TokenCreationPurpose.RESET_PASSWORD` |
| `userId` | id of the matched `User` |
| `usedAt` | `null` until consumed, then the consumption timestamp |
| `createdAt` | issuance time (used with `expiry` to compute the validity window) |

**Token generation (Req 3.1).** Use Node's `crypto.randomBytes(32)` (256 bits, exceeding the 128-bit minimum) encoded as URL-safe base64 to produce the plaintext token. The plaintext is embedded in the reset link; only `sha256` of it is stored. We use SHA-256 (not bcrypt) for the lookup hash because the value is already high-entropy and we need a deterministic digest to look the row up by value; bcrypt's per-row salt would prevent lookup.

**Expiry computation (Req 3.3, 4.4, 6.2).** A token is within the validity window when `now < createdAt + expiry seconds`. This reuses the existing `SharedService.isTokenExpired(createdAt, { expiresInSeconds })` helper rather than introducing a new expiry mechanism.

**Invalidating prior tokens (Req 3.4).** When issuing a new reset token for a user that already has an unused, unexpired `RESET_PASSWORD` token, mark the prior tokens used (`usedAt = now`) in the same transaction before inserting the new one.

### Service methods (`AuthService`)

```
requestReset(email): Promise<void>
  1. Look up User by email (case-insensitive match on the unique email column).
  2. If no user → return (no email sent), but the controller still returns the
     standard success body (Req 2.5, 2.6).
  3. If user exists:
     a. In a transaction: mark any existing unused+unexpired RESET_PASSWORD
        tokens for this user as used (Req 3.4).
     b. Generate plaintext token (crypto.randomBytes) + sha256 hash.
     c. Insert a Token row (hash, expiry=1800, purpose=RESET_PASSWORD, userId).
     d. Build reset link: `${FRONTEND_BASE_URL}/auth/reset-password?token=<plaintext>`.
     e. Send the reset email via SharedService (sendZeptoEmail / sendMail).
  4. The email send is awaited inside the matched-account branch; see
     "Enumeration resistance" for timing treatment.

validateResetToken(token): Promise<'valid' | 'invalid' | 'expired'>
  1. hash = sha256(token).
  2. Find Token where valueOfToken = hash AND purpose = RESET_PASSWORD.
  3. Not found        → 'invalid'  (Req 4.3)
  4. usedAt != null   → 'invalid'  (Req 4.5)
  5. expired          → 'expired'  (Req 4.4)
  6. else             → 'valid'    (Req 4.2)

setNewPassword(token, newPassword): Promise<void>
  In a single transaction:
  1. hash = sha256(token); load Token by hash + purpose.
  2. If not found / used / expired → throw typed INVALID_RESET_TOKEN (Req 6.1–6.3).
     The ProjectUserPassword row is NOT touched on any rejection.
  3. Compute passwordHash via SharedService.hashPassword (bcrypt).
  4. Update the ProjectUserPassword row for token.userId (Req 5.6).
  5. Set token.usedAt = now (Req 5.7).
  (DTO-level validation already guaranteed the password meets policy; if it does
   not, the ValidationPipe rejects before this method runs → WEAK_PASSWORD.)
```

Token consumption uses a transactional, conditional update (`UPDATE … SET usedAt = now() WHERE id = :id AND usedAt IS NULL`) and checks the affected-row count, so two concurrent `confirm` calls for the same token cannot both succeed (defense against a race on single-use enforcement).

### Enumeration resistance (Req 8.1)

The `request` endpoint must be indistinguishable for matching vs non-matching emails in status code, body, and observable timing:

- **Status & body:** Both branches return `200` with the identical message. No branch throws or returns a different shape.
- **Timing:** The dominant timing signal in a naive implementation is that the matching branch does bcrypt hashing + DB writes + an email send while the non-matching branch does almost nothing. To flatten this, the email send is dispatched without blocking the response on the network round-trip (the response is returned once the token row is committed for matched accounts), and the handler enforces a fixed minimum response duration (e.g. pad to a constant floor) so both branches return after approximately the same elapsed time. This is a best-effort timing-equalization documented as a known limitation rather than a constant-time guarantee.

### Rate limiting (Req 8.2–8.5)

Add `@nestjs/throttler` and register `ThrottlerModule` (15-minute window = `ttl: 900`). Because the limits differ per dimension (per-email, per-IP, per-invalid-token), use named throttlers / custom `ThrottlerGuard` subclasses with custom key generators:

- **Per-email on request (Req 8.2):** limit 5 / 15 min, keyed by normalized email from the request body.
- **Per-IP on request (Req 8.3):** limit 10 / 15 min, keyed by client IP.
- **Per-IP invalid-token on validate/confirm (Req 8.4):** limit 10 / 15 min, keyed by IP, counted only when the token turns out to be invalid. Implemented by incrementing the throttler storage on the invalid-token path inside the handler rather than a blanket guard, so legitimate valid-token calls are not penalized.
- **Rate-limit response (Req 8.5):** returns `429` with a generic body that does not reference account existence.

Throttler storage defaults to in-memory. For multi-instance deployments this should be backed by a shared store; the design notes this as a deployment consideration and uses the default store for the initial implementation.

### Email content

The reset email contains the reset link and a short instruction. It is sent through the existing `SharedService` email path already used by the platform (`sendZeptoEmail` / `sendMail` with the configured provider key). The link points at the frontend reset-confirmation route with the plaintext token as a query parameter. A new env var `FRONTEND_BASE_URL` (falling back to an existing configured app URL) provides the link origin.

### Module wiring

- `AuthModule` gains no new providers beyond what `AuthService` needs; `Token` and `ProjectUserPassword` are already reachable through the shared `DataSource`.
- `ThrottlerModule` is registered (in `AuthModule` or `AppModule`) and the throttler guard is applied to the three reset endpoints.

## Frontend Design (`lawma_app`)

### Routing (Req 1.2, 4.1)

Add two public children under the existing `/auth` route (which uses `AuthLayout.vue`):

```ts
{
  path: '/auth',
  component: () => import('layouts/AuthLayout.vue'),
  children: [
    { path: 'signin', component: () => import('pages/SigninPage.vue') },
    { path: 'forgot-password', component: () => import('pages/ResetRequestPage.vue') },
    { path: 'reset-password', component: () => import('pages/ResetConfirmationPage.vue') },
  ],
}
```

The reset link in the email targets `/auth/reset-password?token=<token>`; the page reads `token` from the query string.

### SigninPage change (Req 1.1, 1.3)

Add a "Forgot password?" `q-btn` (flat, link style) inside the **Manager** form only (`v-if="activeTab === 'manager'"`), below the password field. It calls `router.push('/auth/forgot-password')`. Because it is rendered inside the manager-only `<q-form v-if="activeTab === 'manager'">` block, it is automatically absent on the Service Client tab (Req 1.3).

### Validation models (`class-validator`, extending `BaseModel`)

`src/models/PasswordResetRequest.model.ts`:

```ts
export default class PasswordResetRequestModel extends BaseModel {
  @IsEmail({}, { message: 'Please enter a valid email' })
  email: string;
}
```

`src/models/PasswordResetConfirm.model.ts`:

```ts
export default class PasswordResetConfirmModel extends BaseModel {
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'Password must include uppercase, lowercase, a number, and a special character',
  })
  newPassword: string;

  // Cross-field match validated in the page/viewmodel (class-validator has no
  // built-in cross-field compare here); message: "Passwords do not match".
  confirmPassword: string;
}
```

The exact validation messages are taken verbatim from the requirements (Req 2.2, 5.2, 5.3, 5.4) so the UI text matches the acceptance criteria. The confirm-match check (Req 5.4) is performed in the page before submit since it compares two fields.

### Request module (`src/lib/requests`)

Add `password-reset.request.ts` mirroring `auth.request.ts` and using the `api` instance. New entries in `UrlPathsEnum`:

```ts
PASSWORD_RESET_REQUEST  = '/auth/password-reset/request',
PASSWORD_RESET_VALIDATE = '/auth/password-reset/validate',
PASSWORD_RESET_CONFIRM  = '/auth/password-reset/confirm',
```

```ts
export async function requestPasswordReset(email: string): Promise<void> { … }
export async function validateResetToken(token: string): Promise<'valid' | 'invalid' | 'expired'> { … }
export async function submitNewPassword(token: string, newPassword: string): Promise<void> { … }
```

Each call sends `Authorization: undefined` (like `requestSignin`) since these are unauthenticated.

### Reset Request Page (Req 2, 7.5, 9)

- Single `q-input` (type `email`) bound to `PasswordResetRequestModel`, plus a submit `q-btn`.
- On submit: run `model.validate()`. If `email` is invalid, show "Please enter a valid email" and do not call the API (Req 2.2).
- If valid, call `requestPasswordReset(email)`; while pending, show a loading state and disable submit (Req 7.5).
- On any resolved response, show the confirmation message "If an account exists for that email, a reset link has been sent." in a page-level live region (Req 2.7, 9.4). The same message shows regardless of outcome so the frontend never reveals account existence.
- A network/server error surfaces "Something went wrong. Please try again." and re-enables submit.

### Reset Confirmation Page (Req 4, 5, 7, 9)

State machine driven by token validation:

```
                 onMounted
                     │ read token from query
                     ▼
              [validating]  ── validateResetToken(token)
                 │     │
        'valid'  │     │  'invalid' | 'expired'
                 ▼     ▼
        [form]        [link-error]
          │ submit       └─ message + button → /auth/forgot-password (Req 4.6)
          ▼
   submitNewPassword(token, newPassword)
     │            │                 │
  success     INVALID_RESET_TOKEN   network error
     ▼            ▼                 ▼
  [done]       [link-error]      stay on [form] + retry (Req 7.4)
   message +   (Req 7.2)
   sign-in btn
   (Req 7.1)
```

- **Form fields (Req 5.1, 5.8):** new-password and confirm-password `q-input`s, both with an append-slot visibility toggle (`visibility` / `visibility_off`) flipping `type` between `password` and `text`.
- **Pre-submit validation (Req 5.2–5.4):** length, character-class, and match checks run before any API call; failing messages render on the associated field.
- **Submit (Req 5.5, 7.5):** on valid input, disable submit and show a loader, then call `submitNewPassword`.
- **Success (Req 7.1):** hide the form, show "Your password has been reset", show a "Go to sign in" button → `/auth/signin`.
- **Token rejection at submit (Req 7.2):** transition to `[link-error]` offering a link to request a new reset.
- **Weak-password rejection from server (Req 7.3):** show the policy message on the field and keep the user's input for correction (do not clear the fields).
- **Invalid/expired at validation time (Req 4.6):** never render the password fields; show the request-new-reset message.

### Accessibility (Req 9)

- Every `q-input` uses a visible `label`, which Quasar links to the control; error text is rendered through the field's error slot so it is programmatically associated and announced (Req 9.1, 9.2).
- Controls are native focusable elements in DOM order; no positive `tabindex`, preserving logical focus order (Req 9.3).
- Page-level status messages (request confirmation, success, link-error) render inside an element with `role="status"` / `aria-live="polite"` so assistive tech announces them without moving focus (Req 9.4).
- The visibility toggle is a button with an `aria-label` that reflects current state ("Show password" / "Hide password") and updates when toggled (Req 9.5).

## Components and Interfaces

This section consolidates the public surface of each component introduced or modified by this feature.

### Backend components

**`AuthController` (modified)** — adds three public routes guarded by the throttler:

```ts
@Post('/password-reset/request')   requestReset(@Body() dto: RequestPasswordResetDto): Promise<{ message: string }>
@Post('/password-reset/validate')  validate(@Body() dto: ValidateResetTokenDto): Promise<{ status: 'valid' | 'invalid' | 'expired' }>
@Post('/password-reset/confirm')   confirm(@Body() dto: ConfirmPasswordResetDto): Promise<{ message: string }>
```

**`AuthService` (modified)** — adds the reset business logic:

```ts
requestReset(email: string): Promise<void>
validateResetToken(token: string): Promise<'valid' | 'invalid' | 'expired'>
setNewPassword(token: string, newPassword: string): Promise<void>
// private helpers:
private generateResetToken(): { plaintext: string; hash: string }   // crypto.randomBytes + sha256
private hashResetToken(plaintext: string): string                   // sha256 hex digest
```

**DTOs (new)** — `RequestPasswordResetDto`, `ValidateResetTokenDto`, `ConfirmPasswordResetDto` (defined above).

**Throttler guards (new)** — named/custom `ThrottlerGuard` configurations keyed by email, IP, and invalid-token-by-IP (Req 8.2–8.4).

**`SharedService` (reused, unchanged)** — `hashPassword`, `comparePassword`, `isTokenExpired`, `sendZeptoEmail` / `sendMail`.

### Frontend components

**`requestModule` (`src/lib/requests/password-reset.request.ts`, new)**:

```ts
requestPasswordReset(email: string): Promise<void>
validateResetToken(token: string): Promise<'valid' | 'invalid' | 'expired'>
submitNewPassword(token: string, newPassword: string): Promise<void>
```

**Models (new)** — `PasswordResetRequestModel`, `PasswordResetConfirmModel` (extend `BaseModel`).

**Pages (new)** — `ResetRequestPage.vue`, `ResetConfirmationPage.vue`.

**`SigninPage.vue` (modified)** — adds the manager-only "Forgot password?" control.

**`UrlPathsEnum` (modified)** — adds the three `PASSWORD_RESET_*` entries.

**`routes.ts` (modified)** — adds the two public `/auth` children.

## Data Models

### `Token` (existing, with additive change)

```ts
@Entity()
export class Token {
  // … existing columns …
  @Column({ type: 'numeric' }) expiry: number;            // seconds (1800 for reset)
  @Column({ type: 'enum', enum: TokenCreationPurpose }) purpose: TokenCreationPurpose;
  @Column({ type: 'varchar' }) valueOfToken: string;      // sha256 hash for reset tokens

  // NEW (migration): null until the token is consumed
  @Column({ type: 'timestamptz', nullable: true }) usedAt: Date | null;
}
```

A migration adds the nullable `usedAt` column. No data backfill is needed (existing rows default to `null`, i.e. unused).

### `ProjectUserPassword` (existing, unchanged)

`setNewPassword` updates the `password` (hash) column for the matching `userId`. No schema change.

## Error Handling

| Scenario | Backend | Frontend |
|---|---|---|
| Invalid email format | n/a (blocked client-side) | "Please enter a valid email", no API call (Req 2.2) |
| Email not found | `200` standard message, no email | shows standard confirmation (Req 2.5–2.7) |
| Token not found / used / expired (validate) | `200 { status }` | `[link-error]` with request-new-reset link (Req 4.6) |
| Token not found / used / expired (confirm) | `400 { type: 'INVALID_RESET_TOKEN' }`, no password change | `[link-error]` (Req 6, 7.2) |
| Weak password (confirm) | `400 { type: 'WEAK_PASSWORD', message }` | field message, inputs retained (Req 7.3) |
| Rate limited | `429`, generic body | "Something went wrong. Please try again." / generic notice (Req 8.5) |
| Network/server failure | n/a | "Something went wrong. Please try again.", allow resubmit (Req 7.4) |

## Correctness Properties

These are the invariants the implementation must preserve; they drive the property-based and unit tests below.

### Property 1: Token confidentiality
For every issued reset token, the value persisted in `Token.valueOfToken` equals `sha256(plaintext)` and is never equal to the plaintext token.

**Validates: Requirements 3.2**

### Property 2: Token entropy
Every generated plaintext token derives from at least 128 bits of cryptographically secure randomness.

**Validates: Requirements 3.1**

### Property 3: Single active token per user
After issuing a reset token for a user, at most one unused, unexpired `RESET_PASSWORD` token exists for that user.

**Validates: Requirements 3.4**

### Property 4: Validity-window correctness
`validateResetToken` (and the confirm guard) treat a token as expired exactly when `now ≥ createdAt + expiry seconds`, and otherwise classify by found/used state.

**Validates: Requirements 3.3, 4.2, 4.3, 4.4, 4.5, 6.2**

### Property 5: Single use
A token that has been successfully consumed (`usedAt != null`) can never again validate as `valid` or be accepted by `setNewPassword`; concurrent confirms succeed at most once.

**Validates: Requirements 5.7, 6.1**

### Property 6: No password change on rejection
Any rejected `setNewPassword` (invalid/used/expired token, or weak password) leaves the target `ProjectUserPassword` hash unchanged.

**Validates: Requirements 6.1, 6.2, 6.3, 7.3**

### Property 7: Password-policy equivalence
A password is accepted iff it is ≥8 characters and contains at least one uppercase, one lowercase, one digit, and one special character — and the frontend and backend apply the same predicate.

**Validates: Requirements 5.2, 5.3, 5.6**

### Property 8: Confirmation match
The confirm step proceeds iff `confirmPassword === newPassword`.

**Validates: Requirements 5.4**

### Property 9: Enumeration indistinguishability
For any email, the `request` response is identical in status code and body regardless of whether the account exists.

**Validates: Requirements 2.5, 2.6, 2.7, 8.1**

### Property 10: Idempotent UI messaging
The Reset Request Page shows the standard confirmation message on every resolved response, never revealing account existence.

**Validates: Requirements 2.7**

## Testing Strategy

### Backend (Jest, `*.spec.ts`)

Unit tests for `AuthService` reset methods using a mocked `DataSource`/`EntityManager` and `SharedService`:

- **Token generation (Req 3):** generated plaintext has ≥128 bits entropy (≥32 bytes); stored `valueOfToken` equals `sha256(plaintext)` and never the plaintext; `expiry` = 1800; issuing a second token marks the prior unused token used (Req 3.4).
- **Request enumeration (Req 2.5, 2.6, 8.1):** matching and non-matching emails both resolve to the standard message; no email is sent for non-matching; response shape identical.
- **Validate (Req 4.2–4.5):** valid → `valid`; unknown hash → `invalid`; expired `createdAt+expiry` → `expired`; `usedAt` set → `invalid`.
- **Confirm (Req 5.6, 5.7, 6.1–6.3):** valid token updates the hash and sets `usedAt`; used/expired/unknown token rejects and leaves `ProjectUserPassword` unchanged; concurrent confirm only succeeds once (conditional update affected-rows check).
- **Password policy (Req 5.6 / 7.3):** DTO validation rejects too-short and missing-class passwords with the specified messages.

### Property-based tests (high-value invariants)

Use a property-based approach (e.g. `fast-check`) for invariants that should hold across large input spaces:

- **Token hashing invariant:** for any random token bytes, the stored value is the deterministic `sha256` digest and is never equal to the plaintext, and distinct tokens almost never collide.
- **Password-policy invariant:** for generated strings, the DTO/regex accepts a string **iff** it is ≥8 chars and contains at least one each of upper, lower, digit, and special — cross-checked against an independent predicate.
- **Expiry monotonicity:** for any issuance time and `now`, `validateResetToken` reports `expired` exactly when `now ≥ createdAt + expiry`, and `valid`/`invalid` otherwise per used/found state.

### Frontend

- **Model validation:** `PasswordResetRequestModel` rejects malformed emails with "Please enter a valid email"; `PasswordResetConfirmModel` enforces length and character-class messages; confirm-match logic yields "Passwords do not match".
- **Page behavior:** Reset Request shows the standard confirmation on success and does not call the API on invalid email; Reset Confirmation renders `[link-error]` on `invalid`/`expired` validation, shows the success view and sign-in control on success, and retains inputs on weak-password rejection.
- **Accessibility checks:** inputs have associated labels, error text is field-associated, status regions use `aria-live`, and the visibility toggle exposes a state-reflecting accessible name.

Manual verification: full end-to-end run against a dev backend (request → email link → validate → set password → sign in with the new password), plus expired/used-token link behavior.

## Security Considerations

- **No plaintext token at rest** — only `sha256` digests are stored (Req 3.2).
- **High-entropy tokens** — 256-bit `crypto.randomBytes` (Req 3.1).
- **Single-use + time-limited** — `usedAt` flag plus `createdAt + expiry` window, enforced transactionally at confirm time (Req 6).
- **Enumeration resistance** — identical responses and timing equalization on `request` (Req 8.1); known best-effort limitation documented.
- **Rate limiting** — per-email, per-IP, and per-invalid-token throttles (Req 8.2–8.5).
- **Reset endpoints are unauthenticated by necessity**, so rate limiting and token entropy are the primary abuse controls; this is called out explicitly because the endpoints accept input from anonymous clients.
- **Password reset does not auto-sign-in** the user; they are directed to the sign-in page (Req 7.1), avoiding session establishment from the reset flow.

## Open Questions / Assumptions

1. **Email provider:** assumes the existing `SharedService` email path (Zepto/SendGrid) is configured in the target environment; the reset email reuses it rather than adding a provider.
2. **Frontend origin for links:** assumes a `FRONTEND_BASE_URL` (or existing app URL env) is available to build the reset link.
3. **Throttler store:** initial implementation uses the in-memory throttler store; a shared store is recommended before multi-instance production deployment.
4. **Timing equalization** on the request endpoint is best-effort (fixed floor + non-blocking email), not a formal constant-time guarantee.
