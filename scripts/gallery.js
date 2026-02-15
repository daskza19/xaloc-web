/**
 * XALOC EVENTS - Google Drive Gallery
 * 
 * CONFIGURACIÓN REQUERIDA:
 * ========================
 * 
 * 1. Ve a https://console.cloud.google.com/
 * 2. Crea un nuevo proyecto o selecciona uno existente
 * 3. Habilita la "Google Drive API":
 *    - Ve a "APIs y servicios" > "Biblioteca"
 *    - Busca "Google Drive API" y habilítala
 * 
 * 4. Crea una API Key:
 *    - Ve a "APIs y servicios" > "Credenciales"
 *    - Haz clic en "Crear credenciales" > "Clave de API"
 *    - IMPORTANTE: Restringe la clave:
 *      a) En "Restricciones de aplicaciones" selecciona "Sitios web HTTP referentes"
 *      b) Añade tu dominio (ej: https://tudominio.com/*)
 *      c) En "Restricciones de API" selecciona "Restringir clave"
 *      d) Selecciona solo "Google Drive API"
 * 
 * 5. Configura la carpeta de Google Drive:
 *    - Abre tu carpeta principal de fotos en Google Drive
 *    - Haz clic derecho > "Compartir" > "Obtener enlace"
 *    - Cambia a "Cualquier persona con el enlace puede ver"
 *    - Copia el ID de la carpeta de la URL:
 *      https://drive.google.com/drive/folders/XXXXXXXXXXXXXX
 *                                            ^^^^^^^^^^^^^^^^^
 *                                            Este es el FOLDER_ID
 * 
 * 6. Reemplaza los valores abajo:
 */

// ============ CONFIGURACIÓN ============
const GALLERY_CONFIG = {
    // Tu API Key de Google Cloud Console (solo lectura)
    API_KEY: 'AIzaSyCe-NEPXAU1tvpsCxu6Segh73LmKXcWTtY',
    
    // ID de la carpeta principal de Google Drive (la que contiene las subcarpetas/albums)
    ROOT_FOLDER_ID: '1-WYTmYR3m95RXYnfeoQnXdYSAPW5J7Zi',
    
    // Número máximo de fotos a cargar por album (para optimizar rendimiento)
    MAX_PHOTOS_PER_ALBUM: 100,
    
    // Tipos de archivo de imagen permitidos
    ALLOWED_MIME_TYPES: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif'
    ]
};

// ============ ESTADO DE LA GALERÍA ============
let galleryState = {
    folders: [],
    currentAlbum: null,
    currentPhotos: [],
    currentPhotoIndex: 0,
    isLoading: false,
    showAllFolders: false,
    maxVisibleFolders: 4, // En vista vertical, mostrar 4 carpetas (la 4ª con fade si hay más)
    minFoldersForShowMore: 4, // Mostrar botón "mostrar más" si hay 4 o más carpetas
    // Touch/swipe state
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0,
    isSwiping: false,
    swipeThreshold: 50 // Mínimo de píxeles para considerar un swipe
};

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', () => {
    initGallery();
});

async function initGallery() {
    const gallerySection = document.getElementById('gallery');
    if (!gallerySection) return;
    
    // Verificar configuración
    if (GALLERY_CONFIG.API_KEY === 'TU_API_KEY_AQUI' || 
        GALLERY_CONFIG.ROOT_FOLDER_ID === 'TU_FOLDER_ID_AQUI') {
        showGalleryError('Galería no configurada. Consulta la documentación para configurar Google Drive.');
        return;
    }
    
    showLoading();
    
    try {
        const folders = await fetchFolders();
        galleryState.folders = folders;
        renderFolders(folders);
    } catch (error) {
        console.error('Error loading gallery:', error);
        showGalleryError('Error al cargar la galería. Por favor, inténtalo más tarde.');
    }
}

// ============ API DE GOOGLE DRIVE ============
async function fetchFolders() {
    const query = `'${GALLERY_CONFIG.ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const fields = 'files(id,name,createdTime)';
    
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&key=${GALLERY_CONFIG.API_KEY}&orderBy=name`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Para cada carpeta, obtener TODOS los archivos en UNA SOLA petición
    const foldersWithDetails = await Promise.all(
        data.files.map(async (folder) => {
            const folderData = await fetchFolderContents(folder.id);
            return {
                ...folder,
                photoCount: folderData.photoCount,
                logo: folderData.logo,
                previewImage: folderData.previewImage
            };
        })
    );
    
    // Ordenar por fecha de creación (más reciente primero)
    foldersWithDetails.sort((a, b) => {
        return new Date(b.createdTime) - new Date(a.createdTime);
    });
    
    return foldersWithDetails;
}

