# Implementation Plan: Field Visits

## Overview

Convert the Field Visits design into a series of prompts for a code-generation LLM that will implement each step with incremental progress. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step. Focus ONLY on tasks that involve writing, modifying, or testing code.

The plan is split into seven implementation epics, a documentation epic, a tests epic, and a verification epic. Backend foundations (RBAC plumbing, entity, DTOs, migration) can run in parallel with frontend foundations (URL paths, events, request module). The frontend page and dialog only depend on the frontend store and handler — they do not block on the backend service implementation, because the service contract is fixed by the design's response shape. Property numbers refer to the design's "Correctness Properties" section (P1–P13, P-aux-1, P-aux-3). Backend and frontend live in two separate workspace roots: `lawma_app_backend/` and `lawma_app/`.

## Tasks

- [ ] 1. Backend RBAC foundations
  - [ ] 1.1 Add `RbacEnabledGuard`
    - File: `lawma_app_backend/src/shared/guards/rbacEnabled.guard.ts`
    - Implement a Nest `CanActivate` guard that throws `ServiceUnavailableException` (HTTP 503) when `process.env.RBAC_ENABLED !== 'true'` and returns `true` otherwise. Export it from the file as `RbacEnabledGuard`.
    - Do NOT modify the existing `PermissionGuard` short-circuit; this guard is purely additive and applied per-route in task 3.3.
    - _Requirements: 18.4 (fail-closed)_
    - _Exercises: P13_

  - [ ] 1.2 Register `field_visits:read` and `field_visits:log` permissions
    - File: `lawma_app_backend/src/shared/decorators/auth.decorators.ts`
    - Add `FIELD_VISITS_READ: 'field_visits:read'` and `FIELD_VISITS_LOG: 'field_visits:log'` to the `PERMISSIONS` const. Keep existing entries untouched.
    - _Requirements: 1.1, 1.2_

  - [ ] 1.3 Add `PermissionCategory.FIELD_OPERATIONS`
    - File: `lawma_app_backend/src/utils-billing/entitties/permission.entity.ts`
    - Add `FIELD_OPERATIONS = 'field_operations'` to the `PermissionCategory` enum. The corresponding `ALTER TYPE` SQL is emitted by the migration in task 2.3.
    - _Requirements: 1.1, 1.2_

- [ ] 2. Backend domain layer for visit logs
  - [ ] 2.1 Create `VisitLog` entity and `VisitOutcome` enum
    - File: `lawma_app_backend/src/utils-billing/entitties/visitLog.entity.ts`
    - Implement the entity exactly as specified in design.md `Data Models / VisitLog entity`: `@Entity({ name: 'visit_log' })`, columns `id` (bigint, generated), `createdAt` (timestamptz, `@CreateDateColumn`), `fieldDate` (date, nullable), `outcome` (enum), `notes` (varchar(500), nullable), `propertySubscriptionId` (bigint), `officerEntityUserProfileId` (bigint). Define both composite indexes (`idx_visit_log_subscription_created_at` on `(propertySubscriptionId, createdAt)` and `idx_visit_log_officer_created_at` on `(officerEntityUserProfileId, createdAt)`). Wire FK relations: `propertySubscription` ManyToOne with `onDelete: 'CASCADE'`, `officer` ManyToOne with `onDelete: 'RESTRICT'`. Export `VisitOutcome` from this file so DTOs and audit code can re-use it.
    - _Requirements: 12.1, 12.4, 13.1, 13.2, 14.4_
    - _Exercises: P3, P4, P5, P-aux-3 (column shape)_

  - [ ] 2.2 Add `ListIndebtedQueryDto` and `CreateVisitLogDto`
    - File: `lawma_app_backend/src/utils-billing/dtos/dto.ts`
    - Append the two DTOs and re-export `VisitOutcome` from `../entitties/visitLog.entity`. Validators must match the design exactly: `page` (`@IsInt @Min(1)`, default 1), `limit` (`@IsInt @Min(1) @Max(200)`, default 50), `sortBy` (`@IsIn(['arrears','lastContactedAt','street'])`, default `'arrears'`), `sortDir` (`@IsIn(['ASC','DESC'])`, default `'DESC'`), `search` (`@IsString @MaxLength(120)`), `streetId` (`@IsString`), `needsFollowUp` (boolean transform from `'true'`/`true`), `followUpDays` (`@IsInt @Min(1) @Max(90)`, default 7). For `CreateVisitLogDto`: `propertySubscriptionId` (`@IsString @IsNotEmpty`), `outcome` (`@IsEnum(VisitOutcome)`), `notes` (`@IsOptional @IsString @MaxLength(500)`), `fieldDate` (`@IsOptional @IsDateString`).
    - DO NOT include `createdAt`, `officerEntityUserProfileId`, or `entityProfileId` on `CreateVisitLogDto`; those are server-sourced.
    - _Requirements: 12.4, 12.5, 16.1, 16.6_
    - _Exercises: P3, P4, P10 (sortBy/sortDir surface)_

  - [ ] 2.3 Generate the visit-log + permissions migration
    - File: `lawma_app_backend/src/migrations/<timestamp>-CreateVisitLogAndFieldVisitsPermissions.ts`
    - Use `npx typeorm migration:create` (or follow the existing migration filename convention). Inside `up()`, execute in order: (a) `ALTER TYPE permission_category_enum ADD VALUE IF NOT EXISTS 'field_operations';` (b) create the `visit_log_outcome_enum` Postgres enum type with the five `VisitOutcome` values; (c) create the `visit_log` table with the entity columns, FKs (`property_subscription` CASCADE, `entity_user_profile` RESTRICT), and a `bigserial` `id`; (d) create both composite indexes named exactly as in 2.1; (e) `INSERT INTO permission ...` two rows for `field_visits:read` and `field_visits:log` under category `field_operations`, with `ON CONFLICT (name) DO NOTHING`. `down()` reverses (b)–(e); the `ALTER TYPE ... ADD VALUE` is a Postgres limitation and is not reversed (document this with a comment).
    - _Requirements: 1.1, 1.2_

