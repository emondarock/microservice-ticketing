import mongoose from "mongoose";
import { app } from "./app";
import { OrderCancelledListener } from "./events/listener/order-cancelled-listener";
import { OrderCreatedListener } from "./events/listener/order-created-listener";
import { natsWrapper } from "./nats-wrapper";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be added in enviornment");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be added in enviornment");
  }
  if (!process.env.NATS_URI) {
    throw new Error("NATS_URI must be added in enviornment");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be added in enviornment");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be added in enviornment");
  }
  if (!process.env.STRIPE_KEY) {
    throw new Error("STRIPE_KEY must be added in enviornment");
  }
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URI
    );
    natsWrapper.client.on("close", () => {
      console.log("Nats Connection closed");
      process.exit();
    });
    process.on("SIGINT", () => {
      console.log("SIGINT");
      natsWrapper.client.close();
    });
    process.on("SIGTERM", () => {
      console.log("SIGTERM");
      natsWrapper.client.close();
    });

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

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
