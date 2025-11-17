let currentTypingWords = [
    "festes",
    "events",
    "concerts",
    "celebracions",
    "experiències"
];

let currentIndex = 0;
let typingElement = null;
let typingInterval = null;

const typingDuration = 1000;
const displayDuration = 2000;
const eraseDuration = 500;

function changeWord() {
    if (!typingElement || currentTypingWords.length === 0) return;
    
    // Cambiar el texto
    typingElement.textContent = currentTypingWords[currentIndex];
    
    // Remover y re-añadir la animación
    typingElement.style.animation = 'none';
    
    // Forzar reflow
    void typingElement.offsetWidth;
    
    // Aplicar animación de escritura
    typingElement.style.animation = `typing ${typingDuration}ms steps(30, end) forwards, blink 1s step-end infinite`;
    
    // Después de escribir y mostrar, iniciar borrado
    setTimeout(() => {
        typingElement.style.animation = `erasing ${eraseDuration}ms steps(30, end) forwards, blink 1s step-end infinite`;
        
        // Después de borrar, cambiar a la siguiente palabra
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % currentTypingWords.length;
            changeWord();
        }, eraseDuration);
    }, typingDuration + displayDuration);
}

// Función para reiniciar el efecto con nuevas palabras
window.restartTypingEffect = function(newWords) {
    if (newWords && newWords.length > 0) {
        currentTypingWords = newWords;
        currentIndex = 0;
        changeWord();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    typingElement = document.querySelector(".typing");
    
    if (typingElement) {
        // Iniciar el ciclo
        changeWord();
    }
});
