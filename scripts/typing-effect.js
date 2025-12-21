let currentTypingWords = [
    "el ritme",
    "l'ambient",
    "la beguda",
    "l'oferta",
    "l'experiència"
];

let currentIndex = 0;
let typingElement = null;
let wrapperElement = null;
let typingTimeout1 = null;
let typingTimeout2 = null;

const typingDuration = 1000;
const displayDuration = 2000;
const eraseDuration = 500;

function changeWord() {
    if (!typingElement || !wrapperElement || currentTypingWords.length === 0) return;
    
    // Crear un elemento temporal invisible para medir el ancho real
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.whiteSpace = 'nowrap';
    tempSpan.style.font = window.getComputedStyle(typingElement).font;
    tempSpan.style.color = window.getComputedStyle(typingElement).color;
    tempSpan.textContent = currentTypingWords[currentIndex];
    document.body.appendChild(tempSpan);
    
    const fullWidth = tempSpan.offsetWidth;
    document.body.removeChild(tempSpan);
    
    // Establecer el ancho en el wrapper (esto mantiene el espacio reservado)
    wrapperElement.style.width = (fullWidth + 10) + 'px';
    
    // Establecer el contenido en el elemento interno
    typingElement.textContent = currentTypingWords[currentIndex];
    typingElement.style.animation = 'none';
    typingElement.style.maxWidth = '0';
    
    // Forzar reflow
    void typingElement.offsetWidth;
    
    // Aplicar animación de escritura
    typingElement.style.animation = `typing ${typingDuration}ms steps(30, end) forwards, blink 1s step-end infinite`;
    
    // Después de escribir y mostrar, iniciar borrado
    typingTimeout1 = setTimeout(() => {
        typingElement.style.animation = `erasing ${eraseDuration}ms steps(30, end) forwards, blink 1s step-end infinite`;
        
        // Después de borrar, cambiar a la siguiente palabra
        typingTimeout2 = setTimeout(() => {
            currentIndex = (currentIndex + 1) % currentTypingWords.length;
            changeWord();
        }, eraseDuration);
    }, typingDuration + displayDuration);
}

// Función para reiniciar el efecto con nuevas palabras
window.restartTypingEffect = function(newWords) {
    // Limpiar cualquier timeout existente
    if (typingTimeout1) {
        clearTimeout(typingTimeout1);
        typingTimeout1 = null;
    }
    if (typingTimeout2) {
        clearTimeout(typingTimeout2);
        typingTimeout2 = null;
    }
    
    if (newWords && newWords.length > 0) {
        currentTypingWords = newWords;
        currentIndex = 0;
        changeWord();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    wrapperElement = document.querySelector("span.typing-wrapper");
    typingElement = document.querySelector("span.typing");
    
    if (typingElement && wrapperElement) {
        // Iniciar el ciclo
        changeWord();
    }
});
