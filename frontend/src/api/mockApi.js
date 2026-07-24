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
import { emptyProfile, mockMatches, mockIncomingRequests } from "../data/mockData";

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

// --- /api/matches/* ----------------------------------------------------------
// Real version: Backend Person B's route sends this user's profile + every
// other profile to the FastAPI ML service, gets back scores, and only
// forwards matches scoring >=80 (Section 4 + Section 6). Contact info is
// never included here - only name + the profile fields the person entered.
export async function getMatches() {
  await wait(700);
  return mockMatches;
}

export async function getMatchById(matchId) {
  await wait(300);
  const match = mockMatches.find((m) => m.matchId === matchId);
  if (!match) throw new Error("Match not found.");
  return match;
}

export async function sendRequest(matchId) {
  await wait();
  return { requestId: `sent-${matchId}`, status: "pending" };
}

// --- /api/requests/* ----------------------------------------------------------
export async function getIncomingRequests() {
  await wait(400);
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
