import { Router } from "express";
import { registerUser } from "../controllers/user.conroller.js";
import { upload } from "../middlewares/multer.middleware.js";
import multer from "multer";

const userRouter = Router();

userRouter.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]), 
    registerUser
    );

// const uploadMiddleware = (req, res, next) => {
//     upload.fields([
//         { name: 'avatar', maxCount: 1 },
//         { name: 'coverImage', maxCount: 1 }
//     ])(req, res, function (err) {
//         if (err instanceof multer.MulterError) {
//             console.error("❌ Multer Error:", err);
//             return res.status(400).json({ error: err.message });
//         } else if (err) {
//             console.error("❌ Unknown Error during file upload:", err);
//             return res.status(500).json({ error: "File upload failed" });
//         }
//         console.log("✅ Multer upload successful, moving to registerUser");
//         next(); // call registerUser
//     });
// };

// userRouter.route("/register").post(uploadMiddleware, registerUser);


export { userRouter };