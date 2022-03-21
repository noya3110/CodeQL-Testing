const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    authenticated: req.session.loggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  User.findById("621c8364016113f8e6c812e2")
    .then((user) => {
      req.session.user = user;
      req.session.loggedIn = true;
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session
    .destroy(err => {
      if(err) console.log(err)
      else res.redirect("/");
    })
};
