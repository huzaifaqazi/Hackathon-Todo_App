import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Check, X, UserPlus } from 'lucide-react';
import { AuthInput } from '../components/ui/auth-input';
import { GradientButton } from '../components/ui/gradient-button';
import { Logo } from '../components/ui/logo';
import { AuthShowcasePanel } from '../components/ui/auth-showcase-panel';
import Head from 'next/head';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
}

interface PasswordStrength {
  score: number; // 0-3
  label: string;
  color: string;
}

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agreeToTerms: false
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    agreeToTerms?: string;
  }>({});

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

  // Password strength calculation
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;

    if (score === 0) return { score: 0, label: '', color: '' };
    if (score === 1) return { score: 1, label: 'Weak', color: 'bg-danger-600' };
    if (score === 2) return { score: 2, label: 'Medium', color: 'bg-warning-600' };
    return { score: 3, label: 'Strong', color: 'bg-success-600' };
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  // Password requirements
  const passwordRequirements = [
    {
      label: 'At least 6 characters',
      met: formData.password.length >= 6
    },
    {
      label: 'One uppercase letter',
      met: /[A-Z]/.test(formData.password)
    },
    {
      label: 'One number',
      met: /[0-9]/.test(formData.password)
    }
  ];

  const validateForm = () => {
    const errors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      agreeToTerms?: string;
    } = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

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

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions';
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
      await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName
      });

      router.replace('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email &&
    formData.password.length >= 6 &&
    formData.agreeToTerms;

  const fadeIn = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: 'easeOut' as const },
  });

  return (
    <div className="min-h-screen bg-surface-background flex">
      <Head>
        <title>Create Account — TodoApp</title>
      </Head>

      {/* Left showcase panel — hidden on mobile/tablet, matches login page */}
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

        {/* Centered form card — scrollable for tall form */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 py-8">
          <motion.div
            {...fadeIn(0)}
            className="w-full max-w-[500px] max-h-full overflow-y-auto scrollbar-thin"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-modal shadow-overlay p-8 sm:p-10 border border-ink-border">
              {/* Header Section */}
              <motion.div {...fadeIn(0.1)} className="text-left mb-8">
                <div className="flex justify-start mb-5">
                  <Logo size={44} />
                </div>

                <h1 className="text-[28px] font-bold text-ink mb-2 tracking-tight">
                  Create your account
                </h1>
                <p className="text-base text-ink-muted">
                  Join us to start managing tasks the smart way.
                </p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Row (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div {...fadeIn(0.18)}>
                    <AuthInput
                      label="First Name"
                      icon={<User className="w-5 h-5" />}
                      error={fieldErrors.firstName}
                      showValid
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      autoComplete="given-name"
                    />
                  </motion.div>

                  <motion.div {...fadeIn(0.24)}>
                    <AuthInput
                      label="Last Name"
                      error={fieldErrors.lastName}
                      showValid
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      autoComplete="family-name"
                    />
                  </motion.div>
                </div>

                {/* Email Input */}
                <motion.div {...fadeIn(0.3)}>
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
                <motion.div {...fadeIn(0.36)}>
                  <AuthInput
                    label="Password"
                    icon={<Lock className="w-5 h-5" />}
                    error={fieldErrors.password}
                    showValid
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    aria-describedby="password-requirements"
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

                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="flex-1 h-2 bg-surface-muted rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuenow={passwordStrength.score}
                          aria-valuemin={0}
                          aria-valuemax={3}
                          aria-label="Password strength"
                        >
                          <div
                            className={`h-full ${passwordStrength.color} transition-all duration-300`}
                            style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                          />
                        </div>
                        {passwordStrength.label && (
                          <span className={`text-xs font-medium ${
                            passwordStrength.score === 1 ? 'text-danger-600' :
                            passwordStrength.score === 2 ? 'text-warning-700' :
                            'text-success-600'
                          }`}>
                            {passwordStrength.label}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Password Requirements Checklist — animated check flips */}
                <motion.div
                  id="password-requirements"
                  {...fadeIn(0.42)}
                  className="space-y-2"
                >
                  {passwordRequirements.map((req) => (
                    <motion.div
                      key={req.label}
                      animate={
                        reduceMotion ? {} : req.met ? { x: [0, 2, 0] } : { x: 0 }
                      }
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-2"
                    >
                      <span
                        className={`flex items-center justify-center w-5 h-5 rounded-full transition-colors duration-200 ${
                          req.met ? 'bg-success-100' : 'bg-surface-muted'
                        }`}
                        aria-hidden="true"
                      >
                        {req.met ? (
                          <Check className="w-3.5 h-3.5 text-success-600" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-ink-subtle" />
                        )}
                      </span>
                      <span className={`text-sm transition-colors duration-200 ${req.met ? 'text-success-700 font-medium' : 'text-ink-subtle'}`}>
                        {req.label}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Terms & Conditions */}
                <motion.div {...fadeIn(0.46)}>
                  <div className="flex items-start">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-ink-border text-primary-600 focus:ring-primary-600 cursor-pointer accent-primary-600 mt-0.5"
                    />
                    <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-ink-muted cursor-pointer">
                      I agree to the{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-700 underline underline-offset-2">
                        Terms & Conditions
                      </a>
                      {' '}and{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-700 underline underline-offset-2">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  {fieldErrors.agreeToTerms && (
                    <p className="mt-1.5 text-sm text-danger-600" role="alert">{fieldErrors.agreeToTerms}</p>
                  )}
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

                {/* Create Account Button */}
                <motion.div {...fadeIn(0.5)}>
                  <GradientButton
                    type="submit"
                    disabled={loading || !isFormValid}
                    className="w-full disabled:opacity-50 disabled:pointer-events-none"
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
                        Creating account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" aria-hidden="true" />
                        Create Account
                      </>
                    )}
                  </GradientButton>
                </motion.div>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-ink-muted">
                  Already have an account?{' '}
                  <Link href="/login" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
                    Sign in
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

export default RegisterPage;
