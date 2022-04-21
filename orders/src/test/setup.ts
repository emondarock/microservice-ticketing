import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  var signin: () => string[];
}
jest.mock("../nats-wrapper");
let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = "test";

  mongo = await MongoMemoryServer.create();
  const mongoUrl = await mongo.getUri();

  await mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
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
