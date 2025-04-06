/**
 * Agency Dashboard JavaScript
 * This file handles the functionality for the agency dashboard page
 */

document.addEventListener("DOMContentLoaded", () => {
  // Set up event listeners for the dashboard
  //setupDashboardEventListeners()

  // Initialize product management
  //initializeProductManagement()

  // Initialize order management
  //initializeOrderManagement()

  // Initialize AI assistant
  //initializeAIAssistant()

  // Initialize profile and notifications
  //initializeProfileAndNotifications()

  // Add Product Button
  const addProductBtn = document.getElementById("addProductBtn")
  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      window.location.href = "/agency/products/add"
    })
  }

  // Edit Product Buttons
  const editButtons = document.querySelectorAll(".btn-edit")
  if (editButtons) {
    editButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.getAttribute("data-id")
        window.location.href = `/agency/products/edit/${productId}`
      })
    })
  }

  // Delete Product Buttons
  const deleteButtons = document.querySelectorAll(".btn-delete")
  if (deleteButtons) {
    deleteButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.getAttribute("data-id")
        if (confirm("Are you sure you want to delete this product?")) {
          // Create a form to submit the delete request
          const form = document.createElement("form")
          form.method = "POST"
          form.action = `/agency/products/delete/${productId}`
          document.body.appendChild(form)
          form.submit()
        }
      })
    })
  }

  // Front Page View Button
  const frontPageViewBtn = document.querySelector(".front-page-view")
  if (frontPageViewBtn) {
    frontPageViewBtn.addEventListener("click", () => {
      window.open("/", "_blank")
    })
  }

  // Product Search
  const productSearch = document.getElementById("productSearch")
  if (productSearch) {
    productSearch.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase()
      const productCards = document.querySelectorAll(".product-card")

      productCards.forEach((card) => {
        const productName = card.querySelector("h3").textContent.toLowerCase()
        const productDesc = card.querySelector("p").textContent.toLowerCase()

        if (productName.includes(searchTerm) || productDesc.includes(searchTerm)) {
          card.style.display = ""
        } else {
          card.style.display = "none"
        }
      })
    })
  }

  // Category Filter
  const categoryFilter = document.getElementById("categoryFilter")
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterProducts)
  }

  // Condition Filter
  const conditionFilter = document.getElementById("conditionFilter")
  if (conditionFilter) {
    conditionFilter.addEventListener("change", filterProducts)
  }

  // Sort By
  const sortBy = document.getElementById("sortBy")
  if (sortBy) {
    sortBy.addEventListener("change", sortProducts)
  }

  // Profile Dropdown
  const profileElement = document.querySelector(".profile")
  if (profileElement) {
    profileElement.addEventListener("click", function (e) {
      e.stopPropagation()
      const dropdownMenu = this.querySelector(".dropdown-menu")
      if (dropdownMenu) {
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block"
      }
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      const dropdownMenu = profileElement.querySelector(".dropdown-menu")
      if (dropdownMenu) {
        dropdownMenu.style.display = "none"
      }
    })
  }

  // Notifications Dropdown
  const notificationsElement = document.querySelector(".notifications")
  if (notificationsElement) {
    notificationsElement.addEventListener("click", function (e) {
      e.stopPropagation()
      const dropdownMenu = this.querySelector(".dropdown-menu")
      if (dropdownMenu) {
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block"

        // Load notifications when opening dropdown
        if (dropdownMenu.style.display === "block") {
          loadNotifications()
        }
      }
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      const dropdownMenu = notificationsElement.querySelector(".dropdown-menu")
      if (dropdownMenu) {
        dropdownMenu.style.display = "none"
      }
    })

    // Mark all as read
    const markAllReadBtn = document.querySelector(".mark-all-read")
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        markAllNotificationsAsRead()
      })
    }
  }

  // AI Assistant
  initializeAIAssistant()
})

/**
 * Set up event listeners for the dashboard
 */
