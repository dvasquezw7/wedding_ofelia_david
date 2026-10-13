// ==========================================
// COUNTDOWN TIMER
// ==========================================
function initCountdown() {
    const weddingDate = new Date('2026-11-15T16:30:00').getTime();
    const countdownElement = document.getElementById('countdown');

    if (!countdownElement) return;

    function update() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            countdownElement.innerHTML = '<p style="font-size: 2rem; font-family: var(--font-heading);">¡Es hoy! 🎉</p>';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
}

// ==========================================
// CALENDAR EVENT GENERATION
// ==========================================
function initCalendar() {
    const calendarBtn = document.getElementById('add-calendar-btn');
    if (!calendarBtn) return;

    calendarBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const event = {
            title: 'Boda de Ofelia y David',
            description: '¡Día de nuestra boda! Estamos felices de compartirlo contigo.',
            location: 'Casa de Campo Serpabi, Cochabamba, Bolivia',
            start: '20261115T163000',
            end: '20261115T210000'
        };

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Ofelia&David//Wedding//ES',
            'BEGIN:VEVENT',
            `DTSTART:${event.start}`,
            `DTEND:${event.end}`,
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${event.description}`,
            `LOCATION:${event.location}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Boda_Ofelia_y_David.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    });
}

// ==========================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ==========================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe animatable elements
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}

// ==========================================
// GALLERY GENERATION
// ==========================================
function initGallery() {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;

    const photos = [
        'assets/photos/4.jpeg',
        'assets/photos/5.jpeg',
        'assets/photos/6.jpeg'
    ];

    photos.forEach((src, index) => {
        const item = document.createElement('figure');
        item.className = 'photo';
        item.innerHTML = `<img src="${src}" alt="Ofelia y David, foto ${index + 1}" loading="lazy">`;

        // Abrir lightbox en modo carrusel al hacer clic
        item.addEventListener('click', () => {
            openLightbox(src, photos, index);
        });

        gallery.appendChild(item);
    });
}

// ==========================================
// LIGHTBOX LOGIC
// ==========================================
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.querySelector('.lightbox-close');

    if (!lightbox || !closeBtn) return;

    // Cerrar al hacer clic en la X
    closeBtn.addEventListener('click', closeLightbox);

    // Cerrar al hacer clic fuera de la imagen
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Teclado: Esc cierra, flechas navegan
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showLightboxSlide(-1);
        if (e.key === 'ArrowRight') showLightboxSlide(1);
    });

    // Botones anterior / siguiente
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    if (prevBtn) prevBtn.addEventListener('click', () => showLightboxSlide(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => showLightboxSlide(1));

    // Deslizar en celular
    let touchStartX = null;
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
        if (touchStartX === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(deltaX) > 50) showLightboxSlide(deltaX < 0 ? 1 : -1);
        touchStartX = null;
    });

    // Soporte para QR Clickable
    const qrImage = document.querySelector('.clickable-qr');
    if (qrImage) {
        qrImage.addEventListener('click', () => {
            openLightbox(qrImage.src);
        });
    }

    // Force Download Logic
    const downloadLink = document.getElementById('lightbox-download');
    if (downloadLink) {
        downloadLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const url = downloadLink.href;

            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = blobUrl;
                a.download = downloadLink.download;
                document.body.appendChild(a);
                a.click();

                window.URL.revokeObjectURL(blobUrl);
                document.body.removeChild(a);
            } catch (err) {
                console.error('Download failed:', err);
                // Fallback
                window.open(url, '_blank');
            }
        });
    }
}


// Estado del carrusel: lista de fotos abierta y posición actual
let lightboxSlides = [];
let lightboxIndex = 0;

function showLightboxSlide(step) {
    if (lightboxSlides.length < 2) return;
    lightboxIndex = (lightboxIndex + step + lightboxSlides.length) % lightboxSlides.length;
    updateLightboxSlide();
}

function updateLightboxSlide() {
    const lightboxImg = document.getElementById('lightbox-img');
    const counter = document.getElementById('lightbox-counter');
    if (lightboxImg) lightboxImg.src = lightboxSlides[lightboxIndex];
    if (counter) counter.textContent = `${lightboxIndex + 1} / ${lightboxSlides.length}`;
}

function openLightbox(src, slides = [src], index = 0) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const downloadLink = document.getElementById('lightbox-download');


    if (!lightbox || !lightboxImg) return;

    lightboxSlides = slides;
    lightboxIndex = index;
    updateLightboxSlide();
    lightbox.classList.toggle('single', slides.length < 2);

    // Update download link visibility and source
    if (downloadLink) {
        // Only show for QR codes (checking filename parts)
        const isQR = src.toLowerCase().includes('qr') || src.includes('banco');

        if (isQR) {
            downloadLink.style.display = 'flex';
            downloadLink.href = src;
            downloadLink.download = 'QR_Banco_Ofelia_David.jpeg';
        } else {
            downloadLink.style.display = 'none';
        }
    }


    lightbox.style.display = 'flex';
    // Timeout para permitir que el display:flex se aplique antes de la opacidad
    setTimeout(() => {
        lightbox.classList.add('active');
    }, 10);
    document.body.style.overflow = 'hidden'; // Evitar scroll al estar abierto
}


function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.classList.remove('active');
    setTimeout(() => {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 400); // Mismo tiempo que la transición en CSS
}

