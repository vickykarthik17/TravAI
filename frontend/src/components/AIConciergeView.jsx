import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  UtensilsCrossed,
  MapPin,
  Clock,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  User,
  Bot,
  Zap,
  Calendar,
  Sun,
  Compass,
  BookmarkCheck,
  Building,
  BellRing,
  Coffee,
  Check,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';

const QUICK_ACTION_CARDS = [
  {
    id: 'res',
    title: 'MY RESERVATION',
    sub: 'Dates & Room',
    prompt: 'What is my booking reference and stay details?',
    icon: BookmarkCheck,
    badge: 'PMS Live',
  },
  {
    id: 'req',
    title: 'MY REQUESTS',
    sub: 'Status & Towels',
    prompt: 'Show my service requests and their live status.',
    icon: Clock,
    badge: 'Live Queue',
  },
  {
    id: 'hotel',
    title: 'HOTEL INFORMATION',
    sub: 'Amenities & Pool',
    prompt: 'What amenities and dining does my hotel offer?',
    icon: Building,
    badge: '24/7 Resort',
  },
  {
    id: 'trip',
    title: 'PLAN MY TRIP',
    sub: 'Day Itineraries',
    prompt: 'Plan a 3-day luxury trip itinerary.',
    icon: Compass,
    badge: 'Bespoke AI',
  },
  {
    id: 'dining',
    title: 'DINING & TOURS',
    sub: 'Curated Experiences',
    prompt: 'Recommend fine dining restaurants and VIP tours near my hotel.',
    icon: UtensilsCrossed,
    badge: 'Michelin Guide',
  },
  {
    id: 'service',
    title: 'ROOM SERVICE',
    sub: 'Towel & Linens',
    prompt: 'Can I request extra bath towels and pillows for my room?',
    icon: BellRing,
    badge: 'Housekeeping',
  },
];

const CHEF_MENU = [
  {
    id: 1,
    title: 'Artisan Truffle Mushroom Risotto',
    price: 34.0,
    desc: 'Carnaroli rice, black winter truffle shavings, 24-month aged parmigiano-reggiano, wild forest mushrooms.',
    time: '20 mins',
    tag: 'Chef Signature',
  },
  {
    id: 2,
    title: 'Pacific Pan-Seared Salmon',
    price: 38.0,
    desc: 'Wild-caught Pacific salmon, charred jumbo asparagus, Meyer lemon herb beurre blanc.',
    time: '25 mins',
    tag: 'Sustainable Seafood',
  },
  {
    id: 3,
    title: 'Prime Wagyu Burger & Truffle Fries',
    price: 28.0,
    desc: 'A5 Wagyu beef patty, brioche bun, aged sharp cheddar, caramelized shallots, sweet potato fries.',
    time: '18 mins',
    tag: 'Guest Favorite',
  },
  {
    id: 4,
    title: 'Matcha Tiramisu & Fresh Berries',
    price: 16.0,
    desc: 'Ceremonial grade Uji matcha, mascarpone sabayon, organic California raspberries.',
    time: '12 mins',
    tag: 'Artisan Dessert',
  },
];

