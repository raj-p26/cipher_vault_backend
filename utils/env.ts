import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const JWT_SECRET = process.env.JWT_SECRET!;
export const ENV = process.env.ENV || "test";
export const DB_NAME = ENV === "test" ? "test.db" : process.env.DB_NAME!;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
export const SECRET_IV = process.env.SECRET_IV!;
