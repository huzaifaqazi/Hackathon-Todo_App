import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { AuthForm } from '../components/auth/auth-form';
import { InputField } from '../components/ui/form/input-field';
import { PasswordField } from '../components/auth/password-field';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface FormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(formData.email, formData.password);
      router.replace('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Sign in to your account to continue managing your tasks
              </CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="mb-2">
                <Link href="/" className="text-red-500 hover:text-red-700 font-medium flex items-center transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="text-sm font-semibold">Back to Home</span>
                </Link>
              </div>
              <InputField
                label="Email address"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
              />

              <PasswordField
                label="Password"
                id="password"
                name="password"
                showPassword={showPassword}
                onToggleVisibility={() => setShowPassword(!showPassword)}
                error={undefined}
                value={formData.password}
                onChange={handleChange}
              />

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-6 pt-2">
              <Button
                type="submit"
                variant="gradient-purple"
                className="w-full py-6 text-base font-semibold text-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="text-center text-base text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-600 hover:underline font-semibold">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;