// NoRestNest landing — nav toggle, download dropdown, the progression
// example table, footer year. Vanilla — no build step, edit-and-refresh.

(() => {
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
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

  // ---------------------------------------------------------------------
  // Progression calculator (standard settings). Each set is compared to the
  // same set number from the last session. The visitor supplies last
  // session's numbers; the engine writes the next one.
  // ---------------------------------------------------------------------
  const engine = document.getElementById('engine');
  if (engine) {
    const K = { easy: 1.075, good: 1.025, hard: 1, failed: 0.9 };
    const minIn = document.getElementById('eng-min');
    const maxIn = document.getElementById('eng-max');
    const incSel = document.getElementById('eng-inc');

    const num = (el, fallback) => { const v = parseFloat(el.value); return Number.isFinite(v) ? v : fallback; };
    const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);
    const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(n * 10 % 1 ? 2 : 1));

    const config = () => {
      let min = clamp(Math.round(num(minIn, 8)), 1, 50);
      let max = clamp(Math.round(num(maxIn, 12)), 1, 50);
      if (max < min) [min, max] = [max, min];
      return { min, max, inc: num(incSel, 2.5) };
    };

    const roundToInc = (w, inc) => {
      if (w <= 0) return 0;
      const r = Math.round(w / inc) * inc;
      return r > 0 ? r : inc;
    };

    const suggest = (last, felt, cfg) => {
      const { min, max, inc } = cfg;
      let weight = roundToInc(last.kg * K[felt], inc);
      if (weight === 0 && last.kg > 0) weight = last.kg;

      let reps;
      if (felt === 'failed')       reps = clamp(last.reps - 1, 1, max);
      else if (felt === 'hard')    reps = clamp(last.reps, 1, max);
      else if (last.reps >= max)   reps = min;
      else                         reps = clamp(last.reps + 1, min, max);

      const reset = last.reps >= max && reps === min && felt !== 'failed' && felt !== 'hard';
      if (reset) {
        if (weight <= last.kg) weight = last.kg + inc;
        const prevVol = last.kg * last.reps;
        if (weight * reps < prevVol) reps = Math.min(Math.ceil(prevVol / weight), max);
      }

      let kind, reason;
      if (felt === 'failed')          { kind = 'down'; reason = 'Backing off after a failed set.'; }
      else if (weight > last.kg)      { kind = 'up';   reason = felt === 'easy' ? 'Felt easy. Weight goes up.' : 'Time to add weight.'; }
      else if (weight < last.kg)      { kind = 'down'; reason = 'Reducing weight to improve form.'; }
      else if (felt === 'hard')       { kind = 'hold'; reason = 'That was hard. Hold the weight.'; }
      else                            { kind = 'up';   reason = `Aim for ${reps} reps.`; }
      return { weight, reps, kind, reason };
    };

    const rows = Array.from(engine.querySelectorAll('.set')).map(row => ({
      kg: row.querySelector('.kg'),
      reps: row.querySelector('.reps'),
      chips: Array.from(row.querySelectorAll('.feel button')),
      out: row.querySelector('.next'),
      why: row.querySelector('.why'),
      felt: row.dataset.felt || 'good',
    }));

    const render = () => {
      const cfg = config();
      rows.forEach(r => {
        r.chips.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.feel === r.felt)));
        const last = { kg: num(r.kg, NaN), reps: Math.round(num(r.reps, NaN)) };
        if (!(last.kg >= 0) || !(last.reps >= 1)) {
          r.out.textContent = '—'; r.out.dataset.kind = 'hold';
          r.why.textContent = 'Enter last session’s weight and reps.';
          return;
        }
        const s = suggest(last, r.felt, cfg);
        r.out.innerHTML = `${fmt(s.weight)}<small>kg</small> &times; ${s.reps}`;
        r.out.dataset.kind = s.kind;
        r.why.textContent = s.reason;
      });
    };

    rows.forEach(r => {
      r.chips.forEach(b => b.addEventListener('click', () => { r.felt = b.dataset.feel; render(); }));
      [r.kg, r.reps].forEach(el => el.addEventListener('input', render));
    });
    [minIn, maxIn, incSel].forEach(el => el.addEventListener('input', render));
    render();
  }

  // Per-section "Show details" — reveals the folded copy (.more) in that section
  document.querySelectorAll('.sec-more').forEach(btn => {
    const sec = btn.closest('.sec');
    btn.addEventListener('click', () => {
      const open = sec.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  // Footer year
  const year = document.getElementById('y');
  if (year) year.textContent = String(new Date().getFullYear());
})();
