"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { fetchApi } from "@/lib/api";
import { User, Mail, Phone, Lock, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CitizenProfile() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        // Phone isn't in user store by default, so it might be empty
        // We'll leave it as "" or if we fetch full profile, populate it.
      }));
      // Fetch full profile to get phone
      fetchApi("/auth/me").then((res) => {
        if (res.success && res.data) {
          setFormData((prev) => ({
            ...prev,
            firstName: res.data.firstName || "",
            lastName: res.data.lastName || "",
            phone: res.data.phone || "",
          }));
        }
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      // Remove password from payload if empty
      const payload: any = { ...formData };
      if (!payload.password) delete payload.password;

      const res = await fetchApi("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccessMsg("Profile updated successfully");
        updateUser(res.data);
        setFormData({ ...formData, password: "" });
      } else {
        setErrorMsg(res.message || "Failed to update profile");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-accent/10 border border-accent/20 flex items-center justify-center rounded">
          <User className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="font-heading font-black text-3xl uppercase tracking-wider text-white">Profile Settings</h1>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mt-1">Manage your citizen identity</p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 border border-success/30 bg-success/10 rounded flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-success" />
          <p className="text-sm font-mono text-success uppercase tracking-wider">{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 border border-danger/30 bg-danger/10 rounded">
          <p className="text-sm font-mono text-danger uppercase tracking-wider">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-8 border border-surface-border">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-[10px] font-heading font-bold uppercase tracking-widest text-muted mb-2">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-black border border-surface-border rounded pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                placeholder="First Name"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-heading font-bold uppercase tracking-widest text-muted mb-2">Last Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-black border border-surface-border rounded pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                placeholder="Last Name"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-[10px] font-heading font-bold uppercase tracking-widest text-muted mb-2">Email Address</label>
          <div className="relative opacity-50 cursor-not-allowed">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full bg-black border border-surface-border rounded pl-10 pr-4 py-2 text-sm text-white cursor-not-allowed"
            />
          </div>
          <p className="text-[10px] text-muted mt-2 tracking-widest uppercase">Email address cannot be changed.</p>
        </div>

        <div className="mb-6">
          <label className="block text-[10px] font-heading font-bold uppercase tracking-widest text-muted mb-2">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-black border border-surface-border rounded pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="+91..."
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-[10px] font-heading font-bold uppercase tracking-widest text-muted mb-2">Update Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-black border border-surface-border rounded pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="Leave blank to keep current password"
            />
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-surface-border">
          <Button type="submit" disabled={loading} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {loading ? "SAVING..." : "SAVE CHANGES"}
          </Button>
        </div>
      </form>
    </div>
  );
}
