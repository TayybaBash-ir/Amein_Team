from __future__ import annotations

from typing import Any, Dict, List


def _weight_delta(entry: Dict[str, Any]) -> float | None:
    value = entry.get("weight_change")
    if isinstance(value, (int, float)):
        return float(value)

    previous = entry.get("previous_weight")
    current = entry.get("new_weight", entry.get("weight"))
    if isinstance(previous, (int, float)) and isinstance(current, (int, float)):
        return float(current) - float(previous)
    return None


def analyze_feedback(
    feedback_text: str,
    goal: str,
    weight_change: float,
    feedback_history: List[Dict[str, Any]] | None = None,
) -> Dict[str, Any]:
    """Apply small, explainable adjustments using a user's saved check-in trend.

    This deliberately does not call the LLM or claim to train a model. Weight
    changes are noisy, so calorie adjustments require a three-check-in trend,
    except when loss is unusually fast. The UI stores the records locally and
    sends the recent history with each check-in.
    """
    past_deltas = [
        delta
        for entry in (feedback_history or [])[-10:]
        if isinstance(entry, dict)
        and (not entry.get("goal") or str(entry.get("goal")).casefold() == str(goal).casefold())
        and (delta := _weight_delta(entry)) is not None
    ]
    deltas = [*past_deltas, float(weight_change)][-3:]
    trend = sum(deltas) / len(deltas)
    goal_key = (goal or "maintain").casefold()
    multiplier = 1.0
    reason = ""

    if "lose" in goal_key or "loss" in goal_key:
        if trend < -0.75:
            multiplier = 1.03
            reason = "Your recent loss is faster than the gradual pace this planner targets, so daily calories are nudged up by 3%."
        elif len(deltas) == 3 and trend > -0.1:
            multiplier = 0.98
            reason = "Your last three check-ins show little weight loss, so daily calories are nudged down by 2%."
    elif "gain" in goal_key or "muscle" in goal_key:
        if len(deltas) == 3 and trend < 0.1:
            multiplier = 1.03
            reason = "Your last three check-ins show little weight gain, so daily calories are nudged up by 3%."
        elif trend > 0.75:
            multiplier = 0.98
            reason = "Your recent gain is faster than the gradual pace this planner targets, so daily calories are nudged down by 2%."
    elif trend < -0.4:
        multiplier = 1.02
        reason = "Your recent weight is trending down, so daily calories are nudged up by 2% toward maintenance."
    elif trend > 0.4:
        multiplier = 0.98
        reason = "Your recent weight is trending up, so daily calories are nudged down by 2% toward maintenance."

    text = (feedback_text or "").casefold()
    reports_hunger = any(word in text for word in ("hungry", "starving", "not full", "hunger"))
    denies_hunger = any(phrase in text for phrase in ("not hungry", "no hunger", "not starving", "not feeling hungry"))
    reports_low_energy = any(word in text for word in ("low energy", "tired", "weak", "exhausted"))
    denies_low_energy = any(phrase in text for phrase in ("not tired", "not weak", "no fatigue", "not exhausted"))

    if reports_hunger and not denies_hunger:
        macro_tweak = "higher_protein"
    elif reports_low_energy and not denies_low_energy:
        macro_tweak = "higher_carb"
    else:
        macro_tweak = "none"

    if not reason:
        if len(deltas) < 3:
            reason = "Check-in saved. Keep recording weekly weight and feedback; the planner waits for three check-ins before adjusting calories for a small trend."
        else:
            reason = "Your recent weight trend is within the planner's adjustment range, so the calorie target stays the same."
    if macro_tweak != "none":
        reason += " Your feedback also suggests a small macro adjustment."

    return {
        "recommended_tdee_multiplier": multiplier,
        "macro_tweak": macro_tweak,
        "explanation": reason,
        "history_points_used": len(deltas),
        "weight_trend_kg_per_checkin": round(trend, 2),
    }
