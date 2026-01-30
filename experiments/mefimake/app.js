/**
 * ============================================
 * META AD GENERATOR - MAIN APPLICATION
 * ============================================
 */

class MetaAdGenerator {
    constructor() {
        // 상태 관리
        this.state = {
            topic: '속기사',
            targets: ['jobseeker', 'worker', 'housewife'],
            aspectRatio: '1:1',
            template: 'benefit',
            colorTheme: 'professional',
            currentVariant: 0,
            variants: [],
            generatedImages: [],
            history: []
        };

        // DOM 요소 캐싱
        this.elements = {};
        this.cacheElements();
        
        // 이벤트 바인딩
        this.bindEvents();
        
        // 초기화
        this.init();
    }

    cacheElements() {
        // 입력 필드
        this.elements.topic = document.getElementById('topic');
        this.elements.aspectRatio = document.getElementById('aspect-ratio');
        this.elements.hookCopy = document.getElementById('hook-copy');
        this.elements.mainCopy = document.getElementById('main-copy');
        this.elements.subCopy = document.getElementById('sub-copy');
        this.elements.ctaText = document.getElementById('cta-text');
        this.elements.generateCount = document.getElementById('generate-count');

        // 버튼
        this.elements.generateCopyBtn = document.getElementById('generate-copy-btn');
        this.elements.previewBtn = document.getElementById('preview-btn');
        this.elements.downloadBtn = document.getElementById('download-btn');
        this.elements.batchBtn = document.getElementById('batch-btn');
        this.elements.prevVariant = document.getElementById('prev-variant');
        this.elements.nextVariant = document.getElementById('next-variant');

        // 선택 그룹
        this.elements.templateSelector = document.getElementById('template-selector');
        this.elements.colorThemes = document.getElementById('color-themes');

        // 표시 영역
        this.elements.adCanvas = document.getElementById('ad-canvas');
        this.elements.variantsGrid = document.getElementById('variants-grid');
        this.elements.variantCounter = document.getElementById('variant-counter');
        this.elements.libraryList = document.getElementById('library-list');
        this.elements.historyList = document.getElementById('history-list');
        this.elements.downloadSetBtn = document.getElementById('download-set-btn');

        // 모달
        this.elements.batchModal = document.getElementById('batch-modal');
        this.elements.progressFill = document.getElementById('progress-fill');
        this.elements.progressText = document.getElementById('progress-text');
        this.elements.batchPreview = document.getElementById('batch-preview');
    }

    bindEvents() {
        // 주제 변경
        this.elements.topic.addEventListener('change', () => {
            this.state.topic = this.elements.topic.value;
            this.generateCopy();
        });

        // 비율 변경
        this.elements.aspectRatio.addEventListener('change', () => {
            this.state.aspectRatio = this.elements.aspectRatio.value;
            this.updateCanvasRatio();
        });

        // 타겟 체크박스
        document.querySelectorAll('[id^="target-"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateTargets());
        });

