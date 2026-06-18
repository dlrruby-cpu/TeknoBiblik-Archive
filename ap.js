// ========== app.js - TeknoBiblik™ by LópezDjTools ™ ==========
// ========== LECTOR DE VOZ (ACENTO MEXICANO) ==========
let speechSynth = window.speechSynthesis;
let currentUtterance = null;
let isReading = false;
let preferredVoice = null;

function getMexicanVoice() {
    return new Promise((resolve) => {
        if (preferredVoice) { resolve(preferredVoice); return; }
        let voices = speechSynth.getVoices();
        if (voices.length) resolve(selectBestMexicanVoice(voices));
        else speechSynth.onvoiceschanged = () => resolve(selectBestMexicanVoice(speechSynth.getVoices()));
    });
}
function selectBestMexicanVoice(voices) {
    let selected = voices.find(v => v.lang === 'es-MX');
    if (!selected) selected = voices.find(v => v.lang.startsWith('es') && (v.name.includes('México') || v.name.includes('Mexico') || v.name.includes('Mexican') || v.name.includes('Latino')));
    if (!selected) selected = voices.find(v => v.lang.startsWith('es'));
    if (!selected && voices.length) selected = voices[0];
    preferredVoice = selected;
    return selected;
}
async function readSlide() {
    if (speechSynth.speaking) speechSynth.cancel();
    const text = getTextFromCurrentSlide();
    if (!text) return;
    const voice = await getMexicanVoice();
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.lang = 'es-MX';
    utterance.rate = 1.1;
    utterance.onend = () => { isReading = false; currentUtterance = null; };
    speechSynth.speak(utterance);
    currentUtterance = utterance;
    isReading = true;
}
function stopReading() { if (speechSynth.speaking) speechSynth.cancel(); isReading = false; currentUtterance = null; }
function getTextFromCurrentSlide() {
    const slides = document.querySelectorAll('.slide');
    const carousel = document.getElementById('carousel');
    if (!carousel) return '';
    const idx = Math.round(carousel.scrollLeft / window.innerWidth);
    const slide = slides[idx];
    if (!slide) return '';
    let text = '';
    const tag = slide.querySelector('.era-tag');
    if (tag) text += tag.innerText + '. ';
    const title = slide.querySelector('h2');
    if (title) text += title.innerText + '. ';
    slide.querySelectorAll('p').forEach(p => { text += p.innerText + ' '; });
    slide.querySelectorAll('.artists p').forEach(a => { text += a.innerText + ' '; });
    return text.replace(/\s+/g, ' ').trim();
}
function attachCarouselReadStop() {
    const carousel = document.getElementById('carousel');
    if (carousel) carousel.addEventListener('scroll', () => { if (isReading) stopReading(); });
}

// ========== INICIALIZACIÓN DEL CARRUSEL ==========
function initCarousel() {
    const carousel = document.getElementById('carousel');
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('dotsContainer');
    const slides = document.querySelectorAll('.slide');
    let currentIndex = 0;

    function updateDots() {
        document.querySelectorAll('.dot').forEach((dot, idx) => {
            if (idx === currentIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }
    function goToSlide(index) {
        if (index < 0) index = 0;
        if (index >= slides.length) index = slides.length - 1;
        currentIndex = index;
        carousel.scrollTo({ left: currentIndex * window.innerWidth, behavior: 'smooth' });
        updateDots();
    }
    let scrollTimeout;
    carousel.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const newIndex = Math.round(carousel.scrollLeft / window.innerWidth);
            if (newIndex !== currentIndex) { currentIndex = newIndex; updateDots(); }
        }, 100);
    });
    prev.addEventListener('click', () => goToSlide(currentIndex - 1));
    next.addEventListener('click', () => goToSlide(currentIndex + 1));
    slides.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (idx === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(idx));
        dotsContainer.appendChild(dot);
    });
    window.addEventListener('resize', () => goToSlide(currentIndex));
    setTimeout(() => goToSlide(0), 100);
}

// ========== MOSTRAR MODAL DE TÉRMINOS Y LUEGO EL CONTENIDO ==========
function showTermsAndThenContent() {
    const modal = document.createElement('div');
    modal.className = 'overlay';
    modal.id = 'termsModal';
    modal.innerHTML = `
        <div class="overlay-content">
            <h2>📜 TEKNOBIBLIK™</h2>
            <h3>by LópezDjTools ™</h3>
            <div class="legal-text">
                <p><strong>✦ AVISO LEGAL Y TÉRMINOS DE PRIVACIDAD ✦</strong></p>
                <p><strong>1. Aceptación de términos</strong><br>Al acceder a TeknoBiblik™ usted acepta estos términos y condiciones. Esta página es un proyecto cultural sin ánimo de lucro que recopila material histórico del techno.</p>
                <p><strong>2. Propiedad intelectual y vídeos de YouTube</strong><br>Todos los vídeos incrustados pertenecen a sus respectivos propietarios (YouTube, artistas y sellos discográficos). Esta página no aloja ningún archivo multimedia localmente. El uso de los vídeos se hace bajo el marco de "fair use" o "cita" con fines educativos.</p>
                <p><strong>3. Privacidad</strong><br>Esta página NO recopila datos personales. Únicamente utiliza almacenamiento local (localStorage) para recordar su aceptación de los términos, el bloqueo temporal y el desbloqueo. No se envían datos a servidores externos.</p>
                <p><strong>4. Exención de responsabilidad</strong><br>El propietario no se hace responsable del mal uso de la información. La disponibilidad de los vídeos depende de terceros (YouTube).</p>
                <p><strong>5. Período de prueba de 72 horas</strong><br>Al aceptar, dispondrá de 72 horas para explorar la aplicación. Transcurrido ese tiempo, el acceso se bloqueará. El administrador puede desbloquear permanentemente con la clave maestra.</p>
                <p><strong>6. Legislación aplicable</strong><br>Legislación española.</p>
            </div>
            <button id="acceptTermsBtn">✅ ACEPTO Y ACCEDO</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('acceptTermsBtn').onclick = () => {
        modal.remove();
        document.getElementById('mainCarousel').style.display = 'block';
        document.getElementById('voiceButtons').style.display = 'flex';
        document.getElementById('adminUnlockBtn').style.display = 'block';
        initCarousel();
        attachCarouselReadStop();
        document.getElementById('readBtn').addEventListener('click', readSlide);
        document.getElementById('stopBtn').addEventListener('click', stopReading);
    };
}

// ========== INICIO: SPLASH + MODAL ==========
window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => splash.remove(), 150);
        }
        showTermsAndThenContent();
    }, 100);
});

// ========== BOTÓN ADMIN (SIMULACIÓN DE DESBLOQUEO) ==========
document.getElementById('adminUnlockBtn').addEventListener('click', () => {
    const clave = prompt("Introduce la clave maestra para desbloqueo permanente:");
    if (clave === "TechnoMaster2026") {
        alert("✅ Desbloqueo permanente activado (simulado, recarga para efecto).");
    } else if (clave) alert("❌ Clave incorrecta.");
});