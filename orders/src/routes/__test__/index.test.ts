import { Ticket } from "../../models/ticket";
import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
const id = new mongoose.Types.ObjectId().toString("hex");

const buildTicket = async () => {
  const ticketId = new mongoose.Types.ObjectId().toString("hex");
  const ticket = Ticket.build({
    id: ticketId,
    title: "Concert",
    price: 20,
  });
  await ticket.save();
  return ticket;
};

it("returns orders for an user", async () => {
  const userOne = signin();
  const userTwo = signin();
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();
  await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({
      ticketId: ticketOne.id,
    })
    .expect(201);

  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({
      ticketId: ticketTwo.id,
    })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({
      ticketId: ticketThree.id,
    })
    .expect(201);

  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .send({})
    .expect(200);

  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
});
