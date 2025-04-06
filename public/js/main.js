// Main JavaScript file for SETU E-commerce Platform

document.addEventListener("DOMContentLoaded", () => {
    console.log("SETU E-commerce Platform loaded")
  
    // Flash message auto-dismiss
    const flashMessages = document.querySelectorAll(".alert")
    if (flashMessages.length > 0) {
      flashMessages.forEach((message) => {
        setTimeout(() => {
          message.style.opacity = "0"
          setTimeout(() => {
            message.style.display = "none"
          }, 500)
        }, 5000)
      })
    }
  })
  
  