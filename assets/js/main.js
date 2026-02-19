// ========================================
// MOBILE NAVIGATION TOGGLE
// ========================================

const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');
const navContent = navMenu ? navMenu.closest('.nav-content') : null;

if (mobileToggle && navContent) {
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navContent.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if(mobileToggle) mobileToggle.classList.remove('active');
        if(navContent) navContent.classList.remove('active');
    });
});

// ========================================
// HERO SLIDER FUNCTIONALITY
// ========================================

const heroSlides = document.querySelectorAll('.hero-slide');
const heroPrevBtn = document.getElementById('heroPrev');
const heroNextBtn = document.getElementById('heroNext');
const heroIndicators = document.querySelectorAll('.hero-indicator');

if (heroSlides.length > 0 && heroPrevBtn && heroNextBtn) {
    let currentHeroSlide = 0;
    let heroAutoSlideInterval;

    function updateHeroSlide(index) {
        // Remove active class from all slides
        heroSlides.forEach(slide => slide.classList.remove('active'));
        heroIndicators.forEach(indicator => indicator.classList.remove('active'));

        // Add active class to current slide
        heroSlides[index].classList.add('active');
        if (heroIndicators[index]) {
            heroIndicators[index].classList.add('active');
        }

        currentHeroSlide = index;
    }

    function nextHeroSlide() {
        let nextSlide = (currentHeroSlide + 1) % heroSlides.length;
        updateHeroSlide(nextSlide);
    }

    function prevHeroSlide() {
        let prevSlide = (currentHeroSlide - 1 + heroSlides.length) % heroSlides.length;
        updateHeroSlide(prevSlide);
    }

    function startHeroAutoSlide() {
        heroAutoSlideInterval = setInterval(nextHeroSlide, 8000); // Change slide every 8 seconds
    }

    function stopHeroAutoSlide() {
        clearInterval(heroAutoSlideInterval);
    }

    // Button event listeners
    heroNextBtn.addEventListener('click', () => {
        stopHeroAutoSlide();
        nextHeroSlide();
        startHeroAutoSlide();
    });

    heroPrevBtn.addEventListener('click', () => {
        stopHeroAutoSlide();
        prevHeroSlide();
        startHeroAutoSlide();
    });

    // Indicator event listeners
    heroIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            stopHeroAutoSlide();
            updateHeroSlide(index);
            startHeroAutoSlide();
        });
    });

    // Pause auto-slide when page is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopHeroAutoSlide();
        } else {
            startHeroAutoSlide();
        }
    });

    // Start auto-slide
    startHeroAutoSlide();
}


// ========================================
// NAVBAR SCROLL EFFECT
// ========================================

const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (navbar) {
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    lastScroll = currentScroll;
});


// ========================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});


