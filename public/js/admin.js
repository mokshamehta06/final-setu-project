document.addEventListener("DOMContentLoaded", () => {
    // Sidebar toggle
    const sidebarToggle = document.getElementById("sidebarToggle")
    const adminSidebar = document.querySelector(".admin-sidebar")
    const adminContent = document.querySelector(".admin-content")
  
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        adminSidebar.classList.toggle("collapsed")
        adminContent.classList.toggle("expanded")
      })
    }
  
    // Close alerts
    const alertCloseButtons = document.querySelectorAll(".alert-close")
  
    alertCloseButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const alert = this.parentElement
        alert.style.display = "none"
      })
    })
  
    // Responsive sidebar
    const mediaQuery = window.matchMedia("(max-width: 992px)")
  
    function handleScreenChange(e) {
      if (e.matches) {
        // Screen is smaller than 992px
        if (adminSidebar) {
          adminSidebar.classList.add("collapsed")
        }
        if (adminContent) {
          adminContent.classList.add("expanded")
        }
      } else {
        // Screen is larger than 992px
        if (adminSidebar) {
          adminSidebar.classList.remove("collapsed")
        }
        if (adminContent) {
          adminContent.classList.remove("expanded")
        }
      }
    }
  
    // Initial check
    handleScreenChange(mediaQuery)
  
    // Add listener for changes
    mediaQuery.addEventListener("change", handleScreenChange)
  })
  
  