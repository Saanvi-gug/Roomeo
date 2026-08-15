

import axios from "axios";
import {
  emptyProfile,
  mockMatches,
  mockIncomingRequests,
} from "../data/mockData";

const wait = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const BACKEND_URL = "http://localhost:5000";

function getUserId() {
  return localStorage.getItem("userId");
}

function mapFrontendToDbProfile(profile) {
  const result = {};
  
  if (profile.name !== undefined) result.name = profile.name;
  if (profile.email !== undefined) result.email = profile.email;
  if (profile.city !== undefined) result.city = profile.city;
  if (profile.locality !== undefined) result.locality = profile.locality;
  if (profile.budget !== undefined) result.budget = profile.budget ? parseFloat(profile.budget) : 0;
  if (profile.gender !== undefined) result.gender = profile.gender;
  if (profile.preferredRoommateGender !== undefined) result.preferredGender = profile.preferredRoommateGender;
  
  if (profile.food !== undefined) result.foodPreference = profile.food;
  if (profile.social !== undefined) result.socialLevel = profile.social ? parseInt(profile.social, 10) : 3;
  if (profile.guests !== undefined) result.guestFrequency = profile.guests;
  if (profile.cleanliness !== undefined) result.cleanliness = profile.cleanliness ? parseInt(profile.cleanliness, 10) : 3;
  if (profile.sleep !== undefined) result.sleepCondition = profile.sleep;
  if (profile.noise !== undefined) result.noiseHabit = profile.noise;
  
  if (profile.smokes !== undefined) result.smoking = profile.smokes;
  if (profile.okWithSmoker !== undefined) result.okayWithSmoker = profile.okWithSmoker;
  if (profile.drinks !== undefined) result.drinking = profile.drinks;
  if (profile.okWithDrinker !== undefined) result.okayWithDrinker = profile.okWithDrinker;
  
  if (profile.jobStatus !== undefined) result.jobStatus = profile.jobStatus;
  if (profile.preferredJobStatus !== undefined) result.preferredJobStatus = profile.preferredJobStatus;
  if (profile.schedule !== undefined) result.dailySchedule = profile.schedule;
  if (profile.okWithDifferentSchedule !== undefined) result.okayDifferentSchedule = profile.okWithDifferentSchedule;
  if (profile.workMode !== undefined) result.workMode = profile.workMode;
  if (profile.preferQuietWorkHours !== undefined) result.quietDuringWork = profile.preferQuietWorkHours;
  
  if (profile.priorityFields !== undefined) result.nonNegotiables = profile.priorityFields;
  
  return result;
}

function mapDbToFrontendProfile(dbUser) {
  if (!dbUser) return { ...emptyProfile };
  return {
    name: dbUser.name || "",
    email: dbUser.email || "",
    city: dbUser.city || "",
    locality: dbUser.locality || "",
    budget: dbUser.budget || "",
    gender: dbUser.gender || "",
    preferredRoommateGender: dbUser.preferredGender || "",
    food: dbUser.foodPreference || "",
    social: dbUser.socialLevel !== undefined ? dbUser.socialLevel : 3,
    guests: dbUser.guestFrequency || "",
    cleanliness: dbUser.cleanliness !== undefined ? dbUser.cleanliness : 3,
    sleep: dbUser.sleepCondition || "",
    noise: dbUser.noiseHabit || "",
    smokes: dbUser.smoking || "",
    okWithSmoker: dbUser.okayWithSmoker || "",
    drinks: dbUser.drinking || "",
    okWithDrinker: dbUser.okayWithDrinker || "",
    jobStatus: dbUser.jobStatus || "",
    preferredJobStatus: dbUser.preferredJobStatus || "",
    schedule: dbUser.dailySchedule || "",
    okWithDifferentSchedule: dbUser.okayDifferentSchedule || "",
    workMode: dbUser.workMode || "",
    preferQuietWorkHours: dbUser.quietDuringWork || "",
    priorityFields: dbUser.nonNegotiables || [],
  };
}
let session = {
  isAuthenticated: !!localStorage.getItem("token"),
  profile: { ...emptyProfile },
};

let requests = mockIncomingRequests.map((r) => ({ ...r }));



export async function signup({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error("Name, email and password are required.");
  }
  const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Registration failed.");
  }
  
  return await login({ email, password });
}

