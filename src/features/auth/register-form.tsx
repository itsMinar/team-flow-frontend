'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react';
import {useForm} from 'react-hook-form';
import {AuthField} from '@/features/auth/auth-field';
import {mapApiErrorToForm} from '@/features/auth/form-errors';
import {registerSchema, type RegisterValues} from '@/features/auth/schemas';
import {useRegister} from '@/features/auth/queries';
import {useAuthStore} from '@/lib/api/auth-store';

export function RegisterForm() {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const registerAccount = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      organization_name: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (status === 'authenticated') router.replace('/orgs');
  }, [router, status]);

  async function onSubmit(values: RegisterValues) {
    setFormError('');
    try {
      await registerAccount.mutateAsync(values);
      router.replace('/orgs');
    } catch (error) {
      setFormError(
        mapApiErrorToForm<RegisterValues>(
          error,
          ['email', 'password', 'first_name', 'last_name', 'organization_name'],
          form.setError,
        ),
      );
    }
  }

  if (status === 'restoring' || status === 'authenticated') {
    return (
      <div className='rounded-md border border-[#d5ddd6] bg-white px-6 py-8'>
        <p className='text-sm text-[#53665d]' role='status'>
          Checking your session…
        </p>
      </div>
    );
  }

  return (
    <section className='rounded-lg border border-[#d5ddd6] bg-white p-6 shadow-[0_18px_55px_-38px_rgba(25,60,53,0.5)] sm:p-9'>
      <p className='mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]'>
        Get started
      </p>
      <h1 className='text-3xl font-semibold tracking-tight text-[#1b2d27]'>
        Create your account
      </h1>
      <p className='mt-2 text-sm text-[#64756c]'>
        Set up your profile and organization.
      </p>

      <form className='mt-7 space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
        {formError && (
          <p
            className='rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800'
            role='alert'
          >
            {formError}
          </p>
        )}
        <div className='grid gap-4 sm:grid-cols-2'>
          <AuthField
            autoComplete='given-name'
            error={form.formState.errors.first_name?.message}
            icon={<UserRound aria-hidden='true' size={17} />}
            id='first_name'
            label='First name'
            registration={form.register('first_name')}
          />
          <AuthField
            autoComplete='family-name'
            error={form.formState.errors.last_name?.message}
            icon={<UserRound aria-hidden='true' size={17} />}
            id='last_name'
            label='Last name'
            registration={form.register('last_name')}
          />
        </div>
        <AuthField
          autoComplete='organization'
          error={form.formState.errors.organization_name?.message}
          icon={<Building2 aria-hidden='true' size={17} />}
          id='organization_name'
          label='Organization name'
          registration={form.register('organization_name')}
        />
        <AuthField
          autoComplete='email'
          error={form.formState.errors.email?.message}
          icon={<Mail aria-hidden='true' size={17} />}
          id='email'
          label='Email address'
          registration={form.register('email')}
          type='email'
        />
        <AuthField
          autoComplete='new-password'
          error={form.formState.errors.password?.message}
          icon={<LockKeyhole aria-hidden='true' size={17} />}
          id='password'
          label='Password'
          hint='8-72 UTF-8 bytes; include letters and numbers.'
          registration={form.register('password')}
          trailing={
            <button
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className='rounded p-1 text-[#64756c] hover:text-[#193c35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346e58]'
              onClick={() => setShowPassword((visible) => !visible)}
              type='button'
            >
              {showPassword ? (
                <EyeOff aria-hidden='true' size={18} />
              ) : (
                <Eye aria-hidden='true' size={18} />
              )}
            </button>
          }
          type={showPassword ? 'text' : 'password'}
        />
        <button
          className='flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white transition hover:bg-[#245448] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#193c35] disabled:cursor-not-allowed disabled:opacity-60'
          disabled={registerAccount.isPending || form.formState.isSubmitting}
          type='submit'
        >
          {registerAccount.isPending ? 'Creating account…' : 'Create account'}
          {!registerAccount.isPending && (
            <ArrowRight aria-hidden='true' size={17} />
          )}
        </button>
      </form>

      <p className='mt-6 text-center text-sm text-[#64756c]'>
        Already registered?{' '}
        <Link
          className='font-semibold text-[#245448] underline decoration-[#a8c2b2] underline-offset-4 hover:text-[#193c35]'
          href='/login'
        >
          Sign in
        </Link>
      </p>
    </section>
  );
}
