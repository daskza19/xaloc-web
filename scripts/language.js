let currentLanguage = 'ca';
let translations = {
  "ca": {
    "nav-about": "Sobre nosaltres",
    "nav-tickets": "Entrades",
    "nav-gallery": "Galeria",
    "nav-contact": "Contacte",
    "work-in-progress": "Estem treballant en això...",
    "hero-title": "Benvinguts a Xaloc Events",
    "hero-subtitle": "Tú decideixes el pla, nosaltres posem",
    "hero-tagline-1": "experiències que",
    "hero-tagline-sparkle": "brillen",
    "hero-tagline-2": "records que perduren",
    "hero-typing-words": ["el ritme", "l'ambient", "la beguda", "l'oferta", "l'experiència"],
    "client-opinion-1": "Mai hauria pensat que el meu aniversari semblaria un mini festival… aquests cracks ho van fer possible!",
    "client-opinion-2": "L’organització va ser impecable, i els meus convidats no van parar d’elogi﻿ar la varietat de begudes i la música.",
    "client-opinion-3": "Ens van muntar una festa de la qual els meus amics encara en parlen. Detalls molt cuidats i zero estrès. Molt recomanables!",
    "client-opinion-4": "El nostre esdeveniment d’empresa va passar de ‘reunió normaleta’ a ‘quina passada!’ en qüestió d’hores. Professionals i molt bon rotllo.",
    "client-opinion-5": "Em vaig oblidar de tots els embolics de l’organització; ells se’n van encarregar de tot i jo només vaig haver de gaudir. Així dona gust!",
    "events-subtitle": "organitzats per a públics molt diversos: esdeveniments privats, tardeos i esdeveniments oberts al públic.",
    "events-color": "esdeveniments",
    "attendees-subtitle": "han gaudit de les nostres propostes al llarg de tots els nostres esdeveniments.",
    "attendees-color": "assistents",
    "years-subtitle": "d’experiència en el sector, avalats per una àmplia xarxa de contactes i col·laboradors clau.",
    "years-color": "anys",
    "contact-heading": "Contacta amb nosaltres",
    "contact-title": "Contacte",
    "name-contact-label": "NOM:",
    "name-placeholder": "Escriu el teu nom",
    "email-contact-label": "CORREU ELECTRÒNIC:",
    "email-placeholder": "Escriu el teu correu electrònic",
    "subject-contact-label": "TEMA:",
    "subject-placeholder": "Selecciona un tema",
    "subject-company": "Festa empresa",
    "subject-private": "Particular",
    "subject-question": "Dubte esdeveniments",
    "message-contact-label": "MISSATGE:",
    "message-placeholder": "Escriu el teu missatge",
    "send-contact-button": "ENVIAR",
    "toast-success-message": "Missatge enviat correctament!",
    "toast-fail-message": "Error en enviar el missatge!",
    "gallery-subtitle": "Explora els nostres àlbums de fotos",
    "gallery-photos": "fotos",
    "gallery-loading": "Carregant galeria...",
    "gallery-loading-photos": "Carregant fotos...",
    "gallery-no-albums": "No hi ha àlbums disponibles",
    "gallery-no-photos": "No hi ha fotos en aquest àlbum",
    "gallery-show-more": "Mostrar més",
    "gallery-download": "Descarregar",
    "gallery-downloading": "Descarregant...",
    "proposal-title": "Proposta",
    "proposal-subtitle": "Creem experiències úniques i màgiques per a tu."
    },
  "es": {
    "nav-about": "Sobre nosotros",
    "nav-tickets": "Entradas",
    "nav-gallery": "Galería",
    "nav-contact": "Contacto",
    "work-in-progress": "Estamos trabajando en ello...",
    "hero-title": "Bienvenidos a Xaloc Events",
    "hero-subtitle": "Tú decides el plan, nosotros ponemos",
    "hero-tagline-1": "experiencias que",
    "hero-tagline-sparkle": "brillan",
    "hero-tagline-2": "recuerdos que perduran",
    "hero-typing-words": ["el ritmo", "el ambiente", "la bebida", "la oferta", "la experiencia"],
    "client-opinion-1": "Jamás pensé que mi cumpleaños iba a parecer un mini festival… ¡estos cracks lo hicieron posible!",
    "client-opinion-2": "La organización fue impecable, y mis invitados no pararon de elogiar la variedad de bebidas y la música.",
    "client-opinion-3": "Nos montaron una fiesta que aún hoy comentan mis amigos. Detalles cuidados y cero estrés. ¡Recomendadísimos!",
    "client-opinion-4": "Nuestro evento de empresa pasó de ‘reunión normalita’ a ‘¡qué pasada!’ en cuestión de horas. Profesionales y buen rollo total.",
    "client-opinion-5": "Me olvidé de todos los líos de la organización; ellos se ocuparon de todo y yo solo tuve que disfrutar. ¡Así da gusto!",
    "events-subtitle": "organizados para públicos muy diversos: eventos privados, tardeos y eventos abiertos al público.",
    "events-color": "eventos",
    "attendees-subtitle": "han disfrutado de nuestras propuestas a lo largo de todos nuestros eventos.",
    "attendees-color": "asistentes",
    "years-subtitle": "de experiencia en el sector, respaldados por una amplia red de contactos y colaboradores clave.",
    "years-color": "años",
    "contact-heading": "Contacta con nosotros",
    "contact-title": "Contacto",
    "name-contact-label": "NOMBRE:",
    "name-placeholder": "Escribe tu nombre",
    "email-contact-label": "CORREO ELECTRÓNICO:",
    "email-placeholder": "Escribe tu correo electrónico",
    "subject-contact-label": "TEMA:",
    "subject-placeholder": "Selecciona un tema",
    "subject-company": "Fiesta empresa",
    "subject-private": "Particular",
    "subject-question": "Duda eventos",
    "message-contact-label": "MENSAJE:",
    "message-placeholder": "Escribe tu mensaje",
    "send-contact-button": "ENVIAR",
    "toast-success-message": "¡Mensaje enviado correctamente!",
    "toast-fail-message": "Error al enviar el mensaje!",
    "gallery-subtitle": "Explora nuestros álbumes de fotos",
    "gallery-photos": "fotos",
    "gallery-loading": "Cargando galería...",
    "gallery-loading-photos": "Cargando fotos...",
    "gallery-no-albums": "No hay álbumes disponibles",
    "gallery-no-photos": "No hay fotos en este álbum",
    "gallery-show-more": "Mostrar más",
    "gallery-download": "Descargar",
    "gallery-downloading": "Descargando...",
    "proposal-title": "Propuesta",
    "proposal-subtitle": "Creamos experiencias únicas y mágicas para ti."
  },
  "en": {
    "nav-about": "About us",
    "nav-tickets": "Tickets",
    "nav-gallery": "Gallery",
    "nav-contact": "Contact",
    "work-in-progress": "We are working on it...",
    "hero-title": "Welcome to Xaloc Events",
    "hero-subtitle": "You decide the plan, we provide",
    "hero-tagline-1": "experiences that",
    "hero-tagline-sparkle": "shine",
    "hero-tagline-2": "memories that last",
    "hero-typing-words": ["the rhythm", "the atmosphere", "the drinks", "the offer", "the experience"],
    "client-opinion-1": "I never imagined my birthday would feel like a mini festival… these guys made it happen!",
    "client-opinion-2": "The organization was flawless, and my guests couldn’t stop praising the variety of drinks and the music.",
    "client-opinion-3": "They put together a party my friends still talk about. Great attention to detail and zero stress. Highly recommended!",
    "client-opinion-4": "Our company event went from a ‘regular meeting’ to ‘wow, this is amazing!’ in just a few hours. Super professional and great vibes all around.",
    "client-opinion-5": "I forgot about all the planning headaches; they handled everything and I just had to enjoy. That’s how it should be!",
    "events-subtitle": "organized for very diverse audiences: private events, afternoon parties, and public events.",
    "events-color": "events",
    "attendees-subtitle": "have enjoyed our proposals across all of our events.",
    "attendees-color": "attendees",
    "years-subtitle": "of experience in the industry, supported by a strong network of contacts and key collaborators.",
    "years-color": "years",
    "contact-heading": "Contact us",
    "contact-title": "Contact",
    "name-contact-label": "NAME:",
    "name-placeholder": "Enter your name",
    "email-contact-label": "EMAIL:",
    "email-placeholder": "Enter your email",
    "subject-contact-label": "SUBJECT:",
    "subject-placeholder": "Select a subject",
    "subject-company": "Company party",
    "subject-private": "Private",
    "subject-question": "Event inquiry",
    "message-contact-label": "MESSAGE:",
    "message-placeholder": "Enter your message",
    "send-contact-button": "SEND",
    "toast-success-message": "Message sent successfully!",
    "toast-fail-message": "Error sending the message!",
    "gallery-subtitle": "Explore our photo albums",
    "gallery-photos": "photos",
    "gallery-loading": "Loading gallery...",
    "gallery-loading-photos": "Loading photos...",
    "gallery-no-albums": "No albums available",
    "gallery-no-photos": "No photos in this album",
    "gallery-show-more": "Show more",
    "gallery-download": "Download",
    "gallery-downloading": "Downloading...",
    "proposal-title": "Proposal",
    "proposal-subtitle": "We create unique and magical experiences for you."
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
    
    // Actualizar clase active en los botones de idioma (ambos menús)
    document.querySelectorAll('.language-icon, .horizontal-language-icon').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Añadir active al botón clickeado
    if (evt && evt.target) {
        // Si se hizo clic en una imagen, obtener el botón padre
        const button = evt.target.closest('button');
        if (button) {
            // Activar el botón correspondiente en ambos menús
            const langs = ['ca', 'es', 'en'];
            const langIndex = langs.indexOf(lang);
            
            document.querySelectorAll('.language-icon').forEach((btn, index) => {
                if (index === langIndex) {
                    btn.classList.add('active');
                }
            });
            
            document.querySelectorAll('.horizontal-language-icon').forEach((btn, index) => {
                if (index === langIndex) {
                    btn.classList.add('active');
                }
            });
        }
    } else {
        // Si no hay evento (primera carga), activar el botón del idioma actual
        const langs = ['ca', 'es', 'en'];
        const langIndex = langs.indexOf(lang);
        
        document.querySelectorAll('.language-icon').forEach((btn, index) => {
            if (index === langIndex) {
                btn.classList.add('active');
            }
        });
        
        document.querySelectorAll('.horizontal-language-icon').forEach((btn, index) => {
            if (index === langIndex) {
                btn.classList.add('active');
            }
        });
    }
    
    // Actualizar todos los elementos with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            // Si es el proposal-subtitle, dividir en palabras y crear spans
            if (key === 'proposal-subtitle') {
                const words = translations[lang][key].split(' ');
                element.innerHTML = words.map(word => `<span class="scroll-word">${word}</span>`).join('');
            }
            // Si el elemento es un span dentro de un párrafo con typing, solo actualizar el textContent
            else if (element.tagName === 'SPAN' && element.parentElement.querySelector('.typing')) {
                element.textContent = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
    
    // Actualizar placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            element.placeholder = translations[lang][key];
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
    
    // Reiniciar el efecto de scroll de palabras después de actualizar las traducciones
    if (window.reinitScrollWordEffect) {
        window.reinitScrollWordEffect();
    }
    
    // Reiniciar el efecto de estrellas después de actualizar las traducciones
    if (window.restartSparkleEffect) {
        setTimeout(window.restartSparkleEffect, 100);
    }
}

// Toggle del menú
function toggleMenu() {
    const menu = document.getElementById('vertical-nav');
    menu.classList.toggle('open');
}

// Cerrar el menú
function closeMenu() {
    const menu = document.getElementById('vertical-nav');
    menu.classList.remove('open');
}

// Inicializar cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    initTranslations();
    
    // Cerrar menú al hacer click fuera
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('vertical-nav');
        const button = document.getElementById('menu-button');
        if (menu && button) {
            if (!menu.contains(e.target) && !button.contains(e.target)) {
                closeMenu();
            }
        }
    });
    
    // Cerrar menú al hacer click en un enlace de navegación
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });
});
