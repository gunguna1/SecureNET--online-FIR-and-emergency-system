"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { FileText, Plus, Clock, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Complaint {
  _id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function MyComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi("/complaints/my-complaints")
      .then((res) => {
        if (res.success) {
          setComplaints(res.data || []);
        }
      })
      .catch((err) => console.error("Failed to fetch complaints:", err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return "text-accent border-accent/30 bg-accent/10";
      case "ASSIGNED":
      case "IN_PROGRESS":
        return "text-primary border-primary/30 bg-primary/10";
      case "RESOLVED":
      case "CLOSED":
        return "text-success border-success/30 bg-success/10";
      case "REJECTED":
        return "text-danger border-danger/30 bg-danger/10";
      default:
        return "text-muted border-surface-border bg-surface";
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-black text-3xl uppercase tracking-wider text-white">My Complaints</h1>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mt-1">Track your filed reports</p>
        </div>
        <Link href="/citizen/complaints/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            FILE NEW COMPLAINT
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="glass-card h-24 animate-pulse border-surface-border p-6" />
          ))
        ) : complaints.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-20 border-surface-border">
            <FileText className="w-12 h-12 text-muted mb-4 opacity-50" />
            <p className="font-heading font-bold uppercase tracking-widest text-white text-lg">No Complaints Filed</p>
            <p className="text-sm font-mono text-muted uppercase tracking-widest mt-2">You haven't submitted any FIRs or complaints yet.</p>
          </div>
        ) : (
          complaints.map((complaint) => (
            <div key={complaint._id} className="glass-card p-6 border border-surface-border hover:border-accent/50 transition-colors flex items-center justify-between gap-6 group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-surface border border-surface-border flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-lg uppercase tracking-wider mb-1">
                    {complaint.title}
                  </h3>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-muted uppercase tracking-widest">
                    <span>ID: {complaint._id.slice(-6)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(complaint.createdAt).toLocaleDateString()}</span>
                    <span>TYPE: {complaint.type.replace("_", " ")}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded border text-[10px] font-heading font-bold uppercase tracking-widest ${getStatusColor(complaint.status)}`}>
                  {complaint.status.replace("_", " ")}
                </span>
                <span className={`px-3 py-1 rounded border text-[10px] font-heading font-bold uppercase tracking-widest ${
                  complaint.priority === 'CRITICAL' || complaint.priority === 'HIGH' ? 'text-danger border-danger/30 bg-danger/10' : 'text-primary border-primary/30 bg-primary/10'
                }`}>
                  {complaint.priority}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
