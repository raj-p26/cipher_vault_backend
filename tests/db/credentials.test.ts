import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { CredentialManager } from "../../db/credential";
import credentialFixture from "../fixtures/credential.fixture";

describe("credentials table tests", () => {
  let credentialManager: CredentialManager;
  let insertedRecords = 0;
  const defaultCredential = credentialFixture.defaultCredential;

  beforeAll(() => {
    credentialManager = new CredentialManager();
  });

  it("should create credential", () => {
    let newCredential = credentialFixture.create();
    expect(newCredential).not.toBeNull();

    newCredential = newCredential!;

    expect(newCredential.user_id).toEqual(defaultCredential.user_id);
    expect(newCredential.cred_type).toEqual(defaultCredential.cred_type);
    expect(newCredential.cred_value).toEqual(defaultCredential.cred_value);
    expect(newCredential.comment).toEqual(defaultCredential.comment);
    expect(newCredential.password).toEqual(defaultCredential.password);
    expect(newCredential.pinned).toEqual(defaultCredential.pinned);
    insertedRecords++;
  });

  it("should return a single credential by ID", () => {
    let c = credentialFixture.create({
      comment: "This is a comment",
      user_id: defaultCredential.user_id,
      cred_type: "domain",
      password: "another-password",
      cred_value: "www.google.com",
      pinned: true,
    });
    insertedRecords++;

    expect(c).not.toBeNull();

    const cred = credentialManager.getCredentialByID(c!.id);
    expect(cred).toEqual(c);
  });

  it("should update a credential", () => {
    let c = credentialFixture.create({
      user_id: defaultCredential.user_id,
      cred_type: "www.yahoo.com",
      password: "yet-another-password",
      cred_value: "test3@gmail.com",
      comment: "This is a comment",
    });
    insertedRecords++;

    expect(c).not.toBeNull();

    const cred_type = "www.testing.com";
    const cred_value = "test3@example.com";

    const cred = credentialManager.updateCredential(
      { cred_type, cred_value },
      c!.id
    );

    expect(cred).not.toBeNull();
    expect([cred!.cred_value, cred!.cred_type]).toEqual([
      cred_value,
      cred_type,
    ]);
  });

  it("should update a credential partially", () => {
    const c = credentialFixture.create({
      user_id: defaultCredential.user_id,
      cred_type: "www.yahoo.com",
      password: "yet-another-password",
      cred_value: "test3@gmail.com",
      comment: "This is a comment",
    });
    insertedRecords++;

    expect(c).not.toBeNull();

    const updatedCred = credentialManager.updateCredential({
      pinned: 1
    }, c!.id);

    expect(updatedCred).not.toBeNull();
    expect(updatedCred!.pinned).toBe(1);
  });

  it("should return credential of a user", () => {
    let userCredentials = credentialManager.getCredentialsByUserID(
      credentialFixture.defaultUserID
    );

    expect(userCredentials).toBeArray();
    expect(userCredentials).toHaveLength(insertedRecords);
  });

  it("should delete a user credential", () => {
    let cred = credentialFixture.create();
    expect(cred).not.toBeNull();
    cred = cred!;

    const err = credentialManager.deleteCredential(cred.id);

    expect(err).toBeNull();
  });

  it("should return some error when credential does not exist", () => {
    const err = credentialManager.deleteCredential("12345");

    expect(err).not.toBeNull();
  });

  afterAll(() => {
    credentialManager.clearTable();
  });
});
