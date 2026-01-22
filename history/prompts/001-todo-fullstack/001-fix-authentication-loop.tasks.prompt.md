---
id: "001"
title: "fix-authentication-loop"
stage: "tasks"
date_iso: "2026-01-20"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "001-todo-fullstack"
branch: "001-todo-fullstack"
user: "huzaifa"
command: "/sp.tasks /sp.fix-authentication-loop"
labels: ["authentication", "jwt", "redirect-loop", "backend", "frontend"]
links:
  spec: "specs/001-todo-fullstack/spec.md"
  ticket: null
  adr: null
  pr: null
files_yaml: |
  - specs/001-todo-fullstack/tasks.md
tests_yaml: |
  - specs/001-todo-fullstack/tasks.md
outcome: "Successfully generated comprehensive tasks for fixing the authentication loop issue by implementing pure JWT-based authentication."
evaluation: "Tasks are well-structured, follow the checklist format, and address both backend and frontend aspects of the authentication issue."
---

# Fix Authentication Loop Task Generation

## User Input

```
/sp.fix-authentication-loop

Context:
We are building Phase 2 of a Todo Full-Stack Web Application using:
- Frontend: Next.js (App Router) + Tailwind CSS
- Backend: FastAPI (Python)
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth (frontend) issuing JWT tokens

Problem:
After successful login, the user is stuck in a redirect loop.
The app keeps asking for email and password and never reaches the dashboard.

Root Cause:
Authentication is incorrectly mixing two approaches:
- JWT-based stateless authentication
- Session-based authentication using a sessions table

JWT tokens are being treated like session tokens and validated against the database,
which causes authentication to fail even though the JWT is valid.

Objective:
Fix authentication to use PURE JWT-based stateless authentication.
After login, the user must be correctly recognized as authenticated
and redirected to the dashboard without any redirect loop.

Requirements:
1. Backend must use JWT-only authentication (NO session table checks)
2. JWT token must be decoded to extract user_id (sub claim)
3. User must be loaded directly from database using user_id
4. All protected routes must depend on get_current_user
5. Frontend must correctly update authentication state after login
6. Protected routes must allow access when JWT is valid
7. Redirect loop must be completely eliminated

Backend Tasks:
- Refactor get_current_user to:
  - Decode JWT using SECRET_KEY and ALGORITHM
  - Extract user_id from "sub" claim
  - Query User table directly using user_id
  - Reject invalid or expired tokens
- Remove any usage of:
  - session tables
  - get_user_by_session_token
  - database-based session validation
- Ensure all task queries are filtered by current_user.id

Frontend Tasks:
- Ensure login flow uses AuthContext (not only localStorage)
- After successful login:
  - Update isAuthenticated = true
  - Set user state in context
  - Redirect using router.replace("/dashboard")
- Ensure ProtectedRoute:
  - Reads authentication state from context
  - Does NOT re-check auth incorrectly on every render

Security Rules:
- All API requests must include:
  Authorization: Bearer <JWT_TOKEN>
- Requests without valid JWT must return 401 Unauthorized
- User must only access their own tasks

Testing Requirements (MANDATORY):
Backend Tests:
- Test login endpoint returns valid JWT
- Test protected endpoint with valid JWT returns 200
- Test protected endpoint without token returns 401
- Test protected endpoint with invalid token returns 401

Frontend Tests / Manual Verification:
1. Login with valid credentials
2. Verify JWT is stored in localStorage
3. Verify Authorization header is attached to API calls
4. Verify user is redirected to /dashboard
5. Refresh dashboard page → user remains logged in
6. Logout → token removed → redirected to login
7. Access dashboard without token → redirected to login

Acceptance Criteria:
- Login works without redirect loop
- Dashboard loads immediately after login
- Authentication persists across page refresh
- Backend does not use sessions for auth
- JWT is the single source of truth for authentication

Constraints:
- Do not introduce session-based authentication
- Do not change technology stack
- Follow existing project structure
- Keep solution simple and hackathon-appropriate

Deliverables:
- Updated backend authentication logic (JWT-only)
- Fixed frontend login + protected route flow
- Brief explanation in comments where logic changed
```

## Response

Generated comprehensive tasks for fixing the authentication loop issue by implementing pure JWT-based authentication. The tasks.md file includes:

- Phase 1: Setup tasks to verify the current broken state
- Phase 2: Foundational tasks to update authentication approach
- Phase 3: Backend JWT authentication fixes (removing session validation)
- Phase 4: Frontend authentication flow fixes (proper AuthContext usage)
- Phase 5: Security and validation updates
- Phase 6: Comprehensive testing and verification

The tasks follow the checklist format with proper IDs, story labels, and file paths. They address both the backend issue (mixing JWT with session validation) and frontend issue (bypassing AuthContext) that cause the redirect loop.