import React, { useState } from 'react';
import {
  Sparkles, Send, Anchor, Ship, CheckCircle2, HelpCircle,
  MessageSquare, ArrowRight, ShieldCheck, User, Bot, Copy, Check
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

/**
 * Parses inline formatting: **bold**, `code/formula`, *italic*
 * Never displays raw markdown asterisks or hashes.
 */
const renderInline = (text: string): React.ReactNode => {
  if (!text) return null;

  // If text contains HTML line breaks like <br> or <br/>, split and preserve them
  if (text.includes('<br>') || text.includes('<br/>') || text.includes('<br />')) {
    const segments = text.split(/<br\s*\/?>/gi);
    return segments.map((seg, sIdx) => (
      <React.Fragment key={sIdx}>
        {sIdx > 0 && <br className="my-1" />}
        {renderInline(seg)}
      </React.Fragment>
    ));
  }

  const parts: React.ReactNode[] = [];
  // Matches: `code`, **bold**, *italic*
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      // Formula / Code / Metric pill
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-[#F8F7F3] border border-[#E4E2DC] text-[#0F2747] font-mono text-[11px] font-bold"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (
      (token.startsWith('**') && token.endsWith('**')) ||
      (token.startsWith('__') && token.endsWith('__'))
    ) {
      // Bold Text
      parts.push(
        <strong key={match.index} className="font-bold text-[#0F2747]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      // Italic Text
      parts.push(
        <em key={match.index} className="italic text-[#172033]">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

/**
 * Rich Markdown Formatter Component.
 * Transforms raw markdown (tables, headings, bullets, numbers, horizontal lines) into clean UI components.
 */
const StructuredMarkdownView: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Horizontal divider line (--- or *** or ___)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      elements.push(<hr key={`hr-${i}`} className="my-3.5 border-t border-[#E4E2DC]" />);
      i++;
      continue;
    }

    // 3. Markdown Tables (| Col1 | Col2 | ...)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        // First line is header
        const headerCells = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

        // Line 1 is usually separator like |---|---|
        const hasSep = /^[\s|:-]+$/.test(tableLines[1]);
        const startRowIdx = hasSep ? 2 : 1;
        const bodyLines = tableLines.slice(startRowIdx);

        elements.push(
          <div
            key={`table-${i}`}
            className="my-3.5 w-full overflow-x-auto rounded-[8px] border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] bg-white"
          >
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0F2747] text-white">
                  {headerCells.map((h, cIdx) => (
                    <th
                      key={cIdx}
                      className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[10.5px] text-[#F3E3B7] border-b border-[#0F2747]/30 whitespace-nowrap"
                    >
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E2DC]">
                {bodyLines.map((rowStr, rIdx) => {
                  const cells = rowStr
                    .split('|')
                    .slice(1, -1)
                    .map((c) => c.trim());
                  return (
                    <tr
                      key={rIdx}
                      className={`hover:bg-[#F8F7F3]/80 transition-colors ${
                        rIdx % 2 === 1 ? 'bg-[#F8F7F3]/30' : 'bg-white'
                      }`}
                    >
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2 text-[#172033] leading-relaxed align-top">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 4. Headings (# H1, ## H2, ### H3, #### H4)
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const headingText = match[2];

        if (level === 1) {
          elements.push(
            <h2 key={`h1-${i}`} className="text-sm font-black text-[#0F2747] tracking-tight mt-4 mb-2 pb-1 border-b border-[#E4E2DC]">
              {renderInline(headingText)}
            </h2>
          );
        } else if (level === 2) {
          elements.push(
            <h3 key={`h2-${i}`} className="text-xs font-black text-[#0F2747] mt-3.5 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
              <span className="w-1.5 h-3 bg-[#D6A63B] rounded-full inline-block"></span>
              <span>{renderInline(headingText)}</span>
            </h3>
          );
        } else if (level === 3) {
          elements.push(
            <h4 key={`h3-${i}`} className="text-xs font-bold text-[#0F2747] mt-3 mb-1">
              {renderInline(headingText)}
            </h4>
          );
        } else {
          elements.push(
            <h5 key={`h4-${i}`} className="text-[11px] font-bold text-[#68717D] uppercase tracking-wider mt-2.5 mb-1">
              {renderInline(headingText)}
            </h5>
          );
        }
        i++;
        continue;
      }
    }

    // 5. Bullet lists (- item or * item or • item)
    if (/^[-*•]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1.5 list-none pl-1">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="flex items-start gap-2.5 text-xs text-[#172033] leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A63B] mt-1.5 shrink-0" />
              <span className="flex-1 break-words">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 6. Numbered lists (1. item, 2. item)
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2.5 space-y-2 list-none pl-1">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="flex items-start gap-2.5 text-xs text-[#172033] leading-relaxed">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#0F2747] text-white text-[10px] font-bold shrink-0 mt-0.5">
                {lIdx + 1}
              </span>
              <span className="flex-1 break-words">{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 7. Blockquote / Callout (> text)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      elements.push(
        <div
          key={`quote-${i}`}
          className="my-3 p-3.5 rounded-[8px] bg-[#F3E3B7]/25 border-l-4 border-[#D6A63B] text-xs text-[#0F2747] leading-relaxed font-medium"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} className="break-words">{renderInline(ql)}</p>
          ))}
        </div>
      );
      continue;
    }

    // 8. Standard paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1.5 text-xs text-[#172033] leading-relaxed break-words">
        {renderInline(rawLine)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1 text-xs">{elements}</div>;
};

export const AIAdvisorPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'advisor',
      text: 'Welcome to the PortIN Decision Advisor. I provide precise, high-accuracy intelligence across all logistics, freight forecasting, vessel selection, port draft physics, and supply chain operations. You can ask in English, Hindi, or Hinglish.',
      category: 'System Initiation',
      followups: [
        'Konsi vessel best rhegi steel ke liye?',
        'Which vessel is suitable for 70,000 MT coal from Australia to Paradip?',
        'Should we charter now or wait?',
        'Spot or multi-voyage contract?',
      ],
      attribution: 'PortIN Cognitive Maritime Decision Engine (SAIL & Ministry of Steel Operations)',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* EXECUTIVE HEADER CARD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] border-t-[3px] border-t-[#D6A63B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#D6A63B]">
              Maritime Reasoning Engine
            </span>
            <DataProvenanceBadge sourceType="LIVE" sourceName="Groq Neural Cloud + Domain KB" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F2747] tracking-tight">
            PortIN AI Chartering Decision Advisor
          </h1>
          <p className="text-xs sm:text-sm text-[#68717D] mt-1 font-medium">
            Domain-specific conversational assistant answering vessel selection, berth clearances, demurrage clauses, and chartering strategy queries.
          </p>
        </div>
      </div>

      {/* Chat Conversation Shell */}
      <div className="bg-white border border-[#E4E2DC] rounded-[16px] shadow-sm border-t-[3px] border-t-[#D6A63B] flex flex-col h-[680px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#F8F7F3]/40">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} w-full`}
            >
              {/* USER MESSAGE BUBBLE - WARM ORANGE THEME WITH MULTI-LINE AUTO WRAP */}
              {m.sender === 'user' ? (
                <div className="max-w-2xl w-auto sm:max-w-xl lg:max-w-2xl bg-gradient-to-br from-[#D98A27] to-[#C47B1F] text-white rounded-[14px] rounded-tr-[3px] p-4 shadow-[0_2px_8px_rgba(217,138,39,0.22)] border border-[#C47B1F]">
                  <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-white/20 text-[10.5px] font-black uppercase tracking-wider text-[#F8F7F3]">
                    <User className="w-3.5 h-3.5" />
                    <span>Your Query</span>
                  </div>
                  <p className="text-xs leading-relaxed font-semibold text-white break-words whitespace-pre-wrap">
                    {m.text}
                  </p>
                </div>
              ) : (
                /* ADVISOR MESSAGE CARD - ENTERPRISE STRUCTURED MARKDOWN VIEW */
                <div className="w-full max-w-3xl bg-white border border-[#E4E2DC] rounded-[12px] rounded-tl-[3px] shadow-[0_2px_8px_rgba(15,39,71,0.04)] p-4 sm:p-5">
                  {/* Card Header with Attribution & Copy Button */}
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#E4E2DC] text-[10.5px]">
                    <div className="flex items-center gap-2 text-[#0F2747] font-black uppercase tracking-wider">
                      <span className="p-1 rounded-[5px] bg-[#F8F7F3] border border-[#E4E2DC]">
                        <Sparkles className="w-3.5 h-3.5 text-[#D6A63B]" />
                      </span>
                      <span>PortIN Decision Advisor</span>
                      {m.category && (
                        <span className="ml-1.5 px-2 py-0.5 rounded-[4px] bg-[#F8F7F3] text-[#68717D] font-bold text-[9.5px] border border-[#E4E2DC]">
                          {m.category}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(m.text, idx)}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#68717D] hover:text-[#0F2747] transition-colors cursor-pointer"
                      title="Copy response"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#2F7D4B]" />
                          <span className="text-[#2F7D4B]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Clean Formatted Structured Content */}
                  <div className="text-xs leading-relaxed text-[#172033]">
                    <StructuredMarkdownView content={m.text} />
                  </div>

                  {/* Attribution Footer */}
                  {m.attribution && (
                    <div className="mt-3.5 pt-2.5 border-t border-[#E4E2DC] flex items-center justify-between text-[10px] text-[#68717D]">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#2F7D4B]" />
                        <span>Source: <strong className="text-[#0F2747]">{m.attribution}</strong></span>
                      </span>
                      <span className="text-[9.5px] uppercase font-bold text-[#2F7D4B] bg-[#F3FAF7] px-2 py-0.5 rounded border border-[#BCF0DA]">
                        Verified Ground Truth
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Followup suggested quick prompts */}
              {m.followups && m.followups.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-2xl">
                  {m.followups.map((f, fIdx) => (
                    <button
                      key={fIdx}
                      type="button"
                      onClick={() => handleSend(f)}
                      className="px-3 py-1.5 bg-white hover:bg-[#F8F7F3] border border-[#E4E2DC] hover:border-[#D6A63B] rounded-[6px] text-[11px] font-semibold text-[#0F2747] transition-all text-left shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D6A63B]"></span>
                      <span>{f}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-[#0F2747] p-3.5 bg-white rounded-[10px] max-w-sm border border-[#E4E2DC] shadow-sm">
              <Sparkles className="w-4 h-4 text-[#D6A63B] animate-spin shrink-0" />
              <div>
                <p className="font-bold text-[#0F2747]">Synthesizing maritime intelligence...</p>
                <p className="text-[10px] text-[#68717D]">Reasoning over port drafts, vessel classes, and freight rates</p>
              </div>
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
