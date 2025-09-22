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
    expect(newCredential.domain).toEqual(defaultCredential.domain);
    expect(newCredential.email).toEqual(defaultCredential.email);
    expect(newCredential.password).toEqual(defaultCredential.password);
    insertedRecords++;
  });

  it("should return a single credential by ID", () => {
    let c = credentialFixture.create({
      user_id: defaultCredential.user_id,
      domain: "www.google.com",
      password: "another-password",
      email: "test2@gmail.com",
    });
    insertedRecords++;

    expect(c).not.toBeNull();

    const cred = credentialManager.getCredentialByID(c!.id);
    expect(cred).toEqual(c);
  });

  it("should update a credential", () => {
    let c = credentialFixture.create({
      user_id: defaultCredential.user_id,
      domain: "www.yahoo.com",
      password: "yet-another-password",
      email: "test3@gmail.com",
    });
    insertedRecords++;

    expect(c).not.toBeNull();

    const newDomain = "www.testing.com";
    const newEmail = "test3@example.com";

    const cred = credentialManager.updateCredential({
      domain: newDomain,
      email: newEmail
    }, c!.id);

    expect(cred).not.toBeNull();
    expect([cred!.email, cred!.domain]).toEqual([newEmail, newDomain]);
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
