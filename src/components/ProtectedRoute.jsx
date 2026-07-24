import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

// Wraps any page that requires login. If Backend Person A's real auth isn't
// wired up yet, `isAuthenticated` just reflects mockApi's in-memory session -
// same behavior, same component, once the real thing lands.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
