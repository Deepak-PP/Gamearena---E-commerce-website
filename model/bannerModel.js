const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bannerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: Array,
    required: true,
  },
  image: {
    type: Array,
    required: true,
  }
});

module.exports = mongoose.model("Banner", bannerSchema);
