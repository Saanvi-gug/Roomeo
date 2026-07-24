import { Link } from "react-router-dom";
import CompatibilityRing from "../components/CompatibilityRing";

export default function Landing() {
  return (
    <div className="max-w-5xl mx-auto px-6">
      <section className="grid md:grid-cols-2 gap-12 items-center py-20 md:py-28">
        <div>
          <p className="font-mono text-sm text-accent tracking-wide uppercase mb-4">
            Find out before you sign the lease
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-semibold leading-[1.05] text-ink">
            Living together starts with a number.
          </h1>
          <p className="mt-6 text-lg text-muted max-w-md">
            Answer a few honest questions about how you actually live. We match
            you with people who live the same way — and only show you the ones
            scoring 80% or higher.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              to="/signup"
              className="px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
            >
              Get started
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-full border border-border font-medium text-ink hover:border-ink transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm w-full max-w-xs">
            <p className="font-mono text-xs text-muted uppercase tracking-wide mb-6">
              Sample match
            </p>
            <div className="flex items-center gap-5">
              <CompatibilityRing score={91} size={88} />
              <div>
                <p className="font-display text-lg font-medium text-ink">Ananya R.</p>
                <p className="text-sm text-muted">Hauz Khas · ₹14,000/mo</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Cleanliness</span>
                <span className="font-mono text-ink">95%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Sleep schedule</span>
                <span className="font-mono text-ink">80%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-6 pb-24">
        {[
          {
            title: "One honest questionnaire",
            body: "Budget, habits, schedule, and the things people usually find out the hard way — after moving in.",
          },
          {
            title: "A score, not a swipe",
            body: "Every match comes with a percentage and a breakdown of exactly why, across the things that matter.",
          },
          {
            title: "Contact stays private",
            body: "No email or phone number is shared until both people accept the match.",
          },
        ].map((item) => (
          <div key={item.title} className="border-t-2 border-primary pt-4">
            <h3 className="font-display text-lg font-medium text-ink">{item.title}</h3>
            <p className="mt-2 text-sm text-muted">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
