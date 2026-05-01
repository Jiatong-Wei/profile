'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useThemeStore, type Theme } from '@/lib/stores/themeStore';
import { useMessages } from '@/lib/i18n/useMessages';
import { cn } from '@/lib/utils';

interface ThemeOption {
  value: Theme;
  label: string;
  icon: ReactNode;
}

function useThemeOptions(): ThemeOption[] {
  const messages = useMessages();

  return [
    {
      value: 'system',
      label: messages.theme.system,
      icon: <ComputerDesktopIcon className="h-4 w-4" />,
    },
    {
      value: 'light',
      label: messages.theme.light,
      icon: <SunIcon className="h-4 w-4" />,
    },
    {
      value: 'dark',
      label: messages.theme.dark,
      icon: <MoonIcon className="h-4 w-4" />,
    },
  ];
}

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const messages = useMessages();
  const themes = useThemeOptions();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-white/5">
        <div className="w-4 h-4 rounded-full bg-neutral-600 animate-pulse" />
      </div>
    );
  }

  const currentTheme = themes.find((t) => t.value === theme) || themes[0];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          const order: Theme[] = ['system', 'light', 'dark'];
          const index = order.indexOf(theme);
          const next = order[(index + 1) % order.length];
          setTheme(next);
        }}
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-xl',
          'border border-white/10 bg-white/5 hover:bg-white/10',
          'transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          'text-neutral-400 hover:text-primary'
        )}
        title={`${messages.theme.currentTheme}: ${currentTheme.label}. ${messages.theme.cycleTheme}.`}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {theme === 'system' ? (
            <ComputerDesktopIcon className="h-4 w-4" />
          ) : theme === 'dark' ? (
            <MoonIcon className="h-4 w-4" />
          ) : (
            <SunIcon className="h-4 w-4" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}

export function ThemeToggleDropdown() {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messages = useMessages();
  const themes = useThemeOptions();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-white/5">
        <div className="w-4 h-4 rounded-full bg-neutral-600 animate-pulse" />
      </div>
    );
  }

  const currentTheme = themes.find((t) => t.value === theme) || themes[0];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-xl',
          'border border-white/10 bg-white/5 hover:bg-white/10',
          'transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          'text-neutral-400 hover:text-primary'
        )}
        title={`${messages.theme.currentTheme}: ${currentTheme.label}`}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {currentTheme.icon}
        </motion.div>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className={cn(
            'absolute right-0 mt-2 w-32 rounded-xl shadow-lg border',
            'bg-neutral-900/90 border-white/10 backdrop-blur-xl z-50'
          )}
        >
          <div className="py-1">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex items-center w-full px-3 py-2 text-sm',
                  'hover:bg-white/5 transition-colors duration-200',
                  theme === themeOption.value
                    ? 'text-primary bg-primary/10'
                    : 'text-neutral-300'
                )}
              >
                <span className="mr-2">{themeOption.icon}</span>
                {themeOption.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
