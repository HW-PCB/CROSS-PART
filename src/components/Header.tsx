import React from 'react';
import { Cpu, Layers, Bookmark, ExternalLink, Globe } from 'lucide-react';

interface HeaderProps {
  activeTab: 'single' | 'bom' | 'saved';
  setActiveTab: (tab: 'single' | 'bom' | 'saved') => void;
  savedCount: number;
  language: 'vi' | 'en';
  setLanguage: (lang: 'vi' | 'en') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  language,
  setLanguage,
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Cpu className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  CrossPart<span className="text-blue-600 dark:text-blue-400">.AI</span>
                </span>
                <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  DigiKey · Mouser
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {language === 'vi'
                  ? 'Tra cứu linh kiện tương đương & thay thế linh kiện EOL'
                  : 'Component cross-reference & EOL replacement engine'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'single'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Tra Cứu Linh Kiện' : 'Part Lookup'}</span>
            </button>

            <button
              onClick={() => setActiveTab('bom')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'bom'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Xử Lý BOM' : 'Batch BOM'}</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'saved'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Đã Lưu' : 'Saved'}</span>
              {savedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-mono">
                  {savedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Tools & Language Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Distributor status */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                DigiKey
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                Mouser
              </span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title={language === 'vi' ? 'Chuyển sang Tiếng Anh' : 'Switch to Vietnamese'}
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
