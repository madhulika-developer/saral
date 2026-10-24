"""
Unit tests for offline fallback chatbot intents in English, Telugu, and Hindi.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fallback_bot import handle_fallback_intent, detect_language

def test_language_detection():
    assert detect_language("నా కరెంట్ బిల్లు ఎందుకు పెరిగింది?") == "te"
    assert detect_language("मेरा बिजली बिल इतना ज्यादा क्यों आया?") == "hi"
    assert detect_language("Why did my electricity bill double?") == "en"
    assert detect_language("என் மின்சாரக் கட்டணம் ஏன் அதிகம்?") == "ta"

def test_bill_explanation_intents():
    # English
    res_en = handle_fallback_intent("Why did my bill double?", user_id="user_1", lang="en")
    assert "₹1,641" in res_en["text"] or "285 units" in res_en["text"]
    assert len(res_en["actions"]) > 0
    assert len(res_en["suggestions"]) == 4

    # Telugu
    res_te = handle_fallback_intent("బిల్లు ఎందుకు పెరిగింది?", user_id="user_1", lang="te")
    assert "₹810" in res_te["text"] or "APCPDCL" in res_te["text"]
    assert len(res_te["actions"]) > 0

    # Hindi
    res_hi = handle_fallback_intent("बिल इतना ज्यादा क्यों आया?", user_id="user_1", lang="hi")
    assert "₹810" in res_hi["text"] or "स्लैब" in res_hi["text"]

def test_payment_status_intents():
    # English
    res_en = handle_fallback_intent("Where is my payment? Money deducted but bill unpaid", user_id="user_1", lang="en")
    assert "UPI/419208310928/CR" in res_en["text"]
    assert "₹1,641" in res_en["text"]
    action_labels = [a["label"] for a in res_en["actions"]]
    assert any("Complaint" in l or "Track" in l for l in action_labels)

    # Telugu
    res_te = handle_fallback_intent("డబ్బులు కట్ అయ్యాయి కానీ బిల్ ఇంకా పెండింగ్ ఉంది", user_id="user_1", lang="te")
    assert "UPI/419208310928/CR" in res_te["text"]
    assert "మళ్లీ చెల్లించవద్దు" in res_te["text"]

def test_outage_reporting_intent():
    # Telugu outage reporting
    res_te = handle_fallback_intent("బెంజ్ సర్కిల్ లో నీళ్లు రావడం లేదు రిపోర్ట్ చెయ్యి", user_id="user_1", lang="te")
    assert "టికెట్" in res_te["text"] or "సమస్య" in res_te["text"]
    assert "Benz Circle" in res_te["text"]

def test_tariff_and_savings_intent():
    res = handle_fallback_intent("How can I reduce my bill?", user_id="user_1", lang="en")
    assert "24°C" in res["text"] or "Slab" in res["text"]

def test_alerts_intent():
    # English
    res_en = handle_fallback_intent("What alerts do I have?", user_id="user_1", lang="en")
    assert "alerts" in res_en["text"].lower() or "notification" in res_en["text"].lower()
    assert any(a["payload"] == "/notifications" for a in res_en["actions"])

    # Telugu
    res_te = handle_fallback_intent("నాకు ఏ అలర్ట్‌లు ఉన్నాయి?", user_id="user_1", lang="te")
    assert "అలర్ట్" in res_te["text"] or "నోటిఫికేషన్" in res_te["text"]

def test_rejected_payment_intent():
    res = handle_fallback_intent("Why was my payment rejected?", user_id="user_1", lang="en")
    assert "OFF-TOK-88190" in res["text"]
    assert "expired" in res["text"].lower() or "72 hours" in res["text"]

def test_reminder_preference_intent():
    res = handle_fallback_intent("Remind me 3 days before my due date", user_id="user_1", lang="en")
    assert "3 days" in res["text"] or "Reminder" in res["text"]
    assert any(a["payload"] == "/preferences" for a in res["actions"])

