import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import * as api from "../api/mockApi";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { handleAuthSuccess } = useApp();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.login(form);
      await handleAuthSuccess();
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Welcome back</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="block text-sm font-medium text-ink mb-1">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={update("email")}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-card focus:border-primary outline-none transition-colors"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-ink mb-1">Password</span>
          <input
            type="password"
            value={form.password}
            onChange={update("password")}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-card focus:border-primary outline-none transition-colors"
          />
        </label>

        {error && <p className="text-sm text-accent">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted text-center">
        New here?{" "}
        <Link to="/signup" className="text-primary font-medium">
          Create an account
        </Link>
      </p>
    </div>
  );
}
