import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";


const jwtVerify = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if(!token){
            throw new ApiError(401, 'Unauthorized Request.')
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?.id)

        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;

        next()

    } catch (err){
        throw new ApiError(401, err?.message || "Invalid access token")
    }
})

export {jwtVerify};