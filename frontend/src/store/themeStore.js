import { create } from 'zustand';

// Resolve the initial theme: saved preference > system preference > light
const getInitialTheme = () => {
    try {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') return stored;
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
    } catch {
        // localStorage unavailable — fall through
    }
    return 'light';
};

// Toggle the `dark` class on <html> so all `.dark` / `dark:` styles apply
const applyTheme = (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
};

const useThemeStore = create((set) => ({
    theme: getInitialTheme(),

    setTheme: (theme) => {
        applyTheme(theme);
        try {
            localStorage.setItem('theme', theme);
        } catch {
            // ignore storage errors
        }
        set({ theme });
    },

    toggleTheme: () =>
        set((state) => {
            const next = state.theme === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            try {
                localStorage.setItem('theme', next);
            } catch {
                // ignore storage errors
            }
            return { theme: next };
        }),
}));

// Safety net: apply the resolved theme as soon as the store loads,
// so the UI never flashes the wrong mode (index.html also pre-applies it).
applyTheme(useThemeStore.getState().theme);

export default useThemeStore;
