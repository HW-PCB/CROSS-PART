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
    ['BOM - DỰ ÁN MẠCH ĐIỆN TỬ MẪU'],
    ['Phiên bản mạch: Rev 2.1', 'Ngày lập: ' + new Date().toLocaleDateString('vi-VN')],
    [],
    ['STT', 'Vị Trí', 'Số Lượng', 'Mã Linh Kiện', 'Mô Tả Kỹ Thuật', 'Kiểu Đóng Gói'],
    [1, 'R1, R2', 10, 'RC0603FR-0710KL', 'Điện trở dán SMD 10kΩ 0603 1% (Ưu tiên: Trị số, Vỏ, Sai số, Nhiệt độ)', '0603'],
    [2, 'C1, C2', 10, 'CC0603KRX7R9BB104', 'Tụ gốm dán SMD 100nF 50V X7R 0603 (Ưu tiên: Điện dung, Vỏ, Áp ≥, Sai số ≤, Nhiệt độ)', '0603'],
    [3, 'U1', 2, 'LM317T', 'IC ổn áp tuyến tính điều chỉnh 1.2V - 37V 1.5A', 'TO-220'],
    [4, 'U2', 1, 'STM32F103C8T6', 'Vi điều khiển 32-bit ARM Cortex-M3 72MHz', 'LQFP-48'],
    [5, 'Q1, Q2', 2, 'IRF540N', 'Transistor công suất Power MOSFET kênh N 100V 33A', 'TO-220AB'],
    [6, 'U3', 1, 'MAX232CPE', 'IC thu phát tín hiệu giao tiếp RS-232 sang TTL', 'DIP-16'],
    [7, 'U4', 1, 'TL072CP', 'IC khuếch đại thuật toán kép Op-Amp JFET nhiễu cực thấp', 'DIP-8'],
    [8, 'U5', 2, 'NE555P', 'IC định thời chính xác 555', 'DIP-8'],
    [9, 'U6', 1, 'DS1307ZN', 'IC đồng hồ thời gian thực RTC giao tiếp I2C', 'SOIC-8'],
    [10, 'U7', 1, 'LM358N', 'IC khuếch đại thuật toán kép Dual Op-Amp', 'DIP-8'],
    [11, 'U8', 2, 'AMS1117-3.3', 'IC ổn áp LDO 3.3V 1A SOT-223', 'SOT-223'],
    [12, 'Q3', 4, '2N7002', 'MOSFET kênh N tín hiệu nhỏ 60V 115mA', 'SOT-23'],
    [13, 'D1, D2', 4, '1N4148W', 'Diode đóng cắt tốc độ cao 100V 150mA', 'SOD-123'],
    [14, 'D3', 2, 'SS34', 'Diode Schottky 40V 3A hạ áp thấp', 'SMA/DO-214AC'],
    [15, 'R3', 5, 'RC0805FR-071KL', 'Điện trở dán SMD 1kΩ 0805 1% 1/8W', '0805'],
    [16, 'C3', 5, 'CC0805KRX7R9BB105', 'Tụ gốm dán SMD 1µF 50V X7R 0805', '0805'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleData);
  ws['!cols'] = [
    { wch: 8 },
    { wch: 18 },
    { wch: 12 },
    { wch: 26 },
    { wch: 48 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Sample_BOM');
  XLSX.writeFile(wb, `Mau_BOM_CrossPart_${Date.now()}.xlsx`);
}

// Export Enriched BOM to a full-featured Excel workbook (.xlsx)
export function exportBomToExcel(results: BomItemResult[], projectName: string = 'CrossPart_BOM'): void {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Main Cross-Referenced BOM with 2 Alternatives
  const sheet1Data: any[] = results.map((item, index) => ({
    'STT': index + 1,
    'Vị Trí': item.designator || '',
    'Số Lượng': item.quantity || 1,
    'Mã Linh Kiện Gốc': item.originalPart,
    'Hãng Sản Xuất Gốc': item.originalManufacturer || 'Gốc',
    'Phân Loại Linh Kiện': item.category || '',
    'Kiểu Đóng Gói': item.package || '',
    'Thông Số Kỹ Thuật Gốc (Đầy Đủ)': item.originalKeySpecs || item.package || 'Tiêu chuẩn',
    'Trạng Thái Sản Xuất': item.lifecycleStatus || 'Active',
    
    // Lựa chọn 1
    '[Lựa Chọn 1] Mã Linh Kiện': item.replacementPart,
    '[Lựa Chọn 1] Hãng Sản Xuất (Khác Gốc)': item.replacementManufacturer || '',
    '[Lựa Chọn 1] Phân Loại Thay Thế': item.replacementType,
    '[Lựa Chọn 1] Độ Tương Thích (%)': `${item.compatibilityScore}%`,
    '[Lựa Chọn 1] Trạng Thái Vòng Đời': item.replacementLifecycle || 'Active (Đang SX)',
    '[Lựa Chọn 1] Tồn Kho Phân Phối': item.replacementStockStatus || 'Sẵn hàng (In-Stock)',
    '[Lựa Chọn 1] Thông Số Kỹ Thuật (Đầy Đủ)': item.replacementKeySpecs || item.package || 'Khớp thông số',
    '[Lựa Chọn 1] Đánh Giá So Sánh Với Gốc': item.replacementSpecsComparison || 'Khớp toàn diện thông số kỹ thuật',
    '[Lựa Chọn 1] Giá DigiKey': item.digikeyPrice || 'N/A',
    '[Lựa Chọn 1] Giá Mouser': item.mouserPrice || 'N/A',
    '[Lựa Chọn 1] Link Tra Cứu DigiKey': item.digikeyUrl,
    '[Lựa Chọn 1] Link Tra Cứu Mouser': item.mouserUrl,
    
    // Lựa chọn 2
    '[Lựa Chọn 2] Mã Linh Kiện': item.alt2ReplacementPart || item.replacementPart,
    '[Lựa Chọn 2] Hãng Sản Xuất (Khác Gốc)': item.alt2Manufacturer || 'Hãng Thay Thế',
    '[Lựa Chọn 2] Phân Loại Thay Thế': item.alt2ReplacementType || 'DROP_IN',
    '[Lựa Chọn 2] Độ Tương Thích (%)': `${item.alt2CompatibilityScore || 96}%`,
    '[Lựa Chọn 2] Trạng Thái Vòng Đời': item.alt2Lifecycle || 'Active (Đang SX)',
    '[Lựa Chọn 2] Tồn Kho Phân Phối': item.alt2StockStatus || 'Sẵn hàng (In-Stock)',
    '[Lựa Chọn 2] Thông Số Kỹ Thuật (Đầy Đủ)': item.alt2KeySpecs || item.package || 'Khớp thông số',
    '[Lựa Chọn 2] Đánh Giá So Sánh Với Gốc': item.alt2SpecsComparison || 'Khớp toàn diện thông số kỹ thuật',
    '[Lựa Chọn 2] Giá DigiKey': item.alt2DigikeyPrice || 'N/A',
    '[Lựa Chọn 2] Giá Mouser': item.alt2MouserPrice || 'N/A',
    '[Lựa Chọn 2] Link Tra Cứu DigiKey': item.alt2DigikeyUrl || item.digikeyUrl,
    '[Lựa Chọn 2] Link Tra Cứu Mouser': item.alt2MouserUrl || item.mouserUrl,

    'Khuyến Nghị Kỹ Thuật [Lựa Chọn 1]': item.noteVi,
    'Khuyến Nghị Kỹ Thuật [Lựa Chọn 2]': item.alt2NoteVi || item.noteVi,
  }));

  const worksheet1 = XLSX.utils.json_to_sheet(sheet1Data);

  worksheet1['!cols'] = [
    { wch: 6 },  // STT
    { wch: 16 }, // Vị trí
    { wch: 10 }, // Số lượng
    { wch: 22 }, // Mã Linh Kiện Gốc
    { wch: 20 }, // Hãng Sản Xuất Gốc
    { wch: 24 }, // Phân Loại Linh Kiện
    { wch: 16 }, // Kiểu Đóng Gói
    { wch: 42 }, // Thông Số Kỹ Thuật Gốc
    { wch: 16 }, // Trạng Thái Sản Xuất
    // Alt 1
    { wch: 22 }, // Alt 1 Mã
    { wch: 24 }, // Alt 1 Hãng SX khác gốc
    { wch: 16 }, // Alt 1 Phân Loại
    { wch: 14 }, // Alt 1 Độ Tương Thích
    { wch: 18 }, // Alt 1 Trạng Thái Vòng Đời
    { wch: 20 }, // Alt 1 Tồn Kho Phân Phối
    { wch: 42 }, // Alt 1 Thông số
    { wch: 38 }, // Alt 1 Đánh giá so sánh
    { wch: 14 }, // Alt 1 Giá DigiKey
    { wch: 14 }, // Alt 1 Giá Mouser
    { wch: 35 }, // Alt 1 Link DigiKey
    { wch: 35 }, // Alt 1 Link Mouser
    // Alt 2
    { wch: 22 }, // Alt 2 Mã
    { wch: 24 }, // Alt 2 Hãng SX khác gốc
    { wch: 16 }, // Alt 2 Phân Loại
    { wch: 14 }, // Alt 2 Độ Tương Thích
    { wch: 18 }, // Alt 2 Trạng Thái Vòng Đời
    { wch: 20 }, // Alt 2 Tồn Kho Phân Phối
    { wch: 42 }, // Alt 2 Thông số
    { wch: 38 }, // Alt 2 Đánh giá so sánh
    { wch: 14 }, // Alt 2 Giá DigiKey
    { wch: 14 }, // Alt 2 Giá Mouser
    { wch: 35 }, // Alt 2 Link DigiKey
    { wch: 35 }, // Alt 2 Link Mouser
    { wch: 45 }, // Khuyến nghị kỹ thuật Alt 1
    { wch: 45 }, // Khuyến nghị kỹ thuật Alt 2
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet1, 'BOM_Thay_The_Tuong_Duong');

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
    { 'Hạng Mục': 'Tổng số dòng linh kiện phân tích', 'Giá Trị': results.length },
    { 'Hạng Mục': 'Tổng số lượng linh kiện cần mua', 'Giá Trị': totalQty },
    { 'Hạng Mục': 'Tổng chi phí ước tính trên DigiKey ($)', 'Giá Trị': `$${totalDigiKey.toFixed(2)}` },
    { 'Hạng Mục': 'Tổng chi phí ước tính trên Mouser ($)', 'Giá Trị': `$${totalMouser.toFixed(2)}` },
    {
      'Hạng Mục': 'Chênh lệch chi phí ước tính giữa DigiKey & Mouser ($)',
      'Giá Trị':
        totalDigiKey > 0 && totalMouser > 0
          ? `$${costDiff.toFixed(2)} (${totalDigiKey <= totalMouser ? 'DigiKey giá rẻ hơn' : 'Mouser giá rẻ hơn'})`
          : 'N/A',
    },
    {
      'Hạng Mục': 'Nhà phân phối tối ưu ngân sách hơn',
      'Giá Trị':
        totalDigiKey > 0 && totalMouser > 0
          ? totalDigiKey <= totalMouser ? 'DigiKey' : 'Mouser'
          : 'Tham khảo báo giá thực tế',
    },
  ];

  const worksheet2 = XLSX.utils.json_to_sheet(costData);
  worksheet2['!cols'] = [{ wch: 45 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, worksheet2, 'Tong_Hop_Chi_Phi');

  // Sheet 3: Granular Parametric Comparison Matrix
  const sheet3Data: any[] = [];
  results.forEach((item, rIdx) => {
    if (item.detailedSpecs && item.detailedSpecs.length > 0) {
      item.detailedSpecs.forEach((spec) => {
        sheet3Data.push({
          'STT Linh Kiện': rIdx + 1,
          'Vị Trí (Designator)': item.designator || '',
          'Mã Gốc': item.originalPart,
          'Mã Lựa Chọn 1': item.replacementPart,
          'Mã Lựa Chọn 2': item.alt2ReplacementPart || item.replacementPart,
          'Tên Thông Số Kỹ Thuật': spec.name,
          'Giá Trị Mã Gốc': spec.originalValue,
          'Giá Trị Lựa Chọn 1': spec.alt1Value,
          'Giá Trị Lựa Chọn 2': spec.alt2Value,
          'Độ Khớp': spec.isMatch ? 'Khớp đạt yêu cầu' : 'Tương đương',
          'Ghi Chú Chi Tiết': spec.notes || '',
        });
      });
    } else if (item.originalKeySpecs) {
      // Split pipe-separated specs into individual rows
      const specPairs = item.originalKeySpecs.split('|').map((s) => s.trim()).filter(Boolean);
      specPairs.forEach((sp) => {
        const [k, v] = sp.split(':').map((s) => s.trim());
        sheet3Data.push({
          'STT Linh Kiện': rIdx + 1,
          'Vị Trí (Designator)': item.designator || '',
          'Mã Gốc': item.originalPart,
          'Mã Lựa Chọn 1': item.replacementPart,
          'Mã Lựa Chọn 2': item.alt2ReplacementPart || item.replacementPart,
          'Tên Thông Số Kỹ Thuật': k || 'Thông số',
          'Giá Trị Mã Gốc': v || sp,
          'Giá Trị Lựa Chọn 1': 'Tương đương',
          'Giá Trị Lựa Chọn 2': 'Tương đương',
          'Độ Khớp': 'Khớp đạt yêu cầu',
          'Ghi Chú Chi Tiết': 'Đạt chuẩn datasheet',
        });
      });
    }
  });

  if (sheet3Data.length > 0) {
    const worksheet3 = XLSX.utils.json_to_sheet(sheet3Data);
    worksheet3['!cols'] = [
      { wch: 14 }, // STT
      { wch: 18 }, // Vị Trí
      { wch: 22 }, // Mã Gốc
      { wch: 22 }, // Alt 1
      { wch: 22 }, // Alt 2
      { wch: 30 }, // Tên thông số
      { wch: 26 }, // Giá trị gốc
      { wch: 26 }, // Alt 1
      { wch: 26 }, // Alt 2
      { wch: 20 }, // Độ khớp
      { wch: 35 }, // Ghi chú
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet3, 'Doi_Chieu_Thong_So_Chi_Tiet');
  }

  XLSX.writeFile(workbook, `${projectName}_KetQuaThayThe_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
