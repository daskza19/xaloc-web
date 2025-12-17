// Hacer la barra horizontal sticky después del hero
window.addEventListener('scroll', function() {
    const horizontalNav = document.getElementById('horizontal-nav');
    const menuButton = document.getElementById('menu-button');
    
    // Si pasamos del 100vh, hacer sticky la barra y mostrar el botón de menú
    if (window.scrollY >= window.innerHeight) {
        if (horizontalNav) {
            horizontalNav.classList.add('sticky');
        }
        if (menuButton) {
            menuButton.classList.add('visible');
        }
    } else {
        if (horizontalNav) {
            horizontalNav.classList.remove('sticky');
        }
        if (menuButton) {
            menuButton.classList.remove('visible');
        }
    }
});
