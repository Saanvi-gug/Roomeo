// ---------------------------------------------------------------------------
// MOCK API
// ---------------------------------------------------------------------------
import axios from "axios";
import {
  emptyProfile,
  mockMatches,
  mockIncomingRequests,
} from "../data/mockData";

const wait = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

let session = {
  isAuthenticated: false,
  profile: { ...emptyProfile },
};

let requests = mockIncomingRequests.map((r) => ({ ...r }));

// ---------------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------------

export async function signup({ name, email, password }) {
  await wait();

  if (!name || !email || !password) {
    throw new Error("Name, email and password are required.");
  }

  session.isAuthenticated = true;
  session.profile = {
    ...session.profile,
    name,
    email,
  };

  return {
    user: {
      name,
      email,
    },
  };
}

export async function login({ email, password }) {
  try {
    const response = await axios.post("http://localhost:5000/api/auth/login", {
      email: email,
      password: password,
    });

    console.log(response.data);

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    session.isAuthenticated = true;

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export function logout() {
  session.isAuthenticated = false;
  localStorage.removeItem("token");
}

export function isAuthenticated() {
  return session.isAuthenticated;
}

// ---------------------------------------------------------------------------
// PROFILE
// ---------------------------------------------------------------------------

export async function getProfile() {
  await wait(250);
  return { ...session.profile };
}

export async function saveProfile(profileData) {
  await wait();

  session.profile = {
    ...session.profile,
    ...profileData,
  };

  return { ...session.profile };
}

// ---------------------------------------------------------------------------
// MATCHES
// ---------------------------------------------------------------------------

export async function getMatches() {
  await wait(700);

  return mockMatches.map((match) => ({ ...match }));
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

// ---------------------------------------------------------------------------
// REQUESTS
// ---------------------------------------------------------------------------

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