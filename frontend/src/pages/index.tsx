import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  CheckSquare,
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  Menu,
  X,
  Zap,
  Bot,
  CalendarClock,
  Shield,
  Cloud,
  Star,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { Logo } from '../components/ui/logo';
import { SpotlightCard } from '../components/ui/spotlight-card';
import { GradientButton } from '../components/ui/gradient-button';
import { GlowPillButton } from '../components/ui/glow-pill-button';

const LandingPage = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  // Navbar gains a stronger glass/shadow once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hero headline words — revealed one by one
  const heroWords = ['Your', 'day,', 'effortlessly', 'organized'];

  // Sample tasks for the floating product preview card
  const previewTasks = [
    { title: 'Review project proposal', priority: 'High', badge: 'bg-danger-50 text-danger-700', done: false },
    { title: 'Team standup at 10:00', priority: 'Medium', badge: 'bg-warning-50 text-warning-700', done: false },
    { title: 'Ship v1.2 release notes', priority: 'Low', badge: 'bg-success-50 text-success-700', done: true },
  ];

  const handleGetStarted = () => {
    router.push('/register');
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Features', target: 'features' },
    { label: 'How it works', target: 'how-it-works' },
    { label: 'Reviews', target: 'reviews' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>TodoApp — Your day, effortlessly organized</title>
      </Head>

      {/* Navbar — glassy, scroll-aware */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-xl shadow-subtle border-b border-ink-border'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group flex items-center cursor-pointer"
              aria-label="TodoApp — back to top"
            >
              <Logo size={32} showWordmark />
            </button>

            {/* Desktop Navigation — pill links with hover fill */}
            <div className="hidden md:flex items-center gap-1 bg-surface-muted/70 backdrop-blur-sm rounded-full p-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.target)}
                  className="relative px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink rounded-full transition-colors duration-200 cursor-pointer hover:bg-white hover:shadow-subtle"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => router.push('/login')}
                className="px-5 py-2 text-sm font-semibold text-ink hover:text-primary-600 rounded-full transition-colors duration-200 cursor-pointer"
              >
                Login
              </button>
              <GradientButton onClick={() => router.push('/register')} size="sm">
                Sign Up
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </GradientButton>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                className="p-2 text-ink-muted hover:text-primary-600 transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
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
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-t border-ink-border overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => scrollToSection(link.target)}
                    className="block w-full text-left px-4 py-2.5 text-ink-muted hover:bg-primary-50 hover:text-primary-700 rounded-input transition-colors font-medium cursor-pointer"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="pt-3 border-t border-ink-border space-y-2">
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-muted rounded-input transition-colors cursor-pointer"
                  >
                    Login
                  </button>
                  <GradientButton
                    onClick={() => router.push('/register')}
                    size="sm"
                    className="w-full"
                  >
                    Sign Up
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </GradientButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section — grid + aurora background, badge, trust row */}
      <section id="hero" className="relative overflow-hidden pt-36 pb-24 px-4">
        {/* Background: blueprint grid fading out + aurora blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-50/60 via-white to-white" />
          <div className="absolute inset-0 bg-grid-fade" />
          <motion.div
            className="absolute top-10 right-0 w-[32rem] h-[32rem] bg-gradient-to-br from-primary-200/40 to-violet-200/40 rounded-full blur-3xl"
            animate={reduceMotion ? undefined : { x: [0, -40, 0], y: [0, 30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 -left-24 w-[28rem] h-[28rem] bg-gradient-to-tr from-violet-200/40 to-primary-200/40 rounded-full blur-3xl"
            animate={reduceMotion ? undefined : { x: [0, 30, 0], y: [0, -24, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Announcement badge */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex justify-center mb-6"
          >
            <button
              onClick={() => scrollToSection('features')}
              className="group inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 backdrop-blur px-4 py-1.5 text-sm font-medium text-ink-muted shadow-subtle hover:border-primary-300 hover:text-primary-700 transition-all cursor-pointer"
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-600 text-white text-xs font-semibold px-2 py-0.5">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                New
              </span>
              AI-powered daily planning is here
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
          </motion.div>

          {/* Headline — word-by-word reveal, display font */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-ink mb-6 tracking-tight text-center">
            {heroWords.map((word, index) => (
              <motion.span
                key={word}
                initial={reduceMotion ? false : { opacity: 0, y: 24, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.5, delay: 0.08 * index, ease: 'easeOut' }}
                className={`inline-block mr-[0.25em] last:mr-0 ${
                  word === 'effortlessly'
                    ? 'bg-gradient-to-r from-primary-600 via-violet-600 to-primary-500 bg-clip-text text-transparent'
                    : ''
                }`}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
            className="text-lg md:text-xl text-ink-muted mb-8 max-w-2xl mx-auto text-center leading-relaxed"
          >
            Capture tasks, set priorities and deadlines, and let your AI
            assistant handle the planning — all in one calm workspace.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <GradientButton
              onClick={handleGetStarted}
              className="w-full sm:w-auto"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </GradientButton>
            <GlowPillButton
              onClick={() => scrollToSection('how-it-works')}
              className="w-full sm:w-auto bg-white"
            >
              See how it works
            </GlowPillButton>
          </motion.div>

          {/* Trust row — avatars + rating */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10 text-sm text-ink-subtle"
          >
            <div className="flex -space-x-2" aria-hidden="true">
              {['from-violet-500 to-violet-600', 'from-primary-500 to-primary-600', 'from-emerald-500 to-emerald-600', 'from-orange-400 to-orange-500'].map(
                (grad, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br ${grad}`}
                  />
                )
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5" aria-label="Rated 4.9 out of 5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                ))}
              </div>
              <span>
                <strong className="text-ink font-semibold">4.9/5</strong> from 2,000+ organized users
              </span>
            </div>
          </motion.div>

          {/* Floating Product Preview */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
            className="relative max-w-xl mx-auto mt-20"
          >
            {/* Floating AI chip */}
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -top-5 right-4 sm:-right-8 z-10 flex items-center gap-2 bg-white rounded-full shadow-overlay border border-ink-border px-4 py-2 text-sm font-semibold text-ink"
            >
              <Sparkles className="w-4 h-4 text-violet-600" aria-hidden="true" />
              AI planned your day
            </motion.div>

            {/* Progress pill */}
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-4 left-4 sm:-left-8 z-10 flex items-center gap-2.5 bg-white rounded-full shadow-overlay border border-ink-border px-4 py-2 text-sm font-medium text-ink"
            >
              <span className="relative w-5 h-5" aria-hidden="true">
                <CheckCircle2 className="w-5 h-5 text-success-600" />
              </span>
              1 of 3 done — 33% today
            </motion.div>

            {/* Task list card */}
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="bg-white/90 backdrop-blur rounded-modal shadow-overlay border border-ink-border p-6 text-left"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-ink">Today</h3>
                <span className="text-xs font-medium text-ink-subtle">3 tasks · 1 done</span>
              </div>
              <ul className="space-y-3">
                {previewTasks.map((task, index) => (
                  <motion.li
                    key={task.title}
                    initial={reduceMotion ? false : { opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1 + index * 0.15, ease: 'easeOut' }}
                    className="flex items-center gap-3 p-3 rounded-input border border-ink-border bg-surface-background/60"
                  >
                    {task.done ? (
                      <CheckCircle2 className="w-5 h-5 text-success-600 shrink-0" aria-hidden="true" />
                    ) : (
                      <Circle className="w-5 h-5 text-ink-subtle shrink-0" aria-hidden="true" />
                    )}
                    <span
                      className={`flex-1 text-sm font-medium truncate ${
                        task.done ? 'text-ink-subtle line-through' : 'text-ink'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span
                      className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${task.badge}`}
                    >
                      {task.priority}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Logo/stat strip */}
      <section className="py-10 px-4 border-y border-ink-border bg-surface-background/60">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { value: '12k+', label: 'Tasks organized' },
            { value: '4.9', label: 'Average rating' },
            { value: '30%', label: 'More done per week' },
            { value: '24/7', label: 'AI assistant online' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl font-bold text-ink tabular-nums">{stat.value}</p>
              <p className="text-sm text-ink-subtle mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid (3 columns) */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-sm font-semibold text-primary-600 tracking-wide uppercase mb-3">
              Features
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-ink mb-4 tracking-tight">
              Everything you need to stay organized
            </h2>
            <p className="text-lg text-ink-muted max-w-2xl mx-auto">
              Smart defaults, zero busywork — TodoApp handles the planning so you can execute.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckSquare,
                iconClass: 'bg-primary-50 text-primary-600',
                title: 'Smart Task Management',
                description: 'Organize tasks with priority levels and due dates. Bulk actions make triage painless.',
              },
              {
                icon: Bot,
                iconClass: 'bg-violet-50 text-violet-600',
                title: 'AI Assistant',
                description: 'Chat with your task list — add, complete, and reschedule tasks in plain language.',
              },
              {
                icon: Zap,
                iconClass: 'bg-amber-50 text-amber-600',
                title: 'Fast & Focused',
                description: 'A calm, distraction-free interface that loads instantly and never gets in your way.',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
                >
                  <SpotlightCard className="group h-full bg-white p-8 rounded-card shadow-subtle hover:shadow-lifted hover:-translate-y-1.5 transition-all duration-200 border border-ink-border/60">
                    {/* Gradient top bar — sweeps in on hover */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-card bg-gradient-to-r from-primary-600 to-violet-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                      aria-hidden="true"
                    />
                    <div
                      className={`w-12 h-12 rounded-input flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${feature.iconClass}`}
                    >
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-ink mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-ink-muted text-base leading-relaxed">
                      {feature.description}
                    </p>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works — 3 numbered steps */}
      <section id="how-it-works" className="py-24 px-4 bg-gradient-to-b from-white to-primary-50/40">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-sm font-semibold text-primary-600 tracking-wide uppercase mb-3">
              How it works
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-ink mb-4 tracking-tight">
              Organized in three steps
            </h2>
            <p className="text-lg text-ink-muted max-w-2xl mx-auto">
              From brain-dump to done — without the busywork.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line behind the steps (desktop) */}
            <div
              className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-primary-200 via-violet-200 to-primary-200"
              aria-hidden="true"
            />
            {[
              {
                step: '01',
                icon: Sparkles,
                title: 'Capture everything',
                description: 'Type tasks in seconds — from anywhere. Set priority and a deadline, or let AI suggest them.',
              },
              {
                step: '02',
                icon: Bot,
                title: 'Let AI plan your day',
                description: 'Your assistant sorts by priority and deadline, then lays out a realistic plan for today.',
              },
              {
                step: '03',
                icon: CheckCircle2,
                title: 'Execute and track',
                description: 'Check things off, watch your weekly activity grow, and keep your streak alive.',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.12 * (index + 1) }}
                  className="relative text-center"
                >
                  <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white border border-primary-100 shadow-card mb-6">
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-primary-600 to-violet-600 text-white text-xs font-bold flex items-center justify-center tabular-nums">
                      {item.step}
                    </span>
                    <Icon className="w-8 h-8 text-primary-600" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-ink mb-2">{item.title}</h3>
                  <p className="text-ink-muted leading-relaxed max-w-xs mx-auto">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed features (2x2) */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-sm font-semibold text-primary-600 tracking-wide uppercase mb-3">
              Built for teams and individuals
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-ink mb-4 tracking-tight">
              More than a to-do list
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: CalendarClock,
                iconClass: 'bg-primary-50 text-primary-600',
                title: 'Deadlines that respect you',
                description:
                  'Due dates, reminders, and a weekly activity view that shows exactly when you do your best work.',
              },
              {
                icon: Cloud,
                iconClass: 'bg-violet-50 text-violet-600',
                title: 'Cloud sync',
                description:
                  'Access your tasks from anywhere, on any device. Automatic sync keeps everything up to date.',
              },
              {
                icon: Shield,
                iconClass: 'bg-success-50 text-success-600',
                title: 'Security first',
                description:
                  'Your data stays yours — encrypted in transit, never sold, never used to train models.',
              },
              {
                icon: Zap,
                iconClass: 'bg-amber-50 text-amber-600',
                title: 'Keyboard-first speed',
                description:
                  'Create, filter, and complete tasks without touching the mouse. Power users feel at home instantly.',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.08 * (index + 1) }}
                >
                  <SpotlightCard
                    spotlightColor="rgba(124, 58, 237, 0.07)"
                    className="group h-full bg-white p-8 lg:p-10 rounded-card shadow-subtle hover:shadow-lifted hover:-translate-y-1 transition-all duration-200 border border-ink-border/60"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-input flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${feature.iconClass}`}
                      >
                        <Icon className="w-6 h-6" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold text-ink mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-ink-muted text-base leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reviews — stats cards (no fake quotes) */}
      <section id="reviews" className="py-24 px-4 bg-gradient-to-br from-surface-background to-primary-50/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block text-sm font-semibold text-primary-600 tracking-wide uppercase mb-3">
              Reviews
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-4 tracking-tight">
              Loved by organized people
            </h2>
            <div className="flex items-center justify-center gap-2 text-ink-muted">
              <div className="flex items-center gap-0.5" aria-label="Rated 4.9 out of 5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" aria-hidden="true" />
                ))}
              </div>
              <span className="font-semibold text-ink">4.9/5</span> average across 2,000+ users
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { value: '96%', label: 'say they feel more in control of their week' },
              { value: '3.2×', label: 'more tasks completed by active users' },
              { value: '9 min', label: 'average time to a fully planned day' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
                className="bg-white rounded-card shadow-subtle border border-ink-border/60 p-8 text-center"
              >
                <p className="font-display text-4xl font-bold text-ink tabular-nums bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-ink-muted mt-3 leading-relaxed">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — light panel with rotating gradient border */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="gradient-border-spin rounded-modal p-[2.5px] shadow-overlay"
          >
            <div className="relative overflow-hidden rounded-[13.5px] bg-gradient-to-br from-primary-50/80 via-white to-violet-50/80 px-6 py-16 sm:px-16 text-center">
              {/* Floating decorative icons */}
              <motion.div
                animate={reduceMotion ? undefined : { y: [0, -12, 0], rotate: [0, 12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-8 left-8 sm:top-10 sm:left-12 text-primary-200 pointer-events-none"
                aria-hidden="true"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <motion.div
                animate={reduceMotion ? undefined : { y: [0, 10, 0], rotate: [0, -14, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="absolute bottom-10 right-8 sm:bottom-12 sm:right-14 text-violet-200 pointer-events-none"
                aria-hidden="true"
              >
                <Sparkles className="w-10 h-10" />
              </motion.div>

              <div className="relative z-10">
                {/* Pulsing sparkle badge */}
                <motion.div
                  animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-violet-600 shadow-glow-primary mb-6"
                  aria-hidden="true"
                >
                  <Sparkles className="w-7 h-7 text-white" />
                </motion.div>

                <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-4 tracking-tight">
                  Ready to get{' '}
                  <span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">
                    organized
                  </span>
                  ?
                </h2>
                <p className="text-lg text-ink-muted mb-10 max-w-xl mx-auto">
                  Start managing your tasks the smart way — it takes less than a minute.
                </p>

                {/* Button with pulsing glow ring */}
                <span className="relative inline-flex">
                  {!reduceMotion && (
                    <motion.span
                      className="absolute inset-0 rounded-input bg-primary-600/40"
                      animate={{ scale: [1, 1.18], opacity: [0.5, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                      aria-hidden="true"
                    />
                  )}
                  <button
                    onClick={handleGetStarted}
                    className="btn-shine group relative inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white text-lg font-semibold tracking-tight rounded-input shadow-card hover:bg-primary-700 hover:-translate-y-0.5 hover:shadow-glow-primary active:scale-[0.97] transition-all cursor-pointer"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </button>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-ink text-white pt-16 pb-8 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Logo size={32} showWordmark wordmarkClassName="text-white" />
              </div>
              <p className="text-ink-border max-w-xs leading-relaxed">
                The calm way to manage your tasks and boost productivity — with a little help from AI.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3 mt-6">
                {[Github, Twitter, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-white/15 text-ink-border hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
                    aria-label={['GitHub', 'Twitter', 'LinkedIn'][i]}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4">Quick Links</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Get Started', href: '/register' },
                  { label: 'Login', href: '/login' },
                  { label: 'Features', href: '#features' },
                  { label: 'How it works', href: '#how-it-works' },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="inline-block text-ink-border hover:text-white hover:translate-x-1 transition-all"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4">Contact</h4>
              <p className="text-ink-border">
                Email:{' '}
                <a href="mailto:huzaifaqazi6167@gmail.com" className="hover:text-white transition-colors">
                  huzaifaqazi6167@gmail.com
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-ink-border text-sm">
            <p>&copy; {new Date().getFullYear()} Todo App. All rights reserved.</p>
            <p>Made with care for organized people.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