- [ ] 3. Backend services and controller wiring
  - [ ] 3.1 Extend `RbacService` system permissions and default roles
    - File: `lawma_app_backend/src/shared/rbac.service.ts`
    - In `createSystemPermissions`, add two definitions for `PERMISSIONS.FIELD_VISITS_READ` and `PERMISSIONS.FIELD_VISITS_LOG` under category `PermissionCategory.FIELD_OPERATIONS`. In `createDefaultRoles`, grant both permissions to the seeded `super_admin`, `admin`, and `field_officer` defaults. Both extensions MUST be idempotent: re-running `initializeSystemRbac` MUST NOT auto-grant the second permission to a custom role that an admin has assigned only one of them, and MUST NOT revoke an admin override on a non-system role whose `permissions` is a subset of `{field_visits:read, field_visits:log}`.
    - _Requirements: 1.3, 1.4, 1.5_
    - _Exercises: P-aux-1_

  - [ ] 3.2 Implement `UtilsBillingService` field-visits methods + audit emitter
    - File: `lawma_app_backend/src/utils-billing/utils-billing.service.ts`
    - Add a private `emitVisitLogAudit(kind: 'created' | 'deleted', payload)` helper that writes a structured Nest `Logger` entry containing `{ visitLogId, propertySubscriptionId, outcome?, officerEntityUserProfileId | actingUserId, createdAt | deletedAt }` and explicitly omits `notes`. Wrap emitter calls in `try/catch` so emitter failures do not roll back the persistence write.
    - Add `listIndebtedProperties(entityProfileId, query: ListIndebtedQueryDto)`: build the `LATERAL` query from design.md `Data Models / Visit log lookup query` using `createQueryBuilder` with a raw lateral join. Apply tenancy predicate `property_subscription."entityProfileId" = :tenantId`, arrears predicate `(totalBillings - totalPayments) > 0`, optional `streetId`, optional ILIKE `search` over name/street/streetNumber/custodian-fullname, and optional `needsFollowUp` clause `vl_recent."createdAt" IS NULL OR vl_recent."createdAt" < NOW() - (:followUpDays || ' days')::interval`. Sort handling: `arrears` numeric, `street` lexicographic on `(street.name, streetNumber)`, `lastContactedAt` ASC = `NULLS FIRST` and DESC = `NULLS LAST`. Run a separate aggregate query that returns `total` and `totalArrears` over the same predicate. Return `PaginatedIndebtedResponse` with `arrears` and `totalArrears` as numeric strings.
    - Add `createVisitLog({ entityProfileId, entityUserProfileId, dto })`: verify `propertySubscriptionId` belongs to the tenant (`NotFoundException` 404 otherwise); reject `dto.fieldDate > serverTodayUtc` with `BadRequestException`; persist a `VisitLog` with server-set `createdAt` and `officerEntityUserProfileId = entityUserProfileId`, ignoring any client-supplied `createdAt`/`officerEntityUserProfileId`/`entityProfileId`; emit audit. Return the persisted row.
    - Add `deleteVisitLog({ visitLogId, entityProfileId, actingUserId })`: query `UserRole`-joined-`Role` for `actingUserId` and reject with `ForbiddenException` if `super_admin` is absent; load the visit log joined to its `propertySubscription` and reject with `NotFoundException` if the parent subscription's `entityProfileId !== entityProfileId` (404, not 403, to avoid existence leakage); hard-delete the row; emit audit.
    - Every public method on this service that touches `VisitLog` MUST contain a join against `property_subscription` and a parameterised `entityProfileId` predicate (see P-aux-3).
    - _Requirements: 6.1, 6.2, 6.4, 8.1, 8.2, 8.3, 9.1, 10.1, 10.6, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 13.1, 13.2, 13.3, 14.2, 14.3, 14.4, 16.1, 16.3, 17.1, 17.2, 17.3_
    - _Exercises: P1, P2, P3, P4, P5, P9, P10, P12, P-aux-3_

  - [ ] 3.3 Add field-visits routes to `UtilsBillingController`
    - File: `lawma_app_backend/src/utils-billing/utils-billing.controller.ts`
    - Add three handlers under the `field-visits` segment, each decorated with `@UseGuards(RbacEnabledGuard, IsAuthenticated, PermissionGuard)` in that exact order so the RBAC kill-switch fires first.
      - `GET field-visits/indebted` → `@RequirePermissions(PERMISSIONS.FIELD_VISITS_READ)`, accepts `@Query() ListIndebtedQueryDto`, reads `entityProfileId` from `@GetAuthPayload()`, returns `PaginatedIndebtedResponse`.
      - `POST field-visits/visit` → `@RequirePermissions(PERMISSIONS.FIELD_VISITS_LOG)`, accepts `@Body() CreateVisitLogDto`, sources `entityProfileId` and `entityUserProfileId` from the auth payload, returns the persisted row (HTTP 201).
      - `DELETE field-visits/visit/:id` → `@RequirePermissions(PERMISSIONS.SYSTEM_ADMIN)` plus an inline `super_admin`-role check inside the handler before invoking the service. Returns HTTP 204.
    - _Requirements: 1.6, 1.7, 6.1, 11.10, 12.1, 14.1, 14.2, 14.3, 16.1, 16.6, 18.1, 18.2, 18.3, 18.4_
    - _Exercises: P6, P7, P8, P13_

