import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@emon-workstation/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { OrderCreatedPublisher } from "../events/publisher/order-created-publisher";
import { Order } from "../models/order";
import { Ticket } from "../models/ticket";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .notEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }
    console.log(ticket);

    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError("Ticket alrady reserved");
    }

    const expiration = new Date();
    console.log(expiration);

    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    expiration.setHours(expiration.getHours() + 1);
    console.log(expiration);

    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket,
    });
    await order.save();

    await new OrderCreatedPublisher(natsWrapper.client).publish({
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

export { router as newOrderRouter };
