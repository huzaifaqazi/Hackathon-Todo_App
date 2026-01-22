import React from 'react';
import Link from 'next/link';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to Todo App
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          A secure task management application
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <div>
              <Link href="/login">
                <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Sign In
                </button>
              </Link>
            </div>
            <div>
              <Link href="/register">
                <button className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Create Account
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Already have an account? <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;