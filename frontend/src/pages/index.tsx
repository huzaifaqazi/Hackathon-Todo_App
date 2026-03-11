import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { CheckSquare, Target, Shield, Cloud, Users, Lock, List, Menu, X } from 'lucide-react';

const LandingPage = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    router.push('/register');
  };

  const handleLearnMore = () => {
    // Smooth scroll to features section
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => scrollToSection('hero')}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">TodoApp</span>
              </motion.div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('hero')}
                className="text-gray-700 hover:text-blue-500 transition-colors font-medium"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-blue-500 transition-colors font-medium"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-gray-700 hover:text-blue-500 transition-colors font-medium"
              >
                About
              </button>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-gray-700 hover:text-blue-500 transition-colors font-medium"
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/register')}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md"
              >
                Sign Up
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-blue-500 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-4 space-y-3">
                <button
                  onClick={() => scrollToSection('hero')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 rounded-lg transition-colors font-medium"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 rounded-lg transition-colors font-medium"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 rounded-lg transition-colors font-medium"
                >
                  About
                </button>
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => router.push('/login')}
                    className="block w-full px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 rounded-lg transition-colors font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="block w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden pt-32 pb-32 px-4">
        {/* Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 1 }}
            className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-purple-500 to-blue-600 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Boost Your Productivity
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Manage your tasks efficiently with our intuitive todo app
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-600 transition-colors w-full sm:w-auto"
              >
                Get Started Free
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLearnMore}
                className="px-8 py-4 bg-transparent border-2 border-blue-500 text-blue-500 text-lg font-semibold rounded-lg hover:bg-blue-50 transition-colors w-full sm:w-auto"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid (3 columns) */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Our Todo App?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to stay organized and productive
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Task Management */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <CheckSquare className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Smart Task Management
              </h3>
              <p className="text-gray-600 text-lg">
                Organize with priority levels and due dates
              </p>
            </motion.div>

            {/* Feature 2: Productivity */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Boost Productivity
              </h3>
              <p className="text-gray-600 text-lg">
                Focus on what matters most
              </p>
            </motion.div>

            {/* Feature 3: Security */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Secure & Private
              </h3>
              <p className="text-gray-600 text-lg">
                Your data is always safe
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Detailed Features Section (2x2 grid) */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600">
              Built for teams and individuals alike
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1: Smart Task Management */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-10 rounded-xl shadow-lg hover:shadow-2xl transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <List className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    📋 Smart Task Management
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Organize tasks with priority levels, categories, and custom tags. Never miss a deadline with smart reminders.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 2: Cloud Sync */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-10 rounded-xl shadow-lg hover:shadow-2xl transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Cloud className="w-7 h-7 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    ☁️ Cloud Sync
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Access your tasks from anywhere, on any device. Automatic sync keeps everything up to date.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 3: Team Collaboration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-10 rounded-xl shadow-lg hover:shadow-2xl transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-7 h-7 text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    👥 Team Collaboration
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Share tasks with your team, assign responsibilities, and track progress together in real-time.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 4: Security First */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-10 rounded-xl shadow-lg hover:shadow-2xl transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-7 h-7 text-red-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    🔒 Security First
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Enterprise-grade security with end-to-end encryption. Your data is protected at all times.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Todo App</h3>
              <p className="text-gray-400">
                The best way to manage your tasks and boost productivity.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/register" className="text-gray-400 hover:text-white transition-colors">
                    Get Started
                  </a>
                </li>
                <li>
                  <a href="/login" className="text-gray-400 hover:text-white transition-colors">
                    Login
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">
                Email: huzaifaqazi6167@gmail.com
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Todo App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
