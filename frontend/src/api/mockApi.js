// ---------------------------------------------------------------------------
// MOCK API
// ---------------------------------------------------------------------------
// Every function here returns a Promise, on purpose - exactly like a real
// `fetch()` call to Backend Person A/B's Express routes would. That means:
//
//   1. Every page already writes real async code (await, loading, error
//      states) from day one.
//   2. On integration day, we swap the *inside* of each function for a real
//      `fetch("/api/...")` call - the page components don't change.
//
// `wait(ms)` fakes network latency so loading spinners actually have
// something to show during development, instead of resolving instantly.
// ---------------------------------------------------------------------------
import { emptyProfile, otherUsers, mockIncomingRequests } from "../data/mockData";

const wait = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory "database" for this browser session only. Refreshing the page
// resets it - that's expected for a mock. Swap for real persistence (Mongo)
// when Backend Person A's /api/profile routes are ready.
let session = {
  isAuthenticated: false,
  profile: { ...emptyProfile },
};
let requests = mockIncomingRequests.map((r) => ({ ...r }));

// --- /api/auth/* -----------------------------------------------------------
export async function signup({ name, email, password }) {
  await wait();
  if (!name || !email || !password) {
    throw new Error("Name, email and password are all required.");
  }
  session.isAuthenticated = true;
  session.profile = { ...session.profile, name, email };
  return { user: { name, email } };
}

export async function login({ email, password }) {
  await wait();
  if (!email || !password) {
    throw new Error("Enter both email and password.");
  }
  session.isAuthenticated = true;
  if (!session.profile.name) {
    session.profile = { ...session.profile, name: "Demo User", email };
  }
  return { user: { name: session.profile.name, email } };
}

export function logout() {
  session.isAuthenticated = false;
}

export function isAuthenticated() {
  return session.isAuthenticated;
}

// --- /api/profile/* ----------------------------------------------------------
export async function getProfile() {
  await wait(200);
  return { ...session.profile };
}

export async function saveProfile(answers) {
  await wait();
  session.profile = { ...session.profile, ...answers };
  return { ...session.profile };
}

// --- ML Service Integration & Mappings --------------------------------------
const ML_SERVICE_URL = "http://127.0.0.1:8000";

function mapFrontendToMlProfile(profile) {
  const genderMap = { "Male": "male", "Female": "female", "Other": "other" };
  const preferredGenderMap = { "Male": "male", "Female": "female", "Any": "any" };
  const smokerMap = { "Yes": "yes", "No": "no", "Occasional": "occasional" };
  const drinkerMap = { "Yes": "yes", "No": "no", "Occasional": "occasional" };
  const jobMap = { "Student": "student", "Working Professional": "working", "Both": "both" };
  const preferredJobMap = { "Student": "student", "Professional": "working", "Either": "any" };
  const scheduleMap = { "Mostly daytime": "day", "Mostly evening-night": "night", "Varies": "rotational" };
  const workModeMap = { "Work From Home": "wfh", "Work From Office": "wfo", "Hybrid": "hybrid" };

  return {
    name: profile.name || "",
    gender: genderMap[profile.gender] || "other",
    preferredRoommateGender: preferredGenderMap[profile.preferredRoommateGender] || "any",
    city: profile.city || "",
    locality: profile.locality || "",
    budget: parseFloat(profile.budget) || 0.0,

    smoker: smokerMap[profile.smokes] || "no",
    okayWithSmoker: profile.okWithSmoker === "Yes",
    drinker: drinkerMap[profile.drinks] || "no",
    okayWithDrinker: profile.okWithDrinker === "Yes",

    jobStatus: jobMap[profile.jobStatus] || "student",
    preferredRoommateJobStatus: preferredJobMap[profile.preferredRoommateJobStatus] || "any",
    workShift: scheduleMap[profile.schedule] || "day",
    okayWithDifferentShift: profile.okWithDifferentSchedule === "Yes",
    workMode: profile.workMode ? (workModeMap[profile.workMode] || null) : null,
    needsDaytimePrivacy: profile.preferQuietWorkHours === "Yes, I'd prefer that",

    foodPref: (profile.food || "veg").toLowerCase(),
    socialLevel: parseInt(profile.social) || 3,
    guestsFreq: (profile.guests || "never").toLowerCase(),
    cleanliness: parseInt(profile.cleanliness) || 3,
    sleepCondition: (profile.sleep || "flexible").toLowerCase().replace(" ", "-"),
    noiseStudyHabits: (profile.noise || "silent").toLowerCase() === "group study" ? "group" : (profile.noise || "silent").toLowerCase(),
  };
}

