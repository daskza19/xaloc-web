// Efecto de estrellas en la palabra "brillen" - similar al fondo
(function() {
  function initSparkleEffect() {
    const sparkleWord = document.querySelector('.sparkle-word');
    if (!sparkleWord) {
      console.log('Sparkle word not found, retrying...');
      // Reintentar después de un momento
      setTimeout(initSparkleEffect, 100);
      return;
    }

    // Limpiar contenedor previo si existe
    const existingContainer = sparkleWord.querySelector('.sparkle-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // Crear contenedor para las estrellas
    const sparkleContainer = document.createElement('div');
    sparkleContainer.className = 'sparkle-container';
    sparkleContainer.style.position = 'absolute';
    sparkleContainer.style.zIndex = '1000';
    sparkleWord.style.position = 'relative';
    sparkleWord.appendChild(sparkleContainer);

    // Configuración
    const config = {
      numStars: 5, // Número de estrellas activas (reducido)
      minSize: 12,
      maxSize: 25,
      minDuration: 2,
      maxDuration: 4,
      minOpacity: 0.4,
      maxOpacity: 0.9,
      starImages: [
        'images/effects/star.webp'
      ]
    };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    function createStar() {
      const star = document.createElement('div');
      star.className = 'sparkle-star';
      
      // Imagen aleatoria
      const randomImage = config.starImages[Math.floor(Math.random() * config.starImages.length)];
      star.style.backgroundImage = `url('${randomImage}')`;
      star.style.backgroundSize = 'contain';
      star.style.backgroundRepeat = 'no-repeat';
      star.style.backgroundPosition = 'center';
      star.style.position = 'absolute';
      star.style.zIndex = '1001';
      
      // Posición aleatoria dentro del área de la palabra
      star.style.left = `${randomInRange(-5, 80)}%`;
      star.style.top = `${randomInRange(-20, 80)}%`;
      
      // Tamaño aleatorio
      const size = randomInRange(config.minSize, config.maxSize);
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      
      // Duración aleatoria
      const duration = randomInRange(config.minDuration, config.maxDuration);
      star.style.setProperty('--duration', `${duration}s`);
      
      // Delay aleatorio - algunos con valores negativos para que ya estén visibles al cargar
      const delay = randomInRange(-duration, duration);
      star.style.setProperty('--delay', `${delay}s`);
      
      // Opacidad máxima aleatoria
      const maxOpacity = randomInRange(config.minOpacity, config.maxOpacity);
      star.style.setProperty('--max-opacity', maxOpacity);
      
      sparkleContainer.appendChild(star);
    }

    // Crear todas las estrellas
    for (let i = 0; i < config.numStars; i++) {
      createStar();
    }
  }

  // Inicializar con reintento
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initSparkleEffect, 500);
    });
  } else {
    setTimeout(initSparkleEffect, 500);
  }
  
  // Exponer función globalmente para reiniciar después de cambio de idioma
  window.restartSparkleEffect = initSparkleEffect;
})();


