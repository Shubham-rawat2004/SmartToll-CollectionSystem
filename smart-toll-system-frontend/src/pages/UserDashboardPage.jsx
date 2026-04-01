import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  addMoneyToWallet,
  fetchUserDetails,
  fetchUserTransactions,
} from "../services/userService";
import { registerVehicle } from "../services/vehicleService";

const initialVehicleForm = {
  vehicleNumber: "",
  rfidTag: "",
};

function UserDashboardPage() {
  const { user, updateUser } = useAuth();
  const userId = user?.id;
  const [walletAmount, setWalletAmount] = useState("");
  const [vehicleForm, setVehicleForm] = useState(initialVehicleForm);
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [registeredVehicle, setRegisteredVehicle] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(false);
  const [vehicleLoading, setVehicleLoading] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      if (!userId) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [userDetails, transactionHistory] = await Promise.all([
          fetchUserDetails(userId),
          fetchUserTransactions(userId),
        ]);

        setProfile(userDetails);
        setTransactions(transactionHistory);
        updateUser({
          ...user,
          name: userDetails.name,
          email: userDetails.email,
          role: userDetails.role,
          walletBalance: userDetails.walletBalance,
        });
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load your dashboard right now."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [userId]);

  async function handleAddMoney(event) {
    event.preventDefault();
    if (!walletAmount) {
      return;
    }

    setWalletLoading(true);
    setMessage("");
    setError("");

    try {
      const updatedUser = await addMoneyToWallet(userId, Number(walletAmount));
      setProfile(updatedUser);
      updateUser({
        ...user,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        walletBalance: updatedUser.walletBalance,
      });
      setWalletAmount("");
      setMessage("Wallet updated successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to add money to wallet."
      );
    } finally {
      setWalletLoading(false);
    }
  }

  async function handleRegisterVehicle(event) {
    event.preventDefault();
    setVehicleLoading(true);
    setMessage("");
    setError("");

    try {
      const savedVehicle = await registerVehicle({
        ...vehicleForm,
        ownerId: userId,
      });
      setRegisteredVehicle(savedVehicle);
      setVehicleForm(initialVehicleForm);
      setMessage("Vehicle registered successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to register vehicle."
      );
    } finally {
      setVehicleLoading(false);
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
        <p className="text-sm text-slate-600">Loading your dashboard...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="panel-card">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-signal">
            User Portal
          </p>
          <h1 className="mt-3 text-3xl font-bold text-ink">
            Welcome back, {profile?.name || user?.name}
          </h1>
          <p className="mt-3 text-slate-600">
            Manage your wallet, register a vehicle, and review every toll
            transaction from one place.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="soft-card">
              <p className="text-sm text-slate-500">Wallet Balance</p>
              <p className="mt-2 text-2xl font-bold text-ink">
                {formatCurrency(profile?.walletBalance)}
              </p>
            </article>
            <article className="soft-card">
              <p className="text-sm text-slate-500">Role</p>
              <p className="mt-2 text-xl font-semibold text-ink">
                {profile?.role || user?.role}
              </p>
            </article>
            <article className="soft-card">
              <p className="text-sm text-slate-500">Transactions</p>
              <p className="mt-2 text-2xl font-bold text-ink">
                {transactions.length}
              </p>
            </article>
          </div>
        </div>

        <div className="rounded-[28px] bg-ink p-8 text-white shadow-[0_20px_60px_-30px_rgba(16,33,43,0.5)]">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-road">
            Account Snapshot
          </p>
          <h2 className="mt-3 text-2xl font-bold">
            {profile?.email || user?.email}
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            Keep your wallet funded to avoid failed toll scans and register each
            vehicle with a unique RFID tag before use.
          </p>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel-card">
          <h2 className="text-xl font-bold text-ink">Add Money</h2>
          <p className="mt-2 text-sm text-slate-600">
            Top up your wallet to keep toll processing smooth.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleAddMoney}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Amount
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={walletAmount}
                onChange={(event) => setWalletAmount(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-signal"
                placeholder="Enter amount"
                required
              />
            </div>
            <button
              type="submit"
              disabled={walletLoading}
              className="rounded-2xl bg-signal px-5 py-3 font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-70"
            >
              {walletLoading ? "Updating..." : "Add Money"}
            </button>
          </form>
        </div>

        <div className="panel-card">
          <h2 className="text-xl font-bold text-ink">Register Vehicle</h2>
          <p className="mt-2 text-sm text-slate-600">
            Add a vehicle number and bind it to a unique RFID tag.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleRegisterVehicle}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Vehicle Number
              </label>
              <input
                name="vehicleNumber"
                value={vehicleForm.vehicleNumber}
                onChange={(event) =>
                  setVehicleForm((current) => ({
                    ...current,
                    vehicleNumber: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 uppercase outline-none transition focus:border-signal"
                placeholder="MH12AB1234"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                RFID Tag
              </label>
              <input
                name="rfidTag"
                value={vehicleForm.rfidTag}
                onChange={(event) =>
                  setVehicleForm((current) => ({
                    ...current,
                    rfidTag: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-signal"
                placeholder="RFID-0001"
                required
              />
            </div>
            <button
              type="submit"
              disabled={vehicleLoading}
              className="rounded-2xl bg-road px-5 py-3 font-semibold text-ink transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {vehicleLoading ? "Registering..." : "Register Vehicle"}
            </button>
          </form>

          {registeredVehicle ? (
            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 text-sm text-slate-700">
              Registered vehicle{" "}
              <span className="font-semibold">{registeredVehicle.vehicleNumber}</span>{" "}
              with RFID <span className="font-semibold">{registeredVehicle.rfidTag}</span>.
            </div>
          ) : null}
        </div>
      </div>

      <div className="table-shell">
        <div className="p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-ink">Transaction History</h2>
              <p className="mt-2 text-sm text-slate-600">
                Review recent toll deductions and failed scans.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="text-left text-slate-500">
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
                    <td colSpan="5" className="py-8 text-center text-slate-500">
                      No transactions found yet.
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

export default UserDashboardPage;
