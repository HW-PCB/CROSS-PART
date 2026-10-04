import React, { useState } from 'react';
import { OriginalPartProfile } from '../types/components';
import { formatLifecycleBadge, getDatasheetUrl, getOctopartUrl } from '../utils/distributorLinks';
import { ExternalLink, Copy, Check, FileText, AlertTriangle, Cpu, Radio } from 'lucide-react';

interface OriginalPartCardProps {
  part: OriginalPartProfile;
  language: 'vi' | 'en';
}

export const OriginalPartCard: React.FC<OriginalPartCardProps> = ({ part, language }) => {
  const [copied, setCopied] = useState(false);
  const [showAllPins, setShowAllPins] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(part.partNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lifecycle = formatLifecycleBadge(part.lifecycleStatus, language);
  const isObsoleteOrEOL = ['EOL', 'OBSOLETE', 'NRND'].includes(part.lifecycleStatus?.toUpperCase() || '');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Banner Alert for EOL parts */}
      {isObsoleteOrEOL && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              {language === 'vi'
                ? `Cảnh báo vòng đời: Linh kiện này có trạng thái "${part.lifecycleStatus}". Việc tìm mã thay thế tương đương trên DigiKey/Mouser là rất cần thiết cho kế hoạch sản xuất lâu dài.`
                : `Lifecycle notice: Part is flagged as "${part.lifecycleStatus}". Cross-referencing modern active replacements is recommended.`}
            </span>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Main Info */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1">
              <span>{language === 'vi' ? 'Linh kiện gốc cần thay thế' : 'Original Target Component'}</span>
              <span>·</span>
              <span>{part.category || 'Semiconductor'}</span>
              {part.subCategory && (
                <>
                  <span>·</span>
                  <span>{part.subCategory}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
                {part.partNumber}
              </h2>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Sao chép mã part / Copy MPN"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {part.manufacturer || 'General Spec'}
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                {part.package || 'Standard Package'}
              </span>
              {part.pinCount ? (
                <>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="text-slate-500">{part.pinCount} Pins</span>
                </>
              ) : null}
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${lifecycle.badgeClass}`}>
                {lifecycle.label}
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {language === 'vi' ? part.descriptionVi : part.descriptionEn || part.descriptionVi}
            </p>

            {/* Passive Priority Rules Callout */}
            {(part.passiveType === 'resistor' || part.category?.toLowerCase().includes('resistor') || part.category?.toLowerCase().includes('điện trở')) && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-bold shrink-0 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">R</span>
                  {language === 'vi' ? 'Tiêu chí ưu tiên chọn Điện trở thay thế:' : 'Resistor priority matching rules:'}
                </span>
                <span className="font-mono text-[11px] text-amber-800 dark:text-amber-300">
                  1. Resistance (Đúng giá trị) ➔ 2. Package (Đúng cỡ) ➔ 3. Tolerance (≤ Gốc) ➔ 4. Temp Range
                </span>
              </div>
            )}

            {(part.passiveType === 'capacitor' || part.category?.toLowerCase().includes('capacitor') || part.category?.toLowerCase().includes('tụ điện')) && (
              <div className="mt-3 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 text-xs text-cyan-900 dark:text-cyan-200 flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-bold shrink-0 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-cyan-600 text-white flex items-center justify-center text-[10px] font-black">C</span>
                  {language === 'vi' ? 'Tiêu chí ưu tiên chọn Tụ điện thay thế:' : 'Capacitor priority matching rules:'}
                </span>
                <span className="font-mono text-[11px] text-cyan-800 dark:text-cyan-300">
                  1. Capacitance (Đúng trị số) ➔ 2. Package (Đúng cỡ) ➔ 3. Voltage (≥ Gốc) ➔ 4. Tolerance (≤ Gốc) ➔ 5. Temp Range
                </span>
              </div>
            )}
          </div>

          {/* Direct Distributor Search Buttons for Original Part */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'vi' ? 'Kiểm tra tồn kho part gốc:' : 'Check original part stock:'}
            </span>
            <div className="flex flex-wrap gap-2">
              <a
                href={part.digikeySearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors"
              >
                <span>DigiKey</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              <a
                href={part.mouserSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
              >
                <span>Mouser</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              <a
                href={getDatasheetUrl(part.partNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <FileText className="w-3 h-3 text-slate-400" />
                <span>Datasheet</span>
              </a>

              <a
                href={getOctopartUrl(part.partNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span>Octopart</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Electrical Specifications Grid */}
        {part.keySpecs && Object.keys(part.keySpecs).length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              <span>{language === 'vi' ? 'Thông số kỹ thuật then chốt (Key Specs)' : 'Key Electrical Specs'}</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {Object.entries(part.keySpecs).map(([key, value]) => (
                <div
                  key={key}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80"
                >
                  <span className="block text-[11px] text-slate-600 dark:text-slate-300 font-semibold truncate" title={key}>
                    {key}
                  </span>
                  <span className="block text-xs font-bold font-mono text-slate-900 dark:text-white mt-0.5 truncate" title={String(value)}>
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pinout Summary (if available) */}
        {part.pinoutSummary && part.pinoutSummary.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-500" />
                <span>{language === 'vi' ? 'Sơ đồ chân cắm chuẩn (Pinout)' : 'Standard Pinout'}</span>
              </h4>
              {part.pinoutSummary.length > 6 && (
                <button
                  onClick={() => setShowAllPins(!showAllPins)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {showAllPins
                    ? language === 'vi'
                      ? 'Thu gọn'
                      : 'Show less'
                    : language === 'vi'
                      ? `Xem tất cả ${part.pinoutSummary.length} chân`
                      : `View all ${part.pinoutSummary.length} pins`}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {(showAllPins ? part.pinoutSummary : part.pinoutSummary.slice(0, 6)).map((pin, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs font-mono"
                >
                  <span className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold flex items-center justify-center text-[11px] shrink-0">
                    {pin.pin}
                  </span>
                  <span className="truncate text-slate-700 dark:text-slate-300 font-medium" title={pin.function}>
                    {pin.function}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
