/**
 * @jest-environment node
 */
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/index.js";
import User from "../src/models/userModel.js";
import Post from "../src/models/postModel.js";


import { jest } from "@jest/globals";

let mongoServer;
let userId;
let postId;

jest.setTimeout(30000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: "jest" });

  
  const user = await User.create({
    username: "post_user",
    email: "post@example.com",
  });
  userId = user._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
});

describe("Post API Tests (FR8-FR10)", () => {
  
  test("FR8 - Create Post", async () => {
    const res = await request(app)
      .post(`/api/v1/users/${userId}/posts`)
      .send({
        title: "My First Post",
        content: "Hello world!",
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("My First Post");
    expect(res.body.userId).toBe(userId.toString());
    postId = res.body._id;
  });

  test("FR9 - Get All Posts for User", async () => {

    await request(app).post(`/api/v1/users/${userId}/posts`).send({
      title: "My Second Post",
      content: "Hello again!",
    });

    const res = await request(app).get(`/api/v1/users/${userId}/posts`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0].title).toBe("My First Post");
  });

  test("FR10 - Soft Delete Post", async () => {
    const res = await request(app).delete(`/api/v1/posts/${postId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Post soft-deleted/i);

    
    const post = await Post.findById(postId).lean();
    expect(post).toBeTruthy();
    expect(post.isDeleted).toBe(true);

    
    const resGet = await request(app).get(`/api/v1/users/${userId}/posts`);
    expect(resGet.status).toBe(200);
    expect(resGet.body.length).toBe(1); 
    expect(resGet.body[0].title).toBe("My Second Post");
  });
});