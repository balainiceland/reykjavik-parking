/**
 * Krage - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {

    // =========================================================================
    // FAQ Accordion
    // =========================================================================
    const faqItems = document.querySelectorAll('.krage-faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.krage-faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                // Close all others
                faqItems.forEach(i => i.classList.remove('active'));
                // Toggle current
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

    // =========================================================================
    // Product Accordion
    // =========================================================================
    const accordionItems = document.querySelectorAll('.krage-accordion-item');
    accordionItems.forEach(item => {
        const header = item.querySelector('.krage-accordion-header');
        if (header) {
            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                // Close all others
                accordionItems.forEach(i => i.classList.remove('active'));
                // Toggle current
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

    // =========================================================================
    // Quantity Buttons
    // =========================================================================
    const qtyBtns = document.querySelectorAll('.krage-qty-btn');
    const qtyInput = document.getElementById('krage-qty');

    qtyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!qtyInput) return;
            let value = parseInt(qtyInput.value) || 1;
            const action = btn.dataset.action;

            if (action === 'increase') {
                value = Math.min(value + 1, 99);
            } else if (action === 'decrease') {
                value = Math.max(value - 1, 1);
            }

            qtyInput.value = value;

            // Update Snipcart button quantity if exists
            const addToCartBtn = document.querySelector('.snipcart-add-item');
            if (addToCartBtn) {
                addToCartBtn.dataset.itemQuantity = value;
            }
        });
    });

    // =========================================================================
    // Product Thumbnail Gallery
    // =========================================================================
    const thumbs = document.querySelectorAll('.krage-thumb');
    const mainImg = document.getElementById('krage-main-img');

    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            if (!mainImg) return;
            // Update main image
            mainImg.src = thumb.src;
            mainImg.alt = thumb.alt;
            // Update active state
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });

    // =========================================================================
    // Contact Form
    // =========================================================================
    const contactForm = document.getElementById('krage-contact-form');
    const formStatus = document.getElementById('krage-form-status');

    if (contactForm && typeof krageAjax !== 'undefined') {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);
            formData.append('action', 'krage_contact');
            formData.append('nonce', krageAjax.nonce);

            fetch(krageAjax.ajaxurl, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    formStatus.textContent = data.data.message;
                    formStatus.className = 'krage-form-status success';
                    contactForm.reset();
                } else {
                    formStatus.textContent = data.data.message || 'An error occurred.';
                    formStatus.className = 'krage-form-status error';
                }
            })
            .catch(() => {
                formStatus.textContent = 'An error occurred. Please try again.';
                formStatus.className = 'krage-form-status error';
            })
            .finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    // =========================================================================
    // Smooth Scroll for anchor links
    // =========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

});
