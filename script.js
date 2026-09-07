// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('.nav');
const stayForm = document.getElementById('stayForm');
const eventsForm = document.getElementById('eventsForm');
const successModal = document.getElementById('successModal');
const eventCheckboxes = document.querySelectorAll('input[name="eventType"]');
const countDisplay = document.querySelector('.count');

/* ==================================================================
   CONFIG - edit these two values to receive your enquiries
   ------------------------------------------------------------------
   WHATSAPP_NUMBER : WhatsApp number (country code + number, digits only,
                     no + or spaces). Enquiries open WhatsApp to this number.
   OWNER_EMAIL     : Email address to receive enquiry details. Uses the free
                     FormSubmit.co service (first submission triggers a
                     confirmation email - click it once to activate).
   ================================================================== */
const WHATSAPP_NUMBER = '917981275247';
const OWNER_EMAIL = 'svanik.thirandasu@gmail.com';

// Translate a UI string through the I18N engine (translations.js)
function tr(key, vars) {
    if (window.I18N && typeof I18N.t === 'function') return I18N.t(key, vars);
    return key || '';
}

// Enable CSS scroll-reveal animations only when JS is running
document.documentElement.classList.add('js-anim');
function revealAll() {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
}

// Navigation - reusable tab switcher
function switchTab(tabId) {
    // Update active nav link
    navLinks.forEach(navLink => navLink.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Show target section
    sections.forEach(section => section.classList.remove('active'));
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');

    // Close mobile nav
    nav.classList.remove('active');

    // Scroll to top instantly
    window.scrollTo(0, 0);
    revealAll();
}

document.querySelectorAll('[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = link.getAttribute('data-tab');
        switchTab(tabId);
    });
});

// WhatsApp float button - always use the configured number
const whatsappFloat = document.querySelector('.whatsapp-float');
if (whatsappFloat) {
    whatsappFloat.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' +
        encodeURIComponent('Hi, I would like to book a stay at the Farmhouse.');
}

// Contact Us - scroll to footer contact block
const contactUsLink = document.getElementById('contactUsLink');
if (contactUsLink) {
    contactUsLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById('footer-contact');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

// Mobile Navigation
hamburger.addEventListener('click', () => {
    nav.classList.toggle('active');
});

// Close mobile nav when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove('active');
    }
});

// Event Type Checkbox Counter
eventCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateEventCount);
});

function updateEventCount() {
    const checked = document.querySelectorAll('input[name="eventType"]:checked').length;
    if (countDisplay) {
        countDisplay.textContent = `(${checked}/4)`;
    }
}

// Date Validation - Set minimum dates
function setMinDates() {
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    
    dateInputs.forEach(input => {
        input.setAttribute('min', today);
    });
    
    // Set checkout min date based on checkin
    const checkinInputs = document.querySelectorAll('input[name="checkin"]');
    checkinInputs.forEach(checkin => {
        checkin.addEventListener('change', function() {
            const checkout = this.closest('.form-row, .form-card').querySelector('input[name="checkout"]');
            if (checkout) {
                const nextDay = new Date(this.value);
                nextDay.setDate(nextDay.getDate() + 1);
                checkout.setAttribute('min', nextDay.toISOString().split('T')[0]);
            }
        });
    });
}

setMinDates();

