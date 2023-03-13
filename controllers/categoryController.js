const Category = require('../model/categoryModel')
const Product = require('../model/productModel')

const categoryAddLoad = async (req,res,next) => {
    try {
        res.render('add-category')

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const categoryAdd = async (req,res,next) => {
    try {
        const category_data = await Category.findOne({name: req.body.name})
        if (!category_data) {

            const categories = new Category(
                {name: req.body.name, image: req.file.filename}
            )
            const categoryData = await categories.save()
            if (categoryData) {
                res.render('add-category', {message: "Category added successfully"})
            } else {
                res.render('add-category', {message: "Something went wrong"})
            }

        } else {
            res.render('add-category', {message: "Category already exist"})
        }

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const categoryDelete = async (req,res,next) => {
    try {
        const id = req.params.category_id;
        const productData = await Product.find({ category: id,active:true })
        if (productData.length == 0) {
            await Category.findByIdAndUpdate(
                { _id: id },
                { $set: { active: false } }
            )
            res.json({ success: true })

        } else { 
            res.json({success:false})
        }
         
        
        res.redirect('/admin/products')

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const categoryEditLoad = async (req,res,next) => {
    try {
        const categoryData = await Category.findById({_id: req.query.id})

        res.render('edit-category', {categories: categoryData})

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const categoryEdit = async (req,res,next) => {
    try {
        if (req.file) {
            const updatedCategoryData = await Category.findByIdAndUpdate({
                _id: req.body.id
            }, {
                $set: {
                    name: req.body.name,
                    image: req.file.filename
                }
            })
        } else {
            const updatedCategoryData = await Category.findByIdAndUpdate({
                _id: req.body.id
            }, {
                $set: {
                    name: req.body.name
                }
            })

        }

        res.redirect('/admin/products')

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

const loadcategoryfilter = async (req,res,next) => {
    try {
        console.log('start')
        let val = req
            .body
            .categoryIds
            console
            .log(req.params);
        console.log(val);

        const catgry = await Category.find({ _id: { $in: val } })
      

        const filtered = await Product.find({ category: val, active: true });
        let resltproducts = filtered
        console.log(resltproducts);

        res.json({resltproducts})

    } catch (error) {
        next(error)
console.log(error.message);

    }

}

const loadAllcategory = async (req,res,next) => {
    try {
        const allproducts = await Product.find({ active: true });
        console.log(allproducts,'allproductsshgsghsghs');

        res.json({allproducts})

    } catch (error) {
        next(error)
console.log(error.message);

    }
}

module.exports = {
    categoryAddLoad,
    categoryAdd,
    categoryDelete,
    categoryEditLoad,
    categoryEdit,
    loadcategoryfilter,
    loadAllcategory

}
