if (window.AOS) {
  AOS.init({
    once: false,
    duration: 900,
    easing: 'ease-out-cubic',
    offset: 90,
    mirror: true,
  });
} else {
  document.querySelectorAll('[data-aos]').forEach((element) => element.classList.add('aos-animate'));
}

const cover = document.querySelector('#cover');
const openButton = document.querySelector('#openInvitation');
const musicButton = document.querySelector('#musicButton');
const appNav = document.querySelector('#appNav');
const appNavItems = document.querySelectorAll('.app-nav__item');
const guestName = document.querySelector('#guestName');

const guest = new URLSearchParams(window.location.search).get('to');
if (guest) guestName.textContent = guest.replace(/[<>]/g, '');

openButton.addEventListener('click', () => {
  cover.classList.add('is-open');
  document.body.classList.add('invitation-open');
  appNav.classList.add('is-visible');
  document.querySelector('#invitation').scrollIntoView({ behavior: 'smooth' });
});

const coverObserver = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      document.body.classList.remove('invitation-open');
      appNav.classList.remove('is-visible');
    } else {
      document.body.classList.add('invitation-open');
      appNav.classList.add('is-visible');
    }
  },
  { threshold: 0.15 },
);
coverObserver.observe(cover);

appNavItems.forEach((item) => {
  item.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.querySelector(item.getAttribute('href'));
    if (!target) return;

    appNavItems.forEach((navItem) => navItem.classList.remove('app-nav__item--active'));
    item.classList.add('app-nav__item--active');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Pastikan section tidak tertinggal dalam keadaan transform AOS
    window.setTimeout(() => {
      target.classList.add('aos-animate');
      if (window.AOS) AOS.refreshHard();
    }, 650);
  });
});

const sectionTargets = [...appNavItems].map((item) => document.querySelector(item.getAttribute('href'))).filter(Boolean);
const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const active = document.querySelector(`.app-nav__item[href="#${entry.target.id}"]`);
      if (active) {
        appNavItems.forEach((item) => item.classList.remove('app-nav__item--active'));
        active.classList.add('app-nav__item--active');
      }
    });
  },
  { rootMargin: '-35% 0px -55% 0px' },
);
sectionTargets.forEach((section) => navObserver.observe(section));

const weddingMusic = document.querySelector('#weddingMusic');
let musicOn = false;

async function startWeddingMusic() {
  try {
    await weddingMusic.play();
    musicOn = true;
    musicButton.innerHTML = '<i data-feather="pause"></i>';
    if (window.feather) feather.replace();
    musicButton.setAttribute('aria-label', 'Matikan musik');
  } catch (error) {
    musicOn = false;
    musicButton.innerHTML = '<i data-feather="play"></i>';
    if (window.feather) feather.replace();
    console.warn('Musik tidak dapat diputar:', error.message);
  }
}

function stopWeddingMusic() {
  weddingMusic.pause();
  weddingMusic.currentTime = 0;
  musicOn = false;
  musicButton.innerHTML = '<i data-feather="music"></i>';
  if (window.feather) feather.replace();
  musicButton.setAttribute('aria-label', 'Putar musik');
}

openButton.addEventListener('click', () => {
  startWeddingMusic();
});

musicButton.addEventListener('click', () => {
  if (musicOn) stopWeddingMusic();
  else startWeddingMusic();
});

const weddingDate = new Date('2030-09-04T09:00:00+07:00').getTime();
function updateCountdown() {
  const remaining = Math.max(0, weddingDate - Date.now());
  const values = [Math.floor(remaining / 86400000), Math.floor(remaining / 3600000) % 24, Math.floor(remaining / 60000) % 60, Math.floor(remaining / 1000) % 60];
  ['days', 'hours', 'minutes', 'seconds'].forEach((id, index) => {
    document.querySelector(`#${id}`).textContent = String(values[index]).padStart(2, '0');
  });
}
updateCountdown();
setInterval(updateCountdown, 1000);

const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    }),
  { threshold: 0.12 },
);
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.querySelector('#rsvpForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.querySelector('#rsvpName').value.trim();
  const attendance = document.querySelector('#attendance').value;
  const message = document.querySelector('#message').value.trim();
  const text = `Halo Andini & Arifin, saya ${name}. ${attendance}.%0A%0A${message || 'Selamat menempuh hidup baru!'} `;
  const status = document.querySelector('#formStatus');
  status.textContent = 'Membuka WhatsApp untuk mengirim konfirmasi...';
  window.open(`https://wa.me/6285155288330?text=${text}`, '_blank', 'noopener');
});
