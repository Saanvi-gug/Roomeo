import os
import json
import re
import urllib.request
import urllib.parse
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from math import radians, sin, cos, sqrt, atan2
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MATCH_THRESHOLD = 0.80
MAX_DISTANCE_KM = 5
BUDGET_TOLERANCE = 3000
PRIORITY_WEIGHT_MULTIPLIER = 2.5
MAX_PRIORITY_FIELDS = 3

AREA_COORDINATES = {
    "Saket": (28.5245, 77.2066),
    "Hauz Khas": (28.5494, 77.2001),
    "Dwarka": (28.5921, 77.0460),
    "Rohini": (28.7495, 77.0565),
    "Lajpat Nagar": (28.5677, 77.2434),
    "Karol Bagh": (28.6519, 77.1909),
    "Green Park": (28.5588, 77.2028),
    "Greater Kailash": (28.5416, 77.2381),
    "Vasant Kunj": (28.5245, 77.1580),
    "Janakpuri": (28.6219, 77.0878),
    "Pitampura": (28.7033, 77.1322),
    "Paschim Vihar": (28.6692, 77.1000),
    "Preet Vihar": (28.6415, 77.2950),
    "Mayur Vihar": (28.6040, 77.2985),
    "Shahdara": (28.6735, 77.2890),
    "Civil Lines": (28.6769, 77.2250),
    "Model Town": (28.7167, 77.1910),
    "Vasant Vihar": (28.5600, 77.1600),
    "Defence Colony": (28.5730, 77.2310),
    "Kalkaji": (28.5364, 77.2600),
    "Malviya Nagar": (28.5325, 77.2100),
    "Rajouri Garden": (28.6490, 77.1220),
    "Punjabi Bagh": (28.6680, 77.1310),
    "Kirti Nagar": (28.6540, 77.1500),
    "Nehru Place": (28.5491, 77.2519),
    "Okhla": (28.5355, 77.2750),
    "Chittaranjan Park": (28.5380, 77.2497),
    "Safdarjung Enclave": (28.5605, 77.1950),
    "South Extension": (28.5680, 77.2210),
    "Greater Kailash 2": (28.5335, 77.2440),
    "East of Kailash": (28.5580, 77.2490),
    "Shalimar Bagh": (28.7170, 77.1500),
    "Ashok Vihar": (28.6900, 77.1700),
    "Vivek Vihar": (28.6700, 77.3150),
    "Patel Nagar": (28.6630, 77.1680),
    "Rajinder Nagar": (28.6390, 77.1840),
    "Connaught Place": (28.6315, 77.2167),
    "Paharganj": (28.6450, 77.2167),
    "Laxmi Nagar": (28.6304, 77.2773),
    "Nirman Vihar": (28.6365, 77.2860),
    "Shakarpur": (28.6307, 77.2807),
    "Patparganj": (28.6230, 77.2900),
    "IP Extension": (28.6275, 77.3030),
    "Vasundhara Enclave": (28.6025, 77.3210),
    "New Friends Colony": (28.5675, 77.2665),
    "Jangpura": (28.5835, 77.2460),
    "Jor Bagh": (28.5890, 77.2195),
    "Lodhi Colony": (28.5880, 77.2275),
    "Khan Market": (28.6000, 77.2270),
    "Pragati Maidan": (28.6230, 77.2420),
    "Dilshad Garden": (28.6750, 77.3210),
    "Seelampur": (28.6698, 77.2660),
    "Welcome": (28.6710, 77.2770),
    "Mukherjee Nagar": (28.7045, 77.2060),
    "Burari": (28.7550, 77.2000),
    "Timarpur": (28.7050, 77.2150),
    "Wazirabad": (28.7090, 77.2210),
    "Nangloi": (28.6820, 77.0680),
    "Uttam Nagar": (28.6245, 77.0550),
    "Tilak Nagar": (28.6360, 77.0960),
    "Subhash Nagar": (28.6380, 77.1050),
    "Naraina": (28.6260, 77.1390),
    "Dhaula Kuan": (28.5915, 77.1610),
    "Munirka": (28.5570, 77.1700),
    "R.K. Puram": (28.5635, 77.1760),
}


