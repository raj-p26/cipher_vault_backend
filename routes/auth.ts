import { Router } from "express";
import authController from "../controllers/auth";
import { requireAuth } from "../middlewares/require-auth";

const authRouter = Router();

authRouter.post("/register", authController.registerUser);
authRouter.post("/login", authController.loginUser);
authRouter.patch("/edit", requireAuth, authController.updateUser);
authRouter.patch("/update-password", requireAuth, authController.updatePassword);

export default authRouter;
