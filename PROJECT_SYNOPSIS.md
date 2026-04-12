# Smart Toll Collection System Synopsis

## Overview

The Smart Toll Collection System is a full-stack toll automation platform that simulates RFID-based toll processing for registered vehicles. It is built with a Spring Boot backend and a React frontend, and is designed to reduce manual toll handling by combining secure user access, wallet-based payments, vehicle registration, toll booth management, and transaction tracking in one system.

The project models a practical digital toll workflow: a user creates an account, adds money to a wallet, registers a vehicle with an RFID tag, and then the system deducts the toll automatically when that RFID is scanned at a toll booth. Every scan is validated and recorded so that both users and administrators can monitor toll activity.

## Core Modules Built In This Project

### 1. Authentication and Access Control

- User registration and login are implemented with JWT-based authentication.
- Passwords are encrypted using BCrypt.
- Protected routes and secured APIs are enforced through Spring Security.
- Role support exists for `ADMIN`, `USER`, and `OPERATOR`.

### 2. User and Wallet Management

- Users can create accounts with an initial wallet balance.
- Logged-in users can view their profile details.
- Wallet recharge is supported through a simulated UPI payment flow in the frontend.
- Updated wallet balances are reflected after successful recharge and toll deduction.

### 3. Vehicle Registration

- Users can register vehicles in the system.
- Each vehicle is linked to an owner account.
- Each vehicle is assigned a unique RFID tag.
- Duplicate vehicle numbers and duplicate RFID tags are prevented.

### 4. Toll Booth Management

- Administrators can add toll booths with booth name, location, and toll amount.
- All available toll booths can be fetched for the scan interface.
- Toll booths are used directly during scan processing to determine the deduction amount.

### 5. Toll Processing Engine

- RFID scans are simulated through the frontend scan page.
- The backend matches the RFID tag to a registered vehicle.
- The system verifies the selected toll booth and calculates the toll charge.
- The toll amount is automatically deducted from the owner wallet if balance is sufficient.
- Successful and failed transactions are stored with timestamp and status.

### 6. Safety and Validation Features

- If the RFID tag does not exist, the request is rejected.
- If wallet balance is insufficient, the toll is not processed and a failed transaction is recorded.
- Duplicate scan protection is implemented: repeated scans for the same vehicle at the same booth within 60 seconds trigger a fraud detection response.
- Global exception handling returns clean API error messages.

### 7. Monitoring and Transaction History

- Users can view their personal transaction history.
- Vehicle-wise transaction history is available through backend APIs.
- Administrators can view all transactions across the system.
- The admin dashboard also shows registered vehicle data for monitoring.

## Frontend Features Available

- Public pages for login, registration, and landing/dashboard.
- Protected dashboards based on authenticated role access.
- User dashboard for:
  - wallet recharge
  - vehicle registration
  - transaction history viewing
- Admin dashboard for:
  - adding toll booths
  - viewing all transactions
  - monitoring registered vehicles
- Toll scan simulator page for testing live toll deduction flow.

## Backend Capabilities Available

- REST APIs for authentication, users, vehicles, toll scanning, toll booths, and admin operations.
- MySQL integration through Spring Data JPA.
- JWT token generation and request validation.
- Persistent storage for users, vehicles, toll booths, and transactions.
- Logging support for toll operations and system events.

## Typical System Workflow

1. A user registers and logs in.
2. The user adds money to the wallet.
3. The user registers a vehicle and links an RFID tag.
4. An admin creates toll booths with predefined toll charges.
5. A toll operator or authorized user simulates an RFID scan.
6. The system identifies the vehicle, verifies balance, deducts the toll, and stores the transaction.
7. The result is shown immediately in the scan page and remains visible in transaction history dashboards.

## Technology Stack

- Backend: Java 17, Spring Boot, Spring Security, JWT, Spring Data JPA, MySQL
- Frontend: React, Vite, Tailwind CSS, Axios

## Project Summary

This project delivers a clean working prototype of an automated toll collection system with secure authentication, digital wallet support, RFID-linked vehicle registration, toll booth administration, scan-based toll deduction, fraud-prevention logic, and transaction monitoring. It demonstrates both the user-facing and admin-facing sides of a smart toll platform and provides a solid foundation for future expansion into real RFID hardware, payment gateways, and large-scale deployment.
