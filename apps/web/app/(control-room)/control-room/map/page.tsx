"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { fetchApi } from "@/lib/api";
import { useSocketStore } from "@/store/socketStore";
import { Map, Activity, ShieldAlert, Crosshair, MapPin } from "lucide-react";

const ControlRoomMap = dynamic(
  () => import("@/components/maps/ControlRoomMap"),
  { ssr: false }
);

interface Incident {
  _id: string;
  status: string;
  servicesRequired: string[];
  location: { coordinates: [number, number] };
  createdAt: string;
}

export default function TacticalMap() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const { connect, socket } = useSocketStore();

  const fetchIncidents = async () => {
    try {
      const res = await fetchApi("/dispatch/active-incidents");
      if (res.success) {
        setIncidents(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load map data", err);
    }
  };

  useEffect(() => {
    connect();
    fetchIncidents();
    const timer = setInterval(fetchIncidents, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("sos:new", fetchIncidents);
    return () => { socket.off("sos:new"); };
  }, [socket]);

  return (
    <div className="h-screen w-full bg-black flex flex-col relative overflow-hidden">
      {/* Header Overlay */}
      <div className="absolute top-6 left-6 z-[1000] glass-card px-6 py-4 rounded border border-surface-border flex items-center gap-4 shadow-2xl">
        <div className="w-10 h-10 rounded bg-accent/20 border border-accent/40 flex items-center justify-center">
          <Map className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="font-heading font-black text-xl text-white uppercase tracking-wider leading-tight">Tactical Map</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-[10px] font-mono text-muted uppercase tracking-widest">LIVE DATA FEED ACTIVATED</span>
          </div>
        </div>
      </div>

      {/* KPI Overlay */}
      <div className="absolute top-6 right-6 z-[1000] glass-card p-4 rounded border border-surface-border flex gap-6 shadow-2xl">
        <div>
          <p className="text-[9px] font-heading font-bold text-muted uppercase tracking-widest mb-1">Active Markers</p>
          <p className="font-heading font-black text-2xl text-white">{incidents.length}</p>
        </div>
        <div className="border-l border-surface-border pl-6">
          <p className="text-[9px] font-heading font-bold text-muted uppercase tracking-widest mb-1">Critical Zones</p>
          <p className="font-heading font-black text-2xl text-danger">
            {incidents.filter(i => i.status === "SOS_SENT" || i.status === "ACKNOWLEDGED").length}
          </p>
        </div>
      </div>

      {/* Main Map */}
      <div className="flex-1 w-full h-full relative">
        <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
        <ControlRoomMap incidents={incidents} />
      </div>

      {/* Data Feed Overlay */}
      <div className="absolute bottom-6 left-6 z-[1000] max-w-sm w-full">
        <h3 className="text-[10px] font-heading font-black text-muted uppercase tracking-widest mb-2 px-2 flex items-center gap-2">
          <Activity className="w-3 h-3" /> Recent Signals
        </h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {incidents.slice(0, 5).map((inc) => (
            <div key={inc._id} className="glass-card p-3 rounded border border-surface-border/50 bg-black/80 backdrop-blur flex items-center justify-between">
              <div>
                <p className="font-heading font-bold text-xs text-white uppercase tracking-widest">{inc.servicesRequired.join(" + ")}</p>
                <div className="flex items-center gap-2 text-[9px] font-mono text-muted mt-1">
                  <MapPin className="w-3 h-3" />
                  {inc.location.coordinates[1].toFixed(4)}°N, {inc.location.coordinates[0].toFixed(4)}°E
                </div>
              </div>
              <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest border ${
                inc.status === "SOS_SENT" ? "bg-danger/20 text-danger border-danger/30 animate-pulse" : "bg-primary/10 text-primary border-primary/20"
              }`}>
                {inc.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
