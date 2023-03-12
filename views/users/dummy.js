const exportData = async (req, res) => {
  try {
    let startDate = new Date(req.query.startDate);
    let endDate = new Date(req.query.endDate);
    console.log(startDate, endDate);

    const salesData = await Order.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ createdAt: -1 })
      .populate("products.item");

    // Convert salesData to CSV format
    const fields = [
      "Order ID",
      "Customer Name",
      "Product Name",
      "Quantity",
      "Price",
    ];
    const opts = { fields };
    const csvData = parse(salesData, opts);

    res.attachment("salesreport1.csv");
    res.status(200).send(csvData);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
};






function exportdoc() {
  const start_Date = document.getElementById("start");
  const end_Date = document.getElementById("end");
  const startDate = start_Date.value;
  const endDate = end_Date.value;
  $.ajax({
    url: "/admin/exportCSV",
    method: "get",
    data: { startDate, endDate },
    xhrFields: {
      responseType: "blob",
    },
    success: function (response) {
      const blob = new Blob([response], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "salesreport1.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    error: function (xhr, status, error) {
      console.log(xhr.responseText);
    },
  });
}


exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Products.findById({
      _id: req.body.productId,
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

    const categoryData = await Category.findById({ _id: req.body.category });
    // Update the product data in the database with the updated image array
    const productData = await Products.findByIdAndUpdate(
      { _id: req.body.productId },
      {
        $set: {
          name: req.body.name,
          brand: req.body.brand,
          grossPrice: req.body.grossprice,
          offerPrice: req.body.offerprice,
          stock: req.body.stock,
          description: req.body.description,
          category: categoryData._id,
          size: req.body.size,
          image: imageIds,
        },
      }
    );

    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
    next(error.message);
  }
};