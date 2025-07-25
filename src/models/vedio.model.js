import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        vedioFile:
        {
            type: String, // cloudinary URL
            required: true,
        },
        thumbnail:
        {
            type: String, // cloudinary URL
            required: true,
        },
        owner:
        {
            type : Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title:
        {
            type: String,
            required: true,
        },
        description:
        {
            type: String,
            required: true,
        },
        duration:
        {
            type: Number,
            required: true,
        },
        views:
        {
            type: Number,
            default: 0,
        },
        ispublished:
        {
            type: Boolean,
            default: true,
        },

    },
    {
        timestamps: true,
    }
);

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)