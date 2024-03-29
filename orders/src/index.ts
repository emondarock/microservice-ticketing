import mongoose from "mongoose";
import { app } from "./app";
import { ExpirationCompleteListener } from "./events/listener/expiration-complete-listener";
import { PaymentCreatedListener } from "./events/listener/payment-created-listener";
import { TicketCreatedListener } from "./events/listener/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listener/ticket-updated-listener";
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

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

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
