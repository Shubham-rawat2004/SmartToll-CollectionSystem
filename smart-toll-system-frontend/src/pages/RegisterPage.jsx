import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "USER",
  walletBalance: 0,
};

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "walletBalance" ? Number(value) : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.post("/auth/register", form);
      setMessage(data.message || "Registration successful. Please log in.");
      setForm(initialForm);
      setTimeout(() => navigate("/login"), 1000);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to register."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="panel-card bg-gradient-to-br from-signal to-emerald-700 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-100">
          New Account
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          Create a profile and start using Smart Toll quickly.
        </h1>
        <p className="mt-4 text-sm leading-7 text-emerald-50">
          Register your account, choose the role, and set an opening wallet
          balance so you can move directly into vehicle registration and scanning.
        </p>

        <div className="mt-8 space-y-3">
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            Simple onboarding with clean validation feedback
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            Built for both admin and standard user roles
          </div>
        </div>
      </div>

      <div className="form-card mx-auto w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-ink">Create Account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Register a new Smart Toll account and choose the role for this user.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="field-input"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="field-input"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="field-input"
              placeholder="Create a password"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="field-input"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Opening Wallet Balance</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="walletBalance"
                value={form.walletBalance}
                onChange={handleChange}
                className="field-input"
                placeholder="0.00"
              />
            </div>
          </div>

          {message ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-signal px-4 py-3 font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-signal">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;
