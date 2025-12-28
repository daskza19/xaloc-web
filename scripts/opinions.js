document.addEventListener('DOMContentLoaded', () => {
    const opinionsSection = document.querySelector('.opinions-part');

    if (!opinionsSection) {
        console.error('Opinions section not found!');
        return;
    }

    console.log('Opinions section found');
    
    // Crear contenedor para el carousel
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'opinion-carousel-container';
    
    // Obtener todas las opinion-cards
    const opinionCards = Array.from(opinionsSection.querySelectorAll('.opinion-card'));
    console.log('Opinion cards found:', opinionCards.length);
    
    if (opinionCards.length === 0) {
        console.error('No opinion cards found!');
        return;
    }
    
    // Mover todas las cards al contenedor
    opinionCards.forEach(card => {
        carouselContainer.appendChild(card);
    });
    
    // Limpiar opinions-part y agregar el contenedor
    opinionsSection.innerHTML = '';
    opinionsSection.appendChild(carouselContainer);
    
    let currentIndex = 0;
    let autoPlayInterval;

    // Función para actualizar las cards visibles
    function updateCards(index) {
        // Remover todas las clases
        opinionCards.forEach(card => {
            card.classList.remove('active', 'prev', 'next');
        });
        
        // Calcular índices (con loop circular)
        const prevIndex = (index - 1 + opinionCards.length) % opinionCards.length;
        const nextIndex = (index + 1) % opinionCards.length;
        
        // Activar las cards correspondientes
        opinionCards[index].classList.add('active');
        opinionCards[prevIndex].classList.add('prev');
        opinionCards[nextIndex].classList.add('next');
        
        currentIndex = index;
    }

    // Función para avanzar automáticamente
    function autoAdvance() {
        const nextIndex = (currentIndex + 1) % opinionCards.length;
        updateCards(nextIndex);
    }

    // Función para ir a la siguiente opinión
    function goToNext() {
        const nextIndex = (currentIndex + 1) % opinionCards.length;
        updateCards(nextIndex);
    }

    // Función para ir a la opinión anterior
    function goToPrev() {
        const prevIndex = (currentIndex - 1 + opinionCards.length) % opinionCards.length;
        updateCards(prevIndex);
    }

    // Función para reiniciar el autoplay
    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(autoAdvance, 4000);
    }

    // Variables para drag & drop
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    // Función para verificar si el punto está dentro del área de la card activa + margen
    function isWithinActiveCardArea(x, y) {
        const activeCard = opinionCards[currentIndex];
        if (!activeCard) return false;

        const rect = activeCard.getBoundingClientRect();
        const margin = -window.innerHeight * 0.05; // Margen negativo (área más pequeña que la card)

        return (
            x >= rect.left - margin &&
            x <= rect.right + margin &&
            y >= rect.top - margin &&
            y <= rect.bottom + margin
        );
    }

    // Función para aplicar transformación durante drag
    function applyDragTransform() {
        const activeCard = opinionCards[currentIndex];
        if (!activeCard || !isDragging) return;

        activeCard.style.transform = `scale(1) translateY(0) translateX(${dragOffsetX}px) translateY(${dragOffsetY}px)`;
        activeCard.style.transition = 'none';
    }

    // Función para resetear transformación
    function resetDragTransform() {
        const activeCard = opinionCards[currentIndex];
        if (!activeCard) return;

        activeCard.style.transform = '';
        activeCard.style.transition = '';
    }

    // Eventos de mouse
    carouselContainer.addEventListener('mousedown', (e) => {
        // Verificar si el clic está dentro del área permitida
        if (!isWithinActiveCardArea(e.clientX, e.clientY)) {
            return;
        }

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        currentX = startX;
        currentY = startY;
        carouselContainer.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentX = e.clientX;
        currentY = e.clientY;
        dragOffsetX = currentX - startX;
        dragOffsetY = currentY - startY;
        applyDragTransform();
    });

    document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        const threshold = 50;
        
        resetDragTransform();
        
        // Si el movimiento horizontal es mayor que el vertical
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > threshold) {
                // Swipe derecha -> anterior
                goToPrev();
                resetAutoPlay();
            } else if (deltaX < -threshold) {
                // Swipe izquierda -> siguiente
                goToNext();
                resetAutoPlay();
            }
        } else {
            // Movimiento vertical
            if (deltaY > threshold) {
                // Swipe abajo -> anterior
                goToPrev();
                resetAutoPlay();
            } else if (deltaY < -threshold) {
                // Swipe arriba -> siguiente
                goToNext();
                resetAutoPlay();
            }
        }
        
        isDragging = false;
        dragOffsetX = 0;
        dragOffsetY = 0;
        carouselContainer.style.cursor = 'grab';
    });

    // Eventos táctiles (touch) - prevenir scroll en mobile
    carouselContainer.addEventListener('touchstart', (e) => {
        // Verificar si el toque está dentro del área permitida
        if (!isWithinActiveCardArea(e.touches[0].clientX, e.touches[0].clientY)) {
            return;
        }

        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        currentX = startX;
        currentY = startY;
        // No hacer preventDefault aquí para permitir detección inicial
    }, { passive: true });

    carouselContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
        dragOffsetX = currentX - startX;
        dragOffsetY = currentY - startY;
        
        // Prevenir scroll solo si hay movimiento significativo
        if (Math.abs(dragOffsetX) > 10 || Math.abs(dragOffsetY) > 10) {
            e.preventDefault();
            applyDragTransform();
        }
    }, { passive: false });

    carouselContainer.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        const threshold = 50;
        
        resetDragTransform();
        
        // Si el movimiento horizontal es mayor que el vertical
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > threshold) {
                // Swipe derecha -> anterior
                goToPrev();
                resetAutoPlay();
            } else if (deltaX < -threshold) {
                // Swipe izquierda -> siguiente
                goToNext();
                resetAutoPlay();
            }
        } else {
            // Movimiento vertical
            if (deltaY > threshold) {
                // Swipe abajo -> anterior
                goToPrev();
                resetAutoPlay();
            } else if (deltaY < -threshold) {
                // Swipe arriba -> siguiente
                goToNext();
                resetAutoPlay();
            }
        }
        
        isDragging = false;
        dragOffsetX = 0;
        dragOffsetY = 0;
    });

    // Mostrar la primera opinión al inicio
    updateCards(0);
    
    // Configurar intervalo automático (cambia cada 4 segundos)
    autoPlayInterval = setInterval(autoAdvance, 4000);
    
    // Estilo de cursor
    carouselContainer.style.cursor = 'grab';
    
    console.log('Auto-carousel with drag & drop initialized with', opinionCards.length, 'cards');
});


