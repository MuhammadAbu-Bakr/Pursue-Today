import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './auth-context';

// Test component to access context
const TestComponent = () => {
  const { user, loading, login, logout } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return (
    <div>
      <span>Not logged in</span>
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
    </div>
  );
  
  return (
    <div>
      <span>Logged in as {user.name}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('provides auth state and handles login/logout', async () => {
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: null })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    
    expect(screen.getByText('Loading...')).toBeInTheDocument();

  
    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { name: 'Test User' } })
    });

    // Trigger login
    screen.getByText('Login').click();

    // Verify login state
    await waitFor(() => {
      expect(screen.getByText('Logged in as Test User')).toBeInTheDocument();
    });

    // Mock logout response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

    // Trigger logout
    screen.getByText('Logout').click();

    // Verify logout state
    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });
  });
});
