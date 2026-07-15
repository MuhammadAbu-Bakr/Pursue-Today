import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoProvider, useTodo } from './todo-context';
import * as AuthContext from './auth-context';


const TestComponent = () => {
  const { tasks, loading, addTask, handleInputChange } = useTodo();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <input 
        data-testid="task-input" 
        onChange={handleInputChange} 
      />
      <button onClick={addTask}>Add</button>
      <ul>
        {tasks.map(t => <li key={t._id}>{t.text}</li>)}
      </ul>
    </div>
  );
};

describe('TodoContext', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { name: 'Test User' }
    });
  });

  it('fetches and displays tasks', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ _id: '1', text: 'Task 1', completed: false }]
    });

    render(
      <TodoProvider>
        <TestComponent />
      </TodoProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
  });
});

