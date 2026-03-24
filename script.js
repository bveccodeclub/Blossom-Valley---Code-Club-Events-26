/* RESPLANDOR 2026 – Cherry Blossom Edition */

// ━━━━━━ LOADING SCREEN ━━━━━━
(function initLoading() {
  const ls = document.getElementById('loading-screen');
  const bar = document.getElementById('ls-bar');
  const status = document.getElementById('ls-status');
  const petalsC = document.getElementById('loading-petals');
  const ctx = petalsC.getContext('2d');

  petalsC.width = window.innerWidth;
  petalsC.height = window.innerHeight;

  const cx = petalsC.width / 2;
  const cy = petalsC.height / 2;
  const colors = ['#ffb7c5','#ffc8d5','#ff8fab','#ffd6e0','#ff6b9d','#fff0f3','#ffaec9'];

  // Two petal types: ambient drifters + orbit ring petals
  const ambient = Array.from({length: 28}, () => ({
    x: Math.random() * petalsC.width, y: -30 - Math.random() * 200,
    size: Math.random() * 6 + 2, speedY: Math.random() * 1.0 + 0.3,
    speedX: (Math.random() - 0.5) * 1.0, rot: Math.random() * Math.PI * 2,
    rotSpd: (Math.random() - 0.5) * 0.04, sway: Math.random() * Math.PI * 2,
    swaySpd: Math.random() * 0.02 + 0.008, opacity: Math.random() * 0.55 + 0.15,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));

  // Orbit ring petals (circle around flower)
  const orbitCount = 12;
  const orbits = Array.from({length: orbitCount}, (_, i) => ({
    angle: (i / orbitCount) * Math.PI * 2,
    radius: 130 + Math.random() * 40,
    speed: (Math.random() > 0.5 ? 1 : -1) * (0.006 + Math.random() * 0.006),
    size: Math.random() * 5 + 2,
    opacity: 0,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * Math.PI * 2
  }));

  // Burst petals (fly outward at reveal)
  const burst = Array.from({length: 20}, (_, i) => ({
    angle: (i / 20) * Math.PI * 2, speed: 0, maxSpeed: 4 + Math.random() * 6,
    x: cx, y: cy, size: Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: 0, active: false, rot: Math.random() * Math.PI * 2, rotSpd: (Math.random()-.5)*.1
  }));

  let orbitActive = false, burstActive = false, frame = 0;

  function drawPetal(x, y, size, rot, opacity, color) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo(size*.8, -size*.5, size*.8, size*.5, 0, size);
    ctx.bezierCurveTo(-size*.8, size*.5, -size*.8, -size*.5, 0, -size);
    const g = ctx.createRadialGradient(0,0,0,0,0,size);
    g.addColorStop(0,'#fff5f8'); g.addColorStop(1,color);
    ctx.fillStyle = g; ctx.fill(); ctx.restore();
  }

  function renderLoop() {
    ctx.clearRect(0, 0, petalsC.width, petalsC.height);
    frame++;

    // Ambient petals
    ambient.forEach(p => {
      p.sway += p.swaySpd; p.x += p.speedX + Math.sin(p.sway)*.7; p.y += p.speedY; p.rot += p.rotSpd;
      if (p.y > petalsC.height + 20) { p.y = -20; p.x = Math.random() * petalsC.width; }
      drawPetal(p.x, p.y, p.size, p.rot, p.opacity, p.color);
    });

    // Orbit ring
    if (orbitActive) {
      orbits.forEach(o => {
        o.angle += o.speed; o.rot += 0.03;
        if (o.opacity < 0.65) o.opacity += 0.015;
        const ox = cx + Math.cos(o.angle) * o.radius;
        const oy = cy + Math.sin(o.angle) * o.radius;
        drawPetal(ox, oy, o.size, o.rot, o.opacity, o.color);
      });
    }

    // Burst
    if (burstActive) {
      burst.forEach(b => {
        if (!b.active) return;
        b.x += Math.cos(b.angle) * b.speed;
        b.y += Math.sin(b.angle) * b.speed;
        b.speed = Math.min(b.speed + 0.3, b.maxSpeed);
        b.opacity = Math.max(b.opacity - 0.018, 0);
        b.rot += b.rotSpd;
        drawPetal(b.x, b.y, b.size, b.rot, b.opacity, b.color);
      });
    }

    requestAnimationFrame(renderLoop);
  }
  renderLoop();

  // ── GSAP Timeline ──
  const tl = gsap.timeline();

  tl.set('.ls-club,.ls-event,.ls-sub,.ls-status', { opacity:0 })

    // Club name fades + rises in first
    .to('.ls-club', { opacity:1, y:0, duration:.6, ease:'power3.out' }, 0.3)
    .to('.ls-event', { opacity:1, scale:1, duration:.8, ease:'elastic.out(1,.65)' }, 0.8)
    .to('.ls-sub',   { opacity:1, y:0, duration:.5, ease:'power2.out' }, 1.4)
    .to('.ls-status',{ opacity:1, duration:.3 }, 1.8)

    // Status messages
    .call(() => { if(status) status.textContent = 'Loading events...'; }, [], 2.2)
    .call(() => { if(status) status.textContent = 'Blossom Valley loading...'; }, [], 3.0);

  // Set initial y for text
  gsap.set('.ls-club', { y: 24 });
  gsap.set('.ls-event', { scale: 0.75 });
  gsap.set('.ls-sub', { opacity: 0, y: 12 });

  // Progress bar
  const startTime = Date.now();
  const progIv = setInterval(() => {
    const pct = Math.min((Date.now() - startTime) / 3900 * 100, 100);
    bar.style.width = pct + '%';
    if (pct >= 100) clearInterval(progIv);
  }, 80);

  // Burst + reveal at 3.9s
  setTimeout(() => {
    // Trigger petal burst
    burst.forEach(b => { b.active = true; b.opacity = 0.9; b.speed = 1; });
    burstActive = true;

    // Stop orbit fade
    orbits.forEach(o => { o.speed *= 1.8; }); // accelerate outward feel

    // Flash the flower
    gsap.to('.sakura-bloom', { scale:1.35, opacity:0.5, duration:.3, ease:'power2.in' });

    const main = document.getElementById('main-site');
    ls.style.transition = 'opacity .8s ease, transform .8s cubic-bezier(.4,0,.2,1)';
    ls.style.opacity = '0';
    ls.style.transform = 'translateY(-40px)';
    main.style.display = 'block';

    setTimeout(() => {
      ls.style.display = 'none';
      gsap.to(main, { opacity:1, duration:.8, ease:'power2.out' });
    }, 800);
  }, 3900);
})();

