import {
  ExpirationCompleteEvent,
  Listener,
  OrderStatus,
  Subjects,
} from "@emon-workstation/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publisher/order-cancelled-publisher";
import { queueGroupName } from "./queue-group-name";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId).populate("ticket");
    if (!order) {
      throw new Error("Order Not Found !");
    }
    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }
    order.set({
      status: OrderStatus.Cancelled,
    });
    await order.save();
    console.log(order);

    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      expiresAt: order.expiresAt.toString(),
      status: order.status,
      userId: order.userId,
      ticket: {
        id: order.ticket.id,
        price: order.ticket.price,
      },
    });
    msg.ack();
  }
}
