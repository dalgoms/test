// ====================================
// Timbel Corporate Website
// JavaScript Functionality
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    initHeader();
    initMegaMenu();
    initScrollProgress();
    initSectionNavigation();
    initScrollAnimations();
    initTimelineScroll();
    initScrollNext();
    initParallax();
    
    // NEW: Enhanced Interactions
    initHeroZoom();
    initLineAnimations();
    initStaggerCards();
    init3DTilt();
    initParallaxShapes();
    initWordReveal();
    initCountUp();
    initMagneticButtons();
    initKeywordSlider();
});

// ====================================
// Hero Keyword Slider
// ====================================
function initKeywordSlider() {
    const keywords = document.querySelectorAll('.keyword-item');
    if (!keywords.length) return;
    
    let currentIndex = 0;
    
    function showNextKeyword() {
        keywords[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % keywords.length;
        keywords[currentIndex].classList.add('active');
    }
    
    // Change keyword every 3 seconds
    setInterval(showNextKeyword, 3000);
}

// ====================================
// Custom Cursor
// ====================================
function initCustomCursor() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (!cursorDot || !cursorOutline) {
        console.log('Cursor elements not found');
        return;
    }
    
    // Check if touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        document.querySelector('.cursor-wrapper').style.display = 'none';
        return;
    }
    
    // Enable custom cursor
    document.documentElement.classList.add('custom-cursor');
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let outlineX = mouseX;
    let outlineY = mouseY;
    let isVisible = false;
    
    // Initial position (hidden until first mouse move)
    cursorDot.style.opacity = '0';
    cursorOutline.style.opacity = '0';
    
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Show cursor on first move
        if (!isVisible) {
            isVisible = true;
            cursorDot.style.opacity = '1';
            cursorOutline.style.opacity = '1';
        }
        
        // Dot follows immediately
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });
    
    // Smooth outline animation
    function animateOutline() {
        // Smooth lerp for outline (easing)
        const ease = 0.12;
        outlineX += (mouseX - outlineX) * ease;
        outlineY += (mouseY - outlineY) * ease;
        
        cursorOutline.style.left = outlineX + 'px';
        cursorOutline.style.top = outlineY + 'px';
        
        requestAnimationFrame(animateOutline);
    }
    animateOutline();
    
    // Hover effect for interactive elements
    const addHoverListeners = () => {
        const interactiveElements = document.querySelectorAll('a, button, [role="button"], .nav-item, .timeline-v-item, .timeline-v-card, .service-block, .featured-card, .small-card, .mega-link-item, .tech-item, .social-link');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
    };
    
    // Initial setup
    addHoverListeners();
    
    // Re-add listeners when DOM changes (for dynamic content)
    const observer = new MutationObserver(() => {
        addHoverListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Click effect
    document.addEventListener('mousedown', () => {
        document.body.classList.add('cursor-click');
    });
    
    document.addEventListener('mouseup', () => {
        document.body.classList.remove('cursor-click');
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorOutline.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
    });
    
    console.log('Custom cursor initialized');
}

// ====================================
// Header Behavior
// ====================================
function initHeader() {
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('.section');
    
    // Track scroll for header styling
    const checkHeaderStyle = () => {
        const scrollY = window.scrollY;
        const heroSection = document.querySelector('.section-hero');
        const heroHeight = heroSection ? heroSection.offsetHeight : 0;
        
        // Determine if we're on a dark section
        let onDarkSection = false;
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom > 100) {
                if (section.classList.contains('section-hero') || 
                    section.classList.contains('section-services')) {
                    onDarkSection = true;
                }
            }
        });
        
        if (onDarkSection) {
            header.classList.add('dark');
            document.body.classList.add('dark-section');
        } else {
            header.classList.remove('dark');
            document.body.classList.remove('dark-section');
        }
        
        // Add scrolled class for shadow
        if (scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', checkHeaderStyle);
    checkHeaderStyle();
}