const PRIORITY_FIELDS_MAP = {
  food: "foodPref",
  social: "socialLevel",
  guests: "guestsFreq",
  cleanliness: "cleanliness",
  sleep: "sleepCondition",
  noise: "noiseStudyHabits"
};

function mapPriorityFields(fields) {
  if (!fields) return [];
  return fields.map(f => PRIORITY_FIELDS_MAP[f] || f);
}

function mapMlToFrontendBreakdown(breakdown) {
  if (!breakdown) return {};
  return {
    food: Math.round((breakdown.foodPref ?? 0) * 100),
    social: Math.round((breakdown.socialLevel ?? 0) * 100),
    guests: Math.round((breakdown.guestsFreq ?? 0) * 100),
    cleanliness: Math.round((breakdown.cleanliness ?? 0) * 100),
    sleep: Math.round((breakdown.sleepCondition ?? 0) * 100),
    noise: Math.round((breakdown.noiseStudyHabits ?? 0) * 100)
  };
}

let calculatedMatches = [];

// --- /api/matches/* ----------------------------------------------------------
export async function getMatches() {
  await wait(700);
  if (!session.isAuthenticated || !session.profile.city) {
    return [];
  }

  try {
    const userMlProfile = mapFrontendToMlProfile(session.profile);
    const mappedPriorities = mapPriorityFields(session.profile.priorityFields);

    const promises = otherUsers.map(async (candidate) => {
      const candidateMlProfile = mapFrontendToMlProfile(candidate);
      const response = await fetch(`${ML_SERVICE_URL}/compatibility-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: userMlProfile,
          candidateProfile: candidateMlProfile,
          priorityFields: mappedPriorities
        })
      });
      if (!response.ok) {
        throw new Error(`ML service returned status ${response.status}`);
      }
      const result = await response.json();
      return { candidate, result };
    });

    const results = await Promise.all(promises);
    calculatedMatches = results
      .filter(({ result }) => !result.excluded)
      .map(({ candidate, result }) => ({
        matchId: `m-${candidate.id}`,
        user: {
          id: candidate.id,
          name: candidate.name,
          city: candidate.city,
          locality: candidate.locality,
          budget: candidate.budget,
          gender: candidate.gender,
          jobStatus: candidate.jobStatus,
          workMode: candidate.workMode,
          schedule: candidate.schedule
        },
        score: Math.round(result.score * 100),
        breakdown: mapMlToFrontendBreakdown(result.breakdown),
        priorityFields: session.profile.priorityFields
      }));

    return calculatedMatches;
  } catch (err) {
    console.error("Error fetching matches from ML service:", err);
    throw new Error("Unable to connect to the matching service. Please make sure the ML service is running.");
  }
}

export async function getMatchById(matchId) {
  await wait(300);
  let match = calculatedMatches.find((m) => m.matchId === matchId);
  if (match) return match;

  // If not in calculatedMatches, calculate it dynamically on the fly
  const candidateId = matchId.replace("m-", "");
  const candidate = otherUsers.find((u) => u.id === candidateId);
  if (!candidate) throw new Error("Match not found.");

  try {
    const userMlProfile = mapFrontendToMlProfile(session.profile);
    const mappedPriorities = mapPriorityFields(session.profile.priorityFields);
    const candidateMlProfile = mapFrontendToMlProfile(candidate);

    const response = await fetch(`${ML_SERVICE_URL}/compatibility-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userProfile: userMlProfile,
        candidateProfile: candidateMlProfile,
        priorityFields: mappedPriorities
      })
    });
    if (!response.ok) {
      throw new Error(`ML service returned status ${response.status}`);
    }
    const result = await response.json();
    if (result.excluded) {
      throw new Error("This candidate is excluded based on your compatibility filters.");
    }

    match = {
      matchId: matchId,
      user: {
        id: candidate.id,
        name: candidate.name,
        city: candidate.city,
        locality: candidate.locality,
        budget: candidate.budget,
        gender: candidate.gender,
        jobStatus: candidate.jobStatus,
        workMode: candidate.workMode,
        schedule: candidate.schedule
      },
      score: Math.round(result.score * 100),
      breakdown: mapMlToFrontendBreakdown(result.breakdown),
      priorityFields: session.profile.priorityFields
    };
    return match;
  } catch (err) {
    console.error("Error fetching match detail from ML service:", err);
    throw new Error("Unable to connect to the matching service. Please make sure the ML service is running.");
  }
}

