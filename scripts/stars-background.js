// Efecto de estrellas en el fondo
(function() {
  // Configuración
  const config = {
    numStars: 50, // Número de estrellas
    minSize: 2, // Tamaño mínimo de estrella (px)
    maxSize: 14, // Tamaño máximo de estrella (px)
    minDuration: 2, // Duración mínima de animación (s)
    maxDuration: 5, // Duración máxima de animación (s)
    minOpacity: 0.1, // Opacidad mínima
    maxOpacity: 0.4, // Opacidad máxima
    starImages: [
      'images/effects/star.webp',
    ]
  };

  function createStarsContainer() {
    const container = document.createElement('div');
    container.className = 'stars-container';
    document.body.insertBefore(container, document.body.firstChild);
    return container;
  }

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createStar(container) {
    const star = document.createElement('div');
    star.className = 'star';
    
    // Imagen aleatoria
    const randomImage = config.starImages[Math.floor(Math.random() * config.starImages.length)];
    star.style.backgroundImage = `url('${randomImage}')`;
    
    // Posición aleatoria
    star.style.left = `${randomInRange(0, 100)}%`;
    star.style.top = `${randomInRange(0, 100)}%`;
    
    // Tamaño aleatorio
    const size = randomInRange(config.minSize, config.maxSize);
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    
    // Duración aleatoria
    const duration = randomInRange(config.minDuration, config.maxDuration);
    star.style.setProperty('--duration', `${duration}s`);
    
    // Delay aleatorio para que no todas empiecen al mismo tiempo
    const delay = randomInRange(0, duration);
    star.style.setProperty('--delay', `${delay}s`);
    
    // Opacidad máxima aleatoria
    const maxOpacity = randomInRange(config.minOpacity, config.maxOpacity);
    star.style.setProperty('--max-opacity', maxOpacity);
    
    container.appendChild(star);
  }

  function initStarsBackground() {
    const container = createStarsContainer();
    
    // Crear todas las estrellas
    for (let i = 0; i < config.numStars; i++) {
      createStar(container);
    }
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStarsBackground);
  } else {
    initStarsBackground();
  }
})();
