const bcrypt = require("bcryptjs");
const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  let message=req.flash("error");
  if(message.length >0) {
    message=message[0];
  }
  else message=null;
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
  });
};

exports.getSignup = (req, res, next) => {
  let message=req.flash("error");
  if(message.length >0) {
    message=message[0];
  }
  else message=null;
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "SignUp",
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password.");
        return res.redirect("/login");
      }

      bcrypt.compare(password, user.password).then((match) => {
        if (match) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save((err) => {
            res.redirect("/");
          });
        }
        req.flash("error", "Invalid email or password.");
        res.redirect("/login");
      });
    })
    .catch((err) => console.log(err));
};

//after a user signup we will be checking the email in our database, if that exists
//already then we will be redirecting to the signup page else we will be creating a new user
//and redirecting to the login page.

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        req.flash("error", "Email already exists. Please try a new one..!");
        return res.redirect("/signup");
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedpassword) => {
          const newUser = new User({
            email: email,
            password: hashedpassword,
            cart: { items: [] },
          });
          return newUser.save();
        })
        .then(() => res.redirect("/login"));
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    else res.redirect("/");
  });
};
