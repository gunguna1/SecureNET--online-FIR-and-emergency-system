"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Shield, Siren, Flame, Activity, Crosshair, Zap, Navigation } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FleetCounts {
  POLICE: number;
  FIRE: number;
  AMBULANCE: number;
}

export default function DispatchPanel() {
  const [counts, setCounts] = useState<FleetCounts>({ POLICE: 0, FIRE: 0, AMBULANCE: 0 });

  useEffect(() => {
    fetchApi("/dispatch/available-units")
      .then(res => {
        if (res.success && res.data) setCounts(res.data);
      })
      .catch(console.error);
  }, []);

  // Generate demo fleet based on counts for visual purposes
  const generateDemoFleet = (type: string, count: number, icon: any, colorClass: string) => {
    return Array.from({ length: Math.max(1, count) }).map((_, i) => ({
      id: `${type.slice(0, 3)}-${100 + i}`,
      type,
      status: i % 3 === 0 ? "DISPATCHED" : "AVAILABLE",
      icon,
      colorClass
    }));
  };

  const demoFleet = [
    ...generateDemoFleet("POLICE", counts.POLICE || 4, Shield, "text-primary border-primary/30 bg-primary/10"),
    ...generateDemoFleet("MEDICAL", counts.AMBULANCE || 3, Siren, "text-success border-success/30 bg-success/10"),
    ...generateDemoFleet("FIRE", counts.FIRE || 2, Flame, "text-orange-500 border-orange-500/30 bg-orange-500/10"),
  ];

  return (
    <div className="min-h-screen bg-black p-8 font-sans text-white">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-surface-border">
        <div>
          <h1 className="font-heading font-black text-3xl uppercase tracking-wider text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-accent" /> Fleet Management & Dispatch
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mt-2">Manage operational readiness and manually assign units to sectors.</p>
        </div>
        <Button className="flex items-center gap-2 px-6">
          <Navigation className="w-4 h-4" /> AUTO-DISPATCH OPTIMIZER
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 border-l-4 border-primary/50 relative overflow-hidden group hover:border-primary transition-colors cursor-default">
          <div className="absolute right-[-20px] top-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
            <Shield className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-heading font-bold uppercase tracking-widest text-muted text-xs">Police Units</h2>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-black text-5xl text-white">{counts.POLICE}</span>
            <span className="text-xs font-mono text-primary uppercase tracking-widest">Available</span>
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-success/50 relative overflow-hidden group hover:border-success transition-colors cursor-default">
          <div className="absolute right-[-20px] top-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
            <Siren className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-success/20 flex items-center justify-center">
              <Siren className="w-4 h-4 text-success" />
            </div>
            <h2 className="font-heading font-bold uppercase tracking-widest text-muted text-xs">Medical Units</h2>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-black text-5xl text-white">{counts.AMBULANCE}</span>
            <span className="text-xs font-mono text-success uppercase tracking-widest">Available</span>
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-orange-500/50 relative overflow-hidden group hover:border-orange-500 transition-colors cursor-default">
          <div className="absolute right-[-20px] top-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
            <Flame className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-orange-500/20 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <h2 className="font-heading font-bold uppercase tracking-widest text-muted text-xs">Fire Units</h2>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-black text-5xl text-white">{counts.FIRE}</span>
            <span className="text-xs font-mono text-orange-500 uppercase tracking-widest">Available</span>
          </div>
        </div>
      </div>

      <h3 className="font-heading font-black text-xl uppercase tracking-wider mb-6 flex items-center gap-2">
        <Crosshair className="w-5 h-5 text-accent" /> Active Fleet Roster
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {demoFleet.map((unit, idx) => {
          const Icon = unit.icon;
          return (
            <div key={idx} className="glass-card p-4 flex flex-col items-center text-center hover:bg-surface-hover transition-colors cursor-pointer group border border-surface-border hover:border-accent/50">
              <div className={`w-12 h-12 rounded-full border mb-4 flex items-center justify-center ${unit.colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-heading font-bold text-sm uppercase tracking-wider mb-1 group-hover:text-white transition-colors">{unit.id}</p>
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-3">{unit.type} DIVISION</p>
              
              <div className="w-full h-[1px] bg-surface-border mb-3" />
              
              <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest border w-full text-center ${
                unit.status === "AVAILABLE" ? "bg-success/10 text-success border-success/30" : "bg-danger/10 text-danger border-danger/30"
              }`}>
                {unit.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
