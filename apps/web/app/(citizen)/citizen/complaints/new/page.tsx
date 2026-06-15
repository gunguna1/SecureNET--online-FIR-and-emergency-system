"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { 
  Scale, AlertTriangle, Laptop, UserMinus, 
  Car, Shield, Baby, Home, 
  FileText, ChevronRight, ChevronLeft, 
  BrainCircuit, MapPin, CheckCircle2, Send 
} from "lucide-react";

const COMPLAINT_TYPES = [
  { id: "CIVIL",             icon: <Scale className="w-6 h-6" />,           label: "CIVIL DISPUTE",     color: "text-blue-500", border: "border-blue-500/30", bg: "bg-blue-500/10", activeBg: "bg-blue-500/20" },
  { id: "CRIMINAL",          icon: <AlertTriangle className="w-6 h-6" />,   label: "CRIMINAL",          color: "text-red-500", border: "border-red-500/30", bg: "bg-red-500/10", activeBg: "bg-red-500/20" },
  { id: "CYBER_CRIME",       icon: <Laptop className="w-6 h-6" />,          label: "CYBER CRIME",       color: "text-purple-500", border: "border-purple-500/30", bg: "bg-purple-500/10", activeBg: "bg-purple-500/20" },
  { id: "MISSING_PERSON",    icon: <UserMinus className="w-6 h-6" />,       label: "MISSING PERSON",    color: "text-amber-500", border: "border-amber-500/30", bg: "bg-amber-500/10", activeBg: "bg-amber-500/20" },
  { id: "TRAFFIC",           icon: <Car className="w-6 h-6" />,             label: "TRAFFIC INCIDENT",  color: "text-cyan-500", border: "border-cyan-500/30", bg: "bg-cyan-500/10", activeBg: "bg-cyan-500/20" },
  { id: "WOMEN_SAFETY",      icon: <Shield className="w-6 h-6" />,          label: "WOMEN SAFETY",      color: "text-pink-500", border: "border-pink-500/30", bg: "bg-pink-500/10", activeBg: "bg-pink-500/20" },
  { id: "CHILD_SAFETY",      icon: <Baby className="w-6 h-6" />,            label: "CHILD SAFETY",      color: "text-orange-500", border: "border-orange-500/30", bg: "bg-orange-500/10", activeBg: "bg-orange-500/20" },
  { id: "DOMESTIC_VIOLENCE", icon: <Home className="w-6 h-6" />,            label: "DOMESTIC VIOLENCE", color: "text-red-500", border: "border-red-500/30", bg: "bg-red-500/10", activeBg: "bg-red-500/20" },
];

