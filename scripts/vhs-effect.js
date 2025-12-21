// Efecto VHS - Elementos dinámicos simplificados
(function() {
  function initVHSEffect() {
    // Crear contenedor para aberración cromática
    const vhsContainer = document.createElement('div');
    vhsContainer.className = 'vhs-container';
    document.body.appendChild(vhsContainer);
    
    // Crear banda de tracking
    const trackingBand = document.createElement('div');
    trackingBand.className = 'vhs-tracking';
    document.body.appendChild(trackingBand);
    
    // Distorsión de color ocasional muy sutil
    function colorDistortion() {
      const vhsContainer = document.querySelector('.vhs-container');
      if (!vhsContainer) return;
      
      const colors = [
        'hue-rotate(1deg)',
        'hue-rotate(-1deg)',
        'hue-rotate(0deg)'
      ];
      
      const randomFilter = colors[Math.floor(Math.random() * colors.length)];
      vhsContainer.style.filter = randomFilter;
      
      setTimeout(() => {
        vhsContainer.style.filter = '';
      }, 100);
      
      // Siguiente distorsión en un tiempo aleatorio
      setTimeout(colorDistortion, 4000 + Math.random() * 6000);
    }
    
    setTimeout(colorDistortion, 2000);
  }
  
  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVHSEffect);
  } else {
    initVHSEffect();
  }
})();
