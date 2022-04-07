import express from "express";
import { CurrentUser } from "@emon-workstation/common";

const router = express.Router();

router.get("/api/users/currentuser", CurrentUser, (req, res) => {
  console.log(req.currentUser);

  res.send({
    currentUser: req.currentUser || null,
  });
});

export { router as currentUserRouter };
