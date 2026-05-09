'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppStore } from '@/store/useAppStore';
import { suggestedPrompts } from '@/lib/dummy-data';
import { Send, Mic, Sparkles, Bot, User, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const aiResponses: string[] = [
  `Bilkul! Main aapke liye ek perfect Indian trip plan karta hoon 🇮🇳

**🗺️ Destination Overview**
Aapki preferences ke hisaab se maine ek personalized itinerary banaya hai jo adventure, culture, aur relaxation ka perfect mix hai.

**📅 Suggested Itinerary**
• **Din 1-2:** Arrival & shehar darshan — famous landmarks, local bazaar, aur hotel check-in
• **Din 3-4:** Cultural immersion — temples, museums, cooking class, aur authentic local khana
• **Din 5-6:** Nature & adventure — trekking, beaches, ya scenic day trips
• **Din 7:** Leisure & departure — spa, last-minute shopping, aur station/airport

**💰 Budget Estimate (per person)**
| Category | Estimated Cost |
|----------|---------------|
| Flight/Train | ₹3,000–₹8,000 |
| Hotel (7 raat) | ₹7,000–₹15,000 |
| Sightseeing | ₹2,000–₹5,000 |
| Khana-Peena | ₹2,500–₹4,000 |
| **Total** | **₹14,500–₹32,000** |

**🏨 Top Hotel Picks**
1. **Luxury:** Heritage Palace Hotel — ₹8,000/raat ⭐⭐⭐⭐⭐
2. **Mid-range:** Boutique Inn — ₹2,500/raat ⭐⭐⭐⭐
3. **Budget:** Backpacker Hostel — ₹600/raat ⭐⭐⭐

**🍛 Must-Try Khana**
Dal Baati Churma, Butter Chicken, Masala Dosa, Pav Bhaji, aur local street food!

**💡 Pro Tips**
- Train tickets 60-90 din pehle book karo (Tatkal bhi available hai)
- Peak season mein hotel advance mein book karo
- Local guide hire karo hidden gems ke liye
- Travel insurance zaroor lo
- UPI payments almost har jagah accept hote hain

Kya aap kisi specific destination ke baare mein aur detail chahte hain? 🌟`,

  `Wah! Bahut achha choice hai! 🎉

**🏔️ Ladakh Trip Plan — 8 Din**

**Permit Requirements:**
- Inner Line Permit (ILP) — ₹400 per person
- Protected Area Permit (PAP) — foreigners ke liye
- Online apply karo: lahdc.nic.in

**Best Route:**
Delhi → Leh (flight ₹4,000-8,000) → Nubra Valley → Pangong Lake → Tso Moriri → Leh → Delhi

**Day-wise Plan:**
🗓️ **Din 1:** Leh arrival, acclimatization (bahut zaroori!)
🗓️ **Din 2:** Leh local — Shanti Stupa, Leh Palace, Bazaar
🗓️ **Din 3:** Khardung La (world's highest motorable road!) → Nubra Valley
🗓️ **Din 4:** Nubra — Diskit Monastery, Bactrian Camel ride, Sand dunes
🗓️ **Din 5:** Pangong Lake (3 Idiots shooting location!) 💙
🗓️ **Din 6:** Pangong → Tso Moriri (scenic route)
🗓️ **Din 7:** Tso Moriri → Leh (Hemis Monastery)
🗓️ **Din 8:** Departure

**💰 Total Budget: ₹25,000–₹35,000 per person**

**⚠️ Important Tips:**
- Altitude sickness se bachne ke liye Diamox lo
- Warm clothes — raat ko -5°C tak temperature
- Petrol stations kam hain, full tank rakho
- Cash carry karo — ATM limited hain

Bike trip chahiye ya car? Batao! 🏍️`,
];

let responseIndex = 0;

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-purple-50 rounded-2xl w-fit">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          className="w-2 h-2 bg-purple-400 rounded-full"
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: any }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${
        isUser
          ? 'text-white'
          : 'bg-gradient-to-br from-orange-400 to-pink-500'
      }`}
        style={isUser ? { background: 'linear-gradient(135deg, #7c3aed, #db2777)' } : {}}>
        {isUser ? <User className="w-4 h-4 text-white" /> : '🤖'}
      </div>
      <div className={`max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'text-white rounded-tr-sm'
            : 'bg-white border border-purple-100 text-gray-700 shadow-sm rounded-tl-sm'
        }`}
          style={isUser ? { background: 'linear-gradient(135deg, #7c3aed, #db2777)' } : {}}>
          <div className="whitespace-pre-wrap">{msg.content}</div>
        </div>
        <span className="text-xs text-gray-400 px-1">
          {format(new Date(msg.timestamp), 'HH:mm')}
        </span>
      </div>
    </motion.div>
  );
}

export default function AssistantPage() {
  const { chatMessages, addChatMessage, clearChat } = useAppStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content) return;
    setInput('');

    addChatMessage({ id: Date.now().toString(), role: 'user', content, timestamp: new Date() });
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 800));
    setIsTyping(false);

    const response = aiResponses[responseIndex % aiResponses.length];
    responseIndex++;
    addChatMessage({ id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date() });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-7rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg text-2xl"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                🤖
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg">AI Travel Dost 🇮🇳</h1>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                Online · India ka best travel planner
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-purple-200 rounded-xl text-sm text-gray-600 hover:bg-purple-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>

        {/* Chat area */}
        <div className="flex-1 bg-white rounded-3xl border border-purple-100 shadow-card overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {chatMessages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                  🤖
                </div>
                <TypingIndicator />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested prompts */}
          {chatMessages.length <= 1 && (
            <div className="px-5 pb-3">
              <p className="text-xs text-gray-400 mb-2 font-medium">💡 Ye pooch sakte ho:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.slice(0, 4).map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-xs bg-purple-50 text-purple-700 border border-purple-100 rounded-xl px-3 py-1.5 hover:bg-purple-100 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-purple-50">
            <div className="flex items-end gap-3">
              <div className="flex-1 bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 flex items-end gap-2 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Kahan jaana hai? Budget kya hai? Kitne din? (Enter dabao)"
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none resize-none max-h-32"
                />
                <button className="text-purple-400 hover:text-purple-600 transition-colors flex-shrink-0">
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
              >
                <Send className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