// Nueva función optimizada: obtiene todo el contenido de una carpeta en UNA petición
async function fetchFolderContents(folderId) {
    const mimeQuery = GALLERY_CONFIG.ALLOWED_MIME_TYPES.map(t => `mimeType='${t}'`).join(' or ');
    const query = `'${folderId}' in parents and (${mimeQuery}) and trashed=false`;
    const fields = 'files(id,name,mimeType,thumbnailLink)';
    
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&key=${GALLERY_CONFIG.API_KEY}&pageSize=100`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        return { photoCount: 0, logo: null, previewImage: null };
    }
    
    const data = await response.json();
    const files = data.files || [];
    
    // Buscar logo.png
    const logoFile = files.find(f => f.name.toLowerCase() === 'logo.png');
    const logo = logoFile ? {
        id: logoFile.id,
        thumbnail: getDirectImageUrl(logoFile.id, 'thumbnail'),
        fullSize: getDirectImageUrl(logoFile.id, 'full')
    } : null;
    
    // Filtrar fotos (excluyendo logo.png)
    const photos = files.filter(f => f.name.toLowerCase() !== 'logo.png');
    
    // Primera foto como preview
    const previewImage = photos.length > 0 ? {
        id: photos[0].id,
        name: photos[0].name,
        thumbnail: photos[0].thumbnailLink || getDirectImageUrl(photos[0].id, 'thumbnail'),
        fullSize: getDirectImageUrl(photos[0].id, 'full')
    } : null;
    
    return {
        photoCount: photos.length,
        logo: logo,
        previewImage: previewImage
    };
}

async function fetchPhotosFromFolder(folderId, limit = GALLERY_CONFIG.MAX_PHOTOS_PER_ALBUM) {
    const mimeQuery = GALLERY_CONFIG.ALLOWED_MIME_TYPES.map(t => `mimeType='${t}'`).join(' or ');
    // Excluir logo.png de la galería
    const query = `'${folderId}' in parents and (${mimeQuery}) and name!='logo.png' and trashed=false`;
    const fields = 'files(id,name,mimeType,thumbnailLink,webContentLink)';
    
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&key=${GALLERY_CONFIG.API_KEY}&pageSize=${limit}&orderBy=name`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.files.map(file => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        thumbnail: file.thumbnailLink || getDirectImageUrl(file.id, 'thumbnail'),
        fullSize: getDirectImageUrl(file.id, 'full'),
        downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`
    }));
}

function getDirectImageUrl(fileId, size = 'full') {
    // URL para mostrar la imagen directamente
    if (size === 'thumbnail') {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
    }
    // Para tamaño completo, usar thumbnail con tamaño grande
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
}

// ============ RENDERIZADO ============
function renderFolders(folders) {
    const gallerySection = document.getElementById('gallery');
    const isVertical = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
    // Mostrar botón si hay 4 o más carpetas
    const hasMoreFolders = isVertical && folders.length >= galleryState.minFoldersForShowMore;
    
    gallerySection.innerHTML = `
        <div class="gallery-header">
            <img src="images/effects/effect_04.webp" alt="Effect 4" class="effect-4">
            <h2 class="gallery-title" data-i18n="nav-gallery">Galeria</h2>
        </div>
        <div class="folders-carousel">
            ${folders.length > 0 ? folders.map((folder, index) => createFolderCard(folder, index, isVertical, folders.length)).join('') : '<p class="gallery-error-text" data-i18n="gallery-no-albums">No hi ha àlbums disponibles</p>'}
        </div>
        ${hasMoreFolders ? `
        <div class="show-more-container" id="show-more-container">
            <button class="show-more-btn" id="show-more-btn" data-i18n="gallery-show-more">Mostrar més</button>
        </div>
        ` : ''}
        ${createAlbumPanelHTML()}
        ${createPhotoViewerHTML()}
    `;
    
    // Aplicar traducciones si existe la función
    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }
    
    // Añadir event listeners
    attachFolderListeners();
    
    // Listener para cambios de orientación/tamaño
    window.addEventListener('resize', handleResize);
}

function handleResize() {
    // Re-renderizar si cambia el aspect ratio
    const isVertical = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
    const folderCards = document.querySelectorAll('.folder-card');
    const showMoreContainer = document.getElementById('show-more-container');
    const totalFolders = galleryState.folders.length;
    
    if (isVertical && !galleryState.showAllFolders) {
        // Aplicar lógica de ocultar carpetas extra y fade en la 4ª
        folderCards.forEach((card, index) => {
            if (index >= galleryState.maxVisibleFolders) {
                // Carpetas 5+ ocultas
                card.classList.add('hidden-folder');
                card.classList.remove('show-all', 'fade-folder');
            } else if (index === 3 && totalFolders >= galleryState.minFoldersForShowMore) {
                // 4ª carpeta (index 3) con fade si hay 4 o más carpetas
                card.classList.add('fade-folder');
                card.classList.remove('hidden-folder');
            } else {
                card.classList.remove('hidden-folder', 'fade-folder');
            }
        });
        
        // Mostrar contenedor del botón si hay 4 o más carpetas
        if (showMoreContainer && totalFolders >= galleryState.minFoldersForShowMore) {
            showMoreContainer.classList.remove('hidden');
        }
    } else {
        // En horizontal o si ya se mostró todo, mostrar todas las carpetas
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
    // Usar el logo de la carpeta si existe
    const hasLogo = folder.logo && folder.logo.thumbnail;
    const logoStyle = hasLogo 
        ? `background-image: url('${folder.logo.thumbnail}'); background-size: contain; background-position: center; background-repeat: no-repeat;`
        : '';
    
    // Determinar las clases según la posición
    let extraClasses = '';
    const shouldShowMore = totalFolders >= galleryState.minFoldersForShowMore;
    
    if (isVertical && !galleryState.showAllFolders && shouldShowMore) {
        if (index >= galleryState.maxVisibleFolders) {
            // Carpetas 5+ ocultas
            extraClasses = 'hidden-folder';
        } else if (index === 3) {
            // 4ª carpeta (index 3) con efecto fade
            extraClasses = 'fade-folder';
        }
    }
    
    return `
        <div class="folder-card ${extraClasses}" data-folder-id="${folder.id}" data-folder-name="${folder.name}">
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
                    <div class="photo-grid" id="photo-grid">
                        <!-- Photos will be loaded here -->
                    </div>
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
                    <div class="photo-viewer-actions">
                    </div>
                </div>
                <div class="photo-viewer-content">
                    <button class="photo-nav-btn photo-nav-prev" id="photo-prev-btn" aria-label="Foto anterior">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18l-6-6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <div class="photo-carousel" id="photo-carousel">
                        <div class="photo-carousel-track" id="photo-carousel-track">
                            <!-- Images will be loaded here dynamically -->
                        </div>
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
    const folderCards = document.querySelectorAll('.folder-card');
    folderCards.forEach(card => {
        card.addEventListener('click', () => openAlbum(card.dataset.folderId, card.dataset.folderName));
    });
    
    // Show more button
    const showMoreBtn = document.getElementById('show-more-btn');
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', showAllFolders);
    }
    
    // Album panel close
    const albumCloseBtn = document.getElementById('album-close-btn');
    const albumOverlay = document.getElementById('album-panel-overlay');
    const albumBackdrop = document.getElementById('album-backdrop');
    
    if (albumCloseBtn) {
        albumCloseBtn.addEventListener('click', closeAlbum);
    }
    
    if (albumBackdrop) {
        albumBackdrop.addEventListener('click', (e) => {
            if (e.target === albumBackdrop) closeAlbum();
        });
    }
    
    // Photo viewer controls
    const viewerCloseBtn = document.getElementById('viewer-close-btn');
    const viewerOverlay = document.getElementById('photo-viewer-overlay');
    const prevBtn = document.getElementById('photo-prev-btn');
    const nextBtn = document.getElementById('photo-next-btn');
    const downloadBtn = document.getElementById('viewer-download-btn');
    
    if (viewerCloseBtn) {
        viewerCloseBtn.addEventListener('click', closePhotoViewer);
    }
    
    if (viewerOverlay) {
        viewerOverlay.addEventListener('click', (e) => {
            if (e.target === viewerOverlay || e.target.classList.contains('photo-viewer-content')) {
                closePhotoViewer();
            }
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPreviousPhoto();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showNextPhoto();
        });
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            downloadCurrentPhoto();
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Touch/swipe navigation para el visor de fotos
    attachSwipeListeners();
}

function handleKeyboardNavigation(e) {
    const viewerOverlay = document.getElementById('photo-viewer-overlay');
    const albumOverlay = document.getElementById('album-panel-overlay');
    
    if (viewerOverlay && viewerOverlay.classList.contains('active')) {
        switch(e.key) {
            case 'ArrowLeft':
                showPreviousPhoto();
                break;
            case 'ArrowRight':
                showNextPhoto();
                break;
            case 'Escape':
                closePhotoViewer();
                break;
        }
    } else if (albumOverlay && albumOverlay.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeAlbum();
        }
    }
}

