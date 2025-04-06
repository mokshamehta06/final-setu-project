// Update the existing agency controller to handle registration and login with status check

const Agency = require("../models/agency")
const Notification = require("../models/notification")

// Agency login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find agency by email
    const agency = await Agency.findOne({ email })

    if (!agency) {
      req.flash("error_msg", "Invalid email or password")
      return res.redirect("/agency/login")
    }

    // Check if agency is approved
    if (agency.status !== "approved") {
      req.flash("error_msg", "Your account is pending approval. Please wait for admin verification.")
      return res.redirect("/agency/login")
    }

    // Check password
    const isMatch = await agency.comparePassword(password)

    if (!isMatch) {
      req.flash("error_msg", "Invalid email or password")
      return res.redirect("/agency/login")
    }

    // Set session
    req.session.user = {
      _id: agency._id,
      name: agency.name,
      email: agency.email,
      role: "agency",
      agencyId: agency.agencyId,
    }

    req.flash("success_msg", "You are now logged in")
    res.redirect("/agency/dashboard")
  } catch (error) {
    console.error("Login error:", error)
    req.flash("error_msg", "An error occurred during login")
    res.redirect("/agency/login")
  }
}

// Agency registration
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      street,
      city,
      state,
      zip,
      country,
      businessType,
      description,
      website,
      facebook,
      instagram,
      twitter,
      linkedin,
      accountName,
      accountNumber,
      bankName,
      ifscCode,
    } = req.body

    // Check if passwords match
    if (password !== confirmPassword) {
      req.flash("error_msg", "Passwords do not match")
      return res.redirect("/agency/register")
    }

    // Check if agency already exists
    const existingAgency = await Agency.findOne({ email })

    if (existingAgency) {
      req.flash("error_msg", "Email is already registered")
      return res.redirect("/agency/register")
    }

    // Create new agency
    const newAgency = new Agency({
      name,
      email,
      phone,
      password,
      address: {
        street,
        city,
        state,
        zip,
        country,
      },
      businessType,
      description,
      website,
      socialMedia: {
        facebook,
        instagram,
        twitter,
        linkedin,
      },
      bankDetails: {
        accountName,
        accountNumber,
        bankName,
        ifscCode,
      },
      status: "pending",
    })

    // Handle document uploads
    if (req.files) {
      if (req.files.logo) {
        newAgency.logo = `/uploads/agencies/${req.files.logo[0].filename}`
      }

      if (req.files.businessRegistration) {
        newAgency.documents.businessRegistration = `/uploads/agencies/documents/${req.files.businessRegistration[0].filename}`
      }

      if (req.files.taxId) {
        newAgency.documents.taxId = `/uploads/agencies/documents/${req.files.taxId[0].filename}`
      }

      if (req.files.identityProof) {
        newAgency.documents.identityProof = `/uploads/agencies/documents/${req.files.identityProof[0].filename}`
      }
    }

    await newAgency.save()

    // Create notification for admin
    const notification = new Notification({
      recipientType: "admin",
      type: "new-agency",
      title: "New Agency Registration",
      message: `${newAgency.name} has registered as an agency and is pending approval.`,
      data: {
        agencyId: newAgency._id,
      },
      read: false,
    })

    await notification.save()

    req.flash("success_msg", "You have registered successfully. Please wait for admin approval before logging in.")
    res.redirect("/agency/login")
  } catch (error) {
    console.error("Registration error:", error)
    req.flash("error_msg", "An error occurred during registration")
    res.redirect("/agency/register")
  }
}

// Check registration status
exports.checkStatus = async (req, res) => {
  try {
    const { email } = req.body

    // Find agency by email
    const agency = await Agency.findOne({ email })

    if (!agency) {
      return res.json({
        success: false,
        message: "Agency not found",
      })
    }

    return res.json({
      success: true,
      status: agency.status,
      message: agency.statusReason || "",
      agencyId: agency.agencyId,
    })
  } catch (error) {
    console.error("Check status error:", error)
    return res.json({
      success: false,
      message: "An error occurred while checking status",
    })
  }
}

