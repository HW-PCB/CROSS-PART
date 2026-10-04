import React from 'react';
import { ReplacementCandidate } from '../types/components';
import { formatCompatibilityLabel, formatLifecycleBadge } from '../utils/distributorLinks';
import { Bookmark, ExternalLink, Trash2, ArrowRight } from 'lucide-react';

interface SavedPartsDrawerProps {
  savedCandidates: { candidate: ReplacementCandidate; originalPart: string; date: string }[];
  onRemoveSaved: (partNumber: string) => void;
  onClearAll: () => void;
  onInspectPart: (partNumber: string) => void;
  language: 'vi' | 'en';
}

export const SavedPartsDrawer: React.FC<SavedPartsDrawerProps> = ({
  savedCandidates,
  onRemoveSaved,
  onClearAll,
  onInspectPart,
  language,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-600" />
            <span>
              {language === 'vi' ? 'Danh Sách Linh Kiện Đã Lưu' : 'Saved Components'}
            </span>
            <span className="text-xs font-mono font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full ml-1">
              {savedCandidates.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'vi'
              ? 'Lưu trữ các phương án thay thế tiềm năng để đối chiếu và đặt hàng trên DigiKey/Mouser.'
              : 'Potential replacement candidates saved for procurement review.'}
          </p>
        </div>

        {savedCandidates.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Xóa tất cả' : 'Clear All'}</span>
          </button>
        )}
      </div>

      {savedCandidates.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
          <Bookmark className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
            {language === 'vi' ? 'Chưa có linh kiện nào được lưu' : 'No saved components yet'}
          </h4>
          <p className="text-xs mt-1 text-slate-400 max-w-sm mx-auto">
            {language === 'vi'
              ? 'Khi tra cứu linh kiện, nhấn biểu tượng bookmark (đánh dấu) trên các part thay thế để lưu lại tại đây.'
              : 'Click the bookmark icon on any alternative component card to save it for quick reference.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedCandidates.map(({ candidate, originalPart, date }) => {
            const typeConfig = formatCompatibilityLabel(candidate.replacementType, language);
            const lifecycle = formatLifecycleBadge(candidate.lifecycleStatus, language);

            return (
              <div
                key={candidate.partNumber}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeConfig.badgeClass}`}>
                      {typeConfig.title}
                    </span>
                    <button
                      onClick={() => onRemoveSaved(candidate.partNumber)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                      title="Xóa khỏi danh sách lưu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <h3 className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {candidate.partNumber}
                    </h3>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {candidate.compatibilityScore}%
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mt-0.5">
                    <span>{candidate.manufacturer}</span> · <span>{candidate.package}</span>
                  </div>

                  <div className="mt-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {language === 'vi' ? 'Thay thế cho part: ' : 'Alternative for: '}
                    </span>
                    <button
                      onClick={() => onInspectPart(originalPart)}
                      className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {originalPart}
                    </button>
                  </div>
                </div>

                {/* Bottom Action buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <a
                      href={candidate.digikeySearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1"
                    >
                      <span>DigiKey</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <a
                      href={candidate.mouserSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1"
                    >
                      <span>Mouser</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  <button
                    onClick={() => onInspectPart(originalPart)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>{language === 'vi' ? 'Xem lại' : 'View'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