export default function NewComplaintPage() {
  const router = useRouter();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [form, setForm]       = useState({
    type:         "",
    title:        "",
    description:  "",
    incidentDate: "",
    address:      "",
    latitude:     "",
    longitude:    "",
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const getAiSuggestion = async () => {
    if (!form.description) return;
    try {
      const res = await fetchApi("/ai/classify", {
        method: "POST",
        body: JSON.stringify({ description: form.description }),
      });
      setAiSuggestion(res.data);
      if (res.data.suggestedType && !form.type) update("type", res.data.suggestedType);
    } catch {}
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      update("latitude",  String(pos.coords.latitude));
      update("longitude", String(pos.coords.longitude));
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await fetchApi("/complaints", {
        method: "POST",
        body: JSON.stringify({
          type:         form.type,
          title:        form.title,
          description:  form.description,
          incidentDate: new Date(form.incidentDate).toISOString(),
          location: {
            coordinates: [parseFloat(form.longitude) || 77.2090, parseFloat(form.latitude) || 28.6139],
            address: form.address,
          },
        }),
      });
      router.push("/citizen/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to file complaint");
    } finally {
      setLoading(false);
    }
  };

  const steps = ["INCIDENT TYPE", "LOG DETAILS", "GPS LOCATOR", "VERIFICATION"];

  return (
    <div className="max-w-4xl mx-auto space-y-8 slide-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <button 
            onClick={() => router.push("/citizen/dashboard")}
            className="flex items-center gap-2 text-xs font-heading font-bold text-muted hover:text-white uppercase tracking-widest transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" /> BACK TO TERMINAL
          </button>
          <h1 className="font-heading font-black text-3xl tracking-tighter text-white uppercase flex items-center gap-3">
            <FileText className="w-6 h-6 text-accent" />
            FILE A COMPLAINT
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            SECURE INTAKE FORM // ALL DATA IS ENCRYPTED
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${i < step ? "bg-accent" : i === step ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-surface-border"}`} />
            <p className={`text-[10px] font-heading font-bold uppercase tracking-widest mt-2 ${i === step ? "text-emerald-500" : i < step ? "text-accent" : "text-muted"}`}>
              {s}
            </p>
          </div>
        ))}
      </div>

      <div className="glass-card p-8 border border-surface-border relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full pointer-events-none" />

        {error && (
          <div className="mb-6 px-4 py-3 rounded text-xs font-mono bg-red-500/10 border border-red-500/30 text-red-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Step 0 — Type Selection */}
        {step === 0 && (
          <div className="animate-bounce-in relative z-10">
            <h2 className="font-heading font-black text-lg text-white uppercase tracking-widest mb-6 border-b border-surface-border pb-2">
              SELECT INCIDENT CLASSIFICATION
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {COMPLAINT_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { update("type", t.id); setStep(1); }}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded border transition-all hover:scale-105 active:scale-95 group
                    ${form.type === t.id ? `${t.activeBg} ${t.border}` : `bg-black/40 border-surface-border hover:${t.border} hover:${t.bg}`}
                  `}
                >
                  <div className={`${form.type === t.id ? t.color : "text-muted group-hover:" + t.color} transition-colors`}>
                    {t.icon}
                  </div>
                  <span className={`text-[10px] font-heading font-bold uppercase tracking-widest text-center ${form.type === t.id ? "text-white" : "text-slate-400 group-hover:text-white"}`}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — Details */}
        {step === 1 && (
          <div className="space-y-6 animate-bounce-in relative z-10">
            <h2 className="font-heading font-black text-lg text-white uppercase tracking-widest mb-6 border-b border-surface-border pb-2">
              LOG INCIDENT DETAILS
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-heading font-bold text-muted uppercase tracking-widest mb-2">INCIDENT TITLE</label>
                <input 
                  className="w-full bg-black/40 border border-surface-border rounded p-3 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all" 
                  placeholder="BRIEF SUMMARY..."
                  value={form.title} 
                  onChange={e => update("title", e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-[10px] font-heading font-bold text-muted uppercase tracking-widest mb-2">DETAILED DESCRIPTION</label>
                <textarea
                  rows={6}
                  className="w-full bg-black/40 border border-surface-border rounded p-3 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-none"
                  placeholder="ENTER FULL INCIDENT LOG HERE..."
                  value={form.description}
                  onChange={e => update("description", e.target.value)}
                  onBlur={getAiSuggestion}
                />
              </div>

              {aiSuggestion && (
                <div className="p-4 rounded border border-purple-500/30 bg-purple-500/10 space-y-2 animate-bounce-in">
                  <p className="text-xs font-heading font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4" /> AI ANALYSIS LOG
                  </p>
                  <p className="text-[10px] font-mono text-slate-300">
                    DETECTED CLASSIFICATION: <span className="text-white">{aiSuggestion.suggestedType?.replace("_"," ")}</span><br/>
                    THREAT PRIORITY: <span className="text-white">{aiSuggestion.suggestedPriority}</span>
                  </p>
                  <p className="text-[10px] font-mono text-purple-300/70">{aiSuggestion.summary}</p>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-heading font-bold text-muted uppercase tracking-widest mb-2">DATE & TIME OF INCIDENT</label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-black/40 border border-surface-border rounded p-3 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all [color-scheme:dark]"
                  value={form.incidentDate} 
                  onChange={e => update("incidentDate", e.target.value)} 
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-surface-border">
              <button 
                onClick={() => setStep(0)} 
                className="flex-1 py-3 border border-surface-border rounded text-xs font-heading font-bold text-muted uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> BACK
              </button>
              <button 
                onClick={() => setStep(2)} 
                disabled={!form.title || !form.description || !form.incidentDate}
                className="flex-[2] py-3 bg-accent/10 border border-accent/30 rounded text-xs font-heading font-bold text-accent uppercase tracking-widest hover:bg-accent/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                PROCEED TO LOCATION <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Location */}
        {step === 2 && (
          <div className="space-y-6 animate-bounce-in relative z-10">
            <h2 className="font-heading font-black text-lg text-white uppercase tracking-widest mb-6 border-b border-surface-border pb-2">
              GPS & LOCATION TARGETING
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-heading font-bold text-muted uppercase tracking-widest mb-2">MANUAL ADDRESS</label>
                <input 
                  className="w-full bg-black/40 border border-surface-border rounded p-3 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all" 
                  placeholder="ENTER STREET, AREA, CITY..."
                  value={form.address} 
                  onChange={e => update("address", e.target.value)} 
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-border"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-mono">
                  <span className="px-2 bg-[#0a1120] text-muted">OR PING GPS SATELLITE</span>
                </div>
              </div>

              <button
                onClick={getLocation}
                className="w-full py-6 border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 rounded hover:bg-emerald-500/10 transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <MapPin className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-heading font-bold uppercase tracking-widest text-emerald-400">
                  CAPTURE DEVICE COORDINATES
                </span>
              </button>

              {form.latitude && (
                <div className="p-4 rounded border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3 animate-bounce-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-heading font-bold uppercase tracking-widest text-emerald-400 mb-1">LOCK ACQUIRED</p>
                    <p className="text-[10px] font-mono text-emerald-300/70">
                      LAT: {parseFloat(form.latitude).toFixed(6)}°N <br/>
                      LNG: {parseFloat(form.longitude).toFixed(6)}°E
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-surface-border">
              <button 
                onClick={() => setStep(1)} 
                className="flex-1 py-3 border border-surface-border rounded text-xs font-heading font-bold text-muted uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> BACK
              </button>
              <button 
                onClick={() => setStep(3)} 
                disabled={!form.address && !form.latitude}
                className="flex-[2] py-3 bg-accent/10 border border-accent/30 rounded text-xs font-heading font-bold text-accent uppercase tracking-widest hover:bg-accent/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                VERIFY ARCHIVE <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className="space-y-6 animate-bounce-in relative z-10">
            <h2 className="font-heading font-black text-lg text-emerald-500 uppercase tracking-widest mb-6 border-b border-surface-border pb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" /> VERIFY BEFORE TRANSMISSION
            </h2>
            
            <div className="bg-black/40 border border-surface-border rounded p-6 space-y-4">
              {[
                ["CLASSIFICATION", COMPLAINT_TYPES.find(t => t.id === form.type)?.label || form.type],
                ["INCIDENT TITLE", form.title],
                ["TIMESTAMP",    form.incidentDate ? new Date(form.incidentDate).toLocaleString("en-IN") : "UNKNOWN"],
                ["GPS TARGET",   form.latitude ? `${parseFloat(form.latitude).toFixed(4)}°N, ${parseFloat(form.longitude).toFixed(4)}°E` : "NOT PINGED"],
                ["AREA/ADDRESS", form.address || "UNSPECIFIED"],
              ].map(([l, v]) => (
                <div key={l} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 border-b border-surface-border/50 pb-2 last:border-0 last:pb-0">
                  <span className="text-[10px] font-heading font-bold text-muted uppercase tracking-widest">{l}</span>
                  <span className="text-xs font-mono text-white text-right">{v}</span>
                </div>
              ))}
              
              <div className="pt-2 border-t border-surface-border/50">
                <span className="text-[10px] font-heading font-bold text-muted uppercase tracking-widest block mb-2">FULL LOG</span>
                <p className="text-xs font-mono text-slate-300 leading-relaxed bg-black/50 p-3 rounded border border-surface-border/50">
                  {form.description}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-surface-border">
              <button 
                onClick={() => setStep(2)} 
                className="flex-1 py-4 border border-surface-border rounded text-xs font-heading font-bold text-muted uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> EDIT LOG
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex-[2] py-4 rounded text-white font-heading font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-40 disabled:cursor-not-allowed border border-emerald-500/50 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
              >
                {loading ? (
                  <span className="animate-pulse">TRANSMITTING...</span>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> TRANSMIT TO CONTROL ROOM
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bounce-in {
          0% { transform: translateY(10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
}
