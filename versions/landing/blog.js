// ====================================
// SK Networks Blog Page - JavaScript
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    initCategoryFilter();
    initSearch();
    initNewsletter();
    initPagination();
});

// ====================================
// Category Filter
// ====================================
function initCategoryFilter() {
    const tabs = document.querySelectorAll('.category-tab');
    const cards = document.querySelectorAll('.blog-card');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const category = tab.dataset.category;

            // Filter cards
            cards.forEach((card, index) => {
                const cardCategory = card.dataset.category;
                const shouldShow = category === 'all' || cardCategory === category;

                // Add fade-out animation
                card.classList.add('fade-out');

                setTimeout(() => {
                    if (shouldShow) {
                        card.classList.remove('hidden', 'fade-out');
                        card.style.animationDelay = `${index * 0.05}s`;
                    } else {
                        card.classList.add('hidden');
                        card.classList.remove('fade-out');
                    }
                }, 200);
            });
        });
    });
}

// ====================================
// Search Functionality
// ====================================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const cards = document.querySelectorAll('.blog-card');

    const performSearch = () => {
        const query = searchInput.value.toLowerCase().trim();

        if (!query) {
            // Show all cards if search is empty
            cards.forEach(card => {
                card.classList.remove('hidden', 'fade-out');
            });

            // Reset category tabs
            document.querySelectorAll('.category-tab').forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.category === 'all') {
                    tab.classList.add('active');
                }
            });
            return;
        }

        cards.forEach(card => {
            const title = card.querySelector('.post-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.post-excerpt')?.textContent.toLowerCase() || '';
            const category = card.querySelector('.post-category').textContent.toLowerCase();

            const matches = title.includes(query) || excerpt.includes(query) || category.includes(query);

            card.classList.add('fade-out');

            setTimeout(() => {
                if (matches) {
                    card.classList.remove('hidden', 'fade-out');
                } else {
                    card.classList.add('hidden');
                    card.classList.remove('fade-out');
                }
            }, 200);
        });
    };

    // Search on button click
    searchBtn.addEventListener('click', performSearch);

    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Live search with debounce
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(performSearch, 300);
    });
}

// ====================================
// Newsletter Form
// ====================================
function initNewsletter() {
    const form = document.getElementById('newsletterForm');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const input = form.querySelector('.newsletter-input');
            const email = input.value.trim();

            if (email && isValidEmail(email)) {
                // Show success message
                showNotification('구독해 주셔서 감사합니다! 🎉', 'success');
                input.value = '';
            } else {
                showNotification('올바른 이메일 주소를 입력해 주세요.', 'error');
            }
        });
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">×</button>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 15px;
        font-weight: 500;
        z-index: 9999;
        animation: slideInUp 0.3s ease;
    `;

    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                opacity: 0.8;
                transition: opacity 0.2s;
            }
            .notification-close:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            notification.style.transition = 'all 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ====================================
// Pagination
// ====================================
function initPagination() {
    const pageNumbers = document.querySelectorAll('.page-number');
    const prevBtn = document.querySelector('.pagination-btn.prev');
    const nextBtn = document.querySelector('.pagination-btn.next');

    let currentPage = 1;
    const totalPages = 10;

    const updatePagination = () => {
        pageNumbers.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.textContent) === currentPage) {
                btn.classList.add('active');
            }
        });

        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
    };

    pageNumbers.forEach(btn => {
        btn.addEventListener('click', () => {
            const pageNum = parseInt(btn.textContent);
            if (!isNaN(pageNum)) {
                currentPage = pageNum;
                updatePagination();
                scrollToGrid();
            }
        });
    });

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
            scrollToGrid();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
            scrollToGrid();
        }
    });
}

function scrollToGrid() {
    const blogGrid = document.getElementById('blogGrid');
    if (blogGrid) {
        const offset = 120; // Account for fixed header
        const top = blogGrid.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
}