// ━━━━━━ MAIN PETAL CANVAS ━━━━━━
function initMainPetals() {
  const canvas = document.getElementById('petal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 18 : 40;
  const colors = ['#ffb7c5','#ffc8d5','#ff8fab','#ffd6e0','#ff6b9d','#fff0f3','#ffaec9'];

  canvas.width = window.innerWidth; canvas.height = window.innerHeight;

  class Petal {
    constructor(init) {
      this.x = Math.random() * canvas.width;
      this.y = init ? Math.random() * canvas.height : -20;
      this.size = Math.random() * 8 + 3; this.speedY = Math.random() * 1.2 + 0.35;
      this.speedX = (Math.random() - 0.5) * 1.2; this.rot = Math.random() * Math.PI * 2;
      this.rotSpd = (Math.random() - 0.5) * 0.04; this.sway = Math.random() * Math.PI * 2;
      this.swaySpd = Math.random() * 0.02 + 0.008; this.opacity = Math.random() * 0.65 + 0.2;
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    reset() { this.y = -20; this.x = Math.random() * canvas.width; }
    update() {
      this.sway += this.swaySpd; this.x += this.speedX + Math.sin(this.sway) * 0.8;
      this.y += this.speedY; this.rot += this.rotSpd;
      if (this.y > canvas.height + 20 || this.x < -30 || this.x > canvas.width + 30) this.reset();
    }
    draw() {
      ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rot); ctx.globalAlpha = this.opacity;
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(this.size * .8, -this.size * .5, this.size * .8, this.size * .5, 0, this.size);
      ctx.bezierCurveTo(-this.size * .8, this.size * .5, -this.size * .8, -this.size * .5, 0, -this.size);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
      g.addColorStop(0, '#fff5f8'); g.addColorStop(1, this.color);
      ctx.fillStyle = g; ctx.fill(); ctx.restore();
    }
  }

  const petals = Array.from({ length: count }, (_, i) => new Petal(true));

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(render);
  }
  render();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  });
}
// Start petals after loading screen
setTimeout(initMainPetals, 3900);

