# Requirements Document

## Introduction

The Field Visits feature adds a dedicated page to the WastePro operator app that helps field officers, admins, and super-admins identify property subscribers who owe money (arrears > 0) and log in-person visits to those properties. The page surfaces an indebted-properties list with contact details, supports tap-to-call via `tel:` links, and lets authorised users record a visit log against any listed property. Each property row shows when it was last contacted, and a "needs follow-up" filter highlights properties that have not been visited recently or never visited at all.

The feature also extends the existing role-based access control (RBAC) system with two new permissions (`field_visits:read` and `field_visits:log`), grants those permissions by default to the `field_officer`, `admin`, and `super_admin` roles, adds a new sidebar menu entry gated on those permissions, and adds a third branch to the post-sign-in redirect so that `field_officer` users land on the Field Visits page.

The page must be responsive enough to be primarily usable on a mobile phone in the field while remaining fully usable on a manager's desktop browser.

## Glossary

- **WastePro Operator App**: The Quasar/Vue 3 + Pinia + TypeScript frontend application used by waste-management staff (super-admins, admins, billing officers, field officers, etc.). Backed by a NestJS + TypeORM + PostgreSQL API.
- **Field Visits Page**: The new authenticated page introduced by this feature, mounted at the route path `/field-visits`.
- **Field Visits API**: The set of new backend endpoints introduced by this feature for listing indebted properties scoped to field-visit context and for managing visit logs.
- **Field Officer**: An entity user holding the seeded `field_officer` role.
- **Sidebar**: The navigation panel rendered by the authenticated layout (the existing `RbacNavigation` component), which currently lists Dashboard, Properties & Billings, Payments, and Settings.
- **Property Subscription**: A persisted record representing a serviced property. Has `propertySubscriptionName`, `street`, `streetNumber`, `entitySubscriberProfile` (custodian: `name`, `phone`, `phoneCode`), and `billingAccount` with `totalBillings` and `totalPayments`.
- **Custodian**: The natural person associated with a Property Subscription via `entitySubscriberProfile`. Has `name`, `phone`, and `phoneCode`.
- **Arrears**: For a given Property Subscription, the value `billingAccount.totalBillings - billingAccount.totalPayments`, expressed in the system currency (Naira).
- **Indebted Property**: A Property Subscription whose Arrears is strictly greater than zero.
- **Visit Log**: A persisted record describing a single in-person visit by a Field Officer to an Indebted Property. Captures the visiting officer, the Property Subscription, the server-set creation timestamp, an optional officer-set field date, an Outcome, and optional free-text notes.
- **Outcome**: An enumerated value attached to a Visit Log. Allowed values: `paid`, `promised_to_pay`, `not_home`, `refused`, `other`.
- **Last Contacted**: For a given Property Subscription, the creation timestamp of its most recent Visit Log, or null if no Visit Log exists for that Property Subscription.
- **Follow-Up Threshold (N)**: An integer number of days, configurable per filter session, that determines whether a Property Subscription "needs follow-up". Defaults to 7. Allowed range: 1 to 90 inclusive.
- **Needs Follow-Up**: A Property Subscription whose Last Contacted is null OR whose Last Contacted is older than `now - N days`, where `N` is the current Follow-Up Threshold.
- **RBAC Store**: The existing Pinia store `useRbacStore` that exposes `hasRole`, `hasPermission`, `hasAnyRole`, `isSuperAdmin`, etc.
- **Route Guard**: The existing router guard that supports `requireRoles` and `requireAnyRole`.
- **Sign-In Redirect**: The post-authentication redirect logic in `SigninPage.vue` that picks a landing route based on the current user's roles and permissions.
- **Field Visits Permission Set**: The two new permissions introduced by this feature: `field_visits:read` and `field_visits:log`.

## Requirements

### Requirement 1: New RBAC Permissions

**User Story:** As a system administrator, I want dedicated `field_visits:read` and `field_visits:log` permissions, so that access to the Field Visits page and the ability to record visits can be granted independently of other property and billing permissions.

#### Acceptance Criteria

