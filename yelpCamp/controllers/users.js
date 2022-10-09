const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
  res.render("./users/register");
};

module.exports.register = async (req, res, next) => {
  //   res.send(req.body);
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    //register() automatically saves, no need for user.save etc.
    const registeredUser = await User.register(user, password);
    //   console.log(registeredUser);
    //To log new user in, would be logged out even if registered
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to YelpCamp");
      res.redirect("/campgrounds");
    });
  } catch (err) {
    req.flash("danger", err.message);
    res.redirect("/register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("./users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  // res.redirect("./campgrounds");
  const redirectUrl = req.session.returnTo || "/campgrounds";
  res.redirect(redirectUrl);
  delete req.session.returnTo;
};

module.exports.logout = (req, res, next) => {
  req.logout();
  req.flash("success", "Logged out successfully.");
  res.redirect("/campgrounds");
};
