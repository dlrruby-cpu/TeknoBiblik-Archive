// ============================================================
// ap.js - Lógica Oficial de TeknoBiblik™
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('ap.js cargado correctamente.');

    // --- Elementos del DOM ---
    const splash = document.getElementById('splash');
    const termsOverlay = document.getElementById('termsOverlay');
    const acceptTermsBtn = document.getElementById('acceptTermsBtn');
    const mainCarousel = document.getElementById('mainCarousel');
    const carousel = document.getElementById('carousel');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('dotsContainer');
    const voiceButtons = document.getElementById('voiceButtons');
    const adminUnlockBtn = document.getElementById('adminUnlockBtn');
    const readBtn = document.getElementById('readBtn');
    const stopBtn = document.getElementById('stopBtn');

    let currentIndex = 0;
    let synth = window.speechSynthesis;
    let currentUtterance = null;

    // --- Ocultar Splash automáticamente a los 2.5 segundos ---
    setTimeout(() => {
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => splash.style.display = 'none', 500);
        }
    }, 2500);

    // --- Gestión del Modal de Términos ---
    if (acceptTermsBtn) {
        acceptTermsBtn.addEventListener('click', () => {
            termsOverlay.style.display = 'none';
            mainCarousel.style.display = 'block';
            voiceButtons.style.display = 'flex';
            adminUnlockBtn.style.display = 'block';
            updateCarousel();
        });
    }

    // --- Crear Indicadores Dinámicos (Dots) ---
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    // --- Función para Actualizar el Estado del Carrusel ---
    function updateCarousel() {
        if (slides.length === 0) return;
        
        // Detener lectura de voz al cambiar de slide
        if (synth && synth.speaking) {
            synth.cancel();
        }

        // Mover el contenedor al slide actual
        const slideWidth = slides[0].clientWidth;
        carousel.scrollTo({
            left: slideWidth * currentIndex,
            behavior: 'smooth'
        });

        // Actualizar estados de los dots
        dots.forEach((dot, idx) => {
            if (idx === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // --- Botones de Navegación ---
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentIndex < slides.length - 1) {
                currentIndex++;
            } else {
                currentIndex = 0; // Bucle al inicio
            }
            updateCarousel();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = slides.length - 1; // Bucle al final
            }
            updateCarousel();
        });
    }

    // --- Ajuste en cambios de tamaño de pantalla ---
    window.addEventListener('resize', updateCarousel);

    // --- Control de Lectura de Voz (Text-to-Speech) ---
    if (readBtn && stopBtn) {
        readBtn.addEventListener('click', () => {
            if (!synth) return alert('Tu navegador no soporta síntesis de voz.');

            // Si ya está hablando, detenerlo antes de reiniciar
            if (synth.speaking) {
                synth.cancel();
            }

            // Capturar texto solo del slide visible
            const currentSlideText = slides[currentIndex].querySelector('p').innerText;
            const currentSlideTitle = slides[currentIndex].querySelector('h2').innerText;
            
            currentUtterance = new SpeechSynthesisUtterance(`${currentSlideTitle}. ${currentSlideText}`);
            currentUtterance.lang = 'es-ES';
            currentUtterance.rate = 1.0;

            synth.speak(currentUtterance);
        });

        stopBtn.addEventListener('click', () => {
            if (synth && synth.speaking) {
                synth.cancel();
            }
        });
    }

    // --- Evento Simbólico para el botón Admin ---
    if (adminUnlockBtn) {
        adminUnlockBtn.addEventListener('click', () => {
            alert('Acceso al sistema TeknoBiblik™ verificado. Modo administrador activo (LópezDjTools).');
        });
    }
});
