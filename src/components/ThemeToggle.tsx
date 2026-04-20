import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

type Props = {
  className?: string;
};

const ThemeToggle = ({ className }: Props) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
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

