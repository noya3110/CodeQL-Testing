const bcrypt = require("bcryptjs");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else message = null;
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else message = null;
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
        .then(() => {
          res.redirect("/login");
          return transporter.sendMail({
            to: email,
            from: "nandiniloomba@gmail.com",
            subject: "Signup Successful..!",
            html: "<h2>Congratulations.. You are good to shop at Expressor..!</h2>",
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    else res.redirect("/");
  });
};

//reseting the password

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else message = null;
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    //the buffer which we will get has hexa decimal values
    //toString("hex") will convert the hexa decimal values to normal
    //ascii characters
    const token = buffer.toString("hex");

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No email has been found with this email.");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; //Date.now() is in milliseconds
        return user.save();
      })
      .then(() => {
        res.redirect("/");
        transporter.sendMail({
          to: req.body.email,
          from: "nandiniloomba@gmail.com",
          subject: "Reset Password",
          html: `<p>You requested a password reset.</p>
          <p> Click on <a href="http://localhost:8080/reset/${token}">link</a> to set a new password.!</p>`,
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  //$gt means greater than so it will only select values which are
  //greater then the specified value.
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.redirect("/404");
      }
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else message = null;
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        resetToken: token,
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const password = req.body.password;
  const userId = req.body.userId;
  const resetToken = req.body.resetToken;
  var resetUser;
  User.findOne({
    resetToken: resetToken,
    _id: userId,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(password, 12);
    })
    .then((hashedpassword) => {
      resetUser.password = hashedpassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => res.redirect("/login"))
    .catch((err) => console.log(err));
};