// Form Validation
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        const formGroup = field.closest('.form-group');
        const isFile = field.type === 'file';
        
        if (isFile) {
            if (!field.files || field.files.length === 0) {
                formGroup.classList.add('error');
                isValid = false;
            } else {
                formGroup.classList.remove('error');
            }
        } else if (!field.value.trim()) {
            formGroup.classList.add('error');
            isValid = false;
        } else {
            formGroup.classList.remove('error');
        }
    });
    
    // Validate email
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            emailField.closest('.form-group').classList.add('error');
            isValid = false;
        }
    }
    
    // Validate phone
    const phoneField = form.querySelector('input[type="tel"]');
    if (phoneField && phoneField.value) {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phoneField.value.replace(/\D/g, ''))) {
            phoneField.closest('.form-group').classList.add('error');
            isValid = false;
        }
    }
    
    // Validate time pair
    const checkinTime = form.querySelector('input[name="checkinTime"]');
    const checkoutTime = form.querySelector('input[name="checkoutTime"]');
    if (checkinTime && checkoutTime && checkinTime.value && checkoutTime.value) {
        if (checkoutTime.value <= checkinTime.value) {
            checkoutTime.closest('.form-group').classList.add('error');
            isValid = false;
            checkoutTime.closest('.form-group').querySelector('.error-message').textContent =
                'Check-out time must be after check-in time';
        }
    }
    
    return isValid;
}

// File upload handling
document.querySelectorAll('.file-upload input[type="file"]').forEach(input => {
    input.addEventListener('change', function() {
        const wrapper = this.closest('.file-upload');
        const formGroup = this.closest('.form-group');
        
        if (this.files && this.files.length > 0) {
            const file = this.files[0];
            const maxSize = 5 * 1024 * 1024; // 5MB
            const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            
            if (file.size > maxSize) {
                showNotification(tr('notif.fileSize'), 'warning');
                this.value = '';
                wrapper.classList.remove('has-file');
                formGroup.classList.add('error');
                return;
            }
            
            if (!validTypes.includes(file.type)) {
                showNotification(tr('notif.fileType'), 'warning');
                this.value = '';
                wrapper.classList.remove('has-file');
                formGroup.classList.add('error');
                return;
            }
            
            // Show selected file name
            let nameEl = wrapper.querySelector('.file-upload-name');
            if (!nameEl) {
                nameEl = document.createElement('span');
                nameEl.className = 'file-upload-name';
                wrapper.querySelector('.file-upload-label').appendChild(nameEl);
            }
            nameEl.textContent = '✓ ' + file.name;
            
            wrapper.classList.add('has-file');
            formGroup.classList.remove('error');
        } else {
            wrapper.classList.remove('has-file');
            const nameEl = wrapper.querySelector('.file-upload-name');
            if (nameEl) nameEl.remove();
        }
    });
});

// Stay Form Submission
stayForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (validateForm(stayForm)) {
        deliverEnquiry(stayForm, 'stay');
        showSuccessModal();
        stayForm.reset();
    }
});

// Events Form Submission
eventsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Check if at least one event type is selected
    const checkedEvents = document.querySelectorAll('input[name="eventType"]:checked');
    if (checkedEvents.length === 0) {
        alert(tr('err.eventType'));
        return;
    }
    
    if (validateForm(eventsForm)) {
        deliverEnquiry(eventsForm, 'events');
        showSuccessModal();
        eventsForm.reset();
        updateEventCount();
    }
});

// Build a readable enquiry message from the form
function buildEnquiryMessage(form, type) {
    const fd = new FormData(form);
    const lines = [];
    lines.push('*' + (type === 'stay' ? 'NEW STAY ENQUIRY' : 'NEW EVENT BOOKING') + '*');
    lines.push('');

    if (type === 'events') {
        const pkg = fd.get('package');
        if (pkg) lines.push('Package: ' + pkg);
        const events = Array.from(form.querySelectorAll('input[name="eventType"]:checked')).map(cb => {
            const labels = { wedding: 'Wedding/Pre-wedding', corporate: 'Corporate Retreat / Offsite', spiritual: 'Spiritual / Cultural Gathering', private: 'Private Celebration' };
            return labels[cb.value] || cb.value;
        });
        if (events.length) lines.push('Event Type: ' + events.join(', '));
        const rooms = fd.get('rooms');
        if (rooms) lines.push('Stay-back Rooms: ' + rooms);
    }

    lines.push('Name: ' + (fd.get('fullName') || '-'));
    lines.push('Phone: ' + (fd.get('phone') || '-'));
    lines.push('Email: ' + (fd.get('email') || '-'));
    lines.push('Guests: ' + (fd.get('guests') || '-'));

    const checkin = fd.get('checkin');
    if (checkin) lines.push('Check-in: ' + checkin + ' ' + (fd.get('checkinTime') || ''));
    const checkout = fd.get('checkout');
    if (checkout) lines.push('Check-out: ' + checkout + ' ' + (fd.get('checkoutTime') || ''));

    const slot = fd.get('timeSlot');
    if (slot) {
        const labels = { morning: 'Morning (9 AM - 12 PM)', afternoon: 'Afternoon (12 PM - 4 PM)', evening: 'Evening (4 PM - 8 PM)', night: 'Night Stay (8 PM - 8 AM)', fullday: 'Full Day (11 AM - 11 AM next day)' };
        lines.push('Time Slot: ' + (labels[slot] || slot));
    }

    const file = fd.get('aadhar');
    if (file && file.name) lines.push('Aadhar uploaded: ' + file.name);

    return lines.join('\n');
}

