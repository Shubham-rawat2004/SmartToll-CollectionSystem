# Spring Boot REST API

This project is a simple REST API built with Spring Boot.

## Endpoints

- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`

## Sample Request Body

```json
{
  "name": "Lane Sensor",
  "category": "Hardware",
  "price": 899.99
}
```

## Run the Project

1. Install Maven if it is not already available on your machine.
2. Run:

```bash
mvn spring-boot:run
```

3. Open `http://localhost:8080/api/products`

## Run Tests

```bash
mvn test
```
