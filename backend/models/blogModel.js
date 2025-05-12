import { read } from "fs";
import mongoose from "mongoose";

// Validator to limit array to max 2 videos
function arrayLimit(val) {
    return val.length <= 2;
}

const blogSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true
    },
    slug:{
        type: String,
        required: false,
    },
    description:{
        type: String,
        required: true,
        trim: true
    },
    tag:{
        type: String,
        required: true,
    },
    readTime:{
        type: String,
        required: true,
    },
    images:{
        type: String,
        required: true,
    },    videos:{
        type: [String],
        required: false,
        validate: [arrayLimit, 'Cannot exceed 2 videos per blog']
    }
})
const Blog = mongoose.model("Blog", blogSchema);
export default Blog;