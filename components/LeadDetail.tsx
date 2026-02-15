import { Lead } from "@/types/lead";
import Link from "next/link";
import ScoreBadge from "./ScoreBadge";

interface LeadDetailProps {
  lead: Lead;
}

export default function LeadDetail({ lead }: LeadDetailProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {lead.leadInfo.leadName}
          </h2>
          <p className="text-sm text-slate-500">
            {lead.leadInfo.jobTitle} • {lead.leadInfo.companyName}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ScoreBadge score={lead.leadScore} />
          {(() => {
            const label =
              lead.isQualified === true
                ? "Qualified"
                : lead.isQualified === false
                  ? "Disqualified"
                  : lead.status;

            const colorClass =
              lead.isQualified === true
                ? "bg-green-100 text-green-800"
                : lead.isQualified === false
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800";

            return (
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}
              >
                {label}
              </span>
            );
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Contact</h3>
          <p className="text-sm text-slate-600">
            Email: {lead.leadInfo.leadEmail}
          </p>
          <p className="text-sm text-slate-600">
            Phone: {lead.leadInfo.leadPhone || "N/A"}
          </p>
          <p className="text-sm text-slate-600">
            Location: {lead.leadInfo.location || "N/A"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Company</h3>
          <p className="text-sm text-slate-600">
            Website: {lead.leadInfo.companyWebsite || "N/A"}
          </p>
          <p className="text-sm text-slate-600">
            Industry: {lead.leadInfo.leadIndustry || "N/A"}
          </p>
          <p className="text-sm text-slate-600">
            Company size: {lead.leadInfo.coSize || "N/A"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">
            Scores & Evidence
          </h3>
          <ul className="text-sm text-slate-600 space-y-2">
            <li>
              Budget: {lead.budgetScore} — {lead.budgetEvidence || "N/A"}
            </li>
            <li>
              Authority: {lead.authorityScore} —{" "}
              {lead.authorityEvidence || "N/A"}
            </li>
            <li>
              Need: {lead.needScore} — {lead.needEvidence || "N/A"}
            </li>
            <li>
              Timeline: {lead.timelineScore} — {lead.timelineEvidence || "N/A"}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Notes</h3>
          <p className="text-sm text-slate-600">
            Final assessment: {lead.overallAssessment || "N/A"}
          </p>
          <p className="text-sm text-slate-600">
            Qualification reason: {lead.qualificationReason || "N/A"}
          </p>
          <p className="text-sm text-slate-600">
            Disqualification reason: {lead.disQualificationReason || "N/A"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Lead Data</h3>
        <div className="bg-slate-50 p-4 rounded">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <div className="text-xs text-slate-500">Lead type</div>
              <div className="text-sm text-slate-700">
                {lead.leadInfo.leadData?.lead_type || "—"}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Primary need</div>
              <div className="text-sm text-slate-700">
                {lead.leadInfo.leadData?.primary_need || "—"}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Proposed solution</div>
              <div className="text-sm text-slate-700">
                {lead.leadInfo.leadData?.proposed_solution || "—"}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Success criteria</div>
              {lead.leadInfo.leadData?.success_criteria &&
              lead.leadInfo.leadData.success_criteria.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-slate-700">
                  {lead.leadInfo.leadData.success_criteria.map((sc, idx) => (
                    <li key={idx}>{sc}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-700">—</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-500">Created</div>
          <div className="text-sm text-slate-700">
            {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "—"}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Updated</div>
          <div className="text-sm text-slate-700">
            {lead.updatedAt ? new Date(lead.updatedAt).toLocaleString() : "—"}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Link
          href="/leads"
          className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg"
        >
          Back to leads
        </Link>
      </div>
    </div>
  );
}
