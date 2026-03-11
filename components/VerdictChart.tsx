"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface VerdictChartProps {
  sql?: number;
  mql?: number;
  qualified?: number;
  disqualified: number;
  lowPriority: number;
}

const COLORS = ["#16a34a", "#2563eb", "#dc2626", "#f59e0b"];

export default function VerdictChart({
  sql = 0,
  mql = 0,
  qualified = 0,
  disqualified,
  lowPriority,
}: VerdictChartProps) {
  // Support both old and new API
  const sqlCount = sql > 0 ? sql : qualified;

  const data = [
    { name: "SQL", value: sqlCount },
    { name: "MQL", value: mql },
    { name: "Disqualified", value: disqualified },
    { name: "Low Priority", value: lowPriority },
  ].filter((item) => item.value > 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Lead Distribution by Status
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }: any) =>
              `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} leads`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
