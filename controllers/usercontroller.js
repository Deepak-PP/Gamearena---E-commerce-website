const User = require("../model/userModel");
const Category = require("../model/categoryModel");
const Cart = require("../model/cartModel");
const Product = require("../model/productModel");
const Coupon = require("../model/couponModel");
const Order = require("../model/orderModel");
const Banner = require("../model/bannerModel");
const Wishlist = require("../model/wishlistModel");
const bcrypt = require("bcrypt");
const randomstring1 = require("randomstring");

const crypto = require("crypto");
const ejs = require("ejs");
const pdf = require("html-pdf");
const fs = require("fs");
const path = require("path");

const Razorpay = require("razorpay");
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_APT_SECRET,
});

var options = {
    amount: 50000, // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11"
};
instance
    .orders
    .create(options, function (err, order) {
      
    });

const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
let sid;
// var number;

const nodemailer = require("nodemailer");
const {ObjectId} = require("mongodb");
const {ConversationContextImpl} = require(
    "twilio/lib/rest/conversations/v1/conversation"
);

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const createOrder = async (amount) => {
    const options = {
        amount: amount * 100, // amount in smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_" + Math
            .random()
            .toString(36)
            .substring(7)
    };
    const order = await instance
        .orders
        .create(options);
    return order;
};

const loadrazor = async (req, res,next) => {
    try {
        const {amount} = req.body;
        const order = await createOrder(amount);
        res.json({orderId: order.id});
    } catch (error) {
        next(error)
        console.log(error.message);
next(error);
      
    }
};

const postrazor = async (req, res,next) => {
    try {
        let serverOrder = req.body.orderId;
        let razorOrder = req.body.razorOrderid;
        let payid = req.body.payid;
        let signature = req.body.signature;

        keysecret = "zbbqBU4M6gfgvEaDjdudurN8";

        const hmac_sha256 = (data, secret) => {
            return crypto
                .createHmac("sha256", secret)
                .update(data)
                .digest("hex");
        };

        let generated_signature = hmac_sha256(serverOrder + "|" + payid, keysecret);

        if (generated_signature == signature) {
            res.json({message1: "Payment Successfull"});
            const orderData = await Order
                .findOne({})
                .sort({createdAt: -1})
                .limit(1);
            const updatedData = await Order.findByIdAndUpdate({
                _id: orderData._id
            }, {
                $set: {
                    payment_status: "completed",
                    order_status: "Placed"
                }
            });
        } else 
            res.json({message2: "Payment failed"});
        }
    catch (error) {
        next(error);
        console.log(error.message);
next(error);
    }
};

//for send mail

//for resetpassword

const sendResetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          requireTLS: true,
          debug: true,
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: "For Reset password",
            html: "<p>Hi " + name + ',please click here to <a href="http://127.0.0.1:3000/forget-' +
                    'password?token=' + token + '">Reset</a> your password.</p>'
        };
     
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("E-mail has been sent", info.response);
            }
        });
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const loadregister = async (req, res,next) => {
    try {
        res.render("registration");
    } catch (error) {
        console.log(error.meassage);
    }
};

const loadLogin = async (req,res,next) => {
    try {
        res.render("login");
    } catch (error) {
        next(error);
        console.log(error.message);
next(error);
    }
};

const insertUser = async (req, res, next) => {
    try {
         const emailExist = await User.findOne({ email: req.body.email });

         if (!emailExist) {
           const numberExist = await User.findOne({ mobile: req.body.mobile });
           if (!numberExist) {
             req.session.userData = req.body;

             if (req.session.userData) {
               if (req.session.userData.mobile) {
                 num2 = req.session.userData.mobile;
                 client.verify.v2.services
                   .create({ friendlyName: "CriptSea OTP Verification" })
                   .then((service) => {
                     sid = service.sid;
                     client.verify.v2
                       .services(service.sid)
                       .verifications.create({
                         to: `+91${num2}`,
                         channel: "sms",
                       })
                       .then((verification) =>
                         console.log(verification.status)
                       );
                   });
                 res.render("otpverification");
               } else {
                 res.render("registration", { message: "Number is invalid" });
               }
             } else {
               res.render("registration", {
                 message: "Enter all fields proper",
               });
             }
           } else {
             res.render("registration", {
               message2: "Account already exist!!",
             });
           }
         } else {
           res.render("registration", { message2: "E-mail already exist!!" });
         }
        
    } catch (error) {
        next(error);
        console.log(error.message);
next(error);
        
    }
   
   
};

