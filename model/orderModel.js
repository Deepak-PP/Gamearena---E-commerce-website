const { ObjectID, ObjectId, Timestamp } = require('bson')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const orderSchema = mongoose.Schema({
    created_date:{
        type:String,
        required:true, 
    },
    
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:false
    },
    products:{
        type:Array,
        ref:'Product',
        required:true
    },
    total:{
        type:Number,
        required:false
    },
    address:{
        type: ObjectId,
        required:true
    },
    payment_method:{
        type:String,
        required:false
    },
    payment_status:{
        type: String,
        required: true
    },
    order_status:{
        type:String,
        required:false,
        default:'pending'
    }

},{timestamps:true})

module.exports = mongoose.model('Order',orderSchema)