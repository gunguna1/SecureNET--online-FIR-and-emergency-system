"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Shield, MapPin, Activity, Siren, Clock, CheckCircle2 } from "lucide-react";

const ControlRoomMap = dynamic(
  () => import("@/components/maps/ControlRoomMap"),
  { ssr: false }
);

export default function CitizenTrack() {
  const [mounted, setMounted] = useState(false);
  const [eta, setEta] = useState(4);
  const [distance, setDistance] = useState(1.2);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setEta((prev) => (prev > 1 ? prev - 1 : 1));
      setDistance((prev) => (prev > 0.3 ? parseFloat((prev - 0.2).toFixed(1)) : 0.3));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Demo incident simulating a dispatched unit tracking
  const demoIncidents = [
    {
      _id: "TRACK_SOS_01",
      status: "UNIT_DISPATCHED",
      servicesRequired: ["POLICE"],
      location: { coordinates: [77.2090, 28.6139] as [number, number] }, // Note: [lng, lat] for DB
    },
  ];

  if (!mounted) return null;

  return (
    <div className="h-screen flex flex-col bg-black text-white relative">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[1000] flex items-center justify-center">
        <div className="glass-card flex items-center gap-4 px-6 py-3 rounded-full border border-primary/30 shadow-[0_0_30px_rgba(59,130,246,0.3)] backdrop-blur-xl">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          <span className="font-heading font-black tracking-widest uppercase text-sm">LIVE TRACKING ACTIVE</span>
        </div>
      </div>

      <div className="flex-1 relative">
        <ControlRoomMap incidents={demoIncidents} />
      </div>

      {/* Bottom Panel */}
      <div className="absolute bottom-6 left-6 right-6 z-[1000] flex justify-center">
        <div className="w-full max-w-4xl glass-card rounded-xl border border-surface-border bg-black/80 backdrop-blur-xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center gap-8">
          
          <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 border border-primary/50 relative">
            <Shield className="w-8 h-8 text-primary" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center border-2 border-black">
              <CheckCircle2 className="w-3 h-3 text-black" />
            </div>
          </div>

          <div className="flex-1">
            <h2 className="font-heading font-black text-2xl uppercase tracking-wider mb-1">Police Unit Dispatched</h2>
            <div className="flex items-center gap-4 text-xs font-mono text-muted uppercase tracking-widest">
              <span className="flex items-center gap-1"><Siren className="w-3 h-3" /> Vehicle #DL-1C-4589</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Route Active</span>
            </div>
          </div>

          <div className="flex items-center gap-8 border-l border-surface-border pl-8">
            <div>
              <p className="text-[10px] font-heading font-bold text-muted uppercase tracking-widest mb-1">Estimated Time</p>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-black text-3xl text-primary">{eta}</span>
                <span className="text-xs font-mono text-primary uppercase">MIN</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-heading font-bold text-muted uppercase tracking-widest mb-1">Distance</p>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-black text-3xl text-white">{distance}</span>
                <span className="text-xs font-mono text-muted uppercase">KM</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
