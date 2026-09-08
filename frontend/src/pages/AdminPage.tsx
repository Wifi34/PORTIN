import React, { useState, useEffect } from 'react';
import {
  Shield, Database, Cpu, Users, MapPin, Ship, Activity,
  RefreshCw, CheckCircle2, AlertTriangle, Trash2, Plus, ArrowRight,
  Key, Mail, Server, Sparkles, Send, Eye, EyeOff, Zap
} from 'lucide-react';
import { apiClient } from '../api/client';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';

export const AdminPage: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [ports, setPorts] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'credentials' | 'models' | 'ports' | 'audit' | 'data'>('credentials');
  const [retraining, setRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Integrations form state
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o');
  const [groqKey, setGroqKey] = useState('');
  const [groqModel, setGroqModel] = useState('openai/gpt-oss-120b');
  const [dbUrl, setDbUrl] = useState('');
  const [alphaVantageKey, setAlphaVantageKey] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpEnabled, setSmtpEnabled] = useState(true);

  const [savingKeys, setSavingKeys] = useState(false);
  const [keysSavedMessage, setKeysSavedMessage] = useState<string | null>(null);
  const [testSmtpMessage, setTestSmtpMessage] = useState<string | null>(null);
  const [testSmtpLoading, setTestSmtpLoading] = useState(false);
  const [testAiMessage, setTestAiMessage] = useState<string | null>(null);
  const [testAiLoading, setTestAiLoading] = useState(false);

  // New port modal state
  const [newPortCode, setNewPortCode] = useState('');
  const [newPortName, setNewPortName] = useState('');
  const [newPortState, setNewPortState] = useState('');
  const [newPortDraft, setNewPortDraft] = useState(14.0);
  const [newPortLoa, setNewPortLoa] = useState(230.0);
  const [showAddPort, setShowAddPort] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const oRes = await apiClient.get('/admin/overview');
      setOverview(oRes.data);

      const aRes = await apiClient.get('/admin/audit');
      setAuditLogs(aRes.data);

      const pRes = await apiClient.get('/ports');
      setPorts(pRes.data);

      const iRes = await apiClient.get('/admin/integrations');
      setIntegrations(iRes.data);
      if (iRes.data?.groq?.model) setGroqModel(iRes.data.groq.model);
      if (iRes.data?.openai?.model) setOpenaiModel(iRes.data.openai.model);
      if (iRes.data?.smtp?.user) setSmtpUser(iRes.data.smtp.user);
      if (iRes.data?.smtp?.is_enabled !== undefined) setSmtpEnabled(iRes.data.smtp.is_enabled);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveIntegrations = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKeys(true);
    setKeysSavedMessage(null);
    try {
      const payload: any = {};
      if (groqKey) payload.groq_api_key = groqKey;
      if (groqModel) payload.groq_model = groqModel;
      if (openaiKey) payload.openai_api_key = openaiKey;
      if (openaiModel) payload.openai_model = openaiModel;
      if (dbUrl) payload.database_url = dbUrl;
      if (alphaVantageKey) payload.alpha_vantage_key = alphaVantageKey;
      if (smtpUser) payload.smtp_user = smtpUser;
      if (smtpPassword) payload.smtp_password = smtpPassword;
      payload.smtp_enabled = smtpEnabled;

      const res = await apiClient.post('/admin/integrations', payload);
      setKeysSavedMessage(res.data.message);
      setTimeout(() => setKeysSavedMessage(null), 4000);
      loadData();
    } catch (err: any) {
      setKeysSavedMessage('Failed to update credentials: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSavingKeys(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestSmtpLoading(true);
    setTestSmtpMessage(null);
    try {
      const res = await apiClient.post('/admin/test-smtp', { email: smtpUser || 'admin@portin.sail.gov.in' });
      setTestSmtpMessage('✓ ' + res.data.message);
    } catch (err: any) {
      setTestSmtpMessage('✕ ' + (err.response?.data?.detail || 'SMTP test failed.'));
    } finally {
      setTestSmtpLoading(false);
    }
  };

  const handleTestOpenAi = async () => {
    setTestAiLoading(true);
    setTestAiMessage(null);
    try {
      const res = await apiClient.post('/admin/test-openai');
      setTestAiMessage(`✓ [${res.data.category}] ${res.data.sample_response}`);
    } catch (err: any) {
      setTestAiMessage('✕ OpenAI test failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setTestAiLoading(false);
    }
  };

  const handleRetrainModel = async () => {
    setRetraining(true);
    setRetrainSuccess(false);
    try {
      const res = await apiClient.post('/admin/models/retrain');
      setRetrainSuccess(true);
      setTimeout(() => setRetrainSuccess(false), 4000);
      loadData();
    } catch (e) {
      console.error('Retrain failed', e);
    } finally {
      setRetraining(false);
    }
  };

  const handleCreatePort = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/ports', {
        code: newPortCode,
        name: newPortName,
        state: newPortState,
        latitude: 20.0,
        longitude: 86.0,
        max_draft: Number(newPortDraft),
        max_loa: Number(newPortLoa),
        annual_capacity_mt: 30.0,
      });
      setShowAddPort(false);
      setNewPortCode('');
      setNewPortName('');
      setNewPortState('');
      loadData();
    } catch (err) {
      console.error('Failed to create port', err);
    }
  };

  const handleDeletePort = async (id: number) => {
    if (!window.confirm(`Delete port #${id}?`)) return;
    try {
      await apiClient.delete(`/admin/ports/${id}`);
      loadData();
    } catch (err) {
      console.error('Failed to delete port', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E2DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-[6px] bg-[#F8F7F3] border border-[#E4E2DC] text-[#D6A63B]">
              <Shield className="w-4 h-4 text-[#D6A63B]" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#D6A63B]">
              System Administration & Master Data
            </span>
            <DataProvenanceBadge sourceType="OFFICIAL STATIC" />
          </div>
          <h1 className="text-2xl font-black text-[#0F2747] tracking-tight">
            Administrator Control Center
          </h1>
          <p className="text-xs text-[#68717D] mt-1">
            Manage production cloud credentials, OpenAI GPT model lifecycles, and gazetted port master data.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-[8px] bg-white hover:bg-[#F8F7F3] border border-[#E4E2DC] text-[#0F2747] shadow-sm transition-colors self-start sm:self-center"
          title="Refresh Admin Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#D6A63B]' : ''}`} />
        </button>
      </div>

      {/* Admin KPI Ribbon */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
            <span className="text-[10px] uppercase font-bold text-[#68717D]">System Status</span>
            <div className="text-lg font-black text-[#2F7D4B] mt-0.5">{overview.system_status}</div>
          </div>
          <div className="p-4 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
            <span className="text-[10px] uppercase font-bold text-[#68717D]">Active Database</span>
            <div className="text-lg font-black text-[#0F2747] mt-0.5">{integrations?.database?.dialect || 'SQLite'}</div>
          </div>
          <div className="p-4 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
            <span className="text-[10px] uppercase font-bold text-[#68717D]">AI LLM Model</span>
            <div className="text-lg font-black text-[#0F2747] mt-0.5">{integrations?.openai?.model || 'GPT-4o'}</div>
          </div>
          <div className="p-4 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
            <span className="text-[10px] uppercase font-bold text-[#68717D]">Master Ports</span>
            <div className="text-lg font-black text-[#0F2747] mt-0.5">{overview.total_ports}</div>
          </div>
          <div className="p-4 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
            <span className="text-[10px] uppercase font-bold text-[#68717D]">Berth Records</span>
            <div className="text-lg font-black text-[#0F2747] mt-0.5">{overview.total_berths}</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E4E2DC] pb-2">
        <button
          onClick={() => setActiveTab('credentials')}
          className={`px-4 py-2 rounded-[8px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'credentials' ? 'bg-[#0F2747] text-white shadow-sm' : 'text-[#68717D] hover:text-[#0F2747] hover:bg-white'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Production Credentials & Cloud Keys</span>
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 rounded-[8px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'models' ? 'bg-[#0F2747] text-white shadow-sm' : 'text-[#68717D] hover:text-[#0F2747] hover:bg-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Model Lifecycle & Validation</span>
        </button>
        <button
          onClick={() => setActiveTab('ports')}
          className={`px-4 py-2 rounded-[8px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'ports' ? 'bg-[#0F2747] text-white shadow-sm' : 'text-[#68717D] hover:text-[#0F2747] hover:bg-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Port Master Data CRUD</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-[8px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'audit' ? 'bg-[#0F2747] text-white shadow-sm' : 'text-[#68717D] hover:text-[#0F2747] hover:bg-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>System Audit Trail ({auditLogs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 rounded-[8px] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'data' ? 'bg-[#0F2747] text-white shadow-sm' : 'text-[#68717D] hover:text-[#0F2747] hover:bg-white'
          }`}
        >
          <span>Data Provenance Layer</span>
        </button>
      </div>

      {/* TAB: PRODUCTION CREDENTIALS & CLOUD KEYS */}
      {activeTab === 'credentials' && (
        <div className="space-y-6">
          {keysSavedMessage && (
            <div className="p-4 rounded-[8px] bg-[#F3FAF7] border border-[#BCF0DA] text-[#2F7D4B] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2F7D4B] shrink-0" />
              <span>{keysSavedMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveIntegrations} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Groq Cloud Ultra-Fast Neural Engine Card */}
              <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#D6A63B]" />
                    <div>
                      <h3 className="text-xs font-black text-[#0F2747] uppercase tracking-wider">Groq Cloud AI Engine (Active)</h3>
                      <span className="text-[10px] text-[#68717D]">Ultra-Fast Real-Time Neural Reasoning</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                    integrations?.groq?.is_configured
                      ? 'bg-[#F3FAF7] text-[#2F7D4B] border-[#BCF0DA]'
                      : 'bg-[#FEF7EC] text-[#D98A27] border-[#FBE6C2]'
                  }`}>
                    {integrations?.groq?.is_configured ? 'LIVE & REAL-TIME' : 'NOT CONFIGURED'}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[#0F2747] font-bold mb-1.5">Groq Cloud API Key (gsk_...)</label>
                    <input
                      type="password"
                      value={groqKey}
                      onChange={(e) => setGroqKey(e.target.value)}
                      placeholder={integrations?.groq?.key_masked || "gsk_..."}
                      className="w-full px-3 py-2.5 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-mono text-xs focus:bg-white focus:border-[#D6A63B] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[#0F2747] font-bold mb-1.5">Active Model</label>
                    <select
                      value={groqModel}
                      onChange={(e) => setGroqModel(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] text-xs font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
                    >
                      <option value="openai/gpt-oss-120b">openai/gpt-oss-120b (120B Parameters — Deep Maritime & General AI)</option>
                      <option value="qwen/qwen3.8-27b">qwen/qwen3.8-27b (Fast 27B Model)</option>
                      <option value="openai/gpt-oss-20b">openai/gpt-oss-20b (Ultra Fast)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleTestOpenAi}
                      disabled={testAiLoading}
                      className="px-3.5 py-1.5 bg-[#0F2747] hover:bg-[#163864] text-white text-xs font-bold rounded-[6px] shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D6A63B]" />
                      <span>{testAiLoading ? 'Testing Live Generation...' : 'Test Live Generation'}</span>
                    </button>
                    <span className="text-[11px] text-[#2F7D4B] font-semibold">100% Real-Time Live</span>
                  </div>

                  {testAiMessage && (
                    <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] text-xs text-[#172033] whitespace-pre-line max-h-48 overflow-y-auto">
                      {testAiMessage}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. OpenAI Fallback Card */}
              <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#68717D]" />
                    <div>
                      <h3 className="text-xs font-black text-[#0F2747] uppercase tracking-wider">OpenAI API (Secondary / Fallback)</h3>
                      <span className="text-[10px] text-[#68717D]">GPT-4o / GPT-4o-mini Integration</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                    integrations?.openai?.is_configured
                      ? 'bg-[#F3FAF7] text-[#2F7D4B] border-[#BCF0DA]'
                      : 'bg-[#FEF7EC] text-[#D98A27] border-[#FBE6C2]'
                  }`}>
                    {integrations?.openai?.is_configured ? 'CONFIGURED' : 'OPTIONAL'}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[#0F2747] font-bold mb-1.5">OpenAI API Key (sk-...)</label>
                    <input
                      type="password"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder={integrations?.openai?.key_masked || "Paste your OpenAI API Key (sk-...)"}
                      className="w-full px-3 py-2.5 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-mono text-xs focus:bg-white focus:border-[#D6A63B] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[#0F2747] font-bold mb-1.5">Model Selection</label>
                    <select
                      value={openaiModel}
                      onChange={(e) => setOpenaiModel(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] text-xs font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
                    >
                      <option value="gpt-4o">OpenAI GPT-4o (Frontier Model)</option>
                      <option value="gpt-4o-mini">OpenAI GPT-4o-mini (Cost Efficient)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. PostgreSQL Database Connection */}
              <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-[#D6A63B]" />
                    <div>
                      <h3 className="text-xs font-black text-[#0F2747] uppercase tracking-wider">PostgreSQL Cloud Persistence</h3>
                      <span className="text-[10px] text-[#68717D]">Supabase / Neon / Render / Local</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-[#F8F7F3] text-[#0F2747] border border-[#E4E2DC]">
                    {integrations?.database?.dialect || 'SQLite'}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[#0F2747] font-bold mb-1.5">PostgreSQL Connection URI</label>
                    <input
                      type="password"
                      value={dbUrl}
                      onChange={(e) => setDbUrl(e.target.value)}
                      placeholder="postgresql://user:password@db.supabase.co:5432/postgres"
                      className="w-full px-3 py-2.5 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-mono text-xs focus:bg-white focus:border-[#D6A63B] transition-colors"
                    />
                    <span className="text-[10px] text-[#68717D] mt-1.5 block">
                      Leave blank to continue using local zero-config SQLite.
                    </span>
                  </div>

                  <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] text-[11px] text-[#68717D]">
                    Active URL: <span className="font-mono text-[#0F2747] font-semibold">{integrations?.database?.connection_url_masked || 'sqlite:///./portin.db'}</span>
                  </div>
                </div>
              </div>

              {/* 3. Gmail SMTP Configuration */}
              <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#D6A63B]" />
                    <div>
                      <h3 className="text-xs font-black text-[#0F2747] uppercase tracking-wider">Gmail SMTP Service</h3>
                      <span className="text-[10px] text-[#68717D]">Official Password Reset & Alert Delivery</span>
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-[#0F2747] font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smtpEnabled}
                      onChange={(e) => setSmtpEnabled(e.target.checked)}
                      className="rounded accent-[#D6A63B]"
                    />
                    <span>Enabled</span>
                  </label>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#0F2747] font-bold mb-1.5">Gmail Address (SMTP User)</label>
                      <input
                        type="email"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] text-xs focus:bg-white focus:border-[#D6A63B] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[#0F2747] font-bold mb-1.5">Google App Password</label>
                      <input
                        type="password"
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                        placeholder="abcd efgh ijkl mnop"
                        className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] text-xs focus:bg-white focus:border-[#D6A63B] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleTestSmtp}
                      disabled={testSmtpLoading}
                      className="px-3.5 py-1.5 bg-white hover:bg-[#F8F7F3] text-[#0F2747] text-xs font-bold rounded-[6px] border border-[#E4E2DC] shadow-sm transition-colors cursor-pointer"
                    >
                      {testSmtpLoading ? 'Sending...' : 'Send Test Email'}
                    </button>
                    <span className="text-[10px] text-[#68717D]">Host: smtp.gmail.com:587 (TLS)</span>
                  </div>

                  {testSmtpMessage && (
                    <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] text-xs text-[#172033]">
                      {testSmtpMessage}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Alpha Vantage Commodity Key */}
              <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#D6A63B]" />
                    <div>
                      <h3 className="text-xs font-black text-[#0F2747] uppercase tracking-wider">Alpha Vantage Commodity Feed</h3>
                      <span className="text-[10px] text-[#68717D]">Live Metallurgical Coal & Energy Pricing</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-[#F8F7F3] text-[#0F2747] border border-[#E4E2DC]">
                    {integrations?.alpha_vantage?.is_configured ? 'API ACTIVE' : 'WORLD BANK BENCHMARK'}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[#0F2747] font-bold mb-1.5">Alpha Vantage API Key</label>
                    <input
                      type="password"
                      value={alphaVantageKey}
                      onChange={(e) => setAlphaVantageKey(e.target.value)}
                      placeholder={integrations?.alpha_vantage?.key_masked || "Paste Alpha Vantage API key (Free at alphavantage.co)"}
                      className="w-full px-3 py-2.5 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-mono text-xs focus:bg-white focus:border-[#D6A63B] transition-colors"
                    />
                  </div>
                  <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] text-[11px] text-[#68717D]">
                    If key is not provided, PortIN seamlessly serves historical World Bank Pink Sheet commodity indices.
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingKeys}
                className="px-6 py-3 bg-[#D6A63B] hover:bg-[#c49530] text-[#0F2747] font-black uppercase tracking-wider text-xs rounded-[8px] shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{savingKeys ? 'Saving Production Credentials...' : 'Save & Apply All Credentials'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 1: MODEL LIFECYCLE */}
      {activeTab === 'models' && overview && (
        <div className="p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-sm border-t-[3px] border-t-[#D6A63B] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E2DC]">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#D6A63B]" />
                <h3 className="text-base font-black text-[#0F2747]">
                  Active Forecasting Model: {overview.active_model.name}
                </h3>
                <span className="px-2.5 py-1 rounded-[4px] text-[10px] font-black uppercase bg-[#F3FAF7] text-[#2F7D4B] border border-[#BCF0DA]">
                  {overview.active_model.status}
                </span>
              </div>
              <p className="text-xs text-[#68717D] mt-1">
                Version: {overview.active_model.version} • Trained: {overview.active_model.trained_at} • Sample Rows: {overview.active_model.row_count.toLocaleString()}
              </p>
            </div>

            <button
              onClick={handleRetrainModel}
              disabled={retraining}
              className="px-4 py-2.5 bg-[#D6A63B] hover:bg-[#c49530] text-[#0F2747] font-black uppercase tracking-wider text-xs rounded-[8px] shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
              <span>{retraining ? 'Retraining ML Pipeline...' : 'Retrain & Validate Model'}</span>
            </button>
          </div>

          {retrainSuccess && (
            <div className="p-3.5 rounded-[8px] bg-[#F3FAF7] border border-[#BCF0DA] text-[#2F7D4B] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2F7D4B]" />
              <span>Pipeline retrained successfully. Model validation metrics updated.</span>
            </div>
          )}

          {/* Validation Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[#68717D] text-xs font-semibold block">Mean Absolute Error (MAE):</span>
              <span className="text-2xl font-black text-[#0F2747] font-mono mt-1.5 block">
                {overview.active_model.mae} USD/MT
              </span>
              <span className="text-[11px] text-[#2F7D4B] font-bold">Validated on chronological holdout</span>
            </div>

            <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[#68717D] text-xs font-semibold block">Root Mean Squared Error:</span>
              <span className="text-2xl font-black text-[#0F2747] font-mono mt-1.5 block">
                {overview.active_model.rmse} USD/MT
              </span>
              <span className="text-[11px] text-[#68717D]">Quantile loss objective</span>
            </div>

            <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[#68717D] text-xs font-semibold block">Percentage Error (MAPE):</span>
              <span className="text-2xl font-black text-[#0F2747] font-mono mt-1.5 block">
                {overview.active_model.mape}%
              </span>
              <span className="text-[11px] text-[#2F7D4B] font-bold">Within industry standard</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PORT CRUD */}
      {activeTab === 'ports' && (
        <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
            <h3 className="text-xs font-black text-[#0F2747] uppercase tracking-wider">
              Gazetted Port Directory ({ports.length} Records)
            </h3>
            <button
              onClick={() => setShowAddPort(!showAddPort)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#D6A63B] hover:bg-[#c49530] text-[#0F2747] font-black uppercase tracking-wider text-xs rounded-[8px] shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Port</span>
            </button>
          </div>

          {showAddPort && (
            <form onSubmit={handleCreatePort} className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[#0F2747] font-bold mb-1">Port Code</label>
                <input
                  type="text"
                  required
                  value={newPortCode}
                  onChange={(e) => setNewPortCode(e.target.value)}
                  placeholder="e.g. KDL"
                  className="w-full px-2.5 py-2 bg-white border border-[#E4E2DC] rounded-[6px] text-[#172033] focus:border-[#D6A63B]"
                />
              </div>
              <div>
                <label className="block text-[#0F2747] font-bold mb-1">Port Name</label>
                <input
                  type="text"
                  required
                  value={newPortName}
                  onChange={(e) => setNewPortName(e.target.value)}
                  placeholder="e.g. Kandla Port"
                  className="w-full px-2.5 py-2 bg-white border border-[#E4E2DC] rounded-[6px] text-[#172033] focus:border-[#D6A63B]"
                />
              </div>
              <div>
                <label className="block text-[#0F2747] font-bold mb-1">State</label>
                <input
                  type="text"
                  required
                  value={newPortState}
                  onChange={(e) => setNewPortState(e.target.value)}
                  placeholder="e.g. Gujarat"
                  className="w-full px-2.5 py-2 bg-white border border-[#E4E2DC] rounded-[6px] text-[#172033] focus:border-[#D6A63B]"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-[#D6A63B] hover:bg-[#c49530] text-[#0F2747] font-black uppercase tracking-wider text-xs rounded-[6px] shadow-sm cursor-pointer"
                >
                  Save Port
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7F3] text-[#0F2747] uppercase text-[10px] font-black border-b border-[#E4E2DC]">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Port Name</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">Max Draft</th>
                  <th className="py-2.5 px-3">Max LOA</th>
                  <th className="py-2.5 px-3">Source Provenance</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E2DC]">
                {ports.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8F7F3]/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0F2747]">{p.code}</td>
                    <td className="py-2.5 px-3 font-bold text-[#0F2747]">{p.name}</td>
                    <td className="py-2.5 px-3 text-[#172033]">{p.state}</td>
                    <td className="py-2.5 px-3 font-mono text-[#0F2747] font-semibold">{p.max_draft}m</td>
                    <td className="py-2.5 px-3 font-mono text-[#172033]">{p.max_loa}m</td>
                    <td className="py-2.5 px-3 text-[11px] text-[#68717D] truncate max-w-xs">{p.source}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeletePort(p.id)}
                        className="text-[#C64A3B] hover:text-rose-700 p-1 cursor-pointer"
                        title="Delete Port"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
          <h3 className="text-xs font-black text-[#0F2747] uppercase tracking-wider pb-3 border-b border-[#E4E2DC]">
            Security & Operational Audit Trail
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7F3] text-[#0F2747] uppercase text-[10px] font-black border-b border-[#E4E2DC]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Resource</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E2DC]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8F7F3]/60">
                    <td className="py-2.5 px-3 text-[#68717D] font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#0F2747]">{log.action}</td>
                    <td className="py-2.5 px-3 text-[#172033] font-medium">{log.resource}</td>
                    <td className="py-2.5 px-3 text-[#68717D] truncate max-w-md">{log.details}</td>
                    <td className="py-2.5 px-3 font-mono text-[#68717D]">#{log.user_id || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DATA PROVENANCE LAYER */}
      {activeTab === 'data' && overview && (
        <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
          <h3 className="text-xs font-black text-[#0F2747] uppercase tracking-wider pb-3 border-b border-[#E4E2DC]">
            Government Compliance Data Provenance Status
          </h3>

          <div className="space-y-3">
            {Object.entries(overview.data_provenance).map(([k, v]: [string, any]) => (
              <div key={k} className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#0F2747] text-xs capitalize">{k.replace('_', ' ')}</span>
                  <p className="text-[11px] text-[#68717D] mt-0.5">{v}</p>
                </div>
                <DataProvenanceBadge sourceType={v.includes('OFFICIAL') ? 'OFFICIAL STATIC' : v.includes('LIVE') ? 'LIVE' : 'REAL-TIME PREDICTIVE ENGINE'} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
