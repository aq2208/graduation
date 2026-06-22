/* ──────────────────────────────────────────────────────────
   Graduation Invitation — Quỳnh Hương · VinUniversity 2026
   ────────────────────────────────────────────────────────── */

/* ── SUPABASE CLIENT ─────────────────────────────────────── */
let db = null;
if (window.SUPABASE_URL && window.SUPABASE_URL.trim() !== '') {
  const { createClient } = window.supabase;
  db = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
}

/* ── AOS ─────────────────────────────────────────────────── */
AOS.init({ duration: 820, easing: 'ease-out', once: true, offset: 70 });

/* ── NAVBAR ──────────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* ── BACKGROUND MUSIC ────────────────────────────────────── */
(function initMusic() {
  const audio   = document.getElementById('bg-music');
  const btn     = document.getElementById('music-btn');
  const iconOn  = document.getElementById('music-icon-on');
  const iconOff = document.getElementById('music-icon-off');
  if (!audio) return;

  audio.volume = 0.28;
  let started  = false;

  const setMuted = (muted) => {
    iconOn.style.display  = muted ? 'none' : '';
    iconOff.style.display = muted ? ''     : 'none';
    btn.classList.toggle('muted', muted);
    btn.setAttribute('aria-label', muted ? 'Play music' : 'Pause music');
  };

  const tryPlay = () => {
    if (started) return;
    started = true;
    audio.play().then(() => setMuted(false)).catch(() => { started = false; });
  };

  /* 1. Try immediately — works if browser allows autoplay */
  audio.play().then(() => { started = true; setMuted(false); }).catch(() => {
    /* 2. On any interaction before a scroll, start instantly */
    ['mousedown', 'touchstart', 'keydown', 'pointerdown'].forEach(ev =>
      document.addEventListener(ev, tryPlay, { once: true, passive: true })
    );
    /* 3. Scroll fallback (already felt quick in practice) */
    document.addEventListener('scroll', tryPlay, { once: true, passive: true });
  });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    started = true;
    if (audio.paused) {
      audio.play().catch(() => {});
      setMuted(false);
    } else {
      audio.pause();
      setMuted(true);
    }
  });
})();

/* ── HERO PARTICLES ──────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');
  const COUNT  = 50;

  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const P = Array.from({ length: COUNT }, () => ({
    x:       Math.random() * window.innerWidth,
    y:       Math.random() * window.innerHeight - window.innerHeight,
    r:       Math.random() * 2.4 + 0.7,
    speed:   Math.random() * 0.5 + 0.18,
    drift:   (Math.random() - 0.5) * 0.32,
    opacity: Math.random() * 0.42 + 0.08,
  }));

  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of P) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,169,110,${p.opacity})`;
      ctx.fill();
      p.y += p.speed;
      p.x += p.drift;
      if (p.y > canvas.height + 10) { p.y = -10; p.x = Math.random() * canvas.width; }
    }
    requestAnimationFrame(tick);
  };
  tick();
})();

/* ── COUNTDOWN ───────────────────────────────────────────── */
(function initCountdown() {
  const TARGET = new Date('2026-06-27T11:30:00+07:00').getTime();
  const grid   = document.getElementById('countdown-grid');
  const done   = document.getElementById('countdown-done');
  const pad    = n => String(n).padStart(2, '0');
  const els    = {
    days: document.getElementById('cd-days'), hours: document.getElementById('cd-hours'),
    minutes: document.getElementById('cd-minutes'), seconds: document.getElementById('cd-seconds'),
  };
  const tick = () => {
    const diff = TARGET - Date.now();
    if (diff <= 0) { grid.style.display = 'none'; done.style.display = 'block'; return; }
    els.days.textContent    = pad(Math.floor(diff / 86400000));
    els.hours.textContent   = pad(Math.floor((diff % 86400000) / 3600000));
    els.minutes.textContent = pad(Math.floor((diff % 3600000) / 60000));
    els.seconds.textContent = pad(Math.floor((diff % 60000) / 1000));
  };
  tick();
  setInterval(tick, 1000);
})();

