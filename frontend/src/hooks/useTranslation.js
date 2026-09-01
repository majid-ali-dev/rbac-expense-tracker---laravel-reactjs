import useLanguageStore from '../store/languageStore';

const useTranslation = () => {
    const language = useLanguageStore((s) => s.language);
    const t = useLanguageStore((s) => s.t);
    const toggleLanguage = useLanguageStore((s) => s.toggleLanguage);
    const setLanguage = useLanguageStore((s) => s.setLanguage);

    return { t, language, toggleLanguage, setLanguage };
};

export default useTranslation;
