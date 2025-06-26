import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    products:[
        {
          product:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Product"
          }  ,
          quantity:{
            type:Number,
            default:1,
          }
        },
    ],
    productName :{
        type : String,
    },
    trackingId:{
        type : String,
        default : null
    },
    label:{
        type : String,
        default : null
    },
    buyer : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    address : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true
    },
    totalPrice : {
        type : Number,
        required : true
    },
    payment: {
        method: {
            type: String,
            enum: ["Cash on Delivery", "Cashfree", "PhonePe", "Credit Card", "UPI"],
            default: "Cash on Delivery"
        },
        transactionId: {
            type: String
        },
        status: {
            type: String,
            enum: ["Pending", "Completed", "Failed", "Refunded"],
            default: "Pending"
        },
        responseData: {
            type: Object
        }
    },
    status : {
        type : String,
        default : "Confirmed",
        enum:[
            "Confirmed",
            "Processing",
            "Out for Delivery",
            "Shipped",
            "Delivered",
            "Cancelled"
        ]
    },

}, {timestamps : true});

const Order = mongoose.model("Order", orderSchema);
export default Order;