// Deliver the enquiry to WhatsApp and the owner email
function deliverEnquiry(form, type) {
    const text = buildEnquiryMessage(form, type);

    // 1) WhatsApp - opens with the enquiry pre-filled
    try {
        window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank');
    } catch (err) { /* popup blocked - user gesture should allow it */ }

    // 2) Email - FormSubmit.co AJAX endpoint (sends the filled form incl. Aadhar attachment)
    const fd = new FormData(form);
    fd.append('_subject', (type === 'stay' ? 'Stay Enquiry - FarmHouse' : 'Event Booking - FarmHouse') + ' (' + new Date().toLocaleString() + ')');
    if (OWNER_EMAIL) {
        fetch('https://formsubmit.co/ajax/' + OWNER_EMAIL, { method: 'POST', body: fd })
            .then(r => r.json())
            .then(data => {
                if (data && data.success === 'false') console.warn('FormSubmit delivery failed:', data.message);
            })
            .catch(err => console.warn('Email delivery failed:', err));
    }
}

// Show Success Modal
function showSuccessModal() {
    successModal.classList.add('active');
    lockScroll();
}

// Close Modal
function closeModal() {
    successModal.classList.remove('active');
    unlockScroll();
}

// Scroll lock helpers (compensate scrollbar so page doesn't jump)
let scrollbarWidth = 0;
function lockScroll() {
    if (window.innerWidth > document.documentElement.clientWidth) {
        scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    }
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
        document.body.style.paddingRight = scrollbarWidth + 'px';
    }
}

function unlockScroll() {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

// Close modal on outside click
successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
        closeModal();
    }
});

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && successModal.classList.contains('active')) {
        closeModal();
    }
});

// Phone number formatting
document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        e.target.value = value;
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add active class to nav on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.section');
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-tab') === current) {
            link.classList.add('active');
        }
    });
});

// Lazy load images (for future use)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    lazyLoadImages();
    
    // Add loading animation
    document.body.classList.add('loaded');
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Online/Offline detection
window.addEventListener('online', () => {
    showNotification(tr('notif.online'), 'success');
});

