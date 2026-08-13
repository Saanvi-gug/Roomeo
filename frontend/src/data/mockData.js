// ---------------------------------------------------------------------------
// MOCK DATA

import avatar1 from "../assets/avatars/avatar-1.jpg";
import avatar2 from "../assets/avatars/avatar-2.jpg";
import avatar3 from "../assets/avatars/avatar-3.jpg";
import avatar4 from "../assets/avatars/avatar-4.jpg";
import avatar5 from "../assets/avatars/avatar-5.jpg";
import avatar6 from "../assets/avatars/avatar-6.jpg";



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
  avatarId: "",
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
workStartTime: "",
workEndTime: "",
priorityFields: [],
};

// Other candidate profiles already "in the database" - used to fake matches.
export const otherUsers = [
  {
    id: "u1",
    name: "Ananya Rao",
    avatarId: "avatar-2",
    city: "Delhi",
    locality: "Hauz Khas",
    budget: 14000,
    gender: "Female",
    preferredRoommateGender: "Any",
    food: "Vegetarian",
    social: 3,
    guests: "Occasionally",
    cleanliness: 5,
    sleep: "Lights out",
    noise: "Silent study",
    smokes: "No",
    okWithSmoker: "Yes",
    drinks: "No",
    okWithDrinker: "Yes",
    jobStatus: "Working Professional",
    preferredJobStatus: "Any",
    schedule: "Mostly daytime",
    okWithDifferentSchedule: "Yes",
    workMode: "Hybrid",
    preferQuietWorkHours: "No",
  },

  {
    id: "u2",
    name: "Priya Menon",
    avatarId: "avatar-3",
    city: "Delhi",
    locality: "Saket",
    budget: 15500,
    gender: "Female",
    preferredRoommateGender: "Any",
    food: "Eggetarian",
    social: 2,
    guests: "Occasionally",
    cleanliness: 4,
    sleep: "Lights out",
    noise: "Study with music",
    smokes: "No",
    okWithSmoker: "Yes",
    drinks: "No",
    okWithDrinker: "Yes",
    jobStatus: "Student",
    preferredJobStatus: "Any",
    schedule: "Flexible",
    okWithDifferentSchedule: "Yes",
    workMode: "Campus",
    preferQuietWorkHours: "No",
  },

  {
    id: "u3",
    name: "Kabir Singh",
    avatarId: "avatar-4",
    city: "Delhi",
    locality: "Green Park",
    budget: 13000,
    gender: "Male",
    preferredRoommateGender: "Any",
    food: "Non-Vegetarian",
    social: 4,
    guests: "Occasionally",
    cleanliness: 5,
    sleep: "Lights out",
    noise: "Silent study",
    smokes: "No",
    okWithSmoker: "Yes",
    drinks: "No",
    okWithDrinker: "Yes",
    jobStatus: "Working Professional",
    preferredJobStatus: "Any",
    schedule: "Mostly daytime",
    okWithDifferentSchedule: "Yes",
    workMode: "Work From Home",
    preferQuietWorkHours: "No",
  },
];

// Precomputed "ML service response" for each candidate above - this is the
// exact shape compatibility_service.py returns for a valid (>=80%) match.
export const mockMatches = [
  {
    matchId: "m1",
    user: otherUsers[0],
    avatarId: "avatar-2",
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
    avatarId: "avatar-3",
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
    avatarId: "avatar-4",
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
    avatarId: "avatar-2",
    score: 84,
    status: "pending", // "pending" | "accepted" | "declined"
    contactRevealed: false,
    theirEmail: "priya.menon@example.com",
  },
];
