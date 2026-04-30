from __future__ import annotations

from pathlib import Path
import textwrap


OUTPUT_PATH = Path("Smart_Toll_Collection_System_Detailed_Project_Synopsis.pdf")


SECTIONS = [
    (
        "Project Title",
        [
            "Smart Toll Collection System",
        ],
    ),
    (
        "Abstract",
        [
            "The Smart Toll Collection System is a full-stack web-based project that automates toll collection through RFID-based vehicle identification, OCR-based number plate recognition, digital wallet deduction, and transaction monitoring. It is designed as a prototype for smart transportation and toll plaza automation.",
            "The system provides secure authentication, role-based access, vehicle registration, toll booth management, wallet recharge, automatic toll processing, duplicate scan detection, and user/admin dashboards. The project can be used as a base reference for preparing the final report, presentation, viva explanation, and future development documentation.",
        ],
    ),
    (
        "1. Introduction",
        [
            "The Smart Toll Collection System is a full-stack web application developed to automate toll collection, vehicle identification, digital wallet deduction, and toll transaction monitoring. The system uses RFID-based vehicle identification, manual scan simulation, and OCR-based number plate recognition support to model a modern toll plaza workflow. It provides separate user and admin features so that vehicle owners can manage wallet and vehicle data while administrators can manage toll booths and monitor transactions.",
            "The project reflects the need for digital transformation in transportation infrastructure. Toll plazas often face vehicle queues due to manual payment and verification processes. By identifying registered vehicles automatically and deducting payment from the owner's wallet, the system reduces manual dependency and improves speed, transparency, and record accuracy.",
        ],
    ),
    (
        "2. Problem Statement",
        [
            "Traditional toll collection requires manual payment handling, vehicle verification, and receipt management. This creates waiting time, traffic congestion, human error, and poor transaction visibility. A smart toll system is required to identify vehicles quickly, deduct toll charges from a digital wallet, record every transaction, and provide monitoring tools for administrators.",
        ],
    ),
    (
        "3. Objectives",
        [
            "To develop a digital toll collection system with automatic payment deduction.",
            "To identify vehicles through RFID tags, manual scan input, and OCR-based number plate detection.",
            "To provide wallet-based payment integration for registered users.",
            "To maintain transaction history for users and administrators.",
            "To create a secure role-based platform for users, operators, and admins.",
            "To detect duplicate toll scans and reduce repeated or fraudulent deductions.",
            "To reduce manual intervention in toll processing.",
        ],
    ),
    (
        "4. Scope of the Project",
        [
            "The project covers authentication, user profile handling, wallet recharge, vehicle registration, RFID tag linking, toll booth setup, toll scan processing, transaction history, admin monitoring, and OCR-assisted plate scanning. It currently works as a prototype using simulated RFID/manual input and camera/uploaded-image OCR. It can be extended for real RFID hardware, real payment gateways, FASTag-style integration, and cloud deployment.",
            "The scope is limited to software-level toll simulation and project demonstration. It does not currently include physical toll barriers, real RFID readers, bank-grade payments, or production deployment. However, the architecture is modular enough to support these integrations later.",
        ],
    ),
    (
        "5. Existing System",
        [
            "In a manual toll collection system, toll operators collect payments directly from drivers, verify vehicle details manually, and maintain records through paper receipts or isolated digital terminals. This process is slow and depends heavily on human operation. It does not provide smooth automated payment, instant transaction visibility, or strong duplicate scan prevention.",
        ],
    ),
    (
        "6. Proposed System",
        [
            "The proposed system uses a Spring Boot backend, React frontend, and MySQL database. Users register and log in securely, add wallet balance, and register vehicles with RFID tags. Admins create toll booths with location and toll amount details. During toll scanning, the system identifies the vehicle using RFID or vehicle number, verifies the toll booth, checks wallet balance, deducts the toll amount, and stores the result as a transaction. Failed cases such as invalid vehicle, insufficient balance, and duplicate scans are handled with proper responses.",
        ],
    ),
    (
        "7. Major Features",
        [
            "Secure user registration and login.",
            "JWT-based authentication and BCrypt password encryption.",
            "Role-based access for ADMIN, USER, and OPERATOR roles.",
            "User wallet recharge and balance management.",
            "Vehicle registration with owner mapping and unique RFID tag.",
            "Admin toll booth creation with name, location, and toll amount.",
            "Manual RFID or vehicle number toll scan simulation.",
            "Camera and uploaded-image OCR number plate detection using Tesseract.js.",
            "Automatic toll deduction after successful validation.",
            "Transaction recording with SUCCESS and FAILED status.",
            "User-wise and vehicle-wise transaction history.",
            "Admin dashboard for all transactions and registered vehicle monitoring.",
            "Duplicate scan fraud detection within a 60-second window.",
            "Backend logging and global exception handling.",
        ],
    ),
    (
        "8. Technology Stack",
        [
            "Backend: Java, Spring Boot 3.3.5, Spring Web, Spring Security, Spring Data JPA, Hibernate, Lombok, Maven.",
            "Security: JWT authentication, BCrypt password hashing, secured API filters, role-based access control.",
            "Database: MySQL for main application persistence.",
            "Frontend: React 18, Vite, JavaScript, Tailwind CSS, React Router, Axios.",
            "OCR and ANPR: Tesseract.js in the React frontend for browser-based number plate recognition.",
            "Development Tools: IntelliJ IDEA or VS Code, Maven, npm, Git, browser developer tools, Postman for API testing.",
        ],
    ),
    (
        "9. Hardware and Software Requirements",
        [
            "Hardware Requirements: Laptop or desktop computer, minimum 4 GB RAM, webcam for OCR testing, and stable local network/browser access.",
            "Software Requirements: Windows/Linux/Mac OS, Java JDK, Maven, Node.js, npm, MySQL Server, and a modern web browser.",
        ],
    ),
    (
        "9A. Functional Requirements",
        [
            "The system must allow new users to register with name, email, password, role, and optional wallet balance.",
            "The system must authenticate users and return a JWT token after successful login.",
            "The system must allow users to recharge their wallet balance.",
            "The system must allow users to register vehicles with unique vehicle numbers and RFID tags.",
            "The system must allow admins to create toll booths with name, location, and toll amount.",
            "The system must allow toll scans through RFID/manual input and OCR-detected plate input.",
            "The system must validate the vehicle and toll booth before toll deduction.",
            "The system must check wallet balance before processing payment.",
            "The system must deduct toll amount automatically after successful validation.",
            "The system must save successful and failed transactions.",
            "The system must allow users to view their own transaction history.",
            "The system must allow admins to view all transactions and registered vehicles.",
            "The system must detect duplicate scans within a defined time window.",
        ],
    ),
    (
        "9B. Non-Functional Requirements",
        [
            "Security: Passwords must be encrypted and APIs must be protected using JWT authentication.",
            "Reliability: Toll processing should handle invalid vehicles, invalid booths, insufficient balance, and duplicate scans safely.",
            "Usability: The frontend should provide clear forms, dashboards, and feedback messages.",
            "Maintainability: The backend should follow layered architecture using controllers, services, repositories, DTOs, entities, and exception handlers.",
            "Scalability: The system should be extendable for real RFID hardware, payment gateways, and cloud deployment.",
            "Performance: Toll scan processing should be fast enough for real-time demonstration.",
            "Auditability: Transactions should be stored with timestamp and status for future verification.",
        ],
    ),
    (
        "10. System Architecture",
        [
            "The system follows a client-server architecture. The React frontend acts as the user interface and communicates with the Spring Boot backend through REST APIs. The backend contains controllers, DTOs, entities, repositories, security classes, exception handlers, and service logic. Spring Data JPA connects the backend to MySQL. The OCR feature runs in the frontend browser using Tesseract.js and sends the detected plate or scan value to the backend for toll processing.",
            "Architecture Layers: Presentation Layer contains React pages, components, context, and services. API Layer contains Spring Boot REST controllers. Business Logic Layer contains toll processing, wallet update, duplicate scan validation, and transaction handling. Persistence Layer contains JPA repositories and MySQL database tables. Security Layer contains JWT utilities, authentication filter, user details service, and security configuration.",
        ],
    ),
    (
        "11. Module Description",
        [
            "Authentication Module: Handles registration, login, password encryption, JWT token generation, and authenticated access.",
            "User and Wallet Module: Stores user details, role, and wallet balance. Supports wallet recharge and user profile retrieval.",
            "Vehicle Module: Allows users to register vehicles with vehicle number, owner, and RFID tag. Prevents duplicate vehicle numbers and RFID tags.",
            "Toll Booth Module: Allows admins to create and fetch toll booth data including booth name, location, and toll amount.",
            "Toll Processing Module: Processes RFID, vehicle number, or OCR scan input, validates vehicle and booth, checks balance, deducts toll, and stores transactions.",
            "Transaction Module: Maintains toll records with amount, vehicle, booth, timestamp, and status.",
            "Admin Module: Provides admin-facing transaction and vehicle monitoring features.",
            "OCR Module: Reads vehicle number plates from camera or uploaded images and submits detected plate data for toll processing.",
        ],
    ),
    (
        "12. Database Design Overview",
        [
            "User Entity: Stores id, name, email, password, role, and wallet balance.",
            "Vehicle Entity: Stores id, vehicle number, RFID tag, and owner relationship.",
            "TollBooth Entity: Stores id, booth name, location, and toll amount.",
            "Transaction Entity: Stores id, vehicle, toll booth, amount, timestamp, and status.",
            "Role and TransactionStatus Enums: Define supported user roles and transaction result states.",
            "Relationships: One user can own multiple vehicles. One vehicle can have multiple transactions. One toll booth can be associated with multiple transactions. Each transaction belongs to one vehicle and one toll booth.",
        ],
    ),
    (
        "12A. Data Flow Overview",
        [
            "Registration Flow: User enters registration details, backend validates email, encrypts password, assigns role, saves user, and returns response.",
            "Login Flow: User enters email and password, backend authenticates credentials, generates JWT token, and frontend stores authentication data.",
            "Vehicle Flow: User submits vehicle number, RFID tag, and owner id. Backend checks duplicate records and stores the vehicle.",
            "Wallet Flow: User enters recharge amount. Backend validates the amount, updates wallet balance, and returns updated user details.",
            "Toll Scan Flow: Frontend sends RFID tag or detected vehicle number with toll booth details. Backend identifies vehicle, validates booth, checks duplicate scans, verifies wallet balance, deducts toll, stores transaction, and returns result.",
            "Admin Flow: Admin creates toll booths and views all transaction records for monitoring.",
        ],
    ),
    (
        "13. Working of the System",
        [
            "A user registers and logs into the application.",
            "The user recharges the wallet through the simulated wallet flow.",
            "The user registers a vehicle and assigns an RFID tag.",
            "The admin adds toll booths with fixed toll charges.",
            "At the toll scan page, RFID/plate input is entered manually or detected through OCR.",
            "The backend finds the registered vehicle and selected toll booth.",
            "The system checks whether a duplicate scan occurred within 60 seconds.",
            "The system checks the owner's wallet balance.",
            "If sufficient balance exists, the toll amount is deducted and a successful transaction is saved.",
            "If validation fails, the system returns an error and records the failed transaction where applicable.",
            "Users and admins can view transaction records through their dashboards.",
        ],
    ),
    (
        "14. Important REST APIs",
        [
            "Authentication: POST /auth/register and POST /auth/login.",
            "User: GET /users/{id}, PATCH /users/{id}/wallet, GET /users/{id}/transactions.",
            "Vehicle: POST /vehicles, GET /vehicles, GET /vehicles/{vehicleNumber}, GET /vehicles/{vehicleNumber}/transactions.",
            "Admin: POST /admin/toll-booths and GET /admin/transactions.",
            "Toll Booths: GET /toll-booths.",
            "Toll Scan: POST /toll/scan and POST /toll/scan/plate.",
        ],
    ),
    (
        "15. Security Features",
        [
            "JWT tokens are used to authenticate users after login.",
            "Passwords are encoded using BCrypt before storage.",
            "Spring Security protects backend endpoints.",
            "Role-based access supports admin, user, and operator responsibilities.",
            "Duplicate scan detection prevents repeated toll deduction within a short interval.",
            "Global exception handling provides cleaner API error responses.",
        ],
    ),
    (
        "15A. Validation and Error Handling",
        [
            "Duplicate email registration is rejected with a conflict response.",
            "Duplicate vehicle number and duplicate RFID tag are rejected.",
            "Wallet recharge amount must be greater than zero.",
            "Invalid vehicle or RFID input returns a vehicle not found response.",
            "Invalid toll booth returns a toll booth not found response.",
            "Insufficient balance results in a failed toll transaction.",
            "Duplicate scans within 60 seconds trigger fraud detection and prevent repeated deduction.",
            "Global exception handling returns structured error responses instead of raw server errors.",
        ],
    ),
    (
        "16. Advantages",
        [
            "Reduces manual toll collection effort.",
            "Improves toll transaction speed and transparency.",
            "Maintains digital records of toll payments.",
            "Supports user and admin dashboards.",
            "Provides wallet-based automatic deduction.",
            "Supports RFID simulation and OCR-based plate detection.",
            "Can be extended into a real-world toll plaza automation system.",
        ],
    ),
    (
        "16A. Applications",
        [
            "Highway toll plaza automation.",
            "Smart city transportation systems.",
            "Campus or private parking toll/payment systems.",
            "Vehicle access monitoring systems.",
            "Automated payment collection prototypes.",
            "Academic demonstration of full-stack secured applications.",
        ],
    ),
    (
        "17. Limitations",
        [
            "RFID scanning is currently simulated instead of connected to real hardware.",
            "Wallet recharge is simulated and not connected to a real payment gateway.",
            "OCR accuracy depends on image quality, lighting, plate angle, and camera clarity.",
            "The project is currently designed as a prototype and local development system.",
        ],
    ),
    (
        "18. Future Enhancements",
        [
            "Integration with real RFID readers and toll gate sensors.",
            "Integration with payment gateways, UPI, or FASTag-like systems.",
            "SMS and email notifications after toll deduction.",
            "Cloud deployment with production database support.",
            "Advanced OCR preprocessing and machine learning-based plate recognition.",
            "Analytics dashboard for booth-wise revenue, traffic, and failed scans.",
            "Mobile application for vehicle owners.",
            "QR receipt generation and downloadable toll reports.",
        ],
    ),
    (
        "19. Testing Strategy",
        [
            "API testing can be done using Postman for registration, login, wallet recharge, vehicle registration, toll booth creation, and toll scan processing.",
            "Frontend testing should cover login flow, dashboard navigation, protected routes, wallet update, vehicle registration, manual toll scan, camera OCR scan, uploaded-image OCR scan, and transaction history.",
            "Negative test cases should include duplicate email, duplicate RFID tag, invalid vehicle, insufficient wallet balance, invalid toll booth, and duplicate scan within 60 seconds.",
            "Security testing should verify protected route access without token, invalid token handling, password encryption, and role-based endpoint behavior.",
            "Database testing should verify that users, vehicles, toll booths, and transactions are correctly saved and related.",
            "OCR testing should use clear plate images, low-light images, angled images, and invalid images to evaluate detection behavior.",
        ],
    ),
    (
        "19A. Sample Test Cases",
        [
            "TC-01: Register a new user with valid details. Expected result: User is created successfully.",
            "TC-02: Register with an existing email. Expected result: System rejects duplicate email.",
            "TC-03: Login with valid credentials. Expected result: JWT token and user details are returned.",
            "TC-04: Add positive wallet amount. Expected result: Wallet balance increases.",
            "TC-05: Register vehicle with unique number and RFID. Expected result: Vehicle is stored.",
            "TC-06: Register vehicle with duplicate RFID. Expected result: Request is rejected.",
            "TC-07: Process toll with valid RFID and sufficient balance. Expected result: Toll is deducted and SUCCESS transaction is stored.",
            "TC-08: Process toll with insufficient balance. Expected result: FAILED transaction is stored and error is returned.",
            "TC-09: Repeat same scan within 60 seconds. Expected result: Duplicate scan detection prevents repeated deduction.",
            "TC-10: Upload a clear number plate image. Expected result: OCR detects plate and submits toll scan.",
        ],
    ),
    (
        "19B. Feasibility Study",
        [
            "Technical Feasibility: The project is technically feasible because it uses widely available technologies such as Spring Boot, React, MySQL, JWT, and OCR libraries. It can run on a normal laptop for development and demonstration.",
            "Operational Feasibility: The system is easy to operate through web dashboards. Users can manage their wallet and vehicles, while admins can manage toll booths and transactions.",
            "Economic Feasibility: The prototype uses open-source tools and libraries, reducing development cost. Future production deployment may require server, hardware, and payment gateway costs.",
            "Schedule Feasibility: The project can be developed module by module, starting from authentication and then moving to vehicle, wallet, toll booth, toll scan, OCR, and reporting features.",
        ],
    ),
    (
        "19C. Deployment Considerations",
        [
            "Backend can be packaged using Maven and deployed on platforms such as Render, AWS EC2, Railway, or a local server.",
            "Frontend can be built using npm run build and deployed on Vercel, Netlify, or any static hosting provider.",
            "MySQL database should be hosted securely with proper credentials and backup strategy.",
            "JWT secret and database password should be moved to environment variables before production deployment.",
            "HTTPS should be used in production to protect authentication and payment-related data.",
        ],
    ),
    (
        "19D. Risks and Mitigation",
        [
            "OCR Accuracy Risk: Use better image preprocessing, stronger lighting, and advanced ANPR models in future versions.",
            "Payment Security Risk: Use certified payment gateways instead of simulated wallet recharge in production.",
            "Hardware Integration Risk: Test with real RFID readers in stages before live deployment.",
            "Database Failure Risk: Use backups, indexing, and reliable hosting for production database.",
            "Unauthorized Access Risk: Strengthen role checks, token expiry handling, and secure API configuration.",
        ],
    ),
    (
        "19E. Report Preparation Reference",
        [
            "Recommended report chapters: Introduction, Literature Review or Existing System, System Analysis, Requirement Specification, System Design, Implementation, Testing, Results, Future Scope, and Conclusion.",
            "Recommended screenshots: login page, registration page, user dashboard, wallet recharge, vehicle registration, admin dashboard, toll booth creation, toll scan simulator, OCR upload/camera scan, successful toll deduction, failed toll scan, and transaction history.",
            "Recommended diagrams: system architecture diagram, use case diagram, ER diagram, data flow diagram, activity diagram for toll scan, sequence diagram for login, and sequence diagram for toll deduction.",
        ],
    ),
    (
        "20. Expected Outcome",
        [
            "The expected outcome is a working smart toll prototype that identifies registered vehicles, performs automatic toll deduction, records transaction history, and provides monitoring features for users and administrators. The project demonstrates how web technologies, secure backend APIs, database persistence, wallet logic, and OCR can be combined for intelligent transportation automation.",
        ],
    ),
    (
        "21. Conclusion",
        [
            "The Smart Toll Collection System is a practical and effective prototype for digital toll automation. It combines secure authentication, role-based access, wallet management, vehicle registration, RFID/plate-based toll scanning, OCR support, automatic deduction, fraud detection, and transaction monitoring. The system provides a strong foundation for future intelligent transportation and smart city toll management solutions.",
        ],
    ),
    (
        "Appendix: ChatGPT Prompt for Full Synopsis",
        [
            "Create a complete academic project synopsis for my project titled Smart Toll Collection System.",
            "Use these details: It is a full-stack web application that automates toll collection using RFID-based vehicle identification and number plate recognition support. It has a Spring Boot backend and React frontend. Users can register, log in, add wallet balance, register vehicles, link RFID tags, and view toll transactions. Admins can manage toll booths, monitor vehicles, and view all transactions. Toll scans are simulated through RFID/manual input and also through OCR-based number plate detection using camera or uploaded images. When a valid vehicle is scanned, the backend identifies the vehicle, verifies the toll booth, checks wallet balance, deducts the toll amount, and stores the transaction. Failed transactions are also recorded. The system includes duplicate scan fraud detection within 60 seconds.",
            "Technology stack: Java, Spring Boot 3.3.5, Spring Security, JWT, Spring Data JPA, Hibernate, Lombok, Maven, MySQL, React 18, Vite, Tailwind CSS, Axios, React Router, and Tesseract.js.",
            "Generate the synopsis with these sections: Title, Introduction, Problem Statement, Objectives, Scope, Existing System, Proposed System, Features, Technology Used, Hardware and Software Requirements, System Architecture, Module Description, Database Design Overview, Working of the System, Security Features, Advantages, Limitations, Future Enhancements, Testing Strategy, and Conclusion.",
            "Write it in a formal college-project format. Keep it detailed, clear, technical, and suitable for submission.",
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
