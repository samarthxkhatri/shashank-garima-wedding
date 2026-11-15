/* ===== EDIT YOUR DETAILS HERE ===== */
const CONFIG = {
  date: '2026-12-11T00:00:00+05:30',            // countdown target
  venue: 'Milan Sundaram Garden, New Vijay Nagar, Indore',
  time: '',                                      // optional, e.g. '7:30 PM' (shown on the reception card)
  families: '',                                  // optional, e.g. 'With the blessings of the Sharma and Verma families'
  whatsapp: '',                                  // optional RSVP number with country code, e.g. '919876543210'
  events: [
    { name: 'Reception', date: '11 December 2026', note: 'Milan Sundaram Garden, New Vijay Nagar, Indore' }
  ]
};
/* ================================== */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

// name letters animate in once the curtains open
$$('[data-split]').forEach(el => {
  const t = el.textContent; el.setAttribute('aria-label', t);
  el.innerHTML = [...t].map((c, i) => c === ' ' ? ' ' : `<span class="ch" style="--i:${i}" aria-hidden="true">${c}</span>`).join('');
});

// curtains + music
const song = $('#song'), music = $('#music');
$('#open').onclick = () => {
  $('#curtain').classList.add('open');
  document.body.classList.replace('locked', 'opened');
  setTimeout(() => $('#curtain').classList.add('gone'), 2300);
  song.volume = 0;
  song.play().then(() => {
    music.hidden = false; music.classList.add('on');
    let v = 0; const f = setInterval(() => { v = Math.min(.8, v + .04); song.volume = v; if (v >= .8) clearInterval(f); }, 150);
  }).catch(() => {});
};
music.onclick = () => { song.paused ? song.play() : song.pause(); music.classList.toggle('on', !song.paused); };

// countdown
const target = new Date(CONFIG.date);
function tick() {
  const d = Math.max(0, target - Date.now());
  const v = { days: d / 864e5 | 0, hours: d / 36e5 % 24 | 0, mins: d / 6e4 % 60 | 0, secs: d / 1e3 % 60 | 0 };
  for (const k in v) {
    const el = $('#' + k), s = String(v[k]).padStart(2, '0');
    if (el.textContent !== s) { el.textContent = s; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  }
}
setInterval(tick, 1000); tick();

// add to calendar (.ics)
$('#cal').onclick = () => {
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding//EN', 'BEGIN:VEVENT',
    'UID:shashank-garima-2026@wedding', 'DTSTAMP:20261115T000000Z',
    'DTSTART;VALUE=DATE:20261211', 'DTEND;VALUE=DATE:20261212',
    'SUMMARY:Shashank & Garima’s Wedding Reception', 'LOCATION:' + CONFIG.venue.replace(/,/g, '\\,'),
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'shashank-garima-wedding.ics'; a.click();
};

// scroll-driven photo story
const story = $('#story'), slides = $$('.slide'), n = slides.length, bar = $('.bar');
function onScroll() {
  const r = story.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))), t = p * n;
  slides.forEach((s, i) => {
    let d = t - i - .5;
    if (i === 0) d = Math.max(d, 0);
    if (i === n - 1) d = Math.min(d, 0);
    const v = Math.min(1, Math.max(0, 1 - (Math.abs(d) - .25) * 4));
    s.style.opacity = v; s.style.visibility = v ? 'visible' : 'hidden';
    if (!calm) s.querySelector('img').style.transform = `scale(${1.08 - d * .08}) translateY(${d * -26}px)`;
  });
  bar.style.transform = `scaleX(${p})`;
  const tl = $('#tl').getBoundingClientRect();
  $('#tl').style.setProperty('--draw', Math.min(1, Math.max(0, (innerHeight * .8 - tl.top) / tl.height)));
}
let raf; addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(onScroll); }, { passive: true });
onScroll();

// timeline + venue
$('#tl').innerHTML = CONFIG.events.map(e =>
  `<li class="rv"><time>${e.date}${CONFIG.time?`<small>${CONFIG.time}</small>`:''}</time><div><h3>${e.name}</h3><p>${e.note}</p></div></li>`).join('');
const q = encodeURIComponent(CONFIG.venue);
$('#dir').href = 'https://www.google.com/maps/dir/?api=1&destination=' + q;
$('#map').src = 'https://maps.google.com/maps?q=' + q + '&output=embed';
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: .3 });
$$('.rv').forEach(el => io.observe(el));

// cursor glow + hero parallax
const glow = $('#glow');
addEventListener('pointermove', e => {
  glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  if (!calm) $('.bg').style.transform = `translate(${(e.clientX / innerWidth - .5) * -24}px,${(e.clientY / innerHeight - .5) * -16}px)`;
}, { passive: true });

// falling petals
if (!calm) {
  const c = $('#petals'), x = c.getContext('2d'), D = Math.min(devicePixelRatio || 1, 2); let W, H;
  const rs = () => { W = c.width = innerWidth * D; H = c.height = innerHeight * D; }; rs(); addEventListener('resize', rs);
  const P = Array.from({ length: 26 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (6 + Math.random() * 9) * D,
    s: .4 + Math.random() * .9, w: Math.random() * 6.28, v: .01 + Math.random() * .02, a: Math.random() * 6.28,
    c: Math.random() < .7 ? '#f2c4a4' : '#fffaf5', o: .5 + Math.random() * .4 }));
  (function f() {
    x.clearRect(0, 0, W, H);
    for (const p of P) {
      p.y += p.s * D; p.w += p.v; p.x += Math.sin(p.w) * .8 * D; p.a += .01;
      if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
      x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.globalAlpha = p.o; x.fillStyle = p.c;
      x.beginPath(); x.ellipse(0, 0, p.r, p.r * .55, 0, 0, 6.28); x.fill(); x.restore();
    }
    requestAnimationFrame(f);
  })();
}

// personal greeting: yoursite.com/?to=Sharma%20Family
const to = new URLSearchParams(location.search).get('to');
if (to) $('#guest').textContent = 'Dear ' + to.slice(0, 40);
if (CONFIG.families) $('.to').textContent = CONFIG.families;

// RSVP via WhatsApp
$('#rsvpForm').onsubmit = e => {
  e.preventDefault(); const f = new FormData(e.target);
  const msg = `Hello! This is ${f.get('n')}. I ${f.get('a')} the reception of Shashank & Garima on 11 December 2026. Guests: ${f.get('g')}.`;
  window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg), '_blank');
};

// share
$('#share').onclick = () => {
  const d = { title: 'Shashank & Garima’s Wedding Reception', text: 'You’re invited! 11 December 2026', url: location.href.split('?')[0] };
  if (navigator.share) navigator.share(d).catch(() => {});
  else navigator.clipboard.writeText(d.url).then(() => { $('#share').textContent = 'Link copied'; });
};

// 3D tilt on photos, magnetic buttons, tap hearts
if (!calm && matchMedia('(hover:hover)').matches) {
  $$('.slide figure').forEach(f => {
    f.addEventListener('pointermove', e => {
      const r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      f.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
    f.addEventListener('pointerleave', () => f.style.transform = '');
  });
  $$('.btn').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
    });
    b.addEventListener('pointerleave', () => b.style.transform = '');
  });
}
addEventListener('pointerdown', e => {
  if (calm || e.target.closest('button,a,input,select,label')) return;
  const h = document.createElement('span'); h.className = 'heart'; h.textContent = '♥';
  h.style.left = e.clientX + 'px'; h.style.top = e.clientY + 'px';
  document.body.append(h); setTimeout(() => h.remove(), 1400);
});
