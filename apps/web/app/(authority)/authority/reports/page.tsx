"use client";

import { useState } from "react";
import { FileText, Download, Activity, Calendar, ShieldCheck, FileDigit, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  status: "READY" | "GENERATING" | "FAILED";
}

export default function AutomatedReports() {
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState<Report[]>([
    { id: "REP-2026-06", name: "National Security Monthly Digest", type: "ANALYTICS", date: "2026-06-01", status: "READY" },
    { id: "REP-2026-05", name: "Officer Deployment & Efficiency", type: "PERFORMANCE", date: "2026-05-15", status: "READY" },
    { id: "REP-2026-04", name: "Q1 Crime Trajectory Analysis", type: "ANALYTICS", date: "2026-04-01", status: "READY" },
  ]);

  const handleGenerate = () => {
    setGenerating(true);
    const newReport: Report = {
      id: `REP-2026-${Math.floor(Math.random() * 1000)}`,
      name: "Emergency Protocol Post-Action Report",
      type: "AUDIT",
      date: new Date().toISOString().split("T")[0],
      status: "GENERATING"
    };
    setReports([newReport, ...reports]);

    setTimeout(() => {
      setReports((prev) => 
        prev.map(r => r.id === newReport.id ? { ...r, status: "READY" } : r)
      );
      setGenerating(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-black p-8 font-sans text-white">
      <div className="flex items-start justify-between mb-10 pb-6 border-b border-surface-border">
        <div>
          <h1 className="font-heading font-black text-3xl uppercase tracking-wider text-white flex items-center gap-3">
            <FileDigit className="w-8 h-8 text-danger" /> Automated Reporting Engine
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mt-2">Generate cryptographically secure PDF audits and system-wide analytics reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Report Generation Panel */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 border-t-4 border-t-danger relative overflow-hidden">
            <div className="absolute -right-10 -top-10 opacity-5">
              <Activity className="w-48 h-48" />
            </div>
            
            <h2 className="font-heading font-bold text-xl uppercase tracking-wider mb-6 flex items-center gap-2">
              <RefreshCw className={`w-5 h-5 text-danger ${generating ? 'animate-spin' : ''}`} />
              Generate Report
            </h2>
            
            <div className="space-y-5 relative z-10">
              <div>
                <label className="block text-[10px] font-heading font-bold uppercase tracking-widest text-muted mb-2">Report Type</label>
                <select className="w-full bg-black border border-surface-border rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-danger transition-colors font-mono uppercase">
                  <option>Comprehensive Analytics</option>
                  <option>Officer Performance</option>
                  <option>Resource Utilization</option>
                  <option>Security Audit</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-heading font-bold uppercase tracking-widest text-muted mb-2">Time Range</label>
                <div className="flex gap-4">
                  <input type="date" className="w-full bg-black border border-surface-border rounded px-4 py-2 text-sm text-muted focus:outline-none focus:border-danger transition-colors font-mono" />
                  <input type="date" className="w-full bg-black border border-surface-border rounded px-4 py-2 text-sm text-muted focus:outline-none focus:border-danger transition-colors font-mono" />
                </div>
              </div>

              <div className="pt-4 border-t border-surface-border">
                <Button 
                  onClick={handleGenerate} 
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 bg-danger/20 text-danger border border-danger/50 hover:bg-danger/30 hover:text-danger"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> COMPILING DATA...
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4" /> GENERATE SECURE REPORT
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Archive */}
        <div className="lg:col-span-2">
          <h2 className="font-heading font-black text-xl uppercase tracking-wider mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" /> Report Archive
          </h2>
          
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="glass-card p-5 border border-surface-border hover:border-accent/50 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded border flex items-center justify-center ${
                    report.status === "GENERATING" ? "bg-black border-surface-border animate-pulse" : "bg-accent/10 border-accent/30"
                  }`}>
                    {report.status === "GENERATING" ? (
                      <RefreshCw className="w-5 h-5 text-muted animate-spin" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-white uppercase tracking-wider text-lg mb-1">{report.name}</h3>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-muted uppercase tracking-widest">
                      <span>ID: {report.id}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {report.date}</span>
                      <span className="px-2 py-0.5 rounded border border-surface-border bg-surface">{report.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {report.status === "GENERATING" ? (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-heading font-bold text-accent uppercase tracking-widest animate-pulse mb-1">Processing...</span>
                      <div className="w-24 h-1 bg-surface-border rounded-full overflow-hidden">
                        <div className="h-full bg-accent animate-[pulse_1s_ease-in-out_infinite] w-full origin-left scale-x-50"></div>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" className="flex items-center gap-2 text-xs border-surface-border hover:border-white hover:text-white group-hover:bg-white group-hover:text-black transition-all">
                      <Download className="w-4 h-4" /> DOWNLOAD PDF
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
