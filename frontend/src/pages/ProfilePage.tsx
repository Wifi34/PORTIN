import React, { useState } from 'react';
import { User, Building, Mail, Shield, CheckCircle2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [organization, setOrganization] = useState(user?.organization || 'SAIL');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.put(`/auth/me?full_name=${encodeURIComponent(fullName)}&organization=${encodeURIComponent(organization)}`);
      updateUser(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to update profile', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* EXECUTIVE HEADER CARD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] border-t-[3px] border-t-[#D6A63B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#D6A63B]">
              Operator Security & Credentials
            </span>
            <DataProvenanceBadge sourceType="OFFICIAL STATIC" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F2747] tracking-tight">
            Operator Profile & Account Credentials
          </h1>
          <p className="text-xs sm:text-sm text-[#68717D] mt-1 font-medium">
            Manage your organizational designation, department clearances, and security access privileges.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-3.5 rounded-[8px] bg-[#F3FAF7] border border-[#BCF0DA] text-[#2F7D4B] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2F7D4B]" />
          <span>Profile information updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-sm border-t-[3px] border-t-[#D6A63B] space-y-4">
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-[#0F2747] mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-[#68717D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-xs text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-[#0F2747] mb-1.5">
            Official Email (Read-Only)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#68717D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F7F3]/70 border border-[#E4E2DC] rounded-[8px] text-xs text-[#68717D] cursor-not-allowed font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-[#0F2747] mb-1.5">
            Organization / Department
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-[#68717D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-xs text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-[#0F2747] mb-1.5">
            Assigned System Role
          </label>
          <div className="relative">
            <Shield className="w-4 h-4 text-[#68717D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              disabled
              value={user?.role?.toUpperCase().replace('_', ' ') || 'ANALYST'}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F7F3]/70 border border-[#E4E2DC] rounded-[8px] text-xs font-bold text-[#0F2747] cursor-not-allowed"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-[#D6A63B] hover:bg-[#c49530] text-[#0F2747] font-black uppercase tracking-wider text-xs rounded-[8px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
        </button>
      </form>
    </div>
  );
};
