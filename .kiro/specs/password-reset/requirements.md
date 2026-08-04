# Requirements Document

## Introduction

This feature adds self-service password reset for Waste Manager accounts on the WastePro platform. Waste Manager accounts authenticate with an email address and password (the email/password sign-in path on `SigninPage.vue`), unlike Service Client accounts which authenticate with a property code and phone number and have no password. Password reset therefore applies only to Waste Manager (email/password) accounts.

The feature spans two repositories:

- **Frontend (`lawma_app`)**: A Quasar (Vue 3) PWA. Adds a "Forgot password?" entry point on the sign-in page, a request-reset page (enter email), and a reset-confirmation page (enter and confirm a new password using a token from an emailed link). Validation uses `class-validator` models extending `BaseModel`; API calls go through the `api` axios instance (`src/boot/axios.ts`).
- **Backend (`mother-ship-nest`)**: A NestJS app with an `AuthController` at `/auth`. Adds endpoints to request a reset, validate a reset token, and set a new password. Passwords are hashed and stored in the `ProjectUserPassword` entity.

The flow is: a user requests a reset by email → the backend generates a single-use, time-limited token and emails a reset link → the user opens the link and is taken to the reset-confirmation page → the user submits a new password → the backend validates the token, updates the password hash, and invalidates the token.

The requirements below cover requesting a reset, secure token generation and expiry, validating the reset link, setting a new password with strength rules and confirmation, success and error feedback, security (account enumeration resistance, single-use and expiring tokens, rate limiting), and accessibility.

## Glossary

- **WastePro**: The waste management platform comprising the `lawma_app` frontend and `mother-ship-nest` backend.
- **Waste_Manager_Account**: A user account that authenticates with an email address and password and has an associated `ProjectUserPassword` record.
- **Frontend**: The `lawma_app` Quasar (Vue 3) PWA application.
- **Reset_Request_Page**: The frontend page where a user enters their email address to request a password reset.
- **Reset_Confirmation_Page**: The frontend page, opened from the emailed reset link, where a user enters and confirms a new password.
- **Signin_Page**: The existing `SigninPage.vue` frontend page that hosts the "Forgot password?" entry point.
- **Auth_Service**: The `mother-ship-nest` backend service (`AuthService` / `AuthController` at `/auth`) responsible for authentication and password operations.
- **Reset_Token**: A cryptographically generated, single-use, time-limited credential issued by the Auth_Service and embedded in the emailed reset link.
- **Reset_Link**: A URL containing the Reset_Token that directs the user to the Reset_Confirmation_Page.
- **Token_Hash**: The hashed form of a Reset_Token persisted by the Auth_Service; the plaintext Reset_Token is never stored.
- **Email_Service**: The component used by the Auth_Service to send the Reset_Link to a user's email address.
- **Password_Policy**: The set of rules a new password must satisfy (minimum length 8 characters; at least one uppercase letter, one lowercase letter, one digit, and one special character).
- **Password_Hash**: The hashed password value stored in the `ProjectUserPassword` entity.
- **Account_Enumeration**: The ability of an attacker to determine whether a given email address corresponds to an existing account based on differences in system responses.
- **Token_Validity_Window**: The 30-minute period after issuance during which a Reset_Token is accepted.

## Requirements

### Requirement 1: Forgot Password Entry Point

**User Story:** As a Waste Manager, I want a "Forgot password?" link on the sign-in page, so that I can begin resetting my password when I cannot remember it.

#### Acceptance Criteria

1. WHERE the Waste Manager sign-in path is active on the Signin_Page, THE Frontend SHALL display a "Forgot password?" control.
2. WHEN the user activates the "Forgot password?" control, THE Frontend SHALL navigate to the Reset_Request_Page.
3. WHERE the Service Client sign-in path is active on the Signin_Page, THE Frontend SHALL NOT display the "Forgot password?" control.

### Requirement 2: Request a Password Reset

**User Story:** As a Waste Manager, I want to submit my email address to request a password reset, so that I receive a link to set a new password.

#### Acceptance Criteria

