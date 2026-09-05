import React, { useId, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AuthInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  /** Show a green check when the field is filled and valid */
  showValid?: boolean;
  /** Extra buttons/elements rendered inside the input, on the right (e.g. eye toggle) */
  trailing?: React.ReactNode;
  trailingClassName?: string;
}

/**
 * Auth form input — floating label, focus glow, animated error (shake + reveal),
 * success check when filled. Micro-interactions are 150-250ms and respect
 * prefers-reduced-motion.
 */
export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  icon,
  error,
  showValid = false,
  trailing,
  trailingClassName,
  className,
  id,
  value,
  placeholder,
  onFocus,
  onBlur,
  ...props
}) => {
  const reactId = useId();
  const inputId = id || `auth-${reactId}`;
  const errorId = `${inputId}-error`;
  const reduceMotion = useReducedMotion();
  const [focused, setFocused] = useState(false);

  const isFilled = value !== undefined && String(value).length > 0;
  const floated = focused || isFilled;
  const isValid = showValid && isFilled && !error;

  return (
    <div>
      <motion.div
        animate={
          reduceMotion || !error ? {} : { x: [0, -6, 6, -4, 4, 0] }
        }
        transition={{ duration: 0.35 }}
        className="relative"
      >
        {/* Icon */}
        {icon && (
          <div
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 z-[1]',
              error ? 'text-danger-600' : focused ? 'text-primary-600' : 'text-ink-subtle'
            )}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          id={inputId}
          value={value}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={cn(
            'block w-full pt-6 pb-2 border rounded-input text-ink bg-white',
            'placeholder:text-ink-subtle/60 placeholder:transition-colors placeholder:duration-200',
            'focus:outline-none focus:ring-2 transition-all duration-200',
            icon ? 'pl-12' : 'pl-4',
            trailing ? 'pr-12' : 'pr-4',
            error
              ? 'border-danger-600 focus:border-danger-600 focus:ring-danger-600/20'
              : focused
              ? 'border-primary-600 ring-primary-600/20 shadow-glow-primary'
              : 'border-ink-border hover:border-ink-subtle',
            error && 'ring-danger-600/10',
            className
          )}
          {...props}
          placeholder={floated ? placeholder : ''}
        />

        {/* Floating label */}
        <label
          htmlFor={inputId}
          className={cn(
            'pointer-events-none absolute left-0 z-[1] origin-left transition-all duration-200',
            icon ? 'pl-12' : 'pl-4',
            floated
              ? 'top-2 text-xs font-semibold text-primary-600 scale-100'
              : 'top-1/2 -translate-y-1/2 text-base text-ink-subtle font-medium'
          )}
        >
          {label}
        </label>

        {/* Success check / trailing area */}
        <div
          className={cn(
            'absolute right-0 inset-y-0 flex items-center',
            trailingClassName || 'pr-4'
          )}
        >
          {isValid ? (
            <motion.span
              initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            >
              <Check className="w-5 h-5 text-success-600" aria-hidden="true" />
            </motion.span>
          ) : (
            trailing
          )}
        </div>
      </motion.div>

      {/* Animated error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            initial={reduceMotion ? false : { opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-1.5 text-sm text-danger-600 mt-1.5 overflow-hidden"
          >
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