- [ ] 4. Checkpoint - Backend slice complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Frontend foundations
  - [ ] 5.1 Add field-visits URL paths
    - File: `lawma_app/src/lib/enums/urlPaths.enum.ts`
    - Add `FIELD_VISITS_INDEBTED = '/utils-billing/field-visits/indebted'`, `FIELD_VISITS_VISIT = '/utils-billing/field-visits/visit'`, `FIELD_VISITS_VISIT_BY_ID = '/utils-billing/field-visits/visit/:id'` to the existing enum. Keep existing entries untouched.
    - _Requirements: 5.1, 11.10, 14.2_

  - [ ] 5.2 Add field-visits event names
    - File: `lawma_app/src/lib/enums/events.enum.ts`
    - Add `LOAD_INDEBTED_PROPERTIES = 'load_indebted_properties'`, `LOG_VISIT = 'log_visit'`, `DELETE_VISIT_LOG = 'delete_visit_log'` to the existing enum.
    - _Requirements: 5.1, 11.10_

  - [ ] 5.3 Implement the `fieldVisits` request module
    - File: `lawma_app/src/lib/requests/fieldVisits.request.ts`
    - Export three thin functions that wrap `requestApi` from `default.request.ts`: `requestListIndebted(query: ListIndebtedQueryDto): Promise<PaginatedIndebtedResponse>` (GET on `FIELD_VISITS_INDEBTED` with query params), `requestCreateVisitLog(body: CreateVisitLogDto): Promise<VisitLog>` (POST on `FIELD_VISITS_VISIT`), `requestDeleteVisitLog(visitLogId: string): Promise<void>` (DELETE on `FIELD_VISITS_VISIT_BY_ID` with `:id` substituted). Define the matching response/request types in this file or a sibling `fieldVisits.types.ts`; use `string` for monetary fields per design decision.
    - _Requirements: 5.1, 11.10, 16.1, 16.2_

  - [ ] 5.4 Implement the `FieldVisits` event handler
    - File: `lawma_app/src/lib/eventHandlers/FieldVisits.handler.ts`
    - Subscribe to `LOAD_INDEBTED_PROPERTIES`, `LOG_VISIT`, and `DELETE_VISIT_LOG` events on the global event bus, mirroring `BillingAccount.handler.ts`. Each handler manages loading state, dispatches the request, updates `useFieldVisitsStore`, and surfaces successes/failures via `useNotify`. The `LOG_VISIT` handler MUST call `applyVisitLogResult(propertySubscriptionId, createdAt)` on success so the affected row's `lastContactedAt` updates without a refetch.
    - _Requirements: 5.2, 5.3, 5.5, 5.7, 11.11, 11.12, 11.13_

  - [ ] 5.5 Implement the `useFieldVisitsStore` Pinia store
    - File: `lawma_app/src/stores/field-visits-store.ts`
    - Implement the store exactly as in design.md `Components and Interfaces / Frontend / Pinia store`: refs for `page`, `limit`, `total`, `totalArrears`, `sortBy`, `sortDir`, `search`, `streetId`, `needsFollowUp`, `followUpDays`, `rows`, `loading`, `error`. Initialise `sortBy='arrears'`, `sortDir='DESC'`, `followUpDays=7`, `needsFollowUp=false`, `limit=50`, `page=1`. Actions: `fetchIndebted()` (calls the request via the handler), `applyVisitLogResult(propertySubscriptionId, lastContactedAt)` (mutates the matching row in-place). Implement a `clampFollowUpDays(value: number): number` helper that clamps to `[1, 90]` and export it for property testing in 9.19.
    - In-memory only — no `localStorage`/`localForage`.
    - _Requirements: 8.4, 9.4, 10.2, 10.3, 10.4, 10.5, 10.7, 15.3, 16.5_

