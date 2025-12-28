/**
 * ============================================
 * DESIGN EDITOR - 피그마 스타일 디자인 도구
 * ============================================
 * 
 * 기능:
 * - 그라데이션/단색/이미지 배경
 * - 커스텀 컬러 피커
 * - 이미지 업로드 및 배치
 * - 레이어 관리
 * - 드래그 앤 드롭 요소 배치
 */

class DesignEditor {
    constructor() {
        // 상태 관리
        this.state = {
            bgType: 'gradient', // gradient, solid, image
            gradient: {
                start: '#0f0c29',
                end: '#302b63',
                angle: 135
            },
            solidColor: '#0f0c29',
            bgImage: {
                url: null,
                fit: 'cover',
                position: 'center center',
                overlay: 50,
                overlayColor: '#000000',
                blur: 0
            },
            elements: [], // 추가된 이미지/텍스트 요소들
            selectedElement: null,
            layers: []
        };

        this.init();
    }

    init() {
        this.bindBgTypeSelector();
        this.bindGradientEditor();
        this.bindSolidEditor();
        this.bindImageEditor();
        this.bindElementUpload();
        this.bindLayerControls();
        this.bindCanvasClick();
        this.createPositionTooltip();
        this.updateGradientPreview();
        this.applyBackground();
    }

    // 캔버스 클릭 시 요소 선택 해제
    bindCanvasClick() {
        const canvas = document.getElementById('ad-canvas');
        canvas.addEventListener('click', (e) => {
            if (e.target === canvas || e.target.classList.contains('ad-content') || 
                e.target.classList.contains('ad-bg-image') || e.target.classList.contains('ad-overlay')) {
                this.deselectAll();
            }
        });
    }

    deselectAll() {
        document.querySelectorAll('.ad-element').forEach(el => {
            el.classList.remove('selected');
        });
        this.state.selectedElement = null;
    }

