function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="panel-card interactive-card">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-signal">
            Smart Toll
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Run toll operations with speed and clarity.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Login, recharge, scan, and monitor from one clean dashboard.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="soft-card">
              <p className="text-sm text-slate-500">Auth</p>
              <p className="mt-2 text-2xl font-bold text-ink">JWT</p>
            </article>
            <article className="soft-card">
              <p className="text-sm text-slate-500">Panels</p>
              <p className="mt-2 text-2xl font-bold text-ink">Admin + User</p>
            </article>
            <article className="soft-card">
              <p className="text-sm text-slate-500">Scan</p>
              <p className="mt-2 text-2xl font-bold text-ink">Live API</p>
            </article>
          </div>
        </div>

        <div className="rounded-[28px] bg-ink p-8 text-white shadow-[0_20px_60px_-30px_rgba(16,33,43,0.5)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Core Areas</h2>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
              Ready
            </span>
          </div>
          <ul className="mt-6 space-y-4 text-sm text-slate-200">
            <li className="rounded-2xl bg-white/10 px-4 py-3">Pages for app views</li>
            <li className="rounded-2xl bg-white/10 px-4 py-3">Components for reuse</li>
            <li className="rounded-2xl bg-white/10 px-4 py-3">Services for API calls</li>
            <li className="rounded-2xl bg-white/10 px-4 py-3">Context for auth state</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <article className="panel-card interactive-card">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-road">
            UX
          </p>
          <p className="mt-3 text-lg font-semibold text-ink">
            Clean cards for recharge, vehicles, and scans.
          </p>
        </article>
        <article className="panel-card interactive-card">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-road">
            Ops
          </p>
          <p className="mt-3 text-lg font-semibold text-ink">
            Admin tables for activity and vehicle watch.
          </p>
        </article>
        <article className="panel-card interactive-card">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-road">
            API
          </p>
          <p className="mt-3 text-lg font-semibold text-ink">
            Shared client with auth and global errors.
          </p>
        </article>
      </div>
    </section>
  );
}

export default DashboardPage;
