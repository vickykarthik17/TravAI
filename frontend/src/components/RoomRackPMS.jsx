import React, { useState } from 'react';
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
  CreditCard
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';

export const RoomRackPMS = ({ rooms, onRoomsUpdated, currency = 'USD' }) => {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Modal Form State
  const [modalGuestName, setModalGuestName] = useState('');
  const [modalNote, setModalNote] = useState('');
  const [targetStatus, setTargetStatus] = useState('Available');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Booking State
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newRoomType, setNewRoomType] = useState('Executive Suite');
  const [newCheckIn, setNewCheckIn] = useState('2026-09-08');
  const [newCheckOut, setNewCheckOut] = useState('2026-09-11');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [cardLast4, setCardLast4] = useState('4242');
  const [paymentStatus, setPaymentStatus] = useState('');

  const filteredRooms = rooms.filter(room => {
    if (filterStatus === 'ALL') return true;
    return room.status === filterStatus;
  });

  const handleOpenRoomModal = (room) => {
    setSelectedRoom(room);
    setModalGuestName(room.current_guest_name || '');
    setModalNote(room.housekeeping_note || '');
    setTargetStatus(room.status);
  };

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
            <h2 className="text-xl font-bold text-slate-900 font-display">Live Room Rack PMS</h2>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-500/20 text-blue-700 border border-blue-500/30">
              Front Desk Portal
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time room occupancy matrix, digital check-in/check-out, and housekeeping task assignment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses ({rooms.length})</option>
              <option value="Available">Available ({rooms.filter(r => r.status === 'Available').length})</option>
              <option value="Occupied">Occupied ({rooms.filter(r => r.status === 'Occupied').length})</option>
              <option value="Dirty">Dirty ({rooms.filter(r => r.status === 'Dirty').length})</option>
              <option value="Maintenance">Maintenance ({rooms.filter(r => r.status === 'Maintenance').length})</option>
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

      {/* Quick Status KPI HUD Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            filterStatus === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20'
              : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">Total Rooms</div>
          <div className="text-xl font-black mt-0.5">{rooms.length}</div>
        </button>

        <button
          onClick={() => setFilterStatus('Available')}
          className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
            filterStatus === 'Available'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30'
              : 'bg-emerald-50/70 hover:bg-emerald-50 text-emerald-900 border-emerald-200 hover:border-emerald-300 shadow-sm'
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
              : 'bg-blue-50/70 hover:bg-blue-50 text-blue-900 border-blue-200 hover:border-cyan-300 shadow-sm'
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
              ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30'
              : 'bg-amber-50/70 hover:bg-amber-50 text-amber-900 border-amber-200 hover:border-amber-300 shadow-sm'
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
              ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/30'
              : 'bg-rose-50/70 hover:bg-rose-50 text-rose-900 border-rose-200 hover:border-rose-300 shadow-sm'
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
                  <span className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded bg-slate-900 text-white shadow-sm">
                    ROOM
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 font-display tracking-tight group-hover:text-blue-600 transition-colors">
                    {room.room_number}
                  </h3>
                </div>
              </div>
              <div className="shrink-0">{getStatusBadge(room.status)}</div>
            </div>

            {/* Room Specs & Guest Info */}
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-blue-600" />
                <span className="truncate">{room.room_type}</span>
              </div>

              {room.current_guest_name ? (
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50/90 to-cyan-50/90 border border-blue-200/80 shadow-[0_0_12px_rgba(6,182,212,0.12)] text-xs flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center font-black text-[11px] shadow-[0_0_8px_rgba(6,182,212,0.4)] shrink-0">
                    {room.current_guest_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] text-blue-500 font-bold uppercase tracking-wider leading-none mb-0.5">Current Guest</div>
                    <div className="font-bold text-slate-800 truncate text-[11px]">{room.current_guest_name}</div>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs text-slate-400 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-200/70 text-slate-400 flex items-center justify-center font-medium text-xs shrink-0">
                    —
                  </div>
                  <div className="text-[11px] text-slate-400 italic">No guest checked in</div>
                </div>
              )}
            </div>

            {/* Bottom Bar: Price & Action */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold leading-none mb-0.5">Rate</span>
                <span className="font-black text-sm text-emerald-700 tracking-tight">
                  {formatCurrency(room.base_price, currency)}
                  <span className="text-[10px] font-normal text-slate-400">/nt</span>
                </span>
              </div>
              <span className="text-[11px] font-bold text-blue-600 group-hover:text-cyan-600 flex items-center gap-1 group-hover:translate-x-1 transition-all">
                Manage <span>&rarr;</span>
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* --- Check-In / Check-Out & Status Toggle Modal --- */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-blue-100 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl shadow-blue-500/10 relative">
            
            <button
              onClick={() => setSelectedRoom(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  Manage Room {selectedRoom.room_number}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {selectedRoom.room_type} &bull; Floor {selectedRoom.floor} &bull; {formatCurrency(selectedRoom.base_price, currency)}/night
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTargetStatus('Occupied');
                  if (!modalGuestName) setModalGuestName('Walk-In Guest');
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  targetStatus === 'Occupied'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                <UserCheck className="w-4 h-4 text-blue-700" />
                Check-In Guest
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetStatus('Dirty');
                  setModalGuestName('');
                  setModalNote('Guest checked out - Housekeeping required');
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  targetStatus === 'Dirty'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 shadow-md shadow-amber-500/30'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:bg-amber-50 hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                <UserMinus className="w-4 h-4 text-amber-700" />
                Check-Out Guest
              </button>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-200">
              {/* Select Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Room Operational Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                >
                  <option value="Available">Available (Clean & Ready)</option>
                  <option value="Occupied">Occupied (Guest Checked In)</option>
                  <option value="Dirty">Dirty (Housekeeping Needed)</option>
                  <option value="Maintenance">Maintenance (Out of Order)</option>
                </select>
              </div>

              {/* Guest Name Input */}
              {(targetStatus === 'Occupied' || selectedRoom.current_guest_name) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Guest Full Name
                  </label>
                  <input
                    type="text"
                    value={modalGuestName}
                    onChange={(e) => setModalGuestName(e.target.value)}
                    placeholder="Enter guest name..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                </div>
              )}

              {/* Housekeeping Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Housekeeping & Operational Note
                </label>
                <textarea
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  placeholder="Add notes for housekeeping or front desk staff..."
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="btn-ghost"
              >
                Cancel
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
      )}

      {/* --- New Booking Creation Modal --- */}
      {showNewBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleCreateBooking} className="bg-white border border-blue-100 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl shadow-blue-500/10 relative">
            <button
              type="button"
              onClick={() => setShowNewBookingModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-slate-900 font-display">Create Walk-In Reservation</h3>
              <p className="text-xs text-slate-400 mt-1">Generates unique PNR code and updates room inventory</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Guest Name</label>
                <input
                  type="text"
                  required
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="e.g. Samantha Miller"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Guest Email</label>
                <input
                  type="email"
                  required
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                  placeholder="samantha.miller@example.com"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Room Type</label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                >
                  <option value="Executive Suite">Executive Suite ({formatCurrency(450, currency)}/night)</option>
                  <option value="Deluxe King">Deluxe King ({formatCurrency(280, currency)}/night)</option>
                  <option value="Studio Suite">Studio Suite ({formatCurrency(340, currency)}/night)</option>
                  <option value="Presidential Suite">Presidential Suite ({formatCurrency(1200, currency)}/night)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Check-In Date</label>
                  <input
                    type="date"
                    required
                    value={newCheckIn}
                    onChange={(e) => setNewCheckIn(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Check-Out Date</label>
                  <input
                    type="date"
                    required
                    value={newCheckOut}
                    onChange={(e) => setNewCheckOut(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-800">
                  <CreditCard className="w-4 h-4" /> Payment Gateway
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-cyan-600">Test mode</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full bg-white border border-cyan-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold">
                    <option>Razorpay Gateway</option>
                    <option>Card</option>
                    <option>UPI</option>
                    <option>Net Banking</option>
                  </select>
                  {paymentMethod === 'Card' ? (
                    <input type="text" inputMode="numeric" maxLength={4} pattern="[0-9]{4}" required value={cardLast4} onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))} placeholder="Last 4 digits" className="w-full bg-white border border-cyan-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                  ) : (
                    <div className="flex items-center text-[11px] text-cyan-700 font-semibold">
                      {paymentMethod === 'Razorpay Gateway' ? 'Razorpay Secure Checkout (rzp_test_U3zTfszdEAEPYo)' : 'Gateway authorization enabled'}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-cyan-700">Amount will be authorized in INR after the reservation is created.</p>
                {paymentStatus && <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{paymentStatus}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
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
