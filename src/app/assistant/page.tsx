'use client';
import { useEffect, useRef, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from 'ai/react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { suggestedPrompts } from '@/lib/dummy-data';
import {
  Send, Trash2, User, Copy, Check, RefreshCw,
  MapPin, IndianRupee, Calendar, Users, Sparkles,
  ChevronDown, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

// ─── Markdown renderer (no extra dep) ─────────────────────────────────────────
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table
    if (line.includes('|') && lines[i + 1]?.includes('---')) {
      const headers = line.split('|').map(h => h.trim()).filter(Boolean);
      i += 2; // skip separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|')) {
        rows.push(lines[i].split('|').map(c => c.trim()).filter(Boolean));
        i++;
      }
      elements.push(
        <div key={i} className="overflow-x-auto my-3">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-purple-50">
                {headers.map((h, j) => (
                  <th key={j} className="border border-purple-100 px-3 py-1.5 text-left font-semibold text-purple-800">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, j) => (
                <tr key={j} className={j % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'}>
                  {row.map((cell, k) => (
                    <td key={k} className="border border-purple-100 px-3 py-1.5 text-gray-700">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // H1/H2/H3
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="font-bold text-gray-800 text-sm mt-3 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="font-bold text-gray-800 text-base mt-3 mb-1">{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="font-bold text-gray-800 text-lg mt-3 mb-1">{line.slice(2)}</h1>);
    }
    // Bullet
    else if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push(
        <div key={i} className="flex gap-2 my-0.5">
          <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>
          <span className="text-gray-700 text-sm">{inlineFormat(line.slice(2))}</span>
        </div>
      );
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)?.[1];
      elements.push(
        <div key={i} className="flex gap-2 my-0.5">
          <span className="text-purple-500 font-semibold text-xs mt-0.5 flex-shrink-0 w-4">{num}.</span>
          <span className="text-gray-700 text-sm">{inlineFormat(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    }
    // Emoji day lines like 🗓️ **Din 1:**
    else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1.5" />);
    }
    // Normal paragraph
    else {
      elements.push(
        <p key={i} className="text-sm text-gray-700 leading-relaxed">{inlineFormat(line)}</p>
      );
    }
    i++;
  }
  return elements;
}

function inlineFormat(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-800">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ─── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 bg-purple-50 rounded-2xl w-fit">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.15 }}
          className="w-2 h-2 bg-purple-400 rounded-full"
        />
      ))}
    </div>
  );
}

// ─── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, isStreaming }: { msg: any; isStreaming?: boolean }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  function copyText() {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm shadow-sm ${
        isUser ? 'text-white' : ''
      }`}
        style={isUser
          ? { background: 'linear-gradient(135deg, #7c3aed, #db2777)' }
          : { background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }
        }>
        {isUser ? <User className="w-4 h-4 text-white" /> : '🤖'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'text-white rounded-tr-sm'
            : 'bg-white border border-purple-100 rounded-tl-sm'
        }`}
          style={isUser ? { background: 'linear-gradient(135deg, #7c3aed, #db2777)' } : {}}>
          {isUser ? (
            <p className="text-sm leading-relaxed text-white">{msg.content}</p>
          ) : (
            <div className="space-y-0.5">
              {renderMarkdown(msg.content)}
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-purple-400 rounded-sm animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          )}
        </div>

        {/* Timestamp + copy */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-gray-400">
            {format(new Date(msg.createdAt ?? Date.now()), 'HH:mm')}
          </span>
          {!isUser && !isStreaming && (
            <button
              onClick={copyText}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
            >
              {copied
                ? <Check className="w-3 h-3 text-emerald-500" />
                : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Quick action chips ────────────────────────────────────────────────────────
const quickActions = [
  { icon: MapPin,        label: 'Best destinations',  prompt: 'India mein is season ke best destinations kaunse hain?' },
  { icon: IndianRupee,   label: '₹10k budget trip',   prompt: '₹10,000 mein 3 din ka trip plan karo' },
  { icon: Calendar,      label: '7-day itinerary',    prompt: 'Rajasthan ke liye 7 din ka detailed itinerary banao' },
  { icon: Users,         label: 'Family trip',        prompt: 'Family ke saath kids-friendly trip kahan jaayein?' },
];

// ─── Main page ─────────────────────────────────────────────────────────────────
function AssistantContent() {
  const bottomRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLTextAreaElement>(null);
  const [showScroll, setShowScroll] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const autoSentRef  = useRef(false);
  const searchParams = useSearchParams();

  const {
    messages, input, handleInputChange, handleSubmit,
    isLoading, error, reload, setMessages, append,
  } = useChat({
    api: '/api/chat',
    initialMessages: [{
      id: 'init',
      role: 'assistant',
      content: 'Namaste! 🙏 Main hoon aapka **AI Travel Dost**!\n\nIndia ke kisi bhi kone mein trip plan karna ho — Rajasthan ki haveliyan, Kerala ke backwaters, Ladakh ki pahaadiyan, ya Goa ke beaches — bas batao!\n\nMain aapko dunga:\n- Complete day-by-day itinerary\n- Budget breakdown in ₹\n- Best hotels & restaurants\n- Hidden gems & local tips\n\n**Kahan jaana hai? ✈️**',
    }],
  });

  // Auto-send prompt from Plan page (via ?autoPrompt= URL param)
  useEffect(() => {
    const autoPrompt = searchParams.get('autoPrompt');
    if (autoPrompt && !autoSentRef.current && !isLoading) {
      autoSentRef.current = true;
      const decoded = decodeURIComponent(autoPrompt);
      // Small delay so chat is fully mounted
      setTimeout(() => {
        append({ role: 'user', content: decoded });
      }, 400);
    }
  }, [searchParams, append, isLoading]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Show scroll-to-bottom button
  function handleScroll() {
    const el = chatContainerRef.current;
    if (!el) return;
    setShowScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  }

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  // Auto-resize textarea
  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    handleInputChange(e);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        const form = e.currentTarget.closest('form');
        form?.requestSubmit();
      }
    }
  }

  function sendQuickPrompt(prompt: string) {
    append({ role: 'user', content: prompt });
  }

  function clearChat() {
    setMessages([{
      id: 'init',
      role: 'assistant',
      content: 'Namaste! 🙏 Naya safar shuru karte hain!\n\n**Kahan jaana hai aapko? ✈️**',
    }]);
  }

  const showSuggestions = messages.length <= 1 && !isLoading;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-7rem)] flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg text-2xl"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                🤖
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                AI Travel Dost
                <span className="text-xs font-normal bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Llama 3.3 · Free</span>
              </h1>
              <p className={`text-xs font-medium flex items-center gap-1 ${isLoading ? 'text-amber-500' : 'text-emerald-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                {isLoading ? 'Soch raha hoon...' : 'Online · India ka best travel planner'}
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-purple-200 rounded-xl text-sm text-gray-600 hover:bg-purple-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        </div>

        {/* ── Chat container ── */}
        <div className="flex-1 bg-white rounded-3xl border border-purple-100 shadow-card overflow-hidden flex flex-col min-h-0">

          {/* Messages */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth"
          >
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isStreaming={isLoading && idx === messages.length - 1 && msg.role === 'assistant'}
              />
            ))}

            {/* Typing indicator — shown while waiting for first token */}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                  🤖
                </div>
                <TypingIndicator />
              </div>
            )}

            {/* Error state */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3"
              >
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-700 font-medium">Kuch gadbad ho gayi!</p>
                  <p className="text-xs text-red-500 mt-0.5">
                    {error.message.includes('API key') || error.message.includes('401')
                      ? 'Groq API key set nahi hai. .env.local mein GROQ_API_KEY add karo.'
                      : error.message}
                  </p>
                </div>
                <button
                  onClick={() => reload()}
                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Scroll to bottom button */}
          <AnimatePresence>
            {showScroll && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={scrollToBottom}
                className="absolute bottom-28 right-8 w-8 h-8 bg-white border border-purple-200 rounded-full shadow-lg flex items-center justify-center hover:bg-purple-50 transition-colors z-10"
              >
                <ChevronDown className="w-4 h-4 text-purple-500" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* ── Suggestions ── */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="px-5 pb-3 space-y-3 border-t border-purple-50 pt-3"
              >
                {/* Quick action chips */}
                <div className="flex gap-2 flex-wrap">
                  {quickActions.map(({ icon: Icon, label, prompt }) => (
                    <button
                      key={label}
                      onClick={() => sendQuickPrompt(prompt)}
                      className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-100 rounded-xl px-3 py-1.5 hover:from-purple-100 hover:to-pink-100 transition-colors font-medium"
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Suggested prompts */}
                <div>
                  <p className="text-xs text-gray-400 mb-1.5 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" /> Popular questions:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedPrompts.slice(0, 6).map((p) => (
                      <button
                        key={p}
                        onClick={() => sendQuickPrompt(p)}
                        className="text-xs bg-white text-gray-600 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Input area ── */}
          <div className="p-4 border-t border-purple-50 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              <div className="flex-1 bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 flex items-end gap-2 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Kahan jaana hai? Budget kya hai? Kitne din? (Enter dabao)"
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none resize-none max-h-32 disabled:opacity-60"
                  style={{ minHeight: '24px' }}
                />
                <span className="text-xs text-gray-400 flex-shrink-0 mb-0.5 hidden sm:block">
                  {input.length > 0 ? `${input.length}` : 'Enter ↵'}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
              >
                {isLoading
                  ? <RefreshCw className="w-4 h-4 text-white animate-spin" />
                  : <Send className="w-4 h-4 text-white" />}
              </motion.button>
            </form>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Shift+Enter for new line · Powered by Llama 3.3 (Groq)
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
      </div>
    }>
      <AssistantContent />
    </Suspense>
  );
}
