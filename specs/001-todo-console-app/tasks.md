---
description: "Task list for Todo In-Memory Python Console App implementation"
---

# Tasks: Todo In-Memory Python Console App

**Input**: Design documents from `/specs/001-todo-console-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included as requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths based on plan.md structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan in src/todo_app/{models,services,cli,utils}
- [X] T002 Initialize Python 3.13+ project with UV dependencies in pyproject.toml
- [X] T003 [P] Create __init__.py files in all package directories

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create Task data model in src/todo_app/models/task.py
- [X] T005 Create TodoService in src/todo_app/services/todo_service.py
- [X] T006 Create CLI interface in src/todo_app/cli/cli.py
- [X] T007 Create validators utility in src/todo_app/utils/validators.py
- [X] T008 Create main.py entry point
- [X] T009 Create pyproject.toml with proper configuration
- [X] T010 Create basic test structure in tests/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add New Task (Priority: P1) 🎯 MVP

**Goal**: Enable users to add new tasks with title and optional description to the todo list

**Independent Test**: Can be fully tested by running the add command with title and description, verifying the task appears in the list with a unique ID and pending status, delivering the core value of task creation.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T011 [P] [US1] Unit test for Task model in tests/unit/test_task.py
- [X] T012 [P] [US1] Unit test for add_task functionality in tests/unit/test_todo_service.py

### Implementation for User Story 1

- [X] T013 [US1] Implement Task model with ID, title, description, and completion status in src/todo_app/models/task.py (depends on T004)
- [X] T014 [US1] Implement add_task functionality in TodoService in src/todo_app/services/todo_service.py (depends on T005)
- [X] T015 [US1] Implement CLI add command in src/todo_app/cli/cli.py (depends on T014)
- [X] T016 [US1] Implement input validation for add command in src/todo_app/utils/validators.py (depends on T007)
- [X] T017 [US1] Test add functionality end-to-end

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View/List All Tasks (Priority: P1)

**Goal**: Allow users to view all tasks in their todo list with clear status indicators

**Independent Test**: Can be fully tested by adding tasks and then running the list command, verifying all tasks are displayed with proper formatting and status indicators, delivering visibility into the todo list.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [X] T018 [P] [US2] Unit test for list_tasks functionality in tests/unit/test_todo_service.py
- [X] T019 [P] [US2] Integration test for list command in tests/integration/test_cli.py

### Implementation for User Story 2

- [X] T020 [US2] Implement list_tasks functionality in TodoService in src/todo_app/services/todo_service.py (depends on T005)
- [X] T021 [US2] Implement CLI list command in src/todo_app/cli/cli.py (depends on T020)
- [X] T022 [US2] Test list functionality end-to-end

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Mark Task Complete/Incomplete (Priority: P2)

**Goal**: Allow users to update the status of a task from pending to completed or from completed back to pending

**Independent Test**: Can be fully tested by adding a task, marking it as complete, verifying the status changed, then marking it as incomplete again, delivering the core value of task status management.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [X] T023 [P] [US3] Unit test for mark_complete functionality in tests/unit/test_todo_service.py
- [X] T024 [P] [US3] Unit test for mark_incomplete functionality in tests/unit/test_todo_service.py

### Implementation for User Story 3

- [X] T025 [US3] Implement mark_task_complete functionality in TodoService in src/todo_app/services/todo_service.py (depends on T005)
- [X] T026 [US3] Implement mark_task_incomplete functionality in TodoService in src/todo_app/services/todo_service.py (depends on T005)
- [X] T027 [US3] Implement CLI complete command in src/todo_app/cli/cli.py (depends on T025)
- [X] T028 [US3] Implement CLI incomplete command in src/todo_app/cli/cli.py (depends on T026)
- [X] T029 [US3] Test mark complete/incomplete functionality end-to-end

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Update Task Details (Priority: P2)

**Goal**: Allow users to modify the title or description of an existing task

**Independent Test**: Can be fully tested by adding a task, updating its title or description, verifying the changes are saved, delivering the value of task refinement.

### Tests for User Story 4 (OPTIONAL - only if tests requested) ⚠️

- [X] T030 [P] [US4] Unit test for update_task functionality in tests/unit/test_todo_service.py
- [X] T031 [P] [US4] Integration test for update command in tests/integration/test_cli.py

### Implementation for User Story 4

- [X] T032 [US4] Implement update_task functionality in TodoService in src/todo_app/services/todo_service.py (depends on T005)
- [X] T033 [US4] Implement CLI update command in src/todo_app/cli/cli.py (depends on T032)
- [X] T034 [US4] Implement input validation for update command in src/todo_app/utils/validators.py (depends on T007)
- [X] T035 [US4] Test update functionality end-to-end

**Checkpoint**: At this point, User Stories 1, 2, 3 AND 4 should all work independently

---

## Phase 7: User Story 5 - Delete Task by ID (Priority: P2)

**Goal**: Allow users to remove a task from their todo list when it's no longer needed

**Independent Test**: Can be fully tested by adding tasks, deleting one by ID, verifying it no longer appears in the list, delivering the value of task cleanup.

### Tests for User Story 5 (OPTIONAL - only if tests requested) ⚠️

- [X] T036 [P] [US5] Unit test for delete_task functionality in tests/unit/test_todo_service.py
- [X] T037 [P] [US5] Integration test for delete command in tests/integration/test_cli.py

### Implementation for User Story 5

- [X] T038 [US5] Implement delete_task functionality in TodoService in src/todo_app/services/todo_service.py (depends on T005)
- [X] T039 [US5] Implement CLI delete command in src/todo_app/cli/cli.py (depends on T038)
- [X] T040 [US5] Test delete functionality end-to-end

**Checkpoint**: At this point, all user stories should be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T041 [P] Add error handling and validation across all services
- [X] T042 [P] Add comprehensive logging in all components
- [X] T043 [P] Create usage documentation in docs/usage.md
- [X] T044 [P] Add additional unit tests in tests/unit/
- [X] T045 [P] Add integration tests in tests/integration/
- [X] T046 Run quickstart.md validation
- [X] T047 Validate all CLI commands work as specified in contracts/cli-api.md
- [X] T048 Verify all constitution compliance requirements are met
- [X] T049 Final testing and validation of all functionality

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - May integrate with US1/US2/US3 but should be independently testable
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - May integrate with US1/US2/US3/US4 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Unit test for Task model in tests/unit/test_task.py"
Task: "Unit test for add_task functionality in tests/unit/test_todo_service.py"

# Launch all implementation for User Story 1 together:
Task: "Implement Task model with ID, title, description, and completion status in src/todo_app/models/task.py"
Task: "Implement add_task functionality in TodoService in src/todo_app/services/todo_service.py"
```

---

## Implementation Strategy

### MVP First (User Stories 1 and 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Add Task)
4. Complete Phase 4: User Story 2 (List Tasks)
5. **STOP and VALIDATE**: Test User Stories 1 and 2 independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
   - Developer E: User Story 5
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence