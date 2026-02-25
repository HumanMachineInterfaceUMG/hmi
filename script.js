// ==================== LOADER ====================
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const loaderLogo = document.querySelector('.loader-logo');
  const fadePage = document.querySelector('.fade-page');

  if (sessionStorage.getItem('loaderShown') === 'true') {
    loader.classList.add('hidden');
    fadePage.classList.add('loaded');
    document.getElementById('hamburger')?.classList.add('visible');
    document.getElementById('homeLogo')?.classList.add('visible');
    document.getElementById('langCorner')?.classList.add('visible');
    return;
  }

  setTimeout(() => {
    loaderLogo.classList.add('visible');
  }, 100);

  setTimeout(() => {
    loaderLogo.classList.add('fade-out');
    loader.classList.add('hidden');

    setTimeout(() => {
      fadePage.classList.add('loaded');
      document.getElementById('hamburger')?.classList.add('visible');
      document.getElementById('homeLogo')?.classList.add('visible');
      document.getElementById('langCorner')?.classList.add('visible');
      sessionStorage.setItem('loaderShown', 'true');
    }, 400);
  }, 1200);
});

// ==================== MENU BOCZNE ====================
const hamburger = document.getElementById('hamburger');
const sideMenu = document.getElementById('sideMenu');
const menuOverlay = document.getElementById('menuOverlay');

hamburger.addEventListener('click', () => {
  sideMenu.style.left = '0';
  menuOverlay.style.opacity = '1';
  menuOverlay.style.pointerEvents = 'all';
});

menuOverlay.addEventListener('click', closeMenu);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

function closeMenu() {
  sideMenu.style.left = '-260px';
  menuOverlay.style.opacity = '0';
  menuOverlay.style.pointerEvents = 'none';
}

// ==================== WCZESNA DEKLARACJA ELEMENTÓW MODALA ====================
const modal       = document.getElementById('achievementsModal');
const modalTitle  = document.getElementById('modalTitle');
const modalList   = document.getElementById('modalList');
let   activeSection = null;

// ==================== PRZEŁĄCZANIE JĘZYKA GLOBALNE ====================
const langButton = document.getElementById('langCorner');
let currentLang = localStorage.getItem('lang') || 'pl';

function applyLanguage(lang) {
  document.querySelectorAll('[data-pl]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) el.textContent = text;
  });

  // zmiana ikony i tekstu przycisku języka
  langButton.innerHTML = lang === 'pl'
    ? '<img src="https://flagcdn.com/gb.svg" alt="English"> EN'
    : '<img src="https://flagcdn.com/pl.svg" alt="Polski"> PL';

  // aktualizacja modalu jeśli jest otwarty
  if (modal?.classList.contains('active') && activeSection) {
    const data = achievementsData[activeSection];
    if (data) {
      modalTitle.textContent = data.title[lang];
      modalList.innerHTML = '';
      data.items.forEach(itemObj => {
        const li = document.createElement('li');
        li.textContent = itemObj[lang];
        modalList.appendChild(li);
      });
    }
  }
}

// Zastosuj zapisany język od razu po załadowaniu skryptu
applyLanguage(currentLang);

langButton.addEventListener('click', () => {
  currentLang = currentLang === 'pl' ? 'en' : 'pl';
  localStorage.setItem('lang', currentLang);
  applyLanguage(currentLang);
});

// ==================== PARALLAX ====================
const parallaxImages = document.querySelectorAll('.parallax-bg img');
const parallaxSpeed = 0.55;

function updateParallax() {
  const scrolled = window.pageYOffset;
  const viewportHeight = window.innerHeight;

  parallaxImages.forEach(img => {
    const section = img.closest('.section');
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionCenter = sectionTop + sectionHeight / 2;
    const distanceFromCenter = (scrolled + viewportHeight / 2) - sectionCenter;
    const yPos = distanceFromCenter * parallaxSpeed;

    img.style.transform = `translate(-50%, -50%) translateY(${yPos}px)`;
  });
}

window.addEventListener('scroll', updateParallax);
window.addEventListener('resize', updateParallax);
updateParallax();

