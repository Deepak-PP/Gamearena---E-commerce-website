const mongoose=require("mongoose")

const AddressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true 
       },
     mobile: {
        type: Number,
        required: true 
       },
    address1: {
       type: String,
       required: true 
      },
    country: {
       type: String,
       required: true 
      },
    state: {
       type: String,
       required: true 
      },
    city: {
       type: String,
       required: true 
      },
    street: {
       type: String,
       required: true 
      },
   
    postalCode: {
       type: Number,
       required: true 
      }
  });


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  address: [AddressSchema],
  password: {
    type: String,
    required: true,
  },
  is_verified: {
    type: Number,
    default: 0,
  },
  token: {
    type: String,
    default: "",
  },
  wallet: {
    type: Number,
  },
  couponUsed: {
    type: Array,
  },
  is_blocked: {
    type: Number,
    default: 0,
  },
});

module.exports=mongoose.model('User',userSchema)