/* ============================================================
   SHUAIB PORTFOLIO — Premium JS
   ============================================================ */

// ── Cursor ──────────────────────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
function getStoredTheme() {
  try {
    return window.localStorage?.getItem('portfolio-theme') || 'light';
  } catch {
    return 'light';
  }
}

function storeTheme(theme) {
  try {
    window.localStorage?.setItem('portfolio-theme', theme);
  } catch {
    // The toggle still works for the current page when storage is unavailable.
  }
}

const savedTheme = getStoredTheme();
document.documentElement.dataset.theme = savedTheme;

function syncThemeToggle() {
  const isLight = document.documentElement.dataset.theme === 'light';
  themeToggle?.setAttribute('aria-pressed', String(isLight));
  themeToggle?.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
}

themeToggle?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = nextTheme;
  storeTheme(nextTheme);
  syncThemeToggle();
});
syncThemeToggle();

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
const hasDesktopCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
let mouseX = 0, mouseY = 0;
let ringX   = 0, ringY  = 0;
let lastDropTime = 0;
let dropIndex = 0;

if (hasDesktopCursor) {
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (dot) {
      dot.style.left = mouseX + 'px';
      dot.style.top  = mouseY + 'px';
    }

    const now = performance.now();
    if (now - lastDropTime > 34) {
      spawnCursorDrop(mouseX, mouseY);
      lastDropTime = now;
    }
  });

  (function animateRing() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    if (ring) {
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
    }
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll('a, button, .skill-card, .project-card, .achievement-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (dot) dot.style.transform = 'translate(-50%,-50%) rotate(45deg) scale(1.5)';
      if (ring) ring.style.transform = 'translate(-50%,-50%) scale(1.3)';
    });
    el.addEventListener('mouseleave', () => {
      if (dot) dot.style.transform = 'translate(-50%,-50%) rotate(45deg) scale(1)';
      if (ring) ring.style.transform = 'translate(-50%,-50%) scale(1)';
    });
  });
} else {
  dot?.remove();
  ring?.remove();
}

function spawnCursorDrop(x, y) {
  if (!hasDesktopCursor) return;
  const drop = document.createElement('span');
  const colors = [cssVar('--cursor-drop-1'), cssVar('--cursor-drop-2'), cssVar('--cursor-drop-3'), cssVar('--accent')];
  const angle = dropIndex * 2.399 + Math.random() * 0.7;
  const distance = 10 + Math.random() * 22;
  const size = 4 + Math.random() * 7;
  drop.className = 'cursor-drop';
  drop.style.left = x + 'px';
  drop.style.top = y + 'px';
  drop.style.width = size + 'px';
  drop.style.height = size + 'px';
  drop.style.color = colors[dropIndex % colors.length];
  drop.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
  drop.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
  document.body.appendChild(drop);
  dropIndex += 1;
  drop.addEventListener('animationend', () => drop.remove(), { once: true });
}

// ── Particle Canvas ──────────────────────────────────────────
const canvas = document.getElementById('particleCanvas');
const ctx    = canvas.getContext('2d');
let W, H, particles = [], mouse = { x: -9999, y: -9999 };

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

