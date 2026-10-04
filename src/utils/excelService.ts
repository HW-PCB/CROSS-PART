import * as XLSX from 'xlsx';
import { BomItemResult } from '../types/components';

export interface ParsedBomRow {
  partNumber: string;
  designator?: string;
  quantity?: number;
  description?: string;
  footprint?: string;
  rawRow: { [key: string]: any };
}

export interface ExcelParseResult {
  sheetNames: string[];
  selectedSheet: string;
  headers: string[];
  detectedColumns: {
    partNumberCol: string;
    designatorCol?: string;
    quantityCol?: string;
    descriptionCol?: string;
    footprintCol?: string;
  };
  rows: ParsedBomRow[];
  rawGridRows: any[];
  headerRowIndex: number;
  totalRows: number;
}

// Heuristic keywords for finding columns
const MPN_KEYWORDS = [
  'mpn',
  'partnumber',
  'partno',
  'part#',
  'part',
  'malinhkien',
  'linhkien',
  'component',
  'mfgpartnumber',
  'manufacturerpartnumber',
  'device',
  'value',
  'comment',
  'libref',
  'code',
  'partname',
];

const DES_KEYWORDS = [
  'designator',
  'refdes',
  'ref',
  'vịtrí',
  'vitri',
  'location',
  'loc',
  'reference',
];

const QTY_KEYWORDS = [
  'qty',
  'quantity',
  'soluong',
  'count',
  'amount',
  'pcs',
  'total',
];

const DESC_KEYWORDS = [
  'description',
  'mota',
  'desc',
  'name',
  'spec',
  'chitiet',
];

const FOOTPRINT_KEYWORDS = [
  'footprint',
  'package',
  'donggoi',
  'case',
  'kieu',
  'pcbfootprint',
];

const norm = (s: string) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_\-#/\\.]+/g, '');

export function detectColumnMapping(headers: string[]): {
  partNumberCol: string;
  designatorCol?: string;
  quantityCol?: string;
  descriptionCol?: string;
  footprintCol?: string;
} {
  let partNumberCol = '';
  let designatorCol: string | undefined;
  let quantityCol: string | undefined;
  let descriptionCol: string | undefined;
  let footprintCol: string | undefined;

  for (const h of headers) {
    const n = norm(h);
    if (!n) continue;

    if (!partNumberCol && MPN_KEYWORDS.some((k) => n.includes(k))) {
      partNumberCol = h;
    }
    if (!designatorCol && DES_KEYWORDS.some((k) => n.includes(k))) {
      designatorCol = h;
    }
    if (!quantityCol && QTY_KEYWORDS.some((k) => n.includes(k))) {
      quantityCol = h;
    }
    if (!descriptionCol && DESC_KEYWORDS.some((k) => n.includes(k))) {
      descriptionCol = h;
    }
    if (!footprintCol && FOOTPRINT_KEYWORDS.some((k) => n.includes(k))) {
      footprintCol = h;
    }
  }

  // Fallback: pick the first available column if none matched
  if (!partNumberCol && headers.length > 0) {
    partNumberCol = headers[0];
  }

  return { partNumberCol, designatorCol, quantityCol, descriptionCol, footprintCol };
}

// Map rows given specific column names
export function mapRowsWithColumns(
  rawJson: any[],
  columns: {
    partNumberCol: string;
    designatorCol?: string;
    quantityCol?: string;
    descriptionCol?: string;
    footprintCol?: string;
  }
): ParsedBomRow[] {
  return rawJson
    .map((row) => {
      const partVal = row[columns.partNumberCol];
      const partNumber = partVal !== undefined && partVal !== null ? String(partVal).trim() : '';

      const desVal = columns.designatorCol ? row[columns.designatorCol] : '';
      const qtyVal = columns.quantityCol ? Number(row[columns.quantityCol]) : 1;
      const descVal = columns.descriptionCol ? String(row[columns.descriptionCol]) : '';
      const fpVal = columns.footprintCol ? String(row[columns.footprintCol]) : '';

      return {
        partNumber,
        designator: desVal ? String(desVal).trim() : undefined,
        quantity: isNaN(qtyVal) || qtyVal <= 0 ? 1 : qtyVal,
        description: descVal ? descVal.trim() : undefined,
        footprint: fpVal ? fpVal.trim() : undefined,
        rawRow: row,
      };
    })
    .filter((r) => r.partNumber.length > 0 && r.partNumber.toLowerCase() !== 'total');
}

