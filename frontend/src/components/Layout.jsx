import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import logo from "../assets/logo/name.png";

const navLink = (isActive) =>
  `px-3 py-2 text-sm font-medium rounded-full transition-colors ${
    isActive
      ? "bg-primary-light text-primary-dark"
      : "text-muted hover:text-ink"
  }`;

export default function Layout() {
  const { isAuthenticated, logout, profile } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-bg text-ink">

      {/* Hide navbar only on splash screen */}
      {location.pathname !== "/" && (
        <header className="border-b border-border bg-card">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

            {/* Roomeo Logo */}
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="Roomeo"
                className="h-9 w-auto object-contain"
              />
            </Link>

            {isAuthenticated && (
              <nav className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className={navLink(
                    location.pathname === "/dashboard"
                  )}
                >
                  Dashboard
                </Link>

                <Link
                  to="/matches"
                  className={navLink(
                    location.pathname.startsWith("/matches")
                  )}
                >
                  Matches
                </Link>

                <Link
                  to="/requests"
                  className={navLink(
                    location.pathname === "/requests"
                  )}
                >
                  Requests
                </Link>

                <span className="text-border">|</span>

                <span className="px-3 py-2 text-sm text-muted">
                  {profile?.name || "You"}
                </span>

                <button
                  onClick={handleLogout}
                  className={navLink(false)}
                >
                  Log out
                </button>
              </nav>
            )}
          </div>
        </header>
      )}

      <main>
        <Outlet />
      </main>
    </div>
  );
}