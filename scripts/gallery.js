/**
 * XALOC EVENTS - Local Gallery
 * Lee imágenes desde images/gallery/ vía manifest.json generado por gallery_sync.py
 */

// ============ ESTADO DE LA GALERÍA ============
let galleryState = {
    folders: [],
    currentAlbum: null,
    currentPhotos: [],
    currentPhotoIndex: 0,
    isLoading: false,
    showAllFolders: false,
    maxVisibleFolders: 4,
    minFoldersForShowMore: 4,
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0,
    isSwiping: false,
    swipeThreshold: 50
};

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', () => {
    initGallery();
});

async function initGallery() {
    const gallerySection = document.getElementById('gallery');
    if (!gallerySection) return;

    showLoading();

    try {
        const folders = await fetchManifest();
        galleryState.folders = folders;
        renderFolders(folders);
    } catch (error) {
        console.error('Error loading gallery:', error);
        showGalleryError('Error al cargar la galería. Por favor, inténtalo más tarde.');
    }
}

// ============ MANIFEST LOCAL ============
async function fetchManifest() {
    const response = await fetch('images/gallery/manifest.json');
    if (!response.ok) {
        throw new Error(`No se pudo cargar manifest.json: ${response.status}`);
    }
    return await response.json();
}

// ============ RENDERIZADO ============
function renderFolders(folders) {
    const gallerySection = document.getElementById('gallery');
    const isVertical = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
    const hasMoreFolders = isVertical && folders.length >= galleryState.minFoldersForShowMore;

    gallerySection.innerHTML = `
        <div class="gallery-header">
            <img src="images/effects/effect_04.webp" alt="Effect 4" class="effect-4">
            <h2 class="gallery-title" data-i18n="nav-gallery">Galeria</h2>
        </div>
        <div class="folders-carousel">
            ${folders.length > 0
                ? folders.map((folder, index) => createFolderCard(folder, index, isVertical, folders.length)).join('')
                : '<p class="gallery-error-text" data-i18n="gallery-no-albums">No hi ha àlbums disponibles</p>'
            }
        </div>
        ${hasMoreFolders ? `
        <div class="show-more-container" id="show-more-container">
            <button class="show-more-btn" id="show-more-btn" data-i18n="gallery-show-more">Mostrar més</button>
        </div>
        ` : ''}
        ${createAlbumPanelHTML()}
        ${createPhotoViewerHTML()}
    `;

    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }

    attachFolderListeners();
    window.addEventListener('resize', handleResize);
}

function handleResize() {
    const isVertical = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
    const folderCards = document.querySelectorAll('.folder-card');
    const showMoreContainer = document.getElementById('show-more-container');
    const totalFolders = galleryState.folders.length;

    if (isVertical && !galleryState.showAllFolders) {
        folderCards.forEach((card, index) => {
            if (index >= galleryState.maxVisibleFolders) {
                card.classList.add('hidden-folder');
                card.classList.remove('show-all', 'fade-folder');
            } else if (index === 3 && totalFolders >= galleryState.minFoldersForShowMore) {
                card.classList.add('fade-folder');
                card.classList.remove('hidden-folder');
            } else {
                card.classList.remove('hidden-folder', 'fade-folder');
            }
        });
        if (showMoreContainer && totalFolders >= galleryState.minFoldersForShowMore) {
            showMoreContainer.classList.remove('hidden');
        }
    } else {
        folderCards.forEach(card => {
            card.classList.remove('hidden-folder', 'fade-folder');
            card.classList.add('show-all');
        });
        if (showMoreContainer) {
            showMoreContainer.classList.add('hidden');
        }
    }
}

function createFolderCard(folder, index, isVertical, totalFolders) {
    const hasLogo = !!folder.logo;
    const logoStyle = hasLogo
        ? `background-image: url('${folder.logo}'); background-size: contain; background-position: center; background-repeat: no-repeat;`
        : '';

    let extraClasses = '';
    const shouldShowMore = totalFolders >= galleryState.minFoldersForShowMore;

    if (isVertical && !galleryState.showAllFolders && shouldShowMore) {
        if (index >= galleryState.maxVisibleFolders) {
            extraClasses = 'hidden-folder';
        } else if (index === 3) {
            extraClasses = 'fade-folder';
        }
    }

    return `
        <div class="folder-card ${extraClasses}" data-folder-index="${index}">
            <div class="folder-icon ${hasLogo ? 'has-logo' : ''}" style="${logoStyle}">
                ${!hasLogo ? `
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                </svg>
                ` : ''}
            </div>
            ${!hasLogo ? `<p class="folder-name">${folder.name}</p>` : ''}
            <p class="folder-count ${!hasLogo ? 'no-logo' : ''}">${folder.photoCount} <span data-i18n="gallery-photos">fotos</span></p>
        </div>
    `;
}

