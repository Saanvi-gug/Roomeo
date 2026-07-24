import { useEffect, useState } from "react";
import * as api from "../api/mockApi";
import CompatibilityRing from "../components/CompatibilityRing";

export default function Requests() {
  const [requests, setRequests] = useState(null);

  useEffect(() => {
    api.getIncomingRequests().then(setRequests);
  }, []);

  const respond = async (requestId, decision) => {
    const updated = await api.respondToRequest(requestId, decision);
    setRequests((prev) => prev.map((r) => (r.requestId === requestId ? updated : r)));
  };

  if (requests === null) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-muted">Loading requests…</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-ink">Requests</h1>
        <p className="mt-4 text-muted">No requests yet. When someone wants to connect, they'll show up here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink">Requests</h1>

      <div className="mt-8 space-y-4">
        {requests.map((req) => (
          <div key={req.requestId} className="p-5 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-5">
              <CompatibilityRing score={req.score} size={56} strokeWidth={5} />
              <div className="flex-1">
                <p className="font-display text-lg font-medium text-ink">{req.from.name}</p>
                <p className="text-sm text-muted">
                  {req.from.locality}, {req.from.city}
                </p>
              </div>
              <StatusBadge status={req.status} />
            </div>

            {req.status === "pending" && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => respond(req.requestId, "accepted")}
                  className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => respond(req.requestId, "declined")}
                  className="px-4 py-2 rounded-full border border-border text-sm font-medium text-ink hover:border-accent transition-colors"
                >
                  Decline
                </button>
              </div>
            )}

            {/* Contact info only ever renders once `contactRevealed` is true,
                which the mock API only sets after both accept. */}
            {req.contactRevealed && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-mono text-muted uppercase">Contact</p>
                <p className="text-sm text-ink mt-1">{req.theirEmail}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-primary-light text-primary-dark",
    accepted: "bg-primary text-white",
    declined: "bg-border text-muted",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
