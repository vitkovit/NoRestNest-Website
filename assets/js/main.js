// NoRestNest landing — nav toggle, the set-rating example, footer year.
// Keep this vanilla — no build step, edit-and-refresh.

(() => {
  const nav = document.querySelector('.site-nav');
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

  // Download dropdown in the header
  const dl = document.querySelector('.nav-dl');
  if (dl) {
    const btn = dl.querySelector('.nav-cta');
    const setOpen = (open) => {
      dl.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!dl.classList.contains('is-open')); });
    document.addEventListener('click', (e) => { if (!dl.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  // Hero example: rate the set, read the next session's prescription.
  // Illustrative numbers only — the app's real increments depend on the
  // exercise type (barbell / bodyweight / timed) and the user's settings.
  const calc = document.getElementById('calc');
  if (calc) {
    const base = { kg: 80, reps: 8 };
    const rules = {
      easy:   { kg: +2.5, reps: 0,  note: '+2.5 kg',         cls: 'up' },
      good:   { kg:  0,   reps: 0,  note: 'hold',            cls: '' },
      hard:   { kg:  0,   reps: 0,  note: 'hold, bank it',   cls: '' },
      failed: { kg: -2.5, reps: 0,  note: '−2.5 kg, back off', cls: 'down' },
    };
    const out = document.getElementById('calc-next');
    const delta = document.getElementById('calc-delta');
    const buttons = Array.from(calc.querySelectorAll('.rate button'));

    const fmt = n => (Number.isInteger(n) ? String(n) : n.toFixed(1));
    const apply = (rate) => {
      const r = rules[rate] || rules.good;
      buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.rate === rate)));
      out.innerHTML = fmt(base.kg + r.kg) + '<small>kg × ' + (base.reps + r.reps) + '</small>';
      delta.textContent = r.note;
      delta.className = 'delta' + (r.cls ? ' ' + r.cls : '');
    };
    buttons.forEach(b => b.addEventListener('click', () => apply(b.dataset.rate)));
  }

  // Footer year
  const year = document.getElementById('y');
  if (year) year.textContent = String(new Date().getFullYear());
})();
