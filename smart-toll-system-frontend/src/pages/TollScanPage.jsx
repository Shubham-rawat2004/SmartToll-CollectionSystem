import { useEffect, useState } from "react";
import { fetchAllTollBooths, scanToll } from "../services/tollService";

const initialForm = {
  rfidTag: "",
  tollBoothName: "",
};

function TollScanPage() {
  const [form, setForm] = useState(initialForm);
  const [tollBooths, setTollBooths] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [boothLoading, setBoothLoading] = useState(true);

  useEffect(() => {
    async function loadTollBooths() {
      setBoothLoading(true);
      try {
        const response = await fetchAllTollBooths();
        setTollBooths(response);
        setForm((current) => ({
          ...current,
          tollBoothName: response[0]?.name || "",
        }));
      } catch (requestError) {
        setError(requestError.message || "Unable to load toll booths.");
      } finally {
        setBoothLoading(false);
      }
    }

    loadTollBooths();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await scanToll({
        rfidTag: form.rfidTag.trim(),
        tollBoothName: form.tollBoothName,
      });
      setResult(response);
      setForm((current) => ({
        ...initialForm,
        tollBoothName: current.tollBoothName,
      }));
    } catch (requestError) {
      setResult(null);
      setError(requestError.message || "Unable to process toll scan.");
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount ?? 0);
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="panel-card">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-road">
            Toll Operations
          </p>
          <h1 className="mt-3 text-3xl font-bold text-ink">Toll Scan Simulator</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Enter an RFID tag and choose a toll booth by name to simulate a live
            scan against the backend toll-processing API.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <article className="soft-card">
              <p className="text-sm text-slate-500">Available Booths</p>
              <p className="mt-2 text-2xl font-bold text-ink">{tollBooths.length}</p>
            </article>
            <article className="soft-card">
              <p className="text-sm text-slate-500">Scan Mode</p>
              <p className="mt-2 text-lg font-semibold text-ink">Manual simulation</p>
            </article>
          </div>
        </div>

        <div className="form-card bg-white/95">
          <h2 className="text-2xl font-bold">Scan RFID</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Pick from the available toll booths and send the scan directly to
            `/toll/scan`.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                RFID Tag
              </label>
              <input
                name="rfidTag"
                value={form.rfidTag}
                onChange={handleChange}
                className="field-input"
                placeholder="RFID-0001"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Toll Booth
              </label>
              <select
                name="tollBoothName"
                value={form.tollBoothName}
                onChange={handleChange}
                className="field-input"
                required
                disabled={boothLoading || !tollBooths.length}
              >
                {tollBooths.length ? null : (
                  <option value="">No toll booths available</option>
                )}
                {tollBooths.map((booth) => (
                  <option key={booth.id} value={booth.name} className="text-ink">
                    {booth.name} - {booth.location}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">
                Select the booth where this scan is being simulated.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || boothLoading || !tollBooths.length}
              className="w-full rounded-2xl bg-signal px-4 py-3 font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Processing..." : "Scan Toll"}
            </button>
          </form>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div
          className={`panel-card ${
            result.success
              ? "border-emerald-200 bg-emerald-50"
              : "border-rose-200 bg-rose-50"
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                result.success
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {result.success ? "SUCCESS" : "FAILED"}
            </span>
            <h2 className="text-xl font-bold text-ink">{result.message}</h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="soft-card bg-white/90">
              <p className="text-sm text-slate-500">Vehicle</p>
              <p className="mt-2 font-semibold text-ink">
                {result.vehicleNumber || "N/A"}
              </p>
            </article>
            <article className="soft-card bg-white/90">
              <p className="text-sm text-slate-500">Owner</p>
              <p className="mt-2 font-semibold text-ink">
                {result.ownerName || "N/A"}
              </p>
            </article>
            <article className="soft-card bg-white/90">
              <p className="text-sm text-slate-500">Toll Amount</p>
              <p className="mt-2 font-semibold text-ink">
                {formatCurrency(result.tollAmount)}
              </p>
            </article>
            <article className="soft-card bg-white/90">
              <p className="text-sm text-slate-500">Remaining Balance</p>
              <p className="mt-2 font-semibold text-ink">
                {formatCurrency(result.remainingBalance)}
              </p>
            </article>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <article className="soft-card bg-white/90">
              <p className="text-sm text-slate-500">Toll Booth</p>
              <p className="mt-2 font-semibold text-ink">
                {result.tollBoothName || "N/A"}
              </p>
            </article>
            <article className="soft-card bg-white/90">
              <p className="text-sm text-slate-500">Timestamp</p>
              <p className="mt-2 font-semibold text-ink">
                {result.timestamp
                  ? new Date(result.timestamp).toLocaleString("en-IN")
                  : "N/A"}
              </p>
            </article>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default TollScanPage;