function createAlbumPanelHTML() {
    return `
        <div class="album-backdrop" id="album-backdrop">
            <div class="album-panel-overlay" id="album-panel-overlay">
                <div class="album-header">
                    <button class="album-back-btn" id="album-close-btn" aria-label="Cerrar álbum">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <div class="album-header-center">
                        <div class="album-logo" id="album-logo"></div>
                        <h2 class="album-title" id="album-title"></h2>
                    </div>
                </div>
                <div class="album-panel">
                    <div class="photo-grid" id="photo-grid"></div>
                </div>
            </div>
        </div>
    `;
}

function createPhotoViewerHTML() {
    return `
        <div class="photo-viewer-overlay" id="photo-viewer-overlay">
            <div class="photo-viewer">
                <div class="photo-viewer-header">
                    <button class="album-back-btn" id="viewer-close-btn" aria-label="Cerrar visor">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <h3 class="photo-viewer-title" id="viewer-title"></h3>
                    <div class="photo-viewer-actions"></div>
                </div>
                <div class="photo-viewer-content">
                    <button class="photo-nav-btn photo-nav-prev" id="photo-prev-btn" aria-label="Foto anterior">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18l-6-6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <div class="photo-carousel" id="photo-carousel">
                        <div class="photo-carousel-track" id="photo-carousel-track"></div>
                    </div>
                    <button class="photo-nav-btn photo-nav-next" id="photo-next-btn" aria-label="Siguiente foto">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="photo-viewer-download">
                    <button class="download-btn" id="viewer-download-btn" aria-label="Descargar foto">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span data-i18n="gallery-download">Descarregar</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function showLoading() {
    const gallerySection = document.getElementById('gallery');
    gallerySection.innerHTML = `
        <div class="gallery-header">
            <h1 class="gallery-title" data-i18n="nav-gallery">Galeria</h1>
        </div>
        <div class="gallery-loading">
            <div class="loading-spinner"></div>
            <p class="loading-text" data-i18n="gallery-loading">Carregant galeria...</p>
        </div>
    `;
}

function showGalleryError(message) {
    const gallerySection = document.getElementById('gallery');
    gallerySection.innerHTML = `
        <div class="gallery-header">
            <h1 class="gallery-title" data-i18n="nav-gallery">Galeria</h1>
            <img src="images/effects/effect_04.webp" alt="Effect 4" class="effect-4">
        </div>
        <div class="gallery-error">
            <div class="gallery-error-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
            </div>
            <p class="gallery-error-text">${message}</p>
        </div>
    `;
}

// ============ EVENT LISTENERS ============
function attachFolderListeners() {
    document.querySelectorAll('.folder-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = parseInt(card.dataset.folderIndex);
            openAlbum(index);
        });
    });

    const showMoreBtn = document.getElementById('show-more-btn');
    if (showMoreBtn) showMoreBtn.addEventListener('click', showAllFolders);

    const albumCloseBtn = document.getElementById('album-close-btn');
    const albumBackdrop = document.getElementById('album-backdrop');
    if (albumCloseBtn) albumCloseBtn.addEventListener('click', closeAlbum);
    if (albumBackdrop) {
        albumBackdrop.addEventListener('click', (e) => {
            if (e.target === albumBackdrop) closeAlbum();
        });
    }

    const viewerCloseBtn = document.getElementById('viewer-close-btn');
    const viewerOverlay  = document.getElementById('photo-viewer-overlay');
    const prevBtn        = document.getElementById('photo-prev-btn');
    const nextBtn        = document.getElementById('photo-next-btn');
    const downloadBtn    = document.getElementById('viewer-download-btn');

    if (viewerCloseBtn) viewerCloseBtn.addEventListener('click', closePhotoViewer);
    if (viewerOverlay) {
        viewerOverlay.addEventListener('click', (e) => {
            if (e.target === viewerOverlay || e.target.classList.contains('photo-viewer-content')) {
                closePhotoViewer();
            }
        });
    }
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPreviousPhoto(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNextPhoto(); });
    if (downloadBtn) downloadBtn.addEventListener('click', (e) => { e.stopPropagation(); downloadCurrentPhoto(); });

    document.addEventListener('keydown', handleKeyboardNavigation);
    attachSwipeListeners();
}

function handleKeyboardNavigation(e) {
    const viewerOverlay = document.getElementById('photo-viewer-overlay');
    const albumOverlay  = document.getElementById('album-panel-overlay');

    if (viewerOverlay && viewerOverlay.classList.contains('active')) {
        if (e.key === 'ArrowLeft')  showPreviousPhoto();
        if (e.key === 'ArrowRight') showNextPhoto();
        if (e.key === 'Escape')     closePhotoViewer();
    } else if (albumOverlay && albumOverlay.classList.contains('active')) {
        if (e.key === 'Escape') closeAlbum();
    }
}

// ============ ALBUM ============
function openAlbum(folderIndex) {
    const folder = galleryState.folders[folderIndex];
    if (!folder) return;

    galleryState.currentAlbum  = folder;
    galleryState.currentPhotos = folder.photos || [];

    const albumOverlay = document.getElementById('album-panel-overlay');
    const albumBackdrop = document.getElementById('album-backdrop');
    const albumTitle   = document.getElementById('album-title');
    const albumLogo    = document.getElementById('album-logo');
    const photoGrid    = document.getElementById('photo-grid');

    // Logo o título
    if (folder.logo) {
        albumLogo.innerHTML = `<img src="${folder.logo}" alt="${folder.name}" />`;
        albumLogo.classList.add('has-logo');
        albumTitle.style.display = 'none';
    } else {
        albumLogo.innerHTML = '';
        albumLogo.classList.remove('has-logo');
        albumTitle.style.display = '';
        albumTitle.textContent = folder.name;
    }

    // Render fotos con lazy loading nativo
    renderPhotos(galleryState.currentPhotos);

    albumOverlay.classList.add('active');
    albumBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAlbum() {
    document.getElementById('album-panel-overlay').classList.remove('active');
    document.getElementById('album-backdrop').classList.remove('active');
    document.body.style.overflow = '';
    galleryState.currentAlbum  = null;
    galleryState.currentPhotos = [];
}

// ============ FOTOS — lazy loading optimizado ============
function renderPhotos(photos) {
    const photoGrid = document.getElementById('photo-grid');

    if (!photos || photos.length === 0) {
        photoGrid.innerHTML = `<p class="gallery-error-text" style="grid-column: 1 / -1;" data-i18n="gallery-no-photos">No hi ha fotos en aquest àlbum</p>`;
        return;
    }

    // Usar loading="lazy" nativo del navegador — sin peticiones adicionales a APIs
    photoGrid.innerHTML = photos.map((photoPath, index) => {
        const name = photoPath.split('/').pop();
        return `
            <div class="photo-item" data-photo-index="${index}">
                <img
                    src="${photoPath}"
                    alt="${name}"
                    loading="lazy"
                    decoding="async"
                >
                <div class="photo-item-overlay">
                    <p class="photo-item-name">${name}</p>
                </div>
            </div>
        `;
    }).join('');

    photoGrid.querySelectorAll('.photo-item').forEach(item => {
        item.addEventListener('click', () => {
            openPhotoViewer(parseInt(item.dataset.photoIndex));
        });
    });
}

// ============ PHOTO VIEWER ============
function openPhotoViewer(index) {
    galleryState.currentPhotoIndex = index;

    const viewerOverlay = document.getElementById('photo-viewer-overlay');
    const viewerTitle   = document.getElementById('viewer-title');

    initCarousel();

    const photoPath = galleryState.currentPhotos[index];
    viewerTitle.textContent = photoPath ? photoPath.split('/').pop() : '';

    viewerOverlay.classList.add('active');
    updateNavigationButtons();
}

function initCarousel() {
    const track  = document.getElementById('photo-carousel-track');
    const photos = galleryState.currentPhotos;

    // Crear slides — solo el actual y adyacentes cargan de inmediato, el resto lazy
    track.innerHTML = photos.map((photoPath, index) => {
        const name = photoPath.split('/').pop();
        const isNear = Math.abs(index - galleryState.currentPhotoIndex) <= 1;
        return `
            <div class="carousel-slide" data-index="${index}">
                <img
                    class="carousel-image ${isNear ? 'loaded' : ''}"
                    ${isNear ? `src="${photoPath}"` : `data-src="${photoPath}"`}
                    alt="${name}"
                    draggable="false"
                >
                ${!isNear ? `<div class="carousel-loader"><div class="loading-spinner"></div></div>` : ''}
            </div>
        `;
    }).join('');

    updateCarouselPosition(false);
}

function loadNearbyImages() {
    const currentIndex = galleryState.currentPhotoIndex;
    const photos       = galleryState.currentPhotos;

    [-1, 0, 1].forEach(offset => {
        const idx = currentIndex + offset;
        if (idx < 0 || idx >= photos.length) return;

        const slide = document.querySelector(`.carousel-slide[data-index="${idx}"]`);
        if (!slide) return;

        const img    = slide.querySelector('.carousel-image');
        const loader = slide.querySelector('.carousel-loader');

        if (!img || img.src) return; // ya cargada

        const src = img.dataset.src;
        if (!src) return;

        img.src = src;
        img.classList.add('loaded');
        if (loader) loader.style.display = 'none';
    });
}

function updateCarouselPosition(animate = true) {
    const track  = document.getElementById('photo-carousel-track');
    const offset = -galleryState.currentPhotoIndex * 100;

    track.style.transition = animate ? 'transform 0.3s ease-out' : 'none';
    track.style.transform  = `translateX(${offset}%)`;

    const viewerTitle = document.getElementById('viewer-title');
    const photoPath   = galleryState.currentPhotos[galleryState.currentPhotoIndex];
    if (photoPath && viewerTitle) {
        viewerTitle.textContent = photoPath.split('/').pop();
    }
}

function closePhotoViewer() {
    document.getElementById('photo-viewer-overlay').classList.remove('active');
    const track = document.getElementById('photo-carousel-track');
    if (track) { track.innerHTML = ''; track.style.transform = ''; }
}

function showPreviousPhoto() {
    if (galleryState.currentPhotoIndex > 0) {
        galleryState.currentPhotoIndex--;
        updateCarouselPosition(true);
        loadNearbyImages();
        updateNavigationButtons();
    }
}

function showNextPhoto() {
    if (galleryState.currentPhotoIndex < galleryState.currentPhotos.length - 1) {
        galleryState.currentPhotoIndex++;
        updateCarouselPosition(true);
        loadNearbyImages();
        updateNavigationButtons();
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('photo-prev-btn');
    const nextBtn = document.getElementById('photo-next-btn');
    const isFirst = galleryState.currentPhotoIndex === 0;
    const isLast  = galleryState.currentPhotoIndex === galleryState.currentPhotos.length - 1;

    prevBtn.style.opacity       = isFirst ? '0.3' : '1';
    prevBtn.style.pointerEvents = isFirst ? 'none' : 'auto';
    nextBtn.style.opacity       = isLast  ? '0.3' : '1';
    nextBtn.style.pointerEvents = isLast  ? 'none' : 'auto';
}

function downloadCurrentPhoto() {
    const photoPath   = galleryState.currentPhotos[galleryState.currentPhotoIndex];
    const downloadBtn = document.getElementById('viewer-download-btn');
    const span        = downloadBtn.querySelector('span');

    const downloadingText = (typeof translations !== 'undefined' && translations[currentLanguage]?.['gallery-downloading']) || 'Descarregant...';
    const downloadText    = (typeof translations !== 'undefined' && translations[currentLanguage]?.['gallery-download'])    || 'Descarregar';

    span.textContent    = downloadingText;
    downloadBtn.disabled = true;

    fetch(photoPath)
        .then(r => r.blob())
        .then(blob => {
            const url  = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href     = url;
            link.download = photoPath.split('/').pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        })
        .catch(() => window.open(photoPath, '_blank'))
        .finally(() => {
            span.textContent     = downloadText;
            downloadBtn.disabled = false;
        });
}

// ============ SHOW MORE ============
function showAllFolders() {
    galleryState.showAllFolders = true;
    document.querySelectorAll('.folder-card').forEach(card => {
        card.classList.remove('hidden-folder', 'fade-folder');
        card.classList.add('show-all');
    });
    const showMoreContainer = document.getElementById('show-more-container');
    if (showMoreContainer) showMoreContainer.classList.add('hidden');
}

// ============ SWIPE / TOUCH ============
function attachSwipeListeners() {
    const carousel = document.getElementById('photo-carousel');
    if (!carousel) return;

    carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
    carousel.addEventListener('touchmove',  handleTouchMove,  { passive: false });
    carousel.addEventListener('touchend',   handleTouchEnd,   { passive: true });
    carousel.addEventListener('mousedown',  handleMouseDown);
    carousel.addEventListener('mousemove',  handleMouseMove);
    carousel.addEventListener('mouseup',    handleMouseUp);
    carousel.addEventListener('mouseleave', handleMouseUp);
}

function isViewerActive() {
    const overlay = document.getElementById('photo-viewer-overlay');
    return overlay && overlay.classList.contains('active');
}

function handleTouchStart(e) {
    if (!isViewerActive()) return;
    galleryState.touchStartX = e.touches[0].clientX;
    galleryState.touchStartY = e.touches[0].clientY;
    galleryState.touchEndX   = e.touches[0].clientX;
    galleryState.isSwiping   = true;
    const track = document.getElementById('photo-carousel-track');
    if (track) track.style.transition = 'none';
}

function handleTouchMove(e) {
    if (!galleryState.isSwiping || !isViewerActive()) return;
    galleryState.touchEndX = e.touches[0].clientX;
    galleryState.touchEndY = e.touches[0].clientY;
    const diffX = galleryState.touchStartX - galleryState.touchEndX;
    const diffY = Math.abs(galleryState.touchStartY - galleryState.touchEndY);

    if (Math.abs(diffX) > diffY) {
        e.preventDefault();
        applyDragOffset(diffX);
    }
}

function handleTouchEnd() {
    if (!galleryState.isSwiping || !isViewerActive()) { galleryState.isSwiping = false; return; }
    const diffX = galleryState.touchStartX - galleryState.touchEndX;
    const diffY = Math.abs(galleryState.touchStartY - galleryState.touchEndY);
    if (Math.abs(diffX) > diffY && Math.abs(diffX) > galleryState.swipeThreshold) {
        if (diffX > 0) showNextPhoto(); else showPreviousPhoto();
    } else {
        updateCarouselPosition(true);
    }
    resetSwipeState();
}

function handleMouseDown(e) {
    if (!isViewerActive()) return;
    if (e.target.closest('.photo-nav-btn') || e.target.closest('.download-btn')) return;
    e.preventDefault();
    galleryState.touchStartX = e.clientX;
    galleryState.touchStartY = e.clientY;
    galleryState.touchEndX   = e.clientX;
    galleryState.isSwiping   = true;
    const track = document.getElementById('photo-carousel-track');
    if (track) track.style.transition = 'none';
    e.currentTarget.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
    if (!galleryState.isSwiping || !isViewerActive()) return;
    galleryState.touchEndX = e.clientX;
    galleryState.touchEndY = e.clientY;
    applyDragOffset(galleryState.touchStartX - galleryState.touchEndX);
}

function handleMouseUp(e) {
    if (!galleryState.isSwiping) return;
    if (e.currentTarget) e.currentTarget.style.cursor = '';
    if (!isViewerActive()) { galleryState.isSwiping = false; return; }
    const diffX = galleryState.touchStartX - galleryState.touchEndX;
    if (Math.abs(diffX) > galleryState.swipeThreshold) {
        if (diffX > 0) showNextPhoto(); else showPreviousPhoto();
    } else {
        updateCarouselPosition(true);
    }
    resetSwipeState();
}

function applyDragOffset(diffX) {
    const track    = document.getElementById('photo-carousel-track');
    const carousel = document.getElementById('photo-carousel');
    if (!track || !carousel) return;

    const carouselWidth = carousel.offsetWidth;
    const baseOffset    = -galleryState.currentPhotoIndex * 100;
    const dragOffset    = (-diffX / carouselWidth) * 100;
    let newOffset       = baseOffset + dragOffset;

    const maxOffset = 0;
    const minOffset = -(galleryState.currentPhotos.length - 1) * 100;
    if (newOffset > maxOffset) newOffset = maxOffset + (newOffset - maxOffset) * 0.3;
    if (newOffset < minOffset) newOffset = minOffset + (newOffset - minOffset) * 0.3;

    track.style.transform = `translateX(${newOffset}%)`;
}

function resetSwipeState() {
    galleryState.isSwiping   = false;
    galleryState.touchStartX = 0;
    galleryState.touchStartY = 0;
    galleryState.touchEndX   = 0;
    galleryState.touchEndY   = 0;
}