// ==========================================
// RSVP FORM HANDLING (Google Forms Integration)
// ==========================================
function initRSVPForm() {
    const form = document.getElementById('rsvp-form');
    const formMessage = document.getElementById('form-message');

    if (!form || !formMessage) return;

    // Configuración de Google Form - Boda Ofelia & David
    // TODO: pendiente crear el Google Form nuevo. Mientras GOOGLE_FORM_URL esté vacío
    // el formulario no envía nada y el botón queda desactivado.
    const GOOGLE_FORM_URL = '';
    const ENTRY_IDS = {
        name: 'entry.XXXXXXXXX',        // ID del campo Invitado(s)
        attendance: 'entry.XXXXXXXXX',  // ID del campo Asistiran
        message: 'entry.XXXXXXXXX'      // ID del campo Mensaje
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!GOOGLE_FORM_URL) return;

        const submitBtn = form.querySelector('.submit-button');
        const originalBtnText = submitBtn.textContent;

        const nameValue = document.getElementById('name').value;
        const attendanceValue = document.getElementById('attendance').value;
        const messageValue = document.getElementById('message').value;

        // Validar que se haya seleccionado una opción
        if (!attendanceValue) {
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Por favor selecciona si asistirás.';
            formMessage.style.display = 'block';
            return;
        }

        // Bloquear botón y mostrar carga
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        // Usar URLSearchParams para asegurar el formato application/x-www-form-urlencoded
        const params = new URLSearchParams();
        params.append(ENTRY_IDS.name, nameValue);
        params.append(ENTRY_IDS.attendance, attendanceValue === 'yes' ? 'Si' : 'No');
        params.append(ENTRY_IDS.message, messageValue);

        try {
            // Intentar envío a Google Forms (no-cors es esencial para evitar errores de preflight)
            await fetch(GOOGLE_FORM_URL, {
                method: 'POST',
                body: params,
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            // Éxito
            formMessage.className = 'form-message success';
            formMessage.textContent = '¡Gracias por confirmar! Tu respuesta ha sido enviada con éxito.';
            formMessage.style.display = 'block';
            form.reset();
            document.querySelectorAll('.choice-option').forEach(opt => opt.setAttribute('aria-checked', 'false'));

            // Mantener el nombre del invitado si los parámetros siguen ahí
            initGuestLimit();

        } catch (error) {
            console.error('Error al enviar:', error);
            // Aunque falle el fetch por CORS (si no se usa no-cors), 
            // generalmente el dato llega igual. Pero aquí usamos no-cors para mayor seguridad.
            formMessage.className = 'form-message success'; // Usualmente Google responde con 0 en no-cors
            formMessage.textContent = '¡Gracias por confirmar! Hemos recibido tu respuesta.';
            formMessage.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;

            // Scroll suave al mensaje
            formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Ocultar mensaje después de unos segundos si es éxito
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 6000);
        }
    });
}

// ==========================================
// PARALLAX EFFECT FOR HERO
// ==========================================
function initParallax() {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrolled / 700);
        }
    }, { passive: true });
}

// ==========================================
// DYNAMIC GUEST LIMIT & PERSONALIZATION
// ==========================================
function initGuestLimit() {
    const params = new URLSearchParams(window.location.search);

    // Handle Seats (pass)
    const passValue = params.get('pass');
    let seats = '?';
    if (passValue && !isNaN(passValue) && passValue > 0 && passValue <= 10) {
        seats = passValue;
    }

    const displayElement = document.getElementById('seats-display');
    if (displayElement) {
        displayElement.textContent = seats;
    }
    const unitElement = document.getElementById('seats-unit');
    if (unitElement) {
        unitElement.textContent = seats === '1' ? 'persona' : 'personas';
    }

    // Handle Guest Name (guest)
    const guestName = params.get('guest');
    const nameInput = document.getElementById('name');
    if (guestName && nameInput) {
        nameInput.value = guestName;
    }

    // Handle Gifts Visibility (regalos=no hides the section)
    if (params.get('regalos') === 'no') {
        const giftsSection = document.getElementById('regalos');
        if (giftsSection) giftsSection.remove();
    }
}

// ==========================================
// COPY TO CLIPBOARD
// ==========================================
function initCopyButtons() {
    const copyBtns = document.querySelectorAll('.copy-btn');

    copyBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const textToCopy = btn.getAttribute('data-clipboard-text');

            try {
                await navigator.clipboard.writeText(textToCopy);

                // Visual feedback
                const originalIcon = btn.innerHTML;
                btn.classList.add('copied');
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = originalIcon;
                }, 2000);
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        });
    });
}



// ==========================================
// ATTENDANCE CHOICE (Sí / No)
// ==========================================
function initAttendanceChoice() {
    const group = document.getElementById('attendance-choice');
    const hiddenInput = document.getElementById('attendance');
    if (!group || !hiddenInput) return;

    const options = group.querySelectorAll('.choice-option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            options.forEach(opt => opt.setAttribute('aria-checked', 'false'));
            option.setAttribute('aria-checked', 'true');
            hiddenInput.value = option.dataset.value;
        });
    });
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initCalendar();
    initGallery();
    initScrollAnimations();
    initLightbox();
    initRSVPForm();
    initGuestLimit();
    initParallax();
    initCopyButtons();
    initAttendanceChoice();



    console.log('Ofelia & David Wedding Invitation - Optimized ✅');
});