// ━━━━━━ NAVBAR ━━━━━━
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50));

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const s = hamburger.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    s[0].style.transform = 'rotate(45deg) translate(5px,5px)';
    s[1].style.opacity = '0';
    s[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
  } else { s.forEach(x => { x.style.transform = ''; x.style.opacity = ''; }); }
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}));

// ━━━━━━ SCROLL REVEAL ━━━━━━
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

// ━━━━━━ ROTATING HERO TEXT ━━━━━━
(function() {
  const el = document.getElementById('rotating-text');
  if (!el) return;
  const phrases = ['WE TYPE.', 'WE SOLVE.', 'WE WIN.', 'WE RISE.', 'WE COMPETE.'];
  let idx = 0;
  setInterval(() => {
    el.classList.add('fade-out');
    setTimeout(() => { idx = (idx + 1) % phrases.length; el.textContent = phrases[idx]; el.classList.remove('fade-out'); }, 420);
  }, 2200);
})();

// ━━━━━━ WPM COUNTER ━━━━━━
(function() {
  const counter = document.getElementById('wpm-counter');
  const fill = document.getElementById('wpm-fill');
  if (!counter || !fill) return;
  let current = 0, target = 0;
  const speeds = [45,78,112,95,134,88,156,121,67,143,101];
  let si = 0;
  function next() { target = speeds[si++ % speeds.length]; }
  function step() {
    if (current < target) current = Math.min(current + 3, target);
    else if (current > target) current = Math.max(current - 2, target);
    counter.textContent = Math.round(current);
    fill.style.width = (current / 200 * 100) + '%';
    requestAnimationFrame(step);
  }
  next(); step(); setInterval(next, 2000);
})();

// ━━━━━━ KEYBOARD ANIMATION ━━━━━━
(function() {
  const keys = document.querySelectorAll('.kb-key');
  if (!keys.length) return;
  setInterval(() => {
    const k = keys[Math.floor(Math.random() * keys.length)];
    k.style.background = 'rgba(255,107,157,.4)';
    k.style.boxShadow = '0 0 10px rgba(255,107,157,.5)';
    setTimeout(() => { k.style.background = ''; k.style.boxShadow = ''; }, 150);
  }, 110);
})();

// ━━━━━━ PRIZE COUNTER ━━━━━━
(function() {
  const el = document.getElementById('prize-digits');
  if (!el) return;
  const ob = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    let count = 0;
    const target = 6000, step = target / (1800 / 16);
    const iv = setInterval(() => {
      count = Math.min(count + step, target);
      el.textContent = Math.round(count).toLocaleString('en-IN');
      if (count >= target) { clearInterval(iv); el.textContent = '6,000'; }
    }, 16);
    ob.disconnect();
  }, { threshold: 0.5 });
  ob.observe(el);
})();

// ━━━━━━ TERMINAL TYPING ━━━━━━
(function() {
  const cmd = document.getElementById('terminal-cmd');
  if (!cmd) return;
  const msgs = [
    'select --event [TypingQuest | AlgoQuest]',
    'typing-quest --date "24 March" --mode online',
    'algo-quest --date "27 March" --venue CSE_Hall',
    'compete --cherry-blossom-edition --prize ₹6000+'
  ];
  let mi = 0, ci = 0, del = false;
  const term = document.querySelector('.reg-terminal');
  if (!term) return;
  const ob = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    function type() {
      const msg = msgs[mi % msgs.length];
      if (!del) { cmd.textContent = msg.slice(0, ++ci); if (ci === msg.length) { del = true; setTimeout(type, 1800); return; } setTimeout(type, 60); }
      else { cmd.textContent = msg.slice(0, --ci); if (ci === 0) { del = false; mi++; setTimeout(type, 400); return; } setTimeout(type, 30); }
    }
    type(); ob.disconnect();
  }, { threshold: 0.5 });
  ob.observe(term);
})();

