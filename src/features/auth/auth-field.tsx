import type {ReactNode, HTMLInputTypeAttribute} from 'react';
import type {UseFormRegisterReturn} from 'react-hook-form';

type AuthFieldProps = {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  icon: ReactNode;
  type?: HTMLInputTypeAttribute;
  autoComplete?: string;
  hint?: string;
  error?: string;
  trailing?: ReactNode;
};

export function AuthField({
  id,
  label,
  registration,
  icon,
  type = 'text',
  autoComplete,
  hint,
  error,
  trailing,
}: AuthFieldProps) {
  return (
    <div className='space-y-1.5'>
      <label className='block text-sm font-medium text-[#263b36]' htmlFor={id}>
        {label}
      </label>
      <div className='relative'>
        <span
          aria-hidden='true'
          className='pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#74847d]'
        >
          {icon}
        </span>
        <input
          {...registration}
          autoComplete={autoComplete}
          className={`h-12 w-full rounded-md border bg-white pl-10 text-sm text-[#172923] outline-none transition focus-visible:border-[#346e58] focus-visible:ring-2 focus-visible:ring-[#346e58]/20 ${trailing ? 'pr-12' : 'pr-3'} ${error ? 'border-rose-500' : 'border-[#cbd4ce]'}`}
          id={id}
          aria-describedby={
            [hint && `${id}-hint`, error && `${id}-error`]
              .filter(Boolean)
              .join(' ') || undefined
          }
          aria-invalid={Boolean(error)}
          required
          type={type}
        />
        {trailing && (
          <span className='absolute inset-y-0 right-2 flex items-center'>
            {trailing}
          </span>
        )}
      </div>
      {hint && (
        <p className='text-xs text-[#64756c]' id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className='text-sm text-rose-700' id={`${id}-error`} role='alert'>
          {error}
        </p>
      )}
    </div>
  );
}