def calculate_distance_km(coord1, coord2) -> float:
    lat1, lon1 = radians(coord1[0]), radians(coord1[1])
    lat2, lon2 = radians(coord2[0]), radians(coord2[1])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return 6371 * c


class Profile(BaseModel):
    name: Optional[str] = None
    gender: str
    preferredRoommateGender: str
    city: str
    locality: str
    budget: float
    smoker: str
    okayWithSmoker: bool
    drinker: str
    okayWithDrinker: bool
    jobStatus: str
    preferredRoommateJobStatus: str
    workShift: Optional[str] = None
    okayWithDifferentShift: Optional[bool] = None
    workMode: Optional[str] = None
    needsDaytimePrivacy: bool = False
    foodPref: str
    socialLevel: int
    guestsFreq: str
    cleanliness: int
    sleepCondition: str
    noiseStudyHabits: str


class MatchRequest(BaseModel):
    userProfile: Profile
    candidateProfile: Profile
    priorityFields: List[str] = []


SCORED_FIELD_CONFIG = {
    "foodPref":         {"type": "categorical", "weight": 1.0},
    "socialLevel":      {"type": "numeric", "scale": 5, "weight": 0.7},
    "guestsFreq":       {"type": "categorical", "weight": 0.6},
    "cleanliness":      {"type": "numeric", "scale": 5, "weight": 1.0},
    "sleepCondition":   {"type": "categorical", "weight": 0.9},
    "noiseStudyHabits": {"type": "categorical", "weight": 0.7},
}

PRIORITY_NUMERIC_TOLERANCE = 1


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
        return False
    return calculate_distance_km(coord1, coord2) <= MAX_DISTANCE_KM


def locality_is_known(locality: str) -> bool:
    return locality in AREA_COORDINATES


def budget_filter_passes(user: dict, candidate: dict) -> bool:
    return abs(user["budget"] - candidate["budget"]) <= BUDGET_TOLERANCE


def habit_comfort_passes(user: dict, candidate: dict, habit: str) -> bool:
    okay_field = f"okayWith{habit.capitalize()}"
    user_status = user[habit]
    candidate_status = candidate[habit]
    user_is_active = user_status in ("yes", "occasional")
    candidate_is_active = candidate_status in ("yes", "occasional")

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


class AnalysisRequest(BaseModel):
    userProfile: Profile
    candidateProfile: Profile


def get_gemini_api_key():
    possible_paths = [
        os.path.join(os.path.dirname(__file__), ".env"),
        os.path.join(os.path.dirname(__file__), "..", ".env"),
        ".env",
        "../.env"
    ]
    for path in possible_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        if line.strip().startswith("GEMINI_API_KEY"):
                             parts = line.split("=", 1)
                             if len(parts) == 2:
                                 val = parts[1].strip()
                                 if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                                     val = val[1:-1]
                                 return val
            except Exception as e:
                print(f"Error reading {path}: {e}")
    return os.environ.get("GEMINI_API_KEY")


def clean_json_response(text: str) -> str:
    text = text.strip()
    match = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
    if match:
        text = match.group(1).strip()
    return text


