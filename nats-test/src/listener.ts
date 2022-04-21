import { TicketCreatedListener } from "./events/ticket-created-listener";
import { randomBytes } from "crypto";
import nats from "node-nats-streaming";

console.clear();

const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connect to NATS");

  stan.on("close", () => {
    console.log("Nats Connection closed");
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
});

process.on("SIGINT", () => {
  console.log("SIGINT");
  stan.close();
});
process.on("SIGTERM", () => {
  console.log("SIGTERM");
  stan.close();
});
