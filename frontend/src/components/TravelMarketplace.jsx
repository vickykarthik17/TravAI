import React, { useState } from 'react';
import {
  Compass,
  Plane,
  Car,
  Ship,
  Sparkles,
  Search,
  Star,
  CheckCircle2,
  Calendar,
  CreditCard,
  X,
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const CATEGORIES = [
  { id: 'ALL', label: 'All Inventory', icon: Compass },
  { id: 'FLIGHT', label: 'Flights & Jets', icon: Plane },
  { id: 'TRANSFER', label: 'Luxury EV / Yacht', icon: Car },
  { id: 'ACTIVITY', label: 'Curated Tours', icon: Sparkles },
  { id: 'WELLNESS', label: 'Spa & Wellness', icon: Ship },
];

const MARKETPLACE_ITEMS = [
  {
    id: 1,
    category: 'FLIGHT',
    title: 'Non-stop Private Jet Shuttle (SFO to LAX)',
    provider: 'SurfAir Luxury Aviation',
    price: 340.0,
    rating: 4.9,
    description: 'Bypass TSA lines with private executive terminal departures and luxury lounge access.',
    location: 'San Francisco to Los Angeles',
    policy: 'Flexible Rebooking · Zero Change Fees',
  },
  {
    id: 2,
    category: 'TRANSFER',
    title: 'Porsche Taycan Electric Chauffeur Airport Transfer',
    provider: 'Blacklane Global Fleet',
    price: 95.0,
    rating: 4.8,
    description: 'Zero-emission executive pickup with complimentary in-vehicle Wi-Fi and chilled refreshments.',
    location: 'SFO International to Downtown',
    policy: 'Free Cancellation up to 2 hours prior',
  },
  {
    id: 3,
    category: 'ACTIVITY',
    title: 'Private Napa Valley Vineyard Heli-Tour & Tasting',
    provider: 'Apex Wine Country Flights',
    price: 280.0,
    rating: 5.0,
    description: 'Helicopter transfer from resort pad directly to private biodynamic estate cellar.',
    location: 'Napa & Sonoma Valleys',
    policy: 'Certified Master Sommelier Guided',
  },
  {
    id: 4,
    category: 'TRANSFER',
    title: 'Bay Sunset Private Yacht Charter (43ft Catamaran)',
    provider: 'Pacific Wind Charters',
    price: 450.0,
    rating: 4.9,
    description: 'Golden Gate Bridge cruise with private chef tapas, acoustic music, and champagne service.',
    location: 'San Francisco Bay Marina',
    policy: 'Full Captain & Steward Crew Included',
  },
  {
    id: 5,
    category: 'WELLNESS',
    title: 'Alpine Thermal Bath & Cryotherapy Rejuvenation',
    provider: 'Grand Lotus Spa & Wellness',
    price: 130.0,
    rating: 4.7,
    description: 'Complete 90-minute circuit including Swedish massage, dry sauna, and cold plunge immersion.',
    location: 'Resort Level 3 Wellness Wing',
    policy: 'Complimentary Robe & Organic Tea Service',
  },
  {
    id: 6,
    category: 'FLIGHT',
    title: 'Scenic Seaplane Coastal Tour over Marin Headlands',
    provider: 'Bay Area Seaplanes',
    price: 195.0,
    rating: 4.8,
    description: 'Water takeoff from Sausalito with aerial perspectives of Alcatraz, Angel Island, and cliffs.',
    location: 'Sausalito Seaplane Base',
    policy: 'Audio Headsets & Flight Certification Included',
  },
];

export const TravelMarketplace = ({ currency = 'USD' }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Checkout Modal State
  const [travelerName, setTravelerName] = useState('Portal Administrator');
  const [travelerEmail, setTravelerEmail] = useState('admin@grandresort.com');
  const [bookingDate, setBookingDate] = useState('2026-09-12');
  const [quantity, setQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay Payment Gateway (Cards/UPI/Netbanking)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredItems = MARKETPLACE_ITEMS.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'VIP20') {
      setDiscountPct(20);
      alert('20% VIP Member discount applied successfully!');
    } else if (promoCode.toUpperCase() === 'NEXGILE10') {
      setDiscountPct(10);
      alert('10% corporate traveler discount applied!');
    } else {
      alert('Invalid promo code. Try VIP20 or NEXGILE10.');
    }
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const subtotal = selectedItem.price * quantity;
      const total = subtotal * (1 - discountPct / 100) * 1.085; // + 8.5% taxes/fees

      setConfirmedBooking({
        pnr: 'TRV-' + Math.floor(100000 + Math.random() * 900000),
        voucher_code: 'VCH-' + Math.floor(1000 + Math.random() * 9000),
        item_title: selectedItem.title,
        traveler_name: travelerName,
        total_amount: total,
      });

      setIsSubmitting(false);
      setSelectedItem(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">Booking Marketplace</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Multi-Modal Global Travel
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-white font-display">
            Travel Marketplace &amp; Dynamic Packages
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Search, compare, and bundle accommodations, flights, luxury electric vehicles, private yachts, airport transfers, and dynamic experiences into one unified itinerary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-semibold shadow-lg flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Best Rate &amp; Instant PNR Guaranteed</span>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B1021] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_60px_rgba(0,0,0,0.9)] border border-emerald-500/40 text-center relative overflow-hidden text-white">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white font-display">Booking Confirmed!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your instant travel voucher and itinerary receipt have been generated.
            </p>

            <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Unique PNR:</span>
                <strong className="text-cyan-400 font-mono text-sm">{confirmedBooking.pnr}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Voucher Code:</span>
                <strong className="text-emerald-400 font-mono">{confirmedBooking.voucher_code}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Item:</span>
                <strong className="text-white">{confirmedBooking.item_title}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Guest:</span>
                <strong className="text-white">{confirmedBooking.traveler_name}</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-300 font-semibold">Total Paid:</span>
                <strong className="text-emerald-400 font-bold text-sm">
                  {formatCurrency(confirmedBooking.total_amount, currency)}
                </strong>
              </div>
            </div>

            <button
              onClick={() => setConfirmedBooking(null)}
              className="w-full py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
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
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950/70 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
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
            className="w-full px-3.5 py-2 rounded-xl border border-slate-800 text-xs bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-sm"
          />
        </div>
      </div>

      {/* Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-0 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-2xl overflow-hidden hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col justify-between transition-all duration-300"
          >
            <div>
              <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950 text-cyan-400 border border-cyan-800/40">
                  {item.category}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {item.rating}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="text-sm font-bold text-white line-clamp-1">{item.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <span>Provider:</span>
                  <strong className="text-slate-200">{item.provider}</strong>
                </p>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                <div className="pt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {item.policy}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">From</p>
                <p className="text-base font-black text-white font-display">
                  {formatCurrency(item.price, currency)}
                </p>
              </div>

              <button
                onClick={() => setSelectedItem(item)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center gap-1.5 cursor-pointer transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B1021] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_60px_rgba(0,0,0,0.9)] border border-cyan-500/40 relative max-h-[90vh] overflow-y-auto text-white">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-950 text-cyan-400 border border-cyan-800/40">
                {selectedItem.category}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{selectedItem.provider}</span>
            </div>
            <h3 className="text-xl font-bold text-white font-display">{selectedItem.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{selectedItem.location}</p>

            <form onSubmit={handleCheckout} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Traveler Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={travelerName}
                      onChange={(e) => setTravelerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmation Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={travelerEmail}
                      onChange={(e) => setTravelerEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Service / Travel Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity / Guests</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Promo code */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Promo Code / Member Voucher</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter VIP20 or NEXGILE10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-cyan-400 uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
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
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({quantity}x):</span>
                  <span>{formatCurrency(selectedItem.price * quantity, currency)}</span>
                </div>
                {discountPct > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount ({discountPct}%):</span>
                    <span>-{formatCurrency((selectedItem.price * quantity * discountPct) / 100, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Taxes &amp; Port Fees (8.5%):</span>
                  <span>{formatCurrency(selectedItem.price * quantity * 0.085, currency)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                  <span>Final Total:</span>
                  <span className="text-cyan-400 font-display">
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
                className="w-full py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
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
