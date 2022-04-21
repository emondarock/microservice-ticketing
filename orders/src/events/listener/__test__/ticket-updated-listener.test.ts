import { TicketUpdatedEvent } from "@emon-workstation/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  //Create an instance of listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Concert",
    price: 20,
  });

  await ticket.save();

  //Create fake data event
  const data: TicketUpdatedEvent["data"] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: "New Concert",
    price: 999,
    userId: "sajdakskjdaksdja",
  };

  //Create fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, ticket, msg };
};

it("finds, updates & save the ticket", async () => {
  const { data, listener, ticket, msg } = await setup();
  //Call the on message Option with data and event
  await listener.onMessage(data, msg);
  //write assertion to make sure ticket is created

  const updatedTicket = await Ticket.findById(data.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket?.title).toEqual(data.title);
  expect(updatedTicket?.price).toEqual(data.price);
  expect(updatedTicket?.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { data, listener, msg } = await setup();
  //Call the on message Option with data and event
  await listener.onMessage(data, msg);
  //write assertion as ack function called
  expect(msg.ack).toBeCalled();
});

it("does not call acks if the event has a skipped version ", async () => {
  const { data, listener, msg } = await setup();
  data.version = 10;
  //Call the on message Option with data and event
  try {
    await listener.onMessage(data, msg);
  } catch (error) {}
  //write assertion as ack function called
  expect(msg.ack).not.toHaveBeenCalled();
});
