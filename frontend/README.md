# RoomieMatch — Frontend

React (Vite) + Tailwind CSS v4 + React Router. Runs entirely on mock data
right now — no backend needed to develop or demo the full user flow.

## Run it

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

## Try the flow

1. Landing page → "Get started"
2. Sign up (any name/email/password — it's mocked, nothing is validated server-side)
3. Fill out the onboarding questionnaire
4. Land on the Dashboard → click into "Your matches"
5. Open a match → see the score breakdown → "Send connection request"
6. Go to "Requests" — there's one fake incoming request already loaded (from
   Priya Menon) — click Accept and watch the contact email appear.

## Where things live

- `src/pages/` — one file per screen
- `src/components/` — shared pieces (nav layout, the compatibility ring, route guard)
- `src/context/AppContext.jsx` — login state + profile, shared across pages
- `src/api/mockApi.js` — **the only file that "talks" to the backend.** Every
  page calls functions from here (`getMatches()`, `saveProfile()`, etc.)
  instead of using `fetch` directly.
- `src/data/mockData.js` — the fake database this mock API reads from

## Connecting the real backend

When Backend Person A/B's routes are ready, open `src/api/mockApi.js` and
replace the inside of each function with a real `fetch()` call, e.g.:

```js
export async function getMatches() {
  const res = await fetch("/api/matches");
  if (!res.ok) throw new Error("Could not load matches");
  return res.json();
}
```

No page component needs to change, **as long as the real API returns the same
shape** — that's why the API contract in the team spec matters so much: agree
on it early and both sides can build in parallel without waiting on each other.
