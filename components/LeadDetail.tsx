"use client";

import { Lead, LeadData, LeadInfo } from "@/types/lead";
import Link from "next/link";
import { useState } from "react";
import ScoreBadge from "./ScoreBadge";

interface LeadDetailProps {
  lead: Lead;
  onLeadUpdate?: (updatedLead: Lead) => void;
}

export default function LeadDetail({
  lead: initialLead,
  onLeadUpdate,
}: LeadDetailProps) {
  const [lead, setLead] = useState(initialLead);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReanalysing, setIsReanalysing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [editedInfo, setEditedInfo] = useState<LeadInfo>(lead.leadInfo);
  const [editedData, setEditedData] = useState<LeadData>(
    lead.leadInfo.leadData || {},
  );

  const handleFieldChange = (
    field: keyof LeadInfo,
    value: string | string[],
  ) => {
    setEditedInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleLeadDataChange = (
    field: keyof LeadData,
    value: string | string[],
  ) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleSaveChanges = async () => {
    if (!lead._id) {
      setError("Lead ID is missing");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updatedLeadInfo = {
        ...editedInfo,
        leadData: editedData,
      };

      const response = await fetch(`/api/leads/${lead._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadInfo: updatedLeadInfo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save changes");
      }

      const result = await response.json();
      const updatedLead = result.data;

      // Update lead state
      setLead(updatedLead);
      if (onLeadUpdate) {
        onLeadUpdate(updatedLead);
      }

      setSuccessMessage("Changes saved successfully");
      setIsEditing(false);

      // Trigger reanalysis after saving
      await triggerReanalysis(updatedLead._id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save changes";
      setError(errorMessage);
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const triggerReanalysis = async (leadId: string) => {
    setIsReanalysing(true);
    try {
      console.log(`[LeadDetail] Triggering reanalysis for lead ${leadId}`);
      const response = await fetch(`/api/leads/${leadId}/reanalyse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn("[LeadDetail] Reanalysis warning:", errorData.error);
        // Don't show error to user for reanalysis, as it's a secondary operation
      } else {
        const result = await response.json();
        if (result.data) {
          setLead(result.data);
          if (onLeadUpdate) {
            onLeadUpdate(result.data);
          }
          setSuccessMessage(
            `Changes saved and reanalysed successfully! (Reanalysis count: ${result.reanalysisCount})`,
          );
        }
      }
    } catch (err) {
      console.error("[LeadDetail] Reanalysis error:", err);
      // Silent fail for reanalysis - don't disrupt the user experience
    } finally {
      setIsReanalysing(false);
    }
  };

  const handleReanalyseNow = async () => {
    if (!lead._id) {
      setError("Lead ID is missing");
      return;
    }

    setIsReanalysing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log(
        `[LeadDetail] Triggering manual reanalysis for lead ${lead._id}`,
      );
      const response = await fetch(`/api/leads/${lead._id}/reanalyse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Reanalysis failed with status ${response.status}`,
        );
      }

      const result = await response.json();
      const reanalysedLead = result.data;

      setLead(reanalysedLead);
      if (onLeadUpdate) {
        onLeadUpdate(reanalysedLead);
      }

      setSuccessMessage(
        `Lead reanalysed successfully! (Reanalysis count: ${reanalysedLead.reanalysisCount})`,
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to reanalyse lead";
      setError(errorMessage);
      console.error("[LeadDetail] Reanalysis error:", err);
    } finally {
      setIsReanalysing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      {/* Header with Edit Button */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {lead.leadInfo.leadName}
          </h2>
          <p className="text-sm text-slate-500">
            {lead.leadInfo.jobTitle} • {lead.leadInfo.companyName}
          </p>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded font-semibold text-sm hover:bg-blue-700 transition-colors"
              title="Edit lead information"
            >
              Edit
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
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

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      {/* Reanalysis Info - Hidden in edit mode */}
      {!isEditing && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Reanalysis Count:{" "}
                <span className="text-lg">{lead.reanalysisCount || 0}</span>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                This lead has been reanalysed {lead.reanalysisCount || 0}{" "}
                time(s)
              </p>
            </div>
            <button
              onClick={handleReanalyseNow}
              disabled={isReanalysing}
              className={`px-4 py-2 rounded font-semibold text-sm transition-colors ${
                isReanalysing
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isReanalysing ? "Reanalysing..." : "Reanalyse Now"}
            </button>
          </div>
        </div>
      )}

      {isEditing ? (
        // EDIT MODE - Show all editable fields
        <div className="bg-slate-50 p-6 rounded border border-slate-200 space-y-6">
          {/* Contact Information Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-300">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editedInfo.leadEmail || ""}
                  onChange={(e) =>
                    handleFieldChange("leadEmail", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Enter email"
                  disabled
                />
                <p className="text-xs text-slate-500 mt-1">Cannot be edited</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editedInfo.leadPhone || ""}
                  onChange={(e) =>
                    handleFieldChange("leadPhone", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editedInfo.location || ""}
                  onChange={(e) =>
                    handleFieldChange("location", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Enter location"
                />
              </div>
            </div>
          </div>

          {/* Company Information Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-300">
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={editedInfo.companyName || ""}
                  onChange={(e) =>
                    handleFieldChange("companyName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={editedInfo.companyWebsite || ""}
                  onChange={(e) =>
                    handleFieldChange("companyWebsite", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Enter website URL"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business (Industry)
                </label>
                <input
                  type="text"
                  value={editedInfo.leadIndustry || ""}
                  onChange={(e) =>
                    handleFieldChange("leadIndustry", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Enter industry"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Size
                </label>
                <input
                  type="text"
                  value={editedInfo.coSize || ""}
                  onChange={(e) => handleFieldChange("coSize", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Enter company size"
                />
              </div>
            </div>
          </div>

          {/* Contact Role Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-300">
              Contact Role
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PoC Designation (Job Title)
                </label>
                <input
                  type="text"
                  value={editedInfo.jobTitle || ""}
                  onChange={(e) =>
                    handleFieldChange("jobTitle", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Enter job title"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tech Team Size
                </label>
                <input
                  type="text"
                  value={editedInfo.techTeamSize || ""}
                  onChange={(e) =>
                    handleFieldChange("techTeamSize", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Enter tech team size"
                />
              </div>
            </div>
          </div>

          {/* Lead Data Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-300">
              Lead Data
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type of Lead
                </label>
                <input
                  type="text"
                  value={(editedData.lead_type as string) || ""}
                  onChange={(e) =>
                    handleLeadDataChange("lead_type", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Enter lead type"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Need
                </label>
                <input
                  type="text"
                  value={(editedData.primary_need as string) || ""}
                  onChange={(e) =>
                    handleLeadDataChange("primary_need", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Enter primary need"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Name of the Application or Proposed Solution
                </label>
                <input
                  type="text"
                  value={(editedData.proposed_solution as string) || ""}
                  onChange={(e) =>
                    handleLeadDataChange("proposed_solution", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Enter proposed solution"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Success Criteria
                </label>
                <input
                  type="text"
                  value={(editedData.success_criteria as string) || ""}
                  onChange={(e) =>
                    handleLeadDataChange("success_criteria", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Enter success criteria"
                />
              </div>
            </div>
          </div>

          {/* Opportunity & Business Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-300">
              Opportunity & Business
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type of the Opportunity
                </label>
                <input
                  type="text"
                  value={editedInfo.opportunity_type || ""}
                  onChange={(e) =>
                    handleFieldChange("opportunity_type", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Enter opportunity type"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Budget
                </label>
                <input
                  type="text"
                  value={editedInfo.monthlyBudget || ""}
                  onChange={(e) =>
                    handleFieldChange("monthlyBudget", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Enter budget"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Timeline
                </label>
                <input
                  type="text"
                  value={editedInfo.timeline || ""}
                  onChange={(e) =>
                    handleFieldChange("timeline", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Enter timeline"
                />
              </div>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-300">
            <button
              onClick={handleSaveChanges}
              disabled={isSaving || isReanalysing}
              className={`px-6 py-2 rounded font-semibold text-sm transition-colors ${
                isSaving || isReanalysing
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isSaving || isReanalysing ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedInfo(lead.leadInfo);
                setEditedData(lead.leadInfo.leadData || {});
                setError(null);
              }}
              disabled={isSaving || isReanalysing}
              className="px-6 py-2 bg-slate-400 text-white rounded font-semibold text-sm hover:bg-slate-500 transition-colors disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // VIEW MODE - Show all sections in read-only format
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Contact
              </h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-slate-500">Email</dt>
                  <dd className="text-sm text-slate-700">
                    {lead.leadInfo.leadEmail}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Phone</dt>
                  <dd className="text-sm text-slate-700">
                    {lead.leadInfo.leadPhone || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Location</dt>
                  <dd className="text-sm text-slate-700">
                    {lead.leadInfo.location || "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Company
              </h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-slate-500">Website</dt>
                  <dd className="text-sm text-slate-700">
                    {lead.leadInfo.companyWebsite || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Industry</dt>
                  <dd className="text-sm text-slate-700">
                    {lead.leadInfo.leadIndustry || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Company Size</dt>
                  <dd className="text-sm text-slate-700">
                    {lead.leadInfo.coSize || "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Extra fields visible in edit mode */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Role & Team
              </h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-slate-500">Job Title</dt>
                  <dd className="text-sm text-slate-700">
                    {lead.leadInfo.jobTitle || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Tech Team Size</dt>
                  <dd className="text-sm text-slate-700">
                    {lead.leadInfo.techTeamSize || "—"}
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Additional Info
              </h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-slate-500">Revenue</dt>
                  <dd className="text-sm text-slate-700">
                    {lead.leadInfo.revenue || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Business Model</dt>
                  <dd className="text-sm text-slate-700">
                    {lead.leadInfo.businessModel || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Tech Stack</dt>
                  <dd className="text-sm text-slate-700">
                    {lead.leadInfo.techStack &&
                    lead.leadInfo.techStack.length > 0
                      ? lead.leadInfo.techStack.join(", ")
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Receiver Name</dt>
                  <dd className="text-sm text-slate-700">
                    {lead.leadInfo.receiverName || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Receiver Email</dt>
                  <dd className="text-sm text-slate-700">
                    {lead.leadInfo.receiverEmail || "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Scores & Evidence
              </h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>
                  Budget: {lead.budgetScore} — {lead.budgetEvidence || "—"}
                </li>
                <li>
                  Authority: {lead.authorityScore} —{" "}
                  {lead.authorityEvidence || "—"}
                </li>
                <li>
                  Need: {lead.needScore} — {lead.needEvidence || "—"}
                </li>
                <li>
                  Timeline: {lead.timelineScore} —{" "}
                  {lead.timelineEvidence || "—"}
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Notes
              </h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-slate-500">Final Assessment</dt>
                  <dd className="text-sm text-slate-700">
                    {lead.overallAssessment || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">
                    Qualification Reason
                  </dt>
                  <dd className="text-sm text-slate-700">
                    {lead.qualificationReason || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">
                    Disqualification Reason
                  </dt>
                  <dd className="text-sm text-slate-700">
                    {lead.disQualificationReason || "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Lead Data
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Type of Lead</dt>
                <dd className="text-slate-700">
                  {lead.leadInfo.leadData?.lead_type || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Primary Need</dt>
                <dd className="text-slate-700">
                  {lead.leadInfo.leadData?.primary_need || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Proposed Solution</dt>
                <dd className="text-slate-700">
                  {lead.leadInfo.leadData?.proposed_solution || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Success Criteria</dt>
                <dd className="text-slate-700">
                  {lead.leadInfo.leadData?.success_criteria || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Type of Opportunity</dt>
                <dd className="text-slate-700">
                  {lead.leadInfo.opportunity_type || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Client Budget</dt>
                <dd className="text-slate-700">
                  {lead.leadInfo.monthlyBudget || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Client Timeline</dt>
                <dd className="text-slate-700">
                  {lead.leadInfo.timeline || "—"}
                </dd>
              </div>
            </dl>
          </div>
        </>
      )}

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
          className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors"
        >
          Back to leads
        </Link>
      </div>
    </div>
  );
}
