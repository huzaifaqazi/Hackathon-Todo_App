# Implementation Tasks: AI-powered Todo Chatbot Interface

**Feature**: 005-ai-chatbot | **Date**: 2026-02-01 | **Spec**: specs/005-ai-chatbot/spec.md

## Overview
This document contains the implementation tasks for the AI-powered Todo Chatbot Interface. The feature enables users to manage their tasks through natural language commands using MCP (Model Context Protocol) architecture.

## Implementation Strategy
- **MVP First**: Complete User Story 1 (Natural Language Task Management) as the minimum viable product
- **Incremental Delivery**: Build foundational components first, then add user stories in priority order
- **Parallel Development**: Backend and frontend tasks can be developed in parallel where they don't depend on each other
- **Test Early**: Validate core functionality early to ensure AI integration works properly

## Phase 1: Setup Tasks
Initialize project structure and dependencies for the chatbot feature.

- [X] T001 Create backend models: backend/src/models/conversation.py, backend/src/models/message.py
- [X] T002 Create backend services: backend/src/services/conversation_service.py, backend/src/services/ai_service.py
- [X] T003 [P] Add OpenRouter SDK dependency to backend requirements.txt
- [X] T004 [P] Add MCP SDK dependency to backend requirements.txt
- [X] T005 [P] Add chatbot-specific dependencies to frontend package.json
- [X] T006 Configure environment variables for OpenRouter API key
- [X] T007 Set up database migration for new conversation/message tables

## Phase 2: Foundational Tasks
Core infrastructure and shared components needed for all user stories.

- [X] T008 Implement Conversation model in backend/src/models/conversation.py
- [X] T009 Implement Message model in backend/src/models/message.py
- [X] T010 Implement ToolExecution model in backend/src/models/tool_execution.py
- [X] T011 Create database migrations for new models
- [X] T012 Implement ConversationService in backend/src/services/conversation_service.py
- [X] T013 Implement MessageService in backend/src/services/message_service.py
- [X] T014 [P] Implement authentication middleware for chat endpoints
- [X] T015 [P] Set up OpenRouter client configuration in backend/src/services/ai_service.py
- [X] T016 Create MCP tools module in backend/src/services/mcp_tools.py
- [X] T017 Implement base chat API routes in backend/src/api/chat_routes.py
- [X] T018 Integrate chat routes into main application in backend/src/main.py

## Phase 3: User Story 1 - Natural Language Task Management (Priority: P1)
Users can interact with their todo list using natural language commands instead of clicking buttons and filling forms.

**Goal**: Enable users to add, view, update, and delete tasks using natural language commands through the chat interface.

**Independent Test**: Users can successfully add, view, update, and delete tasks using natural language commands through the chat interface.

### Acceptance Scenarios:
1. **Given** user is logged in and on the chat page, **When** user types "Add buy groceries", **Then** a new task titled "buy groceries" is created and confirmed to the user
2. **Given** user has existing tasks, **When** user types "Show all tasks", **Then** all tasks are displayed in the chat with their status
3. **Given** user has pending tasks, **When** user types "Task 3 is done", **Then** task 3 is marked as completed and the user receives confirmation
4. **Given** user has multiple tasks, **When** user types "What's left to do?", **Then** only pending tasks are shown to the user

- [X] T025 [P] [US1] Implement create_task MCP tool in backend/src/tools/mcp_tools.py
- [X] T026 [P] [US1] Implement list_tasks MCP tool in backend/src/tools/mcp_tools.py
- [X] T027 [P] [US1] Implement update_task MCP tool in backend/src/tools/mcp_tools.py
- [X] T028 [P] [US1] Implement delete_task MCP tool in backend/src/tools/mcp_tools.py
- [X] T029 [P] [US1] Implement complete_task MCP tool in backend/src/tools/mcp_tools.py
- [X] T030 [US1] Implement AI service with MCP tool integration in backend/src/services/ai_service.py
- [X] T031 [US1] Implement chat endpoint POST /chat/conversations/{id}/chat in backend/src/api/chat_routes.py
- [X] T032 [P] [US1] Create ChatInterface component in frontend/src/components/ChatInterface.tsx
- [X] T033 [P] [US1] Create MessageBubble component in frontend/src/components/MessageBubble.tsx
- [X] T034 [P] [US1] Create MessageInput component in frontend/src/components/MessageInput.tsx
- [X] T035 [US1] Create chat API service in frontend/src/services/chatApi.ts
- [X] T036 [US1] Create chat page route in frontend/src/pages/chat.tsx
- [X] T037 [US1] Connect frontend to backend chat API
- [X] T038 [US1] Add chat page link to navigation in frontend components
- [X] T039 [US1] Test natural language task management functionality

## Phase 4: User Story 2 - Persistent Conversation History (Priority: P2)
Users can continue conversations across multiple sessions, with their chat history preserved so they can pick up where they left off and maintain context for ongoing tasks.

**Goal**: Enable conversation history to persist across sessions with proper user isolation.

**Independent Test**: After closing and reopening the app, users can see their previous conversation history and continue interacting with the same context.

### Acceptance Scenarios:
1. **Given** user has had a conversation with the chatbot, **When** user closes and reopens the app, **Then** previous conversation history is displayed
2. **Given** user has multiple conversations, **When** user navigates between them, **Then** each conversation maintains its own context and history

