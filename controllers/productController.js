const {reservationsUrl} = require("twilio/lib/jwt/taskrouter/util");
const Admin = require("../model/adminModel");
const User = require("../model/userModel");
const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const Coupon = require("../model/couponModel");
const Cart = require("../model/cartModel");

const fs = require("fs");
const path = require("path");

const {ObjectId} = require("mongodb");
const mongoose = require("mongoose");

const loadProducts = async (req, res) => {
    try {
        const category_name = await Category.find({}, {_id: 1});

        const catvalue = category_name.map((category) => category.id);

        const categoryData = await Category.find({__v: 0});
        console.log(categoryData);
        const productData = await Product
            .find({
                category: {
                    $in: catvalue
                }
            })
            .populate("category");

        // {$lookup:{         from:"categories",         localField:"category",
        // foreignField:"_id",         as:"category_name"
        // }},{$unwind:"$category_name"},
        // {$project:{"category_name.name":1,"_id":0}}  ])

        if (productData) {
            res.render("products", {
                products: productData,
                category: categoryData
            });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const viewProductLoad = async (req, res) => {
    try {
        const id = req.query.id;
        const productData = await Product
            .findById({_id: id})
            .populate("category");

        res.render("view-product", {products: productData});
    } catch (error) {
        console.log(error.message);
    }
};

const productDelete = async (req, res) => {
    try {
        const id = req.query.id;
        await Product.findByIdAndUpdate(
          { _id: id, active: true },
          { $set: { active: false } }
        );
        res.redirect("/admin/products");
    } catch (error) {
        console.log(error.message);
    }
};

const editProductLoad = async (req, res) => {
    try {
        const id = req.query.id;
        const categoryData = await Category.find({__v: 0});
        const productData = await Product.findById({ _id: id, active: true });
        if (productData) {
            res.render("edit-product", {
                products: productData,
                categories: categoryData
            });
        } else {
            res.redirect("/admin/products");
        }
    } catch (error) {
        console.log(error.message);
    }
};

const addProductLoad = async (req, res) => {
    try {
        const categoryData = await Category.find({__v: 0});
        res.render("add-product", {category: categoryData});
    } catch (error) {
        console.log(error.message);
    }
};

const addProduct = async (req, res) => {
    try {
        const product_Data = await Product.findOne({
          name: req.body.name,
          active: true,
        });
        if (!product_Data) {
            console.log(req.files);
            let files = [];

            const imageIUpload = await(function () {
                for (let i = 0; i < 3; i++) {
                    files[i] = req
                        .files[i]
                        .filename;
                }
                return files;
            })();
            console.log(imageIUpload);

            console.log(files);
            const products = new Product({
                name: req.body.name,
                price: req.body.price,
                connectivity: req.body.connectivity,
                image: imageIUpload,
                description: req.body.description,
                processor: req.body.processor,
                hdd: req.body.hdd,
                category: req.body.category,
                in_stock: req.body.in_stock
            });
            const productData = await products.save();
            if (productData) {
                res.redirect("/admin/products");
            } else {
                const categoryData = await Category.find({__v: 0});
                res.render("add-product", {
                    message: "Product not added.Please try again",
                    category: categoryData
                });
            }
        } else {
            const categoryData = await Category.find({__v: 0});
            res.render("add-product", {
                message: "Product already exist",
                category: categoryData
            });
        }
    } catch (error) {
        console.log(error.message);
    }
};

// const productEdit = async(req,res)=>{     try {
// res.render('edit-product')     } catch (error) {home
// console.log(error.mesage);     } }

const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById({
          _id: req.body.id,
        });
        let imageIds = product.image || [];
        const newImageIds = req.files.map((file) => file.filename);

        // Check the number of existing images
        const existingImagesCount = imageIds.length;

        // Maximum number of images allowed
        const maxImages = 6;

        // Append or remove the new image IDs based on the number of existing images
        if (existingImagesCount < maxImages) {
          imageIds = [...imageIds, ...newImageIds];
        } else {
          // Remove the oldest image and append the new image IDs
          imageIds = [...imageIds.slice(1), ...newImageIds];
        }

        const categoryData = await Category.findById({
          _id: req.body.category,
        });
        // Update the product data in the database with the updated image array
        const productData = await Product.findByIdAndUpdate(
          { _id: req.body.id },
          {
            $set: {
              name: req.body.name,
              price: req.body.price,
              processor: req.body.processor,
              hdd: req.body.hdd,
              category: req.body.category,
              stocks: req.body.in_stock,
              description: req.body.description,
              image: imageIds,
            },
          }
        );

        res.redirect("/admin/products");
    } catch (error) {
        console.log(error.message);
    }
};



const loadsortproduct = async (req, res) => {
    try {
        const sortOption = req.query.sort_option;

        let products = await Product.find({active: true});

        switch (sortOption) {
            case "low-to-high":
                products.sort((a, b) => a.price - b.price);
                break;
            case "high-to-low":
                products.sort((a, b) => b.price - a.price);
                break;

            default:
                // Sort by default (no sorting)
        }
        let sortedproducts = products;

        res.json({sortedproducts});
    } catch (error) {
        console.log(error.message);
    }
};

const reviewProduct = async (req, res) => {
    try {
        let rating = req.body.rating;
        let content = req.body.content;
        let username = req.body.name;
        let productId = req.body.productId;
        console.log(productId, "this is pro id");
        console.log(rating, content, username, productId);

        const reviews = {
            user: username,
            rating: rating,
            text: content
        };

        const updatedProductData = await Product.findByIdAndUpdate(
          {
            _id: productId,
            active: true,
          },
          {
            $push: {
              reviews: reviews,
            },
          }
        );

        res.json({success: true});
    } catch (error) {
        console.log(error.message);
    }
};

const productSearch = async (req, res) => {
    try {
        let page = 1
        const limit = 6
        
        let search = "";
        if (req.body.search) {
            search = req.body.search;
        }

        const productData = await Product.find({active:true,
            $or: [
                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                }, {
                    brand: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ]

        })

        res.json({product: productData});
    } catch (error) {
        console.log(error.message);
    }
};

const productFilter = async (req, res) => {
    try {
        let page = 1
        let limit = 6;
        
    let search = req.body.search || "";
    let sortOption = req.body.sortOption;
    let categoryIds = req.body.categoryIds;

    if (categoryIds && categoryIds != "all") {
      // Get products based on selected category
        
      const filtered = await Product.find({
        category: { $in: categoryIds },
        active: true,
        $or: [
          { name: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
        ],
      })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      let resltproducts = filtered;

      if (sortOption) {
        
        switch (sortOption) {
          case "low-to-high":
            resltproducts.sort((a, b) => a.price - b.price);
            break;
          case "high-to-low":
            resltproducts.sort((a, b) => b.price - a.price);
            break;
          default:
     
        }
      }

      res.json({ sortedproducts: resltproducts });
    } else {
      
      const productData = await Product.find({
        active: true,
        $or: [
          { name: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
        ],
      })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      let products = productData;

      if (sortOption) {
     
        switch (sortOption) {
          case "low-to-high":
            products.sort((a, b) => a.price - b.price);
            break;
          case "high-to-low":
            products.sort((a, b) => b.price - a.price);
            break;
          default:
         
        }
      }

      res.json({ sortedproducts: products });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteProductImage = async (req, res) => { 
  try {
       
            const path = require("path");
            const image = (req.body.image);
            const imagePath = path.join(
              __dirname,
              "..",
              "img",
              "productImages",
              image
            );
            fs.unlink(imagePath, (err) => {
              if (err) throw err;
              console.log(`${image} deleted!`);
            });

            const product = await Product.findOne({
              image: { $elemMatch: { $eq: image } },
            });
            const pullImage = await Product.updateOne(
              { _id: Product._id },
              { $pull: { image: image } }
            );

            res.json({ status: true, productimg: product._id });
        
    } catch (error) {
        console.log(error.message);
        
    }
}


module.exports = {
  loadProducts,
  addProductLoad,
  addProduct,
  productDelete,
  editProductLoad,
  updateProduct,
  viewProductLoad,

  loadsortproduct,
  reviewProduct,
  productSearch,
  productFilter,
  deleteProductImage,
};
