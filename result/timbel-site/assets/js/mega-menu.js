/* ==================== MEGA-MENU.JS ==================== */
/* Mega menu interactions */

document.addEventListener('DOMContentLoaded', function() {
    initMegaMenu();
});

let menuTimeout = null;
let currentOpenMenu = null;

function initMegaMenu() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('mouseenter', handleMouseEnter);
        item.addEventListener('mouseleave', handleMouseLeave);
        
        // Keyboard accessibility
        const trigger = item.querySelector('.nav-link');
        if (trigger) {
            trigger.addEventListener('focus', () => handleMouseEnter({ currentTarget: item }));
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeAllMenus();
                    trigger.focus();
                }
            });
        }
    });

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item')) {
            closeAllMenus();
        }
    });
}

function handleMouseEnter(e) {
    clearTimeout(menuTimeout);
    
    const item = e.currentTarget;
    const megaMenu = item.querySelector('.mega-menu');
    
    if (currentOpenMenu && currentOpenMenu !== megaMenu) {
        closeAllMenus();
    }
    
    if (megaMenu) {
        megaMenu.style.opacity = '1';
        megaMenu.style.visibility = 'visible';
        megaMenu.style.transform = 'translateY(0)';
        currentOpenMenu = megaMenu;
        
        // Update aria attribute
        const trigger = item.querySelector('.nav-link');
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'true');
        }
    }
}

function handleMouseLeave() {
    menuTimeout = setTimeout(() => {
        closeAllMenus();
    }, 150);
}

function closeAllMenus() {
    const megaMenus = document.querySelectorAll('.mega-menu');
    megaMenus.forEach(menu => {
        menu.style.opacity = '0';
        menu.style.visibility = 'hidden';
        menu.style.transform = 'translateY(-10px)';
    });
    
    const triggers = document.querySelectorAll('.nav-link[aria-expanded]');
    triggers.forEach(trigger => {
        trigger.setAttribute('aria-expanded', 'false');
    });
    
    currentOpenMenu = null;
}

// Re-attach to nav items after DOM updates (for SPA-like behavior)
function refreshMegaMenu() {
    initMegaMenu();
}

