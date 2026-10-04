export function getDigiKeyUrl(partNumber: string): string {
  return `https://www.digikey.com/en/products/result?keywords=${encodeURIComponent(partNumber.trim())}`;
}

export function getMouserUrl(partNumber: string): string {
  return `https://www.mouser.com/c/?q=${encodeURIComponent(partNumber.trim())}`;
}

export function getLcscUrl(partNumber: string): string {
  return `https://www.lcsc.com/search?q=${encodeURIComponent(partNumber.trim())}`;
}

export function getOctopartUrl(partNumber: string): string {
  return `https://octopart.com/search?q=${encodeURIComponent(partNumber.trim())}`;
}

export function getDatasheetUrl(partNumber: string): string {
  return `https://www.alldatasheet.com/view.jsp?Searchword=${encodeURIComponent(partNumber.trim())}`;
}

export function formatCompatibilityLabel(type: string, lang: 'vi' | 'en' = 'vi'): {
  title: string;
  badgeClass: string;
  dotColor: string;
  description: string;
} {
  switch (type) {
    case 'DROP_IN':
      return {
        title: lang === 'vi' ? 'Drop-in 100% (Trực tiếp)' : '100% Drop-in Replacement',
        badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
        dotColor: 'bg-emerald-500',
        description:
          lang === 'vi'
            ? 'Hoàn toàn tương thích chân (pin-to-pin) và kích thước đóng gói (package/footprint). Thay thế trực tiếp không cần sửa đổi PCB.'
            : 'Exact pin-to-pin & footprint match. Directly solderable with no PCB or schematic changes.',
      };
    case 'PIN_COMPATIBLE':
      return {
        title: lang === 'vi' ? 'Tương thích chân (Pin-Compatible)' : 'Pin-Compatible',
        badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
        dotColor: 'bg-blue-500',
        description:
          lang === 'vi'
            ? 'Cùng sơ đồ chân và package, nhưng cần kiểm tra lại một số thông số điện (như tụ lọc ESR, dòng tĩnh, điện áp sụt).'
            : 'Same pinout & package. Verify minor electrical params (ESR, quiescent current, dropout).',
      };
    case 'UPGRADED':
      return {
        title: lang === 'vi' ? 'Linh kiện nâng cấp (Upgraded)' : 'Upgraded Alternative',
        badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
        dotColor: 'bg-amber-500',
        description:
          lang === 'vi'
            ? 'Linh kiện đời mới với thông số kỹ thuật vượt trội (chịu áp/dòng cao hơn, RDSon thấp hơn, hiệu suất tốt hơn).'
            : 'Modern replacement with superior electrical specs (higher voltage/current, lower RDSon, modern availability).',
      };
    case 'FUNCTIONAL':
    default:
      return {
        title: lang === 'vi' ? 'Tương đương chức năng' : 'Functional Equivalent',
        badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
        dotColor: 'bg-purple-500',
        description:
          lang === 'vi'
            ? 'Cùng chức năng mạch điện tử nhưng có thể khác chân, package hoặc cần linh kiện thụ động phụ trợ.'
            : 'Performs identical circuit role, but may require different footprint or minor passive adjustments.',
      };
  }
}

export function formatLifecycleBadge(status: string, lang: 'vi' | 'en' = 'vi'): {
  label: string;
  badgeClass: string;
} {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return {
        label: lang === 'vi' ? 'Đang sản xuất (Active)' : 'Active Production',
        badgeClass: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
      };
    case 'NRND':
      return {
        label: lang === 'vi' ? 'Không khuyến nghị dự án mới (NRND)' : 'Not Recommended (NRND)',
        badgeClass: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
      };
    case 'EOL':
      return {
        label: lang === 'vi' ? 'Sắp ngừng sản xuất (EOL)' : 'End-of-Life (EOL)',
        badgeClass: 'text-orange-700 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
      };
    case 'OBSOLETE':
      return {
        label: lang === 'vi' ? 'Đã ngừng sản xuất (Obsolete)' : 'Obsolete',
        badgeClass: 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
      };
    default:
      return {
        label: status || (lang === 'vi' ? 'Không rõ' : 'Unknown'),
        badgeClass: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300',
      };
  }
}
