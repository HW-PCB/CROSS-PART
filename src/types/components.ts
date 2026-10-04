export type ReplacementType = 'DROP_IN' | 'PIN_COMPATIBLE' | 'FUNCTIONAL' | 'UPGRADED';

export type LifecycleStatus = 'Active' | 'NRND' | 'EOL' | 'Obsolete' | 'Mature' | 'Unknown';

export type PassiveComponentType = 'resistor' | 'capacitor' | 'inductor' | 'other';

export interface PassiveRuleCheck {
  priority: number;
  paramKey: string;
  paramNameVi: string;
  paramNameEn: string;
  ruleDescriptionVi: string;
  ruleDescriptionEn: string;
  originalValue: string;
  candidateValue: string;
  status: 'EXACT_MATCH' | 'COMPLIANT_OR_BETTER' | 'MISMATCH';
  notesVi?: string;
  notesEn?: string;
}

export interface PassiveEvaluation {
  isPassive: boolean;
  type: 'resistor' | 'capacitor';
  rules: PassiveRuleCheck[];
  allCompliant: boolean;
  summaryVi: string;
  summaryEn?: string;
}

export interface ParametricSpec {
  name: string;
  originalValue: string;
  candidateValue: string;
  isMatch: boolean;
  notes?: string;
}

export interface DistributorPriceBreak {
  unitPrice: string;
  tier100?: string;
  tier1000?: string;
  stockStatus?: string;
}

export interface PricingComparison {
  digikey?: DistributorPriceBreak;
  mouser?: DistributorPriceBreak;
  lcsc?: DistributorPriceBreak;
  cheapestDistributor?: 'DigiKey' | 'Mouser' | 'LCSC' | 'Tie';
  savingsEstimateVi?: string;
  savingsEstimateEn?: string;
}

export interface ReplacementCandidate {
  partNumber: string;
  manufacturer: string;
  replacementType: ReplacementType;
  compatibilityScore: number;
  lifecycleStatus: LifecycleStatus;
  package: string;
  mountingType?: 'SMD/SMT' | 'Through-Hole' | 'Chassis' | 'Other';
  summaryVi: string;
  summaryEn: string;
  advantages: string[];
  cautions: string[];
  keySpecs?: { [key: string]: string };
  parametricComparison?: ParametricSpec[];
  pricing?: PricingComparison;
  lcscPartCode?: string;
  digikeySearchUrl: string;
  mouserSearchUrl: string;
  lcscSearchUrl: string;
  passiveEvaluation?: PassiveEvaluation;
}

export interface OriginalPartProfile {
  partNumber: string;
  manufacturer: string;
  category: string;
  subCategory?: string;
  lifecycleStatus: LifecycleStatus;
  package: string;
  pinCount?: number;
  pinoutSummary?: { pin: string; function: string }[];
  descriptionVi: string;
  descriptionEn?: string;
  commonApplications?: string[];
  keySpecs?: { [key: string]: string };
  lcscPartCode?: string;
  digikeySearchUrl: string;
  mouserSearchUrl: string;
  lcscSearchUrl: string;
  passiveType?: PassiveComponentType;
}

export interface CrossReferenceResult {
  originalPart: OriginalPartProfile;
  candidates: ReplacementCandidate[];
  designRecommendationsVi?: string;
  designRecommendationsEn?: string;
}

export interface BomItemResult {
  designator?: string;
  quantity?: number;
  originalPart: string;
  originalManufacturer?: string;
  category?: string;
  package?: string;
  lifecycleStatus?: LifecycleStatus;
  originalKeySpecs?: string;
  
  // Passive classification & compliance
  isPassive?: boolean;
  passiveType?: 'resistor' | 'capacitor';
  passiveComplianceVi?: string;
  
  // Alternative 1 (Lựa chọn thay thế 1)
  replacementPart: string;
  replacementManufacturer?: string;
  replacementType: ReplacementType;
  compatibilityScore: number;
  replacementLifecycle?: string;
  replacementKeySpecs?: string;
  replacementSpecsComparison?: string;
  lcscPartCode?: string;
  digikeyPrice?: string;
  mouserPrice?: string;
  lcscPrice?: string;
  cheapestDistributor?: 'DigiKey' | 'Mouser' | 'LCSC' | 'Tie';
  digikeyUrl: string;
  mouserUrl: string;
  lcscUrl: string;
  noteVi: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';

  // Alternative 2 (Lựa chọn thay thế 2)
  alt2ReplacementPart?: string;
  alt2Manufacturer?: string;
  alt2ReplacementType?: ReplacementType;
  alt2CompatibilityScore?: number;
  alt2Lifecycle?: string;
  alt2KeySpecs?: string;
  alt2SpecsComparison?: string;
  alt2LcscPartCode?: string;
  alt2DigikeyPrice?: string;
  alt2MouserPrice?: string;
  alt2LcscPrice?: string;
  alt2CheapestDistributor?: 'DigiKey' | 'Mouser' | 'LCSC' | 'Tie';
  alt2DigikeyUrl?: string;
  alt2MouserUrl?: string;
  alt2LcscUrl?: string;
  alt2NoteVi?: string;
}

export interface PinoutComparisonResult {
  isPinToPinDropIn: boolean;
  packageMatch: boolean;
  pinComparison: {
    pinNumber: string;
    originalPinFunction: string;
    candidatePinFunction: string;
    isIdentical: boolean;
    note?: string;
  }[];
  pcbModificationsRequired: boolean;
  circuitModificationsNoticeVi?: string;
  verdictVi: string;
}
