import React, { useState } from 'react';
import {
  Zap,
  ShieldCheck,
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
                  {language === 'vi' ? 'Chuẩn Kỹ Thuật' : 'Engineering Standard'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                {language === 'vi'
                  ? 'R: 1. Trị số R (đúng) ➔ 2. Kích thước (đúng) ➔ 3. Sai số (≤ Gốc) ➔ 4. Nhiệt độ | C: 1. Điện dung (đúng) ➔ 2. Kích thước (đúng) ➔ 3. Điện áp (≥ Gốc) ➔ 4. Sai số (≤ Gốc) ➔ 5. Nhiệt độ'
                  : 'R: 1. Resistance (exact) ➔ 2. Package (exact) ➔ 3. Tolerance (≤ Orig) ➔ 4. Temp | C: 1. Capacitance (exact) ➔ 2. Package (exact) ➔ 3. Voltage (≥ Orig) ➔ 4. Tolerance (≤ Orig) ➔ 5. Temp'}
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
                  title={language === 'vi' ? 'Điện trở 10k 0603 1%' : '10k 0603 1% Resistor'}
                >
                  {language === 'vi' ? '⚡ Mẫu R (10k 0603)' : '⚡ Sample R (10k 0603)'}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectSample('CC0603KRX7R9BB104')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-2xs font-mono"
                  title={language === 'vi' ? 'Tụ gốm 100nF 50V 0603' : '100nF 50V 0603 MLCC'}
                >
                  {language === 'vi' ? '⚡ Mẫu C (100nF 50V)' : '⚡ Sample C (100nF 50V)'}
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
                      ? 'Bộ quy tắc kỹ thuật phần cứng cho tra cứu linh kiện thụ động'
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
                    {language === 'vi' ? '4 Tiêu Chí Bắt Buộc' : '4 Mandatory Rules'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {language === 'vi' ? 'Resistance (Trị số điện trở)' : 'Resistance Value'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      🎯 <strong className="text-emerald-700 dark:text-emerald-400">
                        {language === 'vi' ? 'Tìm ĐÚNG giá trị (Exact match)' : 'Exact match required'}
                      </strong>. {language === 'vi'
                        ? 'Ví dụ: 10 kΩ bắt buộc phải thay bằng đúng 10 kΩ để đảm bảo phân áp và định dòng.'
                        : 'E.g., 10 kΩ must be replaced with exactly 10 kΩ to maintain voltage divider and bias.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {language === 'vi' ? 'Package / Case (Kích thước)' : 'Package / Footprint'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      📐 <strong className="text-emerald-700 dark:text-emerald-400">
                        {language === 'vi' ? 'Tìm ĐÚNG kích thước (Exact Footprint)' : 'Exact footprint required'}
                      </strong>. {language === 'vi'
                        ? 'Ví dụ: 0603, 0805, 0402, 1206... phải khớp hoàn toàn pad hàn PCB.'
                        : 'E.g., 0603, 0805, 0402, 1206... must match PCB pads exactly.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {language === 'vi' ? 'Tolerance (Sai số)' : 'Tolerance'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      ⚖️ <strong className="text-emerald-700 dark:text-emerald-400">
                        {language === 'vi' ? 'Bằng hoặc THẤP HƠN (≤ Gốc)' : 'Equal or LOWER (≤ Original)'}
                      </strong>. {language === 'vi'
                        ? 'Ví dụ: Bản gốc 5% có thể thay bằng 5%, 1%, 0.5% hoặc 0.1%.'
                        : 'E.g., 5% original can be replaced with 5%, 1%, 0.5%, or 0.1%.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">4</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {language === 'vi' ? 'Operating Temperature (Nhiệt độ)' : 'Operating Temperature'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      🌡️ <strong className="text-emerald-700 dark:text-emerald-400">
                        {language === 'vi' ? 'Tương đương hoặc rộng hơn' : 'Equivalent or wider'}
                      </strong> {language === 'vi'
                        ? '(-55°C ~ +125°C hoặc +155°C cho chuẩn ô tô AEC-Q200).'
                        : '(-55°C ~ +125°C or +155°C for automotive AEC-Q200).'}
                    </p>
                  </div>
                </div>

                <div className="text-xs bg-amber-100/60 dark:bg-amber-900/40 p-2.5 rounded-lg text-amber-900 dark:text-amber-200">
                  {language === 'vi'
                    ? '💡 Lưu ý công suất: Công suất định mức của điện trở thay thế phải bằng hoặc lớn hơn bản gốc (ví dụ: gốc 1/10W có thể thay bằng 1/10W hoặc 1/8W).'
                    : '💡 Power rating note: The power rating of replacement resistor must be equal to or higher than original (e.g., 1/10W can be replaced with 1/10W or 1/8W).'}
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
                    {language === 'vi' ? '5 Tiêu Chí Bắt Buộc' : '5 Mandatory Rules'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-cyan-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {language === 'vi' ? 'Capacitance (Điện dung)' : 'Capacitance Value'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      🎯 <strong className="text-emerald-700 dark:text-emerald-400">
                        {language === 'vi' ? 'Tìm ĐÚNG giá trị (Exact match)' : 'Exact match required'}
                      </strong>. {language === 'vi'
                        ? 'Ví dụ: 100nF (0.1µF) phải thay đúng 100nF để đảm bảo tần số cắt lọc nhiễu.'
                        : 'E.g., 100nF (0.1µF) must be replaced with exactly 100nF to preserve filter frequency.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-cyan-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {language === 'vi' ? 'Package / Case (Kích thước)' : 'Package / Footprint'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      📐 <strong className="text-emerald-700 dark:text-emerald-400">
                        {language === 'vi' ? 'Tìm ĐÚNG kích thước (Exact Footprint)' : 'Exact footprint required'}
                      </strong>. {language === 'vi'
                        ? 'Ví dụ: 0603, 0805, 1206 hoặc tụ hóa Radial Can 10x20mm.'
                        : 'E.g., 0603, 0805, 1206 or Radial Can 10x20mm.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-cyan-900/40 sm:col-span-2 bg-gradient-to-r from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {language === 'vi' ? 'Voltage – Rated (Điện áp định mức)' : 'Rated Voltage (VDC)'}
                      </span>
                      <span className="ml-auto text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                        {language === 'vi' ? 'QUY TẮC BẮT BUỘC' : 'CRITICAL RULE'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      ⚡ <strong className="text-emerald-700 dark:text-emerald-400">
                        {language === 'vi' ? 'Bằng hoặc CAO HƠN giá trị gốc (≥ Gốc)' : 'Equal or HIGHER than original (≥ Original)'}
                      </strong>. {language === 'vi'
                        ? 'Ví dụ: Bản gốc 16V CÓ THỂ thay bằng 16V, 25V, 35V, 50V... Tuyệt đối KHÔNG DÙNG điện áp thấp hơn (như 10V, 6.3V) vì tụ sẽ bị đánh thủng điện môi!'
                        : 'E.g., 16V original CAN be replaced with 16V, 25V, 35V, 50V... Never use lower voltage (e.g. 10V, 6.3V) as dielectric breakdown will occur!'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-cyan-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">4</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {language === 'vi' ? 'Tolerance (Sai số)' : 'Tolerance'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      ⚖️ <strong className="text-emerald-700 dark:text-emerald-400">
                        {language === 'vi' ? 'Bằng hoặc THẤP HƠN (≤ Gốc)' : 'Equal or LOWER (≤ Original)'}
                      </strong>. {language === 'vi'
                        ? 'Ví dụ: Gốc ±20% có thể thay bằng ±20%, ±10% hoặc ±5%.'
                        : 'E.g., ±20% original can be replaced with ±20%, ±10%, or ±5%.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-cyan-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">5</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {language === 'vi' ? 'Operating Temperature (Nhiệt độ)' : 'Operating Temperature'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 font-medium">
                      🌡️ <strong className="text-emerald-700 dark:text-emerald-400">
                        {language === 'vi' ? 'Tương đương hoặc rộng hơn' : 'Equivalent or wider'}
                      </strong> {language === 'vi'
                        ? '(-55°C ~ +125°C cho chuẩn điện môi X7R; 105°C cho tụ hóa).'
                        : '(-55°C ~ +125°C for X7R dielectric; 105°C for aluminum electrolytic).'}
                    </p>
                  </div>
                </div>

                <div className="text-xs bg-cyan-100/60 dark:bg-cyan-900/40 p-2.5 rounded-lg text-cyan-900 dark:text-cyan-200">
                  {language === 'vi'
                    ? '💡 Lưu ý chất điện môi: Tụ gốm MLCC nên ưu tiên chất điện môi X7R (hoặc C0G/NP0 cho mạch RF/dao động cao tần) thay vì Y5V có độ sụt áp DC-bias lớn.'
                    : '💡 Dielectric note: MLCC capacitors should prioritize X7R dielectric (or C0G/NP0 for high-frequency RF) over Y5V due to large DC-bias derating.'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {language === 'vi'
                  ? 'Hệ thống tự động kiểm tra và đánh giá các tiêu chí này trên từng mã linh kiện thay thế.'
                  : 'The system automatically checks and rates these criteria on each candidate part.'}
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
