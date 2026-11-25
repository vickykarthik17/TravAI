from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import os

from app.config import settings
from app.database import get_db, engine, Base
from app import models, schemas, crud
from app.seed import seed_data
from app.auth_utils import create_access_token, decode_access_token, verify_password

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Nexgile-TravAI Travel & Hospitality Portal MVP API",
    version="1.0.0"
)

security = HTTPBearer(auto_error=False)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Ensure tables are created and seed database if missing/empty
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Auto-seed if database has 0 rooms
    from app.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        res = await crud.get_property_rooms(db, property_id=1)
        if len(res) == 0:
            print("Auto-seeding initial data...")
            await seed_data()
        await crud.ensure_default_users(db)
        await crud.reconcile_due_checkouts(db)
        await crud.ensure_extended_seeds(db)
        await crud.reconcile_dynamic_dates(db)

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[models.User]:
    if not credentials:
        return None
    payload = decode_access_token(credentials.credentials)
    if not payload:
        return None
    user = await crud.get_user_by_id(db, payload["user_id"])
    if not user or not user.is_active:
        return None
    return user

async def get_current_user(
    user: Optional[models.User] = Depends(get_current_user_optional),
) -> models.User:
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs"
    }

# --- Authentication Endpoints ---
@app.post("/api/v1/auth/signup", response_model=schemas.AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: schemas.UserSignup, db: AsyncSession = Depends(get_db)):
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    existing = await crud.get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = await crud.create_user(db, payload)
    token = create_access_token(user.id, user.email)
    return schemas.AuthResponse(access_token=token, user=user)

@app.post("/api/v1/auth/login", response_model=schemas.AuthResponse)
async def login(payload: schemas.UserLogin, db: AsyncSession = Depends(get_db)):
    user = await crud.get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")
    token = create_access_token(user.id, user.email)
    await crud.create_audit_log(
        db=db,
        actor=user.full_name,
        action="USER_LOGIN",
        target_type="User",
        target_id=str(user.id),
        details=f"Successful portal login for {user.email}",
    )
    return schemas.AuthResponse(access_token=token, user=user)

@app.get("/api/v1/auth/me", response_model=schemas.UserOut)
async def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# --- PMS Room Rack & Housekeeping Endpoints ---
@app.get("/api/v1/properties/{property_id}/rooms", response_model=List[schemas.RoomOut])
async def get_property_rooms(property_id: int = 1, db: AsyncSession = Depends(get_db)):
    await crud.reconcile_due_checkouts(db)
    rooms = await crud.get_property_rooms(db, property_id)
    return rooms

@app.patch("/api/v1/rooms/{room_id}/status", response_model=schemas.RoomOut)
async def update_room_status(
    room_id: int,
    payload: schemas.RoomStatusUpdate,
    actor: str = "Front Desk Staff",
    db: AsyncSession = Depends(get_db)
):
    updated_room = await crud.update_room_status(
        db=db,
        room_id=room_id,
        update_data=payload,
        actor=actor
    )
    if not updated_room:
        raise HTTPException(status_code=404, detail="Room not found")
    return updated_room

