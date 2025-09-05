// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Toggle mobile menu
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });

    // Theme Toggle Functionality
    initializeThemeToggle();
});

// Theme Toggle Functions
function initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    updateNavbarForTheme(savedTheme);
    
    // Add click event listener
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Update theme
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        updateNavbarForTheme(newTheme);
        
        // Add animation effect
        themeToggle.style.transform = 'scale(0.8)';
        setTimeout(() => {
            themeToggle.style.transform = '';
        }, 150);
    });
}

function updateNavbarForTheme(theme) {
    const nav = document.querySelector('.nav');
    
    // If navbar is in scrolled state, update its theme attribute
    if (nav.classList.contains('scrolled')) {
        nav.setAttribute('data-theme', theme);
    }
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (theme === 'dark') {
        themeIcon.textContent = '☀️';
        themeIcon.setAttribute('title', 'Switch to light mode');
    } else {
        themeIcon.textContent = '🌙';
        themeIcon.setAttribute('title', 'Switch to dark mode');
    }
}

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed nav height
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar Background on Scroll
window.addEventListener('scroll', function() {
    const nav = document.querySelector('.nav');
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
        nav.setAttribute('data-theme', currentTheme);
    } else {
        nav.classList.remove('scrolled');
        nav.removeAttribute('data-theme');
        // Remove any inline styles that might override CSS
        nav.style.background = '';
        nav.style.backdropFilter = '';
    }
});

// Animate Elements on Scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-on-scroll', 'fadeInUp');
            
            // Animate skill bars
            if (entry.target.classList.contains('skill-progress')) {
                const width = entry.target.getAttribute('data-width');
                console.log(`Animating skill bar: ${width}%`, entry.target);
                setTimeout(() => {
                    entry.target.style.width = width + '%';
                    console.log(`Applied width: ${width}% to`, entry.target);
                }, 200);
            }
        }
    });
}, observerOptions);

// Elements to observe for animation
const animateElements = document.querySelectorAll(`
    .hero-content,
    .about-content,
    .project-card,
    .skills-category,
    .contact-content,
    .skill-progress
`);

console.log(`Found ${animateElements.length} elements to animate`);
console.log('Skill progress elements:', document.querySelectorAll('.skill-progress'));

animateElements.forEach(el => {
    observer.observe(el);
    console.log('Observing element:', el.className, el);
});

// Contact Form Handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        // Simulate form submission
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'SENDING...';
        submitBtn.disabled = true;
        
        // Simulate API call delay
        setTimeout(() => {
            submitBtn.textContent = 'MESSAGE SENT!';
            submitBtn.style.background = '#4CAF50';
            submitBtn.style.borderColor = '#4CAF50';
            
            // Reset form
            this.reset();
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
                submitBtn.style.borderColor = '';
            }, 3000);
            
            // You can replace this with actual form submission logic
            console.log('Form submitted:', formObject);
            
        }, 2000);
    });
}

// Geometric Shapes Animation with Parallax
let shapeRotations = [0, 0, 0]; // Track rotation for each shape

