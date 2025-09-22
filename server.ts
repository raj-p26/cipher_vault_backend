import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import credentialsRouter from "./routes/credential";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/credentials", credentialsRouter);

export { app };
