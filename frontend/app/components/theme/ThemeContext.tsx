'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

const ThemeContext = createContext({
    theme: 'dark',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setTheme: (theme: string) => { },
});

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setTheme] = useState('dark');

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);