    // 위치 툴팁 생성
    createPositionTooltip() {
        const tooltip = document.createElement('div');
        tooltip.id = 'position-tooltip';
        tooltip.className = 'position-tooltip';
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);
    }

    showPositionTooltip(x, y, posX, posY) {
        const tooltip = document.getElementById('position-tooltip');
        tooltip.textContent = `X: ${Math.round(posX)}% | Y: ${Math.round(posY)}%`;
        tooltip.style.left = `${x + 15}px`;
        tooltip.style.top = `${y + 15}px`;
        tooltip.style.display = 'block';
    }

    hidePositionTooltip() {
        const tooltip = document.getElementById('position-tooltip');
        if (tooltip) tooltip.style.display = 'none';
    }

    // 방향키 이동 시 위치 피드백
    showPositionFeedback(element) {
        const el = document.getElementById(element.id);
        if (!el) return;

        // 기존 피드백 제거
        let feedback = el.querySelector('.position-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'position-feedback';
            el.appendChild(feedback);
        }

        feedback.textContent = `${Math.round(element.x)}%, ${Math.round(element.y)}%`;
        feedback.style.opacity = '1';

        // 1초 후 페이드아웃
        clearTimeout(this.feedbackTimeout);
        this.feedbackTimeout = setTimeout(() => {
            feedback.style.opacity = '0';
        }, 1000);
    }

    // ============================================
    // 배경 타입 선택
    // ============================================
    bindBgTypeSelector() {
        const buttons = document.querySelectorAll('.bg-type-btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // 버튼 활성화
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 타입 변경
                this.state.bgType = btn.dataset.type;
                this.showBgEditor(this.state.bgType);
                this.applyBackground();
            });
        });
    }

    showBgEditor(type) {
        // 모든 에디터 숨기기
        document.getElementById('gradient-editor').style.display = 'none';
        document.getElementById('solid-editor').style.display = 'none';
        document.getElementById('image-editor').style.display = 'none';
        
        // 선택된 에디터 표시
        document.getElementById(`${type}-editor`).style.display = 'block';
    }

    // ============================================
    // 그라데이션 편집기
    // ============================================
    bindGradientEditor() {
        // 프리셋 버튼
        const presetBtns = document.querySelectorAll('#color-themes .color-btn');
        const presets = {
            professional: { start: '#0f0c29', end: '#302b63' },  // 딥 오션
            warm: { start: '#1a0a2e', end: '#4a148c' },          // 미드나잇 퍼플
            nature: { start: '#0d1f22', end: '#1b4332' },        // 다크 포레스트
            energy: { start: '#1a0a0a', end: '#4a1c1c' },        // 선셋 다크
            modern: { start: '#0a0a0a', end: '#1c1c1c' },        // 카본 블랙
            trust: { start: '#0a192f', end: '#172a45' }          // 일렉트릭 블루
        };

        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                presetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const theme = btn.dataset.theme;
                if (presets[theme]) {
                    this.state.gradient.start = presets[theme].start;
                    this.state.gradient.end = presets[theme].end;
                    this.updateColorInputs();
                    this.updateGradientPreview();
                    this.applyBackground();
                }
            });
        });

        // 커스텀 컬러 피커
        const startColor = document.getElementById('gradient-start');
        const startHex = document.getElementById('gradient-start-hex');
        const endColor = document.getElementById('gradient-end');
        const endHex = document.getElementById('gradient-end-hex');
        const angleSlider = document.getElementById('gradient-angle');
        const angleValue = document.getElementById('angle-value');

        // 컬러 피커 변경
        startColor.addEventListener('input', (e) => {
            this.state.gradient.start = e.target.value;
            startHex.value = e.target.value;
            this.updateGradientPreview();
            this.applyBackground();
            this.clearPresetSelection();
        });

        endColor.addEventListener('input', (e) => {
            this.state.gradient.end = e.target.value;
            endHex.value = e.target.value;
            this.updateGradientPreview();
            this.applyBackground();
            this.clearPresetSelection();
        });

        // HEX 입력
        startHex.addEventListener('change', (e) => {
            const value = this.validateHex(e.target.value);
            if (value) {
                this.state.gradient.start = value;
                startColor.value = value;
                this.updateGradientPreview();
                this.applyBackground();
                this.clearPresetSelection();
            }
        });

        endHex.addEventListener('change', (e) => {
            const value = this.validateHex(e.target.value);
            if (value) {
                this.state.gradient.end = value;
                endColor.value = value;
                this.updateGradientPreview();
                this.applyBackground();
                this.clearPresetSelection();
            }
        });

        // 각도 슬라이더
        angleSlider.addEventListener('input', (e) => {
            this.state.gradient.angle = e.target.value;
            angleValue.textContent = e.target.value;
            this.updateGradientPreview();
            this.applyBackground();
        });
    }

    updateColorInputs() {
        document.getElementById('gradient-start').value = this.state.gradient.start;
        document.getElementById('gradient-start-hex').value = this.state.gradient.start;
        document.getElementById('gradient-end').value = this.state.gradient.end;
        document.getElementById('gradient-end-hex').value = this.state.gradient.end;
    }

    updateGradientPreview() {
        const preview = document.getElementById('gradient-preview');
        if (preview) {
            preview.style.background = `linear-gradient(${this.state.gradient.angle}deg, ${this.state.gradient.start}, ${this.state.gradient.end})`;
        }
    }

    // 커스텀 컬러 변경 시 프리셋 선택 해제
    clearPresetSelection() {
        document.querySelectorAll('#color-themes .color-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    // 프리셋 선택 시 호출 (외부에서 사용)
    setGradientFromPreset(startColor, endColor) {
        this.state.gradient.start = startColor;
        this.state.gradient.end = endColor;
        this.updateColorInputs();
        this.updateGradientPreview();
        this.applyBackground();
    }

    validateHex(hex) {
        hex = hex.trim();
        if (!hex.startsWith('#')) hex = '#' + hex;
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            return hex;
        }
        return null;
    }

    // ============================================
    // 단색 편집기
    // ============================================
    bindSolidEditor() {
        const solidColor = document.getElementById('solid-color');
        const solidHex = document.getElementById('solid-color-hex');

        solidColor.addEventListener('input', (e) => {
            this.state.solidColor = e.target.value;
            solidHex.value = e.target.value;
            this.applyBackground();
        });

        solidHex.addEventListener('change', (e) => {
            const value = this.validateHex(e.target.value);
            if (value) {
                this.state.solidColor = value;
                solidColor.value = value;
                this.applyBackground();
            }
        });
    }

    // ============================================
    // 이미지 배경 편집기
    // ============================================
    bindImageEditor() {
        const uploadArea = document.getElementById('bg-image-upload');
        const fileInput = document.getElementById('bg-image-input');
        const placeholder = document.getElementById('upload-placeholder');
        const previewContainer = document.getElementById('bg-upload-preview');
        const previewImg = document.getElementById('bg-preview-img');
        const removeBtn = document.getElementById('remove-bg-image');
        const imageControls = document.getElementById('image-controls');

        // 클릭으로 업로드
        placeholder.addEventListener('click', () => fileInput.click());

        // 드래그 앤 드롭
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleBgImageUpload(file);
            }
        });

        // 파일 선택
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleBgImageUpload(file);
            }
        });

        // 이미지 제거
        removeBtn.addEventListener('click', () => {
            this.state.bgImage.url = null;
            placeholder.style.display = 'flex';
            previewContainer.style.display = 'none';
            imageControls.style.display = 'none';
            this.applyBackground();
        });

        // 이미지 설정 컨트롤
        this.bindImageControls();
    }

    handleBgImageUpload(file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('파일 크기는 5MB 이하여야 합니다.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.state.bgImage.url = e.target.result;
            
            // UI 업데이트
            document.getElementById('upload-placeholder').style.display = 'none';
            document.getElementById('bg-upload-preview').style.display = 'block';
            document.getElementById('bg-preview-img').src = e.target.result;
            document.getElementById('image-controls').style.display = 'block';
            
            this.applyBackground();
        };
        reader.readAsDataURL(file);
    }

    bindImageControls() {
        // 이미지 맞춤 옵션
        const fitBtns = document.querySelectorAll('.fit-btn');
        fitBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                fitBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.bgImage.fit = btn.dataset.fit;
                this.applyBackground();
            });
        });

        // 위치 컨트롤
        const posBtns = document.querySelectorAll('.pos-btn');
        posBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                posBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.bgImage.position = btn.dataset.pos;
                this.applyBackground();
            });
        });

        // 오버레이
        const overlaySlider = document.getElementById('image-overlay');
        const overlayValue = document.getElementById('overlay-value');
        overlaySlider.addEventListener('input', (e) => {
            this.state.bgImage.overlay = e.target.value;
            overlayValue.textContent = e.target.value;
            this.applyBackground();
        });

        // 오버레이 색상
        const overlayColor = document.getElementById('overlay-color');
        const overlayHex = document.getElementById('overlay-color-hex');
        overlayColor.addEventListener('input', (e) => {
            this.state.bgImage.overlayColor = e.target.value;
            overlayHex.value = e.target.value;
            this.applyBackground();
        });

        // 블러
        const blurSlider = document.getElementById('image-blur');
        const blurValue = document.getElementById('blur-value');
        blurSlider.addEventListener('input', (e) => {
            this.state.bgImage.blur = e.target.value;
            blurValue.textContent = e.target.value;
            this.applyBackground();
        });
    }

    // ============================================
    // 배경 적용
    // ============================================
    applyBackground() {
        const canvas = document.getElementById('ad-canvas');
        const bgImage = document.getElementById('ad-bg-image');
        const overlay = document.getElementById('ad-overlay');

        // 기본 초기화
        canvas.style.background = '';
        bgImage.style.display = 'none';
        overlay.style.display = 'none';

        switch (this.state.bgType) {
            case 'gradient':
                canvas.style.background = `linear-gradient(${this.state.gradient.angle}deg, ${this.state.gradient.start}, ${this.state.gradient.end})`;
                break;

            case 'solid':
                canvas.style.background = this.state.solidColor;
                break;

            case 'image':
                if (this.state.bgImage.url) {
                    // 배경 이미지
                    bgImage.style.display = 'block';
                    bgImage.style.backgroundImage = `url(${this.state.bgImage.url})`;
                    bgImage.style.backgroundSize = this.state.bgImage.fit === 'stretch' ? '100% 100%' : this.state.bgImage.fit;
                    bgImage.style.backgroundPosition = this.state.bgImage.position;
                    bgImage.style.filter = `blur(${this.state.bgImage.blur}px)`;

                    // 오버레이
                    if (this.state.bgImage.overlay > 0) {
                        overlay.style.display = 'block';
                        overlay.style.backgroundColor = this.state.bgImage.overlayColor;
                        overlay.style.opacity = this.state.bgImage.overlay / 100;
                    }
                } else {
                    // 이미지 없으면 기본 그라데이션
                    canvas.style.background = `linear-gradient(${this.state.gradient.angle}deg, ${this.state.gradient.start}, ${this.state.gradient.end})`;
                }
                break;
        }
    }

    // ============================================
    // 요소 추가 (이미지/텍스트)
    // ============================================
    bindElementUpload() {
        const addBtn = document.getElementById('add-image-btn');
        const fileInput = document.getElementById('element-image-input');

        addBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.addImageElement(file);
            }
            fileInput.value = ''; // 리셋
        });
    }

    addImageElement(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const elementId = 'element-' + Date.now();
            const element = {
                id: elementId,
                type: 'image',
                url: e.target.result,
                x: 50, // % 기준
                y: 50,
                width: 30,
                height: 'auto',
                rotation: 0,
                opacity: 100,
                zIndex: 15,
                layer: 'front'  // 기본: 텍스트 앞
            };

            this.state.elements.push(element);
            this.renderElement(element);
            this.updateLayersList();
        };
        reader.readAsDataURL(file);
    }

    renderElement(element) {
        // front(앞) 또는 back(뒤) 컨테이너 선택
        const containerId = element.layer === 'back' ? 'ad-elements-back' : 'ad-elements';
        const container = document.getElementById(containerId);
        
        const el = document.createElement('div');
        el.className = 'ad-element draggable';
        el.id = element.id;
        el.dataset.elementId = element.id;
        el.style.cssText = `
            position: absolute;
            left: ${element.x}%;
            top: ${element.y}%;
            transform: translate(-50%, -50%) rotate(${element.rotation}deg);
            width: ${element.width}%;
            opacity: ${element.opacity / 100};
            z-index: ${element.zIndex};
            cursor: move;
        `;

        if (element.type === 'image') {
            const img = document.createElement('img');
            img.src = element.url;
            img.style.width = '100%';
            img.style.height = 'auto';
            img.draggable = false;
            el.appendChild(img);
        }

        // 리사이즈 핸들 추가
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        resizeHandle.innerHTML = '';
        el.appendChild(resizeHandle);

        // 회전 핸들 추가
        const rotateHandle = document.createElement('div');
        rotateHandle.className = 'rotate-handle';
        rotateHandle.innerHTML = '';
        el.appendChild(rotateHandle);

        // 삭제 버튼 추가
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'element-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteElement(element.id);
        });
        el.appendChild(deleteBtn);

        // 드래그 가능하게
        this.makeDraggable(el, element);
        
        // 리사이즈 가능하게
        this.makeResizable(el, element, resizeHandle);
        
        // 회전 가능하게
        this.makeRotatable(el, element, rotateHandle);

        // 클릭으로 선택
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(element.id);
        });

        // 더블클릭으로 편집
        el.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.openElementEditor(element.id);
        });

        container.appendChild(el);
    }

    makeDraggable(el, element) {
        let isDragging = false;
        let startX, startY;
        let startLeft, startTop;

        const onMouseDown = (e) => {
            // 리사이즈/회전 핸들이면 드래그 안 함
            if (e.target.classList.contains('resize-handle') || 
                e.target.classList.contains('rotate-handle') ||
                e.target.classList.contains('element-delete-btn')) {
                return;
            }
            
            e.preventDefault();
            isDragging = true;
            startX = e.clientX || e.touches?.[0]?.clientX;
            startY = e.clientY || e.touches?.[0]?.clientY;
            
            startLeft = element.x;
            startTop = element.y;
            
            el.classList.add('dragging');
            this.selectElement(element.id);
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();

            const clientX = e.clientX || e.touches?.[0]?.clientX;
            const clientY = e.clientY || e.touches?.[0]?.clientY;

            const canvas = document.getElementById('ad-canvas');
            const containerRect = canvas.getBoundingClientRect();
            const deltaX = ((clientX - startX) / containerRect.width) * 100;
            const deltaY = ((clientY - startY) / containerRect.height) * 100;

            let newX = Math.max(5, Math.min(95, startLeft + deltaX));
            let newY = Math.max(5, Math.min(95, startTop + deltaY));

            // 중앙 스냅 (50% 근처에서 자석처럼 붙음)
            const snapThreshold = 3;
            if (Math.abs(newX - 50) < snapThreshold) {
                newX = 50;
                canvas.classList.add('show-guides');
            } else if (Math.abs(newY - 50) < snapThreshold) {
                newY = 50;
                canvas.classList.add('show-guides');
            } else {
                canvas.classList.remove('show-guides');
            }

            element.x = newX;
            element.y = newY;

            el.style.left = `${element.x}%`;
            el.style.top = `${element.y}%`;

            // 위치 툴팁 표시
            this.showPositionTooltip(clientX, clientY, element.x, element.y);
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                el.classList.remove('dragging');
                document.getElementById('ad-canvas').classList.remove('show-guides');
                this.hidePositionTooltip();
            }
        };

        // 마우스 이벤트
        el.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        
        // 터치 이벤트 (모바일)
        el.addEventListener('touchstart', onMouseDown, { passive: false });
        document.addEventListener('touchmove', onMouseMove, { passive: false });
        document.addEventListener('touchend', onMouseUp);
    }

    makeResizable(el, element, handle) {
        let isResizing = false;
        let startX, startWidth;

        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            isResizing = true;
            startX = e.clientX;
            startWidth = element.width;
            el.classList.add('resizing');
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const containerRect = document.getElementById('ad-canvas').getBoundingClientRect();
            const deltaX = ((e.clientX - startX) / containerRect.width) * 100;

            element.width = Math.max(10, Math.min(100, startWidth + deltaX));
            el.style.width = `${element.width}%`;
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                el.classList.remove('resizing');
            }
        });
    }

    makeRotatable(el, element, handle) {
        let isRotating = false;
        let centerX, centerY, startAngle;

        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            isRotating = true;
            
            const rect = el.getBoundingClientRect();
            centerX = rect.left + rect.width / 2;
            centerY = rect.top + rect.height / 2;
            startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
            
            el.classList.add('rotating');
        });

        document.addEventListener('mousemove', (e) => {
            if (!isRotating) return;

            const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
            const deltaAngle = currentAngle - startAngle;
            
            element.rotation = Math.round((element.rotation + deltaAngle) % 360);
            startAngle = currentAngle;
            
            el.style.transform = `translate(-50%, -50%) rotate(${element.rotation}deg)`;
        });

        document.addEventListener('mouseup', () => {
            if (isRotating) {
                isRotating = false;
                el.classList.remove('rotating');
            }
        });
    }

    selectElement(id) {
        // 기존 선택 해제
        document.querySelectorAll('.ad-element').forEach(el => {
            el.classList.remove('selected');
        });

        // 새로 선택
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('selected');
            this.state.selectedElement = id;
            
            // 포커스를 캔버스로 이동하여 키보드 이벤트 활성화
            const canvas = document.getElementById('ad-canvas');
            canvas.setAttribute('tabindex', '0');
            canvas.focus();
            
            console.log('Element selected:', id);
        }
    }

    openElementEditor(id) {
        const element = this.state.elements.find(e => e.id === id);
        if (!element) return;

        const modal = document.getElementById('element-modal');
        modal.classList.add('active');

        // 현재 값 설정
        document.getElementById('element-size').value = element.width;
        document.getElementById('element-size-value').textContent = element.width;
        document.getElementById('element-rotation').value = element.rotation;
        document.getElementById('element-rotation-value').textContent = element.rotation;
        document.getElementById('element-opacity').value = element.opacity;
        document.getElementById('element-opacity-value').textContent = element.opacity;

        // 슬라이더 이벤트
        const sizeSlider = document.getElementById('element-size');
        const rotationSlider = document.getElementById('element-rotation');
        const opacitySlider = document.getElementById('element-opacity');

        const updateElement = () => {
            element.width = parseInt(sizeSlider.value);
            element.rotation = parseInt(rotationSlider.value);
            element.opacity = parseInt(opacitySlider.value);

            document.getElementById('element-size-value').textContent = element.width;
            document.getElementById('element-rotation-value').textContent = element.rotation;
            document.getElementById('element-opacity-value').textContent = element.opacity;

            const el = document.getElementById(id);
            if (el) {
                el.style.width = `${element.width}%`;
                el.style.transform = `translate(-50%, -50%) rotate(${element.rotation}deg)`;
                el.style.opacity = element.opacity / 100;
            }
        };

        sizeSlider.oninput = updateElement;
        rotationSlider.oninput = updateElement;
        opacitySlider.oninput = updateElement;

        // 삭제 버튼
        document.getElementById('delete-element').onclick = () => {
            this.deleteElement(id);
            modal.classList.remove('active');
        };

        // 닫기 버튼
        document.getElementById('close-element-modal').onclick = () => {
            modal.classList.remove('active');
        };
    }

    deleteElement(id) {
        // 배열에서 제거
        this.state.elements = this.state.elements.filter(e => e.id !== id);
        
        // DOM에서 제거
        const el = document.getElementById(id);
        if (el) el.remove();
        
        // 레이어 목록 업데이트
        this.updateLayersList();
    }

    // ============================================
    // 레이어 관리
    // ============================================
    bindLayerControls() {
        // 텍스트 레이어 추가
        document.getElementById('add-text-layer').addEventListener('click', () => {
            // 텍스트 레이어는 추후 구현
            alert('텍스트 레이어 기능은 추후 업데이트 예정입니다.');
        });
    }

    updateLayersList() {
        const list = document.getElementById('layers-items');
        list.innerHTML = '';

        // 역순으로 표시 (위에 있는 게 위)
        [...this.state.elements].reverse().forEach((element, index) => {
            const item = document.createElement('div');
            item.className = 'layer-item';
            item.innerHTML = `
                <span class="layer-icon">${element.type === 'image' ? 'IMG' : 'TXT'}</span>
                <span class="layer-name">${element.type === 'image' ? '이미지' : '텍스트'} ${this.state.elements.length - index}</span>
                <div class="layer-actions">
                    <button class="layer-btn" data-action="up" data-id="${element.id}">↑</button>
                    <button class="layer-btn" data-action="down" data-id="${element.id}">↓</button>
                    <button class="layer-btn delete" data-action="delete" data-id="${element.id}">×</button>
                </div>
            `;

            // 레이어 선택
            item.addEventListener('click', () => {
                this.selectElement(element.id);
            });

            list.appendChild(item);
        });

        // 레이어 액션 버튼
        list.querySelectorAll('.layer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const id = btn.dataset.id;

                if (action === 'delete') {
                    this.deleteElement(id);
                } else if (action === 'up' || action === 'down') {
                    this.moveLayer(id, action);
                }
            });
        });
    }

    moveLayer(id, direction) {
        const element = this.state.elements.find(e => e.id === id);
        if (!element) return;

        const dom = document.getElementById(id);
        if (!dom) return;

        const frontContainer = document.getElementById('ad-elements');
        const backContainer = document.getElementById('ad-elements-back');

        if (direction === 'up') {
            // ] 버튼: 맨 앞으로 (텍스트 위)
            frontContainer.appendChild(dom);
            element.layer = 'front';
            this.showLayerFeedback('맨 앞으로 이동', true);
        } else if (direction === 'down') {
            // [ 버튼: 맨 뒤로 (텍스트 뒤)
            backContainer.appendChild(dom);
            element.layer = 'back';
            this.showLayerFeedback('맨 뒤로 이동', false);
        }

        this.updateLayersList();
    }

    showLayerFeedback(message, isFront) {
        let feedback = document.getElementById('layer-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'layer-feedback';
            feedback.className = 'layer-feedback';
            document.body.appendChild(feedback);
        }
        
        feedback.textContent = message;
        feedback.classList.add('visible');
        feedback.style.background = isFront ? '#3b82f6' : '#f59e0b';
        
        clearTimeout(this.layerFeedbackTimeout);
        this.layerFeedbackTimeout = setTimeout(() => {
            feedback.classList.remove('visible');
        }, 1000);
    }

    // ============================================
    // 상태 저장/불러오기
    // ============================================
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    setState(newState) {
        this.state = newState;
        this.applyBackground();
        // 요소 다시 렌더링
        document.getElementById('ad-elements').innerHTML = '';
        this.state.elements.forEach(el => this.renderElement(el));
        this.updateLayersList();
    }
}

