import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// Accent colors for random selection
const ACCENT_COLORS = [
  { name: 'blurple', glow: 'rgba(123, 92, 255, 0.5)' },
  { name: 'pernod', glow: 'rgba(200, 255, 0, 0.5)' },
  { name: 'hotbrick', glow: 'rgba(255, 68, 68, 0.5)' },
  { name: 'cyber', glow: 'rgba(0, 255, 255, 0.5)' },
  { name: 'magenta', glow: 'rgba(255, 0, 255, 0.5)' },
];

/**
 * Layout Component - Neon Editorial Design
 *
 * Layout principal dark-only con header fijo.
 * Sets random accent color on mount.
 */
const Layout = () => {
  // Set random accent color on mount
  useEffect(() => {
    const randomAccent = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];
    document.documentElement.style.setProperty('--accent-color', `var(--accent-${randomAccent.name})`);
    document.documentElement.style.setProperty('--accent-glow', randomAccent.glow);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-neon-base">
      <Header />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
