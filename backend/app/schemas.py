from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, EmailStr

class RoomStatusUpdate(BaseModel):
    status: str # Available, Occupied, Dirty, Maintenance
    housekeeping_note: Optional[str] = None
    guest_name: Optional[str] = None

class RoomOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    property_id: int
    room_number: str
    room_type: str
    status: str
    floor: int
    base_price: float
    current_guest_name: Optional[str] = None
    housekeeping_note: Optional[str] = None

class PropertyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    brand: str
    location: str
    total_rooms: int

class BookingCreate(BaseModel):
    guest_name: str
    guest_email: str
    property_id: int = 1
    room_unit_id: Optional[int] = None
    room_type: str
    check_in_date: str
    check_out_date: str
    total_amount: float

class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    pnr: str
    guest_name: str
    guest_email: str
    property_id: int
    room_unit_id: Optional[int] = None
    room_type: str
    check_in_date: str
    check_out_date: str
    total_amount: float
    status: str
    created_at: datetime

class PaymentCreate(BaseModel):
    booking_id: int
    payment_method: str = "Card"
    card_last4: Optional[str] = None

class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    amount: float
    currency: str
    payment_method: str
    card_last4: Optional[str] = None
    status: str
    gateway: str
    transaction_id: str
    created_at: datetime

class PaymentCompletion(BaseModel):
    success: bool = True

class EmailNotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    recipient: str
    event_type: str
    subject: str
    status: str
    provider_message_id: Optional[str] = None
    created_at: datetime

class DynamicRateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    room_type: str
    date_str: str
    current_rate: float
    ai_recommended_rate: float
    confidence_score: float
    demand_factor: str
    status: str
    overridden_by: Optional[str] = None
    override_reason: Optional[str] = None

class RateOverrideRequest(BaseModel):
    rate_id: int
    new_rate: float
    override_reason: str
    actor: str = "Revenue Manager"

class CorporateRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_name: str
    employee_email: str
    department: str
    destination: str
    travel_dates: str
    estimated_budget: float
    status: str
    policy_compliant: bool
    policy_violations: Optional[str] = None
    reviewer_notes: Optional[str] = None
    created_at: datetime

class CorporateRequestAction(BaseModel):
    action: str # Approved or Rejected
    reviewer_notes: Optional[str] = None
    actor: str = "Corporate Travel Admin"

class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: datetime
    actor: str
    action: str
    target_type: str
    target_id: str
    details: str

class MetricsSummary(BaseModel):
    occupancy_percentage: float
    revpar: float
    adr: float
    total_rooms: int
    occupied_rooms: int
    available_rooms: int
    dirty_rooms: int
    maintenance_rooms: int
    pending_approvals: int