1. THE WastePro Operator App SHALL define a permission named `field_visits:read` that authorises viewing the Field Visits Page and listing Indebted Properties via the Field Visits API.
2. THE WastePro Operator App SHALL define a permission named `field_visits:log` that authorises creating a new Visit Log via the Field Visits API.
3. WHEN the seeded role catalog is initialised or re-synchronised, THE WastePro Operator App SHALL grant `field_visits:read` and `field_visits:log` to the `field_officer`, `admin`, and `super_admin` roles by default.
4. WHEN the seeded role catalog is initialised or re-synchronised, THE WastePro Operator App SHALL NOT grant `field_visits:read` or `field_visits:log` to the `billing_officer`, `customer_service`, or `viewer` roles by default.
5. WHERE an administrator has assigned `field_visits:read` or `field_visits:log` to a custom role, THE WastePro Operator App SHALL preserve only the specific permission that was assigned across subsequent seed re-runs and SHALL NOT auto-grant the other permission.
6. IF a user lacks `field_visits:read`, THEN THE Field Visits API SHALL reject requests to list Indebted Properties with HTTP 403.
7. IF a user lacks `field_visits:log`, THEN THE Field Visits API SHALL reject requests to create a Visit Log with HTTP 403.

### Requirement 2: Sidebar Menu Entry

**User Story:** As a field officer, admin, or super-admin, I want a "Field Visits" entry in the sidebar, so that I can navigate to the Field Visits Page from anywhere in the app.

#### Acceptance Criteria

1. WHEN the authenticated layout sidebar is rendered, THE Sidebar SHALL display a "Field Visits" item with a route target of `/field-visits` for any signed-in user holding at least one of the roles `field_officer`, `admin`, or `super_admin`.
2. WHEN the authenticated layout sidebar is rendered for a signed-in user holding none of the roles `field_officer`, `admin`, or `super_admin`, THE Sidebar SHALL NOT display the "Field Visits" item AND THE Route Guard SHALL block direct navigation to `/field-visits` for the same user as specified in Requirement 3.
3. WHEN the user is on the route `/field-visits`, THE Sidebar SHALL render the "Field Visits" item in its active/selected state for users holding at least one of `field_officer`, `admin`, or `super_admin`.
4. THE Sidebar SHALL render the "Field Visits" item with an icon distinct from existing sidebar items.

### Requirement 3: Route and Route Guard

**User Story:** As a security-conscious operator, I want the `/field-visits` route protected by the existing route guard, so that only authorised users can reach the page even by typing the URL directly.

#### Acceptance Criteria

1. THE WastePro Operator App SHALL register an authenticated route at the path `/field-visits` that renders the Field Visits Page.
2. THE Route Guard SHALL allow navigation to `/field-visits` only for signed-in users holding at least one of the roles `field_officer`, `admin`, or `super_admin`.
3. IF an unauthenticated user navigates to `/field-visits`, THEN THE Route Guard SHALL redirect the user to the sign-in page.
4. IF a signed-in user lacking any of the roles `field_officer`, `admin`, or `super_admin` navigates to `/field-visits`, THEN THE Route Guard SHALL redirect the user to `/unauthorized`.
5. IF the route guard redirect fails or is bypassed for any reason, THEN THE Field Visits Page SHALL perform a secondary client-side authorisation check on mount and SHALL NOT render the indebted-properties list or visit-log controls when the current user is not authenticated or lacks any of the roles `field_officer`, `admin`, or `super_admin`.

### Requirement 4: Sign-In Redirect for Field Officers

**User Story:** As a field officer, I want to land on the Field Visits Page immediately after signing in, so that I can start working without extra navigation.

#### Acceptance Criteria

1. WHEN a user successfully signs in via the manager sign-in form and the RBAC Store reports the user holds the `super_admin` role, THE Sign-In Redirect SHALL navigate the user to `/dashboard` regardless of any other roles the user holds.
2. WHEN a user successfully signs in via the manager sign-in form, the user does not hold `super_admin`, and the RBAC Store reports the user holds the `field_officer` role, THE Sign-In Redirect SHALL navigate the user to `/field-visits` regardless of any other non-`super_admin` roles the user holds.
3. WHEN a user successfully signs in via the manager sign-in form, the user does not hold `super_admin` or `field_officer`, and the RBAC Store reports the user has `properties:read` or `billing:read`, THE Sign-In Redirect SHALL navigate the user to `/properties-billings`.
4. WHEN a user successfully signs in via the manager sign-in form and the RBAC Store reports the user has none of `super_admin`, `field_officer`, `properties:read`, or `billing:read` but has `payments:read`, THE Sign-In Redirect SHALL navigate the user to `/payments`.
5. WHEN a user successfully signs in via the manager sign-in form and the RBAC Store reports none of the above conditions, THE Sign-In Redirect SHALL navigate the user to `/settings`.
6. THE Sign-In Redirect SHALL evaluate the redirect target only after the RBAC Store has successfully loaded the current user's roles and permissions.