// ━━━━━━ PARALAX HERO ━━━━━━
window.addEventListener('scroll', () => {
  const s = window.scrollY;
  const hc = document.querySelector('.hero-content');
  const o1 = document.querySelector('.orb-1');
  const o2 = document.querySelector('.orb-2');
  if (hc) hc.style.transform = `translateY(${s * 0.22}px)`;
  if (o1) o1.style.transform = `translateY(${s * 0.12}px)`;
  if (o2) o2.style.transform = `translateY(${s * -0.08}px)`;
}, { passive: true });

// ━━━━━━ ACTIVE NAV ━━━━━━
const sections = document.querySelectorAll('section[id]');
const navAs = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 130) cur = s.id; });
  navAs.forEach(a => { a.parentElement.classList.toggle('active', a.getAttribute('href') === '#' + cur); });
}, { passive: true });

// ━━━━━━ SMOOTH SCROLL ━━━━━━
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ━━━━━━ GLOW TOGGLE ━━━━━━
const gt = document.getElementById('glow-toggle');
if (gt) { let on = true; gt.addEventListener('click', () => { on = !on; document.body.classList.toggle('glow-reduced', !on); gt.textContent = on ? '✦' : '✧'; }); }

// ━━━━━━ GSAP SCROLL ANIMATIONS ━━━━━━
window.addEventListener('load', () => {
  if (typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.utils.toArray('.event-card').forEach(card => {
    gsap.fromTo(card, { y: 50, opacity: 0 }, {
      y: 0, opacity: 1, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 85%', once: true }
    });
  });
});

// ━━━━━━ BLOOMERS VALLEY AMBIENT MUSIC ━━━━━━
(function initAmbienceMusic() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;

  let audioCtx = null;
  let masterGain = null;
  let reverb = null;
  let padNode = null;
  let padGain = null;
  let scheduleTimer = null;
  let playing = false;

  // Japanese / valley pentatonic scale — D4 root, soft and airy
  const baseFreqs = [
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.00, // A4
    493.88, // B4
    587.33, // D5
    659.25, // E5
    783.99, // G5
    880.00, // A5
  ];

  function buildReverb(ctx) {
    // Impulse response convolution reverb — long, dreamy
    const convolver = ctx.createConvolver();
    const sampleRate = ctx.sampleRate;
    const len = sampleRate * 4; // 4 sec tail
    const buf = ctx.createBuffer(2, len, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.6);
      }
    }
    convolver.buffer = buf;
    return convolver;
  }

  function playNote(freq, startTime, duration) {
    // Soft sine + a slight triangle overtone for warmth
    const osc = audioCtx.createOscillator();
    const harm = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    const harmGain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;
    harm.type = 'triangle';
    harm.frequency.value = freq * 2; // octave overtone

    // Very gentle attack / long decay
    oscGain.gain.setValueAtTime(0, startTime);
    oscGain.gain.linearRampToValueAtTime(0.11, startTime + 0.18);
    oscGain.gain.setValueAtTime(0.11, startTime + 0.18);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    harmGain.gain.setValueAtTime(0, startTime);
    harmGain.gain.linearRampToValueAtTime(0.025, startTime + 0.2);
    harmGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(oscGain);  oscGain.connect(reverb);
    harm.connect(harmGain); harmGain.connect(reverb);

    osc.start(startTime);  osc.stop(startTime + duration);
    harm.start(startTime); harm.stop(startTime + duration);
  }

  function pickNote() {
    // Bias toward lower, calmer notes
    const pool = [...baseFreqs, baseFreqs[0], baseFreqs[1], baseFreqs[3]];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function schedulePhrase() {
    if (!playing || !audioCtx) return;
    const now = audioCtx.currentTime;
    // 2–4 notes per phrase with gentle timing
    const count = 2 + Math.floor(Math.random() * 3);
    let t = now + 0.1 + Math.random() * 0.5;
    for (let i = 0; i < count; i++) {
      const freq = pickNote();
      const dur = 2.0 + Math.random() * 2.5;
      playNote(freq, t, dur);
      t += 0.35 + Math.random() * 0.9;
    }
    // Next phrase in 3–7 seconds — very spacious
    const nextIn = 3000 + Math.random() * 4000;
    scheduleTimer = setTimeout(schedulePhrase, nextIn);
  }

  function startMusic() {
    if (playing) return;
    playing = true;
    audioCtx = new Ctx();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0; // fade in from 0
    masterGain.connect(audioCtx.destination);

    reverb = buildReverb(audioCtx);
    reverb.connect(masterGain);

    // Very subtle low pad — like a breeze in a valley
    padNode = audioCtx.createOscillator();
    padGain = audioCtx.createGain();
    padNode.type = 'sine';
    padNode.frequency.value = 73.42; // D2 drone — barely felt
    padGain.gain.value = 0.018;
    padNode.connect(padGain);
    padGain.connect(masterGain);
    padNode.start();

    // Second detuned pad for warmth
    const pad2 = audioCtx.createOscillator();
    const pad2Gain = audioCtx.createGain();
    pad2.type = 'sine';
    pad2.frequency.value = 73.42 * 1.005; // Slight detune for shimmer
    pad2Gain.gain.value = 0.012;
    pad2.connect(pad2Gain);
    pad2Gain.connect(masterGain);
    pad2.start();

    // Gentle fade-in over 2s
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.80, audioCtx.currentTime + 2);

    schedulePhrase();
  }

  function stopMusic() {
    playing = false;
    clearTimeout(scheduleTimer);
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.2);
      setTimeout(() => { try { audioCtx.close(); } catch(e){} audioCtx = null; }, 1300);
    }
  }

  // Music toggle button
  const btn = document.getElementById('music-toggle');
  const iconOn = document.getElementById('music-icon-on');
  const iconOff = document.getElementById('music-icon-off');

  function updateBtnUI() {
    if(!btn) return;
    if (playing) {
      btn.classList.add('music-on');
      iconOn.style.display = '';
      iconOff.style.display = 'none';
    } else {
      btn.classList.remove('music-on');
      iconOn.style.display = 'none';
      iconOff.style.display = '';
    }
  }

  if (btn) {
    btn.addEventListener('click', () => {
      if (!playing) startMusic();
      else stopMusic();
      updateBtnUI();
    });
  }

  // Attempt to play music exactly on page load immediately
  startMusic();
  updateBtnUI();

  // If the browser strictly blocked the autoplay by suspending the AudioContext, 
  // silently force it to resume the moment the user makes a valid gesture on the webpage.
  const resumeEvents = ['click', 'mousedown', 'touchstart', 'touchend', 'keydown'];
  const forceResume = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    } else if (!playing) {
      // In case startMusic failed entirely
      startMusic();
      updateBtnUI();
    }
    resumeEvents.forEach(e => window.removeEventListener(e, forceResume, { passive: true }));
  };

  resumeEvents.forEach(e => window.addEventListener(e, forceResume, { passive: true, once: true }));

})();

