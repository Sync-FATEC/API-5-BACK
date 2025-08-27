import { Router } from "express";
import { UserController } from "../controllers/UserController";

const userController = new UserController();
const router = Router()

router.post("/register", userController.create);
router.post("/login", userController.login);

export default router;