function setupDashboardEventListeners() {
  // Product search functionality
  const productSearch = document.getElementById("productSearch")
  if (productSearch) {
    productSearch.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase()
      const productCards = document.querySelectorAll(".product-card")

      productCards.forEach((card) => {
        const productName = card.querySelector("h3").textContent.toLowerCase()
        const productDesc = card.querySelector("p").textContent.toLowerCase()

        if (productName.includes(searchTerm) || productDesc.includes(searchTerm)) {
          card.style.display = ""
        } else {
          card.style.display = "none"
        }
      })
    })
  }

  // Category filter
  const categoryFilter = document.getElementById("categoryFilter")
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterProducts)
  }

  // Condition filter
  const conditionFilter = document.getElementById("conditionFilter")
  if (conditionFilter) {
    conditionFilter.addEventListener("change", filterProducts)
  }

  // Sort by
  const sortBy = document.getElementById("sortBy")
  if (sortBy) {
    sortBy.addEventListener("change", sortProducts)
  }
}

// Filter products based on category and condition
function filterProducts() {
  const categoryFilter = document.getElementById("categoryFilter")
  const conditionFilter = document.getElementById("conditionFilter")

  if (!categoryFilter || !conditionFilter) return

  const category = categoryFilter.value
  const condition = conditionFilter.value
  const productCards = document.querySelectorAll(".product-card")

  productCards.forEach((card) => {
    const productCategory = card.dataset.category
    const productCondition = card.dataset.condition
    let showCard = true

    if (category !== "all" && productCategory !== category) {
      showCard = false
    }

    if (condition !== "all" && productCondition !== condition) {
      showCard = false
    }

    card.style.display = showCard ? "" : "none"
  })
}

// Sort products based on criteria
function sortProducts() {
  const sortBy = document.getElementById("sortBy")
  if (!sortBy) return

  const sortValue = sortBy.value
  const productGrid = document.querySelector(".product-grid")
  const productCards = Array.from(document.querySelectorAll(".product-card"))

  productCards.sort((a, b) => {
    switch (sortValue) {
      case "newest":
        return b.dataset.id.localeCompare(a.dataset.id)
      case "oldest":
        return a.dataset.id.localeCompare(b.dataset.id)
      case "price-high":
        const priceA = Number.parseFloat(a.querySelector(".product-price").textContent.replace("$", ""))
        const priceB = Number.parseFloat(b.querySelector(".product-price").textContent.replace("$", ""))
        return priceB - priceA
      case "price-low":
        const priceC = Number.parseFloat(a.querySelector(".product-price").textContent.replace("$", ""))
        const priceD = Number.parseFloat(b.querySelector(".product-price").textContent.replace("$", ""))
        return priceC - priceD
      case "name-asc":
        return a.querySelector("h3").textContent.localeCompare(b.querySelector("h3").textContent)
      case "name-desc":
        return b.querySelector("h3").textContent.localeCompare(a.querySelector("h3").textContent)
      default:
        return 0
    }
  })

  // Remove all product cards
  productCards.forEach((card) => card.remove())

  // Append sorted cards
  productCards.forEach((card) => productGrid.appendChild(card))
}

/**
 * Initialize product management
 */
function initializeProductManagement() {
  // Add event listener to "Add New Product" buttons
  const addProductBtn = document.getElementById("addProductBtn")
  if (addProductBtn) {
    addProductBtn.addEventListener("click", showAddProductModal)
  }

  // Handle product edit and delete buttons
  document.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("btn-delete")) {
      const productId = e.target.dataset.id
      if (productId) {
        showDeleteConfirmation(productId)
      }
    }

    if (e.target && e.target.classList.contains("btn-edit")) {
      const productId = e.target.dataset.id
      if (productId) {
        showEditProductModal(productId)
      }
    }
  })
}

/**
 * Show the Add Product modal
 */
