"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  Camera, FileText, CheckCircle2,
  ChevronLeft, X, Plus, Upload,
  Activity, ShieldAlert, Folder
} from "lucide-react";

interface EvidenceItem {
  id: string;
  type: "NOTE" | "PHOTO";
  content: string;
  timestamp: Date;
}

export default function EvidencePage() {
  const { incidentId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [note, setNote] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const addNote = () => {
    if (!note.trim()) return;
    setEvidenceList((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        type: "NOTE",
        content: note.trim(),
        timestamp: new Date(),
      },
    ]);
    setNote("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const attachPhoto = () => {
    if (!selectedFile || !previewUrl) return;
    setEvidenceList((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        type: "PHOTO",
        content: previewUrl,
        timestamp: new Date(),
      },
    ]);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const removeItem = (id: string) => {
    setEvidenceList((prev) => prev.filter((e) => e.id !== id));
  };

  const submitEvidence = async () => {
    if (evidenceList.length === 0) return;
    setSubmitting(true);
    try {
      await fetchApi(`/evidence/${incidentId}`, {
        method: "POST",
        body: JSON.stringify({
          items: evidenceList.map((e) => ({
            type: e.type,
            content: e.type === "NOTE" ? e.content : "[Photo attached - S3 placeholder]",
            timestamp: e.timestamp,
          })),
        }),
      });
      router.push("/officer/dashboard");
    } catch (err) {
      router.push("/officer/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  const getTerminology = () => {
    if (user?.officerType === "AMBULANCE") {
      return {
        header: "MEDICAL REPORT CAPTURE",
        icon: <Activity className="w-6 h-6 text-emerald-500" />,
        color: "text-emerald-500",
        notes: "PATIENT VITALS",
        photos: "CONDITION PHOTOS",
        submit: "SUBMIT MEDICAL REPORT",
        data: "MEDICAL DATA",
      };
    }
    if (user?.officerType === "FIRE") {
      return {
        header: "DAMAGE ASSESSMENT",
        icon: <ShieldAlert className="w-6 h-6 text-orange-500" />,
        color: "text-orange-500",
        notes: "INCIDENT LOG",
        photos: "SCENE PHOTOS",
        submit: "SUBMIT DAMAGE ASSESSMENT",
        data: "DAMAGE DATA",
      };
    }
    return {
      header: "ON-SCENE EVIDENCE CAPTURE",
      icon: <Camera className="w-6 h-6 text-blue-500" />,
      color: "text-blue-500",
      notes: "FIELD NOTES",
      photos: "PHOTO EVIDENCE",
      submit: "SUBMIT EVIDENCE",
      data: "EVIDENCE",
    };
  };

  const terms = getTerminology();

  return (
    <div className="max-w-4xl mx-auto space-y-8 slide-in pb-12">
      {/* Top Bar / Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <button
            onClick={() => router.push("/officer/dashboard")}
            className="flex items-center gap-2 text-xs font-heading font-bold text-muted hover:text-white uppercase tracking-widest transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Terminal
          </button>
          <h1 className="font-heading font-black text-3xl tracking-tighter text-white uppercase flex items-center gap-3">
            {terms.icon}
            {terms.header}
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            INCIDENT ID: {typeof incidentId === "string" ? incidentId.slice(-8) : "UNKNOWN"} // SECURE UPLOAD STREAM
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Input Forms */}
        <div className="space-y-6">

          {/* Notes Section */}
          <div className="glass-card p-6 border border-surface-border">
            <h2 className="font-heading font-black text-lg text-white uppercase tracking-widest flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
              <FileText className={`w-4 h-4 ${terms.color}`} /> {terms.notes}
            </h2>
            <div className="relative">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Log scene details, observations, or vital metrics..."
                rows={5}
                className="w-full bg-black/40 border border-surface-border rounded p-4 text-sm font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-none"
              />
              <div className="absolute bottom-4 right-4 text-[10px] font-mono text-muted uppercase">
                {note.length} CHARS
              </div>
            </div>
            <button
              onClick={addNote}
              disabled={!note.trim()}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-xs font-heading font-bold uppercase tracking-widest transition-all bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" /> LOG ENTRY
            </button>
          </div>

          {/* Photos Section */}
          <div className="glass-card p-6 border border-surface-border">
            <h2 className="font-heading font-black text-lg text-white uppercase tracking-widest flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
              <Camera className={`w-4 h-4 ${terms.color}`} /> {terms.photos}
            </h2>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-surface-border rounded bg-black/20 hover:bg-accent/5 hover:border-accent/50 cursor-pointer transition-all group">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Upload className="w-8 h-8 text-muted group-hover:text-accent mb-3 transition-colors" />
                <span className="text-xs font-heading font-bold uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">
                  INITIALIZE CAMERA
                </span>
                <span className="text-[10px] font-mono text-muted uppercase mt-1">
                  OR SELECT FROM SECURE ARCHIVE
                </span>
              </label>

              {previewUrl && (
                <div className="flex items-center gap-4 bg-black/40 p-4 rounded border border-surface-border animate-bounce-in">
                  <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded border border-slate-700" />
                  <div className="flex-1">
                    <p className="text-xs font-mono text-white uppercase mb-2">FILE_PREVIEW.JPG</p>
                    <button
                      onClick={attachPhoto}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded text-[10px] font-heading font-bold text-white uppercase tracking-widest transition-all bg-emerald-600 hover:bg-emerald-500"
                    >
                      <CheckCircle2 className="w-3 h-3" /> CONFIRM & ATTACH
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Collection & Submission */}
        <div className="space-y-6 flex flex-col h-full">
          <div className="glass-card p-6 border border-surface-border flex-1 flex flex-col min-h-[400px]">
            <h2 className="font-heading font-black text-lg text-white uppercase tracking-widest flex items-center justify-between mb-4 pb-3 border-b border-surface-border">
              <span className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-emerald-500" /> {terms.data} ARCHIVE
              </span>
              <span className="text-xs font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-2 py-1 rounded">
                {evidenceList.length} ITEMS
              </span>
            </h2>

            {evidenceList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-50 py-12">
                <Folder className="w-12 h-12 mb-3" />
                <p className="text-xs font-heading font-bold uppercase tracking-widest">ARCHIVE EMPTY</p>
                <p className="text-[10px] font-mono mt-1">AWAITING INPUT STREAM</p>
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {evidenceList.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 rounded bg-black/40 border border-surface-border group animate-bounce-in"
                  >
                    <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 border ${item.type === "NOTE" ? "bg-blue-500/10 border-blue-500/30 text-blue-500" : "bg-purple-500/10 border-purple-500/30 text-purple-500"}`}>
                      {item.type === "NOTE" ? <FileText className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-slate-400">
                          {item.type === "NOTE" ? "LOG ENTRY" : "IMAGE CAPTURE"}
                        </span>
                        <span className="text-[10px] font-mono text-muted">
                          {item.timestamp.toLocaleTimeString("en-US", { hour12: false })}
                        </span>
                      </div>
                      {item.type === "NOTE" ? (
                        <p className="text-xs font-mono text-slate-300 break-words">{item.content}</p>
                      ) : (
                        <img src={item.content} alt="Evidence" className="mt-2 w-full h-32 object-cover rounded border border-surface-border" />
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted hover:text-red-500 transition-colors p-1 self-start opacity-0 group-hover:opacity-100"
                      title="Delete Entry"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={submitEvidence}
            disabled={submitting || evidenceList.length === 0}
            className="w-full py-5 rounded flex items-center justify-center gap-3 text-white font-heading font-black text-xl uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-40 disabled:cursor-not-allowed border border-emerald-500/50"
            style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
          >
            {submitting ? (
              <span className="animate-pulse">TRANSMITTING SECURE DATA...</span>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                {terms.submit}
              </>
            )}
          </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bounce-in {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.3s ease-out forwards; }
      `}} />
    </div>
  );
}
