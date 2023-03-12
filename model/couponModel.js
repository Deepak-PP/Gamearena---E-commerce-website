const mongoose = require('mongoose')
const Schema = mongoose.Schema
const coupoSchema = mongoose.Schema({
  couponcode: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  isActive: {
    type: String,
    default: 1,
  },
  maxlimit: {
    type: Number,
    require: true,
  },
  minpurchase: {
    type: Number,
    required: true,
  },
  expdate: {
    type: String,
  }
});
module.exports = mongoose.model('Coupon',coupoSchema)

