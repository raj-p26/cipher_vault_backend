import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserTable } from "../db/user";
import { JWT_SECRET } from "../utils/env";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authToken = req.headers['authorization'];

  if (authToken === undefined) {
    return res.status(401).json({
      status: "failed",
      message: "You are unauthorized",
    });
  }

  const jwtPayload = jwt.verify(authToken, JWT_SECRET) as jwt.JwtPayload;

  const userTable = new UserTable();
  const user = userTable.getUserByID(jwtPayload.id!);

  if (user == null) {
    return res.status(401).json({
      status: "failed",
      message: "You are unauthorized",
    });
  }

  req.headers['user-id'] = user.id;
  next();
}
