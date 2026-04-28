# IntelliJ IDEA Setup For ANPR Demo

This project is still primarily a Spring Boot + React app. The ANPR feature was added as a separate Python layer and can run independently inside IntelliJ IDEA.

It can also sync successful scans into the running Spring Boot backend so the
wallet balance and transaction history become visible in the existing UI.

## Files Added

- `db_module.py`
- `anpr_module.py`
- `toll_controller.py`
- `run_anpr_demo.py`
- `toll_system.db`

## What This Demo Does

- `MANUAL` mode:
  - takes a typed plate number
  - validates it
  - checks the SQLite dummy DB
  - deducts balance
  - calls `process_payment(vehicle_number)`
  - pushes the successful scan into Spring Boot using the vehicle number + toll booth name

- `AUTO` mode:
  - opens webcam
  - tries ANPR using OpenCV + pytesseract
  - then runs the same DB + payment flow

## Step 1: Enable Python In IntelliJ

Install the Python plugin in IntelliJ IDEA if it is not already enabled.

## Step 2: Configure Python Interpreter

1. Open the project in IntelliJ IDEA
2. Go to `File -> Project Structure -> SDKs` and add a Python interpreter if needed
3. Or go to `File -> Settings -> Python Interpreter`
4. Select your Python 3 interpreter

The repo was verified with Python `3.13`.

## Step 3: Install Python Dependencies

Open the IntelliJ terminal in the project root and run:

```powershell
pip install -r requirements-anpr.txt
```

## Step 4: Install Tesseract OCR

Install Tesseract OCR on Windows.

After installation, either:

- add the Tesseract install directory to your system `PATH`

or

- edit `anpr_module.py` and set:

```python
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Path\To\tesseract.exe"
```

Only do that if Tesseract is not already available from `PATH`.

## Step 5: Run Manual Demo In IntelliJ

1. Right-click `run_anpr_demo.py`
2. Click `Run 'run_anpr_demo'`
3. Enter a toll booth name that already exists in the app, for example one you created from the admin dashboard
4. Choose `1` for manual mode
5. Enter one of:
   - `UP32AB1234`
   - `DL01CD5678`
   - `UP14EF9999`

Expected behavior:

- `UP32AB1234` should succeed
- `DL01CD5678` should fail for insufficient balance if toll amount is `100`
- `UP14EF9999` should fail because status is `blocked`
- on success, refresh the app UI to see the new transaction and wallet balance

## Step 6: Run Auto Demo In IntelliJ

1. Right-click `run_anpr_demo.py`
2. Click `Run 'run_anpr_demo'`
3. Enter a toll booth name that already exists in the app
4. Choose `2` for auto mode
5. Present a plate to the webcam

Expected behavior:

- if OpenCV and Tesseract work, the system tries to detect and process the plate
- if detection fails, the program does not crash and returns `Processed: False`
- on success, the scan is also written to the Spring Boot backend for UI visibility

## Step 7: Check Database

The SQLite DB file is:

`toll_system.db`

Seeded vehicles:

- `UP32AB1234` -> balance `500` -> `active`
- `DL01CD5678` -> balance `50` -> `active`
- `UP14EF9999` -> balance `0` -> `blocked`

## Step 8: Check UI Sync

1. Start the Spring Boot backend on port `9090`
2. Start the React app
3. Log in with the user who owns the scanned vehicle
4. Run `run_anpr_demo.py` and complete a successful scan
5. Refresh the user dashboard or transaction history page

Expected behavior:

- wallet balance should decrease in the UI
- a new transaction should appear in the history tables

## Step 9: Wire Into Real Legacy Payment

Right now `run_anpr_demo.py` uses a demo callback:

```python
def process_payment(vehicle_number: str) -> None:
    print(f"[LEGACY] process_payment({vehicle_number}) called")
```

When your real legacy Python payment function is available, replace that demo callback with the real import, for example:

```python
from legacy_module import process_payment
```

Do not change the real function. Pass it directly into:

```python
process_toll_with_existing_payment(
    process_payment_func=process_payment,
    mode="AUTO",
)
```

## Safety Notes

- Existing Spring Boot and React code is untouched
- Existing manual flow is preserved through `MANUAL` mode
- OpenCV/pytesseract failures do not crash the system
- DB failures are logged and return safely