function showAddProductModal() {
  // Create modal
  const modal = document.createElement("div")
  modal.className = "modal"
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Add New Product</h2>
      <form id="product-form" action="/agency/products/add" method="post" enctype="multipart/form-data">
        <div class="form-group">
          <label for="name">Product Name</label>
          <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" name="description" required></textarea>
        </div>
        <div class="form-group">
          <label for="category">Category</label>
          <select id="category" name="category">
            <option value="electronics">Electronics</option>
            <option value="mobile">Mobile Phones</option>
            <option value="laptops">Laptops</option>
            <option value="cameras">Cameras</option>
            <option value="jewelry">Jewelry</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home & Kitchen</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label for="condition">Condition</label>
          <select id="condition" name="condition">
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>
        <div class="form-group">
          <label for="price">Price ($)</label>
          <input type="number" id="price" name="price" min="0" step="0.01" required>
        </div>
        <div class="form-group">
          <label for="stock">Stock Quantity</label>
          <input type="number" id="stock" name="stock" min="1" value="1" required>
        </div>
        <div class="form-group">
          <label for="image">Product Image</label>
          <input type="file" id="image" name="image" accept="image/*">
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="seizureProof" name="seizureProof"> 
            Government Seizure Proof Available
          </label>
        </div>
        <div class="form-group">
          <label for="source">Source of Goods</label>
          <select id="source" name="source">
            <option value="law-enforcement">Law Enforcement Auction</option>
            <option value="customs">Customs Seizure</option>
            <option value="tax-authority">Tax Authority Confiscation</option>
            <option value="bankruptcy">Bankruptcy Auction</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <button type="submit" class="btn-primary">Add Product</button>
        </div>
      </form>
    </div>
  `

  document.body.appendChild(modal)

  // Close modal functionality
  const closeBtn = modal.querySelector(".close")
  closeBtn.addEventListener("click", () => {
    modal.remove()
  })

  // Close when clicking outside modal content
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove()
    }
  })
}

/**
 * Show the Edit Product modal
 * @param {string} productId - Product ID
 */
function showEditProductModal(productId) {
  // Fetch product data
  fetch(`/api/products/${productId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((product) => {
      // Create modal with product data
      const modal = document.createElement("div")
      modal.className = "modal"
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>Edit Product</h2>
          <form id="edit-product-form" action="/agency/products/edit/${productId}" method="post" enctype="multipart/form-data">
            <div class="form-group">
              <label for="name">Product Name</label>
              <input type="text" id="name" name="name" value="${product.name}" required>
            </div>
            <div class="form-group">
              <label for="description">Description</label>
              <textarea id="description" name="description" required>${product.description}</textarea>
            </div>
            <div class="form-group">
              <label for="category">Category</label>
              <select id="category" name="category">
                <option value="electronics" ${product.category === "electronics" ? "selected" : ""}>Electronics</option>
                <option value="mobile" ${product.category === "mobile" ? "selected" : ""}>Mobile Phones</option>
                <option value="laptops" ${product.category === "laptops" ? "selected" : ""}>Laptops</option>
                <option value="cameras" ${product.category === "cameras" ? "selected" : ""}>Cameras</option>
                <option value="jewelry" ${product.category === "jewelry" ? "selected" : ""}>Jewelry</option>
                <option value="clothing" ${product.category === "clothing" ? "selected" : ""}>Clothing</option>
                <option value="home" ${product.category === "home" ? "selected" : ""}>Home & Kitchen</option>
                <option value="other" ${product.category === "other" ? "selected" : ""}>Other</option>
              </select>
            </div>
            <div class="form-group">
              <label for="condition">Condition</label>
              <select id="condition" name="condition">
                <option value="excellent" ${product.condition === "excellent" ? "selected" : ""}>Excellent</option>
                <option value="good" ${product.condition === "good" ? "selected" : ""}>Good</option>
                <option value="fair" ${product.condition === "fair" ? "selected" : ""}>Fair</option>
                <option value="poor" ${product.condition === "poor" ? "selected" : ""}>Poor</option>
              </select>
            </div>
            <div class="form-group">
              <label for="price">Price ($)</label>
              <input type="number" id="price" name="price" value="${product.price}" min="0" step="0.01" required>
            </div>
            <div class="form-group">
              <label for="stock">Stock Quantity</label>
              <input type="number" id="stock" name="stock" value="${product.stock || 1}" min="1" required>
            </div>
            <div class="form-group">
              <label for="image">Product Image</label>
              <input type="file" id="image" name="image" accept="image/*">
              <p class="text-muted">Current image: ${product.image}</p>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="seizureProof" name="seizureProof" ${product.seizureProof ? "checked" : ""}> 
                Government Seizure Proof Available
              </label>
            </div>
            <div class="form-group">
              <label for="source">Source of Goods</label>
              <select id="source" name="source">
                <option value="law-enforcement" ${product.source === "law-enforcement" ? "selected" : ""}>Law Enforcement Auction</option>
                <option value="customs" ${product.source === "customs" ? "selected" : ""}>Customs Seizure</option>
                <option value="tax-authority" ${product.source === "tax-authority" ? "selected" : ""}>Tax Authority Confiscation</option>
                <option value="bankruptcy" ${product.source === "bankruptcy" ? "selected" : ""}>Bankruptcy Auction</option>
                <option value="other" ${product.source === "other" ? "selected" : ""}>Other</option>
              </select>
            </div>
            <div class="form-group">
              <button type="submit" class="btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      `

      document.body.appendChild(modal)

      // Close modal functionality
      const closeBtn = modal.querySelector(".close")
      closeBtn.addEventListener("click", () => {
        modal.remove()
      })

      // Close when clicking outside modal content
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.remove()
        }
      })
    })
    .catch((error) => {
      console.error("Error fetching product:", error)
      showNotification("Error fetching product details", "error")
    })
}