/* ── WISH LANTERNS ───────────────────────────────────────── */
const Wishes = (() => {
  const KEY        = 'qh_grad_wishes_v1';
  const sky        = document.getElementById('wishes-sky');
  const MAX_ACTIVE = 4;
  let activeCount  = 0;
  let allWishes    = [];

  const SAMPLES = [
    { name: 'From everyone who loves you', message: 'Congratulations Quỳnh Hương! So incredibly proud of you! 🌟' },
    { name: 'Family',      message: 'Your hard work and dedication made this happen. We love you! 💛' },
    { name: 'Best friends', message: 'To new adventures ahead — Class of 2026! 🎓' },
    { name: 'VinUni 2026', message: 'The world is waiting for you. Go shine! ✨' },
  ];

  const loadStored = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  };
  const saveLocal = (wish) => {
    const stored = loadStored();
    stored.push(wish);
    try { localStorage.setItem(KEY, JSON.stringify(stored)); } catch {}
  };
  const esc = str => String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  const spawnLantern = (wish, delay = 0) => {
    if (activeCount >= MAX_ACTIVE) return;
    activeCount++;

    const el    = document.createElement('div');
    el.className = 'wish-lantern';
    const left  = 4 + Math.random() * 74;
    const dur   = 9 + Math.random() * 4; /* 9–13 s — faster than before */

    el.style.left              = `${left}%`;
    el.style.animationDuration = `${dur}s`;
    el.style.animationDelay    = `${delay}s`;

    el.innerHTML = `
      <div class="wish-lantern-inner">
        <span class="wish-icon" aria-hidden="true">🏮</span>
        <div class="wish-name">${esc(wish.name)}</div>
        <div class="wish-message">${esc(wish.message)}</div>
      </div>`;

    sky.appendChild(el);

    setTimeout(() => {
      el.remove();
      activeCount--;
      setTimeout(() => spawnLantern(wish, 0), 600 + Math.random() * 4000);
    }, (dur + delay) * 1000);
  };

  const init = async () => {
    let dbWishes = [];

    /* Load from Supabase if configured */
    if (db) {
      try {
        const { data } = await db
          .from('rsvp_submissions')
          .select('name, message')
          .not('message', 'is', null)
          .order('created_at', { ascending: false })
          .limit(30);
        if (data) dbWishes = data.map(r => ({ name: r.name, message: r.message }));
      } catch {}

      /* Real-time: new submissions auto-launch a lantern */
      db.channel('wishes-rt')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rsvp_submissions' },
          payload => {
            const { name, message } = payload.new;
            if (message) { allWishes.push({ name, message }); spawnLantern({ name, message }); }
          })
        .subscribe();
    }

    const stored = loadStored();
    allWishes = dbWishes.length > 0
      ? [...SAMPLES, ...dbWishes]   /* DB has real submissions — mix with samples */
      : [...SAMPLES, ...stored];    /* Fallback to localStorage */

    allWishes.forEach((w, i) => setTimeout(() => spawnLantern(w, 0), i * 2500));
  };

  const addWish = (wish) => {
    saveLocal(wish);
    allWishes.push(wish);
    spawnLantern(wish, 0);
  };

  return { init, addWish };
})();

/* ── GALLERY ─────────────────────────────────────────────── */
const Gallery = (() => {
  const grid    = document.getElementById('gallery-grid');
  const hintEl  = document.getElementById('gallery-hint');
  const MAX_PH  = 9; /* placeholder slots to show when empty */

  const renderPlaceholders = (count = MAX_PH) => {
    grid.innerHTML = Array.from({ length: count }, () =>
      `<div class="gallery-item"><div class="gallery-placeholder"><span>📸</span></div></div>`
    ).join('');
  };

  const addImage = (url, prepend = false) => {
    /* Remove a placeholder if any remain */
    const ph = grid.querySelector('.gallery-placeholder');
    if (ph) ph.closest('.gallery-item').remove();

    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `<img src="${url}" alt="Memory" loading="lazy">`;

    if (prepend) grid.prepend(div);
    else          grid.appendChild(div);
  };

  const init = async () => {
    renderPlaceholders();
    if (!db) return;

    try {
      grid.innerHTML = `<div class="gallery-loading">Loading memories...</div>`;
      const { data, error } = await db
        .from('memories')
        .select('image_url')
        .order('created_at', { ascending: false })
        .limit(18);

      if (error) throw error;

      if (!data || data.length === 0) {
        renderPlaceholders();
        return;
      }

      grid.innerHTML = '';
      data.forEach(r => addImage(r.image_url, false));
      hintEl.textContent = 'Share your photos in the RSVP below — they\'ll appear here instantly!';

      /* Real-time: new photos appear immediately */
      db.channel('memories-rt')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'memories' },
          payload => addImage(payload.new.image_url, true))
        .subscribe();

    } catch {
      renderPlaceholders();
    }
  };

  return { init, addImage };
})();

