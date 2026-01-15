import {
  FinancialRecord,
  ReconciliationResult,
  ReconciliationSummary,
  MismatchReason,
  ReconciliationStatus,
} from "@/types/reconciliation";

// Tolerance for amount comparison (₹1 for rounding differences)
const AMOUNT_TOLERANCE = 1;

/**
 * Generate a unique match key from a financial record
 * Uses: Invoice Number (primary) + Invoice Date (secondary)
 */
function generateMatchKey(record: FinancialRecord): string {
  // Normalize invoice number: remove spaces, convert to uppercase
  const normalizedInvoiceNo = record.invoiceNo
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  // Normalize date: convert to YYYY-MM-DD format
  let normalizedDate = "";
  if (record.invoiceDate) {
    const dateStr = record.invoiceDate.toString().trim();
    
    // Try different date formats
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const indianMatch = dateStr.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
    
    if (isoMatch) {
      normalizedDate = dateStr;
    } else if (indianMatch) {
      const [, day, month, year] = indianMatch;
      normalizedDate = `${year}-${month}-${day}`;
    } else {
      // Use as-is if format not recognized
      normalizedDate = dateStr;
    }
  }

  return `${normalizedInvoiceNo}|${normalizedDate}`;
}

/**
 * Compare two amounts with tolerance
 */
function compareAmounts(
  amount1: number,
  amount2: number,
  tolerance: number = AMOUNT_TOLERANCE
): { isEqual: boolean; difference: number } {
  const difference = Math.abs(amount1 - amount2);
  return {
    isEqual: difference <= tolerance,
    difference: amount1 - amount2,
  };
}

/**
 * Find mismatches between two records
 */
function findMismatches(
  purchaseRecord: FinancialRecord,
  salesRecord: FinancialRecord
): MismatchReason[] {
  const reasons: MismatchReason[] = [];

  // Compare GSTIN
  const purchaseGstin = purchaseRecord.gstin.toUpperCase().trim();
  const salesGstin = salesRecord.gstin.toUpperCase().trim();
  if (purchaseGstin && salesGstin && purchaseGstin !== salesGstin) {
    reasons.push({
      field: "GSTIN",
      purchaseValue: purchaseRecord.gstin,
      salesValue: salesRecord.gstin,
    });
  }

  // Compare Party Name (case-insensitive)
  const purchaseName = purchaseRecord.partyName.toLowerCase().trim();
  const salesName = salesRecord.partyName.toLowerCase().trim();
  if (purchaseName && salesName && purchaseName !== salesName) {
    // Only flag if names are significantly different (not just minor variations)
    if (!purchaseName.includes(salesName) && !salesName.includes(purchaseName)) {
      reasons.push({
        field: "Party Name",
        purchaseValue: purchaseRecord.partyName,
        salesValue: salesRecord.partyName,
      });
    }
  }

  // Compare Taxable Amount
  const taxableComparison = compareAmounts(
    purchaseRecord.taxableAmount,
    salesRecord.taxableAmount
  );
  if (!taxableComparison.isEqual) {
    reasons.push({
      field: "Taxable Amount",
      purchaseValue: purchaseRecord.taxableAmount,
      salesValue: salesRecord.taxableAmount,
      difference: taxableComparison.difference,
    });
  }

  // Compare IGST
  const igstComparison = compareAmounts(purchaseRecord.igst, salesRecord.igst);
  if (!igstComparison.isEqual) {
    reasons.push({
      field: "IGST",
      purchaseValue: purchaseRecord.igst,
      salesValue: salesRecord.igst,
      difference: igstComparison.difference,
    });
  }

  // Compare CGST
  const cgstComparison = compareAmounts(purchaseRecord.cgst, salesRecord.cgst);
  if (!cgstComparison.isEqual) {
    reasons.push({
      field: "CGST",
      purchaseValue: purchaseRecord.cgst,
      salesValue: salesRecord.cgst,
      difference: cgstComparison.difference,
    });
  }

  // Compare SGST
  const sgstComparison = compareAmounts(purchaseRecord.sgst, salesRecord.sgst);
  if (!sgstComparison.isEqual) {
    reasons.push({
      field: "SGST",
      purchaseValue: purchaseRecord.sgst,
      salesValue: salesRecord.sgst,
      difference: sgstComparison.difference,
    });
  }

  // Compare Total Amount
  const totalComparison = compareAmounts(
    purchaseRecord.totalAmount,
    salesRecord.totalAmount
  );
  if (!totalComparison.isEqual) {
    reasons.push({
      field: "Total Amount",
      purchaseValue: purchaseRecord.totalAmount,
      salesValue: salesRecord.totalAmount,
      difference: totalComparison.difference,
    });
  }

  return reasons;
}

