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
    minFoldersForShowMore: 4 // Mostrar botón "mostrar más" si hay 4 o más carpetas
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
    
    // Para cada carpeta, obtener el logo, conteo de fotos y una imagen de preview
    const foldersWithDetails = await Promise.all(
        data.files.map(async (folder) => {
            const logo = await fetchFolderLogo(folder.id);
            const photos = await fetchPhotosFromFolder(folder.id, 1);
            const photoCount = await getPhotoCount(folder.id);
            return {
                ...folder,
                photoCount,
                logo: logo,
                previewImage: photos[0] || null
            };
        })
    );
    
    // Ordenar por fecha de creación (más reciente primero)
    foldersWithDetails.sort((a, b) => {
        return new Date(b.createdTime) - new Date(a.createdTime);
    });
    
    return foldersWithDetails;
}

async function fetchFolderLogo(folderId) {
    // Buscar específicamente el archivo logo.png en la carpeta
    const query = `'${folderId}' in parents and name='logo.png' and trashed=false`;
    const fields = 'files(id,name)';
    
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&key=${GALLERY_CONFIG.API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.files && data.files.length > 0) {
        return {
            id: data.files[0].id,
            thumbnail: getDirectImageUrl(data.files[0].id, 'thumbnail'),
            fullSize: getDirectImageUrl(data.files[0].id, 'full')
        };
    }
    
    return null;
}

async function getPhotoCount(folderId) {
    const mimeQuery = GALLERY_CONFIG.ALLOWED_MIME_TYPES.map(t => `mimeType='${t}'`).join(' or ');
    // Excluir logo.png del conteo
    const query = `'${folderId}' in parents and (${mimeQuery}) and name!='logo.png' and trashed=false`;
    
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)&key=${GALLERY_CONFIG.API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) return 0;
    
    const data = await response.json();
    return data.files.length;
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
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

// ============ RENDERIZADO ============
function renderFolders(folders) {
    const gallerySection = document.getElementById('gallery');
    const isVertical = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
    // Mostrar botón si hay 4 o más carpetas
    const hasMoreFolders = isVertical && folders.length >= galleryState.minFoldersForShowMore;
    
    gallerySection.innerHTML = `
        <div class="gallery-header">
            <h1 class="gallery-title" data-i18n="nav-gallery">Galeria</h1>
            <p class="gallery-subtitle" data-i18n="gallery-subtitle">Explora els nostres àlbums de fotos</p>
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
        <div class="album-panel-overlay" id="album-panel-overlay">
            <div class="album-panel">
                <div class="album-header">
                    <h2 class="album-title" id="album-title"></h2>
                    <button class="album-close-btn" id="album-close-btn" aria-label="Cerrar álbum">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
                <div class="photo-grid" id="photo-grid">
                    <!-- Photos will be loaded here -->
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
                    <button class="viewer-btn viewer-close-btn" id="viewer-close-btn" aria-label="Cerrar visor">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
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
                    <img src="" alt="" class="photo-viewer-image" id="viewer-image">
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
    
    if (albumCloseBtn) {
        albumCloseBtn.addEventListener('click', closeAlbum);
    }
    
    if (albumOverlay) {
        albumOverlay.addEventListener('click', (e) => {
            if (e.target === albumOverlay) closeAlbum();
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
    const photoGrid = document.getElementById('photo-grid');
    
    albumTitle.textContent = folderName;
    photoGrid.innerHTML = `
        <div class="gallery-loading" style="grid-column: 1 / -1;">
            <div class="loading-spinner"></div>
            <p class="loading-text" data-i18n="gallery-loading-photos">Carregant fotos...</p>
        </div>
    `;
    
    albumOverlay.classList.add('active');
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
    const photo = galleryState.currentPhotos[index];
    
    const viewerOverlay = document.getElementById('photo-viewer-overlay');
    const viewerImage = document.getElementById('viewer-image');
    const viewerTitle = document.getElementById('viewer-title');
    
    viewerImage.src = photo.fullSize;
    viewerImage.alt = photo.name;
    viewerTitle.textContent = photo.name;
    
    viewerOverlay.classList.add('active');
    
    updateNavigationButtons();
}

function closePhotoViewer() {
    const viewerOverlay = document.getElementById('photo-viewer-overlay');
    viewerOverlay.classList.remove('active');
}

function showPreviousPhoto() {
    if (galleryState.currentPhotoIndex > 0) {
        galleryState.currentPhotoIndex--;
        updatePhotoViewer();
    }
}

function showNextPhoto() {
    if (galleryState.currentPhotoIndex < galleryState.currentPhotos.length - 1) {
        galleryState.currentPhotoIndex++;
        updatePhotoViewer();
    }
}

function updatePhotoViewer() {
    const photo = galleryState.currentPhotos[galleryState.currentPhotoIndex];
    const viewerImage = document.getElementById('viewer-image');
    const viewerTitle = document.getElementById('viewer-title');
    
    viewerImage.src = photo.fullSize;
    viewerImage.alt = photo.name;
    viewerTitle.textContent = photo.name;
    
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

function downloadCurrentPhoto() {
    const photo = galleryState.currentPhotos[galleryState.currentPhotoIndex];
    
    // Crear un enlace temporal para descargar
    const link = document.createElement('a');
    link.href = photo.downloadUrl;
    link.download = photo.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