// ━━━━━━ COUNTDOWN TIMERS ━━━━━━
(function initCountdowns() {
  // Typing Quest: 24 March 2026, 7:00 PM IST = 13:30 UTC
  // AlgoQuest:    27 March 2026, 11:30 AM IST = 06:00 UTC
  const events = [
    {
      target: new Date('2026-03-24T13:30:00Z'),
      wrap:   document.getElementById('cd-typing-wrap'),
      label:  document.getElementById('cd-typing-label'),
      d: document.getElementById('cd-t-d'),
      h: document.getElementById('cd-t-h'),
      m: document.getElementById('cd-t-m'),
      s: document.getElementById('cd-t-s'),
    },
    {
      target: new Date('2026-03-27T06:00:00Z'),
      wrap:   document.getElementById('cd-algo-wrap'),
      label:  document.getElementById('cd-algo-label'),
      d: document.getElementById('cd-a-d'),
      h: document.getElementById('cd-a-h'),
      m: document.getElementById('cd-a-m'),
      s: document.getElementById('cd-a-s'),
    }
  ];

  function pad(n) { return String(n).padStart(2, '0'); }

  function animateTick(el, newVal) {
    if (!el || el.textContent === newVal) return;
    el.classList.add('tick');
    setTimeout(() => { el.textContent = newVal; el.classList.remove('tick'); }, 150);
  }

  function tick() {
    const now = Date.now();
    events.forEach(ev => {
      if (!ev.wrap) return;
      const diff = ev.target.getTime() - now;

      if (diff <= 0 && diff > -7200000) {
        ev.wrap.classList.add('cd-live'); ev.wrap.classList.remove('cd-ended');
        ev.label.textContent = '🔴  LIVE NOW';
        [ev.d, ev.h, ev.m, ev.s].forEach(el => animateTick(el, '00'));
      } else if (diff <= -7200000) {
        ev.wrap.classList.add('cd-ended'); ev.wrap.classList.remove('cd-live');
        ev.label.textContent = 'Event has ended';
        [ev.d, ev.h, ev.m, ev.s].forEach(el => animateTick(el, '--'));
      } else {
        ev.wrap.classList.remove('cd-live', 'cd-ended');
        ev.label.textContent = 'Event starts in';
        const t = Math.floor(diff / 1000);
        animateTick(ev.d, pad(Math.floor(t / 86400)));
        animateTick(ev.h, pad(Math.floor((t % 86400) / 3600)));
        animateTick(ev.m, pad(Math.floor((t % 3600) / 60)));
        animateTick(ev.s, pad(t % 60));
      }
    });
  }

  tick();
  setInterval(tick, 1000);
})();

