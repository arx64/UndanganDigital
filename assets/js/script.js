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
      if (!musicOn) startWeddingMusic();
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

const wishesApiUrl = 'https://script.google.com/macros/s/AKfycbxjRnilCyhReRk7N_4Df9ocr23I36-X9tuZJ8jCkWgG4xi1nKuFtQufiAo6Vs4_UD84GQ/exec';
const wishesPerPage = 5;
const wishesRequestUrl = () => `${wishesApiUrl}?t=${Date.now()}`;
let wishes = [];
let wishesPage = 1;

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[char]));

function formatWishTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  const ageSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (ageSeconds < 60) return 'Baru saja';
  if (ageSeconds < 3600) return `${Math.floor(ageSeconds / 60)} menit yang lalu`;
  if (ageSeconds < 86400) return `${Math.floor(ageSeconds / 3600)} jam yang lalu`;
  if (ageSeconds < 172800) return 'Kemarin';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date).replace(',', '');
}

function showToast(message, type = 'success') {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.className = `toast toast--${type} is-visible`;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 3500);
}

function renderWishes() {
  const list = document.querySelector('#wishesList');
  const pagination = document.querySelector('#wishesPagination');
  const totalPages = Math.max(1, Math.ceil(wishes.length / wishesPerPage));
  wishesPage = Math.min(wishesPage, totalPages);
  const start = (wishesPage - 1) * wishesPerPage;
  const pageItems = wishes.slice(start, start + wishesPerPage);

  list.innerHTML = pageItems.length ? pageItems.map((wish) => `
    <article class="wish-card">
      <div class="wish-card__top">
        <div class="wish-card__identity"><span class="wish-card__avatar">${escapeHtml(String(wish.name || '?').charAt(0).toUpperCase())}</span><strong>${escapeHtml(String(wish.name ?? 'Tamu'))}</strong></div>
        <span class="wish-card__attendance">${escapeHtml(wish.attendance)}</span>
      </div>
      <div class="wish-card__body"><span class="wish-card__quote">“</span><p>${escapeHtml(wish.message)}</p></div>
      <div class="wish-card__footer"><span>Dengan doa terbaik</span><span class="wish-card__time">${escapeHtml(formatWishTime(wish.timestamp))}</span><span class="wish-card__heart">♥</span></div>
    </article>
  `).join('') : '<p class="wishes__empty">Belum ada ucapan. Jadilah yang pertama mengirim doa.</p>';

  pagination.innerHTML = totalPages > 1 ? `
    <button type="button" data-page="${wishesPage - 1}" ${wishesPage === 1 ? 'disabled' : ''}>‹</button>
    <span>Halaman ${wishesPage} dari ${totalPages}</span>
    <button type="button" data-page="${wishesPage + 1}" ${wishesPage === totalPages ? 'disabled' : ''}>›</button>
  ` : '';
  pagination.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      wishesPage = Number(button.dataset.page);
      renderWishes();
    });
  });
}

async function loadWishes() {
  const list = document.querySelector('#wishesList');
  list.innerHTML = '<p class="wishes__empty">Memuat ucapan...</p>';
  try {
    const response = await fetch(wishesRequestUrl(), { cache: 'no-store', redirect: 'follow' });
    if (!response.ok) throw new Error('Gagal memuat data');
    const data = await response.json();
    wishes = Array.isArray(data) ? data : [];
    wishesPage = 1;
    renderWishes();
  } catch (error) {
    list.innerHTML = '<p class="wishes__empty">Ucapan belum dapat dimuat. Silakan coba lagi.</p>';
    console.error('Ucapan gagal dimuat:', error);
  }
}

document.querySelector('#rsvpForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.querySelector('#formStatus');
  const submitButton = form.querySelector('button[type="submit"]');
  const payload = {
    name: document.querySelector('#rsvpName').value.trim(),
    attendance: document.querySelector('#attendance').value,
    message: document.querySelector('#message').value.trim(),
  };

  submitButton.disabled = true;
  status.textContent = 'Menyimpan ucapan...';
  try {
    const response = await fetch(wishesApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || 'Ucapan gagal disimpan');
    status.textContent = '';
    showToast('Ucapan berhasil disimpan. Terima kasih!');
    form.reset();
    await loadWishes();
  } catch (error) {
    status.textContent = '';
    showToast(`Ucapan gagal disimpan: ${error.message}`, 'error');
  } finally {
    submitButton.disabled = false;
  }
});

document.querySelector('#refreshWishes').addEventListener('click', loadWishes);
loadWishes();
