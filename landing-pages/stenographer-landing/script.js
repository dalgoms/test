/**
 * ============================================
 * 속기사 랜딩페이지 - 인터랙션
 * ============================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // FAQ 아코디언
    initFAQ();
    
    // 체크리스트 인터랙션
    initChecklist();
    
    // 폼 핸들링
    initForm();
    
    // 스크롤 애니메이션
    initScrollAnimations();
    
    // 통계 바 애니메이션
    initStatBars();
});

/**
 * FAQ 아코디언
 */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // 다른 FAQ 닫기
            faqItems.forEach(other => {
                if (other !== item && other.classList.contains('open')) {
                    other.classList.remove('open');
                }
            });
            
            // 현재 FAQ 토글
            item.classList.toggle('open');
        });
    });
}

/**
 * 공감 체크리스트
 */
function initChecklist() {
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    let checkedCount = 0;
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                checkedCount++;
                checkbox.parentElement.style.background = 'var(--accent-light)';
            } else {
                checkedCount--;
                checkbox.parentElement.style.background = '';
            }
            
            // 2개 이상 체크 시 공감 메시지 강조
            const empathyMessage = document.querySelector('.empathy-message');
            if (empathyMessage && checkedCount >= 2) {
                empathyMessage.classList.add('highlighted');
                empathyMessage.style.animation = 'pulse 0.5s ease';
            }
        });
    });
}

/**
 * 상담 신청 폼
 */
function initForm() {
    const form = document.getElementById('consultForm');
    
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const method = document.getElementById('contact-method').value;
        const question = document.getElementById('question').value;
        
        // 기본 유효성 검사
        if (!name || !phone) {
            alert('이름과 연락처를 입력해주세요.');
            return;
        }
        
        // 실제로는 API 호출
        console.log('상담 신청:', { name, phone, method, question });
        
        // 성공 메시지
        showSuccessMessage();
    });
}

/**
 * 성공 메시지 표시
 */
function showSuccessMessage() {
    const form = document.getElementById('consultForm');
    
    form.innerHTML = `
        <div class="success-message" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 3rem; margin-bottom: 16px;">✅</div>
            <h3 style="margin-bottom: 12px;">상담 신청 완료!</h3>
            <p style="color: var(--text-secondary);">
                입력하신 연락처로 24시간 내 연락드리겠습니다.<br>
                (카톡/문자로 먼저 안내드려요)
            </p>
        </div>
    `;
}

/**
 * 스크롤 시 애니메이션
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.cause-card, .step-card, .case-card, .safety-item, .benefit-item'
    );
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

/**
 * 통계 바 애니메이션
 */
function initStatBars() {
    const statBars = document.querySelectorAll('.stat-fill');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.style.width;
                bar.style.width = '0%';
                
                setTimeout(() => {
                    bar.style.transition = 'width 1s ease-out';
                    bar.style.width = width;
                }, 100);
                
                observer.unobserve(bar);
            }
        });
    }, {
        threshold: 0.5
    });
    
    statBars.forEach(bar => {
        observer.observe(bar);
    });
}

/**
 * 부드러운 스크롤 (CTA 버튼용)
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/**
 * 트래킹 이벤트 (실제 구현 시 GA/GTM 연동)
 */
function trackEvent(category, action, label) {
    console.log('Track:', { category, action, label });
    
    // Google Analytics 예시
    // gtag('event', action, {
    //     'event_category': category,
    //     'event_label': label
    // });
}

// CTA 클릭 트래킹
document.querySelectorAll('.cta-button').forEach(btn => {
    btn.addEventListener('click', () => {
        trackEvent('CTA', 'click', btn.textContent.trim());
    });
});

// 섹션 도달 트래킹
const sections = document.querySelectorAll('section');
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionClass = entry.target.className.split(' ')[0];
            trackEvent('Section', 'view', sectionClass);
        }
    });
}, { threshold: 0.3 });

sections.forEach(section => {
    sectionObserver.observe(section);
});

