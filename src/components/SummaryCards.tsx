"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReconciliationSummary } from "@/types/reconciliation";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileQuestion,
  BarChart3,
} from "lucide-react";

interface SummaryCardsProps {
  summary: ReconciliationSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Records",
      value: summary.totalRecords.toLocaleString("en-IN"),
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Matched",
      value: summary.matchedCount.toLocaleString("en-IN"),
      subtitle: `${summary.matchPercentage}% match rate`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Mismatched",
      value: summary.mismatchedCount.toLocaleString("en-IN"),
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Missing in Purchase",
      value: summary.missingInPurchaseCount.toLocaleString("en-IN"),
      icon: FileQuestion,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Missing in Sales",
      value: summary.missingInSalesCount.toLocaleString("en-IN"),
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`rounded-full p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.subtitle && (
              <p className="text-xs text-gray-500">{card.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface DifferenceCardProps {
  totalDifference: number;
}

export function DifferenceCard({ totalDifference }: DifferenceCardProps) {
  const isPositive = totalDifference > 0;
  
  return (
    <Card className={isPositive ? "border-red-200 bg-red-50/50" : "border-green-200 bg-green-50/50"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          Total Difference Amount
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${isPositive ? "text-red-600" : "text-green-600"}`}>
          {formatCurrency(totalDifference)}
        </div>
        <p className="text-xs text-gray-500">
          {totalDifference === 0
            ? "No discrepancies found"
            : "Sum of all amount differences"}
        </p>
      </CardContent>
    </Card>
  );
}
