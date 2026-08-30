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
  // Progression calculator. A direct port of the weight+reps path of the
  // app's ProgressiveOverloadService. Each set is compared to the same set
  // number from the last session — never to an average. The visitor supplies
  // last session's numbers; the engine writes the next one.
  // ---------------------------------------------------------------------
  const engine = document.getElementById('engine');
  if (engine) {
    // Percent change to weight per feel, per profile (from the app).
    const PROFILES = {
      standard:     { easy: 7.5, good: 2.5, hard: 0,   failed: -10 },
      conservative: { easy: 5,   good: 0,   hard: 0,   failed: -5 },
      aggressive:   { easy: 10,  good: 5,   hard: 2.5, failed: -5 },
    };
    const profileSel = document.getElementById('eng-profile');
    const minIn = document.getElementById('eng-min');
    const maxIn = document.getElementById('eng-max');
    const incSel = document.getElementById('eng-inc');
    const legend = document.getElementById('eng-legend');

    const num = (el, fallback) => { const v = parseFloat(el.value); return Number.isFinite(v) ? v : fallback; };
    const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);
    const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(n * 10 % 1 ? 2 : 1));

    const config = () => {
      let min = clamp(Math.round(num(minIn, 8)), 1, 50);
      let max = clamp(Math.round(num(maxIn, 12)), 1, 50);
      if (max < min) [min, max] = [max, min];
      return { pct: PROFILES[profileSel.value] || PROFILES.standard, profile: profileSel.value, min, max, inc: num(incSel, 2.5) };
    };

    const roundToInc = (w, inc) => {
      if (w <= 0) return 0;
      const r = Math.round(w / inc) * inc;
      return r > 0 ? r : inc;
    };

    const suggest = (last, felt, cfg) => {
      const { pct, min, max, inc } = cfg;
      let weight = roundToInc(last.kg * (1 + pct[felt] / 100), inc);
      if (weight === 0 && last.kg > 0) weight = last.kg;

      let reps;
      if (cfg.profile === 'conservative' && felt === 'good') reps = clamp(last.reps + 1, min, max);
      else if (felt === 'failed')       reps = clamp(last.reps - 1, 1, max);
      else if (felt === 'hard')         reps = clamp(last.reps, 1, max);
      else if (last.reps >= max)        reps = min;                 // top of range: reset, weight goes up
      else                              reps = clamp(last.reps + 1, min, max);

      // Double-progression guard: when reps reset to the minimum, the weight
      // must really have gone up and the set's volume must not drop.
      const doubleProg = last.reps >= max && reps === min && felt !== 'failed' && felt !== 'hard';
      if (doubleProg) {
        if (weight <= last.kg) weight = last.kg + inc;
        const prevVol = last.kg * last.reps;
        if (weight * reps < prevVol) reps = Math.min(Math.ceil(prevVol / weight), max);
      }

      let kind, reason;
      if (felt === 'failed') {
        kind = 'down'; reason = `Previous set failed. Reducing weight by ${Math.abs(pct.failed)}%.`;
      } else if (weight > last.kg) {
        kind = 'up';
        reason = felt === 'easy'
          ? `Last set felt easy! Increasing weight by ${pct.easy}%.`
          : `Time to increase weight (+${pct[felt]}%).`;
      } else if (weight < last.kg) {
        kind = 'down'; reason = 'Reducing weight to improve form.';
      } else if (felt === 'hard') {
        kind = 'hold'; reason = 'Previous set was challenging. Maintain current weight.';
      } else {
        kind = 'up'; reason = `Aim for ${reps} reps this set.`;
      }
      return { weight, reps, kind, reason };
    };

    const rows = Array.from(engine.querySelectorAll('.set')).map(row => ({
      row,
      kg: row.querySelector('.kg'),
      reps: row.querySelector('.reps'),
      chips: Array.from(row.querySelectorAll('.feel button')),
      out: row.querySelector('.next'),
      why: row.querySelector('.why'),
      felt: row.dataset.felt || 'good',
    }));

    const renderLegend = (cfg) => {
      const p = cfg.pct;
      const w = (v) => (v > 0 ? `+${v}%` : v < 0 ? `${v}%` : 'hold');
      const goodReps = cfg.profile === 'conservative' ? ', +1 rep' : (p.good > 0 ? ', +1 rep' : '');
      legend.innerHTML =
        `<span><b>Easy</b> ${w(p.easy)} weight</span>` +
        `<span><b>Good</b> ${w(p.good)} weight${goodReps}</span>` +
        `<span><b>Hard</b> ${p.hard > 0 ? w(p.hard) + ' weight' : 'hold'}</span>` +
        `<span><b>Failed</b> ${w(p.failed)} weight, −1 rep</span>`;
    };

    const render = () => {
      const cfg = config();
      renderLegend(cfg);
      rows.forEach(r => {
        r.chips.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.feel === r.felt)));
        const last = { kg: num(r.kg, NaN), reps: Math.round(num(r.reps, NaN)) };
        if (!(last.kg >= 0) || !(last.reps >= 1)) {
          r.out.textContent = '—'; r.out.dataset.kind = 'hold';
          r.why.textContent = 'Enter last session\u2019s weight and reps.';
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
    [profileSel, minIn, maxIn, incSel].forEach(el => el.addEventListener('input', render));
    render();
  }

  // Footer year
  const year = document.getElementById('y');
  if (year) year.textContent = String(new Date().getFullYear());
})();
