import asyncio
import datetime
from app.database import AsyncSessionLocal, engine, Base
from app import models

async def seed_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Create Property
        property_1 = models.Property(
            id=1,
            name="Nexgile-TravAI Grand Resort & Convention Center",
            brand="Nexgile Flagship Luxury Collection",
            location="Silicon Valley Financial District, San Francisco",
            total_rooms=10
        )
        db.add(property_1)
        await db.flush()

        # 2. Seed 10 Room Units
        rooms_data = [
            {"room_number": "101", "room_type": "Executive Suite", "status": "Occupied", "floor": 1, "base_price": 450.0, "guest": "Alexander Wright", "note": "VIP Guest - Late checkout requested"},
            {"room_number": "102", "room_type": "Deluxe King", "status": "Available", "floor": 1, "base_price": 280.0, "guest": None, "note": "Inspected & ready for check-in"},
            {"room_number": "103", "room_type": "Deluxe Double", "status": "Dirty", "floor": 1, "base_price": 260.0, "guest": None, "note": "Deep cleaning in progress by Housekeeping Team B"},
            {"room_number": "104", "room_type": "Studio Suite", "status": "Occupied", "floor": 1, "base_price": 340.0, "guest": "Sophia Chen", "note": "Corporate billing setup"},
            {"room_number": "201", "room_type": "Presidential Suite", "status": "Available", "floor": 2, "base_price": 1200.0, "guest": None, "note": "Complimentary champagne ready in bar"},
            {"room_number": "202", "room_type": "Executive Suite", "status": "Maintenance", "floor": 2, "base_price": 460.0, "guest": None, "note": "HVAC filter replacement in progress"},
            {"room_number": "203", "room_type": "Deluxe King", "status": "Occupied", "floor": 2, "base_price": 290.0, "guest": "Marcus Vance", "note": "High floor request honored"},
            {"room_number": "204", "room_type": "Studio Suite", "status": "Available", "floor": 2, "base_price": 350.0, "guest": None, "note": "Ready for check-in"},
            {"room_number": "301", "room_type": "Penthouse Suite", "status": "Available", "floor": 3, "base_price": 1850.0, "guest": None, "note": "Private terrace view clean"},
            {"room_number": "302", "room_type": "Deluxe King", "status": "Dirty", "floor": 3, "base_price": 280.0, "guest": None, "note": "Check-out completed 14:00 - Pending turn"},
        ]

        room_objs = []
        for r in rooms_data:
            room_obj = models.RoomUnit(
                property_id=1,
                room_number=r["room_number"],
                room_type=r["room_type"],
                status=r["status"],
                floor=r["floor"],
                base_price=r["base_price"],
                current_guest_name=r["guest"],
                housekeeping_note=r["note"]
            )
            db.add(room_obj)
            room_objs.append(room_obj)

        await db.flush()

        # 3. Seed 3 Active Bookings
        bookings_data = [
            {
                "pnr": "NXG-A89F4B",
                "guest_name": "Alexander Wright",
                "guest_email": "a.wright@techcorp.io",
                "property_id": 1,
                "room_unit_id": room_objs[0].id,
                "room_type": "Executive Suite",
                "check_in_date": "2026-09-08",
                "check_out_date": "2026-09-12",
                "total_amount": 1800.0,
                "status": "Confirmed"
            },
            {
                "pnr": "NXG-77E21C",
                "guest_name": "Sophia Chen",
                "guest_email": "sophia.chen@globalinnovations.com",
                "property_id": 1,
                "room_unit_id": room_objs[3].id,
                "room_type": "Studio Suite",
                "check_in_date": "2026-09-07",
                "check_out_date": "2026-09-10",
                "total_amount": 1020.0,
                "status": "Confirmed"
            },
            {
                "pnr": "NXG-91C08E",
                "guest_name": "Marcus Vance",
                "guest_email": "m.vance@venturecap.com",
                "property_id": 1,
                "room_unit_id": room_objs[6].id,
                "room_type": "Deluxe King",
                "check_in_date": "2026-09-08",
                "check_out_date": "2026-09-15",
                "total_amount": 2030.0,
                "status": "Confirmed"
            }
        ]

        for b in bookings_data:
            db.add(models.Booking(**b))

        # 4. Seed 4 Dynamic Pricing Recommendations
        rates_data = [
            {
                "room_type": "Executive Suite",
                "date_str": "2026-09-09",
                "current_rate": 450.0,
                "ai_recommended_rate": 535.0,
                "confidence_score": 0.94,
                "demand_factor": "Surge: AI & Tech Summit",
                "status": "AI Proposed"
            },
            {
                "room_type": "Presidential Suite",
                "date_str": "2026-09-09",
                "current_rate": 1200.0,
                "ai_recommended_rate": 1450.0,
                "confidence_score": 0.88,
                "demand_factor": "High Premium Pace",
                "status": "AI Proposed"
            },
            {
                "room_type": "Deluxe King",
                "date_str": "2026-09-09",
                "current_rate": 280.0,
                "ai_recommended_rate": 315.0,
                "confidence_score": 0.96,
                "demand_factor": "Competitor Rate Increase (+18%)",
                "status": "AI Proposed"
            },
            {
                "room_type": "Penthouse Suite",
                "date_str": "2026-09-10",
                "current_rate": 1850.0,
                "ai_recommended_rate": 2100.0,
                "confidence_score": 0.91,
                "demand_factor": "Weekend Luxury Inflow",
                "status": "AI Proposed"
            }
        ]

        for r in rates_data:
            db.add(models.DynamicRate(**r))

        # 5. Seed 3 Corporate Travel Requests
        corporate_data = [
            {
                "employee_name": "David Sterling",
                "employee_email": "d.sterling@fintech.io",
                "department": "Global Product Management",
                "destination": "San Francisco, CA",
                "travel_dates": "2026-09-15 to 2026-09-18",
                "estimated_budget": 1450.0,
                "status": "Pending",
                "policy_compliant": True,
                "policy_violations": None,
                "reviewer_notes": None
            },
            {
                "employee_name": "Elena Rostova",
                "employee_email": "e.rostova@quantum.ai",
                "department": "AI Research & Development",
                "destination": "San Jose Convention Hub",
                "travel_dates": "2026-09-20 to 2026-09-24",
                "estimated_budget": 2890.0,
                "status": "Pending",
                "policy_compliant": False,
                "policy_violations": "Exceeds standard nightly suite cap by $140/night",
                "reviewer_notes": "Requires Managerial Exception Approval"
            },
            {
                "employee_name": "Jonathan Miller",
                "employee_email": "j.miller@apexcapital.org",
                "department": "Enterprise Sales",
                "destination": "San Francisco Downtown",
                "travel_dates": "2026-09-11 to 2026-09-13",
                "estimated_budget": 890.0,
                "status": "Approved",
                "policy_compliant": True,
                "policy_violations": None,
                "reviewer_notes": "Approved under preferred vendor tier rate."
            }
        ]

        for c in corporate_data:
            db.add(models.CorporateTravelRequest(**c))

        # 6. Seed Initial Audit Log Entries
        audit_entries = [
            models.AuditLog(
                actor="System Initialization",
                action="SEED_DATABASE",
                target_type="System",
                target_id="0",
                details="Initialized Nexgile-TravAI multi-tenant database schema and demo records.",
                timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=30)
            ),
            models.AuditLog(
                actor="AI Demand Engine v2.4",
                action="GENERATE_RECOMMENDATION",
                target_type="DynamicRate",
                target_id="Executive Suite",
                details="Generated surge rate recommendation of $535.00 (+18.8%) based on regional Tech Summit demand signals.",
                timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=15)
            )
        ]

        for a in audit_entries:
            db.add(a)

        await db.commit()
        print("Database successfully seeded with 10 rooms, 3 bookings, 4 AI pricing recommendations, and 3 corporate requests!")

if __name__ == "__main__":
    asyncio.run(seed_data())
