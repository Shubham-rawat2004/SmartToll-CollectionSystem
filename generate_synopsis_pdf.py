from __future__ import annotations

from pathlib import Path
import textwrap


OUTPUT_PATH = Path("Smart_Toll_Collection_System_Synopsis.pdf")


SECTIONS = [
    (
        "Project Title",
        [
            "Smart Toll Collection System",
        ],
    ),
    (
        "1. Introduction",
        [
            "The Smart Toll Collection System is a full-stack web-based application developed to automate toll payment and toll monitoring processes. Traditional toll collection methods involve manual checking, waiting lines, and inefficient payment handling. This project reduces manual effort and improves toll management by using RFID-based vehicle identification and Automatic Number Plate Recognition (ANPR) with OCR. The system provides automatic toll deduction, transaction tracking, vehicle registration, and administrative monitoring through separate dashboards.",
        ],
    ),
    (
        "2. Problem Statement",
        [
            "Manual toll collection systems are time-consuming and prone to delays, human error, and poor transaction transparency. Vehicles often need to stop for verification and payment, which increases congestion at toll plazas. There is a need for a smarter toll management solution that can identify vehicles automatically, deduct toll charges digitally, and maintain proper records for both users and administrators.",
        ],
    ),
    (
        "3. Objectives",
        [
            "To develop a digital toll collection system with automatic payment deduction.",
            "To enable vehicle identification through RFID and number plate recognition.",
            "To provide wallet-based payment integration for registered users.",
            "To maintain transaction history for users and administrators.",
            "To create a secure role-based platform for users, operators, and admins.",
            "To reduce manual intervention in toll processing.",
        ],
    ),
    (
        "4. Scope of the Project",
        [
            "The project covers vehicle registration, wallet recharge, toll booth management, toll deduction, transaction recording, and dashboard monitoring. It supports both manual scanning and OCR-based plate detection through live camera and uploaded images. The system is suitable as a prototype for smart toll plaza automation and can be extended further for real-world integration with live hardware and payment gateways.",
        ],
    ),
    (
        "5. Proposed System",
        [
            "The proposed system consists of a Spring Boot backend and a React frontend. Users can register, log in, recharge their wallet, and register vehicles with unique RFID tags. Admins can add toll booths, monitor vehicle activity, and view all transactions. When a toll scan occurs, the system identifies the vehicle using RFID or plate number, checks wallet balance, deducts the toll amount automatically, and saves the transaction details. If the vehicle is not found or the wallet balance is insufficient, the transaction is marked as failed.",
        ],
    ),
    (
        "6. Methodology / Working",
        [
            "User registers and logs into the system.",
            "User adds money to wallet.",
            "User registers vehicle details and RFID tag.",
            "Admin creates toll booths with location and toll amount.",
            "Vehicle is scanned using RFID or ANPR OCR.",
            "System verifies whether the vehicle exists in the database.",
            "If valid and balance is sufficient, toll is deducted automatically.",
            "Transaction is stored and shown in user and admin dashboards.",
            "Duplicate scan checks are applied to prevent repeated processing.",
        ],
    ),
    (
        "7. Features of the Project",
        [
            "User registration and login",
            "Role-based access control",
            "Wallet recharge functionality",
            "Vehicle registration with RFID",
            "Toll booth creation and management",
            "Manual toll scan support",
            "Camera OCR-based number plate detection",
            "Uploaded image OCR-based number plate detection",
            "Automatic toll deduction",
            "Transaction history for users",
            "Admin dashboard for all transactions and vehicle monitoring",
            "Duplicate scan protection",
            "Failed transaction handling",
        ],
    ),
    (
        "8. Technologies Used",
        [
            "Frontend: React, Vite, JavaScript, Tailwind CSS",
            "Backend: Spring Boot, Java",
            "Database: MySQL",
            "OCR: Tesseract.js",
            "Tools: Maven, Git, IntelliJ IDEA / VS Code",
        ],
    ),
    (
        "9. Hardware and Software Requirements",
        [
            "Hardware Requirements: Computer or laptop with webcam, minimum 4 GB RAM, and browser access for testing.",
            "Software Requirements: Windows/Linux/Mac OS, Java JDK, Node.js and npm, MySQL Server, Maven, and a modern web browser.",
        ],
    ),
    (
        "10. Expected Outcome",
        [
            "The expected outcome of the project is a working smart toll prototype that can automatically identify vehicles, deduct toll charges, and maintain real-time digital records. The system improves speed, accuracy, and transparency in toll operations while providing easy monitoring for both users and administrators.",
        ],
    ),
    (
        "11. Applications",
        [
            "Highway toll plaza automation",
            "Smart city transportation systems",
            "Vehicle monitoring platforms",
            "Automated payment collection systems",
        ],
    ),
    (
        "12. Future Enhancements",
        [
            "Integration with real RFID hardware",
            "Integration with real payment gateways",
            "SMS/email notifications after transactions",
            "Live deployment with cloud database",
            "Advanced OCR and image enhancement",
            "Booth-wise analytics and reporting",
            "Multi-location transaction sharing and alerts",
        ],
    ),
    (
        "13. Conclusion",
        [
            "The Smart Toll Collection System is a practical and effective solution for automating toll collection and monitoring. It combines RFID, OCR, wallet-based deduction, and dashboard-based management into one integrated platform. The project demonstrates how digital technologies can improve efficiency, reduce manual work, and provide a strong foundation for future intelligent transportation systems.",
        ],
    ),
]