### Requirement 5: Page Rendering and Initial Data Load

**User Story:** As a field officer, I want the Field Visits Page to load and show me the list of indebted properties as soon as I open it, so that I can start triaging without configuring filters.

#### Acceptance Criteria

1. WHEN the Field Visits Page mounts, THE Field Visits Page SHALL request the list of Indebted Properties from the Field Visits API with default sort and the default Follow-Up Threshold of 7 days applied to the "Needs Follow-Up" filter in disabled state.
2. WHILE the initial Indebted Properties request is in flight, THE Field Visits Page SHALL display a loading indicator in place of the list.
3. WHEN the Indebted Properties request returns successfully with at least one row, THE Field Visits Page SHALL render the rows in a list/table view.
4. WHEN the Indebted Properties request returns successfully with zero rows, THE Field Visits Page SHALL display an empty-state message stating that no indebted properties match the current filters.
5. IF the Indebted Properties request fails, THEN THE Field Visits Page SHALL display an error message and a "Retry" control that re-issues the request when activated.
7. WHEN the Indebted Properties request returns successfully, THE Field Visits Page SHALL hide any error message and "Retry" control previously displayed.
6. THE Field Visits Page SHALL display, above the list, a header that includes the count of currently displayed Indebted Properties and the sum of their Arrears.

### Requirement 6: Indebted Properties Listing Scope

**User Story:** As a field officer, I want the page to only show properties that actually owe money, so that I do not waste time visiting fully-paid subscribers.

#### Acceptance Criteria

1. THE Field Visits API SHALL return only Property Subscriptions whose Arrears is strictly greater than zero when servicing the Field Visits Page list endpoint.
2. THE Field Visits API SHALL compute Arrears as `billingAccount.totalBillings - billingAccount.totalPayments`.
3. THE Field Visits Page SHALL NOT render a control that lets the user include Property Subscriptions with non-positive Arrears.
4. WHEN a Property Subscription's Arrears transitions from positive to zero or negative, THE Field Visits API SHALL exclude that Property Subscription from subsequent Indebted Properties responses.

### Requirement 7: Row Content

**User Story:** As a field officer in the field, I want each row to show me the property identity, the custodian to contact, how much is owed, and how recently they were visited, so that I can decide who to call or visit next.

#### Acceptance Criteria

1. THE Field Visits Page SHALL display, for each Indebted Property row, the `propertySubscriptionName`, the `street` name, and the `streetNumber`.
2. THE Field Visits Page SHALL display, for each Indebted Property row, the custodian's `name` and a tap-to-call control bound to a `tel:` URL composed from `phoneCode` and `phone`.
3. THE Field Visits Page SHALL display, for each Indebted Property row, the Arrears amount formatted as Naira currency.
4. THE Field Visits Page SHALL display, for each Indebted Property row, the Last Contacted value as a relative date (e.g., "3 days ago"), or the literal string "Never" when Last Contacted is null.
5. THE Field Visits Page SHALL display, for each Indebted Property row, an action control that opens the Visit Logging Dialog for that Property Subscription.
6. WHERE the custodian phone number is missing or empty, THE Field Visits Page SHALL render the tap-to-call control in a disabled state with a tooltip indicating that no phone number is on file.
7. WHEN a tap-to-call control is activated and the custodian phone number is non-empty, THE Field Visits Page SHALL initiate a `tel:` link using the concatenation of `phoneCode` (without spaces) and `phone` (without spaces).
8. IF a tap-to-call control is activated while the custodian phone number is missing or empty, THEN THE Field Visits Page SHALL NOT initiate a `tel:` link.

### Requirement 8: Sorting

**User Story:** As a field officer, I want to sort the list by arrears, last contacted, or street, so that I can prioritise my route.

#### Acceptance Criteria

