# Data Model: AI-powered Todo Chatbot Interface

## Overview
This document defines the data models for the AI-powered Todo Chatbot interface, focusing on conversation entities and their relationships with existing task and user entities.

## Entity: Conversation
Represents a chat session between user and AI assistant, containing multiple messages and associated with a specific user.

### Fields
- `id` (UUID, Primary Key) - Unique identifier for the conversation
- `user_id` (UUID, Foreign Key) - Reference to the user who owns this conversation
- `title` (String, Optional) - Auto-generated title based on first message or topic
- `created_at` (DateTime) - Timestamp when conversation was initiated
- `updated_at` (DateTime) - Timestamp when conversation was last updated
- `is_active` (Boolean) - Whether the conversation is currently active

### Relationships
- One-to-many with Message (one conversation has many messages)
- Many-to-one with User (many conversations belong to one user)

### Validation Rules
- `user_id` must reference an existing user
- `title` must be 1-100 characters if provided
- `is_active` defaults to true when created

## Entity: Message
Represents individual exchanges within a conversation, including user input and AI responses, with timestamps and roles.

### Fields
- `id` (UUID, Primary Key) - Unique identifier for the message
- `conversation_id` (UUID, Foreign Key) - Reference to the parent conversation
- `role` (Enum: 'user'|'assistant'|'system') - The role of the message sender
- `content` (Text) - The actual message content
- `timestamp` (DateTime) - When the message was sent/received
- `tool_calls` (JSON, Optional) - MCP tool calls made during this message
- `tool_responses` (JSON, Optional) - Responses from executed tools
- `message_type` (Enum: 'text'|'tool_result'|'feedback') - Type classification

### Relationships
- Many-to-one with Conversation (many messages belong to one conversation)
- One-to-many with ToolExecution (optional tool executions from this message)

### Validation Rules
- `role` must be one of the allowed enum values
- `content` must be 1-5000 characters
- `conversation_id` must reference an existing conversation
- `tool_calls` must follow MCP tool call format when present

## Entity: ToolExecution (New for MCP)
Represents the execution of MCP tools during conversation processing.

### Fields
- `id` (UUID, Primary Key) - Unique identifier for the tool execution
- `message_id` (UUID, Foreign Key) - Reference to the message that triggered this tool
- `tool_name` (String) - Name of the tool executed
- `arguments` (JSON) - Arguments passed to the tool
- `result` (JSON) - Result of the tool execution
- `status` (Enum: 'success'|'error'|'pending') - Execution status
- `executed_at` (DateTime) - When the tool was executed

### Relationships
- Many-to-one with Message (many tool executions can result from one message)
- One-to-many with ToolParameter (parameters used in execution)

### Validation Rules
- `tool_name` must be one of the registered MCP tools
- `arguments` and `result` must be valid JSON
- `status` must be one of the allowed enum values

## Integration with Existing Models

### Relationship with Task (Existing Model)
- Messages in conversations can reference and operate on existing Task entities
- Conversation context may include relevant Task information
- Tool executions may modify existing Task records

### Relationship with User (Existing Model)
- Conversations are owned by Users and enforce access controls
- User authentication verified before conversation access
- User preferences may influence conversation behavior

## State Transitions

### Conversation States
- `Active`: New conversation created, ready for messages
- `Paused`: Conversation inactive but can be resumed
- `Archived`: Long-term storage, read-only access

### Message States
- `Pending`: AI processing in progress
- `Ready`: Ready to display to user
- `Error`: Processing failed, requires retry or user action

## Database Schema Considerations

### Indexes
- Index on `conversations.user_id` for user-specific queries
- Composite index on `messages.conversation_id` and `timestamp` for chronological ordering
- Index on `tool_executions.message_id` for tool-result relationships

### Constraints
- Foreign key constraints to maintain referential integrity
- Check constraints to validate enum values
- Unique constraint on conversation access control

### Performance Considerations
- Partition conversations by user or date range for large datasets
- Archive old conversations to separate tables
- Cache frequently accessed conversation contexts