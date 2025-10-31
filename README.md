# Backend Service

A simple backend application built with Node.js, Express, and MongoDB.  
It handles user management, preferences, and posts with proper data validation and soft delete logic.

---

## Features

-User APIs for create, read, update, soft delete, and hard delete (with 24-hour grace period)
-Preferences APIs to create or update user preferences
-Post APIs to create, read, and soft delete user posts
-MongoDB and Mongoose used for data modeling
-Jest and Supertest integration for unit and API testing
-Dockerized setup for quick and isolated deployment (includes both Node.js app and MongoDB)
-Simple and modular folder structure for scalability and maintainability

---

## API Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /api/v1/users | Create a new user |
| GET | /api/v1/users/:userId | Get user by ID |
| PUT | /api/v1/users/:userId | Update user |
| DELETE | /api/v1/users/:userId | Soft delete user |
| POST | /api/v1/users/:userId/purge | Hard delete user (after 24h) |
| PUT | /api/v1/users/:userId/preferences | Create or update preferences |
| GET | /api/v1/users/:userId/preferences | Get user preferences |
| POST | /api/v1/users/:userId/posts | Create post |
| GET | /api/v1/users/:userId/posts | Get all posts for a user |
| DELETE | /api/v1/posts/:postId | Soft delete post |

---

## Tech Stack

- Node.js  
- Express.js  
- MongoDB  
- Mongoose
- Jest & Supertest
- Docker

---

## Setup

There are two ways to run this project:

---

### 1. Run with Docker (Recommended)

This is the fastest and easiest way to run the entire application (Node.js app + MongoDB) in a containerized environment. It provides a one-command setup and isolates all dependencies.

#### Prerequisites

* Docker Desktop installed and running

#### Instructions

Clone the repository:

```bash
git clone https://github.com/ShobhanKarthish/backendservice.git
cd backendservice
```

Run the application:

```bash
docker compose up --build
```

The service will be available at:
[http://localhost:3000](http://localhost:3000)

---

### 2. Run Locally (Development Mode)

Use this method if you want to run the app directly on your machine for debugging or local development.

#### Prerequisites

* Node.js (v18 or later)
* MongoDB (running locally or remote)

#### Instructions

Clone this repository:

```bash
git clone https://github.com/ShobhanKarthish/backendservice.git
cd backendservice
```

Install dependencies:

```bash
npm install
```

Create a .env file in the root directory:

```bash
PORT=3000
MONGO_URI=<your_mongo_connection_string>
```

Run the development server:

```bash
npm run dev
```

The service will be available at:
[http://localhost:3000](http://localhost:3000)

---

### Run Tests (Jest + Supertest)

To execute all test cases:

```bash
npm test
```

---

### Docker Commands Reference

| Command                        | Description                    |
| ------------------------------ | ------------------------------ |
| `docker compose up --build`    | Build and start the containers |
| `docker compose down`          | Stop and remove all containers |
| `docker ps`                    | Check running containers       |
| `docker logs <container_name>` | View logs for a container      |


