const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorController = require("./controllers/error");
const mongoose = require("mongoose");
const User = require("./models/user");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

require("dotenv").config();

const PORT = process.env.PORT || 8080;

const store = new MongoDBStore({
  uri: process.env.KEY,
  collection: "Sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

//this middleware function will find the cookies attached with the req from our
//database and then attach the data associated with the cookies to the req.session

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.error404);

mongoose
  .connect(process.env.KEY)
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