// ==================== DANE OSIĄGNIĘĆ – DWUJĘZYCZNE ====================
const achievementsData = {
  druk3d: {
    title: {
      pl: "Osiągnięcia Sekcji Druku i Modelowania 3D",
      en: "Achievements of the 3D Printing & Modeling Section"
    },
    items: [
      { pl: "Realizacja fizycznych projektów inżynierskich",                en: "Implementation of physical engineering projects" },
      { pl: "Prototypowanie urządzeń",                                      en: "Device prototyping" },
      { pl: "Produkcja materiałów promocyjnych koła oraz uczelni",          en: "Production of promotional materials for the club and university" },
      { pl: "Organizowanie warsztatów dla wszystkich studentów uczelni",    en: "Organizing workshops for all university students" }
    ]
  },
  elektro: {
    title: {
      pl: "Osiągnięcia Sekcji Elektroautomatyki",
      en: "Achievements of the Electroautomatics Section"
    },
    items: [
      { pl: "Realizacja projektów w programie Studenckie koła naukowe tworzą innowacje, finansowanych z budżetu państwa",
        en: "Implementation of projects under the 'Student Research Clubs Create Innovations' program, funded by the state budget" },
      { pl: "Opracowywanie zaawansowanej dokumentacji technicznej",         en: "Development of advanced technical documentation" },
      { pl: "Udział w Mistrzostwach PLC",                                   en: "Participation in PLC Championships" },
      { pl: "Koordynowanie oraz wdrażanie projektów studenckich",           en: "Coordination and implementation of student projects" }
    ]
  },
  programowanie: {
    title: {
      pl: "Osiągnięcia Sekcji Programowania i Elektroniki",
      en: "Achievements of the Programming and Electronics Section"
    },
    items: [
      { pl: "Zdobycie nagród specjalnych w międzynarodowym hackathonie SpaceShield Hack 2025",
        en: "Winning special awards at the international hackathon SpaceShield Hack 2025" },
      { pl: "Networking branżowy",                                          en: "Industry networking" },
      { pl: "Udział w wydarzeniach organizowanych przez IEEE",              en: "Participation in IEEE organized events" },
      { pl: "Udział w międzynarodowych targach z branży elektronicznej oraz kosmicznej",
        en: "Participation in international fairs in the electronics and space industry" }
    ]
  },
  marketing: {
    title: {
      pl: "Osiągnięcia Sekcji Marketing",
      en: "Achievements of the Marketing Section"
    },
    items: [
      { pl: "Współpraca z czołowymi przedsiębiorstwami tworzącymi oprogramowanie techniczne",
        en: "Cooperation with leading companies creating technical software" },
      { pl: "Stworzenie funkcjonalnej strony internetowej",                 en: "Creation of a functional website" },
      { pl: "Budowanie zasięgów liczących kilka tysięcy odsłon",            en: "Building reach of several thousand views" },
      { pl: "Publiczne reprezentowanie koła na różnych wydarzeniach",       en: "Public representation of the club at various events" }
    ]
  }
};

// ==================== OBSŁUGA MODALA Z OSIĄGNIĘCIAMI ====================
document.querySelectorAll('.achievements-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const sectionKey = btn.getAttribute('data-section');
    activeSection = sectionKey;
    const data = achievementsData[sectionKey];

    if (!data) {
      console.warn(`Brak danych dla sekcji: ${sectionKey}`);
      return;
    }

    modalTitle.textContent = data.title[currentLang];
    modalList.innerHTML = '';
    data.items.forEach(itemObj => {
      const li = document.createElement('li');
      li.textContent = itemObj[currentLang];
      modalList.appendChild(li);
    });

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

// Zamykanie modalu
document.querySelector('.modal-close')?.addEventListener('click', closeModal);
modal?.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal?.classList.contains('active')) {
    closeModal();
  }
});

function closeModal() {
  modal?.classList.remove('active');
  document.body.style.overflow = '';
  activeSection = null;
}

// ==================== ANIMOWANE TŁO PLEXUS (particles.js) ====================
if (document.getElementById('particles-js')) {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js';
  script.onload = function () {
    particlesJS("particles-js", {
      "particles": {
        "number": { "value": 70, "density": { "enable": true, "value_area": 800 } },
        "color": { "value": "#00ffff" },
        "shape": { "type": "circle" },
        "opacity": { "value": 0.5, "random": true, "anim": { "enable": true, "speed": 0.8, "opacity_min": 0.1 } },
        "size": { "value": 3, "random": true, "anim": { "enable": true, "speed": 2, "size_min": 0.3 } },
        "line_linked": { "enable": true, "distance": 150, "color": "#00ffff", "opacity": 0.4, "width": 1 },
        "move": { "enable": true, "speed": 1.3, "direction": "none", "random": true, "straight": false, "out_mode": "out" }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": false }, "resize": true },
        "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.8 } } }
      },
      "retina_detect": true
    });
  };
  document.body.appendChild(script);
}