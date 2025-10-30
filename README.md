# Backend Service

A simple backend application built with Node.js, Express, and MongoDB.  
It handles user management, preferences, and posts with proper data validation and soft delete logic.

---

## Features

- User APIs for create, read, update, soft delete, and hard delete (with 24-hour grace period)
- Preferences APIs to create or update user preferences
- Post APIs to create, read, and soft delete user posts
- MongoDB and Mongoose used for data modeling
- Simple and modular folder structure

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

---

## Setup

1. Clone this repository  
   ```bash
   git clone https://github.com/ShobhanKarthish/backendservice.git
   cd backendservice
2. Install dependencies
   ```bash
   npm install
3. Create a .env file in the root directory
    ```bash
    PORT=3000
    MONGO_URI=<your_mongo_connection_string>
4. Run the development server
   ```bash
   npm run dev

