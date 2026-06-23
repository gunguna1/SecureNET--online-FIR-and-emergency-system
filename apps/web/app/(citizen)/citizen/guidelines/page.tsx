import { Scale, ShieldCheck, FileText, Clock, AlertTriangle, BookOpen } from "lucide-react";

export default function FIRGuidelines() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center rounded">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-heading font-black text-3xl uppercase tracking-wider text-white">FIR Guidelines & Rights</h1>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mt-1">Know your rights as a citizen</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="glass-card p-6 border-l-4 border-l-primary">
          <Scale className="w-8 h-8 text-primary mb-4" />
          <h3 className="font-heading font-bold text-lg uppercase tracking-wider text-white mb-2">Right to Register</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Every citizen has the fundamental right to file a First Information Report (FIR) for any cognizable offense. The police cannot refuse to register your FIR regardless of the jurisdiction where the crime occurred (Zero FIR).
          </p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-success">
          <ShieldCheck className="w-8 h-8 text-success mb-4" />
          <h3 className="font-heading font-bold text-lg uppercase tracking-wider text-white mb-2">Free Copy of FIR</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            You are legally entitled to receive a copy of the FIR free of cost immediately after it has been registered. Our digital platform ensures your copy is securely stored and always accessible.
          </p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-accent">
          <Clock className="w-8 h-8 text-accent mb-4" />
          <h3 className="font-heading font-bold text-lg uppercase tracking-wider text-white mb-2">Timely Action</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Once an FIR is registered, the investigation must begin immediately. You can track the real-time status of your case and the assigned officer directly through the "My Complaints" portal.
          </p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-danger">
          <AlertTriangle className="w-8 h-8 text-danger mb-4" />
          <h3 className="font-heading font-bold text-lg uppercase tracking-wider text-white mb-2">False Reports</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Filing a false FIR is a punishable offense under Section 182 & 211 of the IPC. Ensure all information provided is accurate and truthful to the best of your knowledge.
          </p>
        </div>
      </div>

      <h2 className="font-heading font-black text-xl uppercase tracking-wider text-white mb-6 flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" /> How to file a digital FIR
      </h2>
      
      <div className="glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="space-y-6 relative z-10">
          {[
            { step: "01", title: "Select Complaint Type", desc: "Choose the exact nature of the crime from our categorized dropdown." },
            { step: "02", title: "Provide Incident Details", desc: "Enter the date, exact location, and a thorough description of the event." },
            { step: "03", title: "Upload Evidence", desc: "Attach photos, videos, or documents that support your claim." },
            { step: "04", title: "Submit & Track", desc: "Submit the report. You'll receive a unique ID to track its progress live." },
          ].map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="font-heading font-black text-2xl text-primary/40">{s.step}</div>
              <div>
                <h4 className="font-heading font-bold uppercase tracking-wider text-white mb-1">{s.title}</h4>
                <p className="text-sm text-slate-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
