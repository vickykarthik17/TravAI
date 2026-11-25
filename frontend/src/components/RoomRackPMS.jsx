import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  User, 
  Sparkles, 
  Wrench, 
  Filter, 
  X, 
  UserCheck, 
  UserMinus, 
  PlusCircle, 
  Building,
  Bed,
  CreditCard,
  Key,
  QrCode,
  Smartphone,
  HeartHandshake,
  Sliders,
  Receipt,
  Download,
  ClipboardCheck,
  Users,
  Calendar,
  Wifi,
  Send,
  FileText,
  Check,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { getTodayStr, formatDate } from '../utils/date';

export const RoomRackPMS = ({
  rooms,
  onRoomsUpdated,
  currency = 'USD',
  user,
  targetRoomNumber,
  onClearTargetRoom,
  autoOpenNewBooking,
  onClearAutoOpenNewBooking,
  targetStatusFilter,
  onClearTargetStatusFilter,
}) => {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Modal Tabs: 'STATUS' | 'DIGITAL_KEY' | 'PREFERENCES' | 'HOUSEKEEPING' | 'FOLIO'
  const [roomModalTab, setRoomModalTab] = useState('STATUS');

  // Modal Form State
  const [modalGuestName, setModalGuestName] = useState('');
  const [modalNote, setModalNote] = useState('');
  const [targetStatus, setTargetStatus] = useState('Available');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Digital Key & Contactless State
  const [digitalKeyGenerated, setDigitalKeyGenerated] = useState(false);
  const [digitalKeyCode, setDigitalKeyCode] = useState('DK-7819-NFC');
  const [digitalKeySent, setDigitalKeySent] = useState(false);

  // VIP Guest Profile & Preferences
  const [vipTier, setVipTier] = useState('Diamond Ambassador');
  const [guestPrefTemp, setGuestPrefTemp] = useState('20.5°C (68.9°F)');
  const [guestPrefPillow, setGuestPrefPillow] = useState('Organic Memory Foam & Lavender');
  const [guestPrefDiet, setGuestPrefDiet] = useState('Gluten-Free & Sparkling San Pellegrino');
  const [guestPrefLateCheckout, setGuestPrefLateCheckout] = useState('Confirmed (14:00 Checkout)');

  // Housekeeping & Inspection Checklist
  const [inspectionLinen, setInspectionLinen] = useState(true);
  const [inspectionHvac, setInspectionHvac] = useState(true);
  const [inspectionMinibar, setInspectionMinibar] = useState(true);
  const [inspectionSanitized, setInspectionSanitized] = useState(true);
  const [assignedSteward, setAssignedSteward] = useState('Team Alpha · Steward Carlos M.');

  // Folio & Billing State
  const [folioDownloaded, setFolioDownloaded] = useState(false);
  const [refundNotice, setRefundNotice] = useState('');

  // New Booking State
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newRoomType, setNewRoomType] = useState('Executive Suite');
  const [newCheckIn, setNewCheckIn] = useState(() => getTodayStr(0));
  const [newCheckOut, setNewCheckOut] = useState(() => getTodayStr(3));
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [cardLast4, setCardLast4] = useState('4242');
  const [paymentStatus, setPaymentStatus] = useState('');

  const filteredRooms = rooms.filter(room => {
    if (filterStatus === 'ALL') return true;
    return room.status === filterStatus;
  });

  const handleOpenRoomModal = (room) => {
    setSelectedRoom(room);
    setRoomModalTab('STATUS');
    setModalGuestName(room.current_guest_name || '');
    setModalNote(room.housekeeping_note || '');
    setTargetStatus(room.status);
    setDigitalKeyGenerated(room.status === 'Occupied');
    setDigitalKeyCode(`DK-${room.room_number}-${Math.floor(1000 + Math.random() * 9000)}-NFC`);
    setDigitalKeySent(false);
    setFolioDownloaded(false);
    setRefundNotice('');
  };

  // Immediate redirection and modal focus when triggered from Linear Command Palette or deep link
  useEffect(() => {
    if (targetRoomNumber && rooms.length > 0) {
      const room = rooms.find((r) => String(r.room_number) === String(targetRoomNumber));
      if (room) {
        setFilterStatus('ALL');
        handleOpenRoomModal(room);
        setTimeout(() => {
          const el = document.getElementById(`room-card-${room.room_number}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-4', 'ring-cyan-400', 'shadow-[0_0_35px_rgba(6,182,212,0.85)]');
            setTimeout(() => {
              el.classList.remove('ring-4', 'ring-cyan-400', 'shadow-[0_0_35px_rgba(6,182,212,0.85)]');
            }, 3000);
          }
        }, 150);
        if (onClearTargetRoom) onClearTargetRoom();
      }
    }
  }, [targetRoomNumber, rooms]);

  // Handle auto-opening New Reservation modal from Command Palette
  useEffect(() => {
    if (autoOpenNewBooking) {
      setShowNewBookingModal(true);
      if (onClearAutoOpenNewBooking) onClearAutoOpenNewBooking();
    }
  }, [autoOpenNewBooking]);

  // Handle status filter change from Command Palette
  useEffect(() => {
    if (targetStatusFilter) {
      setFilterStatus(targetStatusFilter);
      if (onClearTargetStatusFilter) onClearTargetStatusFilter();
    }
  }, [targetStatusFilter]);

  const handleSaveRoomStatus = async () => {
    if (!selectedRoom) return;
    setIsSubmitting(true);
    try {
      if (targetStatus === 'Dirty' && selectedRoom.status === 'Occupied') {
        await api.checkoutRoom(selectedRoom.id);
      } else {
        await api.updateRoomStatus(
          selectedRoom.id,
          targetStatus,
          targetStatus === 'Occupied' ? modalGuestName : (targetStatus === 'Available' ? undefined : modalGuestName),
          modalNote,
          'Front Desk Agent'
        );
      }
      onRoomsUpdated();
      setSelectedRoom(null);
    } catch (err) {
      console.error('Failed to update room status:', err);
      alert('Error updating room status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedRoomObj = rooms.find(r => r.room_type === newRoomType && r.status === 'Available');
      const booking = await api.createBooking({
        guest_name: newGuestName,
        guest_email: newGuestEmail,
        property_id: 1,
        room_unit_id: selectedRoomObj ? selectedRoomObj.id : undefined,
        room_type: newRoomType,
        check_in_date: newCheckIn,
        check_out_date: newCheckOut,
        total_amount: selectedRoomObj ? selectedRoomObj.base_price * 3 : 890.0
      });
      setPaymentStatus('Payment initiated. Waiting for gateway confirmation...');
      const initiatedPayment = await api.initiatePayment(booking.id, paymentMethod, paymentMethod === 'Card' ? cardLast4 : null);
      setPaymentStatus(`Payment ${initiatedPayment.status.toLowerCase()} for ${formatCurrency(initiatedPayment.amount / 83.2, currency)}.`);
      await new Promise((resolve) => setTimeout(resolve, 800));
      const payment = await api.completePayment(initiatedPayment.id);
      setPaymentStatus(`Payment completed. Confirmation email sent to ${newGuestEmail}.`);
      onRoomsUpdated();
      setShowNewBookingModal(false);
      setNewGuestName('');
      setNewGuestEmail('');
      alert(`Booking ${booking.pnr} confirmed. Payment completed via ${payment.gateway}. Confirmation and receipt notifications were sent.`);
    } catch (err) {
      console.error('Failed to create booking:', err);
      alert('Failed to create booking.');
    } finally {
      setIsSubmitting(false);
      setPaymentStatus('');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[11px] font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            </span>
            Available
          </span>
        );
      case 'Occupied':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-cyan-300 text-[11px] font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></span>
            </span>
            Occupied
          </span>
        );
      case 'Dirty':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-300 text-[11px] font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
            </span>
            Needs Turn
          </span>
        );
      case 'Maintenance':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-300 text-[11px] font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(244,63,94,0.25)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span>
            </span>
            Maintenance
          </span>
        );
      default:
        return null;
    }
  };

  const getCardClass = (status) => {
    switch (status) {
      case 'Available': 
        return 'border-emerald-200/90 hover:border-emerald-400 hover:shadow-[0_12px_32px_-4px_rgba(16,185,129,0.25),0_0_18px_rgba(16,185,129,0.2)]';
      case 'Occupied': 
        return 'border-blue-200/90 hover:border-cyan-400 hover:shadow-[0_12px_32px_-4px_rgba(6,182,212,0.25),0_0_18px_rgba(6,182,212,0.22)]';
      case 'Dirty': 
        return 'border-amber-200/90 hover:border-amber-400 hover:shadow-[0_12px_32px_-4px_rgba(245,158,11,0.25),0_0_18px_rgba(245,158,11,0.2)]';
      case 'Maintenance': 
        return 'border-rose-200/90 hover:border-rose-400 hover:shadow-[0_12px_32px_-4px_rgba(244,63,94,0.25),0_0_18px_rgba(244,63,94,0.2)]';
      default: 
        return 'border-slate-200';
    }
  };

  const getStatusStripe = (status) => {
    switch (status) {
      case 'Available': 
        return 'absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.85)]';
      case 'Occupied': 
        return 'absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-600 shadow-[0_0_10px_rgba(6,182,212,0.85)]';
      case 'Dirty': 
        return 'absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.85)]';
      case 'Maintenance': 
        return 'absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-pink-400 to-red-600 shadow-[0_0_10px_rgba(244,63,94,0.85)]';
      default: 
        return 'absolute top-0 left-0 right-0 h-1 bg-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title & Actions Header */}
      <div className="module-header-blue flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white font-display">Live Room Rack PMS</h2>
            <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              Front Desk Portal
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Real-time room occupancy matrix, digital check-in/check-out, and housekeeping task assignment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-md">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Statuses ({rooms.length})</option>
              <option value="Available" className="bg-slate-900 text-white">Available ({rooms.filter(r => r.status === 'Available').length})</option>
              <option value="Occupied" className="bg-slate-900 text-white">Occupied ({rooms.filter(r => r.status === 'Occupied').length})</option>
              <option value="Dirty" className="bg-slate-900 text-white">Dirty ({rooms.filter(r => r.status === 'Dirty').length})</option>
              <option value="Maintenance" className="bg-slate-900 text-white">Maintenance ({rooms.filter(r => r.status === 'Maintenance').length})</option>
            </select>
          </div>

          <button
            onClick={() => setShowNewBookingModal(true)}
            className="btn-primary text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            New Reservation
          </button>
        </div>
      </div>

      {/* Central Reservations & Group Blocks Strip (Section 3A Requirements) */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0d152a]/95 to-slate-900/90 border border-cyan-500/25 flex flex-wrap items-center justify-between gap-4 text-xs shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)] shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">Central Reservations &amp; Group Blocks</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                Live Inventory Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Cross-property group blocks, corporate negotiated rates, contactless keys, and no-show recovery.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Group Block: <strong className="text-white">Biotech Summit (42 Rms)</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>Corporate Rate: <strong className="text-amber-300">Tier 1 (-15%)</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>VIP Waitlist: <strong className="text-emerald-300">3 Queued</strong></span>
          </div>
        </div>
      </div>

      {/* Quick Status KPI HUD Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            filterStatus === 'ALL'
              ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/30'
              : 'bg-slate-900/90 hover:bg-slate-850 text-slate-300 border-slate-800 shadow-sm'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">Total Rooms</div>
          <div className="text-xl font-black mt-0.5">{rooms.length}</div>
        </button>

        <button
          onClick={() => setFilterStatus('Available')}
          className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
            filterStatus === 'Available'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
              : 'bg-emerald-950/50 hover:bg-emerald-950/80 text-emerald-300 border-emerald-500/30 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Available</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
            </span>
          </div>
          <div className="text-xl font-black mt-0.5">{rooms.filter(r => r.status === 'Available').length}</div>
        </button>

        <button
          onClick={() => setFilterStatus('Occupied')}
          className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
            filterStatus === 'Occupied'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
              : 'bg-blue-950/50 hover:bg-blue-950/80 text-cyan-300 border-cyan-500/30 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Occupied</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 shadow-[0_0_6px_#06b6d4]"></span>
            </span>
          </div>
          <div className="text-xl font-black mt-0.5">{rooms.filter(r => r.status === 'Occupied').length}</div>
        </button>

        <button
          onClick={() => setFilterStatus('Dirty')}
          className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
            filterStatus === 'Dirty'
              ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30'
              : 'bg-amber-950/50 hover:bg-amber-950/80 text-amber-300 border-amber-500/30 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Needs Turn</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_6px_#f59e0b]"></span>
            </span>
          </div>
          <div className="text-xl font-black mt-0.5">{rooms.filter(r => r.status === 'Dirty').length}</div>
        </button>

        <button
          onClick={() => setFilterStatus('Maintenance')}
          className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
            filterStatus === 'Maintenance'
              ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
              : 'bg-rose-950/50 hover:bg-rose-950/80 text-rose-300 border-rose-500/30 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Maintenance</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_6px_#f43f5e]"></span>
            </span>
          </div>
          <div className="text-xl font-black mt-0.5">{rooms.filter(r => r.status === 'Maintenance').length}</div>
        </button>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            id={`room-card-${room.room_number}`}
            onClick={() => handleOpenRoomModal(room)}
            className={`glass-card card-clickable p-4 pt-5 rounded-2xl border ${getCardClass(room.status)} group flex flex-col justify-between space-y-3 relative overflow-hidden transition-all duration-300`}
          >
            {/* Top Neon Stripe */}
            <div className={getStatusStripe(room.status)} />

            {/* Top Bar: Room Number & Status Badge */}
            <div className="flex items-start justify-between gap-2 pt-1">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Floor {room.floor}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm">
                    ROOM
                  </span>
                  <h3 className="text-2xl font-black text-white font-display tracking-tight group-hover:text-cyan-400 transition-colors">
                    {room.room_number}
                  </h3>
                </div>
              </div>
              <div className="shrink-0">{getStatusBadge(room.status)}</div>
            </div>

            {/* Room Specs & Guest Info */}
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate">{room.room_type}</span>
              </div>

              {room.current_guest_name ? (
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] text-xs flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 text-white flex items-center justify-center font-black text-[11px] shadow-[0_0_8px_rgba(6,182,212,0.4)] shrink-0">
                    {room.current_guest_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider leading-none mb-0.5">Current Guest</div>
                    <div className="font-bold text-white truncate text-[11px]">{room.current_guest_name}</div>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-500 flex items-center justify-center font-medium text-xs shrink-0">
                    -
                  </div>
                  <div className="text-[11px] text-slate-400 italic">No guest checked in</div>
                </div>
              )}
            </div>

            {/* Bottom Bar: Price & Action */}
            <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold leading-none mb-0.5">Rate</span>
                <span className="font-black text-sm text-emerald-400 tracking-tight">
                  {formatCurrency(room.base_price, currency)}
                  <span className="text-[10px] font-normal text-slate-500">/nt</span>
                </span>
              </div>
              <span className="text-[11px] font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 group-hover:translate-x-1 transition-all">
                Manage <span>&rarr;</span>
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* --- Cloud PMS Suite Inspector Modal (Full Alignment with Section 3A) --- */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#090D1E] border border-cyan-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-[0_0_60px_rgba(0,0,0,0.9)] relative text-white max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedRoom(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-display">
                    Suite {selectedRoom.room_number} Operations
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedRoom.room_type} &bull; Floor {selectedRoom.floor} &bull; {formatCurrency(selectedRoom.base_price, currency)}/night
                  </p>
                </div>
              </div>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setRoomModalTab('STATUS')}
                className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  roomModalTab === 'STATUS'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Front Desk</span>
              </button>

              <button
                type="button"
                onClick={() => setRoomModalTab('DIGITAL_KEY')}
                className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  roomModalTab === 'DIGITAL_KEY'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Digital Key</span>
              </button>

              <button
                type="button"
                onClick={() => setRoomModalTab('PREFERENCES')}
                className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  roomModalTab === 'PREFERENCES'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Guest Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setRoomModalTab('HOUSEKEEPING')}
                className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  roomModalTab === 'HOUSEKEEPING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Housekeeping</span>
              </button>

              <button
                type="button"
                onClick={() => setRoomModalTab('FOLIO')}
                className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  roomModalTab === 'FOLIO'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Folio &amp; Invoice</span>
              </button>
            </div>

            {/* TAB 1: FRONT DESK & OCCUPANCY STATUS */}
            {roomModalTab === 'STATUS' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetStatus('Occupied');
                      if (!modalGuestName) setModalGuestName('Walk-In VIP Guest');
                      setDigitalKeyGenerated(true);
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      targetStatus === 'Occupied'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-md shadow-cyan-500/30'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-cyan-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-cyan-300" />
                    Contactless Check-In
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetStatus('Dirty');
                      setModalGuestName('');
                      setModalNote('Guest checked out · Housekeeping required');
                      setDigitalKeyGenerated(false);
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      targetStatus === 'Dirty'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-md shadow-amber-500/30'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-amber-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <UserMinus className="w-4 h-4 text-amber-300" />
                    Contactless Check-Out
                  </button>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Room Operational Status
                    </label>
                    <select
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 cursor-pointer"
                    >
                      <option value="Available">Available (Clean &amp; Sealed)</option>
                      <option value="Occupied">Occupied (Guest Checked In)</option>
                      <option value="Dirty">Dirty (Housekeeping Turnaround Required)</option>
                      <option value="Maintenance">Maintenance (Out of Order)</option>
                    </select>
                  </div>

                  {(targetStatus === 'Occupied' || selectedRoom.current_guest_name) && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Registered Guest Full Name
                      </label>
                      <input
                        type="text"
                        value={modalGuestName}
                        onChange={(e) => setModalGuestName(e.target.value)}
                        placeholder="Enter guest full name..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Housekeeping &amp; Front Desk Operational Note
                    </label>
                    <textarea
                      value={modalNote}
                      onChange={(e) => setModalNote(e.target.value)}
                      placeholder="Add operational notes, VIP amenities, or special housekeeping requests..."
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DIGITAL KEYS & CONTACTLESS PASS */}
            {roomModalTab === 'DIGITAL_KEY' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-[#0d1629] to-slate-950 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Contactless Digital Key (IoT Door Lock)</h4>
                        <p className="text-[10px] text-slate-400">Assa Abloy / VingCard Bluetooth BLE &amp; Apple Wallet Pass</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      digitalKeyGenerated ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {digitalKeyGenerated ? 'Key Active' : 'Key Unissued'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Encrypted Keycode</span>
                      <strong className="font-mono text-cyan-300 text-sm">{digitalKeyCode}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Lock Permission</span>
                      <strong className="text-emerald-400 text-xs">Suite {selectedRoom.room_number} + VIP Club Lounge</strong>
                    </div>
                  </div>

                  {digitalKeySent && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Digital Key pass dispatched via SMS and WhatsApp to guest device.</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setDigitalKeySent(true)}
                      className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-600/30"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch via SMS/WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => alert(`Apple/Google Wallet pass URL generated for Suite ${selectedRoom.room_number}: https://wallet.travai.resort/pass/${digitalKeyCode}`)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Wallet Pass</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: VIP GUEST PROFILE & PREFERENCES */}
            {roomModalTab === 'PREFERENCES' && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-purple-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                      {selectedRoom.current_guest_name?.charAt(0) || 'G'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{selectedRoom.current_guest_name || 'VIP Resort Guest'}</h4>
                      <p className="text-[10px] text-purple-300 font-semibold">{vipTier} &bull; 64,800 Loyalty Points</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40">
                    Tier 1 VIP
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Climate Target</span>
                    <span className="text-cyan-300 font-bold mt-0.5 block">{guestPrefTemp}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Pillow Menu</span>
                    <span className="text-slate-200 font-semibold mt-0.5 block truncate">{guestPrefPillow}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Dietary &amp; Bar</span>
                    <span className="text-slate-200 font-semibold mt-0.5 block truncate">{guestPrefDiet}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Checkout Preference</span>
                    <span className="text-emerald-300 font-semibold mt-0.5 block">{guestPrefLateCheckout}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Pre-Arrival Notes</span>
                  <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                    Guest requested high-floor corner suite far from elevators; organic chamomile tea and San Pellegrino mineral water pre-stocked.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: HOUSEKEEPING & INSPECTION */}
            {roomModalTab === 'HOUSEKEEPING' && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs">
                  <div>
                    <span className="font-bold text-amber-300 block">Housekeeping Readiness Status</span>
                    <span className="text-[11px] text-slate-400">{assignedSteward}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    100% Inspected &amp; Sealed
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs">
                    <span className="text-slate-200">Egyptian Cotton Bed Linens &amp; Plush Towels Replaced</span>
                    <input
                      type="checkbox"
                      checked={inspectionLinen}
                      onChange={(e) => setInspectionLinen(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs">
                    <span className="text-slate-200">Smart HVAC Calibrated to Guest Target (20.5°C)</span>
                    <input
                      type="checkbox"
                      checked={inspectionHvac}
                      onChange={(e) => setInspectionHvac(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs">
                    <span className="text-slate-200">Artisan Minibar Restocked &amp; Nespresso Pods Refilled</span>
                    <input
                      type="checkbox"
                      checked={inspectionMinibar}
                      onChange={(e) => setInspectionMinibar(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs">
                    <span className="text-slate-200">High-Touch Sanitization Completed &amp; Door Sealed</span>
                    <input
                      type="checkbox"
                      checked={inspectionSanitized}
                      onChange={(e) => setInspectionSanitized(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 5: FOLIO, TAXES & MULTI-CURRENCY INVOICE */}
            {roomModalTab === 'FOLIO' && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-white">Itemized Guest Folio &amp; Ledger</span>
                    <span className="font-mono text-cyan-300 text-[11px]">Folio FOL-8842-RESORT</span>
                  </div>

                  <div className="space-y-1.5 text-slate-300 text-[11px]">
                    <div className="flex justify-between">
                      <span>Room Nights (3 Nights @ {formatCurrency(selectedRoom.base_price, currency)}):</span>
                      <strong className="text-white">{formatCurrency(selectedRoom.base_price * 3, currency)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>In-Room Dining (Artisan Truffle Risotto &amp; Wine):</span>
                      <strong className="text-white">{formatCurrency(148, currency)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Resort Wellness &amp; Spa Surcharge:</span>
                      <strong className="text-white">{formatCurrency(75, currency)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>State Occupancy VAT &amp; Tourism Surcharge (12%):</span>
                      <span>{formatCurrency((selectedRoom.base_price * 3 + 223) * 0.12, currency)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-200">Total Settled Balance:</span>
                    <span className="text-emerald-400 text-base font-black">
                      {formatCurrency((selectedRoom.base_price * 3 + 223) * 1.12, currency)}
                    </span>
                  </div>
                </div>

                {refundNotice && (
                  <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs">
                    {refundNotice}
                  </div>
                )}

                {folioDownloaded && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs">
                    Itemized PDF folio invoice generated and downloaded.
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setFolioDownloaded(true)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download Invoice (PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRefundNotice('Partial deposit refund of $150.00 processed to original payment gateway.')}
                    className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Issue Refund
                  </button>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Nexgile 5-Star Cloud PMS Engine</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSaveRoomStatus}
                  className="btn-primary text-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Update Room State'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- New Booking Creation Modal --- */}
      {showNewBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <form onSubmit={handleCreateBooking} className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl shadow-cyan-500/10 relative text-white">
            <button
              type="button"
              onClick={() => setShowNewBookingModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white font-display">Create Walk-In Reservation</h3>
              <p className="text-xs text-slate-400 mt-1">Generates unique PNR code and updates room inventory</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Guest Name</label>
                <input
                  type="text"
                  required
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="e.g. Samantha Miller"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Guest Email</label>
                <input
                  type="email"
                  required
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                  placeholder="samantha.miller@example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Room Type</label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30"
                >
                  <option value="Executive Suite" className="bg-slate-900">Executive Suite ({formatCurrency(450, currency)}/night)</option>
                  <option value="Deluxe King" className="bg-slate-900">Deluxe King ({formatCurrency(280, currency)}/night)</option>
                  <option value="Studio Suite" className="bg-slate-900">Studio Suite ({formatCurrency(340, currency)}/night)</option>
                  <option value="Presidential Suite" className="bg-slate-900">Presidential Suite ({formatCurrency(1200, currency)}/night)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Check-In Date</label>
                  <input
                    type="date"
                    required
                    value={newCheckIn}
                    onChange={(e) => setNewCheckIn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Check-Out Date</label>
                  <input
                    type="date"
                    required
                    value={newCheckOut}
                    onChange={(e) => setNewCheckOut(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <CreditCard className="w-4 h-4" /> Payment Gateway
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-cyan-400">Test mode</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold">
                    <option className="bg-slate-900">Razorpay Gateway</option>
                    <option className="bg-slate-900">Card</option>
                    <option className="bg-slate-900">UPI</option>
                    <option className="bg-slate-900">Net Banking</option>
                  </select>
                  {paymentMethod === 'Card' ? (
                    <input type="text" inputMode="numeric" maxLength={4} pattern="[0-9]{4}" required value={cardLast4} onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))} placeholder="Last 4 digits" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
                  ) : (
                    <div className="flex items-center text-[11px] text-cyan-300 font-semibold">
                      {paymentMethod === 'Razorpay Gateway' ? 'Razorpay Secure Checkout (rzp_test_U3zTfszdEAEPYo)' : 'Gateway authorization enabled'}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">Amount will be authorized in INR after the reservation is created.</p>
                {paymentStatus && <p className="text-xs font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 rounded-lg px-3 py-2">{paymentStatus}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewBookingModal(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary text-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create PNR & Book'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
