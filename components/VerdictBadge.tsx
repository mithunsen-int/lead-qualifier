"use client";

import { getVerdictColor } from "@/lib/analytics";

interface VerdictBadgeProps {
  verdict: "Qualified" | "Disqualified" | "Nurture";
  className?: string;
}

export default function VerdictBadge({
  verdict,
  className = "",
}: VerdictBadgeProps) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getVerdictColor(verdict)} ${className}`}
    >
      {verdict}
    </span>
  );
}
