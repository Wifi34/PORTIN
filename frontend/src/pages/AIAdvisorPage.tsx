import React, { useState } from 'react';
import {
  Sparkles, Send, Anchor, Ship, CheckCircle2, HelpCircle,
  MessageSquare, ArrowRight, ShieldCheck
} from 'lucide-react';
import { apiClient } from '../api/client';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { AdvisorQueryResponse } from '../types';

interface Message {
  sender: 'user' | 'advisor';
  text: string;
  category?: string;
  followups?: string[];
  attribution?: string;
}

export const AIAdvisorPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'advisor',
      text: 'Welcome to the PortIN Decision Advisor. I am a deterministic maritime logistics reasoning engine configured for SAIL raw material procurement into the East Coast of India. You can query vessel suitability, port draft constraints, market entry timing, or contract optimization.',
      category: 'System Initiation',
      followups: [
        'Which vessel is suitable for 70,000 MT coal from Australia to Paradip?',
        'Should we charter now or wait?',
        'Spot or multi-voyage contract?',
      ],
      attribution: 'PortIN Deterministic Maritime Decision Engine (SAIL SIH 2026)',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: Message = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const res = await apiClient.post('/advisor/ask', { question: textToSend });
      const advisorRes: AdvisorQueryResponse = res.data;
      const advMsg: Message = {
        sender: 'advisor',
        text: advisorRes.answer,
        category: advisorRes.category,
        followups: advisorRes.suggested_followups,
        attribution: advisorRes.source_attribution,
      };
      setMessages((prev) => [...prev, advMsg]);
    } catch (e) {
      console.error('Advisor query error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Maritime Reasoning Engine</span>
            <DataProvenanceBadge sourceType="OFFICIAL STATIC" sourceName="Deterministic Maritime Domain Rules" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            PortIN Decision Advisor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Domain-specific logistics advisory answering vessel selection, draft limits, and chartering strategy queries.
          </p>
        </div>
      </div>

      {/* Chat Conversation Shell */}
      <div className="bg-[#081426] border border-slate-800 rounded-2xl flex flex-col h-[620px] shadow-2xl overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-cyan-500 text-slate-950 font-semibold rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-lg'
                }`}
              >
                {m.sender === 'advisor' && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      PortIN Decision Advisor
                    </span>
                    {m.category && <span className="text-slate-400">{m.category}</span>}
                  </div>
                )}
                <p className="whitespace-pre-line">{m.text}</p>
                {m.attribution && (
                  <div className="mt-2 pt-2 border-t border-slate-800 text-[9px] text-slate-500">
                    Source: {m.attribution}
                  </div>
                )}
              </div>

              {/* Followup suggested quick prompts */}
              {m.followups && m.followups.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-2xl">
                  {m.followups.map((f, fIdx) => (
                    <button
                      key={fIdx}
                      type="button"
                      onClick={() => handleSend(f)}
                      className="px-2.5 py-1 bg-slate-900/80 hover:bg-slate-850 border border-slate-700 hover:border-cyan-400 rounded-lg text-[11px] text-cyan-300 transition-colors text-left"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 p-3 bg-slate-900/80 rounded-xl max-w-xs border border-slate-800">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Synthesizing maritime recommendation...</span>
            </div>
          )}
        </div>

        {/* Query Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-[#060F1E]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a chartering question (e.g. 'Why is Panamax recommended for 70k MT coal to Paradip?')"
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-5 py-3 bg-gradient-to-r from-cyan-400 to-light-cyan hover:from-cyan-300 text-black font-bold text-xs rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>Ask Advisor</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
