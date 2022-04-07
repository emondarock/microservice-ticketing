import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
it("returns 404 if ticket not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app).get(`/api/tickets/${id}`).expect(404);
});

it("returns the ticket if ticket is found", async () => {
  const title = "ticket1";
  const price = 20;
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
    .expect(201);
  const params = `/api/tickets/${response.body.id}`;
  const ticketResponse = await request(app).get(params).expect(200);
  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