/**
 * Main reconciliation function
 * Compares purchase and sales datasets to find matches, mismatches, and missing records
 */
export function reconcileDatasets(
  purchaseRecords: FinancialRecord[],
  salesRecords: FinancialRecord[]
): ReconciliationResult[] {
  const results: ReconciliationResult[] = [];

  // Create lookup maps using match keys
  const purchaseMap = new Map<string, FinancialRecord>();
  const salesMap = new Map<string, FinancialRecord>();

  // Build purchase lookup
  for (const record of purchaseRecords) {
    const key = generateMatchKey(record);
    purchaseMap.set(key, record);
  }

  // Build sales lookup
  for (const record of salesRecords) {
    const key = generateMatchKey(record);
    salesMap.set(key, record);
  }

  // Track processed keys
  const processedKeys = new Set<string>();

  // Process all purchase records
  for (const [key, purchaseRecord] of purchaseMap) {
    processedKeys.add(key);

    const salesRecord = salesMap.get(key);

    if (!salesRecord) {
      // Missing in sales
      results.push({
        id: `result-${results.length}`,
        status: "missing_in_sales",
        purchaseRecord,
        salesRecord: null,
        matchKey: key,
        mismatchReasons: [],
        totalDifference: purchaseRecord.totalAmount,
      });
    } else {
      // Found matching record - check for mismatches
      const mismatches = findMismatches(purchaseRecord, salesRecord);

      if (mismatches.length === 0) {
        // Perfect match
        results.push({
          id: `result-${results.length}`,
          status: "matched",
          purchaseRecord,
          salesRecord,
          matchKey: key,
          mismatchReasons: [],
          totalDifference: 0,
        });
      } else {
        // Mismatched
        const totalDiff = mismatches.find((m) => m.field === "Total Amount");
        results.push({
          id: `result-${results.length}`,
          status: "mismatched",
          purchaseRecord,
          salesRecord,
          matchKey: key,
          mismatchReasons: mismatches,
          totalDifference: totalDiff?.difference || 0,
        });
      }
    }
  }

  // Process remaining sales records (missing in purchase)
  for (const [key, salesRecord] of salesMap) {
    if (!processedKeys.has(key)) {
      results.push({
        id: `result-${results.length}`,
        status: "missing_in_purchase",
        purchaseRecord: null,
        salesRecord,
        matchKey: key,
        mismatchReasons: [],
        totalDifference: -salesRecord.totalAmount,
      });
    }
  }

  return results;
}

/**
 * Calculate summary statistics from reconciliation results
 */
export function calculateSummary(
  results: ReconciliationResult[]
): ReconciliationSummary {
  const totalRecords = results.length;
  const matchedCount = results.filter((r) => r.status === "matched").length;
  const mismatchedCount = results.filter((r) => r.status === "mismatched").length;
  const missingInPurchaseCount = results.filter(
    (r) => r.status === "missing_in_purchase"
  ).length;
  const missingInSalesCount = results.filter(
    (r) => r.status === "missing_in_sales"
  ).length;

  const matchPercentage =
    totalRecords > 0 ? Math.round((matchedCount / totalRecords) * 100) : 0;

  const totalDifferenceAmount = results.reduce(
    (sum, r) => sum + Math.abs(r.totalDifference),
    0
  );

  return {
    totalRecords,
    matchedCount,
    mismatchedCount,
    missingInPurchaseCount,
    missingInSalesCount,
    matchPercentage,
    totalDifferenceAmount,
  };
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: ReconciliationStatus): string {
  switch (status) {
    case "matched":
      return "Matched";
    case "mismatched":
      return "Mismatched";
    case "missing_in_purchase":
      return "Missing in Purchase";
    case "missing_in_sales":
      return "Missing in Sales";
  }
}

/**
 * Get status color for badges
 */
export function getStatusColor(
  status: ReconciliationStatus
): "success" | "destructive" | "warning" | "secondary" {
  switch (status) {
    case "matched":
      return "success";
    case "mismatched":
      return "destructive";
    case "missing_in_purchase":
      return "warning";
    case "missing_in_sales":
      return "warning";
  }
}
