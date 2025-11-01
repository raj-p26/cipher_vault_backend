import { afterAll, describe, expect, it } from "bun:test";
import request from "supertest";
import { app } from "../../server";
import { UserTable } from "../../db/user";

describe("/auth tests", () => {
  it("should register a user", async () => {
    const resp = await request(app).post("/auth/register").send({
      username: "test",
      email: "test@gmail.com",
      password: "test-password",
    });

    expect(resp.statusCode).toBe(201);
    expect(resp.body).toBeObject();
    expect(resp.body).toHaveProperty("status");
    expect(resp.body).toHaveProperty("payload");
    expect(resp.body).toHaveProperty("message");
    expect(resp.body["status"]).toEqual("success");
    expect(resp.body["payload"]).toHaveProperty("token");
    expect(resp.body["payload"]).toHaveProperty("user");
    expect(resp.body["message"]).not.toBeNull();
  });

  it("should return 500 if user already exists", async () => {
    const resp = await request(app).post("/auth/register").send({
      username: "test",
      email: "test@gmail.com",
      password: "test-password",
    });

    expect(resp.statusCode).toBe(500);
    expect(resp.body).toBeObject();
    expect(resp.body).toHaveProperty("status");
    expect(resp.body["status"]).toEqual("failed");
    expect(resp.body["message"]).not.toBeNull();
  });

  it("should login the user if credentials are valid", async () => {
    const resp = await request(app).post("/auth/login").send({
      email: "test@gmail.com",
      password: "test-password",
    });

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toBeObject();
    expect(resp.body).toHaveProperty("status");
    expect(resp.body).toHaveProperty("payload");
    expect(resp.body["status"]).toEqual("success");
  });

  it("should update the user credentials", async () => {
    let resp = await request(app).post("/auth/register").send({
      username: "test",
      email: "test2@gmail.com",
      password: "test-password",
    });

    expect(resp.statusCode).toBe(201);
    const token = resp.body["payload"]["token"];

    const newUsername = "tester";
    const newEmail = "tester@gmail.com";
    resp = await request(app)
      .patch("/auth/edit")
      .set("Authorization", token)
      .send({
        username: newUsername,
        email: newEmail,
      });

    expect(resp.statusCode).toBe(204);
  });

  it("should update user password", async () => {
    let resp = await request(app).post("/auth/register").send({
      username: "test",
      email: "test22@gmail.com",
      password: "test-password",
    });

    expect(resp.statusCode).toBe(201);
    const token = resp.body["payload"]["token"];

    resp = await request(app)
      .patch("/auth/update-password")
      .set("Authorization", token)
      .send({
        oldPassword: "test-password",
        newPassword: "t35t-p455w0rd",
      });

    expect(resp.statusCode).toBe(204);
  });

  it("should return 500 if login credentials are invalid", async () => {
    const resp = await request(app).post("/auth/login").send({
      email: "test@gmail.com",
      password: "wrong-password",
    });

    expect(resp.statusCode).toBe(500);
    expect(resp.body).toBeObject();
    expect(resp.body).toHaveProperty("status");
    expect(resp.body['status']).toEqual("failed");
  });

  afterAll(() => {
    new UserTable().clearTable();
  });
});
