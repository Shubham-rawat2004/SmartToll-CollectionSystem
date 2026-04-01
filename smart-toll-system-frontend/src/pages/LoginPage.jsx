import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", form);
      const user = {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      login({ token: data.token, user });
      navigate(data.role === "ADMIN" ? "/admin" : "/user", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="panel-card flex flex-col justify-between bg-gradient-to-br from-ink to-slate-900 text-white">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-road">
            Welcome Back
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Sign in and get straight to your toll dashboard.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-200">
            Track wallet balance, register vehicles, monitor toll activity, and
            manage operations with a simpler workflow.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Secure Access</p>
            <p className="mt-2 text-lg font-semibold">JWT protected routes</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Fast Actions</p>
            <p className="mt-2 text-lg font-semibold">Wallet, scans, history</p>
          </div>
        </div>
      </div>

      <div className="form-card mx-auto w-full max-w-xl">
        <h1 className="text-3xl font-bold text-ink">Login</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in with your Smart Toll account to continue.
        </p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="field-input"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <span className="text-xs text-slate-400">Keep it private</span>
            </div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="field-input"
              placeholder="Enter password"
              required
            />
          </div>
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
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Need an account?{" "}
          <Link to="/register" className="font-semibold text-signal">
            Register here
          </Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
