const express=require("express")
const admin_route=express()



const path=require('path')
admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')
const adminController=require("../controllers/adminController")
const productController=require("../controllers/productController")
const categoryController=require("../controllers/categoryController")
const auth=require("../middleware/adminAuth")

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname,'../img/productImages'));
    },
    filename: function (req, file, cb) {
        const name =Date.now()+ "-" +file.originalname
      cb(null,name)
    }
  }); 

  const upload = multer({storage:storage})

admin_route.get('/dash',auth.isLogin,adminController.loadDash)

admin_route.get('/products',auth.isLogin,productController.loadProducts)

admin_route.get('/customers',auth.isLogin,adminController.loadcustomers)

admin_route.get('/viewUser',auth.isLogin,adminController.userViewLoad)

admin_route.post('/delete-product',auth.isLogin,productController.productDelete)

admin_route.get('/edit-product',auth.isLogin,productController.editProductLoad)

admin_route.post("/edit-product", upload.array('image', 6), productController.updateProduct);

admin_route.post( "/deleteImage",auth.isLogin,productController.deleteProductImage);

admin_route.get('/blockornot',auth.isLogin,adminController.blockUser)  

// admin_route.post('/unblock',adminController.unblockUser)
admin_route.get('/add-product',auth.isLogin,productController.addProductLoad)

admin_route.get('/view-product',auth.isLogin,productController.viewProductLoad)

admin_route.post('/add-product',upload.array('image',3),productController.addProduct)

admin_route.get('/categories',auth.isLogin,adminController.loadcategories)

admin_route.get('/orders',auth.isLogin,adminController.loadorders)

admin_route.get('/orderUpdate',auth.isLogin,adminController.getOrderUpdate)

admin_route.post('/orderUpdate', auth.isLogin, adminController.updateOrder)

admin_route.get("/sales", auth.isLogin, adminController.getSales)

admin_route.post("/salesReport", auth.isLogin, adminController.showReport)

admin_route.get("/exportPDF", auth.isLogin, adminController.exportData);
admin_route.get("/exportCSV", auth.isLogin, adminController.exportCsv);

admin_route.get('/coupon',auth.isLogin,adminController.loadcoupon)
admin_route.post('/couponadd',auth.isLogin,adminController.Addcoupon)
// admin_route.get('/edit-product',upload.array('image',3),productController.productEdit)

// admin_route.post('/edit-product',productController.productEdit)

admin_route.get("/banner", auth.isLogin, adminController.loadBanner);
admin_route.post("/bannerAdd", upload.array("image[]",3), auth.isLogin, adminController.saveBanner);

admin_route.get("/bannerAdd", auth.isLogin, adminController.loadAddbanner);
admin_route.post("/deleteBanner", auth.isLogin, adminController.bannerDelete);


admin_route.post("/deleteCategory/:category_id",auth.isLogin,categoryController.categoryDelete);

admin_route.post('/add-category',upload.single('image'),categoryController.categoryAdd)
admin_route.get('/edit-category',auth.isLogin,categoryController.categoryEditLoad)
admin_route.post('/edit-category',upload.single('image'),categoryController.categoryEdit)

admin_route.get('/loginadmin',auth.isLogout,adminController.adminLogin)

admin_route.get('/adminLogout',auth.isLogin,adminController.logoutAdmin)

admin_route.post('/loginadmin',adminController.verifyAdmin)

admin_route.get('/accounts',adminController.accountsLoad)

admin_route.get('/add-category',auth.isLogin,categoryController.categoryAddLoad)



module.exports=admin_route