window.addEventListener('offline', () => {
    showNotification(tr('notif.offline'), 'warning');
});

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Add notification styles dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 15px;
        animation: slideUp 0.3s ease;
    }
    
    .notification-success { background: #28a745; }
    .notification-warning { background: #ffc107; color: #333; }
    .notification-info { background: #17a2b8; }
    .notification-error { background: #dc3545; }
    
    .notification button {
        background: none;
        border: none;
        color: inherit;
        font-size: 1.2rem;
        cursor: pointer;
    }
    
    @keyframes slideUp {
        from { transform: translate(-50%, 100px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
`;
document.head.appendChild(notificationStyles);

// Export functions for global use
window.closeModal = closeModal;
window.showNotification = showNotification;

/* ============================= */
/* Gallery Carousel */
/* ============================= */
const gallerySlides = document.querySelectorAll('.gallery-slides .slide');
const galleryThumbs = document.querySelectorAll('.gallery-thumbs .thumb');
const galleryPrev = document.querySelector('.gallery-prev');
const galleryNext = document.querySelector('.gallery-next');
const galleryCounter = document.querySelector('.gallery-counter');
const totalSlides = gallerySlides.length;
let currentSlide = 0;

function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    
    // Pause video if leaving video slide
    const activeVideo = document.querySelector('.slide.active video');
    if (activeVideo) {
        activeVideo.pause();
    }
    
    currentSlide = index;
    
    gallerySlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentSlide);
    });
    
    galleryThumbs.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === currentSlide);
    });
    
    galleryCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;
}

galleryNext.addEventListener('click', () => goToSlide(currentSlide + 1));
galleryPrev.addEventListener('click', () => goToSlide(currentSlide - 1));

galleryThumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
        goToSlide(parseInt(thumb.dataset.index));
    });
});

// Auto-advance slides every 5s (pause on hover)
let autoSlide;
function startAutoSlide() {
    stopAutoSlide();
    autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5000);
}
function stopAutoSlide() {
    clearInterval(autoSlide);
}
const galleryMain = document.querySelector('.gallery-main');
if (galleryMain) {
    galleryMain.addEventListener('mouseenter', stopAutoSlide);
    galleryMain.addEventListener('mouseleave', startAutoSlide);
    galleryMain.addEventListener('touchstart', stopAutoSlide);
    galleryMain.addEventListener('touchend', () => setTimeout(startAutoSlide, 5000));
    startAutoSlide();
}

// Keyboard navigation for gallery (guard against typing in inputs)
document.addEventListener('keydown', (e) => {
    if (document.querySelector('.lightbox.open')) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (['input', 'textarea', 'select'].includes(tag)) return;
    if (!document.querySelector('.section.active')) return;
    if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
    if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
});

// Swipe support for gallery
let touchStartX = 0;
let touchEndX = 0;
if (galleryMain) {
    galleryMain.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    galleryMain.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
}
function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
        if (diff > 0) goToSlide(currentSlide + 1);
        else goToSlide(currentSlide - 1);
    }
}

/* ============================= */
/* Lightbox */
/* ============================= */
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxVideo = document.getElementById('lightboxVideo');
const lightboxCaption = document.querySelector('.lightbox-caption');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');
const galleryBadge = document.querySelector('.gallery-badge');

const imageData = [
    { src: 'images/exterior.jpg', caption: 'Exterior View - Serenity Farmhouse' },
    { src: 'images/pool.jpg', caption: 'Private Swimming Pool' },
    { src: 'images/garden.jpg', caption: 'Lush Green Garden' },
    { src: 'images/bedroom.jpg', caption: 'Master Bedroom' },
    { src: 'images/living.jpg', caption: 'Spacious Living Room' },
    { src: 'images/bbq.jpg', caption: 'BBQ & Fire Pit Area' },
    { src: 'images/kitchen.jpg', caption: 'Farmhouse Kitchen' },
    { src: 'video/farmhouse-tour.mp4', caption: 'Farmhouse Tour Video', isVideo: true }
];
let lightboxIndex = 0;

function openLightbox(index = 0) {
    lightboxIndex = index;
    updateLightbox();
    lightbox.classList.add('open');
    lockScroll();
    stopAutoSlide();
}

function closeLightbox() {
    lightbox.classList.remove('open');
    unlockScroll();
    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    lightboxVideo.load();
    startAutoSlide();
}

function updateLightbox() {
    const item = imageData[lightboxIndex];
    if (item.isVideo) {
        lightboxImage.style.display = 'none';
        lightboxVideo.style.display = 'block';
        lightboxVideo.src = item.src;
        lightboxVideo.load();
    } else {
        lightboxVideo.style.display = 'none';
        lightboxVideo.pause();
        lightboxImage.style.display = 'block';
        lightboxImage.src = item.src;
    }
    lightboxCaption.textContent = item.caption;
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => {
    lightboxIndex = (lightboxIndex - 1 + imageData.length) % imageData.length;
    updateLightbox();
});
lightboxNext.addEventListener('click', () => {
    lightboxIndex = (lightboxIndex + 1) % imageData.length;
    updateLightbox();
});

galleryBadge.addEventListener('click', () => openLightbox(currentSlide));

// Lightbox keyboard nav
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') lightboxNext.click();
    if (e.key === 'ArrowLeft') lightboxPrev.click();
});

// Close on backdrop click
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});

// Close on bottom and top nav buttons for tab jumping
document.querySelectorAll('.btn-hero').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const tab = btn.dataset.tabJump || 'book-stay';
        switchTab(tab);
        // Scroll to the booking form card inside the section
        const targetSection = document.getElementById(tab);
        const form = targetSection.querySelector('.form-card');
        setTimeout(() => {
            revealAll();
            if (form) {
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo(0, 0);
            }
        }, 60);
    });
});

/* ============================= */
/* Availability Calendar */
/* ============================= */
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Sample booked/offer data (relative to current month)
let calendarDate = new Date();
calendarDate.setDate(1);

// Generate pseudo-random availability for demo
function getDayStatus(day) {
    const t = day * 37 % 11;
    if (t === 3 || t === 8) return 'booked';
    if (day === 15 || day === 25) return 'offer';
    return 'available';
}

function renderCalendar() {
    const container = document.getElementById('availabilityCalendar');
    if (!container) return;
    
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayStr = today.toDateString();
    const mn = (window.I18N) ? I18N.t('cal.m' + (month + 1)) : monthNames[month];
    const dn = (i) => (window.I18N) ? I18N.t('cal.d' + i) : dayNames[i];
    
    let html = `
        <div class="calendar-header">
            <button class="cal-nav" data-nav="-1"><i class="fas fa-chevron-left"></i></button>
            <span class="cal-month">${mn} ${year}</span>
            <button class="cal-nav" data-nav="1"><i class="fas fa-chevron-right"></i></button>
        </div>
        <div class="cal-grid">
    `;
    
    dayNames.forEach((d, i) => { html += `<span class="cal-weekday">${dn(i)}</span>`; });
    
    // Empty cells for first day
    for (let i = 0; i < firstDay; i++) {
        html += `<span class="cal-day blank"></span>`;
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const isToday = d.toDateString() === todayStr;
        const status = getDayStatus(day);
        
        let cls = 'cal-day';
        if (isPast) {
            cls += ' disabled';
        } else {
            cls += ` dot-${status}`;
        }
        if (isToday) cls += ' today';
        
        const label = (status === 'offer' && !isPast) ? 'OFF' : '';
        html += `
            <span class="${cls}" data-day="${day}" data-month="${month}" data-year="${year}">
                ${day}
                ${label ? `<small class="day-offer-label">${label}</small>` : ''}
            </span>
        `;
    }
    
    html += `</div>`;
    container.innerHTML = html;
    
    // Calendar nav buttons
    container.querySelectorAll('.cal-nav').forEach(btn => {
        btn.addEventListener('click', () => {
            calendarDate.setMonth(calendarDate.getMonth() + parseInt(btn.dataset.nav));
            renderCalendar();
        });
    });
    
    // Day click - only allow available dates
    container.querySelectorAll('.cal-day:not(.disabled):not(.blank)').forEach(dayEl => {
        dayEl.addEventListener('click', () => {
            if (dayEl.classList.contains('dot-booked')) return;
            if (dayEl.classList.contains('dot-selected')) {
                dayEl.classList.remove('dot-selected');
                container.querySelectorAll('.cal-day.dot-selected').forEach(el => el.classList.remove('dot-selected'));
                return;
            }
            // Single selection mode
            container.querySelectorAll('.cal-day.dot-selected').forEach(el => el.classList.remove('dot-selected'));
            dayEl.classList.add('dot-selected');
            
            // Optionally sync to check-in field
            const day = dayEl.dataset.day;
            const month = dayEl.dataset.month;
            const year = dayEl.dataset.year;
            const dateStr = `${year}-${String(Number(month) + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const checkin = document.querySelector('#stayForm input[name="checkin"]');
            if (checkin) {
                checkin.value = dateStr;
                // Auto set checkout to next day
                const nextDay = new Date(year, month, day + 1);
                const checkout = document.querySelector('#stayForm input[name="checkout"]');
                if (checkout) {
                    checkout.value = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
                }
                showNotification(tr('notif.slotSelected', { date: `${day}-${String(Number(month) + 1).padStart(2, '0')}-${year}` }), 'success');
            }
        });
    });
}

renderCalendar();

// Status tabs just change active (visual)
document.querySelectorAll('.status-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        showNotification(tr('notif.showing', { status: tr('cal.' + tab.dataset.status) }), 'info');
        // Re-render with different data could be added here
    });
});

/* ============================= */
/* Load More Reviews */
/* ============================= */
let showAllReviews = false;
const loadMoreBtn = document.getElementById('loadMoreReviews');

function appendMoreReviews() {
    const reviewCards = document.querySelector('.review-cards');
    const templates = [
        {
            avatar: 'SN', name: 'Sneha Nair', stars: '⭐️⭐️⭐️⭐️⭐️',
            date: 'March 2026', text: 'Beautiful property with great attention to detail. The pool area is Instagram-worthy!', tags: 'Weekend, Couple'
        },
        {
            avatar: 'VAR', name: 'Vikram Reddy', stars: '⭐️⭐️⭐️⭐️',
            date: 'February 2026', text: 'Good for large groups. The bonfire setup was perfect for our friends reunion.', tags: 'Friends, Bonfire'
        },
        {
            avatar: 'DJ', name: 'Deepika Jose', stars: '⭐️⭐️⭐️⭐️⭐️',
            date: 'January 2026', text: 'Hosted my birthday party here - the team decorated beautifully and the food was excellent!', tags: 'Birthday, Party'
        }
    ];

    templates.forEach(t => {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.style.animation = 'fadeIn 0.5s ease';
        card.innerHTML = `
            <div class="review-avatar">${t.avatar}</div>
            <div class="review-top">
                <span class="reviewer-name">${t.name}</span>
                <span class="review-stars">${t.stars}</span>
            </div>
            <span class="review-date"><i class="fas fa-calendar-alt"></i> ${t.date}</span>
            <p>${t.text}</p>
            <div class="review-tags"><span>${t.tags}</span></div>
        `;
        reviewCards.appendChild(card);
    });

    return templates.length;
}

function markReviewsLoaded() {
    if (loadMoreBtn) {
        loadMoreBtn.innerHTML = '<i class="fas fa-check"></i> ' + tr('rev.loaded');
        loadMoreBtn.disabled = true;
        loadMoreBtn.style.opacity = '0.5';
    }
}

if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        appendMoreReviews();
        showAllReviews = true;
        markReviewsLoaded();
    });
}

