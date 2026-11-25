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
  Building2,
  BellRing,
  Coffee,
  Check,
  Plus,
  UserCheck,
  UserMinus,
  CreditCard,
  TrendingUp,
  BarChart3,
  Globe,
  DollarSign,
  Wrench,
  ClipboardList,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';

export const CONCIERGE_SCOPES = [
  {
    id: 'TRAVELER',
    name: 'Traveler & In-Stay',
    icon: User,
    badge: 'Guest Mode',
    actions: [
      { id: 'res', title: 'MY RESERVATION', sub: 'Dates & Room', prompt: 'What is my booking reference and stay details?', icon: BookmarkCheck, badge: 'PMS Live' },
      { id: 'req', title: 'MY REQUESTS', sub: 'Status & Towels', prompt: 'Show my service requests and their live status.', icon: Clock, badge: 'Live Queue' },
      { id: 'hotel', title: 'HOTEL INFORMATION', sub: 'Amenities & Pool', prompt: 'What amenities and dining does my hotel offer?', icon: Building, badge: '24/7 Resort' },
      { id: 'trip', title: 'PLAN MY TRIP', sub: 'Day Itineraries', prompt: 'Plan a 3-day luxury trip itinerary.', icon: Compass, badge: 'Bespoke AI' },
      { id: 'dining', title: 'DINING & TOURS', sub: 'Curated Experiences', prompt: 'Recommend fine dining restaurants and VIP tours near my hotel.', icon: UtensilsCrossed, badge: 'Michelin Guide' },
      { id: 'service', title: 'ROOM SERVICE', sub: 'Towel & Linens', prompt: 'Can I request extra bath towels and pillows for my room?', icon: BellRing, badge: 'Housekeeping' },
    ]
  },
  {
    id: 'FRONT_DESK',
    name: 'Front Desk Ops',
    icon: Building2,
    badge: 'Front Desk',
    actions: [
      { id: 'arr', title: "TODAY'S ARRIVALS", sub: 'Expected Check-ins', prompt: 'Who are the expected arrivals scheduled for today?', icon: UserCheck, badge: 'Arrivals' },
      { id: 'ready', title: 'READY SUITES', sub: 'Clean & Inspected', prompt: 'Which suites are clean, inspected, and ready for walk-ins?', icon: CheckCircle2, badge: 'Inventory' },
      { id: 'dep', title: 'DEPARTURES TODAY', sub: 'Pending Check-outs', prompt: 'Which in-house guests are scheduled for check-out today?', icon: UserMinus, badge: 'Departures' },
      { id: 'folio', title: 'FOLIO BILLING', sub: 'Balance & Settle', prompt: 'How do I look up and settle a guest billing folio?', icon: CreditCard, badge: 'Settlement' },
      { id: 'turn', title: 'ROOM TURNAROUND', sub: 'Dirty & In Progress', prompt: 'How many suites are currently dirty or in turnaround?', icon: Sparkles, badge: 'Turnaround' },
      { id: 'tickets', title: 'GUEST TICKETS', sub: 'Towels & Requests', prompt: 'List active guest service requests for towels or amenities.', icon: BellRing, badge: 'Dispatch' },
    ]
  },
  {
    id: 'YIELD',
    name: 'Yield Strategy',
    icon: TrendingUp,
    badge: 'Revenue & Yield',
    actions: [
      { id: 'yield', title: 'YIELD DIRECTIVES', sub: '41 Recommendations', prompt: 'Explain the current dynamic rate recommendations for our luxury suites.', icon: TrendingUp, badge: 'Optimizer' },
      { id: 'surge', title: 'DEMAND SURGE', sub: 'Weekend Optimization', prompt: 'Which properties should we apply weekend demand surge pricing to?', icon: Zap, badge: 'Surge Pricing' },
      { id: 'velocity', title: 'VELOCITY TRENDS', sub: 'Booking Pace', prompt: 'Compare weekday vs weekend booking velocity trends.', icon: BarChart3, badge: 'Analytics' },
      { id: 'parity', title: 'RATE PARITY', sub: 'OTA Surveillance', prompt: 'What is our current rate parity status across Booking.com and Expedia?', icon: Globe, badge: 'Parity Sync' },
      { id: 'direct', title: 'DIRECT RATIO', sub: 'Commission Savings', prompt: 'What is our direct booking revenue ratio vs OTA commissions?', icon: DollarSign, badge: 'Direct ROI' },
      { id: 'adr', title: 'ADR & REVPAR', sub: 'Estate Performance', prompt: 'Summarize our average daily rate across resort and palace properties.', icon: ShieldCheck, badge: 'RevPAR Yield' },
    ]
  },
  {
    id: 'HOUSEKEEPING',
    name: 'Housekeeping Sync',
    icon: Sparkles,
    badge: 'Facility Board',
    actions: [
      { id: 'dirty', title: 'DIRTY QUEUE', sub: 'Floor Turnaround', prompt: 'Which suites are currently marked DIRTY on Floor 1 and Floor 2?', icon: Sparkles, badge: 'Turnaround' },
      { id: 'inspect', title: 'READY TO INSPECT', sub: 'Supervisor Queue', prompt: 'Show suites in turnaround ready for supervisor inspection.', icon: CheckCircle2, badge: 'QA Inspection' },
      { id: 'amenity', title: 'AMENITY REQUESTS', sub: 'Towels & Pillows', prompt: 'List all active guest requests for extra towels, linens, or amenities.', icon: BellRing, badge: 'Priority High' },
      { id: 'vip', title: 'VIP PROTOCOLS', sub: 'Presidential Suites', prompt: 'What are the standard turnover protocols for Presidential Suites?', icon: ShieldCheck, badge: 'VIP Standard' },
      { id: 'turnpace', title: 'TURNAROUND PACE', sub: 'Cleaning Efficiency', prompt: 'How can we optimize suite turnaround velocity between check-outs?', icon: Clock, badge: 'SLA Tracking' },
      { id: 'blocker', title: 'MAINTENANCE BLOCK', sub: 'Work Order Sync', prompt: 'Are there any suites with active maintenance blockers?', icon: Wrench, badge: 'Work Orders' },
    ]
  },
  {
    id: 'EXECUTIVE',
    name: 'Executive Portfolio',
    icon: Building,
    badge: 'HQ Overview',
    actions: [
      { id: 'port', title: 'PORTFOLIO SUMMARY', sub: '21 Estates Overview', prompt: 'Summarize portfolio occupancy and arrivals across all 21 properties.', icon: Building, badge: '21 Estates' },
      { id: 'drift', title: 'OCCUPANCY DRIFT', sub: 'Low Capacity Watch', prompt: 'Which properties currently have the lowest occupancy rate?', icon: TrendingUp, badge: 'Pacing Watch' },
      { id: 'maintq', title: 'MAINTENANCE QUEUE', sub: 'Work Orders', prompt: 'List any unresolved critical maintenance work orders.', icon: Wrench, badge: 'Facility Risk' },
      { id: 'brief', title: 'OPERATIONAL BRIEF', sub: 'Front Desk Sync', prompt: "Give me an executive briefing on today's front desk operations.", icon: ClipboardList, badge: 'Morning Brief' },
      { id: 'channelrev', title: 'CHANNEL REVENUE', sub: 'Direct vs OTAs', prompt: 'How is direct website revenue performing compared to OTAs?', icon: Globe, badge: 'Yield Split' },
      { id: 'directives', title: 'RATE DIRECTIVES', sub: 'Yield Strategy', prompt: 'What are the active dynamic rate recommendations for our suites?', icon: Zap, badge: 'AI Governance' },
    ]
  }
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
  const [activeScope, setActiveScope] = useState('TRAVELER');
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: `Welcome to Nexgile Grand Resort, ${user?.full_name || 'Alexander Wright'}! I am your Ask Nexgile Luxury Concierge and Operations Engine. Ask anything about your stay, room upgrades, complimentary amenities, fine dining, bespoke itineraries, front desk sync, or dynamic yield strategy.`,
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
  const [activeChannel, setActiveChannel] = useState('App');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('101');
  const [serviceRequests, setServiceRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('CHAT');
  const [escalated, setEscalated] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [customAmenity, setCustomAmenity] = useState('Extra Bath Towels & Hypoallergenic Pillows');
  const [submitNotice, setSubmitNotice] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadServiceRequests = async () => {
    try {
      const data = await api.getServiceRequests(selectedRoomNumber);
      setServiceRequests(data);
    } catch (err) {
      console.error('Error fetching service requests:', err);
    }
  };

  useEffect(() => {
    loadServiceRequests();
  }, [selectedRoomNumber]);

  useEffect(() => {
    if (activeTab === 'CHAT') {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.chatAI(history, user?.full_name, selectedRoomNumber, 'Concierge');

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
      if (res.action_type === 'CREATE_SERVICE_REQUEST') {
        await loadServiceRequests();
      }
    } catch (err) {
      console.error('AI Concierge Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I apologize, our luxury concierge service is momentarily recalibrating. Please retry in a moment or click Escalate to Staff.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  const currentScopeObj = CONCIERGE_SCOPES.find((s) => s.id === activeScope) || CONCIERGE_SCOPES[0];

  return (
    <div className="space-y-6">
      {/* Module Header - Cyber-Luxe Obsidian with Cyan Glow */}
      <section className="module-header module-header-blue flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">AI Concierge &amp; Operations</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
              <Sparkles className="w-3 h-3 text-amber-400" /> 24/7 VIP Guest Butler &amp; Luxury Concierge
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-black text-white font-display tracking-tight">
            AI Guest Concierge &amp; Smart Operations Hub
          </h2>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl">
            Conversational hospitality engine offering predictive itinerary planning, in-stay amenity dispatch, dynamic yield strategy, and 24/7 chef dining.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Room Selector */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-xs shadow-lg">
            <span className="text-slate-400 font-semibold">Active Room:</span>
            <select
              value={selectedRoomNumber}
              onChange={(e) => setSelectedRoomNumber(e.target.value)}
              className="font-bold text-cyan-300 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="101" className="bg-slate-900 text-white">Room 101 (Executive Suite)</option>
              <option value="102" className="bg-slate-900 text-white">Room 102 (Deluxe King)</option>
              <option value="104" className="bg-slate-900 text-white">Room 104 (Studio Suite)</option>
              <option value="201" className="bg-slate-900 text-white">Room 201 (Presidential Suite)</option>
              <option value="301" className="bg-slate-900 text-white">Room 301 (Penthouse Suite)</option>
            </select>
          </div>

          <button
            onClick={handleEscalateToHuman}
            className="px-4 py-2 rounded-2xl bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg hover:shadow-rose-500/20 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
            {escalated ? 'Ambassador Alerted!' : 'Escalate to Staff'}
          </button>
        </div>
      </section>

      {/* Submission Alert Banner */}
      {submitNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 shadow-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{submitNotice}</span>
        </div>
      )}

      {/* Active Stay Profile Card */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-cyan-500/30 border border-cyan-400/30">
            {selectedRoomNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                {user?.full_name || 'Alexander Wright'} · Executive Suite
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                Diamond Elite
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>PNR: <strong className="text-cyan-300">NXG-A89F4B</strong></span>
              <span>•</span>
              <span>Sept 08 - Sept 12 (4 Nights)</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Active In-Stay
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Request Amenity</span>
          </button>
          <button
            onClick={() => handleSend('What is my booking reference and stay details?')}
            className="btn-primary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Stay Details</span>
          </button>
        </div>
      </div>

      {/* Role-Aware Scope Switcher Bar (Discovered from https://nexgile-travai.vercel.app/concierge) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Interactive Operational Scope:
            </span>
          </div>
          <span className="text-[11px] text-cyan-400 font-semibold">
            {currentScopeObj.badge} Active
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {CONCIERGE_SCOPES.map(({ id, name, icon: ScopeIcon }) => {
            const isSelected = activeScope === id;
            return (
              <button
                key={id}
                onClick={() => setActiveScope(id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <ScopeIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{name}</span>
              </button>
            );
          })}
        </div>

        {/* 6 Quick Action Cards based on selected scope */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {currentScopeObj.actions.map(({ id, title, sub, prompt, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => handleSend(prompt)}
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-400/70 text-left transition-all duration-200 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] group cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/90 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                  {badge}
                </span>
              </div>
              <div>
                <h4 className="text-[11px] font-extrabold text-white tracking-wider font-display group-hover:text-cyan-300 transition-colors">
                  {title}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                  {sub}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* View Tabs & Omnichannel Simulator */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 w-full sm:w-auto shadow-lg">
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
                  ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-white'
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
                  ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              {channel}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: CONCIERGE CHAT */}
      {activeTab === 'CHAT' && (
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-800 flex flex-col h-[600px] shadow-2xl">
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 border border-cyan-400/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">ASK NEXGILE · LUXURY CONCIERGE</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    Online · {activeChannel} Mode
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  Nexgile Grand Resort · Room {selectedRoomNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>SF 19°C · Clear Skies</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/70">
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
                        ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                        : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-lg ${
                        isAssistant
                          ? 'bg-slate-900/95 text-slate-100 border border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                          : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium shadow-cyan-600/25'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Action Card Confirmation if Ticket Created */}
                    {isAssistant && msg.action_type === 'CREATE_SERVICE_REQUEST' && (
                      <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center justify-between gap-2 shadow-lg animate-fade-in">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="font-semibold">
                            Dispatched to Housekeeping: {msg.action_data?.item || 'Guest Request'}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-900/90 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
                          Ticket Ref: {msg.action_data?.ticket_id || 'SR'}
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
                            className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 text-[11px] font-semibold transition-all cursor-pointer shadow-sm hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                          >
                            {sugg}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* AI Governance & Rationale */}
                    {isAssistant && (
                      <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                        <span className="flex items-center gap-1 font-mono">
                          <ShieldCheck className="w-3 h-3 text-cyan-400" />
                          AI Confidence: 98.4% · Hospitality Verified
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleGiveFeedback(msg.id, true)}
                            className={`p-1 rounded hover:bg-slate-800 ${
                              feedbackGiven[msg.id] === 'up' ? 'text-cyan-400' : 'text-slate-500'
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleGiveFeedback(msg.id, false)}
                            className={`p-1 rounded hover:bg-slate-800 ${
                              feedbackGiven[msg.id] === 'down' ? 'text-rose-400' : 'text-slate-500'
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
              <div className="flex items-center gap-2 text-xs text-cyan-400 pl-11">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
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
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask Concierge via ${activeChannel} (e.g. 'Can I request extra bath towels?', 'Suggest fine dining', '3-day itinerary')...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700/80 text-xs bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="btn-primary px-4 py-2.5 text-xs font-bold"
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
          <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-cyan-400" />
              <div>
                <h4 className="text-xs font-bold text-white">24/7 Chef Dining to Room {selectedRoomNumber}</h4>
                <p className="text-[11px] text-slate-400">Fast 25-minute room delivery directly dispatched to kitchen</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-cyan-500 text-white font-bold text-[10px] shadow-[0_0_10px_rgba(6,182,212,0.4)]">
              Kitchen Open
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CHEF_MENU.map((dish) => (
              <div key={dish.id} className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-cyan-500/50 shadow-xl">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {dish.tag}
                    </span>
                    <span className="text-base font-black text-emerald-400 font-display">
                      {formatCurrency(dish.price, currency)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-2">{dish.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{dish.desc}</p>
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-slate-800/80 mt-3">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" /> Delivery: {dish.time}
                  </span>
                  <button
                    onClick={() => handleQuickOrder(dish)}
                    className="btn-primary px-3.5 py-1.5 text-xs font-bold"
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
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Live Guest Service Tickets</h3>
              <p className="text-xs text-slate-400">Active housekeeping, luggage, and dining requests in queue</p>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              className="btn-primary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Amenity Request</span>
            </button>
          </div>
          <div className="divide-y divide-slate-800">
            {serviceRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active service requests for this room. All requests have been completed.
              </div>
            ) : (
              serviceRequests.map((req) => (
                <div key={req.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-850/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Room {req.room_number}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                        {req.service_type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.priority === 'Urgent'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                            : 'bg-blue-950 text-blue-300 border border-blue-500/40'
                        }`}
                      >
                        {req.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{req.notes}</p>
                    <p className="text-[10px] text-slate-500">Guest: {req.guest_name}</p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      req.status === 'Completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : req.status === 'In Progress'
                        ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl p-6 max-w-md w-full space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Request Guest Amenity</h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">
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
                      ? 'bg-cyan-950/60 border-cyan-400/80 text-cyan-200 shadow-md'
                      : 'border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="amenity"
                    value={opt}
                    checked={customAmenity === opt}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    className="accent-cyan-400"
                  />
                  <span>{opt}</span>
                </label>
              ))}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 text-xs font-bold"
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
