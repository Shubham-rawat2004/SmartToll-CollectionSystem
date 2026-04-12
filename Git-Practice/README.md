# Git Practice API

A basic Spring Boot REST API project you can use to learn and practice Git commands.

## Tech Stack

- Java 17
- Spring Boot 3
- Maven

## Run the project

```bash
mvn spring-boot:run
```

## REST APIs

### 1. Health / hello

```http
GET /api/hello
```

Sample response:

```json
{
  "message": "Spring Boot is running",
  "project": "git-practice-api"
}
```

### 2. Get all tasks

```http
GET /api/tasks
```

### 3. Create a task

```http
POST /api/tasks
Content-Type: application/json
```

Request body:

```json
{
  "title": "Practice git commit",
  "description": "Create my first commit in this repo"
}
```

## Good Git practice ideas

- `git status`
- `git add .`
- `git add <file>`
- `git commit -m "initial spring boot project"`
- `git log --oneline`
- `git diff`
