import datetime
from typing import Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Property(Base):
    __tablename__ = "properties"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    brand: Mapped[str] = mapped_column(String(100), default="Nexgile-TravAI Luxury Collection")
    location: Mapped[str] = mapped_column(String(150), nullable=False)
    total_rooms: Mapped[int] = mapped_column(Integer, default=10)

    rooms: Mapped[list["RoomUnit"]] = relationship("RoomUnit", back_populates="property", cascade="all, delete-orphan")
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="property")

class RoomUnit(Base):
    __tablename__ = "room_units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False)
    room_number: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    room_type: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. Executive Suite, Deluxe King, Studio
    status: Mapped[str] = mapped_column(String(30), default="Available") # Available, Occupied, Dirty, Maintenance
    floor: Mapped[int] = mapped_column(Integer, default=1)
    base_price: Mapped[float] = mapped_column(Float, default=250.0)
    current_guest_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    housekeeping_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    property: Mapped["Property"] = relationship("Property", back_populates="rooms")
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="room")

class RatePlan(Base):
    __tablename__ = "rate_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    base_rate: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class DynamicRate(Base):
    __tablename__ = "dynamic_rates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    room_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    date_str: Mapped[str] = mapped_column(String(20), nullable=False)
    current_rate: Mapped[float] = mapped_column(Float, nullable=False)
    ai_recommended_rate: Mapped[float] = mapped_column(Float, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.92) # 0.0 to 1.0
    demand_factor: Mapped[str] = mapped_column(String(50), default="Surge Demand") # High Demand, Tech Conference, Normal
    status: Mapped[str] = mapped_column(String(30), default="AI Proposed") # AI Proposed, Overridden, Approved
    overridden_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    override_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    pnr: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    guest_name: Mapped[str] = mapped_column(String(100), nullable=False)
    guest_email: Mapped[str] = mapped_column(String(100), nullable=False)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False)
    room_unit_id: Mapped[Optional[int]] = mapped_column(ForeignKey("room_units.id"), nullable=True)
    room_type: Mapped[str] = mapped_column(String(50), nullable=False)
    check_in_date: Mapped[str] = mapped_column(String(20), nullable=False)
    check_out_date: Mapped[str] = mapped_column(String(20), nullable=False)
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Confirmed") # Confirmed, Hold, Cancelled
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    property: Mapped["Property"] = relationship("Property", back_populates="bookings")
    room: Mapped[Optional["RoomUnit"]] = relationship("RoomUnit", back_populates="bookings")

class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id"), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    payment_method: Mapped[str] = mapped_column(String(30), nullable=False)
    card_last4: Mapped[Optional[str]] = mapped_column(String(4), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="Authorized")
    gateway: Mapped[str] = mapped_column(String(50), default="Nexgile Test Gateway")
    transaction_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    booking: Mapped["Booking"] = relationship("Booking")

