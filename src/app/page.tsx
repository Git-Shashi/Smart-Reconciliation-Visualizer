"use client";

import { useState, useCallback } from "react";
import { FileUpload } from "@/components/FileUpload";
import { SummaryCards, DifferenceCard } from "@/components/SummaryCards";
import { ReconciliationChart } from "@/components/ReconciliationChart";
import { ResultsTable } from "@/components/ResultsTable";
import { FilterPanel, exportToCSV } from "@/components/FilterPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialRecord, ReconciliationResult, ReconciliationSummary, DatasetInfo } from "@/types/reconciliation";
import { reconcileDatasets, calculateSummary } from "@/lib/reconciliation";
import { ArrowRight, RefreshCw, FileSpreadsheet, Download } from "lucide-react";

export default function Home() {
  // Dataset states
  const [purchaseRecords, setPurchaseRecords] = useState<FinancialRecord[]>([]);
  const [salesRecords, setSalesRecords] = useState<FinancialRecord[]>([]);
  const [purchaseInfo, setPurchaseInfo] = useState<DatasetInfo | null>(null);
  const [salesInfo, setSalesInfo] = useState<DatasetInfo | null>(null);

  // Results states
  const [results, setResults] = useState<ReconciliationResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<ReconciliationResult[]>([]);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [activeTab, setActiveTab] = useState("upload");

  // Handle purchase data upload
  const handlePurchaseData = useCallback((records: FinancialRecord[], fileName: string, columns: string[]) => {
    if (records.length === 0) {
      setPurchaseRecords([]);
      setPurchaseInfo(null);
      return;
    }
    setPurchaseRecords(records);
    setPurchaseInfo({
      fileName,
      recordCount: records.length,
      columns,
      uploadedAt: new Date(),
    });
  }, []);

  // Handle sales data upload
  const handleSalesData = useCallback((records: FinancialRecord[], fileName: string, columns: string[]) => {
    if (records.length === 0) {
      setSalesRecords([]);
      setSalesInfo(null);
      return;
    }
    setSalesRecords(records);
    setSalesInfo({
      fileName,
      recordCount: records.length,
      columns,
      uploadedAt: new Date(),
    });
  }, []);

  // Run reconciliation
  const runReconciliation = useCallback(() => {
    const reconciliationResults = reconcileDatasets(purchaseRecords, salesRecords);
    const reconciliationSummary = calculateSummary(reconciliationResults);
    
    setResults(reconciliationResults);
    setFilteredResults(reconciliationResults);
    setSummary(reconciliationSummary);
    setActiveTab("results");
  }, [purchaseRecords, salesRecords]);

  // Reset everything
  const resetAll = () => {
    setPurchaseRecords([]);
    setSalesRecords([]);
    setPurchaseInfo(null);
    setSalesInfo(null);
    setResults([]);
    setFilteredResults([]);
    setSummary(null);
    setActiveTab("upload");
  };

  // Handle export
  const handleExport = () => {
    exportToCSV(filteredResults, `reconciliation-report-${new Date().toISOString().split("T")[0]}.csv`);
  };

  // Download sample files
  const downloadSample = (type: "purchase" | "sales") => {
    const filename = type === "purchase" ? "sample-purchase-register.csv" : "sample-sales-register.csv";
    window.open(`/samples/${filename}`, "_blank");
  };

  const canReconcile = purchaseRecords.length > 0 && salesRecords.length > 0;
  const hasResults = results.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Smart Reconciliation Visualizer
                </h1>
                <p className="text-sm text-gray-500">
                  Compare and reconcile financial datasets with ease
                </p>
              </div>
            </div>
            {hasResults && (
              <Button variant="outline" onClick={resetAll}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Start Over
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upload">
              1. Upload Data
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!hasResults}>
              2. View Results
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <div className="space-y-6">
              {/* Sample Data Info */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-blue-800">
                    Getting Started
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Upload your Purchase Register and Sales Register CSV files to begin reconciliation.
                    Need sample files to test?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadSample("purchase")}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Sample Purchase Register
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadSample("sales")}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Sample Sales Register
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* File Upload Cards */}
              <div className="grid gap-6 md:grid-cols-2">
                <FileUpload
                  datasetType="purchase"
                  onDataLoaded={handlePurchaseData}
                  isLoaded={purchaseRecords.length > 0}
                  fileName={purchaseInfo?.fileName}
                  recordCount={purchaseInfo?.recordCount}
                />
                <FileUpload
                  datasetType="sales"
                  onDataLoaded={handleSalesData}
                  isLoaded={salesRecords.length > 0}
                  fileName={salesInfo?.fileName}
                  recordCount={salesInfo?.recordCount}
                />
              </div>

              {/* Reconcile Button */}
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  onClick={runReconciliation}
                  disabled={!canReconcile}
                  className="px-8"
                >
                  Run Reconciliation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {!canReconcile && (purchaseRecords.length > 0 || salesRecords.length > 0) && (
                <p className="text-center text-sm text-gray-500">
                  Please upload both datasets to run reconciliation
                </p>
              )}
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            {summary && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <SummaryCards summary={summary} />

                {/* Charts and Difference */}
                <div className="grid gap-6 md:grid-cols-2">
                  <ReconciliationChart summary={summary} />
                  <DifferenceCard totalDifference={summary.totalDifferenceAmount} />
                </div>

                {/* Filters */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Filter Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FilterPanel
                      results={results}
                      onFilteredResults={setFilteredResults}
                      onExport={handleExport}
                    />
                  </CardContent>
                </Card>

                {/* Results Table */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      Reconciliation Details
                    </CardTitle>
                    <CardDescription>
                      Showing {filteredResults.length} of {results.length} records.
                      Click on a row to see more details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResultsTable data={filteredResults} />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Smart Reconciliation Visualizer • Built for WFYI Technology Assessment
          </p>
        </div>
      </footer>
    </div>
  );
}