// ====================================
// Mega Menu
// ====================================
function initMegaMenu() {
    const header = document.querySelector('.header');
    const navItems = document.querySelectorAll('.nav-item.has-mega');
    const megaPanels = document.querySelectorAll('.mega-panel');
    const megaOverlay = document.querySelector('.mega-overlay');
    
    let activePanel = null;
    let closeTimeout = null;
    let isHoveringMenu = false;
    
    // Show mega panel on hover
    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            clearTimeout(closeTimeout);
            isHoveringMenu = true;
            const menuId = item.dataset.menu;
            showPanel(menuId, item);
        });
        
        item.addEventListener('mouseleave', () => {
            isHoveringMenu = false;
            closeTimeout = setTimeout(() => {
                if (!isHoveringMenu) {
                    hideAllPanels();
                }
            }, 150);
        });
    });
    
    // Keep panel open when hovering over it
    megaPanels.forEach(panel => {
        panel.addEventListener('mouseenter', () => {
            clearTimeout(closeTimeout);
            isHoveringMenu = true;
        });
        
        panel.addEventListener('mouseleave', () => {
            isHoveringMenu = false;
            closeTimeout = setTimeout(() => {
                if (!isHoveringMenu) {
                    hideAllPanels();
                }
            }, 150);
        });
    });
    
    // Also track header hover for smoother transitions between menu items
    if (header) {
        header.addEventListener('mouseleave', () => {
            if (!isHoveringMenu) {
                closeTimeout = setTimeout(() => {
                    hideAllPanels();
                }, 100);
            }
        });
    }
    
    // Close on overlay click
    if (megaOverlay) {
        megaOverlay.addEventListener('click', () => {
            hideAllPanels();
        });
    }
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideAllPanels();
        }
    });
    
    function showPanel(menuId, navItem) {
        // Hide all panels first
        megaPanels.forEach(panel => {
            panel.classList.remove('active');
        });
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Show target panel
        const targetPanel = document.querySelector(`.mega-panel[data-panel="${menuId}"]`);
        if (targetPanel) {
            targetPanel.classList.add('active');
            navItem.classList.add('active');
            if (megaOverlay) {
                megaOverlay.classList.add('active');
            }
            activePanel = targetPanel;
        }
    }
    
    function hideAllPanels() {
        megaPanels.forEach(panel => {
            panel.classList.remove('active');
        });
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        if (megaOverlay) {
            megaOverlay.classList.remove('active');
        }
        activePanel = null;
    }
    
    // Close mega menu on scroll
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        // Only close if scrolling more than 50px
        if (activePanel && Math.abs(currentScrollY - lastScrollY) > 50) {
            hideAllPanels();
        }
        lastScrollY = currentScrollY;
    });
}

