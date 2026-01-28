import React from "react";
import { Button } from "../ui/button";
import { InputField } from "../ui/form/input-field";

interface AuthFormProps {
  title: string;
  submitText: string;
  onFormSubmit: (e: React.FormEvent) => void;
  errorMessage?: string;
  isLoading: boolean;
  children: React.ReactNode;
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  submitText,
  onFormSubmit,
  errorMessage,
  isLoading,
  children,
}) => {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2">
          Enter your details to get started
        </p>
      </div>

      <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={onFormSubmit}>
          {children}

          {errorMessage && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{errorMessage}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : submitText}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {title.includes("Sign In") ? (
            <p>
              Don't have an account?{" "}
              <a href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </a>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <a href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export { AuthForm };