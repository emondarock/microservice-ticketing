import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from "@emon-workstation/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Ticket } from "../models/tickets";
const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
  ],
  async (req: Request, res: Response) => {
    const id = req.params.id;
    console.log(id);

    const { title, price } = req.body;
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      throw new NotFoundError();
    }
    if (ticket?.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.title = title;
    ticket.price = price;

    await ticket.save();

    res.status(201).send(ticket);
  }
);

export { router as updateTicketRouter };
