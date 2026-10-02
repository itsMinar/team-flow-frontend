// @vitest-environment jsdom

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {fireEvent, render, screen} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {RegisterForm} from '@/features/auth/register-form';
import {useAuthStore} from '@/lib/api/auth-store';
import {apiBaseURL} from '@/lib/api/axios';
import {server} from '@/test/server';

const {routerReplace} = vi.hoisted(() => ({routerReplace: vi.fn()}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({replace: routerReplace}),
}));

function renderRegisterForm() {
  const queryClient = new QueryClient({
    defaultOptions: {queries: {retry: false}, mutations: {retry: false}},
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RegisterForm />
    </QueryClientProvider>,
  );
}

describe('RegisterForm', () => {
  beforeEach(() => {
    routerReplace.mockReset();
    useAuthStore.getState().clearSession();
    useAuthStore.getState().setStatus('unauthenticated');
  });

  it('maps an email-taken response onto the email field', async () => {
    server.use(
      http.post(`${apiBaseURL}/auth/register`, () =>
        HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Check the submitted fields',
              details: {email: 'An account already uses this email'},
            },
          },
          {status: 400},
        ),
      ),
    );

    renderRegisterForm();
    fireEvent.change(screen.getByLabelText('First name'), {
      target: {value: 'Ada'},
    });
    fireEvent.change(screen.getByLabelText('Last name'), {
      target: {value: 'Lovelace'},
    });
    fireEvent.change(screen.getByLabelText('Organization name'), {
      target: {value: 'Analytical Engine'},
    });
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: {value: 'ada@example.com'},
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: {value: 'Abcdefg1'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Create account'}));

    expect(
      await screen.findByText('An account already uses this email'),
    ).toBeVisible();
    expect(screen.getByLabelText('Email address')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
});
