const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");
const mongoose = require("mongoose");
const User = require("./models/user");

require("dotenv").config();

const PORT = process.env.PORT || 8080;
app.set("view engine", "ejs");
app.set("views", "views");

app.use((req, res, next) => {
  User.findById("621c8364016113f8e6c812e2")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.error404);

mongoose
  .connect(
    process.env.KEY
  )
  .then(() => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Nandini Loomba",
          email: "nandiniloomba@gmail.com",
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });
    app.listen(PORT);
  })
  .catch((err) => console.log(err));
