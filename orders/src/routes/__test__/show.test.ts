import { Ticket } from "../../models/ticket";
import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
const id = new mongoose.Types.ObjectId().toString("hex");

it("fetches an order", async () => {
  const ticket = Ticket.build({
    id,
    title: "Concert",
    price: 20,
  });
  await ticket.save();
  const user = signin();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);
  console.log(order);

  const response = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .expect(200);

  expect(response.body.id).toEqual(order.id);
});

it("return 403 if order is from another user", async () => {
  const ticket = Ticket.build({
    id,
    title: "Concert",
    price: 20,
  });
  await ticket.save();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId: ticket.id })
    .expect(201);
  console.log(order);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", signin())
    .expect(403);
});
