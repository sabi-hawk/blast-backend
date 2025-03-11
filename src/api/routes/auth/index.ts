import { Router } from "express";
import * as authController from "../../controllers/auth";

const authRouter = Router();

authRouter.post("/register", authController.register)
authRouter.post("/login", authController.login)
// authRouter.post("/changePassword", authController.changePassword)
// authRouter.post("/logout", authController.logout)
// authRouter.post("/refresh_token", authController.refreshToken)

export default authRouter