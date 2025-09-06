import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

// Define los tipos para el contexto de idioma
interface LanguageContextType {
  language: string;
  changeLanguage: (lang: string) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
  loading: boolean;
}

// Crea el contexto con un valor inicial undefined
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Hook para usar el contexto de idioma
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Proveedor del contexto de idioma
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState(() => {
    // Obtiene el idioma de localStorage o usa 'es' como predeterminado
    return localStorage.getItem('language') || 'es';
  });
  const [translations, setTranslations] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);

  // Carga las traducciones dinámicamente
  const loadTranslations = useCallback(async (lang: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/locales/${lang}.json`);
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error(`Could not load ${lang} translations:`, error);
      // Fallback a un objeto vacío si falla la carga
      setTranslations({});
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga las traducciones cuando el idioma cambia
  useEffect(() => {
    loadTranslations(language);
  }, [language, loadTranslations]);

  // Cambia el idioma y lo guarda en localStorage
  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Función de traducción `t`
  const t = (key: string, replacements?: { [key: string]: string | number }): string => {
    let translation = translations[key] || key; // Fallback a la clave si no se encuentra la traducción

    // Reemplaza los placeholders si existen
    if (replacements) {
      for (const placeholder in replacements) {
        translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
      }
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, loading }}>
      {children}
    </LanguageContext.Provider>
  );
};