export async function getMatchAiAnalysis(matchId) {
  await wait(450); // slight simulated delay for premium feel skeleton loader
  const candidateId = matchId.replace("m-", "");
  const candidate = otherUsers.find((u) => u.id === candidateId);
  if (!candidate) throw new Error("Match not found.");

  try {
    const userMlProfile = mapFrontendToMlProfile(session.profile);
    const candidateMlProfile = mapFrontendToMlProfile(candidate);

    const response = await fetch(`${ML_SERVICE_URL}/ai-roommate-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userProfile: userMlProfile,
        candidateProfile: candidateMlProfile
      })
    });
    if (!response.ok) {
      throw new Error(`ML service returned status ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error("Error fetching AI analysis from ML service:", err);
    // Dynamic fallback matching profile details if backend fails
    const jobStr = candidate.jobStatus ? `a ${candidate.jobStatus.toLowerCase()}` : "a potential roommate";
    return {
      custom_description: `${candidate.name} is ${jobStr} from ${candidate.locality}, Delhi. They maintain a budget of around ₹${candidate.budget.toLocaleString("en-IN")}/mo and follow a ${candidate.food.toLowerCase()} food preference.`,
      match_reason: `Based on your compatibility profiles, you and ${candidate.name} share aligned preferences in budgeting, cleanliness levels, and day-to-day habits, facilitating a highly balanced roommate dynamic.`
    };
  }
}

export async function sendRequest(matchId) {
  await wait();
  return { requestId: `sent-${matchId}`, status: "pending" };
}

// --- /api/requests/* ----------------------------------------------------------
export async function getIncomingRequests() {
  await wait(400);
  if (session.isAuthenticated && session.profile.city) {
    const userMlProfile = mapFrontendToMlProfile(session.profile);
    const mappedPriorities = mapPriorityFields(session.profile.priorityFields);

    for (let req of requests) {
      try {
        const candidateMlProfile = mapFrontendToMlProfile(req.from);
        const response = await fetch(`${ML_SERVICE_URL}/compatibility-score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userProfile: userMlProfile,
            candidateProfile: candidateMlProfile,
            priorityFields: mappedPriorities
          })
        });
        if (response.ok) {
          const result = await response.json();
          if (!result.excluded) {
            req.score = Math.round(result.score * 100);
          } else {
            // fallback if excluded by new criteria
            req.score = 70;
          }
        }
      } catch (err) {
        console.error("Failed to compute request score dynamically:", err);
      }
    }
  }
  return requests;
}

export async function respondToRequest(requestId, decision) {
  await wait();
  requests = requests.map((r) =>
    r.requestId === requestId
      ? { ...r, status: decision, contactRevealed: decision === "accepted" }
      : r
  );
  return requests.find((r) => r.requestId === requestId);
}
