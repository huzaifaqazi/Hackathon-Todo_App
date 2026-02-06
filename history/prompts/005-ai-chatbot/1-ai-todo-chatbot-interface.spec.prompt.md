---
id: 1
title: "AI Todo Chatbot Interface Spec"
stage: spec
date_iso: "2026-02-01"
surface: "agent"
model: "Claude Sonnet 4.5"
feature: "ai-chatbot"
branch: "005-ai-chatbot"
user: "huzaifa"
command: "sp.specify"
labels: ["ai", "chatbot", "todo", "mcp", "specification"]
link_spec: "specs/005-ai-chatbot/spec.md"
link_ticket: null
link_adr: null
link_pr: null
files_yaml: |
  - specs/005-ai-chatbot/spec.md
  - specs/005-ai-chatbot/checklists/requirements.md
tests_yaml: |
  - "Specification completeness check"
  - "Quality validation checklist"
prompt_text: |
  AI-powered Todo Chatbot interface using MCP (Model Context Protocol) architecture
  Target users: Todo app users who want natural language task management
  Focus: Conversational AI interface integrated with existing Phase 2 Todo app on Vercel
  Success criteria:
  - Users can manage all CRUD operations through natural language chat
  - Conversation history persists across sessions (stateless server architecture)
  - AI successfully interprets 90%+ of common task management commands
  - Zero downtime integration with existing Phase 2 app (same user auth, same database)
  - Chat UI matches existing app design (Next.js + Tailwind CSS aesthetic)
  - Backend remains horizontally scalable (stateless FastAPI design)

  Tech stack (must use existing):
  - Frontend: Next.js 14+ with TypeScript, Tailwind CSS (existing Phase 2 setup)
  - Backend: FastAPI with SQLModel ORM (existing Phase 2 setup)
  - Database: Neon Serverless PostgreSQL (existing Phase 2 database - DO NOT create new DB)
  - Auth: Better Auth (existing Phase 2 authentication - reuse tokens/sessions)
  - New additions: OpenRouter API (cheaper alternative to OpenAI), Official MCP SDK for tool calling
  - AI Model: Use any model via OpenRouter (recommended: meta-llama/llama-3.1-8b-instruct:free or google/gemini-flash-1.5 for free tier)

  Architecture requirements:
  - Add chat interface as new route in existing Next.js frontend (/chat page)
  - Extend existing FastAPI backend with new /api/{user_id}/chat endpoint
  - MCP server runs as part of FastAPI app (not separate process)
  - All chat data stores in existing Neon database (add 2 new tables: conversations, messages)
  - Reuse existing Task model and task endpoints (no duplication)
  - Maintain existing authentication flow - chat requires logged-in user

  Database schema additions (extend existing):
  1. Conversation table:
     - user_id (foreign key to existing users table)
     - id (primary key)
     - created_at, updated_at (timestamps)

  2. Message table:
     - id (primary key)
     - conversation_id (foreign key to conversations)
     - user_id (foreign key to existing users table)
     - role (string: "user" or "assistant")
     - content (text)
     - created_at (timestamp)

  3. Existing Task table (DO NOT MODIFY - reuse as-is):
     - Keep all existing fields and relationships
     - MCP tools will query this table directly

  MCP Tools specification (5 required tools):
  1. add_task
     - Parameters: user_id (string, required), title (string, required), description (string, optional)
     - Returns: {task_id: int, status: "created", title: string}
     - Behavior: Creates new task in existing tasks table, validates user ownership

  2. list_tasks
     - Parameters: user_id (string, required), status (string, optional: "all"|"pending"|"completed")
     - Returns: Array of {id: int, title: string, description: string, completed: boolean}
     - Behavior: Queries existing tasks table with filters, returns only user's tasks

  3. complete_task
     - Parameters: user_id (string, required), task_id (int, required)
     - Returns: {task_id: int, status: "completed", title: string}
     - Behavior: Updates existing task's completed field to true, validates ownership

  4. delete_task
     - Parameters: user_id (string, required), task_id (int, required)
     - Returns: {task_id: int, status: "deleted", title: string}
     - Behavior: Soft or hard delete from existing tasks table, validates ownership

  5. update_task
     - Parameters: user_id (string, required), task_id (int, required), title (string, optional), description (string, optional)
     - Returns: {task_id: int, status: "updated", title: string}
     - Behavior: Updates existing task fields, validates ownership

  API endpoint specification:
  POST /api/{user_id}/chat
  Request body:
    {
      "conversation_id": int | null,  // null creates new conversation
      "message": string  // user's natural language input
    }

  Response:
    {
      "conversation_id": int,  // for continuing conversation
      "response": string,  // AI's reply to user
      "tool_calls": [  // optional, shows what actions were taken
        {
          "tool": string,  // tool name (e.g., "add_task")
          "result": object  // tool execution result
        }
      ]
    }

  Agent behavior requirements:
  - Understand natural language variations: "add task", "create todo", "remember to", "I need to"
  - Confirm actions: "✅ Created task: Buy groceries" (not just "OK")
  - Handle ambiguity: Ask clarifying questions if task title unclear
  - Chain operations: "Show my pending tasks and delete the first one"
  - Graceful errors: "I couldn't find task #5. You have tasks 1-4. Which did you mean?"
  - Friendly tone: Conversational, helpful, not robotic

  Natural language command examples (AI must handle):
  User says → AI should do:
  - "Add buy groceries" → add_task(title="Buy groceries")
  - "Show all tasks" → list_tasks(status="all")
  - "What's left to do?" → list_tasks(status="pending")
  - "Task 3 is done" → complete_task(task_id=3)
  - "Remove task about meeting" → list_tasks() first, find match, then delete_task()
  - "Change task 1 to 'Call mom tonight'" → update_task(task_id=1, title="Call mom tonight")
  - "Add reminder to pay rent by Friday" → add_task(title="Pay rent by Friday")

  Frontend UI requirements (integrate with existing Phase 2):
  Location: /frontend/src/app/chat/page.tsx (new page in existing Next.js app)

  Design must match existing Phase 2 UI:
  - Use same Tailwind color scheme from landing page
  - Same header/navigation component
  - Same authentication check (redirect to /login if not authenticated)
  - Same font families and sizing
  - Mobile-responsive (matches existing mobile layout)

  Chat interface components:
  1. Header: "AI Todo Assistant" with logout button (reuse existing header)
  2. Message area:
     - User messages: Right-aligned, blue background (bg-blue-500)
     - AI messages: Left-aligned, gray background (bg-gray-100)
     - Timestamp on each message
     - Auto-scroll to latest message
     - Loading indicator during AI response
     - Show tool calls as subtle badges (e.g., "✨ Added task")

  3. Input area (bottom fixed):
     - Text input with placeholder: "Type a message... (e.g., 'Add task to buy groceries')"
     - Send button (same styling as existing CTAs)
     - Enter key to send
     - Disabled during loading
     - Character count or validation feedback

  4. Sidebar (optional):
     - Recent conversations list
     - New chat button
     - Conversation titles (auto-generated from first message)

  5. Empty state:
     - Suggested prompts: "Try: 'Show my tasks'", "'Add task to call John'"
     - Welcome message from AI

  - Environment variables needed:
    * OPENROUTER_API_KEY (for AI agent - get free key from openrouter.ai)
    * DATABASE_URL (existing Neon PostgreSQL - reuse Phase 2)
    * BETTER_AUTH_SECRET (existing - reuse Phase 2)
    * NEXT_PUBLIC_API_URL (existing - reuse Phase 2)
    * OPENROUTER_MODEL (optional, default: meta-llama/llama-3.1-8b-instruct:free)

  - CORS: Update FastAPI CORS to allow Vercel frontend domain
  - Cost: OpenRouter free tier available with models like Llama 3.1 8B (completely free) or low-cost models

  Conversation flow (stateless architecture):
  1. User sends message via /chat page
  2. POST request to /api/{user_id}/chat endpoint
  3. Backend fetches conversation history from messages table
  4. Build message array: history + new user message
  5. Save user message to messages table
  6. Pass to OpenAI Agent with MCP tools context
  7. Agent calls appropriate MCP tool(s) based on intent
  8. MCP tool executes (queries/modifies tasks table)
  9. Save AI response to messages table
  10. Update conversation updated_at timestamp
  11. Return response to frontend
  12. Server clears all state (ready for next request)

  File structure (extend existing, don't duplicate):
  ```
  Hackathon-Todo_App/
  ├── frontend/  (existing - extend)
  │   ├── src/
  │   │   ├── app/
  │   │   │   ├── chat/  (NEW)
  │   │   │   │   ├── page.tsx
  │   │   │   │   └── components/
  │   │   │   │       ├── ChatMessage.tsx
  │   │   │   │       ├── ChatInput.tsx
  │   │   │   │       └── ConversationList.tsx
  │   │   │   ├── page.tsx  (existing - add link to /chat)
  │   │   │   ├── login/  (existing - reuse)
  │   │   │   └── register/  (existing - reuse)
  │   │   └── lib/
  │   │       └── chatApi.ts  (NEW - chat API client)
  │   ├── .env  (UPDATE - add OPENAI keys)
  │   └── package.json  (UPDATE - add dependencies if using ChatKit)
  │
  ├── backend/  (existing - extend)
  │   ├── src/
  │   │   ├── api/
  │   │   │   ├── chat.py  (NEW - chat endpoint)
  │   │   │   ├── tasks.py  (existing - reuse, don't modify)
  │   │   │   └── auth.py  (existing - reuse, don't modify)
  │   │   ├── mcp/  (NEW)
  │   │   │   ├── __init__.py
  │   │   │   ├── server.py  (MCP server setup)
  │   │   │   └── tools.py  (5 MCP tool implementations)
  │   │   ├── agents/  (NEW)
  │   │   │   ├── __init__.py
  │   │   │   └── todo_agent.py  (OpenAI Agent logic)
  │   │   ├── models/
  │   │   │   ├── conversation.py  (NEW - Conversation & Message models)
  │   │   │   ├── task.py  (existing - reuse, don't modify)
  │   │   │   └── user.py  (existing - reuse, don't modify)
  │   │   ├── database.py  (existing - reuse)
  │   │   └── main.py  (UPDATE - register chat router)
  │   ├── .env  (UPDATE - add OPENROUTER_API_KEY)
  │   ├── requirements.txt  (UPDATE - add httpx or requests for OpenRouter, mcp)
  │   └── alembic/  (existing - add new migration for conversations/messages)
  │
  ├── specs/  (existing)
  │   └── phase3-chatbot.spec  (NEW - this file)
  │
  └── README.md  (UPDATE - add Phase 3 setup instructions)
  ```

  Not building:
  - Separate chat application (integrate into existing app)
  - New database instance (use existing Neon DB)
  - New authentication system (reuse Better Auth)
  - Voice interface or speech-to-text
  - Multi-language support (English only for Phase 3)
  - Advanced AI features (sentiment analysis, task suggestions, smart scheduling)
  - Real-time WebSocket chat (use HTTP POST for simplicity)
  - Chat export or backup features
  - Admin panel for monitoring conversations
  - Rate limiting or abuse prevention (basic only)
  - Mobile native app (web-only, but responsive)

  Constraints:
  - Must maintain backward compatibility with Phase 2 features
  - Must not modify existing Task CRUD endpoints
  - Must not change existing database schema for users/tasks tables
  - Total implementation time: 1-2 weeks
  - AI API costs: FREE with OpenRouter's free models (Llama 3.1 8B) or ~$0.50-2 for paid models during testing
  - No breaking changes to existing deployed Phase 2 app

  Testing requirements:
  - Unit tests for each MCP tool (add_task, list_tasks, etc.)
  - Integration test for chat endpoint (send message → receive response)
  - E2E test: Full conversation flow (add task → list tasks → complete task)
  - Test natural language variations (10+ different phrasings per command)
  - Test error handling (invalid task IDs, unauthorized access, API failures)
  - Load test: 50 concurrent conversations without state leaks

  Success metrics:
  - 90%+ command success rate on test set of 100 natural language inputs
  - Average response time < 3 seconds for simple commands
  - Zero data leaks between user conversations
  - Zero downtime during deployment to production
  - 100% authentication enforcement (no unauthorized task access)

  Documentation requirements:
  - Update README.md with Phase 3 setup instructions
  - Add API documentation for /chat endpoint in existing /docs
  - Create PHASE3.md with:
    * Architecture diagram showing MCP flow
    * Natural language command examples
    * Troubleshooting guide
    * OpenRouter setup instructions (get API key from openrouter.ai)
    * Free model recommendations and pricing comparison
  - Add inline code comments for MCP tools and agent logic
  - Update .env.example files with new required variables
response_text: |
  Successfully created specification for AI-powered Todo Chatbot interface. The specification includes:

  1. Three main user stories prioritized by importance:
     - Natural Language Task Management (P1)
     - Persistent Conversation History (P2)
     - Integration with existing app (P3)

  2. Functional requirements covering:
     - Natural language command processing
     - Conversation persistence
     - Authentication integration
     - MCP protocol support
     - UI consistency

  3. Success criteria with measurable outcomes:
     - 90%+ success rate on common commands
     - Sub-3-second response times
     - Zero downtime integration
     - 100% authentication enforcement

  The specification follows the template structure and is ready for the planning phase.
outcome: "Specification created successfully with all required sections completed. No clarifications needed as all requirements were clearly defined in the original feature description."
evaluation: "The specification meets all quality criteria: user-focused, testable requirements, measurable success criteria, and proper structure. Ready to proceed to planning phase."
---