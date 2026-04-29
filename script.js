/*=============== SHOW/HIDE MOBILE MENU ===============*/
const navMenu = document.querySelector('.nav__menu');
const navToggle = document.querySelector('.nav__toggle');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('show-menu');
        navToggle.classList.toggle('active');
    });
}

/*=============== REMOVE MENU ON LINK CLICK ===============*/
const navLinks = document.querySelectorAll('.nav__link');

function linkAction() {
    navMenu.classList.remove('show-menu');
    navToggle.classList.remove('active');
}
navLinks.forEach(n => n.addEventListener('click', linkAction));

/*=============== DARK/LIGHT THEME TOGGLE ===============*/
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;
const moonIcon = 'fa-moon';
const sunIcon = 'fa-sun';

// Function to set the theme
function setTheme(theme) {
    body.classList.toggle('dark-theme', theme === 'dark');
    themeToggle.classList.toggle(moonIcon, theme === 'light');
    themeToggle.classList.toggle(sunIcon, theme === 'dark');
    localStorage.setItem('selected-theme', theme);
}

// Get user preference from local storage
const currentTheme = localStorage.getItem('selected-theme') || 'light';
setTheme(currentTheme);

themeToggle.addEventListener('click', () => {
    const newTheme = body.classList.contains('dark-theme') ? 'light' : 'dark';
    setTheme(newTheme);
});

/*=============== HEADER SHADOW ON SCROLL ===============*/
function scrollHeader() {
    const header = document.querySelector('.header');
    if (this.scrollY >= 50) {
        header.classList.add('scroll-header');
    } else {
        header.classList.remove('scroll-header');
    }
}
window.addEventListener('scroll', scrollHeader);

/*=============== SCROLL-UP BUTTON ===============*/
function scrollUp() {
    const scrollUp = document.getElementById('scroll-up');
    if (this.scrollY >= 400) {
        scrollUp.classList.add('show-scroll');
    } else {
        scrollUp.classList.remove('show-scroll');
    }
}
window.addEventListener('scroll', scrollUp);

/*=============== ACTIVE NAV LINK ON SCROLL ===============*/
const sections = document.querySelectorAll('section[id]');

function scrollActive() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 58; // 58px is approx header height
        const sectionId = current.getAttribute('id');
        const navLink = document.querySelector('.nav__menu a[href*=' + sectionId + ']');

        if (navLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLink.classList.add('active-link');
        } else {
            if (navLink) navLink.classList.remove('active-link');
        }
    });
}
window.addEventListener('scroll', scrollActive);


/*=============== SCROLL REVEAL ANIMATION ===============*/
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1 // Trigger when 10% of the element is visible
});

sections.forEach((section) => {
    observer.observe(section);
});

/*=============== FLOATING ACTION BUTTON (FAB) ===============*/
const fabContainer = document.querySelector('.fab-container');
const fabToggle = document.querySelector('.fab-toggle');

if (fabToggle) {
    fabToggle.addEventListener('click', () => {
        fabContainer.classList.toggle('active');
    });
}

/*=============== CONTACT FORM INTEGRATION (FORMSPREE) ===============*/
// To make the contact form work, create a free account on formspree.io,
// create a new form, and replace 'YOUR_UNIQUE_FORM_ID' in the form's 'action'
// attribute in index.html with your actual Formspree form ID.
// Example: action="https://formspree.io/f/abcdefgh"

/*=============== ADMIN LINK VISIBILITY ===============*/
