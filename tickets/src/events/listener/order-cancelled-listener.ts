import {
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from "@emon-workstation/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/tickets";
import { TicketUpdatedPublisher } from "../publisher/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    //Find ticket that order has reserved
    const ticket = await Ticket.findById(data.ticket.id);

    //If no ticket throw error
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    //Mark the ticket as reserved
    ticket.orderId = undefined;
    //Save the ticket
    await ticket.save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });
    //Ack the message
    msg.ack();
  }
}
