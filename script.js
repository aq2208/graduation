/* ──────────────────────────────────────────────────────────────
   Quỳnh Hương Graduation · Invitation Card
   ────────────────────────────────────────────────────────────── */

/* ── SUPABASE ────────────────────────────────────────────────── */
let db = null;
if (window.SUPABASE_URL && window.SUPABASE_URL.trim()) {
  const { createClient } = window.supabase;
  db = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
}

/* ── STAGE SCALING ───────────────────────────────────────────── */
const stage = document.getElementById('stage');
const PAD = 28;

function applyScale() {
  const s = Math.min(
    (window.innerWidth  - PAD) / 880,
    (window.innerHeight - PAD) / 1180
  );
  stage.style.transform = `scale(${s})`;
}
applyScale();
window.addEventListener('resize', applyScale, { passive: true });

/* ── COUNTDOWN ───────────────────────────────────────────────── */
(function () {
  const TARGET = new Date('2026-06-27T07:30:00+07:00').getTime();
  const pad = n => String(n).padStart(2, '0');
  const $d = document.getElementById('cd-days');
  const $h = document.getElementById('cd-hours');
  const $m = document.getElementById('cd-mins');
  const $s = document.getElementById('cd-secs');

  function tick() {
    let diff = Math.max(0, TARGET - Date.now());
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000);  diff -= h * 3600000;
    const m = Math.floor(diff / 60000);    diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    $d.textContent = pad(d);
    $h.textContent = pad(h);
    $m.textContent = pad(m);
    $s.textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);
})();

/* ── MODAL ───────────────────────────────────────────────────── */
const overlay   = document.getElementById('modal-overlay');
const formWrap  = document.getElementById('modal-form-wrap');
const successEl = document.getElementById('modal-success');

function openModal() {
  overlay.classList.add('open');
}

function closeModal() {
  overlay.classList.remove('open');
  /* reset after transition finishes */
  setTimeout(resetModal, 280);
}

function resetModal() {
  formWrap.style.display = '';
  successEl.style.display = 'none';
  document.getElementById('rsvp-form').reset();

  /* clear attend selection */
  attending = '';
  document.querySelectorAll('.attend-btn').forEach(b => b.classList.remove('selected'));

  /* clear photo */
  selectedFile = null;
  const photoDisp = document.getElementById('photo-display');
  photoDisp.textContent = '';
  photoDisp.style.display = 'none';

  /* reset submit button */
  const btn = document.getElementById('submit-btn');
  btn.disabled = false;
  document.getElementById('submit-text').textContent = 'Send my response';
  document.getElementById('submit-text').style.display = '';
  document.getElementById('submit-loader').style.display = 'none';
}

document.getElementById('rsvp-open-btn').addEventListener('click', openModal);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-close-2').addEventListener('click', closeModal);

overlay.addEventListener('click', e => {
  if (e.target === overlay) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
});

/* ── ATTEND BUTTONS ──────────────────────────────────────────── */
let attending = '';

