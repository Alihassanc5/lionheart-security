/* ============================================================
   LIONHEART SECURITY GROUP LIMITED — Global JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initMobileMenu();
  initScrollReveal();
  initCounters();
  initActiveNav();
  initFormHandlers();
  initHeroParallax();
});

/* 1. Navigation scroll effect */
function initNavigation() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('nav--scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* 2. Mobile menu */
function initMobileMenu() {
  const nav       = document.querySelector('.nav');
  const hamburger = document.querySelector('[data-hamburger]');
  const overlay   = document.querySelector('.nav__mobile-overlay');
  const links     = document.querySelectorAll('.nav__mobile-link');
  if (!nav || !hamburger) return;

  const open  = () => { nav.classList.add('nav--open');    document.body.style.overflow = 'hidden'; hamburger.setAttribute('aria-expanded','true');  };
  const close = () => { nav.classList.remove('nav--open'); document.body.style.overflow = '';       hamburger.setAttribute('aria-expanded','false'); };

  hamburger.addEventListener('click', () => nav.classList.contains('nav--open') ? close() : open());
  overlay?.addEventListener('click', close);
  links.forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* 3. Scroll reveal */
function initScrollReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.dataset.revealDelay || '0', 10);
      setTimeout(() => el.classList.add('is-visible'), delay);
      obs.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

/* 4. Animated counters */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  const ease = t => t * (2 - t);

  const run = (el) => {
    const target   = parseInt(el.dataset.counter, 10);
    const duration = 1800;
    const start    = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(ease(p) * target).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(tick);
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      run(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => obs.observe(el));
}

/* 5. Active nav link */
function initActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(link => {
    const href = link.getAttribute('href');
    const match = href === page || (page === '' && href === 'index.html');
    if (match) {
      link.classList.add('nav__link--active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* 6. Contact form validation & submit */
function initFormHandlers() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const rules = {
    name:     { test: v => v.trim().length >= 2,                           msg: 'Please enter your full name' },
    phone:    { test: v => /^[\d\s\+\-\(\)]{7,}$/.test(v.trim()),         msg: 'Please enter a valid phone number' },
    email:    { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),   msg: 'Please enter a valid email address' },
    service:  { test: v => v !== '' && v !== 'default',                    msg: 'Please select a service' },
    location: { test: v => v.trim().length >= 2,                           msg: 'Please enter your location' },
    message:  { test: v => v.trim().length >= 10,                          msg: 'Please write a message (min 10 characters)' },
  };

  const showErr = (group, msg) => {
    group.classList.add('form-group--error');
    let el = group.querySelector('.form-error');
    if (!el) { el = document.createElement('div'); el.className = 'form-error'; el.setAttribute('role','alert'); group.appendChild(el); }
    el.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${msg}`;
  };
  const clearErr = (group) => {
    group.classList.remove('form-group--error');
    group.querySelector('.form-error')?.remove();
  };

  form.querySelectorAll('.form-input,.form-select,.form-textarea').forEach(input => {
    input.addEventListener('blur', () => {
      const r = rules[input.name]; if (!r) return;
      const g = input.closest('.form-group');
      r.test(input.value) ? clearErr(g) : showErr(g, r.msg);
    });
    input.addEventListener('input', () => {
      const r = rules[input.name]; if (!r) return;
      const g = input.closest('.form-group');
      if (g.classList.contains('form-group--error') && r.test(input.value)) clearErr(g);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('.form-input,.form-select,.form-textarea').forEach(input => {
      const r = rules[input.name]; if (!r) return;
      const g = input.closest('.form-group');
      if (!r.test(input.value)) { showErr(g, r.msg); ok = false; }
    });
    if (!ok) return;

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';

    setTimeout(() => {
      const wrapper = form.closest('.contact-form-wrapper') || form.parentElement;
      form.style.display = 'none';
      const success = document.createElement('div');
      success.className = 'form-success';
      success.innerHTML = `
        <div class="form-success__icon"><i class="fa-solid fa-circle-check"></i></div>
        <h3>Message Sent!</h3>
        <p>Thank you for reaching out. Our team will be in touch within 2 hours.</p>`;
      wrapper.appendChild(success);
    }, 1200);
  });
}

/* 7. Hero parallax (desktop only) */
function initHeroParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;
  const bg = document.querySelector('.hero__bg');
  if (!bg) return;
  window.addEventListener('scroll', () => {
    bg.style.transform = `translateY(${window.scrollY * 0.25}px)`;
  }, { passive: true });
}
