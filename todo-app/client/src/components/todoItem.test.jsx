import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TodoItem from './todoItem';
import * as TodoContext from '../context/todo-context';

describe('TodoItem', () => {
  it('renders loading state', () => {
    vi.spyOn(TodoContext, 'useTodo').mockReturnValue({
      loading: true,
      tasks: [],
    });
    render(<TodoItem />);
    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    vi.spyOn(TodoContext, 'useTodo').mockReturnValue({
      loading: false,
      tasks: [],
    });
    render(<TodoItem />);
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('renders tasks', () => {
    vi.spyOn(TodoContext, 'useTodo').mockReturnValue({
      loading: false,
      tasks: [{ _id: '1', text: 'Task 1', completed: false }],
    });
    render(<TodoItem />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('calls delTask on delete confirmation', () => {
    const delTask = vi.fn();
    vi.spyOn(TodoContext, 'useTodo').mockReturnValue({
      loading: false,
      tasks: [{ _id: '1', text: 'Task 1', completed: false }],
      delTask,
    });
    render(<TodoItem />);
    
  
    const deleteButton = screen.getByTestId('DeleteIcon');
    fireEvent.click(deleteButton.parentElement);


    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);
    
    expect(delTask).toHaveBeenCalledWith('1');
  });
});