- [X] T040 [P] [US2] Implement GET /chat/conversations endpoint in backend/src/api/chat_routes.py
- [X] T041 [P] [US2] Implement GET /chat/conversations/{id} endpoint in backend/src/api/chat_routes.py
- [X] T042 [P] [US2] Implement DELETE /chat/conversations/{id} endpoint in backend/src/api/chat_routes.py
- [X] T043 [P] [US2] Implement GET /chat/conversations/{id}/messages endpoint in backend/src/api/chat_routes.py
- [X] T044 [P] [US2] Implement POST /chat/conversations endpoint in backend/src/api/chat_routes.py
- [X] T045 [US2] Add conversation listing functionality to frontend chat interface
- [X] T046 [US2] Add conversation switching capability to frontend
- [X] T047 [US2] Implement conversation history loading in frontend
- [X] T048 [US2] Add conversation title auto-generation
- [X] T049 [US2] Test persistent conversation history functionality

## Phase 5: User Story 3 - Integration with Existing Todo App (Priority: P3)
The chatbot seamlessly integrates with the existing todo app functionality, sharing the same authentication, database, and user interface design to provide a unified experience.

**Goal**: Ensure the chatbot integrates with existing authentication and shares task data with the traditional UI.

**Independent Test**: Users can access the chatbot using their existing login credentials and see tasks they've created through both the traditional UI and chat interface.

### Acceptance Scenarios:
1. **Given** user is logged into the existing app, **When** user navigates to the chat page, **Then** they are automatically authenticated for the chatbot
2. **Given** user creates tasks via chatbot, **When** user visits the traditional task list page, **Then** those tasks appear in the standard todo list

- [X] T050 [P] [US3] Implement Better Auth integration for chat endpoints
- [X] T051 [P] [US3] Add user ID validation to all chat endpoints
- [X] T052 [P] [US3] Implement task service that reuses existing Task model
- [X] T053 [P] [US3] Add user ownership validation to all task operations
- [X] T054 [US3] Create reusable styling components that match existing app design
- [X] T055 [US3] Add Tailwind CSS classes to match existing UI aesthetic
- [X] T056 [US3] Implement cross-platform task visibility (chat ↔ traditional UI)
- [X] T057 [US3] Add error handling for authentication failures
- [X] T058 [US3] Test integration with existing todo app functionality

## Phase 6: Critical Bug Fix - Conversation ID Error
Addressing critical issue where conversation IDs are not being properly returned from backend, causing "Cannot read properties of undefined (reading 'id')" errors in ChatInterface.tsx line 140.

- [X] T059 [P] [US1] Fix backend conversation creation to properly return conversation IDs by adding session.refresh() after creating conversations in backend/src/services/conversation_service.py
- [X] T060 [P] [US1] Add validation in conversation_service.py to ensure conversation.id exists before returning
- [X] T061 [P] [US1] Update create_conversation endpoint in chat_routes.py to call session.refresh() after commit
- [X] T062 [P] [US1] Add validation in create_conversation endpoint to ensure conversation.id is not None
- [X] T063 [US1] Add HTTPException with 500 status if conversation ID is still None after refresh in backend/src/api/chat_routes.py
- [X] T064 [US1] Update ChatInterface.tsx createNewConversation function to validate response contains valid conversation ID around line 140
- [X] T065 [US1] Add error handling in createNewConversation to check if data.conversation.id exists and is valid
- [X] T066 [US1] Throw appropriate error if conversation_id is missing/null/undefined/not a number in frontend/src/components/ChatInterface.tsx
- [X] T067 [US1] Wrap createNewConversation function in try-catch block for proper error handling in frontend/src/components/ChatInterface.tsx
- [X] T068 [US1] Add logging in catch block to console and re-throw error for calling function in frontend/src/components/ChatInterface.tsx
- [X] T069 [US1] Update handleSendMessage function to properly handle conversation creation failures around line 157 in frontend/src/components/ChatInterface.tsx
- [X] T070 [US1] Test complete message flow: user sends message → conversation created → AI responds
- [X] T071 [US1] Verify conversation titles are properly updated with first message content and no empty "Untitled Conversation" entries are created
- [X] T072 [US1] Verify conversation timestamps display properly (relative time instead of "Invalid Date")
- [X] T073 [US1] Confirm backend logs show "Created new conversation" with valid ID and API endpoint returns JSON response with valid conversation_id
- [X] T074 [US1] Run comprehensive testing to ensure no console errors appear when sending messages

## Phase 7: Cross-Cutting Concerns
Additional polish and validation tasks.

- [X] T075 Add additional error handling for edge cases in both backend and frontend
- [X] T076 Update documentation to reflect the conversation ID handling improvements
- [X] T077 Add unit tests for the fixed conversation creation and message sending functionality
- [X] T078 Perform final integration testing to ensure no regressions were introduced
- [X] T079 Clean up temporary logging and debugging code added during the fix process
- [X] T080 Perform security audit of new endpoints
- [X] T081 Conduct end-to-end testing of all user stories

## Dependencies
- **User Story 2** depends on: User Story 1 (needs core chat functionality first)
- **User Story 3** depends on: User Story 1 (needs core functionality) and User Story 2 (needs conversation management)

## Parallel Execution Opportunities
- Backend models and services can be developed in parallel with frontend components
- MCP tools implementation can run in parallel with API endpoint development
- Each user story's frontend and backend components can be developed separately
- Testing can begin as soon as each component is completed