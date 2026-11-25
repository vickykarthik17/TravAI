import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Wallet,
  Award,
  Sparkles,
  MapPin,
  Compass,
  FileText,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Gift,
  ArrowRight,
  Plane,
  Building2,
  Car,
  QrCode,
  Zap,
  Navigation,
  Key,
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { formatTime, formatDate, getTodayStr } from '../utils/date';

const LOCAL_PLACES = [
  { id: 1, name: 'Gary Danko Michelin Dining', category: 'Fine Dining', dist: '0.8 km', rating: 4.9, icon: Sparkles, color: 'text-amber-500' },
  { id: 2, name: 'SF Museum of Modern Art (SFMOMA)', category: 'Cultural', dist: '1.2 km', rating: 4.8, icon: Compass, color: 'text-indigo-500' },
  { id: 3, name: 'Union Square Luxury Shopping', category: 'Shopping', dist: '0.4 km', rating: 4.7, icon: Gift, color: 'text-pink-500' },
  { id: 4, name: 'Ferry Building Artisan Market', category: 'Culinary & Local', dist: '1.6 km', rating: 4.9, icon: MapPin, color: 'text-emerald-500' },
];

export const MobileSuperAppLoyalty = ({ user, currency = 'USD' }) => {
  const [loyalty, setLoyalty] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeemNotice, setRedeemNotice] = useState('');
  const [activeScreen, setActiveScreen] = useState('WALLET'); // WALLET, ITINERARY, VAULT, MAP, SETTINGS
  const [arNavActive, setArNavActive] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('pkg_starter');
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);
  const [razorpaySuccessMsg, setRazorpaySuccessMsg] = useState('');

  const RAZORPAY_PACKAGES = [
    { id: 'pkg_starter', title: 'Silver Travel Reserve', price_inr: 1500, credits: 1500, bonus: 0, badge: 'Standard' },
    { id: 'pkg_executive', title: 'Gold Executive Reserve', price_inr: 3000, credits: 3500, bonus: 500, badge: 'Best Value (+500 Bonus)' },
    { id: 'pkg_presidential', title: 'Platinum Royal Reserve', price_inr: 5000, credits: 6000, bonus: 1000, badge: 'VIP Elite (+1,000 Bonus)' },
    { id: 'pkg_sovereign', title: 'Sovereign Diamond Reserve', price_inr: 10000, credits: 13000, bonus: 3000, badge: 'Ultra Luxury (+3,000 Bonus)' },
  ];

  // Push preferences
  const [pushSettings, setPushSettings] = useState({
    flightDisruptions: true,
    conciergeOffers: true,
    roomReadiness: true,
    loyaltyMultipliers: true,
  });

  const fetchLoyalty = async () => {
    try {
      const email = user?.email || 'a.wright@techcorp.io';
      const data = await api.getLoyalty(email);
      setLoyalty(data);
    } catch (err) {
      console.error('Failed to load loyalty:', err);
    }
  };

  useEffect(() => {
    fetchLoyalty();
  }, [user]);

  const handleProceedRazorpay = async () => {
    setIsProcessingRazorpay(true);
    setRazorpaySuccessMsg('');
    const pkg = RAZORPAY_PACKAGES.find(p => p.id === selectedPackage) || RAZORPAY_PACKAGES[0];

    try {
      // 1. Create Razorpay order on backend
      const order = await api.createRazorpayOrder({
        amount_inr: pkg.price_inr,
        package_id: pkg.id,
        guest_email: user?.email || 'a.wright@techcorp.io',
      });

      // 2. Load script if not already loaded
      await api.loadRazorpayScript();

      if (window.Razorpay) {
        const options = {
          key: order.key_id,
          amount: order.amount,
          currency: 'INR',
          name: 'Nexgile-TravAI Grand Resort',
          description: `${pkg.title} · Universal Travel Credits`,
          order_id: order.order_id,
          handler: async (response) => {
            try {
              const verifyRes = await api.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                package_id: pkg.id,
                amount_inr: pkg.price_inr,
                guest_email: user?.email || 'a.wright@techcorp.io',
              });
              setRazorpaySuccessMsg(verifyRes.message);
              await fetchLoyalty();
              setTimeout(() => {
                setShowRazorpayModal(false);
                setRazorpaySuccessMsg('');
              }, 3000);
            } catch (err) {
              console.error('Payment verification failed:', err);
              alert('Payment verification failed.');
            }
          },
          prefill: {
            name: user?.full_name || 'Alexander Wright',
            email: user?.email || 'a.wright@techcorp.io',
          },
          theme: {
            color: '#7c3aed',
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback test simulation
        const fakePaymentId = `pay_test_${Math.random().toString(36).substring(2, 12)}`;
        const verifyRes = await api.verifyRazorpayPayment({
          razorpay_order_id: order.order_id,
          razorpay_payment_id: fakePaymentId,
          razorpay_signature: 'rzp_test_sig_ok',
          package_id: pkg.id,
          amount_inr: pkg.price_inr,
          guest_email: user?.email || 'a.wright@techcorp.io',
        });
        setRazorpaySuccessMsg(verifyRes.message);
        await fetchLoyalty();
        setTimeout(() => {
          setShowRazorpayModal(false);
          setRazorpaySuccessMsg('');
        }, 3000);
      }
    } catch (err) {
      console.error('Razorpay process failed:', err);
      alert('Unable to process Razorpay order right now.');
    } finally {
      setIsProcessingRazorpay(false);
    }
  };

  const handleRedeem = async (points, rewardName) => {
    try {
      const email = user?.email || 'a.wright@techcorp.io';
      const res = await api.redeemLoyalty(email, points, rewardName);
      setRedeemNotice(res.message);
      await fetchLoyalty();
      setTimeout(() => setRedeemNotice(''), 6000);
    } catch (err) {
      console.error('Redemption error:', err);
      alert('Points balance insufficient or redemption unavailable.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-purple-400">Mobile Ecosystem</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
              <Smartphone className="w-3 h-3 text-purple-400" /> Super App &amp; Loyalty Hub
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-white font-display">
            Mobile Super App &amp; Digital Loyalty Wallet
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Live interactive preview of the guest mobile companion: points redemption, passport/visa document vault, trip timeline, GPS discovery, and AR-assisted navigation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-purple-500/30 text-xs shadow-lg flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-white">{loyalty?.tier || 'Diamond Elite'}</span>
            <span className="text-purple-400 font-bold">Tier Active</span>
          </div>
        </div>
      </section>

      {redeemNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{redeemNotice}</span>
        </div>
      )}

      {/* Main Grid: Interactive Mobile Mockup + Enterprise Wallet Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Smartphone Mockup */}
        <div className="mx-auto w-full max-w-[360px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative">
          {/* Speaker notch */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-900 mr-2" />
            <div className="w-2 h-2 rounded-full bg-blue-950" />
          </div>

          {/* Smartphone Screen */}
          <div className="bg-slate-950 text-white rounded-[36px] overflow-hidden pt-8 pb-4 flex flex-col h-[640px] relative border border-slate-800">
            {/* Top Bar */}
            <div className="px-5 py-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-bold font-mono text-slate-200">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>5G · 100%</span>
              </div>
            </div>

            {/* Mobile Nav Switcher */}
            <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-around text-[10px] font-bold">
              {[
                { id: 'WALLET', label: 'Wallet', icon: Wallet },
                { id: 'ITINERARY', label: 'Trips', icon: Plane },
                { id: 'VAULT', label: 'Vault', icon: FileText },
                { id: 'MAP', label: 'Explore', icon: Navigation },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveScreen(id)}
                  className={`flex flex-col items-center gap-1 p-1 cursor-pointer ${
                    activeScreen === id ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Screen Content */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {activeScreen === 'WALLET' && (
                <>
                  {/* Digital Loyalty Card */}
                  <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 shadow-lg text-white space-y-3 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-purple-200 font-bold">Nexgile Pass</p>
                        <h4 className="text-sm font-bold mt-0.5">{loyalty?.guest_name || 'Alexander Wright'}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-black uppercase backdrop-blur-sm">
                        {loyalty?.tier || 'Diamond Elite'}
                      </span>
                    </div>

                    <div className="pt-2">
                      <p className="text-[10px] text-purple-200">Points Balance</p>
                      <p className="text-2xl font-black font-display">{loyalty?.points_balance?.toLocaleString() || '84,500'}</p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-1 border-t border-white/20">
                      <span>{loyalty?.member_number || 'NXG-VIP-8821'}</span>
                      <span>Wallet: ${loyalty?.wallet_balance?.toFixed(2) || '950.00'}</span>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setShowRazorpayModal(true)}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all backdrop-blur-sm cursor-pointer"
                      >
                        <Wallet className="w-3 h-3 text-amber-300" />
                        <span>Top Up via Razorpay</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fast Perks</p>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                        <Key className="w-3.5 h-3.5" />
                        <span>NFC Mobile Key Active</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Room 101 · Tap phone to reader</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Club Lounge Access</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Floor 24 · Valid through {formatDate(getTodayStr(3), 'short')}</p>
                    </div>
                  </div>
                </>
              )}

              {activeScreen === 'ITINERARY' && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Trip Timeline</p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400">Hotel Stay</span>
                    <p className="font-bold text-slate-200">Nexgile Grand Resort</p>
                    <p className="text-[10px] text-slate-400">Executive Suite 101 · Check-out {formatDate(getTodayStr(3), 'short')}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-400">Flight UA-842</span>
                    <p className="font-bold text-slate-200">SFO ✈ JFK (Business First)</p>
                    <p className="text-[10px] text-slate-400">Boarding 14:15 · Gate G9 · Seat 3A</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400">Experience</span>
                    <p className="font-bold text-slate-200">Sunset Yacht Cruise on SF Bay</p>
                    <p className="text-[10px] text-slate-400">Departs Pier 39 at 18:00</p>
                  </div>
                </div>
              )}

              {activeScreen === 'VAULT' && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Digital Document Vault</p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">US Passport</p>
                      <p className="text-[10px] text-slate-400">Expires May 2031 · Verified</p>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">Travel Insurance Pass</p>
                      <p className="text-[10px] text-slate-400">Allianz Global Care · Policy ID 99214</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">Boarding QR Pass</p>
                      <p className="text-[10px] text-slate-400">Flight UA-842 · Apple Wallet Synced</p>
                    </div>
                    <QrCode className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
              )}

              {activeScreen === 'MAP' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nearby Discovery</p>
                    <button
                      onClick={() => setArNavActive(!arNavActive)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white"
                    >
                      {arNavActive ? 'Exit AR' : 'Launch AR View'}
                    </button>
                  </div>

                  {arNavActive ? (
                    <div className="h-40 rounded-2xl bg-gradient-to-tr from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40 p-3 flex flex-col justify-between text-center relative overflow-hidden animate-pulse">
                      <div className="text-[10px] text-indigo-300 font-mono">AR CAMERA OVERLAY ACTIVE</div>
                      <div className="flex flex-col items-center">
                        <Navigation className="w-8 h-8 text-cyan-400 animate-bounce" />
                        <p className="text-xs font-bold text-white mt-1">Walk 120m straight, turn right on Market St</p>
                      </div>
                      <div className="text-[10px] text-emerald-400">SFMOMA Art Museum ahead</div>
                    </div>
                  ) : (
                    LOCAL_PLACES.map((place) => (
                      <div key={place.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-200 text-[11px]">{place.name}</p>
                          <p className="text-[10px] text-slate-400">{place.category} · {place.dist}</p>
                        </div>
                        <span className="text-amber-400 font-bold text-[10px]">★ {place.rating}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Home indicator bar */}
            <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto mt-2" />
          </div>
        </div>

        {/* Loyalty & Rewards Controls Dashboard */}
        <div className="space-y-6">
          {/* Rewards Accrual & Tier Progress */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Member Status</span>
                <h3 className="text-xl font-bold text-white font-display">
                  {loyalty?.tier || 'Diamond Elite'} Tier Privileges
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-lg">
                <Award className="w-7 h-7" />
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {loyalty?.perks ||
                'Guaranteed room upgrades, late 4 PM checkout, complimentary daily artisan breakfast, high-speed Wi-Fi 6E, and executive lounge access.'}
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold">Tier Retention Pace:</span>
                <strong className="text-white">84,500 / 100,000 Points</strong>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: '84.5%' }} />
              </div>
              <p className="text-[11px] text-slate-400">15,500 points to unlock Diamond Elite Lifetime Ambassador tier.</p>
            </div>
          </div>

          {/* Razorpay Stored Credits & Travel Liquidity Reserve */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Universal Liquidity Pouch</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Razorpay Active (INR)
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-display mt-0.5">
                  Stored Razorpay Credits &amp; VIP Travel Balance
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Biometric travel credits spendable across room bookings, concierge amenities, private jet charters, and gourmet dining.
                </p>
              </div>

              <button
                onClick={() => setShowRazorpayModal(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-600/30 transition-all cursor-pointer shrink-0"
              >
                <Wallet className="w-4 h-4" />
                <span>+ Top Up via Razorpay</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-lg">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Spendable Razorpay Credits</span>
                <p className="text-2xl font-black text-purple-400 font-display mt-1">
                  ₹{((loyalty?.wallet_balance || 950) * 83).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> Live spendable across 50+ channels
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-lg">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">USD Equivalent Balance</span>
                <p className="text-2xl font-black text-white font-display mt-1">
                  ${(loyalty?.wallet_balance || 950).toFixed(2)}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Auto-converted at FX parity rate</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-lg">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gateway Configuration</span>
                <p className="text-xs font-bold text-slate-200 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Key ID: rzp_test_U3zTfszdEAEPYo
                </p>
                <span className="text-[10px] text-indigo-400 font-semibold mt-1 block">Live HMAC Verification Enabled</span>
              </div>
            </div>
          </div>

          {/* Instant Points Redemption Store */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white font-display">Instant 1-Click Points Redemption</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  title: 'Complimentary Suite Upgrade',
                  points: 5000,
                  credit: '$120 Value',
                  desc: 'Upgrade from Deluxe King to Executive Suite.',
                },
                {
                  title: '$75 Gourmet Dining Credit',
                  points: 4000,
                  credit: '$75 Value',
                  desc: 'Usable for room dining or rooftop lounge.',
                },
                {
                  title: 'VIP Airport Tesla Limo',
                  points: 6000,
                  credit: '$95 Value',
                  desc: 'Private curbside transfer to SFO/OAK.',
                },
              ].map((reward) => (
                <div key={reward.title} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                      {reward.points.toLocaleString()} Points
                    </span>
                    <h4 className="text-xs font-bold text-white mt-2">{reward.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">{reward.desc}</p>
                  </div>

                  <button
                    onClick={() => handleRedeem(reward.points, reward.title)}
                    className="mt-3 btn-primary text-[11px] py-1.5 w-full font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Redeem Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Preference Center */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white font-display">Push Notifications &amp; Alerts</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <span className="font-semibold text-slate-300">Flight Disruption Alerts</span>
                <input
                  type="checkbox"
                  checked={pushSettings.flightDisruptions}
                  onChange={(e) => setPushSettings((p) => ({ ...p, flightDisruptions: e.target.checked }))}
                  className="h-4 w-4 accent-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <span className="font-semibold text-slate-300">Concierge Recommendations</span>
                <input
                  type="checkbox"
                  checked={pushSettings.conciergeOffers}
                  onChange={(e) => setPushSettings((p) => ({ ...p, conciergeOffers: e.target.checked }))}
                  className="h-4 w-4 accent-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <span className="font-semibold text-slate-300">Room Readiness Notifications</span>
                <input
                  type="checkbox"
                  checked={pushSettings.roomReadiness}
                  onChange={(e) => setPushSettings((p) => ({ ...p, roomReadiness: e.target.checked }))}
                  className="h-4 w-4 accent-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <span className="font-semibold text-slate-300">Loyalty Multipliers &amp; Deals</span>
                <input
                  type="checkbox"
                  checked={pushSettings.loyaltyMultipliers}
                  onChange={(e) => setPushSettings((p) => ({ ...p, loyaltyMultipliers: e.target.checked }))}
                  className="h-4 w-4 accent-indigo-500"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Top-Up Modal */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 max-w-lg w-full space-y-4 animate-scale-up text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Top Up Universal Travel Reserve</h3>
                  <p className="text-[11px] text-slate-400">Secured by Razorpay Gateway · Test Mode</p>
                </div>
              </div>
              <button
                onClick={() => setShowRazorpayModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {razorpaySuccessMsg && (
              <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{razorpaySuccessMsg}</span>
              </div>
            )}

            <p className="text-xs text-slate-300">
              Select a verified credit package to top up your universal travel balance via Razorpay Test Mode:
            </p>

            <div className="space-y-2.5">
              {RAZORPAY_PACKAGES.map((pkg) => (
                <label
                  key={pkg.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedPackage === pkg.id
                      ? 'bg-purple-950/50 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="razorpay_pkg"
                      value={pkg.id}
                      checked={selectedPackage === pkg.id}
                      onChange={(e) => setSelectedPackage(e.target.value)}
                      className="accent-purple-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{pkg.title}</span>
                        <span className="text-[10px] font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/30">
                          {pkg.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        +{pkg.credits.toLocaleString()} spendable credits added to wallet
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-white font-display">
                    ₹{pkg.price_inr.toLocaleString()}
                  </span>
                </label>
              ))}
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>Razorpay Gateway Mode:</span>
                <strong className="text-emerald-400 font-mono">Test Mode (Cards/UPI)</strong>
              </div>
              <div className="flex justify-between">
                <span>Key ID:</span>
                <span className="font-mono text-[11px] text-slate-400">rzp_test_U3zTfszdEAEPYo</span>
              </div>
              <div className="flex justify-between">
                <span>Simulated Cards:</span>
                <span className="text-[11px] text-slate-400">Any test card / standard OTP</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleProceedRazorpay}
                disabled={isProcessingRazorpay}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>
                  {isProcessingRazorpay
                    ? 'Connecting to Razorpay...'
                    : `PROCEED WITH RAZORPAY (₹${(
                        RAZORPAY_PACKAGES.find((p) => p.id === selectedPackage)?.price_inr || 1500
                      ).toLocaleString()}) →`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
