import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as api from "../api/mockApi";
import CompatibilityRing from "../components/CompatibilityRing";
import { getAvatarImage } from "../data/avatarOptions";

const ITEMS_PER_PAGE = 5;

export default function Matches() {
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    api
      .getMatches()
      .then(setMatches)
      .catch((err) => {
        setError(
          err.message || "Something went wrong."
        );
      });
  }, []);

  if (error) {
    return <ErrorState message={error} />;
  }

  if (matches === null) {
    return <LoadingState />;
  }

  if (matches.length === 0) {
    return <EmptyState />;
  }

  const sortedMatches = [...matches].sort((a, b) => {
    switch (sortBy) {
      case "budget":
        return a.user.budget - b.user.budget;

      case "name":
        return a.user.name.localeCompare(
          b.user.name
        );

      case "score":
      default:
        return b.score - a.score;
    }
  });

  const totalPages = Math.ceil(
    sortedMatches.length / ITEMS_PER_PAGE
  );

  const paginatedMatches = sortedMatches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) =>
      Math.max(page - 1, 1)
    );
  };

  const goToNextPage = () => {
    setCurrentPage((page) =>
      Math.min(page + 1, totalPages)
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header + sorting */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Your matches
          </h1>

          <p className="mt-2 text-muted">
            Only people scoring 80% or higher show up
            here. Contact information stays hidden until
            you both accept.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="match-sort"
            className="text-sm text-muted whitespace-nowrap"
          >
            Sort by
          </label>

          <select
            id="match-sort"
            value={sortBy}
            onChange={handleSortChange}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary"
          >
            <option value="score">
              Highest compatibility
            </option>

            <option value="budget">
              Lowest budget
            </option>

            <option value="name">
              Name (A–Z)
            </option>
          </select>
        </div>
      </div>

      {/* Match cards */}
      <div className="mt-8 space-y-3">
        {paginatedMatches.map((match) => (
          <Link
            key={match.matchId}
            to={`/matches/${match.matchId}`}
            className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary sm:flex-row sm:items-start"
          >
            {/* Avatar + compatibility */}
            <div className="flex shrink-0 items-center gap-3">
              <img
                src={getAvatarImage(
                  match.user.avatarId
                )}
                alt={`${match.user.name}'s avatar`}
                className="h-16 w-16 rounded-full border-2 border-border object-cover"
              />

              <CompatibilityRing
                score={match.score}
                size={64}
                strokeWidth={6}
              />
            </div>

            {/* Match details */}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="font-display text-lg font-medium text-ink">
                {match.user.name}
              </p>

              <p className="mt-1 text-sm text-muted">
                {match.user.locality},{" "}
                {match.user.city}
              </p>

              <p className="mt-1 text-sm text-muted">
                ₹
                {match.user.budget.toLocaleString(
                  "en-IN"
                )}
                /month
              </p>

              {/* Lifestyle tags */}
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Tag text={match.user.food} />
                <Tag text={match.user.jobStatus} />
                <Tag text={match.user.workMode} />
                <Tag text={match.user.schedule} />
                <Tag text={match.user.social} />
              </div>
            </div>

            {/* Arrow */}
            <span
              className="self-end text-xl text-muted sm:self-auto"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-muted">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading State                                                               */
/* -------------------------------------------------------------------------- */

function LoadingState() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="h-9 w-48 animate-pulse rounded bg-border" />

      <div className="mt-8 space-y-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 rounded-full bg-border" />

              <div className="h-16 w-16 shrink-0 rounded-full bg-border" />

              <div className="flex-1 space-y-3">
                <div className="h-5 w-40 rounded bg-border" />
                <div className="h-4 w-56 rounded bg-border" />
                <div className="h-4 w-32 rounded bg-border" />
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
          Couldn't load matches
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
        <div className="text-4xl text-primary">
          ♡
        </div>

        <h1 className="mt-5 font-display text-3xl font-semibold text-ink">
          No matches yet
        </h1>

        <p className="mx-auto mt-3 max-w-md text-muted">
          We're still looking for compatible roommates
          based on your preferences. You can update your
          answers to explore more matches.
        </p>

        <Link
          to="/onboarding"
          className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Update preferences
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Lifestyle Tag                                                               */
/* -------------------------------------------------------------------------- */

function Tag({ text }) {
  if (!text) return null;

  return (
    <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary-dark">
      {text}
    </span>
  );
}