const verifyLogin = async (req, res,next) => {
    try {
        const email = req.body.email;
        req.session.email = email;
        const password = req.body.password;
        const userData = await User.findOne({email: email});

        if (userData) {
            if (userData.is_verified == 1) {
                // req.session.mobile=number
                const passwordMatch = await bcrypt.compare(password, userData.password);
                if (passwordMatch) {
                    req.session.user_id = userData._id;
                    res.redirect("/");
                } else {
                    res.render("login", {message: "Password incorrect"});
                }
            } else {
                res.render("login", {message: "Create account first"});
            }
        } else {
            res.render("login", {message: "Invalid User data"});
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }

  
};

const otpPass = async (req,res,next) => {
    try {
        res.render("otpenter");
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const otpSend = async (req,res,next) => {
    try {
        req.session.numb = req.body.number;

        const userData = await User.findOne({mobile: req.session.numb});
        function sendTextMessage() {
           
            try {
                client
                    .verify
                    .v2
                    .services
                    .create({friendlyName: "CriptSea OTP Verification"})
                    .then((service) => {
                        sid = service.sid;
                        client
                            .verify
                            .v2
                            .services(service.sid)
                            .verifications
                            .create({to: `+91${req.session.numb}`, channel: "sms"})
                            .then((verification) => console.log(verification.status));
                    });
            } catch (error) {
                console.log(error);
            }
        }

        sendTextMessage();

        res.redirect("/otpverification");
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const loadHome = async (req,res,next) => {
    try {
        const categoryData = await Category.find({__v: 0});
        req.session.categoryData = categoryData;
        const productData = await Product
            .find({})
            .limit(10);
        req.session.productData = productData;
        const featuredProduct = await Product
            .find({})
            .limit(5);
        const productNumber = await Category.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "category",
                    as: "products"
                }
            }, {
                $project: {
                    _id: 1,
                    name: 1,
                    number_of_product: {
                        $size: "$products"
                    }
                }
            }
        ]);
   
        if (req.session.user_id) {
            const userData = req.session.user_id;
            const cartData = await Cart.findOne({user: ObjectId(userData)});
            const wishlistData = await Wishlist.findOne({ user: ObjectId(userData) });
             const bannerData = await Banner.find({});
            if (cartData && wishlistData) {
                const cartcount = cartData.products.length;
                const wishlistcount = wishlistData.products.length;

                res.render("home", {
                  categories: categoryData,
                  productsnum: productNumber,
                  user_in: userData,
                  product_data: productData,
                  featureproduct: featuredProduct,
                  wishlistcount,
                  cartcount,
                  bannerData,
                });
            } else if (cartData === null && wishlistData) {
                let cartcount = 0;
                const wishlistcount = wishlistData.products.length;
                res.render("home", {
                  categories: categoryData,
                  productsnum: productNumber,
                  user_in: userData,
                  product_data: productData,
                  featureproduct: featuredProduct,
                  wishlistcount,
                  cartcount,
                  bannerData,
                });
            } else if (wishlistData === null && cartData) {
                let wishlistcount = 0;
                const cartcount = cartData.products.length;
                res.render("home", {
                  categories: categoryData,
                  productsnum: productNumber,
                  user_in: userData,
                  product_data: productData,
                  featureproduct: featuredProduct,
                  wishlistcount,
                  cartcount,
                  bannerData,
                });
            } else if (cartData === null && wishlistData === null) {
                let cartcount = 0;
                let wishlistcount = 0;
                const userData = req.session.user_id;
                res.render("home", {
                  categories: categoryData,
                  productsnum: productNumber,
                  user_in: userData,
                  product_data: productData,
                  featureproduct: featuredProduct,
                  wishlistcount,
                  cartcount,
                  bannerData,
                });
            }
        } else {
              const bannerData = await Banner.find({});
          
            let cartcount = 0;
            let wishlistcount = 0;
            const userData = req.session.user_id;
            res.render("home", {
              categories: categoryData,
              productsnum: productNumber,
              user_in: userData,
              product_data: productData,
              featureproduct: featuredProduct,
              wishlistcount,
              cartcount,
              bannerData,
            });
        }

       
    } catch (error) {
        console.log(error.message);
next(error);
    }
}

const verifyMail = async (req,res,next) => {
    try {
        const updateInfo = await User.updateOne({
            _id: req.query.id
        }, {
            $set: {
                is_verified: 1
            }
        });
      
        res.render("email-verified");
    } catch (error) {
        console.log(error.message);
    }
};

const verifyotp = async (req,res,next) => {
    try {
       
        res.render("otpverification");
    } catch (error) {
        console.log(error.message);
    }
};

const grabnum = async (req,res,next) => {
    try {
        const gototp = req.body.gototp;
      
      
        if (req.session.userData) {
            num2 = req.session.userData.mobile;

            client
                .verify
                .v2
                .services(sid)
                .verificationChecks
                .create({to: `+91${num2}`, code: gototp})
                .then((verification_Check) => {
                    console.log(verification_Check);

                    if (verification_Check.status === "approved") {
                        if (req.session.userData) {
                            (async function userInsert() {
                                const spassword = await securePassword(req.session.userData.password);
                                const user = new User(
                                    {name: req.session.userData.name, email: req.session.userData.email, mobile: req.session.userData.mobile, password: spassword, is_verified: 1}
                                );

                                const userData = await user.save();
                                req.session.user_id = userData._id;
                                res.redirect("/");
                            
                            })();
                        }
                    } else {
                        res.render("registration", {message: "Verification failed"});
                    }
                });
        } else if (req.session.numb) {
            const userData = await User.findOne({mobile: req.session.numb});
            num = req.session.numb;
         

            client
                .verify
                .v2
                .services(sid)
                .verificationChecks
                .create({to: `+91${num}`, code: gototp})
                .then((verification_Check) => {
                    console.log(verification_Check);

                    if (verification_Check.status === "approved") {
                        req.session.user_id = userData._id;
                        res.redirect("/");
                    } else {
                        res.render("registration", {message: "Verification failed"});
                    }
                });
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const forgetLoad = async (req,res,next) => {
    try {
        if (req.session.user_id) {
            res.redirect("/");
        } else {
            res.render("forget");
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const forgetPass = async (req,res,next) => {
    try {
        const userData = await User.findOne({email: req.body.email});
    
        if (userData) {
            if (userData.is_verified === 0) {
                res.render("forget", {message: "Verify your mail"});
            } else {
                const randomstring = randomstring1.generate();
                const updatedData = await User.updateOne({
                    email: req.body.email
                }, {
                    $set: {
                        token: randomstring
                    }
                });
              

                sendResetPasswordMail(userData.name, userData.email, randomstring);
               
                res.render(
                    "forget",
                    {message: "PLease check your mail to reset your password"}
                );
            }
        } else {
            res.render("forget", {message: "User email incorrect"});
        }
    } catch (error) {
        console.log(error.meassage);
    }
};

const forgetpasswordload = async (req,res,next) => {
    try {
    
        const token = req.query.token;
     
        const tokenData = await User.findOne({token: token});
    
        if (tokenData) {
            res.render("forget-password", {user_id: tokenData._id});
        } else {
            res.render("404", {message: "Token invalid"});
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const resetPassword = async (req,res,next) => {
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;

        const secure_password = await securePassword(password);

        const updatedData = await User.findByIdAndUpdate({
            _id: user_id
        }, {
            $set: {
                password: secure_password,
                token: ""
            }
        });
        res.redirect("/register");
      
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const loadShop = async (req,res,next) => {
    try {
        let page = 1
        if (req.query.page) {
            page = req.query.page;
        }
        if (req.session.user_id) {
            const limit = 6;
            const categoryData = await Category.find({});
            const productData = await Product
                .find({active:true})
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();
            const count = await Product
                .find({})
                .countDocuments()
          
            const userData = req.session.user_id;
            const cartData = await Cart.findOne({user: ObjectId(userData)});
            const wishlistData = await Wishlist.findOne({ user: ObjectId(userData) });
           
            

            if (cartData && wishlistData) {
                const cartcount = cartData.products.length;
                const wishlistcount = wishlistData.products.length;

                res.render("shop", {
                    user_in: userData,
                    categories: categoryData,
                    product_data: productData,
                    cartcount,
                    wishlistcount,
                    totalPages: Math.ceil(count / limit),
                    currentPage: page,
                    
                });
            } else if (cartData === null && wishlistData) {
                let cartcount = 0;
                const wishlistcount = wishlistData.products.length;
                res.render("shop", {
                    user_in: userData,
                    categories: categoryData,
                    product_data: productData,
                    cartcount,
                    wishlistcount,
                    totalPages: Math.ceil(count / limit),
                    currentPage: page
                });
            } else if (wishlistData === null && cartData) {
                const cartcount = cartData.products.length;
                let wishlistcount = 0;
                res.render("shop", {
                    user_in: userData,
                    categories: categoryData,
                    product_data: productData,
                    cartcount,
                    wishlistcount,
                    totalPages: Math.ceil(count / limit),
                    currentPage: page
                });
            } else if (cartData === null && wishlistData === null) {
                let cartcount = 0;
                let wishlistcount = 0;
                const userData = req.session.user_id;
                res.render("shop", {
                    user_in: userData,
                    categories: categoryData,
                    product_data: productData,
                    cartcount,
                    wishlistcount,
                    totalPages: Math.ceil(count / limit),
                    currentPage: page
                });
            }
        } else {
            const limit = 6;
            const categoryData = await Category.find({});
            const productData = await Product
                .find({active:true})
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();
            const count = await Product
                .find({})
                .countDocuments()
            let cartcount = 0;
            let wishlistcount = 0;
            let user_in = null;

            res.render("shop", {
                user_in,
                categories: categoryData,
                product_data: productData,
                cartcount,
                wishlistcount,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            });
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const loadContact = async (req,res,next) => {
    try {
        if (req.session.user_id) {
            const userData = req.session.user_id;
            const categoryData = await Category.find({});
            const cartData = await Cart.findOne({user: ObjectId(userData)});
            const wishlistData = await Wishlist.findOne({user: ObjectId(userData)});
            if (cartData && wishlistData) {
                const cartcount = cartData.products.length;
                const wishlistcount = wishlistData.products.length;

                res.render("contact", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            } else if (cartData === null && wishlistData) {
                let cartcount = 0;
                const wishlistcount = wishlistData.products.length;
                res.render("contact", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            } else if (wishlistData === null && cartData) {
                const cartcount = cartData.products.length;
                let wishlistcount = 0;
                res.render("contact", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            } else if (cartData === null && wishlistData === null) {
                let cartcount = 0;
                let wishlistcount = 0;
                const userData = req.session.user_id;
                res.render("contact", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            }
        } else {
            const categoryData = await Category.find({});
            const productData = await Product.find({ active: true });
            let cartcount = 0;
            let wishlistcount = 0;
            let user_in = null;

            res.render("contact", {
                user_in,
                categories: categoryData,
                product_data: productData,
                cartcount,
                wishlistcount
            });
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const loadDetail = async (req,res,next) => {
    try {
     
            const productData = await Product.findById({
              _id: req.query.id,
              active: true,
            });
          
            const userData = req.session.user_id;
            const categoryData = await Category.find({});
            const cartData = await Cart.findOne({user: ObjectId(userData)});
            const wishlistData = await Wishlist.findOne({user: ObjectId(userData)});
            // let reviweData = await productData.map()

            if (cartData && wishlistData) {
                const cartcount = cartData.products.length;
                const wishlistcount = wishlistData.products.length;

                res.render("detail", {
                    user_in: userData,
                    categories: categoryData,
                    products: productData,
                    cartcount,
                    wishlistcount
                });
            } else if (cartData === null && wishlistData) {
                let cartcount = 0;
                const wishlistcount = wishlistData.products.length;
                res.render("detail", {
                    user_in: userData,
                    categories: categoryData,
                    products: productData,
                    cartcount,
                    wishlistcount
                });
            } else if (wishlistData === null && cartData) {
                let wishlistcount = 0;
                const cartcount = cartData.products.length;
                res.render("detail", {
                    user_in: userData,
                    categories: categoryData,
                    products: productData,
                    cartcount,
                    wishlistcount
                });
            } else if (cartData === null && wishlistData === null) {
                let cartcount = 0;
                let wishlistcount = 0;
                const userData = req.session.user_id;
                res.render("detail", {
                    user_in: userData,
                    categories: categoryData,
                    products: productData,
                    cartcount,
                    wishlistcount
                });
            }
        
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const userLogout = async (req,res,next) => {
    try {
        req
            .session
            .destroy();
        res.redirect("/");
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const viewUserprof = async (req,res,next) => {
    try {
      
        if (req.session.user_id) {
             console.log("reached here", 2);
            const id = req.session.user_id;
            const userData = await User.findById({_id: id})
            const categoryData = await Category.find({});
            const cartData = await Cart.findOne({user: ObjectId(userData)})
            const wishlistData = await Wishlist.findOne({user: ObjectId(userData)})

            if (cartData && wishlistData) {
                const cartcount = cartData.products.length;
                const wishlistcount = wishlistData.products.length;

            
                res.render("userview", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            } else if (cartData === null && wishlistData) {
                let cartcount = 0;
                const wishlistcount = wishlistData.products.length;
                res.render("userview", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            } else if (wishlistData === null && cartData) {
                let wishlistcount = 0;
                const cartcount = cartData.products.length;
                res.render("userview", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            } else if (cartData === null && wishlistData === null) {
               
                let cartcount = 0;
                let wishlistcount = 0;
               
                res.render("userview", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            }
        } else {
            const categoryData = await Category.find({});
            const productData = await Product.find({ active: true });
            let cartcount = 0;
            let wishlistcount = 0;
            let user_in = null;

            res.render("contact", {
                user_in,
                categories: categoryData,
                product_data: productData,
                cartcount,
                wishlistcount
            });
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const userEdit = async (req,res,next) => {
    try {
        if (req.session.user_id) {
            const id = req.session.user_id;
            const userData = await User.findById({_id: id});
            const categoryData = await Category.find({});
            const cartData = await Cart.findOne({user: ObjectId(userData)});
            const wishlistData = await Wishlist.findOne({user: ObjectId(userData)});

            if (cartData && wishlistData) {
                const cartcount = cartData.products.length;
                const wishlistcount = wishlistData.products.length;

             
                res.render("edit-user", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            } else if (cartData === null && wishlistData) {
                let cartcount = 0;
                const wishlistcount = wishlistData.products.length;
                res.render("edit-user", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            } else if (wishlistData === null && cartData) {
                let wishlistcount = 0;
                const cartcount = cartData.products.length;
                res.render("edit-user", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            } else if (cartData === null && wishlistData === null) {
                let cartcount = 0;
                let wishlistcount = 0;
                const userData = req.session.user_id;
                res.render("edit-user", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            }
        } else {
            const categoryData = await Category.find({});
            const productData = await Product.find({ active: true });
            let cartcount = 0;
            let wishlistcount = 0;
            let user_in = null;

            res.render("edit-user", {
                user_in,
                categories: categoryData,
                product_data: productData,
                cartcount,
                wishlistcount
            });
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const updateUser = async (req,res,next) => {
    try {
        if (req.session.user_id) {
            const id = req.session.user_id;
            const userData = await User.findById({_id: id});
            const categoryData = await Category.find({});

        

            const addressData = {
                address1: req.body.address1,
                country: req.body.country,
                state: req.body.state,
                city: req.body.city,
                street: req.body.street,
                postalCode: req.body.pin
            };
         

            const updatedUserData = await User.findByIdAndUpdate({
                _id: id
            }, {
                $set: {
                    mobile: req.body.mobile,
                    email: req.body.email,
                    name: req.body.name,
                    address: {
                        ...addressData
                    }
                }
            });
            // {$set: { }})
          

            res.redirect("/userview");
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const get_add_address = async (req,res,next) => {
    try {
        if (req.session.user_id) {
            const id = req.session.user_id;
            const userData = await User.findById({_id: id});
            const categoryData = await Category.find({});
            const cartData = await Cart.findOne({user: ObjectId(userData)});
            const wishlistData = await Wishlist.findOne({user: ObjectId(userData)});

            if (cartData && wishlistData) {
                const cartcount = cartData.products.length;
                const wishlistcount = wishlistData.products.length;

                res.render("add-address", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            } else if (cartData === null && wishlistData) {
                let cartcount = 0;
                const wishlistcount = wishlistData.products.length;
                res.render("add-address", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            } else if (wishlistData === null && cartData) {
                let wishlistcount = 0;
                const cartcount = cartData.products.length;
                res.render("add-address", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            } else if (cartData === null && wishlistData === null) {
                let cartcount = 0;
                let wishlistcount = 0;
                const userData = req.session.user_id;
                res.render("add-address", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            }
        } else {
            const categoryData = await Category.find({});
            const productData = await Product.find({ active: true });
            let cartcount = 0;
            let wishlistcount = 0;
            let user_in = null;

            res.render("add-address", {
                user_in,
                categories: categoryData,
                product_data: productData,
                cartcount,
                wishlistcount
            });
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const add_address = async (req,res,next) => {
    try {
        if (req.session.user_id) {
            const id = req.session.user_id;
            const userData = await User.findById({_id: id});
            const categoryData = await Category.find({});

           

            const addressData = {
                name: req.body.name,
                address1: req.body.address1,
                country: req.body.country,
                state: req.body.state,
                city: req.body.city,
                street: req.body.street,
                mobile: req.body.mobile,
                postalCode: req.body.pin
            };
           

            const updatedUserData = await User.findByIdAndUpdate({
                _id: id
            }, {
                $push: {
                    address: {
                        ...addressData
                    }
                }
            });
            // {$set: { }})
         

            res.redirect("/userview");
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const categorywise_product = async (req,res,next) => {
    try {
        let page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        if (req.session.user_id) {
            const limit = 6;
            const categoryData = await Category.find({});
            const userData = req.session.user_id;
            const category_Data = await Category.findById({_id: req.query.id});
            const productData = await Product
                .find({
                    category: {
                        $in: category_Data
                    }
                })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();
            const count = await Product
                .find({
                    category: {
                        $in: category_Data
                    }
                })
                .countDocuments()
            const cartData = await Cart.findOne({user: ObjectId(userData)});
            const wishlistData = await Wishlist.findOne({user: ObjectId(userData)});

            if (cartData && wishlistData) {
                const cartcount = cartData.products.length;
                const wishlistcount = wishlistData.products.length;

                res.render("shop", {
                    user_in: userData,
                    product_data: productData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount,
                    totalPages: Math.ceil(count / limit),
                    currentPage: page
                });
            } else if (cartData === null && wishlistData) {
                const wishlistcount = wishlistData.products.length;
                res.render("shop", {
                    user_in: userData,
                    product_data: productData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount,
                    totalPages: Math.ceil(count / limit),
                    currentPage: page
                });
            } else if (wishlistData === null && cartData) {
                const cartcount = cartData.products.length;
                res.render("shop", {
                    user_in: userData,
                    product_data: productData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount,
                    totalPages: Math.ceil(count / limit),
                    currentPage: page
                });
            } else if (cartData === null && wishlistData === null) {
                let cartcount = 0;
                let wishlistcount = 0;
                const userData = req.session.user_id;
                res.render("shop", {
                    user_in: userData,
                    product_data: productData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount,
                    totalPages: Math.ceil(count / limit),
                    currentPage: page
                });
            }
        } else {
            const limit = 6;
            const categoryData = await Category.find({});
            const category_Data = await Category.findById({_id: req.query.id});
            const productData = await Product
                .find({
                    category: {
                        $in: category_Data
                    }
                })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();
            const count = await Product
                .find({
                    category: {
                        $in: category_Data
                    }
                })
                .countDocuments();
            let cartcount = 0;
            let wishlistcount = 0;
            let user_in = null;
            res.render("shop", {
                user_in,
                product_data: productData,
                categories: categoryData,
                cartcount,
                wishlistcount,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            });
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const loadCart = async (req,res,next) => {
    try {
        const categoryData = await Category.find({});

        if (req.session.user_id) {
            const userData = await User.findById({_id: req.session.user_id});
            const cartData = await Cart.findOne({user: ObjectId(userData)});
            const wishlistData = await Wishlist.findOne({user: ObjectId(userData)});
            if (cartData && wishlistData) {
                const value = await cartData.products;
                const prodata = value.map((n) => n.item);

                const productData = await Product.find({active:true,
                    _id: {
                        $in: prodata
                    }
                });
              

                const cartcount = cartData.products.length;
                const wishlistcount = wishlistData.products.length;
                res.render("cart", {
                    user_in: userData,
                    categories: categoryData,
                    cartproducts: productData,
                    value,
                    cartcount,
                    wishlistcount
                });
            } else if (cartData === null && wishlistData) {
                let productData = 0;
                let value = null;
                let cartcount = 0;
                const wishlistcount = wishlistData.products.length;
                res.render("cart", {
                    user_in: userData,
                    categories: categoryData,
                    cartproducts: productData,
                    value,
                    cartcount,
                    wishlistcount
                });
            } else if (wishlistData === null && cartData) {
                const value = await cartData.products;
                const prodata = value.map((n) => n.item);

                const productData = await Product.find({
                  _id: {
                    $in: prodata,
                  },
                  active: true,
                });

                const cartcount = cartData.products.length;
                let wishlistcount = 0;
                res.render("cart", {
                    user_in: userData,
                    categories: categoryData,
                    cartproducts: productData,
                    value,
                    cartcount,
                    wishlistcount
                });
            } else if (cartData === null && wishlistData === null) {
              
                let cartcount = 0;
                let wishlistcount = 0;
                let productData = 0;
                let value = null;
             
                res.render("cart", {
                    user_in: userData,
                    categories: categoryData,
                    cartproducts: productData,
                    cartcount,
                    wishlistcount
                });
            }
        } else {
            const categoryData = await Category.find({});
            const productData = await Product.find({ active: true });
            let cartcount = 0;
            let wishlistcount = 0;
            let user_in = null;
            let value = null;

            res.render("cart", {
                user_in,
                categories: categoryData,
                cartproducts: productData,
                value,
                cartcount,
                wishlistcount
            });
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const addtocart = async (req,res,next) => {
    try {
        if (req.session.user_id) {
            const id = req.params.proId;
            const productData = await Product.findById({
              _id: id,
              active: true,
            });
         
            const price = productData.price;

            const userData = await User.findById(req.session.user_id);
            const cartData = await Cart.findOne({ user: ObjectId(userData) });
         
            if (cartData) {
             
                let cartproduct = await Cart.findOne({
                    user: req.session.user_id,
                    products: {
                        $elemMatch: {
                            item: id,
                        },
                    },
                });
                if (cartproduct === null) {
                    if (productData.in_stock == 0) {
                        res.json({ success: false });
                    } else {
                        const cartitem = {
                            item: ObjectId(productData),
                            quantity: 1,
                            pricetotal: price,
                        };
                        const updatedcartData = await Cart.updateOne(
                            {
                                user: ObjectId(userData),
                            },
                            {
                                $push: {
                                    products: {
                                        ...cartitem,
                                    },
                                },
                            }
                        );
                      

                        res.json({ success: true });
                    }
                } else {
                    const cartData = await Cart.findOneAndUpdate(
                        {
                            user: req.session.user_id,
                            "products.item": id,
                        },
                        {
                            $inc: {
                                "products.$.quantity": 1,
                            },
                        }
                    );
                   
                    res.json({ message: "Item added again" });
                }
            } else {
              
                const cartdata = new Cart({
                    user: userData,
                    products: [
                        {
                            item: ObjectId(productData),
                            quantity: 1,
                            pricetotal: price,
                        },
                    ],
                });
                const cartData = await cartdata.save();
            
                res.json({ message: "Item added to Cart" });
            }

        } else { 
            res.json({message2:"Sign in to accesss your cart"})
        }
        

    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const itemdelete = async (req,res,next) => {
    try {
        id = req.query.id;
      
        const userData = await User.findById({_id: req.session.user_id});
      
        await Cart.updateOne({
            user: ObjectId(userData)
        }, {
            $pull: {
                products: {
                    item: req.query.id
                }
            }
        });

        res.redirect("/cart");
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const increment = async (req,res,next) => {
    try {
    

        const id = req.query.proId;
        const stock = req.query.stock;
        productData = await Product.findById({ _id: id, active: true });
        let cart = await Cart.findOne({user: req.session.user_id, "products.item": id});
        let quantity = await cart
            .products
            .find((p) => p.item == id)
            .quantity;
        let price = quantity * productData.price;

        const updatedcart = await Cart.findOneAndUpdate({
            user: req.session.user_id,
            "products.item": id
        }, {
            $set: {
                "products.$.pricetotal": price
            }
        });

        productData = await Cart.findOne(
            {user: req.session.user_id, "products.item": id}
        );
        let updatedPrice = productData
            .products
            .find((p) => p.item == id)
            .pricetotal;

        // productDat = await Cart.findOne({user:req.session.user_id}) let
        prodata = productData.products;
        subtotal = prodata.map((p) => p.pricetotal);
      
        let sum = subtotal.reduce((sum, num) => sum + num);

        if (quantity < stock) {
            let cartData = await Cart.findOneAndUpdate({
                user: req.session.user_id,
                "products.item": id
            }, {
                $inc: {
                    "products.$.quantity": 1
                }
            })
            res.json({success: true, updatedPrice, sum});

        } else if (quantity >= stock) {
            res.json({success: false, updatedPrice, sum});

        }

    } catch (error) {
        console.log(error.message);
next(error);
    }
};
const decrement = async (req,res,next) => {
    try {
        let id = req.params.cartquant;
        productData = await Product.findById({ _id: id, active: true });

        let cartData = await Cart.findOne(
            {user: req.session.user_id, "products.item": id}
        );

        if (cartData) {
            let product = cartData
                .products
                .find((p) => p.item == id);

            if (product.quantity > 1) {
                await Cart.findOneAndUpdate({
                    user: req.session.user_id,
                    "products.item": id
                }, {
                    $inc: {
                        "products.$.quantity": -1
                    }
                });
                let cart = await Cart.findOne({user: req.session.user_id, "products.item": id});
                let quantity = await cart
                    .products
                    .find((p) => p.item == id)
                    .quantity;
                let price = quantity * productData.price;

                const updatedcart = await Cart.findOneAndUpdate({
                    user: req.session.user_id,
                    "products.item": id
                }, {
                    $set: {
                        "products.$.pricetotal": price
                    }
                });

                productData = await Cart.findOne(
                    {user: req.session.user_id, "products.item": id}
                );
                let updatedPrice = productData
                    .products
                    .find((p) => p.item == id)
                    .pricetotal;

                prodata = productData.products;
                subtotal = prodata.map((p) => p.pricetotal);
               
                let sum = subtotal.reduce((sum, num) => sum + num);

                res.json({updatedPrice, sum});
            }
        }
        res.redirect("/cart");
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const updatecart = async (req,res,next) => {
    try {
        res.redirect("/cart");
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const addtowishlist = async (req,res,next) => {
    try {
        if (req.session.user_id) {
            id = req.query.proId;
            const productData = await Product.findOne({
              id: id,
              active: true,
            });

            const userData = await User.findById(req.session.user_id);

            const wishlistData = await Wishlist.findOne({
                user: req.session.user_id,
            });

            if (wishlistData) {
                let wishlistproduct = await Wishlist.findOne({
                    user: req.session.user_id,
                    products: {
                        $elemMatch: {
                            item: id,
                        },
                    },
                });
                if (wishlistproduct === null) {
                    const wishlistData = await Wishlist.updateOne(
                        {
                            user: req.session.user_id,
                        },
                        {
                            $push: {
                                products: {
                                    item: ObjectId(productData),
                                },
                            },
                        }
                    );
                    res.json({ success: true });
                } else {
                    res.json({ message1: "Item already added to your wishlist" });
                }
            } else {
                const wishdata = new Wishlist({
                    user: ObjectId(userData),
                    products: [
                        {
                            item: ObjectId(productData),
                        },
                    ],
                });
                const wishlistData = await wishdata.save();
                res.json({ success: true });
            }

        } else { 
            res.json({ message2:"You need to sign in first" })
        }
       
       
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const loadWishlist = async (req,res,next) => {
    try {
        if (req.session.user_id) {
            const userData = await User.findById(req.session.user_id);
            const categoryData = await Category.find({});
            const wishlistData = await Wishlist.findOne({user: req.session.user_id});
            const cartData = await Cart.findOne({user: ObjectId(userData)});

            if (cartData && wishlistData) {
                const cartcount = cartData.products.length;
                const wishlistcount = wishlistData.products.length;

                const products = await wishlistData.products;

                const listproduct = products.map((n) => n.item);
                const wishlistproducts = await Product.find({
                  _id: {
                    $in: listproduct,
                  },
                  active: true,
                });
                

                res.render("wishlist", {
                    user_in: userData,
                    categories: categoryData,
                    wishlistproducts,
                    cartcount,
                    wishlistcount
                });
            } else if (cartData === null && wishlistData) {
                let cartcount = 0;

                const wishlistcount = wishlistData.products.length;

                const products = await wishlistData.products;

                const listproduct = products.map((n) => n.item);
                const wishlistproducts = await Product.find({
                  _id: {
                    $in: listproduct,
                  },
                  active: true,
                });
                res.render("wishlist", {
                    user_in: userData,
                    categories: categoryData,
                    wishlistproducts,
                    cartcount,
                    wishlistcount
                });
            } else if (wishlistData === null && cartData) {
                let wishlistcount = 0;
                const cartcount = cartData.products.length;
                let wishlistproducts = 0;

                res.render("wishlist", {
                    user_in: userData,
                    categories: categoryData,
                    wishlistproducts,
                    cartcount,
                    wishlistcount
                });
            } else if (cartData === null && wishlistData === null) {
                let cartcount = 0;
                let wishlistcount = 0;
                let wishlistproducts = 0;
                let value = null;
               
                res.render("wishlist", {
                    user_in: userData,
                    categories: categoryData,
                    wishlistproducts,
                    cartcount,
                    wishlistcount
                });
            }
        } else {
            const categoryData = await Category.find({});
            const productData = await Product.find({ active: true });
            let cartcount = 0;
            let wishlistcount = 0;
            let user_in = null;
            let value = null;

            res.render("wishlist", {
                user_in,
                categories: categoryData,
                cartproducts: productData,
                value,
                cartcount,
                wishlistcount
            });
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const wishlistitemdelete = async (req,res,next) => {
    try {
        id = req.query.id;
     
        const userData = await User.findById({_id: req.session.user_id});
     
        await Wishlist.updateOne({
            user: ObjectId(userData)
        }, {
            $pull: {
                products: {
                    item: req.query.id
                }
            }
        });

        res.redirect("/wishlist");
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const loadCheckout = async (req,res,next) => {
    try {
        if (req.session.user_id) {
            const userData = await User.findById(req.session.user_id)
            const categoryData = await Category.find({});
            const productData = await Product.find({ active: true });
            const addressdata = await userData.address;
            const cartData = await Cart.findOne({user: ObjectId(userData)});
            const availableCoupons = await Coupon.find({
                couponcode: {
                    $nin: userData.couponUsed
                }
            });
            if (cartData.products.length == 0) {
                res.redirect("/cart");
            } else {
                const wishlistData = await Wishlist.findOne({user: ObjectId(userData)});
                const cartcount = cartData.products.length;
                const wishlistcount = wishlistData.products.length;
                const value = await cartData.products;
                const prodata = value.map((n) => n.item);
                const productDatas = await Product.find({
                  _id: {
                    $in: prodata,
                  },
                  active: true,
                });
                let walletData = userData
                    .wallet

                    res
                    .render("checkout", {
                        user_in: userData,
                        categories: categoryData,
                        addressdata,
                        productDatas,
                        value,
                        cartcount,
                        wishlistcount,
                        walletData,
                        availableCoupons
                    });
            }
        } else {
            res.redirect("/cart");
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const postcheckout = async (req,res,next) => {
    try {
      
        let walletUsed = req.body.walletUsed;
        let couponUsed = req.body.couponUsed;
        let subtotal = req.body.subtotal;
       req.session.subtotal = subtotal;
        req.session.walletUsed = walletUsed;
        req.session.couponUsed = couponUsed;
      
       
        
        gotaddressId = req.body.address;
        const paymmethod = req.body.payment_method;
        const couponCode = req
            .body
            .couponCode
            console
            .log(couponCode, 'this')

        const userData = await User.findById(req.session.user_id);
        const addressData = await userData
            .address
            .find((p) => p._id == gotaddressId);
        let wallet = userData
            .wallet
            console
            .log(addressData, "addressdata");
        const cartData = await Cart.findOne({user: ObjectId(userData)});
        const value = cartData.products;
        let total = Number(req.body.total);
        req.session.totalamount = total;

        if (paymmethod == "cash_on_delivery") {
            const orders = await new Order({
                userId: ObjectId(userData),
                products: value,
                total: total,
                address: addressData,
                payment_method: paymmethod,
                payment_status: "pending",
                order_status: "Placed",
                created_date: Date()
            });
            const orderData = await orders.save();
            res.json({success: "cash_on_delivery"});
        } else if (paymmethod == "UPI") {
            const orders = await new Order({
                userId: ObjectId(userData),
                products: value,
                total: total,
                address: addressData,
                payment_method: paymmethod,
                payment_status: "Placed",
                created_date: Date()
            });
            const orderData = await orders.save();
            res.json({success: "UPI"});
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const neworderaddress = async (req,res,next) => {
    try {
        if (req.session.user_id) {
            const id = req.session.user_id;
            const userData = await User.findById({_id: id});
            const categoryData = await Category.find({});

            const addressData = {
                name: req.body.name,
                address1: req.body.address1,
                country: req.body.country,
                state: req.body.state,
                city: req.body.city,
                street: req.body.street,
                mobile: req.body.mobile,
                postalCode: req.body.pin
            };
         

            const updatedUserData = await User.findByIdAndUpdate({
                _id: id
            }, {
                $push: {
                    address: {
                        ...addressData
                    }
                }
            });

           

            res.redirect("/checkout");
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const couponApply = async (req,res,next) => {
    try {
        const userData = await User.findById({_id: req.session.user_id});
        const body = req.params.content;
       
        const coupon = body.toUpperCase();

        const existCoupon = await Coupon.findOne({couponcode: coupon});

        if (existCoupon) {
            const cartData = await Cart.findOne({user: req.session.user_id});
            const userCheck = await User.findOne({couponUsed: coupon})
            req.session.couponApplied = coupon;

            if (userCheck) {
                res.json({message2: "Coupon already used"});
            } else {
                let products = cartData.products;
                let prices = products.map((n) => n.pricetotal);
                let sum = prices.reduce((sum, num) => sum + num);
                sum = parseFloat(sum);

                if (existCoupon.minpurchase <= sum) {
                    const percentage = existCoupon.discount;
                    const amount = sum;

                    let discountAmount = (percentage / 100) * amount;

                    if (discountAmount <= existCoupon.maxlimit) {
                        const discountedPrice = Math.round(amount - discountAmount);
                        const updateTotal = Cart.findOneAndUpdate({
                            userId: req.session.user_id
                        }, {
                            $set: {
                                total: discountedPrice
                            }
                        });
                        res.json({discountedPrice, discountAmount});

                    } else {
                        const discountedPrice = Math.round(amount - existCoupon.maxlimit);
                        const updateTotal = Cart.findOneAndUpdate({
                            userId: req.session.user_id
                        }, {
                            $set: {
                                total: discountedPrice
                            }
                        });
                        discountAmount = existCoupon.maxlimit;
                        res.json({discountedPrice, discountAmount});

                    }
                } else {
                    res.json({
                        message: "Purchase atleast for Rs" + existCoupon.minpurchase
                    });
                }
            }

        } else {
            res.json({ messageinvalid:"Enter a valid coupon"})
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const addToWallet = async (req,res,next) => {
    try {
       
        if (req.session.user_id) {
            const prodId = req.body.prodId;
        
            const orderId = req.body.orderId;
            const orderProdata = await Order.findOne({
                _id: orderId
            }, {
                products: {
                    $elemMatch: {
                        _id: ObjectId(prodId)
                    }
                }
            });
            let price = orderProdata
                .products[0]
                .pricetotal;

            let userData = await User.findById({_id: req.session.user_id});
            let wallet = userData.wallet;
            if (userData.wallet == null) {
                await User.findByIdAndUpdate({
                    _id: req.session.user_id
                }, {
                    $set: {
                        wallet: price
                    }
                });
            } else {
                await User.findByIdAndUpdate({
                    _id: req.session.user_id
                }, {
                    $set: {
                        wallet: wallet + price
                    }
                });
            }
            res.json({success: true});
        }
    } catch (error) {}
};

const walletUse = async (req,res,next) => {
    try {
        let total = req.body.total;
      let walletUsed = req.body.walletUsed;
      
      
        const userData = await User.findById({_id: req.session.user_id});
        let wallet = userData.wallet;
        
        if (wallet == 0) {
            res.json({message1: "Your wallet is empty"});
        } else {
            if (wallet <= total) {
                total = total - wallet;
                let walletNew = 0;
                let discount = wallet;
                await User.findByIdAndUpdate({
                    _id: req.session.user_id
                }, {
                    $set: {
                        wallet: walletNew
                    }
                });
                res.json({success: true, total, discount, walletNew});
            } else if (wallet > total) {
                if (total == 0) {
                    res.json({message2: "You already used wallet for this purchase"});
                } else {
                    let updatedWallet = wallet - total;

                    await User.findByIdAndUpdate({
                        _id: req.session.user_id
                    }, {
                        $set: {
                            wallet: updatedWallet
                        }
                    });

                    let totalFinal = 0;
                    res.json({success: false, totalFinal, updatedWallet, total});
                }
            }
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const placedorder = async (req,res,next) => {
    try {
    
        let couponUsed = req.session.couponApplied;
        let couponReduced = req.session.couponUsed;
        let walletReduced = req.session.walletUsed;
        let subtotal = req.session.subtotal
        let total = req.session.totalamount;

        if (req.session.user_id) {

            const userData = req.session.user_id;
            const categoryData = await Category.find({});
            const cartData = await Cart.findOne({user: ObjectId(userData)});
            const wishlistData = await Wishlist.findOne({user: ObjectId(userData)});
            const orderData = await Order
                .findOne({})
                .sort({createdAt: -1})
                .limit(1);

            const value = await orderData.products;
            const prodata = value.map((n) => n.item);
            const productData = await Product.find({
              _id: {
                $in: prodata,
              },
              active: true,
            });

            const addressdata = orderData.address;
            const addressdat = await User.findById(
                {_id: req.session.user_id, "address._id": addressdata}
            );

            let addressdata1 = addressdat.address[0];
            if (cartData.products.length == 0) {
                res.redirect("/cart");
            } else {
                if (req.headers.referer && req.headers.referer.endsWith('/checkout')) {
                    if (cartData && wishlistData) {
                        const cartcount = cartData.products.length;
                        const wishlistcount = wishlistData.products.length;

                        res.render("orderplaced", {
                            user_in: userData,
                            categories: categoryData,
                            cartcount,
                            wishlistcount,
                            addressdata1,
                            value,
                            productData,
                            orderData,
                            couponReduced,
                            walletReduced,
                            subtotal,
                            total,
                        });

                        await User.findByIdAndUpdate(
                            {
                                _id: req.session.user_id,
                            },
                            {
                                $push: {
                                    couponUsed: couponUsed,
                                },
                            }
                        );

                        const deleteCartData = await Cart.updateMany(
                            {
                                user: req.session.user_id,
                            },
                            {
                                $unset: {
                                    products: " ",
                                },
                            },
                            { multi: true }
                        );

                        const updatedStockValues = [];

                        for (let i = 0; i < productData.length; i++) {
                            const updatedStock =
                                productData[i].in_stock - value[i].quantity;
                            updatedStockValues.push(updatedStock);
                        }
                        for (let i = 0; i < productData.length; i++) {
                            const item = productData[i]._id;
                            const updatedStock = updatedStockValues[i];
                            await Product.updateOne(
                                {
                                    _id: item,
                                },
                                {
                                    $set: {
                                        in_stock: updatedStock,
                                    },
                                }
                            );
                        }
                    } else if (wishlistData === null && cartData) {
                        const value = await cartData.products;
                        const prodata = value.map((n) => n.item);

                        const productData = await Product.find({
                          _id: {
                            $in: prodata,
                          },
                          active: true,
                        });

                        const cartcount = cartData.products.length;
                        let wishlistcount = 0;
                        res.render("orderplaced", {
                            user_in: userData,
                            categories: categoryData,
                            cartcount,
                            wishlistcount,
                        });
                        const deleteCartData = await Cart.updateMany(
                            {
                                user: req.session.user_id,
                            },
                            {
                                $unset: {
                                    products: " ",
                                },
                            },
                            { multi: true }
                        );
                    }
                } else { 
                    res.redirect('/shop')
                }
                 
             }

           
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const loadorderhistory = async (req,res,next) => {
    try {
      

        if (req.session.user_id) {

            const userData = req.session.user_id;
            const categoryData = await Category.find({});
            const cartData = await Cart.findOne({user: ObjectId(userData)});
            const wishlistData = await Wishlist.findOne({user: ObjectId(userData)});
            const orderData = await Order
                .find({userId: req.session.user_id})
                .sort({createdAt: -1});
          

            if (cartData && wishlistData) {
                const cartcount = cartData.products.length;
                const wishlistcount = wishlistData.products.length;

                res.render("orderhistory", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount,
                    orderData
                });
            } else if (cartData === null && wishlistData) {
                let cartcount = 0;
                const wishlistcount = wishlistData.products.length;
                res.render("orderhistory", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount,
                    orderData
                });
            } else if (wishlistData === null && cartData) {
                const cartcount = cartData.products.length;
                let wishlistcount = 0;
                res.render("orderhistory", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount,
                    orderData
                });
            } else if (cartData === null && wishlistData === null) {
                let cartcount = 0;
                let wishlistcount = 0;
                const userData = req.session.user_id;
                res.render("orderhistory", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount,
                    orderData
                });
            }
        } else {
            const categoryData = await Category.find({});
            const productData = await Product.find({ active: true });
            let cartcount = 0;
            let wishlistcount = 0;
            let user_in = null;

            res.render("orderhistory", {
                user_in,
                categories: categoryData,
                product_data: productData,
                cartcount,
                wishlistcount
            });
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const loadorderview = async (req,res,next) => {
    try {
        if (req.session.user_id) {
            const id = req.session.user_id;
            const userData = await User.findById({_id: id});
            const categoryData = await Category.find({});
            const cartData = await Cart.findOne({user: ObjectId(userData)});
            const wishlistData = await Wishlist.findOne({user: ObjectId(userData)});
            const orderData = await Order
                .findById({_id: req.query.id})
                .populate("products.item")
            const deliveryDate = new Date(orderData.createdAt);
            deliveryDate.setDate(deliveryDate.getDate() + 7);

            if (cartData && wishlistData) {
                const cartcount = cartData.products.length;
                const wishlistcount = wishlistData.products.length;

      
                res.render("orderdetails", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount,
                    orderData,
                    deliveryDate
                });
            } else if (cartData === null && wishlistData) {
                let cartcount = 0;
                const wishlistcount = wishlistData.products.length;
                res.render("orderdetails", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount,
                    orderData
                });
            } else if (wishlistData === null && cartData) {
                let wishlistcount = 0;
                const cartcount = cartData.products.length;
                res.render("orderdetails", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount,
                    orderData
                });
            } else if (cartData === null && wishlistData === null) {
                let cartcount = 0;
                let wishlistcount = 0;
                const userData = req.session.user_id;
                res.render("orderdetails", {
                    user_in: userData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount,
                    orderData
                });
            }
        } else {
            const categoryData = await Category.find({});
            const productData = await Product.find({ active: true });
            let cartcount = 0;
            let wishlistcount = 0;
            let user_in = null;

            res.render("orderdetails", {
                user_in,
                categories: categoryData,
                product_data: productData,
                cartcount,
                wishlistcount
            });
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const loadordercancel = async (req,res,next) => {
    try {
        id = req.query.id;
        const orderData = await Order.findByIdAndUpdate({
            _id: id
        }, {
            $set: {
                order_status: "Cancelled"
            }
        });
        const value = await orderData.products;
        const prodata = value.map((n) => n.item);
        const productData = await Product.find({
            _id: {
                $in: prodata
            },active:true
        });

        let updatedStockValues = [];

        for (let i = 0; i < productData.length; i++) {
            const updatedStock = productData[i].in_stock + value[i].quantity;
            updatedStockValues.push(updatedStock);
        }
        for (let i = 0; i < productData.length; i++) {
            const item = productData[i]._id;
            const updatedStock = updatedStockValues[i];
            await Product.updateOne({
                _id: item
            }, {
                $set: {
                    in_stock: updatedStock
                }
            });
        }

        res.redirect("/orderhistory");
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const addressEdit = async (req,res,next) => {
    try {
        id = req.query.id;
        const userData = await User.findById({_id: req.session.user_id});

        const addressData = {
            name: req.body.name,
            address1: req.body.address1,
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            street: req.body.street,
            mobile: req.body.mobile,
            postalCode: req.body.pin
        };

        const updatedata = await User.findOneAndUpdate({
            _id: req.session.user_id,
            "address._id": req.query.id
        }, {
            $set: {
                "address.$": addressData
            }
        }, {new: true});
        res.redirect("/userview");
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const addressEditload = async (req,res,next) => {
    try {
        if (req.session.user_id) {
            const id = req.session.user_id;
            const userData = await User.findById({_id: id});
            const categoryData = await Category.find({});
            const cartData = await Cart.findOne({user: ObjectId(userData)});
            const wishlistData = await Wishlist.findOne({user: ObjectId(userData)});
            const addressData = await userData
                .address
                .find((p) => p._id == req.query.id);
        

            if (cartData && wishlistData) {
                const cartcount = cartData.products.length;
                const wishlistcount = wishlistData.products.length;

             
                res.render("edit-address", {
                    user_in: userData,
                    addressData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            } else if (cartData === null && wishlistData) {
                let cartcount = 0;
                const wishlistcount = wishlistData.products.length;
                res.render("edit-address", {
                    user_in: userData,
                    addressData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            } else if (wishlistData === null && cartData) {
                let wishlistcount = 0;
                const cartcount = cartData.products.length;
                res.render("edit-address", {
                    user_in: userData,
                    addressData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            } else if (cartData === null && wishlistData === null) {
                let cartcount = 0;
                let wishlistcount = 0;
                const userData = req.session.user_id;
                res.render("edit-address", {
                    user_in: userData,
                    addressData,
                    categories: categoryData,
                    cartcount,
                    wishlistcount
                });
            }
        } else {
            const categoryData = await Category.find({});
            const productData = await Product.find({ active: true });
            let cartcount = 0;
            let wishlistcount = 0;
            let user_in = null;

            res.render("edit-address", {
                user_in,
                categories: categoryData,
                product_data: productData,
                cartcount,
                wishlistcount
            });
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const delete_address = async (req,res,next) => {
    try {
     
        id = req.query.id;

        await User.findOneAndUpdate({
            _id: ObjectId(req.session.user_id)
        }, {
            $pull: {
                address: {
                    _id: id
                }
            }
        });
    
        res.redirect("/userview");

        console.log("end");
    } catch (error) {
        console.log(error.message);
next(error);
    }
};

const passwordChange = async (req,res,next) => {
    try {
        const userData = await User.findById({_id: req.session.user_id});
        const password = req.body.oldpsw;
        const newPass = req.body.newpsw;
        const passMatch = await bcrypt.compare(password, userData.password);
        if (passMatch) {
            const secure_password = await securePassword(newPass);
            const updatedData = await User.findByIdAndUpdate({
                _id: req.session.user_id
            }, {
                $set: {
                    password: secure_password
                }
            });
            res.redirect("/userview");
        } else {
            res.redirect("/userview");
        }
    } catch (error) {
        console.log(error.message);
next(error);
    }
}

const invoiceExport = async (req,res,next) => {
    try {
        let id = req.query.orderData;
        
         let couponReduced = req.session.couponUsed;
         let walletReduced = req.session.walletUsed;
         let subtotal = req.session.subtotal;
         let total = req.session.totalamount;

        const orderData = await Order
            .findById({_id: id})
            .sort({createdAt: -1})
            .populate("products.item");
     
        let addressId = orderData.address

        const addressData = await User.findOne({
            "address._id": addressId
        }, {"address.$": 1});
      

        const data = {
          orderData: orderData,
          addressData,
          couponReduced,
          walletReduced,
          subtotal,
          total
        };

        const filePathName = path.resolve(__dirname, "../views/users/invoice.ejs");
        const htmlString = fs
            .readFileSync(filePathName)
            .toString();
        let options = {
            format: "Letter"
        };
        const ejsData = ejs.render(htmlString, data);
        const pdfPromise = new Promise((resolve, reject) => {
            pdf
                .create(ejsData, options)
                .toStream((err, stream) => {
                    if (err) 
                        reject(err);
                    else 
                        resolve(stream);
                    console.log("here");
                });
        });
        const stream = await pdfPromise;
        res.set(
            {"Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=invoice.pdf"}
        );
        stream.pipe(res);
    } catch (error) {
        console.log(error.message);
next(error);
        res
            .status(500)
            .send("Internal server error");
    }
}

module.exports = {
    loadregister,
    insertUser,
    loadHome,
    verifyLogin,
    verifyMail,
    verifyotp,
    grabnum,
    forgetLoad,
    forgetPass,
    forgetpasswordload,
    resetPassword,
    otpPass,
    otpSend,
    loadLogin,
    loadShop,
    loadCart,
    loadCheckout,
    loadContact,
    loadDetail,
    loadWishlist,
    userLogout,
    viewUserprof,
    userEdit,
    updateUser,
    categorywise_product,
    addtocart,
    itemdelete,
    get_add_address,
    add_address,
    increment,
    decrement,
    updatecart,
    addtowishlist,
    loadWishlist,
    wishlistitemdelete,
    postcheckout,
    neworderaddress,
    placedorder,
    loadorderhistory,
    loadorderview,
    loadordercancel,
    addressEdit,
    addressEditload,
    delete_address,
    loadrazor,
    postrazor,
    passwordChange,
    addToWallet,
    walletUse,
    couponApply,
    invoiceExport
};