// ━━━━━━ AUTO EVENT REORDER (ended → move down) ━━━━━━
(function initEventReorder() {
  // "Ended" threshold = 2 h after event start (matches countdown logic)
  // Typing Quest: 24 Mar 7 PM IST = 13:30 UTC  →  ended at 15:30 UTC
  // AlgoQuest:    27 Mar 11:30 AM IST = 06:00 UTC  →  ended at 08:00 UTC
  const TYPING_ENDED = new Date('2026-03-24T15:30:00Z').getTime();
  const ALGO_ENDED   = new Date('2026-03-27T08:00:00Z').getTime();

  const typingSection = document.getElementById('typingquest');
  const algoSection   = document.getElementById('algoquest');
  if (!typingSection || !algoSection) return;
  const parent = typingSection.parentElement;

  // ── Stamp helper ──
  function addStamp(section, label) {
    if (section.querySelector('.ev-stamp')) return;
    const card = section.querySelector('.event-card');
    if (!card) return;
    card.classList.add('card-ended');
    const stamp = document.createElement('div');
    stamp.className = 'ev-stamp';
    stamp.innerHTML = `<span class="ev-stamp-text">${label}</span>`;
    card.appendChild(stamp);
  }

  // ── Reorder helper ──
  let reordered = false;
  function doReorder() {
    if (reordered) return;
    reordered = true;

    // Fade both out
    [typingSection, algoSection].forEach(s => {
      s.style.transition = 'opacity .5s ease, transform .5s ease';
      s.style.opacity = '0';
      s.style.transform = 'translateY(20px)';
    });

    setTimeout(() => {
      // Move algoSection before typingSection in DOM
      parent.insertBefore(algoSection, typingSection);

      // Update section labels
      const tLabel = typingSection.querySelector('.section-label');
      const aLabel = algoSection.querySelector('.section-label');
      if (aLabel) aLabel.textContent = '// EVENT I · 27 MARCH 2026 · UPCOMING';
      if (tLabel) tLabel.textContent = '// EVENT II · 24 MARCH 2026 · COMPLETED';

      // Reorder nav links
      const nav = document.getElementById('nav-links');
      if (nav) {
        const tLi = nav.querySelector('a[href="#typingquest"]')?.parentElement;
        const aLi = nav.querySelector('a[href="#algoquest"]')?.parentElement;
        if (tLi && aLi) nav.insertBefore(aLi, tLi);
      }

      // Fade back in
      setTimeout(() => {
        [typingSection, algoSection].forEach(s => {
          s.style.opacity = '1';
          s.style.transform = 'translateY(0)';
        });
      }, 60);
    }, 520);
  }

  function check() {
    const now = Date.now();
    const typingEnded = now >= TYPING_ENDED;
    const algoEnded   = now >= ALGO_ENDED;

    // Stamp ended events
    if (typingEnded) addStamp(typingSection, 'COMPLETED');
    if (algoEnded)   addStamp(algoSection,   'COMPLETED');

    // Reorder: typing ended but algo still upcoming → algo floats up
    if (typingEnded && !algoEnded) doReorder();
  }

  check(); // run immediately on load
  setInterval(check, 30000); // re-check every 30 s
})();



