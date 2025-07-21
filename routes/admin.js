const express = require("express")
const router = express.Router()
const { isAuthenticated, isAdmin } = require("../middleware/auth")
const User = require("../models/user")
const Product = require("../models/product")
const Order = require("../models/order")
const Notification = require("../models/notification")
const path = require("path")
const fs = require("fs")
const bcrypt = require("bcryptjs")

// Admin dashboard
router.get("/dashboard", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Get counts
    const agencyCount = await User.countDocuments({ role: "agency" })
    const customerCount = await User.countDocuments({ role: "customer" })
    const productCount = await Product.countDocuments()
    const orderCount = await Order.countDocuments()

    // Get agency status counts
    const pendingAgencies = await User.countDocuments({ role: "agency", status: "pending" })
    const approvedAgencies = await User.countDocuments({ role: "agency", status: "approved" })
    const rejectedAgencies = await User.countDocuments({ role: "agency", status: "rejected" })

    // Get recent agencies
    const recentAgencies = await User.find({ role: "agency" })
      .sort({ createdAt: -1 })
      .limit(5)

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")

    // Get pending document uploads
    const agenciesWithPendingDocuments = await User.find({
      role: "agency",
      $or: [
        { "documents.businessRegistration.status": "pending", "documents.businessRegistration.path": { $exists: true } },
        { "documents.taxId.status": "pending", "documents.taxId.path": { $exists: true } },
        { "documents.identityProof.status": "pending", "documents.identityProof.path": { $exists: true } },
        { "documents.addressProof.status": "pending", "documents.addressProof.path": { $exists: true } }
      ]
    }).sort({ "documents.businessRegistration.uploadedAt": -1 }).limit(5)

    // Process agencies to extract pending documents
    const pendingDocuments = []
    agenciesWithPendingDocuments.forEach(agency => {
      const docs = agency.documents || {}
      Object.keys(docs).forEach(docType => {
        if (docs[docType].status === "pending" && docs[docType].path) {
          pendingDocuments.push({
            agencyId: agency._id,
            agencyName: agency.name,
            documentType: docType,
            documentPath: docs[docType].path,
            uploadedAt: docs[docType].uploadedAt || agency.updatedAt
          })
        }
      })
    })

    // Sort pending documents by upload date
    pendingDocuments.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))

    // Get notification count
    const notificationCount = await Notification.countDocuments({
      recipient: req.session.user._id,
      read: false,
    })

    // Create stats object
    const stats = {
      pendingAgencies: pendingAgencies || 0,
      approvedAgencies: approvedAgencies || 0,
      rejectedAgencies: rejectedAgencies || 0,
      recentAgencies: recentAgencies || [],
      pendingDocuments: pendingDocuments || []
    }

    res.render("admin/dashboard", {
      page: "dashboard",
      title: "Admin Dashboard",
      admin: req.session.user,
      agencyCount,
      customerCount,
      productCount,
      orderCount,
      recentAgencies,
      recentOrders,
      notificationCount,
      stats, // Pass the stats object to the template
      layout: 'admin-layout'
    })
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error)
    req.flash("error_msg", "Failed to load dashboard data")
    res.redirect("/")
  }
})

// List all agencies
router.get("/agencies", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const agencies = await User.find({ role: "agency" }).sort({ createdAt: -1 })

    // Get notification count
    const notificationCount = await Notification.countDocuments({
      recipient: req.session.user._id,
      read: false,
    })

    res.render("admin/agencies", {
      page: "agencies",
      title: "Manage Agencies",
      admin: req.session.user,
      agencies,
      notificationCount,
      layout: 'admin-layout'
    })
  } catch (error) {
    console.error("Error fetching agencies:", error)
    req.flash("error_msg", "Failed to load agencies")
    res.redirect("/admin/dashboard")
  }
})

// View agency details
router.get("/agencies/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const agency = await User.findById(req.params.id)

    if (!agency || agency.role !== "agency") {
      req.flash("error_msg", "Agency not found")
      return res.redirect("/admin/agencies")
    }

    // Get notification count
    const notificationCount = await Notification.countDocuments({
      recipient: req.session.user._id,
      read: false,
    })

    res.render("admin/agency-details", {
      page: "agencies",
      title: `${agency.name} - Agency Details`,
      admin: req.session.user,
      agency,
      notificationCount,
      layout: 'admin-layout'
    })
  } catch (error) {
    console.error("Error fetching agency details:", error)
    req.flash("error_msg", "Failed to load agency details")
    res.redirect("/admin/agencies")
  }
})

