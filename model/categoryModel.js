const mongoose = require('mongoose')
const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  image: {
    type: Array,
    required: false,
  },
  active: {
    type: Boolean,
      default: true,
    require:true
  },
});

module.exports = mongoose.model('Category',categorySchema)