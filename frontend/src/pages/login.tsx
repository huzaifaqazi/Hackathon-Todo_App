import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { AuthInput } from '../components/ui/auth-input';
import { GradientButton } from '../components/ui/gradient-button';
import { Logo } from '../components/ui/logo';
import { AuthShowcasePanel } from '../components/ui/auth-showcase-panel';
import Head from 'next/head';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(formData.email, formData.password);
      router.replace('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fadeIn = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: 'easeOut' as const },
  });

  return (
    <div className="min-h-screen bg-surface-background flex">
      <Head>
        <title>Sign In — TodoApp</title>
      </Head>

      {/* Left showcase panel — hidden on mobile/tablet */}
      <AuthShowcasePanel />

      {/* Right: form column */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {/* Soft background accents for the form side */}
        <div className="fixed inset-0 pointer-events-none lg:left-[46%] xl:left-[44%]" aria-hidden="true">
          <motion.div
            className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-primary-100 to-violet-100 rounded-full blur-3xl opacity-60"
            animate={reduceMotion ? undefined : { x: [0, 30, 0], y: [0, 20, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-32 left-1/4 w-80 h-80 bg-gradient-to-tr from-primary-50 to-accent-50 rounded-full blur-3xl opacity-60"
            animate={reduceMotion ? undefined : { x: [0, -24, 0], y: [0, -16, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Top bar: back to home */}
        <div className="relative z-10 flex items-center justify-between p-6 lg:p-8">
          <Link
            href="/"
            className="text-sm text-ink-subtle hover:text-ink transition-colors inline-flex items-center gap-1.5 group cursor-pointer"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>

          {/* Mobile logo (desktop me showcase panel ke sath redundant hota) */}
          <div className="lg:hidden">
            <Logo size={32} showWordmark />
          </div>
        </div>

        {/* Centered form card */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 pb-16">
          <motion.div
            {...fadeIn(0)}
            className="w-full max-w-[420px]"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-modal shadow-overlay p-8 sm:p-10 border border-ink-border">
              {/* Header Section */}
              <motion.div {...fadeIn(0.1)} className="text-left mb-8">
                <div className="flex justify-start mb-5">
                  <Logo size={44} />
                </div>

                <h1 className="text-[28px] font-bold text-ink mb-2 tracking-tight">
                  Welcome back
                </h1>
                <p className="text-base text-ink-muted">
                  Sign in to pick up right where you left off.
                </p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <motion.div {...fadeIn(0.18)}>
                  <AuthInput
                    label="Email address"
                    icon={<Mail className="w-5 h-5" />}
                    error={fieldErrors.email}
                    showValid
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                  />
                </motion.div>

                {/* Password Input */}
                <motion.div {...fadeIn(0.26)}>
                  <AuthInput
                    label="Password"
                    icon={<Lock className="w-5 h-5" />}
                    error={fieldErrors.password}
                    showValid
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="text-ink-subtle hover:text-primary-600 hover:scale-110 active:scale-90 transition-all cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" aria-hidden="true" />
                        ) : (
                          <Eye className="w-5 h-5" aria-hidden="true" />
                        )}
                      </button>
                    }
                  />
                </motion.div>

                {/* Remember Me + (visual) Forgot link */}
                <motion.div
                  {...fadeIn(0.34)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-ink-border text-primary-600 focus:ring-primary-600 cursor-pointer accent-primary-600"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-ink-muted cursor-pointer">
                      Remember me
                    </label>
                  </div>
                  <span className="text-sm text-primary-600 font-medium cursor-default select-none">
                    Forgot password?
                  </span>
                </motion.div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0, x: [0, -6, 6, -4, 4, 0] }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35 }}
                    className="bg-danger-50 border border-danger-100 text-danger-700 px-4 py-3 rounded-input text-sm flex items-center gap-2"
                    role="alert"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Sign In Button */}
                <motion.div {...fadeIn(0.42)}>
                  <GradientButton
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" aria-hidden="true" />
                        Sign In
                      </>
                    )}
                  </GradientButton>
                </motion.div>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-ink-muted">
                  Don't have an account?{' '}
                  <Link href="/register" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
