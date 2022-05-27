const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken:String,
  resetTokenExpiration:Date,
  cart: {
    items: [
      {
        productID: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        count: { type: Number, required: true },
      },
    ],
  },
});

UserSchema.methods.addToCart = function (product) {
  const ProdIndex = this.cart.items.findIndex(
    (prod) => prod.productID.toString() === product.id.toString()
  );
  if (ProdIndex >= 0) {
    this.cart.items[ProdIndex].count++;
  } else {
    this.cart.items.push({
      productID: product.id,
      count: 1,
    });
  }
  return this.save();
};

UserSchema.methods.UploadTheCart = function () {
  return this.cart.items;
};

UserSchema.methods.deleteCartItem = function (prodID) {
  this.cart.items = this.cart.items.filter(
    (prod) => prod.productID.toString() != prodID.toString()
  );

  return this.save();
};

UserSchema.methods.ClearCart = function () {
  this.cart.items = [];
  return this.save();
};

module.exports = mongoose.model("User", UserSchema);
