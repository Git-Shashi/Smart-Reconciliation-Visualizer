"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReconciliationSummary } from "@/types/reconciliation";

interface ReconciliationChartProps {
  summary: ReconciliationSummary;
}

const COLORS = {
  matched: "#22c55e", // green-500
  mismatched: "#ef4444", // red-500
  missingInPurchase: "#f97316", // orange-500
  missingInSales: "#eab308", // yellow-500
};

export function ReconciliationChart({ summary }: ReconciliationChartProps) {
  const data = [
    { name: "Matched", value: summary.matchedCount, color: COLORS.matched },
    { name: "Mismatched", value: summary.mismatchedCount, color: COLORS.mismatched },
    {
      name: "Missing in Purchase",
      value: summary.missingInPurchaseCount,
      color: COLORS.missingInPurchase,
    },
    {
      name: "Missing in Sales",
      value: summary.missingInSalesCount,
      color: COLORS.missingInSales,
    },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reconciliation Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <p className="text-gray-500">No data to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Reconciliation Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [
                  (value as number).toLocaleString("en-IN"),
                  "Records",
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
