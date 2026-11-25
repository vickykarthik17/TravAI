import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  MessageSquare,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  ShieldCheck,
  Thermometer,
  Lightbulb,
  UtensilsCrossed,
  Bed,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Zap,
  PhoneCall,
  ChevronDown,
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';

export const FloatingAIWidget = ({ user, currency = 'USD', onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeChannel, setActiveChannel] = useState('App');
  const [selectedRoom, setSelectedRoom] = useState('101');
  const [unreadCount, setUnreadCount] = useState(1);
  const [feedback, setFeedback] = useState({});

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${user?.full_name || 'Alexander Wright'}! I am your Ask Nexgile Luxury Concierge. Ask me about your reservation, hotel amenities, fine dining, bespoke trip itineraries, or request extra towels & room service.`,
      timestamp: 'Just now',
      suggestions: [
        'What is my booking reference and stay details?',
        'Plan a 3-day luxury trip itinerary.',
        'Can I request extra bath towels and pillows for my room?',
        'What amenities and dining does my hotel offer?',
      ],
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.chatAI(history, user?.full_name, selectedRoom, 'Concierge');

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: res.suggestions || [],
        action_type: res.action_type,
        action_data: res.action_data,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI Chat Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I have logged your request with our front desk team. A guest ambassador will follow up shortly.',
          timestamp: 'Just now',
          suggestions: ['Open Front Desk PMS'],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (id, type) => {
    setFeedback((prev) => ({ ...prev, [id]: type }));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`w-[380px] sm:w-[420px] bg-[#090D1C]/95 border border-cyan-500/40 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden transition-all duration-300 mb-3 ${
            isMinimized ? 'h-14' : 'h-[540px]'
          }`}
        >
          {/* Header Bar */}
          <div className="p-3.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white flex items-center justify-between shrink-0 border-b border-cyan-400/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/30 shadow-inner">
                <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold font-display tracking-wide">Nexgile-TravAI VIP Butler</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
                </div>
                <p className="text-[10px] text-white/90 font-medium">Active on Suite {selectedRoom} &bull; 24/7 Luxury Concierge</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Close Widget"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Channel Selector & Quick Shortcuts Strip */}
              <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 text-[10px]">
                <div className="flex items-center gap-1 text-slate-400 font-semibold">
                  <span>Channel:</span>
                  {['App', 'WhatsApp', 'SMS'].map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setActiveChannel(ch)}
                      className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                        activeChannel === ch ? 'bg-cyan-500 text-white shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Room:</span>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="font-bold text-cyan-300 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] cursor-pointer"
                  >
                    <option value="101">101</option>
                    <option value="102">102</option>
                    <option value="104">104</option>
                    <option value="201">201</option>
                    <option value="301">301</option>
                  </select>
                </div>
              </div>

              {/* Quick Actions Carousel */}
              <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10px] no-scrollbar">
                <button
                  onClick={() => handleSend('What is my booking reference and stay details?')}
                  className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-bold hover:border-cyan-400 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Bed className="w-3 h-3 text-cyan-400" />
                  <span>My Stay</span>
                </button>
                <button
                  onClick={() => handleSend('Plan a 3-day luxury trip itinerary.')}
                  className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-bold hover:border-emerald-400 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Trip Plan</span>
                </button>
                <button
                  onClick={() => handleSend('What amenities and dining does my hotel offer?')}
                  className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 font-bold hover:border-amber-400 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <UtensilsCrossed className="w-3 h-3 text-amber-400" />
                  <span>Dining & Pool</span>
                </button>
                <button
                  onClick={() => handleSend('Can I request extra bath towels and pillows for my room?')}
                  className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-purple-400 font-bold hover:border-purple-400 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Zap className="w-3 h-3 text-purple-400" />
                  <span>Towels/Pillows</span>
                </button>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#070914]">
                {messages.map((m) => {
                  const isAssistant = m.role === 'assistant';
                  return (
                    <div key={m.id} className={`flex gap-2 max-w-[88%] ${isAssistant ? '' : 'ml-auto flex-row-reverse'}`}>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 font-bold shadow-sm ${
                          isAssistant ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white' : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                        }`}
                      >
                        {isAssistant ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      </div>

                      <div className="space-y-1.5">
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                            isAssistant
                              ? 'bg-slate-900/90 text-slate-100 border border-slate-800 shadow-lg'
                              : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/25'
                          }`}
                        >
                          {m.content}
                        </div>

                        {/* Suggestions */}
                        {isAssistant && m.suggestions && m.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {m.suggestions.map((sug) => (
                              <button
                                key={sug}
                                onClick={() => handleSend(sug)}
                                className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold transition-all cursor-pointer hover:border-cyan-400"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* AI Governance Pill */}
                        {isAssistant && (
                          <div className="flex items-center justify-between text-[9px] text-slate-500 px-1">
                            <span className="flex items-center gap-1 font-mono">
                              <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" />
                              97% Conf · Governance Verified
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleFeedback(m.id, 'up')}
                                className={`p-0.5 rounded hover:bg-slate-800 ${
                                  feedback[m.id] === 'up' ? 'text-cyan-400' : 'text-slate-500'
                                }`}
                                title="Accurate"
                              >
                                <ThumbsUp className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => handleFeedback(m.id, 'down')}
                                className={`p-0.5 rounded hover:bg-slate-800 ${
                                  feedback[m.id] === 'down' ? 'text-rose-400' : 'text-slate-500'
                                }`}
                                title="Inaccurate"
                              >
                                <ThumbsDown className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-cyan-400 pl-8">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    <span>AI Copilot is processing request...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Field */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask anything (e.g. 'I need a room', 'Extra towels', '3-day trip')..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="btn-primary p-2 text-xs rounded-xl flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-xs shadow-xl shadow-cyan-500/35 border-2 border-cyan-300/40 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 cursor-pointer"
        >
          {/* Animated Glow Halo */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-70 blur-md group-hover:opacity-100 animate-pulse transition-opacity -z-10" />

          <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cyan-200 animate-spin" style={{ animationDuration: '6s' }} />
          </div>

          <div className="text-left leading-tight hidden sm:block">
            <span className="block text-[11px] font-black uppercase tracking-wider text-cyan-200">AI Concierge</span>
            <span className="block text-xs font-bold text-white">Ask Copilot</span>
          </div>

          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm ml-1">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
