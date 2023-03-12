

const mongoose = require('mongoose')
const Schema = mongoose.Schema


const productschema = mongoose.Schema({
    item:{
        type:Schema.Types.ObjectId,
        ref:"Product",
        req:true
    }
})


const wishlistSchema = mongoose.Schema({

    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    products:[productschema]
    
})

module.exports = mongoose.model('Wishlist',wishlistSchema)
