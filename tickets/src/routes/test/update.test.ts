import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { sign } from "jsonwebtoken";
const id = new mongoose.Types.ObjectId().toHexString();

it("provide 404 if id not found", async () => {
  const title = "ticket1";
  const price = 20;
  const response = await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", signin())
    .send({
      title,
      price,
    })
    .expect(404);
});
it("can only be access if user is signed in", async () => {
  const title = "ticket1";
  const price = 20;
  const response = await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title,
      price,
    })
    .expect(403);
});

it("provide 403 user does not own the ticket", async () => {
  const title = "ticket1";
  const price = 20;
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", signin())
    .send({
      title,
      price,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", signin())
    .send({
      title,
      price,
    })
    .expect(403);
});

it("provide 400 if title and price is invalid", async () => {
  const cookie = signin();
  const title = "ticket1";
  const price = 20;
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", cookie)
    .send({
      title,
      price,
    });
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: -10,
    })
    .expect(400);
});

it("update ticket with valid info", async () => {
  const cookie = signin();
  const title = "ticket1";
  const price = 20;
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", cookie)
    .send({
      title,
      price,
    });
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "ticket_updated",
      price: 10,
    })
    .expect(201);

  const updatedResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({});

  expect(updatedResponse.body.title).toEqual("ticket_updated");
  expect(updatedResponse.body.price).toEqual(10);
});
