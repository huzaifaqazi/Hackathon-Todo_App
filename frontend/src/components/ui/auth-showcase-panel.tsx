import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ShowcaseTask {
  title: string;
  priority: string;
  badge: string;
  done: boolean;
  float: 'top' | 'bottom' | 'mid';
  duration: number;
}

/**
 * Left-side showcase panel for the split-screen auth layout.
 * Dark gradient stage with drifting aurora blobs, floating task cards,
 * an "AI planned your day" chip, and a testimonial — hidden below lg.
 * All motion respects prefers-reduced-motion.
 */
export const AuthShowcasePanel: React.FC = () => {
  const reduceMotion = useReducedMotion();

  const tasks: ShowcaseTask[] = [
    {
      title: 'Review project proposal',
      priority: 'High',
      badge: 'bg-orange-500/90 text-white',
      done: false,
      float: 'top',
      duration: 6,
    },
    {
      title: 'Team standup at 10:00',
      priority: 'Medium',
      badge: 'bg-amber-400/90 text-amber-950',
      done: false,
      float: 'mid',
      duration: 7.5,
    },
    {
      title: 'Ship v1.2 release notes',
      priority: 'Low',
      badge: 'bg-emerald-400/90 text-emerald-950',
      done: true,
      float: 'bottom',
      duration: 8,
    },
  ];

  return (
    <div
      className="hidden lg:flex lg:w-[46%] xl:w-[44%] relative overflow-hidden flex-col justify-between bg-ink p-12"
      aria-hidden="true"
    >
      {/* Aurora gradient blobs — slow drift */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute -top-24 -left-24 w-[28rem] h-[28rem] bg-primary-600/40 rounded-full blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[26rem] h-[26rem] bg-violet-600/35 rounded-full blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, -30, 0], y: [0, -24, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, 20, 0], y: [0, -28, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Subtle grid overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      {/* Top: headline */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="relative z-10"
      >
        <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight tracking-tight">
          Your day,{' '}
          <span className="bg-gradient-to-r from-primary-300 to-violet-300 bg-clip-text text-transparent">
            effortlessly
          </span>{' '}
          organized.
        </h2>
        <p className="text-white/60 mt-4 max-w-sm text-lg">
          Capture tasks, set priorities, and let your AI assistant handle the
          planning.
        </p>
      </motion.div>

      {/* Middle: floating task cards */}
      <div className="relative z-10 my-10 flex flex-col gap-5 max-w-md">
        {tasks.map((task, index) => {
          const offsets = {
            top: 'translate-x-4',
            mid: '-translate-x-6',
            bottom: 'translate-x-0',
          };
          return (
            <motion.div
              key={task.title}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.15, ease: 'easeOut' }}
            >
              <motion.div
                animate={reduceMotion ? undefined : { y: [0, index % 2 === 0 ? -8 : 8, 0] }}
                transition={{ duration: task.duration, repeat: Infinity, ease: 'easeInOut' }}
                className={`flex items-center gap-3 rounded-modal border border-white/10 bg-white/[0.06] backdrop-blur-md px-5 py-4 shadow-overlay ${offsets[task.float]}`}
              >
                {task.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-white/40 shrink-0" />
                )}
                <span
                  className={`flex-1 text-sm font-medium truncate ${
                    task.done ? 'text-white/40 line-through' : 'text-white'
                  }`}
                >
                  {task.title}
                </span>
                <span
                  className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${task.badge}`}
                >
                  {task.priority}
                </span>
              </motion.div>
            </motion.div>
          );
        })}

        {/* AI badge floating beside the cards */}
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -right-8 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white rounded-full shadow-overlay px-4 py-2 text-sm font-semibold text-ink"
        >
          <Sparkles className="w-4 h-4 text-violet-600" />
          AI planned your day
        </motion.div>
      </div>

      {/* Bottom: product stats strip */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
        className="relative z-10 max-w-md grid grid-cols-3 gap-4 divide-x divide-white/10"
      >
        {[
          { value: '12k+', label: 'Tasks organized' },
          { value: '4.9', label: 'App rating' },
          { value: '24/7', label: 'AI assistant' },
        ].map((stat) => (
          <div key={stat.label} className="text-center first:text-left last:text-right">
            <p className="text-2xl font-bold text-white font-display">{stat.value}</p>
            <p className="text-white/50 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Corner CTA hint */}
      <motion.div
        animate={reduceMotion ? undefined : { x: [0, 4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-12 right-12 z-10 hidden xl:flex items-center gap-1.5 text-sm font-medium text-white/50"
      >
        Get started
        <ArrowRight className="w-4 h-4" />
      </motion.div>
    </div>
  );
};
