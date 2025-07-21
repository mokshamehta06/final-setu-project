// Navbar functionality

document.addEventListener('DOMContentLoaded', function() {
  // Add scroll effect to navbar
  const header = document.querySelector('header');
  
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
    
    // Check initial scroll position
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    }
  }
  
  // Mobile menu functionality (if we add a mobile menu button later)
  const mobileMenuButton = document.querySelector('.mobile-menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('active');
    });
  }
});
