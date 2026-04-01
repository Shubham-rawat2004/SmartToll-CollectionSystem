# 🚗 Smart Toll Collection System

A full-stack Smart Toll Collection System built using **Spring Boot (Java)** for the backend and **React (Vite)** for the frontend. This system automates toll payments using RFID-based vehicle identification (simulated), digital wallet integration, and secure authentication.

---

## 📌 Features

### 🔐 Authentication & Authorization

* JWT-based authentication
* Role-based access (Admin, User, Operator)

### 🚘 Vehicle Management

* Register vehicles with RFID tags
* Link vehicles to users

### 💰 Wallet System

* Add money to wallet
* Automatic toll deduction

### 🛣️ Toll System

* RFID-based toll scan (simulated input)
* Real-time toll deduction
* Transaction recording

### 📊 Admin Dashboard

* Add and manage toll booths
* View all transactions
* Monitor system activity

### 📜 Transaction History

* Users can view past toll transactions

---

## 🏗️ Tech Stack

### Backend

* Java 17
* Spring Boot
* Spring Security + JWT
* Spring Data JPA (Hibernate)
* MySQL

### Frontend

* React (Vite)
* Tailwind CSS
* Axios

---

## 📁 Project Structure

### Backend

```
src/main/java/com/example/smarttoll
│
├── controller
├── service
├── repository
├── entity
├── dto
├── config
└── security
```

### Frontend

```
src/
├── components
├── pages
├── services
├── context
```

---

## ⚙️ Backend Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/smart-toll-system.git
cd smart-toll-system
```

### 2. Configure Database

Update `application.properties`:

```
spring.datasource.url=jdbc:mysql://localhost:3306/smart_toll
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### 3. Run Application

```bash
mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

---

## 🎨 Frontend Setup

### 1. Navigate to frontend

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run app

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔌 API Endpoints (Sample)

### Auth

* `POST /auth/register`
* `POST /auth/login`

### User

* `GET /user/profile`
* `POST /user/add-money`

### Vehicle

* `POST /vehicle/register`
* `GET /vehicle/{id}`

### Toll

* `POST /toll/scan`

### Admin

* `POST /admin/toll`
* `GET /admin/transactions`

---

## 🔁 Workflow

1. User registers and logs in
2. Adds money to wallet
3. Registers vehicle with RFID
4. RFID scanned at toll
5. System deducts toll amount automatically
6. Transaction is stored and displayed

---

## 🧪 Testing

* Use Postman for API testing
* Test scenarios:

  * Login/Register
  * Wallet recharge
  * Toll deduction
  * Admin operations

---

## 🚀 Deployment

### Backend

* Dockerize Spring Boot app
* Deploy on AWS EC2 / Render

### Frontend

* Build using `npm run build`
* Deploy on Vercel / Netlify

---

## 🔮 Future Enhancements

* Real RFID hardware integration
* AI-based traffic prediction
* Dynamic toll pricing
* Mobile app (Flutter/React Native)
* FASTag integration

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 👨‍💻 Author

**Shubham**

---

⭐ If you like this project, give it a star on GitHub!
