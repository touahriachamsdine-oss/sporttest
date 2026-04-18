'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, translations } from '@/lib/i18n';

type Theme = 'dark' | 'night';

import { useSession } from '@/lib/auth-client';

interface AppContextType {
    language: Locale;
    setLanguage: (l: Locale) => void;
    theme: Theme;
    setTheme: (t: Theme) => void;
    t: (key: keyof typeof translations['en']) => string;
    isRTL: boolean;
    user: {
        id: string;
        name: string;
        email: string;
    } | null | undefined;
    session: {
        id: string;
        userId: string;
    } | null | undefined;
    isPending: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Locale>('en');
    const [theme, setTheme] = useState<Theme>('dark');
    const { data: sessionData, isPending } = useSession();

    const t = (key: keyof typeof translations['en']) => {
        const langDict = (translations as Record<string, typeof translations['en']>)[language] || translations['en'];
        return langDict[key] || translations['en'][key];
    };

    const isRTL = language === 'ar';

    useEffect(() => {
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = language;

        if (theme === 'night') {
            document.documentElement.classList.add('theme-night');
        } else {
            document.documentElement.classList.remove('theme-night');
        }
    }, [language, isRTL, theme]);

    return (
        <AppContext.Provider value={{
            language,
            setLanguage,
            theme,
            setTheme,
            t,
            isRTL,
            user: sessionData?.user,
            session: sessionData?.session,
            isPending
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
}
