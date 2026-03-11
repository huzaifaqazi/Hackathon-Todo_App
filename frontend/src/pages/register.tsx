import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, CheckSquare, User, Check, X } from 'lucide-react';

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
    if (score === 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 2, label: 'Medium', color: 'bg-yellow-500' };
    return { score: 3, label: 'Strong', color: 'bg-green-500' };
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[500px]"
      >
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>

            {/* Heading */}
            <h1 className="text-[28px] font-bold text-gray-900 mb-2">
              Create Account
            </h1>

            {/* Subheading */}
            <p className="text-base text-gray-500">
              Join us to start managing tasks
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Row (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className={`w-5 h-5 ${fieldErrors.firstName ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className={`block w-full pl-12 pr-4 py-3 border ${
                      fieldErrors.firstName
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                  />
                </div>
                {fieldErrors.firstName && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className={`block w-full px-4 py-3 border ${
                      fieldErrors.lastName
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                  />
                </div>
                {fieldErrors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`w-5 h-5 ${fieldErrors.email ? 'text-red-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`block w-full pl-12 pr-4 py-3 border ${
                    fieldErrors.email
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 ${fieldErrors.password ? 'text-red-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`block w-full pl-12 pr-12 py-3 border ${
                    fieldErrors.password
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
              )}

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                      />
                    </div>
                    {passwordStrength.label && (
                      <span className={`text-xs font-medium ${
                        passwordStrength.score === 1 ? 'text-red-500' :
                        passwordStrength.score === 2 ? 'text-yellow-500' :
                        'text-green-500'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Password Requirements Checklist */}
            <div className="space-y-2">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  {req.met ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Terms & Conditions */}
            <div>
              <div className="flex items-start">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded cursor-pointer mt-0.5"
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  I agree to the{' '}
                  <a href="#" className="text-blue-500 hover:text-blue-600 underline">
                    Terms & Conditions
                  </a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-500 hover:text-blue-600 underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {fieldErrors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.agreeToTerms}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Create Account Button */}
            <motion.button
              type="submit"
              disabled={loading || !isFormValid}
              whileHover={{ scale: loading || !isFormValid ? 1 : 1.01 }}
              whileTap={{ scale: loading || !isFormValid ? 1 : 0.98 }}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm ${
                loading || !isFormValid
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-blue-500 hover:text-blue-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-red-500 hover:text-red-600 transition-colors inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
