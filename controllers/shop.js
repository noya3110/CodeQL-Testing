const Product = require("../models/product");
const Order = require("../models/order");

//////////////PRODUCTS//////////////////////////////////////////

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const productID = req.params.productID;
  Product.findById(productID)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Products",
        path: "/",
      });
    })
    .catch((err) => console.log(err));
};

//////////////CART/////////////////////////////////////////////

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productID")
    .then((products) => {
      res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: products.cart.items,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodID = req.body.productID;

  Product.findById(prodID)
    .then((product) => req.user.addToCart(product))
    .then(() => res.redirect("/cart"));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodID = req.body.productID;

  req.user
    .deleteCartItem(prodID)
    .then(() => res.redirect("/cart"))
    .catch((err) => console.log(err));
};

//////////////////ORDERS//////////////////////////////////

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userID": req.user.id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Orders",
        orders: orders,
      });
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productID")
    .then((user) => {
      const products = user.cart.items.map((prod) => {
        return {
          quantity: prod.count,
          product: { ...prod.productID._doc },
        };
      });
      const order = new Order({
        user: {
          email: user.email,
          userID: user,
        },
        products: products,
      });

      return order.save();
    })
    .then(() => {
      return req.user.ClearCart();
    })
    .then(() => res.redirect("/orders"))
    .catch((err) => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
  });
};
