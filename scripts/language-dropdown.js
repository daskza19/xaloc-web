// Toggle dropdown de idiomas en la barra horizontal
function toggleLanguageDropdown() {
    const dropdown = document.getElementById('language-dropdown-menu');
    const toggle = document.querySelector('.language-dropdown-toggle');
    
    if (dropdown.classList.contains('open')) {
        dropdown.classList.remove('open');
        toggle.classList.remove('open');
    } else {
        dropdown.classList.add('open');
        toggle.classList.add('open');
    }
}

// Seleccionar idioma desde el dropdown
function selectLanguage(lang, event) {
    // Cerrar el dropdown
    const dropdown = document.getElementById('language-dropdown-menu');
    const toggle = document.querySelector('.language-dropdown-toggle');
    dropdown.classList.remove('open');
    toggle.classList.remove('open');
    
    // Actualizar la bandera seleccionada en el toggle
    const selectedFlag = document.getElementById('selected-flag');
    const flags = {
        'ca': 'images/nav/cat_flag.webp',
        'es': 'images/nav/esp_flag.webp',
        'en': 'images/nav/eng_flag.webp'
    };
    
    if (flags[lang]) {
        selectedFlag.src = flags[lang];
    }
    
    // Llamar a la función de cambio de idioma existente
    changeLanguage(lang, event);
}

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.horizontal-language-dropdown');
    const menu = document.getElementById('language-dropdown-menu');
    const toggle = document.querySelector('.language-dropdown-toggle');
    
    if (dropdown && !dropdown.contains(event.target) && menu && menu.classList.contains('open')) {
        menu.classList.remove('open');
        if (toggle) {
            toggle.classList.remove('open');
        }
    }
});
