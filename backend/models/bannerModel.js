import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    bannerImage:{
        type : String,
        required : [true, "Banner image is required"],
    }
},{timestamps:true})

const Banner = mongoose.model("Banner", bannerSchema)
export default Banner