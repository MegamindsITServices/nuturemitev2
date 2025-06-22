import mongoose from "mongoose";
import {genSalt, hash} from 'bcrypt'

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : [true, "Email is required"],
        unique : true,
    },
    password:{
        type : String,
        required : true,
    },
    firstName:{
        type : String,
        required : false,
    },
    lastName:{
        type : String,
        required : false,
    },
    image:{
        type : String,
        required : false,
    },
    address:{
        type : String,
        required : false,
    },
    phone:{
        type : String,
        required : false,
    },
      isAdmin:{
        type : Boolean,
        default : false,
    },
    isUser:{
        type : Boolean,
        default : true,
    },
    isBlocked:{
        type : Boolean,
        default : false,
    },
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    shippingAddress:{
        fullName:{
            type:String,
           
        },
        emailAddress:{
            type:String,
           
        },
        phoneNumber:{
            type:String,
           
        },
        streetAddress:{
            type:String,
           
        },
        city:{
            type:String,
           
        },
        state:{
            type:String,
           
        },
        pincode:{
            type:String,
           
        },
        country:{
            type:String,
            defaule:"India"
        }
    }
}, {timestamps:true,strict:false})

// Removed the pre-save hook as we're already hashing the password in authController.js

const User = mongoose.model("User", userSchema)
export default User