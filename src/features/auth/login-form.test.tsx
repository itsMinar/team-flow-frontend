// @vitest-environment jsdom

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {LoginForm} from '@/features/auth/login-form';
import {useAuthStore} from '@/lib/api/auth-store';
import {apiBaseURL} from '@/lib/api/axios';
import {server} from '@/test/server';

const {routerReplace} = vi.hoisted(() => ({routerReplace: vi.fn()}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({replace: routerReplace}),
  useSearchParams: () => new URLSearchParams(),
}));

function renderLoginForm() {
  const queryClient = new QueryClient({
    defaultOptions: {queries: {retry: false}, mutations: {retry: false}},
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <LoginForm />
    </QueryClientProvider>,
  );
}

function authSession() {
  return {
    access_token: 'test-access',
    refresh_token: 'test-refresh',
    token_type: 'Bearer' as const,
    expires_in: 900,
    user: {
      id: 'user-1',
      email: 'ada@example.com',
      first_name: 'Ada',
      last_name: 'Lovelace',
      status: 'active',
      created_at: '2026-10-02T00:00:00Z',
    },
  };
}

describe('LoginForm', () => {
  beforeEach(() => {
    routerReplace.mockReset();
    useAuthStore.getState().clearSession();
    useAuthStore.getState().setStatus('unauthenticated');
  });

  it('establishes a session and navigates to the organization entry', async () => {
    server.use(
      http.post(`${apiBaseURL}/auth/login`, () =>
        HttpResponse.json({data: authSession()}),
      ),
    );

    renderLoginForm();
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: {value: 'ada@example.com'},
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: {value: 'StrongPassword123'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Sign in'}));

    await waitFor(() => {
      expect(routerReplace).toHaveBeenCalledWith('/orgs');
    });
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(sessionStorage.getItem('teamflow.refreshToken')).not.toBeNull();
  });

  it('shows a normalized invalid-credentials response', async () => {
    server.use(
      http.post(`${apiBaseURL}/auth/login`, () =>
        HttpResponse.json(
          {
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Email or password is incorrect',
            },
          },
          {status: 401},
        ),
      ),
    );

    renderLoginForm();
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: {value: 'ada@example.com'},
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: {value: 'wrong-password'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Sign in'}));

    const errorMessage = await screen.findByText(
      'Email or password is incorrect',
    );
    expect(errorMessage).toHaveAttribute('role', 'alert');
    expect(errorMessage).toBeVisible();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
  });
});
