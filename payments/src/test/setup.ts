import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";
import jwt from "jsonwebtoken";

declare global {
  var signin: (id?: string) => string[];
}
jest.mock("../nats-wrapper");
let mongo: any;
process.env.STRIPE_KEY =
  "sk_test_51Kql4KFfS1Q5AVgDa0lEwyO7Pwm0ApWlOlo4lnE2UJJRcRc0jwfM2Bvo4iECHd9YzRbtRVUt4GwmhRWuHx4DQBiY00HOg2qQW4";
beforeAll(async () => {
  process.env.JWT_KEY = "test";
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  mongo = await MongoMemoryServer.create();
  const mongoUrl = await mongo.getUri();

  await mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  console.log("collection");
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  const jwtToken = jwt.sign(payload, process.env.JWT_KEY!);

  const session = {
    jwt: jwtToken,
  };

  const sessionJson = JSON.stringify(session);

  const base64 = Buffer.from(sessionJson).toString("base64");

  return [`session=${base64}`];
};
