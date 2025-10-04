import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { translations } from '../localization/strings';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: typeof translations.en;
    direction: Direction;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const storedLang = localStorage.getItem('gameLanguage');
        return (storedLang === 'en' || storedLang === 'ar') ? storedLang : 'en';
    });

    useEffect(() => {
        localStorage.setItem('gameLanguage', language);
    }, [language]);

    // FIX: Explicitly type `value` with `LanguageContextType` to ensure the `direction` property is correctly typed as `Direction` ('ltr' | 'rtl') instead of the wider `string` type.
    const value: LanguageContextType = useMemo(() => ({
        language,
        setLanguage,
        t: translations[language],
        direction: language === 'ar' ? 'rtl' : 'ltr',
    }), [language]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
