const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reviewSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  text: {
    type: String,
    required: true,
  },
})


const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  grossprice: {
    type: Number,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  processor: {
    type: String,
    required: false,
  },
  hdd: {
    type: String,
    required: false,
  },
  connectivity: {
    type: String,
    required: false,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  colour: {
    type: String,
    required: false,
  },
  image: {
    type: Array,
    required: true,
  },
  in_stock: {
    type: Number,
    required: false,
  },
  reviews: [reviewSchema],
  active: {
    type: Boolean,
    default: true,
    require: true,
  }
});

module.exports = mongoose.model('Product',productSchema)

