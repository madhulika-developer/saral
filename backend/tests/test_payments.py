"""
Unit tests for payments engine.
Tests payment timeline stages, money-deducted-unpaid handling, and multilingual complaint generation.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from payments import get_user_payments, generate_complaint_text

def test_user_payments_retrieval():
    payments = get_user_payments("user_1", lang="en")
    assert len(payments) >= 3

    # Check for the uncertain transaction
    uncertain = next((p for p in payments if p["state_category"] == "money_deducted_unpaid"), None)
    assert uncertain is not None
    assert uncertain["amount"] == 1641.0
    assert len(uncertain["stages"]) == 4

    # Verify 4 stages: Initiated, Bank processing, Gateway received, Posted to ledger
    stage_names = [s["stage"] for s in uncertain["stages"]]
    assert "initiated" in stage_names
    assert "bank_processing" in stage_names
    assert "gateway_received" in stage_names
    assert "posted_to_account" in stage_names

def test_complaint_generator_multilingual():
    # English complaint
    complaint_en = generate_complaint_text("PAY-2026-88102", lang="en")
    assert "Grievance" in complaint_en["subject"]
    assert "APCPDCL-VJA-84920" in complaint_en["body"]
    assert "UPI/419208310928/CR" in complaint_en["body"]
    assert "₹1641.00" in complaint_en["body"]

    # Telugu complaint
    complaint_te = generate_complaint_text("PAY-2026-88102", lang="te")
    assert "ఫిర్యాదు" in complaint_te["subject"]
    assert "వినియోగదారు" in complaint_te["body"]
    assert "APCPDCL-VJA-84920" in complaint_te["body"]

    # Hindi complaint
    complaint_hi = generate_complaint_text("PAY-2026-88102", lang="hi")
    assert "शिकायत" in complaint_hi["subject"]
    assert "उपभोक्ता" in complaint_hi["body"]
