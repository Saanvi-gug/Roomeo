import { useEffect, useState } from "react";
import * as api from "../api/mockApi";
import CompatibilityRing from "../components/CompatibilityRing";
import { getAvatarImage } from "../data/avatarOptions";

export default function Requests() {
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");
  const [respondingId, setRespondingId] = useState(null);

  useEffect(() => {
    api
      .getIncomingRequests()
      .then(setRequests)
      .catch((err) => {
        setError(err.message || "Couldn't load requests.");
      });
  }, []);

  const respond = async (requestId, decision) => {
    setRespondingId(requestId);
    setError("");

    try {
      const updated = await api.respondToRequest(
        requestId,
        decision
      );

      setRequests((prev) =>
        prev.map((request) =>
          request.requestId === requestId
            ? updated
            : request
        )
      );
    } catch (err) {
      setError(
        err.message || "Couldn't update the request."
      );
    } finally {
      setRespondingId(null);
    }
  };

  if (error && requests === null) {
    return <ErrorState message={error} />;
  }

  if (requests === null) {
    return <LoadingState />;
  }

  if (requests.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Requests
        </h1>

        <p className="mt-2 text-muted">
          People who want to connect with you will appear here.
        </p>
      </div>

      {/* Error after request action */}
      {error && (
        <div className="mt-4 rounded-xl border border-accent bg-card px-4 py-3">
          <p className="text-sm text-accent">{error}</p>
        </div>
      )}

      {/* Requests */}
      <div className="mt-8 space-y-4">
        {requests.map((req) => {
          const person = req.from;
          const isResponding =
            respondingId === req.requestId;

          return (
            <div
              key={req.requestId}
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary"
            >
              {/* Main profile information */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

                {/* Avatar + Compatibility */}
                <div className="flex shrink-0 items-center gap-3">
                  <img
                    src={getAvatarImage(person.avatarId)}
                    alt={`${person.name}'s avatar`}
                    className="h-16 w-16 rounded-full border-2 border-border object-cover"
                  />

                  <CompatibilityRing
                    score={req.score}
                    size={64}
                    strokeWidth={6}
                  />
                </div>

                {/* Profile details */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-display text-xl font-medium text-ink">
                        {person.name}
                      </p>

                      <p className="mt-1 text-sm text-muted">
                        {person.locality}, {person.city}
                      </p>

                      {person.budget && (
                        <p className="mt-1 text-sm text-muted">
                          ₹
                          {person.budget.toLocaleString(
                            "en-IN"
                          )}
                          /month
                        </p>
                      )}
                    </div>

                    <StatusBadge status={req.status} />
                  </div>

                  {/* Lifestyle tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <LifestyleTag text={person.food} />
                    <LifestyleTag text={person.jobStatus} />
                    <LifestyleTag text={person.workMode} />
                    <LifestyleTag text={person.schedule} />
                    <LifestyleTag text={person.social} />
                  </div>
                </div>
              </div>

              {/* Accept / Decline */}
              {req.status === "pending" && (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      respond(req.requestId, "accepted")
                    }
                    disabled={isResponding}
                    className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isResponding
                      ? "Updating…"
                      : "Accept"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      respond(req.requestId, "declined")
                    }
                    disabled={isResponding}
                    className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              )}

              {/* Contact information */}
              {req.contactRevealed && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="text-xs font-mono uppercase tracking-wide text-muted">
                    Contact
                  </p>

                  <p className="mt-1 text-sm text-ink">
                    {req.theirEmail}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Lifestyle Tag                                                              */
/* -------------------------------------------------------------------------- */

function LifestyleTag({ text }) {
  if (!text) return null;

  return (
    <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary-dark">
      {text}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Status Badge                                                               */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-primary-light text-primary-dark",
    accepted: "bg-primary text-white",
    declined: "bg-border text-muted",
  };

  return (
    <span
      className={`self-start rounded-full px-3 py-1 text-xs font-medium capitalize ${
        styles[status] || "bg-border text-muted"
      }`}
    >
      {status}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading State                                                               */
/* -------------------------------------------------------------------------- */

function LoadingState() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="h-9 w-32 animate-pulse rounded bg-border" />

      <div className="mt-3 h-4 w-full max-w-md animate-pulse rounded bg-border" />

      <div className="mt-8 space-y-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex gap-4">
              <div className="h-16 w-16 shrink-0 rounded-full bg-border" />

              <div className="flex-1 space-y-3">
                <div className="h-5 w-40 rounded bg-border" />
                <div className="h-4 w-52 rounded bg-border" />
                <div className="h-4 w-32 rounded bg-border" />

                <div className="flex gap-2">
                  <div className="h-6 w-20 rounded-full bg-border" />
                  <div className="h-6 w-24 rounded-full bg-border" />
                  <div className="h-6 w-16 rounded-full bg-border" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Error State                                                                 */
/* -------------------------------------------------------------------------- */

function ErrorState({ message }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="rounded-2xl border border-accent bg-card p-6">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Couldn't load requests
        </h1>

        <p className="mt-2 text-sm text-accent">
          {message}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty State                                                                 */
/* -------------------------------------------------------------------------- */

function EmptyState() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="text-4xl text-primary">♡</div>

        <h1 className="mt-5 font-display text-3xl font-semibold text-ink">
          No requests yet
        </h1>

        <p className="mx-auto mt-3 max-w-md text-muted">
          You're all caught up! When someone wants to
          connect with you, their request will appear here.
        </p>
      </div>
    </div>
  );
}