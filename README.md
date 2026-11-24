# Nexgile-TravAI Travel & Hospitality Portal

An enterprise-grade, AI-enabled multi-tenant travel and hospitality management portal built with **Python (FastAPI + SQLAlchemy Async + SQLite aiosqlite)** on the backend and **React (Vite + Tailwind CSS + Lucide Icons + Vercel AI SDK)** on the frontend.

Designed in strict compliance with the Nexgile-TravAI Travel & Hospitality Portal Functional Requirements specification.

---

## System Architecture

```
/Nexgile-TravAI-Portal
├── /backend
│   ├── /app
│   │   ├── __init__.py
│   │   ├── auth_utils.py     # HMAC-SHA256 tokens & PBKDF2/SHA-256 salted password hashing
│   │   ├── config.py         # App configuration & CORS settings
│   │   ├── database.py       # Async SQLAlchemy engine & session maker
│   │   ├── models.py         # Full ORM models (Property, RoomUnit, Booking, DynamicRate, CorporateTravelRequest, AuditLog, DistributionChannel, MarketplaceItem, ServiceRequest, IoTDeviceState, LoyaltyMember, ExpenseRecord, CompetitorRate)
│   │   ├── schemas.py        # Pydantic v2 schemas
│   │   ├── crud.py           # DB business logic, AI Concierge engine, and audit trail handlers
│   │   ├── seed.py           # Auto-seeding script for rooms, bookings, AI recommendations, corporate requests
│   │   └── main.py           # FastAPI application entrypoint & 13 endpoint suites
│   ├── nexgile_travai.db     # Active SQLite database
│   └── requirements.txt
│
└── /frontend
    ├── /src
    │   ├── /components
    │   │   ├── Header.jsx                 # Navigation sidebar, Global Search, Currency & 60+ Language Switchers
    │   │   ├── PortalOverview.jsx         # Executive operations overview, live KPIs, quick action hub
    │   │   ├── RoomRackPMS.jsx            # Front Desk PMS live room rack grid & contactless check-in/out modal
    │   │   ├── RevenueManagerAI.jsx       # Dynamic AI rate suggestions, confidence scores & human override
    │   │   ├── DistributionChannels.jsx   # 20,000+ OTA, GDS, and Metasearch channel sync & stop-sell controls
    │   │   ├── TravelMarketplace.jsx      # Multi-modal booking (flights, cars, tours, packages) & unified cart
    │   │   ├── AIConciergeView.jsx        # Vercel AI SDK Concierge, in-room IoT controls & 24/7 dining order
    │   │   ├── MobileSuperAppLoyalty.jsx  # Interactive smartphone super app, digital wallet, vault & AR navigation
    │   │   ├── CorporateAdmin.jsx         # Corporate travel requests, automated policy engine & approvals
    │   │   ├── EnterpriseAnalytics.jsx    # Operational benchmarking, expenses, competitor parity & CSV exports
    │   │   ├── AuditTrailLog.jsx          # SOC2/ISO compliant immutable timestamped audit ledger
    │   │   ├── WorkspacePage.jsx          # Housekeeping board & operator settings
    │   │   └── AuthPage.jsx               # Role-based login and signup with 1-click demo access
    │   ├── /services
    │   │   └── api.js                     # Full Axios API client connected to backend (/api/v1)
    │   ├── /utils
    │   │   ├── currency.js                # Multi-currency engine (USD, INR, EUR, GBP, JPY, AED, SGD, CAD, AUD)
    │   │   └── i18n.js                    # 60+ languages localization dictionary
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css                      # Cyber-luxury glassmorphism aesthetic
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── index.html
```

---

## Primary Functional Modules Implemented

1. **Cloud Property Management (PMS - Module A)**:
   - Live Room Rack grid with Available/Clean, Occupied, Dirty, and Out-of-Order statuses.
   - Contactless Check-In, Check-Out, and guest assignment modals.
   - Walk-in reservation creator with unique PNR generation (e.g. `NXG-A89F4B`).
   - NFC mobile digital key delivery.

2. **AI Revenue Management & Pricing (Module B)**:
   - Dynamic rate recommendations powered by machine learning demand signals (events, competitors, pace).
   - Real-time confidence score meters (e.g. 96% confidence) and primary demand driver tags.
   - Human-in-the-loop rate override modal with mandatory justification and audit logging.

3. **Distribution & Channel Management (Module C)**:
   - Central rate and inventory synchronization across 20,000+ channels (Booking.com, Expedia, Amadeus, Sabre, Google Hotels).
   - Rate parity integrity scoring and anomaly alerts.
   - 1-click channel sync feeds and instant stop-sell allotment rules.

4. **Booking & Travel Marketplace (Module D)**:
   - Search and book multi-modal travel inventory: flights, electric luxury car rentals, bay sailing tours, helicopter wine excursions, airport transfers, and dynamic executive bundles.
   - Unified checkout drawer supporting 50+ payment methods (Cards, UPI, Apple Pay, Google Wallet, Corporate Billing, Crypto, Loyalty Points).
   - Instant voucher code generation with supplier confirmation.

5. **AI Guest Experience & Concierge (Module E - Vercel AI SDK)**:
   - 24/7 conversational AI concierge with natural language intent detection.
   - In-room IoT controls: climate slider (temperature, AC mode), ambient lighting toggle, Do-Not-Disturb (DND) status, digital key generation.
   - 24/7 chef room service ordering with instant kitchen dispatch.
   - Omnichannel communication simulator (Web App, WhatsApp, SMS, Email).
   - 1-click escalation to human duty manager and AI governance rationale tracking.

6. **Mobile Super App & Loyalty (Module F)**:
   - Interactive mobile smartphone frame with live responsive preview.
   - Nexgile Rewards Digital Wallet: points accrual, tier status (Silver, Gold, Platinum, Diamond Elite), 1-click points redemption.
   - Digital document vault (Passport, Visa, Travel Insurance pass, Boarding QR).
   - GPS-based discovery map and AR-assisted navigation preview.
   - Push notifications preference center.

7. **Enterprise Travel, Analytics & Customer Experience (Section 4)**:
   - Corporate policy rules engine, travel request approval/rejection with reviewer notes.
   - Expense management: automated policy check, per-diem violation flags, new expense submission.
   - Operational benchmarking: room turnaround speed, guest CSAT/NPS, staff productivity.
   - Proactive AI Insights dashboard with urgency indicators.
   - Self-service 1-click CSV report exports for Rooms, Revenue, and Audit logs.

8. **System Audit Trail & AI Governance (Section 7)**:
   - Immutable timestamped event log tracking room updates, payments, AI overrides, and corporate approvals.

---

## Quickstart & Installation Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Running Backend (FastAPI Server)

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
> API runs at `http://127.0.0.1:8000`. Interactive OpenAPI documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Running Frontend (React Vite App)

```bash
cd frontend
npm install
npm run dev
```
> Open `http://localhost:3001` or `http://localhost:5173`.

### 3. Demo Credentials

- **Front Desk Admin**: `admin@nexgile.com` / `admin123`
- **Revenue Manager**: `revenue@nexgile.com` / `revenue123`
- **Corporate Admin**: `mark@nexgile.com` / `admin123`
- *New users can also self-register with instant role allocation.*
