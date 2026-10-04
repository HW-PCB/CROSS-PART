import React, { useState } from 'react';
import { ReplacementCandidate } from '../types/components';
import {
  formatCompatibilityLabel,
  formatLifecycleBadge,
  getDatasheetUrl,
} from '../utils/distributorLinks';
import {
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileText,
  Bookmark,
  GitCompare,
  Cpu,
  Layers,
  DollarSign,
  TrendingDown,
  ShoppingBag,
} from 'lucide-react';

interface CandidateCardProps {
  candidate: ReplacementCandidate;
  originalPartNumber: string;
  isBookmarked: boolean;
  onToggleBookmark: (candidate: ReplacementCandidate) => void;
  isSelectedForCompare: boolean;
  onToggleCompare: (candidate: ReplacementCandidate) => void;
  onOpenPinoutCheck: (candidate: ReplacementCandidate) => void;
  language: 'vi' | 'en';
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  originalPartNumber,
  isBookmarked,
  onToggleBookmark,
  isSelectedForCompare,
  onToggleCompare,
  onOpenPinoutCheck,
  language,
}) => {
  const [copied, setCopied] = useState(false);
  const [showSpecs, setShowSpecs] = useState(true);

  const typeConfig = formatCompatibilityLabel(candidate.replacementType, language);
  const lifecycle = formatLifecycleBadge(candidate.lifecycleStatus, language);

  const handleCopy = () => {
    navigator.clipboard.writeText(candidate.partNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
    return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
  };

  const pricing = candidate.pricing;

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all ${
        candidate.replacementType === 'DROP_IN'
          ? 'border-emerald-500/40 dark:border-emerald-500/30 shadow-md shadow-emerald-500/5'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
      }`}
    >
      <div className="p-5 sm:p-6">
        {/* Top Header: Badge, Compatibility Score, Actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeConfig.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${typeConfig.dotColor}`}></span>
                {typeConfig.title}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${lifecycle.badgeClass}`}>
                {lifecycle.label}
              </span>
              {candidate.mountingType && (
                <span className="text-xs text-slate-500 font-mono">
                  {candidate.mountingType}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                {candidate.partNumber}
              </h3>
              <button
                onClick={handleCopy}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Sao chép MPN"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">{candidate.manufacturer}</span>
              <span>·</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                {candidate.package}
              </span>
            </div>
          </div>

          {/* Compatibility Score Indicator */}
          <div className="flex flex-col items-end shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-extrabold font-mono ${getScoreColor(candidate.compatibilityScore)}`}>
              <span>{candidate.compatibilityScore}%</span>
              <span className="text-[10px] font-sans font-medium uppercase text-slate-500">
                {language === 'vi' ? 'Độ khớp' : 'Match'}
              </span>
            </div>

            <div className="flex items-center gap-1 mt-2">
              <button
                onClick={() => onToggleBookmark(candidate)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isBookmarked
                    ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                    : 'text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title={isBookmarked ? 'Bỏ lưu' : 'Lưu linh kiện này'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={() => onToggleCompare(candidate)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isSelectedForCompare
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800'
                    : 'text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title={language === 'vi' ? 'So sánh thông số' : 'Add to compare matrix'}
              >
                <GitCompare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Engineering Summary */}
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {language === 'vi' ? candidate.summaryVi : candidate.summaryEn || candidate.summaryVi}
        </p>

        {/* Price Comparison Section (DigiKey vs Mouser) */}
        {pricing && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'vi' ? 'So Sánh Giá (DigiKey · Mouser)' : 'Price Comparison'}</span>
              </span>

              {pricing.cheapestDistributor && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <TrendingDown className="w-3 h-3 text-emerald-600" />
                  <span>{pricing.cheapestDistributor} {language === 'vi' ? 'giá rẻ hơn' : 'cheaper'}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
              {/* DigiKey */}
              <div className={`p-2 rounded-lg border ${pricing.cheapestDistributor === 'DigiKey' ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                <span className="text-[10px] font-sans font-bold text-red-600 dark:text-red-400 block">DigiKey</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block mt-0.5">
                  {pricing.digikey?.unitPrice || 'N/A'}
                </span>
                <span className="text-[10px] text-slate-500 font-sans block">
                  {pricing.digikey?.tier100 ? `100+: ${pricing.digikey.tier100}` : (pricing.digikey?.stockStatus || 'US Stock')}
                </span>
              </div>

              {/* Mouser */}
              <div className={`p-2 rounded-lg border ${pricing.cheapestDistributor === 'Mouser' ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                <span className="text-[10px] font-sans font-bold text-blue-600 dark:text-blue-400 block">Mouser</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block mt-0.5">
                  {pricing.mouser?.unitPrice || 'N/A'}
                </span>
                <span className="text-[10px] text-slate-500 font-sans block">
                  {pricing.mouser?.tier100 ? `100+: ${pricing.mouser.tier100}` : (pricing.mouser?.stockStatus || 'US Stock')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Advantages & Design Cautions */}
        {/* Passive Component Priority Checklist (Resistor: 4 rules, Capacitor: 5 rules) */}
        {candidate.passiveEvaluation && candidate.passiveEvaluation.isPassive && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/70 dark:from-indigo-950/30 dark:via-slate-900 dark:to-blue-950/30 border border-indigo-200 dark:border-indigo-800/60 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                  {candidate.passiveEvaluation.type === 'resistor' ? 'R' : 'C'}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {candidate.passiveEvaluation.type === 'resistor'
                    ? (language === 'vi' ? 'Kiểm Tra 4 Tiêu Chí Ưu Tiên Điện Trở' : 'Resistor 4-Step Priority Checklist')
                    : (language === 'vi' ? 'Kiểm Tra 5 Tiêu Chí Ưu Tiên Tụ Điện' : 'Capacitor 5-Step Priority Checklist')}
                </span>
              </div>

              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                candidate.passiveEvaluation.allCompliant
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {candidate.passiveEvaluation.type === 'resistor'
                    ? (language === 'vi' ? 'Đạt 4/4 Tiêu Chí' : '4/4 Rules Passed')
                    : (language === 'vi' ? 'Đạt 5/5 Tiêu Chí' : '5/5 Rules Passed')}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {candidate.passiveEvaluation.rules.map((rule) => {
                const isVoltageRule = rule.paramKey === 'voltageRated';
                return (
                  <div
                    key={rule.priority}
                    className={`p-2.5 rounded-lg border text-xs ${
                      isVoltageRule
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 sm:col-span-2'
                        : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[10px] font-black">
                          {rule.priority}
                        </span>
                        <span>{language === 'vi' ? rule.paramNameVi : rule.paramNameEn}</span>
                      </span>

                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>{rule.status === 'EXACT_MATCH' ? (language === 'vi' ? 'Khớp đúng' : 'Exact') : (language === 'vi' ? 'Đạt chuẩn' : 'Pass')}</span>
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{language === 'vi' ? 'Gốc:' : 'Orig:'}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{rule.originalValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{language === 'vi' ? 'Thay thế:' : 'Cand:'}</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{rule.candidateValue}</span>
                      </div>
                    </div>

                    <div className="mt-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 font-sans">
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        {language === 'vi' ? rule.ruleDescriptionVi : rule.ruleDescriptionEn}
                      </span>
                      {rule.notesVi && (
                        <span className="block text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          {rule.notesVi}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Advantages */}
          {candidate.advantages && candidate.advantages.length > 0 && (
            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
              <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'vi' ? 'Ưu điểm khi thay thế' : 'Replacement Advantages'}</span>
              </h5>
              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                {candidate.advantages.map((adv, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cautions */}
          {candidate.cautions && candidate.cautions.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
              <h5 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{language === 'vi' ? 'Lưu ý kỹ thuật khi hàn/lắp' : 'Engineering Cautions'}</span>
              </h5>
              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                {candidate.cautions.map((caution, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">!</span>
                    <span>{caution}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Parametric Comparison Specs preview */}
        {candidate.parametricComparison && candidate.parametricComparison.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setShowSpecs(!showSpecs)}
                className="text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5 text-blue-500" />
                <span>
                  {language === 'vi'
                    ? `Bảng Đối Chiếu Thông Số Tương Đương So Với Mã Gốc (${candidate.parametricComparison.length} thông số)`
                    : `Equivalent Parametric Comparison vs Original (${candidate.parametricComparison.length} specs)`}
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold underline text-[11px] ml-1">
                  {showSpecs ? (language === 'vi' ? 'Thu gọn' : 'Collapse') : (language === 'vi' ? 'Mở rộng' : 'Expand')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onOpenPinoutCheck(candidate)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'Kiểm tra sơ đồ chân' : 'Verify Pinout'}</span>
              </button>
            </div>

            {showSpecs && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs shadow-xs">
                {/* Visual guarantee bar */}
                <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400 font-sans">
                    Đối chiếu chi tiết giữa <strong className="font-mono text-slate-800 dark:text-slate-200">{originalPartNumber}</strong> và <strong className="font-mono text-blue-600 dark:text-blue-400">{candidate.partNumber}</strong>
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                    ✓ Khác hãng sản xuất
                  </span>
                </div>

                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800/90 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase">
                    <tr>
                      <th className="py-2 px-3">{language === 'vi' ? 'Thông Số' : 'Spec'}</th>
                      <th className="py-2 px-3">{originalPartNumber} (Gốc)</th>
                      <th className="py-2 px-3 text-blue-600 dark:text-blue-400 font-bold">{candidate.partNumber} (Thay thế)</th>
                      <th className="py-2 px-3 text-right">{language === 'vi' ? 'Đánh Giá' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {candidate.parametricComparison.map((spec, sIdx) => {
                      const specLower = spec.name.toLowerCase();
                      const isVoltage = specLower.includes('voltage') || specLower.includes('điện áp');
                      const isTol = specLower.includes('tolerance') || specLower.includes('sai số');
                      return (
                        <tr key={sIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2 px-3 font-sans font-medium text-slate-700 dark:text-slate-300">
                            {spec.name}
                          </td>
                          <td className="py-2 px-3 text-slate-500">{spec.originalValue}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                            {spec.candidateValue}
                          </td>
                          <td className="py-2 px-3 text-right font-sans">
                            {spec.isMatch ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>{isVoltage ? 'Đạt (≥ Gốc)' : isTol ? 'Đạt (≤ Gốc)' : 'Khớp đúng'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                <span>Δ Tương đương</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Distributor Buy / Availability Action Bar (DigiKey, Mouser, LCSC) */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* DigiKey Button */}
            <a
              href={candidate.digikeySearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-transform active:scale-95"
            >
              <span>DigiKey</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Mouser Button */}
            <a
              href={candidate.mouserSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-transform active:scale-95"
            >
              <span>Mouser</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Datasheet Link */}
            <a
              href={getDatasheetUrl(candidate.partNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <FileText className="w-3 h-3 text-slate-400" />
              <span>Datasheet</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleCompare(candidate)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isSelectedForCompare
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>
                {isSelectedForCompare
                  ? language === 'vi'
                    ? 'Đang so sánh'
                    : 'Comparing'
                  : language === 'vi'
                    ? 'Thêm vào so sánh'
                    : 'Compare'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