// ============ ALBUM FUNCTIONS ============
async function openAlbum(folderId, folderName) {
    galleryState.currentAlbum = { id: folderId, name: folderName };
    
    const albumOverlay = document.getElementById('album-panel-overlay');
    const albumTitle = document.getElementById('album-title');
    const albumLogo = document.getElementById('album-logo');
    const photoGrid = document.getElementById('photo-grid');
    
    // Find the folder data to get the logo
    const folder = galleryState.folders.find(f => f.id === folderId);
    const hasLogo = folder && folder.logo && folder.logo.thumbnail;
    
    if (hasLogo) {
        albumLogo.innerHTML = `<img src="${folder.logo.thumbnail}" alt="${folderName}" />`;
        albumLogo.classList.add('has-logo');
        albumTitle.style.display = 'none';
    } else {
        albumLogo.innerHTML = '';
        albumLogo.classList.remove('has-logo');
        albumTitle.style.display = '';
        albumTitle.textContent = folderName;
    }
    photoGrid.innerHTML = `
        <div class="gallery-loading" style="grid-column: 1 / -1;">
            <div class="loading-spinner"></div>
            <p class="loading-text" data-i18n="gallery-loading-photos">Carregant fotos...</p>
        </div>
    `;
    
    albumOverlay.classList.add('active');
    const albumBackdrop = document.getElementById('album-backdrop');
    if (albumBackdrop) albumBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    try {
        const photos = await fetchPhotosFromFolder(folderId);
        galleryState.currentPhotos = photos;
        renderPhotos(photos);
    } catch (error) {
        console.error('Error loading photos:', error);
        photoGrid.innerHTML = `<p class="gallery-error-text" style="grid-column: 1 / -1;">Error al cargar las fotos</p>`;
    }
}