1. THE Field Visits Page SHALL support sorting the Indebted Properties list by Arrears (ascending and descending).
2. THE Field Visits Page SHALL support sorting the Indebted Properties list by Last Contacted (ascending and descending), treating null Last Contacted as older than every non-null value.
3. THE Field Visits Page SHALL support sorting the Indebted Properties list by `street` then `streetNumber` (ascending only).
4. THE Field Visits Page SHALL default the sort to Arrears descending on initial load.
5. WHEN the user changes the sort, THE Field Visits Page SHALL re-render the list in the new order and SHALL issue at most one Field Visits API request per sort change, in addition to any retry request issued to recover from a failed prior load.

### Requirement 9: Filtering — Search and Street

**User Story:** As a field officer, I want to search by property name, custodian name, or street, so that I can quickly find a specific property in a long list.

#### Acceptance Criteria

1. THE Field Visits Page SHALL provide a free-text search input that filters the displayed Indebted Properties by case-insensitive substring match against `propertySubscriptionName`, custodian `name`, `street`, and `streetNumber`.
2. WHEN the search input value changes, THE Field Visits Page SHALL re-evaluate the filter no later than 300ms after the user stops typing.
3. THE Field Visits Page SHALL provide a street selector that filters the displayed Indebted Properties to a single street when a street is selected.
4. WHEN the search input is empty and no street is selected, THE Field Visits Page SHALL display every Indebted Property returned by the most recent successful Field Visits API response.
5. THE Field Visits Page SHALL display a visible count of currently visible rows and SHALL update that count whenever the search or street filter changes.

### Requirement 10: Filtering — Needs Follow-Up

**User Story:** As a field officer, I want to surface only properties that have not been contacted recently, so that I can focus on the ones that are overdue for a visit.

#### Acceptance Criteria

1. THE Field Visits Page SHALL provide a toggle labelled "Needs follow-up" that, when enabled, restricts the displayed Indebted Properties to those whose Last Contacted is null OR older than `now - N days`, where `N` is the current Follow-Up Threshold.
2. THE Field Visits Page SHALL provide a numeric input for the Follow-Up Threshold `N` that accepts integer values from 1 to 90 inclusive.
3. WHEN the Field Visits Page first mounts, THE Field Visits Page SHALL initialise the Follow-Up Threshold to 7 and the "Needs follow-up" toggle to disabled.
4. WHEN the user enters a value outside the range 1 to 90 in the Follow-Up Threshold input, THE Field Visits Page SHALL clamp the value to the nearest endpoint of that range and display a brief inline notice describing the adjustment.
5. WHEN the "Needs follow-up" toggle is enabled, THE Field Visits Page SHALL re-evaluate the filter whenever the Follow-Up Threshold changes.
6. WHEN the "Needs follow-up" toggle is disabled, THE Field Visits Page SHALL display every Indebted Property that satisfies the search and street filters regardless of Last Contacted.
7. THE Field Visits Page SHALL persist the Follow-Up Threshold and toggle state for the duration of a single browser session and reset them on page reload.

### Requirement 11: Visit Logging Dialog

**User Story:** As a field officer, I want a quick dialog to record the result of a visit, so that I can capture outcomes without leaving the list.

#### Acceptance Criteria