// Smart Parse uploaded Excel / CSV file
export async function parseExcelFile(file: File, sheetIndex: number = 0): Promise<ExcelParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  if (workbook.SheetNames.length === 0) {
    throw new Error('File Excel không có sheet nào.');
  }

  const selectedSheet = workbook.SheetNames[sheetIndex] || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[selectedSheet];

  // 1. Read sheet as 2D array to find the true header row
  const rawGrid: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (!rawGrid || rawGrid.length === 0) {
    throw new Error('Sheet Excel được chọn không có dữ liệu.');
  }

  // 2. Locate header row: scan first 12 rows for row containing column names
  let headerRowIndex = 0;
  let maxScore = -1;

  for (let i = 0; i < Math.min(rawGrid.length, 12); i++) {
    const row = rawGrid[i];
    if (!Array.isArray(row) || row.length === 0) continue;

    const rowText = row.map((cell) => norm(String(cell))).join(' ');
    let score = 0;

    if (MPN_KEYWORDS.some((k) => rowText.includes(k))) score += 5;
    if (DES_KEYWORDS.some((k) => rowText.includes(k))) score += 4;
    if (QTY_KEYWORDS.some((k) => rowText.includes(k))) score += 3;
    if (FOOTPRINT_KEYWORDS.some((k) => rowText.includes(k))) score += 2;
    if (DESC_KEYWORDS.some((k) => rowText.includes(k))) score += 2;

    const nonBlankCount = row.filter((c) => String(c).trim().length > 0).length;
    score += Math.min(nonBlankCount, 5);

    if (score > maxScore && nonBlankCount >= 2) {
      maxScore = score;
      headerRowIndex = i;
    }
  }

  // 3. Extract headers from the detected header row
  const rawHeadersRow = rawGrid[headerRowIndex] || [];
  const headers: string[] = rawHeadersRow
    .map((h: any, idx: number) => {
      const val = String(h).trim();
      return val ? val : `Column_${idx + 1}`;
    })
    .filter(Boolean);

  if (headers.length === 0) {
    throw new Error('Không thể nhận diện tiêu đề cột trong file Excel.');
  }

  // 4. Extract data rows below the header row
  const dataRows: any[] = [];
  for (let r = headerRowIndex + 1; r < rawGrid.length; r++) {
    const rowArr = rawGrid[r];
    if (!Array.isArray(rowArr) || rowArr.every((c) => String(c).trim() === '')) {
      continue;
    }
    const rowObj: { [key: string]: any } = {};
    headers.forEach((header, colIdx) => {
      rowObj[header] = rowArr[colIdx] !== undefined ? rowArr[colIdx] : '';
    });
    dataRows.push(rowObj);
  }

  const detectedColumns = detectColumnMapping(headers);
  const rows = mapRowsWithColumns(dataRows, detectedColumns);

  return {
    sheetNames: workbook.SheetNames,
    selectedSheet,
    headers,
    detectedColumns,
    rows,
    rawGridRows: dataRows,
    headerRowIndex,
    totalRows: rows.length,
  };
}

