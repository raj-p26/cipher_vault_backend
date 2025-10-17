import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import request from "supertest";
import { CredentialManager } from "../../db/credential";
import { UserTable } from "../../db/user";
import { app } from "../../server";

describe("/credentials tests", () => {
  let credentialManager: CredentialManager;
  let userTable: UserTable;
  let user: { token: string; id: string };
  beforeAll(async () => {
    credentialManager = new CredentialManager();
    userTable = new UserTable();
    const userResp = await request(app).post("/auth/register").send({
      username: "test",
      email: "test@example.com",
      password: "test-password",
    });

    expect(userResp.statusCode).toBe(201);
    expect(userResp.body).toHaveProperty("payload");
    const payload = userResp.body["payload"];

    user = {
      token: payload["token"],
      id: payload["user"]["id"],
    };
  });

  it("should create a credential", async () => {
    const credentials = {
      cred_type: "domain",
      cred_value: "www.google.com",
      password: "test-password",
    };

    const resp = await request(app)
      .post("/credentials")
      .set("Authorization", user.token)
      .send({ ...credentials });

    expect(resp.statusCode).toBe(201);
    expect(resp.body).toBeObject();
    expect(resp.body).toHaveProperty("status");
    expect(resp.body["status"]).toEqual("success");
    expect(resp.body).toHaveProperty("payload");
    const c = resp.body["payload"]["credential"];

    expect([
      credentials.cred_type,
      credentials.cred_value,
      credentials.password,
      user.id,
    ]).toEqual([c.cred_type, c.cred_value, c.password, c.user_id]);
  });

  it("should return 401 if the user is unauthorized", async () => {
    const credentials = {
      cred_type: "domain",
      cred_value: "www.example.com",
      password: "test-password",
    };
    const resp = await request(app)
      .post("/credentials")
      .send({ ...credentials });

    expect(resp.statusCode).toBe(401);
    expect(resp.body).toBeObject();
    expect(resp.body).toHaveProperty("status");
    expect(resp.body).toHaveProperty("message");
    expect(resp.body["status"]).toEqual("failed");
  });

  it("should return a single credential as payload", async () => {
    const credentials = {
      cred_type: "domain",
      cred_value: "www.example.com",
      password: "test-password",
    };

    let resp = await request(app)
      .post("/credentials")
      .set("Authorization", user.token)
      .send({ ...credentials });

    expect(resp.statusCode).toBe(201);
    expect(resp.body).toBeObject();
    expect(resp.body).toHaveProperty("status");
    expect(resp.body).toHaveProperty("payload");
    expect(resp.body["status"]).toEqual("success");
    const c = resp.body["payload"]["credential"];

    resp = await request(app)
      .get(`/credentials/${c["id"]}`)
      .set("Authorization", user.token);

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toBeObject();
    expect(resp.body).toHaveProperty("status");
    expect(resp.body).toHaveProperty("payload");
    expect(resp.body["status"]).toEqual("success");
    const returnedCred = resp.body["payload"]["credential"];

    expect(returnedCred).toEqual(c);
  });

  it("should return 404 if credentials are not found", async () => {
    const resp = await request(app)
      .get("/credentials/12345")
      .set("Authorization", user.token);

    expect(resp.statusCode).toBe(404);
    expect(resp.body).toBeObject();
    expect(resp.body).toHaveProperty("status");
    expect(resp.body["status"]).toEqual("failed");
  });

  it("should update the credentials", async () => {
    const credentials = {
      cred_type: "domain",
      cred_value: "www.example.com",
      password: "test-password",
    };

    let resp = await request(app)
      .post("/credentials")
      .set("Authorization", user.token)
      .send({ ...credentials });

    expect(resp.statusCode).toBe(201);
    expect(resp.body).toBeObject();
    expect(resp.body).toHaveProperty("status");
    expect(resp.body).toHaveProperty("payload");
    expect(resp.body["status"]).toEqual("success");
    const c = resp.body["payload"]["credential"];

    const cred_type = "domain";
    const cred_value = "www.testing.com";

    resp = await request(app)
      .patch(`/credentials/${c["id"]}`)
      .set("Authorization", user.token)
      .send({
        cred_type,
        cred_value,
      });

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toBeObject();
    expect(resp.body).toHaveProperty("status");
    expect(resp.body).toHaveProperty("payload");
    expect(resp.body["status"]).toEqual("success");
    const returnedCred = resp.body["payload"]["credential"];

    expect([returnedCred["cred_type"], returnedCred["cred_value"]]).toEqual([
      cred_type,
      cred_value,
    ]);
  });

  it("should delete a credential", async () => {
    const credentials = {
      cred_type: "domain",
      cred_value: "www.example.com",
      password: "test-password",
    };

    let resp = await request(app)
      .post("/credentials")
      .set("Authorization", user.token)
      .send({ ...credentials });

    expect(resp.statusCode).toBe(201);
    expect(resp.body).toBeObject();
    expect(resp.body).toHaveProperty("status");
    expect(resp.body).toHaveProperty("payload");
    expect(resp.body["status"]).toEqual("success");
    const c = resp.body["payload"]["credential"];

    resp = await request(app)
      .delete(`/credentials/${c["id"]}`)
      .set("Authorization", user.token);

    expect(resp.statusCode).toBe(204);
  });

  it("should return 404 if credential was not found while deleting", async () => {
    const resp = await request(app)
      .delete("/credentials/12345")
      .set("Authorization", user.token);

    expect(resp.statusCode).toBe(404);
    expect(resp.body).toBeObject();
    expect(resp.body).toHaveProperty("status");
    expect(resp.body["status"]).toEqual("failed");
  });

  afterAll(() => {
    credentialManager.clearTable();
    userTable.clearTable();
  });
});