def escape_pdf_text(value: str) -> str:
    return (
        value.replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
    )


def build_lines() -> list[tuple[str, str]]:
    lines: list[tuple[str, str]] = [
        ("title", "SMART TOLL COLLECTION SYSTEM"),
        ("subtitle", "College Project Synopsis"),
        ("spacer", ""),
    ]

    for heading, paragraphs in SECTIONS:
        lines.append(("heading", heading))
        for paragraph in paragraphs:
            if heading in {"3. Objectives", "6. Methodology / Working", "7. Features of the Project", "8. Technologies Used", "11. Applications", "12. Future Enhancements"}:
                wrapped = textwrap.wrap(f"- {paragraph}", width=88)
                lines.extend(("body", item) for item in wrapped)
            else:
                wrapped = textwrap.wrap(paragraph, width=92)
                lines.extend(("body", item) for item in wrapped)
            lines.append(("spacer", ""))
    return lines


def paginate(lines: list[tuple[str, str]]) -> list[list[tuple[str, str]]]:
    pages: list[list[tuple[str, str]]] = []
    current: list[tuple[str, str]] = []
    remaining_height = 742

    height_map = {"title": 28, "subtitle": 18, "heading": 20, "body": 15, "spacer": 10}

    for line_type, text in lines:
        needed = height_map[line_type]
        if current and remaining_height - needed < 72:
            pages.append(current)
            current = []
            remaining_height = 742
        current.append((line_type, text))
        remaining_height -= needed

    if current:
        pages.append(current)
    return pages


def build_content_stream(page_lines: list[tuple[str, str]], page_number: int, total_pages: int) -> str:
    y = 790
    stream_parts = ["BT", "/F1 12 Tf", "72 0 0 72 0 0 Tm"]

    font_map = {
        "title": (18, 24),
        "subtitle": (12, 18),
        "heading": (13, 18),
        "body": (11, 14),
        "spacer": (11, 10),
    }

    for line_type, text in page_lines:
        size, step = font_map[line_type]
        y -= step
        if line_type == "spacer":
            continue
        stream_parts.append(f"/F1 {size} Tf")
        stream_parts.append(f"1 0 0 1 72 {y} Tm")
        stream_parts.append(f"({escape_pdf_text(text)}) Tj")

    footer = f"Page {page_number} of {total_pages}"
    stream_parts.append("/F1 10 Tf")
    stream_parts.append(f"1 0 0 1 500 40 Tm ({escape_pdf_text(footer)}) Tj")
    stream_parts.append("ET")
    return "\n".join(stream_parts)


def write_pdf(output_path: Path) -> None:
    pages = paginate(build_lines())
    objects: list[bytes] = []

    objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")
    kids = " ".join(f"{3 + index * 2} 0 R" for index in range(len(pages)))
    objects.append(f"<< /Type /Pages /Count {len(pages)} /Kids [ {kids} ] >>".encode())

    for index, page_lines in enumerate(pages):
        page_obj_num = 3 + index * 2
        content_obj_num = page_obj_num + 1
        page_obj = (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
            f"/Resources << /Font << /F1 {3 + len(pages) * 2} 0 R >> >> "
            f"/Contents {content_obj_num} 0 R >>"
        )
        objects.append(page_obj.encode())
        content = build_content_stream(page_lines, index + 1, len(pages)).encode("latin-1")
        objects.append(f"<< /Length {len(content)} >>\nstream\n".encode() + content + b"\nendstream")

    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for number, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{number} 0 obj\n".encode())
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")

    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode())
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010} 00000 n \n".encode())

    pdf.extend(
        (
            f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF"
        ).encode()
    )

    output_path.write_bytes(pdf)


if __name__ == "__main__":
    write_pdf(OUTPUT_PATH)
    print(f"Created {OUTPUT_PATH.resolve()}")