class Particle {
  constructor() { this.reset(true); }
  reset(init = false) {
    this.x  = Math.random() * W;
    this.y  = init ? Math.random() * H : H + 10;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = -(Math.random() * 0.5 + 0.15);
    this.size   = Math.random() * 1.5 + 0.4;
    this.life   = 1;
    this.decay  = Math.random() * 0.002 + 0.0005;
    this.color  = Math.random() > 0.6 ? cssVar('--primary') : cssVar('--accent');
    this.alpha  = Math.random() * 0.6 + 0.2;
  }
  update() {
    // Mouse repulsion
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120) {
      const force = (120 - dist) / 120 * 0.8;
      this.vx += (dx / dist) * force * 0.4;
      this.vy += (dy / dist) * force * 0.4;
    }
    this.x    += this.vx;
    this.y    += this.vy;
    this.life -= this.decay;
    this.vx   *= 0.99;
    this.vy   *= 0.99;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.life * this.alpha;
    ctx.fillStyle   = this.color;
    ctx.shadowBlur  = 6;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Connection lines between nearby particles
function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 90) {
        ctx.save();
        ctx.globalAlpha = (1 - dist / 90) * 0.08;
        ctx.strokeStyle = cssVar('--primary');
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

const PARTICLE_COUNT = 80;
for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  drawConnections();
  particles.forEach((p, i) => {
    p.update(); p.draw();
    if (p.life <= 0 || p.y < -20 || p.x < -50 || p.x > W + 50) {
      particles[i] = new Particle();
    }
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ── Typewriter ───────────────────────────────────────────────
const phrases = [
  'CSE Undergraduate | Student Developer',
  'Android & Firebase Project Builder',
  'AI-Assisted Project Developer',
  'Learning by Building Real Apps',
];
let phraseIdx = 0, charIdx = 0, deleting = false;
const tw = document.getElementById('typewriter');

function typewrite() {
  const phrase = phrases[phraseIdx];
  if (!deleting) {
    tw.innerHTML = phrase.slice(0, ++charIdx) + '<span class="typewriter-cursor"></span>';
    if (charIdx === phrase.length) { deleting = true; setTimeout(typewrite, 2200); return; }
    setTimeout(typewrite, 60);
  } else {
    tw.innerHTML = phrase.slice(0, --charIdx) + '<span class="typewriter-cursor"></span>';
    if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; setTimeout(typewrite, 300); return; }
    setTimeout(typewrite, 35);
  }
}
typewrite();

// ── Scroll Reveal ────────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = el.closest('.skills-grid, .projects-grid, .achievements-grid, .interests-grid')
        ? Array.from(el.parentElement.querySelectorAll('.reveal')).indexOf(el) * 80
        : 0;
      setTimeout(() => el.classList.add('visible'), delay);
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Navbar Scroll ────────────────────────────────────────────
const navbar = document.getElementById('navbar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const now = window.scrollY;
  navbar.classList.toggle('scrolled', now > 50);
  navbar.style.transform = now > lastScroll && now > 200 ? 'translateY(-100%)' : 'translateY(0)';
  lastScroll = now;
});

// ── Mobile Nav ───────────────────────────────────────────────
const toggle = document.getElementById('navToggle');
const links  = document.getElementById('navLinks');
toggle.addEventListener('click', () => links.classList.toggle('open'));
links.querySelectorAll('.nav-link').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

// ── Active Nav Link Highlight ────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.45 });
sections.forEach(s => sectionObserver.observe(s));

// ── Skill card tilt effect ───────────────────────────────────
document.querySelectorAll('.skill-card, .project-card, .achievement-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const x  = (e.clientX - r.left) / r.width  - 0.5;
    const y  = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `translateY(-4px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    card.style.transition = 'transform 0.1s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.4s ease';
  });
});

// ── Glitch text on hero name hover ──────────────────────────
const glitchEls = document.querySelectorAll('.name-line--accent');
glitchEls.forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.style.textShadow = `2px 0 ${getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()}, -2px 0 #ef4444`;
    setTimeout(() => el.style.textShadow = '', 300);
  });
});

// ── Count-up animation for stats ─────────────────────────────
function countUp(el, target, suffix = '') {
  let count = 0;
  const step = target / 50;
  const t = setInterval(() => {
    count = Math.min(count + step, target);
    el.textContent = Math.floor(count) + suffix;
    if (count >= target) clearInterval(t);
  }, 30);
}

const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const num = entry.target;
      const val = num.textContent;
      if (val.includes('60')) countUp(num, 60, '+');
      else if (val.includes('3')) countUp(num, 3, '+');
      statObserver.unobserve(num);
    }
  });
}, { threshold: 0.8 });

document.querySelectorAll('.stat-num').forEach(el => statObserver.observe(el));

// ── Smooth appearance for sections ──────────────────────────
document.querySelectorAll('.section-title').forEach(title => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeUp 0.7s ease both';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  observer.observe(title);
});

console.log('%c⟨ Shuaib /⟩ Portfolio', 'font-family:monospace;font-size:20px;color:#3b82f6;font-weight:bold;');
console.log('%cBuilt with passion and AI assistance 🚀', 'font-family:monospace;font-size:12px;color:#64748b;');
