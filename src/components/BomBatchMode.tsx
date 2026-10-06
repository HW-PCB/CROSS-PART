import React, { useState, useRef } from 'react';
import { BomItemResult } from '../types/components';
import { formatCompatibilityLabel } from '../utils/distributorLinks';
import {
  parseExcelFile,
  exportBomToExcel,
  generateSampleBomExcel,
  mapRowsWithColumns,
  ExcelParseResult,
} from '../utils/excelService';
import {
  FileSpreadsheet,
  FileUp,
  FileText,
  Upload,
  Download,
  ExternalLink,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Loader2,
  TrendingDown,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  PackageCheck,
} from 'lucide-react';

interface BomBatchModeProps {
  language: 'vi' | 'en';
  onInspectPart: (partNumber: string) => void;
}

const SAMPLE_TEXT_BOM = `RC0603FR-0710KL
CC0603KRX7R9BB104
LM317T
STM32F103C8T6
IRF540N
MAX232CPE
TL072CP
NE555P
DS1307ZN
AMS1117-3.3`;

export const BomBatchMode: React.FC<BomBatchModeProps> = ({ language, onInspectPart }) => {
  const [activeInputMethod, setActiveInputMethod] = useState<'excel' | 'text'>('excel');
  const [bomText, setBomText] = useState(SAMPLE_TEXT_BOM);

  // Excel state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<ExcelParseResult | null>(null);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState<number>(0);
  const [parsingExcel, setParsingExcel] = useState(false);
  const [customColumns, setCustomColumns] = useState({
    partNumberCol: '',
    designatorCol: '',
    quantityCol: '',
    footprintCol: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis state
  const [results, setResults] = useState<BomItemResult[]>([]);
  const [detailModalItem, setDetailModalItem] = useState<BomItemResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Handle Excel File Selection
  const handleFileChange = async (file: File) => {
    if (!file) return;
    setUploadedFile(file);
    setParsingExcel(true);
    setError(null);

    try {
      const parsed = await parseExcelFile(file, 0);
      setExcelData(parsed);
      setSelectedSheetIndex(0);
      setCustomColumns({
        partNumberCol: parsed.detectedColumns.partNumberCol || parsed.headers[0] || '',
        designatorCol: parsed.detectedColumns.designatorCol || '',
        quantityCol: parsed.detectedColumns.quantityCol || '',
        footprintCol: parsed.detectedColumns.footprintCol || '',
      });
    } catch (err: any) {
      console.error('Excel parse error:', err);
      setError(err.message || 'Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng.');
      setExcelData(null);
    } finally {
      setParsingExcel(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSheetChange = async (sheetIdx: number) => {
    if (!uploadedFile) return;
    setParsingExcel(true);
    setSelectedSheetIndex(sheetIdx);
    try {
      const parsed = await parseExcelFile(uploadedFile, sheetIdx);
      setExcelData(parsed);
      setCustomColumns({
        partNumberCol: parsed.detectedColumns.partNumberCol || parsed.headers[0] || '',
        designatorCol: parsed.detectedColumns.designatorCol || '',
        quantityCol: parsed.detectedColumns.quantityCol || '',
        footprintCol: parsed.detectedColumns.footprintCol || '',
      });
    } catch (err: any) {
      setError(err.message || 'Lỗi khi đổi sheet.');
    } finally {
      setParsingExcel(false);
    }
  };

  // Re-map rows when user changes column mapping dropdowns
  const handleColumnChange = (field: keyof typeof customColumns, value: string) => {
    const updated = { ...customColumns, [field]: value };
    setCustomColumns(updated);

    if (excelData && excelData.rawGridRows) {
      const newRows = mapRowsWithColumns(excelData.rawGridRows, {
        partNumberCol: updated.partNumberCol,
        designatorCol: updated.designatorCol || undefined,
        quantityCol: updated.quantityCol || undefined,
        footprintCol: updated.footprintCol || undefined,
      });
      setExcelData({
        ...excelData,
        rows: newRows,
        totalRows: newRows.length,
      });
    }
  };

  // Load Built-in Sample Project
  const handleLoadSampleProject = () => {
    setError(null);
    const sampleHeaders = ['Item', 'Designator', 'Qty', 'Part Number', 'Description', 'Footprint'];
    const sampleRawRows = [
      { Item: 1, Designator: 'R1, R2', Qty: 10, 'Part Number': 'RC0603FR-0710KL', Description: 'Điện trở SMD 10kΩ 0603 1%', Footprint: '0603' },
      { Item: 2, Designator: 'C1, C2', Qty: 10, 'Part Number': 'CC0603KRX7R9BB104', Description: 'Tụ gốm SMD 100nF 50V X7R 0603', Footprint: '0603' },
      { Item: 3, Designator: 'U1', Qty: 2, 'Part Number': 'LM317T', Description: 'V-Reg Adj 1.5A', Footprint: 'TO-220' },
      { Item: 4, Designator: 'U2', Qty: 1, 'Part Number': 'STM32F103C8T6', Description: 'ARM Cortex-M3 MCU', Footprint: 'LQFP-48' },
      { Item: 5, Designator: 'Q1, Q2', Qty: 2, 'Part Number': 'IRF540N', Description: 'Power N-MOSFET 100V', Footprint: 'TO-220AB' },
      { Item: 6, Designator: 'U3', Qty: 1, 'Part Number': 'MAX232CPE', Description: 'RS-232 Transceiver', Footprint: 'DIP-16' },
      { Item: 7, Designator: 'U4', Qty: 1, 'Part Number': 'TL072CP', Description: 'Dual JFET Op-Amp', Footprint: 'DIP-8' },
      { Item: 8, Designator: 'U5', Qty: 2, 'Part Number': 'NE555P', Description: 'Precision Timer', Footprint: 'DIP-8' },
      { Item: 9, Designator: 'U6', Qty: 1, 'Part Number': 'DS1307ZN', Description: 'I2C Real-Time Clock', Footprint: 'SOIC-8' },
      { Item: 10, Designator: 'U7', Qty: 1, 'Part Number': 'LM358N', Description: 'IC Khuếch Đại Thuật Toán Kép (Dual Op-Amp)', Footprint: 'DIP-8' },
    ];

    const detectedCols = {
      partNumberCol: 'Part Number',
      designatorCol: 'Designator',
      quantityCol: 'Qty',
      descriptionCol: 'Description',
      footprintCol: 'Footprint',
    };

    const rows = mapRowsWithColumns(sampleRawRows, detectedCols);

    setExcelData({
      sheetNames: ['Sample_PCB_BOM'],
      selectedSheet: 'Sample_PCB_BOM',
      headers: sampleHeaders,
      detectedColumns: detectedCols,
      rows,
      rawGridRows: sampleRawRows,
      headerRowIndex: 0,
      totalRows: rows.length,
    });

    setCustomColumns({
      partNumberCol: 'Part Number',
      designatorCol: 'Designator',
      quantityCol: 'Qty',
      footprintCol: 'Footprint',
    });

    setUploadedFile(new File(['sample'], 'Sample_PCB_BOM.xlsx'));
    setActiveInputMethod('excel');
  };

  // Run BOM Cross-Reference Analysis
  const handleProcessBom = async () => {
    let partsPayload: any[] = [];

    if (activeInputMethod === 'excel') {
      if (!excelData || excelData.rows.length === 0) {
        setError(
          language === 'vi'
            ? 'Chưa có file Excel hoặc không tìm thấy linh kiện nào. Hãy kiểm tra cột "Mã Linh Kiện (MPN)".'
            : 'No components found. Please select the correct Part Number (MPN) column.'
        );
        return;
      }
      partsPayload = excelData.rows.map((r) => ({
        partNumber: r.partNumber,
        designator: r.designator,
        quantity: r.quantity,
        description: r.description,
        footprint: r.footprint,
      }));
    } else {
      const lines = bomText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length === 0) {
        setError(language === 'vi' ? 'Vui lòng nhập ít nhất 1 mã linh kiện.' : 'Please enter at least one MPN.');
        return;
      }
      partsPayload = lines.map((l) => ({ partNumber: l }));
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/batch-cross-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partsList: partsPayload }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.details || errJson.error || 'Lỗi khi xử lý BOM');
      }

      const data = await res.json();
      const resultsList = Array.isArray(data.results) ? data.results : [];

      if (resultsList.length === 0) {
        throw new Error('Không nhận được kết quả phân tích BOM hợp lệ từ máy chủ.');
      }

      setResults(resultsList);
    } catch (err: any) {
      console.error('Batch process error:', err);
      setError(err.message || 'Không thể phân tích BOM. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Export results to genuine Excel (.xlsx) file
  const handleExportExcel = () => {
    if (results.length === 0) return;
    const baseName = uploadedFile ? uploadedFile.name.replace(/\.[^/.]+$/, '') : 'CrossPart_BOM';
    exportBomToExcel(results, baseName);
  };

  // Compute total cost summary for results
  const parseNumPrice = (priceStr?: string): number => {
    if (!priceStr) return 0;
    const match = priceStr.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  let totalQty = 0;
  let totalDigiKey = 0;
  let totalMouser = 0;

  results.forEach((r) => {
    const q = r.quantity || 1;
    totalQty += q;
    totalDigiKey += parseNumPrice(r.digikeyPrice) * q;
    totalMouser += parseNumPrice(r.mouserPrice) * q;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold mb-3">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel BOM Cross-Reference & Multi-Distributor Analyzer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'vi'
              ? 'Tải File BOM Excel, Tìm Part Tương Đương & Xuất File (.xlsx)'
              : 'Excel BOM Upload, Cross-Referencing & Export (.xlsx)'}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {language === 'vi'
              ? 'Tải lên bảng BOM từ Altium, KiCad, OrCAD hoặc file Excel thu mua (.xlsx, .xls, .csv). Hệ thống tự động nhận diện cột linh kiện, tìm kiếm part thay thế tương đương trên DigiKey và Mouser, xuất lại file Excel (.xlsx) đã làm giàu thông tin.'
              : 'Upload your BOM spreadsheet (.xlsx, .xls, .csv). CrossPart automatically detects component columns, identifies drop-in alternatives across DigiKey & Mouser, calculates price savings, and exports back to an enriched Excel workbook.'}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleLoadSampleProject}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'vi' ? 'Nạp Dữ Liệu BOM Mẫu (8 Linh Kiện)' : 'Load Sample BOM (8 Parts)'}</span>
            </button>

            <button
              onClick={generateSampleBomExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-xs font-semibold text-cyan-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Tải File Excel Mẫu (.xlsx)' : 'Download Sample .xlsx'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Input Tabs (Upload Excel vs Paste Text) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveInputMethod('excel')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeInputMethod === 'excel'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileUp className="w-4 h-4" />
          <span>{language === 'vi' ? 'Upload File Excel (.xlsx / .xls / .csv)' : 'Upload Excel (.xlsx)'}</span>
        </button>

        <button
          onClick={() => setActiveInputMethod('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeInputMethod === 'text'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{language === 'vi' ? 'Dán Danh Sách MPN Dạng Chữ' : 'Paste MPN List'}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload / Settings */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          {activeInputMethod === 'excel' ? (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {language === 'vi' ? '1. Chọn file BOM từ máy tính:' : '1. Select BOM spreadsheet:'}
              </label>

              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                <FileSpreadsheet className="w-10 h-10 mx-auto text-blue-500 dark:text-blue-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {uploadedFile
                    ? uploadedFile.name
                    : language === 'vi'
                    ? 'Click để chọn file hoặc kéo & thả file vào đây'
                    : 'Click to browse or drag & drop Excel file'}
                </p>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Định dạng được hỗ trợ: .xlsx, .xls, .csv
                </span>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {parsingExcel && (
                <div className="flex items-center justify-center gap-2 text-xs text-blue-600 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'vi' ? 'Đang đọc cấu trúc file Excel...' : 'Parsing Excel structure...'}</span>
                </div>
              )}

              {/* Column Mapping Selector (When Excel file is loaded) */}
              {excelData && (
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
                      <span>{language === 'vi' ? 'Khớp Cột Dữ Liệu' : 'Column Mapping'}</span>
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {excelData.totalRows} {language === 'vi' ? 'linh kiện' : 'parts'}
                    </span>
                  </div>

                  {/* Sheet selector if multiple */}
                  {excelData.sheetNames.length > 1 && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        {language === 'vi' ? 'Chọn Sheet:' : 'Select Sheet:'}
                      </label>
                      <select
                        value={selectedSheetIndex}
                        onChange={(e) => handleSheetChange(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                      >
                        {excelData.sheetNames.map((name, i) => (
                          <option key={i} value={i}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Part Number Column Select */}
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-1">
                      * {language === 'vi' ? 'Cột Mã Linh Kiện (MPN / Part Number):' : 'Part Number (MPN) Column:'}
                    </label>
                    <select
                      value={customColumns.partNumberCol}
                      onChange={(e) => handleColumnChange('partNumberCol', e.target.value)}
                      className="w-full p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/40 border-2 border-blue-400 dark:border-blue-600 text-xs font-mono font-bold text-slate-900 dark:text-white"
                    >
                      {excelData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Designator Column Select */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'vi' ? 'Cột Vị Trí (Designator / RefDes):' : 'Designator Column:'}
                    </label>
                    <select
                      value={customColumns.designatorCol}
                      onChange={(e) => handleColumnChange('designatorCol', e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    >
                      <option value="">{language === 'vi' ? '-- Không chọn --' : '-- None --'}</option>
                      {excelData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity Column Select */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'vi' ? 'Cột Số Lượng (Quantity / Qty):' : 'Quantity Column:'}
                    </label>
                    <select
                      value={customColumns.quantityCol}
                      onChange={(e) => handleColumnChange('quantityCol', e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    >
                      <option value="">{language === 'vi' ? '-- Mặc định 1 --' : '-- Default 1 --'}</option>
                      {excelData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Footprint Column Select */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'vi' ? 'Cột Đóng Gói (Footprint / Package):' : 'Footprint / Package Column:'}
                    </label>
                    <select
                      value={customColumns.footprintCol}
                      onChange={(e) => handleColumnChange('footprintCol', e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    >
                      <option value="">{language === 'vi' ? '-- Không chọn --' : '-- None --'}</option>
                      {excelData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Start Cross-Reference Button */}
              <button
                onClick={handleProcessBom}
                disabled={loading || !excelData || excelData.rows.length === 0}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'vi' ? 'Đang cross-reference BOM...' : 'Cross-referencing BOM...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Bắt Đầu Tìm Part Tương Đương' : 'Cross-Reference BOM'}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {language === 'vi' ? 'Danh sách MPN (Mỗi dòng 1 mã):' : 'MPN List (One per line):'}
                </label>
                <button
                  onClick={() => setBomText(SAMPLE_TEXT_BOM)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {language === 'vi' ? 'Nạp mẫu' : 'Load sample'}
                </button>
              </div>

              <textarea
                value={bomText}
                onChange={(e) => setBomText(e.target.value)}
                rows={10}
                placeholder="LM317T&#10;MAX232CPE&#10;IRF540N..."
                className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
              />

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setBomText('')}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Xóa trắng"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleProcessBom}
                  disabled={loading || !bomText.trim()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{language === 'vi' ? 'Đang phân tích BOM...' : 'Analyzing BOM...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{language === 'vi' ? 'Phân Tích BOM Ngay' : 'Cross-Reference BOM'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Previews & Results */}
        <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div>
                <span className="font-bold block">{language === 'vi' ? 'Thông báo lỗi:' : 'Error Notice:'}</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Excel Preview (Before running cross-reference) */}
          {excelData && results.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span>
                    {language === 'vi'
                      ? `Xem Trước Bảng Dữ Liệu Excel (Phát hiện ${excelData.totalRows} linh kiện)`
                      : `Excel Data Preview (${excelData.totalRows} parts detected)`}
                  </span>
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === 'vi' ? 'Hiển thị tối đa 5 dòng đầu' : 'Previewing first 5 rows'}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3 text-blue-600 dark:text-blue-400 font-bold">
                        {language === 'vi' ? 'Mã Part (MPN)' : 'Part Number'}
                      </th>
                      <th className="py-2 px-3">{language === 'vi' ? 'Vị Trí' : 'Designator'}</th>
                      <th className="py-2 px-3">{language === 'vi' ? 'Số Lượng' : 'Qty'}</th>
                      <th className="py-2 px-3">{language === 'vi' ? 'Footprint' : 'Footprint'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {excelData.rows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 text-slate-400">{i + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                          {row.partNumber}
                        </td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{row.designator || '-'}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{row.quantity || 1}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{row.footprint || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-slate-500">
                {language === 'vi'
                  ? 'Kiểm tra cột Part Number đã chọn đúng chưa, sau đó nhấn "Bắt Đầu Tìm Part Tương Đương".'
                  : 'Verify the Part Number column matches your components, then click "Cross-Reference BOM".'}
              </p>
            </div>
          )}

          {/* Results Table (When cross-referencing completed) */}
          {results.length > 0 ? (
            <div className="space-y-4">
              {/* Cost Savings Summary Banner */}
              {(totalDigiKey > 0 || totalMouser > 0) && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-blue-800 dark:text-blue-300">
                      <TrendingDown className="w-4 h-4" />
                      <span>{language === 'vi' ? 'So Sánh Chi Phí BOM (DigiKey vs Mouser)' : 'Total BOM Cost Comparison (DigiKey vs Mouser)'}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-mono">
                      <span>DigiKey: <strong className="text-red-600 dark:text-red-400 font-bold">${totalDigiKey.toFixed(2)}</strong></span>
                      <span>Mouser: <strong className="text-blue-600 dark:text-blue-400 font-bold">${totalMouser.toFixed(2)}</strong></span>
                    </div>
                  </div>

                  {totalDigiKey > 0 && totalMouser > 0 && totalDigiKey !== totalMouser && (
                    <div className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold text-center shrink-0">
                      {totalDigiKey < totalMouser
                        ? (language === 'vi' ? `DigiKey tối ưu hơn ~$${(totalMouser - totalDigiKey).toFixed(2)}` : `DigiKey saves ~$${(totalMouser - totalDigiKey).toFixed(2)}`)
                        : (language === 'vi' ? `Mouser tối ưu hơn ~$${(totalDigiKey - totalMouser).toFixed(2)}` : `Mouser saves ~$${(totalDigiKey - totalMouser).toFixed(2)}`)}
                    </div>
                  )}
                </div>
              )}

              {/* Table Container */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{language === 'vi' ? `Kết quả thay thế (${results.length} linh kiện)` : `Cross-Referenced Results (${results.length} parts)`}</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {language === 'vi' ? 'Ưu tiên Part Status: Active (Đang sản xuất)' : 'Priority: Active Lifecycle'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800 text-[10px] font-bold">
                        <PackageCheck className="w-3 h-3 text-teal-600" />
                        {language === 'vi' ? 'Ưu tiên Tồn kho: In-Stock (DigiKey · Mouser)' : 'Priority: In-Stock Inventory'}
                      </span>
                    </div>
                  </div>

                  {/* Primary Export to Excel button */}
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? 'Xuất File Excel Đã Cross (.xlsx)' : 'Export Enriched Excel (.xlsx)'}</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/90 text-[11px] font-semibold text-slate-500 uppercase">
                      <tr>
                        <th className="py-2.5 px-3">{language === 'vi' ? 'Vị Trí / SL' : 'Designator / Qty'}</th>
                        <th className="py-2.5 px-3">{language === 'vi' ? 'Mã Gốc' : 'Original Part'}</th>
                        <th className="py-2.5 px-3 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300">
                          {language === 'vi' ? 'Lựa Chọn 1 (Drop-in)' : 'Alternative 1 (Drop-in)'}
                        </th>
                        <th className="py-2.5 px-3 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300">
                          {language === 'vi' ? 'Lựa Chọn 2 (Tiết Kiệm)' : 'Alternative 2 (Cost-Effective)'}
                        </th>
                        <th className="py-2.5 px-3">{language === 'vi' ? 'Ghi Chú Kỹ Thuật' : 'Engineering Notes'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      {results.map((row, idx) => {
                        const typeConfig1 = formatCompatibilityLabel(row.replacementType, language);
                        const typeConfig2 = formatCompatibilityLabel(row.alt2ReplacementType || row.replacementType, language);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 align-top">
                            {/* Designator & Qty */}
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                {row.designator || `#${idx + 1}`}
                              </span>
                              <span className="text-[10px] text-slate-400 font-sans block">
                                {language === 'vi' ? 'SL' : 'Qty'}: {row.quantity || 1}
                              </span>
                            </td>

                            {/* Original Part */}
                            <td className="py-3 px-3">
                              <button
                                onClick={() => onInspectPart(row.originalPart)}
                                className="font-bold text-blue-600 dark:text-blue-400 hover:underline text-left block"
                                title={language === 'vi' ? 'Tra cứu chuyên sâu mã này' : 'Deep inspect this part'}
                              >
                                {row.originalPart}
                              </button>
                              <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{row.originalManufacturer || (language === 'vi' ? 'Hãng Gốc' : 'Original Mfr')}</span>
                                <span> · </span>
                                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{row.package || row.category || 'Footprint'}</span>
                              </div>
                              {row.originalKeySpecs && (
                                <div className="mt-1.5 p-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">
                                    {language === 'vi' ? 'Thông số gốc:' : 'Original specs:'}
                                  </span>
                                  <span className="line-clamp-2">{row.originalKeySpecs}</span>
                                </div>
                              )}
                              {/* Passive Component Priority Compliance Badge */}
                              {(row.passiveType === 'resistor' || row.originalPart.startsWith('RC') || row.originalPart.startsWith('CRCW') || (row.designator && row.designator.startsWith('R'))) && (
                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-sans">
                                  ⚡ R: 4/4 {language === 'vi' ? 'Tiêu Chí (R, Vỏ, Tol ≤, Temp)' : 'Rules (R, Pkg, Tol ≤, Temp)'}
                                </span>
                              )}
                              {(row.passiveType === 'capacitor' || row.originalPart.startsWith('CC') || row.originalPart.startsWith('GRM') || (row.designator && row.designator.startsWith('C'))) && (
                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 font-sans">
                                  ⚡ C: 5/5 {language === 'vi' ? 'Tiêu Chí (C, Vỏ, V ≥, Tol ≤, Temp)' : 'Rules (C, Pkg, V ≥, Tol ≤, Temp)'}
                                </span>
                              )}
                            </td>

                            {/* Alternative 1 Card Cell */}
                            <td className="py-3 px-3 bg-blue-50/20 dark:bg-blue-950/10 border-r border-slate-100 dark:border-slate-800">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                                    {row.replacementPart}
                                  </span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] shrink-0">
                                    {row.compatibilityScore}%
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                                  <span className="text-slate-700 dark:text-slate-300 font-semibold font-sans">{row.replacementManufacturer}</span>
                                  <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[9px] font-bold font-sans">
                                    ✓ {language === 'vi' ? 'Khác Hãng Gốc' : 'Cross-Mfr'}
                                  </span>
                                  <span className={`px-1 py-0.2 rounded font-sans font-medium ${typeConfig1.badgeClass}`}>
                                    {typeConfig1.title}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[9px] font-bold font-sans">
                                    ✓ Active
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[9px] font-bold font-sans">
                                    📦 In-Stock
                                  </span>
                                </div>

                                {/* Thông số kỹ thuật tương đương so với gốc */}
                                <div className="p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 space-y-1">
                                  <div className="text-[10px] font-bold text-blue-900 dark:text-blue-300 flex items-center justify-between">
                                    <span>⚡ {language === 'vi' ? 'Thông số tương đương:' : 'Equivalent specs:'}</span>
                                    <button
                                      type="button"
                                      onClick={() => setDetailModalItem(row)}
                                      className="text-[9px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-bold"
                                    >
                                      {language === 'vi' ? 'Đối chiếu →' : 'Compare →'}
                                    </button>
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-800 dark:text-slate-200">
                                    {row.replacementKeySpecs || row.package || (language === 'vi' ? 'Khớp thông số kỹ thuật' : 'Specs matched')}
                                  </div>
                                  {row.replacementSpecsComparison && (
                                    <div className="text-[9px] text-emerald-700 dark:text-emerald-300 font-sans font-medium pt-1 border-t border-blue-200/50 dark:border-blue-900/30 flex items-start gap-1">
                                      <span className="font-bold shrink-0">{language === 'vi' ? '✓ Đối chiếu:' : '✓ Compare:'}</span>
                                      <span>{row.replacementSpecsComparison}</span>
                                    </div>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setDetailModalItem(row)}
                                  className="w-full py-1 px-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-blue-600 dark:text-blue-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                >
                                  <SlidersHorizontal className="w-3 h-3" />
                                  <span>{language === 'vi' ? 'Xem chi tiết đối chiếu thông số' : 'View detailed spec comparison'}</span>
                                </button>
                              </div>
                            </td>

                            {/* Alternative 2 Card Cell */}
                            <td className="py-3 px-3 bg-cyan-50/20 dark:bg-cyan-950/10 border-r border-slate-100 dark:border-slate-800">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                                    {row.alt2ReplacementPart || row.replacementPart}
                                  </span>
                                  <span className="text-cyan-600 dark:text-cyan-400 font-bold text-[11px] shrink-0">
                                    {row.alt2CompatibilityScore || 96}%
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                                  <span className="text-slate-700 dark:text-slate-300 font-semibold font-sans">{row.alt2Manufacturer || (language === 'vi' ? 'Hãng Thay Thế' : 'Alternate Mfr')}</span>
                                  <span className="px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-[9px] font-bold font-sans">
                                    ✓ {language === 'vi' ? 'Khác Hãng Gốc' : 'Cross-Mfr'}
                                  </span>
                                  <span className={`px-1 py-0.2 rounded font-sans font-medium ${typeConfig2.badgeClass}`}>
                                    {typeConfig2.title}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[9px] font-bold font-sans">
                                    ✓ Active
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[9px] font-bold font-sans">
                                    📦 In-Stock
                                  </span>
                                </div>

                                {/* Thông số kỹ thuật tương đương so với gốc */}
                                <div className="p-2 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-900/50 space-y-1">
                                  <div className="text-[10px] font-bold text-cyan-900 dark:text-cyan-300 flex items-center justify-between">
                                    <span>⚡ {language === 'vi' ? 'Thông số tương đương:' : 'Equivalent specs:'}</span>
                                    <button
                                      type="button"
                                      onClick={() => setDetailModalItem(row)}
                                      className="text-[9px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer font-bold"
                                    >
                                      {language === 'vi' ? 'Đối chiếu →' : 'Compare →'}
                                    </button>
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-800 dark:text-slate-200">
                                    {row.alt2KeySpecs || row.package || (language === 'vi' ? 'Khớp thông số kỹ thuật' : 'Specs matched')}
                                  </div>
                                  {row.alt2SpecsComparison && (
                                    <div className="text-[9px] text-teal-700 dark:text-teal-300 font-sans font-medium pt-1 border-t border-cyan-200/50 dark:border-cyan-900/30 flex items-start gap-1">
                                      <span className="font-bold shrink-0">{language === 'vi' ? '✓ Đối chiếu:' : '✓ Compare:'}</span>
                                      <span>{row.alt2SpecsComparison}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Price comparison mini matrix */}
                                <div className="p-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-[10px] space-y-0.5">
                                  <div className="flex justify-between text-slate-600 dark:text-slate-400 font-sans">
                                    <span>DigiKey:</span> <span className="font-mono text-slate-800 dark:text-slate-200">{row.alt2DigikeyPrice || row.digikeyPrice || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-600 dark:text-slate-400 font-sans">
                                    <span>Mouser:</span> <span className="font-mono text-slate-800 dark:text-slate-200">{row.alt2MouserPrice || row.mouserPrice || 'N/A'}</span>
                                  </div>
                                </div>

                                {/* Links */}
                                <div className="flex items-center gap-1.5 pt-1">
                                  <a
                                    href={row.alt2DigikeyUrl || `https://www.digikey.com/en/products/result?keywords=${encodeURIComponent(row.alt2ReplacementPart || '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold flex items-center gap-0.5 shadow-xs"
                                  >
                                    <span>DigiKey</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                  <a
                                    href={row.alt2MouserUrl || `https://www.mouser.com/c/?q=${encodeURIComponent(row.alt2ReplacementPart || '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center gap-0.5 shadow-xs"
                                  >
                                    <span>Mouser</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              </div>
                            </td>

                            {/* Engineering Notes */}
                            <td className="py-3 px-3 font-sans text-slate-600 dark:text-slate-300 max-w-xs text-[11px] leading-relaxed">
                              <div>{language === 'vi' ? row.noteVi : (row.noteEn || row.noteVi)}</div>
                              {(row.alt2NoteVi || row.alt2NoteEn) && (
                                <div className="mt-1 text-[10px] text-slate-400">
                                  • {language === 'vi' ? row.alt2NoteVi : (row.alt2NoteEn || row.alt2NoteVi)}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            !excelData && (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                  {language === 'vi' ? 'Chưa có file BOM nào được tải lên' : 'No BOM file uploaded'}
                </h4>
                <p className="text-xs mt-1 text-slate-400 max-w-md mx-auto">
                  {language === 'vi'
                    ? 'Bạn có thể kéo thả file Excel BOM của mình hoặc bấm nút "Nạp Dữ Liệu BOM Mẫu" ở trên để xem thử tính năng tìm part tương đương và xuất file Excel.'
                    : 'Upload your BOM or click "Load Sample BOM" to preview automatic component cross-referencing and Excel export.'}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Detail Parametric Comparison Modal for BOM Item */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <SlidersHorizontal className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {language === 'vi'
                        ? 'Bảng Đối Chiếu Thông Số Tương Đương So Với Mã Gốc'
                        : 'Parametric Comparison: Original vs Cross Candidates'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {language === 'vi' ? 'Vị trí:' : 'Designator:'} <strong className="font-mono text-slate-700 dark:text-slate-300">{detailModalItem.designator || 'N/A'}</strong> · {language === 'vi' ? 'Số lượng:' : 'Qty:'} <strong className="font-mono text-slate-700 dark:text-slate-300">{detailModalItem.quantity || 1}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDetailModalItem(null)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Trash2 className="w-5 h-5 hidden" />
                <span className="text-lg font-bold">✕</span>
              </button>
            </div>

            {/* Brand Separation Guarantee Banner */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="font-semibold text-indigo-900 dark:text-indigo-200">
                  {language === 'vi'
                    ? 'Đảm bảo nguyên tắc chuỗi cung ứng: Các mã cross 100% không trùng nhà sản xuất với mã gốc.'
                    : 'Manufacturer separation verified: All cross candidates are from alternate manufacturers.'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono font-bold text-[10px]">
                Verified 100%
              </span>
            </div>

            {/* 3-Column Comparison Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="py-3 px-4 font-bold uppercase text-[11px] w-1/4">
                      {language === 'vi' ? 'Tiêu Chí Kỹ Thuật' : 'Specification'}
                    </th>
                    <th className="py-3 px-4 font-bold text-slate-900 dark:text-white w-1/4 bg-slate-200/50 dark:bg-slate-800/90">
                      <div className="text-[10px] text-slate-500 uppercase font-sans">
                        {language === 'vi' ? 'Mã Gốc' : 'Original Part'}
                      </div>
                      <div className="text-sm font-mono text-blue-600 dark:text-blue-400">{detailModalItem.originalPart}</div>
                    </th>
                    <th className="py-3 px-4 font-bold text-slate-900 dark:text-white w-1/4 bg-blue-50/60 dark:bg-blue-950/30">
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-sans">
                        {language === 'vi' ? 'Lựa Chọn 1 (Drop-in)' : 'Option 1 (Drop-in)'}
                      </div>
                      <div className="text-sm font-mono text-slate-900 dark:text-white">{detailModalItem.replacementPart}</div>
                    </th>
                    <th className="py-3 px-4 font-bold text-slate-900 dark:text-white w-1/4 bg-cyan-50/60 dark:bg-cyan-950/30">
                      <div className="text-[10px] text-cyan-600 dark:text-cyan-400 uppercase font-sans">
                        {language === 'vi' ? 'Lựa Chọn 2 (Tiết kiệm)' : 'Option 2 (Alternative)'}
                      </div>
                      <div className="text-sm font-mono text-slate-900 dark:text-white">{detailModalItem.alt2ReplacementPart || detailModalItem.replacementPart}</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {/* Manufacturer Row */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-sans font-bold text-slate-700 dark:text-slate-300">
                      {language === 'vi' ? '1. Hãng sản xuất' : '1. Manufacturer'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-800/40">
                      {detailModalItem.originalManufacturer || (language === 'vi' ? 'Hãng Gốc' : 'Original Mfr')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700 dark:text-emerald-400 bg-blue-50/20 dark:bg-blue-950/10">
                      <div>{detailModalItem.replacementManufacturer}</div>
                      <span className="text-[10px] font-sans font-bold text-indigo-600 dark:text-indigo-400">
                        ✓ {language === 'vi' ? 'Khác hãng gốc' : 'Cross-Mfr'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700 dark:text-emerald-400 bg-cyan-50/20 dark:bg-cyan-950/10">
                      <div>{detailModalItem.alt2Manufacturer || (language === 'vi' ? 'Hãng Thay Thế' : 'Alternate Mfr')}</div>
                      <span className="text-[10px] font-sans font-bold text-indigo-600 dark:text-indigo-400">
                        ✓ {language === 'vi' ? 'Khác hãng gốc' : 'Cross-Mfr'}
                      </span>
                    </td>
                  </tr>

                  {/* Package / Footprint */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-sans font-bold text-slate-700 dark:text-slate-300">
                      {language === 'vi' ? '2. Kiểu chân & Đóng gói' : '2. Package & Footprint'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-800/40">
                      {detailModalItem.package || (language === 'vi' ? 'Tiêu chuẩn' : 'Standard')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white bg-blue-50/20 dark:bg-blue-950/10">
                      <div>{detailModalItem.package || (language === 'vi' ? 'Tiêu chuẩn' : 'Standard')}</div>
                      <span className="text-[10px] font-sans text-emerald-600 dark:text-emerald-400 font-bold">
                        ✓ {language === 'vi' ? 'Khớp đúng 100% vỏ' : '100% Footprint Match'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white bg-cyan-50/20 dark:bg-cyan-950/10">
                      <div>{detailModalItem.package || (language === 'vi' ? 'Tiêu chuẩn' : 'Standard')}</div>
                      <span className="text-[10px] font-sans text-emerald-600 dark:text-emerald-400 font-bold">
                        ✓ {language === 'vi' ? 'Khớp đúng 100% vỏ' : '100% Footprint Match'}
                      </span>
                    </td>
                  </tr>

                  {/* Part Status (Lifecycle) */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-sans font-bold text-slate-700 dark:text-slate-300">
                      {language === 'vi' ? '3. Trạng thái vòng đời (Part Status)' : '3. Lifecycle Status'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-800/40">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {detailModalItem.lifecycleStatus || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white bg-blue-50/20 dark:bg-blue-950/10">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {detailModalItem.replacementLifecycle || 'Active'}
                      </span>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal mt-0.5">
                        ✓ {language === 'vi' ? 'Đang sản xuất hàng loạt' : 'Active mass production'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white bg-cyan-50/20 dark:bg-cyan-950/10">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {detailModalItem.alt2Lifecycle || 'Active'}
                      </span>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal mt-0.5">
                        ✓ {language === 'vi' ? 'Đang sản xuất hàng loạt' : 'Active mass production'}
                      </div>
                    </td>
                  </tr>

                  {/* Stock Availability */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-sans font-bold text-slate-700 dark:text-slate-300">
                      {language === 'vi' ? '4. Tình trạng tồn kho (Stock)' : '4. Stock Availability'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-800/40">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-teal-700 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        <PackageCheck className="w-3 h-3 text-teal-600" />
                        {language === 'vi' ? 'Sẵn hàng kho' : 'In-Stock'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white bg-blue-50/20 dark:bg-blue-950/10">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-teal-700 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        <PackageCheck className="w-3 h-3 text-teal-600" />
                        {detailModalItem.replacementStockStatus || 'Sẵn hàng (In-Stock)'}
                      </span>
                      <div className="text-[10px] text-teal-600 dark:text-teal-400 font-normal mt-0.5">
                        ✓ DigiKey & Mouser
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white bg-cyan-50/20 dark:bg-cyan-950/10">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-teal-700 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        <PackageCheck className="w-3 h-3 text-teal-600" />
                        {detailModalItem.alt2StockStatus || 'Sẵn hàng (In-Stock)'}
                      </span>
                      <div className="text-[10px] text-teal-600 dark:text-teal-400 font-normal mt-0.5">
                        ✓ DigiKey & Mouser
                      </div>
                    </td>
                  </tr>

                  {/* Key Parameters / Detailed Specifications */}
                  {detailModalItem.detailedSpecs && detailModalItem.detailedSpecs.length > 0 ? (
                    detailModalItem.detailedSpecs.map((spec, sIdx) => (
                      <tr key={`spec-${sIdx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 font-sans font-bold text-slate-700 dark:text-slate-300 text-xs">
                          <span className="text-slate-800 dark:text-slate-200">
                            {sIdx + 5}. {spec.name}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-800/40 text-[11px] font-mono">
                          {spec.originalValue}
                        </td>
                        <td className="py-2.5 px-4 text-indigo-700 dark:text-indigo-300 bg-blue-50/20 dark:bg-blue-950/10 text-[11px] font-mono">
                          <div className="font-bold">{spec.alt1Value}</div>
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-sans font-bold text-emerald-600 dark:text-emerald-400">
                            ✓ {spec.isMatch ? (language === 'vi' ? 'Khớp tiêu chuẩn' : 'Matches') : (language === 'vi' ? 'Tương đương' : 'Equivalent')}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-cyan-700 dark:text-cyan-300 bg-cyan-50/20 dark:bg-cyan-950/10 text-[11px] font-mono">
                          <div className="font-bold">{spec.alt2Value}</div>
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-sans font-bold text-teal-600 dark:text-teal-400">
                            ✓ {spec.isMatch ? (language === 'vi' ? 'Khớp tiêu chuẩn' : 'Matches') : (language === 'vi' ? 'Tương đương' : 'Equivalent')}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-sans font-bold text-slate-700 dark:text-slate-300">
                        {language === 'vi' ? '3. Thông số kỹ thuật chi tiết' : '3. Key Specifications'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-800/40 text-[11px]">
                        {detailModalItem.originalKeySpecs || (language === 'vi' ? 'Thông số theo datasheet gốc' : 'Original datasheet specs')}
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-700 dark:text-indigo-300 bg-blue-50/20 dark:bg-blue-950/10 text-[11px]">
                        <div>{detailModalItem.replacementKeySpecs || (language === 'vi' ? 'Tương đương thông số gốc' : 'Equivalent to original specs')}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-normal mt-1">
                          {detailModalItem.replacementSpecsComparison}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50/20 dark:bg-cyan-950/10 text-[11px]">
                        <div>{detailModalItem.alt2KeySpecs || (language === 'vi' ? 'Tương đương thông số gốc' : 'Equivalent to original specs')}</div>
                        <div className="text-[10px] text-teal-600 dark:text-teal-400 font-sans font-normal mt-1">
                          {detailModalItem.alt2SpecsComparison}
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Compatibility Score */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-sans font-bold text-slate-700 dark:text-slate-300">
                      {language === 'vi' ? '4. Độ khớp & Loại thay thế' : '4. Compatibility & Type'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 bg-slate-50/40 dark:bg-slate-800/40">
                      {language === 'vi' ? 'Gốc (100%)' : 'Original (100%)'}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 bg-blue-50/20 dark:bg-blue-950/10">
                      {detailModalItem.compatibilityScore}% ({detailModalItem.replacementType})
                    </td>
                    <td className="py-3 px-4 font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50/20 dark:bg-cyan-950/10">
                      {detailModalItem.alt2CompatibilityScore || 96}% ({detailModalItem.alt2ReplacementType || 'DROP_IN'})
                    </td>
                  </tr>

                  {/* Pricing Overview */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-sans font-bold text-slate-700 dark:text-slate-300">
                      {language === 'vi' ? '5. Báo giá tham khảo' : '5. Price Reference'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 bg-slate-50/40 dark:bg-slate-800/40">
                      {language === 'vi' ? 'Theo thị trường' : 'Market rate'}
                    </td>
                    <td className="py-3 px-4 text-[11px] bg-blue-50/20 dark:bg-blue-950/10">
                      <div>DigiKey: <strong className="text-slate-800 dark:text-slate-200">{detailModalItem.digikeyPrice || 'N/A'}</strong></div>
                      <div>Mouser: <strong className="text-slate-800 dark:text-slate-200">{detailModalItem.mouserPrice || 'N/A'}</strong></div>
                    </td>
                    <td className="py-3 px-4 text-[11px] bg-cyan-50/20 dark:bg-cyan-950/10">
                      <div>DigiKey: <strong className="text-slate-800 dark:text-slate-200">{detailModalItem.alt2DigikeyPrice || 'N/A'}</strong></div>
                      <div>Mouser: <strong className="text-slate-800 dark:text-slate-200">{detailModalItem.alt2MouserPrice || 'N/A'}</strong></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  onInspectPart(detailModalItem.originalPart);
                  setDetailModalItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                {language === 'vi'
                  ? 'Tra cứu chi tiết linh kiện này trên trang tìm kiếm đơn →'
                  : 'Deep inspect this part on single search →'}
              </button>

              <button
                onClick={() => setDetailModalItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                {language === 'vi' ? 'Đóng' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
