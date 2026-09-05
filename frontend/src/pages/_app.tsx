import React from 'react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { motion, useReducedMotion } from 'framer-motion';
import { Plus_Jakarta_Sans, Sora } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import { TaskProvider } from '../context/TaskContext';
import '../styles/globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  return (
    <AuthProvider>
      <TaskProvider>
        <div className={`${jakarta.variable} ${sora.variable}`}>
          {/* Page transition — subtle fade/slide on route change, skipped for reduced motion */}
          <motion.div
            key={router.route}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Component {...pageProps} />
          </motion.div>
        </div>
      </TaskProvider>
    </AuthProvider>
  );
}

export default MyApp;
