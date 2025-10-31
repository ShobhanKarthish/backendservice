/**
 * @jest-environment node
 */
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/index.js";
import User from "../src/models/userModel.js";


import { jest } from "@jest/globals";

let mongoServer;
let userId;

jest.setTimeout(30000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: "jest" });

  
  const user = await User.create({
    username: "pref_user",
    email: "pref@example.com",
  });
  userId = user._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
});

describe("Preference API Tests (FR6-FR7)", () => {
  
  test("FR6 - Create Preferences (Upsert)", async () => {
    const res = await request(app)
      .put(`/api/v1/users/${userId}/preferences`)
      .send({
        theme: "dark",
        language: "fr",
      });

    expect(res.status).toBe(200);
    expect(res.body.theme).toBe("dark");
    expect(res.body.language).toBe("fr");
    expect(res.body.notifications).toBe(true);
  });

  test("FR7 - Get Preferences", async () => {
    const res = await request(app).get(`/api/v1/users/${userId}/preferences`);
    expect(res.status).toBe(200);
    expect(res.body.theme).toBe("dark");
  });

  test("FR6 (Update) - Update Preferences (Upsert)", async () => {
    const res = await request(app)
      .put(`/api/v1/users/${userId}/preferences`)
      .send({
        theme: "light",
        notifications: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.theme).toBe("light");
    expect(res.body.notifications).toBe(false);
    expect(res.body.language).toBe("fr"); 
  });
});