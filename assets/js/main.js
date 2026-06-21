// NoRestNest landing — small JS for nav scroll state, mobile toggle,
// scroll-reveal, and hero screenshot carousel rotation.
// Keep this vanilla — no build step, edit-and-refresh.

(() => {
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const toggle = document.querySelector('.nav-toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('.nav-links a').forEach(a => {
      a.addEventListener('click', () => nav.classList.remove('is-open'));
    });
  }

  // IntersectionObserver scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-in'));
  }

  // Hero shot rotation — cycles front position through .shot elements
  const stack = document.querySelector('.shot-stack');
  if (stack) {
    const shots = Array.from(stack.querySelectorAll('.shot'));
    const positions = ['is-side-left', 'is-front', 'is-side-right'];
    let idx = 0;
    const layout = () => {
      shots.forEach((el, i) => {
        positions.forEach(p => el.classList.remove(p));
        const slot = (i - idx + shots.length) % shots.length;
        if (slot < positions.length) el.classList.add(positions[slot]);
        else { el.style.opacity = '0'; el.style.transform = 'translateX(0) scale(.8)'; }
        if (slot < positions.length) { el.style.opacity = ''; el.style.transform = ''; }
      });
    };
    layout();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && shots.length > 3) {
      setInterval(() => { idx = (idx + 1) % shots.length; layout(); }, 3500);
    }
  }

  // Footer year
  const year = document.getElementById('y');
  if (year) year.textContent = String(new Date().getFullYear());
})();
