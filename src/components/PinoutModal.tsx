import React, { useState, useEffect } from 'react';
import { ReplacementCandidate, PinoutComparisonResult } from '../types/components';
import { X, CheckCircle, AlertTriangle, Layers, Loader2, Radio } from 'lucide-react';

interface PinoutModalProps {
  originalPartNumber: string;
  candidate: ReplacementCandidate | null;
  onClose: () => void;
  language: 'vi' | 'en';
}

export const PinoutModal: React.FC<PinoutModalProps> = ({
  originalPartNumber,
  candidate,
  onClose,
  language,
}) => {
  const [data, setData] = useState<PinoutComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!candidate) return;

    let isMounted = true;
    const fetchPinout = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/pinout-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalPart: originalPartNumber,
            candidatePart: candidate.partNumber,
          }),
        });

        if (!res.ok) throw new Error('Không thể tải thông tin pinout');
        const json = await res.json();
        if (isMounted) {
          setData(json.data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Lỗi kiểm tra pinout');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPinout();

    return () => {
      isMounted = false;
    };
  }, [originalPartNumber, candidate]);

  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'vi' ? 'Kiểm Tra Sơ Đồ Chân Cắm (Pinout Verification)' : 'Pinout & Footprint Verification'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {originalPartNumber} ➔ {candidate.partNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-medium">
                {language === 'vi'
                  ? 'Đang so khớp sơ đồ chân và footprint linh kiện...'
                  : 'Analyzing pinout mapping and PCB compatibility...'}
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {data && !loading && (
            <>
              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  data.isPinToPinDropIn
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                }`}
              >
                {data.isPinToPinDropIn ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {data.isPinToPinDropIn
                      ? language === 'vi'
                        ? '100% Khớp Chân (Pin-to-Pin Drop-In)!'
                        : '100% Pin-to-Pin Drop-in Compatible!'
                      : language === 'vi'
                        ? 'Cần chú ý sơ đồ chân hoặc chân chức năng đặc thù'
                        : 'Notice: Review pin functions & passive circuitry'}
                  </h4>
                  <p className="text-xs mt-1 leading-relaxed">{data.verdictVi}</p>
                </div>
              </div>

              {/* Pin Mapping Table */}
              {data.pinComparison && data.pinComparison.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-blue-500" />
                    <span>{language === 'vi' ? 'Bảng đối chiếu từng chân (Pin-by-Pin Mapping)' : 'Pin-by-Pin Mapping'}</span>
                  </h5>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                    <table className="w-full text-left font-mono">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Pin #</th>
                          <th className="py-2.5 px-3">{originalPartNumber}</th>
                          <th className="py-2.5 px-3">{candidate.partNumber}</th>
                          <th className="py-2.5 px-3 text-right">Khớp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.pinComparison.map((pin, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300">
                              {pin.pinNumber}
                            </td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                              {pin.originalPinFunction}
                            </td>
                            <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                              {pin.candidatePinFunction}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {pin.isIdentical ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                              ) : (
                                <span className="text-amber-600 dark:text-amber-400 font-bold" title={pin.note}>
                                  ⚠
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Circuit Modification Notice */}
              {data.circuitModificationsNoticeVi && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    {language === 'vi' ? 'Lưu ý sửa đổi mạch (nếu có):' : 'PCB & Circuit adjustments note:'}
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {data.circuitModificationsNoticeVi}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs transition-colors"
          >
            {language === 'vi' ? 'Đã hiểu & Đóng' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
