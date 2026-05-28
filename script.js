// ==================== LOADER – TYLKO RAZ NA SESJĘ + KRÓTSZA ANIMACJA ====================
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

// ==================== MENU BOCZNE (HAMBURGER) ====================
const hamburger = document.getElementById('hamburger');
const sideMenu = document.getElementById('sideMenu');
const menuOverlay = document.getElementById('menuOverlay');

if (hamburger && sideMenu && menuOverlay) {
  hamburger.addEventListener('click', () => {
    sideMenu.style.left = '0';
    sideMenu.classList.add('menu-open');
    menuOverlay.style.opacity = '1';
    menuOverlay.style.pointerEvents = 'all';
  });

  menuOverlay.addEventListener('click', closeMenu);
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

function closeMenu() {
  if (!sideMenu || !menuOverlay) return;
  sideMenu.style.left = `-${Math.min(260, Math.round(window.innerWidth * 0.82))}px`;
  sideMenu.classList.remove('menu-open');
  menuOverlay.style.opacity = '0';
  menuOverlay.style.pointerEvents = 'none';
}


// V50 — naturalne przewijanie menu hamburgera na telefonie.
// Zatrzymuje przekazywanie gestów z menu do mechanizmu przewijania sekcji.
(() => {
  const menu = document.getElementById('sideMenu');
  if (!menu) return;
  ['wheel', 'touchmove'].forEach(type => {
    menu.addEventListener(type, (event) => {
      event.stopPropagation();
    }, { passive: true });
  });
})();



// V51 — menu hamburgera: gest przewijania zostaje w menu i nie uruchamia przewijania sekcji.
(() => {
  const menu = document.getElementById('sideMenu');
  if (!menu || menu.dataset.v51ScrollFix === 'true') return;
  menu.dataset.v51ScrollFix = 'true';
  const stopForMenu = (event) => event.stopPropagation();
  ['wheel', 'touchstart', 'touchmove'].forEach(type => {
    menu.addEventListener(type, stopForMenu, { passive: true });
  });
})();

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
  if (langButton) {
    langButton.innerHTML = lang === 'pl'
      ? '<img src="https://flagcdn.com/gb.svg" alt="English"> EN'
      : '<img src="https://flagcdn.com/pl.svg" alt="Polski"> PL';
  }

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

langButton?.addEventListener('click', () => {
  currentLang = currentLang === 'pl' ? 'en' : 'pl';
  localStorage.setItem('lang', currentLang);
  applyLanguage(currentLang);
});

// ==================== PARALLAX + PRZEWIJANIE SEKCJAMI JAK W ORYGINALE ====================
const parallaxImages = document.querySelectorAll('.parallax-bg img');
const parallaxSpeed = 0.55;
let parallaxFrame = null;

function updateParallax() {
  const scrolled = window.pageYOffset || document.documentElement.scrollTop || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  parallaxImages.forEach(img => {
    const section = img.closest('.section');
    if (!section) return;

    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionCenter = sectionTop + sectionHeight / 2;
    const distanceFromCenter = (scrolled + viewportHeight / 2) - sectionCenter;
    const yPos = distanceFromCenter * parallaxSpeed;

    // Ten wzór jest taki sam jak w pierwotnej wersji strony.
    // setProperty(..., 'important') jest potrzebne, bo CSS ma zabezpieczenia responsywne.
    img.style.setProperty(
      'transform',
      `translate(-50%, -50%) translateY(${yPos}px)`,
      'important'
    );
  });

  parallaxFrame = null;
}

function requestParallaxUpdate() {
  if (parallaxFrame !== null) return;
  parallaxFrame = window.requestAnimationFrame(updateParallax);
}

if (parallaxImages.length) {
  window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
  window.addEventListener('resize', requestParallaxUpdate);
  window.addEventListener('orientationchange', requestParallaxUpdate);
  window.addEventListener('load', requestParallaxUpdate);
  requestParallaxUpdate();
}

// Delikatna obsługa klawiatury dla sekcji.
// Nie blokuje kółka myszy ani gestów dotykowych, więc przewijanie jest płynne
// i nie ma opóźnienia po ponownym naciśnięciu strzałki.
(() => {
  const sections = Array.from(document.querySelectorAll('.section'));
  if (sections.length < 2) return;

  const isMenuOpen = () => sideMenu && sideMenu.style.left === '0px';
  const isModalOpen = () => modal && modal.classList.contains('active');

  function nearestSectionIndex() {
    const y = window.scrollY || window.pageYOffset || 0;
    let bestIndex = 0;
    let bestDistance = Infinity;

    sections.forEach((section, index) => {
      const distance = Math.abs(section.offsetTop - y);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  function goToSection(index) {
    const targetIndex = Math.max(0, Math.min(sections.length - 1, index));
    const target = sections[targetIndex];
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    requestParallaxUpdate();
  }

  window.addEventListener('keydown', (event) => {
    if (isMenuOpen() || isModalOpen()) return;
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    const current = nearestSectionIndex();
    if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
      event.preventDefault();
      goToSection(current + 1);
    } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      event.preventDefault();
      goToSection(current - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      goToSection(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      goToSection(sections.length - 1);
    }
  });
})();


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
      { pl: "Organizowanie warsztatów dla wszystkich studentów uczelni",   en: "Organizing workshops for all university students" }
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
  robotyka: {
    title: {
      pl: "Osiągnięcia Sekcji Robotyka",
      en: "Achievements of the Robotics Section"
    },
    items: [
      { pl: "Uruchomienie robota TurtleBot3 Burger w systemie ROS 2 Humble",                            en: "Running the TurtleBot3 Burger on ROS 2 Humble" },
      { pl: "Stworzenie prostych programów sterujących robotem i jego czujnikami",                       en: "Creating simple programs to control the robot and its sensors" },
      { pl: "Integracja Arduino z ROS 2 do obsługi dodatkowych modułów",                                 en: "Integrating Arduino with ROS 2 to support additional modules" },
      { pl: "Konfiguracja i wykorzystanie Raspberry Pi 4 jako jednostki sterującej robota",              en: "Configuring and using the Raspberry Pi 4 as a robot control unit" },
      { pl: "Przygotowanie pierwszych map i testów nawigacji robota w pomieszczeniu",                    en: "Preparation of the first maps and tests of the robot's navigation in the room" }
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

// =========================================================
// V8 — przewijanie sekcjami zostawione natywnemu CSS scroll-snap.
// Nie ma już dodatkowego dociągania w JavaScript, dzięki czemu touchpad i telefon
// przewijają płynniej i szybciej, bez zatrzymywania w połowie sekcji.
// =========================================================


// ==================== V10 — DYNAMICZNE PRZEWIJANIE SEKCJAMI BEZ PODWÓJNYCH PRZESKOKÓW ====================
// Działa na stronach z .section oraz na podstronie Członkowie.
// Efekt: lekki ruch touchpadem/myszką przechodzi do następnej części strony
// i zatrzymuje się równo na początku sekcji.
(() => {
  const root = document.documentElement;
  const body = document.body;

  // Poprawka V12:
  // Podstrona Członkowie ma przewijać się normalnie, bez zatrzymywania
  // i bez dzielenia na sekcje. Dlatego nie uruchamiamy tutaj mechanizmu
  // scrollowania sekcja-po-sekcji.
  if (body.classList.contains('members-page')) {
    root.classList.remove('snap-page');
    root.classList.remove('snap-members-page');
    return;
  }

  let sections = Array.from(document.querySelectorAll('.section'));

  if (sections.length < 2) {
    root.classList.remove('snap-page');
    root.classList.remove('snap-members-page');
    return;
  }

  root.classList.add('snap-page');

  let activeIndex = 0;
  let isAnimating = false;
  let wheelSum = 0;
  let wheelTimer = null;
  let wheelLocked = false;
  let wheelUnlockTimer = null;
  let touchStartY = 0;
  let touchStartX = 0;
  let touchStartedAt = 0;
  let animationFrame = null;

  const WHEEL_THRESHOLD = 32;
  const FAST_WHEEL_THRESHOLD = 70;
  const WHEEL_QUIET_UNLOCK_MS = 145;
  const TOUCH_THRESHOLD = 38;
  const ANIMATION_MS = 390;

  function isBlockedByUI() {
    const menu = document.getElementById('sideMenu');
    const modalEl = document.querySelector('.modal.active, #achievementsModal.active');
    return (menu && menu.style.left === '0px') || !!modalEl;
  }

  function getSnapOffset() {
    return 0;
  }

  function sectionTop(section) {
    const rawTop = section.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
    return Math.max(0, rawTop - getSnapOffset());
  }

  function nearestIndex() {
    const y = window.scrollY || window.pageYOffset || 0;
    let best = 0;
    let dist = Infinity;

    sections.forEach((section, index) => {
      const d = Math.abs(sectionTop(section) - y);
      if (d < dist) {
        dist = d;
        best = index;
      }
    });

    return best;
  }

  function clampIndex(index) {
    return Math.max(0, Math.min(sections.length - 1, index));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateTo(index) {
    const targetIndex = clampIndex(index);
    const target = sections[targetIndex];
    if (!target) return;

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    activeIndex = targetIndex;
    isAnimating = true;

    const startY = window.scrollY || window.pageYOffset || 0;
    const endY = sectionTop(target);
    const distance = endY - startY;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min(1, (now - startTime) / ANIMATION_MS);
      const eased = easeOutCubic(progress);
      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        window.scrollTo(0, endY);
        isAnimating = false;
        animationFrame = null;
        requestAnimationFrame(() => {
          if (typeof requestParallaxUpdate === 'function') requestParallaxUpdate();
        });

        scheduleWheelUnlock();
      }
    }

    animationFrame = requestAnimationFrame(step);
  }

  function goByDirection(direction) {
    if (!direction || isBlockedByUI()) return;

    const baseIndex = isAnimating ? activeIndex : nearestIndex();
    const nextIndex = clampIndex(baseIndex + direction);

    if (nextIndex === baseIndex) return;

    if (isAnimating) return;

    animateTo(nextIndex);
  }

  function scheduleWheelUnlock() {
    clearTimeout(wheelUnlockTimer);
    wheelUnlockTimer = setTimeout(() => {
      if (isAnimating) {
        scheduleWheelUnlock();
        return;
      }
      wheelLocked = false;
      wheelSum = 0;
    }, WHEEL_QUIET_UNLOCK_MS);
  }

  // Touchpad / kółko myszy: jeden gest = jeden przeskok sekcji.
  // Dzięki blokadzie wygasającej po ucichnięciu gestu touchpad nie przeskakuje czasem o dwie sekcje.
  window.addEventListener('wheel', (event) => {
    if (isBlockedByUI()) return;
    if (event.ctrlKey) return;

    const absX = Math.abs(event.deltaX || 0);
    const absY = Math.abs(event.deltaY || 0);
    if (absY < 2 || absX > absY * 1.35) return;

    event.preventDefault();

    if (wheelLocked || isAnimating) {
      wheelSum = 0;
      scheduleWheelUnlock();
      return;
    }

    wheelSum += event.deltaY;
    clearTimeout(wheelTimer);

    const direction = wheelSum > 0 ? 1 : -1;
    const shouldMove = Math.abs(wheelSum) >= WHEEL_THRESHOLD || absY >= FAST_WHEEL_THRESHOLD;

    if (shouldMove) {
      wheelSum = 0;
      wheelLocked = true;
      goByDirection(direction);
      scheduleWheelUnlock();
      return;
    }

    wheelTimer = setTimeout(() => {
      if (!wheelLocked && !isAnimating && Math.abs(wheelSum) >= WHEEL_THRESHOLD) {
        wheelLocked = true;
        goByDirection(wheelSum > 0 ? 1 : -1);
        scheduleWheelUnlock();
      }
      wheelSum = 0;
    }, 55);
  }, { passive: false });

  // Telefon/tablet: jeżeli gest skończy się pomiędzy sekcjami, strona dociąga do kolejnej.
  window.addEventListener('touchstart', (event) => {
    if (!event.touches || event.touches.length !== 1) return;
    touchStartY = event.touches[0].clientY;
    touchStartX = event.touches[0].clientX;
    touchStartedAt = performance.now();
  }, { passive: true });

  window.addEventListener('touchend', (event) => {
    if (isBlockedByUI()) return;
    const changed = event.changedTouches && event.changedTouches[0];
    if (!changed) return;

    const dy = touchStartY - changed.clientY;
    const dx = touchStartX - changed.clientX;
    const elapsed = Math.max(1, performance.now() - touchStartedAt);
    const velocity = Math.abs(dy) / elapsed;

    if (Math.abs(dx) > Math.abs(dy) * 1.2) return;

    if (Math.abs(dy) >= TOUCH_THRESHOLD || velocity > 0.45) {
      goByDirection(dy > 0 ? 1 : -1);
    } else {
      animateTo(nearestIndex());
    }
  }, { passive: true });

  // Aktualizacja indeksu po normalnym skoku / kliknięciu kotwicy.
  window.addEventListener('scroll', () => {
    if (!isAnimating) activeIndex = nearestIndex();
  }, { passive: true });

  window.addEventListener('resize', () => {
    activeIndex = nearestIndex();
    window.scrollTo(0, sectionTop(sections[activeIndex]));
  });
})();


// ==================== DELIKATNY MAGICZNY PYŁ / MIGAJĄCE GWIAZDKI ====================
// V65: efekt gwiazdek wyłączony, żeby strona wyglądała bardziej poważnie i profesjonalnie.
(() => {
  return;
  if (document.getElementById('magicDustStyle')) return;

  // V20: bez magicznego pyłu na stronie głównej oraz podstronie Sekcje Koła.
  // Efekt zostaje tylko na zwykłych podstronach, jako tło.
  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const dustDisabledPages = new Set(['index.html', '', 'sekcje_zespolow.html']);
  if (dustDisabledPages.has(currentPage)) return;

  const style = document.createElement('style');
  style.id = 'magicDustStyle';
  style.textContent = `
    .page-magic-dust,
    .section-magic-dust {
      pointer-events: none !important;
      overflow: hidden !important;
      user-select: none !important;
    }

    body {
      isolation: isolate;
    }

    .page-magic-dust {
      position: fixed !important;
      inset: 0 !important;
      z-index: 0 !important;
      opacity: 0.94 !important;
      mix-blend-mode: normal !important;
    }

    body > .page-magic-dust + .fade-page,
    body > .page-magic-dust ~ .fade-page {
      position: relative !important;
      z-index: 2 !important;
    }

    .section {
      isolation: isolate;
    }

    .section-magic-dust {
      position: absolute !important;
      inset: 0 !important;
      z-index: 0 !important;
      opacity: 0.82 !important;
      mix-blend-mode: normal !important;
    }

    .section > .parallax-layer,
    .section::after {
      z-index: -2;
    }

    .section > .content,
    .section > .buttons-container,
    .section > h1,
    .section > h2,
    .section > p {
      position: relative;
      z-index: 2;
    }

    /* Pył ma być tylko tłem. Karty i bloki treści są pełną warstwą nad efektem,
       żeby gwiazdki nie prześwitywały przez zdjęcia, wydarzenia, ramki ani napisy. */
    .partner-card,
    .achievement-card,
    .news-item,
    .person-single,
    .person,
    .person2,
    .contact-box,
    .content {
      position: relative;
      z-index: 2;
      isolation: isolate;
    }

    .page-magic-dust::before,
    .page-magic-dust::after,
    .section-magic-dust::before,
    .section-magic-dust::after {
      content: "";
      position: absolute;
      inset: -12%;
      background-repeat: repeat;
      filter: drop-shadow(0 0 9px rgba(255, 255, 255, 1)) drop-shadow(0 0 18px rgba(128, 203, 255, 0.72));
      will-change: opacity, transform;
      transform: translate3d(0, 0, 0);
    }

    .page-magic-dust::before,
    .section-magic-dust::before {
      background-image:
        radial-gradient(circle at 12% 18%, rgba(255,255,255,1) 0 1.25px, transparent 2.35px),
        radial-gradient(circle at 76% 28%, rgba(176,220,255,0.94) 0 1.1px, transparent 2.25px),
        radial-gradient(circle at 38% 64%, rgba(255,255,255,0.86) 0 1.08px, transparent 2.2px),
        radial-gradient(circle at 88% 78%, rgba(255,236,150,0.78) 0 1.15px, transparent 2.25px),
        radial-gradient(circle at 48% 12%, rgba(210,245,255,0.68) 0 0.95px, transparent 1.9px);
      background-size: 190px 190px, 260px 260px, 330px 330px, 410px 410px;
      animation: magicDustTwinkle 4.9s ease-in-out infinite alternate,
                 magicDustColorShift 8.5s ease-in-out infinite alternate,
                 magicDustDrift 46s ease-in-out infinite alternate;
    }

    .page-magic-dust::after,
    .section-magic-dust::after {
      opacity: 0.78;
      background-image:
        radial-gradient(circle at 22% 74%, rgba(255,255,255,0.92) 0 1.05px, transparent 2.1px),
        radial-gradient(circle at 54% 36%, rgba(255,244,190,0.72) 0 1.18px, transparent 2.4px),
        radial-gradient(circle at 92% 44%, rgba(190,230,255,0.82) 0 1.05px, transparent 2.1px),
        radial-gradient(circle at 6% 42%, rgba(255,255,255,0.62) 0 0.95px, transparent 1.9px);
      background-size: 230px 230px, 360px 360px, 480px 480px;
      animation: magicDustTwinkle 6.2s ease-in-out infinite alternate-reverse,
                 magicDustColorShift 10.5s ease-in-out infinite alternate-reverse,
                 magicDustDriftReverse 58s ease-in-out infinite alternate;
    }

    @keyframes magicDustTwinkle {
      0%   { opacity: 0.48; }
      24%  { opacity: 0.94; }
      52%  { opacity: 0.62; }
      76%  { opacity: 1; }
      100% { opacity: 0.70; }
    }

    @keyframes magicDustColorShift {
      0%   { filter: drop-shadow(0 0 7px rgba(255,255,255,0.65)) drop-shadow(0 0 12px rgba(120,190,255,0.25)); }
      50%  { filter: drop-shadow(0 0 9px rgba(255,246,196,0.78)) drop-shadow(0 0 16px rgba(170,220,255,0.42)); }
      100% { filter: drop-shadow(0 0 8px rgba(255,255,255,0.72)) drop-shadow(0 0 14px rgba(255,226,140,0.32)); }
    }

    @keyframes magicDustDrift {
      0%   { transform: translate3d(0, 0, 0) scale(1); }
      100% { transform: translate3d(-72px, 58px, 0) scale(1.02); }
    }

    @keyframes magicDustDriftReverse {
      0%   { transform: translate3d(0, 0, 0) scale(1.02); }
      100% { transform: translate3d(64px, -46px, 0) scale(1); }
    }

    @media (max-width: 760px) {
      .page-magic-dust { opacity: 0.94 !important; }
      .section-magic-dust { opacity: 0.84 !important; }
    }

    @media (prefers-reduced-motion: reduce) {
      .page-magic-dust::before,
      .page-magic-dust::after,
      .section-magic-dust::before,
      .section-magic-dust::after {
        animation: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  const sections = document.querySelectorAll('.section');
  if (sections.length) {
    sections.forEach(section => {
      if (!section.querySelector(':scope > .section-magic-dust')) {
        const dust = document.createElement('div');
        dust.className = 'section-magic-dust';
        dust.setAttribute('aria-hidden', 'true');
        section.insertBefore(dust, section.firstChild);
      }
    });
  } else if (!document.querySelector('.page-magic-dust')) {
    const dust = document.createElement('div');
    dust.className = 'page-magic-dust';
    dust.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(dust, document.body.firstChild);
  }
})();


// ==================== V52 — płynny scroll menu hamburgera na telefonie ====================
// Poprawia iOS/Android: przewijanie menu nie wraca do góry i nie uruchamia scrollowania sekcji.
(() => {
  const menu = document.getElementById('sideMenu');
  if (!menu || menu.dataset.v52MenuScroll === 'true') return;
  menu.dataset.v52MenuScroll = 'true';

  const getScroller = () => menu.querySelector('ul') || menu;
  const isOpen = () => {
    const left = window.getComputedStyle(menu).left;
    return left === '0px' || menu.style.left === '0px';
  };

  let lastY = 0;

  menu.addEventListener('touchstart', (event) => {
    if (!event.touches || event.touches.length !== 1) return;
    lastY = event.touches[0].clientY;
  }, { passive: true });

  menu.addEventListener('touchmove', (event) => {
    if (!isOpen() || !event.touches || event.touches.length !== 1) return;

    const scroller = getScroller();
    if (!scroller || scroller.scrollHeight <= scroller.clientHeight + 1) return;

    const currentY = event.touches[0].clientY;
    const delta = lastY - currentY;
    const atTop = scroller.scrollTop <= 0;
    const atBottom = Math.ceil(scroller.scrollTop + scroller.clientHeight) >= scroller.scrollHeight;

    // Zatrzymaj odbijanie strony za menu, ale pozwól przewijać zawartość menu.
    if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
      event.preventDefault();
      event.stopPropagation();
      lastY = currentY;
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    scroller.scrollTop += delta;
    lastY = currentY;
  }, { passive: false });

  menu.addEventListener('wheel', (event) => {
    if (!isOpen()) return;
    const scroller = getScroller();
    if (!scroller || scroller.scrollHeight <= scroller.clientHeight + 1) return;
    event.preventDefault();
    event.stopPropagation();
    scroller.scrollTop += event.deltaY;
  }, { passive: false });
})();


// ==================== V53 — pewne przewijanie menu hamburgera na telefonie ====================
// Działa w pionie i poziomie. Na dużym ekranie/komputerze niczego nie zmienia.
(() => {
  const menu = document.getElementById('sideMenu');
  if (!menu || menu.dataset.v53MenuScroll === 'true') return;
  menu.dataset.v53MenuScroll = 'true';

  const mediaMobile = window.matchMedia('(max-width: 980px), (max-height: 620px), (pointer: coarse)');
  const scroller = () => menu.querySelector('ul') || menu;
  const isOpen = () => {
    const left = window.getComputedStyle(menu).left;
    return left === '0px' || menu.style.left === '0px' || menu.style.left === '0';
  };

  let lastY = 0;

  menu.addEventListener('touchstart', (event) => {
    if (!mediaMobile.matches || !isOpen() || !event.touches || event.touches.length !== 1) return;
    lastY = event.touches[0].clientY;
  }, { passive: true, capture: true });

  menu.addEventListener('touchmove', (event) => {
    if (!mediaMobile.matches || !isOpen() || !event.touches || event.touches.length !== 1) return;

    const target = scroller();
    if (!target) return;

    const maxScroll = Math.max(0, target.scrollHeight - target.clientHeight);
    if (maxScroll <= 1) return;

    const y = event.touches[0].clientY;
    const delta = lastY - y;
    const next = Math.min(maxScroll, Math.max(0, target.scrollTop + delta));

    target.scrollTop = next;
    lastY = y;

    event.preventDefault();
    event.stopImmediatePropagation();
  }, { passive: false, capture: true });

  menu.addEventListener('wheel', (event) => {
    if (!mediaMobile.matches || !isOpen()) return;

    const target = scroller();
    if (!target) return;

    const maxScroll = Math.max(0, target.scrollHeight - target.clientHeight);
    if (maxScroll <= 1) return;

    target.scrollTop = Math.min(maxScroll, Math.max(0, target.scrollTop + event.deltaY));
    event.preventDefault();
    event.stopImmediatePropagation();
  }, { passive: false, capture: true });
})();

// ==================== V55 — dodatkowe zabezpieczenie scrollowania menu na Współpracy ====================
// Działa tylko na urządzeniach mobilnych / niskich ekranach. Na komputerze menu zostaje statyczne.
(() => {
  const menu = document.getElementById('sideMenu');
  if (!menu || menu.dataset.v55CooperationMenuScroll === 'true') return;
  menu.dataset.v55CooperationMenuScroll = 'true';

  const mobileMenu = window.matchMedia('(max-width: 980px), (max-height: 620px), (pointer: coarse)');
  const scroller = () => menu.querySelector('ul') || menu;
  const isOpen = () => {
    const left = window.getComputedStyle(menu).left;
    return left === '0px' || menu.style.left === '0px' || menu.style.left === '0';
  };

  let lastY = 0;

  menu.addEventListener('touchstart', (event) => {
    if (!mobileMenu.matches || !isOpen() || !event.touches || event.touches.length !== 1) return;
    lastY = event.touches[0].clientY;
  }, { passive: true, capture: true });

  menu.addEventListener('touchmove', (event) => {
    if (!mobileMenu.matches || !isOpen() || !event.touches || event.touches.length !== 1) return;

    const target = scroller();
    if (!target) return;

    const maxScroll = Math.max(0, target.scrollHeight - target.clientHeight);
    if (maxScroll <= 1) return;

    const y = event.touches[0].clientY;
    const delta = lastY - y;
    target.scrollTop = Math.min(maxScroll, Math.max(0, target.scrollTop + delta));
    lastY = y;

    event.preventDefault();
    event.stopImmediatePropagation();
  }, { passive: false, capture: true });

  menu.addEventListener('wheel', (event) => {
    if (!mobileMenu.matches || !isOpen()) return;

    const target = scroller();
    if (!target) return;

    const maxScroll = Math.max(0, target.scrollHeight - target.clientHeight);
    if (maxScroll <= 1) return;

    target.scrollTop = Math.min(maxScroll, Math.max(0, target.scrollTop + event.deltaY));
    event.preventDefault();
    event.stopImmediatePropagation();
  }, { passive: false, capture: true });
})();
