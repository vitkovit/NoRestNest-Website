// NoRestNest landing — nav toggle, download dropdown, the progression
// example table, footer year. Vanilla — no build step, edit-and-refresh.

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

  // ---------------------------------------------------------------------
  // Progression example. A direct port of the weight+reps path of the app's
  // ProgressiveOverloadService (standard profile). Each set is compared to the
  // same set number from the last session — never to an average.
  // ---------------------------------------------------------------------
  const engine = document.getElementById('engine');
  if (engine) {
    const PCT = { easy: 7.5, good: 2.5, hard: 0, failed: -10 };   // standard profile
    const INC = 2.5;                                                 // plate increment, kg
    const RANGE = { min: 8, max: 12 };                               // target rep range

    const roundToInc = (w) => {
      if (w <= 0) return 0;
      const r = Math.round(w / INC) * INC;
      return r > 0 ? r : INC;
    };
    const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

    const suggest = (last, felt) => {
      let weight = roundToInc(last.kg * (1 + PCT[felt] / 100));
      if (weight === 0 && last.kg > 0) weight = last.kg;

      let reps;
      if (felt === 'failed')      reps = clamp(last.reps - 1, 1, RANGE.max);
      else if (felt === 'hard')   reps = clamp(last.reps, 1, RANGE.max);
      else if (last.reps >= RANGE.max) reps = RANGE.min;             // top of range: reset, weight goes up
      else                        reps = clamp(last.reps + 1, RANGE.min, RANGE.max);

      // Double-progression guard: when reps reset to the minimum, the weight
      // must really have gone up and the set's volume must not drop.
      const doubleProg = last.reps >= RANGE.max && reps === RANGE.min && felt !== 'failed' && felt !== 'hard';
      if (doubleProg) {
        if (weight <= last.kg) weight = last.kg + INC;
        const prevVol = last.kg * last.reps;
        if (weight * reps < prevVol) reps = Math.min(Math.ceil(prevVol / weight), RANGE.max);
      }

      let kind, reason;
      if (felt === 'failed') {
        kind = 'down'; reason = `Previous set failed. Reducing weight by ${Math.abs(PCT.failed)}%.`;
      } else if (weight > last.kg) {
        kind = 'up';
        reason = felt === 'easy'
          ? `Last set felt easy! Increasing weight by ${PCT.easy}%.`
          : `Time to increase weight (+${PCT.good}%).`;
      } else if (weight < last.kg) {
        kind = 'down'; reason = 'Reducing weight to improve form.';
      } else if (felt === 'hard') {
        kind = 'hold'; reason = 'Previous set was challenging. Maintain current weight.';
      } else {
        kind = 'up'; reason = `Aim for ${reps} reps this set.`;
      }
      return { weight, reps, kind, reason };
    };

    const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

    engine.querySelectorAll('.set').forEach(row => {
      const last = { kg: parseFloat(row.dataset.kg), reps: parseInt(row.dataset.reps, 10) };
      const chips = Array.from(row.querySelectorAll('.feel button'));
      const out = row.querySelector('.next');
      const why = row.querySelector('.why');

      const apply = (felt) => {
        chips.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.feel === felt)));
        const s = suggest(last, felt);
        out.innerHTML = `${fmt(s.weight)}<small>kg</small> &times; ${s.reps}`;
        out.dataset.kind = s.kind;
        why.textContent = s.reason;
      };
      chips.forEach(b => b.addEventListener('click', () => apply(b.dataset.feel)));
      apply(row.dataset.felt || 'good');
    });
  }

  // Footer year
  const year = document.getElementById('y');
  if (year) year.textContent = String(new Date().getFullYear());
})();