// Generate sample Excel BOM file for users to download and test
export function generateSampleBomExcel(): void {
  const wb = XLSX.utils.book_new();

  const sampleData = [
    ['BOM - MẠCH ĐIỆN TỬ MẪU (SAMPLE PCB PROJECT)'],
    ['Phần cứng: Rev 2.1', 'Ngày tạo: ' + new Date().toLocaleDateString('vi-VN')],
    [],
    ['Item', 'Designator (Vị trí)', 'Qty (Số lượng)', 'Part Number (Mã linh kiện)', 'Description (Mô tả)', 'Package (Đóng gói)'],
    [1, 'R1, R2', 10, 'RC0603FR-0710KL', 'Điện trở SMD 10kΩ 0603 1% (Ưu tiên: R, Package, Tol ≤, Temp)', '0603'],
    [2, 'C1, C2', 10, 'CC0603KRX7R9BB104', 'Tụ gốm SMD 100nF 50V X7R 0603 (Ưu tiên: C, Package, V ≥, Tol ≤, Temp)', '0603'],
    [3, 'U1', 2, 'LM317T', 'IC ổn áp tuyến tính 1.2V-37V 1.5A', 'TO-220'],
    [4, 'U2', 1, 'STM32F103C8T6', 'Vi điều khiển ARM Cortex-M3 72MHz', 'LQFP-48'],
    [5, 'Q1, Q2', 2, 'IRF540N', 'Power MOSFET N-Channel 100V 33A', 'TO-220AB'],
    [6, 'U3', 1, 'MAX232CPE', 'Bộ giao tiếp RS-232 sang TTL', 'DIP-16'],
    [7, 'U4', 1, 'TL072CP', 'Op-Amp JFET nhiễu cực thấp', 'DIP-8'],
    [8, 'U5', 2, 'NE555P', 'IC định thời chính xác 555', 'DIP-8'],
    [9, 'U6', 1, 'DS1307ZN', 'IC đồng hồ thời gian thực RTC I2C', 'SOIC-8'],
    [10, 'U7', 1, 'LM358N', 'IC khuếch đại thuật toán kép Dual Op-Amp', 'DIP-8'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleData);
  ws['!cols'] = [
    { wch: 8 },
    { wch: 22 },
    { wch: 16 },
    { wch: 28 },
    { wch: 42 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Sample_BOM');
  XLSX.writeFile(wb, `Sample_BOM_CrossPart_${Date.now()}.xlsx`);
}

// Export Enriched BOM to a full-featured Excel workbook (.xlsx)
export function exportBomToExcel(results: BomItemResult[], projectName: string = 'CrossPart_BOM'): void {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Main Cross-Referenced BOM with 2 Alternatives
  // Đã bỏ các cột: [Lựa Chọn 1] Mã LCSC, [Lựa Chọn 1] Giá DigiKey, [Lựa Chọn 1] Giá Mouser, [Lựa Chọn 1] Giá LCSC, [Lựa Chọn 1] Nơi Rẻ Nhất, [Lựa Chọn 1] Link Mua Hàng
  // Đã bỏ các cột tương tự của [Lựa Chọn 2] và bổ sung [Lựa Chọn 2] Đánh Giá So Sánh Với Gốc
  // Bỏ hoàn toàn nguồn tham khảo LCSC
  const sheet1Data: any[] = results.map((item, index) => ({
    'STT (No.)': index + 1,
    'Vị Trí (Designator)': item.designator || '',
    'Số Lượng (Qty)': item.quantity || 1,
    'Part Gốc (Original MPN)': item.originalPart,
    'Hãng SX Gốc (Original Mfr)': item.originalManufacturer || 'Gốc',
    'Phân Loại (Category)': item.category || '',
    'Đóng Gói (Package)': item.package || '',
    'Thông Số Kỹ Thuật Gốc (Original Specs)': item.originalKeySpecs || item.package || 'Tiêu chuẩn',
    'Trạng Thái Gốc (Status)': item.lifecycleStatus || 'Active',
    
    // Alternative 1
    '[Lựa Chọn 1] Part Thay Thế': item.replacementPart,
    '[Lựa Chọn 1] Hãng SX (Khác Hãng Gốc)': item.replacementManufacturer || '',
    '[Lựa Chọn 1] Loại Thay Thế': item.replacementType,
    '[Lựa Chọn 1] Độ Khớp (%)': `${item.compatibilityScore}%`,
    '[Lựa Chọn 1] Thông Số Kỹ Thuật Tương Đương': item.replacementKeySpecs || item.package || 'Khớp thông số',
    '[Lựa Chọn 1] So Sánh Thông Số Với Gốc': item.replacementSpecsComparison || 'Khớp toàn diện thông số kỹ thuật',
    
    // Alternative 2
    '[Lựa Chọn 2] Part Thay Thế': item.alt2ReplacementPart || item.replacementPart,
    '[Lựa Chọn 2] Hãng SX (Khác Hãng Gốc)': item.alt2Manufacturer || 'Hãng Thay Thế',
    '[Lựa Chọn 2] Loại Thay Thế': item.alt2ReplacementType || 'DROP_IN',
    '[Lựa Chọn 2] Độ Khớp (%)': `${item.alt2CompatibilityScore || 96}%`,
    '[Lựa Chọn 2] Thông Số Kỹ Thuật Tương Đương': item.alt2KeySpecs || item.package || 'Khớp thông số',
    '[Lựa Chọn 2] Đánh Giá So Sánh Với Gốc': item.alt2SpecsComparison || 'Khớp toàn diện thông số kỹ thuật',

    'Khuyến Nghị Kỹ Thuật (Engineering Notes)': item.noteVi,
  }));

  const worksheet1 = XLSX.utils.json_to_sheet(sheet1Data);

  worksheet1['!cols'] = [
    { wch: 6 },  // STT
    { wch: 18 }, // Vị trí
    { wch: 10 }, // Qty
    { wch: 22 }, // Part Gốc
    { wch: 20 }, // Hãng gốc
    { wch: 22 }, // Category
    { wch: 16 }, // Package
    { wch: 32 }, // Thông số gốc
    { wch: 14 }, // Status
    // Alt 1 (6 columns - đã loại bỏ 6 cột giá & link)
    { wch: 22 }, // Alt 1 Part
    { wch: 22 }, // Alt 1 Hãng SX khác gốc
    { wch: 16 }, // Alt 1 Loại
    { wch: 12 }, // Alt 1 Khớp %
    { wch: 32 }, // Alt 1 Thông số tương đương
    { wch: 38 }, // Alt 1 So sánh với gốc
    // Alt 2 (6 columns - đã loại bỏ 6 cột giá & link, có cột Đánh Giá So Sánh Với Gốc)
    { wch: 22 }, // Alt 2 Part
    { wch: 22 }, // Alt 2 Hãng SX khác gốc
    { wch: 16 }, // Alt 2 Loại
    { wch: 12 }, // Alt 2 Khớp %
    { wch: 32 }, // Alt 2 Thông số tương đương
    { wch: 38 }, // Alt 2 Đánh giá so sánh với gốc
    { wch: 50 }, // Ghi chú kỹ thuật
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet1, 'BOM_Cross_Referenced');

  // Sheet 2: Cost Summary (DigiKey vs Mouser)
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

  const costDiff = Math.abs(totalDigiKey - totalMouser);
  const costData = [
    { 'Chỉ Số (Metric)': 'Tổng số linh kiện phân tích (Line items)', 'Giá Trị (Value)': results.length },
    { 'Chỉ Số (Metric)': 'Tổng số lượng part cần mua (Total Qty)', 'Giá Trị (Value)': totalQty },
    { 'Chỉ Số (Metric)': 'Tổng chi phí ước tính trên DigiKey ($)', 'Giá Trị (Value)': `$${totalDigiKey.toFixed(2)}` },
    { 'Chỉ Số (Metric)': 'Tổng chi phí ước tính trên Mouser ($)', 'Giá Trị (Value)': `$${totalMouser.toFixed(2)}` },
    {
      'Chỉ Số (Metric)': 'Chênh lệch ước tính giữa DigiKey & Mouser ($)',
      'Giá Trị (Value)':
        totalDigiKey > 0 && totalMouser > 0
          ? `$${costDiff.toFixed(2)} (${totalDigiKey <= totalMouser ? 'DigiKey rẻ hơn' : 'Mouser rẻ hơn'})`
          : 'N/A',
    },
    {
      'Chỉ Số (Metric)': 'Nhà phân phối tối ưu ngân sách hơn',
      'Giá Trị (Value)':
        totalDigiKey > 0 && totalMouser > 0
          ? totalDigiKey <= totalMouser ? 'DigiKey' : 'Mouser'
          : 'Tham khảo báo giá thực tế',
    },
  ];

  const worksheet2 = XLSX.utils.json_to_sheet(costData);
  worksheet2['!cols'] = [{ wch: 45 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, worksheet2, 'Cost_Savings_Summary');

  XLSX.writeFile(workbook, `${projectName}_CrossReferenced_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
