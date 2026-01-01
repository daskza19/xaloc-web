// Validación del formulario de contacto
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.querySelector('.email-contact-input');
    const nameInput = document.querySelector('.name-contact-input');
    const subjectSelect = document.querySelector('.subject-contact-input');
    const messageInput = document.querySelector('.text-contact-input');
    const charCount = document.getElementById('message-char-count');
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

    // --- Mostrar toast reutilizando los elementos del HTML ---
    function showToast(type) {
        const toast = document.querySelector(type === 'success' ? '.toast-success-message' : '.toast-fail-message');
        if (!toast) return;
        toast.style.display = '';
        toast.classList.remove('toast-hide');
        toast.classList.add('toast-show');
        setTimeout(() => {
            toast.classList.remove('toast-show');
            toast.classList.add('toast-hide');
        }, 5000);
    }

    // Asegurar que ambos botones envían el formulario
    const sendButtons = document.querySelectorAll('.send-contact-button');
    sendButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
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

            if (hasErrors) {
                showToast('fail');
                return;
            }

            // Guardar datos en Supabase
            const contactData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                contact_type: subjectSelect.value,
                message: messageInput.value.trim()
            };

            function saveContactToSupabase(data) {
                return window.supabase
                    .from('form_users')
                    .insert([data]);
            }

            function showSuccess() {
                showToast('success');
                nameInput.value = '';
                emailInput.value = '';
                subjectSelect.value = '';
                messageInput.value = '';
            }

            function showError() {
                showToast('fail');
            }

            if (!window.supabase) {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
                script.onload = () => {
                    const SUPABASE_URL = 'https://wwrklkdvuthcwcbowkeb.supabase.co';
                    const SUPABASE_KEY = 'sb_publishable_SI-Y_hDJhQyOxyyjvH3QPw_-WYPdbuv';
                    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                    saveContactToSupabase(contactData)
                        .then(({ error }) => {
                            if (!error) {
                                showSuccess();
                            } else {
                                showError();
                            }
                        });
                };
                document.body.appendChild(script);
            } else {
                saveContactToSupabase(contactData)
                    .then(({ error }) => {
                        if (!error) {
                            showSuccess();
                        } else {
                            showError();
                        }
                    });
            }
        });
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

    if (messageInput && charCount) {
        charCount.textContent = messageInput.value.length;
        messageInput.addEventListener('input', function() {
            charCount.textContent = this.value.length;
        });
    }
});