def call_gemini_api(prompt: str) -> str:
    key = get_gemini_api_key()
    if not key:
        print("GEMINI_API_KEY not found in env or .env file.")
        raise ValueError("API Key missing")

    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }
    
    req_body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=req_body,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    with urllib.request.urlopen(req, timeout=20) as response:
        res_body = response.read().decode("utf-8")
        res_json = json.loads(res_body)
        
        try:
            return res_json["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as e:
            print("Failed to parse Gemini response structure:", res_json)
            raise ValueError("Invalid response structure")


@app.post("/ai-roommate-analysis")
def ai_roommate_analysis(request: AnalysisRequest):
    user = request.userProfile.dict()
    candidate = request.candidateProfile.dict()
    
    candidate_name = candidate.get("name") or "Your potential roommate"
    user_name = user.get("name") or "You"
    
    prompt = f"""
You are an expert roommate matchmaking assistant. Analyze the roommate profiles of the User and the Candidate.

User Profile:
- Name: {user_name}
- Gender: {user.get('gender')}
- City: {user.get('city')}
- Locality: {user.get('locality')}
- Budget: INR {user.get('budget')}
- Job Status: {user.get('jobStatus')}
- Work Mode: {user.get('workMode')}
- Work Shift: {user.get('workShift')}
- Food Preference: {user.get('foodPref')}
- Socializing Level: {user.get('socialLevel')}/5
- Guest Frequency: {user.get('guestsFreq')}
- Cleanliness Level: {user.get('cleanliness')}/5
- Sleep Condition: {user.get('sleepCondition')}
- Noise Habits: {user.get('noiseStudyHabits')}
- Smoker: {user.get('smoker')}, Drinker: {user.get('drinker')}

Candidate Profile:
- Name: {candidate_name}
- Gender: {candidate.get('gender')}
- City: {candidate.get('city')}
- Locality: {candidate.get('locality')}
- Budget: INR {candidate.get('budget')}
- Job Status: {candidate.get('jobStatus')}
- Work Mode: {candidate.get('workMode')}
- Work Shift: {candidate.get('workShift')}
- Food Preference: {candidate.get('foodPref')}
- Socializing Level: {candidate.get('socialLevel')}/5
- Guest Frequency: {candidate.get('guestsFreq')}
- Cleanliness Level: {candidate.get('cleanliness')}/5
- Sleep Condition: {candidate.get('sleepCondition')}
- Noise Habits: {candidate.get('noiseStudyHabits')}
- Smoker: {candidate.get('smoker')}, Drinker: {candidate.get('drinker')}

Instructions:
1. Generate an engaging, positive custom description of {candidate_name} (2-3 sentences) summarizing their lifestyle, profession/studies, and personality. Make it sound warm and welcoming.
2. Generate a custom matching explanation (2-3 sentences) of why {candidate_name} is a perfect roommate match for {user_name}. Highlight specific overlapping preferences (e.g. both are working professionals, both prefer a clean environment, compatible sleep schedules, similar budgets, or shared food preferences).

Return ONLY a valid JSON object with the following keys, containing no markdown formatting:
{{
  "custom_description": "...",
  "match_reason": "..."
}}
"""
    try:
        raw_response = call_gemini_api(prompt)
        clean_response = clean_json_response(raw_response)
        parsed = json.loads(clean_response)
        return parsed
    except Exception as e:
        print(f"Error generating AI analysis: {e}")
        job_str = f"a {candidate.get('jobStatus')}" if candidate.get('jobStatus') else "a potential roommate"
        fallback_desc = f"{candidate_name} is {job_str} currently looking for a compatible shared space in {candidate.get('locality') or 'Delhi'}. They value a budget of around ₹{candidate.get('budget'):,.0f} and maintain a {candidate.get('foodPref') or 'veg'} food preference."
        
        shared_points = []
        if user.get('cleanliness') and candidate.get('cleanliness') and abs(user.get('cleanliness') - candidate.get('cleanliness')) <= 1:
            shared_points.append("cleanliness standards")
        if user.get('foodPref') == candidate.get('foodPref'):
            shared_points.append("shared culinary tastes")
        if user.get('sleepCondition') == candidate.get('sleepCondition'):
            shared_points.append("similar sleep schedules")
        if user.get('budget') and candidate.get('budget') and abs(user.get('budget') - candidate.get('budget')) <= 2000:
            shared_points.append("aligned budget expectations")
            
        points_str = " and ".join(shared_points) if shared_points else "compatible lifestyles"
        fallback_reason = f"Based on your profile details, you and {candidate_name} have highly matching preferences, including {points_str}. This alignment makes you very compatible housemates."
        
        return {
            "custom_description": fallback_desc,
            "match_reason": fallback_reason
        }


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