function animateShapes() {
    const shapes = document.querySelectorAll('.geometric-shape');
    
    shapes.forEach((shape, index) => {
        // Store original CSS transforms
        if (!shape.hasAttribute('data-original-css')) {
            const computedStyle = window.getComputedStyle(shape);
            const transform = computedStyle.transform;
            shape.setAttribute('data-original-css', transform !== 'none' ? transform : '');
        }
    });
    
    function animate() {
        const scrolled = window.pageYOffset;
        
        shapes.forEach((shape, index) => {
            // Update rotation
            const rotationSpeed = 0.001 + (index * 0.0005);
            shapeRotations[index] += rotationSpeed;
            
            // Calculate parallax
            const parallaxSpeed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * parallaxSpeed);
            
            // Get original CSS transform
            const originalCSS = shape.getAttribute('data-original-css') || '';
            
            // Combine all transforms
            shape.style.transform = `${originalCSS} rotate(${shapeRotations[index]}rad) translateY(${yPos}px)`;
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Start shape animation when page loads
window.addEventListener('load', animateShapes);

// Dynamic Text Effect for Hero Title
function createTypewriterEffect() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    
    const originalText = heroTitle.innerHTML;
    const words = originalText.split('<br>');
    let currentWordIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    
    function typeWriter() {
        if (currentWordIndex < words.length) {
            const currentWord = words[currentWordIndex].replace(/<[^>]*>/g, ''); // Remove HTML tags
            
            if (!isDeleting) {
                heroTitle.innerHTML = words.slice(0, currentWordIndex).join('<br>') + 
                                    (currentWordIndex > 0 ? '<br>' : '') +
                                    currentWord.substring(0, currentCharIndex + 1);
                currentCharIndex++;
                
                if (currentCharIndex === currentWord.length) {
                    setTimeout(() => {
                        currentWordIndex++;
                        currentCharIndex = 0;
                        if (currentWordIndex < words.length) {
                            setTimeout(typeWriter, 100);
                        }
                    }, 1000);
                    return;
                }
            }
            
            setTimeout(typeWriter, 100);
        }
    }
    
    // Start typewriter effect after a delay
    setTimeout(() => {
        heroTitle.innerHTML = '';
        typeWriter();
    }, 1000);
}

// Mouse Cursor Effect
function createCursorEffect() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: #ff6b35;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: transform 0.1s ease;
        opacity: 0;
    `;
    document.body.appendChild(cursor);
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    // Add hover effects for interactive elements
    const hoverElements = document.querySelectorAll('a, button, .project-card');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursor.style.background = '#000000';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.background = '#ff6b35';
        });
    });
}

// Initialize cursor effect on desktop only
if (window.innerWidth > 768) {
    createCursorEffect();
}

// Loading Animation
function showLoadingAnimation() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        transition: opacity 0.5s ease;
    `;
    
    loader.innerHTML = `
        <div style="text-align: center;">
            <div style="width: 60px; height: 60px; border: 3px solid #000; border-top: 3px solid #ff6b35; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <p style="font-family: 'Space Grotesk', sans-serif; font-weight: 600; letter-spacing: 0.1em;">LOADING...</p>
        </div>
    `;
    
    // Add spin animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(loader);
    
    // Hide loader when page is fully loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
            }, 500);
        }, 1000);
    });
}

// Show loading animation
showLoadingAnimation();

// Add click ripple effect to buttons
function addRippleEffect() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add ripple animation
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
}

// Initialize ripple effect
addRippleEffect();

// Enhanced Geometric Animations
function createFloatingGrid() {
    const container = document.getElementById('heroFloatingGrid');
    if (!container) return;
    
    const shapes = ['floating-square', 'floating-circle', 'floating-triangle'];
    const colors = ['var(--accent-color)', 'var(--primary-color)', 'var(--gray-800)'];
    
    // Clear existing items
    container.innerHTML = '';
    
    for (let i = 0; i < 20; i++) {
        const item = document.createElement('div');
        const shapeClass = shapes[Math.floor(Math.random() * shapes.length)];
        item.className = `floating-item ${shapeClass}`;
        
        // Random positioning
        item.style.left = Math.random() * 100 + '%';
        item.style.top = Math.random() * 100 + '%';
        item.style.animationDelay = Math.random() * 8 + 's';
        item.style.animationDuration = (6 + Math.random() * 4) + 's';
        
        // Random size variation
        const scale = 0.7 + Math.random() * 0.6;
        item.style.transform = `scale(${scale})`;
        
        container.appendChild(item);
    }
}

// Intersection Observer for scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.8s ease-out forwards';
                entry.target.style.opacity = '1';
            }
        });
    }, observerOptions);

    // Observe section dividers and project cards
    document.querySelectorAll('.section-divider, .project-card').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// Add slide-in animation keyframes
function addScrollAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInUp {
            from {
                transform: translateY(30px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        /* Staggered animation for project cards */
        .project-card:nth-child(1) { animation-delay: 0s; }
        .project-card:nth-child(2) { animation-delay: 0.2s; }
        .project-card:nth-child(3) { animation-delay: 0.4s; }
        
        /* Hover effects for enhanced interactivity */
        .project-card {
            transition: all var(--transition-normal);
        }
        
        .project-card:hover {
            transform: translateY(-10px) rotate(1deg);
            box-shadow: 8px 8px 0 var(--primary-color);
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 4px 4px 0 var(--primary-color);
        }
        
        /* Skill bars animation */
        .skill-progress {
            transform-origin: left;
            animation: expandBar 2s ease-out forwards;
        }
        
        @keyframes expandBar {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize enhanced animations
function initEnhancedAnimations() {
    createFloatingGrid();
    initScrollAnimations();
    addScrollAnimationStyles();
    
    // Manually check and animate skill bars that might not have been triggered
    setTimeout(() => {
        const skillBars = document.querySelectorAll('.skill-progress');
        skillBars.forEach(bar => {
            const rect = bar.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible && bar.style.width === '0px' || !bar.style.width) {
                const width = bar.getAttribute('data-width');
                console.log(`Manually animating missed skill bar: ${width}%`);
                bar.style.width = width + '%';
            }
        });
    }, 2000);
    
    // Recreate floating grid on theme change
    document.addEventListener('themeChanged', createFloatingGrid);
}

// Call enhanced animations after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Delay to ensure other elements are loaded
    setTimeout(initEnhancedAnimations, 500);
    
    // Initialize particle system
    initParticleSystem();
    
    // Specific skill bar animation observer
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('data-width');
                console.log(`Skill observer triggered for: ${width}%`);
                setTimeout(() => {
                    entry.target.style.width = width + '%';
                }, 300);
            }
        });
    }, { threshold: 0.3 });
    
    // Observe all skill progress bars specifically
    document.querySelectorAll('.skill-progress').forEach(bar => {
        skillObserver.observe(bar);
    });
});

// Interactive Particle System
function initParticleSystem() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: 0, y: 0 };
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = 80; // Navigation height
    }
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            // Move particle
            this.x += this.vx;
            this.y += this.vy;
            
            // Mouse interaction
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                this.vx += dx * force * 0.001;
                this.vy += dy * force * 0.001;
            }
            
            // Boundary collision
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            
            // Keep in bounds
            this.x = Math.max(0, Math.min(canvas.width, this.x));
            this.y = Math.max(0, Math.min(canvas.height, this.y));
            
            // Damping
            this.vx *= 0.99;
            this.vy *= 0.99;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 107, 53, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    // Initialize particles
    function initParticles() {
        particles = [];
        for (let i = 0; i < 30; i++) {
            particles.push(new Particle());
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections
        particles.forEach((particle, i) => {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particle.x - particles[j].x;
                const dy = particle.y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 80) {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 107, 53, ${0.2 * (80 - distance) / 80})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        });
        
        requestAnimationFrame(animate);
    }
    
    // Mouse tracking
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    
    // Initialize
    resizeCanvas();
    initParticles();
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });
}

// Performance optimization: Debounce function (utility)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Buy Me Coffee Widget Functionality
function initializeCoffeeWidget() {
    const coffeeWidget = document.getElementById('coffeeWidget');
    const coffeeButton = document.querySelector('.coffee-button');
    
    if (coffeeButton) {
        coffeeButton.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'translate(-3px, -3px) scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Replace with your actual Buy Me Coffee link
            const coffeeUrl = 'https://buymeacoffee.com/weaboo1164g'; // Replace with your actual link
            window.open(coffeeUrl, '_blank');
        });
        
        // Add hover sound effect simulation (visual feedback)
        coffeeButton.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.coffee-icon');
            icon.style.transform = 'scale(1.1) rotate(15deg)';
        });
        
        coffeeButton.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.coffee-icon');
            icon.style.transform = '';
        });
    }
}

// Initialize coffee widget when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Existing initialization code...
    initializeCoffeeWidget();
});

console.log('Portfolio website loaded successfully! 🚀');
