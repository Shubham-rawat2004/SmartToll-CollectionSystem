import { useEffect, useState } from "react";
import {
  addTollBooth,
  fetchAllTransactions,
  fetchAllVehicles,
} from "../services/adminService";

const initialBoothForm = {
  name: "",
  location: "",
  tollAmount: "",
};

function AdminDashboardPage() {
  const [boothForm, setBoothForm] = useState(initialBoothForm);
  const [transactions, setTransactions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [latestBooth, setLatestBooth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadAdminDashboard(isBackgroundRefresh = false) {
    if (isBackgroundRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const [transactionData, vehicleData] = await Promise.all([
        fetchAllTransactions(),
        fetchAllVehicles(),
      ]);

      setTransactions(transactionData);
      setVehicles(vehicleData);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load admin dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAdminDashboard();

    const refreshInterval = window.setInterval(() => {
      loadAdminDashboard(true);
    }, 5000);

    return () => window.clearInterval(refreshInterval);
  }, []);

  async function handleAddBooth(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const savedBooth = await addTollBooth({
        ...boothForm,
        tollAmount: Number(boothForm.tollAmount),
      });
      setLatestBooth(savedBooth);
      setBoothForm(initialBoothForm);
      setMessage("Toll booth added successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to add toll booth."
      );
    } finally {
      setSaving(false);
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount ?? 0);
  }

  if (loading) {
    return (
      <section className="panel-card">
        <p className="text-sm text-slate-600">Loading admin dashboard...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel-card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-road">
                Admin Portal
              </p>
              <h1 className="mt-3 text-3xl font-bold text-ink">Admin Dashboard</h1>
            </div>
            <button
              type="button"
              onClick={() => loadAdminDashboard(true)}
              disabled={refreshing}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-road hover:text-road disabled:cursor-not-allowed disabled:opacity-70"
            >
              {refreshing ? "Refreshing..." : "Refresh Records"}
            </button>
          </div>
          <p className="mt-3 max-w-2xl text-slate-600">
            Add toll booths, review all toll activity, and monitor registered
            vehicles from a single operations console.
          </p>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Transactions refresh automatically every 5 seconds.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="soft-card">
              <p className="text-sm text-slate-500">Transactions</p>
              <p className="mt-2 text-2xl font-bold text-ink">
                {transactions.length}
              </p>
            </article>
            <article className="soft-card">
              <p className="text-sm text-slate-500">Vehicles</p>
              <p className="mt-2 text-2xl font-bold text-ink">
                {vehicles.length}
              </p>
            </article>
            <article className="soft-card">
              <p className="text-sm text-slate-500">Failed Transactions</p>
              <p className="mt-2 text-2xl font-bold text-ink">
                {transactions.filter((item) => item.status !== "SUCCESS").length}
              </p>
            </article>
          </div>
        </div>

        <div className="rounded-[28px] bg-ink p-8 text-white shadow-[0_20px_60px_-30px_rgba(16,33,43,0.5)]">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-road">
            Control Panel
          </p>
          <h2 className="mt-3 text-2xl font-bold">Add Toll Booth</h2>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            Create a new booth with a location and amount so it becomes available
            for toll processing.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleAddBooth}>
            <input
              value={boothForm.name}
              onChange={(event) =>
                setBoothForm((current) => ({ ...current, name: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-500 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-300 focus:border-road"
              placeholder="Booth name"
              required
            />
            <input
              value={boothForm.location}
              onChange={(event) =>
                setBoothForm((current) => ({
                  ...current,
                  location: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-500 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-300 focus:border-road"
              placeholder="Location"
              required
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={boothForm.tollAmount}
              onChange={(event) =>
                setBoothForm((current) => ({
                  ...current,
                  tollAmount: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-500 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-300 focus:border-road"
              placeholder="Toll amount"
              required
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-road px-4 py-3 font-semibold text-ink transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Add Toll Booth"}
            </button>
          </form>
        </div>
      </div>

      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      {latestBooth ? (
        <div className="panel-card py-4">
          <p className="text-sm text-slate-600">
            Latest booth:
            <span className="ml-2 font-semibold text-ink">{latestBooth.name}</span>
            <span className="ml-2 text-slate-500">
              {latestBooth.location} | {formatCurrency(latestBooth.tollAmount)}
            </span>
          </p>
        </div>
      ) : null}

      <div className="table-shell">
        <div className="p-8">
          <h2 className="text-xl font-bold text-ink">All Transactions</h2>
          <p className="mt-2 text-sm text-slate-600">
            Review successful, failed, and suspicious toll activity.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">ID</th>
                  <th className="pb-3 pr-4 font-semibold">Vehicle</th>
                  <th className="pb-3 pr-4 font-semibold">Booth</th>
                  <th className="pb-3 pr-4 font-semibold">Amount</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length ? (
                  transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="py-4 pr-4 text-slate-600">{transaction.id}</td>
                      <td className="py-4 pr-4 font-medium text-ink">
                        {transaction.vehicleNumber}
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        {transaction.tollBoothName}
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            transaction.status === "SUCCESS"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-4 text-slate-600">
                        {new Date(transaction.timestamp).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      No transactions available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="table-shell">
        <div className="p-8">
          <h2 className="text-xl font-bold text-ink">Vehicle Monitor</h2>
          <p className="mt-2 text-sm text-slate-600">
            Track all registered vehicles and their RFID assignments.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">ID</th>
                  <th className="pb-3 pr-4 font-semibold">Vehicle Number</th>
                  <th className="pb-3 pr-4 font-semibold">Owner</th>
                  <th className="pb-3 pr-4 font-semibold">Owner ID</th>
                  <th className="pb-3 font-semibold">RFID Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.length ? (
                  vehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td className="py-4 pr-4 text-slate-600">{vehicle.id}</td>
                      <td className="py-4 pr-4 font-medium text-ink">
                        {vehicle.vehicleNumber}
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        {vehicle.ownerName}
                      </td>
                      <td className="py-4 pr-4 text-slate-600">{vehicle.ownerId}</td>
                      <td className="py-4 text-slate-600">{vehicle.rfidTag}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">
                      No vehicles registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboardPage;
