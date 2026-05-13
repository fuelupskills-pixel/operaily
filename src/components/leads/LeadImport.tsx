"use client";

import React, { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X, Check, Loader2, AlertCircle, Facebook, Globe, Chrome } from "lucide-react";
import * as XLSX from "xlsx";

interface LeadImportProps {
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export default function LeadImport({ onClose, onSuccess }: LeadImportProps) {
  const [activeTab, setActiveTab] = useState<"file" | "platforms">("file");
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.name.endsWith(".csv")
      ) {
        setFile(selectedFile);
        setError(null);
        parseFile(selectedFile);
      } else {
        setError("Please upload a valid Excel or CSV file.");
      }
    }
  };

  const parseFile = (file: File) => {
    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        
        if (json.length === 0) {
          setError("The file appears to be empty.");
          setPreview([]);
        } else {
          setPreview(json.slice(0, 5)); // Preview first 5 rows
          setFile(file);
        }
      } catch (err) {
        setError("Failed to parse file. Ensure it's a valid format.");
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!file) return;
    setIsImporting(true);
    setError(null);

    try {
      // Read entire file for import
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const allData = XLSX.utils.sheet_to_json(sheet);

        // Map fields to LeadInput format
        const leads = allData.map((row: any) => ({
          firstName: row.firstName || row["First Name"] || row.first_name,
          lastName: row.lastName || row["Last Name"] || row.last_name,
          email: row.email || row.Email,
          phone: row.phone || row.Phone || row.telephone,
          whatsapp: row.whatsapp || row.WhatsApp,
          companyName: row.company || row.Company || row.companyName || row.company_name,
          designation: row.designation || row.Designation || row.role || row.Role || row.jobTitle,
          website: row.website || row.Website || row.url,
          city: row.city || row.City,
          country: row.country || row.Country,
          industry: row.industry || row.Industry,
          linkedinUrl: row.linkedin || row.LinkedIn || row.linkedin_url,
          source: "import",
        }));

        const response = await fetch("/api/hunter/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leads, orgId: "demo-org" }), // In real app, get orgId from context
        });

        const result = await response.json();
        if (result.success) {
          onSuccess(result.imported);
          onClose();
        } else {
          setError(result.error || "Failed to import leads");
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      setError("An unexpected error occurred during import.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Import Leads
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-border">
          <button 
            onClick={() => setActiveTab("file")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === "file" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:bg-surface"}`}
          >
            File Upload
          </button>
          <button 
            onClick={() => setActiveTab("platforms")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === "platforms" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:bg-surface"}`}
          >
            Social Platforms
          </button>
        </div>

        <div className="p-6">
          {activeTab === "file" ? (
            <>
              {!file ? (
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
                  <p className="text-base font-semibold">Click or drag to upload</p>
                  <p className="text-sm text-muted-foreground mt-1">Excel (.xlsx, .xls) or CSV files supported</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                        <FileSpreadsheet className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button onClick={() => {setFile(null); setPreview([]);}} className="text-xs text-danger font-medium hover:underline">
                      Remove
                    </button>
                  </div>

                  {isParsing ? (
                    <div className="py-8 text-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Parsing file...</p>
                    </div>
                  ) : preview.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview (First 5 rows)</p>
                      <div className="overflow-x-auto rounded-xl border border-border-subtle">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-muted">
                            <tr>
                              {Object.keys(preview[0]).map((key) => (
                                <th key={key} className="px-3 py-2 font-medium">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-subtle">
                            {preview.map((row, i) => (
                              <tr key={i}>
                                {Object.values(row).map((val: any, j) => (
                                  <td key={j} className="px-3 py-2 truncate max-w-[150px]">{val}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Facebook Leads", icon: Facebook, color: "text-[#1877F2]", desc: "Connect Facebook Lead Ads", status: "Connected" },
                  { name: "Google Ads", icon: Chrome, color: "text-[#34A853]", desc: "Import from Google Lead Forms", status: "Not Connected" },
                  { name: "LinkedIn Ads", icon: Globe, color: "text-[#0077B5]", desc: "Sync LinkedIn Lead Gen Forms", status: "Not Connected" },
                  { name: "Webhooks", icon: Globe, color: "text-accent", desc: "Connect via Zapier or Make", status: "Setup" },
                ].map((p, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-border-subtle bg-surface hover:border-primary/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.color.replace('text', 'bg')}/10`}>
                        <p.icon className={`w-5 h-5 ${p.color}`} />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === 'Connected' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {p.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold">{p.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
                    <button className="w-full mt-4 py-2 rounded-lg text-xs font-bold border border-border-subtle group-hover:border-primary/50 group-hover:text-primary transition-all">
                      {p.status === 'Connected' ? 'Fetch Leads' : 'Connect Account'}
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
          )}

          {error && (
            <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3 text-danger animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          {activeTab === "file" && (
            <button 
              onClick={handleImport}
              disabled={!file || isParsing || isImporting}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-success to-emerald-600 text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</>
              ) : (
                <><Check className="w-4 h-4" /> Start Import</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
