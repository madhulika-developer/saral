"""
Unit tests for billing calculation engine.
Validates exact slab math, line-item reconciliation, and why-higher increase analysis.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from billing import calculate_bill, explain_bill_increase

def test_electricity_slab_calculation():
    # Test 50 units (Lifeline slab only)
    # 50 * 2.65 = 132.50, fixed=40.0, duty=6% of 132.50 = 7.95, fsa=50 * 0.25 = 12.50
    # total = 132.50 + 40 + 7.95 + 12.50 = 192.95
    res = calculate_bill("electricity", 50)
    assert res["units"] == 50
    assert len(res["slab_breakdown"]) == 1
    assert res["slab_breakdown"][0]["amount"] == 132.50
    assert abs(res["total_amount"] - 192.95) < 0.05

def test_line_items_exact_reconciliation():
    """Critical requirement: line items must sum EXACTLY to total amount."""
    test_unit_levels = [0, 45, 100, 175, 285, 450]
    for u in test_unit_levels:
        res = calculate_bill("electricity", u)
        sum_items = round(sum(item["amount"] for item in res["line_items"]), 2)
        assert sum_items == res["total_amount"], f"Line items sum {sum_items} != total {res['total_amount']} for {u} units"

def test_water_bill_calculation():
    # 20 kL water
    # Slab 1 (0-15): 15 * 12 = 180
    # Slab 2 (15-20): 5 * 20 = 100
    # Energy/Volumetric = 280
    # Base = 80, Sewerage = 15% of 280 = 42
    # Total = 280 + 80 + 42 = 402
    res = calculate_bill("water", 20)
    assert res["units"] == 20
    assert res["energy_charge_total"] == 280.0
    sum_items = round(sum(item["amount"] for item in res["line_items"]), 2)
    assert sum_items == res["total_amount"]
    assert res["total_amount"] == 402.0

def test_explain_bill_increase_lakshmi():
    # Lakshmi user_1 electricity bill doubled from May (175 units) to June (285 units)
    explanation = explain_bill_increase("user_1", utility="electricity", lang="en")
    assert explanation["current_units"] == 285
    assert explanation["previous_units"] == 175
    assert explanation["unit_diff"] == 110
    assert explanation["amount_diff"] > 800
    assert len(explanation["reasons"]) >= 2
    # Ensure reasons are sorted by rupee impact descending
    impacts = [r["rupee_impact"] for r in explanation["reasons"]]
    assert impacts == sorted(impacts, reverse=True)

def test_multilingual_explanation_story():
    # Telugu explanation
    te_exp = explain_bill_increase("user_1", utility="electricity", lang="te")
    assert te_exp["localized_story"] is not None
    assert "₹810" in te_exp["localized_story"]["headline"]
    assert "APCPDCL" in te_exp["localized_story"]["summary"]
