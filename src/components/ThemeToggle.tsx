import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  className?: string;
};

const getInitialIsDark = () => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') return true;
  if (saved === 'light') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
};

const ThemeToggle = ({ className }: Props) => {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(getInitialIsDark);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((v) => !v)}
      className={
        className ||
        'flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 cursor-pointer transition-all'
      }
      aria-label={t('theme.toggle', 'Toggle theme')}
      type="button"
    >
      {isDark ? <Sun className="w-4 h-4 text-[#006B5D]" /> : <Moon className="w-4 h-4 text-[#006B5D]" />}
      <span className="text-[10px] font-black uppercase tracking-tighter">
        {isDark ? t('theme.dark', 'Dark') : t('theme.light', 'Light')}
      </span>
    </button>
  );
};

export default ThemeToggle;

