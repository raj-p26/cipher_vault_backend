import type { RegisterUser, LoginUser } from "../../@types/user";
import { UserTable } from "../../db/user";

const userTable = new UserTable();

const defaultRegisterUser: RegisterUser = {
  username: "test",
  email: "test@gmail.com",
  password: "test-password",
};

const defaultLoginUser: LoginUser = {
  email: "test@gmail.com",
  password: "test-password",
};

export function createUser(userData: RegisterUser = defaultRegisterUser) {
  return userTable.registerUser(userData);
}

export function loginUser(userData: LoginUser = defaultLoginUser) {
  return userTable.loginUser(userData);
}

export default {
  createUser,
  loginUser,
  defaultLoginUser,
  defaultRegisterUser,
};
