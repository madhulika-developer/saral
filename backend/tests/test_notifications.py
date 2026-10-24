"""
Unit tests for notification engine:
Validates deadline rules, stuck payment detection, offline event mapping,
deduplication by event_id, quiet hours, and outage feedback escalation.
"""

import sys
from pathlib import Path
from datetime import datetime
sys.path.insert(0, str(Path(__file__).parent.parent))

from notifications import (
    get_notifications,
    mark_notification_read,
    mark_all_read,
    delete_notification,
    get_preferences,
    update_preferences,
    is_in_quiet_hours,
    simulate_event,
    handle_outage_feedback,
    add_or_update_notification
)

def test_get_notifications_with_preferences():
    # User 1 has deadlines, payments, outages enabled
    notifs = get_notifications("user_1", lang="en")
    assert len(notifs) >= 3
    categories = [n["category"] for n in notifs]
    assert "bill" in categories or "payment" in categories

def test_deduplication_by_event_id():
    event_id = "TEST_DEDUP_EVENT_1001"
    notif1 = {
        "user_id": "user_1",
        "type": "deadline",
        "category": "bill",
        "title": "First Version",
        "message": "First message",
        "event_id": event_id,
        "created_at": datetime.now().isoformat()
    }
    notif2 = {
        "user_id": "user_1",
        "type": "deadline",
        "category": "bill",
        "title": "Updated Version",
        "message": "Updated message",
        "event_id": event_id,
        "created_at": datetime.now().isoformat()
    }

    add_or_update_notification(notif1, broadcast=False)
    add_or_update_notification(notif2, broadcast=False)

    user_notifs = get_notifications("user_1", lang="en")
    matching = [n for n in user_notifs if n.get("event_id") == event_id]
    assert len(matching) == 1
    assert matching[0]["title"] == "Updated Version"

def test_stuck_payment_simulation():
    res = simulate_event("user_1", "payment_pending")
    assert res["type"] == "payment_pending"
    assert "10 mins" in res["title"]

def test_offline_rejected_reasons():
    res = simulate_event("user_1", "offline_rejected")
    assert res["type"] == "offline_rejected"
    assert "72 hours" in res["message"] or "expired" in res["message"].lower()
    assert res["metadata"]["reason"] == "expired"

def test_overdue_late_fee_computation():
    res = simulate_event("user_1", "overdue")
    assert res["type"] == "deadline"
    assert "Late Fee" in res["title"] or "50.00" in res["title"]
    assert res["metadata"]["late_fee"] == 50.0

def test_quiet_hours_filtering():
    prefs = {
        "quiet_hours": {
            "enabled": True,
            "start": "22:00",
            "end": "07:00"
        }
    }
    # Test during night (23:30)
    night_time = datetime(2026, 7, 10, 23, 30)
    assert is_in_quiet_hours(prefs, night_time) is True

    # Test during afternoon (14:30)
    day_time = datetime(2026, 7, 10, 14, 30)
    assert is_in_quiet_hours(prefs, day_time) is False

def test_outage_feedback_escalation():
    # When user says "No" (supply not fixed), ticket reopens & escalates
    outage_id = "OUT-1019"
    res = handle_outage_feedback(outage_id, is_fixed=False, user_id="user_1")
    assert res["status"] == "escalated_reopened"
    assert "escalated" in res["message"].lower()

    # Verify notification created
    notifs = get_notifications("user_1", lang="en")
    escalated = next((n for n in notifs if n.get("type") == "outage_escalated"), None)
    assert escalated is not None
    assert "AEE" in escalated["message"] or "Escalated" in escalated["title"]
