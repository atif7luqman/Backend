import { Router } from "express";
import { registerUser } from "../controllers/user.conroller.js";
import { upload } from "../utils/multer.js";

const userRouter = Router();

userRouter.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]), 
    registerUser
    );

export { userRouter };