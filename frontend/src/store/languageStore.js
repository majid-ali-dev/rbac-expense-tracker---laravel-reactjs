import { create } from 'zustand';
import en from '../locales/en';
import ur from '../locales/ur';

const translations = { en, ur };

// Resolve the initial language: saved preference > default 'en'
const getInitialLanguage = () => {
    try {
        const stored = localStorage.getItem('language');
        if (stored === 'en' || stored === 'ur') return stored;
    } catch {
        // localStorage unavailable — fall through
    }
    return 'en';
};

// Toggle the `dir` attribute on <html> so RTL applies for Urdu
const applyLanguage = (lang) => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
};

const useLanguageStore = create((set, get) => ({
    language: getInitialLanguage(),

    t: (key) => {
        const lang = get().language;
        return translations[lang]?.[key] || translations.en[key] || key;
    },

    setLanguage: (lang) => {
        applyLanguage(lang);
        try {
            localStorage.setItem('language', lang);
        } catch {
            // ignore storage errors
        }
        set({ language: lang });
    },

    toggleLanguage: () =>
        set((state) => {
            const next = state.language === 'en' ? 'ur' : 'en';
            applyLanguage(next);
            try {
                localStorage.setItem('language', next);
            } catch {
                // ignore storage errors
            }
            return { language: next };
        }),
}));

// Safety net: apply the resolved language as soon as the store loads
applyLanguage(useLanguageStore.getState().language);

export default useLanguageStore;