function closeAlbum() {
    const albumOverlay = document.getElementById('album-panel-overlay');
    albumOverlay.classList.remove('active');
    const albumBackdrop = document.getElementById('album-backdrop');
    if (albumBackdrop) albumBackdrop.classList.remove('active');
    document.body.style.overflow = '';
    galleryState.currentAlbum = null;
    galleryState.currentPhotos = [];
}

function renderPhotos(photos) {
    const photoGrid = document.getElementById('photo-grid');
    
    if (photos.length === 0) {
        photoGrid.innerHTML = `<p class="gallery-error-text" style="grid-column: 1 / -1;" data-i18n="gallery-no-photos">No hi ha fotos en aquest àlbum</p>`;
        return;
    }
    
    photoGrid.innerHTML = photos.map((photo, index) => `
        <div class="photo-item" data-photo-index="${index}">
            <img src="${photo.thumbnail}" alt="${photo.name}" loading="lazy">
            <div class="photo-item-overlay">
                <p class="photo-item-name">${photo.name}</p>
            </div>
        </div>
    `).join('');
    
    // Attach click listeners to photos
    const photoItems = photoGrid.querySelectorAll('.photo-item');
    photoItems.forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.photoIndex);
            openPhotoViewer(index);
        });
    });
}

// ============ PHOTO VIEWER FUNCTIONS ============
function openPhotoViewer(index) {
    galleryState.currentPhotoIndex = index;
    
    const viewerOverlay = document.getElementById('photo-viewer-overlay');
    const viewerTitle = document.getElementById('viewer-title');
    
    // Inicializar el carrusel
    initCarousel();
    
    // Actualizar título
    const photo = galleryState.currentPhotos[index];
    viewerTitle.textContent = photo.name;
    
    viewerOverlay.classList.add('active');
    
    updateNavigationButtons();
}

