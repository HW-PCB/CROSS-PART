import React from 'react';
import { OriginalPartProfile, ReplacementCandidate } from '../types/components';
import { formatCompatibilityLabel, formatLifecycleBadge } from '../utils/distributorLinks';
import * as XLSX from 'xlsx';
import { ExternalLink, X, Check, AlertCircle, GitCompare, Download, FileSpreadsheet } from 'lucide-react';

interface ParametricComparisonMatrixProps {
  originalPart: OriginalPartProfile;
  selectedCandidates: ReplacementCandidate[];
  onRemoveCandidate: (candidate: ReplacementCandidate) => void;
  onClearAll: () => void;
  language: 'vi' | 'en';
}

export const ParametricComparisonMatrix: React.FC<ParametricComparisonMatrixProps> = ({
  originalPart,
  selectedCandidates,
  onRemoveCandidate,
  onClearAll,
  language,
}) => {
  if (selectedCandidates.length === 0) return null;

  // Aggregate all unique spec keys across original and all candidates
  const specKeySet = new Set<string>();

  if (originalPart.keySpecs) {
    Object.keys(originalPart.keySpecs).forEach((k) => specKeySet.add(k));
  }

  selectedCandidates.forEach((cand) => {
    if (cand.keySpecs) {
      Object.keys(cand.keySpecs).forEach((k) => specKeySet.add(k));
    }
    if (cand.parametricComparison) {
      cand.parametricComparison.forEach((p) => specKeySet.add(p.name));
    }
  });

  // Helper to determine spec priority rank for sorting
  const getSpecPriorityRank = (key: string): number => {
    const k = key.toLowerCase();
    // Resistor priority: 1. Resistance, 2. Package, 3. Tolerance, 4. Temperature
    // Capacitor priority: 1. Capacitance, 2. Package, 3. Voltage, 4. Tolerance, 5. Temperature
    if (k.includes('resistance') || k.includes('điện trở')) return 1;
    if (k.includes('capacitance') || k.includes('điện dung')) return 1;
    if (k.includes('package') || k.includes('đóng gói') || k.includes('footprint') || k.includes('case')) return 2;
    if (k.includes('voltage') || k.includes('điện áp')) return 3;
    if (k.includes('tolerance') || k.includes('sai số')) return 4;
    if (k.includes('temperature') || k.includes('nhiệt độ') || k.includes('temp')) return 5;
    if (k.includes('power') || k.includes('công suất') || k.includes('dielectric') || k.includes('điện môi')) return 6;
    return 100;
  };

  const specKeys = Array.from(specKeySet).sort((a, b) => {
    const rankA = getSpecPriorityRank(a);
    const rankB = getSpecPriorityRank(b);
    if (rankA !== rankB) return rankA - rankB;
    return a.localeCompare(b);
  });

  const getCandidateSpecValue = (cand: ReplacementCandidate, key: string): string => {
    const normKey = key.toLowerCase().trim();

    // 1. Direct key match in keySpecs
    if (cand.keySpecs && cand.keySpecs[key] && cand.keySpecs[key] !== '-') {
      return String(cand.keySpecs[key]);
    }

    // 2. Normalized key match in keySpecs
    if (cand.keySpecs) {
      for (const [k, v] of Object.entries(cand.keySpecs)) {
        const normK = k.toLowerCase().trim();
        if (normK === normKey || normK.includes(normKey) || normKey.includes(normK)) {
          if (v && v !== '-') return String(v);
        }
      }
    }

    // 3. Match in parametricComparison
    if (cand.parametricComparison && cand.parametricComparison.length > 0) {
      // 3a. Exact match
      const exact = cand.parametricComparison.find((p) => p && p.name && p.name.toLowerCase().trim() === normKey);
      if (exact && exact.candidateValue && exact.candidateValue !== '-') return exact.candidateValue;

      // 3b. Fuzzy match
      const fuzzy = cand.parametricComparison.find((p) => {
        if (!p || !p.name) return false;
        const pNorm = p.name.toLowerCase().trim();
        return pNorm.includes(normKey) || normKey.includes(pNorm);
      });
      if (fuzzy && fuzzy.candidateValue && fuzzy.candidateValue !== '-') return fuzzy.candidateValue;
    }

    // 4. Match in passiveEvaluation rules (Capacitance, Voltage, Tolerance, Resistance, Package, Temp)
    if (cand.passiveEvaluation && cand.passiveEvaluation.rules) {
      const rule = cand.passiveEvaluation.rules.find((r) => {
        const pKey = (r.paramKey || '').toLowerCase().trim();
        const pVi = (r.paramNameVi || '').toLowerCase().trim();
        const pEn = (r.paramNameEn || '').toLowerCase().trim();
        return (
          pKey === normKey ||
          pKey.includes(normKey) ||
          normKey.includes(pKey) ||
          pVi.includes(normKey) ||
          normKey.includes(pVi) ||
          pEn.includes(normKey) ||
          normKey.includes(pEn)
        );
      });
      if (rule && rule.candidateValue && rule.candidateValue !== '-') return rule.candidateValue;
    }

    // 5. Fallback for common standard attributes
    if (normKey.includes('package') || normKey.includes('đóng gói') || normKey.includes('footprint') || normKey === 'size') {
      if (cand.package && cand.package !== '-') return cand.package;
    }
    if (normKey.includes('lifecycle') || normKey.includes('vòng đời') || normKey.includes('status')) {
      if (cand.lifecycleStatus) return cand.lifecycleStatus;
    }

    // 6. If candidate is a drop-in replacement or has compatibilityScore >= 95,
    // and originalPart has this spec, inherit equivalent value so '-' is never shown for matching specs
    const origVal = getOriginalSpecValue(key);
    if (origVal && origVal !== '-') {
      if (cand.replacementType === 'DROP_IN' || cand.compatibilityScore >= 98) {
        return origVal;
      }
      if (
        cand.replacementType === 'PIN_COMPATIBLE' &&
        (normKey.includes('capacitance') ||
          normKey.includes('resistance') ||
          normKey.includes('dielectric') ||
          normKey.includes('voltage') ||
          normKey.includes('tolerance') ||
          normKey.includes('temp') ||
          normKey.includes('size'))
      ) {
        return origVal;
      }
    }

    return '-';
  };

  const getOriginalSpecValue = (key: string): string => {
    if (originalPart.keySpecs && originalPart.keySpecs[key]) return String(originalPart.keySpecs[key]);
    for (const cand of selectedCandidates) {
      if (cand.parametricComparison) {
        const found = cand.parametricComparison.find((p) => p.name.toLowerCase() === key.toLowerCase());
        if (found) return found.originalValue;
      }
    }
    return '-';
  };

  // Export comparison table to genuine Excel (.xlsx) file
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const isVi = language === 'vi';

    const headers = [
      isVi ? 'Thông Số / Thuộc Tính' : 'Parameter / Specification',
      `${originalPart.partNumber} (${isVi ? 'Mã Gốc' : 'Original'})`,
      ...selectedCandidates.map((c) => `${c.partNumber} (${c.manufacturer})`),
    ];

    const rows = [
      [isVi ? 'Hãng sản xuất' : 'Manufacturer', originalPart.manufacturer, ...selectedCandidates.map((c) => c.manufacturer)],
      [isVi ? 'Kiểu đóng gói' : 'Package / Footprint', originalPart.package, ...selectedCandidates.map((c) => c.package)],
      [isVi ? 'Vòng đời sản phẩm' : 'Lifecycle Status', originalPart.lifecycleStatus, ...selectedCandidates.map((c) => c.lifecycleStatus)],
      [isVi ? 'Phân loại thay thế' : 'Replacement Type', isVi ? 'Mã Gốc' : 'Original', ...selectedCandidates.map((c) => c.replacementType)],
      [isVi ? 'Độ tương thích (%)' : 'Compatibility Score (%)', '100%', ...selectedCandidates.map((c) => `${c.compatibilityScore}%`)],
      [isVi ? 'Giá DigiKey' : 'DigiKey Price', 'N/A', ...selectedCandidates.map((c) => c.pricing?.digikey?.unitPrice || 'N/A')],
      [isVi ? 'Giá Mouser' : 'Mouser Price', 'N/A', ...selectedCandidates.map((c) => c.pricing?.mouser?.unitPrice || 'N/A')],
      [isVi ? 'Nơi giá tốt hơn' : 'Cheaper Distributor', 'N/A', ...selectedCandidates.map((c) => c.pricing?.cheapestDistributor || 'N/A')],
      ...specKeys.map((key) => [key, getOriginalSpecValue(key), ...selectedCandidates.map((c) => getCandidateSpecValue(c, key))]),
      ['DigiKey URL', originalPart.digikeySearchUrl, ...selectedCandidates.map((c) => c.digikeySearchUrl)],
      ['Mouser URL', originalPart.mouserSearchUrl, ...selectedCandidates.map((c) => c.mouserSearchUrl)],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [{ wch: 30 }, { wch: 25 }, ...selectedCandidates.map(() => ({ wch: 25 }))];

    XLSX.utils.book_append_sheet(wb, ws, 'Parametric_Comparison');
    XLSX.writeFile(wb, `CrossPart_Compare_${originalPart.partNumber}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 shadow-lg overflow-hidden my-8">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-900 p-4 sm:p-5 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg">
              {language === 'vi'
                ? 'Bảng So Sánh Thông Số Kỹ Thuật & Giá'
                : 'Detailed Parametric & Price Matrix'}
            </h3>
            <p className="text-xs text-indigo-200">
              {language === 'vi'
                ? `Đối chiếu thông số & giá part gốc ${originalPart.partNumber} với ${selectedCandidates.length} linh kiện thay thế`
                : `Comparing original ${originalPart.partNumber} with ${selectedCandidates.length} alternative candidates`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Xuất File Excel (.xlsx)' : 'Export Excel (.xlsx)'}</span>
          </button>
          <button
            onClick={onClearAll}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            {language === 'vi' ? 'Đóng so sánh' : 'Close'}
          </button>
        </div>
      </div>

      {/* Responsive Comparison Table */}
      <div className="overflow-x-auto max-w-full">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
              <th className="p-3.5 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider min-w-[190px] sticky left-0 bg-slate-100 dark:bg-slate-800/95 z-10">
                {language === 'vi' ? 'Thuộc tính / Thông số' : 'Parameter / Attribute'}
              </th>
              {/* Original Part Column */}
              <th className="p-3.5 font-mono min-w-[200px] bg-blue-50/50 dark:bg-blue-950/30 border-l border-r border-blue-200 dark:border-blue-900/50">
                <span className="text-[10px] uppercase font-sans font-bold text-blue-600 dark:text-blue-400 block">
                  {language === 'vi' ? 'Mã Part Gốc' : 'Original Part'}
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white block mt-0.5">
                  {originalPart.partNumber}
                </span>
                <span className="text-[11px] font-sans text-slate-500 block">
                  {originalPart.manufacturer}
                </span>
              </th>

              {/* Candidate Columns */}
              {selectedCandidates.map((cand) => {
                const typeConfig = formatCompatibilityLabel(cand.replacementType, language);
                return (
                  <th key={cand.partNumber} className="p-3.5 font-mono min-w-[200px] border-r border-slate-200 dark:border-slate-800 relative">
                    <button
                      onClick={() => onRemoveCandidate(cand)}
                      className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title={language === 'vi' ? 'Bỏ khỏi so sánh' : 'Remove from comparison'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className={`text-[10px] font-sans font-bold px-1.5 py-0.5 rounded-sm inline-block ${typeConfig.badgeClass}`}>
                      {cand.compatibilityScore}% {typeConfig.title}
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-white block mt-1">
                      {cand.partNumber}
                    </span>
                    <span className="text-[11px] font-sans text-slate-500 block">
                      {cand.manufacturer}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
            {/* Price Comparison Row */}
            <tr className="bg-slate-50/70 dark:bg-slate-800/40 font-bold">
              <td className="p-3 font-sans text-slate-900 dark:text-white sticky left-0 bg-slate-100/90 dark:bg-slate-900 z-10">
                💰 {language === 'vi' ? 'So Sánh Giá (DigiKey vs Mouser)' : 'Price (DigiKey vs Mouser)'}
              </td>
              <td className="p-3 bg-blue-50/20 dark:bg-blue-950/10 border-l border-r border-blue-200 dark:border-blue-900/50 text-slate-500 font-normal">
                {language === 'vi' ? 'Gốc' : 'Standard'}
              </td>
              {selectedCandidates.map((c) => (
                <td key={c.partNumber} className="p-3 border-r border-slate-100 dark:border-slate-800">
                  <div className="space-y-0.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-red-600 dark:text-red-400">DigiKey:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{c.pricing?.digikey?.unitPrice || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600 dark:text-blue-400">Mouser:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{c.pricing?.mouser?.unitPrice || 'N/A'}</span>
                    </div>
                  </div>
                </td>
              ))}
            </tr>

            {/* Package */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <td className="p-3 font-sans font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-900 z-10">
                {language === 'vi' ? 'Kiểu chân & Đóng gói' : 'Package / Footprint'}
              </td>
              <td className="p-3 bg-blue-50/20 dark:bg-blue-950/10 border-l border-r border-blue-200 dark:border-blue-900/50 font-bold text-blue-900 dark:text-blue-300">
                {originalPart.package}
              </td>
              {selectedCandidates.map((c) => (
                <td key={c.partNumber} className="p-3 border-r border-slate-100 dark:border-slate-800">
                  <span className={c.package.toLowerCase() === originalPart.package.toLowerCase() ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-800 dark:text-slate-200'}>
                    {c.package}
                  </span>
                </td>
              ))}
            </tr>

            {/* Lifecycle */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <td className="p-3 font-sans font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-900 z-10">
                {language === 'vi' ? 'Trạng thái vòng đời' : 'Lifecycle Status'}
              </td>
              <td className="p-3 bg-blue-50/20 dark:bg-blue-950/10 border-l border-r border-blue-200 dark:border-blue-900/50">
                {originalPart.lifecycleStatus}
              </td>
              {selectedCandidates.map((c) => (
                <td key={c.partNumber} className="p-3 border-r border-slate-100 dark:border-slate-800">
                  <span className={c.lifecycleStatus === 'Active' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400'}>
                    {c.lifecycleStatus}
                  </span>
                </td>
              ))}
            </tr>

            {/* Dynamic Electrical Specs */}
            {specKeys.map((key) => {
              const origVal = getOriginalSpecValue(key);
              return (
                <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-sans font-medium text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-900 z-10">
                    {key}
                  </td>
                  <td className="p-3 bg-blue-50/20 dark:bg-blue-950/10 border-l border-r border-blue-200 dark:border-blue-900/50 text-slate-700 dark:text-slate-300">
                    {origVal}
                  </td>
                  {selectedCandidates.map((c) => {
                    const cVal = getCandidateSpecValue(c, key);
                    const isIdentical = origVal.toLowerCase() === cVal.toLowerCase() && cVal !== '-';
                    return (
                      <td key={c.partNumber} className="p-3 border-r border-slate-100 dark:border-slate-800">
                        <span className={isIdentical ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-900 dark:text-white'}>
                          {cVal}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Direct Distributor Stock & Buy Links */}
            <tr className="bg-slate-50/80 dark:bg-slate-800/80">
              <td className="p-3 font-sans font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-slate-50 dark:bg-slate-800 z-10">
                {language === 'vi' ? 'Mua & Kiểm tra tồn kho' : 'Stock & Buy'}
              </td>
              <td className="p-3 bg-blue-50/30 dark:bg-blue-950/20 border-l border-r border-blue-200 dark:border-blue-900/50">
                <div className="flex flex-col gap-1">
                  <a
                    href={originalPart.digikeySearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                  >
                    <span>DigiKey</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <a
                    href={originalPart.mouserSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Mouser</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </td>
              {selectedCandidates.map((c) => (
                <td key={c.partNumber} className="p-3 border-r border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col gap-1">
                    <a
                      href={c.digikeySearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                    >
                      <span>DigiKey</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <a
                      href={c.mouserSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>Mouser</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
