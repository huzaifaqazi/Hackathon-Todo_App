# Frontend Task Components Documentation

## Overview
The frontend task management components provide a complete UI for creating, viewing, editing, and deleting tasks. These components are built with React and integrate with the backend API.

## Components

### TaskCard Component
Displays a single task with action buttons for editing, deleting, and marking as complete.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| task | Task | Yes | The task object to display |
| onEdit | Function | No | Callback function called when edit button is clicked |
| onDelete | Function | No | Callback function called when delete button is clicked |
| onToggleComplete | Function | No | Callback function called when complete/undo button is clicked |
| deletingId | String | No | ID of the task currently being deleted (shows loading state) |
| saving | Boolean | No | Whether a save operation is in progress (disables delete button) |

#### Example Usage
```jsx
<TaskCard
  task={task}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onToggleComplete={handleToggleComplete}
  deletingId={currentlyDeletingTaskId}
  saving={isSaving}
/>
```

#### Accessibility Features
- Proper ARIA labels for all interactive elements
- Semantic HTML structure
- Keyboard navigable
- Screen reader friendly

---

### TaskList Component
Displays a list of TaskCard components with proper handling for empty states.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| tasks | Array<Task> | Yes | Array of task objects to display |
| onEdit | Function | No | Callback function called when edit button is clicked |
| onDelete | Function | No | Callback function called when delete button is clicked |
| onToggleComplete | Function | No | Callback function called when complete/undo button is clicked |
| deletingId | String | No | ID of the task currently being deleted |
| saving | Boolean | No | Whether a save operation is in progress |

#### Example Usage
```jsx
<TaskList
  tasks={tasks}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onToggleComplete={handleToggleComplete}
  deletingId={currentlyDeletingTaskId}
  saving={isSaving}
/>
```

---

### TaskForm Component
Provides a form for creating and editing tasks with validation.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| task | Task or null | No | Task object to edit (null for new task) |
| onSave | Function | Yes | Callback function called when form is submitted |
| onCancel | Function | Yes | Callback function called when cancel button is clicked |

#### Validation Rules
- Title is required and must be between 1 and 200 characters
- Description, if provided, must not exceed 1000 characters
- Status must be one of: "pending", "in-progress", "completed"
- Priority must be one of: "low", "medium", "high"

#### Example Usage
```jsx
<TaskForm
  task={selectedTask}
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

---

## Task Context (TaskContext)

The TaskContext provides global state management for tasks across the application.

### Provider
Wrap your application or relevant parts with the TaskProvider:

```jsx
<TaskProvider>
  <YourApp />
</TaskProvider>
```

### Hook
Use the `useTaskContext` hook to access task functionality:

```jsx
const { tasks, loading, error, fetchTasks, createTask, updateTask, patchTask, deleteTask } = useTaskContext();
```

### Available Functions
- `fetchTasks(params)`: Fetch all tasks with optional filters
- `createTask(taskData)`: Create a new task
- `updateTask(taskId, taskData)`: Update an entire task
- `patchTask(taskId, taskData)`: Partially update a task
- `deleteTask(taskId)`: Delete a task

### State Properties
- `tasks`: Array of all loaded tasks
- `loading`: Boolean indicating if data is being loaded
- `error`: Error message if an operation failed

---

## API Service (taskApi)

The taskApi service handles all communication with the backend API.

### Available Methods
- `getTasks(params)`: Get all tasks with optional filters
- `createTask(taskData)`: Create a new task
- `getTaskById(taskId)`: Get a specific task by ID
- `updateTask(taskId, taskData)`: Update an entire task
- `patchTask(taskId, taskData)`: Partially update a task
- `deleteTask(taskId)`: Delete a task

### Example Usage
```javascript
import { taskApi } from '../services/api';

// Create a task
const newTask = await taskApi.createTask({
  title: 'New Task',
  description: 'Task description',
  status: 'pending',
  priority: 'medium'
});

// Update a task
const updatedTask = await taskApi.updateTask('task-id', {
  title: 'Updated Title',
  status: 'in-progress'
});

// Partially update a task
const patchedTask = await taskApi.patchTask('task-id', {
  status: 'completed'
});
```

---

## Dashboard Page Features

### Search and Filtering
- Real-time search by task title and description
- Filter by status (all, pending, in-progress, completed)
- Filter by priority (all, low, medium, high)

### Sorting
- Sort by created date
- Sort by due date
- Sort by priority
- Sort by status
- Toggle ascending/descending order

### Loading States
- Global loading indicator when fetching tasks
- Individual loading states for save operations
- Loading spinner during delete operations
- Optimistic updates for better UX

### Error Handling
- Comprehensive error messages
- Automatic error recovery
- Form validation with clear feedback