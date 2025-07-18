import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: 
        {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            indexed: true,
            match: /^[a-zA-Z0-9_]{3,30}$/,
        },
        email:
        {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /.+\@.+\..+/,
        },
        fullName:
        {
            type: String,
            required: true,
            indexed: true,
            trim: true,
            match: /^[a-zA-Z\s]{3,50}$/,
        },
        avatar:
        {
            type: String,
            required: true,
        },
        coverImage:
        {
            type: String,
        },
        password:
        {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken:
        {
            type: String,
        },
        watchHistory:
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        }
    },
    {
        timestamps: true,
    }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { 
            id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName,
        }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { 
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
        });
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
}      

export const User = mongoose.model("User", userSchema);