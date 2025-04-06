// public/js/agency-orders.js
document.addEventListener('DOMContentLoaded', function() {
    const statusFilter = document.getElementById('statusFilter');
    const orderRows = document.querySelectorAll('.order-row');
    
    // Filter orders by status
    statusFilter.addEventListener('change', function() {
      const selectedStatus = this.value;
      
      orderRows.forEach(row => {
        const rowStatus = row.dataset.status;
        
        if (selectedStatus === 'all' || rowStatus === selectedStatus) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
      
      // Show empty state if no orders match filter
      const visibleOrders = document.querySelectorAll('.order-row[style=""]');
      const ordersContainer = document.querySelector('.orders-container');
      const existingEmptyState = document.querySelector('.empty-state-filtered');
      
      if (visibleOrders.length === 0 && selectedStatus !== 'all') {
        if (!existingEmptyState) {
          const emptyState = document.createElement('div');
          emptyState.className = 'empty-state empty-state-filtered';
          emptyState.innerHTML = `
            <div class="empty-state-icon">
              <i class="fas fa-filter"></i>
            </div>
            <h2>No ${selectedStatus} orders</h2>
            <p>There are no orders with the status "${selectedStatus}" at the moment.</p>
          `;
          
          // Insert after the table
          const ordersTable = document.querySelector('.orders-table');
          if (ordersTable) {
            ordersTable.style.display = 'none';
            ordersContainer.appendChild(emptyState);
          }
        }
      } else {
        // Show table and remove empty state if it exists
        const ordersTable = document.querySelector('.orders-table');
        if (ordersTable) {
          ordersTable.style.display = '';
        }
        
        if (existingEmptyState) {
          existingEmptyState.remove();
        }
      }
    });
  });