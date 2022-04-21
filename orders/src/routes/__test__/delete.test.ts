import { app } from "../../app";
import request from "supertest";
import { Ticket } from "../../models/ticket";
import { body } from "express-validator";
import { OrderStatus } from "@emon-workstation/common";
import { natsWrapper } from "../../nats-wrapper";
import mongoose from "mongoose";
const id = new mongoose.Types.ObjectId().toString("hex");

it("Cancel an order", async () => {
  const user = signin();
  const ticket = Ticket.build({
    id,
    title: "Concert",
    price: 20,
  });
  await ticket.save();
  const { body } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const response = await request(app)
    .put(`/api/orders/${body.id}`)
    .set("Cookie", user)
    .expect(201);

  expect(response.body.status).toEqual(OrderStatus.Cancelled);
});

it("return 403 if order is cancel by another user", async () => {
  const user = signin();
  const ticket = Ticket.build({
    id: id,
    title: "Concert",
    price: 20,
  });
  await ticket.save();
  const { body } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const response = await request(app)
    .put(`/api/orders/${body.id}`)
    .set("Cookie", signin())
    .expect(403);
});

it("emits an order cancelled event", async () => {
  const user = signin();
  const ticket = Ticket.build({
    id,
    title: "Concert",
    price: 20,
  });
  await ticket.save();
  const { body } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const response = await request(app)
    .put(`/api/orders/${body.id}`)
    .set("Cookie", user)
    .expect(201);

  expect(natsWrapper.client.publish).toBeCalled();
});
