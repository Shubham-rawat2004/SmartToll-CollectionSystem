import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-wide text-ink">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-sm font-bold text-white">
              ST
            </span>
            <span>
              Smart Toll System
              <span className="block text-xs font-medium tracking-[0.22em] text-slate-400">
                CONTROL HUB
              </span>
            </span>
          </Link>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-signal sm:hidden"
            >
              Logout
            </button>
          ) : null}
        </div>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-medium sm:justify-end">
          <Link
            to="/"
            className="rounded-full px-4 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-signal"
          >
            Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to={user?.role === "ADMIN" ? "/admin" : "/user"}
                className="rounded-full px-4 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-signal"
              >
                {user?.role === "ADMIN" ? "Admin" : "Dashboard"}
              </Link>
              <Link
                to="/scan"
                className="rounded-full px-4 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-signal"
              >
                Toll Scan
              </Link>
              <span className="hidden rounded-full bg-slate-100 px-4 py-2 text-slate-500 lg:inline-flex">
                {user?.name || user?.email}
              </span>
              <button
                type="button"
                onClick={logout}
                className="hidden rounded-full bg-ink px-4 py-2 text-white transition hover:bg-signal sm:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-full px-4 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-signal"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="rounded-full bg-signal px-4 py-2 text-white transition hover:bg-ink"
              >
                Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
