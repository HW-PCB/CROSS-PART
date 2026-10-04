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
    reason: 'Ưu tiên 4 thông số: 1. Resistance (10k) ➔ 2. Package (0603) ➔ 3. Tolerance (≤1%) ➔ 4. Temp (-55°C~155°C)',
    suggestedAlt: 'CRCW060310K0FKEA / C25804',
  },
  {
    mpn: 'CC0603KRX7R9BB104',
    category: 'Tụ điện SMD 100nF 50V X7R 0603',
    commonPackage: '0603',
    reason: 'Ưu tiên 5 thông số: 1. Capacitance (100nF) ➔ 2. Package (0603) ➔ 3. Voltage (≥50V) ➔ 4. Tolerance (≤10%) ➔ 5. Temp',
    suggestedAlt: 'GRM188R71H104KA93D / C14663',
  },
  {
    mpn: 'LM317T',
    category: 'Linear Voltage Regulator',
    commonPackage: 'TO-220',
    reason: 'Phổ biến, tìm phiên bản LDO hiệu suất cao hoặc chính hãng ON Semi/ST/LCSC',
    suggestedAlt: 'NCP317TG / LD1117V33',
  },
  {
    mpn: 'C2040',
    category: 'LCSC Linear Regulator (LM317T)',
    commonPackage: 'TO-220',
    reason: 'Mã part trực tiếp từ LCSC, so sánh giá cực rẻ với DigiKey/Mouser',
    suggestedAlt: 'LM317T / UTC LM317L',
  },
  {
    mpn: 'MAX232CPE',
    category: 'RS-232 Transceiver',
    commonPackage: 'DIP-16',
    reason: 'Part cũ DIP-16 đắt hoặc hiếm, cần tìm mã tương đương từ TI hoặc Exar',
    suggestedAlt: 'MAX232ECPE+ / SP232ECP-L',
  },
  {
    mpn: 'STM32F103C8T6',
    category: '32-bit ARM Cortex-M3 MCU',
    commonPackage: 'LQFP-48',
    reason: 'Từng khủng hoảng nguồn cung chip, tìm pin-to-pin drop-in từ GD32 hoặc APM32',
    suggestedAlt: 'GD32F103C8T6 / APM32F103C8T6',
  },
  {
    mpn: 'IRF540N',
    category: 'N-Channel Power MOSFET 100V',
    commonPackage: 'TO-220AB',
    reason: 'Tìm MOSFET hiện đại RDS(on) thấp hơn, hoạt động mát hơn trên DigiKey/Mouser',
    suggestedAlt: 'IRFB4110PBF / FDP047N10',
  },
  {
    mpn: 'NE555P',
    category: 'Precision Timer',
    commonPackage: 'DIP-8',
    reason: 'Tìm bản CMOS tiết kiệm điện năng TLC555 hoặc ICM7555',
    suggestedAlt: 'TLC555CP / ICM7555IPAZ',
  },
  {
    mpn: 'TL072CP',
    category: 'Low-Noise Dual JFET Op-Amp',
    commonPackage: 'DIP-8',
    reason: 'Tìm bản thay thế nhiễu cực thấp hoặc OPA hiện đại pin-compatible',
    suggestedAlt: 'OPA2134PA / LF353N',
  },
  {
    mpn: 'DS1307ZN',
    category: 'I2C Real-Time Clock (RTC)',
    commonPackage: 'SOIC-8',
    reason: 'Độ chính xác thạch anh ngoài kém, tìm mã tích hợp TCXO pin-compatible',
    suggestedAlt: 'DS3231MZ+ / PCF8563T',
  },
  {
    mpn: 'TPS54331DDAR',
    category: 'Step-Down DC-DC Converter',
    commonPackage: 'SO-PowerPAD-8',
    reason: 'Tìm buck converter tương đương pinout và tần số đóng cắt',
    suggestedAlt: 'MP1470GJ / LMR14030',
  },
];
