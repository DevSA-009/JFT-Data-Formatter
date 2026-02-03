// src/types.ts - Type definitions

export interface OrderRow {
  SIZE: string;
  NAME: string;
  NUMBER: string;
  SLEEVE: string;
  RIB: string;
  PANT: string;
  MISSED?: boolean;
  REASON?: string;
}

export interface SummaryData {
  TOTAL: number;
  LONG: number;
  SHORT: number;
  PANT: number;
}

export interface AnalysisResult {
  hasName: boolean;
  hasNumber: boolean;
  hasSleeve: boolean;
  hasRib: boolean;
  hasPant: boolean;
  sleeveInfo: string;
  ribInfo: string;
  pantInfo: string;
  hasLongInSummary: boolean;
  hasShortInSummary: boolean;
  hasPantInSummary: boolean;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export type FormatType = "format2" | "format4" | "format5";

export type ToastType = "info" | "success" | "error";

export const SIZE_ORDER: readonly string[] = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
  "5XL",
  "2",
  "4",
  "6",
  "8",
  "10",
  "12",
  "14",
  "16",
] as const;

export const STORAGE_KEYS = {
  FORMAT: "order_formatter_last_format",
  ORDER_DATA: "order_formatter_last_data",
} as const;

export const PLACEHOLDER_IMAGE = "/placeholder.svg";
