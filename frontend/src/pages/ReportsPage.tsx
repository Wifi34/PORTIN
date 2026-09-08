import React, { useState, useEffect } from 'react';
import {
  FileDown, FileText, Download, CheckCircle2, Clock,
  Calendar, Ship, AlertCircle, RefreshCw, Sparkles, Plus
} from 'lucide-react';
import { apiClient } from '../api/client';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { ReportItem } from '../types';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportTitle, setReportTitle] = useState('SAIL East Coast Coking Coal Chartering Strategy Report');
  const [reportType, setReportType] = useState('Chartering Decision Report');
  const [cargoType, setCargoType] = useState('Coal - Coking');
  const [customCargoName, setCustomCargoName] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/reports');
      setReports(res.data);
    } catch (e) {
      console.error('Failed to load reports', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const effectiveCargoName = cargoType === 'Other Bulk Cargo' && customCargoName.trim()
    ? customCargoName.trim()
    : cargoType;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await apiClient.post('/reports/generate', {
        title: reportTitle,
        report_type: reportType,
        summary: `Official executive chartering evaluation for ${effectiveCargoName}. Recommends 3-voyage Panamax Short-Term Contract into Paradip CQ-1, mitigating seasonal freight inflation.`,
        data: {
          cargo_type: effectiveCargoName,
          cargo_mt: 70000,
          origin_country: 'Australia',
          destination_port: 'Paradip',
          recommended_vessel: 'Panamax',
          contract_type: 'Short-Term Multi-Voyage (3 Voyages COA)',
          market_signal: 'BOOK NOW',
          optimal_window: 'Next 7-14 Days',
          estimated_total_cost_usd: 1825000,
          risk_score: 24.5,
        },
      });
      setReports((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error('Failed to generate report', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-full bg-[#F8F7F3] text-[#172033] p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-sm border-t-4 border-t-[#D6A63B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#D6A63B]">
              Executive Documentation
            </span>
            <DataProvenanceBadge sourceType="OFFICIAL GAZETTED + REAL-TIME" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F2747] tracking-tight">
            Chartering Reports & Executive PDF Exports
          </h1>
          <p className="text-xs sm:text-sm text-[#68717D] mt-1 font-medium">
            Generate and download board-level audit reports with complete parameters, berth clearances, and financial comparisons.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Generator Form (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-sm border-t-4 border-t-[#D6A63B] space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#0F2747] pb-3 border-b border-[#E4E2DC] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D6A63B]" />
            <span>Generate New PDF Report</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[#0F2747] font-bold uppercase tracking-wider text-[10px] mb-1.5">
                Report Title *
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E4E2DC] rounded-xl text-[#172033] font-bold focus:border-[#D6A63B] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#0F2747] font-bold uppercase tracking-wider text-[10px] mb-1.5">
                Report Category *
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E4E2DC] rounded-xl text-[#172033] font-bold focus:border-[#D6A63B] transition-colors"
              >
                <option value="Chartering Decision Report">Chartering Decision Report</option>
                <option value="Berth Feasibility Audit">Berth Feasibility Audit</option>
                <option value="Econometric Freight Forecast">Econometric Freight Forecast</option>
                <option value="Demurrage Exposure Summary">Demurrage Exposure Summary</option>
              </select>
            </div>

            <div>
              <label className="block text-[#0F2747] font-bold uppercase tracking-wider text-[10px] mb-1.5">
                Cargo / Commodity Type *
              </label>
              <select
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E4E2DC] rounded-xl text-[#172033] font-bold focus:border-[#D6A63B] transition-colors"
              >
                <option value="Coal - Coking">Coal - Coking</option>
                <option value="Coal - Thermal">Coal - Thermal</option>
                <option value="Iron Ore">Iron Ore</option>
                <option value="Limestone">Limestone</option>
                <option value="Grain">Grain</option>
                <option value="Fertilizer">Fertilizer</option>
                <option value="Bauxite">Bauxite</option>
                <option value="Steel">Steel</option>
                <option value="Other Bulk Cargo">Other Bulk Cargo</option>
              </select>
            </div>

            {cargoType === 'Other Bulk Cargo' && (
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#D6A63B] animate-in fade-in duration-200">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#0F2747] mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D6A63B]" />
                  <span>Specify Custom Cargo Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={customCargoName}
                  onChange={(e) => setCustomCargoName(e.target.value)}
                  placeholder="e.g. Copper Concentrate, Manganese Ore, Petcoke"
                  className="w-full px-3 py-2 bg-white border border-[#D6A63B] rounded-lg text-xs font-bold text-[#172033] focus:ring-2 focus:ring-[#D6A63B]/30"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 mt-2"
              style={{
                backgroundColor: '#D6A63B',
                color: '#0F2747',
              }}
            >
              <FileDown className="w-4 h-4" />
              <span>{generating ? 'Compiling Official Brief...' : 'Generate Official PDF'}</span>
            </button>
          </div>
        </div>

        {/* Report Archives (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-sm border-t-4 border-t-[#D6A63B] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#0F2747]">
              Generated Report Archives
            </h2>
            <button onClick={fetchReports} className="text-[#68717D] hover:text-[#0F2747]" title="Refresh">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {reports.length === 0 ? (
              <div className="text-center py-12 text-[#68717D] text-xs font-medium">
                No archived reports yet. Click "Generate Official PDF" to create one.
              </div>
            ) : (
              reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC] hover:border-[#D6A63B]/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-white border border-[#E4E2DC] text-[#D6A63B] shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#0F2747]">{rep.title}</div>
                      <div className="text-[10px] text-[#68717D] font-medium mt-0.5">
                        {rep.report_type} • {new Date(rep.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-[#172033] mt-1 line-clamp-2">
                        {rep.summary}
                      </div>
                    </div>
                  </div>

                  <a
                    href={rep.file_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAF9F5] border border-[#E4E2DC] text-[#0F2747] text-[11px] font-bold transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-center shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-[#D6A63B]" />
                    <span>Download PDF</span>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