/**
 * Show delete confirmation modal
 * @param {string} productId - Product ID
 */
function showDeleteConfirmation(productId) {
  // Create confirmation modal
  const modal = document.createElement("div")
  modal.className = "modal"
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Confirm Delete</h2>
      <p>Are you sure you want to delete this product?</p>
      <div class="button-group" style="display: flex; gap: 10px; margin-top: 20px;">
        <form action="/agency/products/delete/${productId}" method="post" style="flex: 1;">
          <button type="submit" class="btn-small btn-delete" style="width: 100%;">Delete</button>
        </form>
        <button id="cancel-delete" class="btn-small" style="flex: 1;">Cancel</button>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Close modal functionality
  const closeBtn = modal.querySelector(".close")
  closeBtn.addEventListener("click", () => {
    modal.remove()
  })

  // Close when clicking outside modal content
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove()
    }
  })

  // Cancel button
  const cancelBtn = document.getElementById("cancel-delete")
  cancelBtn.addEventListener("click", () => {
    modal.remove()
  })
}

/**
 * Initialize order management
 */
function initializeOrderManagement() {
  // Add event listeners for View buttons in orders table
  const viewButtons = document.querySelectorAll(".table-container .btn-small")
  viewButtons.forEach((button) => {
    if (button.textContent.trim() === "View") {
      button.addEventListener("click", function () {
        const orderId = this.closest("a").getAttribute("href").split("/").pop()
        window.location.href = `/agency/orders/${orderId}`
      })
    }
  })

  // Add filter controls if needed
  const filterButton = document.querySelector(".btn-filter")
  if (filterButton) {
    filterButton.addEventListener("click", () => {
      addFilterControls()
    })
  }
}

// Initialize AI Assistant
function initializeAIAssistant() {
  const aiToggle = document.querySelector(".ai-assistant-toggle")
  const aiPanel = document.querySelector(".ai-assistant-panel")
  const aiClose = document.getElementById("ai-close")
  const aiInput = document.getElementById("ai-input")
  const aiSend = document.getElementById("ai-send")
  const aiConversation = document.getElementById("ai-conversation")
  const aiToolsToggle = document.getElementById("ai-tools-toggle")
  const aiToolsPanel = document.getElementById("ai-tools-panel")
  const quickActions = document.querySelectorAll(".quick-action")

  if (!aiToggle) return

  // Toggle AI Assistant
  aiToggle.addEventListener("click", () => {
    aiPanel.style.display = aiPanel.style.display === "none" || !aiPanel.style.display ? "flex" : "none"
  })

  if (aiClose) {
    aiClose.addEventListener("click", () => {
      aiPanel.style.display = "none"
    })
  }

  // Toggle Tools Panel
  if (aiToolsToggle && aiToolsPanel) {
    aiToolsToggle.addEventListener("click", () => {
      aiToolsPanel.style.display =
        aiToolsPanel.style.display === "none" || !aiToolsPanel.style.display ? "block" : "none"
    })
  }

  // Handle Send Message
  if (aiSend && aiInput) {
    aiSend.addEventListener("click", () => sendAIMessage(aiInput, aiConversation))
    aiInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendAIMessage(aiInput, aiConversation)
    })
  }

  // Handle Quick Actions
  if (quickActions && aiInput) {
    quickActions.forEach((action) => {
      action.addEventListener("click", () => {
        aiInput.value = action.textContent
        sendAIMessage(aiInput, aiConversation)
      })
    })
  }

  // Image Analysis Tool
  const imageAnalysisTool = document.getElementById("tool-image-analysis")
  if (imageAnalysisTool && aiConversation) {
    imageAnalysisTool.addEventListener("click", () => {
      handleImageAnalysis(aiConversation)
    })
  }

  // Document Scan Tool
  const documentScanTool = document.getElementById("tool-document-scan")
  if (documentScanTool && aiConversation) {
    documentScanTool.addEventListener("click", () => {
      handleDocumentScan(aiConversation)
    })
  }

  // Auto Valuation Tool
  const valuationTool = document.getElementById("tool-valuation")
  if (valuationTool && aiConversation) {
    valuationTool.addEventListener("click", () => {
      handleAutoValuation(aiConversation)
    })
  }
}