@app.post("/api/v1/rooms/{room_id}/checkout", response_model=schemas.RoomOut)
async def checkout_room(room_id: int, db: AsyncSession = Depends(get_db)):
    room = await crud.checkout_room(db=db, room_id=room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

# --- Marketplace & Booking Endpoints ---
@app.post("/api/v1/bookings", response_model=schemas.BookingOut, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_in: schemas.BookingCreate,
    actor: str = "Guest Booking Engine",
    db: AsyncSession = Depends(get_db)
):
    booking = await crud.create_booking(db=db, booking_in=booking_in, actor=actor)
    return booking

@app.post("/api/v1/payments", response_model=schemas.PaymentOut, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payload: schemas.PaymentCreate,
    db: AsyncSession = Depends(get_db),
):
    payment = await crud.create_payment(db=db, payment_in=payload)
    if not payment:
        raise HTTPException(status_code=400, detail="Booking is not eligible for payment")
    return payment

@app.post("/api/v1/payments/initiate", response_model=schemas.PaymentOut, status_code=status.HTTP_201_CREATED)
async def initiate_payment(payload: schemas.PaymentCreate, db: AsyncSession = Depends(get_db)):
    payment = await crud.initiate_payment(db=db, payment_in=payload)
    if not payment:
        raise HTTPException(status_code=400, detail="Booking is not eligible for payment initiation")
    return payment

# --- Razorpay Payment Gateway Endpoints ---
@app.get("/api/v1/payments/config", response_model=schemas.RazorpayConfigOut)
async def get_payment_config():
    return schemas.RazorpayConfigOut(
        key_id=settings.RAZORPAY_KEY_ID,
        currency="INR",
        name="Nexgile-TravAI Grand Resort & Convention Center",
        test_mode=True
    )

@app.get("/api/v1/payments/packages", response_model=List[schemas.CreditPackageOut])
async def get_credit_packages():
    return [
        schemas.CreditPackageOut(
            id="pkg_starter",
            title="Silver Travel Reserve",
            credits=1500,
            price_inr=1500.0,
            bonus=0,
            badge="Standard"
        ),
        schemas.CreditPackageOut(
            id="pkg_executive",
            title="Gold Executive Reserve",
            credits=3500,
            price_inr=3000.0,
            bonus=500,
            badge="Best Value (+500 Bonus)"
        ),
        schemas.CreditPackageOut(
            id="pkg_presidential",
            title="Platinum Royal Reserve",
            credits=6000,
            price_inr=5000.0,
            bonus=1000,
            badge="VIP Elite (+1,000 Bonus)"
        ),
        schemas.CreditPackageOut(
            id="pkg_sovereign",
            title="Sovereign Diamond Reserve",
            credits=13000,
            price_inr=10000.0,
            bonus=3000,
            badge="Ultra Luxury (+3,000 Bonus)"
        )
    ]

@app.post("/api/v1/payments/razorpay/create-order", response_model=schemas.RazorpayOrderOut)
async def create_razorpay_order_endpoint(
    payload: schemas.RazorpayOrderCreate,
    db: AsyncSession = Depends(get_db)
):
    return await crud.create_razorpay_order(db, payload)

@app.post("/api/v1/payments/razorpay/verify", response_model=schemas.RazorpayVerifyResponse)
async def verify_razorpay_payment_endpoint(
    payload: schemas.RazorpayVerifyRequest,
    db: AsyncSession = Depends(get_db)
):
    return await crud.verify_razorpay_payment(db, payload)

@app.get("/api/v1/payments/{payment_id}", response_model=schemas.PaymentOut)
async def get_payment(payment_id: int, db: AsyncSession = Depends(get_db)):
    payment = await crud.get_payment(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@app.post("/api/v1/payments/{payment_id}/complete", response_model=schemas.PaymentOut)
async def complete_payment(payment_id: int, db: AsyncSession = Depends(get_db)):
    payment = await crud.complete_payment(db=db, payment_id=payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@app.post("/api/v1/bookings/{booking_id}/checkout", response_model=schemas.BookingOut)
async def checkout_booking(booking_id: int, db: AsyncSession = Depends(get_db)):
    booking = await crud.checkout_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

# --- Revenue Management & AI Pricing Endpoints ---
@app.get("/api/v1/revenue/recommendations", response_model=List[schemas.DynamicRateOut])
async def get_revenue_recommendations(db: AsyncSession = Depends(get_db)):
    recommendations = await crud.get_revenue_recommendations(db)
    return recommendations

@app.post("/api/v1/revenue/recalculate", response_model=List[schemas.DynamicRateOut])
async def recalculate_revenue_rates(db: AsyncSession = Depends(get_db)):
    updated_rates = await crud.recalculate_ai_revenue_rates(db)
    return updated_rates

@app.post("/api/v1/revenue/override", response_model=schemas.DynamicRateOut)
async def override_revenue_rate(
    payload: schemas.RateOverrideRequest,
    db: AsyncSession = Depends(get_db)
):
    updated_rate = await crud.override_revenue_rate(
        db=db,
        rate_id=payload.rate_id,
        new_rate=payload.new_rate,
        override_reason=payload.override_reason,
        actor=payload.actor
    )
    if not updated_rate:
        raise HTTPException(status_code=404, detail="Dynamic rate record not found")
    return updated_rate

# --- Corporate Travel & Approval Endpoints ---
@app.get("/api/v1/corporate/requests", response_model=List[schemas.CorporateRequestOut])
async def get_corporate_requests(db: AsyncSession = Depends(get_db)):
    requests = await crud.get_corporate_requests(db)
    return requests

@app.patch("/api/v1/corporate/requests/{request_id}/approve", response_model=schemas.CorporateRequestOut)
async def approve_or_reject_corporate_request(
    request_id: int,
    payload: schemas.CorporateRequestAction,
    db: AsyncSession = Depends(get_db)
):
    updated_req = await crud.update_corporate_request(
        db=db,
        request_id=request_id,
        action=payload.action,
        reviewer_notes=payload.reviewer_notes,
        actor=payload.actor
    )
    if not updated_req:
        raise HTTPException(status_code=404, detail="Corporate travel request not found")
    return updated_req

# --- Analytics & Audit Endpoints ---
@app.get("/api/v1/metrics", response_model=schemas.MetricsSummary)
async def get_metrics(db: AsyncSession = Depends(get_db)):
    return await crud.get_metrics_summary(db)

@app.get("/api/v1/audit/logs", response_model=List[schemas.AuditLogOut])
async def get_audit_logs(limit: int = 50, db: AsyncSession = Depends(get_db)):
    return await crud.get_audit_logs(db, limit=limit)

# --- Distribution & Channel Management Endpoints ---
@app.get("/api/v1/channels", response_model=List[schemas.DistributionChannelOut])
async def get_channels(db: AsyncSession = Depends(get_db)):
    return await crud.get_channels(db)

@app.patch("/api/v1/channels/{channel_id}/sync", response_model=schemas.DistributionChannelOut)
async def sync_channel(
    channel_id: int,
    payload: schemas.ChannelSyncRequest,
    db: AsyncSession = Depends(get_db)
):
    channel = await crud.update_channel_sync(db, channel_id, payload)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    return channel

@app.post("/api/v1/channels/stop-sell")
async def apply_stop_sell(
    payload: schemas.StopSellRequest,
    actor: str = "Distribution Officer",
    db: AsyncSession = Depends(get_db)
):
    return await crud.toggle_stop_sell(db, payload, actor)

# --- Multi-Modal Marketplace Endpoints ---
@app.get("/api/v1/marketplace/items", response_model=List[schemas.MarketplaceItemOut])
async def get_marketplace_items(category: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    return await crud.get_marketplace_items(db, category)

@app.post("/api/v1/marketplace/book", status_code=status.HTTP_201_CREATED)
async def book_marketplace(
    payload: schemas.MarketplaceBookingCreate,
    actor: str = "Marketplace Traveler",
    db: AsyncSession = Depends(get_db)
):
    try:
        return await crud.book_marketplace_item(db, payload, actor)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# --- Service Requests & Concierge Endpoints ---
@app.get("/api/v1/service-requests", response_model=List[schemas.ServiceRequestOut])
async def get_service_requests(db: AsyncSession = Depends(get_db)):
    return await crud.get_service_requests(db)

@app.post("/api/v1/service-requests", response_model=schemas.ServiceRequestOut, status_code=status.HTTP_201_CREATED)
async def create_service_request(
    payload: schemas.ServiceRequestCreate,
    actor: str = "Guest Concierge",
    db: AsyncSession = Depends(get_db)
):
    return await crud.create_service_request(db, payload, actor)

@app.patch("/api/v1/service-requests/{req_id}", response_model=schemas.ServiceRequestOut)
async def update_service_request(
    req_id: int,
    payload: schemas.ServiceRequestUpdate,
    actor: str = "Duty Manager",
    db: AsyncSession = Depends(get_db)
):
    req = await crud.update_service_request(db, req_id, payload, actor)
    if not req:
        raise HTTPException(status_code=404, detail="Service request not found")
    return req

# --- IoT Room Controls Endpoints ---
@app.get("/api/v1/iot/{room_number}", response_model=schemas.IoTDeviceStateOut)
async def get_iot_device_state(room_number: str, db: AsyncSession = Depends(get_db)):
    return await crud.get_iot_state(db, room_number)

@app.post("/api/v1/iot/{room_number}/control", response_model=schemas.IoTDeviceStateOut)
async def control_iot_device(
    room_number: str,
    payload: schemas.IoTDeviceControl,
    db: AsyncSession = Depends(get_db)
):
    return await crud.update_iot_state(db, room_number, payload)

# --- Loyalty & Digital Wallet Endpoints ---
@app.get("/api/v1/loyalty/{email}", response_model=schemas.LoyaltyMemberOut)
async def get_loyalty_member(email: str, db: AsyncSession = Depends(get_db)):
    member = await crud.get_loyalty_member(db, email)
    if not member:
        # Return fallback diamond demo profile
        return schemas.LoyaltyMemberOut(
            id=999,
            member_number="NXG-VIP-8821",
            guest_name="Alexander Wright",
            email=email,
            tier="Diamond Elite",
            points_balance=84500,
            lifetime_points=182000,
            wallet_balance=950.0,
            perks="Guaranteed Suite Upgrade, 24/7 Butler, Free Airport Limousine, Club Lounge"
        )
    return member

@app.post("/api/v1/loyalty/redeem")
async def redeem_points(
    payload: schemas.LoyaltyRedeemRequest,
    email: str = "a.wright@techcorp.io",
    db: AsyncSession = Depends(get_db)
):
    try:
        return await crud.redeem_loyalty_points(db, email, payload.points, payload.reward_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Expenses & Corporate Travel Endpoints ---
@app.get("/api/v1/expenses", response_model=List[schemas.ExpenseRecordOut])
async def get_expenses(db: AsyncSession = Depends(get_db)):
    return await crud.get_expenses(db)

@app.post("/api/v1/expenses", response_model=schemas.ExpenseRecordOut, status_code=status.HTTP_201_CREATED)
async def submit_expense(
    payload: schemas.ExpenseRecordCreate,
    db: AsyncSession = Depends(get_db)
):
    return await crud.create_expense(db, payload)

# --- Competitor Rates Endpoints ---
@app.get("/api/v1/revenue/competitors", response_model=List[schemas.CompetitorRateOut])
async def get_competitor_rates(db: AsyncSession = Depends(get_db)):
    return await crud.get_competitor_rates(db)

# --- AI Concierge & Chat Endpoints ---
@app.post("/api/v1/ai/chat", response_model=schemas.AIChatResponse)
async def chat_with_ai(
    payload: schemas.AIChatRequest,
    db: AsyncSession = Depends(get_db)
):
    return await crud.generate_ai_chat(db, payload)

@app.get("/api/v1/concierge/welcome", response_model=schemas.ConciergeWelcomeResponse)
async def get_concierge_welcome_endpoint(current_user: Optional[models.User] = Depends(get_current_user_optional)):
    return await crud.get_concierge_welcome(current_user)

@app.post("/api/v1/concierge/chat", response_model=schemas.ConciergeChatResponse)
async def chat_concierge_endpoint(
    payload: schemas.ConciergeChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    guest_name = payload.guest_name or (current_user.full_name if current_user else "Alexander Wright")
    return await crud.chat_concierge(
        db=db,
        message=payload.message,
        reservation_id=payload.reservation_id,
        history=payload.history,
        guest_name=guest_name
    )

@app.get("/api/v1/ai/insights", response_model=List[schemas.AIInsightOut])
async def get_ai_insights(db: AsyncSession = Depends(get_db)):
    return await crud.get_proactive_insights(db)

# --- Export & Reporting Endpoints ---
@app.get("/api/v1/reports/export")
async def export_reports(
    report_type: str = "rooms", # rooms, bookings, audit, revenue
    db: AsyncSession = Depends(get_db)
):
    if report_type == "rooms":
        rooms = await crud.get_property_rooms(db, property_id=1)
        csv_data = "Room Number,Room Type,Status,Floor,Base Price (USD),Guest,Housekeeping Note\n"
        for r in rooms:
            guest = r.current_guest_name or ""
            note = r.housekeeping_note or ""
            csv_data += f'"{r.room_number}","{r.room_type}","{r.status}",{r.floor},{r.base_price},"{guest}","{note}"\n'
        return PlainTextResponse(content=csv_data, media_type="text/csv", headers={"Content-Disposition": 'attachment; filename="rooms_report.csv"'})
    elif report_type == "audit":
        logs = await crud.get_audit_logs(db, limit=100)
        csv_data = "Timestamp,Actor,Action,Target Type,Target ID,Details\n"
        for l in logs:
            csv_data += f'"{l.timestamp}","{l.actor}","{l.action}","{l.target_type}","{l.target_id}","{l.details}"\n'
        return PlainTextResponse(content=csv_data, media_type="text/csv", headers={"Content-Disposition": 'attachment; filename="audit_trail_report.csv"'})
    else:
        rates = await crud.get_revenue_recommendations(db)
        csv_data = "Room Type,Target Date,Current Rate,AI Recommended Rate,Confidence,Demand Driver,Status\n"
        for rt in rates:
            csv_data += f'"{rt.room_type}","{rt.date_str}",{rt.current_rate},{rt.ai_recommended_rate},{rt.confidence_score},"{rt.demand_factor}","{rt.status}"\n'
        return PlainTextResponse(content=csv_data, media_type="text/csv", headers={"Content-Disposition": 'attachment; filename="revenue_report.csv"'})

# --- MongoDB Atlas Status & Connectivity ---
from app.mongodb import test_mongo_connection, update_mongo_configuration
from pydantic import BaseModel

class MongoConfigInput(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    mongodb_uri: Optional[str] = None
    database_name: Optional[str] = "nexgile_travai"

@app.get("/api/v1/mongodb/status")
async def mongodb_status():
    """Verify MongoDB Atlas connectivity and list collection metadata for cluster0.tf8lwiu.mongodb.net."""
    return await test_mongo_connection()

@app.post("/api/v1/mongodb/configure")
async def mongodb_configure(payload: MongoConfigInput):
    """Dynamically configure credentials for cluster0.tf8lwiu.mongodb.net and test live connection."""
    return await update_mongo_configuration(
        username=payload.username,
        password=payload.password,
        raw_uri=payload.mongodb_uri,
        db_name=payload.database_name
    )

# --- Health Check ---
@app.get("/api/v1/health")
async def health_check():
    mongo_state = await test_mongo_connection()
    return {
        "status": "healthy",
        "primary_database": "sqlite+aiosqlite (local) / mongodb atlas (ready)",
        "mongodb_atlas": mongo_state,
        "modules": [
            "Cloud PMS (Front Desk, Housekeeping, Finance)",
            "Revenue Management & AI Yield Engine",
            "Distribution & 20k+ Channel Management",
            "Booking & Travel Marketplace",
            "AI Guest Experience & Concierge",
            "Mobile Super App & Loyalty",
            "Enterprise Travel & Analytics",
            "Audit Trail Governance"
        ],
        "active_property": "Nexgile Grand Resort & Convention Center"
    }
