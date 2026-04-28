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

const paymentGateways = [
  {
    id: "stripe",
    name: "Stripe UPI",
    accent: "from-violet-500 to-indigo-500",
    description: "Fast, clean UPI checkout.",
  },
  {
    id: "paypal",
    name: "PayPal UPI",
    accent: "from-sky-500 to-blue-600",
    description: "Wallet-style approval flow.",
  },
  {
    id: "razorpay",
    name: "Razorpay UPI",
    accent: "from-emerald-500 to-teal-600",
    description: "Simple PIN confirmation.",
  },
];

const initialPaymentForm = {
  upiId: "",
  upiPin: "",
};

function UserDashboardPage() {
  const { user, updateUser } = useAuth();
  const userId = user?.id;
  const [walletAmount, setWalletAmount] = useState("");
  const [selectedGateway, setSelectedGateway] = useState(paymentGateways[0].id);
  const [paymentStage, setPaymentStage] = useState("idle");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm);
  const [vehicleForm, setVehicleForm] = useState(initialVehicleForm);
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [registeredVehicle, setRegisteredVehicle] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [lastRechargeAmount, setLastRechargeAmount] = useState(0);

  async function loadDashboard(isBackgroundRefresh = false) {
    if (!userId) {
      return;
    }

    if (isBackgroundRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
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
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    const refreshInterval = window.setInterval(() => {
      loadDashboard(true);
    }, 5000);

    return () => window.clearInterval(refreshInterval);
  }, [userId]);

  function openPaymentModal(event) {
    event.preventDefault();
    if (!walletAmount || Number(walletAmount) <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    setError("");
    setMessage("");
    setPaymentForm({
      upiId: `${(profile?.name || user?.name || "user")
        .toLowerCase()
        .replace(/\s+/g, "")}@upi`,
      upiPin: "",
    });
    setPaymentStage("idle");
    setShowPaymentModal(true);
  }

  async function confirmDummyPayment(event) {
    event.preventDefault();

    if (!paymentForm.upiId.includes("@")) {
      setError("Enter a valid UPI ID.");
      return;
    }

    if (!/^\d{4}$/.test(paymentForm.upiPin)) {
      setError("Enter a 4-digit UPI PIN.");
      return;
    }

    setWalletLoading(true);
    setPaymentStage("processing");
    setError("");
    setMessage("");

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      setPaymentStage("authorised");
      await new Promise((resolve) => window.setTimeout(resolve, 900));

      const rechargeAmount = Number(walletAmount);
      const updatedUser = await addMoneyToWallet(userId, rechargeAmount);

      setProfile(updatedUser);
      updateUser({
        ...user,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        walletBalance: updatedUser.walletBalance,
      });

      const gatewayName =
        paymentGateways.find((gateway) => gateway.id === selectedGateway)?.name ||
        "Dummy gateway";

      setLastRechargeAmount(rechargeAmount);
      setWalletAmount("");
      setPaymentForm(initialPaymentForm);
      setPaymentStage("success");
      setShowPaymentModal(false);
      setShowSuccessPopup(true);
      setMessage(
        `${gatewayName} confirmed ${formatCurrency(rechargeAmount)}.`
      );
    } catch (requestError) {
      setPaymentStage("failed");
      setError(requestError.message || "Payment failed.");
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
      setMessage("Vehicle registered.");
    } catch (requestError) {
      setError(requestError.message || "Unable to register vehicle.");
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

  const selectedGatewayData = paymentGateways.find(
    (gateway) => gateway.id === selectedGateway
  );

  if (loading) {
    return (
      <section className="panel-card">
        <p className="text-sm text-slate-600">Loading your dashboard...</p>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="panel-card interactive-card">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-signal">
              User Hub
            </p>
            <h1 className="mt-3 text-3xl font-bold text-ink">
              Welcome back, {profile?.name || user?.name}
            </h1>
            <p className="mt-3 text-slate-600">
              Recharge, register, and track activity in one place.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <article className="soft-card">
                <p className="text-sm text-slate-500">Balance</p>
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

          <div className="rounded-[28px] bg-ink p-8 text-white shadow-[0_20px_60px_-30px_rgba(16,33,43,0.5)] interactive-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-road">
                  Quick Actions
                </p>
                <h2 className="mt-3 text-2xl font-bold">
                  {profile?.email || user?.email}
                </h2>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                Active
              </span>
            </div>

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("wallet-recharge-section")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-4 text-left transition hover:bg-white/15"
              >
                <div>
                  <p className="text-sm font-semibold">Recharge</p>
                  <p className="mt-1 text-xs text-slate-300">Open UPI demo</p>
                </div>
                <span className="text-lg">+</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("vehicle-register-section")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-4 text-left transition hover:bg-white/15"
              >
                <div>
                  <p className="text-sm font-semibold">Add Vehicle</p>
                  <p className="mt-1 text-xs text-slate-300">Link RFID tag</p>
                </div>
                <span className="text-lg">+</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("history-section")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-4 text-left transition hover:bg-white/15"
              >
                <div>
                  <p className="text-sm font-semibold">History</p>
                  <p className="mt-1 text-xs text-slate-300">Recent activity</p>
                </div>
                <span className="text-lg">+</span>
              </button>
            </div>
          </div>
        </div>

        {message ? (
          <div className="animate-rise-in rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="animate-rise-in rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <div
            id="wallet-recharge-section"
            className="panel-card interactive-card overflow-hidden"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-ink">Wallet Recharge</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Pay first. Credit later.
                </p>
              </div>
              <div className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-signal">
                UPI Demo
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {paymentGateways.map((gateway) => {
                const active = selectedGateway === gateway.id;
                return (
                  <button
                    key={gateway.id}
                    type="button"
                    onClick={() => setSelectedGateway(gateway.id)}
                    className={`gateway-card ${active ? "border-signal ring-4 ring-emerald-100" : ""}`}
                  >
                    <div
                      className={`mb-4 h-11 rounded-2xl bg-gradient-to-r ${gateway.accent}`}
                    />
                    <p className="text-base font-semibold text-ink">{gateway.name}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {gateway.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <form className="mt-8 space-y-5" onSubmit={openPaymentModal}>
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
                  className="field-input"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Summary</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Gateway:{" "}
                      <span className="font-medium text-ink">
                        {selectedGatewayData?.name}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Pay
                    </p>
                    <p className="mt-1 text-2xl font-bold text-ink">
                      {formatCurrency(Number(walletAmount || 0))}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={walletLoading}
                className="w-full rounded-2xl bg-signal px-5 py-3 font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-70"
              >
                Proceed to Payment
              </button>
            </form>
          </div>

          <div
            id="vehicle-register-section"
            className="panel-card interactive-card"
          >
            <h2 className="text-xl font-bold text-ink">Register Vehicle</h2>
            <p className="mt-2 text-sm text-slate-600">Add number and RFID.</p>

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
                  className="field-input uppercase"
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
                  className="field-input"
                  placeholder="RFID-0001"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={vehicleLoading}
                className="w-full rounded-2xl bg-road px-5 py-3 font-semibold text-ink transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {vehicleLoading ? "Registering..." : "Register Vehicle"}
              </button>
            </form>

            {registeredVehicle ? (
              <div className="mt-6 animate-rise-in rounded-2xl border border-slate-200/80 bg-slate-50 p-4 text-sm text-slate-700">
                Registered{" "}
                <span className="font-semibold">{registeredVehicle.vehicleNumber}</span>{" "}
                with RFID <span className="font-semibold">{registeredVehicle.rfidTag}</span>.
              </div>
            ) : null}
          </div>
        </div>

        <div id="history-section" className="table-shell animate-rise-in">
          <div className="p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-ink">Transaction History</h2>
                <p className="mt-2 text-sm text-slate-600">Recent toll activity.</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Shows transactions for this logged-in user and refreshes every 5 seconds.
                </p>
              </div>
              <button
                type="button"
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal disabled:cursor-not-allowed disabled:opacity-70"
              >
                {refreshing ? "Refreshing..." : "Refresh History"}
              </button>
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

      {showPaymentModal ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="form-card animate-rise-in w-full max-w-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-signal">
                  Dummy UPI Checkout
                </p>
                <h3 className="mt-2 text-2xl font-bold text-ink">
                  Confirm Payment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!walletLoading) {
                    setShowPaymentModal(false);
                    setPaymentStage("idle");
                  }
                }}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500"
              >
                Close
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-sm font-semibold text-slate-700">
                {selectedGatewayData?.name}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Pay {formatCurrency(Number(walletAmount || 0))} to Smart Toll Wallet
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={confirmDummyPayment}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  UPI ID
                </label>
                <input
                  value={paymentForm.upiId}
                  onChange={(event) =>
                    setPaymentForm((current) => ({
                      ...current,
                      upiId: event.target.value,
                    }))
                  }
                  className="field-input"
                  placeholder="yourname@upi"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  UPI PIN
                </label>
                <input
                  type="password"
                  maxLength="4"
                  inputMode="numeric"
                  value={paymentForm.upiPin}
                  onChange={(event) =>
                    setPaymentForm((current) => ({
                      ...current,
                      upiPin: event.target.value.replace(/\D/g, "").slice(0, 4),
                    }))
                  }
                  className="field-input text-center tracking-[0.45em]"
                  placeholder="0000"
                  required
                />
                <p className="mt-2 text-xs text-slate-500">
                  Use any 4-digit PIN for this demo.
                </p>
              </div>

              {walletLoading ? (
                <div className="animate-rise-in rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="animate-pulse-glow flex h-12 w-12 items-center justify-center rounded-full bg-signal text-sm font-bold text-white">
                      UPI
                    </div>
                    <div>
                      <p className="font-semibold text-ink">
                        {paymentStage === "authorised"
                          ? "PIN verified. Confirming..."
                          : "Sending payment request..."}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Please wait while the dummy gateway confirms your payment.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={walletLoading}
                className="w-full rounded-2xl bg-signal px-5 py-3 font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-70"
              >
                {walletLoading ? "Confirming Payment..." : "Pay Now"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {showSuccessPopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="form-card animate-rise-in w-full max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-600">
              OK
            </div>
            <h3 className="mt-5 text-2xl font-bold text-ink">Payment Confirmed</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {formatCurrency(lastRechargeAmount)} added to wallet.
            </p>
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-700">
              Approved via {selectedGatewayData?.name}
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessPopup(false)}
              className="mt-6 w-full rounded-2xl bg-ink px-5 py-3 font-semibold text-white transition hover:bg-signal"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default UserDashboardPage;
