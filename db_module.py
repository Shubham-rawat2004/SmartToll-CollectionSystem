"""SQLite access layer for the optional ANPR toll flow.

This module is additive and does not change the existing payment system.
It owns the small dummy database used by the new ANPR integration.
"""

from __future__ import annotations

import logging
import sqlite3
import threading
from pathlib import Path
from typing import Any


LOGGER = logging.getLogger(__name__)
DB_PATH = Path(__file__).resolve().parent / "toll_system.db"

_CONNECTION_LOCK = threading.Lock()
_CONNECTION: sqlite3.Connection | None = None

_SEED_ROWS = [
    ("UP32AB1234", "Aarav Singh", "aarav@upi", 500, "active"),
    ("HR98AA0000", "Aarav Singh", "aarav@upi", 500, "active"),
    ("HR20AU5000", "Aarav Singh", "aarav@upi", 500, "active"),
    ("DL01CD5678", "Neha Verma", "neha@upi", 50, "active"),
    ("UP14EF9999", "Rohan Gupta", "rohan@upi", 0, "blocked"),
]


def _get_connection() -> sqlite3.Connection:
    """Return a shared SQLite connection for this process."""
    global _CONNECTION

    with _CONNECTION_LOCK:
        if _CONNECTION is None:
            _CONNECTION = sqlite3.connect(DB_PATH, check_same_thread=False)
            _CONNECTION.row_factory = sqlite3.Row
        return _CONNECTION


def initialize_database() -> None:
    """Create schema and seed dummy data only when the table is empty."""
    connection = _get_connection()

    with _CONNECTION_LOCK:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS vehicles (
                vehicle_number TEXT PRIMARY KEY,
                owner_name TEXT,
                upi_id TEXT,
                balance INTEGER,
                status TEXT
            )
            """
        )
        row_count = connection.execute("SELECT COUNT(*) FROM vehicles").fetchone()[0]
        if row_count == 0:
            connection.executemany(
                """
                INSERT INTO vehicles (
                    vehicle_number,
                    owner_name,
                    upi_id,
                    balance,
                    status
                ) VALUES (?, ?, ?, ?, ?)
                """,
                _SEED_ROWS,
            )
        else:
            connection.executemany(
                """
                INSERT OR IGNORE INTO vehicles (
                    vehicle_number,
                    owner_name,
                    upi_id,
                    balance,
                    status
                ) VALUES (?, ?, ?, ?, ?)
                """,
                [
                    ("HR98AA0000", "Aarav Singh", "aarav@upi", 500, "active"),
                    ("HR20AU5000", "Aarav Singh", "aarav@upi", 500, "active"),
                ],
            )
        connection.commit()


def get_vehicle(vehicle_number: str) -> dict[str, Any] | None:
    """Fetch a vehicle safely from the dummy database."""
    if not vehicle_number:
        return None

    try:
        connection = _get_connection()
        row = connection.execute(
            """
            SELECT vehicle_number, owner_name, upi_id, balance, status
            FROM vehicles
            WHERE vehicle_number = ?
            """,
            (vehicle_number.upper().strip(),),
        ).fetchone()
        return dict(row) if row else None
    except sqlite3.Error:
        LOGGER.exception("Failed to fetch vehicle %s from SQLite DB", vehicle_number)
        return None


def deduct_balance(vehicle_number: str, amount: int) -> bool:
    """Deduct balance only when the vehicle exists and has enough funds."""
    if not vehicle_number or amount <= 0:
        return False

    try:
        connection = _get_connection()
        with _CONNECTION_LOCK:
            row = connection.execute(
                "SELECT balance FROM vehicles WHERE vehicle_number = ?",
                (vehicle_number.upper().strip(),),
            ).fetchone()
            if row is None or int(row["balance"]) < amount:
                return False

            connection.execute(
                """
                UPDATE vehicles
                SET balance = balance - ?
                WHERE vehicle_number = ?
                """,
                (amount, vehicle_number.upper().strip()),
            )
            connection.commit()
        return True
    except sqlite3.Error:
        LOGGER.exception(
            "Failed to deduct %s from vehicle %s in SQLite DB",
            amount,
            vehicle_number,
        )
        return False


def credit_balance(vehicle_number: str, amount: int) -> bool:
    """Restore balance when a downstream integration step fails."""
    if not vehicle_number or amount <= 0:
        return False

    try:
        connection = _get_connection()
        with _CONNECTION_LOCK:
            row = connection.execute(
                "SELECT balance FROM vehicles WHERE vehicle_number = ?",
                (vehicle_number.upper().strip(),),
            ).fetchone()
            if row is None:
                return False

            connection.execute(
                """
                UPDATE vehicles
                SET balance = balance + ?
                WHERE vehicle_number = ?
                """,
                (amount, vehicle_number.upper().strip()),
            )
            connection.commit()
        return True
    except sqlite3.Error:
        LOGGER.exception(
            "Failed to credit %s back to vehicle %s in SQLite DB",
            amount,
            vehicle_number,
        )
        return False


initialize_database()