class UserSignup(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "Front Desk Staff"
    department: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: str
    department: Optional[str] = None
    is_active: bool
    created_at: datetime

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Distribution & Channels
class DistributionChannelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    channel_type: str
    status: str
    commission_rate: float
    active_listings: int
    sync_health: str
    net_revenue: float
    cancellation_rate: float
    last_sync: datetime

class ChannelSyncRequest(BaseModel):
    status: Optional[str] = None
    sync_health: Optional[str] = None

class StopSellRequest(BaseModel):
    channel_id: Optional[int] = None
    room_type: Optional[str] = None
    stop_sell: bool = True

# Marketplace
class MarketplaceItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: str
    title: str
    provider: str
    location: str
    price: float
    currency: str
    rating: float
    availability: str
    image_url: str
    description: str
    policy: str

class MarketplaceBookingCreate(BaseModel):
    item_id: int
    traveler_name: str
    traveler_email: str
    quantity: int = 1
    booking_date: str
    special_requests: Optional[str] = None

# Service Requests & Concierge
class ServiceRequestCreate(BaseModel):
    guest_name: str
    room_number: str
    service_type: str
    priority: str = "Medium"
    notes: str = ""

class ServiceRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    guest_name: str
    room_number: str
    service_type: str
    priority: str
    status: str
    notes: str
    created_at: datetime

class ServiceRequestUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

# IoT Room Controls
class IoTDeviceStateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    room_number: str
    temperature: float
    lights: bool
    ac_mode: str
    dnd: bool
    digital_key_active: bool
    last_updated: datetime

class IoTDeviceControl(BaseModel):
    temperature: Optional[float] = None
    lights: Optional[bool] = None
    ac_mode: Optional[str] = None
    dnd: Optional[bool] = None
    digital_key_active: Optional[bool] = None

# Loyalty & Wallet
class LoyaltyMemberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    member_number: str
    guest_name: str
    email: str
    tier: str
    points_balance: int
    lifetime_points: int
    wallet_balance: float
    perks: str

class LoyaltyRedeemRequest(BaseModel):
    points: int
    reward_type: str

# Expenses & Corporate Policies
class ExpenseRecordCreate(BaseModel):
    employee_name: str
    category: str
    amount: float
    currency: str = "USD"
    merchant: str
    date: str
    notes: Optional[str] = None

class ExpenseRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_name: str
    category: str
    amount: float
    currency: str
    merchant: str
    date: str
    status: str
    policy_check: str
    notes: Optional[str] = None

# Competitor Rates
class CompetitorRateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    competitor_name: str
    room_type: str
    competitor_rate: float
    our_rate: float
    parity_difference: float
    updated_at: datetime

# AI Assistant & Concierge
class AIChatMessage(BaseModel):
    role: str # "user", "assistant", "system"
    content: str

class AIChatRequest(BaseModel):
    messages: List[AIChatMessage]
    guest_name: Optional[str] = None
    room_number: Optional[str] = None
    persona: Optional[str] = "Concierge" # "Concierge", "Revenue_Advisor", "Policy_Auditor", "Operations_Bot"

class AIChatResponse(BaseModel):
    role: str = "assistant"
    content: str
    suggestions: List[str] = []
    action_type: Optional[str] = None
    action_data: Optional[dict] = None

class AIInsightOut(BaseModel):
    id: str
    category: str
    headline: str
    details: str
    confidence: float
    urgency: str # "High", "Medium", "Info"
    suggested_action: str

# Razorpay Integration Schemas
class RazorpayConfigOut(BaseModel):
    key_id: str
    currency: str = "INR"
    name: str = "Nexgile-TravAI Grand Resort"
    test_mode: bool = True

class CreditPackageOut(BaseModel):
    id: str
    title: str
    credits: int
    price_inr: float
    bonus: int
    badge: str

class RazorpayOrderCreate(BaseModel):
    amount_inr: float
    package_id: Optional[str] = None
    booking_id: Optional[int] = None
    guest_email: Optional[str] = None
    notes: Optional[dict] = None

class RazorpayOrderOut(BaseModel):
    order_id: str
    amount: int
    currency: str = "INR"
    key_id: str
    package_id: Optional[str] = None

class RazorpayVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    package_id: Optional[str] = None
    booking_id: Optional[int] = None
    guest_email: Optional[str] = None
    amount_inr: Optional[float] = None

class RazorpayVerifyResponse(BaseModel):
    status: str
    payment_id: str
    credits_added: float
    new_wallet_balance: float
    message: str

# Concierge Experience Matching https://nexgile-travai.vercel.app/concierge
class ConciergeWelcomeResponse(BaseModel):
    role: str
    assistantName: str
    welcomeMessage: str
    quickActions: List[dict]
    active_stay: Optional[dict] = None

class ConciergeChatRequest(BaseModel):
    message: str
    reservation_id: Optional[str] = None
    history: List[dict] = []
    guest_name: Optional[str] = None

class ConciergeChatResponse(BaseModel):
    reply: str
    action_type: Optional[str] = None
    payload: Optional[dict] = None
    suggestions: List[str] = []

