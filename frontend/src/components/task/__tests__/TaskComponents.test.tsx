import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskCard from '../components/task/TaskCard';
import TaskForm from '../components/task/TaskForm';
import TaskList from '../components/task/TaskList';

// Mock the API functions
jest.mock('../services/api', () => ({
  taskApi: {
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    createTask: jest.fn(),
  }
}));

describe('TaskCard Component', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 'medium',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    user_id: 'user1'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders task information correctly', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} />);

    fireEvent.click(screen.getByLabelText(`Edit task ${mockTask.title}`));
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  test('calls onDelete when delete button is clicked', () => {
    const mockOnDelete = jest.fn();
    render(<TaskCard task={mockTask} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByLabelText(`Delete task ${mockTask.title}`));
    expect(mockOnDelete).toHaveBeenCalledWith(mockTask.id);
  });

  test('shows loading state when deleting', () => {
    render(<TaskCard task={mockTask} onDelete={jest.fn()} deletingId={mockTask.id} />);

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    expect(screen.getByRole('button', { disabled: true })).toBeInTheDocument();
  });
});

describe('TaskForm Component', () => {
  test('renders form fields correctly', () => {
    render(<TaskForm onSave={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    const mockOnSave = jest.fn();
    render(<TaskForm onSave={mockOnSave} onCancel={jest.fn()} />);

    // Submit with empty title
    fireEvent.click(screen.getByText('Create Task'));

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  test('shows validation error for long title', async () => {
    const mockOnSave = jest.fn();
    render(<TaskForm onSave={mockOnSave} onCancel={jest.fn()} />);

    const titleInput = screen.getByLabelText('Title *');
    fireEvent.change(titleInput, { target: { value: 'a'.repeat(201) } }); // Too long

    // Trigger blur or submit to validate
    fireEvent.focusOut(titleInput);

    await waitFor(() => {
      expect(screen.getByText('Title must not exceed 200 characters')).toBeInTheDocument();
    });
  });

  test('calls onSave with form data when submitted', async () => {
    const mockOnSave = jest.fn();
    render(<TaskForm onSave={mockOnSave} onCancel={jest.fn()} />);

    // Fill in form
    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'completed' } });
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: 'high' } });

    // Submit form
    fireEvent.click(screen.getByText('Create Task'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Description',
        status: 'completed',
        priority: 'high',
        due_date: ''
      });
    });
  });
});

describe('TaskList Component', () => {
  const mockTasks = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      status: 'pending',
      priority: 'low',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      user_id: 'user1'
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      status: 'completed',
      priority: 'high',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      user_id: 'user1'
    }
  ];

  test('renders multiple tasks', () => {
    render(<TaskList tasks={mockTasks} />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  test('shows "no tasks" message when tasks array is empty', () => {
    render(<TaskList tasks={[]} />);

    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    expect(screen.getByText('Add your first task!')).toBeInTheDocument();
  });

  test('passes props to TaskCard components', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    render(
      <TaskList
        tasks={mockTasks}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        deletingId="1"
      />
    );

    // Check that the deletingId is passed to the cards
    const deleteButtons = screen.getAllByRole('button', { name: /^Delete|^Deleting/ });
    // The button for task '1' should be disabled since it's being deleted
    expect(deleteButtons[0]).toHaveAttribute('disabled');
  });
});