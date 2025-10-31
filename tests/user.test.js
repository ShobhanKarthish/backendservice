/**
 * @jest-environment node
 */
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/index.js";
import User from "../src/models/userModel.js";

// ✅ Import jest explicitly for ESM
import { jest } from "@jest/globals";

let mongoServer;
let userId;

jest.setTimeout(30000); // global safety timeout

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: "jest" });
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
});

describe("User API Tests (FR1–FR5)", () => {
  test("FR1 - Create User", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .send({ username: "john_doe", email: "john@example.com", role: "user" });

    expect(res.status).toBe(201);
    expect(res.body.username).toBe("john_doe");
    userId = res.body._id;
  });

  test("FR2 - Get User by ID", async () => {
    const res = await request(app).get(`/api/v1/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("john@example.com");
  });

  test("FR3 - Update User", async () => {
    const res = await request(app)
      .put(`/api/v1/users/${userId}`)
      .send({ username: "john_updated", email: "updated@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe("john_updated");
  });

  test("FR4 - Soft Delete User", async () => {
    const res = await request(app).delete(`/api/v1/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/soft-deleted/i);

    const u = await User.findById(userId).lean();
    expect(u).toBeTruthy();
    expect(u.isDeleted).toBe(true);
  });

  test(
    "FR5 - Hard Delete User (simulate 24+ hours by modifying deletedAt)",
    async () => {
      const moreThan24hAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
      await User.findByIdAndUpdate(userId, { deletedAt: moreThan24hAgo, isDeleted: true });

      const res = await request(app).delete(`/api/v1/users/${userId}/hard`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/permanently deleted/i);

      const deleted = await User.findById(userId).lean();
      expect(deleted).toBeNull();
    },
    20000
  );
});
