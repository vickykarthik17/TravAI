import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '/api/v1';
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
};

const API_BASE_URL = getBaseUrl();
const TOKEN_KEY = 'travai_token';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete client.defaults.headers.common.Authorization;
  }
};

const savedToken = localStorage.getItem(TOKEN_KEY);
if (savedToken) setAuthToken(savedToken);

export const api = {
  login: async (email, password) => {
    const res = await client.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });
    return res.data;
  },

  signup: async (data) => {
    const res = await client.post('/auth/signup', {
      full_name: data.full_name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      role: data.role,
      department: data.department?.trim() || null,
    });
    return res.data;
  },

  getMe: async () => {
    const res = await client.get('/auth/me');
    return res.data;
  },

  logout: () => {
    setAuthToken(null);
    localStorage.removeItem('travai_user');
  },

  getRooms: async (propertyId = 1) => {
    const res = await client.get(`/properties/${propertyId}/rooms`);
    return res.data;
  },

  updateRoomStatus: async (roomId, status, guestName, housekeepingNote, actor = 'Front Desk Staff') => {
    const res = await client.patch(`/rooms/${roomId}/status`, {
      status,
      guest_name: guestName,
      housekeeping_note: housekeepingNote,
    }, { params: { actor } });
    return res.data;
  },

  checkoutRoom: async (roomId) => {
    const res = await client.post(`/rooms/${roomId}/checkout`);
    return res.data;
  },

  createBooking: async (bookingData) => {
    const res = await client.post('/bookings', bookingData);
    return res.data;
  },

  createPayment: async (bookingId, paymentMethod, cardLast4) => {
    const res = await client.post('/payments', {
      booking_id: bookingId,
      payment_method: paymentMethod,
      card_last4: cardLast4 || null,
    });
    return res.data;
  },

  initiatePayment: async (bookingId, paymentMethod, cardLast4) => {
    const res = await client.post('/payments/initiate', {
      booking_id: bookingId,
      payment_method: paymentMethod,
      card_last4: cardLast4 || null,
    });
    return res.data;
  },

  // Razorpay Gateway
  getPaymentConfig: async () => {
    const res = await client.get('/payments/config');
    return res.data;
  },

  getCreditPackages: async () => {
    const res = await client.get('/payments/packages');
    return res.data;
  },

  createRazorpayOrder: async (data) => {
    const res = await client.post('/payments/razorpay/create-order', data);
    return res.data;
  },

  verifyRazorpayPayment: async (data) => {
    const res = await client.post('/payments/razorpay/verify', data);
    return res.data;
  },

  loadRazorpayScript: () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  getPayment: async (paymentId) => {
    const res = await client.get(`/payments/${paymentId}`);
    return res.data;
  },

  completePayment: async (paymentId) => {
    const res = await client.post(`/payments/${paymentId}/complete`);
    return res.data;
  },

  checkoutBooking: async (bookingId) => {
    const res = await client.post(`/bookings/${bookingId}/checkout`);
    return res.data;
  },

  getRevenueRecommendations: async () => {
    const res = await client.get('/revenue/recommendations');
    return res.data;
  },

  recalculateRevenueRates: async () => {
    const res = await client.post('/revenue/recalculate');
    return res.data;
  },

  overrideRate: async (rateId, newRate, overrideReason, actor = 'Revenue Manager') => {
    const res = await client.post('/revenue/override', {
      rate_id: rateId,
      new_rate: newRate,
      override_reason: overrideReason,
      actor,
    });
    return res.data;
  },

  getCorporateRequests: async () => {
    const res = await client.get('/corporate/requests');
    return res.data;
  },

  approveCorporateRequest: async (requestId, action, reviewerNotes, actor = 'Corporate Travel Admin') => {
    const res = await client.patch(`/corporate/requests/${requestId}/approve`, {
      action,
      reviewer_notes: reviewerNotes,
      actor,
    });
    return res.data;
  },

  getMetrics: async () => {
    const res = await client.get('/metrics');
    return res.data;
  },

  getAuditLogs: async (limit = 50) => {
    const res = await client.get('/audit/logs', { params: { limit } });
    return res.data;
  },

  // Channels & Distribution (20,000+ channels)
  getChannels: async () => {
    const res = await client.get('/channels');
    return res.data;
  },

  syncChannel: async (channelId, data = {}) => {
    const res = await client.patch(`/channels/${channelId}/sync`, data);
    return res.data;
  },

  applyStopSell: async (channelId, roomType, stopSell = true) => {
    const res = await client.post('/channels/stop-sell', {
      channel_id: channelId,
      room_type: roomType,
      stop_sell: stopSell,
    });
    return res.data;
  },

  // Multi-Modal Marketplace
  getMarketplaceItems: async (category) => {
    const res = await client.get('/marketplace/items', {
      params: category && category !== 'ALL' ? { category } : {},
    });
    return res.data;
  },

  bookMarketplaceItem: async (bookingData) => {
    const res = await client.post('/marketplace/book', bookingData);
    return res.data;
  },

  // Guest Service Requests & Concierge
  getServiceRequests: async () => {
    const res = await client.get('/service-requests');
    return res.data;
  },

  createServiceRequest: async (data) => {
    const res = await client.post('/service-requests', data);
    return res.data;
  },

  updateServiceRequest: async (id, status, notes) => {
    const res = await client.patch(`/service-requests/${id}`, { status, notes });
    return res.data;
  },

  // IoT In-Room Automation
  getIoTState: async (roomNumber) => {
    const res = await client.get(`/iot/${roomNumber}`);
    return res.data;
  },

  controlIoT: async (roomNumber, controls) => {
    const res = await client.post(`/iot/${roomNumber}/control`, controls);
    return res.data;
  },

  // Loyalty & Digital Wallet
  getLoyalty: async (email) => {
    const res = await client.get(`/loyalty/${encodeURIComponent(email)}`);
    return res.data;
  },

  redeemLoyalty: async (email, points, rewardType) => {
    const res = await client.post('/loyalty/redeem', { points, reward_type: rewardType }, {
      params: { email },
    });
    return res.data;
  },

  // Expenses & Corporate Policies
  getExpenses: async () => {
    const res = await client.get('/expenses');
    return res.data;
  },

  createExpense: async (expenseData) => {
    const res = await client.post('/expenses', expenseData);
    return res.data;
  },

  // Competitor Rates
  getCompetitorRates: async () => {
    const res = await client.get('/revenue/competitors');
    return res.data;
  },

  // AI Concierge & Chat Assistant (Vercel AI SDK compatible endpoint)
  chatAI: async (messages, guestName, roomNumber, persona = 'Concierge') => {
    const res = await client.post('/ai/chat', {
      messages,
      guest_name: guestName,
      room_number: roomNumber,
      persona,
    });
    return res.data;
  },

  // Luxury Concierge (Matching https://nexgile-travai.vercel.app/concierge)
  getConciergeWelcome: async () => {
    const res = await client.get('/concierge/welcome');
    return res.data;
  },

  chatConcierge: async (message, reservationId = null, history = [], guestName = 'Alexander Wright') => {
    const res = await client.post('/concierge/chat', {
      message,
      reservation_id: reservationId,
      history,
      guest_name: guestName,
    });
    return res.data;
  },

  getAIInsights: async () => {
    const res = await client.get('/ai/insights');
    return res.data;
  },

  // Report Export
  exportReport: async (reportType = 'rooms') => {
    const res = await client.get('/reports/export', {
      params: { report_type: reportType },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // MongoDB Atlas Cluster Connectivity
  getMongoStatus: async () => {
    const res = await client.get('/mongodb/status');
    return res.data;
  },

  configureMongo: async (credentials) => {
    const res = await client.post('/mongodb/configure', credentials);
    return res.data;
  },

  getHealth: async () => {
    const res = await client.get('/health');
    return res.data;
  },
};
