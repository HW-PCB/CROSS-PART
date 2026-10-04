import React, { useState } from 'react';
import { Search, SlidersHorizontal, Sparkles, AlertCircle, X, Check } from 'lucide-react';
import { SAMPLE_PRESETS, SamplePreset } from '../data/samplePresets';

interface SearchHeroProps {
  onSearch: (partNumber: string, options: { criteria: string; distributors: string[] }) => void;
  isLoading: boolean;
  language: 'vi' | 'en';
}

export const SearchHero: React.FC<SearchHeroProps> = ({ onSearch, isLoading, language }) => {
  const [partInput, setPartInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [criteria, setCriteria] = useState('all');
  const [selectedDistributors, setSelectedDistributors] = useState<string[]>(['digikey', 'mouser']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partInput.trim()) return;
    onSearch(partInput.trim(), { criteria, distributors: selectedDistributors });
  };

  const handleSelectPreset = (preset: SamplePreset) => {
    setPartInput(preset.mpn);
    onSearch(preset.mpn, { criteria, distributors: selectedDistributors });
  };

  const toggleDistributor = (dist: string) => {
    if (selectedDistributors.includes(dist)) {
      if (selectedDistributors.length > 1) {
        setSelectedDistributors(selectedDistributors.filter((d) => d !== dist));
      }
    } else {
      setSelectedDistributors([...selectedDistributors, dist]);
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/50 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {language === 'vi' ? (
            <>
              Tìm Linh Kiện Tương Đương{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">
                DigiKey · Mouser
              </span>
            </>
          ) : (
            <>
              Electronic Component Cross-Reference for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">
                DigiKey · Mouser
              </span>
            </>
          )}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          {language === 'vi'
            ? 'Nhập mã linh kiện (MPN). Hệ thống sẽ phân tích chân cắm (pinout), thông số điện, so sánh giá đa nguồn (DigiKey vs Mouser) và tìm mã thay thế drop-in tối ưu kỹ thuật.'
            : 'Enter an MPN. CrossPart analyzes electrical specs, pinouts, and multi-distributor pricing (DigiKey vs Mouser) to find cost-optimized drop-in replacements.'}
        </p>
      </div>

      {/* Main Search Bar */}
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-blue-600/30 dark:border-blue-500/30 focus-within:border-blue-600 dark:focus-within:border-blue-500 transition-all">
            <div className="pl-4 sm:pl-5 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={partInput}
              onChange={(e) => setPartInput(e.target.value)}
              placeholder={
                language === 'vi'
                  ? 'Nhập mã MPN linh kiện (ví dụ: RC0603FR-0710KL, CC0603KRX7R9BB104, LM317T, STM32F103, IRF540N)...'
                  : 'Enter MPN (e.g. RC0603FR-0710KL, CC0603KRX7R9BB104, LM317T, STM32F103, IRF540N)...'
              }
              className="w-full py-4 pl-3 pr-24 sm:pr-32 text-base font-mono sm:text-lg bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
              autoFocus
            />

            {partInput && (
              <button
                type="button"
                onClick={() => setPartInput('')}
                className="p-1 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="pr-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`p-2 rounded-xl text-xs font-medium border transition-colors hidden sm:flex items-center gap-1 ${
                  showAdvanced
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                    : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="Tùy chọn lọc nâng cao"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'Bộ lọc' : 'Filters'}</span>
              </button>

              <button
                type="submit"
                disabled={isLoading || !partInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">{language === 'vi' ? 'Đang phân tích...' : 'Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Tra Cứu' : 'Search'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvanced && (
            <div className="mt-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md text-left transition-all">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {language === 'vi' ? 'Tiêu chí thay thế:' : 'Replacement Criteria:'}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', labelVi: 'Tất cả tương đương', labelEn: 'All Equivalents' },
                      { id: 'drop_in', labelVi: 'Drop-in 100% Pinout', labelEn: '100% Drop-in' },
                      { id: 'pin_compatible', labelVi: 'Tương thích chân', labelEn: 'Pin Compatible' },
                      { id: 'upgraded', labelVi: 'Linh kiện nâng cấp', labelEn: 'Upgraded Specs' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCriteria(opt.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          criteria === opt.id
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {language === 'vi' ? opt.labelVi : opt.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {language === 'vi' ? 'Nhà phân phối ưu tiên:' : 'Target Distributors:'}
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'digikey', label: 'DigiKey', color: 'border-red-500' },
                      { id: 'mouser', label: 'Mouser', color: 'border-blue-500' },
                    ].map((dist) => {
                      const isChecked = selectedDistributors.includes(dist.id);
                      return (
                        <button
                          key={dist.id}
                          type="button"
                          onClick={() => toggleDistributor(dist.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            isChecked
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${isChecked ? 'bg-blue-500 text-white' : 'border border-slate-300'}`}>
                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                          <span>{dist.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Quick presets chips */}
        <div className="mt-4 flex items-center justify-center flex-wrap gap-2 text-xs">
          <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            {language === 'vi' ? 'Linh kiện mẫu phổ biến:' : 'Popular test parts:'}
          </span>
          {SAMPLE_PRESETS.slice(0, 6).map((preset) => (
            <button
              key={preset.mpn}
              onClick={() => handleSelectPreset(preset)}
              className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center gap-1.5 shadow-2xs"
              title={`${preset.category} (${preset.commonPackage}) - ${preset.reason}`}
            >
              <span>{preset.mpn}</span>
              <span className="text-[10px] text-slate-400 font-sans">({preset.commonPackage})</span>
            </button>
          ))}
        </div>
      </div>
  );
};
