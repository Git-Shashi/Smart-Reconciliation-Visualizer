import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    // Try DD-MM-YYYY format
    const parts = date.split(/[-/]/);
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(`${year}-${month}-${day}`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    return date;
  }
  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function parseNumber(value: string | number): number {
  if (typeof value === "number") return value;
  const cleaned = value.replace(/[₹,\s]/g, "");
  return parseFloat(cleaned) || 0;
}
