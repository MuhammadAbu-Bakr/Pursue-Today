import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TodoForm from './todoForm';
import * as TodoContext from '../context/todo-context';

describe('TodoForm', () => {
  it('renders correctly and handles input and submit', () => {
    const handleInputChange = vi.fn();
    const handleKeyDown = vi.fn();
    const addTask = vi.fn();

    vi.spyOn(TodoContext, 'useTodo').mockReturnValue({
      newTask: 'Test task',
      handleInputChange,
      handleKeyDown,
      addTask,
    });

    render(<TodoForm />);

   
    const input = screen.getByLabelText('New Task');
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('Test task');

   
    const button = screen.getByRole('button', { name: /add task/i });
    expect(button).toBeInTheDocument();

   
    fireEvent.click(button);
    expect(addTask).toHaveBeenCalledTimes(1);
    
   
    fireEvent.change(input, { target: { value: 'New Test' } });
    expect(handleInputChange).toHaveBeenCalled();
  });
});