// ========================================
// INFINITE MEMBERSHIP CAROUSEL
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicators = document.querySelectorAll('.indicator');
    
    // If elements don't exist, stop here
    if (!track || !prevBtn || !nextBtn) return;

    // 1. Clone cards to create the illusion of infinity
    // We duplicate the entire list of cards and add them to the end
    const originalCards = Array.from(track.children);
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });

    const allCards = Array.from(track.children);
    let currentIndex = 0;
    const totalOriginal = originalCards.length;
    let autoSlideInterval;
    let isTransitioning = false;

    // 2. Get Gap and Width dynamically
    function getCardMetrics() {
        const card = allCards[0];
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.gap) || 0;
        const cardWidth = card.getBoundingClientRect().width;
        return { cardWidth, gap };
    }

    // 3. Move Carousel Function
    function moveCarousel(index, useTransition = true) {
        const { cardWidth, gap } = getCardMetrics();
        
        if (useTransition) {
            track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            isTransitioning = true;
        } else {
            track.style.transition = 'none';
            isTransitioning = false;
        }

        const amountToMove = (cardWidth + gap) * index;
        track.style.transform = `translateX(-${amountToMove}px)`;
        currentIndex = index;

        // Update indicators (based on modulo arithmetic for infinite loop)
        const realIndex = index % totalOriginal;
        indicators.forEach((ind, i) => {
            if (i === realIndex) ind.classList.add('active');
            else ind.classList.remove('active');
        });
    }

    // 4. Handle "Next" Click
    function handleNext() {
        if (isTransitioning) return;
        
        // Move to the next slide
        moveCarousel(currentIndex + 1);

        // INFINITE LOOP LOGIC:
        // If we have scrolled past the original set, wait for animation to end,
        // then instantly snap back to the start.
        if (currentIndex >= totalOriginal) {
            track.addEventListener('transitionend', () => {
                if (currentIndex >= totalOriginal) {
                     moveCarousel(currentIndex - totalOriginal, false);
                }
            }, { once: true });
        }
    }

    // 5. Handle "Prev" Click
    function handlePrev() {
        if (isTransitioning) return;

        if (currentIndex <= 0) {
            // If we are at the start, instantly jump to the cloned set at the end
            moveCarousel(totalOriginal, false);
            
            // Force a small delay to let the browser register the jump, then slide
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    moveCarousel(totalOriginal - 1);
                });
            });
        } else {
            moveCarousel(currentIndex - 1);
        }
    }

    // 6. Reset Transition Flag
    track.addEventListener('transitionend', () => {
        isTransitioning = false;
    });

    // 7. Auto Play Functionality
    function startAutoSlide() {
        stopAutoSlide(); 
        autoSlideInterval = setInterval(handleNext, 3000); // 3 seconds speed
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    // Event Listeners
    nextBtn.addEventListener('click', () => {
        stopAutoSlide();
        handleNext();
        startAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
        stopAutoSlide();
        handlePrev();
        startAutoSlide();
    });

    // Indicator clicks
    indicators.forEach((ind, i) => {
        ind.addEventListener('click', () => {
            stopAutoSlide();
            moveCarousel(i);
            startAutoSlide();
        });
    });

    // Pause on hover
    track.addEventListener('mouseenter', stopAutoSlide);
    track.addEventListener('mouseleave', startAutoSlide);

    // Handle Window Resize (Recalculate widths)
    window.addEventListener('resize', () => {
        // Reset to 0 to prevent alignment issues during resize
        moveCarousel(0, false);
    });

    // Initialize
    startAutoSlide();
});


// ========================================
// SCROLL TO TOP BUTTON
// ========================================

window.addEventListener('load', function() {
    const scrollToTopBtn = document.getElementById('scrollToTop');

    if (scrollToTopBtn) {
        // Show/hide button based on scroll position
        function toggleScrollButton() {
            if (window.pageYOffset > 50 || document.documentElement.scrollTop > 50) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        }

        // Call on scroll
        window.addEventListener('scroll', toggleScrollButton);
        
        // Call on page load in case already scrolled
        toggleScrollButton();
    }
});

// ========================================
// FAQ ACCORDION FUNCTIONALITY
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');

            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
});

// ========================================
// CONTACT FORM SUBMISSION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const formMessage = document.getElementById('formMessage');
            const originalBtnText = submitBtn.textContent;
            
            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            formMessage.style.display = 'none';
            
            try {
                // Get form data
                const formData = new FormData(contactForm);
                
                // Send form data to PHP script
                const response = await fetch('send-email.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                // Show message
                formMessage.style.display = 'block';
                
                if (result.success) {
                    formMessage.style.backgroundColor = '#d4edda';
                    formMessage.style.color = '#155724';
                    formMessage.style.border = '1px solid #c3e6cb';
                    formMessage.textContent = result.message;
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Scroll to message
                    formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    formMessage.style.backgroundColor = '#f8d7da';
                    formMessage.style.color = '#721c24';
                    formMessage.style.border = '1px solid #f5c6cb';
                    formMessage.textContent = result.message;
                }
                
            } catch (error) {
                console.error('Error:', error);
                formMessage.style.display = 'block';
                formMessage.style.backgroundColor = '#f8d7da';
                formMessage.style.color = '#721c24';
                formMessage.style.border = '1px solid #f5c6cb';
                formMessage.textContent = 'An error occurred. Please try again or contact us directly at info@bppa.co.bw';
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
});

// ========================================
// CONSOLE WELCOME MESSAGE
// ========================================

