"""Optional OpenCV + pytesseract ANPR pipeline.

Fail-safe by design:
- Missing OpenCV/pytesseract does not crash the host system.
- Webcam/OCR issues simply return an empty plate string.
"""

from __future__ import annotations

import logging
import re


LOGGER = logging.getLogger(__name__)

try:
    import cv2  # type: ignore
except Exception:  # pragma: no cover - runtime dependency
    cv2 = None

try:
    import pytesseract  # type: ignore
except Exception:  # pragma: no cover - runtime dependency
    pytesseract = None


INDIAN_PLATE_PATTERN = re.compile(r"^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$")


def _open_camera():
    """Open webcam with backend fallbacks that work better on Windows."""
    if cv2 is None:
        return None

    backend_candidates = []
    if hasattr(cv2, "CAP_DSHOW"):
        backend_candidates.append(("CAP_DSHOW", cv2.CAP_DSHOW))
    backend_candidates.append(("DEFAULT", None))

    for backend_name, backend in backend_candidates:
        try:
            camera = cv2.VideoCapture(0, backend) if backend is not None else cv2.VideoCapture(0)
            if camera is not None and camera.isOpened():
                LOGGER.info("Opened webcam using backend: %s", backend_name)
                return camera
            if camera is not None:
                camera.release()
        except Exception:
            LOGGER.exception("Failed to open webcam with backend %s", backend_name)

    return None


def _clean_plate(raw_text: str) -> str:
    cleaned = re.sub(r"[^A-Z0-9]", "", raw_text.upper())
    return cleaned


def _extract_valid_plate_from_text(raw_text: str) -> str:
    """Normalize OCR output and return the first valid Indian plate match."""
    if not raw_text:
        return ""

    normalized = raw_text.upper().replace(" ", "").replace("\n", " ")
    candidates = re.findall(r"[A-Z0-9]{8,12}", normalized)

    for candidate in candidates:
        cleaned = _clean_plate(candidate)
        if cleaned and INDIAN_PLATE_PATTERN.match(cleaned):
            return cleaned

    cleaned_full = _clean_plate(normalized)
    if cleaned_full and INDIAN_PLATE_PATTERN.match(cleaned_full):
        return cleaned_full

    return ""


def _ocr_image(image) -> str:
    """Run OCR on a preprocessed image and return a validated plate if found."""
    text = pytesseract.image_to_string(
        image,
        config="--psm 7 --oem 3",
    )
    return _extract_valid_plate_from_text(text)


def _extract_plate_from_frame(frame) -> str:
    """Process a single frame and return the best OCR guess."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blurred = cv2.bilateralFilter(gray, 11, 17, 17)
    edged = cv2.Canny(blurred, 30, 200)

    contours, _ = cv2.findContours(
        edged.copy(),
        cv2.RETR_TREE,
        cv2.CHAIN_APPROX_SIMPLE,
    )
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]

    for contour in contours:
        perimeter = cv2.arcLength(contour, True)
        approximation = cv2.approxPolyDP(contour, 0.018 * perimeter, True)

        if len(approximation) != 4:
            continue

        x, y, w, h = cv2.boundingRect(approximation)
        plate_region = gray[y : y + h, x : x + w]
        if plate_region.size == 0:
            continue

        threshold = cv2.threshold(
            plate_region,
            0,
            255,
            cv2.THRESH_BINARY + cv2.THRESH_OTSU,
        )[1]
        threshold = cv2.resize(
            threshold,
            None,
            fx=2.0,
            fy=2.0,
            interpolation=cv2.INTER_CUBIC,
        )

        detected = _ocr_image(threshold)
        if detected:
            return detected

    # Fallback path:
    # OCR the whole frame after stronger preprocessing so printed text on paper
    # or another screen can still be detected during laptop-camera testing.
    full_frame_threshold = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU,
    )[1]
    full_frame_threshold = cv2.resize(
        full_frame_threshold,
        None,
        fx=1.8,
        fy=1.8,
        interpolation=cv2.INTER_CUBIC,
    )

    detected = _ocr_image(full_frame_threshold)
    if detected:
        return detected

    adaptive = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11,
    )
    adaptive = cv2.resize(
        adaptive,
        None,
        fx=1.8,
        fy=1.8,
        interpolation=cv2.INTER_CUBIC,
    )
    return _ocr_image(adaptive)


def detect_vehicle_number() -> str:
    """Capture webcam frames and return a detected vehicle number or an empty string."""
    if cv2 is None or pytesseract is None:
        LOGGER.warning("ANPR dependencies are unavailable. Falling back safely.")
        return ""

    camera = None
    try:
        camera = _open_camera()
        if camera is None:
            LOGGER.warning("Webcam could not be opened for ANPR mode.")
            return ""

        for _ in range(45):
            success, frame = camera.read()
            if not success or frame is None:
                continue

            try:
                detected = _extract_plate_from_frame(frame)
            except Exception:
                LOGGER.exception("OCR pipeline failed on a frame; skipping.")
                continue

            if detected:
                LOGGER.info("Detected vehicle number via ANPR: %s", detected)
                return detected

        return ""
    except Exception:
        LOGGER.exception("OpenCV ANPR flow failed unexpectedly.")
        return ""
    finally:
        if camera is not None:
            camera.release()
        if cv2 is not None:
            try:
                cv2.destroyAllWindows()
            except Exception:
                LOGGER.debug("OpenCV windows were not available to close.")
