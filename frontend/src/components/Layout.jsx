import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

const navLink = (isActive) =>
  `px-3 py-2 text-sm font-medium rounded-full transition-colors ${
    isActive ? "bg-primary-light text-primary-dark" : "text-muted hover:text-ink"
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
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="font-display text-xl font-semibold text-ink">
            Roomeo
          </Link>
          {isAuthenticated && (
            <nav className="flex items-center gap-1">
              <Link to="/dashboard" className={navLink(location.pathname === "/dashboard")}>
                Dashboard
              </Link>
              <Link to="/matches" className={navLink(location.pathname.startsWith("/matches"))}>
                Matches
              </Link>
              <Link to="/requests" className={navLink(location.pathname === "/requests")}>
                Requests
              </Link>
              <span className="mx-2 text-border">|</span>
              <span className="text-sm text-muted hidden sm:inline">
                {profile?.name || "You"}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium text-muted hover:text-accent transition-colors"
              >
                Log out
              </button>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
