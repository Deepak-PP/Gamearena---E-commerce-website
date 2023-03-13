const {reservationsUrl} = require('twilio/lib/jwt/taskrouter/util');
const Admin = require('../model/adminModel')
const User = require('../model/userModel')
const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const Order = require('../model/orderModel')
const Coupon = require('../model/couponModel')
const Banner = require("../model/bannerModel");
const {ObjectId} = require("mongodb");
const {parse} = require("csv-parse");

const ejs = require('ejs')
const pdf = require('html-pdf')
const fs = require('fs')
const path = require('path');
const {log} = require('console');
const {match} = require('assert');

const loadDash = async (req,res,next) => {
    try {
        const orderData = await Order
            .find({})
            .sort({createdAt: -1})

        const categorySales = await Order.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "products.item",
                    foreignField: "_id",
                    as: "products"
                }
            }, {
                $unwind: "$products"
            }, {
                $lookup: {
                    from: "categories",
                    localField: "products.category",
                    foreignField: "_id",
                    as: "products.category"
                }
            }, {
                $unwind: "$products.category"
            }, {
                $group: {
                    _id: "$products.category.name",
                    sales: {
                        $sum: "$products.price"
                    }
                }
            }
        ]);

       const currentDate = new Date();
       const sevenDaysAgo = new Date(
         currentDate.getFullYear(),
         currentDate.getMonth(),
         currentDate.getDate() - 6
       );

       const weekdayNames = [
         "Sunday",
         "Monday",
         "Tuesday",
         "Wednesday",
         "Thursday",
         "Friday",
         "Saturday",
       ];

       const orders = await Order.aggregate([
         {
           $match: {
             createdAt: { $gte: sevenDaysAgo },
           },
         },
         {
           $group: {
             _id: {
               $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
             },
             totalSales: { $sum: "$total" },
           },
         },
         {
           $sort: {
             _id: 1,
           },
         },
       ]);

  
       const dailySales = orders.map((order) => {
         const date = new Date(order._id);
         const dayOfWeek = weekdayNames[date.getDay()];
         const totalSales = order.totalSales;
        
         return { date: order._id, dayOfWeek, totalSales };
       });
        
        const odersale = await Order.find({payment_status: "completed"})
        const totalSales = odersale.reduce((acc, cur) => acc + cur.total, 0);
        const delivered = await Order.find({order_status: "Delivered"})
        const userData = await User.find({})

        res.render("dash", {
          orderData,
          categorySales,
          totalSales,
          delivered,
          userData,
          dailySales,
        });

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const loadcustomers = async (req,res,next) => {
    try {

        const userData = await User.find({__v: 0})
        res.render('customers', {users: userData})

    } catch (error) {
        next(error)
console.log(error.message)

    }
}