// "See all 128 reviews" link - loads all remaining reviews
document.querySelectorAll('.see-all-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        if (!showAllReviews) {
            appendMoreReviews();
            showAllReviews = true;
            markReviewsLoaded();
        }
    });
});

/* ============================= */
/* Budget Package Selection */
/* ============================= */
document.querySelectorAll('.budget-select').forEach(btn => {
    btn.addEventListener('click', () => {
        const pkg = btn.dataset.package;
        // Pre-fill event form or show notification
        eventCheckboxes.forEach(cb => {
            if (pkg === 'Veg' && cb.value === 'private') cb.checked = true;
            if (pkg === 'Non-Veg' && cb.value === 'private') cb.checked = true;
            if (pkg === 'Premium' && cb.value === 'private') cb.checked = true;
        });
        updateEventCount();

        // Show the selected package in the events form
        const pkgKey = { Veg: 'pkg.vegName', 'Non-Veg': 'pkg.nonvegName', Premium: 'pkg.premName' }[pkg] || null;
        const pkgPrice = { Veg: '₹350', 'Non-Veg': '₹500', Premium: '₹800' }[pkg] || '';
        const pkgLabel = pkgKey ? tr(pkgKey) + ' (' + pkgPrice + tr('pkg.perPerson') + ')' : pkg;
        const selectedBanner = document.getElementById('selectedPackage');
        const selectedName = document.getElementById('selectedPackageName');
        const packageField = document.getElementById('packageField');
        if (selectedBanner && selectedName) {
            selectedName.textContent = pkgLabel + ' ' + tr('pkg.selected');
            selectedBanner.style.display = 'flex';
        }
        if (packageField) packageField.value = pkg;

        // Navigate to events tab
        switchTab('events');

        // Scroll down to the event form so the details are visible
        const eventsFormCard = document.querySelector('#events .form-card');
        setTimeout(() => {
            if (eventsFormCard) {
                eventsFormCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 80);

        showNotification((pkgKey ? tr(pkgKey) : pkg) + ' ' + tr('pkg.selected') + '!', 'success');
    });
});

// Allow clearing the selected package
const clearPackageBtn = document.getElementById('clearSelectedPackage');
if (clearPackageBtn) {
    clearPackageBtn.addEventListener('click', () => {
        const selectedBanner = document.getElementById('selectedPackage');
        const packageField = document.getElementById('packageField');
        if (selectedBanner) selectedBanner.style.display = 'none';
        if (packageField) packageField.value = '';
    });
}

/* ============================= */
/* Hero Particle Animation (Canvas) */
/* ============================= */
const heroCanvas = document.getElementById('heroCanvas');
if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let particles = [];
    
    function resizeCanvas() {
        heroCanvas.width = window.innerWidth;
        heroCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    
    window.addEventListener('resize', resizeCanvas);
    
    // Reduced particle count for performance on mobile
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 40 : 80;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * innerWidth,
            y: Math.random() * innerHeight,
            radius: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.6,
            speedY: (Math.random() - 0.5) * 0.6,
            color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.5 + 0.3})`,
            twinkle: Math.random() * 0.02
        });
    }
    
    // Connect lines
    function drawParticles() {
        ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
        
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.twinkle += 0.01;
            
            // Wrap around edges
            if (p.x < 0) p.x = heroCanvas.width;
            if (p.x > heroCanvas.width) p.x = 0;
            if (p.y < 0) p.y = heroCanvas.height;
            if (p.y > heroCanvas.height) p.y = 0;
            
            // Draw particle with twinkle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            const alpha = 0.5 + Math.sin(p.twinkle) * 0.3;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
        });
        
        // Draw connecting lines
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - dist / 120)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(drawParticles);
    }
    
    drawParticles();
}

/* ============================= */
/* Scroll Reveal + Parallax */
/* ============================= */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Parallax effect on hero blobs (throttled)
let parallaxThrottled = false;
window.addEventListener('scroll', () => {
    if (parallaxThrottled) return;
    parallaxThrottled = true;
    requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        if (scrolled < window.innerHeight) {
            const blobs = document.querySelectorAll('.hero-blob');
            blobs.forEach((blob, i) => {
                const speed = 0.08 + (i * 0.04);
                blob.style.transform = `translateY(${scrolled * speed}px)`;
            });
        }
        parallaxThrottled = false;
    });
}, { passive: true });

// Prefers-reduced-motion support
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = 'auto';
    revealAll();
}

// Initialize gallery slide counter
if (gallerySlides.length > 0) {
    goToSlide(0);
}

/* ============================= */
/* Language Selection (i18n) */
/* ============================= */
if (window.I18N) {
    I18N.init();
    const langSelector = document.getElementById('langSelector');
    if (langSelector) {
        langSelector.addEventListener('change', () => {
            I18N.apply(langSelector.value);
        });
        // Reflect current label even if page re-renders
        document.addEventListener('i18n:changed', () => {
            langSelector.value = I18N.current;
        });
    }
}