/**
 * Initialize profile and notifications
 */
function initializeProfileAndNotifications() {
  // Get the profile element that contains the dropdown
  const profileElement = document.querySelector(".profile")

  if (profileElement) {
    profileElement.addEventListener("click", function (e) {
      e.stopPropagation()
      const dropdownMenu = this.querySelector(".dropdown-menu")
      if (dropdownMenu) {
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block"
      }
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      const dropdownMenu = profileElement.querySelector(".dropdown-menu")
      if (dropdownMenu) {
        dropdownMenu.style.display = "none"
      }
    })
  }

  // Notifications Dropdown
  const notificationsElement = document.querySelector(".notifications")
  if (notificationsElement) {
    notificationsElement.addEventListener("click", function (e) {
      e.stopPropagation()
      const dropdownMenu = this.querySelector(".dropdown-menu")
      if (dropdownMenu) {
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block"

        // Load notifications when opening dropdown
        if (dropdownMenu.style.display === "block") {
          loadNotifications()
        }
      }
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      const dropdownMenu = notificationsElement.querySelector(".dropdown-menu")
      if (dropdownMenu) {
        dropdownMenu.style.display = "none"
      }
    })

    // Mark all as read
    const markAllReadBtn = document.querySelector(".mark-all-read")
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        markAllNotificationsAsRead()
      })
    }
  }
}

// Load notifications
function loadNotifications() {
  const notificationsList = document.getElementById("notificationsList")
  if (!notificationsList) return

  fetch("/agency/notifications")
    .then((response) => response.json())
    .then((notifications) => {
      if (notifications.length === 0) {
        notificationsList.innerHTML = '<div class="notification"><p>No notifications</p></div>'
        return
      }

      let html = ""
      notifications.forEach((notification) => {
        const date = new Date(notification.createdAt)
        const timeAgo = getTimeAgo(date)

        html += `
          <div class="notification ${notification.read ? "read" : ""}">
            <p><strong>${notification.title}</strong></p>
            <p>${notification.message}</p>
            <span class="time">${timeAgo}</span>
          </div>
        `
      })

      notificationsList.innerHTML = html
    })
    .catch((error) => {
      console.error("Error loading notifications:", error)
      notificationsList.innerHTML = '<div class="notification"><p>Error loading notifications</p></div>'
    })
}

// Mark all notifications as read
function markAllNotificationsAsRead() {
  fetch("/agency/notifications/read-all", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Remove notification badge
        const badge = document.querySelector(".notifications .badge")
        if (badge) {
          badge.style.display = "none"
        }

        // Change appearance of notifications to "read"
        const notifications = document.querySelectorAll(".notifications-list .notification")
        notifications.forEach((notif) => {
          notif.classList.add("read")
        })

        showNotification("All notifications marked as read", "info")
      }
    })
    .catch((error) => {
      console.error("Error marking notifications as read:", error)
    })
}

/**
 * Load notifications
 */
/*function loadNotifications() {
  const notificationsList = document.getElementById("notificationsList")
  if (!notificationsList) return

  fetch("/agency/notifications")
    .then((response) => response.json())
    .then((notifications) => {
      if (notifications.length === 0) {
        notificationsList.innerHTML = '<div class="notification"><p>No notifications</p></div>'
        return
      }

      let html = ""
      notifications.forEach((notification) => {
        const date = new Date(notification.createdAt)
        const timeAgo = getTimeAgo(date)

        html += `
          <div class="notification ${notification.read ? "read" : ""}">
            <p><strong>${notification.title}</strong></p>
            <p>${notification.message}</p>
            <span class="time">${timeAgo}</span>
          </div>
        `
      })

      notificationsList.innerHTML = html
    })
    .catch((error) => {
      console.error("Error loading notifications:", error)
      notificationsList.innerHTML = '<div class="notification"><p>Error loading notifications</p></div>'
    })
}*/

