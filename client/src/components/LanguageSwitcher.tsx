import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn';
import { UA, GB } from 'country-flag-icons/react/3x2';

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'uk', name: 'UA', Flag: UA },
        { code: 'en', name: 'EN', Flag: GB }
    ];

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
    const CurrentFlag = currentLang.Flag;

    const handleChange = (code: string) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
        setTimeout(() => window.location.reload(), 100);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition text-slate-200 text-sm font-bold shadow-sm hover:shadow-emerald-500/10"
            >
                <CurrentFlag title={currentLang.name} className="w-5 h-5 rounded-xs shadow-sm object-cover" />

                <span>{currentLang.name}</span>

                <svg className={cn("w-4 h-4 text-slate-500 transition-transform duration-300", isOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleChange(lang.code)}
                                className={cn(
                                    "flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium transition-colors",
                                    currentLang.code === lang.code
                                        ? "bg-emerald-900/20 text-emerald-400"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <lang.Flag className="w-5 h-5 rounded-xs shadow-sm" />
                                {lang.name}

                                {currentLang.code === lang.code && (
                                    <svg className="w-4 h-4 ml-auto text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};