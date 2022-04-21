import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
} from "@emon-workstation/common";
import express, { Request, Response } from "express";
import { OrderCancelledPublisher } from "../events/publisher/order-cancelled-publisher";
import { Order } from "../models/order";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.put(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      expiresAt: order.expiresAt.toISOString(),
      userId: order.userId,
      ticket: {
        id: order.ticket.id,
        price: order.ticket.price,
      },
    });
    res.status(201).send(order);
  }
);

export { router as deleteOrderRouter };