// Get time ago string
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000)

  let interval = Math.floor(seconds / 31536000)
  if (interval > 1) return interval + " years ago"
  if (interval === 1) return "1 year ago"

  interval = Math.floor(seconds / 2592000)
  if (interval > 1) return interval + " months ago"
  if (interval === 1) return "1 month ago"

  interval = Math.floor(seconds / 86400)
  if (interval > 1) return interval + " days ago"
  if (interval === 1) return "1 day ago"

  interval = Math.floor(seconds / 3600)
  if (interval > 1) return interval + " hours ago"
  if (interval === 1) return "1 hour ago"

  interval = Math.floor(seconds / 60)
  if (interval > 1) return interval + " minutes ago"
  if (interval === 1) return "1 minute ago"

  return "just now"
}

/**
 * Get time ago string
 * @param {Date} date - Date to calculate time ago from
 * @returns {string} Time ago string
 */
/*function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000)

  let interval = Math.floor(seconds / 31536000)
  if (interval > 1) return interval + " years ago"
  if (interval === 1) return "1 year ago"

  interval = Math.floor(seconds / 2592000)
  if (interval > 1) return interval + " months ago"
  if (interval === 1) return "1 month ago"

  interval = Math.floor(seconds / 86400)
  if (interval > 1) return interval + " days ago"
  if (interval === 1) return "1 day ago"

  interval = Math.floor(seconds / 3600)
  if (interval > 1) return interval + " hours ago"
  if (interval === 1) return "1 hour ago"

  interval = Math.floor(seconds / 60)
  if (interval > 1) return interval + " minutes ago"
  if (interval === 1) return "1 minute ago"

  return "just now"
}*/

// Show notification
function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  document.body.appendChild(notification)

  // Add visible class after a small delay (for animation)
  setTimeout(() => {
    notification.classList.add("visible")
  }, 10)

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove("visible")
    setTimeout(() => {
      notification.remove()
    }, 300) // Wait for fade out animation
  }, 3000)
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 */
/*function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  document.body.appendChild(notification)

  // Add visible class after a small delay (for animation)
  setTimeout(() => {
    notification.classList.add("visible")
  }, 10)

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove("visible")
    setTimeout(() => {
      notification.remove()
    }, 300) // Wait for fade out animation
  }, 3000)
}*/

/**
 * Send AI message
 * @param {HTMLElement} aiInput - AI input element
 * @param {HTMLElement} aiConversation - AI conversation element
 */
function sendAIMessage(aiInput, aiConversation) {
  const message = aiInput.value.trim()
  if (!message) return

  // Add user message to conversation
  addMessageToConversation(message, "user", aiConversation)
  aiInput.value = ""

  // Show thinking indicator
  showThinkingIndicator(aiConversation)

  // Process with AI (simulated)
  setTimeout(() => {
    processAIMessage(message, aiConversation)
  }, 1500) // Simulating API call delay
}

/**
 * Add message to conversation
 * @param {string} text - Message text
 * @param {string} sender - Message sender (user or ai)
 * @param {HTMLElement} aiConversation - AI conversation element
 */
function addMessageToConversation(text, sender, aiConversation) {
  const messageElement = document.createElement("div")
  messageElement.className = sender === "user" ? "user-message" : "ai-message"
  messageElement.textContent = text
  aiConversation.appendChild(messageElement)
  aiConversation.scrollTop = aiConversation.scrollHeight
}

/**
 * Show thinking indicator
 * @param {HTMLElement} aiConversation - AI conversation element
 */
function showThinkingIndicator(aiConversation) {
  const indicator = document.createElement("div")
  indicator.className = "thinking-indicator"
  indicator.innerHTML =
    '<div class="thinking-dot"></div><div class="thinking-dot"></div><div class="thinking-dot"></div>'
  indicator.id = "thinking-indicator"
  aiConversation.appendChild(indicator)
  aiConversation.scrollTop = aiConversation.scrollHeight
}

/**
 * Remove thinking indicator
 * @param {HTMLElement} aiConversation - AI conversation element
 */
function removeThinkingIndicator(aiConversation) {
  const indicator = document.getElementById("thinking-indicator")
  if (indicator) indicator.remove()
}

/**
 * Process AI message
 * @param {string} message - User message
 * @param {HTMLElement} aiConversation - AI conversation element
 */