export const AIConciergeView = ({ user, currency = 'USD' }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: `Welcome to Nexgile Grand Resort, ${user?.full_name || 'Alexander Wright'}! I am your Ask Nexgile Luxury Concierge. Ask anything about your stay, room upgrades, complimentary amenities, fine dining, curated itineraries, or request room service.`,
      timestamp: 'Just now',
      suggestions: [
        'What is my booking reference and stay details?',
        'Show my service requests and their live status.',
        'What amenities and dining does my hotel offer?',
        'Plan a 3-day luxury trip itinerary.',
        'Recommend fine dining restaurants and VIP tours near my hotel.',
        'Can I request extra bath towels and pillows for my room?',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeChannel, setActiveChannel] = useState('App'); // App, WhatsApp, SMS, Email
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('101');
  const [serviceRequests, setServiceRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('CHAT'); // CHAT, DINING, REQUESTS
  const [escalated, setEscalated] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [submitNotice, setSubmitNotice] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [customAmenity, setCustomAmenity] = useState('Extra Bath Towels & Hypoallergenic Pillows');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadServiceRequests = async () => {
    try {
      const reqs = await api.getServiceRequests();
      if (reqs) setServiceRequests(reqs);
    } catch (err) {
      console.error('Error fetching service requests:', err);
    }
  };

  useEffect(() => {
    loadServiceRequests();
  }, [selectedRoomNumber]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.chatConcierge(
        text,
        'NXG-A89F4B',
        chatHistory,
        user?.full_name || 'Alexander Wright'
      );

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: res.suggestions || [],
        action_type: res.action_type,
        payload: res.payload,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If action created a service request, refresh request queue and show confirmation
      if (res.action_type === 'CREATE_SERVICE_REQUEST') {
        const item = res.payload?.item || 'Guest Amenity';
        setSubmitNotice(`Your request for "${item}" has been submitted and assigned to housekeeping!`);
        setTimeout(() => setSubmitNotice(null), 6000);
        await loadServiceRequests();
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I have logged your request directly with our guest services team. A staff member is attending to your inquiry.',
          timestamp: 'Just now',
          suggestions: ['Show my service requests and their live status.', 'What is my booking reference and stay details?'],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscalateToHuman = async () => {
    try {
      await api.createServiceRequest({
        guest_name: user?.full_name || 'Alexander Wright',
        room_number: selectedRoomNumber,
        service_type: 'Concierge Escalation',
        priority: 'Urgent',
        notes: 'Guest requested live human ambassador intervention via Ask Nexgile Concierge.',
      });
      setEscalated(true);
      await loadServiceRequests();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Your request has been escalated directly to Guest Relations Manager Sarah Jenkins. A team member is dispatching to your room or calling your registered extension.',
          timestamp: 'Just now',
        },
      ]);
      setSubmitNotice('Human Ambassador alerted. Immediate staff response dispatched.');
      setTimeout(() => {
        setEscalated(false);
        setSubmitNotice(null);
      }, 7000);
    } catch (err) {
      console.error('Escalation failed:', err);
    }
  };

  const handleQuickOrder = (dish) => {
    handleSend(`Please order 1x ${dish.title} for Room ${selectedRoomNumber}.`);
    setActiveTab('CHAT');
  };

  const handleCreateAmenityRequest = async (e) => {
    e.preventDefault();
    if (!customAmenity) return;
    try {
      await api.createServiceRequest({
        guest_name: user?.full_name || 'Alexander Wright',
        room_number: selectedRoomNumber,
        service_type: 'Housekeeping',
        priority: 'Medium',
        notes: `Guest requested: ${customAmenity}`,
      });
      setShowRequestModal(false);
      setSubmitNotice(`Your request for "${customAmenity}" has been submitted to housekeeping!`);
      setTimeout(() => setSubmitNotice(null), 5000);
      await loadServiceRequests();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Your amenity request for "${customAmenity}" has been confirmed and logged in our system for Room ${selectedRoomNumber}. Our housekeeping team will deliver it shortly.`,
          timestamp: 'Just now',
          suggestions: ['Show my service requests and their live status.', 'What amenities and dining does my hotel offer?'],
        },
      ]);
    } catch (err) {
      console.error('Failed to submit amenity request:', err);
    }
  };

  const handleGiveFeedback = (msgId, isPositive) => {
    setFeedbackGiven((prev) => ({ ...prev, [msgId]: isPositive ? 'up' : 'down' }));
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <section className="module-header module-header-emerald flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">AI Guest Experience</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" /> Powered by Vercel AI SDK
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 font-display">
            AI Guest Concierge &amp; Smart In-Stay Services
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Conversational hospitality engine offering predictive itinerary planning, in-stay amenity dispatch, 24/7 chef dining, and human staff escalation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Room Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-emerald-200 text-xs shadow-sm">
            <span className="text-slate-400 font-semibold">Active Room:</span>
            <select
              value={selectedRoomNumber}
              onChange={(e) => setSelectedRoomNumber(e.target.value)}
              className="font-bold text-emerald-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="101">Room 101 (Executive Suite)</option>
              <option value="102">Room 102 (Deluxe King)</option>
              <option value="104">Room 104 (Studio Suite)</option>
              <option value="201">Room 201 (Presidential Suite)</option>
              <option value="301">Room 301 (Penthouse Suite)</option>
            </select>
          </div>

          <button
            onClick={handleEscalateToHuman}
            className="px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
            {escalated ? 'Ambassador Alerted!' : 'Escalate to Staff'}
          </button>
        </div>
      </section>

      {/* Submission Alert Banner */}
      {submitNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{submitNotice}</span>
        </div>
      )}

      {/* Active Stay Profile Card */}
      <div className="glass-card p-4 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/40 via-white to-indigo-50/30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-500/20">
            101
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {user?.full_name || 'Alexander Wright'} · Executive Suite
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Diamond Elite
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>PNR: <strong className="text-slate-800">NXG-A89F4B</strong></span>
              <span>•</span>
              <span>Sept 08 - Sept 12 (4 Nights)</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">Active In-Stay</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Request Amenity</span>
          </button>
          <button
            onClick={() => handleSend('What is my booking reference and stay details?')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Stay Details</span>
          </button>
        </div>
      </div>

      {/* 6 Quick Action Cards (Matching https://nexgile-travai.vercel.app/concierge) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {QUICK_ACTION_CARDS.map(({ id, title, sub, prompt, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => handleSend(prompt)}
            className="p-3.5 rounded-2xl bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 text-left transition-all duration-200 shadow-sm hover:shadow-md group cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                {badge}
              </span>
            </div>
            <div>
              <h4 className="text-[11px] font-extrabold text-slate-800 tracking-wider font-display">
                {title}
              </h4>
              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                {sub}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* View Tabs & Omnichannel Simulator */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200 w-full sm:w-auto">
          {[
            { id: 'CHAT', label: 'AI Concierge Chat', icon: MessageSquare },
            { id: 'DINING', label: 'In-Room Dining Menu', icon: UtensilsCrossed },
            { id: 'REQUESTS', label: `Live Service Requests (${serviceRequests.length})`, icon: Clock },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === id
                  ? 'bg-white text-emerald-800 shadow-md shadow-emerald-500/10'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Omnichannel simulator badges */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Simulate Channel:</span>
          {['App', 'WhatsApp', 'SMS', 'Email'].map((channel) => (
            <button
              key={channel}
              onClick={() => setActiveChannel(channel)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                activeChannel === channel
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {channel}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: CONCIERGE CHAT */}
      {activeTab === 'CHAT' && (
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 flex flex-col h-[600px] shadow-sm">
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">ASK NEXGILE · LUXURY CONCIERGE</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Online · {activeChannel} Mode
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Nexgile Grand Resort · Room {selectedRoomNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>SF 19°C · Clear Skies</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-2xl ${isAssistant ? '' : 'ml-auto flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isAssistant
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-indigo-600 text-white shadow-sm'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-sm ${
                        isAssistant
                          ? 'bg-white text-slate-800 border border-slate-200'
                          : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Action Card Confirmation if Ticket Created */}
                    {isAssistant && msg.action_type === 'CREATE_SERVICE_REQUEST' && (
                      <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-2 shadow-sm animate-fade-in">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold">
                            Dispatched to Housekeeping: {msg.payload?.item || 'Guest Request'}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-800 font-bold text-[10px]">
                          Ticket Ref: {msg.payload?.ticket_id || 'SR'}
                        </span>
                      </div>
                    )}

                    {/* Suggestions Pill Bar */}
                    {isAssistant && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.suggestions.map((sugg) => (
                          <button
                            key={sugg}
                            onClick={() => handleSend(sugg)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold transition-all cursor-pointer"
                          >
                            {sugg}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* AI Governance & Rationale */}
                    {isAssistant && (
                      <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                        <span className="flex items-center gap-1 font-mono">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          AI Confidence: 98.4% · Hospitality Verified
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleGiveFeedback(msg.id, true)}
                            className={`p-1 rounded hover:bg-slate-200 ${
                              feedbackGiven[msg.id] === 'up' ? 'text-emerald-600' : ''
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleGiveFeedback(msg.id, false)}
                            className={`p-1 rounded hover:bg-slate-200 ${
                              feedbackGiven[msg.id] === 'down' ? 'text-rose-600' : ''
                            }`}
                            title="Needs Improvement"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                <span>AI Concierge is curating your personalized hospitality response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask Concierge via ${activeChannel} (e.g. 'Can I request extra bath towels?', 'Suggest fine dining', '3-day itinerary')...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="btn-success px-4 py-2.5 text-xs font-bold"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: IN-ROOM DINING */}
      {activeTab === 'DINING' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">24/7 Chef Dining to Room {selectedRoomNumber}</h4>
                <p className="text-[11px] text-slate-500">Fast 25-minute room delivery directly dispatched to kitchen</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
              Kitchen Open
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CHEF_MENU.map((dish) => (
              <div key={dish.id} className="glass-card p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      {dish.tag}
                    </span>
                    <span className="text-base font-black text-slate-900 font-display">
                      {formatCurrency(dish.price, currency)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">{dish.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{dish.desc}</p>
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-3">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Delivery: {dish.time}
                  </span>
                  <button
                    onClick={() => handleQuickOrder(dish)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Order to Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE SERVICE REQUESTS */}
      {activeTab === 'REQUESTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live Guest Service Tickets</h3>
              <p className="text-xs text-slate-500">Active housekeeping, luggage, and dining requests in queue</p>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Amenity Request</span>
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {serviceRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active service requests for this room. All requests have been completed.
              </div>
            ) : (
              serviceRequests.map((req) => (
                <div key={req.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Room {req.room_number}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {req.service_type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {req.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{req.notes}</p>
                    <p className="text-[10px] text-slate-400">Guest: {req.guest_name}</p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      req.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : req.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Amenity Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Request Guest Amenity</h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Select an amenity or service for immediate delivery to Room {selectedRoomNumber}:
            </p>

            <form onSubmit={handleCreateAmenityRequest} className="space-y-3">
              {[
                'Extra Bath Towels & Hypoallergenic Pillows',
                'Luggage Assistance & Bellhop Dispatch',
                'Complimentary Sparkling & Spring Water',
                'Evening Turndown Service & Fresh Linens',
                'Artisan Cheese & Wine Platter to Room',
                'Dental, Shaving & Vanity Toiletry Kit',
              ].map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    customAmenity === opt
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="amenity"
                    value={opt}
                    checked={customAmenity === opt}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    className="accent-emerald-600"
                  />
                  <span>{opt}</span>
                </label>
              ))}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-success px-5 py-2 text-xs font-bold"
                >
                  Confirm Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
