import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Command,
  ArrowRight,
  Sparkles,
  Building2,
  TrendingUp,
  Globe,
  Compass,
  Smartphone,
  Briefcase,
  BarChart3,
  ShieldCheck,
  User,
  RefreshCw,
  DollarSign,
  X,
  Sliders,
  BedDouble,
  CornerDownLeft,
  PlusCircle,
  Wrench,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const LinearCommandPalette = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenProfile,
  onRefreshData,
  onVerifySecurity,
  onSelectRoom,
  onNewReservation,
  onSetStatusFilter,
  currency = 'USD',
  onCurrencyChange,
  rooms = [],
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const navigationCommands = [
    { id: 'OVERVIEW', title: 'Go to Overview & Pulse', category: 'Navigation', icon: BarChart3, shortcut: 'G O' },
    { id: 'FRONT_DESK', title: 'Go to Front Desk PMS & Room Rack', category: 'Navigation', icon: Building2, shortcut: 'G P' },
    { id: 'REVENUE_MANAGER', title: 'Go to Dynamic Pricing & Yield AI', category: 'Navigation', icon: TrendingUp, shortcut: 'G Y' },
    { id: 'CHANNELS', title: 'Go to Global Travel Distribution (20k+ Channels)', category: 'Navigation', icon: Globe, shortcut: 'G D' },
    { id: 'MARKETPLACE', title: 'Go to Curated Luxury Marketplace', category: 'Navigation', icon: Compass, shortcut: 'G M' },
    { id: 'AI_CONCIERGE', title: 'Go to VIP AI Guest Butler Copilot', category: 'Navigation', icon: Sparkles, shortcut: 'G C' },
    { id: 'SUPER_APP', title: 'Go to Guest Super App & Loyalty Hub', category: 'Navigation', icon: Smartphone, shortcut: 'G S' },
    { id: 'CORPORATE_ADMIN', title: 'Go to Corporate Travel Desk & Approvals', category: 'Navigation', icon: Briefcase, shortcut: 'G A' },
    { id: 'ANALYTICS', title: 'Go to Executive Intelligence & BI Analytics', category: 'Navigation', icon: BarChart3, shortcut: 'G E' },
    { id: 'AUDIT_LOGS', title: 'Go to Hospitality Audit Trail Ledger', category: 'Navigation', icon: ShieldCheck, shortcut: 'G L' },
    { id: 'SETTINGS', title: 'Go to Operator Profile & Security Credentials', category: 'Navigation', icon: User, shortcut: 'G S' },
  ];

  const actionCommands = [
    {
      id: 'ACTION_NEW_RESERVATION',
      title: 'Create New Guest Reservation',
      category: 'Front Desk Action',
      icon: PlusCircle,
      shortcut: 'N R',
      action: () => {
        onClose();
        if (onNewReservation) {
          onNewReservation();
        } else if (onNavigate) {
          onNavigate('FRONT_DESK');
        }
      },
    },
    {
      id: 'FILTER_AVAILABLE',
      title: 'Filter PMS: Available Suites Only',
      category: 'PMS Filter',
      icon: CheckCircle2,
      shortcut: 'F A',
      action: () => {
        onClose();
        if (onSetStatusFilter) {
          onSetStatusFilter('Available');
        } else if (onNavigate) {
          onNavigate('FRONT_DESK');
        }
      },
    },
    {
      id: 'FILTER_DIRTY',
      title: 'Filter PMS: Dirty Suites Pending Housekeeping Turn',
      category: 'PMS Filter',
      icon: Wrench,
      shortcut: 'F D',
      action: () => {
        onClose();
        if (onSetStatusFilter) {
          onSetStatusFilter('Dirty');
        } else if (onNavigate) {
          onNavigate('FRONT_DESK');
        }
      },
    },
    {
      id: 'FILTER_MAINTENANCE',
      title: 'Filter PMS: Maintenance Required Suites',
      category: 'PMS Filter',
      icon: ShieldCheck,
      shortcut: 'F M',
      action: () => {
        onClose();
        if (onSetStatusFilter) {
          onSetStatusFilter('Maintenance');
        } else if (onNavigate) {
          onNavigate('FRONT_DESK');
        }
      },
    },
    {
      id: 'FILTER_OCCUPIED',
      title: 'Filter PMS: Occupied Guest Suites',
      category: 'PMS Filter',
      icon: User,
      shortcut: 'F O',
      action: () => {
        onClose();
        if (onSetStatusFilter) {
          onSetStatusFilter('Occupied');
        } else if (onNavigate) {
          onNavigate('FRONT_DESK');
        }
      },
    },
    {
      id: 'ACTION_PROFILE',
      title: 'Open Operator Profile & Security Credentials',
      category: 'Operator Action',
      icon: User,
      shortcut: 'O P',
      action: () => {
        onClose();
        if (onOpenProfile) onOpenProfile();
      },
    },
    {
      id: 'ACTION_VERIFY_SECURITY',
      title: 'Verify Security Credentials & Ledger Clearance',
      category: 'Security Protocol',
      icon: ShieldCheck,
      shortcut: 'V S',
      action: () => {
        onClose();
        if (onVerifySecurity) onVerifySecurity();
      },
    },
    {
      id: 'ACTION_REFRESH',
      title: 'Synchronize Live Telemetry & Room Inventory',
      category: 'Operator Action',
      icon: RefreshCw,
      shortcut: 'S Y',
      action: () => {
        onClose();
        if (onRefreshData) onRefreshData();
      },
    },
    {
      id: 'ACTION_CURRENCY_USD',
      title: 'Switch Display Currency to USD ($)',
      category: 'Preferences',
      icon: DollarSign,
      action: () => {
        if (onCurrencyChange) onCurrencyChange('USD');
        onClose();
      },
    },
    {
      id: 'ACTION_CURRENCY_EUR',
      title: 'Switch Display Currency to EUR (€)',
      category: 'Preferences',
      icon: DollarSign,
      action: () => {
        if (onCurrencyChange) onCurrencyChange('EUR');
        onClose();
      },
    },
    {
      id: 'ACTION_CURRENCY_GBP',
      title: 'Switch Display Currency to GBP (£)',
      category: 'Preferences',
      icon: DollarSign,
      action: () => {
        if (onCurrencyChange) onCurrencyChange('GBP');
        onClose();
      },
    },
    {
      id: 'ACTION_CURRENCY_INR',
      title: 'Switch Display Currency to INR (₹)',
      category: 'Preferences',
      icon: DollarSign,
      action: () => {
        if (onCurrencyChange) onCurrencyChange('INR');
        onClose();
      },
    },
  ];

  // Map ALL available hotel rooms with direct inspection action
  const roomCommands = rooms.map((room) => ({
    id: `ROOM_${room.room_number}`,
    title: `Room ${room.room_number} (${room.room_type}) &bull; ${room.status}`,
    category: 'Rooms & PMS',
    icon: BedDouble,
    room: room,
    shortcut: `Rm ${room.room_number}`,
    action: () => {
      onClose();
      if (onSelectRoom) {
        onSelectRoom(room);
      } else if (onNavigate) {
        onNavigate('FRONT_DESK');
      }
    },
  }));

  const allCommands = [
    ...roomCommands,
    ...actionCommands,
    ...navigationCommands.map((c) => ({
      ...c,
      action: () => {
        onClose();
        if (onNavigate) onNavigate(c.id);
      },
    })),
  ];

  const filtered = allCommands.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const titleMatch = cmd.title.toLowerCase().includes(q);
    const catMatch = cmd.category.toLowerCase().includes(q);
    const shortcutMatch = cmd.shortcut && cmd.shortcut.toLowerCase().includes(q);
    const roomMatch =
      cmd.room &&
      (String(cmd.room.room_number).toLowerCase().includes(q) ||
        String(cmd.room.room_type).toLowerCase().includes(q) ||
        String(cmd.room.status).toLowerCase().includes(q) ||
        (cmd.room.current_guest_name &&
          String(cmd.room.current_guest_name).toLowerCase().includes(q)));
    return titleMatch || catMatch || shortcutMatch || roomMatch;
  });

  // Auto-scroll list to selected index during keyboard navigation
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#090D1C]/98 border border-cyan-500/30 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[75vh] animate-slideDown"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <Command className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, room number, or search..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800">
            Esc
          </span>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length ? (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon || Sparkles;

              return (
                <button
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-bold'
                      : 'text-slate-300 hover:bg-slate-900/60 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg border ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <span className="truncate" dangerouslySetInnerHTML={{ __html: item.title }} />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      {item.category}
                    </span>
                    {item.shortcut ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800">
                        {item.shortcut}
                      </span>
                    ) : (
                      isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching commands or rooms found for "{query}".
            </div>
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div className="px-4 py-2.5 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]">↵</kbd>
              <span>to select</span>
            </span>
          </div>

          <span className="text-amber-300 font-semibold text-[10px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> TravAI Resort Quick Command
          </span>
        </div>
      </div>
    </div>
  );
};
