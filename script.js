/* ===== Environment ===== */
const isMobile = window.matchMedia('(max-width: 768px)').matches;
// Checked at event time rather than once, so toggling the OS setting applies live.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ===== Custom Cursor ===== */
const customCursor = document.querySelector('.custom-cursor');
const cursorGlow = document.querySelector('.cursor-glow');
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let glowX = 0, glowY = 0;
let cursorFrame = null;

if (!isMobile) {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const hoverTargets = 'a, button, .project-card, .journey-card, .stack-tag, .contact-link';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      customCursor.classList.add('hovering');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      customCursor.classList.remove('hovering');
    }
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    customCursor.style.left = cursorX + 'px';
    customCursor.style.top = cursorY + 'px';

    glowX += (mouseX - glowX) * 0.06;
    glowY += (mouseY - glowY) * 0.06;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';

    cursorFrame = requestAnimationFrame(animateCursor);
  }

  // Under reduced motion the CSS hides the custom cursor: stop the loop too,
  // and restart it if the setting is turned back off.
  function syncCursor() {
    if (reducedMotion.matches) {
      cancelAnimationFrame(cursorFrame);
      cursorFrame = null;
    } else if (!cursorFrame) {
      animateCursor();
    }
  }

  reducedMotion.addEventListener('change', syncCursor);
  syncCursor();
}

/* ===== Hero Parallax on Mouse Move ===== */
const heroContent = document.querySelector('.hero-content');
const hero = document.getElementById('hero');

if (!isMobile) {
  hero.addEventListener('mousemove', (e) => {
    if (reducedMotion.matches) return;

    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    heroContent.style.transform = `translate(${x * 15}px, ${y * 10}px)`;
  });

  hero.addEventListener('mouseleave', () => {
    heroContent.style.transition = 'transform 0.5s ease';
    heroContent.style.transform = 'translate(0, 0)';
    setTimeout(() => { heroContent.style.transition = ''; }, 500);
  });
}

/* ===== Navbar show on scroll ===== */
const navbar = document.querySelector('.navbar');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    navbar.classList.toggle('visible', !entry.isIntersecting);
  });
}, { threshold: 0.1 });

navObserver.observe(hero);

/* ===== Smooth scroll for nav links ===== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }
  });
});

/* ===== Tilt 3D Effect on Cards ===== */
function initTilt() {
  if (isMobile) return;

  const tiltCards = document.querySelectorAll('.project-card, .journey-card');

  tiltCards.forEach(card => {
    if (card.dataset.tiltInit) return;
    card.dataset.tiltInit = 'true';

    card.addEventListener('mousemove', (e) => {
      if (reducedMotion.matches) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / centerY * -8;
      const rotateY = (x - centerX) / centerX * 8;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s ease';
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      setTimeout(() => { card.style.transition = 'box-shadow 0.4s ease'; }, 500);
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'box-shadow 0.4s ease';
    });
  });
}

/* ===== Scroll Reveal ===== */
function setupReveal() {
  const revealElements = document.querySelectorAll(
    '.section-title, .section-subtitle, .featured-project, .project-card, .journey-card, .stack-category, .contact-text, .contact-links, .projects-more'
  );

  revealElements.forEach(el => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
    }
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  revealElements.forEach(el => {
    if (!el.classList.contains('visible')) {
      revealObserver.observe(el);
    }
  });
}

/* ===== Stagger animation for grid items ===== */
function staggerReveal() {
  const groups = [
    document.querySelectorAll('.project-card'),
    document.querySelectorAll('.journey-card'),
    document.querySelectorAll('.stack-category')
  ];

  groups.forEach(group => {
    group.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.1}s`;
    });
  });
}

/* ===== Translated markup for generated content ===== */
// Same data-fr / data-en contract as the static markup, so switchLang() updates it too.
function i18n(tag, fr, en, attrs = '') {
  const text = document.documentElement.dataset.lang === 'en' ? en : fr;
  return `<${tag} ${attrs} data-fr="${fr}" data-en="${en}">${text}</${tag}>`;
}

/* ===== GitHub Repos ===== */
const GITHUB_USERNAME = 'S-Mopty';
const REPO_LIMIT = 6;

const langColors = {
  Python: '#3572A5',
  Rust: '#dea584',
  JavaScript: '#f1e05a',
  HTML: '#e34c26',
  CSS: '#563d7c',
  TypeScript: '#3178c6',
  C: '#555555',
  'C++': '#f34b7d',
  Java: '#b07219',
  Shell: '#89e051',
  Lua: '#000080',
  Go: '#00ADD8',
};

function createSkeletons(grid) {
  for (let i = 0; i < 4; i++) {
    const skel = document.createElement('div');
    skel.className = 'project-skeleton';
    skel.innerHTML = `
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
    `;
    grid.appendChild(skel);
  }
}

function createRepoCard(repo) {
  const card = document.createElement('a');
  card.href = repo.html_url;
  card.target = '_blank';
  card.rel = 'noopener';
  card.className = 'project-card';

  const desc = repo.description
    ? `<p>${repo.description}</p>`
    : i18n('p', 'Pas de description.', 'No description.');

  const langName = repo.language || '';
  const color = langColors[langName] || '#888';

  card.innerHTML = `
    <h3>${repo.name}</h3>
    ${desc}
    <div class="project-meta">
      ${langName ? `<span class="project-lang"><span class="project-lang-dot" style="background:${color}"></span>${langName}</span>` : ''}
      ${repo.stargazers_count > 0 ? `<span class="project-stars">⭐ ${repo.stargazers_count}</span>` : ''}
      ${repo.forks_count > 0 ? `<span>🍴 ${repo.forks_count}</span>` : ''}
    </div>
  `;

  return card;
}

async function loadRepos() {
  const grid = document.getElementById('projects-grid');
  createSkeletons(grid);

  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);

    // Most starred first; the sort is stable, so ties stay in last-updated order.
    const repos = (await response.json())
      .filter(r => !r.fork && !r.archived)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, REPO_LIMIT);

    grid.innerHTML = repos.length
      ? ''
      : `<p class="projects-status">${i18n('span', 'Aucun repo public trouvé.', 'No public repos found.')}</p>`;

    repos.forEach(repo => grid.appendChild(createRepoCard(repo)));

  } catch {
    grid.innerHTML = `<p class="projects-status">
      ${i18n('span', 'Impossible de charger les projets.', 'Could not load the projects.')}
      ${i18n('a', 'Voir sur GitHub', 'View on GitHub', `href="https://github.com/${GITHUB_USERNAME}" target="_blank" rel="noopener"`)}
    </p>`;
  }

  setupReveal();
  staggerReveal();
  initTilt();
}

/* ===== Language Toggle with transition ===== */
const langToggles = document.querySelectorAll('.lang-toggle');

function switchLang() {
  const html = document.documentElement;
  const current = html.dataset.lang;
  const next = current === 'fr' ? 'en' : 'fr';

  document.body.classList.add('lang-switching');

  setTimeout(() => {
    html.dataset.lang = next;
    html.lang = next;

    langToggles.forEach(btn => {
      btn.textContent = next === 'fr' ? 'EN' : 'FR';
    });

    document.querySelectorAll('[data-fr][data-en]').forEach(el => {
      el.textContent = el.dataset[next];
    });

    document.body.classList.remove('lang-switching');
  }, 250);
}

langToggles.forEach(btn => btn.addEventListener('click', switchLang));

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {
  loadRepos();
  setupReveal();
  staggerReveal();
  initTilt();
});
