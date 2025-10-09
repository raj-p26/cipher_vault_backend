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

export default {
  registerUser,
  loginUser,
};
