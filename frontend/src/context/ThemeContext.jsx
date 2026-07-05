import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  ocean: {
    id: 'ocean',
    name: 'Ocean Blue',
    colors: { primary: '#3B82F6', secondary: '#6366F1', accent: '#06B6D4' },
    preview: ['#3B82F6', '#6366F1', '#06B6D4'],
  },
  forest: {
    id: 'forest',
    name: 'Forest Green',
    colors: { primary: '#10B981', secondary: '#059669', accent: '#34D399' },
    preview: ['#10B981', '#059669', '#34D399'],
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Orange',
    colors: { primary: '#F97316', secondary: '#EF4444', accent: '#FBBF24' },
    preview: ['#F97316', '#EF4444', '#FBBF24'],
  },
  royal: {
    id: 'royal',
    name: 'Royal Purple',
    colors: { primary: '#8B5CF6', secondary: '#7C3AED', accent: '#A78BFA' },
    preview: ['#8B5CF6', '#7C3AED', '#A78BFA'],
  },
  rose: {
    id: 'rose',
    name: 'Rose Gold',
    colors: { primary: '#F43F5E', secondary: '#EC4899', accent: '#FB7185' },
    preview: ['#F43F5E', '#EC4899', '#FB7185'],
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Dark',
    colors: { primary: '#64748B', secondary: '#475569', accent: '#94A3B8' },
    preview: ['#1E293B', '#334155', '#64748B'],
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('fb_theme') || 'ocean';
  });

  const applyTheme = (themeId) => {
    const theme = THEMES[themeId];
    if (!theme) return;
    setActiveTheme(themeId);
    localStorage.setItem('fb_theme', themeId);
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
  };

  // Apply on mount
  useEffect(() => {
    applyTheme(activeTheme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ThemeContext.Provider value={{ activeTheme, applyTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};

export default ThemeContext;