function processAIMessage(message, aiConversation) {
  // Predefined responses for the seized goods platform
  const responses = {
    "product valuation":
      "Based on market analysis, I estimate the value range for this item to be between $300 and $450. This considers its condition, market demand, and recent comparable sales.",
    "legal compliance":
      "I've analyzed the documentation. This item appears to comply with relevant regulations for seized goods. Please ensure you have Form XYZ completed before listing.",
    "market analysis":
      "Current market trends show increasing demand for this category. Optimal pricing would be $399 with estimated time-to-sell of 5-7 days.",
    "generate report":
      "I've created a detailed report. The report includes inventory status, compliance verification, and market valuation. Would you like me to send this to your email?",
    "add product":
      "To add a new product, I'll need: item description, condition, photos, and any legal documentation. I can automatically categorize and describe the item once photos are uploaded.",
    help: "I can help with: product valuation, legal compliance checks, market analysis, report generation, inventory management, and order processing. What would you like assistance with?",
    verification:
      "I can help verify your agency credentials. Please upload your identification documents and I'll authenticate them.",
    "order status": "I can provide updates on order status. Would you like me to check the shipping status?",
    "pricing strategy":
      "Based on market analysis, I recommend a competitive pricing strategy for this item. This should optimize both sale speed and revenue.",
  }

  // Find best matching response or generate dynamic response
  let response =
    "I can help with that. Could you provide more details about what you need assistance with regarding seized goods management?"

  // Check for exact matches in predefined responses
  for (const [key, value] of Object.entries(responses)) {
    if (message.toLowerCase().includes(key)) {
      response = value
      break
    }
  }

  // Generate responses for product-specific queries
  if (message.toLowerCase().includes("laptop") || message.toLowerCase().includes("computer")) {
    response =
      "This seized laptop has been analyzed. Based on its specifications (Dell XPS 15, 16GB RAM, 512GB SSD) and condition assessment, the recommended market value is $850-950. Compliance status: Ready for sale."
  } else if (
    message.toLowerCase().includes("phone") ||
    message.toLowerCase().includes("mobile") ||
    message.toLowerCase().includes("iphone")
  ) {
    response =
      "I've analyzed this mobile device. The iPhone 12, 128GB is in excellent condition with all functionality verified. Market value range: $320-380. Legal status: Cleared for sale."
  } else if (message.toLowerCase().includes("camera")) {
    response =
      "This Canon EOS 5D Mark IV camera has been assessed. Current market analysis indicates a value of $520-600. All documentation has been verified."
  }

  // Remove thinking indicator and add AI response
  removeThinkingIndicator(aiConversation)
  addMessageToConversation(response, "ai", aiConversation)
}

// Handle image analysis
function handleImageAnalysis(aiConversation) {
  removeThinkingIndicator(aiConversation)
  addMessageToConversation(
    "Please upload an image of the seized item for analysis. I'll identify the item, assess its condition, and provide an estimated value range.",
    "ai",
    aiConversation,
  )

  // Simulate file upload dialog
  setTimeout(() => {
    addMessageToConversation("Image processing...", "ai", aiConversation)

    setTimeout(() => {
      addMessageToConversation(
        `Image Analysis Complete ✓

Item: Dell XPS 15 Laptop
Condition: Good (minor wear)
Estimated Value: $850-950
Compliance Status: Ready for sale
Recommendation: List at $899 for optimal market positioning`,
        "ai",
        aiConversation,
      )
    }, 2000)
  }, 1000)
}

// Handle document scan
function handleDocumentScan(aiConversation) {
  removeThinkingIndicator(aiConversation)
  addMessageToConversation(
    "Upload any documents related to the seized goods. I'll extract key information, verify authenticity, and check for compliance issues.",
    "ai",
    aiConversation,
  )

  // Simulate document processing
  setTimeout(() => {
    addMessageToConversation("Document processing...", "ai", aiConversation)

    setTimeout(() => {
      addMessageToConversation(
        `Document Analysis Complete ✓

Document Type: Seizure Certificate
Case #: SC-2025-0342
Issuing Authority: Valid
Compliance Status: Approved
Restrictions: None detected
Ready for listing: Yes`,
        "ai",
        aiConversation,
      )
    }, 2000)
  }, 1000)
}

