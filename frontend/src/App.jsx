import { Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Splash from "./pages/Splash";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Matches from "./pages/Matches";
import MatchDetail from "./pages/MatchDetail";
import Requests from "./pages/Requests";

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<Layout />}>
          
          {/* Public pages */}
          <Route path="/" element={<Splash />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Protected pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            }
          />

          <Route
            path="/matches/:matchId"
            element={
              <ProtectedRoute>
                <MatchDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <Requests />
              </ProtectedRoute>
            }
          />

        </Route>
      </Routes>
    </AppProvider>
  );
}