- [ ] 6. Frontend UI and routing
  - [ ] 6.1 Build `VisitLogDialog`
    - File: `lawma_app/src/components/VisitLogDialog.vue`
    - Implement the dialog described in design.md `Components and Interfaces / Frontend / VisitLogDialog`. Use `q-dialog` with `:maximized="$q.screen.lt.sm"`. Render a read-only context block (`propertySubscriptionName`, `street` + `streetNumber`, custodian name, current Naira-formatted arrears). Form: outcome `q-select` whose values map exactly to `VisitOutcome`; field-date `q-input type="date"` defaulted to today's local date with a `:max` attribute equal to today; notes `q-input type="textarea" :maxlength="500"` with the `counter` prop. Client-side validation: outcome required, notes ≤ 500, field-date ≤ today. Submit `q-btn` with `:loading="submitting"`; disable submit and cancel while submitting. On success, emit `submitted` with the new visit log and let the page call `applyVisitLogResult`. On failure, keep the dialog open and render the server `message` in a `q-banner`.
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10, 11.11, 11.12, 11.13, 15.5_

  - [ ] 6.2 Build `FieldVisitsPage`
    - File: `lawma_app/src/pages/FieldVisitsPage.vue`
    - Build the page described in design.md `Components and Interfaces / Frontend / FieldVisitsPage.vue`. Sections: (a) header card showing `rows.length` and `totalArrears` (Naira-formatted via the existing `parseCurrencyString` helper); (b) filter row with debounced search (300ms), street `q-select`, "Needs follow-up" `q-toggle`, and follow-up-threshold `q-input type="number" min=1 max=90` that calls `clampFollowUpDays` from the store on `update:model-value`; (c) responsive switch via `v-if="$q.screen.gte.md"` between a desktop `q-table` (with the custom `sort` function on `lastContactedAt` per design.md "Resolved item 5") and a mobile list of stacked `q-card` items; (d) `q-pagination` rendered only when `Math.ceil(total / limit) >= 3`. Implement a secondary client-side authorisation check on mount that hides the list when `useRbacStore` reports the current user lacks all of `field_officer`/`admin`/`super_admin` (Req 3.5). Render an empty-state message for zero rows and a `q-banner` + Retry control on initial-load failure. Open `VisitLogDialog` on the row action; on dialog success, call `applyVisitLogResult`. Apply `min-height: 44px; min-width: 44px` to interactive controls inside `@media (max-width: 768px)`.
    - Default sort: `arrears` DESC. The sort comparator for `lastContactedAt` MUST be exported from a sibling helper file (e.g. `lawma_app/src/pages/fieldVisitsPage.helpers.ts`) so it can be unit-tested from 9.18 without mounting the page.
    - _Requirements: 3.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 11.1, 15.1, 15.2, 15.3, 15.4, 15.6, 16.2, 16.4, 16.5_
    - _Exercises: P10 (sort comparator), P9 (filter)_

  - [ ] 6.3 Register the `/field-visits` route
    - File: `lawma_app/src/router/routes.ts`
    - Add a new entry mirroring the existing `user-access-management` block: parent `name: 'field-visits', path: '/field-visits'` with `meta.requireAuth: true`, child path `''` rendering `pages/FieldVisitsPage.vue` with `meta: { requireAuth: true, requireRoles: ['field_officer','admin','super_admin'], requireAnyRole: true }`.
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
    - _Exercises: P-aux-2 (route side)_

  - [ ] 6.4 Add the `Field Visits` sidebar entry
    - File: `lawma_app/src/layouts/AuthenticatedLayout.vue`
    - Extend `allNavigationItems` with `{ path: '/field-visits', label: 'Field Visits', icon: 'pin_drop', requireAnyRole: ['field_officer','admin','super_admin'] }`. Update the `navigationItems` computed so an item with `requireAnyRole` is filtered through `rbacStore.hasAnyRole(item.requireAnyRole)`. Position the entry between `Dashboard` and `Properties & Billings`. Ensure the `pin_drop` icon is distinct from existing items (`dashboard`, `home_work`, `payments`, `settings`).
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
    - _Exercises: P-aux-2 (sidebar side)_

  - [ ] 6.5 Update sign-in redirect priority
    - File: `lawma_app/src/pages/SigninPage.vue`
    - Reorder the post-sign-in redirect so the branches evaluate top-to-bottom: (1) `rbacStore.isSuperAdmin → /dashboard`, (2) `rbacStore.hasRole('field_officer') → /field-visits`, (3) `rbacStore.hasPermission('properties:read') || rbacStore.hasPermission('billing:read') → /properties-billings`, (4) `rbacStore.hasPermission('payments:read') → /payments`, (5) otherwise `/settings`. Evaluate the redirect only after the RBAC store has loaded the current user's roles and permissions. Extract the redirect-decision logic into a pure exported helper (e.g. `pickPostSignInRoute(rbacView)`) so 9.17 can test it without mounting the page.
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
    - _Exercises: P11_

