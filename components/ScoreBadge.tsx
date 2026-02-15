"use client";

import { getScoreColor } from "@/lib/analytics";

interface ScoreBadgeProps {
  score: number;
  label?: string;
  className?: string;
}

export default function ScoreBadge({
  score,
  label = "Score",
  className = "",
}: ScoreBadgeProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex flex-col">
        <span className="text-xs text-slate-500">{label}</span>
        <span className={`text-lg font-bold ${getScoreColor(score)}`}>
          {score.toFixed(1)}
        </span>
      </div>
      <div className="w-16 h-16 rounded-full border-4 border-slate-200 flex items-center justify-center">
        <div
          className={`text-center ${getScoreColor(score)}`}
          style={{
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {Math.round((score / 100) * 100)}%
        </div>
      </div>
    </div>
  );
}
