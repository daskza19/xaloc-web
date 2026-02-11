document.addEventListener("DOMContentLoaded", () => {
    const minSpeed = 0.15;
    const maxSpeed = 0.15;
    
    const getRandomSpeed = () => Math.random() * (maxSpeed - minSpeed) + minSpeed;
    
    const textPaths = [
        { element: document.getElementById("text-path1"), speed: getRandomSpeed(), direction: "right" },
        { element: document.getElementById("text-path2"), speed: getRandomSpeed(), direction: "right" },
        { element: document.getElementById("text-path3"), speed: getRandomSpeed(), direction: "right" },
        { element: document.getElementById("text-path4"), speed: getRandomSpeed(), direction: "right" },
        { element: document.getElementById("text-path5"), speed: getRandomSpeed(), direction: "right" }
    ];
    
    // Initialize offsets for each text path
    const offsets = textPaths.map(path => path.direction === "right" ? -100 : 0);
    
    let isVisible = true;
    let animationId = null;

    // Use IntersectionObserver to pause animation when hero is not visible
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const observer = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;
            if (isVisible && !animationId) {
                animationId = requestAnimationFrame(animateText);
            }
        }, { threshold: 0 });
        observer.observe(heroSection);
    }

    const animateText = () => {
        if (!isVisible) {
            animationId = null;
            return;
        }

        textPaths.forEach((path, index) => {
            if (!path.element) return;
            
            if (path.direction === "right") {
                offsets[index] += path.speed;
                if (offsets[index] >= 0) {
                    offsets[index] = -100;
                }
            } else {
                offsets[index] -= path.speed;
                if (offsets[index] <= -100) {
                    offsets[index] = 100;
                }
            }
            
            path.element.setAttribute("startOffset", offsets[index] + "%");
        });
        
        animationId = requestAnimationFrame(animateText);
    };
    
    animationId = requestAnimationFrame(animateText);
});