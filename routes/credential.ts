import credentialsController from "../controllers/credential";
import { Router } from "express";
import { requireAuth } from "../middlewares/require-auth";

const credentialsRouter = Router();

credentialsRouter.use(requireAuth);

credentialsRouter.get("/", credentialsController.index);
credentialsRouter.post("/", credentialsController.create);
credentialsRouter.get("/:id", credentialsController.show);
credentialsRouter.patch("/:id", credentialsController.update);
credentialsRouter.delete("/:id", credentialsController.destroy);

export default credentialsRouter;