export async function login({ email, password }) {
  if (!email || !password) {
    throw new Error("Enter both email and password.");
  }
  const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Login failed.");
  }
  
  localStorage.setItem("token", data.token);
  localStorage.setItem("userId", data.user._id);
  session.isAuthenticated = true;
  session.profile = mapDbToFrontendProfile(data.user);
  return { user: { name: data.user.name, email: data.user.email } };
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  session.isAuthenticated = false;
  session.profile = { ...emptyProfile };
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}



export async function getProfile() {
  const userId = getUserId();
  if (!userId) {
    return { ...emptyProfile };
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/profile/${userId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    if (!response.ok) {
      throw new Error(`Profile fetch failed: ${response.status}`);
    }
    const dbUser = await response.json();
    session.profile = mapDbToFrontendProfile(dbUser);
    return { ...session.profile };
  } catch (err) {
    console.error("Error fetching profile from backend:", err);
    return { ...session.profile };
  }
}

export async function saveProfile(answers) {
  const userId = getUserId();
  if (!userId) {
    throw new Error("User not authenticated.");
  }
  
  const mappedAnswers = mapFrontendToDbProfile(answers);
  
  const response = await fetch(`${BACKEND_URL}/api/profile/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(mappedAnswers)
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to save profile.");
  }
  
  session.profile = mapDbToFrontendProfile(data.user);
  return { ...session.profile };
}



export async function getMatches() {
  await wait(700);

  return mockMatches.map((match) => ({ ...match }));
}

function mapFrontendProfileToMlServiceProfile(p) {
  const lower = (val, fallback = "") => typeof val === "string" ? val.toLowerCase() : fallback;

  let foodPref = "veg";
  const fLower = lower(p.food);
  if (fLower.includes("non")) {
    foodPref = "non-veg";
  } else if (fLower.includes("egg")) {
    foodPref = "eggetarian";
  } else if (fLower.includes("vegan")) {
    foodPref = "vegan";
  }

  let socialLevel = 3;
  if (typeof p.social === "number") {
    socialLevel = p.social;
  } else {
    const sLower = lower(p.social);
    if (sLower === "outgoing" || sLower === "active") socialLevel = 5;
    else if (sLower === "quiet" || sLower === "introvert") socialLevel = 1;
    else if (sLower === "balanced") socialLevel = 3;
  }

  let guestsFreq = "occasionally";
  const gLower = lower(p.guests);
  if (gLower.includes("never")) guestsFreq = "never";
  else if (gLower.includes("often") || gLower.includes("frequent")) guestsFreq = "often";

  let cleanliness = 3;
  if (typeof p.cleanliness === "number") {
    cleanliness = p.cleanliness;
  } else {
    const cVal = parseInt(p.cleanliness, 10);
    if (!isNaN(cVal)) cleanliness = cVal;
  }

  let sleepCondition = "flexible";
  const slLower = lower(p.sleep);
  if (slLower.includes("off") || slLower.includes("out")) sleepCondition = "lights-off";
  else if (slLower.includes("on")) sleepCondition = "lights-on";

  let noiseStudyHabits = "silent";
  const nLower = lower(p.noise);
  if (nLower.includes("music")) noiseStudyHabits = "music";
  else if (nLower.includes("group") || nLower.includes("social")) noiseStudyHabits = "group";

  let smoker = "no";
  const smLower = lower(p.smokes);
  if (smLower === "yes" || smLower === "true" || smLower === true || smLower === "smoker") smoker = "yes";
  else if (smLower.includes("occasional")) smoker = "occasional";

  let drinker = "no";
  const dLower = lower(p.drinks);
  if (dLower === "yes" || dLower === "true" || dLower === true || dLower === "drinker") drinker = "yes";
  else if (dLower.includes("occasional")) drinker = "occasional";

  let jobStatus = "working";
  const jLower = lower(p.jobStatus);
  if (jLower.includes("student")) jobStatus = "student";
  else if (jLower.includes("both") || jLower.includes("student and working")) jobStatus = "both";

  let preferredRoommateJobStatus = "any";
  const pjLower = lower(p.preferredJobStatus);
  if (pjLower.includes("student")) preferredRoommateJobStatus = "student";
  else if (pjLower.includes("working")) preferredRoommateJobStatus = "working";

  let workShift = "day";
  const shLower = lower(p.schedule);
  if (shLower.includes("night")) workShift = "night";
  else if (shLower.includes("rotation") || shLower.includes("flexible")) workShift = "rotational";

  let workMode = "wfo";
  const wmLower = lower(p.workMode);
  if (wmLower.includes("home") || wmLower.includes("wfh")) workMode = "wfh";
  else if (wmLower.includes("hybrid")) workMode = "hybrid";

  return {
    name: p.name || "Roommate Candidate",
    gender: lower(p.gender, "male") === "female" ? "female" : lower(p.gender, "male") === "other" ? "other" : "male",
    preferredRoommateGender: lower(p.preferredRoommateGender, "any") === "female" ? "female" : lower(p.preferredRoommateGender, "any") === "male" ? "male" : "any",
    city: p.city || "Delhi",
    locality: p.locality || "Saket",
    budget: parseFloat(p.budget) || 12000,
    smoker,
    okayWithSmoker: p.okWithSmoker === "yes" || p.okWithSmoker === "true" || p.okWithSmoker === true,
    drinker,
    okayWithDrinker: p.okWithDrinker === "yes" || p.okWithDrinker === "true" || p.okWithDrinker === true,
    jobStatus,
    preferredRoommateJobStatus,
    workShift,
    okayWithDifferentShift: p.okWithDifferentSchedule === "yes" || p.okWithDifferentSchedule === "true" || p.okWithDifferentSchedule === true,
    workMode,
    needsDaytimePrivacy: p.preferQuietWorkHours === "yes" || p.preferQuietWorkHours === "true" || p.preferQuietWorkHours === true,
    foodPref,
    socialLevel,
    guestsFreq,
    cleanliness,
    sleepCondition,
    noiseStudyHabits
  };
}

export async function getMatchById(matchId) {
  await wait(350);

  const match = mockMatches.find(
    (match) => match.matchId === matchId
  );

  if (!match) {
    const error = new Error("Match not found.");
    error.code = "MATCH_NOT_FOUND";
    throw error;
  }

  // Call the FastAPI compatibility service for AI Match insights
  try {
    const response = await fetch("http://localhost:8000/ai-roommate-analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userProfile: mapFrontendProfileToMlServiceProfile(session.profile),
        candidateProfile: mapFrontendProfileToMlServiceProfile(match.user)
      })
    });
    if (response.ok) {
      const data = await response.json();
      match.aiAnalysis = data;
    } else {
      console.warn("FastAPI compatibility service returned error response:", response.status);
    }
  } catch (err) {
    console.error("Failed to connect to FastAPI compatibility service:", err);
    // Provide a localized mock fallback analysis
    match.aiAnalysis = {
      custom_description: `${match.user.name} is a student or working professional who enjoys a balanced lifestyle in ${match.user.locality}. They maintain aligned cleanliness standards and value a peaceful shared environment.`,
      match_reason: `Based on your profile details, you and ${match.user.name} have highly matching preferences, including similar budget expectations and compatible daily routines.`
    };
  }

  return { ...match };
}

export async function sendRequest(matchId) {
  await wait(600);

  const alreadySent = requests.some(
    (request) =>
      request.matchId === matchId ||
      request.requestId === `sent-${matchId}`
  );

  if (alreadySent) {
    const error = new Error("Request already sent.");
    error.code = "REQUEST_ALREADY_SENT";
    throw error;
  }

  return {
    requestId: `sent-${matchId}`,
    matchId,
    status: "pending",
  };
}



export async function getIncomingRequests() {
  await wait(450);

  return requests.map((request) => ({
    ...request,
  }));
}

export async function respondToRequest(requestId, decision) {
  await wait(600);

  if (!["accepted", "declined"].includes(decision)) {
    const error = new Error("Invalid response.");
    error.code = "INVALID_DECISION";
    throw error;
  }

  const request = requests.find(
    (request) => request.requestId === requestId
  );

  if (!request) {
    const error = new Error("Request not found.");
    error.code = "REQUEST_NOT_FOUND";
    throw error;
  }

  const updated = {
    ...request,
    status: decision,
    contactRevealed: decision === "accepted",
  };

  requests = requests.map((request) =>
    request.requestId === requestId
      ? updated
      : request
  );

  return { ...updated };
}