// Update agency status
router.post("/agencies/:id/update-status", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { status, statusReason } = req.body
    const agency = await User.findById(req.params.id)

    if (!agency || agency.role !== "agency") {
      req.flash("error_msg", "Agency not found")
      return res.redirect("/admin/agencies")
    }

    agency.status = status
    agency.statusReason = statusReason
    agency.reviewedAt = new Date()
    agency.isVerified = status === "approved"

    await agency.save()

    // Create notification for agency
    const notification = new Notification({
      recipient: agency._id,
      title: `Your agency has been ${status}`,
      message: statusReason || `Your agency has been ${status} by the admin.`,
      type: "verification",
    })

    await notification.save()

    req.flash("success_msg", `Agency ${status} successfully`)
    res.redirect(`/admin/agencies/${agency._id}`)
  } catch (error) {
    console.error("Error updating agency status:", error)
    req.flash("error_msg", "Failed to update agency status")
    res.redirect("/admin/agencies")
  }
})

// Document verification routes
router.post("/agencies/:id/documents/:documentType/approve", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id, documentType } = req.params
    const agency = await User.findById(id)

    if (!agency || agency.role !== "agency") {
      req.flash("error_msg", "Agency not found")
      return res.redirect("/admin/agencies")
    }

    // Check if document exists
    if (!agency.documents || !agency.documents[documentType]) {
      req.flash("error_msg", "Document not found")
      return res.redirect(`/admin/agencies/${id}`)
    }

    // Update document status
    agency.documents[documentType].status = "approved"

    // Check if all required documents are approved
    const requiredDocuments = ["businessRegistration", "taxId", "identityProof", "addressProof"]
    const allApproved = requiredDocuments.every(docType =>
      agency.documents[docType] && agency.documents[docType].status === "approved"
    )

    // If all documents are approved, mark the agency as verified
    if (allApproved) {
      agency.isVerified = true
      agency.status = "approved"
      agency.reviewedAt = new Date()
    }

    await agency.save()

    // Create notification for agency
    const notification = new Notification({
      recipient: agency._id,
      title: `Document Approved`,
      message: `Your ${documentType.replace(/([A-Z])/g, ' $1').toLowerCase()} document has been approved.`,
      type: "verification",
    })

    await notification.save()

    req.flash("success_msg", `Document approved successfully`)
    res.redirect(`/admin/agencies/${id}`)
  } catch (error) {
    console.error("Error approving document:", error)
    req.flash("error_msg", "Failed to approve document")
    res.redirect("/admin/agencies")
  }
})

router.post("/agencies/:id/documents/:documentType/reject", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id, documentType } = req.params
    const { reason } = req.body
    const agency = await User.findById(id)

    if (!agency || agency.role !== "agency") {
      req.flash("error_msg", "Agency not found")
      return res.redirect("/admin/agencies")
    }

    // Check if document exists
    if (!agency.documents || !agency.documents[documentType]) {
      req.flash("error_msg", "Document not found")
      return res.redirect(`/admin/agencies/${id}`)
    }

    // Update document status
    agency.documents[documentType].status = "rejected"
    agency.documents[documentType].rejectionReason = reason || "Document rejected by admin"

    // Since a document is rejected, the agency cannot be verified
    agency.isVerified = false

    await agency.save()

    // Create notification for agency
    const notification = new Notification({
      recipient: agency._id,
      title: `Document Rejected`,
      message: `Your ${documentType.replace(/([A-Z])/g, ' $1').toLowerCase()} document has been rejected: ${reason || "No reason provided"}`,
      type: "verification",
    })

    await notification.save()

    req.flash("success_msg", `Document rejected successfully`)
    res.redirect(`/admin/agencies/${id}`)
  } catch (error) {
    console.error("Error rejecting document:", error)
    req.flash("error_msg", "Failed to reject document")
    res.redirect("/admin/agencies")
  }
})

// Admin login page
router.get("/login", (req, res) => {
  if (req.session.user && req.session.user.role === "admin") {
    return res.redirect("/admin/dashboard")
  }

  res.render("admin/login", {
    title: "Admin Login",
    layout: false,
  })
})

// Admin login process
router.post("/login", async (req, res) => {
  try {
    console.log("Admin login attempt:", req.body);
    const { email, password } = req.body

    // Find admin by email and role
    const admin = await User.findOne({ email, role: "admin" })

    if (!admin) {
      console.log(`No admin found with email: ${email}`);
      req.flash("error_msg", "Invalid email or password")
      return res.redirect("/admin/login")
    }

    console.log(`Admin found: ${admin.email}`);

    // Check password directly with bcrypt
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      console.log("Password does not match");
      req.flash("error_msg", "Invalid email or password")
      return res.redirect("/admin/login")
    }

    // Set session
    req.session.user = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    }

    console.log("Admin login successful, session set:", req.session.user);
    res.redirect("/admin/dashboard")
  } catch (error) {
    console.error("Admin login error:", error)
    req.flash("error_msg", "An error occurred during login")
    res.redirect("/admin/login")
  }
})

// Admin logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err)
    }
    res.redirect("/admin/login")
  })
})

module.exports = router
