import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { RegisterUser, LoginUser } from "../../@types/user";
import { UserTable } from "../../db/user";
import userFixture from "../fixtures/user.fixture";

describe("users table in database", () => {
  let userTable: UserTable;
  let insertedRecords = 0;

  beforeAll(async () => {
    userTable = new UserTable();
  });

  it("should create a user", () => {

    let [user, err] = userFixture.createUser();

    expect(user).not.toBeNull();
    expect(err).toBeNull();
    insertedRecords++;
  });

  it("should return error if user already exists", () => {
    const user: RegisterUser = {
      username: "test",
      email: "test@gmail.com",
      password: "test-password",
    };
    let [newUser, err] = userFixture.createUser(user);
    expect(err).not.toBeNull();
    expect(newUser).toBeNull();
  });

  it("should test valid user credentials", () => {
    const [userData, err] = userFixture.loginUser();
    expect(err).toBeNull();
    expect(userData).not.toBeNull();
  });

  it("should test invalid user credentials", () => {
    const user: LoginUser = {
      email: "test@gmail.com",
      password: "false-password",
    };

    const [userData, err] = userFixture.loginUser(user);
    expect(err).not.toBeNull();
    expect(userData).toBeNull();
  });

  it("should update user details", () => {
    let [user, err] = userFixture.createUser({
      email: "test123@example.com",
      password: "test-password",
      username: "test",
    });

    expect(user).not.toBeNull();
    expect(err).toBeNull();
    insertedRecords++;

    const updatedEmail = "test1234@example.com";
    userTable.updateUser({ email: updatedEmail }, user!.id);
    const updatedUser = userTable.getUserByID(user!.id);

    expect(updatedUser?.email).toEqual(updatedEmail);
  });

  it("should update user password", () => {
    let [u, e] = userFixture.createUser({
      username: "test123",
      email: "test1212@gmail.com",
      password: "test-pass",
    });
    expect(u).not.toBeNull();
    expect(e).toBeNull();
    insertedRecords++;

    const updatedPassword = "s3cur3-p455w0rd";
    e = userTable.updatePassword("test-pass", updatedPassword, u!.id);

    expect(e).toBeNull();
  });

  it("should return a single user", () => {
    let [loginUser, err] = userFixture.loginUser();

    expect(err).toBeNull();
    loginUser = loginUser!;

    let user = userTable.getUserByID(loginUser.id);
    expect(user).not.toBeNull();
    expect(
      [user?.id, user?.email, user?.username, user?.inserted_at]
    ).toEqual(
      [loginUser.id, loginUser.email, loginUser.username, loginUser.inserted_at]
    );
  });

  it("should return list of users", () => {
    let users = userTable.allUsers;

    expect(users).toBeArray();
    expect(users).toHaveLength(insertedRecords);
  });

  afterAll(async () => {
    userTable.clearTable();
    userTable.closeDB();
  });
});
