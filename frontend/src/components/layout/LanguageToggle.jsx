import React from 'react';
import useLanguageStore from '../../store/languageStore';

const LanguageIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[20px] h-[20px]"
    >
        <path d="M5 8l4 4-4 4" />
        <path d="M11 19l4-4-4-4" />
        <path d="M2 12h12" />
        <path d="M12 2v4" />
        <path d="M12 18v4" />
        <path d="M20 8l-4 4 4 4" />
        <path d="M8 2v4" />
        <path d="M8 18v4" />
    </svg>
);

const LanguageToggle = () => {
    const { language, toggleLanguage } = useLanguageStore();
    const isUrdu = language === 'ur';

    return (
        <button
            onClick={toggleLanguage}
            aria-label={isUrdu ? 'Switch to English' : 'اردو میں تبدیل کریں'}
            title={isUrdu ? 'Switch to English' : 'اردو میں تبدیل کریں'}
            className="
                fixed top-3 right-16 lg:top-4 lg:right-16 z-[90]
                flex items-center justify-center w-11 h-11 rounded-full
                bg-white/85 backdrop-blur-md border border-gray-200
                dark:bg-white/10 dark:!border-white/15
                text-[#4a4a4a] dark:text-white
                shadow-[0_4px_16px_rgba(15,23,42,0.15)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.45)]
                transition-all duration-300
                hover:scale-110 hover:bg-gray-100
                dark:hover:!bg-white/20
                active:scale-95 focus:outline-none focus-visible:ring-2
                focus-visible:ring-blue-500 focus-visible:ring-offset-2
                dark:focus-visible:ring-offset-[#23272f]
            "
        >
            <span key={language} className="flex items-center justify-center text-[11px] font-bold tracking-tight select-none">
                {isUrdu ? 'EN' : 'UR'}
            </span>
        </button>
    );
};

export default LanguageToggle;
