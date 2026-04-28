// Client Logos Lazy Loading with Skeleton and Swiper Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Swiper for Clients
    const clientsSwiper = new Swiper('.clients-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 40,
        loop: true,
        speed: 5000,
        autoplay: {
            delay: 0,
            disableOnInteraction: false,
        },
        freeMode: {
            enabled: true,
            momentum: false,
        },
        grabCursor: true,
        breakpoints: {
            320: {
                spaceBetween: 20
            },
            576: {
                spaceBetween: 30
            },
            768: {
                spaceBetween: 40
            }
        },
        on: {
            init: function() {
                // Initialize lazy loading after Swiper is ready
                initClientLazyLoading();
            },
            slideChange: function() {
                // Re-check lazy loading when slides change (for loop clones)
                initClientLazyLoading();
            }
        }
    });

    // Pause autoplay on hover
    const swiperContainer = document.querySelector('.clients-swiper');
    if (swiperContainer) {
        swiperContainer.addEventListener('mouseenter', () => {
            clientsSwiper.autoplay.stop();
        });
        swiperContainer.addEventListener('mouseleave', () => {
            clientsSwiper.autoplay.start();
        });
    }

    function initClientLazyLoading() {
        const clientImages = document.querySelectorAll('.client-img[data-src]');
        
        if ('IntersectionObserver' in window && clientImages.length > 0) {
            const clientImageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');
                        const skeleton = img.parentElement.querySelector('.client-skeleton');
                        
                        if (src) {
                            const tempImg = new Image();
                            tempImg.onload = function() {
                                img.src = src;
                                img.removeAttribute('data-src');
                                img.classList.add('loaded');
                                
                                if (skeleton) {
                                    skeleton.classList.add('hidden');
                                    setTimeout(() => {
                                        skeleton.style.display = 'none';
                                    }, 300);
                                }
                            };
                            tempImg.src = src;
                        }
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '100px',
                threshold: 0.1
            });
            
            clientImages.forEach(img => {
                clientImageObserver.observe(img);
            });
        }
    }
});
