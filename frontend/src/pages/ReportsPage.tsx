import React, { useState, useEffect } from 'react';
import {
  FileDown, FileText, Download, CheckCircle2, Clock,
  Calendar, Ship, AlertCircle, RefreshCw
} from 'lucide-react';
import { apiClient } from '../api/client';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { ReportItem } from '../types';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportTitle, setReportTitle] = useState('SAIL East Coast Coking Coal Chartering Strategy Report');
  const [reportType, setReportType] = useState('Chartering Decision Report');
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

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await apiClient.post('/reports/generate', {
        title: reportTitle,
        report_type: reportType,
        summary: 'Official executive chartering evaluation. Recommends 3-voyage Panamax Short-Term Contract into Paradip CQ-1, mitigating seasonal freight inflation.',
        data: {
          cargo_type: 'Coking Coal',
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
      // Append to list
      setReports((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error('Failed to generate report', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E2DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#D6A63B]">
              Executive Documentation
            </span>
            <DataProvenanceBadge sourceType="OFFICIAL STATIC + SIMULATED DEMO" />
          </div>
          <h1 className="text-2xl font-black text-[#0F2747] tracking-tight">
            Chartering Reports & Executive PDF Exports
          </h1>
          <p className="text-xs text-[#68717D] mt-1">
            Generate and download board-level audit reports with complete parameters, berth clearances, and financial comparisons.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Form */}
        <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#0F2747] pb-3 border-b border-[#E4E2DC] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D6A63B]" />
            <span>Generate New PDF Report</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[#0F2747] font-bold mb-1.5">Report Title</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#0F2747] font-bold mb-1.5">Report Category</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
              >
                <option value="Chartering Decision Report">Chartering Decision Report</option>
                <option value="Freight Forecast Report">Freight Forecast Report</option>
                <option value="Vessel Recommendation Report">Vessel Recommendation Report</option>
                <option value="Contract Comparison Report">Contract Comparison Report</option>
                <option value="Scenario Comparison Report">Scenario Comparison Report</option>
                <option value="Executive Summary">Executive Board Summary</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3 bg-[#D6A63B] hover:bg-[#c49530] text-[#0F2747] font-black uppercase tracking-wider text-xs rounded-[8px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <FileDown className="w-4 h-4" />
              <span>{generating ? 'Generating PDF Document...' : 'Generate Official PDF'}</span>
            </button>
          </div>
        </div>

        {/* Existing Reports List */}
        <div className="lg:col-span-2 p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC] mb-4">
            <h3 className="text-xs font-black text-[#0F2747] uppercase tracking-wider">
              Generated Report Archives
            </h3>
            <button
              onClick={fetchReports}
              className="p-1.5 rounded-[6px] bg-[#F8F7F3] hover:bg-[#E4E2DC] border border-[#E4E2DC] text-[#0F2747] transition-colors"
              title="Refresh Reports"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D6A63B]' : ''}`} />
            </button>
          </div>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#68717D]">
                No reports generated yet. Click "Generate Official PDF" to create one.
              </div>
            ) : (
              reports.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#D6A63B] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-[6px] bg-white text-[#0F2747] border border-[#E4E2DC] shadow-sm">
                      <FileDown className="w-5 h-5 text-[#D6A63B]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0F2747]">{r.title}</h4>
                      <div className="flex items-center gap-2.5 text-[11px] text-[#68717D] mt-1">
                        <span className="font-bold text-[#D6A63B]">{r.report_type}</span>
                        <span>•</span>
                        <span>{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      {r.summary && (
                        <p className="text-xs text-[#68717D] mt-1 line-clamp-1">{r.summary}</p>
                      )}
                    </div>
                  </div>

                  <a
                    href={`http://localhost:8000${r.file_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#E4E2DC] text-[#0F2747] rounded-[8px] text-xs font-bold border border-[#E4E2DC] shadow-sm transition-all self-start sm:self-center shrink-0"
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
