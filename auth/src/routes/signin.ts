import express, { Request, Response } from "express";
import { body } from "express-validator";
import { BadRequestError } from "@emon-workstation/common";
import jwt from "jsonwebtoken";
import { validateRequest } from "@emon-workstation/common";
import { User } from "../models/user";
import { Password } from "../services/password";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("Password must be given"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const userExist = await User.findOne({ email });

    if (!userExist) {
      throw new BadRequestError("Invalid Credentials");
    }

    const passwordMatch = await Password.compare(userExist.password, password);

    if (!passwordMatch) {
      throw new BadRequestError("Invalid Credentials");
    }

    const userJwt = jwt.sign(
      {
        id: userExist.id,
        email: userExist.email,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(userExist);
  }
);

export { router as signinRouter };
