import React, { useState, useEffect } from 'react';
import {
  Shield, Database, Cpu, Users, MapPin, Ship, Activity,
  RefreshCw, CheckCircle2, AlertTriangle, Trash2, Plus, ArrowRight,
  Key, Mail, Server, Sparkles, Send, Eye, EyeOff
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
  const [postgresUrl, setPostgresUrl] = useState('');
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
      if (openaiKey) payload.openai_api_key = openaiKey;
      if (openaiModel) payload.openai_model = openaiModel;
      if (postgresUrl) payload.database_url = postgresUrl;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-amber-500/20 text-amber-400">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">System Administration & Master Data</span>
            <DataProvenanceBadge sourceType="OFFICIAL STATIC" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Administrator Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage production cloud credentials, OpenAI GPT model lifecycles, and gazetted port master data.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Admin KPI Ribbon */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-[#081426] border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">System Status</span>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{overview.system_status}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#081426] border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Active Database</span>
            <div className="text-lg font-black text-white mt-0.5">{integrations?.database?.dialect || 'SQLite'}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#081426] border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">AI LLM Model</span>
            <div className="text-lg font-black text-cyan-300 mt-0.5">{integrations?.openai?.model || 'GPT-4o'}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#081426] border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Master Ports</span>
            <div className="text-lg font-black text-white mt-0.5">{overview.total_ports}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#081426] border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Berth Records</span>
            <div className="text-lg font-black text-cyan-300 mt-0.5">{overview.total_berths}</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('credentials')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'credentials' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Production Credentials & Cloud Keys</span>
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'models' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Model Lifecycle & Validation</span>
        </button>
        <button
          onClick={() => setActiveTab('ports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'ports' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Port Master Data CRUD</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'audit' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>System Audit Trail ({auditLogs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'data' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          Data Provenance Layer
        </button>
      </div>

      {/* TAB: PRODUCTION CREDENTIALS & CLOUD KEYS */}
      {activeTab === 'credentials' && (
        <div className="space-y-6">
          {keysSavedMessage && (
            <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{keysSavedMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveIntegrations} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. OpenAI Integration Card */}
              <div className="p-5 rounded-2xl bg-[#081426] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">OpenAI Reasoning API</h3>
                      <span className="text-[10px] text-slate-400">Powering PortIN Decision Advisor</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    integrations?.openai?.is_configured
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-950 text-amber-300 border-amber-500/30'
                  }`}>
                    {integrations?.openai?.is_configured ? 'KEY ACTIVE' : 'DETERMINISTIC FALLBACK'}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">OpenAI API Key (sk-...)</label>
                    <input
                      type="password"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder={integrations?.openai?.key_masked || "Paste your OpenAI API Key (sk-...)"}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Model Selection</label>
                    <select
                      value={openaiModel}
                      onChange={(e) => setOpenaiModel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    >
                      <option value="gpt-4o">OpenAI GPT-4o (High Speed & Deep Domain Intelligence)</option>
                      <option value="gpt-4o-mini">OpenAI GPT-4o-mini (Cost Efficient)</option>
                      <option value="gpt-5">OpenAI GPT-5 / Frontier</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleTestOpenAi}
                      disabled={testAiLoading}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      {testAiLoading ? 'Testing API...' : 'Test AI Query'}
                    </button>
                    <span className="text-[11px] text-slate-500">Live chat available in /ai-advisor</span>
                  </div>

                  {testAiMessage && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                      {testAiMessage}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. PostgreSQL Database Connection */}
              <div className="p-5 rounded-2xl bg-[#081426] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">PostgreSQL Cloud Persistence</h3>
                      <span className="text-[10px] text-slate-400">Supabase / Neon / Render / Local</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    {integrations?.database?.dialect || 'SQLite'}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">PostgreSQL Connection URI</label>
                    <input
                      type="password"
                      value={postgresUrl}
                      onChange={(e) => setPostgresUrl(e.target.value)}
                      placeholder="postgresql://user:password@db.supabase.co:5432/postgres"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:border-cyan-400"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Leave blank to continue using local zero-config SQLite.
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                    Active URL: <span className="font-mono text-white">{integrations?.database?.connection_url_masked || 'sqlite:///./portin.db'}</span>
                  </div>
                </div>
              </div>

              {/* 3. Gmail SMTP Configuration */}
              <div className="p-5 rounded-2xl bg-[#081426] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gmail SMTP Service</h3>
                      <span className="text-[10px] text-slate-400">Official Password Reset & Alert Delivery</span>
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smtpEnabled}
                      onChange={(e) => setSmtpEnabled(e.target.checked)}
                      className="rounded accent-cyan-400"
                    />
                    <span>Enabled</span>
                  </label>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Gmail Address (SMTP User)</label>
                      <input
                        type="email"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Google App Password (16-char)</label>
                      <input
                        type="password"
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                        placeholder="abcd efgh ijkl mnop"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleTestSmtp}
                      disabled={testSmtpLoading}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      {testSmtpLoading ? 'Sending...' : 'Send Test Email'}
                    </button>
                    <span className="text-[10px] text-slate-500">Host: smtp.gmail.com:587 (TLS)</span>
                  </div>

                  {testSmtpMessage && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                      {testSmtpMessage}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Alpha Vantage Commodity Key */}
              <div className="p-5 rounded-2xl bg-[#081426] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Alpha Vantage Commodity Feed</h3>
                      <span className="text-[10px] text-slate-400">Live Metallurgical Coal & Energy Pricing</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-700">
                    {integrations?.alpha_vantage?.is_configured ? 'API ACTIVE' : 'WORLD BANK BENCHMARK'}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Alpha Vantage API Key</label>
                    <input
                      type="password"
                      value={alphaVantageKey}
                      onChange={(e) => setAlphaVantageKey(e.target.value)}
                      placeholder={integrations?.alpha_vantage?.key_masked || "Paste Alpha Vantage API key (Free at alphavantage.co)"}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:border-cyan-400"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
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
                className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-light-cyan hover:from-cyan-300 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
        <div className="p-6 rounded-2xl bg-[#081426] border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Active Forecasting Model: {overview.active_model.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  {overview.active_model.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Version: {overview.active_model.version} • Trained: {overview.active_model.trained_at} • Sample Rows: {overview.active_model.row_count.toLocaleString()}
              </p>
            </div>

            <button
              onClick={handleRetrainModel}
              disabled={retraining}
              className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-light-cyan hover:from-cyan-300 text-black font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
              <span>{retraining ? 'Retraining ML Pipeline...' : 'Retrain & Validate Model'}</span>
            </button>
          </div>

          {retrainSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Pipeline retrained successfully. Model validation metrics updated.</span>
            </div>
          )}

          {/* Validation Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-xs block">Mean Absolute Error (MAE):</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                {overview.active_model.mae} USD/MT
              </span>
              <span className="text-[10px] text-emerald-400">Validated on chronological holdout</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-xs block">Root Mean Squared Error:</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                {overview.active_model.rmse} USD/MT
              </span>
              <span className="text-[10px] text-slate-400">Quantile loss objective</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-xs block">Percentage Error (MAPE):</span>
              <span className="text-2xl font-black text-cyan-300 font-mono mt-1 block">
                {overview.active_model.mape}%
              </span>
              <span className="text-[10px] text-emerald-400">Within industry standard</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PORT CRUD */}
      {activeTab === 'ports' && (
        <div className="p-6 rounded-2xl bg-[#081426] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Gazetted Port Directory ({ports.length} Records)
            </h3>
            <button
              onClick={() => setShowAddPort(!showAddPort)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Port</span>
            </button>
          </div>

          {showAddPort && (
            <form onSubmit={handleCreatePort} className="p-4 rounded-xl bg-slate-900 border border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Port Code</label>
                <input
                  type="text"
                  required
                  value={newPortCode}
                  onChange={(e) => setNewPortCode(e.target.value)}
                  placeholder="e.g. KDL"
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Port Name</label>
                <input
                  type="text"
                  required
                  value={newPortName}
                  onChange={(e) => setNewPortName(e.target.value)}
                  placeholder="e.g. Kandla Port"
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={newPortState}
                  onChange={(e) => setNewPortState(e.target.value)}
                  placeholder="e.g. Gujarat"
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-600 rounded text-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded cursor-pointer"
                >
                  Save Port
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase text-[10px] border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800">
                {ports.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{p.code}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{p.name}</td>
                    <td className="py-2.5 px-3 text-slate-300">{p.state}</td>
                    <td className="py-2.5 px-3 font-mono text-cyan-300">{p.max_draft}m</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{p.max_loa}m</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-400 truncate max-w-xs">{p.source}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeletePort(p.id)}
                        className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
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
        <div className="p-6 rounded-2xl bg-[#081426] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
            Security & Operational Audit Trail
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Action</th>
                  <th className="py-2 px-3">Resource</th>
                  <th className="py-2 px-3">Details</th>
                  <th className="py-2 px-3">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-cyan-300">{log.action}</td>
                    <td className="py-2.5 px-3 text-slate-300">{log.resource}</td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-md">{log.details}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">#{log.user_id || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DATA PROVENANCE LAYER */}
      {activeTab === 'data' && overview && (
        <div className="p-6 rounded-2xl bg-[#081426] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
            Government Compliance Data Provenance Status
          </h3>

          <div className="space-y-3">
            {Object.entries(overview.data_provenance).map(([k, v]: [string, any]) => (
              <div key={k} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs capitalize">{k.replace('_', ' ')}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{v}</p>
                </div>
                <DataProvenanceBadge sourceType={v.includes('OFFICIAL') ? 'OFFICIAL STATIC' : v.includes('LIVE') ? 'LIVE' : 'SIMULATED DEMO'} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