// Handle auto valuation
function handleAutoValuation(aiConversation) {
  removeThinkingIndicator(aiConversation)
  addMessageToConversation(
    "I can provide an automated valuation. Please provide details about the item including brand, model, condition, and any unique features.",
    "ai",
    aiConversation,
  )

  // Simulate user input for demonstration
  setTimeout(() => {
    addMessageToConversation(
      "Canon EOS 5D Mark IV Camera, excellent condition, includes 24-70mm lens",
      "user",
      aiConversation,
    )

    showThinkingIndicator(aiConversation)

    setTimeout(() => {
      removeThinkingIndicator(aiConversation)
      addMessageToConversation(
        `Valuation Complete ✓

Item: Canon EOS 5D Mark IV w/ 24-70mm lens
Condition Factor: 0.92 (Excellent)
Base Value: $2,200
Lens Value: $800
Market Adjustment: -$350 (current market trends)

Recommended Listing Price: $2,650
Expected Time-to-Sell: 9-14 days`,
        "ai",
        aiConversation,
      )
    }, 2000)
  }, 3000)
}

/**
 * Add filter controls above the table
 */
function addFilterControls() {
  const tableHeader = document.querySelector(".filter-sort-container")

  if (!tableHeader) return

  // Check if advanced filter controls already exist
  if (tableHeader.querySelector(".advanced-filters")) return

  const filterContainer = document.createElement("div")
  filterContainer.className = "advanced-filters"
  filterContainer.innerHTML = `
    <div class="form-group">
      <label for="dateFrom">From Date</label>
      <input type="date" id="dateFrom">
    </div>
    <div class="form-group">
      <label for="dateTo">To Date</label>
      <input type="date" id="dateTo">
    </div>
    <div class="form-group">
      <label for="customerFilter">Customer</label>
      <input type="text" id="customerFilter" placeholder="Search by customer name">
    </div>
    <div class="form-group">
      <button class="btn-primary" id="applyFilters">Apply Filters</button>
      <button class="btn-secondary" id="resetFilters">Reset</button>
    </div>
  `

  tableHeader.appendChild(filterContainer)

  // Add event listeners for the new filter controls
  document.getElementById("applyFilters").addEventListener("click", applyAdvancedFilters)
  document.getElementById("resetFilters").addEventListener("click", resetFilters)

  // Show notification
  showNotification("Advanced filters added", "info")
}

/**
 * Apply advanced filters to orders table
 */
function applyAdvancedFilters() {
  const dateFrom = document.getElementById("dateFrom").value
  const dateTo = document.getElementById("dateTo").value
  const customerFilter = document.getElementById("customerFilter").value.toLowerCase()
  const statusFilter = document.getElementById("statusFilter").value

  const rows = document.querySelectorAll(".table-container table tbody tr")

  rows.forEach((row) => {
    let showRow = true

    // Check date range
    if (dateFrom || dateTo) {
      const dateCell = row.cells[3].textContent
      const rowDate = new Date(dateCell)

      if (dateFrom && new Date(dateFrom) > rowDate) {
        showRow = false
      }

      if (dateTo && new Date(dateTo) < rowDate) {
        showRow = false
      }
    }

    // Check customer name
    if (customerFilter && !row.cells[1].textContent.toLowerCase().includes(customerFilter)) {
      showRow = false
    }

    // Check status
    if (statusFilter !== "all") {
      const statusCell = row.cells[5].textContent.trim().toLowerCase()
      if (!statusCell.includes(statusFilter)) {
        showRow = false
      }
    }

    row.style.display = showRow ? "" : "none"
  })

  showNotification("Filters applied", "success")
}

/**
 * Reset all filters
 */
function resetFilters() {
  // Reset filter inputs
  if (document.getElementById("dateFrom")) document.getElementById("dateFrom").value = ""
  if (document.getElementById("dateTo")) document.getElementById("dateTo").value = ""
  if (document.getElementById("customerFilter")) document.getElementById("customerFilter").value = ""
  if (document.getElementById("statusFilter")) document.getElementById("statusFilter").value = "all"
  if (document.getElementById("dateFilter")) document.getElementById("dateFilter").value = "all"
  if (document.getElementById("sortBy")) document.getElementById("sortBy").value = "newest"

  // Show all rows
  const rows = document.querySelectorAll(".table-container table tbody tr")
  rows.forEach((row) => {
    row.style.display = ""
  })

  showNotification("Filters reset", "info")
}

