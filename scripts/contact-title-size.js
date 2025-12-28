// Ajustar el tamaño del título vertical de contacto para que ocupe todo el alto disponible
function adjustContactTitleSize() {
    const title = document.querySelector('.contact-title-vertical');
    const container = document.querySelector('.contact-container');
    
    if (!title || !container) return;
    
    // Obtener el alto disponible del contenedor
    const containerHeight = container.offsetHeight;
    
    // Calcular el tamaño de fuente basado en el alto del contenedor
    // Empezamos con un tamaño grande y lo ajustamos
    let fontSize = 1; // Empezar pequeño
    let maxFontSize = containerHeight;
    let minFontSize = 1;
    let bestFontSize = 1;
    
    // Usar búsqueda binaria para encontrar el tamaño óptimo
    while (maxFontSize - minFontSize > 1) {
        fontSize = (maxFontSize + minFontSize) / 2;
        title.style.fontSize = fontSize + 'px';
        
        // Obtener el ancho del texto (que es la "altura" cuando está rotado)
        const textWidth = title.offsetWidth;
        
        // Si el texto cabe, intentar con un tamaño mayor
        if (textWidth < containerHeight) {
            minFontSize = fontSize;
            bestFontSize = fontSize;
        } else {
            maxFontSize = fontSize;
        }
    }
    
    // Aplicar el tamaño óptimo encontrado
    title.style.fontSize = bestFontSize + 'px';
    
    // Calcular la posición para centrado vertical y alineado a la izquierda
    // El texto está rotado -90°:
    // - Eje Y visual (vertical en pantalla) → centrado con translateX(-50%)
    // - Eje X visual (horizontal en pantalla) → borde izquierdo debe tocar el contenedor
    // Con transform-origin: left center, el punto de rotación está en el borde izquierdo
    // offsetHeight es el "grosor" del texto (que se vuelve horizontal al rotar)
    const textHeight = title.offsetHeight;
    
    // Convertir a vh
    const textHeightVh = (textHeight / window.innerHeight) * 100;
    
    // Para que el borde superior del texto rotado toque el izquierdo:
    // left = la mitad del grosor (porque rota desde el centro del borde izquierdo)
    title.style.left = (textHeightVh / 3) + 'vh';
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', adjustContactTitleSize);

// Ejecutar al redimensionar la ventana
window.addEventListener('resize', adjustContactTitleSize);

// Ejecutar después de que todas las fuentes se hayan cargado
document.fonts.ready.then(adjustContactTitleSize);

// Observar cambios en el texto del título (cuando cambia el idioma)
document.addEventListener('DOMContentLoaded', function() {
    const title = document.querySelector('.contact-title-vertical');
    if (title) {
        // Crear un observador de mutaciones para detectar cambios en el texto
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    // Esperar un momento para que el DOM se actualice completamente
                    setTimeout(adjustContactTitleSize, 50);
                }
            });
        });
        
        // Configurar el observador para detectar cambios en el contenido del texto
        observer.observe(title, {
            childList: true,
            characterData: true,
            subtree: true
        });
    }
});
