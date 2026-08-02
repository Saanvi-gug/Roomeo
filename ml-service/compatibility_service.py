"""
RoomieMatch — Compatibility Scoring Service (FastAPI)

Run with:
    pip install fastapi uvicorn scikit-learn numpy
    uvicorn compatibility_service:app --reload

Then open http://127.0.0.1:8000/docs to test it manually (Swagger UI).

MATCHING LOGIC OVERVIEW
------------------------
1. HARD FILTERS (candidate is excluded entirely if any of these fail):
   - Gender preference (both directions must be satisfied)
   - City (must match)
   - Locality distance (must be within 5km)
   - Budget (must be within a set range of each other)
   - Smoking comfort (bidirectional: both people must be okay with the other's habit)
   - Drinking comfort (same, bidirectional)
   - Priority fields (soft threshold — must be "close enough", not exact)

2. SCORING (only run on candidates who pass all hard filters above):
   - Weighted similarity across: food preference, socialising level,
     guest frequency, cleanliness, sleep condition, noise/study habits
   - Priority fields get extra weight in this score too

3. Only candidates scoring 80% or higher get returned to the frontend.
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from math import radians, sin, cos, sqrt, atan2
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

MATCH_THRESHOLD = 0.80          # only show matches at or above 80%
MAX_DISTANCE_KM = 5             # locality distance hard filter
BUDGET_TOLERANCE = 3000         # rupees, adjust as needed
PRIORITY_WEIGHT_MULTIPLIER = 2.5
MAX_PRIORITY_FIELDS = 3


# ---------------------------------------------------------
# 1. Locality -> lat/lng lookup (hardcoded for hackathon MVP)
# ---------------------------------------------------------
# Fill this in with real localities for your target city.
# Get coordinates by right-clicking a spot on Google Maps.

AREA_COORDINATES = {
    "Saket": (28.5245, 77.2066),
    "Hauz Khas": (28.5494, 77.2001),
    "Dwarka": (28.5921, 77.0460),
    "Rohini": (28.7495, 77.0565),
    "Lajpat Nagar": (28.5677, 77.2434),
    "Karol Bagh": (28.6519, 77.1909),
    # add more localities as needed
}


def calculate_distance_km(coord1, coord2) -> float:
    lat1, lon1 = radians(coord1[0]), radians(coord1[1])
    lat2, lon2 = radians(coord2[0]), radians(coord2[1])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return 6371 * c  # Earth radius in km


# ---------------------------------------------------------
# 2. Profile shape
# ---------------------------------------------------------

class Profile(BaseModel):
    # --- hard filter fields ---
    gender: str                      # "male" / "female" / "other"
    preferredRoommateGender: str      # "male" / "female" / "any"
    city: str
    locality: str                    # must be a key in AREA_COORDINATES
    budget: float

    smoker: str                      # "yes" / "no" / "occasional"
    okayWithSmoker: bool
    drinker: str                     # "yes" / "no" / "occasional"
    okayWithDrinker: bool

    jobStatus: str                   # "student" / "working" / "both"
    preferredRoommateJobStatus: str  # "student" / "working" / "any"
    workShift: Optional[str] = None       # "day" / "night" / "rotational" — asked to EVERYONE (students with evening/night classes have this too, not just working professionals)
    okayWithDifferentShift: Optional[bool] = None
    workMode: Optional[str] = None        # "wfh" / "wfo" / "hybrid" — only meaningful if jobStatus is "working" or "both"
    needsDaytimePrivacy: bool = False     # "I'd prefer the house quiet/empty during my work hours"

    # --- scored fields ---
    foodPref: str                    # "veg" / "non-veg" / "eggetarian" / "vegan"
    socialLevel: int                 # 1-5
    guestsFreq: str                  # "never" / "occasionally" / "often"
    cleanliness: int                 # 1-5
    sleepCondition: str              # "lights-on" / "lights-off" / "flexible"
    noiseStudyHabits: str            # "silent" / "music" / "group"


class MatchRequest(BaseModel):
    userProfile: Profile
    candidateProfile: Profile
    priorityFields: List[str] = []   # up to 3, from the SCORED field list only


# ---------------------------------------------------------
# 3. Scored-field config (used only after hard filters pass)
# ---------------------------------------------------------

SCORED_FIELD_CONFIG = {
    "foodPref":         {"type": "categorical", "weight": 1.0},
    "socialLevel":      {"type": "numeric", "scale": 5, "weight": 0.7},
    "guestsFreq":       {"type": "categorical", "weight": 0.6},
    "cleanliness":      {"type": "numeric", "scale": 5, "weight": 1.0},
    "sleepCondition":   {"type": "categorical", "weight": 0.9},
    "noiseStudyHabits": {"type": "categorical", "weight": 0.7},
}

# Soft-threshold tolerance used ONLY when a numeric field is marked as priority
PRIORITY_NUMERIC_TOLERANCE = 1


# ---------------------------------------------------------
# 4. Hard filters
# ---------------------------------------------------------

def gender_filter_passes(user: dict, candidate: dict) -> bool:
    user_ok = user["preferredRoommateGender"] in ("any", candidate["gender"])
    candidate_ok = candidate["preferredRoommateGender"] in ("any", user["gender"])
    return user_ok and candidate_ok


def city_filter_passes(user: dict, candidate: dict) -> bool:
    return user["city"] == candidate["city"]


def distance_filter_passes(user: dict, candidate: dict) -> bool:
    coord1 = AREA_COORDINATES.get(user["locality"])
    coord2 = AREA_COORDINATES.get(candidate["locality"])
    if coord1 is None or coord2 is None:
        return False  # unknown locality — fail safe rather than guess
    return calculate_distance_km(coord1, coord2) <= MAX_DISTANCE_KM


def locality_is_known(locality: str) -> bool:
    return locality in AREA_COORDINATES


def budget_filter_passes(user: dict, candidate: dict) -> bool:
    return abs(user["budget"] - candidate["budget"]) <= BUDGET_TOLERANCE


def habit_comfort_passes(user: dict, candidate: dict, habit: str) -> bool:
    """
    Bidirectional check for smoking/drinking.
    habit = "smoker" or "drinker"
    Each person must be okay with the other's actual habit status.
    Being okay with "occasional" is treated the same as being okay with "yes".
    """
    okay_field = f"okayWith{habit.capitalize()}"

    user_status = user[habit]
    candidate_status = candidate[habit]

    user_is_active = user_status in ("yes", "occasional")
    candidate_is_active = candidate_status in ("yes", "occasional")

    # If neither does the habit, there's nothing to check — automatically fine.
    if not user_is_active and not candidate_is_active:
        return True

    user_okay_with_candidate = (not candidate_is_active) or user[okay_field]
    candidate_okay_with_user = (not user_is_active) or candidate[okay_field]

    return user_okay_with_candidate and candidate_okay_with_user


def job_status_filter_passes(user: dict, candidate: dict) -> bool:
    user_ok = user["preferredRoommateJobStatus"] in ("any", candidate["jobStatus"])
    candidate_ok = candidate["preferredRoommateJobStatus"] in ("any", user["jobStatus"])
    return user_ok and candidate_ok


def is_working(profile: dict) -> bool:
    return profile["jobStatus"] in ("working", "both")


def shift_comfort_passes(user: dict, candidate: dict) -> bool:
    """
    Bidirectional check, same pattern as smoking/drinking.
    Shift applies to ANYONE with a regular schedule outside normal daytime hours —
    not just working professionals. A student with evening/night classes has the
    same clash potential as a night-shift worker, so this is NOT gated by jobStatus.
    If either person didn't specify a shift, or both shifts match, nothing to check.
    """
    user_shift = user.get("workShift")
    candidate_shift = candidate.get("workShift")

    if user_shift is None or candidate_shift is None:
        return True
    if user_shift == candidate_shift:
        return True

    user_okay = user.get("okayWithDifferentShift") is True
    candidate_okay = candidate.get("okayWithDifferentShift") is True
    return user_okay and candidate_okay


def daytime_privacy_filter_passes(user: dict, candidate: dict) -> bool:
    """
    One-directional check (not bidirectional like smoking/shift):
    if EITHER person needs a quiet/empty house during work hours,
    the OTHER person must not be a WFH worker.
    """
    if user.get("needsDaytimePrivacy") and candidate.get("workMode") == "wfh":
        return False
    if candidate.get("needsDaytimePrivacy") and user.get("workMode") == "wfh":
        return False
    return True


def priority_soft_filter_passes(user: dict, candidate: dict, priority_fields: List[str]) -> bool:
    for field in priority_fields:
        config = SCORED_FIELD_CONFIG[field]
        if config["type"] == "numeric":
            if abs(user[field] - candidate[field]) > PRIORITY_NUMERIC_TOLERANCE:
                return False
        else:
            if user[field] != candidate[field]:
                return False
    return True


def passes_all_hard_filters(user: dict, candidate: dict, priority_fields: List[str]) -> Optional[str]:
    """Returns None if all filters pass, otherwise a string reason for exclusion."""
    if not gender_filter_passes(user, candidate):
        return "gender preference mismatch"
    if not city_filter_passes(user, candidate):
        return "different city"
    if not locality_is_known(user["locality"]) or not locality_is_known(candidate["locality"]):
        return "locality not recognized (check spelling/casing)"
    if not distance_filter_passes(user, candidate):
        return f"localities more than {MAX_DISTANCE_KM}km apart"
    if not budget_filter_passes(user, candidate):
        return "budget too far apart"
    if not habit_comfort_passes(user, candidate, "smoker"):
        return "smoking comfort mismatch"
    if not habit_comfort_passes(user, candidate, "drinker"):
        return "drinking comfort mismatch"
    if not job_status_filter_passes(user, candidate):
        return "job status preference mismatch"
    if not shift_comfort_passes(user, candidate):
        return "work shift comfort mismatch"
    if not daytime_privacy_filter_passes(user, candidate):
        return "daytime privacy requirement not met"
    if not priority_soft_filter_passes(user, candidate, priority_fields):
        return "failed a priority field"
    return None


# ---------------------------------------------------------
# 5. Scoring (only runs on candidates who passed every hard filter)
# ---------------------------------------------------------

def build_similarity_and_ideal_vectors(user: dict, candidate: dict, priority_fields: List[str]):
    similarities = []
    ideal = []

    for field, config in SCORED_FIELD_CONFIG.items():
        weight = config["weight"]
        if field in priority_fields:
            weight *= PRIORITY_WEIGHT_MULTIPLIER

        if config["type"] == "numeric":
            diff = abs(user[field] - candidate[field]) / config["scale"]
            field_similarity = max(0.0, 1 - diff)
        else:
            field_similarity = 1.0 if user[field] == candidate[field] else 0.0

        similarities.append(field_similarity * weight)
        ideal.append(weight)

    return np.array(similarities).reshape(1, -1), np.array(ideal).reshape(1, -1)


def calculate_score_and_breakdown(user: dict, candidate: dict, priority_fields: List[str]):
    vec, ideal_vec = build_similarity_and_ideal_vectors(user, candidate, priority_fields)
    overall_score = float(cosine_similarity(vec, ideal_vec)[0][0])

    breakdown = {}
    for field, config in SCORED_FIELD_CONFIG.items():
        if config["type"] == "numeric":
            diff = abs(user[field] - candidate[field]) / config["scale"]
            breakdown[field] = round(max(0.0, 1 - diff), 2)
        else:
            breakdown[field] = 1.0 if user[field] == candidate[field] else 0.0

    return round(overall_score, 2), breakdown


# ---------------------------------------------------------
# 6. API endpoint
# ---------------------------------------------------------

@app.post("/compatibility-score")
def compatibility_score(request: MatchRequest):
    user = request.userProfile.dict()
    candidate = request.candidateProfile.dict()
    priority_fields = request.priorityFields[:MAX_PRIORITY_FIELDS]

    exclusion_reason = passes_all_hard_filters(user, candidate, priority_fields)
    if exclusion_reason:
        return {"excluded": True, "reason": exclusion_reason}

    score, breakdown = calculate_score_and_breakdown(user, candidate, priority_fields)

    if score < MATCH_THRESHOLD:
        return {"excluded": True, "reason": f"score {score} below {MATCH_THRESHOLD} threshold"}

    return {"excluded": False, "score": score, "breakdown": breakdown}


# ---------------------------------------------------------
# 7. Quick manual test
# ---------------------------------------------------------

if __name__ == "__main__":
    user_a = {
        "gender": "male", "preferredRoommateGender": "any",
        "city": "Delhi", "locality": "Saket", "budget": 15000,
        "smoker": "no", "okayWithSmoker": True,
        "drinker": "no", "okayWithDrinker": True,
        "jobStatus": "working", "preferredRoommateJobStatus": "any",
        "workShift": "day", "okayWithDifferentShift": False,
        "workMode": "wfo", "needsDaytimePrivacy": False,
        "foodPref": "veg", "socialLevel": 3, "guestsFreq": "occasionally",
        "cleanliness": 5, "sleepCondition": "lights-off", "noiseStudyHabits": "silent",
    }
    user_b = {
        "gender": "male", "preferredRoommateGender": "any",
        "city": "Delhi", "locality": "Hauz Khas", "budget": 14000,
        "smoker": "no", "okayWithSmoker": True,
        "drinker": "no", "okayWithDrinker": True,
        "jobStatus": "student", "preferredRoommateJobStatus": "any",
        "workShift": None, "okayWithDifferentShift": None,
        "workMode": None, "needsDaytimePrivacy": False,
        "foodPref": "veg", "socialLevel": 3, "guestsFreq": "occasionally",
        "cleanliness": 4, "sleepCondition": "lights-off", "noiseStudyHabits": "silent",
    }

    reason = passes_all_hard_filters(user_a, user_b, priority_fields=["foodPref", "cleanliness"])
    if reason:
        print("Excluded:", reason)
    else:
        score, breakdown = calculate_score_and_breakdown(user_a, user_b, ["foodPref", "cleanliness"])
        print("Score:", score, "Breakdown:", breakdown)