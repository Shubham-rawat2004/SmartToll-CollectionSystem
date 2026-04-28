"""Runnable demo entry point for the optional ANPR integration.

This file exists so the Python ANPR flow can be launched easily from IntelliJ IDEA
without touching the existing backend/frontend application.
"""

from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.request

from toll_controller import process_toll_with_existing_payment


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

LOGGER = logging.getLogger(__name__)
BACKEND_BASE_URL = os.getenv("SMART_TOLL_API_URL", "http://localhost:9090").rstrip("/")


def _sync_scan_with_backend(vehicle_number: str, toll_booth_name: str) -> None:
    """Push the ANPR/manual scan into the Spring Boot backend used by the UI."""
    payload = json.dumps(
        {
            "vehicleNumber": vehicle_number,
            "tollBoothName": toll_booth_name,
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        url=f"{BACKEND_BASE_URL}/toll/scan/plate",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            body = response.read().decode("utf-8")
    except urllib.error.HTTPError as error:
        error_body = error.read().decode("utf-8", errors="ignore")
        raise RuntimeError(
            f"Backend rejected the plate scan with HTTP {error.code}: {error_body}"
        ) from error
    except urllib.error.URLError as error:
        raise RuntimeError(
            "Could not reach the Spring Boot backend. "
            "Make sure the app is running on http://localhost:9090."
        ) from error

    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as error:
        raise RuntimeError(f"Backend returned an unreadable response: {body}") from error

    if not parsed.get("success"):
        raise RuntimeError(parsed.get("message") or "Backend scan did not succeed")

    LOGGER.info(
        "Backend sync completed for %s at booth %s. Remaining balance in app DB: %s",
        vehicle_number,
        toll_booth_name,
        parsed.get("remainingBalance"),
    )


def _build_process_payment(toll_booth_name: str):
    def process_payment(vehicle_number: str) -> None:
        """Bridge the Python ANPR flow into the Spring Boot backend."""
        print(f"[LEGACY] process_payment({vehicle_number}) called")
        _sync_scan_with_backend(vehicle_number, toll_booth_name)

    return process_payment


def main() -> None:
    print("\nSmart Toll ANPR Demo")
    print(f"Spring backend URL: {BACKEND_BASE_URL}")
    toll_booth_name = input("Enter toll booth name exactly as in the app: ").strip()
    if not toll_booth_name:
        print("Toll booth name is required so the scan can be recorded in the app.")
        return

    print("1. MANUAL mode")
    print("2. AUTO mode (OpenCV + OCR)")
    choice = input("Choose mode [1/2]: ").strip()

    process_payment = _build_process_payment(toll_booth_name)

    if choice == "2":
        success = process_toll_with_existing_payment(
            process_payment_func=process_payment,
            mode="AUTO",
            toll_amount=100,
        )
    else:
        vehicle_number = input("Enter vehicle number: ").strip().upper()
        success = process_toll_with_existing_payment(
            process_payment_func=process_payment,
            mode="MANUAL",
            manual_vehicle_number=vehicle_number,
            toll_amount=100,
        )

    print(f"Processed: {success}")
    if success:
        print("The Spring Boot backend was updated. Refresh the dashboard/UI to see the new balance and transaction.")


if __name__ == "__main__":
    main()
