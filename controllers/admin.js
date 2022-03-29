const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    
  });
};

exports.postAddProducts = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const ImageUrl = req.body.ImageUrl;
  const UserID = req.user;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    ImageUrl: ImageUrl,
    UserID: UserID,
  });
  product
    .save()
    .then(() => {
      console.log("Product Created...!");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const edit = req.query.edit;
  if (!edit) {
    return res.redirect("/");
  }
  const prodID = req.params.productID;
  Product.findById(prodID)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: edit,
        product: product,
        
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  Product.findById(req.body.prodID)
    .then((product) => {
      product.title = req.body.title;
      product.description = req.body.description;
      product.ImageUrl = req.body.ImageUrl;
      product.price = req.body.price;
      product.save();
    })
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
       
      });
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const id = req.body.prodID;
  Product.findByIdAndDelete(id)
    .then(() => res.redirect("/admin/products"))
    .catch((err) => console.log(err));
};
