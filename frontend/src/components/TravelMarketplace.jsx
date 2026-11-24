import React, { useState, useEffect } from 'react';
import {
  Plane,
  Car,
  Compass,
  Package,
  Sparkles,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  Mail,
  X,
  ArrowRight,
  Filter,
  Star,
  Tag,
  Clock,
  Ticket,
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';

const CATEGORIES = [
  { id: 'ALL', label: 'All Products', icon: Sparkles },
  { id: 'Flight', label: 'Flights', icon: Plane },
  { id: 'Car Rental', label: 'Car Rentals', icon: Car },
  { id: 'Activity', label: 'Tours & Activities', icon: Compass },
  { id: 'Transfer', label: 'Airport Transfers', icon: Clock },
  { id: 'Dynamic Package', label: 'Dynamic Packages', icon: Package },
];

export const TravelMarketplace = ({ currency = 'USD', user }) => {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Cart & Checkout state
  const [selectedItem, setSelectedItem] = useState(null);
  const [travelerName, setTravelerName] = useState(user?.full_name || 'Alexander Wright');
  const [travelerEmail, setTravelerEmail] = useState(user?.email || 'a.wright@techcorp.io');
  const [bookingDate, setBookingDate] = useState('2026-09-15');
  const [quantity, setQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card (Visa/Mastercard)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMarketplaceItems(selectedCategory);
      setItems(data);
    } catch (err) {
      console.error('Failed to load marketplace items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'VIP20' || promoCode.trim().toUpperCase() === 'TRAVAI20') {
      setDiscountPct(20);
      alert('Promo Code Applied: 20% Discount Activated!');
    } else if (promoCode.trim().toUpperCase() === 'NEXGILE10') {
      setDiscountPct(10);
      alert('Promo Code Applied: 10% Discount Activated!');
    } else {
      alert('Invalid promo code. Try VIP20 or NEXGILE10');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      const res = await api.bookMarketplaceItem({
        item_id: selectedItem.id,
        traveler_name: travelerName,
        traveler_email: travelerEmail,
        quantity: Number(quantity),
        booking_date: bookingDate,
        special_requests: `Payment processed via ${paymentMethod}. Discount: ${discountPct}%`,
      });
      setConfirmedBooking(res);
      setSelectedItem(null);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Failed to complete booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.provider.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <section className="module-header module-header-indigo flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Booking Marketplace</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Multi-Modal Global Travel
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 font-display">
            Travel Marketplace &amp; Dynamic Packages
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Search, compare, and bundle accommodations, flights, luxury electric vehicles, private yachts, airport transfers, and dynamic experiences into one unified itinerary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white border border-indigo-200 text-xs text-indigo-900 font-semibold shadow-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Best Rate &amp; Instant PNR Guaranteed</span>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-200 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 font-display">Booking Confirmed!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your instant travel voucher and itinerary receipt have been generated.
            </p>

            <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Unique PNR:</span>
                <strong className="text-indigo-600 font-mono text-sm">{confirmedBooking.pnr}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Voucher Code:</span>
                <strong className="text-emerald-700 font-mono">{confirmedBooking.voucher_code}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Item:</span>
                <strong className="text-slate-900">{confirmedBooking.item_title}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Guest:</span>
                <strong className="text-slate-900">{confirmedBooking.traveler_name}</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-600 font-semibold">Total Paid:</span>
                <strong className="text-emerald-600 font-bold text-sm">
                  {formatCurrency(confirmedBooking.total_amount, currency)}
                </strong>
              </div>
            </div>

            <button
              onClick={() => setConfirmedBooking(null)}
              className="btn-primary w-full py-2.5 text-xs font-bold"
            >
              Done &amp; Return to Marketplace
            </button>
          </div>
        </div>
      )}

      {/* Categories Bar & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                selectedCategory === id
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search flights, cars, tours..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl"
          >
            <div>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {item.category}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {item.rating}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <span>Provider:</span>
                  <strong className="text-slate-700">{item.provider}</strong>
                </p>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                <div className="pt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {item.policy}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">From</p>
                <p className="text-base font-black text-slate-900 font-display">
                  {formatCurrency(item.price, currency)}
                </p>
              </div>

              <button
                onClick={() => setSelectedItem(item)}
                className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
              >
                <span>Book Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Drawer / Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-indigo-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">
                {selectedItem.category}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{selectedItem.provider}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-display">{selectedItem.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{selectedItem.location}</p>

            <form onSubmit={handleCheckout} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Traveler Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={travelerName}
                      onChange={(e) => setTravelerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirmation Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={travelerEmail}
                      onChange={(e) => setTravelerEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service / Travel Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity / Guests</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Promo code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Promo Code / Member Voucher</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter VIP20 or NEXGILE10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Payment Methods (50+ supported) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Razorpay Payment Gateway (Cards/UPI/Netbanking)">Razorpay Payment Gateway (Cards / UPI / Netbanking)</option>
                  <option value="Credit Card (Visa/Mastercard/Amex)">Credit Card (Visa / Mastercard / Amex)</option>
                  <option value="UPI Instant (Google Pay/PhonePe)">UPI Instant Pay (Google Pay / PhonePe)</option>
                  <option value="Apple Pay / Google Wallet">Apple Pay / Google Wallet</option>
                  <option value="Direct Corporate Billing (Net-30)">Direct Corporate Billing (Net-30)</option>
                  <option value="Nexgile Points Digital Wallet">Nexgile Points Digital Wallet</option>
                  <option value="Crypto (USDC / Bitcoin)">Crypto (USDC / Bitcoin Lightning)</option>
                </select>
              </div>

              {/* Price Breakdown */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({quantity}x):</span>
                  <span>{formatCurrency(selectedItem.price * quantity, currency)}</span>
                </div>
                {discountPct > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({discountPct}%):</span>
                    <span>-{formatCurrency((selectedItem.price * quantity * discountPct) / 100, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Taxes &amp; Port Fees (8.5%):</span>
                  <span>{formatCurrency(selectedItem.price * quantity * 0.085, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-indigo-200">
                  <span>Final Total:</span>
                  <span className="text-indigo-700 font-display">
                    {formatCurrency(
                      selectedItem.price * quantity * (1 - discountPct / 100) * 1.085,
                      currency
                    )}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                {isSubmitting ? 'Confirming with Supplier...' : 'Complete Reservation & Issue Voucher'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