function initCarousel() {
    const track = document.getElementById('photo-carousel-track');
    const photos = galleryState.currentPhotos;
    
    // Crear todos los slides
    track.innerHTML = photos.map((photo, index) => `
        <div class="carousel-slide" data-index="${index}">
            <img 
                class="carousel-image" 
                data-src="${photo.fullSize}" 
                alt="${photo.name}"
                draggable="false"
            >
            <div class="carousel-loader">
                <div class="loading-spinner"></div>
            </div>
        </div>
    `).join('');
    
    // Posicionar en la foto actual
    updateCarouselPosition(false);
    
    // Cargar imágenes cercanas (lazy loading)
    loadNearbyImages();
}

function updateCarouselPosition(animate = true) {
    const track = document.getElementById('photo-carousel-track');
    const offset = -galleryState.currentPhotoIndex * 100;
    
    if (animate) {
        track.style.transition = 'transform 0.3s ease-out';
    } else {
        track.style.transition = 'none';
    }
    
    track.style.transform = `translateX(${offset}%)`;
    
    // Actualizar título
    const viewerTitle = document.getElementById('viewer-title');
    const photo = galleryState.currentPhotos[galleryState.currentPhotoIndex];
    if (photo && viewerTitle) {
        viewerTitle.textContent = photo.name;
    }
}

function loadNearbyImages() {
    const currentIndex = galleryState.currentPhotoIndex;
    const photos = galleryState.currentPhotos;
    
    // Cargar imagen actual y las 2 adyacentes (anterior y siguiente)
    const indicesToLoad = [
        currentIndex - 1,
        currentIndex,
        currentIndex + 1
    ].filter(i => i >= 0 && i < photos.length);
    
    indicesToLoad.forEach(index => {
        const slide = document.querySelector(`.carousel-slide[data-index="${index}"]`);
        if (!slide) return;
        
        const img = slide.querySelector('.carousel-image');
        const loader = slide.querySelector('.carousel-loader');
        
        // Si ya tiene src, ya está cargada
        if (img.src) return;
        
        const src = img.dataset.src;
        if (!src) return;
        
        // Usar <img> normal para mostrar (no tiene restricción CORS)
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = src;
            img.classList.add('loaded');
            if (loader) loader.style.display = 'none';
        };
        tempImg.onerror = () => {
            if (loader) loader.innerHTML = '<span style="color: var(--primary-color);">Error</span>';
        };
        tempImg.src = src;
    });
}

