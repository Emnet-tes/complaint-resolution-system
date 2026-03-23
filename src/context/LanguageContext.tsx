import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

type Language = 'EN' | 'AM'; // English and Amharic (as an example)

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Simple translation dictionary
const translations: Record<Language, Record<string, string>> = {
  EN: {
    login: "Login",
    email: "Email",
    password: "Your Password",
    forgot: "Forgot Password?",
    register: "Register",
    noAccount: "Don't have an account?",
    submit: "Submit",
    verifyTitle: "Verify Code",
    resetTitle: "Reset Password",
    // Add more keys as needed
  },
  AM: {
    login: "ይግቡ",
    email: "ኢሜይል",
    password: "የይለፍ ቃል",
    forgot: "የይለፍ ቃል ረስተዋል?",
    noAccount: "መለያ የለዎትም?",
    submit: "ላክ",
    verifyTitle: "ኮዱን ያረጋግጡ",
    resetTitle: "የይለፍ ቃል ይቀይሩ",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('EN');

  const t = (key: string) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};