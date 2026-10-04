import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  X,
  HelpCircle,
} from 'lucide-react';

interface PassiveComponentRulesGuideProps {
  language: 'vi' | 'en';
  onSelectSample?: (mpn: string) => void;
}

export const PassiveComponentRulesGuide: React.FC<PassiveComponentRulesGuideProps> = ({
  language,
  onSelectSample,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button / Quick Summary Bar */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl p-4 sm:p-5 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {language === 'vi'
                    ? 'Quy Tắc Ưu Tiên Tìm Điện Trở & Tụ Điện Tương Đương'
                    : 'Priority Rules for Equivalent Resistors & Capacitors'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                  Chuẩn Kỹ Thuật
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                {language === 'vi'
                  ? 'R: 1.Resistance (đúng) ➔ 2.Package (đúng) ➔ 3.Tolerance (≤) ➔ 4.Temp | C: 1.Capacitance (đúng) ➔ 2.Package (đúng) ➔ 3.Voltage (≥) ➔ 4.Tolerance (≤) ➔ 5.Temp'
                  : 'R: 1.Resistance (exact) ➔ 2.Package (exact) ➔ 3.Tolerance (≤) ➔ 4.Temp | C: 1.Capacitance (exact) ➔ 2.Package (exact) ➔ 3.Voltage (≥) ➔ 4.Tolerance (≤) ➔ 5.Temp'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            {onSelectSample && (
              <>
                <button
                  type="button"
                  onClick={() => onSelectSample('RC0603FR-0710KL')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-2xs font-mono"
                  title="Điện trở 10k 0603 1%"
                >
                  ⚡ Mẫu R (10k 0603)
                </button>
                <button
                  type="button"
                  onClick={() => onSelectSample('CC0603KRX7R9BB104')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-2xs font-mono"
                  title="Tụ gốm 100nF 50V 0603"
                >
                  ⚡ Mẫu C (100nF 50V)
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Xem Chi Tiết' : 'View Guide'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">
                    {language === 'vi'
                      ? 'Tiêu Chuẩn Ưu Tiên: Tìm Điện Trở & Tụ Điện Tương Đương'
                      : 'Engineering Priority Rules for Resistor & Capacitor Equivalents'}
                  </h3>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    {language === 'vi'
                      ? 'Bộ quy tắc kỹ thuật phần cứng cho Cross-Reference linh kiện thụ động'
                      : 'Hardware engineering rules for cross-referencing passive components'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300">
              {/* Section A: Điện trở */}
              <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center text-xs font-black">
                      A
                    </span>
                    {language === 'vi' ? 'Điện Trở (Resistor) - Sắp Xếp Theo Thứ Tự Ưu Tiên' : 'Resistors - Ordered Priority Rules'}
                  </h4>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                    4 Tiêu Chí Bắt Buộc
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                      <span className="font-bold text-slate-900 dark:text-white">Resistance (Trị số điện trở)</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      🎯 <strong className="text-emerald-700 dark:text-emerald-400">Tìm ĐÚNG giá trị</strong> (Exact match). Ví dụ: 10 kΩ bắt buộc phải thay bằng đúng 10 kΩ để đảm bảo phân áp và định dòng.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                      <span className="font-bold text-slate-900 dark:text-white">Package / Case (Đóng gói)</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      📐 <strong className="text-emerald-700 dark:text-emerald-400">Tìm ĐÚNG kích thước</strong> (Exact Footprint). Ví dụ: 0603, 0805, 0402, 1206... phải khớp hoàn toàn pad hàn PCB.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                      <span className="font-bold text-slate-900 dark:text-white">Tolerance (Sai số)</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      ⚖️ <strong className="text-emerald-700 dark:text-emerald-400">Bằng hoặc THẤP HƠN</strong> (≤ Gốc). Ví dụ: Bản gốc 5% có thể thay bằng 5%, 1%, 0.5% hoặc 0.1% (càng nhỏ càng chính xác!).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">4</span>
                      <span className="font-bold text-slate-900 dark:text-white">Operating Temperature</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      🌡️ <strong className="text-emerald-700 dark:text-emerald-400">Tương đương hoặc rộng hơn</strong> (-55°C ~ +125°C hoặc +155°C cho chuẩn ô tô/công nghiệp AEC-Q200).
                    </p>
                  </div>
                </div>

                <div className="text-xs bg-amber-100/60 dark:bg-amber-900/40 p-2.5 rounded-lg text-amber-900 dark:text-amber-200">
                  💡 <strong>Lưu ý công suất (Power Rating):</strong> Công suất định mức của điện trở thay thế phải <strong>bằng hoặc lớn hơn</strong> bản gốc (ví dụ: gốc 1/10W có thể thay bằng 1/10W hoặc 1/8W).
                </div>
              </div>

              {/* Section B: Tụ điện */}
              <div className="p-5 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-cyan-900 dark:text-cyan-300 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-cyan-600 text-white flex items-center justify-center text-xs font-black">
                      B
                    </span>
                    {language === 'vi' ? 'Tụ Điện (Capacitor) - Sắp Xếp Theo Thứ Tự Ưu Tiên' : 'Capacitors - Ordered Priority Rules'}
                  </h4>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-200/60 dark:bg-cyan-900/60 text-cyan-900 dark:text-cyan-200">
                    5 Tiêu Chí Bắt Buộc
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-cyan-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                      <span className="font-bold text-slate-900 dark:text-white">Capacitance (Điện dung)</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      🎯 <strong className="text-emerald-700 dark:text-emerald-400">Tìm ĐÚNG giá trị</strong> (Exact match). Ví dụ: 100nF (0.1µF) phải thay đúng 100nF để đảm bảo tần số cắt lọc nhiễu.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-cyan-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                      <span className="font-bold text-slate-900 dark:text-white">Package / Case (Đóng gói)</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      📐 <strong className="text-emerald-700 dark:text-emerald-400">Tìm ĐÚNG kích thước</strong> (Exact Footprint). Ví dụ: 0603, 0805, 1206 hoặc tụ hóa Radial Can 10x20mm bước chân 5mm.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-cyan-900/40 sm:col-span-2 bg-gradient-to-r from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                      <span className="font-bold text-slate-900 dark:text-white">Voltage – Rated (Điện áp định mức VDC)</span>
                      <span className="ml-auto text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                        QUY TẮC SỐNG CÒN
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      ⚡ <strong className="text-emerald-700 dark:text-emerald-400">Bằng hoặc CAO HƠN giá trị gốc</strong> (≥ Original Voltage). Ví dụ: Bản gốc 16V CÓ THỂ thay bằng 16V, 25V, 35V, 50V... Tuyệt đối KHÔNG ĐƯỢC dùng điện áp thấp hơn (như 10V, 6.3V) vì tụ sẽ bị đánh thủng điện môi và phát nổ!
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-cyan-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">4</span>
                      <span className="font-bold text-slate-900 dark:text-white">Tolerance (Sai số)</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      ⚖️ <strong className="text-emerald-700 dark:text-emerald-400">Bằng hoặc THẤP HƠN</strong> (≤ Gốc). Ví dụ: Gốc ±20% có thể thay bằng ±20%, ±10% hoặc ±5%.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-cyan-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">5</span>
                      <span className="font-bold text-slate-900 dark:text-white">Operating Temperature</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      🌡️ <strong className="text-emerald-700 dark:text-emerald-400">Tương đương hoặc rộng hơn</strong> (-55°C ~ +125°C cho chuẩn điện môi X7R; 105°C cho tụ hóa nhôm).
                    </p>
                  </div>
                </div>

                <div className="text-xs bg-cyan-100/60 dark:bg-cyan-900/40 p-2.5 rounded-lg text-cyan-900 dark:text-cyan-200">
                  💡 <strong>Lưu ý chất điện môi (Dielectric):</strong> Tụ gốm MLCC nên ưu tiên chất điện môi <strong>X7R</strong> (hoặc C0G/NP0 cho mạch RF/dao động cao tần) thay vì Y5V có độ sụt áp DC-bias lớn.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                CrossPart AI tự động kiểm tra và đánh giá các tiêu chí này trên từng mã part thay thế.
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs hover:opacity-90 transition-opacity"
              >
                {language === 'vi' ? 'Đã Hiểu' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