function closePhotoViewer() {
    const viewerOverlay = document.getElementById('photo-viewer-overlay');
    viewerOverlay.classList.remove('active');
    
    // Limpiar el carrusel
    const track = document.getElementById('photo-carousel-track');
    if (track) {
        track.innerHTML = '';
        track.style.transform = '';
    }
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

function updatePhotoViewer() {
    updateCarouselPosition(true);
    loadNearbyImages();
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('photo-prev-btn');
    const nextBtn = document.getElementById('photo-next-btn');
    
    prevBtn.style.opacity = galleryState.currentPhotoIndex === 0 ? '0.3' : '1';
    prevBtn.style.pointerEvents = galleryState.currentPhotoIndex === 0 ? 'none' : 'auto';
    
    nextBtn.style.opacity = galleryState.currentPhotoIndex === galleryState.currentPhotos.length - 1 ? '0.3' : '1';
    nextBtn.style.pointerEvents = galleryState.currentPhotoIndex === galleryState.currentPhotos.length - 1 ? 'none' : 'auto';
}

async function downloadCurrentPhoto() {
    const photo = galleryState.currentPhotos[galleryState.currentPhotoIndex];
    const downloadBtn = document.getElementById('viewer-download-btn');
    const span = downloadBtn.querySelector('span');
    
    // Usar el sistema de traducción para los textos del botón
    const downloadingText = (translations && translations[currentLanguage] && translations[currentLanguage]['gallery-downloading']) || 'Descarregant...';
    const downloadText = (translations && translations[currentLanguage] && translations[currentLanguage]['gallery-download']) || 'Descarregar';
    
    span.textContent = downloadingText;
    downloadBtn.disabled = true;
    
    try {
        // Usar la API REST de Google Drive con la API key (soporta CORS)
        const apiUrl = `https://www.googleapis.com/drive/v3/files/${photo.id}?alt=media&key=${GALLERY_CONFIG.API_KEY}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = photo.name || `foto_${photo.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Error descargando la imagen:', error);
        // Fallback: descargar vía Google Drive export
        window.open(`https://drive.google.com/uc?export=download&id=${photo.id}`, '_blank');
    } finally {
        span.textContent = downloadText;
        downloadBtn.disabled = false;
    }
}

// ============ SHOW MORE FUNCTIONALITY ============
function showAllFolders() {
    galleryState.showAllFolders = true;
    
    // Mostrar todas las carpetas ocultas y quitar el fade
    const allFolders = document.querySelectorAll('.folder-card');
    allFolders.forEach(card => {
        card.classList.remove('hidden-folder', 'fade-folder');
        card.classList.add('show-all');
    });
    
    // Ocultar el contenedor del botón "mostrar más"
    const showMoreContainer = document.getElementById('show-more-container');
    if (showMoreContainer) {
        showMoreContainer.classList.add('hidden');
    }
}

// ============ SWIPE/TOUCH NAVIGATION ============
function attachSwipeListeners() {
    const carousel = document.getElementById('photo-carousel');
    
    if (!carousel) return;
    
    // Touch events
    carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
    carousel.addEventListener('touchmove', handleTouchMove, { passive: false });
    carousel.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Mouse events para desktop (drag)
    carousel.addEventListener('mousedown', handleMouseDown);
    carousel.addEventListener('mousemove', handleMouseMove);
    carousel.addEventListener('mouseup', handleMouseUp);
    carousel.addEventListener('mouseleave', handleMouseUp);
}

function handleTouchStart(e) {
    const viewerOverlay = document.getElementById('photo-viewer-overlay');
    if (!viewerOverlay || !viewerOverlay.classList.contains('active')) return;
    
    galleryState.touchStartX = e.touches[0].clientX;
    galleryState.touchStartY = e.touches[0].clientY;
    galleryState.touchEndX = e.touches[0].clientX;
    galleryState.isSwiping = true;
    
    // Desactivar transición durante el drag
    const track = document.getElementById('photo-carousel-track');
    if (track) {
        track.style.transition = 'none';
    }
}

function handleTouchMove(e) {
    if (!galleryState.isSwiping) return;
    
    const viewerOverlay = document.getElementById('photo-viewer-overlay');
    if (!viewerOverlay || !viewerOverlay.classList.contains('active')) return;
    
    galleryState.touchEndX = e.touches[0].clientX;
    galleryState.touchEndY = e.touches[0].clientY;
    
    const diffX = galleryState.touchStartX - galleryState.touchEndX;
    const diffY = Math.abs(galleryState.touchStartY - galleryState.touchEndY);
    
    // Si el movimiento es más horizontal que vertical, prevenir scroll y mover carrusel
    if (Math.abs(diffX) > diffY) {
        e.preventDefault();
        
        const track = document.getElementById('photo-carousel-track');
        const carousel = document.getElementById('photo-carousel');
        if (track && carousel) {
            const carouselWidth = carousel.offsetWidth;
            const baseOffset = -galleryState.currentPhotoIndex * 100;
            const dragOffset = (-diffX / carouselWidth) * 100;
            
            // Limitar el drag en los extremos
            let newOffset = baseOffset + dragOffset;
            const maxOffset = 0;
            const minOffset = -(galleryState.currentPhotos.length - 1) * 100;
            
            // Añadir resistencia en los extremos
            if (newOffset > maxOffset) {
                newOffset = maxOffset + (newOffset - maxOffset) * 0.3;
            } else if (newOffset < minOffset) {
                newOffset = minOffset + (newOffset - minOffset) * 0.3;
            }
            
            track.style.transform = `translateX(${newOffset}%)`;
        }
    }
}

function handleTouchEnd(e) {
    if (!galleryState.isSwiping) return;
    
    const viewerOverlay = document.getElementById('photo-viewer-overlay');
    if (!viewerOverlay || !viewerOverlay.classList.contains('active')) {
        galleryState.isSwiping = false;
        return;
    }
    
    const diffX = galleryState.touchStartX - galleryState.touchEndX;
    const diffY = Math.abs(galleryState.touchStartY - galleryState.touchEndY);
    
    // Determinar si cambiar de foto basándose en el umbral
    if (Math.abs(diffX) > diffY && Math.abs(diffX) > galleryState.swipeThreshold) {
        if (diffX > 0 && galleryState.currentPhotoIndex < galleryState.currentPhotos.length - 1) {
            // Swipe izquierda -> siguiente foto
            galleryState.currentPhotoIndex++;
        } else if (diffX < 0 && galleryState.currentPhotoIndex > 0) {
            // Swipe derecha -> foto anterior
            galleryState.currentPhotoIndex--;
        }
    }
    
    // Animar a la posición final
    updateCarouselPosition(true);
    loadNearbyImages();
    updateNavigationButtons();
    
    galleryState.isSwiping = false;
    galleryState.touchStartX = 0;
    galleryState.touchStartY = 0;
    galleryState.touchEndX = 0;
    galleryState.touchEndY = 0;
}

// Mouse events para desktop
function handleMouseDown(e) {
    const viewerOverlay = document.getElementById('photo-viewer-overlay');
    if (!viewerOverlay || !viewerOverlay.classList.contains('active')) return;
    
    // No iniciar drag si se hace clic en los botones de navegación
    if (e.target.closest('.photo-nav-btn') || e.target.closest('.download-btn')) return;
    
    e.preventDefault();
    
    galleryState.touchStartX = e.clientX;
    galleryState.touchStartY = e.clientY;
    galleryState.touchEndX = e.clientX;
    galleryState.isSwiping = true;
    
    // Desactivar transición durante el drag
    const track = document.getElementById('photo-carousel-track');
    if (track) {
        track.style.transition = 'none';
    }
    
    // Cambiar cursor
    e.currentTarget.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
    if (!galleryState.isSwiping) return;
    
    const viewerOverlay = document.getElementById('photo-viewer-overlay');
    if (!viewerOverlay || !viewerOverlay.classList.contains('active')) return;
    
    galleryState.touchEndX = e.clientX;
    galleryState.touchEndY = e.clientY;
    
    const diffX = galleryState.touchStartX - galleryState.touchEndX;
    
    const track = document.getElementById('photo-carousel-track');
    const carousel = document.getElementById('photo-carousel');
    if (track && carousel) {
        const carouselWidth = carousel.offsetWidth;
        const baseOffset = -galleryState.currentPhotoIndex * 100;
        const dragOffset = (-diffX / carouselWidth) * 100;
        
        // Limitar el drag en los extremos
        let newOffset = baseOffset + dragOffset;
        const maxOffset = 0;
        const minOffset = -(galleryState.currentPhotos.length - 1) * 100;
        
        // Añadir resistencia en los extremos
        if (newOffset > maxOffset) {
            newOffset = maxOffset + (newOffset - maxOffset) * 0.3;
        } else if (newOffset < minOffset) {
            newOffset = minOffset + (newOffset - minOffset) * 0.3;
        }
        
        track.style.transform = `translateX(${newOffset}%)`;
    }
}

function handleMouseUp(e) {
    if (!galleryState.isSwiping) return;
    
    const carousel = e.currentTarget;
    if (carousel) {
        carousel.style.cursor = '';
    }
    
    const viewerOverlay = document.getElementById('photo-viewer-overlay');
    if (!viewerOverlay || !viewerOverlay.classList.contains('active')) {
        galleryState.isSwiping = false;
        return;
    }
    
    const diffX = galleryState.touchStartX - galleryState.touchEndX;
    
    // Determinar si cambiar de foto
    if (Math.abs(diffX) > galleryState.swipeThreshold) {
        if (diffX > 0 && galleryState.currentPhotoIndex < galleryState.currentPhotos.length - 1) {
            galleryState.currentPhotoIndex++;
        } else if (diffX < 0 && galleryState.currentPhotoIndex > 0) {
            galleryState.currentPhotoIndex--;
        }
    }
    
    // Animar a la posición final
    updateCarouselPosition(true);
    loadNearbyImages();
    updateNavigationButtons();
    
    galleryState.isSwiping = false;
    galleryState.touchStartX = 0;
    galleryState.touchStartY = 0;
    galleryState.touchEndX = 0;
    galleryState.touchEndY = 0;
}
