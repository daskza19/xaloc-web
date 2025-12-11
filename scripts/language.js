let currentLanguage = 'ca';
let translations = {
  "ca": {
    "nav-home": "Inici",
    "nav-about": "Sobre nosaltres",
    "nav-services": "Serveis",
    "nav-contact": "Contacte",
    "hero-title": "Benvinguts a Xaloc Events",
    "hero-subtitle": "Tú decideixes el pla,",
    "hero-typing-prefix": "nosaltres posem",
    "hero-typing-words": ["el ritme", "l'ambient", "la beguda", "l'oferta", "l'experiència"],
    "client-opinion-1": "Mai hauria pensat que el meu aniversari semblaria un mini festival… aquests cracks ho van fer possible!",
    "client-opinion-2": "L’organització va ser impecable, i els meus convidats no van parar d’elogi﻿ar la varietat de begudes i la música.",
    "client-opinion-3": "Ens van muntar una festa de la qual els meus amics encara en parlen. Detalls molt cuidats i zero estrès. Molt recomanables!",
    "client-opinion-4": "El nostre esdeveniment d’empresa va passar de ‘reunió normaleta’ a ‘quina passada!’ en qüestió d’hores. Professionals i molt bon rotllo.",
    "client-opinion-5": "Em vaig oblidar de tots els embolics de l’organització; ells se’n van encarregar de tot i jo només vaig haver de gaudir. Així dona gust!"
    },
  "es": {
    "nav-home": "Inicio",
    "nav-about": "Sobre nosotros",
    "nav-services": "Servicios",
    "nav-contact": "Contacto",
    "hero-title": "Bienvenidos a Xaloc Events",
    "hero-subtitle": "Tú decides el plan,",
    "hero-typing-prefix": "nosotros ponemos",
    "hero-typing-words": ["el ritmo", "el ambiente", "la bebida", "la oferta", "la experiencia"],
    "client-opinion-1": "Jamás pensé que mi cumpleaños iba a parecer un mini festival… ¡estos cracks lo hicieron posible!",
    "client-opinion-2": "La organización fue impecable, y mis invitados no pararon de elogiar la variedad de bebidas y la música.",
    "client-opinion-3": "Nos montaron una fiesta que aún hoy comentan mis amigos. Detalles cuidados y cero estrés. ¡Recomendadísimos!",
    "client-opinion-4": "Nuestro evento de empresa pasó de ‘reunión normalita’ a ‘¡qué pasada!’ en cuestión de horas. Profesionales y buen rollo total.",
    "client-opinion-5": "Me olvidé de todos los líos de la organización; ellos se ocuparon de todo y yo solo tuve que disfrutar. ¡Así da gusto!"
  },
  "en": {
    "nav-home": "Home",
    "nav-about": "About us",
    "nav-services": "Services",
    "nav-contact": "Contact",
    "hero-title": "Welcome to Xaloc Events",
    "hero-subtitle": "You decide the plan,",
    "hero-typing-prefix": "we provide",
    "hero-typing-words": ["the rhythm", "the atmosphere", "the drinks", "the offer", "the experience"],
    "client-opinion-1": "I never imagined my birthday would feel like a mini festival… these guys made it happen!",
    "client-opinion-2": "The organization was flawless, and my guests couldn’t stop praising the variety of drinks and the music.",
    "client-opinion-3": "They put together a party my friends still talk about. Great attention to detail and zero stress. Highly recommended!",
    "client-opinion-4": "Our company event went from a ‘regular meeting’ to ‘wow, this is amazing!’ in just a few hours. Super professional and great vibes all around.",
    "client-opinion-5": "I forgot about all the planning headaches; they handled everything and I just had to enjoy. That’s how it should be!"
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
