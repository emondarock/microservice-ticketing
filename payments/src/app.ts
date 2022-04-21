import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { CurrentUser, errorHandler } from "@emon-workstation/common";
import { NotFoundError } from "@emon-workstation/common";
import { CreateChargeRouter } from "./route/new";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(CurrentUser);
app.use(CreateChargeRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
