import React from 'react';
import useThemeStore from '../../store/themeStore';

// Crescent moon icon (shown in light mode — click to switch to dark).
// Same shape react.dev uses for its dark-mode toggle.
const MoonIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[22px] h-[22px]"
    >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

// Sun + moon hybrid icon (shown in dark mode — click to switch to light).
// 12 rays around a circle with a crescent moon inside, matching the
// combined icon style used by react.dev.
const SunMoonIcon = () => (
    <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="w-[24px] h-[24px]"
    >
        {/* 12 radiating rays */}
        <line x1="16" y1="5.8" x2="16" y2="7.6" />
        <line x1="21.1" y1="7.2" x2="20.2" y2="8.7" />
        <line x1="24.8" y1="10.9" x2="23.3" y2="11.8" />
        <line x1="26.2" y1="16" x2="24.4" y2="16" />
        <line x1="24.8" y1="21.1" x2="23.3" y2="20.2" />
        <line x1="21.1" y1="24.8" x2="20.2" y2="23.3" />
        <line x1="16" y1="26.2" x2="16" y2="24.4" />
        <line x1="10.9" y1="24.8" x2="11.8" y2="23.3" />
        <line x1="7.2" y1="21.1" x2="8.7" y2="20.2" />
        <line x1="5.8" y1="16" x2="7.6" y2="16" />
        <line x1="7.2" y1="10.9" x2="8.7" y2="11.8" />
        <line x1="10.9" y1="7.2" x2="11.8" y2="8.7" />
        {/* concentric circle */}
        <circle cx="16" cy="16" r="5.6" />
        {/* crescent moon inside (curved back facing left), filled like react.dev */}
        <path
            transform="translate(16 16) scale(-0.42 0.42) translate(-12 -12)"
            fill="currentColor"
            stroke="none"
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        />
    </svg>
);

const ThemeToggle = () => {
    const { theme, toggleTheme } = useThemeStore();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Use Light Mode' : 'Use Dark Mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="
                fixed top-3 right-3 lg:top-4 lg:right-4 z-[90]
                flex items-center justify-center w-11 h-11 rounded-full
                bg-white/85 backdrop-blur-md border border-gray-200
                dark:bg-white/10 dark:!border-white/15
                text-[#4a4a4a] dark:text-white
                shadow-[0_4px_16px_rgba(15,23,42,0.15)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.45)]
                transition-all duration-300
                hover:scale-110 hover:rotate-12 hover:bg-gray-100
                dark:hover:!bg-white/20 dark:hover:rotate-0
                active:scale-95 focus:outline-none focus-visible:ring-2
                focus-visible:ring-blue-500 focus-visible:ring-offset-2
                dark:focus-visible:ring-offset-[#23272f]
            "
        >
            <span key={theme} className="flex items-center justify-center animate-[spin_0.5s_ease-in-out]">
                {isDark ? <SunMoonIcon /> : <MoonIcon />}
            </span>
        </button>
    );
};

export default ThemeToggle;
