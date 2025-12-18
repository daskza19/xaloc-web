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

// Seleccionar idioma desde el dropdown horizontal
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

// Toggle dropdown de idiomas en el menú vertical
function toggleVerticalLanguageDropdown() {
    const dropdown = document.getElementById('vertical-language-dropdown-menu');
    const toggle = document.querySelector('.vertical-language-dropdown-toggle');
    
    if (dropdown.classList.contains('open')) {
        dropdown.classList.remove('open');
        toggle.classList.remove('open');
    } else {
        dropdown.classList.add('open');
        toggle.classList.add('open');
    }
}

// Seleccionar idioma desde el dropdown vertical
function selectVerticalLanguage(lang, event) {
    // Cerrar el dropdown
    const dropdown = document.getElementById('vertical-language-dropdown-menu');
    const toggle = document.querySelector('.vertical-language-dropdown-toggle');
    dropdown.classList.remove('open');
    toggle.classList.remove('open');
    
    // Actualizar la bandera seleccionada en el toggle vertical
    const selectedFlag = document.getElementById('vertical-selected-flag');
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

// Cerrar dropdowns al hacer clic fuera
document.addEventListener('click', function(event) {
    // Dropdown horizontal
    const horizontalDropdown = document.querySelector('.horizontal-language-dropdown');
    const horizontalMenu = document.getElementById('language-dropdown-menu');
    const horizontalToggle = document.querySelector('.language-dropdown-toggle');
    
    if (horizontalDropdown && !horizontalDropdown.contains(event.target) && horizontalMenu && horizontalMenu.classList.contains('open')) {
        horizontalMenu.classList.remove('open');
        if (horizontalToggle) {
            horizontalToggle.classList.remove('open');
        }
    }
    
    // Dropdown vertical
    const verticalDropdown = document.querySelector('.vertical-language-dropdown');
    const verticalMenu = document.getElementById('vertical-language-dropdown-menu');
    const verticalToggle = document.querySelector('.vertical-language-dropdown-toggle');
    
    if (verticalDropdown && !verticalDropdown.contains(event.target) && verticalMenu && verticalMenu.classList.contains('open')) {
        verticalMenu.classList.remove('open');
        if (verticalToggle) {
            verticalToggle.classList.remove('open');
        }
    }
});
