const statsSection = document.getElementById('stats');
const statsNumbers = document.querySelectorAll('.stat-number');
let animationStarted = false;

// Verificar que el elemento existe antes de observar
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        
        // Solo si es visible (isIntersecting) y no se ha animado antes (!animationStarted)
        if (entry.isIntersecting && !animationStarted) {
            
            statsNumbers.forEach(stat => {
                const target = +stat.getAttribute('data-target'); // El número final
                const duration = 1000; // Duración en milisegundos (2.5s)
                const start = performance.now(); // Marca de tiempo precisa

                const animate = (currentTime) => {
                    const elapsed = currentTime - start;
                    const progress = Math.min(elapsed / duration, 1); // Va de 0 a 1

                    // Easing easeOutExpo: empieza rápido y desacelera suavemente al final
                    const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                    
                    stat.innerText = Math.floor(easeOut * target);

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        stat.innerText = target; // Asegura que termine en el número exacto
                    }
                };
                
                requestAnimationFrame(animate);
            });

            animationStarted = true; // Bloqueamos para que no se repita al volver a subir
        }
    }, {
        threshold: 0.2, // Activar cuando el 20% del bloque sea visible
        rootMargin: '0px 0px -100px 0px' // Activar un poco antes de que llegue al viewport
    });

    statsObserver.observe(statsSection);
} else {
    console.error('Stats section not found!');
}