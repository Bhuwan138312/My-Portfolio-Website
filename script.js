// ==================== NAVBAR SCROLL EFFECT ====================
const navbar = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ==================== MOBILE MENU TOGGLE ====================
mobileMenuBtn.addEventListener('click', () => {
  mobileMenuBtn.classList.toggle('active');
  mobileMenu.classList.toggle('active');
});

/* Close mobile menu when a link is clicked */
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
mobileNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenuBtn.classList.remove('active');
    mobileMenu.classList.remove('active');
  });
});

// ==================== 3D HERO IMAGE EFFECT ====================
const heroImage = document.getElementById('heroImage');

document.addEventListener('mousemove', (e) => {
  const { clientX, clientY } = e;
  const { innerWidth, innerHeight } = window;
  
  const x = (clientX / innerWidth - 0.5) * 20;
  const y = (clientY / innerHeight - 0.5) * 20;
  
  heroImage.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg)`;
});

/* Reset transform on mouse leave */
document.addEventListener('mouseleave', () => {
  heroImage.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
});

// ==================== SMOOTH PARALLAX EFFECT ====================
const parallaxElement = document.getElementById('parallaxElement');
let lastScrollY = 0;
let ticking = false;

/* Using requestAnimationFrame for buttery smooth 60fps parallax animation */
function updateParallax() {
  const scrollY = lastScrollY;
  
  if (parallaxElement) {
    const parallaxY = scrollY * 0.35;
    const parallaxX = Math.sin(scrollY * 0.008) * 25;
    const tilt = (scrollY * 0.08) % 360;
    
    parallaxElement.style.transform = `translateY(${parallaxY}px) translateX(${parallaxX}px) rotateZ(${tilt}deg)`;
  }
  
  ticking = false;
}

window.addEventListener('scroll', () => {
  lastScrollY = window.scrollY;
  
  if (!ticking) {
    window.requestAnimationFrame(updateParallax);
    ticking = true;
  }
});

// ==================== SCROLL TO SECTION ====================
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// ==================== FORM SUBMISSION ====================
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    message: document.getElementById('message').value
  };
  
  /* Show success message */
  formMessage.textContent = '✓ Message Sent!';
  formMessage.classList.add('success');
  formMessage.classList.remove('error');
  
  /* Reset form */
  contactForm.reset();
  
  /* Clear message after 3 seconds */
  setTimeout(() => {
    formMessage.textContent = '';
    formMessage.classList.remove('success');
  }, 3000);
});

// ==================== SMOOTH SCROLL BEHAVIOR ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