1. WHEN the user activates the visit-log action on an Indebted Property row, THE Field Visits Page SHALL open a modal dialog scoped to that Property Subscription.
2. THE Visit Logging Dialog SHALL display the target Property Subscription's `propertySubscriptionName`, `street`, `streetNumber`, custodian `name`, and current Arrears as read-only context.
3. THE Visit Logging Dialog SHALL provide a single-select Outcome control whose options are exactly `paid`, `promised_to_pay`, `not_home`, `refused`, and `other`.
4. THE Visit Logging Dialog SHALL provide an optional date input labelled "Field date" that defaults to the current local date.
5. THE Visit Logging Dialog SHALL provide an optional multi-line notes input that accepts up to 500 characters.
6. THE Visit Logging Dialog SHALL display a live character counter for the notes input.
7. IF the user attempts to submit the Visit Logging Dialog without selecting an Outcome, THEN THE Visit Logging Dialog SHALL display an inline validation error and SHALL NOT submit the request.
8. IF the user attempts to submit the Visit Logging Dialog with a notes value longer than 500 characters, THEN THE Visit Logging Dialog SHALL display an inline validation error and SHALL NOT submit the request.
9. IF the user attempts to submit the Visit Logging Dialog with a "Field date" later than the current local date, THEN THE Visit Logging Dialog SHALL display an inline validation error and SHALL NOT submit the request.
10. WHEN the user submits a valid Visit Logging Dialog, THE Field Visits Page SHALL send a create-Visit-Log request to the Field Visits API containing the Property Subscription identifier, the Outcome, the optional field date, and the optional notes.
11. WHILE a create-Visit-Log request is in flight, THE Visit Logging Dialog SHALL disable its submit and cancel controls and display a loading indicator on the submit control.
12. WHEN a create-Visit-Log request completes successfully, THE Field Visits Page SHALL close the dialog, display a success notification, and update the Last Contacted value for the affected row to the new Visit Log's creation timestamp without requiring a full page reload.
13. IF a create-Visit-Log request fails, THEN THE Visit Logging Dialog SHALL remain open, re-enable its controls, and display an error message describing the failure.

### Requirement 12: Visit Log Persistence and Authorship

**User Story:** As a system owner, I want every visit log to be tied to the officer who created it and timestamped by the server, so that we have a trustworthy audit trail.

#### Acceptance Criteria

1. WHEN the Field Visits API receives a create-Visit-Log request, THE Field Visits API SHALL persist a Visit Log record containing the Property Subscription identifier, the authenticated user's `entity_user_profile` identifier as the visiting officer, the server's current UTC timestamp as the creation timestamp, the submitted Outcome, the submitted field date if provided, and the submitted notes if provided.
2. THE Field Visits API SHALL ignore any client-supplied creation timestamp on a create-Visit-Log request and use the server's current UTC timestamp instead.
3. THE Field Visits API SHALL ignore any client-supplied visiting-officer identifier on a create-Visit-Log request and use the authenticated user's `entity_user_profile` identifier instead.
4. THE Field Visits API SHALL reject create-Visit-Log requests whose Outcome is not one of `paid`, `promised_to_pay`, `not_home`, `refused`, or `other` with HTTP 400.
5. THE Field Visits API SHALL reject create-Visit-Log requests whose notes value exceeds 500 characters with HTTP 400.
6. THE Field Visits API SHALL reject create-Visit-Log requests whose Property Subscription identifier does not resolve to an existing Property Subscription with HTTP 404.
7. THE Field Visits API SHALL reject create-Visit-Log requests whose field date is later than the server's current UTC date with HTTP 400.

### Requirement 13: Last Contacted Surfacing

**User Story:** As a field officer, I want each property's "last contacted" value to reflect the most recent visit log, so that the page tells me an accurate story about my recent activity.

#### Acceptance Criteria

1. WHEN the Field Visits API returns the list of Indebted Properties, THE Field Visits API SHALL include, for each row, the creation timestamp of that Property Subscription's most recent Visit Log, or null if no Visit Log exists for that Property Subscription.
2. THE Field Visits API SHALL determine "most recent" using the server-set creation timestamp, not the officer-set field date.
3. WHEN a new Visit Log is created for a Property Subscription, THE Field Visits API SHALL ensure that the next Indebted Properties response reports the new Visit Log's creation timestamp as Last Contacted for that row.

### Requirement 14: Audit Visibility and Deletion Constraints

**User Story:** As a super-admin, I want visit logs to be immutable from the field officer's perspective and only deletable by me, so that the audit trail is reliable.

#### Acceptance Criteria

1. THE Field Visits API SHALL NOT expose an endpoint that allows users holding only `field_visits:log` and/or `field_visits:read` to update or delete an existing Visit Log.
2. WHERE a user holds the `super_admin` role, THE Field Visits API SHALL allow that user to hard-delete a Visit Log via an admin-scoped endpoint.
3. IF a user lacking `super_admin` invokes the admin-scoped Visit Log delete endpoint, THEN THE Field Visits API SHALL respond with HTTP 403.
4. WHEN a Visit Log is hard-deleted by a super-admin, THE Field Visits API SHALL recompute Last Contacted for the affected Property Subscription using the next-most-recent surviving Visit Log, or null if none survives.

### Requirement 15: Mobile and Desktop Responsiveness

