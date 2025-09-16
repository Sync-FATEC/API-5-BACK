import { Router } from "express";
import { UserController } from "../controllers/UserController";

const userController = new UserController();
const router = Router()

router.get("/user-data/:email", userController.getUserData);
router.post("/register", userController.create);
router.post("/login", userController.login);
router.put("/forgot-password", userController.forgotPassword);

export default router;
