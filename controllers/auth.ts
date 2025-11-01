import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserTable } from "../db/user";
import { JWT_SECRET } from "../utils/env";
import type { LoginUser, RegisterUser } from "../@types/user";

const userTable = new UserTable();

export async function registerUser(req: Request, res: Response) {
  const user = req.body as RegisterUser;
  const [u, err] = userTable.registerUser(user);

  if (err !== null) {
    return res.status(500).json({ status: "failed", message: err });
  }
  const token = jwt.sign({ id: u!.id }, JWT_SECRET, { expiresIn: "7d" });

  res.status(201).json({
    status: "success",
    message: "User registered successfully",
    payload: { token, user: u },
  });
}

export async function loginUser(req: Request, res: Response) {
  const user = req.body as LoginUser;
  const [u, err] = userTable.loginUser(user);

  if (err !== null) {
    return res.status(500).json({ status: "failed", message: err });
  }

  const token = jwt.sign({ id: u!.id }, JWT_SECRET, { expiresIn: "7d" });

  res.json({
    status: "success",
    message: "Logged in successfully",
    payload: { token, user: u }
  });
}

export async function updateUser(req: Request, res: Response) {
  const userID = req.headers["user-id"];
  const userData = req.body as Partial<RegisterUser>;

  if (!userID) {
    return res
      .status(401)
      .json({ status: "failed", message: "you are unauthorized" });
  }

  const err = userTable.updateUser(userData, userID as string);
  if (err !== null) {
    return res.status(500).json({ status: "failed", message: err });
  }

  return res.status(204).json({});
}

export async function updatePassword(req: Request, res: Response) {
  const userID = req.headers["user-id"];
  const oldPassword = req.body["oldPassword"];
  const newPassword = req.body["newPassword"];

  if (!userID) {
    return res
      .status(401)
      .json({ status: "failed", message: "you are unauthorized" });
  }

  const err = userTable.updatePassword(oldPassword, newPassword, userID as string);
  if (err !== null) {
    return res.status(500).json({ status: "failed", message: err });
  }

  return res.status(204).json();
}

export default {
  loginUser,
  registerUser,
  updatePassword,
  updateUser,
};
