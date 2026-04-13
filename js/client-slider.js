// Client Logos Lazy Loading with Skeleton
document.addEventListener('DOMContentLoaded', function() {
    const clientImages = document.querySelectorAll('.client-img[data-src]');
    
    if ('IntersectionObserver' in window && clientImages.length > 0) {
        const clientImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    const skeleton = img.parentElement.querySelector('.client-skeleton');
                    
                    if (src) {
                        // Create a new image to preload
                        const tempImg = new Image();
                        tempImg.onload = function() {
                            // Set the actual image source
                            img.src = src;
                            img.removeAttribute('data-src');
                            
                            // Add loaded class for fade-in
                            img.classList.add('loaded');
                            
                            // Hide skeleton
                            if (skeleton) {
                                skeleton.classList.add('hidden');
                                setTimeout(() => {
                                    skeleton.style.display = 'none';
                                }, 300);
                            }
                        };
                        tempImg.onerror = function() {
                            // Hide skeleton even on error
                            if (skeleton) {
                                skeleton.classList.add('hidden');
                            }
                        };
                        tempImg.src = src;
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px', // Load images 100px before they come into view
            threshold: 0.1
        });
        
        // Observe all client images
        clientImages.forEach(img => {
            clientImageObserver.observe(img);
        });
    }
});
