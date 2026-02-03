// src/utils.ts
import { SIZE_ORDER, OrderRow, ValidationResult, ToastType } from "./types";

export const normalizeSizes = (size: string = ""): string => {
  size = size.toUpperCase().trim();
  const map: Record<string, string> = {
    XXL: "2XL",
    XXXL: "3XL",
    XXXXL: "4XL",
    XXXXXL: "5XL",
  };
  if (map[size]) return map[size];
  if (/^\d+$/.test(size)) {
    const num = parseInt(size);
    return String(num % 2 === 0 ? num : num + 1);
  }
  return size;
};

export const formatSizeForDisplay = (size: string): string => {
  return /^\d+$/.test(size) ? `${size} KIDS` : size;
};

export const parseLine = (line: string): OrderRow => {
  const parts = line.split(/\s*---\s*/);
  const clean = (value: string = ""): string =>
    /^\s*$/.test(value) ? "" : value.trim();
  return {
    SIZE: parts[0] !== undefined ? normalizeSizes(parts[0]) : "",
    NAME: parts[1] !== undefined ? clean(parts[1]).toUpperCase() : "",
    NUMBER: parts[2] !== undefined ? clean(parts[2]).toUpperCase() : "",
    SLEEVE: parts[3] !== undefined ? (parts[3] || "").toUpperCase() : "",
    RIB: parts[4] !== undefined ? (parts[4] || "").toUpperCase() : "",
    PANT: parts[5] !== undefined ? (parts[5] || "").toUpperCase() : "",
  };
};

export const validateRow = (row: OrderRow): ValidationResult => {
  if (!row.SIZE || !SIZE_ORDER.includes(row.SIZE))
    return { valid: false, reason: "Invalid Size" };
  if (row.SLEEVE && row.SLEEVE !== "LONG" && row.SLEEVE !== "SHORT")
    return { valid: false, reason: "Invalid Sleeve" };
  if (row.RIB && row.RIB !== "LONG" && row.RIB !== "SHORT" && row.RIB !== "NO")
    return { valid: false, reason: "Invalid RIB" };
  if (
    row.PANT &&
    row.PANT !== "LONG" &&
    row.PANT !== "SHORT" &&
    row.PANT !== "NO"
  )
    return { valid: false, reason: "Invalid PANT" };
  return { valid: true };
};

export const sortSizes = (sizes: string[]): string[] => {
  return sizes.sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));
};

export const showToast = (message: string, type: ToastType = "info"): void => {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
};

export const getElement = <T extends HTMLElement>(id: string): T | null => {
  return document.getElementById(id) as T | null;
};
