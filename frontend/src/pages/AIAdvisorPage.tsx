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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E2DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#D6A63B]">
              Maritime Reasoning Engine
            </span>
            <DataProvenanceBadge sourceType="OFFICIAL STATIC" sourceName="Deterministic Maritime Domain Rules" />
          </div>
          <h1 className="text-2xl font-black text-[#0F2747] tracking-tight">
            PortIN Decision Advisor
          </h1>
          <p className="text-xs text-[#68717D] mt-1">
            Domain-specific logistics advisory answering vessel selection, draft limits, and chartering strategy queries.
          </p>
        </div>
      </div>

      {/* Chat Conversation Shell */}
      <div className="bg-white border border-[#E4E2DC] rounded-[10px] shadow-[0_1px_3px_rgba(15,39,71,0.04)] flex flex-col h-[640px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F7F3]/40">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#0F2747] text-white font-medium rounded-tr-none shadow-sm'
                    : 'bg-white border border-[#E4E2DC] text-[#172033] rounded-tl-none shadow-[0_1px_3px_rgba(15,39,71,0.04)]'
                }`}
              >
                {m.sender === 'advisor' && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E4E2DC] text-[10px] text-[#D6A63B] font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-[#0F2747] font-black">
                      <Sparkles className="w-3.5 h-3.5 text-[#D6A63B]" />
                      PortIN Decision Advisor
                    </span>
                    {m.category && <span className="text-[#68717D] font-medium">{m.category}</span>}
                  </div>
                )}
                <p className="whitespace-pre-line text-[#172033] leading-relaxed">{m.text}</p>
                {m.attribution && (
                  <div className="mt-2.5 pt-2 border-t border-[#E4E2DC] text-[10px] text-[#68717D]">
                    Source: {m.attribution}
                  </div>
                )}
              </div>

              {/* Followup suggested quick prompts */}
              {m.followups && m.followups.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-2xl">
                  {m.followups.map((f, fIdx) => (
                    <button
                      key={fIdx}
                      type="button"
                      onClick={() => handleSend(f)}
                      className="px-3 py-1.5 bg-white hover:bg-[#F8F7F3] border border-[#E4E2DC] hover:border-[#D6A63B] rounded-[6px] text-[11px] font-semibold text-[#0F2747] transition-all text-left shadow-sm cursor-pointer"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#0F2747] p-3 bg-white rounded-[8px] max-w-xs border border-[#E4E2DC] shadow-sm">
              <Sparkles className="w-4 h-4 text-[#D6A63B] animate-spin" />
              <span className="font-semibold">Synthesizing maritime recommendation...</span>
            </div>
          )}
        </div>

        {/* Query Input Bar */}
        <div className="p-4 border-t border-[#E4E2DC] bg-[#F8F7F3]">
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
              className="flex-1 px-4 py-3 bg-white border border-[#E4E2DC] rounded-[8px] text-xs text-[#172033] placeholder-[#68717D] focus:outline-none focus:border-[#D6A63B] transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-5 py-3 bg-[#D6A63B] hover:bg-[#c49530] text-[#0F2747] font-black uppercase tracking-wider text-xs rounded-[8px] flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm shrink-0"
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
