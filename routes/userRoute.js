const express=require('express')
const user_route=express()
const usercntrlr=require("../controllers/usercontroller")
const productController=require("../controllers/productController")
const categoryController=require("../controllers/categoryController")
const validate=require("../validator")
const bodyParser=require("body-parser")

const auth=require("../middleware/userAuth")


user_route.set('view engine','ejs')
user_route.set('views','./views/users')



user_route.get('/register',auth.isLogout,usercntrlr.loadregister)
user_route.post('/register',auth.isLogout,usercntrlr.insertUser)

user_route.get('/login',auth.isLogout,usercntrlr.loadLogin)
user_route.post('/login',usercntrlr.verifyLogin)

user_route.get('/otpenter',auth.isLogout,usercntrlr.otpPass)
user_route.post('/otpenter',auth.isLogout,usercntrlr.otpSend)

user_route.get('/otpverification',auth.isLogout,usercntrlr.verifyotp)
user_route.post('/otpverification',auth.isLogout,usercntrlr.grabnum)

user_route.get('/home',auth.isLogin,usercntrlr.loadHome)

user_route.get('/verifym',usercntrlr.verifyMail)

// user_route.post('/verify',usercntrlr.grabnum)
user_route.get('/forget',usercntrlr.forgetLoad)
user_route.post('/forget',usercntrlr.forgetPass)

user_route.get('/forget-password',usercntrlr.forgetpasswordload)
user_route.post('/forget-password',usercntrlr.resetPassword)
user_route.post('/changepassword',auth.isLogin,usercntrlr.passwordChange)


user_route.get('/shop',auth.isLogin,usercntrlr.loadShop)
user_route.post('/categoryFilter',auth.isLogin,categoryController.loadcategoryfilter)
user_route.get('/CategoryAll',auth.isLogin,categoryController.loadAllcategory)

user_route.get('/sort-products', auth.isLogin, productController.loadsortproduct)
user_route.post("/searchProducts",auth.isLogin,productController.productSearch)
user_route.get('/category_shop', auth.isLogin, usercntrlr.categorywise_product)
user_route.post("/filterProducts",auth.isLogin,productController.productFilter);


user_route.get('/cart',auth.isLogin,usercntrlr.loadCart)
user_route.get('/carts',auth.isLogin,usercntrlr.increment)
user_route.post('/cart/:cartquant',usercntrlr.decrement)

user_route.get('/add-cart/:proId',auth.isLogin,usercntrlr.addtocart)

user_route.get('/delete-item',auth.isLogin,usercntrlr.itemdelete)
user_route.get('/cart-update',auth.isLogin,usercntrlr.updatecart)

user_route.get('/checkout',auth.isLogin,usercntrlr.loadCheckout)
user_route.post('/orderaddress',auth.isLogin,usercntrlr.neworderaddress)
user_route.get('/orderplaced', auth.isLogin, usercntrlr.placedorder)
user_route.get("/invoiceDownload", auth.isLogin, usercntrlr.invoiceExport);
user_route.post('/goto_checkout',auth.isLogin,usercntrlr.postcheckout)
user_route.post('/create-order',auth.isLogin,usercntrlr.loadrazor)
user_route.post('/paymentpost',auth.isLogin,usercntrlr.postrazor)
user_route.get('/couponapply/:content', auth.isLogin, usercntrlr.couponApply)
user_route.post("/useWallet", auth.isLogin, usercntrlr.walletUse);



user_route.get('/orderhistory',auth.isLogin,usercntrlr.loadorderhistory)
user_route.get('/orderview',auth.isLogin,usercntrlr.loadorderview)
user_route.post('/ordercancel', auth.isLogin, usercntrlr.loadordercancel)
user_route.post("/walletAdd", auth.isLogin, usercntrlr.addToWallet);

user_route.get('/contact',auth.isLogin,usercntrlr.loadContact)

user_route.get('/detail', auth.isLogin, usercntrlr.loadDetail)
user_route.post("/productReview", auth.isLogin, productController.reviewProduct)

user_route.get('/userview',auth.isLogin,usercntrlr.viewUserprof)
user_route.get('/edit-user',auth.isLogin,usercntrlr.userEdit)
user_route.post('/editprofile1',auth.isLogin,usercntrlr.addressEdit)
user_route.get('/editprofile',auth.isLogin,usercntrlr.addressEditload)
user_route.post('/update-user',auth.isLogin,usercntrlr.updateUser)
user_route.get('/add-address',auth.isLogin,usercntrlr.get_add_address)
user_route.post('/add_address',auth.isLogin,usercntrlr.add_address)
user_route.post('/deleteaddress',auth.isLogin,usercntrlr.delete_address)

user_route.get('/wishlist',auth.isLogin,usercntrlr.loadWishlist)
user_route.get('/delete_wishlist_item',auth.isLogin,usercntrlr.wishlistitemdelete)
user_route.get("/add-wishlist/:proId", auth.isLogin, usercntrlr.addtowishlist);

user_route.get('/logout',usercntrlr.userLogout)

// user_route.get('/verotp',(req,res)=>{
//     sendotp()
//     res.send(`
//     <h1>Hello</h1>`)
// })

// function sendotp(){
//     client.verify.v2.services('VAa265ebf3eaa0e91202f51dfe9e0d5ca4')
//                 .verifications
//                 .create({to: '+919400724739', channel: 'sms'})
//                 .then(verification => console.log(verification.status));
// }


module.exports=user_route





