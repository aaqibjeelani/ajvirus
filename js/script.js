// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Preloader
    const preloader = document.querySelector('.preloader');
    
    // Hide preloader after page load
    window.addEventListener('load', function() {
        setTimeout(function() {
            preloader.classList.add('fade-out');
            // Enable scrolling after preloader is hidden
            document.body.style.overflow = '';
            
            // Remove preloader from DOM after animation completes
            setTimeout(function() {
                if (preloader.parentNode) {
                    preloader.parentNode.removeChild(preloader);
                }
            }, 500);
        }, 1500); // Show preloader for at least 1.5 seconds
    });
    
    // Disable scrolling while preloader is active
    document.body.style.overflow = 'hidden';
    
    // Initialize AOS animation library
    AOS.init({
        duration: 800,
        easing: 'ease',
        once: true,
        offset: 100
    });
    
    // Custom cursor effect
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', function(e) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            cursor.style.display = 'block';
            
            setTimeout(function() {
                cursorFollower.style.left = e.clientX + 'px';
                cursorFollower.style.top = e.clientY + 'px';
                cursorFollower.style.display = 'block';
            }, 100);
        });
        
        document.addEventListener('mouseout', function() {
            cursor.style.display = 'none';
            cursorFollower.style.display = 'none';
        });
        
        // Cursor hover effect on links and buttons
        const hoverElements = document.querySelectorAll('a, button, .btn, .theme-toggle, .hamburger');
        
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', function() {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursorFollower.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursor.style.backgroundColor = 'transparent';
                cursorFollower.style.borderColor = 'var(--primary-color)';
            });
            
            element.addEventListener('mouseleave', function() {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
                cursor.style.backgroundColor = 'var(--primary-color)';
                cursorFollower.style.borderColor = 'var(--primary-color)';
            });
        });
    }
    
    // Initialize Swiper slider
    const heroSlider = new Swiper('.hero-slider', {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        speed: 1000,
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        on: {
            init: function() {
                // Load the first slide's background image immediately
                const activeSlide = document.querySelector('.swiper-slide-active');
                if (activeSlide) {
                    const bgImage = activeSlide.getAttribute('data-background');
                    if (bgImage) {
                        activeSlide.style.backgroundImage = `url('${bgImage}')`;
                        activeSlide.removeAttribute('data-background');
                    }
                }
                
                // Add loading indicator to all slides
                document.querySelectorAll('.swiper-slide').forEach(slide => {
                    // Create loading spinner
                    const loadingDiv = document.createElement('div');
                    loadingDiv.className = 'image-loading';
                    loadingDiv.innerHTML = '<div class="spinner"></div>';
                    slide.appendChild(loadingDiv);
                    
                    // If slide has a background image that needs to be loaded
                    if (slide.getAttribute('data-background')) {
                        // Create an image element to preload the background
                        const img = new Image();
                        img.onload = function() {
                            // When image is loaded, set it as background and remove spinner
                            slide.style.backgroundImage = `url('${img.src}')`;
                            const spinner = slide.querySelector('.image-loading');
                            if (spinner) {
                                spinner.style.display = 'none';
                            }
                        };
                        img.src = slide.getAttribute('data-background');
                    } else {
                        // If slide already has background image set
                        const spinner = slide.querySelector('.image-loading');
                        if (spinner) {
                            spinner.style.display = 'none';
                        }
                    }
                });
            },
            slideChangeTransitionStart: function() {
                // Load the next slide's background image
                const activeSlide = document.querySelector('.swiper-slide-active');
                const nextSlide = document.querySelector('.swiper-slide-next');
                const prevSlide = document.querySelector('.swiper-slide-prev');
                
                [activeSlide, nextSlide, prevSlide].forEach(slide => {
                    if (slide) {
                        const bgImage = slide.getAttribute('data-background');
                        if (bgImage) {
                            slide.style.backgroundImage = `url('${bgImage}')`;
                            slide.removeAttribute('data-background');
                            
                            // Hide spinner when image is loaded
                            const spinner = slide.querySelector('.image-loading');
                            if (spinner) {
                                const img = new Image();
                                img.onload = function() {
                                    spinner.style.display = 'none';
                                };
                                img.src = bgImage;
                            }
                        }
                    }
                });
            }
        }
    });
    
    // Header scroll effect
    const header = document.querySelector('header');
    const scrollThreshold = 50;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Back to top button
    const backToTopBtn = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });
    
    // Add click event for back to top button
    backToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('nav-open');
        
        // Prevent scrolling when menu is open
        if (document.body.classList.contains('nav-open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    // Close mobile nav when clicking on a link
    const navItems = document.querySelectorAll('.nav-links a');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('nav-open');
            document.body.style.overflow = '';
        });
    });
    
    // Close mobile nav when clicking outside
    document.addEventListener('click', function(e) {
        if (navLinks.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('nav-open');
            document.body.style.overflow = '';
        }
    });
    
    // Dark mode toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Set dark mode as default
    document.body.classList.add('dark-mode');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
    localStorage.setItem('theme', 'dark');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    
    // Only override default if explicitly set to light
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
    
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Active navigation link based on scroll position
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });
    
    // Project filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Skill progress bars animation
    const progressBars = document.querySelectorAll('.progress-bar');
    
    function animateProgressBars() {
        progressBars.forEach(bar => {
            const percent = bar.getAttribute('data-percent');
            bar.style.width = percent + '%';
        });
    }
    
    // Animate progress bars when they come into view
    const skillsSection = document.querySelector('.skills');
    
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateProgressBars();
                skillsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    if (skillsSection) {
        skillsObserver.observe(skillsSection);
    }
    
    // Form submission handling
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // In a real application, you would send this data to a server
            // For GitHub Pages (static hosting), you could use a service like Formspree
            
            // For now, we'll just log the data and show a success message
            console.log({
                name,
                email,
                subject,
                message
            });
            
            // Reset form
            contactForm.reset();
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'form-success-message';
            successMessage.textContent = 'Your message has been sent successfully!';
            
            contactForm.appendChild(successMessage);
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        });
    }
    
    // Typing animation for hero section
    const typingElement = document.querySelector('.typed-text');
    
    if (typingElement) {
        const typed = new Typed('.typed-text', {
            strings: ['Full Stack Developer', 'Web Designer', 'PHP Developer', 'UI/UX Designer'],
            typeSpeed: 70,
            backSpeed: 40,
            backDelay: 1500,
            startDelay: 1000,
            loop: true
        });
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Reset mobile menu if window is resized to desktop
            if (navLinks.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('nav-open');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Image Loading Spinners
    // Add loading spinners to all images
    const imagesToLoad = document.querySelectorAll('.image-container img, .project-image img');
    
    imagesToLoad.forEach(function(img) {
        // Create wrapper if not already in a relative positioned container
        const parent = img.parentElement;
        
        // Add lazy loading attribute
        img.setAttribute('loading', 'lazy');
        
        // Add placeholder class to parent
        parent.classList.add('lazy-placeholder');
        
        // Create spinner element
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'image-loading';
        loadingDiv.innerHTML = '<div class="spinner"></div>';
        parent.appendChild(loadingDiv);
        
        // Hide spinner and show image when loaded
        img.onload = function() {
            const spinner = this.parentElement.querySelector('.image-loading');
            if (spinner) {
                spinner.style.display = 'none';
                parent.classList.remove('lazy-placeholder');
                img.classList.add('fade-in-image');
            }
        };
        
        // If image is already cached and loaded
        if (img.complete) {
            const spinner = img.parentElement.querySelector('.image-loading');
            if (spinner) {
                spinner.style.display = 'none';
                parent.classList.remove('lazy-placeholder');
                img.classList.add('fade-in-image');
            }
        }
    });
    
    // Global Loading Indicator
    const globalLoading = document.querySelector('.global-loading');
    const progressBar = document.querySelector('.loading-progress-bar');
    const percentageText = document.querySelector('.loading-percentage');
    
    let loadedItems = 0;
    let totalItems = 0;
    
    // Count all images, scripts, and stylesheets
    totalItems = document.querySelectorAll('img').length + 
                 document.querySelectorAll('script').length + 
                 document.querySelectorAll('link[rel="stylesheet"]').length;
    
    // Function to update progress
    function updateProgress() {
        loadedItems++;
        const percentage = Math.min(Math.round((loadedItems / totalItems) * 100), 100);
        
        // Use requestAnimationFrame for smoother UI updates
        requestAnimationFrame(() => {
            progressBar.style.width = percentage + '%';
            percentageText.textContent = percentage + '%';
            
            if (loadedItems >= totalItems) {
                // When everything is loaded
                setTimeout(function() {
                    globalLoading.classList.add('fade-out');
                    setTimeout(function() {
                        if (globalLoading.parentNode) {
                            globalLoading.style.display = 'none';
                        }
                    }, 500);
                }, 500);
            }
        });
    }
    
    // Track image loading
    document.querySelectorAll('img').forEach(img => {
        if (img.complete) {
            updateProgress();
        } else {
            img.addEventListener('load', updateProgress);
            img.addEventListener('error', updateProgress); // Count errors as loaded
        }
    });
    
    // Track script loading
    document.querySelectorAll('script').forEach(script => {
        updateProgress(); // Count all scripts as loaded immediately to avoid blocking
    });
    
    // Track stylesheet loading
    document.querySelectorAll('link[rel="stylesheet"]').forEach(stylesheet => {
        // Stylesheets don't have reliable load events across browsers
        // So we'll just increment after a short delay
        setTimeout(updateProgress, 100);
    });
    
    // Fallback in case some resources don't trigger events - shorter timeout
    setTimeout(function() {
        if (loadedItems < totalItems) {
            // Force complete
            loadedItems = totalItems;
            requestAnimationFrame(() => {
                progressBar.style.width = '100%';
                percentageText.textContent = '100%';
                
                setTimeout(function() {
                    globalLoading.classList.add('fade-out');
                    setTimeout(function() {
                        if (globalLoading.parentNode) {
                            globalLoading.style.display = 'none';
                        }
                    }, 500);
                }, 500);
            });
        }
    }, 3000); // 3 second fallback (reduced from 5 seconds)
    
    // Optimize image loading for mobile
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        // Create a new image to preload
                        const tempImg = new Image();
                        tempImg.onload = function() {
                            // Only set the src when loaded
                            img.src = src;
                            img.removeAttribute('data-src');
                            
                            // Find parent container and spinner
                            const parent = img.parentElement;
                            if (parent) {
                                const spinner = parent.querySelector('.image-loading');
                                if (spinner) {
                                    spinner.style.display = 'none';
                                }
                                parent.classList.remove('lazy-placeholder');
                                img.classList.add('fade-in-image');
                            }
                        };
                        tempImg.src = src;
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px', // Load images 200px before they come into view
            threshold: 0.1
        });
        
        // Find all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Fix for mobile scroll issues
    let touchStartY = 0;
    let touchEndY = 0;
    let isScrolling = false;
    
    // Only apply these fixes on mobile devices
    if (window.innerWidth <= 768) {
        document.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchmove', function(e) {
            if (isScrolling) return;
            
            touchEndY = e.touches[0].clientY;
            const diff = touchStartY - touchEndY;
            
            // If scrolling down and near bottom of page
            if (diff > 0 && window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
                isScrolling = true;
                // Force browser to recognize there's more content
                setTimeout(() => {
                    isScrolling = false;
                }, 300);
            }
        }, { passive: true });
        
        document.addEventListener('touchend', function() {
            isScrolling = false;
        }, { passive: true });
    }
}); 