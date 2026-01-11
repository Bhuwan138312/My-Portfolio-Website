// ==================== NAVBAR SCROLL EFFECT ====================
const navbar = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// ==================== MOBILE MENU TOGGLE ====================
if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    mobileMenuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    navbar.classList.toggle('mobile-open');
  });

  // Close mobile menu when a link is clicked
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
      navbar.classList.remove('mobile-open');
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && mobileMenu.classList.contains('active')) {
      mobileMenuBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
      navbar.classList.remove('mobile-open');
    }
  });
}

// ==================== SMOOTH SCROLL BEHAVIOR ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    // Only preventDefault for same-page anchors
    if (
      this.pathname === window.location.pathname &&
      this.hash.length > 1 &&
      document.querySelector(this.hash)
    ) {
      e.preventDefault();
      const target = document.querySelector(this.hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
    // Otherwise let the browser follow normal navigation
  });
});

// ==================== 3D HERO IMAGE EFFECT WITH MOUSE PARALLAX ====================
const heroImage = document.getElementById('heroImage');
if (heroImage) {
  document.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    heroImage.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg)`;
  });

  document.addEventListener('mouseleave', () => {
    heroImage.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  });
}

// ==================== MOUSE PARALLAX FOR HERO SECTION ====================
const heroSection = document.querySelector('.hero-section');
if (heroSection) {
  heroSection.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Move gradient blobs
    document.querySelectorAll('.hero-section .gradient-blob').forEach((blob, index) => {
      const speed = 0.02 + (index * 0.01);
      const x = (clientX - innerWidth / 2) * speed;
      const y = (clientY - innerHeight / 2) * speed;
      blob.style.transition = 'transform 0.3s ease-out';
      blob.style.transform = `translate(${x}px, ${y}px)`;
    });
  });
}

// ==================== ENHANCED PARALLAX EFFECTS ====================
const parallaxElement = document.getElementById('parallaxElement');
let lastScrollY = 0;
let ticking = false;

function updateParallax() {
  const scrollY = lastScrollY;
  
  // Main parallax code box effect
  if (parallaxElement) {
    const parallaxY = scrollY * 0.35;
    const parallaxX = Math.sin(scrollY * 0.008) * 25;
    const tilt = (scrollY * 0.08) % 360;
    parallaxElement.style.transform = `translateY(${parallaxY}px) translateX(${parallaxX}px) rotateZ(${tilt}deg)`;
  }
  
  // Parallax for gradient blobs
  document.querySelectorAll('.gradient-blob').forEach((blob, index) => {
    const speed = 0.15 + (index * 0.05);
    const direction = index % 2 === 0 ? 1 : -1;
    const moveY = scrollY * speed * direction;
    const moveX = Math.sin(scrollY * 0.005 + index) * 30;
    blob.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });
  
  // Parallax for floating circles
  document.querySelectorAll('.floating-circle').forEach((circle, index) => {
    const speed = 0.2 + (index * 0.08);
    const moveY = scrollY * speed;
    const rotate = scrollY * 0.05 * (index % 2 === 0 ? 1 : -1);
    circle.style.transform = `translateY(${moveY}px) rotate(${rotate}deg)`;
  });
  
  // Parallax for project cards
  document.querySelectorAll('.project-card').forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const scrollPercent = (window.innerHeight - rect.top) / window.innerHeight;
    if (scrollPercent > 0 && scrollPercent < 1) {
      const moveY = (scrollPercent - 0.5) * 20;
      card.style.transform = `perspective(1000px) translateY(${moveY}px)`;
    }
  });
  
  // Parallax text fade-in effect
  document.querySelectorAll('.section-title, .section-description').forEach(element => {
    const rect = element.getBoundingClientRect();
    const scrollPercent = (window.innerHeight - rect.top) / window.innerHeight;
    if (scrollPercent > 0 && scrollPercent < 1) {
      element.style.opacity = Math.min(scrollPercent * 1.5, 1);
      element.style.transform = `translateY(${(1 - scrollPercent) * 30}px)`;
    }
  });
  
  ticking = false;
}

window.addEventListener('scroll', () => {
  lastScrollY = window.scrollY;
  if (!ticking) {
    window.requestAnimationFrame(updateParallax);
    ticking = true;
  }
});

// ==================== SCROLL TO SECTION UTILITY ====================
window.scrollToSection = function(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// ==================== INTERACTIVE PROJECT CARDS ====================
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(0px)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  });
});

// ==================== SKILL ITEMS HOVER EFFECT ====================
document.querySelectorAll('.skill-item').forEach(item => {
  item.addEventListener('mouseenter', function() {
    this.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
  });
});

// ==================== INTERSECTION OBSERVER FOR ANIMATIONS ====================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    }
  });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.project-card, .journey-box, .info-card, .stat-box').forEach(el => {
  observer.observe(el);
});

// ==================== FORMSPREE CONTACT FORM SUBMISSION ====================
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm && formMessage) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get the submit button
    const submitBtn = contactForm.querySelector('.form-submit');
    const originalBtnText = submitBtn.textContent;
    
    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    // Get form data
    const formData = new FormData(contactForm);
    
    try {
      // Send to Formspree
      const response = await fetch('https://formspree.io/f/xnjqyknw', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        // Success message
        formMessage.textContent = '✓ Message sent successfully! I\'ll get back to you soon.';
        formMessage.classList.add('success');
        formMessage.classList.remove('error');
        contactForm.reset();
      } else {
        // Error message
        const data = await response.json();
        if (data.errors) {
          formMessage.textContent = '✗ Oops! ' + data.errors.map(error => error.message).join(', ');
        } else {
          formMessage.textContent = '✗ Oops! There was a problem sending your message.';
        }
        formMessage.classList.add('error');
        formMessage.classList.remove('success');
      }
    } catch (error) {
      // Network error
      formMessage.textContent = '✗ Network error. Please check your connection and try again.';
      formMessage.classList.add('error');
      formMessage.classList.remove('success');
    }
    
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
    
    // Clear message after 5 seconds
    setTimeout(() => {
      formMessage.textContent = '';
      formMessage.classList.remove('success', 'error');
    }, 5000);
  });
}

/* ==================== PRODUCTS PAGE FUNCTIONALITY ==================== */
// All of the below only runs if downloadApp exists in the DOM (i.e. product page)
(function(){
  // ==================== DOWNLOAD CONFIGURATION ====================
  const DOWNLOAD_URLS = {
    'storepilot': 'https://github.com/Bhuwan138312/StorePilot_Release/releases/download/v1.0.0/Storepilot_setup.exe',
  };

  window.downloadApp = function(appId) {
    const downloadUrl = DOWNLOAD_URLS[appId];
    if (!downloadUrl) {
      console.error('Download URL not found for app:', appId);
      showNotification('Download URL not configured', 'error');
      return;
    }
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = ''; // Use filename from the URL
    document.body.appendChild(link);
    showNotification('Download starting...', 'info');
    link.click();
    document.body.removeChild(link);
    trackDownload(appId);
    setTimeout(() => {
      showNotification('Download started! Check your downloads folder.', 'success');
    }, 500);
  };

  function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.download-notification');
    if (existingNotification) existingNotification.remove();
    const notification = document.createElement('div');
    notification.className = `download-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${getNotificationIcon(type)}
        </svg>
        <span>${message}</span>
      </div>
      <button class="notification-close" onclick="this.parentElement.remove()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    const style = document.createElement('style');
    style.textContent = `
      .download-notification {
        position: fixed;
        top: 80px; right: 20px; background-color: white; border-radius: 12px;
        padding: 16px 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        display: flex; align-items: center; justify-content: space-between; gap: 16px; z-index: 1000;
        min-width: 320px; animation: slideIn 0.3s ease-out;
        border: 1px solid rgba(99,102,241,0.2);
      }
      @keyframes slideIn {
        from {transform: translateX(400px); opacity:0;}
        to   {transform: translateX(0); opacity:1;}
      }
      @keyframes slideOut {
        from {transform: translateX(0); opacity: 1;}
        to   {transform: translateX(400px); opacity:0;}
      }
      .notification-content {display: flex; align-items: center; gap:12px; font-size: 14px; font-weight: 500;}
      .download-notification.success {border-left: 4px solid #10b981;}
      .download-notification.success svg {color: #10b981;}
      .download-notification.error {border-left: 4px solid #ef4444;}
      .download-notification.error svg {color: #ef4444;}
      .download-notification.info {border-left: 4px solid #6366f1;}
      .download-notification.info svg {color: #6366f1;}
      .notification-close {background: none; border: none; cursor: pointer; padding: 4px; display:flex; align-items:center; color: #999; transition: color 0.2s;}
      .notification-close:hover {color: #666;}
      @media (max-width:480px){
        .download-notification{right:10px;left:10px;min-width:auto;}
      }
    `;
    if (!document.querySelector('style[data-notification-styles]')) {
      style.setAttribute('data-notification-styles', 'true');
      document.head.appendChild(style);
    }
    document.body.appendChild(notification);
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }
  function getNotificationIcon(type) {
    switch (type) {
      case 'success': return '<polyline points="20 6 9 17 4 12"></polyline>';
      case 'error': return '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>';
      case 'info': default: return '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>';
    }
  }
  function trackDownload(appId) {
    const downloadInfo = { app: appId, timestamp: new Date().toISOString(), userAgent: navigator.userAgent };
    console.log('Download tracked:', downloadInfo);
  }

  // ==================== ANIMATION FOR PRODUCT PAGE ====================
  document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    document.querySelectorAll('.product-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(card);
    });
    document.querySelectorAll('.step-card').forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = `opacity 0.6s ease ${index*0.1}s, transform 0.6s ease ${index*0.1}s`;
      observer.observe(card);
    });
    document.querySelectorAll('.faq-item').forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = `opacity 0.5s ease ${index*0.1}s, transform 0.5s ease ${index*0.1}s`;
      observer.observe(item);
    });
  });

  // Utility: Construct GitHub release download URL
  window.getGitHubReleaseUrl = function(username, repo, tag, filename) {
    return `https://github.com/${username}/${repo}/releases/download/${tag}/${filename}`;
  };
})();