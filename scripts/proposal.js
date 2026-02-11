// ===== PROPOSAL SLIDESHOW =====
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.proposal-slide');
    let currentSlide = 0;
    const slideInterval = 5000; // 5 seconds

    function nextSlide() {
        // Remove active class from current slide
        slides[currentSlide].classList.remove('active');
        
        // Move to next slide
        currentSlide = (currentSlide + 1) % slides.length;
        
        // Add active class to new slide
        slides[currentSlide].classList.add('active');
    }

    // Start slideshow if slides exist
    if (slides.length > 0) {
        setInterval(nextSlide, slideInterval);
    }

    // ===== SCROLL WORD EFFECT =====
    const proposalPart = document.querySelector('.proposal-part');
    let scrollWords = document.querySelectorAll('.scroll-word');
    
    function updateScrollEffects() {
        // Re-query scroll words in case they've been updated
        scrollWords = document.querySelectorAll('.scroll-word');
        
        if (!proposalPart || scrollWords.length === 0) return;
        
        const rect = proposalPart.getBoundingClientRect();
        const proposalTop = rect.top;
        const proposalHeight = rect.height;
        const viewportHeight = window.innerHeight;
        
        // Calculate how far we've scrolled into the proposal section
        // When proposalTop is 0, we're at the start of the sticky section
        // The scroll distance is: proposalHeight - viewportHeight (the extra scroll space)
        const scrollDistance = proposalHeight - viewportHeight;
        const scrolledAmount = -proposalTop; // How much we've scrolled past the top
        
        // Progress from 0 to 1 through the sticky scroll area
        const scrollProgress = Math.max(0, Math.min(1, scrolledAmount / scrollDistance));
        
        // ===== Update scroll words =====
        // Calculate which word should be active based on scroll progress
        const totalWords = scrollWords.length;
        const activeWordIndex = Math.floor(scrollProgress * totalWords);
        
        scrollWords.forEach((word, index) => {
            word.classList.remove('active', 'past');
            
            if (index < activeWordIndex) {
                word.classList.add('past');
            } else if (index === activeWordIndex) {
                word.classList.add('active');
            }
        });
    }

    // Update on scroll with requestAnimationFrame throttle
    let scrollTicking = false;
    window.addEventListener('scroll', function() {
        if (!scrollTicking) {
            requestAnimationFrame(function() {
                updateScrollEffects();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });
    
    // Initial update
    updateScrollEffects();
    
    // Expose function to reinitialize scroll effect after language change
    window.reinitScrollWordEffect = function() {
        scrollWords = document.querySelectorAll('.scroll-word');
        updateScrollEffects();
    };
});
