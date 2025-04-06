document.addEventListener('DOMContentLoaded', function() {
    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
  
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
      });
    }

    

  
    // Payment method tabs
    const paymentTabs = document.querySelectorAll('.payment-method-tab');
    const paymentContents = document.querySelectorAll('.payment-method-content');
    const paymentMethodInput = document.getElementById('paymentMethod');
  
    if (paymentTabs.length > 0 && paymentContents.length > 0) {
      paymentTabs.forEach(tab => {
        tab.addEventListener('click', function() {
          const method = this.getAttribute('data-method');
          
          // Update active tab
          paymentTabs.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          
          // Update active content
          paymentContents.forEach(content => content.classList.remove('active'));
          document.getElementById(`${method}-content`).classList.add('active');
          
          // Update hidden input
          if (paymentMethodInput) {
            paymentMethodInput.value = method;
          }
        });
      });
    }
  
    // Cart functionality
    loadCart();
  
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    if (addToCartButtons.length > 0) {
      addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
          const productId = this.getAttribute('data-id');
          const name = this.getAttribute('data-name');
          const price = this.getAttribute('data-price');
          const image = this.getAttribute('data-image');
          
          addToCart(productId, name, price, image);
        });
      });
    }
  
    // Initialize cart page if we're on it
    const cartItemsContainer = document.getElementById('cartItems');
    if (cartItemsContainer) {
      renderCartItems();
    }
  });
  
  // Cart functions
  function loadCart() {
    let cart = [];
    
    // Try to get cart from session storage
    try {
      cart = JSON.parse(sessionStorage.getItem('setuCart')) || [];
    } catch (error) {
      console.error('Error loading cart:', error);
      cart = [];
    }
    
    updateCartCount(cart);
    return cart;
  }
  
  function saveCart(cart) {
    sessionStorage.setItem('setuCart', JSON.stringify(cart));
    updateCartCount(cart);
  }
  
  function updateCartCount(cart) {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update cart count in sidebar
    const sidebarCartCount = document.getElementById('sidebarCartCount');
    if (sidebarCartCount) {
      sidebarCartCount.textContent = count;
    }
    
    // Update cart count in mobile header
    const mobileCartCount = document.getElementById('mobileCartCount');
    if (mobileCartCount) {
      mobileCartCount.textContent = count;
    }
  }
  
  function addToCart(productId, name, price, image) {
    const cart = loadCart();
    
    // Check if product already in cart
    const existingItemIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingItemIndex !== -1) {
      // Update quantity if product already in cart
      cart[existingItemIndex].quantity += 1;
    } else {
      // Add new product to cart
      cart.push({
        productId,
        name,
        price: parseFloat(price),
        image,
        quantity: 1
      });
    }
    
    saveCart(cart);
    showNotification(`${name} added to cart!`);
  }
  
  function renderCartItems() {
    const cart = loadCart();
    const cartItemsContainer = document.getElementById('cartItems');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty">
          <p>Your cart is empty.</p>
        </div>
      `;
      
      if (checkoutBtn) {
        checkoutBtn.classList.add('disabled');
        checkoutBtn.setAttribute('disabled', 'disabled');
      }
      
      updateCartTotals(0, 0, 5, 0);
      return;
    }
    
    let cartHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      cartHTML += `
        <div class="cart-item" data-id="${item.productId}">
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            <div class="cart-item-actions">
              <div class="cart-item-quantity">
                <button class="cart-quantity-btn decrease-quantity" data-id="${item.productId}">
                  <i class="fas fa-minus"></i>
                </button>
                <input type="text" class="cart-quantity-input" value="${item.quantity}" readonly>
                <button class="cart-quantity-btn increase-quantity" data-id="${item.productId}">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <button class="cart-item-remove" data-id="${item.productId}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    
    // Calculate totals
    const tax = subtotal * 0.1;
    const shipping = 5;
    const total = subtotal + tax + shipping;
    
    updateCartTotals(subtotal, tax, shipping, total);
    
    if (checkoutBtn) {
      checkoutBtn.classList.remove('disabled');
      checkoutBtn.removeAttribute('disabled');
    }
    
    // Add event listeners for quantity buttons
    const decreaseButtons = document.querySelectorAll('.decrease-quantity');
    const increaseButtons = document.querySelectorAll('.increase-quantity');
    const removeButtons = document.querySelectorAll('.cart-item-remove');
    
    decreaseButtons.forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        updateCartItemQuantity(productId, -1);
      });
    });
    
    increaseButtons.forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        updateCartItemQuantity(productId, 1);
      });
    });
    
    removeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        removeCartItem(productId);
      });
    });
  }
  
  function updateCartItemQuantity(productId, change) {
    const cart = loadCart();
    const itemIndex = cart.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) return;
    
    cart[itemIndex].quantity += change;
    
    if (cart[itemIndex].quantity < 1) {
      cart[itemIndex].quantity = 1;
    }
    
    saveCart(cart);
    renderCartItems();
  }
  
  function removeCartItem(productId) {
    const cart = loadCart();
    const updatedCart = cart.filter(item => item.productId !== productId);
    
    saveCart(updatedCart);
    renderCartItems();
    
    const removedItem = cart.find(item => item.productId === productId);
    if (removedItem) {
      showNotification(`${removedItem.name} removed from cart`);
    }
  }
  
  function updateCartTotals(subtotal, tax, shipping, total) {
    const subtotalElement = document.getElementById('cartSubtotal');
    const taxElement = document.getElementById('cartTax');
    const shippingElement = document.getElementById('cartShipping');
    const totalElement = document.getElementById('cartTotal');
    
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
  }
  
  function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Add visible class after a small delay (for animation)
    setTimeout(() => {
      notification.classList.add('visible');
    }, i10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => {
        notification.remove();
      }, 300); // Wait for fade out animation
    }, 3000);
  }
  
  // Handle flash messages
  const flashMessages = document.querySelectorAll('.notification.visible');
  if (flashMessages.length > 0) {
    flashMessages.forEach(message => {
      setTimeout(() => {
        message.classList.remove('visible');
        setTimeout(() => {
          message.remove();
        }, 300);
      }, 5000);
    });
  }