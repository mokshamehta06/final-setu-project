// SETU Customer & Cart Interactive Client Controller
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Toast Notification Container
  createToastContainer();

  // Attach Add to Cart Listeners
  initAddToCartButtons();

  // Attach Cart Page Quantity & Removal Listeners
  initCartPageControls();

  // Initialize Wishlist buttons
  initWishlistButtons();
});

// Toast notification function
function showToast(message, type = "success") {
  const container = document.getElementById("setu-toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `setu-toast setu-toast-${type}`;

  const icon = type === "success" 
    ? '<i class="fas fa-check-circle text-success"></i>' 
    : (type === "error" ? '<i class="fas fa-exclamation-circle text-danger"></i>' : '<i class="fas fa-info-circle text-primary"></i>');

  toast.innerHTML = `
    <div class="toast-content d-flex align-items-center gap-2">
      ${icon}
      <span class="toast-msg">${message}</span>
    </div>
    <button type="button" class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add("show"), 10);

  // Auto remove after 3.5s
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function createToastContainer() {
  if (!document.getElementById("setu-toast-container")) {
    const c = document.createElement("div");
    c.id = "setu-toast-container";
    c.style.cssText = `
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
    `;
    document.body.appendChild(c);
  }
}

// Add to Cart Handlers
function initAddToCartButtons() {
  document.querySelectorAll(".add-to-cart, .add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", async function (e) {
      e.preventDefault();

      const btn = this;
      const productId = btn.dataset.id || btn.dataset.productId;
      const name = btn.dataset.name || (btn.closest(".product-card") ? btn.closest(".product-card").querySelector(".product-title")?.textContent.trim() : "Item");
      const priceRaw = btn.dataset.price || (btn.closest(".product-card") ? btn.closest(".product-card").querySelector(".product-price")?.textContent.replace(/[^0-9.]/g, "") : "0");
      const price = parseFloat(priceRaw) || 0;
      const image = btn.dataset.image || (btn.closest(".product-card") ? btn.closest(".product-card").querySelector("img")?.src : "");
      
      const qtyInput = document.querySelector(`input[data-product-id="${productId}"]`);
      const quantity = qtyInput ? parseInt(qtyInput.value) : 1;

      // Loading state
      const origContent = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

      try {
        const response = await fetch("/customer/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, name, price, image, quantity }),
        });

        const data = await response.json();

        if (data.success) {
          showToast(data.message || `${name} added to cart!`, "success");
          updateAllCartCounters(data.cartCount);
          
          btn.innerHTML = '<i class="fas fa-check"></i> Added!';
          setTimeout(() => {
            btn.innerHTML = origContent;
            btn.disabled = false;
          }, 1500);
        } else {
          showToast(data.message || "Could not add product to cart", "error");
          btn.innerHTML = origContent;
          btn.disabled = false;
        }
      } catch (err) {
        console.error("Cart add error:", err);
        showToast("Error adding product to cart", "error");
        btn.innerHTML = origContent;
        btn.disabled = false;
      }
    });
  });
}

function updateAllCartCounters(count) {
  if (typeof count === "undefined" || count === null) return;
  document.querySelectorAll(".cart-count, #navCartCount, #mobileCartCount, #sidebarCartCount").forEach((el) => {
    el.textContent = count;
    el.style.transform = "scale(1.35)";
    setTimeout(() => {
      el.style.transform = "scale(1)";
    }, 200);
  });
}

// Shopping Cart Page Controls (+, -, Remove)
function initCartPageControls() {
  // Quantity Increase
  document.querySelectorAll(".cart-qty-plus").forEach((btn) => {
    btn.addEventListener("click", function () {
      const row = this.closest(".cart-item-row");
      const input = row.querySelector(".cart-qty-input");
      let val = parseInt(input.value) || 1;
      val += 1;
      input.value = val;
      updateCartItemQuantity(row.dataset.productId, val, row);
    });
  });

  // Quantity Decrease
  document.querySelectorAll(".cart-qty-minus").forEach((btn) => {
    btn.addEventListener("click", function () {
      const row = this.closest(".cart-item-row");
      const input = row.querySelector(".cart-qty-input");
      let val = parseInt(input.value) || 1;
      if (val > 1) {
        val -= 1;
        input.value = val;
        updateCartItemQuantity(row.dataset.productId, val, row);
      }
    });
  });

  // Remove Item
  document.querySelectorAll(".cart-item-remove-btn").forEach((btn) => {
    btn.addEventListener("click", async function (e) {
      e.preventDefault();
      const row = this.closest(".cart-item-row");
      const productId = row.dataset.productId;

      if (!confirm("Are you sure you want to remove this item from your cart?")) return;

      try {
        const response = await fetch("/customer/cart/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        const data = await response.json();
        if (data.success) {
          row.style.opacity = "0";
          row.style.transform = "translateX(20px)";
          setTimeout(() => {
            row.remove();
            updateCartSummary(data.subtotal, data.tax, data.shipping, data.total);
            updateAllCartCounters(data.cartCount);

            // Check if cart is now empty
            if (data.cartCount === 0 || document.querySelectorAll(".cart-item-row").length === 0) {
              location.reload();
            }
          }, 250);
          showToast("Item removed from cart", "info");
        }
      } catch (err) {
        console.error("Remove error:", err);
      }
    });
  });
}

async function updateCartItemQuantity(productId, quantity, row) {
  try {
    const response = await fetch("/customer/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });

    const data = await response.json();
    if (data.success) {
      // Update item row total
      const price = parseFloat(row.dataset.price) || 0;
      const itemSubtotalEl = row.querySelector(".cart-item-subtotal");
      if (itemSubtotalEl) {
        itemSubtotalEl.textContent = `₹${(price * quantity).toLocaleString('en-IN')}`;
      }

      updateCartSummary(data.subtotal, data.tax, data.shipping, data.total);
      updateAllCartCounters(data.cartCount);
    }
  } catch (err) {
    console.error("Cart update error:", err);
  }
}

function updateCartSummary(subtotal, tax, shipping, total) {
  const subtotalEl = document.getElementById("cartSubtotal");
  const taxEl = document.getElementById("cartTax");
  const shippingEl = document.getElementById("cartShipping");
  const totalEl = document.getElementById("cartTotal");

  if (subtotalEl) subtotalEl.textContent = `₹${parseFloat(subtotal || 0).toLocaleString('en-IN')}`;
  if (taxEl) taxEl.textContent = `₹${parseFloat(tax || 0).toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = `₹${parseFloat(shipping || 5).toFixed(2)}`;
  if (totalEl) totalEl.textContent = `₹${Math.round(total || 0).toLocaleString('en-IN')}`;
}

// Wishlist Handler
function initWishlistButtons() {
  document.querySelectorAll(".add-to-wishlist").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const icon = this.querySelector("i");
      if (icon) {
        if (icon.classList.contains("far")) {
          icon.classList.remove("far");
          icon.classList.add("fas");
          icon.style.color = "#ef4444";
          showToast("Added to wishlist ❤️", "success");
        } else {
          icon.classList.remove("fas");
          icon.classList.add("far");
          icon.style.color = "";
          showToast("Removed from wishlist", "info");
        }
      }
    });
  });
}