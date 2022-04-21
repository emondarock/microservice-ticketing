import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { OrderStatus } from "@emon-workstation/common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";
// jest.mock("../../stripe");
it("returns 404 if order is not found", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", signin())
    .send({
      token: "12345",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("returns 401 if order is not authorized", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 12,
  });

  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", signin())
    .send({
      token: "12345",
      orderId: order.id,
    })
    .expect(403);
});

it("returns 400 if order is already cancelled", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Cancelled,
    userId: userId,
    price: 12,
  });

  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", signin(userId))
    .send({
      token: "12345",
      orderId: order.id,
    })
    .expect(400);
});

it("returns 204 with valid inputs", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: userId,
    price,
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });
  expect(stripeCharge).toBeDefined();
  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge?.id,
  });

  expect(payment).not.toBeNull();
});
