# Tasks: Todo Full-Stack Web Application Authentication Fix

**Feature**: Todo Full-Stack Web Application Implementation
**Branch**: `001-todo-fullstack` | **Date**: 2026-01-20
**Spec**: [specs/001-todo-fullstack/spec.md](../specs/001-todo-fullstack/spec.md)
**Plan**: [specs/001-todo-fullstack/plan.md](../specs/001-todo-fullstack/plan.md)

## Summary

Fix authentication loop issue where JWT-based authentication is incorrectly mixed with session-based validation. The backend treats JWT tokens like session tokens by validating them against the database session table, causing authentication to fail even when the JWT is valid. The frontend login flow also bypasses the AuthContext, contributing to the redirect loop.

## Implementation Strategy

**MVP First**: Fix the core authentication mechanism by implementing pure JWT-based authentication on the backend and ensuring the frontend properly integrates with the AuthContext.

**Incremental Delivery**: Start with backend authentication fixes, then update frontend to properly use the AuthContext, and finally test the complete flow.

## Phase 1: Setup Tasks

- [X] T001 Setup development environment and verify project structure
- [X] T002 Verify current authentication flow is broken by reproducing the redirect loop

## Phase 2: Foundational Tasks

- [X] T003 [P] Update backend authentication to use pure JWT-only validation
- [X] T004 [P] Remove session-based validation from JWT authentication flow
- [X] T005 [P] Update frontend login flow to properly use AuthContext

## Phase 3: [US1] Fix Backend JWT Authentication (Priority: P1)

**Goal**: Implement pure JWT-based authentication without session table validation, ensuring users are authenticated after login and redirected to dashboard without redirect loop.

**Independent Test Criteria**: After login, user should be correctly authenticated and redirected to dashboard without any redirect loop.

- [X] T006 [US1] Refactor get_current_user to decode JWT and extract user_id from "sub" claim
- [X] T007 [US1] Update get_current_user to query User table directly using user_id from JWT
- [X] T008 [US1] Remove session table validation from get_current_user function
- [X] T009 [US1] Remove get_user_by_session_token call from authentication flow
- [X] T010 [US1] Ensure all task queries are filtered by current_user.id from JWT
- [X] T011 [US1] Update auth routes to work with pure JWT authentication
- [X] T012 [US1] Test that protected endpoints work with valid JWT tokens
- [X] T013 [US1] Test that protected endpoints return 401 for invalid/expired tokens

## Phase 4: [US2] Fix Frontend Authentication Flow (Priority: P1)

**Goal**: Ensure frontend properly updates authentication state after login and uses AuthContext instead of direct localStorage manipulation.

**Independent Test Criteria**: After successful login, authentication state should be updated in context and user redirected to dashboard without redirect loop.

- [X] T014 [US2] Update LoginForm to use AuthContext for login instead of direct API calls
- [X] T015 [US2] Modify LoginForm to update isAuthenticated = true in AuthContext
- [X] T016 [US2] Update LoginForm to set user state in AuthContext after successful login
- [X] T017 [US2] Change LoginForm redirect to use router.replace("/dashboard") via AuthContext
- [X] T018 [US2] Update ProtectedRoute to read authentication state from context properly
- [X] T019 [US2] Ensure ProtectedRoute does not re-check auth incorrectly on every render
- [X] T020 [US2] Verify JWT is stored in localStorage through AuthContext
- [X] T021 [US2] Verify Authorization header is attached to API calls through AuthContext

## Phase 5: [US3] Security and Validation (Priority: P1)

**Goal**: Ensure all API requests include proper Authorization headers and security requirements are met.

**Independent Test Criteria**: All API requests include Authorization: Bearer <JWT_TOKEN> and requests without valid JWT return 401 Unauthorized.

- [X] T022 [US3] Update all API service calls to include Authorization header with JWT
- [X] T023 [US3] Ensure requests without valid JWT return 401 Unauthorized
- [X] T024 [US3] Verify user can only access their own tasks through proper filtering
- [X] T025 [US3] Update task service to filter by current_user.id from JWT
- [X] T026 [US3] Add proper error handling for authentication failures

## Phase 6: Testing and Verification

- [X] T027 [P] Test login endpoint returns valid JWT token
- [X] T028 [P] Test protected endpoint with valid JWT returns 200 OK
- [X] T029 [P] Test protected endpoint without token returns 401 Unauthorized
- [X] T030 [P] Test protected endpoint with invalid token returns 401 Unauthorized
- [X] T031 [P] Manual verification: Login with valid credentials works
- [X] T032 [P] Manual verification: JWT stored in localStorage after login
- [X] T033 [P] Manual verification: Authorization header attached to API calls
- [X] T034 [P] Manual verification: User redirected to /dashboard after login
- [X] T035 [P] Manual verification: Authentication persists across page refresh
- [X] T036 [P] Manual verification: Logout removes token and redirects to login
- [X] T037 [P] Manual verification: Accessing dashboard without token redirects to login
- [X] T038 [P] Manual verification: No redirect loop occurs after login

## Dependencies

User Story 3 (Security and Validation) depends on User Story 1 (Backend JWT Authentication) being completed first, as the security measures rely on the proper JWT implementation.

## Parallel Execution Opportunities

- Tasks T006-T013 can be executed in parallel with tasks T014-T021 (backend and frontend work can proceed simultaneously)
- All testing tasks (T027-T038) can be executed in parallel after the implementation is complete

## Acceptance Criteria

- [X] Login works without redirect loop
- [X] Dashboard loads immediately after login
- [X] Authentication persists across page refresh
- [X] Backend does not use sessions for auth
- [X] JWT is the single source of truth for authentication
- [X] All security requirements are satisfied