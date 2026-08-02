// ---------------------------------------------------------------------------
// MOCK DATA
// ---------------------------------------------------------------------------
// This file stands in for MongoDB + the FastAPI ML service. Every shape here
// (field names, nesting) is written to match the real API contract from the
// spec, so when Backend Person A/B's real endpoints are ready, we only need
// to change src/api/mockApi.js internals - no page component should need to
// change at all. That's the whole point of the "build against dummy data"
// strategy in Section 3 of the spec.
// ---------------------------------------------------------------------------

// The 6 "scored" fields from Section 5, used for the compatibility breakdown.
export const SCORED_FIELDS = [
  { key: "food", label: "Food preference" },
  { key: "social", label: "Socialising level" },
  { key: "guests", label: "Guest frequency" },
  { key: "cleanliness", label: "Cleanliness" },
  { key: "sleep", label: "Sleep condition" },
  { key: "noise", label: "Noise / study habits" },
];

// A logged-out "current user" profile shape - filled in by onboarding.
export const emptyProfile = {
  name: "",
  email: "",
  city: "",
  locality: "",
  budget: "",
  gender: "",
  preferredRoommateGender: "",
  food: "",
  social: 3,
  guests: "",
  cleanliness: 3,
  sleep: "",
  noise: "",
  smokes: "",
  okWithSmoker: "",
  drinks: "",
  okWithDrinker: "",
  jobStatus: "",
  preferredJobStatus: "",
  schedule: "",
  okWithDifferentSchedule: "",
  workMode: "",
  preferQuietWorkHours: "",
  priorityFields: [],
};

// Other candidate profiles already "in the database" - used to fake matches.
export const otherUsers = [
  {
    id: "u1",
    name: "Ananya Rao",
    email: "ananya.rao@example.com",
    city: "Delhi",
    locality: "Hauz Khas",
    budget: 14000,
    gender: "Female",
    preferredRoommateGender: "Any",
    food: "Veg",
    social: 4,
    guests: "Occasionally",
    cleanliness: 5,
    sleep: "Lights off",
    noise: "Silent",
    smokes: "No",
    okWithSmoker: "Yes",
    drinks: "Occasional",
    okWithDrinker: "Yes",
    jobStatus: "Working Professional",
    preferredJobStatus: "Either",
    schedule: "Mostly daytime",
    okWithDifferentSchedule: "Yes",
    workMode: "Hybrid",
    preferQuietWorkHours: "No preference",
    priorityFields: ["cleanliness", "sleep"],
  },
  {
    id: "u2",
    name: "Priya Menon",
    email: "priya.menon@example.com",
    city: "Delhi",
    locality: "Saket",
    budget: 15500,
    gender: "Female",
    preferredRoommateGender: "Female",
    food: "Veg",
    social: 3,
    guests: "Never",
    cleanliness: 4,
    sleep: "Flexible",
    noise: "Music",
    smokes: "No",
    okWithSmoker: "No",
    drinks: "No",
    okWithDrinker: "Yes",
    jobStatus: "Student",
    preferredJobStatus: "Student",
    schedule: "Varies",
    okWithDifferentSchedule: "Yes",
    workMode: "",
    preferQuietWorkHours: "No preference",
    priorityFields: ["food"],
  },
  {
    id: "u3",
    name: "Kabir Singh",
    email: "kabir.singh@example.com",
    city: "Delhi",
    locality: "Green Park",
    budget: 13000,
    gender: "Male",
    preferredRoommateGender: "Any",
    food: "Non-veg",
    social: 2,
    guests: "Occasionally",
    cleanliness: 3,
    sleep: "Lights off",
    noise: "Silent",
    smokes: "Occasional",
    okWithSmoker: "Yes",
    drinks: "Yes",
    okWithDrinker: "Yes",
    jobStatus: "Working Professional",
    preferredJobStatus: "Either",
    schedule: "Mostly daytime",
    okWithDifferentSchedule: "Yes",
    workMode: "Work From Home",
    preferQuietWorkHours: "Yes, I'd prefer that",
    priorityFields: ["sleep", "noise"],
  },
];

// Precomputed "ML service response" for each candidate above - this is the
// exact shape compatibility_service.py returns for a valid (>=80%) match.
export const mockMatches = [
  {
    matchId: "m1",
    user: otherUsers[0],
    score: 91,
    breakdown: {
      food: 100,
      social: 90,
      guests: 100,
      cleanliness: 95,
      sleep: 80,
      noise: 85,
    },
    priorityFields: ["cleanliness", "sleep"],
  },
  {
    matchId: "m2",
    user: otherUsers[1],
    score: 84,
    breakdown: {
      food: 70,
      social: 85,
      guests: 90,
      cleanliness: 80,
      sleep: 90,
      noise: 75,
    },
    priorityFields: ["food"],
  },
  {
    matchId: "m3",
    user: otherUsers[2],
    score: 88,
    breakdown: {
      food: 100,
      social: 70,
      guests: 85,
      cleanliness: 90,
      sleep: 95,
      noise: 80,
    },
    priorityFields: ["sleep", "noise"],
  },
];

// Incoming connection requests waiting on the current user (Section 4, step 6).
// `contactRevealed` flips to true only after `status` becomes "accepted" -
// this mirrors "contact info stays hidden on both sides until acceptance".
export const mockIncomingRequests = [
  {
    requestId: "r1",
    from: otherUsers[1],
    score: 84,
    status: "pending", // "pending" | "accepted" | "declined"
    contactRevealed: false,
    theirEmail: "priya.menon@example.com",
  },
];