// ====================================
// Scroll Progress Bar
// ====================================
function initScrollProgress() {
    const progressBar = document.querySelector('.progress-bar');
    
    if (!progressBar) return;
    
    const updateProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${progress}%`;
    };
    
    window.addEventListener('scroll', updateProgress);
    updateProgress();
}

// ====================================
// Section Navigation Dots
// ====================================
function initSectionNavigation() {
    const navDots = document.querySelectorAll('.nav-dot');
    const sections = document.querySelectorAll('.section');
    
    // Click handler for dots
    navDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const sectionId = dot.dataset.section;
            const targetSection = document.getElementById(sectionId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Update active dot on scroll
    const updateActiveDot = () => {
        let currentSection = '';
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
                currentSection = section.id;
            }
        });
        
        navDots.forEach(dot => {
            if (dot.dataset.section === currentSection) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    };
    
    window.addEventListener('scroll', updateActiveDot);
    updateActiveDot();
}

// ====================================
// Scroll Animations
// ====================================
function initScrollAnimations() {
    const animateElements = document.querySelectorAll(`
        .section-header,
        .intro-label,
        .intro-title,
        .intro-text,
        .timeline-v-item,
        .service-block,
        .statement-lines,
        .statement-en,
        .featured-card,
        .small-card
    `);
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                
                setTimeout(() => {
                    entry.target.classList.add('in-view');
                }, delay);
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
    });
    
    animateElements.forEach((el, index) => {
        el.setAttribute('data-animate', '');
        el.dataset.delay = (index % 6) * 100;
        observer.observe(el);
    });
}

// ====================================
// Vertical Timeline Animation
// ====================================
function initTimelineScroll() {
    const timelineItems = document.querySelectorAll('.timeline-v-item');
    const timelineLine = document.querySelector('.timeline-line-progress');
    const timelineSection = document.querySelector('.section-timeline');
    
    if (!timelineItems.length) return;
    
    // Intersection Observer for timeline items
    const itemObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });
    
    timelineItems.forEach(item => itemObserver.observe(item));
    
    // Timeline line progress on scroll
    if (timelineLine && timelineSection) {
        const updateLineProgress = () => {
            const sectionRect = timelineSection.getBoundingClientRect();
            const sectionTop = sectionRect.top;
            const sectionHeight = sectionRect.height;
            const windowHeight = window.innerHeight;
            
            // Calculate progress based on how much of the section is scrolled
            let progress = 0;
            if (sectionTop < windowHeight) {
                progress = Math.min(1, (windowHeight - sectionTop) / (sectionHeight + windowHeight * 0.5));
            }
            
            timelineLine.style.height = `${progress * 100}%`;
        };
        
        window.addEventListener('scroll', updateLineProgress);
        updateLineProgress();
    }
    
    // Make timeline items interactive
    timelineItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active from all
            timelineItems.forEach(i => i.classList.remove('active'));
            // Add active to clicked
            item.classList.add('active');
        });
    });
}

// ====================================
// Scroll Next Button
// ====================================
function initScrollNext() {
    const scrollNextButtons = document.querySelectorAll('.scroll-next');
    
    scrollNextButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentSection = btn.closest('.section');
            const nextSection = currentSection.nextElementSibling;
            
            if (nextSection && nextSection.classList.contains('section')) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ====================================
// Parallax Effects
// ====================================
function initParallax() {
    const heroContent = document.querySelector('.hero-content');
    
    if (!heroContent) return;
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const heroHeight = document.querySelector('.section-hero').offsetHeight;
        
        if (scrollY < heroHeight) {
            const opacity = 1 - (scrollY / (heroHeight * 0.6));
            const translateY = scrollY * 0.3;
            
            heroContent.style.opacity = Math.max(0, opacity);
            heroContent.style.transform = `translateY(${translateY}px)`;
        }
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
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ====================================
// Mobile Menu Toggle
// ====================================
const mobileToggle = document.querySelector('.mobile-toggle');
const nav = document.querySelector('.nav');

if (mobileToggle && nav) {
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
}

// ====================================
// Text Reveal Animation
// ====================================
function initTextReveal() {
    const titleWords = document.querySelectorAll('.title-word');
    
    titleWords.forEach((word, index) => {
        word.style.animationDelay = `${0.2 + index * 0.15}s`;
    });
}

initTextReveal();

// ====================================
// Intersection Observer for Stats Counter
// ====================================
const statValues = document.querySelectorAll('.stat-value');

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateValue(entry.target);
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statValues.forEach(stat => statsObserver.observe(stat));

function animateValue(element) {
    const text = element.textContent;
    const hasPlus = text.includes('+');
    const number = parseFloat(text.replace(/[^0-9.]/g, ''));
    const suffix = text.replace(/[0-9.+]/g, '');
    
    if (isNaN(number)) return;
    
    let current = 0;
    const duration = 2000;
    const increment = number / (duration / 16);
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        current = number * easeProgress;
        
        if (progress < 1) {
            element.textContent = Math.floor(current) + (hasPlus ? '+' : '') + suffix;
            requestAnimationFrame(update);
        } else {
            element.textContent = text;
        }
    }
    
    requestAnimationFrame(update);
}

// ====================================
// Page Load Animation
// ====================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Trigger hero animations
    const heroElements = document.querySelectorAll('.hero-title, .hero-desc');
    heroElements.forEach((el, index) => {
        el.style.opacity = '1';
    });
});

// ====================================
// Keyboard Navigation
// ====================================
document.addEventListener('keydown', (e) => {
    const sections = document.querySelectorAll('.section');
    let currentIndex = -1;
    
    sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
            currentIndex = index;
        }
    });
    
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        if (currentIndex < sections.length - 1) {
            sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
        }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentIndex > 0) {
            sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// ====================================
// Console Branding
// ====================================
console.log('%c Timbel ', 'background: linear-gradient(135deg, #00C896 0%, #0066FF 100%); color: #fff; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
console.log('%c 기술과 서비스로 세상을 연결합니다 ', 'color: #00C896; font-size: 14px;');

// ====================================
// NEW: Hero Cinematic Zoom Effect
// ====================================
function initHeroZoom() {
    const heroZoom = document.querySelector('.hero-zoom-container');
    const heroSection = document.querySelector('.section-hero');
    
    if (!heroZoom || !heroSection) return;
    
    // Initial zoom state
    setTimeout(() => {
        heroZoom.classList.add('zoomed');
    }, 500);
    
    // Zoom out on scroll
    const handleScroll = () => {
        const scrollY = window.scrollY;
        const heroHeight = heroSection.offsetHeight;
        const scrollProgress = Math.min(scrollY / (heroHeight * 0.5), 1);
        
        // Scale from 1.15 to 1 as we scroll
        const scale = 1.15 - (0.15 * scrollProgress);
        heroZoom.style.transform = `scale(${scale})`;
    };
    
    window.addEventListener('scroll', handleScroll);
}

// ====================================
// NEW: Line Slide Animations
// ====================================
function initLineAnimations() {
    const animElements = document.querySelectorAll('.anim-fade-up, .anim-slide-right, .anim-slide-left, .anim-slide-up');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.delay) || 0;
                setTimeout(() => {
                    entry.target.classList.add('in-view');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animElements.forEach(el => observer.observe(el));
}

// ====================================
// NEW: Stagger Card Animations
// ====================================
function initStaggerCards() {
    const staggerCards = document.querySelectorAll('.stagger-card, .tilt-card, .timeline-v-item, .featured-card, .small-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    });
    
    staggerCards.forEach(card => observer.observe(card));
}

// ====================================
// NEW: 3D Tilt Effect
// ====================================
function init3DTilt() {
    const tiltCards = document.querySelectorAll('[data-tilt]');
    
    tiltCards.forEach(card => {
        const inner = card.querySelector('.tilt-card-inner');
        const shine = card.querySelector('.card-shine');
        
        if (!inner) return;
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            
            inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            
            // Shine effect
            if (shine) {
                const shineX = (x / rect.width) * 100;
                const shineY = (y / rect.height) * 100;
                shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.15) 0%, transparent 50%)`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            if (shine) {
                shine.style.background = '';
            }
        });
    });
}

