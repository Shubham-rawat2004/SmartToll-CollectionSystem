import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";
import { fetchAllTollBooths, scanToll } from "../services/tollService";

const initialForm = {
  rfidTag: "",
  tollBoothName: "",
};

const INDIAN_PLATE_PATTERN = /[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}/g;
const OCR_CONFIG = {
  logger: () => {},
  tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
};

function TollScanPage() {
  const [form, setForm] = useState(initialForm);
  const [tollBooths, setTollBooths] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [boothLoading, setBoothLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageName, setImageName] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

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

  useEffect(() => {
    return () => {
      stopCamera();
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
    };
  }, [uploadedImageUrl]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function startCamera() {
    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (cameraError) {
      setCameraActive(false);
      setError(
        cameraError.message ||
          "Unable to access the camera. Please allow camera permission."
      );
    }
  }

  function stopCamera() {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }

  function extractPlateFromText(text) {
    const cleaned = text
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\s/g, "");

    const matches = cleaned.match(INDIAN_PLATE_PATTERN);
    return matches?.[0] || "";
  }

  function drawPreviewImage(imageSource) {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = imageSource.naturalWidth || imageSource.videoWidth || 1280;
    canvas.height = imageSource.naturalHeight || imageSource.videoHeight || 720;
    context.drawImage(imageSource, 0, 0, canvas.width, canvas.height);
  }

  function createProcessedCanvas(sourceCanvas, processor) {
    const processedCanvas = document.createElement("canvas");
    processedCanvas.width = sourceCanvas.width;
    processedCanvas.height = sourceCanvas.height;

    const sourceContext = sourceCanvas.getContext("2d");
    const imageData = sourceContext.getImageData(
      0,
      0,
      sourceCanvas.width,
      sourceCanvas.height
    );
    const processedImageData = processor(imageData);

    processedCanvas.getContext("2d").putImageData(processedImageData, 0, 0);
    return processedCanvas;
  }

  function buildOcrCanvases() {
    if (!canvasRef.current) {
      return [];
    }

    const sourceCanvas = canvasRef.current;
    const canvases = [sourceCanvas];

    canvases.push(
      createProcessedCanvas(sourceCanvas, (imageData) => {
        const data = imageData.data;
        for (let index = 0; index < data.length; index += 4) {
          const grayscale =
            data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
          const value = grayscale > 170 ? 255 : 0;
          data[index] = value;
          data[index + 1] = value;
          data[index + 2] = value;
        }
        return imageData;
      })
    );

    const cropCanvas = document.createElement("canvas");
    const cropWidth = Math.round(sourceCanvas.width * 0.86);
    const cropHeight = Math.round(sourceCanvas.height * 0.52);
    cropCanvas.width = cropWidth;
    cropCanvas.height = cropHeight;
    cropCanvas.getContext("2d").drawImage(
      sourceCanvas,
      Math.round((sourceCanvas.width - cropWidth) / 2),
      Math.round((sourceCanvas.height - cropHeight) / 2),
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );
    canvases.push(cropCanvas);

    canvases.push(
      createProcessedCanvas(cropCanvas, (imageData) => {
        const data = imageData.data;
        for (let index = 0; index < data.length; index += 4) {
          const grayscale =
            data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
          const contrast = grayscale > 155 ? 255 : 0;
          data[index] = contrast;
          data[index + 1] = contrast;
          data[index + 2] = contrast;
        }
        return imageData;
      })
    );

    return canvases;
  }

  async function submitScan(scanInput) {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await scanToll({
        rfidTag: scanInput,
        tollBoothName: form.tollBoothName,
      });
      setResult(response);
      setForm((current) => ({
        ...initialForm,
        tollBoothName: current.tollBoothName,
      }));
      return response;
    } catch (requestError) {
      setResult(null);
      setError(requestError.message || "Unable to process toll scan.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function readPlateFromCanvas(sourceLabel) {
    if (!canvasRef.current) {
      setError(`${sourceLabel} preview is not ready yet.`);
      return;
    }

    setError("");
    setOcrLoading(true);
    setOcrText("");

    try {
      const canvases = buildOcrCanvases();
      let detectedPlate = "";
      let bestText = "";

      for (const candidateCanvas of canvases) {
        const {
          data: { text },
        } = await Tesseract.recognize(candidateCanvas, "eng", OCR_CONFIG);

        if (!bestText.trim() && text.trim()) {
          bestText = text;
        }

        detectedPlate = extractPlateFromText(text);
        if (detectedPlate) {
          bestText = text;
          break;
        }
      }

      setOcrText(bestText);

      if (detectedPlate) {
        console.log("Detected number plate:", detectedPlate);
        setForm((current) => ({
          ...current,
          rfidTag: detectedPlate,
        }));
        await submitScan(detectedPlate);
      } else {
        console.log("No valid number plate detected. Raw OCR:", bestText);
        setError(
          `No valid plate detected from the ${sourceLabel.toLowerCase()}. Try a clearer image, angle, or better light.`
        );
      }
    } catch (ocrError) {
      setError(ocrError.message || `Unable to scan the plate from the ${sourceLabel.toLowerCase()}.`);
    } finally {
      setOcrLoading(false);
    }
  }

  async function captureAndReadPlate() {
    if (!videoRef.current) {
      setError("Camera is not ready yet.");
      return;
    }

    drawPreviewImage(videoRef.current);
    await readPlateFromCanvas("camera");
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError("");
    setResult(null);
    setOcrText("");
    setImageName(file.name);

    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setUploadedImageUrl(objectUrl);
    stopCamera();
  }

  async function readUploadedImage() {
    if (!uploadedImageUrl) {
      setError("Upload an image first.");
      return;
    }

    const image = new Image();
    image.src = uploadedImageUrl;

    try {
      await image.decode();
      drawPreviewImage(image);
      await readPlateFromCanvas("uploaded image");
    } catch (imageError) {
      setError(imageError.message || "Unable to load the uploaded image.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await submitScan(form.rfidTag.trim());
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
            Use manual input or live camera OCR to read a number plate, print it
            in the browser console, and trigger automatic toll deduction.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <article className="soft-card">
              <p className="text-sm text-slate-500">Available Booths</p>
              <p className="mt-2 text-2xl font-bold text-ink">{tollBooths.length}</p>
            </article>
            <article className="soft-card">
              <p className="text-sm text-slate-500">Scan Mode</p>
              <p className="mt-2 text-lg font-semibold text-ink">
                Manual + Camera OCR
              </p>
            </article>
          </div>
        </div>

        <div className="form-card bg-white/95">
          <h2 className="text-2xl font-bold">Scan RFID / Plate</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            You can still type the scan input manually, or open the camera and use
            Tesseract OCR to capture a number plate into the form and submit it automatically.
          </p>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">Camera OCR</p>
                <p className="text-xs text-slate-500">
                  Detect a vehicle number from live camera or a test image and auto-submit the toll scan.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={cameraActive ? stopCamera : startCamera}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal"
                >
                  {cameraActive ? "Stop Camera" : "Start Camera"}
                </button>
                <button
                  type="button"
                  onClick={captureAndReadPlate}
                  disabled={!cameraActive || ocrLoading}
                  className="rounded-2xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-signal disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ocrLoading ? "Reading..." : "Capture Plate"}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal"
                >
                  Upload Image
                </button>
                <button
                  type="button"
                  onClick={readUploadedImage}
                  disabled={!uploadedImageUrl || ocrLoading}
                  className="rounded-2xl bg-signal px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ocrLoading ? "Reading..." : "Scan Uploaded"}
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div className="mt-4 overflow-hidden rounded-3xl bg-slate-950">
              {uploadedImageUrl ? (
                <img
                  src={uploadedImageUrl}
                  alt="Uploaded plate preview"
                  className="h-[260px] w-full object-contain bg-slate-950"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-[260px] w-full object-cover"
                />
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />

            <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
              <p className="font-medium text-ink">Current Source</p>
              <p className="mt-2 break-all">
                {uploadedImageUrl
                  ? `Uploaded image: ${imageName || "selected file"}`
                  : cameraActive
                    ? "Live camera feed"
                    : "No source selected yet."}
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
              <p className="font-medium text-ink">Latest OCR text</p>
              <p className="mt-2 break-all">
                {ocrText ? ocrText : "No camera capture processed yet."}
              </p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                RFID Tag / Detected Plate
              </label>
              <input
                name="rfidTag"
                value={form.rfidTag}
                onChange={handleChange}
                className="field-input"
                placeholder="RFID-0001 or plate from OCR"
                required
              />
              <p className="mt-2 text-xs text-slate-500">
                When OCR finds a plate, it will be filled here, printed in the
                browser console, and submitted automatically.
              </p>
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
