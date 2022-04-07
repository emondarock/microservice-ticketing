import { NotFoundError } from "@emon-workstation/common";
import express, { Request, Response } from "express";
import { Ticket } from "../models/tickets";
const router = express.Router();

router.get("/api/tickets", async (req: Request, res: Response) => {
  const ticket = await Ticket.find({});
  res.status(200).send(ticket);
});

export { router as indexTicketRouter };
