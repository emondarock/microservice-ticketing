import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { OrderCreatedEvent, OrderStatus } from "@emon-workstation/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 12,
    },
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("replicate the order info", async () => {
  const { data, listener, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(data.id);

  expect(updatedOrder?.id).toEqual(data.id);
  expect(updatedOrder?.price).toEqual(data.ticket.price);
});

it("calls the ack message", async () => {
  const { data, listener, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toBeCalled();
});

// it("publishes a ticket update event", async () => {
//   const { data, listener, msg, ticket } = await setup();
//   await listener.onMessage(data, msg);
//   expect(natsWrapper.client.publish).toHaveBeenCalled();

//   //@ts-ignore
//   console.log(natsWrapper.client.publish.mock.calls);

//   const ticketUpdatedData = JSON.parse(
//     (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
//   );
//   expect(data.id).toEqual(ticketUpdatedData.orderId);
// });
