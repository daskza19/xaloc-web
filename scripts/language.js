let currentLanguage = 'ca';
let translations = {
  "ca": {
    "nav-home": "Inici",
    "nav-about": "Sobre nosaltres",
    "nav-services": "Serveis",
    "nav-contact": "Contacte",
    "hero-title": "Benvinguts a Xaloc Events",
    "hero-subtitle": "Som especialistes",
    "hero-typing-prefix": "amb",
    "hero-typing-words": ["festes", "events", "concerts", "celebracions", "experiències"]
  },
  "es": {
    "nav-home": "Inicio",
    "nav-about": "Sobre nosotros",
    "nav-services": "Servicios",
    "nav-contact": "Contacto",
    "hero-title": "Bienvenidos a Xaloc Events",
    "hero-subtitle": "Somos especialistas",
    "hero-typing-prefix": "con",
    "hero-typing-words": ["fiestas", "eventos", "conciertos", "celebraciones", "experiencias"]
  },
  "en": {
    "nav-home": "Home",
    "nav-about": "About us",
    "nav-services": "Services",
    "nav-contact": "Contact",
    "hero-title": "Welcome to Xaloc Events",
    "hero-subtitle": "We are specialists",
    "hero-typing-prefix": "in",
    "hero-typing-words": ["parties", "events", "concerts", "celebrations", "experiences"]
  }
};
let typingWords = [];

// Inicializar traducciones
function initTranslations() {
    console.log('Translations loaded:', translations);
    changeLanguage(currentLanguage);
}

// Cambiar el idioma
function changeLanguage(lang, evt) {
    console.log('Changing language to:', lang);
    currentLanguage = lang;
    
    if (!translations[lang]) {
        console.error('Language not found:', lang);
        return;
    }
    
    // Actualizar clase active en los botones de idioma
    document.querySelectorAll('.language-icon').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Añadir active al botón clickeado
    if (evt && evt.target) {
        evt.target.classList.add('active');
    } else {
        // Si no hay evento (primera carga), activar el botón del idioma actual
        const buttons = document.querySelectorAll('.language-icon');
        buttons.forEach((btn, index) => {
            const langs = ['ca', 'es', 'en'];
            if (langs[index] === lang) {
                btn.classList.add('active');
            }
        });
    }
    
    // Actualizar todos los elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Actualizar las palabras del typing effect
    if (translations[lang]['hero-typing-words']) {
        typingWords = translations[lang]['hero-typing-words'];
        // Reiniciar el efecto de typing con las nuevas palabras
        if (window.restartTypingEffect) {
            window.restartTypingEffect(typingWords);
        }
    }
}

// Toggle del menú
function toggleMenu() {
    const menu = document.getElementById('main-menu');
    menu.classList.toggle('open');
}

// Cerrar el menú
function closeMenu() {
    const menu = document.getElementById('main-menu');
    menu.classList.remove('open');
}

// Inicializar cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    initTranslations();
    
    // Cerrar menú al hacer click fuera
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('main-menu');
        const button = document.getElementById('menu-button');
        
        if (!menu.contains(e.target) && !button.contains(e.target)) {
            closeMenu();
        }
    });
    
    // Cerrar menú al hacer click en un enlace de navegación
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });
});
