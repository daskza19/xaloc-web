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
    
    // Scroll spy - actualizar el enlace activo según la sección visible
    updateActiveNavLink();
});

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.horizontal-nav-link');
    
    let currentSection = '';
    const scrollPosition = window.scrollY + 100; // Offset para activar un poco antes
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
            link.classList.add('active');
        }
    });
}

// Llamar una vez al cargar la página
document.addEventListener('DOMContentLoaded', updateActiveNavLink);
