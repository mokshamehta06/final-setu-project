// public/js/agency-order-details.js
document.addEventListener('DOMContentLoaded', function() {
    const statusSelect = document.getElementById('status');
    const statusUpdateForm = document.querySelector('.status-update-form');
    
    // Confirm status update
    statusUpdateForm.addEventListener('submit', function(event) {
      const currentStatus = '<%= order.status %>';
      const newStatus = statusSelect.value;
      
      if (currentStatus !== newStatus) {
        const confirmUpdate = confirm(`Are you sure you want to update the order status to ${newStatus}?`);
        
        if (!confirmUpdate) {
          event.preventDefault();
        }
      }
    });
    
    // Add note suggestions based on status
    statusSelect.addEventListener('change', function() {
      const noteField = document.getElementById('note');
      const selectedStatus = this.value;
      
      let suggestedNote = '';
      
      switch (selectedStatus) {
        case 'processing':
          suggestedNote = 'Your order is now being processed and prepared for shipping.';
          break;
        case 'shipped':
          suggestedNote = 'Your order has been shipped and is on its way to you.';
          break;
        case 'delivered':
          suggestedNote = 'Your order has been delivered. Thank you for shopping with us!';
          break;
        case 'cancelled':
          suggestedNote = 'Your order has been cancelled as requested.';
          break;
        default:
          suggestedNote = '';
      }
      
      noteField.value = suggestedNote;
    });
  });