console.log(
    '%c🎉 Welcome to Connect Community Website! %c\n\n' +
    'Connect Community\n' +
    'Embedding Customer-Centric Culture\n\n' +
    'Developed with ❤️',
    'color: #0066b3; font-size: 20px; font-weight: bold;',
    'color: #64748b; font-size: 12px;'
);

// ========================================
// SEARCH FUNCTIONALITY
// ========================================

const searchToggle = document.getElementById('searchToggle');
const searchModal = document.getElementById('searchModal');
const searchClose = document.getElementById('searchClose');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// Website content database for search
const searchContent = [
    {
        title: 'Home',
        url: 'index.html',
        description: 'Connect Community - Building Customer-Centric Excellence in Southern Africa',
        keywords: 'home community customer management southern africa professional development'
    },
    {
        title: 'About Us',
        url: 'about.html',
        description: 'Southern Africa\'s premier network for customer management professionals. We empower customer excellence through structured CPD, industry certification, and community-driven growth.',
        keywords: 'about mission vision story CPD certification networking collaboration'
    },
    {
        title: 'Join Us - Membership',
        url: 'joinus.html',
        description: 'Invest in your team\'s professional growth with membership tiers designed for organizations of all sizes. Build customer excellence capabilities that drive lasting business impact.',
        keywords: 'join membership bronze silver gold platinum individual enterprise tiers pricing'
    },
    {
        title: 'Programs & Events',
        url: 'programs.html',
        description: 'Year-round CPD activities designed to elevate customer management expertise. Structured learning pathways, networking opportunities, and professional development through expert-led programs.',
        keywords: 'programs events workshops webinars masterclasses certification training learning'
    },
    {
        title: 'Learning Hub',
        url: 'learninghub.html',
        description: 'Expert resources to accelerate your customer management expertise. Access templates, research, case studies, toolkits, and exclusive CPD materials designed by industry professionals.',
        keywords: 'learning hub resources templates case studies toolkits research materials'
    },
    {
        title: 'Get In Touch',
        url: 'getintouch.html',
        description: 'Ready to elevate your team\'s customer excellence? Let\'s talk. Our team is here to answer your questions about membership, programs, CPD certification, or partnership opportunities.',
        keywords: 'contact get in touch email phone address support partnership inquiries'
    },
    {
        title: 'Full Access Membership',
        url: 'fullaccess.html',
        description: 'Experience unlimited learning, networking, and growth opportunities. Transform your customer management expertise with unrestricted access to Southern Africa\'s premier professional development community.',
        keywords: 'full access unlimited membership premium elite exclusive benefits'
    }
];

// Open search modal
if (searchToggle) {
    searchToggle.addEventListener('click', () => {
        searchModal.classList.add('active');
        searchInput.focus();
    });
}

// Close search modal
function closeSearchModal() {
    searchModal.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
}

if (searchClose) {
    searchClose.addEventListener('click', closeSearchModal);
}

// Close on outside click
if (searchModal) {
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            closeSearchModal();
        }
    });
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchModal.classList.contains('active')) {
        closeSearchModal();
    }
});

// Search functionality
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length === 0) {
            searchResults.innerHTML = '';
            return;
        }
        
        if (query.length < 2) {
            searchResults.innerHTML = '<div class="search-no-results">Please enter at least 2 characters...</div>';
            return;
        }
        
        // Filter and rank results
        const results = searchContent.filter(item => {
            const searchText = (item.title + ' ' + item.description + ' ' + item.keywords).toLowerCase();
            return searchText.includes(query);
        }).map(item => {
            // Calculate relevance score
            const titleMatch = item.title.toLowerCase().includes(query);
            const descMatch = item.description.toLowerCase().includes(query);
            return {
                ...item,
                relevance: titleMatch ? 2 : (descMatch ? 1 : 0.5)
            };
        }).sort((a, b) => b.relevance - a.relevance);
        
        // Display results
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                        <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <p>No results found for "<strong>${query}</strong>"</p>
                </div>
            `;
        } else {
            searchResults.innerHTML = results.map(result => `
                <a href="${result.url}" class="search-result-item">
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-description">${result.description}</div>
                </a>
            `).join('');
        }
    });
}