class EmailNotification(Base):
    __tablename__ = "email_notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id"), nullable=False, index=True)
    recipient: Mapped[str] = mapped_column(String(120), nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    subject: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Queued")
    provider_message_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    booking: Mapped["Booking"] = relationship("Booking")

class CorporateTravelRequest(Base):
    __tablename__ = "corporate_travel_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    employee_name: Mapped[str] = mapped_column(String(100), nullable=False)
    employee_email: Mapped[str] = mapped_column(String(100), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    destination: Mapped[str] = mapped_column(String(100), nullable=False)
    travel_dates: Mapped[str] = mapped_column(String(50), nullable=False)
    estimated_budget: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Pending") # Pending, Approved, Rejected
    policy_compliant: Mapped[bool] = mapped_column(Boolean, default=True)
    policy_violations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewer_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    timestamp: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    actor: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. Front Desk Agent, Revenue Manager, Corporate Admin
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    target_type: Mapped[str] = mapped_column(String(50), nullable=False) # Room, Rate, Booking, CorporateRequest
    target_id: Mapped[str] = mapped_column(String(50), nullable=False)
    details: Mapped[str] = mapped_column(Text, nullable=False)

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="Front Desk Staff")
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class DistributionChannel(Base):
    __tablename__ = "distribution_channels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. Booking.com, Expedia, Amadeus GDS, Google Hotels
    channel_type: Mapped[str] = mapped_column(String(50), default="OTA") # OTA, GDS, Metasearch, Direct
    status: Mapped[str] = mapped_column(String(30), default="Active") # Active, Paused, Syncing
    commission_rate: Mapped[float] = mapped_column(Float, default=15.0)
    active_listings: Mapped[int] = mapped_column(Integer, default=10)
    sync_health: Mapped[str] = mapped_column(String(50), default="100% Synced")
    net_revenue: Mapped[float] = mapped_column(Float, default=12450.0)
    cancellation_rate: Mapped[float] = mapped_column(Float, default=4.2)
    last_sync: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class MarketplaceItem(Base):
    __tablename__ = "marketplace_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False) # Flight, Car Rental, Activity, Transfer, Dining, Dynamic Package
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    provider: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    rating: Mapped[float] = mapped_column(Float, default=4.8)
    availability: Mapped[str] = mapped_column(String(50), default="Instant Confirmation")
    image_url: Mapped[str] = mapped_column(String(255), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    policy: Mapped[str] = mapped_column(String(200), default="Free cancellation up to 24h prior")

class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    guest_name: Mapped[str] = mapped_column(String(100), nullable=False)
    room_number: Mapped[str] = mapped_column(String(20), nullable=False)
    service_type: Mapped[str] = mapped_column(String(50), nullable=False) # Room Service, Housekeeping, Maintenance, Luggage Assistance, Concierge, Digital Key
    priority: Mapped[str] = mapped_column(String(20), default="Medium") # Low, Medium, High, Urgent
    status: Mapped[str] = mapped_column(String(30), default="Pending") # Pending, In Progress, Completed, Escalated
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class IoTDeviceState(Base):
    __tablename__ = "iot_device_states"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    room_number: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    temperature: Mapped[float] = mapped_column(Float, default=21.5)
    lights: Mapped[bool] = mapped_column(Boolean, default=True)
    ac_mode: Mapped[str] = mapped_column(String(20), default="Cool") # Cool, Eco, Warm, Off
    dnd: Mapped[bool] = mapped_column(Boolean, default=False)
    digital_key_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_updated: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class LoyaltyMember(Base):
    __tablename__ = "loyalty_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    member_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    guest_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    tier: Mapped[str] = mapped_column(String(30), default="Platinum") # Silver, Gold, Platinum, Diamond Elite
    points_balance: Mapped[int] = mapped_column(Integer, default=28450)
    lifetime_points: Mapped[int] = mapped_column(Integer, default=64000)
    wallet_balance: Mapped[float] = mapped_column(Float, default=420.0) # In USD credits
    perks: Mapped[str] = mapped_column(Text, default="Complimentary room upgrade, 4PM late checkout, High-speed Wi-Fi 6E, Club Lounge access")

class ExpenseRecord(Base):
    __tablename__ = "expense_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    employee_name: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False) # Flight, Hotel, Meals, Transport, Conference
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    merchant: Mapped[str] = mapped_column(String(100), nullable=False)
    date: Mapped[str] = mapped_column(String(30), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Verified") # Submitted, Verified, Reimbursed
    policy_check: Mapped[str] = mapped_column(String(30), default="Compliant") # Compliant, Flagged
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class CompetitorRate(Base):
    __tablename__ = "competitor_rates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    competitor_name: Mapped[str] = mapped_column(String(100), nullable=False)
    room_type: Mapped[str] = mapped_column(String(50), nullable=False)
    competitor_rate: Mapped[float] = mapped_column(Float, nullable=False)
    our_rate: Mapped[float] = mapped_column(Float, nullable=False)
    parity_difference: Mapped[float] = mapped_column(Float, default=0.0)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
