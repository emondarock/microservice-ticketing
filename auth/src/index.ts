import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  console.log("Auth Start Here From Dev");

  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be added in enviornment");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be added in enviornment");
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Connected to MongoDb");
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000!!!!!!!!");
  });
};

start();
