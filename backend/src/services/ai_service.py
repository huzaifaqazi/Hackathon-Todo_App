"""AI service for the chatbot feature using Google Gemini API."""

import os
import json
import asyncio
import logging
import httpx
from typing import Dict, Any, List, Optional
from .mcp_tools import MCPTaskTools
from .tool_execution_service import ToolExecutionService
from ..models.tool_execution import ToolExecutionStatus

logger = logging.getLogger(__name__)


class AIService:
    """Service class for handling AI interactions with MCP tool integration using Google Gemini."""

    def __init__(self):
        """Initialize the AI service with Google Gemini API key."""
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")

    async def process_chat_message(self, user_message: str, conversation_history: List[Dict[str, str]] = None, user_id: str = None, session=None) -> Dict[str, Any]:
        """
        Process a user message and return AI response with potential tool calls using Gemini API.

        Args:
            user_message: The message from the user
            conversation_history: Previous messages in the conversation
            user_id: ID of the user making the request
            session: Database session for the request

        Returns:
            Dictionary containing the AI response and any tool calls
        """
        try:
            logger.info(f"Processing chat message: {user_message[:50]}...")

            # Build system instruction
            system_instruction = """
You are a helpful AI assistant for managing tasks. You can help users create, list, update, complete, and delete tasks using natural language.
Use the following tools when needed:

1. create_task(title, description="", due_date="", priority="medium", status="pending"):
   - Creates a new task
   - Parameters: title (required), description, due_date (ISO format), priority (low/medium/high), status (pending/in-progress/completed)
   - Example: create_task(title="Buy groceries", priority="medium")

2. list_tasks(status="all"):
   - Lists all tasks, optionally filtered by status
   - Parameters: status (all/pending/in-progress/completed)
   - Example: list_tasks(status="pending")

3. update_task(task_id, title=None, description=None, due_date=None, priority=None, status=None):
   - Updates an existing task
   - Parameters: task_id (required), title, description, due_date, priority, status
   - Examples:
     - update_task(task_id=1, status="in-progress")  # Using task number
     - update_task(task_id="video", status="pending")  # Using task name
     - update_task(task_id="Developing", status="completed")  # Using task name

4. delete_task(task_id):
   - Deletes a task
   - Parameters: task_id (required)
   - Examples:
     - delete_task(task_id=1)  # Using task number
     - delete_task(task_id="video")  # Using task name
     - delete_task(task_id="Developing")  # Using task name

5. complete_task(task_id, completed=True):
   - Marks a task as completed or pending
   - Parameters: task_id (required), completed (true/false, default true)
   - Examples:
     - complete_task(task_id=1)  # Using task number
     - complete_task(task_id="video")  # Using task name

Important guidelines:
- Always respond with tool calls in this format: TOOL: tool_name(param1="value1", param2="value2")
- Priority must be lowercase: low, medium, high
- Status must be lowercase with hyphens: pending, in-progress, completed
- You can use task IDs (numbers like 1, 2, 3), or task names to identify tasks
- When users say "task 1", "task 2", use the number as task_id
- When users mention a task name, use that as task_id
- For commands like "delete developing tasks", extract "developing" as the task_id
- When users want to see tasks, call list_tasks
- When users want to add a task, call create_task
- When users want to update or complete a task, call the appropriate tool
"""

            # Build conversation context
            context_parts = [f"SYSTEM INSTRUCTION:\n{system_instruction}\n"]

            # Add conversation history if available
            if conversation_history:
                logger.debug(f"Including {len(conversation_history)} messages in history")
                for msg in conversation_history[-5:]:  # Use last 5 messages for context
                    role = msg.get("role", "user")
                    content = msg.get("content", "")
                    context_parts.append(f"{role.upper()}: {content}")

            # Add the current user message
            context_parts.append(f"USER: {user_message}")
            context_parts.append("ASSISTANT:")

            # Combine all parts into the prompt
            full_prompt = "\n".join(context_parts)

            # Prepare the API request - using gemini-flash-latest as the correct model name (free tier)
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={self.api_key}"

            payload = {
                "contents": [{
                    "parts": [{
                        "text": full_prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 800
                },
                "safetySettings": [
                    {
                        "category": "HARM_CATEGORY_HARASSMENT",
                        "threshold": "BLOCK_NONE"
                    },
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": "BLOCK_NONE"
                    }
                ]
            }

            # Add small delay to prevent rapid request bursts
            await asyncio.sleep(0.5)

            # Make the API call to Gemini with exponential backoff retry logic
            logger.debug("Making API call to Google Gemini")
            max_retries = 3
            retry_count = 0
            initial_retry_delay = 2.0  # Start with 2 seconds
            ai_text = None  # Initialize to ensure it's always defined if needed

            while retry_count < max_retries:
                try:
                    async with httpx.AsyncClient(timeout=30.0) as client:
                        response = await client.post(url, json=payload)

                        if response.status_code == 429:  # Rate limited
                            logger.warning(f"Gemini API rate limited (attempt {retry_count + 1}/{max_retries})")
                            if retry_count < max_retries - 1:
                                retry_delay = initial_retry_delay * (2 ** retry_count)  # Exponential backoff
                                logger.info(f"Waiting {retry_delay}s before retry {retry_count + 2}")
                                await asyncio.sleep(retry_delay)
                                retry_count += 1
                                continue
                            else:
                                return {
                                    "content": "The AI service is temporarily rate-limited. This typically clears within 30-60 seconds. Please wait a moment and send your message again.",
                                    "tool_calls": [],
                                    "tool_responses": [],
                                    "error": "Gemini API rate limited"
                                }

                        if response.status_code != 200:
                            logger.error(f"Gemini API error: {response.status_code} - {response.text}")
                            return {
                                "content": "Sorry, I encountered an error connecting to the AI service.",
                                "tool_calls": [],
                                "tool_responses": [],
                                "error": f"Gemini API error: {response.status_code}"
                            }

                        result = response.json()

                        # Extract AI response
                        try:
                            ai_text = result["candidates"][0]["content"]["parts"][0]["text"]
                            break  # Success, exit retry loop
                        except (KeyError, IndexError) as e:
                            logger.error(f"Error parsing Gemini response: {e}")
                            logger.error(f"Full response structure: {result.keys() if isinstance(result, dict) else type(result)}")
                            if isinstance(result, dict) and "candidates" in result:
                                logger.error(f"Candidates length: {len(result['candidates']) if isinstance(result['candidates'], list) else 'Not a list'}")

                            # If this was the last attempt, return error
                            if retry_count >= max_retries - 1:
                                return {
                                    "content": "Sorry, I received an unexpected response from the AI service.",
                                    "tool_calls": [],
                                    "tool_responses": [],
                                    "error": f"Response parsing error: {e}"
                                }
                            else:
                                # Try again with exponential backoff
                                retry_delay = initial_retry_delay * (2 ** retry_count)
                                logger.info(f"Response parsing failed, retrying in {retry_delay}s (attempt {retry_count + 2})")
                                await asyncio.sleep(retry_delay)
                                retry_count += 1

                except httpx.ConnectError as e:
                    logger.error(f"Connection error to Gemini API: {e}")
                    if retry_count < max_retries - 1:
                        retry_delay = initial_retry_delay * (2 ** retry_count)  # Exponential backoff
                        logger.info(f"Connection failed, retrying in {retry_delay}s (attempt {retry_count + 2})")
                        await asyncio.sleep(retry_delay)
                        retry_count += 1
                        continue
                    else:
                        return {
                            "content": "I'm having trouble connecting to the AI service. Please try again in a moment.",
                            "tool_calls": [],
                            "tool_responses": [],
                            "error": f"Connection error: {str(e)}"
                        }
                except httpx.TimeoutException as e:
                    logger.error(f"Timeout error with Gemini API: {e}")
                    if retry_count < max_retries - 1:
                        retry_delay = initial_retry_delay * (2 ** retry_count)  # Exponential backoff
                        logger.info(f"Timeout occurred, retrying in {retry_delay}s (attempt {retry_count + 2})")
                        await asyncio.sleep(retry_delay)
                        retry_count += 1
                        continue
                    else:
                        return {
                            "content": "The AI service is taking too long to respond. Please try again.",
                            "tool_calls": [],
                            "tool_responses": [],
                            "error": f"Timeout error: {str(e)}"
                        }
                except Exception as e:
                    logger.error(f"Unexpected error with Gemini API: {e}")
                    if retry_count < max_retries - 1:
                        retry_delay = initial_retry_delay * (2 ** retry_count)  # Exponential backoff
                        logger.info(f"Unexpected error, retrying in {retry_delay}s (attempt {retry_count + 2})")
                        await asyncio.sleep(retry_delay)
                        retry_count += 1
                        continue
                    else:
                        return {
                            "content": f"An unexpected error occurred: {str(e)}",
                            "tool_calls": [],
                            "tool_responses": [],
                            "error": str(e)
                        }

            # Look for tool calls in the AI response
            tool_calls = []
            tool_responses = []
            cleaned_content = ai_text

            # Find lines containing "TOOL:"
            lines = ai_text.split('\n')
            tool_lines = [line for line in lines if line.strip().startswith('TOOL:')]

            for tool_line in tool_lines:
                # Extract tool name and parameters
                tool_match = tool_line.strip().replace('TOOL:', '').strip()

                # Parse the tool call format: tool_name(param="value", param2="value2")
                import re
                tool_pattern = r'(\w+)\((.*)\)'
                match = re.match(tool_pattern, tool_match)

                if match:
                    tool_name = match.group(1)
                    params_str = match.group(2)

                    # Parse parameters
                    params = {}
                    if params_str.strip():
                        # Split parameters by comma, but handle nested commas inside quotes
                        param_parts = []
                        current_param = ""
                        paren_depth = 0
                        quote_char = None
                        escape_next = False

                        for char in params_str:
                            if escape_next:
                                current_param += char
                                escape_next = False
                            elif char == '\\':
                                escape_next = True
                                current_param += char
                            elif char in ['"', "'"] and not escape_next:
                                if quote_char is None:
                                    quote_char = char
                                    current_param += char
                                elif quote_char == char:
                                    quote_char = None
                                    current_param += char
                                else:
                                    current_param += char
                            elif char == '(':
                                paren_depth += 1
                                current_param += char
                            elif char == ')':
                                paren_depth -= 1
                                current_param += char
                            elif char == ',' and paren_depth == 0 and quote_char is None:
                                param_parts.append(current_param.strip())
                                current_param = ""
                            else:
                                current_param += char

                        if current_param.strip():
                            param_parts.append(current_param.strip())

                        for param in param_parts:
                            if '=' in param:
                                key, value = param.split('=', 1)
                                key = key.strip()

                                # Handle quoted strings
                                value = value.strip()
                                if value.startswith('"') and value.endswith('"'):
                                    value = value[1:-1]
                                elif value.startswith("'") and value.endswith("'"):
                                    value = value[1:-1]
                                elif value.lower() == 'true':
                                    value = True
                                elif value.lower() == 'false':
                                    value = False
                                elif value.lower() == 'none':
                                    value = None
                                elif value.isdigit():
                                    value = int(value)
                                elif '.' in value and value.replace('.', '').isdigit():
                                    value = float(value)

                                params[key] = value

                    # Normalize enum values before executing the tool
                    if 'priority' in params and isinstance(params['priority'], str):
                        params['priority'] = params['priority'].lower()
                    elif 'priority' in params and params['priority'] is not None and not isinstance(params['priority'], str):
                        # Convert non-string priority to string before normalization
                        params['priority'] = str(params['priority']).lower()

                    if 'status' in params and isinstance(params['status'], str):
                        params['status'] = params['status'].lower().replace(' ', '-')
                        if 'inprogress' in params['status']:
                            params['status'] = 'in-progress'
                    elif 'status' in params and params['status'] is not None and not isinstance(params['status'], str):
                        # Convert non-string status to string before normalization
                        params['status'] = str(params['status']).lower().replace(' ', '-')
                        if 'inprogress' in params['status']:
                            params['status'] = 'in-progress'

                    # Add user_id as the first parameter for all tools
                    tools = MCPTaskTools(session=session)

                    # Map function names to actual tool methods
                    tool_methods = {
                        "create_task": tools.create_task,
                        "list_tasks": tools.list_tasks,
                        "update_task": tools.update_task,
                        "delete_task": tools.delete_task,
                        "complete_task": tools.complete_task
                    }

                    if tool_name in tool_methods:
                        try:
                            # Execute the tool with user_id as the first parameter
                            tool_method = tool_methods[tool_name]

                            # Prepare arguments with user_id as the first parameter
                            if tool_name == "create_task":
                                result = tool_method(user_id, **params)
                            elif tool_name == "list_tasks":
                                result = tool_method(user_id, **params)
                            elif tool_name == "update_task":
                                result = tool_method(user_id, **params)
                            elif tool_name == "delete_task":
                                result = tool_method(user_id, **params)
                            elif tool_name == "complete_task":
                                result = tool_method(user_id, **params)
                            else:
                                result = tool_method(user_id, **params)

                            tool_calls.append({
                                "name": tool_name,
                                "arguments": params
                            })

                            tool_responses.append({
                                "name": tool_name,
                                "content": result
                            })
                        except Exception as e:
                            logger.error(f"Error executing tool {tool_name}: {e}", exc_info=True)
                            tool_calls.append({
                                "name": tool_name,
                                "arguments": params,
                                "error": str(e)
                            })

                            tool_responses.append({
                                "name": tool_name,
                                "content": {
                                    "success": False,
                                    "error": str(e),
                                    "message": f"Error executing {tool_name}: {str(e)}"
                                }
                            })
                    else:
                        logger.warning(f"Unknown tool requested: {tool_name}")

            # Remove tool call lines from the AI response
            cleaned_lines = [line for line in lines if not line.strip().startswith('TOOL:')]
            cleaned_content = '\n'.join(cleaned_lines).strip()

            # Generate friendly response based on tool execution
            if tool_responses:
                friendly_responses = []
                for response in tool_responses:
                    result = response["content"]
                    if result["success"]:
                        if response["name"] == "create_task" and "title" in result:
                            friendly_responses.append(f"✅ Created task: {result['title']}")
                        elif response["name"] == "complete_task" and "task_id" in result:
                            friendly_responses.append(f"✅ Completed task: {result.get('message', 'Task completed')}")
                        elif response["name"] == "delete_task" and "task_id" in result:
                            friendly_responses.append(f"🗑️ Deleted task: {result.get('message', 'Task deleted')}")
                        elif response["name"] == "update_task" and "task_id" in result:
                            friendly_responses.append(f"✏️ Updated task: {result.get('message', 'Task updated')}")
                        elif response["name"] == "list_tasks":
                            if result.get("tasks"):
                                task_list = result["tasks"]
                                count = result["count"]
                                task_responses = [f"📋 You have {count} task{'s' if count != 1 else ''}:"]

                                for i, task in enumerate(task_list, 1):
                                    emoji = "✅" if task["status"] == "completed" else "📝"
                                    priority = str(task["priority"]).replace('_', ' ').title() if task["priority"] else ""
                                    status = str(task["status"]).replace('-', ' ').title() if task["status"] else ""

                                    task_info = f"{i}. {emoji} {task['title']}"
                                    if task["description"]:
                                        task_info += f"\n   Description: {task['description']}"
                                    task_info += f"\n   Priority: {priority} | Status: {status}"
                                    if task["due_date"]:
                                        try:
                                            from datetime import datetime
                                            date_obj = datetime.fromisoformat(task["due_date"].split('T')[0])
                                            formatted_date = date_obj.strftime('%b %d, %Y')
                                            task_info += f" | Due: {formatted_date}"
                                        except:
                                            task_info += f" | Due: {task['due_date'][:10]}"
                                    else:
                                        task_info += " | Due: Not set"
                                    task_responses.append(task_info)

                                friendly_responses.extend(task_responses)
                            else:
                                friendly_responses.append(result.get("message", "No tasks found"))
                        else:
                            friendly_responses.append(result.get("message", "Action completed"))
                    else:
                        friendly_responses.append(f"❌ Error: {result.get('message', 'Operation failed')}")

                # Combine AI response with tool execution results
                if cleaned_content:
                    final_content = cleaned_content + "\n\n" + "\n".join(friendly_responses)
                else:
                    final_content = "\n".join(friendly_responses)
            else:
                # No tools were called, just return the AI response
                if not cleaned_content:
                    final_content = "Done! Anything else I can help with?"
                else:
                    final_content = cleaned_content

            logger.info("Successfully processed chat message")
            return {
                "content": final_content,
                "tool_calls": tool_calls,
                "tool_responses": tool_responses
            }

        except Exception as e:
            logger.error(f"Unexpected error processing chat message: {str(e)}", exc_info=True)
            return {
                "content": f"Sorry, I encountered an error processing your request: {str(e)}",
                "tool_calls": [],
                "tool_responses": [],
                "error": str(e)
            }


# Lazy initialization to avoid startup issues
ai_service = None


def get_ai_service():
    """Lazy initialization of AI service to avoid startup issues."""
    global ai_service
    if ai_service is None:
        ai_service = AIService()
    return ai_service