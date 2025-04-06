// // public/js/checkout.js
// document.addEventListener('DOMContentLoaded', function() {
//     // Payment method selection
//     const paymentMethods = document.querySelectorAll('.payment-method:not(.disabled)');
//     const checkoutForm = document.getElementById('checkoutForm');
//     const placeOrderBtn = document.getElementById('placeOrderBtn');
    
//     // Set Cash on Delivery as default payment method
//     let selectedPaymentMethod = 'cod';
    
//     paymentMethods.forEach(method => {
//       method.addEventListener('click', function() {
//         // Remove active class from all payment methods
//         paymentMethods.forEach(m => m.classList.remove('active'));
        
//         // Add active class to selected payment method
//         this.classList.add('active');
        
//         // Update selected payment method
//         selectedPaymentMethod = this.dataset.method;
        
//         // Update form action based on selected payment method
//         if (selectedPaymentMethod === 'cod') {
//           checkoutForm.action = '/customer/checkout/cash-on-delivery';
//         }
//       });
//     });
    
//     // Form validation
//     checkoutForm.addEventListener('submit', function(event) {
//       const requiredFields = checkoutForm.querySelectorAll('[required]');
//       let isValid = true;
      
//       requiredFields.forEach(field => {
//         if (!field.value.trim()) {
//           isValid = false;
//           field.classList.add('error');
          
//           // Add error message if it doesn't exist
//           let errorMessage = field.parentElement.querySelector('.error-message');
//           if (!errorMessage) {
//             errorMessage = document.createElement('div');
//             errorMessage.className = 'error-message';
//             errorMessage.textContent = 'This field is required';
//             field.parentElement.appendChild(errorMessage);
//           }
//         } else {
//           field.classList.remove('error');
          
//           // Remove error message if it exists
//           const errorMessage = field.parentElement.querySelector('.error-message');
//           if (errorMessage) {
//             errorMessage.remove();
//           }
//         }
//       });
      
//       if (!isValid) {
//         event.preventDefault();
        
//         // Scroll to first error
//         const firstError = checkoutForm.querySelector('.error');
//         if (firstError) {
//           firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
//         }
//       } else {
//         // Disable button to prevent double submission
//         placeOrderBtn.disabled = true;
//         placeOrderBtn.textContent = 'Processing...';
//       }
//     });
    
//     // Input validation
//     const phoneInput = document.getElementById('phone');
//     const zipInput = document.getElementById('zip');
    
//     phoneInput.addEventListener('input', function() {
//       // Allow only numbers
//       this.value = this.value.replace(/[^0-9]/g, '');
//     });
    
//     zipInput.addEventListener('input', function() {
//       // Allow only numbers
//       this.value = this.value.replace(/[^0-9]/g, '');
//     });
//   });



document.addEventListener('DOMContentLoaded', function() {
  // Payment method selection
  const paymentMethods = document.querySelectorAll('.payment-method:not(.disabled)');
  const checkoutForm = document.getElementById('checkoutForm');
  const placeOrderBtn = document.getElementById('placeOrderBtn');

  // Set Cash on Delivery as the default payment method
  let selectedPaymentMethod = 'cod';
  checkoutForm.action = '/customer/checkout/cash-on-delivery';

  paymentMethods.forEach(method => {
      method.addEventListener('click', function() {
          // Remove active class from all payment methods
          paymentMethods.forEach(m => m.classList.remove('active'));

          // Add active class to selected payment method
          this.classList.add('active');

          // Update selected payment method
          selectedPaymentMethod = this.dataset.method;

          // Update form action dynamically
          if (selectedPaymentMethod === 'cod') {
              checkoutForm.action = '/customer/checkout/cash-on-delivery';
          } else if (selectedPaymentMethod === 'online') {
              checkoutForm.action = '/customer/checkout/online-payment';
          }
      });
  });

  // Form validation
  checkoutForm.addEventListener('submit', function(event) {
      // Prevent multiple submissions
      if (placeOrderBtn.disabled) {
          event.preventDefault();
          return;
      }

      const requiredFields = checkoutForm.querySelectorAll('[required]');
      let isValid = true;

      requiredFields.forEach(field => {
          if (!field.value.trim()) {
              isValid = false;
              field.classList.add('error');

              // Add error message if it doesn't exist
              let errorMessage = field.parentElement.querySelector('.error-message');
              if (!errorMessage) {
                  errorMessage = document.createElement('div');
                  errorMessage.className = 'error-message';
                  errorMessage.textContent = 'This field is required';
                  field.parentElement.appendChild(errorMessage);
              }
          } else {
              field.classList.remove('error');

              // Remove error message if it exists
              const errorMessage = field.parentElement.querySelector('.error-message');
              if (errorMessage) {
                  errorMessage.remove();
              }
          }
      });

      if (!isValid) {
          event.preventDefault();

          // Scroll to first error
          const firstError = checkoutForm.querySelector('.error');
          if (firstError) {
              firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      } else {
          // Disable button to prevent double submission
          placeOrderBtn.disabled = true;
          placeOrderBtn.textContent = 'Processing...';
      }
  });

  // Input validation
  const phoneInput = document.getElementById('phone');
  const zipInput = document.getElementById('zip');

  phoneInput.addEventListener('input', function() {
      // Allow only numbers and limit length to 10 digits
      this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
  });

  zipInput.addEventListener('input', function() {
      // Allow only numbers and limit length to 6 digits
      this.value = this.value.replace(/[^0-9]/g, '').slice(0, 6);
  });
});
