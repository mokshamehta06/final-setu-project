// Cart functionality
document.addEventListener("DOMContentLoaded", () => {
    // Add to cart buttons
    

    
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn")
    if (addToCartButtons) {
      
      addToCartButtons.forEach((button) => {
        button.addEventListener("click", function (e) {
          e.preventDefault();
          
          const productId = this.dataset.id;
          const quantityInput = document.querySelector(`input[data-product-id="${productId}"]`)
          const quantity = quantityInput ? Number.parseInt(quantityInput.value) : 1
  
          addToCart(productId, quantity)
        })
      })
    }
    else{
      console.log("button not found");
    }
  
    // Update cart count on page load
    updateCartCount()
  
    // Function to add item to cart
    function addToCart(productId, quantity = 1) {
    //  alert("add to cart function called") 
      fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Show success message
            alert("success");
            showToast("Product added to cart successfully!", "success")
  
            // Update cart count
            updateCartCount()
          } else {
            showToast(data.message, "error")
          }
        })
        .catch((error) => {
          console.error("Error adding to cart:", error)
          showToast("Failed to add product to cart. Please try again.", "error")
        })
    }
  
    // Function to update cart count
    function updateCartCount() {
      fetch("/api/cart/count")
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const cartCountElements = document.querySelectorAll(".cart-count")
            cartCountElements.forEach((element) => {
              element.textContent = data.count
  
              // Show/hide based on count
              if (data.count > 0) {
                element.classList.remove("d-none")
              } else {
                element.classList.add("d-none")
              }
            })
          }
        })
        .catch((error) => {
          console.error("Error getting cart count:", error)
        })
    }
  
    // Function to show toast notification
    function showToast(message, type = "info") {
      // Check if toast container exists, if not create it
      let toastContainer = document.querySelector(".toast-container")
      if (!toastContainer) {
        toastContainer = document.createElement("div")
        toastContainer.className = "toast-container position-fixed bottom-0 end-0 p-3"
        document.body.appendChild(toastContainer)
      }
  
      // Create toast element
      const toastId = "toast-" + Date.now()
      const toast = document.createElement("div")
      toast.className = `toast align-items-center text-white bg-${type === "success" ? "success" : type === "error" ? "danger" : "primary"}`
      toast.setAttribute("role", "alert")
      toast.setAttribute("aria-live", "assertive")
      toast.setAttribute("aria-atomic", "true")
      toast.setAttribute("id", toastId)
  
      // Toast content
      toast.innerHTML = `
        <div class="d-flex">
          <div class="toast-body">
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      `
  
      // Add toast to container
      toastContainer.appendChild(toast)
  
      // Initialize and show toast
      const bsToast = new bootstrap.Toast(toast)
      bsToast.show()
  
      // Remove toast after it's hidden
      toast.addEventListener("hidden.bs.toast", () => {
        toast.remove()
      })
    }
  })
  
 
  















































































  