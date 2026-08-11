import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Todolist from './todolist';
import * as TodoContext from '../../context/todo-context.jsx';
import * as AuthContext from '../../context/auth-context.jsx';


vi.mock('./todoForm.jsx', () => ({
  default: () => <div data-testid="todo-form" />
}));

vi.mock('./todoItem.jsx', () => ({
  default: () => <div data-testid="todo-item" />
}));

vi.mock('../auth/AccountBar.jsx', () => ({
  default: () => <div data-testid="account-bar" />
}));

describe('Todolist', () => {
  it('renders correctly with child components', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { name: 'Test User' },
    });

    vi.spyOn(TodoContext, 'useTodo').mockReturnValue({
      searchQuery: '',
      setSearchQuery: vi.fn(),
      sortBy: 'newest',
      setSortBy: vi.fn(),
      filterCategory: '',
      setFilterCategory: vi.fn(),
      filterTags: '',
      setFilterTags: vi.fn(),
    });

    render(<Todolist />);
    
    expect(screen.getByText('📝 To-Do List')).toBeInTheDocument();
    expect(screen.getByText('Organize your tasks and stay productive.')).toBeInTheDocument();
    
    expect(screen.getByTestId('account-bar')).toBeInTheDocument();
    expect(screen.getByTestId('todo-form')).toBeInTheDocument();
    expect(screen.getByTestId('todo-item')).toBeInTheDocument();
  });
});
