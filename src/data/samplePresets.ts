export interface SamplePreset {
  mpn: string;
  category: string;
  commonPackage: string;
  reason: string;
  suggestedAlt: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    mpn: 'RC0603FR-0710KL',
    category: 'Điện trở SMD 10kΩ 0603 1%',
    commonPackage: '0603',
    reason: 'Ưu tiên 4 thông số: 1. Trị số (10k) ➔ 2. Kích thước (0603) ➔ 3. Sai số (≤1%) ➔ 4. Nhiệt độ (-55°C~155°C)',
    suggestedAlt: 'CRCW060310K0FKEA / ERJ-3EKF1002V',
  },
  {
    mpn: 'CC0603KRX7R9BB104',
    category: 'Tụ điện SMD 100nF 50V X7R 0603',
    commonPackage: '0603',
    reason: 'Ưu tiên 5 thông số: 1. Điện dung (100nF) ➔ 2. Kích thước (0603) ➔ 3. Điện áp (≥50V) ➔ 4. Sai số (≤10%) ➔ 5. Nhiệt độ',
    suggestedAlt: 'GRM188R71H104KA93D / CL10B104KB8NNNC',
  },
  {
    mpn: 'LM317T',
    category: 'IC Ổn Áp Tuyến Tính Tuyến Biến (TO-220)',
    commonPackage: 'TO-220',
    reason: 'Phổ biến, tìm phiên bản tương thích chân và thông số từ onsemi hoặc STMicroelectronics',
    suggestedAlt: 'LM317BTG (onsemi) / LM317 (ST)',
  },
  {
    mpn: 'AMS1117-3.3',
    category: 'IC Ổn Áp LDO 3.3V 1A (SOT-223)',
    commonPackage: 'SOT-223',
    reason: 'Ổn áp 3.3V phổ biến, tìm mã thay thế drop-in ổn định cao từ Diodes Inc hoặc Texas Instruments',
    suggestedAlt: 'AP1117E33G-13 / TLV1117-33CDCYR',
  },
  {
    mpn: 'MAX232CPE',
    category: 'IC Thu Phát Tín Hiệu RS-232',
    commonPackage: 'DIP-16',
    reason: 'Mã DIP-16 đắt hoặc hiếm hàng, tìm phương án thay thế drop-in từ Exar / MaxLinear hoặc ST',
    suggestedAlt: 'SP232ECP-L / ST232CN',
  },
  {
    mpn: 'STM32F103C8T6',
    category: 'Vi Điều Khiển 32-bit ARM Cortex-M3',
    commonPackage: 'LQFP-48',
    reason: 'Tìm vi điều khiển tương thích chân (drop-in pin-to-pin) từ GigaDevice hoặc Geehy',
    suggestedAlt: 'GD32F103C8T6 / APM32F103C8T6',
  },
  {
    mpn: 'IRF540N',
    category: 'Transistor Power N-MOSFET 100V',
    commonPackage: 'TO-220AB',
    reason: 'Tìm MOSFET có RDS(on) thấp hơn, chịu dòng cao hơn và sẵn hàng DigiKey/Mouser',
    suggestedAlt: 'STP36NF06L / FQP30N06L',
  },
  {
    mpn: 'NE555P',
    category: 'IC Định Thời Chính Xác 555',
    commonPackage: 'DIP-8',
    reason: 'Tìm bản thay thế chuẩn tương thích chân từ STMicroelectronics hoặc onsemi',
    suggestedAlt: 'NE555N / SA555P',
  },
  {
    mpn: 'TL072CP',
    category: 'IC Khuếch Đại Thuật Toán Kép Nhiễu Thấp',
    commonPackage: 'DIP-8',
    reason: 'Tìm op-amp JFET nhiễu cực thấp tương đương từ STMicroelectronics hoặc onsemi',
    suggestedAlt: 'TL072CN / LF353N',
  },
  {
    mpn: 'DS1307ZN',
    category: 'IC Đồng Hồ Thời Gian Thực RTC I2C',
    commonPackage: 'SOIC-8',
    reason: 'Tìm RTC tương thích thanh ghi và bus I2C từ Microchip hoặc NXP',
    suggestedAlt: 'MCP7940N-I/SN / PCF8563T',
  },
  {
    mpn: 'TPS54331DDAR',
    category: 'IC Nguồn Giảm Áp Step-Down DC-DC',
    commonPackage: 'SO-PowerPAD-8',
    reason: 'Tìm bộ biến đổi buck tương đương tần số và công suất đầu ra',
    suggestedAlt: 'MP1470GJ / LMR14030',
  },
];
