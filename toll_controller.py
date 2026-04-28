"""Optional ANPR integration layer.

This file wraps around an existing `process_payment(vehicle_number)` function
without modifying it. The legacy manual flow can keep working as-is.
"""

from __future__ import annotations

import logging
import re
import time
from typing import Callable

from anpr_module import detect_vehicle_number
from db_module import credit_balance, deduct_balance, get_vehicle


LOGGER = logging.getLogger(__name__)
INDIAN_PLATE_REGEX = re.compile(r"^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$")
COOLDOWN_SECONDS = 10

_LAST_PROCESSED: dict[str, float] = {}


def is_valid_plate(plate: str) -> bool:
    """Validate OCR/manual plate text against a common Indian format."""
    if not plate:
        return False
    return bool(INDIAN_PLATE_REGEX.fullmatch(plate.strip().upper()))


def _is_in_cooldown(vehicle_number: str) -> bool:
    last_processed = _LAST_PROCESSED.get(vehicle_number)
    if last_processed is None:
        return False
    return (time.time() - last_processed) < COOLDOWN_SECONDS


def _mark_processed(vehicle_number: str) -> None:
    _LAST_PROCESSED[vehicle_number] = time.time()


class TollController:
    """Integration facade that preserves the existing payment function."""

    def __init__(
        self,
        process_payment_func: Callable[[str], object],
        toll_amount: int = 100,
    ) -> None:
        self.process_payment_func = process_payment_func
        self.toll_amount = toll_amount

    def process_toll(self, mode: str = "MANUAL", manual_vehicle_number: str = "") -> bool:
        """Run either AUTO ANPR mode or the legacy manual mode safely."""
        try:
            if mode.upper() == "AUTO":
                vehicle_number = detect_vehicle_number()
                if not vehicle_number:
                    LOGGER.info("ANPR did not detect a valid plate. Skipping this cycle.")
                    return False
            else:
                vehicle_number = manual_vehicle_number.strip().upper()

            return self._handle_vehicle(vehicle_number)
        except Exception:
            LOGGER.exception("Toll controller failed, but the system is still running.")
            return False

    def _handle_vehicle(self, vehicle_number: str) -> bool:
        vehicle_number = vehicle_number.strip().upper()

        if not is_valid_plate(vehicle_number):
            LOGGER.warning("Rejected invalid vehicle plate: %s", vehicle_number)
            return False

        if _is_in_cooldown(vehicle_number):
            LOGGER.info("Cooldown active for %s. Preventing double charge.", vehicle_number)
            return False

        vehicle = get_vehicle(vehicle_number)
        if not vehicle:
            LOGGER.warning("Vehicle not found in dummy DB: %s", vehicle_number)
            return False

        if vehicle.get("status", "").lower() != "active":
            LOGGER.warning("Vehicle %s is not active.", vehicle_number)
            return False

        if int(vehicle.get("balance", 0)) < self.toll_amount:
            LOGGER.warning("Vehicle %s has insufficient balance.", vehicle_number)
            return False

        if not deduct_balance(vehicle_number, self.toll_amount):
            LOGGER.error("Balance deduction failed for %s.", vehicle_number)
            return False

        # Critical integration point:
        # We call the legacy function exactly as provided by the existing system.
        try:
            self.process_payment_func(vehicle_number)
        except Exception:
            credit_balance(vehicle_number, self.toll_amount)
            LOGGER.exception(
                "Legacy payment flow failed for %s. Dummy DB balance was restored.",
                vehicle_number,
            )
            return False

        _mark_processed(vehicle_number)
        LOGGER.info("Legacy payment flow completed for %s", vehicle_number)
        return True


def process_toll_with_existing_payment(
    process_payment_func: Callable[[str], object],
    mode: str = "MANUAL",
    manual_vehicle_number: str = "",
    toll_amount: int = 100,
) -> bool:
    """Convenience wrapper for plugging the new flow into existing code."""
    controller = TollController(process_payment_func, toll_amount=toll_amount)
    return controller.process_toll(mode=mode, manual_vehicle_number=manual_vehicle_number)
