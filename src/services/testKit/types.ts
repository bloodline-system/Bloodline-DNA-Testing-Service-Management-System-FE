export interface TestKit {
  id: number;
  kitName: string;
  kitType: string;
  sampleType: string;
  basePrice: number;
  currentPrice: number;
  quantityInStock: number;
  kitDescription?: string;
  expiryDate: string;
  producedBy: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestKitRequest {
  kitName: string;
  kitType:
    | "PATERNITY"
    | "MATERNITY"
    | "SIBLING"
    | "GRANDPARENT"
    | "ANCESTRY"
    | "RELATIONSHIP"
    | "FORENSIC"
    | "IMMIGRATION"
    | "PRENATAL"
    | "TWIN_ZYGOSITY"
    | "GENETIC_HEALTH"
    | "CARRIER_SCREENING"
    | "PHARMACOGENOMICS"
    | "OTHER";
  sampleType:
    | "BLOOD"
    | "URINE"
    | "SALIVA"
    | "TISSUE"
    | "HAIR"
    | "SEMEN"
    | "SWAB"
    | "NAIL"
    | "OTHER";
  basePrice: number;
  currentPrice: number;
  quantityInStock: number;
  kitDescription?: string;
  expiryDate: string;
  producedBy: string;
  isAvailable?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}
