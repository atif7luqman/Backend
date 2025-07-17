import { Router } from "express";
import { registerUser } from "../controllers/user.conroller.js";

const userRouter = Router();

userRouter.route("/register").post(registerUser)

export { userRouter };