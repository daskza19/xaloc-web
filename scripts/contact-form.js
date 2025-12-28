// Validación del formulario de contacto
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.querySelector('.email-contact-input');
    const nameInput = document.querySelector('.name-contact-input');
    const subjectSelect = document.querySelector('.subject-contact-input');
    const messageInput = document.querySelector('.text-contact-input');
    const sendButton = document.querySelector('.send-contact-button');

    // Función para validar email
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validar email al perder el foco
    emailInput.addEventListener('blur', function() {
        if (this.value && !validateEmail(this.value)) {
            this.classList.add('input-error');
        } else {
            this.classList.remove('input-error');
        }
    });

    // Limpiar error mientras escribe
    emailInput.addEventListener('input', function() {
        if (this.classList.contains('input-error') && validateEmail(this.value)) {
            this.classList.remove('input-error');
        }
    });

    // Validar antes de enviar
    sendButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        let hasErrors = false;

        // Validar email
        if (!emailInput.value || !validateEmail(emailInput.value)) {
            emailInput.classList.add('input-error');
            hasErrors = true;
        }

        // Validar campos requeridos
        if (!nameInput.value.trim()) {
            nameInput.classList.add('input-error');
            hasErrors = true;
        } else {
            nameInput.classList.remove('input-error');
        }

        if (!subjectSelect.value) {
            subjectSelect.classList.add('input-error');
            hasErrors = true;
        } else {
            subjectSelect.classList.remove('input-error');
        }

        if (!messageInput.value.trim()) {
            messageInput.classList.add('input-error');
            hasErrors = true;
        } else {
            messageInput.classList.remove('input-error');
        }

        if (!hasErrors) {
            // Aquí puedes añadir la lógica para enviar el formulario
            console.log('Formulario válido - listo para enviar');
            // Por ejemplo: enviar datos a un servidor
        }
    });

    // Limpiar errores al escribir en otros campos
    nameInput.addEventListener('input', function() {
        this.classList.remove('input-error');
    });

    subjectSelect.addEventListener('change', function() {
        this.classList.remove('input-error');
    });

    messageInput.addEventListener('input', function() {
        this.classList.remove('input-error');
    });
});
