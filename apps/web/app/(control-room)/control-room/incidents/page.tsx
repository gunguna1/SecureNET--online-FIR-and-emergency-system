"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { useSocketStore } from "@/store/socketStore";
import { Search, Filter, AlertTriangle, Shield, CheckCircle2, Siren, Crosshair, Clock } from "lucide-react";

interface Incident {
  _id: string;
  status: string;
  servicesRequired: string[];
  severity: string;
  location: { coordinates: [number, number] };
  createdAt: string;
  dispatchedUnits: any[];
}

export default function IncidentDataGrid() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { connect, socket } = useSocketStore();

  const fetchIncidents = async () => {
    try {
      const res = await fetchApi("/dispatch/active-incidents");
      if (res.success) setIncidents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const filtered = incidents.filter(i => 
    i._id.toLowerCase().includes(search.toLowerCase()) || 
    i.servicesRequired.join(" ").toLowerCase().includes(search.toLowerCase()) ||
    i.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black p-8 font-sans">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-heading font-black text-3xl uppercase tracking-wider text-white flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-accent" /> Live Incidents Database
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mt-2">Comprehensive operational grid view of all active emergency protocols.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search ID, type, status..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface border border-surface-border rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent w-64 font-mono uppercase tracking-wider"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-surface-border rounded-md hover:bg-surface-hover text-xs font-heading font-bold uppercase tracking-widest text-muted hover:text-white transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <div className="glass-card border border-surface-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface border-b border-surface-border">
              <tr>
                <th className="px-6 py-4 text-[10px] font-heading font-black uppercase tracking-widest text-muted">Incident ID</th>
                <th className="px-6 py-4 text-[10px] font-heading font-black uppercase tracking-widest text-muted">Services Required</th>
                <th className="px-6 py-4 text-[10px] font-heading font-black uppercase tracking-widest text-muted">Severity</th>
                <th className="px-6 py-4 text-[10px] font-heading font-black uppercase tracking-widest text-muted">Status</th>
                <th className="px-6 py-4 text-[10px] font-heading font-black uppercase tracking-widest text-muted">Coordinates</th>
                <th className="px-6 py-4 text-[10px] font-heading font-black uppercase tracking-widest text-muted">Logged At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 bg-black/40">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-surface rounded w-full"></div></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted">
                      <CheckCircle2 className="w-12 h-12 mb-4 opacity-50" />
                      <p className="font-heading font-bold uppercase tracking-widest">No active incidents found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => (
                  <tr key={inc._id} className="hover:bg-surface/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-slate-300">#{inc._id.slice(-8)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {inc.servicesRequired.includes("POLICE") && <Shield className="w-4 h-4 text-primary" />}
                        {inc.servicesRequired.includes("AMBULANCE") && <Siren className="w-4 h-4 text-success" />}
                        {inc.servicesRequired.includes("FIRE") && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                        <span className="text-xs font-heading font-bold uppercase tracking-widest text-white">
                          {inc.servicesRequired.join(" + ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border ${
                        inc.severity === 'CRITICAL' ? 'bg-danger/20 text-danger border-danger/30' :
                        inc.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                        'bg-accent/20 text-accent border-accent/30'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[10px] font-heading font-bold text-muted uppercase tracking-widest">
                        {inc.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-muted flex items-center gap-2">
                      <Crosshair className="w-3 h-3" />
                      {inc.location.coordinates[1].toFixed(4)}, {inc.location.coordinates[0].toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-muted">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(inc.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-surface-border bg-surface/30 flex justify-between items-center text-[10px] font-mono text-muted uppercase tracking-widest">
          <span>Showing {filtered.length} of {incidents.length} incidents</span>
          <span>End of Grid</span>
        </div>
      </div>
    </div>
  );
}
