import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import * as api from "../api/mockApi";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      await api.signup(form);
      await handleAuthSuccess();
      navigate("/onboarding");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Create your account</h1>
      <p className="mt-2 text-sm text-muted">
        Takes about 5 minutes, including the questionnaire.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Field label="Full name" value={form.name} onChange={update("name")} />
        <Field label="Email" type="email" value={form.email} onChange={update("email")} />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={update("password")}
        />

        {error && <p className="text-sm text-accent">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Continue to questionnaire"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}

// Small local field component - not worth its own file since it's only used
// on Signup/Login, but pulled out to avoid repeating label+input markup.
function Field({ label, type = "text", value, onChange }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required
        className="w-full px-4 py-2.5 rounded-xl border border-border bg-card focus:border-primary outline-none transition-colors"
      />
    </label>
  );
}