const userViewLoad = async (req,res,next) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({_id: id})
        if (userData) {
            res.render('viewUser', {users: userData})
        } else {
            res.redirect('/admin/customers')
        }

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const adminLogin = async (req,res,next) => {
    try {
        res.render('loginadmin')

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const logoutAdmin = async (req,res,next) => {
    try {
        req
            .session
            .destroy()
        res.redirect('/admin/loginadmin')

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const verifyAdmin = async (req,res,next) => {
    try {

        let password = req.body.password
        req.session.admin_mail = req.body.email
        const adminData = await Admin.findOne({email: req.session.admin_mail})
        console.log(adminData, '1212121222admin');

        if (adminData) {
            if (adminData.is_verified == 1) {
                if (adminData.password == password) {

                    req.session.admin_id = adminData._id;

                    res.redirect("/admin/dash");
                } else {
                    res.render('loginadmin', {message: "Password Incorrect"})
                }

            } else {
                res.render('loginadmin', {message: "You are not admin"})

            }

        } else {
            res.render('loginadmin', {message: "credentials incorrect"})
        }

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const accountsLoad = async (req,res,next) => {
    try {
        res.render('accounts')

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const blockUser = async (req,res,next) => {
    try {
        const userData = await User.findById({_id: req.query.id})
        // const email = userData.email console.log(userData);
        if (userData.is_verified === 1) {
            const updatedData = await User.findByIdAndUpdate({
                _id: req.query.id
            }, {
                $set: {
                    is_verified: 0
                }
            })
            res.redirect('/admin/customers')

        } else if (userData.is_verified === 0) {
            const updatedData = await User.findByIdAndUpdate({
                _id: req.query.id
            }, {
                $set: {
                    is_verified: 1
                }
            })
            res.redirect('/admin/customers')

        }

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const loadcategories = async (req,res,next) => {
    try {
        const categoryData = await Category.find({active:true})
        res.render('categories', {category: categoryData})

    } catch (error) {
        next(error)
console.log(error.message)

    }
}

const loadorders = async (req,res,next) => {
    try {
        const orderData = await Order
            .find({})
            .sort({createdAt: -1})
            .populate('userId')
            .populate('products.item')
        console.log(orderData, 'dfgsdjsgdjsdf');
        res.render('orders', {orders: orderData})
    } catch (error) {
        next(error)
console.log(error.message)
    }
}

const getOrderUpdate = async (req,res,next) => {
    try {
        const id = req.query.id;
        const orderData = await Order
            .findById({_id: id})
            .populate('userId')
            .populate('products.item')

        const add = orderData.address
        const address = await User.findOne({"address._id": ObjectId(add)});

        res.render('updateorder', {orderData, address});
    } catch (error) {
        next(error)
console.log(error.message)
    }
}

const updateOrder = async (req,res,next) => {
    try {
        const orderData = await Order.findById({_id: req.body.id})
        const updatedData = await Order.findByIdAndUpdate({
            _id: req.body.id
        }, {
            $set: {
                order_status: req.body.order_status,
                payment_status: req.body.order_status === "Delivered"
                    ? "completed"
                    : orderData.payment_status
            }
        }, {new: true});

        res.redirect('/admin/orders')
    } catch (error) {
        next(error)
console.log(error.message)
    }
}

const loadcoupon = async (req,res,next) => {
    try {

        const coupons = await Coupon.find({})
        res.render('coupon', {coupons})

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const Addcoupon = async (req,res,next) => {
    try {
        const newcoupon = new Coupon(
            {couponcode: req.body.code, discount: req.body.discount, maxlimit: req.body.maxamount, minpurchase: req.body.minamount}
        )
        const couponadded = await newcoupon.save()
        res.redirect('/admin/coupon')

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const getSales = async (req,res,next) => {
    try {
        // const startDate = req.query.start_date const endDate = req.query.end_date
        const orderData = await Order
            .find({order_status: "Delivered"})
            .sort({createdAt: -1})
            .populate("products.item");

        let addressDatas = orderData.map((n) => n.address);

        const addressData = await User.find({
            "address._id": {
                $in: addressDatas
            }
        });

        res.render("sales", {orderData, addressData});

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const showReport = async (req,res,next) => {
    try {
        let startDate = new Date(req.body.startDate)
        let endDate = new Date(req.body.endDate)
        console.log(startDate, endDate);

        const salesData = await Order
            .find({
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            })
            .sort({createdAt: -1})
            .populate("products.item");
        let addressDatas = salesData.map((n) => n.address)
        console.log(salesData, "salessssaddress");
        const addressData = await User.find({
            "address._id": {
                $in: addressDatas
            }
        })
        console.log(addressData, "salessssaddddd");

        const totalSales = salesData.reduce((acc, cur) => acc + cur.total, 0)

        res.json({salesData, addressData, totalSales});

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const exportData = async (req,res,next) => {
    try {
        let startDate = new Date(req.query.startDate);
        let endDate = new Date(req.query.endDate);
        console.log(startDate, endDate);

        const salesData = await Order
            .find({
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            })
            .sort({createdAt: -1})
            .populate("products.item");
        let addressDatas = salesData.map((n) => n.address);

        const addressData = await User.find({
            "address._id": {
                $in: addressDatas
            }
        });

        const data = {
            orderData: salesData,
            addressData
        };

        const filePathName = path.resolve(__dirname, "../views/admin/htmltopdf.ejs");
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
            {"Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=salesreport1.pdf"}
        );
        stream.pipe(res);
    } catch (error) {
        next(error);
        res
            .status(500)
            .send("Internal server error");
    }
}

const loadBanner = async (req,res,next) => {
    try {
        const banners = await Banner.find({})

        res.render("banner", {banners});

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const saveBanner = async (req,res,next) => {
    try {
        const newBanner = req.body.name;
        console.log(req.body.description, 'dscrptinnnnnnn');
        console.log(req.files);
        let files = [];
        const imageIUpload = await(function () {
            for (let i = 0; i < req.files.length; i++) {
                files[i] = req
                    .files[i]
                    .filename;
            }
            return files;
        })();
        const data = await Banner.find({name: newBanner.toUpperCase()});
        if (data.length === 0) {
            const banner = new Banner(
                {name: newBanner.toUpperCase(), image: imageIUpload, description: req.body.description}
            );
            const save = await banner.save();
            if (save) {
                res.redirect("/admin/banner");
            } else {
                console.log("save not work");
            }
        } else {
            console.log("Banner already exist");

        }

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const exportCsv = async (req,res,next) => {
    try {
       const startDate = new Date(req.query.startDate);
       const endDate = new Date(req.query.endDate);
       const query = {
         created_date: {
           $gte: startDate,
           $lte: endDate,
         },
       };
       Order.find(query, (err, orders) => {
         if (err) {
           console.log(err);
           return res.status(500).send("Server error");
         }
         if (!orders.length) {
           return res.status(404).send("No orders found");
         }
         const fields = [
           "_id",
           "created_date",
           "userId",
           "products",
           "total",
           "address",
           "payment_method",
           "payment_status",
           "order_status",
         ];
         const csv = orders.map((order) => {
           const productData = order.products
             .map((product) => {
               return `${product.title} (${product.quantity})`;
             })
             .join(",");
           const addressData = `${order.address.street}, ${order.address.city}, ${order.address.country}`;
           return [
             order._id,
             order.created_date,
             order.userId,
             productData,
             order.total,
             addressData,
             order.payment_method,
             order.payment_status,
             order.order_status,
           ];
         });
         res.set("Content-Type", "text/csv");
         res.attachment("salesreport1.csv");
         const headers = [
           "ID",
           "Created Date",
           "User ID",
           "Products",
           "Total",
           "Address",
           "Payment Method",
           "Payment Status",
           "Order Status",
         ];
         const csvData = [headers, ...csv];
         const csvString = csvData.map((row) => row.join(",")).join("\n");
         res.send(csvString);
       });
    } catch (error) {
        next(error)
console.log(error.message);
        res
            .status(500)
            .send("Internal server error");
    }
};

const loadAddbanner = async (req,res,next) => {
    try {
        res.render("addBanner")

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const bannerDelete = async (req,res,next) => {
    try {
        let id = req
            .query
            .id
            await Banner
            .findByIdAndDelete({_id: id})
        res.redirect('/banner')
    } catch (error) {
        next(error)
console.log(error.message);
    }
}



module.exports = {
  loadDash,
  adminLogin,
  accountsLoad,
  verifyAdmin,
  loadcustomers,
  blockUser,
  userViewLoad,
  logoutAdmin,
  loadcategories,
  loadorders,
  getOrderUpdate,
  updateOrder,
  loadcoupon,
  Addcoupon,
  getSales,
  showReport,
  exportData,
  loadBanner,
  saveBanner,
  exportCsv,
  loadAddbanner,
  bannerDelete,
  
};