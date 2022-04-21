import {
  Listener,
  NotFoundError,
  Subjects,
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from "@emon-workstation/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error("Ticket not found");
    }
    ticket.title = data.title;
    ticket.price = data.price;
    await ticket.save();
    msg.ack();
  }
}