/* ── FILE UPLOAD UI ──────────────────────────────────────── */
(function initFileUpload() {
  const input   = document.getElementById('memory-files');
  const preview = document.getElementById('file-preview');
  const dropEl  = document.getElementById('file-drop');
  if (!input) return;

  let selectedFiles = [];

  const renderPreview = () => {
    preview.innerHTML = '';
    selectedFiles.forEach((file, i) => {
      const url   = URL.createObjectURL(file);
      const wrap  = document.createElement('div');
      wrap.className = 'file-preview-item';
      wrap.innerHTML = `
        <img src="${url}" alt="${file.name}">
        <button class="remove-file" data-idx="${i}" aria-label="Remove photo" title="Remove">✕</button>`;
      preview.appendChild(wrap);
    });

    preview.querySelectorAll('.remove-file').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedFiles.splice(Number(btn.dataset.idx), 1);
        renderPreview();
      });
    });
  };

  input.addEventListener('change', () => {
    const newFiles = Array.from(input.files).filter(f => f.size <= 8 * 1024 * 1024);
    const oversized = Array.from(input.files).filter(f => f.size > 8 * 1024 * 1024);
    if (oversized.length) alert(`${oversized.map(f=>f.name).join(', ')} ${oversized.length>1?'are':'is'} over 8 MB and will be skipped.`);
    selectedFiles = [...selectedFiles, ...newFiles];
    renderPreview();
    input.value = '';
  });

  /* Drag & drop visual cue */
  dropEl.addEventListener('dragover', (e) => { e.preventDefault(); dropEl.classList.add('dragover'); });
  dropEl.addEventListener('dragleave', () => dropEl.classList.remove('dragover'));
  dropEl.addEventListener('drop', (e) => {
    e.preventDefault();
    dropEl.classList.remove('dragover');
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    selectedFiles = [...selectedFiles, ...dropped];
    renderPreview();
  });

  /* Expose selected files for the form handler */
  window._getSelectedFiles = () => selectedFiles;
  window._clearSelectedFiles = () => { selectedFiles = []; renderPreview(); };
})();

/* ── RSVP FORM ───────────────────────────────────────────── */
(function initRSVP() {
  const form       = document.getElementById('rsvp-form');
  const successEl  = document.getElementById('rsvp-success');
  const submitBtn  = document.getElementById('rsvp-submit');
  const progressEl = document.getElementById('upload-progress');
  const fillEl     = document.getElementById('progress-fill');
  const labelEl    = document.getElementById('progress-label');

  const setProgress = (pct, text) => {
    fillEl.style.width  = `${pct}%`;
    labelEl.textContent = text;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = document.getElementById('rsvp-name').value.trim();
    const message = document.getElementById('rsvp-message').value.trim();
    const files   = (window._getSelectedFiles || (() => []))();

    if (!name) { document.getElementById('rsvp-name').focus(); return; }

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    try {
      /* ── Path A: Supabase configured ─────────────────────── */
      if (db) {
        /* 1. Insert RSVP row */
        const { data: rsvp, error: rsvpErr } = await db
          .from('rsvp_submissions')
          .insert({ name, message: message || null })
          .select('id')
          .single();
        if (rsvpErr) throw rsvpErr;

        /* 2. Upload images */
        if (files.length > 0) {
          progressEl.style.display = 'block';
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext  = file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g,'');
            const path = `${rsvp.id}/${Date.now()}-${i}.${ext}`;
            setProgress(Math.round((i / files.length) * 80), `Uploading photo ${i + 1} of ${files.length}...`);

            const { error: upErr } = await db.storage.from('memories').upload(path, file, { cacheControl: '31536000' });
            if (!upErr) {
              const { data: urlData } = db.storage.from('memories').getPublicUrl(path);
              await db.from('memories').insert({ rsvp_id: rsvp.id, image_url: urlData.publicUrl });
              /* Immediately show in gallery */
              Gallery.addImage(urlData.publicUrl, true);
            }
          }
          setProgress(100, 'Done!');
          setTimeout(() => { progressEl.style.display = 'none'; }, 800);
        }

      /* ── Path B: No Supabase — localStorage fallback ───── */
      } else {
        /* Nothing to persist server-side; lanterns + gallery work locally */
        await new Promise(r => setTimeout(r, 500)); /* small delay for UX */
      }

      /* Success */
      form.style.display = 'none';
      successEl.style.display = 'block';
      window._clearSelectedFiles && window._clearSelectedFiles();

      confetti({
        particleCount: 140, spread: 90, origin: { y: 0.65 },
        colors: ['#C9A96E','#E8C98C','#FDF6EC','#0A1F44','#ffffff'],
      });

      /* Launch wish lantern */
      if (message) {
        Wishes.addWish({ name, message });
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 1600);
      }

    } catch (err) {
      console.error('RSVP error', err);
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtn.querySelector('.btn-text').textContent = 'Try Again';
      progressEl.style.display = 'none';
    }
  });
})();

/* ── INIT ────────────────────────────────────────────────── */
Gallery.init();
Wishes.init();