- [ ] 7. Documentation
  - [ ] 7.1 Update the user manual
    - File: `lawma_app/docs/USER_MANUAL.html`
    - Add a new section under "For Waste Managers" titled "Field Visits". Cover: (a) the new sidebar entry and which roles see it (`field_officer`, `admin`, `super_admin`); (b) how to log a visit (open the dialog from a row, pick an outcome, optionally set a field date, optionally add notes up to 500 characters, submit); (c) the "Needs follow-up" filter and the configurable threshold (1–90 days, default 7); (d) a note that super-admin hard-delete of a visit log is intentionally not exposed in the UI for v1. Match the surrounding HTML style and heading hierarchy.
    - _Requirements: 2.1, 2.4, 10.1, 10.2, 10.3, 11.1, 11.3, 11.5, 14.1, 14.2_

- [ ] 8. Checkpoint - Implementation slice complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Tests
  - [ ]* 9.1 Backend property test — P1: indebted-list arrears invariant
    - File: `lawma_app_backend/src/utils-billing/__tests__/field-visits.property-01-arrears-invariant.spec.ts`
    - Header comment: `// Feature: field-visits, Property 1: indebted-list arrears invariant`.
    - Use `fast-check` 3.x with `numRuns: 100` against a transactional pg DataSource. Generate corpora of `PropertySubscription` + `BillingAccount` rows; assert every returned row satisfies `row.arrears === totalBillings - totalPayments` and `row.arrears > 0`, AND no positive-arrears subscription is missing across paginated calls.
    - _Validates: Requirements 6.1, 6.2, 6.4_

  - [ ]* 9.2 Backend property test — P2: `lastContactedAt` mirrors `MAX(VisitLog.createdAt)` over surviving rows
    - File: `lawma_app_backend/src/utils-billing/__tests__/field-visits.property-02-last-contacted.spec.ts`
    - Header: `// Feature: field-visits, Property 2: lastContactedAt mirrors MAX(VisitLog.createdAt)`.
    - Generate sequences of create/delete `VisitLog` operations against a single property; assert `lastContactedAt` returned by `listIndebtedProperties` equals the max `createdAt` over surviving rows (or null). `numRuns: 100`.
    - _Validates: Requirements 13.1, 13.2, 13.3, 14.4_

  - [ ]* 9.3 Backend property test — P3: outcome enum closure
    - File: `lawma_app_backend/src/utils-billing/__tests__/field-visits.property-03-outcome-enum.spec.ts`
    - Header: `// Feature: field-visits, Property 3: VisitLog.outcome is always one of the five enum values`.
    - Generate arbitrary strings; assert the endpoint accepts iff the string is in `VisitOutcome`. `numRuns: 100`.
    - _Validates: Requirements 12.4_

  - [ ]* 9.4 Backend property test — P4: server-sourced authorship and timestamp
    - File: `lawma_app_backend/src/utils-billing/__tests__/field-visits.property-04-server-authored.spec.ts`
    - Header: `// Feature: field-visits, Property 4: server-sourced authorship and timestamp`.
    - Generate arbitrary `AuthTokenPayload` and arbitrary `CreateVisitLogDto` bodies (including bodies that smuggle `createdAt`/`officerEntityUserProfileId`/`entityProfileId` via `as any`); assert the persisted row's `officerEntityUserProfileId` matches the auth payload, ignored fields are not honoured, and `createdAt` is within ±1s of server time. `numRuns: 100`.
    - _Validates: Requirements 12.1, 12.2, 12.3_

  - [ ]* 9.5 Backend property test — P5: `createdAt` monotonicity per `(propertySubscriptionId, officerEntityUserProfileId)`
    - File: `lawma_app_backend/src/utils-billing/__tests__/field-visits.property-05-monotonic-created-at.spec.ts`
    - Header: `// Feature: field-visits, Property 5: createdAt is monotonically non-decreasing per (subscription, officer)`.
    - Generate ordered sequences of successful `createVisitLog` calls against a fixed `(p, o)`; assert `r1.createdAt <= r2.createdAt` whenever `r1`'s response preceded `r2`'s. `numRuns: 100`.
    - _Validates: Requirements 12.1_

  - [ ]* 9.6 Backend property test — P9: `needsFollowUp` filter precision
    - File: `lawma_app_backend/src/utils-billing/__tests__/field-visits.property-09-needs-follow-up.spec.ts`
    - Header: `// Feature: field-visits, Property 9: needsFollowUp=true filters precisely`.
    - Generate corpora and `k ∈ [1, 90]`; assert every returned row has `lastContactedAt === null OR < now - k days`, no underlying row satisfying that predicate is missing, and `needsFollowUp=false` is unconstrained. `numRuns: 100`.
    - _Validates: Requirements 10.1, 10.6_

  - [ ]* 9.7 Backend property test — P10: sort property (parameterised by `sortBy` and `sortDir`)
    - File: `lawma_app_backend/src/utils-billing/__tests__/field-visits.property-10-sort.spec.ts`
    - Header: `// Feature: field-visits, Property 10: sort property parameterised by sortBy and sortDir`.
    - Iterate over `{('arrears','ASC'), ('arrears','DESC'), ('lastContactedAt','ASC'), ('lastContactedAt','DESC'), ('street','ASC')}`; generate corpora; assert the page is in the requested order, with NULLS-FIRST on `lastContactedAt` ASC and NULLS-LAST on DESC. `numRuns: 100` per pair.
    - _Validates: Requirements 8.1, 8.2, 8.3_

  - [ ]* 9.8 Backend property test — P12: audit log entries never contain free-text notes
    - File: `lawma_app_backend/src/utils-billing/__tests__/field-visits.property-12-audit-no-notes.spec.ts`
    - Header: `// Feature: field-visits, Property 12: audit-log entries never contain free-text notes`.
    - Spy on the Nest `Logger` used by the audit emitter. Generate `notes` via `fc.string({ minLength: 0, maxLength: 1000 })`; for accepted requests (notes ≤ 500), assert the captured log payload, when JSON-serialised, does not contain the notes string. `numRuns: 100`.
    - _Validates: Requirements 17.3_

  - [ ]* 9.9 Backend property test — P-aux-1: idempotent seed preserves admin overrides
    - File: `lawma_app_backend/src/shared/__tests__/rbac-seed.property-aux-1-idempotent.spec.ts`
    - Header: `// Feature: field-visits, Property P-aux-1: idempotent seed preserves admin overrides`.
    - Generate a non-system role `r` whose `permissions ⊆ {field_visits:read, field_visits:log}`; call `RbacService.initializeSystemRbac` twice; assert `r.permissions` is unchanged. `numRuns: 100`.
    - _Validates: Requirements 1.5_

  - [ ]* 9.10 Backend property test — P-aux-3: tenant join invariant
    - File: `lawma_app_backend/src/utils-billing/__tests__/field-visits.property-aux-3-tenant-join.spec.ts`
    - Header: `// Feature: field-visits, Property P-aux-3: tenant join invariant`.
    - For every public method on `UtilsBillingService` that touches `VisitLog` (`listIndebtedProperties`, `createVisitLog`, `deleteVisitLog`), invoke with arbitrary `entityProfileId` strings and capture the produced SQL via `getSql()` / `getQuery()` on the underlying QueryBuilder (or the raw query string). Assert the SQL contains a join against `property_subscription` AND a parameterised `entityProfileId` predicate. `numRuns: 100`.
    - _Validates: Design-only invariant (Open Questions §Resolved item 2)_

  - [ ]* 9.11 Backend integration test — P6: `GET /indebted` requires `field_visits:read`
    - File: `lawma_app_backend/test/field-visits.property-06-read-permission.e2e-spec.ts`
    - Header: `// Feature: field-visits, Property 6: GET /indebted requires field_visits:read`.
    - Spin up the Nest app via `Test.createTestingModule`; sign in callers whose effective permission set excludes `field_visits:read`; assert HTTP 403 across a small sample of `ListIndebtedQueryDto`-valid query strings while RBAC is enabled.
    - _Validates: Requirements 1.6_

  - [ ]* 9.12 Backend integration test — P7: `POST /visit` requires `field_visits:log`
    - File: `lawma_app_backend/test/field-visits.property-07-log-permission.e2e-spec.ts`
    - Header: `// Feature: field-visits, Property 7: POST /visit requires field_visits:log`.
    - Same setup as 9.11; assert HTTP 403 for callers without `field_visits:log` while RBAC is enabled.
    - _Validates: Requirements 1.7_

  - [ ]* 9.13 Backend integration test — P8: `DELETE /visit/:id` requires `super_admin`
    - File: `lawma_app_backend/test/field-visits.property-08-delete-super-admin.e2e-spec.ts`
    - Header: `// Feature: field-visits, Property 8: DELETE /visit/:id requires super_admin`.
    - Sign in callers without the `super_admin` role (including ones with `system:admin` permission); assert HTTP 403 for arbitrary visit-log identifiers while RBAC is enabled.
    - _Validates: Requirements 14.1, 14.3_

  - [ ]* 9.14 Backend integration test — P13: RBAC-disabled lockout
    - File: `lawma_app_backend/test/field-visits.property-13-rbac-disabled-lockout.e2e-spec.ts`
    - Header: `// Feature: field-visits, Property 13: RBAC-disabled lockout`.
    - Boot the app with `process.env.RBAC_ENABLED` unset (or set to anything other than `'true'`); assert HTTP 503 on all three field-visits endpoints across arbitrary query strings, request bodies, and path parameters; assert the handler body never executes (use a service spy).
    - _Validates: Design-only invariant (`RbacEnabledGuard`)_

  - [ ]* 9.15 Backend integration test — auth and expired-token scenarios
    - File: `lawma_app_backend/test/field-visits.auth.e2e-spec.ts`
    - Cover Req 18.1 (missing token → 401), 18.3 (expired token → 401), 18.4 (auth middleware throws → 401 or 500, handler not executed) on all three field-visits endpoints. Use Jest spies to confirm the service is never invoked.
    - _Validates: Requirements 18.1, 18.2, 18.3, 18.4_

  - [ ]* 9.16 Backend integration test — route surface (Req 14.1)
    - File: `lawma_app_backend/test/field-visits.routes.e2e-spec.ts`
    - Inspect the registered Nest routes (`app.getHttpAdapter().getInstance()` or `Reflector` over the controller) and assert there is NO update-or-delete endpoint reachable to callers holding only `field_visits:log` and/or `field_visits:read` (the only deletion path is gated by `super_admin`).
    - _Validates: Requirements 14.1_

  - [ ]* 9.17 Frontend property test — P11: sign-in redirect priority
    - File: `lawma_app/src/__tests__/signin-redirect.property-11.spec.ts`
    - Header: `// Feature: field-visits, Property 11: sign-in redirect priority`.
    - Use `fast-check` 3.x with `numRuns: 100`. Use `fc.record({ isSuperAdmin: fc.boolean(), roles: fc.array(fc.constantFrom('admin','field_officer','billing_officer','customer_service','viewer')), permissions: fc.array(fc.constantFrom('properties:read','billing:read','payments:read','users:manage')) })`. Drive the `pickPostSignInRoute` helper from 6.5 and assert the result equals the first matching branch top-to-bottom.
    - _Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 9.18 Frontend property test — `lastContactedAt` sort comparator
    - File: `lawma_app/src/__tests__/field-visits-sort.property.spec.ts`
    - Header: `// Feature: field-visits, Property 10 (frontend slice): lastContactedAt comparator`.
    - Test the comparator exported from `pages/fieldVisitsPage.helpers.ts`: for arbitrary arrays of `string | null` ISO dates, sorting ASC produces NULLS-FIRST and sorting DESC produces NULLS-LAST; non-null values compare chronologically. `numRuns: 100`.
    - _Validates: Requirements 8.2_

  - [ ]* 9.19 Frontend property test — follow-up days clamper
    - File: `lawma_app/src/__tests__/field-visits-clamper.property.spec.ts`
    - Header: `// Feature: field-visits, Requirement 10.4: follow-up-days clamping`.
    - Test `clampFollowUpDays` from `stores/field-visits-store.ts`: for arbitrary integers and floats, the result is in `[1, 90]`, equals the input when already in range, and equals the nearest endpoint otherwise. `numRuns: 100`.
    - _Validates: Requirements 10.2, 10.4_

  - [ ]* 9.20 Frontend component test — `FieldVisitsPage`
    - File: `lawma_app/src/__tests__/FieldVisitsPage.component.spec.ts`
    - Mount with stubbed `useFieldVisitsStore` and `useRbacStore`. Cover: header count + `totalArrears` formatting; loading indicator on initial fetch; empty-state copy; error banner + Retry control; pagination control hidden when `total/limit < 3` and visible when `>= 3`; mobile cards at viewport 360px (via `$q.screen.lt.md` mock) and tabular layout at 1280px; tap-to-call disabled when phone is missing; preserved sort/filter/follow-up state across viewport flip.
    - _Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 9.5, 15.1, 15.2, 15.3, 15.4, 15.6, 16.4_

  - [ ]* 9.21 Frontend component test — `VisitLogDialog`
    - File: `lawma_app/src/__tests__/VisitLogDialog.component.spec.ts`
    - Cover: outcome required validation; notes ≤ 500 with live counter; field-date defaults to today, `:max="today"` rejects future dates; submit/cancel disabled while loading; success closes dialog and emits `submitted`; failure keeps dialog open and renders the server `message`; dialog renders `:maximized` at viewport ≤ 600px and centred above 600px.
    - _Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.11, 11.12, 11.13, 15.5_

  - [ ]* 9.22 Frontend component test — sidebar entry visibility
    - File: `lawma_app/src/__tests__/AuthenticatedLayout-sidebar.component.spec.ts`
    - Mount `AuthenticatedLayout`; assert the `Field Visits` item is visible iff the stubbed `useRbacStore` reports any of `field_officer`/`admin`/`super_admin`, and is rendered active when the current route is `/field-visits`.
    - _Validates: Requirements 2.1, 2.2, 2.3, 2.4_

  - [ ]* 9.23 Frontend component test — route guard contract
    - File: `lawma_app/src/__tests__/field-visits-route-guard.component.spec.ts`
    - Drive the existing global router guard with synthetic navigations to `/field-visits`. Assert: unauthenticated → redirect to sign-in; authenticated without any of `field_officer`/`admin`/`super_admin` → redirect to `/unauthorized`; authenticated with any one of those roles → allow.
    - _Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 9.24 Playwright E2E — sign-in to logged-visit happy path
    - File: `lawma_app/tests/e2e/field-visits.spec.ts`
    - Sign in as a seeded `field_officer`; assert the browser lands on `/field-visits`; assert the indebted list renders; click the row action on the first row; submit the dialog with outcome `not_home`; assert the dialog closes, the success toast appears, and the row's `lastContactedAt` updates to a "just now" relative date without a full page reload.
    - _Validates: Requirements 4.2, 5.1, 7.4, 11.1, 11.10, 11.12, 13.3_