1. THE Reset_Request_Page SHALL provide an email address input field and a submit control.
2. WHEN the user submits the Reset_Request_Page with a value that is not a valid email format, THE Frontend SHALL display the validation message "Please enter a valid email" and SHALL NOT send a request to the Auth_Service.
3. WHEN the user submits the Reset_Request_Page with a valid email format, THE Frontend SHALL send a reset request containing the email address to the Auth_Service.
4. WHEN the Auth_Service receives a reset request for an email address that matches an existing Waste_Manager_Account, THE Auth_Service SHALL generate a Reset_Token and send a Reset_Link to that email address via the Email_Service.
5. WHEN the Auth_Service receives a reset request for an email address that does not match any Waste_Manager_Account, THE Auth_Service SHALL NOT send any email and SHALL return the same response as for a matching account.
6. WHEN the Auth_Service completes processing of a reset request, THE Auth_Service SHALL return a success response that does not reveal whether the email address matches an existing account.
7. WHEN the Frontend receives the response to a reset request, THE Frontend SHALL display the confirmation message "If an account exists for that email, a reset link has been sent."

### Requirement 3: Secure Reset Token Generation and Storage

**User Story:** As a platform operator, I want reset tokens to be unguessable and stored securely, so that attackers cannot forge or steal them to take over accounts.

#### Acceptance Criteria

1. WHEN the Auth_Service generates a Reset_Token, THE Auth_Service SHALL produce the token using a cryptographically secure random generator with at least 128 bits of entropy.
2. WHEN the Auth_Service persists a Reset_Token, THE Auth_Service SHALL store the Token_Hash and SHALL NOT store the plaintext Reset_Token.
3. WHEN the Auth_Service generates a Reset_Token, THE Auth_Service SHALL record an expiry timestamp set to 30 minutes after issuance as the end of the Token_Validity_Window.
4. WHEN the Auth_Service generates a Reset_Token for a Waste_Manager_Account that already has an unused, unexpired Reset_Token, THE Auth_Service SHALL invalidate the previously issued Reset_Token.

### Requirement 4: Validate the Reset Link

**User Story:** As a Waste Manager, I want the reset link to be checked before I enter a new password, so that I am told early if the link is invalid or expired.

#### Acceptance Criteria

1. WHEN the user opens a Reset_Link, THE Frontend SHALL load the Reset_Confirmation_Page and request validation of the Reset_Token from the Auth_Service.
2. WHEN the Auth_Service receives a validation request for a Reset_Token that matches a stored, unused token within the Token_Validity_Window, THE Auth_Service SHALL return a valid-token response.
3. IF the Auth_Service receives a validation request for a Reset_Token that does not match any stored token, THEN THE Auth_Service SHALL return an invalid-token response.
4. IF the Auth_Service receives a validation request for a Reset_Token whose expiry timestamp has passed, THEN THE Auth_Service SHALL return an expired-token response.
5. IF the Auth_Service receives a validation request for a Reset_Token that has already been used, THEN THE Auth_Service SHALL return an invalid-token response.
6. IF the Frontend receives an invalid-token or expired-token response, THEN THE Frontend SHALL hide the new-password input fields and display a message offering a link to request a new reset.

### Requirement 5: Set a New Password with Strength Rules and Confirmation

**User Story:** As a Waste Manager, I want to enter and confirm a strong new password, so that my account is protected and I do not lock myself out with a typo.

#### Acceptance Criteria

1. THE Reset_Confirmation_Page SHALL provide a new-password input field and a confirm-password input field.
2. WHEN the user submits a new password shorter than 8 characters, THE Frontend SHALL display the validation message "Password must be at least 8 characters" and SHALL NOT send a request to the Auth_Service.
3. WHEN the user submits a new password that does not contain at least one uppercase letter, one lowercase letter, one digit, and one special character, THE Frontend SHALL display the validation message "Password must include uppercase, lowercase, a number, and a special character" and SHALL NOT send a request to the Auth_Service.
4. WHEN the user submits a confirm-password value that does not match the new-password value, THE Frontend SHALL display the validation message "Passwords do not match" and SHALL NOT send a request to the Auth_Service.
5. WHEN the user submits a new password that satisfies the Password_Policy and matches the confirm-password value, THE Frontend SHALL send the Reset_Token and the new password to the Auth_Service.
6. WHEN the Auth_Service receives a set-password request with a Reset_Token that matches a stored, unused token within the Token_Validity_Window and a password that satisfies the Password_Policy, THE Auth_Service SHALL compute a Password_Hash and update the `ProjectUserPassword` record for the associated Waste_Manager_Account.
7. WHEN the Auth_Service updates a Password_Hash, THE Auth_Service SHALL mark the corresponding Reset_Token as used.
8. WHERE a new-password input field is displayed, THE Frontend SHALL provide a control to toggle the visibility of the entered password.

