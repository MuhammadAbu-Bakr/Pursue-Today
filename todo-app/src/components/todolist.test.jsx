import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Todolist from './todolist';

// Mock child components to isolate Todolist testing
vi.mock('./todoForm.jsx', () => ({
  default: () => <div data-testid="todo-form" />
}));

vi.mock('./todoItem.jsx', () => ({
  default: () => <div data-testid="todo-item" />
}));

vi.mock('./auth/AccountBar.jsx', () => ({
  default: () => <div data-testid="account-bar" />
}));

describe('Todolist', () => {
  it('renders correctly with child components', () => {
    render(<Todolist />);
    
    expect(screen.getByText('📝 To-Do List')).toBeInTheDocument();
    expect(screen.getByText('Organize your tasks and stay productive.')).toBeInTheDocument();
    
    expect(screen.getByTestId('account-bar')).toBeInTheDocument();
    expect(screen.getByTestId('todo-form')).toBeInTheDocument();
    expect(screen.getByTestId('todo-item')).toBeInTheDocument();
  });
});