- [ ] 10. Verification
  - [ ] 10.1 Backend lint and build
    - Run `yarn lint` and `yarn build` in `lawma_app_backend/`. Fail the task on any error or new warning.
    - _Verifies: tasks 1–3_

  - [ ] 10.2 Frontend lint and build
    - Run `yarn lint` and `yarn build` in `lawma_app/`. Fail the task on any error or new warning.
    - _Verifies: tasks 5–7_

  - [ ] 10.3 Run all property tests with `numRuns: 100`
    - Run the backend Jest property suites (9.1–9.10) and the frontend Vitest property suites (9.17–9.19) with `PROPERTY_NUM_RUNS=100`. Log the seed for any failure so it can be reproduced.
    - _Verifies: P1, P2, P3, P4, P5, P9, P10, P11, P12, P-aux-1, P-aux-3 plus the frontend sort/clamper properties_

  - [ ] 10.4 Run the Playwright E2E suite
    - Run `npx playwright test tests/e2e/field-visits.spec.ts` in `lawma_app/`. Fail on any error.
    - _Verifies: 9.24_

- [ ] 11. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP path; a coding agent MUST NOT auto-implement them. All other tasks are required.
- Every implementation task names the file path it owns; same-file work is consolidated into a single task to keep waves conflict-free.
- Property numbers (P1–P13, P-aux-1, P-aux-3) refer to the design's "Correctness Properties" section. P-aux-2 (sidebar/route allow-listing) is exercised by component tests 9.22 and 9.23 rather than a standalone property test, per the design's own classification.
- Backend and frontend live in two workspace roots (`lawma_app_backend/` and `lawma_app/`). Tasks within a single root that touch different files can run in parallel; tasks that touch the same file are placed in different waves below.
- The `RbacEnabledGuard` is additive — no existing endpoint behaviour changes. P13 covers the kill-switch contract.
- Currency is emitted and stored as numeric strings end-to-end; the frontend renders via the existing `parseCurrencyString` helper.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "2.1", "5.1", "5.2", "7.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "3.1", "5.3"] },
    { "id": 2, "tasks": ["3.2", "5.4", "5.5"] },
    { "id": 3, "tasks": ["3.3", "6.1", "6.2"] },
    { "id": 4, "tasks": ["6.3", "6.4", "6.5"] },
    { "id": 5, "tasks": ["9.1", "9.2", "9.3", "9.4", "9.5", "9.6", "9.7", "9.8", "9.9", "9.10", "9.11", "9.12", "9.13", "9.14", "9.15", "9.16", "9.17", "9.18", "9.19", "9.20", "9.21", "9.22", "9.23", "9.24"] },
    { "id": 6, "tasks": ["10.1", "10.2", "10.3", "10.4"] }
  ]
}
```
