"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
  Check,
  Loader2,
  AlertCircle,
  Globe,
  ArrowRight,
  ChevronRight,
  Info,
  HelpCircle,
  CheckCircle2,
  Database,
  RefreshCw,
  Eye,
  Settings,
} from "lucide-react";
import * as XLSX from "xlsx";
import { CRM_FIELDS, detectFieldMapping } from "@/services/leads/mapping-helper";

interface LeadImportProps {
  onClose: () => void;
  onSuccess: (count: number) => void;
}

type ImportStep = "upload" | "mapping" | "preview" | "complete";

export default function LeadImport({ onClose, onSuccess }: LeadImportProps) {
  const [activeTab, setActiveTab] = useState<"file" | "platforms">("file");
  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [allRows, setAllRows] = useState<any[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [importStats, setImportStats] = useState<{ imported: number; skipped: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.name.endsWith(".csv") ||
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls")
      ) {
        setFile(selectedFile);
        setError(null);
        parseFile(selectedFile);
      } else {
        setError("Please upload a valid Excel (.xlsx, .xls) or CSV file.");
      }
    }
  };

  const parseFile = (file: File) => {
    setIsParsing(true);
    setError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);

        if (json.length === 0) {
          setError("The uploaded file appears to be empty.");
          setFile(null);
        } else {
          // Extract headers from first row keys
          const keys = Object.keys(json[0] as object);
          setHeaders(keys);
          setAllRows(json);

          // Auto-detect mappings based on header synonyms
          const initialMappings: Record<string, string> = {};
          CRM_FIELDS.forEach((field) => {
            const matchedHeader = keys.find((key) => detectFieldMapping(key) === field.key);
            if (matchedHeader) {
              initialMappings[field.key] = matchedHeader;
            }
          });

          setMappings(initialMappings);
          setStep("mapping");
        }
      } catch (err) {
        console.error("Parse error:", err);
        setError("Failed to parse sheet. Please ensure it is a valid, uncorrupted Excel or CSV file.");
        setFile(null);
      } finally {
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setError("Error reading file.");
      setIsParsing(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleMappingChange = (crmFieldKey: string, excelHeader: string) => {
    setMappings((prev) => {
      const next = { ...prev };
      if (excelHeader === "__skip__") {
        delete next[crmFieldKey];
      } else {
        next[crmFieldKey] = excelHeader;
      }
      return next;
    });
  };

  const autoMapRemaining = () => {
    const updatedMappings = { ...mappings };
    CRM_FIELDS.forEach((field) => {
      if (!updatedMappings[field.key]) {
        const matchedHeader = headers.find((h) => detectFieldMapping(h) === field.key);
        if (matchedHeader) {
          updatedMappings[field.key] = matchedHeader;
        }
      }
    });
    setMappings(updatedMappings);
  };

  const getMappedLeads = () => {
    return allRows.map((row: any) => {
      const lead: any = { source: "import" };
      CRM_FIELDS.forEach((field) => {
        const mappedHeader = mappings[field.key];
        if (mappedHeader && row[mappedHeader] !== undefined && row[mappedHeader] !== null) {
          lead[field.key] = String(row[mappedHeader]).trim();
        } else {
          lead[field.key] = null;
        }
      });

      // Crucial Fallbacks to ensure validity
      if (!lead.firstName && lead.email) {
        lead.firstName = lead.email.split("@")[0];
      }
      if (!lead.firstName) {
        lead.firstName = "Lead";
      }
      if (!lead.lastName) {
        lead.lastName = "";
      }
      if (lead.leadScore === null || lead.leadScore === undefined) {
        lead.leadScore = 50; // default medium score
      } else {
        lead.leadScore = Number(lead.leadScore) || 50;
      }

      return lead;
    });
  };

  const handleImport = async () => {
    setIsImporting(true);
    setError(null);

    const leads = getMappedLeads();

    try {
      const response = await fetch("/api/hunter/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads, orgId: "demo-org" }),
      });

      if (!response.ok) {
        throw new Error(`Import failed with status code ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setImportStats({
          imported: result.imported,
          skipped: result.skippedDuplicates,
        });
        setStep("complete");
        onSuccess(result.imported);
      } else {
        setError(result.error || "Failed to import leads.");
      }
    } catch (err) {
      console.error("Import error:", err);
      setError("An unexpected network error occurred while submitting leads. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  // Check validation: Must map at least one identity-related or communication field
  const isMappingValid = () => {
    const hasFirstName = !!mappings.firstName;
    const hasEmail = !!mappings.email;
    const hasPhone = !!mappings.phone;
    
    // We strictly need firstName and either Email or Phone to consider a lead useful
    return hasFirstName && (hasEmail || hasPhone);
  };

  const resetState = () => {
    setFile(null);
    setHeaders([]);
    setAllRows([]);
    setMappings({});
    setError(null);
    setStep("upload");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-3xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-success animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Import Leads Database</h2>
              <p className="text-xs text-muted-foreground">Upload and map Excel/CSV contact directories</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps indicator */}
        {step !== "complete" && activeTab === "file" && (
          <div className="px-6 py-3 bg-muted/40 border-b border-border flex items-center gap-4 text-xs font-semibold text-muted-foreground select-none">
            <div className={`flex items-center gap-1.5 ${step === "upload" ? "text-primary" : "text-success"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${step === "upload" ? "border-primary bg-primary/10" : "border-success bg-success/10"}`}>
                {step === "upload" ? "1" : <Check className="w-3 h-3" />}
              </span>
              Upload
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
            <div className={`flex items-center gap-1.5 ${step === "mapping" ? "text-primary" : step === "preview" ? "text-success" : ""}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${step === "mapping" ? "border-primary bg-primary/10" : step === "preview" ? "border-success bg-success/10" : "border-border"}`}>
                2
              </span>
              Column Map
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
            <div className={`flex items-center gap-1.5 ${step === "preview" ? "text-primary" : ""}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${step === "preview" ? "border-primary bg-primary/10" : "border-border"}`}>
                3
              </span>
              Preview & Confirm
            </div>
          </div>
        )}

        {/* Tabs switcher */}
        {step === "upload" && (
          <div className="flex border-b border-border bg-surface-dark">
            <button
              onClick={() => setActiveTab("file")}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                activeTab === "file"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:bg-surface"
              }`}
            >
              Spreadsheet File (.xlsx, .xls, .csv)
            </button>
            <button
              onClick={() => setActiveTab("platforms")}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                activeTab === "platforms"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:bg-surface"
              }`}
            >
              Social Ad Campaigns
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          {activeTab === "platforms" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Facebook Leads", icon: Globe, color: "text-[#1877F2]", desc: "Connect Facebook Lead Ads", status: "Connected" },
                  { name: "Google Ads", icon: Globe, color: "text-[#34A853]", desc: "Import from Google Lead Forms", status: "Not Connected" },
                  { name: "LinkedIn Ads", icon: Globe, color: "text-[#0077B5]", desc: "Sync LinkedIn Lead Gen Forms", status: "Not Connected" },
                  { name: "Webhooks", icon: Globe, color: "text-accent", desc: "Connect via Zapier or Make", status: "Setup" },
                ].map((p, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-border-subtle bg-surface hover:border-primary/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.color.replace("text", "bg")}/10`}>
                        <p.icon className={`w-5 h-5 ${p.color}`} />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === "Connected" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                        {p.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold">{p.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
                    <button className="w-full mt-4 py-2 rounded-lg text-xs font-bold border border-border-subtle group-hover:border-primary/50 group-hover:text-primary transition-all">
                      {p.status === "Connected" ? "Fetch Leads" : "Connect Account"}
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-info/5 border border-info/20 rounded-xl">
                <p className="text-xs text-info leading-relaxed">
                  <strong>Pro Tip:</strong> Enabling real-time sync will automatically import new leads into your CRM and trigger WhatsApp notifications for the admin.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: UPLOAD */}
              {step === "upload" && (
                <div className="space-y-6">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border-subtle rounded-2xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                    />
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-base font-semibold">Click or drag to upload sheet</p>
                    <p className="text-sm text-muted-foreground mt-1">Excel (.xlsx, .xls) or CSV files supported up to 10MB</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border-subtle bg-surface/30 space-y-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-primary" /> Mapping Guidelines
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4 leading-relaxed">
                      <li>Your spreadsheet can have any column headers (we automatically detect similar titles).</li>
                      <li>We recommend including at least a <strong>First Name</strong> and <strong>Email Address</strong> or <strong>Phone Number</strong>.</li>
                      <li>Double-check that emails are formatted correctly (e.g. name@company.com).</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* STEP 2: DYNAMIC COLUMN MAPPING */}
              {step === "mapping" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between bg-surface/50 p-4 rounded-xl border border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Map Columns to CRM Fields</p>
                        <p className="text-xs text-muted-foreground">Match sheet columns to our contact records database</p>
                      </div>
                    </div>
                    <button
                      onClick={autoMapRemaining}
                      className="text-xs font-bold text-primary border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Auto Match All
                    </button>
                  </div>

                  {!isMappingValid() && (
                    <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl flex items-start gap-2.5 text-warning">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-xs font-medium">
                        <strong>Required Field Missing:</strong> Please map the <strong>First Name</strong> column and at least one contact channel (<strong>Email Address</strong> or <strong>Phone Number</strong>) to proceed.
                      </p>
                    </div>
                  )}

                  {/* Mapping Fields Grid */}
                  <div className="border border-border rounded-xl overflow-hidden bg-surface-dark">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted text-muted-foreground border-b border-border uppercase text-[10px] tracking-wider font-bold">
                        <tr>
                          <th className="px-4 py-3">CRM Field</th>
                          <th className="px-4 py-3">Sheet Column Mapping</th>
                          <th className="px-4 py-3">Sample Value (Row 1)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle bg-surface/40">
                        {CRM_FIELDS.map((field) => {
                          const mappedHeader = mappings[field.key];
                          const sampleValue = mappedHeader && allRows[0] ? allRows[0][mappedHeader] : null;

                          return (
                            <tr key={field.key} className="hover:bg-surface/60 transition-colors">
                              {/* Column 1: Field details */}
                              <td className="px-4 py-3.5 space-y-1 select-none">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-foreground">{field.label}</span>
                                  {field.required && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-danger/10 text-danger border border-danger/10 font-bold uppercase">
                                      Required
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[220px]">
                                  {field.description}
                                </p>
                              </td>

                              {/* Column 2: Selection Dropdown */}
                              <td className="px-4 py-3.5">
                                <select
                                  value={mappedHeader || "__skip__"}
                                  onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                  className={`w-full max-w-[240px] px-3 py-2 bg-input border rounded-xl text-xs transition-all ${
                                    mappedHeader
                                      ? "border-success/30 text-success bg-success/5 font-semibold"
                                      : field.required
                                      ? "border-warning/30 text-warning bg-warning/5"
                                      : "border-input-border text-muted-foreground"
                                  }`}
                                >
                                  <option value="__skip__">🚫 Skip Field</option>
                                  {headers.map((h) => (
                                    <option key={h} value={h}>
                                      📊 {h}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* Column 3: Value Preview */}
                              <td className="px-4 py-3.5">
                                {mappedHeader ? (
                                  <div className="flex items-center gap-1.5 text-foreground bg-surface border border-border-subtle px-2.5 py-1.5 rounded-lg max-w-[200px] truncate font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                                    <span className="truncate">{sampleValue !== null && sampleValue !== undefined ? String(sampleValue) : <em className="text-muted-foreground/50">empty</em>}</span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground/60 italic text-[11px]">Skipped</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STEP 3: PREVIEW MAPPED LEADS */}
              {step === "preview" && (
                <div className="space-y-5 animate-fade-in">
                  <div className="bg-success/5 border border-success/20 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                        <Database className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Leads Ready to Import</p>
                        <p className="text-xs text-muted-foreground">
                          Successfully mapped {allRows.length} total records from the spreadsheet.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-primary" /> Mapped Database Preview (First 5 Rows)
                    </p>
                    <div className="border border-border rounded-xl overflow-hidden bg-surface-dark max-w-full overflow-x-auto">
                      <table className="w-full text-xs text-left min-w-[700px]">
                        <thead className="bg-muted text-muted-foreground border-b border-border font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="px-4 py-3.5">Name</th>
                            <th className="px-4 py-3.5">Contact Channels</th>
                            <th className="px-4 py-3.5">Company Details</th>
                            <th className="px-4 py-3.5">Location</th>
                            <th className="px-4 py-3.5">Predicted Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle bg-surface/40">
                          {getMappedLeads()
                            .slice(0, 5)
                            .map((lead: any, i: number) => (
                              <tr key={i} className="hover:bg-surface/50 transition-colors">
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center font-bold text-primary text-[11px]">
                                      {lead.firstName[0]}
                                      {lead.lastName?.[0] || ""}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-foreground">
                                        {lead.firstName} {lead.lastName}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">{lead.designation || "No Title"}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 space-y-1">
                                  {lead.email && <p className="text-[10px] text-muted-foreground font-medium">📧 {lead.email}</p>}
                                  {lead.phone && <p className="text-[10px] text-muted-foreground font-medium">📞 {lead.phone}</p>}
                                </td>
                                <td className="px-4 py-3.5">
                                  <p className="font-medium text-foreground">{lead.companyName || "No Company"}</p>
                                  {lead.website && <p className="text-[10px] text-primary hover:underline">{lead.website}</p>}
                                </td>
                                <td className="px-4 py-3.5">
                                  <p className="text-foreground">
                                    {lead.city ? `${lead.city}, ` : ""}
                                    {lead.country || "Global"}
                                  </p>
                                  {lead.industry && <p className="text-[10px] text-muted-foreground">{lead.industry}</p>}
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
                                      <div
                                        className="h-full bg-gradient-to-r from-success to-emerald-500 rounded-full"
                                        style={{ width: `${lead.leadScore}%` }}
                                      />
                                    </div>
                                    <span className="font-bold text-success text-[11px]">{lead.leadScore}</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: IMPORT COMPLETE SUCCESS SCREEN */}
              {step === "complete" && importStats && (
                <div className="py-8 text-center space-y-6 animate-scale-in">
                  <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto border-4 border-success/30 shadow-lg shadow-success/10">
                    <Check className="w-10 h-10 text-success animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-success to-emerald-500 bg-clip-text text-transparent">Import Completed Successfully!</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Your spreadsheet contacts have been successfully formatted, scored by our algorithm, and integrated directly into the CRM database.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto bg-surface p-4 rounded-2xl border border-border-subtle">
                    <div className="text-center p-3">
                      <p className="text-3xl font-extrabold text-success">{importStats.imported}</p>
                      <p className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-wider">Leads Added</p>
                    </div>
                    <div className="text-center p-3 border-l border-border-subtle">
                      <p className="text-3xl font-extrabold text-muted-foreground">{importStats.skipped}</p>
                      <p className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-wider">Duplicates Skipped</p>
                    </div>
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={onClose}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-success to-emerald-600 text-white font-bold text-sm shadow-md hover:opacity-90 transition-all"
                    >
                      Done & Return to CRM
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3 text-danger animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        {step !== "complete" && activeTab === "file" && (
          <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-t border-border">
            {step === "upload" ? (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={resetState}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Start Over
              </button>
            )}

            <div className="flex items-center gap-3">
              {step === "mapping" && (
                <button
                  onClick={() => setStep("preview")}
                  disabled={!isMappingValid()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Configure Preview <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {step === "preview" && (
                <>
                  <button
                    onClick={() => setStep("mapping")}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Adjust Mapping
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-success to-emerald-600 text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Importing leads...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Finalize & Import
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
