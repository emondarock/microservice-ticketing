import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@emon-workstation/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const order = Order.build({
      id: data.id,
      status: data.status,
      userId: data.userId,
      price: data.ticket.price,
      version: data.version,
    });
    await order.save();
    msg.ack();
  }
}
