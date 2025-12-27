// ====================================
// CloudX - Enterprise Cloud Platform
// JavaScript Functionality
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initHeader();
    initScrollAnimations();
    initScrollToTop();
    initMobileMenu();
    initParallaxEffects();
});

// ====================================
// Header Scroll Effect
// ====================================
function initHeader() {
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

// ====================================
// Scroll Animations
// ====================================
function initScrollAnimations() {
    // Elements to animate on scroll
    const animateElements = document.querySelectorAll(`
        .section-header,
        .service-card,
        .solution-main,
        .solution-card,
        .dc-feature,
        .partner-logo,
        .news-card,
        .cert-item
    `);
    
    // Create Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add delay based on index for stagger effect
                const delay = entry.target.dataset.delay || index * 100;
                
                setTimeout(() => {
                    entry.target.classList.add('animate-fade-in-up');
                    entry.target.style.opacity = '1';
                }, delay % 400);
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe elements
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.dataset.delay = (index % 4) * 100;
        observer.observe(el);
    });
}

// ====================================
// Scroll to Top Button
// ====================================
function initScrollToTop() {
    const scrollTopBtn = document.getElementById('scrollTop');
    
    if (!scrollTopBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 400) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top on click
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ====================================
// Mobile Menu
// ====================================
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    if (!mobileMenuBtn) return;
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    // Close menu on link click
    const navLinks = document.querySelectorAll('.nav-item > a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            nav.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
}

// ====================================
// Parallax Effects
// ====================================
function initParallaxEffects() {
    const glows = document.querySelectorAll('.hero-glow');
    const particles = document.querySelectorAll('.hero-particles span');
    
    window.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        // Move glow elements
        glows.forEach((glow, index) => {
            const speed = (index + 1) * 20;
            const moveX = (x - 0.5) * speed;
            const moveY = (y - 0.5) * speed;
            glow.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        // Move particles
        particles.forEach((particle, index) => {
            const speed = (index + 1) * 10;
            const moveX = (x - 0.5) * speed;
            const moveY = (y - 0.5) * speed;
            particle.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });
}

// ====================================
// Smooth Scroll for Anchor Links
// ====================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        if (href === '#') return;
        
        e.preventDefault();
        
        const target = document.querySelector(href);
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ====================================
// Counter Animation for Stats
// ====================================
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ====================================
// Intersection Observer for Stats
// ====================================
const statNumbers = document.querySelectorAll('.stat-number');
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const text = entry.target.textContent;
            const number = parseFloat(text.replace(/[^0-9.]/g, ''));
            
            // Only animate if it's a simple number
            if (!isNaN(number) && number > 0 && number < 10000) {
                const suffix = text.replace(/[0-9.]/g, '');
                let current = 0;
                const duration = 2000;
                const increment = number / (duration / 16);
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= number) {
                        entry.target.textContent = text;
                        clearInterval(timer);
                    } else {
                        entry.target.textContent = Math.floor(current) + suffix;
                    }
                }, 16);
            }
            
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(stat => statsObserver.observe(stat));

// ====================================
// Typing Effect (Optional)
// ====================================
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// ====================================
// Card Hover 3D Effect
// ====================================
document.querySelectorAll('.service-card, .solution-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ====================================
// Page Load Animation
// ====================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Animate hero elements
    const heroElements = document.querySelectorAll('.hero-badge, .hero-title, .hero-subtitle, .hero-cta-group, .hero-stats');
    heroElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 200 + index * 150);
    });
});

// ====================================
// Dropdown Menu Enhancement
// ====================================
document.querySelectorAll('.nav-item.has-dropdown').forEach(item => {
    const dropdown = item.querySelector('.dropdown-menu');
    
    item.addEventListener('mouseenter', () => {
        dropdown.style.transform = 'translateX(-50%) translateY(0)';
    });
    
    item.addEventListener('mouseleave', () => {
        dropdown.style.transform = 'translateX(-50%) translateY(10px)';
    });
});

// ====================================
// Console log for branding
// ====================================
console.log('%c CloudX ', 'background: linear-gradient(135deg, #00D4FF 0%, #FF00E5 100%); color: #000; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
console.log('%c Enterprise Cloud Platform ', 'color: #00D4FF; font-size: 14px;');
