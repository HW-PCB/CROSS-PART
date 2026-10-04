/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchHero } from './components/SearchHero';
import { OriginalPartCard } from './components/OriginalPartCard';
import { CandidateCard } from './components/CandidateCard';
import { ParametricComparisonMatrix } from './components/ParametricComparisonMatrix';
import { PinoutModal } from './components/PinoutModal';
import { BomBatchMode } from './components/BomBatchMode';
import { SavedPartsDrawer } from './components/SavedPartsDrawer';
import { PassiveComponentRulesGuide } from './components/PassiveComponentRulesGuide';
import { CrossReferenceResult, ReplacementCandidate } from './types/components';
import {
  Cpu,
  Layers,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Zap,
  Filter,
  ArrowRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'single' | 'bom' | 'saved'>('single');
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CrossReferenceResult | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Comparison matrix selected candidates (up to 4)
  const [selectedForCompare, setSelectedForCompare] = useState<ReplacementCandidate[]>([]);

  // Pinout verification modal
  const [pinoutModalCandidate, setPinoutModalCandidate] = useState<ReplacementCandidate | null>(null);

  // Saved/Bookmarked candidates in LocalStorage
  const [savedCandidates, setSavedCandidates] = useState<
    { candidate: ReplacementCandidate; originalPart: string; date: string }[]
  >(() => {
    try {
      const stored = localStorage.getItem('crosspart_saved_candidates');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Search history
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('crosspart_history');
      return stored ? JSON.parse(stored) : ['LM317T', 'STM32F103C8T6', 'MAX232CPE'];
    } catch {
      return [];
    }
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('crosspart_saved_candidates', JSON.stringify(savedCandidates));
    } catch (e) {
      console.error(e);
    }
  }, [savedCandidates]);

  useEffect(() => {
    try {
      localStorage.setItem('crosspart_history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  const [lastSearchedPart, setLastSearchedPart] = useState<string>('');

  // Main Search Handler
  const handleSearch = async (
    partNumber: string,
    options?: { criteria?: string; distributors?: string[] }
  ) => {
    if (!partNumber.trim()) return;

    setLastSearchedPart(partNumber.trim());
    setLoading(true);
    setError(null);
    setSelectedForCompare([]);

    try {
      const res = await fetch('/api/cross-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partNumber: partNumber.trim(),
          criteria: options?.criteria || 'all',
          targetDistributors: options?.distributors || ['digikey', 'mouser'],
          language,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.details || errJson.error || 'Lỗi khi tra cứu linh kiện.');
      }

      const resData = await res.json();
      if (!resData.data || !resData.data.originalPart) {
        throw new Error('Không nhận được dữ liệu hợp lệ từ máy chủ.');
      }

      setResult(resData.data);

      // Add to history without duplicates
      setHistory((prev) => [partNumber.trim().toUpperCase(), ...prev.filter((p) => p !== partNumber.trim().toUpperCase())].slice(0, 10));

      // Auto-select the top 2 candidates for comparison if available
      if (resData.data.candidates && resData.data.candidates.length > 0) {
        setSelectedForCompare(resData.data.candidates.slice(0, 2));
      }

      setActiveTab('single');
    } catch (err: any) {
      setError(err.message || 'Không thể tra cứu linh kiện. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Bookmark Toggle
  const handleToggleBookmark = (candidate: ReplacementCandidate) => {
    if (!result) return;
    const exists = savedCandidates.some((s) => s.candidate.partNumber === candidate.partNumber);
    if (exists) {
      setSavedCandidates(savedCandidates.filter((s) => s.candidate.partNumber !== candidate.partNumber));
    } else {
      setSavedCandidates([
        {
          candidate,
          originalPart: result.originalPart.partNumber,
          date: new Date().toLocaleDateString(),
        },
        ...savedCandidates,
      ]);
    }
  };

  // Compare Toggle
  const handleToggleCompare = (candidate: ReplacementCandidate) => {
    const exists = selectedForCompare.some((c) => c.partNumber === candidate.partNumber);
    if (exists) {
      setSelectedForCompare(selectedForCompare.filter((c) => c.partNumber !== candidate.partNumber));
    } else {
      if (selectedForCompare.length >= 4) {
        alert(
          language === 'vi'
            ? 'Bạn chỉ có thể so sánh tối đa 4 linh kiện cùng lúc.'
            : 'You can compare up to 4 components simultaneously.'
        );
        return;
      }
      setSelectedForCompare([...selectedForCompare, candidate]);
    }
  };

  // Filter candidates
  const filteredCandidates = result?.candidates?.filter((cand) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'DROP_IN') return cand.replacementType === 'DROP_IN';
    if (activeFilter === 'PIN_COMPATIBLE') return cand.replacementType === 'PIN_COMPATIBLE';
    if (activeFilter === 'UPGRADED') return cand.replacementType === 'UPGRADED';
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedCandidates.length}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {activeTab === 'single' && (
          <div>
            {/* Search Hero Area */}
            <SearchHero onSearch={handleSearch} isLoading={loading} language={language} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
              {/* Engineering Priority Rules Banner for Resistors & Capacitors */}
              <PassiveComponentRulesGuide
                language={language}
                onSelectSample={(mpn) => handleSearch(mpn)}
              />

              {/* Error Alert */}
              {error && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-rose-800 dark:text-rose-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold">
                        {language === 'vi' ? 'Không thể hoàn thành tra cứu' : 'Search failed'}
                      </h4>
                      <p className="text-xs mt-0.5">{error}</p>
                    </div>
                  </div>

                  {lastSearchedPart && (
                    <button
                      onClick={() => handleSearch(lastSearchedPart)}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 transition-colors shadow-xs"
                    >
                      {language === 'vi' ? 'Thử lại ngay' : 'Retry now'}
                    </button>
                  )}
                </div>
              )}

              {/* Loading Skeleton */}
              {loading && (
                <div className="space-y-6 animate-pulse">
                  <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                  </div>
                </div>
              )}

              {/* Active Results */}
              {result && !loading && (
                <div className="space-y-8">
                  {/* 1. Original Part Card */}
                  <OriginalPartCard part={result.originalPart} language={language} />

                  {/* 2. Side-by-Side Parametric Matrix (if any candidates selected) */}
                  {selectedForCompare.length > 0 && (
                    <ParametricComparisonMatrix
                      originalPart={result.originalPart}
                      selectedCandidates={selectedForCompare}
                      onRemoveCandidate={(cand) =>
                        setSelectedForCompare(selectedForCompare.filter((c) => c.partNumber !== cand.partNumber))
                      }
                      onClearAll={() => setSelectedForCompare([])}
                      language={language}
                    />
                  )}

                  {/* 3. Candidates Filter & Section Header */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span>
                            {language === 'vi'
                              ? `Linh Kiện Thay Thế Tương Đương (${filteredCandidates.length}/${result.candidates.length})`
                              : `Replacement Candidates (${filteredCandidates.length}/${result.candidates.length})`}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {language === 'vi'
                            ? 'Xếp hạng theo độ tương thích chân cắm, thông số điện và mức độ sẵn hàng trên DigiKey/Mouser.'
                            : 'Ranked by pinout compatibility, electrical ratings, and distributor availability.'}
                        </p>
                      </div>

                      {/* Filter Segmented Control */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                        {[
                          { id: 'ALL', labelVi: 'Tất cả', labelEn: 'All' },
                          { id: 'DROP_IN', labelVi: 'Drop-in 100%', labelEn: '100% Drop-In' },
                          { id: 'PIN_COMPATIBLE', labelVi: 'Pin-Compatible', labelEn: 'Pin-Compatible' },
                          { id: 'UPGRADED', labelVi: 'Nâng cấp', labelEn: 'Upgraded' },
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => setActiveFilter(btn.id)}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${
                              activeFilter === btn.id
                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {language === 'vi' ? btn.labelVi : btn.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Candidate Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredCandidates.map((cand) => (
                        <CandidateCard
                          key={cand.partNumber}
                          candidate={cand}
                          originalPartNumber={result.originalPart.partNumber}
                          isBookmarked={savedCandidates.some((s) => s.candidate.partNumber === cand.partNumber)}
                          onToggleBookmark={handleToggleBookmark}
                          isSelectedForCompare={selectedForCompare.some((c) => c.partNumber === cand.partNumber)}
                          onToggleCompare={handleToggleCompare}
                          onOpenPinoutCheck={(c) => setPinoutModalCandidate(c)}
                          language={language}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 4. Engineering Migration Advice */}
                  {result.designRecommendationsVi && (
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-slate-900 dark:to-slate-800/60 border border-blue-200/60 dark:border-blue-900/40 text-sm">
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>
                          {language === 'vi'
                            ? 'Khuyến Nghị Kỹ Thuật Khi Chuyển Đổi Part'
                            : 'Engineering Migration Recommendations'}
                        </span>
                      </h4>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                        {language === 'vi'
                          ? result.designRecommendationsVi
                          : result.designRecommendationsEn || result.designRecommendationsVi}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Initial Empty State Guide (When no part is queried yet) */}
              {!result && !loading && (
                <div className="space-y-8">
                  {/* Recent History */}
                  {history.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                        {language === 'vi' ? 'Lịch sử tra cứu gần đây:' : 'Recent searches:'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {history.map((part) => (
                          <button
                            key={part}
                            onClick={() => handleSearch(part)}
                            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium text-slate-800 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-700 transition-colors flex items-center gap-1.5"
                          >
                            <span>{part}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feature Pillars */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                        <Zap className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                        {language === 'vi' ? 'Drop-in 100% Pinout' : '100% Drop-In Pinouts'}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {language === 'vi'
                          ? 'Tìm chính xác linh kiện cùng sơ đồ chân, footprint và thông số điện để thay thế ngay vào PCB sẵn có mà không cần layout lại mạch.'
                          : 'Locate true pin-for-pin drop-in replacements with matching packages and footprints for zero-redesign substitution.'}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                        {language === 'vi' ? 'Tích Hợp DigiKey & Mouser' : 'DigiKey & Mouser Direct'}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {language === 'vi'
                          ? 'Liên kết trực tiếp tới catalog DigiKey và Mouser để kiểm tra số lượng tồn kho (in-stock), giá đơn vị và mua hàng nhanh chóng.'
                          : 'One-click direct distributor links to check real-time inventory, unit pricing, and lead times.'}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                        {language === 'vi' ? 'Đối Chiếu Thông Số Điện' : 'Parametric Delta Analysis'}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {language === 'vi'
                          ? 'So sánh chi tiết điện áp, dòng định mức, RDS(on), tần số hoạt động, dải nhiệt độ và cảnh báo ESR tụ lọc để tránh rủi ro kỹ thuật.'
                          : 'Deep technical parameter comparison ensuring electrical safety margins, thermal tolerances, and stability.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Batch BOM Mode Tab */}
        {activeTab === 'bom' && (
          <BomBatchMode
            language={language}
            onInspectPart={(mpn) => {
              setActiveTab('single');
              handleSearch(mpn);
            }}
          />
        )}

        {/* Saved Parts Tab */}
        {activeTab === 'saved' && (
          <SavedPartsDrawer
            savedCandidates={savedCandidates}
            onRemoveSaved={(mpn) =>
              setSavedCandidates(savedCandidates.filter((s) => s.candidate.partNumber !== mpn))
            }
            onClearAll={() => setSavedCandidates([])}
            onInspectPart={(mpn) => {
              setActiveTab('single');
              handleSearch(mpn);
            }}
            language={language}
          />
        )}
      </main>

      {/* Pinout Verification Modal */}
      {pinoutModalCandidate && result && (
        <PinoutModal
          originalPartNumber={result.originalPart.partNumber}
          candidate={pinoutModalCandidate}
          onClose={() => setPinoutModalCandidate(null)}
          language={language}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              CrossPart AI — Công cụ tra cứu linh kiện điện tử tương đương DigiKey & Mouser
            </p>
            <p className="text-slate-400 mt-0.5">
              {language === 'vi'
                ? 'Lưu ý: Luôn kiểm tra datasheet chính thức và thử nghiệm mạch mẫu trước khi sản xuất hàng loạt.'
                : 'Notice: Always review official datasheets and prototype bench test before mass production.'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-medium">
            <span>DigiKey API Ready</span>
            <span>·</span>
            <span>Mouser API Ready</span>
            <span>·</span>
            <span>Datasheets & Pinouts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
