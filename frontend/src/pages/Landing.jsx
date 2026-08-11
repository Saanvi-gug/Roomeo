import { Link } from "react-router-dom";
import logo from "../assets/logo/roomeo-logo.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">

        {/* Logo */}
        <div className="flex justify-center">
          <img
            src={logo}
            alt="Roomeo"
            className="w-48 h-auto object-contain"
          />
        </div>

        {/* Hero */}
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-2xl text-center">

            <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Find a roommate who actually fits your lifestyle.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
              Roomeo helps you find compatible roommates based on
              your habits, budget, lifestyle, and living preferences.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex w-full items-center justify-center rounded-full bg-primary px-7 py-3 font-medium text-white transition-colors hover:bg-primary-dark sm:w-auto"
              >
                Get started
              </Link>

              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-full border border-border bg-card px-7 py-3 font-medium text-ink transition-colors hover:border-primary sm:w-auto"
              >
                Log in
              </Link>
            </div>

            <p className="mt-6 text-sm text-muted">
              Better matches. Better living.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}