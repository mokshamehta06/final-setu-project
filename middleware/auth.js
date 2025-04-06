// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next()
  }
  req.flash("error_msg", "Please log in to access this page")
  res.redirect("/auth/login")
}

// Role-based middleware
const isCustomer = (req, res, next) => {
  if (req.session.user && req.session.user.role === "customer") {
    return next()
  }
  req.flash("error_msg", "Access denied. Customer privileges required")
  res.redirect("/")
}

const isAgency = (req, res, next) => {
  if (req.session.user && req.session.user.role === "agency") {
    return next()
  }
  req.flash("error_msg", "Access denied. Agency privileges required")
  res.redirect("/")
}

const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    return next()
  }
  req.flash("error_msg", "Access denied. Admin privileges required")
  res.redirect("/")
}

module.exports = {
  isAuthenticated,
  isCustomer,
  isAgency,
  isAdmin,
}