document.querySelectorAll('.attend-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    attending = btn.dataset.val;
    document.querySelectorAll('.attend-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

/* ── PHOTO UPLOAD ────────────────────────────────────────────── */
let selectedFile = null;
const photoInput = document.getElementById('f-photo');
const photoDisp  = document.getElementById('photo-display');

photoInput.addEventListener('change', () => {
  const f = photoInput.files[0];
  if (!f) return;
  if (f.size > 8 * 1024 * 1024) {
    alert(`${f.name} is over 8 MB — please choose a smaller image.`);
    photoInput.value = '';
    return;
  }
  selectedFile = f;
  photoDisp.textContent = '✓ ' + f.name;
  photoDisp.style.display = '';
});

/* ── RSVP FORM ───────────────────────────────────────────────── */
document.getElementById('rsvp-form').addEventListener('submit', async e => {
  e.preventDefault();

  const name   = document.getElementById('f-name').value.trim();
  const phone  = document.getElementById('f-phone').value.trim();
  const wishes = document.getElementById('f-wishes').value.trim();

  if (!name) {
    document.getElementById('f-name').focus();
    return;
  }

  const submitBtn   = document.getElementById('submit-btn');
  const submitText  = document.getElementById('submit-text');
  const submitLoader = document.getElementById('submit-loader');

  submitBtn.disabled = true;
  submitText.style.display = 'none';
  submitLoader.style.display = '';

  try {
    if (db) {
      /* Insert RSVP row */
      const { data: rsvp, error: rsvpErr } = await db
        .from('rsvp_submissions')
        .insert({ name, message: wishes || null })
        .select('id')
        .single();
      if (rsvpErr) throw rsvpErr;

      /* Upload photo if provided */
      if (selectedFile && rsvp) {
        const ext  = selectedFile.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '');
        const path = `${rsvp.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await db.storage
          .from('memories')
          .upload(path, selectedFile, { cacheControl: '31536000' });
        if (!upErr) {
          const { data: urlData } = db.storage.from('memories').getPublicUrl(path);
          await db.from('memories').insert({ rsvp_id: rsvp.id, image_url: urlData.publicUrl });
        }
      }

    } else {
      /* localStorage fallback */
      try {
        const arr = JSON.parse(localStorage.getItem('qh_rsvps') || '[]');
        arr.push({ name, attending, phone, wishes, ts: Date.now() });
        localStorage.setItem('qh_rsvps', JSON.stringify(arr));
      } catch (_) {}
      await new Promise(r => setTimeout(r, 420));
    }

    /* Show success */
    formWrap.style.display = 'none';
    successEl.style.display = '';

  } catch (err) {
    console.error('RSVP error:', err);
    submitBtn.disabled = false;
    submitText.textContent = 'Try Again';
    submitText.style.display = '';
    submitLoader.style.display = 'none';
  }
});

/* ── BACKGROUND MUSIC ────────────────────────────────────────── */
(function () {
  const audio   = document.getElementById('bg-music');
  const btn     = document.getElementById('music-btn');
  const iconOn  = document.getElementById('music-icon-on');
  const iconOff = document.getElementById('music-icon-off');
  if (!audio) return;

  audio.volume = 0.28;
  let started = false;

  function setMuted(muted) {
    iconOn.style.display  = muted ? 'none' : '';
    iconOff.style.display = muted ? '' : 'none';
    btn.setAttribute('aria-label', muted ? 'Play music' : 'Pause music');
  }

  function tryPlay() {
    if (started) return;
    started = true;
    audio.play().then(() => setMuted(false)).catch(() => { started = false; });
  }

  audio.play()
    .then(() => { started = true; setMuted(false); })
    .catch(() => {
      ['mousedown', 'touchstart', 'keydown', 'pointerdown'].forEach(ev =>
        document.addEventListener(ev, tryPlay, { once: true, passive: true })
      );
    });

  btn.addEventListener('click', e => {
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

/* ── ENVELOPE INTERACTION ────────────────────────────────────── */
(function () {
  const env = document.querySelector('.envelope');
  if (!env) return;

  // Auto-open after 1.2s delay
  setTimeout(() => {
    env.classList.add('open');
  }, 1200);

  // Toggle open/close on click
  env.addEventListener('click', (e) => {
    e.stopPropagation();
    env.classList.toggle('open');
  });
})();

/* ── CARD ZOOM INTERACTION ────────────────────────────────────── */
(function () {
  const cards = document.querySelectorAll('.card');
  const zoomOverlay = document.getElementById('zoom-overlay');
  const zoomContent = document.getElementById('zoom-content');
  const zoomClose = document.getElementById('zoom-close');
  let activeCard = null;
  let activePlaceholder = null;
  let activeStyle = '';

  if (!zoomOverlay || !zoomContent || !zoomClose) return;

  function openZoom(card) {
    if (activeCard) return;

    activeCard = card;
    activeStyle = card.getAttribute('style');

    // Create placeholder in stage
    activePlaceholder = document.createElement('div');
    activePlaceholder.className = 'card-placeholder';
    activePlaceholder.style.display = 'none';
    card.parentNode.insertBefore(activePlaceholder, card);

    // Add zoomed class and move to overlay
    card.classList.add('zoomed-state');
    zoomContent.appendChild(card);

    // Calculate responsive scale based on viewport size
    const w = card.offsetWidth || 392;
    const h = card.offsetHeight || 574;
    const scale = Math.min((window.innerWidth - 32) / w, (window.innerHeight - 64) / h, 1.2);

    card.style.position = 'relative';
    card.style.left = '0';
    card.style.top = '0';
    card.style.margin = '0';
    card.style.transform = `scale(${scale})`;
    card.style.transformOrigin = 'center center';
    card.style.boxShadow = '0 24px 60px rgba(0,0,0,0.65)';
    card.style.zIndex = '10001';

    // Show overlay
    zoomOverlay.style.display = 'flex';
  }

  function closeZoom() {
    if (!activeCard || !activePlaceholder) return;

    // Restore card to original position in stage
    activePlaceholder.parentNode.insertBefore(activeCard, activePlaceholder);
    activePlaceholder.remove();

    // Restore classes and styles
    activeCard.classList.remove('zoomed-state');
    activeCard.setAttribute('style', activeStyle);

    // Clean up references
    activeCard = null;
    activePlaceholder = null;
    activeStyle = '';

    // Hide overlay
    zoomOverlay.style.display = 'none';
  }

  // Bind click events to cards for zoom
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't zoom if already zoomed, or if clicking interactive modal triggers
      if (card.classList.contains('zoomed-state') || e.target.closest('#rsvp-open-btn') || e.target.closest('.venue-pill')) {
        return;
      }
      openZoom(card);
    });
  });

  // Bind close events
  zoomClose.addEventListener('click', closeZoom);
  zoomOverlay.addEventListener('click', (e) => {
    if (e.target === zoomOverlay || e.target === zoomContent) {
      closeZoom();
    }
  });

  // Bind escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && zoomOverlay.style.display === 'flex') {
      closeZoom();
    }
  });
})();
