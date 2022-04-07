import request from "supertest";
import { app } from "../../app";
import Response from "express";
import { CurrentUser } from "@emon-workstation/common";
it("returns with details about the current user", async () => {
  const cookies = await signin();
  console.log("cookies", cookies);

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookies)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual("test@test.com");
});

it("returns with null if not authorized", async () => {
  await request(app).post("/api/users/signout").send({});
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
