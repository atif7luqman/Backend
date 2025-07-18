import { asyncHandler} from "./../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshAccessToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch(err){
        throw new ApiError(500, "Something went wrong.")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullName, username, email, password} = req.body;

    if(
        [fullName, username, email, password].some(field => !field.trim())
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne(
        { $or: [{ username }, { email }] }
    )

    if(existingUser){
         throw new ApiError(409, "Username or email already exists");
    }

    const avatarLoacalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(!avatarLoacalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLoacalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(500, "Failed to upload avatar");
    }

    const user =await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while creating the user");
    }

    res.status(200).json(
        new ApiResponse(201, "User registered successfully", createdUser)
    );
});

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const { username, email, password} = req.body;

    if(!username && !email){
        new ApiError(400, "username or email is required.")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    });

    if(!user){
        throw new ApiError(404, "user does not exist.")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(404, "Invalid credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    }


    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,"User logged in successfully", {user: loggedInUser, accessToken, refreshToken})
    )

});

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200,"User successful logged out", {})
    )
})

const refreshAccessToken = asyncHandler( async(req, res) => {
    try{
        const incomingRefreshToken = req.body?.cookie("refreshToken") || req.body?.refreshToken

        if(!incomingRefreshToken){
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        if(!decodedToken){
            throw new ApiError(401, "Invalid refresh token")
        }

        const user = await User.findById(decodedToken?.id)

        if(!user){
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token expired or user")
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user?._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                "Access token refreshed",
                {accessToken, refreshToken}
            )
        )

    } catch (err){
        throw new ApiError(401, err.message || "Invalid Refresh token")
    }
});

export {registerUser, loginUser, logoutUser, refreshAccessToken, refreshAccessToken};