// 전역 인스턴스
let designEditor;

document.addEventListener('DOMContentLoaded', () => {
    designEditor = new DesignEditor();
    window.designEditor = designEditor;

    // 키보드 단축키
    document.addEventListener('keydown', (e) => {
        // 입력 필드에서는 무시
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }

        const selected = designEditor.state.selectedElement;
        if (!selected) return;

        const element = designEditor.state.elements.find(el => el.id === selected);
        if (!element) return;

        const el = document.getElementById(selected);
        if (!el) return;

        // Shift: 10px, Ctrl: 1px, 기본: 5px
        const step = e.shiftKey ? 10 : (e.ctrlKey ? 1 : 5);

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                element.y = Math.max(0, element.y - step);
                el.style.top = `${element.y}%`;
                designEditor.showPositionFeedback(element);
                break;
            case 'ArrowDown':
                e.preventDefault();
                element.y = Math.min(100, element.y + step);
                el.style.top = `${element.y}%`;
                designEditor.showPositionFeedback(element);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                element.x = Math.max(0, element.x - step);
                el.style.left = `${element.x}%`;
                designEditor.showPositionFeedback(element);
                break;
            case 'ArrowRight':
                e.preventDefault();
                element.x = Math.min(100, element.x + step);
                el.style.left = `${element.x}%`;
                designEditor.showPositionFeedback(element);
                break;
            case 'Delete':
            case 'Backspace':
                e.preventDefault();
                designEditor.deleteElement(selected);
                break;
            case 'Escape':
                designEditor.deselectAll();
                break;
            case '[':
                // 레이어 아래로
                e.preventDefault();
                designEditor.moveLayer(selected, 'down');
                break;
            case ']':
                // 레이어 위로
                e.preventDefault();
                designEditor.moveLayer(selected, 'up');
                break;
        }
    });

    // 키보드 힌트 표시
    const hint = document.createElement('div');
    hint.className = 'keyboard-hint';
    hint.innerHTML = `
        <strong>이미지 단축키</strong><br>
        <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> 이동 (5%)<br>
        <kbd>Shift</kbd> + 방향키: 빠른 이동 (10%)<br>
        <kbd>Ctrl</kbd> + 방향키: 미세 이동 (1%)<br>
        <kbd>Delete</kbd> 삭제 | <kbd>Esc</kbd> 선택 해제<br>
        <kbd>[</kbd> 텍스트 뒤로 | <kbd>]</kbd> 텍스트 앞으로
    `;
    document.body.appendChild(hint);
});