### Requirement 6: Single-Use and Expiring Tokens at Set-Password Time

**User Story:** As a platform operator, I want a reset token to work only once and only within its validity window, so that an intercepted or reused link cannot change a password.

#### Acceptance Criteria

1. IF the Auth_Service receives a set-password request with a Reset_Token that has already been used, THEN THE Auth_Service SHALL reject the request and SHALL NOT change the Password_Hash.
2. IF the Auth_Service receives a set-password request with a Reset_Token whose expiry timestamp has passed, THEN THE Auth_Service SHALL reject the request and SHALL NOT change the Password_Hash.
3. IF the Auth_Service receives a set-password request with a Reset_Token that does not match any stored token, THEN THE Auth_Service SHALL reject the request and SHALL NOT change the Password_Hash.

### Requirement 7: Success and Error Feedback

**User Story:** As a Waste Manager, I want clear feedback after I submit a new password, so that I know whether the reset succeeded and what to do next.

#### Acceptance Criteria

1. WHEN the Auth_Service confirms a successful password update, THE Frontend SHALL display the confirmation message "Your password has been reset" and SHALL provide a control to navigate to the Signin_Page.
2. IF the Frontend receives a rejected set-password response caused by an invalid, used, or expired Reset_Token, THEN THE Frontend SHALL display a message offering a link to request a new reset.
3. IF the Frontend receives a rejected set-password response caused by a password that does not satisfy the Password_Policy, THEN THE Frontend SHALL display the validation message describing the unmet Password_Policy rule and SHALL retain the user's input fields for correction.
4. IF a network or server error prevents the Auth_Service from returning a response to a set-password request, THEN THE Frontend SHALL display the message "Something went wrong. Please try again." and SHALL allow the user to resubmit.
5. WHILE a reset request or set-password request is awaiting a response from the Auth_Service, THE Frontend SHALL display a loading indicator and SHALL disable the submit control.

### Requirement 8: Account Enumeration Resistance and Rate Limiting

**User Story:** As a platform operator, I want the reset flow to resist enumeration and abuse, so that attackers cannot discover accounts or overwhelm the system.

#### Acceptance Criteria

1. WHEN the Auth_Service responds to a reset request, THE Auth_Service SHALL return responses for matching and non-matching email addresses that are indistinguishable in status code, body, and observable response time.
2. WHEN the Auth_Service receives more than 5 reset requests for the same email address within a 15-minute period, THE Auth_Service SHALL reject additional reset requests for that email address until the period elapses.
3. WHEN the Auth_Service receives more than 10 reset requests from the same client IP address within a 15-minute period, THE Auth_Service SHALL reject additional reset requests from that IP address until the period elapses.
4. WHEN the Auth_Service receives more than 10 token-validation or set-password requests carrying an invalid Reset_Token from the same client IP address within a 15-minute period, THE Auth_Service SHALL reject additional such requests from that IP address until the period elapses.
5. IF the Auth_Service rejects a request due to a rate limit, THEN THE Auth_Service SHALL return a rate-limit response without revealing whether the email address matches an existing account.

### Requirement 9: Accessibility

**User Story:** As a Waste Manager who relies on assistive technology, I want the reset pages to be operable and perceivable, so that I can reset my password independently.

#### Acceptance Criteria

1. THE Reset_Request_Page and Reset_Confirmation_Page SHALL associate every input field with a programmatically linked text label.
2. WHEN the Frontend displays a validation or error message for an input field, THE Frontend SHALL associate the message with that input field so that assistive technology announces the message.
3. THE Reset_Request_Page and Reset_Confirmation_Page SHALL expose all interactive controls to keyboard operation in a logical focus order.
4. WHEN a page-level status message is displayed after a request completes, THE Frontend SHALL present the message in a live region so that assistive technology announces it without a focus change.
5. WHERE the password-visibility toggle control is displayed, THE Frontend SHALL provide an accessible name that reflects the current state of password visibility.
  