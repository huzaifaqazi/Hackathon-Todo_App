import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  CheckSquare,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Search,
  User,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Logo } from '../ui/logo';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'All Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isActive = (href: string) => router.pathname === href;

  const userProfile = (compact: boolean) => (
    <div className="flex items-center gap-3">
      <div
        className="bg-gradient-to-br from-primary-600 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-subtle"
        style={{ width: compact ? 40 : 44, height: compact ? 40 : 44 }}
        aria-hidden="true"
      >
        <User className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink truncate">
          {user?.first_name} {user?.last_name}
        </p>
        <p className="text-xs text-ink-subtle truncate">{user?.email}</p>
      </div>
    </div>
  );

  const navItems = (onNavigate?: () => void) => (
    <nav className="flex-1 px-4 py-6 space-y-1" aria-label="Main navigation">
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group relative flex items-center gap-3 px-4 py-2.5 rounded-input text-sm font-semibold transition-all duration-200',
              active
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary'
                : 'text-ink-muted hover:bg-primary-50 hover:text-primary-700 hover:translate-x-0.5'
            )}
          >
            <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
            {item.name}
            {/* Hover arrow — slides in from the left */}
            <span
              className={cn(
                'ml-auto w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200',
                active ? 'text-white/70' : 'text-primary-400'
              )}
              aria-hidden="true"
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        );
      })}
    </nav>
  );

  const logoutButton = (compact: boolean) => (
    <button
      onClick={handleLogout}
      className={cn(
        'flex items-center gap-3 w-full rounded-input text-sm font-medium text-ink-subtle hover:text-danger-600 hover:bg-danger-50 transition-colors duration-200 cursor-pointer',
        compact ? 'px-4 py-2.5' : 'px-4 py-3'
      )}
    >
      <LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />
      Logout
    </button>
  );

  return (
    <div className="min-h-screen bg-surface-background">
      {/* Top Navigation Bar — light glass with subtle blue wash */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md shadow-subtle border-b border-primary-100">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo and Mobile Menu */}
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={sidebarOpen}
                className="lg:hidden p-2 rounded-input text-ink-muted hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
              >
                {sidebarOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
              </button>

              {/* Logo */}
              <Link href="/dashboard" className="group flex items-center" aria-label="TodoApp home">
                <Logo size={32} showWordmark wordmarkClassName="hidden sm:block" />
              </Link>
            </div>

            {/* Center: Search — routes to tasks page with query */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <Link
                href="/tasks"
                className="relative w-full group"
                aria-label="Search tasks"
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ink-subtle pointer-events-none" aria-hidden="true" />
                <div className="w-full pl-10 pr-4 py-2 border border-ink-border rounded-full bg-surface-background text-sm text-ink-subtle group-hover:border-primary-300 group-hover:bg-white group-hover:shadow-subtle transition-all cursor-pointer">
                  Search tasks...
                </div>
              </Link>
            </div>

            {/* Right: User Avatar Dropdown */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-haspopup="menu"
                  aria-expanded={showUserMenu}
                  className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-primary-50 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-violet-600 rounded-full flex items-center justify-center" aria-hidden="true">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-ink">
                    {user?.first_name || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-ink-subtle" aria-hidden="true" />
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      {/* Click-away backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                        aria-hidden="true"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        role="menu"
                        className="absolute right-0 mt-2 w-56 bg-white rounded-input shadow-lifted border border-ink-border py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-ink-border">
                          <p className="text-sm font-semibold text-ink truncate">
                            {user?.first_name} {user?.last_name}
                          </p>
                          <p className="text-xs text-ink-subtle truncate">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/tasks"
                            onClick={() => setShowUserMenu(false)}
                            role="menuitem"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors cursor-pointer"
                          >
                            <CheckSquare className="w-4 h-4" aria-hidden="true" />
                            My Tasks
                          </Link>
                          <Link
                            href="/chat"
                            onClick={() => setShowUserMenu(false)}
                            role="menuitem"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" aria-hidden="true" />
                            AI Chat
                          </Link>
                        </div>
                        <div className="border-t border-ink-border pt-1 mt-1">
                          <button
                            onClick={handleLogout}
                            role="menuitem"
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors text-left cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" aria-hidden="true" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar and Main Content */}
      <div className="flex pt-16">
        {/* Left Sidebar - Desktop — light with a soft blue gradient wash */}
        <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:pt-16 bg-gradient-to-b from-primary-50/60 via-white to-white border-r border-ink-border">
          <div className="flex flex-col flex-1 overflow-y-auto scrollbar-thin">
            {/* User Profile Section */}
            <div className="p-5 border-b border-ink-border/60">
              {userProfile(false)}
            </div>

            {/* Navigation Items */}
            {navItems()}

            {/* Logout Button */}
            <div className="p-4 border-t border-ink-border/60 mt-auto">
              {logoutButton(false)}
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40 lg:hidden"
                aria-hidden="true"
              />

              {/* Sidebar */}
              <motion.aside
                initial={{ x: -240 }}
                animate={{ x: 0 }}
                exit={{ x: -240 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed left-0 top-16 bottom-0 w-60 bg-white z-50 lg:hidden overflow-y-auto"
                aria-label="Mobile navigation"
              >
                <div className="flex flex-col h-full">
                  {/* User Profile Section */}
                  <div className="p-5 border-b border-ink-border/60">
                    {userProfile(true)}
                  </div>

                  {/* Navigation Items */}
                  {navItems(() => setSidebarOpen(false))}

                  {/* Logout Button */}
                  <div className="p-4 border-t border-ink-border/60 mt-auto">
                    {logoutButton(true)}
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-60">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
