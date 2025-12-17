document.addEventListener('DOMContentLoaded', () => {
    const opinionsSection = document.querySelector('.opinions-part');
    const statsSection = document.querySelector('.stats-section');

    if (!opinionsSection || !statsSection) {
        console.error('Sections not found!');
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
    
    // Establecer variable CSS con el número de cards para calcular altura en móvil
    document.documentElement.style.setProperty('--opinion-cards-count', opinionCards.length);
    
    let currentIndex = 0;
    let isScrolling = false;

    // Función para actualizar las cards visibles
    function updateCards(index) {
        // Remover todas las clases
        opinionCards.forEach(card => {
            card.classList.remove('active', 'prev', 'next');
        });
        
        // Activar la nueva (centro)
        opinionCards[index].classList.add('active');
        
        // Mostrar la anterior (arriba)
        if (index > 0) {
            opinionCards[index - 1].classList.add('prev');
        }
        
        // Mostrar la siguiente (abajo)
        if (index < opinionCards.length - 1) {
            opinionCards[index + 1].classList.add('next');
        }
        
        currentIndex = index;
    }

    // Función para actualizar la opinión visible
    function updateVisibleOpinion() {
        const scrollProgress = window.scrollY;
        const sectionTop = statsSection.offsetTop;
        const sectionHeight = statsSection.offsetHeight;
        const viewportHeight = window.innerHeight;
        
        // Calcular basado en stats-section
        const scrollInSection = scrollProgress - sectionTop;
        const totalScrollable = sectionHeight - viewportHeight;
        const scrollPercentage = Math.max(0, Math.min(1, scrollInSection / totalScrollable));
        
        // Si estamos dentro de la sección
        if (scrollProgress >= sectionTop && scrollProgress <= sectionTop + sectionHeight - viewportHeight) {
            const newIndex = Math.min(
                Math.floor(scrollPercentage * opinionCards.length),
                opinionCards.length - 1
            );
            
            if (newIndex !== currentIndex && newIndex >= 0) {
                updateCards(newIndex);
            }
        }
    }
    
    // Mostrar las primeras tres opiniones al inicio
    updateCards(0);
    
    // Escuchar el scroll
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                updateVisibleOpinion();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
    
    // Actualizar al cargar
    updateVisibleOpinion();
});