**User Story:** As a field officer using a phone in the field, I want the page to be comfortable to use on a small screen, while my manager still wants it to look right on a laptop.

#### Acceptance Criteria

1. WHEN the Field Visits Page is rendered at a viewport width of 360px, THE Field Visits Page SHALL display each Indebted Property as a stacked card showing property identity, custodian, arrears, last contacted, tap-to-call, and visit-log action without horizontal scrolling of the row content.
2. WHEN the Field Visits Page is rendered at a viewport width of 1280px or greater, THE Field Visits Page SHALL display the Indebted Properties as a tabular layout with sortable column headers.
3. WHEN the viewport width crosses the threshold between mobile and desktop layouts, THE Field Visits Page SHALL preserve the user's current sort order, sort direction, search input value, street filter selection, Needs Follow-Up toggle state, and Follow-Up Threshold value.
4. THE Field Visits Page SHALL render all interactive controls with a minimum touch target size of 44 by 44 CSS pixels at viewport widths of 768px or less.
5. THE Visit Logging Dialog SHALL render full-screen at viewport widths of 600px or less and as a centred modal at viewport widths greater than 600px.
6. THE Field Visits Page SHALL keep the search input, street filter, and Needs Follow-Up controls visible and reachable without horizontal scrolling at viewport widths of 360px or greater.

### Requirement 16: Pagination and Performance

**User Story:** As a manager, I want the page to remain responsive even when there are thousands of indebted properties, so that I do not have to wait or crash my browser.

#### Acceptance Criteria

1. THE Field Visits API SHALL accept `page` and `limit` query parameters on the Indebted Properties list endpoint, with `limit` constrained to the inclusive range 1 to 200.
2. WHEN the Field Visits Page issues an Indebted Properties request, THE Field Visits Page SHALL request a `limit` no greater than 200.
3. WHEN the Field Visits API receives an Indebted Properties request without an explicit `limit`, THE Field Visits API SHALL apply a default `limit` of 50.
4. WHEN the total Indebted Properties count would result in 3 or more pages at the current page size, THE Field Visits Page SHALL display pagination controls that allow the user to navigate to the next and previous pages.
7. WHEN the total Indebted Properties count would result in fewer than 3 pages at the current page size, THE Field Visits Page SHALL NOT display pagination controls.
5. WHEN the user navigates to a different page, THE Field Visits Page SHALL preserve the current sort, search, street filter, and Needs Follow-Up filter state on the new page request.
6. WHEN the Field Visits API receives an Indebted Properties request with a `limit` greater than 200, THE Field Visits API SHALL respond with HTTP 400.

### Requirement 17: Logging and Server-Side Audit

**User Story:** As a security officer, I want every visit-log creation to be auditable on the server, so that we can investigate disputes or anomalies after the fact.

#### Acceptance Criteria

1. WHEN the Field Visits API persists a new Visit Log, THE Field Visits API SHALL emit a structured server-side audit log entry containing the Visit Log identifier, the visiting officer identifier, the Property Subscription identifier, the Outcome, and the server-set creation timestamp.
2. WHEN a super-admin hard-deletes a Visit Log, THE Field Visits API SHALL emit a structured server-side audit log entry containing the deleted Visit Log identifier, the acting super-admin identifier, the Property Subscription identifier, and the server-set deletion timestamp.
3. THE Field Visits API SHALL NOT include free-text Visit Log notes in audit log entries.

### Requirement 18: Authentication on All Field Visits API Endpoints

**User Story:** As a security-conscious operator, I want every Field Visits API endpoint to require authentication, so that no anonymous caller can read indebted-property data or create visit logs.

#### Acceptance Criteria

1. IF a request to any Field Visits API endpoint arrives without a valid authentication token, THEN THE Field Visits API SHALL respond with HTTP 401.
2. THE Field Visits API SHALL apply the same authentication middleware that protects existing authenticated endpoints in the WastePro Operator App backend.
3. IF a request to any Field Visits API endpoint arrives with an expired authentication token, THEN THE Field Visits API SHALL respond with HTTP 401.
4. IF the authentication middleware is unavailable or fails to evaluate a request, THEN THE Field Visits API SHALL fail closed and respond with HTTP 401 or HTTP 500 and SHALL NOT execute the requested handler.
