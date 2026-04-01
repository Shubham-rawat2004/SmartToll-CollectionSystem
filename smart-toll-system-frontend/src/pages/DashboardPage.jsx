function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="panel-card">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-signal">
            Smart Mobility
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Manage toll operations with a cleaner, faster control surface.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Your frontend is now structured for authentication, wallet management,
            toll scanning, transaction review, and admin monitoring.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="soft-card">
              <p className="text-sm text-slate-500">Auth Ready</p>
              <p className="mt-2 text-2xl font-bold text-ink">JWT</p>
            </article>
            <article className="soft-card">
              <p className="text-sm text-slate-500">Dashboards</p>
              <p className="mt-2 text-2xl font-bold text-ink">Admin + User</p>
            </article>
            <article className="soft-card">
              <p className="text-sm text-slate-500">Scan Flow</p>
              <p className="mt-2 text-2xl font-bold text-ink">Live API</p>
            </article>
          </div>
        </div>

        <div className="rounded-[28px] bg-ink p-8 text-white shadow-[0_20px_60px_-30px_rgba(16,33,43,0.5)]">
          <h2 className="text-xl font-semibold">Frontend Modules</h2>
          <ul className="mt-6 space-y-4 text-sm text-slate-200">
            <li className="rounded-2xl bg-white/10 px-4 py-3">`pages` for route screens</li>
            <li className="rounded-2xl bg-white/10 px-4 py-3">`components` for reusable UI</li>
            <li className="rounded-2xl bg-white/10 px-4 py-3">`services` for axios API access</li>
            <li className="rounded-2xl bg-white/10 px-4 py-3">`context` for auth state</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <article className="panel-card">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-road">
            User Experience
          </p>
          <p className="mt-3 text-lg font-semibold text-ink">
            Responsive cards and forms for wallet actions, vehicle registration, and toll scanning.
          </p>
        </article>
        <article className="panel-card">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-road">
            Operations
          </p>
          <p className="mt-3 text-lg font-semibold text-ink">
            Admin tables for transactions and vehicle monitoring are ready to extend with filters.
          </p>
        </article>
        <article className="panel-card">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-road">
            Integration
          </p>
          <p className="mt-3 text-lg font-semibold text-ink">
            Shared axios interceptors keep JWT headers and error handling centralized.
          </p>
        </article>
      </div>
    </section>
  );
}

export default DashboardPage;