// ====================================
// NEW: Parallax Shapes
// ====================================
function initParallaxShapes() {
    const shapes = document.querySelectorAll('.parallax-shape');
    const servicesSection = document.querySelector('.section-services');
    
    if (!shapes.length || !servicesSection) return;
    
    window.addEventListener('scroll', () => {
        const rect = servicesSection.getBoundingClientRect();
        
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
            
            shapes.forEach(shape => {
                const speed = parseFloat(shape.dataset.speed) || 0.05;
                const moveY = (scrollProgress - 0.5) * 200 * speed;
                const moveX = (scrollProgress - 0.5) * 100 * speed;
                
                shape.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        }
    });
}

// ====================================
// NEW: Word Reveal Animation
// ====================================
function initWordReveal() {
    const wordRevealElements = document.querySelectorAll('.word-reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    });
    
    wordRevealElements.forEach(el => observer.observe(el));
    
    // Statement section reveal
    const statementSection = document.querySelector('.section-statement');
    if (statementSection) {
        const statementObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.5 });
        
        statementObserver.observe(statementSection);
    }
}

// ====================================
// NEW: Count Up Animation
// ====================================
function initCountUp() {
    const countElements = document.querySelectorAll('.count-up');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    countElements.forEach(el => observer.observe(el));
}

function animateCount(element) {
    const target = parseInt(element.dataset.target) || 0;
    const suffix = element.dataset.suffix || '';
    const prefix = element.dataset.prefix || '';
    const duration = 2500;
    const startTime = performance.now();
    
    element.classList.add('counting');
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(target * easeProgress);
        
        // Format with commas
        const formatted = current.toLocaleString();
        element.textContent = prefix + formatted + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.classList.remove('counting');
        }
    }
    
    requestAnimationFrame(update);
}

// ====================================
// NEW: Magnetic Button Effect
// ====================================
function initMagneticButtons() {
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Move element towards cursor
            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
        });
    });
}

// ====================================
// NEW: Timeline Progress Bar
// ====================================
function updateTimelineProgress() {
    const wrapper = document.querySelector('.timeline-wrapper');
    const progressBar = document.querySelector('.timeline-progress-bar');
    
    if (!wrapper || !progressBar) return;
    
    wrapper.addEventListener('scroll', () => {
        const scrollWidth = wrapper.scrollWidth - wrapper.clientWidth;
        const scrollProgress = (wrapper.scrollLeft / scrollWidth) * 100;
        progressBar.style.width = `${scrollProgress}%`;
    });
}

// Initialize timeline progress
document.addEventListener('DOMContentLoaded', updateTimelineProgress);

// ====================================
// Testimonial Slider
// ====================================
function initTestimonialSlider() {
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonial-dots .dot');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    
    if (!cards.length) return;
    
    let currentIndex = 0;
    
    function showSlide(index) {
        cards.forEach((card, i) => {
            card.classList.remove('active');
            if (dots[i]) dots[i].classList.remove('active');
        });
        
        cards[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
        currentIndex = index;
    }
    
    function nextSlide() {
        const newIndex = (currentIndex + 1) % cards.length;
        showSlide(newIndex);
    }
    
    function prevSlide() {
        const newIndex = (currentIndex - 1 + cards.length) % cards.length;
        showSlide(newIndex);
    }
    
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });
    
    // Auto-play
    setInterval(nextSlide, 6000);
}

document.addEventListener('DOMContentLoaded', initTestimonialSlider);

// ====================================
// Contact Form
// ====================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Validate
        if (!data.name || !data.email || !data.phone || !data.message) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }
        
        // Show success message (실제 구현 시 서버로 전송)
        alert('문의가 성공적으로 접수되었습니다.\n담당자가 빠른 시일 내에 연락드리겠습니다.');
        form.reset();
    });
}

document.addEventListener('DOMContentLoaded', initContactForm);

