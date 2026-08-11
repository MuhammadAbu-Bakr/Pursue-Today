import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TodoItem from './todoItem';
import * as TodoContext from '../../context/todo-context.jsx';

describe('TodoItem', () => {
  it('renders loading state', () => {
    vi.spyOn(TodoContext, 'useTodo').mockReturnValue({
      loading: true,
      tasks: [],
      filteredTasks: [],
    });
    render(<TodoItem />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    vi.spyOn(TodoContext, 'useTodo').mockReturnValue({
      loading: false,
      tasks: [],
      filteredTasks: [],
    });
    render(<TodoItem />);
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('renders tasks', () => {
    const mockTasks = [{ _id: '1', text: 'Task 1', completed: false }];
    vi.spyOn(TodoContext, 'useTodo').mockReturnValue({
      loading: false,
      tasks: mockTasks,
      filteredTasks: mockTasks,
    });
    render(<TodoItem />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('calls delTask on delete confirmation', () => {
    const delTask = vi.fn();
    const mockTasks = [{ _id: '1', text: 'Task 1', completed: false }];
    vi.spyOn(TodoContext, 'useTodo').mockReturnValue({
      loading: false,
      tasks: mockTasks,
      filteredTasks: mockTasks,
      delTask,
    });
    render(<TodoItem />);
    
    // Find the delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);
    
    expect(delTask).toHaveBeenCalledWith('1');
  });
});