        // 템플릿 선택
        this.elements.templateSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('template-btn')) {
                this.selectTemplate(e.target);
            }
        });

        // 컬러 테마 선택
        this.elements.colorThemes.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-btn')) {
                this.selectColorTheme(e.target);
            }
        });

        // 콘텐츠 입력 필드 실시간 반영
        ['hookCopy', 'mainCopy', 'subCopy', 'ctaText'].forEach(field => {
            this.elements[field].addEventListener('input', () => this.updatePreview());
        });

        // 버튼 이벤트
        this.elements.generateCopyBtn.addEventListener('click', () => this.generateCopy());
        this.elements.previewBtn?.addEventListener('click', () => this.updatePreview());
        this.elements.downloadBtn?.addEventListener('click', () => {
            this.saveToHistory();
            this.downloadCurrentImage();
        });
        this.elements.downloadSetBtn?.addEventListener('click', () => {
            this.saveToHistory();
            this.downloadSizeSet();
        });
        this.elements.batchBtn?.addEventListener('click', () => this.generateBatch());
        this.elements.prevVariant?.addEventListener('click', () => this.navigateVariant(-1));
        this.elements.nextVariant?.addEventListener('click', () => this.navigateVariant(1));

        // 콘텐츠 라이브러리 토글
        document.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', () => {
                header.parentElement.classList.toggle('open');
            });
        });

        // 라이브러리 탭
        document.querySelectorAll('.lib-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchLibraryTab(tab));
        });
    }

    init() {
        // 초기 콘텐츠 생성
        this.generateCopy();
        
        // 초기 프리뷰 업데이트
        this.updatePreview();
        
        // 라이브러리 로드
        this.loadLibrary('hooks');
        
        // 초기 변형 생성
        this.generateInitialVariants();
    }

    updateTargets() {
        this.state.targets = [];
        if (document.getElementById('target-jobseeker').checked) this.state.targets.push('jobseeker');
        if (document.getElementById('target-worker').checked) this.state.targets.push('worker');
        if (document.getElementById('target-housewife').checked) this.state.targets.push('housewife');
    }

    selectTemplate(btn) {
        // UI 업데이트
        this.elements.templateSelector.querySelectorAll('.template-btn').forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');
        
        // 상태 업데이트
        this.state.template = btn.dataset.template;
        
        // 템플릿 클래스 적용
        this.elements.adCanvas.className = 'ad-canvas';
        this.elements.adCanvas.classList.add(`template-${this.state.template}`);
        this.elements.adCanvas.classList.add(`theme-${this.state.colorTheme}`);
        this.updateCanvasRatio();
        
        // 새 카피 생성
        this.generateCopy();
    }

    selectColorTheme(btn) {
        // UI 업데이트
        this.elements.colorThemes.querySelectorAll('.color-btn').forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');
        
        // 상태 업데이트
        this.state.colorTheme = btn.dataset.theme;
        
        // 테마 클래스 적용
        this.elements.adCanvas.classList.remove(
            'theme-professional', 'theme-warm', 'theme-nature',
            'theme-energy', 'theme-modern', 'theme-trust'
        );
        this.elements.adCanvas.classList.add(`theme-${this.state.colorTheme}`);
        
        // 커스텀 컬러 필드 동기화
        const colors = this.getThemeColors(this.state.colorTheme);
        this.syncCustomColorFields(colors.primary, colors.secondary);
    }

    getThemeColors(theme) {
        const themes = {
            professional: { primary: '#0f0c29', secondary: '#302b63', accent: '#24c6dc' },
            warm: { primary: '#1a0a2e', secondary: '#4a148c', accent: '#e040fb' },
            nature: { primary: '#0d1f22', secondary: '#1b4332', accent: '#40c9a2' },
            energy: { primary: '#1a0a0a', secondary: '#4a1c1c', accent: '#ff6b35' },
            modern: { primary: '#0a0a0a', secondary: '#1c1c1c', accent: '#ffd700' },
            trust: { primary: '#0a192f', secondary: '#172a45', accent: '#64ffda' }
        };
        return themes[theme] || themes.professional;
    }

    syncCustomColorFields(startColor, endColor) {
        // DesignEditor와 연동
        if (window.designEditor) {
            window.designEditor.setGradientFromPreset(startColor, endColor);
        }
    }

    updateCanvasRatio() {
        this.elements.adCanvas.classList.remove('ratio-4-5', 'ratio-9-16');
        
        if (this.state.aspectRatio === '4:5') {
            this.elements.adCanvas.classList.add('ratio-4-5');
        } else if (this.state.aspectRatio === '9:16') {
            this.elements.adCanvas.classList.add('ratio-9-16');
        }
    }

    generateCopy() {
        const content = ContentUtils.getContent(this.state.topic);
        const template = this.state.template;
        
        // 훅 카피 설정
        const hook = ContentUtils.randomPick(content.hooks[template]);
        this.elements.hookCopy.value = hook;
        
        // 메인 카피 설정 (HTML 태그 제거하여 표시)
        const main = ContentUtils.randomPick(content.mainCopies[template]);
        this.elements.mainCopy.value = main.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
        
        // 서브 카피 설정
        const sub = ContentUtils.randomPick(content.subCopies);
        this.elements.subCopy.value = sub;
        
        // CTA 설정
        const cta = ContentUtils.randomPick(content.ctas);
        this.elements.ctaText.value = cta;
        
        // 프리뷰 업데이트
        this.updatePreview();
    }

    updatePreview() {
        const canvas = this.elements.adCanvas;
        
        // Badge 업데이트
        const badge = canvas.querySelector('.ad-badge');
        if (badge) badge.textContent = `${this.state.topic} 자격증`;
        
        // Hook 업데이트
        const hookEl = canvas.querySelector('.ad-hook');
        if (hookEl) hookEl.textContent = this.elements.hookCopy.value;
        
        // Main 카피 업데이트 (줄바꿈 및 강조 처리)
        const mainEl = canvas.querySelector('.ad-main');
        if (mainEl) {
            let mainText = this.elements.mainCopy.value;
            // 단순 텍스트를 HTML로 변환 (키워드 강조)
            mainText = this.enhanceMainCopy(mainText);
            mainEl.innerHTML = mainText;
        }
        
        // Sub 카피 업데이트
        const subEl = canvas.querySelector('.ad-sub');
        if (subEl) subEl.textContent = this.elements.subCopy.value;
        
        // CTA 업데이트
        const ctaEl = canvas.querySelector('.ad-cta');
        if (ctaEl) ctaEl.textContent = this.elements.ctaText.value;
    }

    enhanceMainCopy(text) {
        // 키워드 강조 패턴
        const keywords = ['나만의 시간', '수입', '인생', '월급', '재택', '전문가', '자유', '300만원', '200만원'];
        
        let enhanced = text;
        keywords.forEach(keyword => {
            if (enhanced.includes(keyword)) {
                enhanced = enhanced.replace(keyword, `<strong>${keyword}</strong>`);
            }
        });
        
        // 콤마나 마침표 기준으로 줄바꿈 추가
        enhanced = enhanced.replace(/([,.])\s*/g, '$1<br>');
        
        return enhanced;
    }

    async downloadCurrentImage() {
        try {
            const canvas = await html2canvas(this.elements.adCanvas, {
                scale: 2,
                backgroundColor: null,
                logging: false
            });
            
            const link = document.createElement('a');
            link.download = `${this.state.topic}_${this.state.template}_${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('이미지 생성 실패:', error);
            alert('이미지 생성에 실패했습니다. 다시 시도해주세요.');
        }
    }

    async generateBatch() {
        const count = parseInt(this.elements.generateCount.value);
        const plan = ContentUtils.generateMonthlyPlan(this.state.topic, this.state.targets);
        
        // 모달 표시
        this.elements.batchModal.classList.add('active');
        this.elements.batchPreview.innerHTML = '';
        this.state.generatedImages = [];
        
        // 배치 생성
        for (let i = 0; i < count; i++) {
            const variant = plan[i];
            
            // 프로그레스 업데이트
            const progress = ((i + 1) / count) * 100;
            this.elements.progressFill.style.width = `${progress}%`;
            this.elements.progressText.textContent = `${i + 1} / ${count} 생성 완료`;
            
            // 캔버스 설정
            this.applyVariant(variant);
            
            // 잠시 대기 (렌더링 시간)
            await this.delay(100);
            
            // 이미지 생성
            try {
                const canvas = await html2canvas(this.elements.adCanvas, {
                    scale: 2,
                    backgroundColor: null,
                    logging: false
                });
                
                const dataUrl = canvas.toDataURL('image/png');
                this.state.generatedImages.push({
                    id: i + 1,
                    dataUrl,
                    variant
                });
                
                // 미리보기에 추가
                const img = document.createElement('img');
                img.src = dataUrl;
                img.alt = `변형 ${i + 1}`;
                this.elements.batchPreview.appendChild(img);
            } catch (error) {
                console.error(`변형 ${i + 1} 생성 실패:`, error);
            }
        }
        
        // 완료 후 다운로드 버튼 추가
        this.addBatchDownloadButton();
    }

    applyVariant(variant) {
        // 테마 적용
        this.elements.adCanvas.className = 'ad-canvas';
        this.elements.adCanvas.classList.add(`template-${variant.template}`);
        this.elements.adCanvas.classList.add(`theme-${variant.colorTheme}`);
        
        // 비율 적용
        if (variant.ratio === '4:5') {
            this.elements.adCanvas.classList.add('ratio-4-5');
        } else if (variant.ratio === '9:16') {
            this.elements.adCanvas.classList.add('ratio-9-16');
        }
        
        // 콘텐츠 적용
        const canvas = this.elements.adCanvas;
        canvas.querySelector('.ad-badge').textContent = variant.badge;
        canvas.querySelector('.ad-hook').textContent = variant.hook;
        canvas.querySelector('.ad-main').innerHTML = variant.main;
        canvas.querySelector('.ad-sub').textContent = variant.sub;
        canvas.querySelector('.ad-cta').textContent = variant.cta;
    }

    addBatchDownloadButton() {
        const downloadAllBtn = document.createElement('button');
        downloadAllBtn.className = 'btn-download';
        downloadAllBtn.style.marginTop = '20px';
        downloadAllBtn.textContent = '전체 다운로드 (ZIP)';
        downloadAllBtn.onclick = () => this.downloadAllAsZip();
        
        // 닫기 버튼
        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn-preview';
        closeBtn.style.marginTop = '10px';
        closeBtn.textContent = '닫기';
        closeBtn.onclick = () => this.elements.batchModal.classList.remove('active');
        
        const btnContainer = document.createElement('div');
        btnContainer.appendChild(downloadAllBtn);
        btnContainer.appendChild(closeBtn);
        
        this.elements.batchPreview.parentElement.appendChild(btnContainer);
    }

    async downloadAllAsZip() {
        // JSZip 라이브러리가 없으므로 개별 다운로드
        for (let i = 0; i < this.state.generatedImages.length; i++) {
            const img = this.state.generatedImages[i];
            const link = document.createElement('a');
            link.download = `${this.state.topic}_${img.variant.template}_week${img.variant.week}_${img.id}.png`;
            link.href = img.dataUrl;
            link.click();
            
            // 브라우저 제한을 위해 딜레이
            await this.delay(200);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    generateInitialVariants() {
        const plan = ContentUtils.generateMonthlyPlan(this.state.topic, this.state.targets);
        this.state.variants = plan;
        this.renderVariantThumbnails();
        this.updateVariantCounter();
    }

    // 고객 여정 데이터 표시 (콘솔)
    showCustomerJourney() {
        if (window.CUSTOMER_JOURNEY) {
            console.log('고객 여정 분석:', window.CUSTOMER_JOURNEY);
        }
    }

    renderVariantThumbnails() {
        this.elements.variantsGrid.innerHTML = '';
        
        const templateNames = {
            benefit: '혜택',
            question: '질문',
            story: '스토리',
            stats: '통계',
            compare: '비교',
            urgency: '긴급',
            fear_address: '두려움',
            anti_ad: '안티'
        };
        
        this.state.variants.forEach((variant, index) => {
            const thumb = document.createElement('div');
            thumb.className = `variant-thumb ${index === this.state.currentVariant ? 'active' : ''}`;
            
            // 훅 텍스트 줄이기
            const hookText = variant.hook?.length > 20 
                ? variant.hook.substring(0, 20) + '...' 
                : variant.hook || '';
            
            thumb.innerHTML = `
                <div class="variant-number">${index + 1}</div>
                <div class="variant-preview" style="background: linear-gradient(135deg, ${this.getThemeColor(variant.theme, 'primary')}, ${this.getThemeColor(variant.theme, 'secondary')})">
                    <div class="variant-preview-badge">${templateNames[variant.template] || variant.template}</div>
                    <div class="variant-preview-hook">${hookText}</div>
                    <div class="variant-preview-cta">${variant.cta?.substring(0, 8) || 'CTA'}</div>
                </div>
            `;
            thumb.onclick = () => this.selectVariant(index);
            this.elements.variantsGrid.appendChild(thumb);
        });
    }

    getThemeColor(theme, type) {
        const colors = {
            professional: { primary: '#0f0c29', secondary: '#302b63' },  // 딥 오션
            warm: { primary: '#1a0a2e', secondary: '#4a148c' },          // 미드나잇 퍼플
            nature: { primary: '#0d1f22', secondary: '#1b4332' },        // 다크 포레스트
            energy: { primary: '#1a0a0a', secondary: '#4a1c1c' },        // 선셋 다크
            modern: { primary: '#0a0a0a', secondary: '#1c1c1c' },        // 카본 블랙
            trust: { primary: '#0a192f', secondary: '#172a45' }          // 일렉트릭 블루
        };
        return colors[theme]?.[type] || colors.professional[type];
    }

    selectVariant(index) {
        this.state.currentVariant = index;
        const variant = this.state.variants[index];
        
        // 캔버스에 적용
        this.applyVariant(variant);
        
        // 입력 필드 업데이트
        this.elements.hookCopy.value = variant.hook;
        this.elements.mainCopy.value = variant.main.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
        this.elements.subCopy.value = variant.sub;
        this.elements.ctaText.value = variant.cta;
        
        // UI 업데이트
        this.updateVariantCounter();
        this.highlightActiveThumbnail();
    }

    navigateVariant(direction) {
        let newIndex = this.state.currentVariant + direction;
        
        if (newIndex < 0) newIndex = this.state.variants.length - 1;
        if (newIndex >= this.state.variants.length) newIndex = 0;
        
        this.selectVariant(newIndex);
    }

    updateVariantCounter() {
        this.elements.variantCounter.textContent = 
            `${this.state.currentVariant + 1} / ${this.state.variants.length}`;
    }

    highlightActiveThumbnail() {
        this.elements.variantsGrid.querySelectorAll('.variant-thumb').forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.state.currentVariant);
        });
    }

    loadLibrary(tab) {
        const items = CONTENT_LIBRARY[tab];
        if (!items || !this.elements.libraryList) return;
        
        this.elements.libraryList.innerHTML = '';
        
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'library-item';
            if (item.recommended) {
                div.classList.add('recommended');
            }
            div.textContent = item.text || item;
            div.onclick = () => this.useLibraryItem(tab, item);
            this.elements.libraryList.appendChild(div);
        });
    }

    switchLibraryTab(tab) {
        document.querySelectorAll('.lib-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.loadLibrary(tab.dataset.lib);
    }

    useLibraryItem(tab, item) {
        const text = item.text || item;
        
        switch(tab) {
            case 'hooks':
                this.elements.hookCopy.value = text;
                break;
            case 'benefits':
                this.elements.subCopy.value = text;
                break;
            case 'subCopies':
                this.elements.subCopy.value = text;
                break;
            case 'ctas':
                this.elements.ctaText.value = text;
                break;
        }
        
        this.updatePreview();
    }

    // 히스토리에 현재 조합 저장
    saveToHistory() {
        const entry = {
            id: Date.now(),
            template: this.state.template,
            hook: this.elements.hookCopy?.value || '',
            main: this.elements.mainCopy?.value || '',
            sub: this.elements.subCopy?.value || '',
            cta: this.elements.ctaText?.value || '',
            ratio: this.state.aspectRatio,
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        };

        // 중복 방지
        const isDuplicate = this.state.history.some(h => 
            h.hook === entry.hook && h.template === entry.template
        );

        if (!isDuplicate && entry.hook) {
            this.state.history.unshift(entry);
            if (this.state.history.length > 20) {
                this.state.history.pop();
            }
            this.renderHistory();
        }
    }

    // 히스토리 렌더링
    renderHistory() {
        if (!this.elements.historyList) return;

        if (this.state.history.length === 0) {
            this.elements.historyList.innerHTML = '<div class="history-empty">생성된 조합이 여기에 저장됩니다</div>';
            return;
        }

        const templateNames = {
            benefit: '혜택형',
            question: '질문형',
            story: '스토리',
            stats: '통계형',
            compare: '비교형',
            urgency: '긴급형',
            fear_address: '두려움',
            anti_ad: '안티광고'
        };

        this.elements.historyList.innerHTML = this.state.history.map(entry => `
            <div class="history-item" data-id="${entry.id}">
                <div class="history-template">${templateNames[entry.template] || entry.template}</div>
                <div class="history-hook">${entry.hook}</div>
                <div class="history-meta">${entry.ratio} · ${entry.timestamp}</div>
            </div>
        `).join('');

        // 클릭 이벤트
        this.elements.historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.loadFromHistory(id);
            });
        });
    }

    // 히스토리에서 불러오기
    loadFromHistory(id) {
        const entry = this.state.history.find(h => h.id === id);
        if (!entry) return;

        // 템플릿 변경
        this.state.template = entry.template;
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.template === entry.template);
        });

        // 텍스트 복원
        if (this.elements.hookCopy) this.elements.hookCopy.value = entry.hook;
        if (this.elements.mainCopy) this.elements.mainCopy.value = entry.main;
        if (this.elements.subCopy) this.elements.subCopy.value = entry.sub;
        if (this.elements.ctaText) this.elements.ctaText.value = entry.cta;

        this.updatePreview();
    }

    // 사이즈 세트 다운로드 (3개 묶음)
    async downloadSizeSet() {
        const originalRatio = this.state.aspectRatio;
        const ratios = ['1:1', '4:5', '9:16'];
        
        for (const ratio of ratios) {
            this.state.aspectRatio = ratio;
            this.elements.aspectRatio.value = ratio;
            this.updateCanvasRatio();
            
            await new Promise(resolve => setTimeout(resolve, 300));
            await this.downloadCurrentImage();
        }
        
        // 원래 비율로 복원
        this.state.aspectRatio = originalRatio;
        this.elements.aspectRatio.value = originalRatio;
        this.updateCanvasRatio();
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MetaAdGenerator();
});

