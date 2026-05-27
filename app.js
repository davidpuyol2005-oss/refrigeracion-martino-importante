document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Header Scroll Effect
    const header = document.querySelector('.main-header');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger initially

    // 3. Mobile Navigation Menu Toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const isOpen = navMenu.classList.contains('open');
            
            // Toggle icon
            mobileToggle.innerHTML = isOpen 
                ? '<i data-lucide="x" id="menuIcon"></i>' 
                : '<i data-lucide="menu" id="menuIcon"></i>';
            
            lucide.createIcons({
                attrs: {
                    id: 'menuIcon'
                }
            });
        });

        // Close menu when clicking link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                mobileToggle.innerHTML = '<i data-lucide="menu" id="menuIcon"></i>';
                lucide.createIcons({
                    attrs: {
                        id: 'menuIcon'
                    }
                });
            });
        });
    }

    // 4. Active Link Highlighting on Scroll
    const sections = document.querySelectorAll('section[id]');
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                document.querySelectorAll('.nav-link, .quick-nav-item').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.25,
        rootMargin: '-80px 0px 0px 0px' // adjust for header height
    });

    sections.forEach(section => scrollObserver.observe(section));

    // 5. Stats Count Animation
    const stats = document.querySelectorAll('.stat-num');
    const startCounting = (stat) => {
        const target = parseFloat(stat.getAttribute('data-target'));
        const isDecimal = stat.textContent.includes('.') || stat.nextElementSibling?.classList.contains('stat-plus') && stat.nextElementSibling.textContent.includes('.');
        const duration = 1500; // 1.5 seconds animation
        const stepTime = 30;
        const steps = duration / stepTime;
        const stepVal = target / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += stepVal;
            if (current >= target) {
                stat.textContent = target;
                clearInterval(timer);
            } else {
                stat.textContent = current.toFixed(isDecimal ? 1 : 0);
            }
        }, stepTime);
    };

    const statsSection = document.querySelector('.stats-grid');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    stats.forEach(stat => startCounting(stat));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statsObserver.observe(statsSection);
    }

    // Reusable WhatsApp Redirect & Success Overlay Flow
    const successOverlay = document.getElementById('successOverlay');
    const btnOpenWaManual = document.getElementById('btn-open-wa-manual');
    const btnCopyWa = document.getElementById('btn-copy-wa');
    const btnCloseSuccess = document.getElementById('btn-close-success');

    const handleSuccessFlow = (whatsappText, whatsappUrl, btnSubmit, originalContent, resetCallback) => {
        if (!successOverlay) return;

        // Configure manual link
        if (btnOpenWaManual) {
            btnOpenWaManual.href = whatsappUrl;
        }

        // Configure copy button
        if (btnCopyWa) {
            btnCopyWa.onclick = (event) => {
                event.preventDefault();
                navigator.clipboard.writeText(whatsappText).then(() => {
                    const originalCopyContent = btnCopyWa.innerHTML;
                    btnCopyWa.innerHTML = '<i data-lucide="check"></i> <span>¡Copiado!</span>';
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                    setTimeout(() => {
                        btnCopyWa.innerHTML = originalCopyContent;
                        if (typeof lucide !== 'undefined') {
                            lucide.createIcons();
                        }
                    }, 2500);
                }).catch(err => {
                    console.error('Error al copiar texto: ', err);
                });
            };
        }

        // Show spinner inside the clicked submit button
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = `
                <span>Abriendo WhatsApp...</span>
                <i data-lucide="loader-2" class="animate-spin"></i>
            `;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons({ attrs: { class: 'animate-spin' } });
            }
        }

        setTimeout(() => {
            // Show success modal overlay
            successOverlay.classList.add('show');
            
            // Open WhatsApp in new tab
            window.open(whatsappUrl, '_blank');
            
            // Reset submit button
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = originalContent;
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
            
            // Execute reset callback if present
            if (resetCallback) {
                resetCallback();
            }
        }, 1200);
    };

    // 6. Dynamic Calculator Logic
    const calcForm = document.getElementById('quoteCalculator');
    
    if (calcForm) {
        const handleCalculatorChange = () => {
            const serviceRadio = calcForm.querySelector('input[name="calc-service"]:checked');
            const serviceType = serviceRadio ? serviceRadio.value : 'instalacion';
            
            // Show or hide step 3 depending on installation selection
            const montajeGroup = document.getElementById('montaje-group');
            if (montajeGroup) {
                montajeGroup.style.display = (serviceType === 'instalacion') ? 'block' : 'none';
            }
        };

        // Listen for changes
        calcForm.addEventListener('change', handleCalculatorChange);
        handleCalculatorChange(); // Initial run

        // Button Action: Redirect to WhatsApp using Success Flow
        const btnSubmitQuote = document.getElementById('btn-submit-quote');
        if (btnSubmitQuote) {
            btnSubmitQuote.addEventListener('click', () => {
                const serviceRadio = calcForm.querySelector('input[name="calc-service"]:checked');
                const serviceName = serviceRadio ? serviceRadio.parentElement.querySelector('.tile-title').textContent : 'Instalación';
                
                const equipSelect = document.getElementById('calc-equip');
                const equipName = equipSelect ? equipSelect.options[equipSelect.selectedIndex].text : '';
                
                const serviceType = serviceRadio ? serviceRadio.value : 'instalacion';
                const urgencyRadio = calcForm.querySelector('input[name="calc-urgency"]:checked');
                const urgencyName = (serviceType === 'instalacion' && urgencyRadio) ? urgencyRadio.parentElement.querySelector('.priority-label').textContent : 'Instalación Básica';

                const whatsappText = `Hola Martino, me interesa un presupuesto/turno para:\n- Servicio: ${serviceName}\n- Equipo: ${equipName}\n${serviceType === 'instalacion' ? `- Tipo de Montaje: ${urgencyName}\n` : ''}¿Me podrían presupuestar este trabajo y confirmar disponibilidad?`;
                const whatsappUrl = `https://wa.me/5493541527417?text=${encodeURIComponent(whatsappText)}`;

                const originalContent = btnSubmitQuote.innerHTML;
                handleSuccessFlow(whatsappText, whatsappUrl, btnSubmitQuote, originalContent, () => {
                    // Reset and refresh state
                    calcForm.reset();
                    handleCalculatorChange();
                });
            });
        }
    }

    // 7. Contact Form Submission (WhatsApp Redirect & Fallbacks)
    const contactForm = document.getElementById('contactForm');

    if (contactForm && successOverlay) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const serviceSelect = document.getElementById('service-type');
            const serviceLabel = serviceSelect.options[serviceSelect.selectedIndex].text;
            const message = document.getElementById('message').value;

            // Formulate WhatsApp message text
            const whatsappText = `Hola Refrigeración Martino, mi nombre es *${name}* (${phone}).\n\nEstoy interesado en:\n*${serviceLabel}*\n\nDetalles de mi consulta:\n_${message}_`;
            const encodedText = encodeURIComponent(whatsappText);
            const whatsappUrl = `https://wa.me/5493541527417?text=${encodedText}`;

            const btnSubmit = contactForm.querySelector('button[type="submit"]');
            const originalContent = btnSubmit.innerHTML;
            
            handleSuccessFlow(whatsappText, whatsappUrl, btnSubmit, originalContent, () => {
                contactForm.reset();
            });
        });
    }

    if (btnCloseSuccess && successOverlay) {
        btnCloseSuccess.addEventListener('click', () => {
            successOverlay.classList.remove('show');
        });
    }

    // 8. Theme Toggle (Light / Dark Mode)
    const themeToggleBtn = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme');
    
    // Set initial theme on load
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            
            // Save preference
            if (document.body.classList.contains('light-theme')) {
                localStorage.setItem('theme', 'light');
            } else {
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // 9. FAQ Accordion Functionality
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            const isActive = item.classList.contains('active');
            
            // Close all items
            document.querySelectorAll('.accordion-item').forEach(accItem => {
                accItem.classList.remove('active');
                const accContent = accItem.querySelector('.accordion-content');
                if (accContent) {
                    accContent.style.maxHeight = null;
                }
            });
            
            // Toggle active state
            if (!isActive) {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    // 10. Reviews Carousel Functionality
    const track = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const indicatorsContainer = document.getElementById('carouselIndicators');
    
    if (track && prevBtn && nextBtn && indicatorsContainer) {
        const cards = Array.from(track.children);
        let currentIndex = 0;
        
        // Create indicators
        indicatorsContainer.innerHTML = '';
        cards.forEach((_, idx) => {
            const dot = document.createElement('span');
            dot.classList.add('indicator');
            if (idx === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                goToSlide(idx);
            });
            indicatorsContainer.appendChild(dot);
        });
        
        const indicators = Array.from(indicatorsContainer.children);
        
        const updateSlider = () => {
            const cardWidth = cards[0].getBoundingClientRect().width;
            const style = window.getComputedStyle(track);
            const gap = parseFloat(style.gap) || 30;
            
            // Determine how many slides are visible at once
            const visibleSlides = window.innerWidth > 1024 ? 2 : 1;
            const maxIndex = cards.length - visibleSlides;
            
            // Clamp currentIndex
            if (currentIndex > maxIndex) currentIndex = maxIndex;
            if (currentIndex < 0) currentIndex = 0;
            
            const amountToMove = currentIndex * (cardWidth + gap);
            track.style.transform = `translateX(-${amountToMove}px)`;
            
            // Enable/disable navigation buttons
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex === maxIndex;
            
            // Update indicators
            indicators.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
                // Hide dots that exceed maxIndex
                if (idx > maxIndex) {
                    dot.style.display = 'none';
                } else {
                    dot.style.display = 'inline-block';
                }
            });
        };
        
        const goToSlide = (index) => {
            currentIndex = index;
            updateSlider();
        };
        
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            const visibleSlides = window.innerWidth > 1024 ? 2 : 1;
            if (currentIndex < cards.length - visibleSlides) {
                currentIndex++;
                updateSlider();
            }
        });
        
        // Resize listener
        window.addEventListener('resize', updateSlider);
        
        // Initial setup
        setTimeout(updateSlider, 200);
    }
});

