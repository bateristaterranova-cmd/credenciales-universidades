// PWA ID Card - Logic & Interactivity

const DEFAULT_DATA = {
  firstName: 'LEONARDO VALENTIN',
  lastName: 'HUAMANI ROMERO',
  career: 'Adm. y Negoc. Internacionales',
  level: 'Pregrado',
  status: 'ACTIVO',
  studentCode: 'N00409105',
  photoUrl: 'assets/avatar.png'
};

const MONTH_NAMES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

// Current State
let studentData = { ...DEFAULT_DATA };
let deferredPrompt = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderCard();
  startClockAndDate();
  setupEventListeners();
  registerServiceWorker();
  setupPWAInstall();
});

// Load data from LocalStorage
function loadData() {
  try {
    const saved = localStorage.getItem('credencial_student_data');
    if (saved) {
      studentData = { ...DEFAULT_DATA, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error loading stored data:', e);
  }
}

// Save data to LocalStorage
function saveData() {
  try {
    localStorage.setItem('credencial_student_data', JSON.stringify(studentData));
  } catch (e) {
    console.error('Error saving data to localStorage:', e);
  }
}

// Render Card Content
function renderCard() {
  const nameEl = document.getElementById('studentName');
  const careerEl = document.getElementById('studentCareer');
  const levelEl = document.getElementById('studentLevel');
  const statusEl = document.getElementById('studentStatus');
  const photoEl = document.getElementById('studentPhoto');
  const statusBadge = document.getElementById('statusBadge');

  if (nameEl) {
    nameEl.innerHTML = `${escapeHtml(studentData.firstName)}<br/>${escapeHtml(studentData.lastName)}`;
  }
  if (careerEl) {
    careerEl.textContent = studentData.career;
  }
  if (levelEl) {
    levelEl.textContent = studentData.level;
  }
  if (statusEl) {
    statusEl.textContent = studentData.status;
  }
  if (photoEl) {
    photoEl.src = studentData.photoUrl || 'assets/avatar.png';
  }

  // Status badge styling
  if (statusBadge) {
    if (studentData.status.toUpperCase() === 'ACTIVO') {
      statusBadge.className = 'bg-brandGreen text-textGreen font-bold px-3 py-1 rounded-md flex items-center gap-1.5 mb-4 shadow-xs text-[13px] tracking-wide';
      statusBadge.querySelector('i').className = 'fa-solid fa-circle-check text-xs';
    } else {
      statusBadge.className = 'bg-red-100 text-red-700 font-bold px-3 py-1 rounded-md flex items-center gap-1.5 mb-4 shadow-xs text-[13px] tracking-wide';
      statusBadge.querySelector('i').className = 'fa-solid fa-circle-xmark text-xs';
    }
  }

  renderBarcode(studentData.studentCode || 'N00409105');
}

// Render barcode (crisp SVG)
function renderBarcode(code) {
  const barcodeSvg = document.getElementById('barcodeSvg');
  if (!barcodeSvg) return;

  if (typeof JsBarcode === 'function') {
    try {
      JsBarcode('#barcodeSvg', code, {
        format: 'CODE128',
        lineColor: '#000000',
        width: 2.2,
        height: 48,
        displayValue: false,
        margin: 0,
        background: 'transparent'
      });
      return;
    } catch (err) {
      console.warn('JsBarcode format error, falling back to simulated pattern', err);
    }
  }

  // Standalone fallback SVG barcode pattern
  renderFallbackBarcode(barcodeSvg, code);
}

// Deterministic fallback barcode generator in case CDN is unreachable offline
function renderFallbackBarcode(svg, text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) & 0xffffffff;
  }

  // Pre-determined realistic barcode bar sequence
  const pattern = [
    3, 1, 4, 1, 2, 3, 1, 4, 1, 2, 2, 4, 1, 3, 1, 4, 2, 2, 1, 3,
    2, 4, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 1, 2, 2, 4, 1, 3, 2, 4,
    1, 2, 3, 1, 4, 2, 2, 1, 3, 2, 4, 1, 3, 1, 2, 4, 1, 2, 3, 1
  ];

  let x = 4;
  let svgContent = '';
  for (let i = 0; i < pattern.length; i++) {
    const w = (pattern[i] % 3) + 1.2;
    if (i % 2 === 0) {
      svgContent += `<rect x="${x}" y="0" width="${w}" height="48" fill="#000" />`;
    }
    x += w + 1.8;
  }
  svg.setAttribute('viewBox', `0 0 ${Math.ceil(x + 4)} 48`);
  svg.innerHTML = svgContent;
}

// Live real-time Clock & Spanish Date of Today
function startClockAndDate() {
  const clockEl = document.getElementById('liveClock');
  const dateEl = document.getElementById('currentDate');

  function update() {
    const now = new Date();

    // 1. Time (HH:MM:SS) 24h format
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    if (clockEl) {
      clockEl.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // 2. Date of Today in Spanish (e.g. "20 agosto 2026")
    const day = now.getDate();
    const month = MONTH_NAMES_ES[now.getMonth()];
    const year = now.getFullYear();

    if (dateEl) {
      dateEl.textContent = `${day} ${month} ${year}`;
    }
  }

  update();
  setInterval(update, 1000);
}

// Event Listeners for Modal & Customization
function setupEventListeners() {
  const modal = document.getElementById('editModal');
  const openBtn = document.getElementById('openEditBtn');
  const closeBtn = document.getElementById('closeEditBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const saveBtn = document.getElementById('saveEditBtn');
  const resetBtn = document.getElementById('resetDefaultBtn');
  const photoInput = document.getElementById('photoInput');
  const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  // Open modal
  if (openBtn) {
    openBtn.addEventListener('click', openModal);
  }

  // Also double click or long press card to open modal
  const cardElement = document.getElementById('idCard');
  if (cardElement) {
    let timer = null;
    cardElement.addEventListener('dblclick', openModal);
    cardElement.addEventListener('touchstart', () => {
      timer = setTimeout(openModal, 1200);
    });
    cardElement.addEventListener('touchend', () => {
      if (timer) clearTimeout(timer);
    });
  }

  // Close modal
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Close on outside click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Save changes
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      studentData.firstName = document.getElementById('inputFirstName').value.trim() || DEFAULT_DATA.firstName;
      studentData.lastName = document.getElementById('inputLastName').value.trim() || DEFAULT_DATA.lastName;
      studentData.career = document.getElementById('inputCareer').value.trim() || DEFAULT_DATA.career;
      studentData.level = document.getElementById('inputLevel').value.trim() || DEFAULT_DATA.level;
      studentData.status = document.getElementById('inputStatus').value.trim() || DEFAULT_DATA.status;
      studentData.studentCode = document.getElementById('inputCode').value.trim() || DEFAULT_DATA.studentCode;

      saveData();
      renderCard();
      closeModal();
      showToast('¡Datos guardados correctamente!');
    });
  }

  // Reset to default
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('¿Restablecer todos los datos originales de Leonardo Valentin?')) {
        studentData = { ...DEFAULT_DATA };
        saveData();
        renderCard();
        populateModalForm();
        closeModal();
        showToast('Valores restablecidos a los originales');
      }
    });
  }

  // Photo upload
  if (uploadPhotoBtn && photoInput) {
    uploadPhotoBtn.addEventListener('click', () => photoInput.click());

    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        // Compress & resize image to maintain fast local storage performance
        compressImage(event.target.result, 360, 360, (compressedBase64) => {
          studentData.photoUrl = compressedBase64;
          document.getElementById('modalPhotoPreview').src = compressedBase64;
        });
      };
      reader.readAsDataURL(file);
    });
  }

  // Fullscreen button
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullScreen);
  }
}

function openModal() {
  populateModalForm();
  const modal = document.getElementById('editModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeModal() {
  const modal = document.getElementById('editModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function populateModalForm() {
  document.getElementById('inputFirstName').value = studentData.firstName;
  document.getElementById('inputLastName').value = studentData.lastName;
  document.getElementById('inputCareer').value = studentData.career;
  document.getElementById('inputLevel').value = studentData.level;
  document.getElementById('inputStatus').value = studentData.status;
  document.getElementById('inputCode').value = studentData.studentCode;
  document.getElementById('modalPhotoPreview').src = studentData.photoUrl || 'assets/avatar.png';
}

// Compress Image Helper
function compressImage(srcBase64, maxWidth, maxHeight, callback) {
  const img = new Image();
  img.src = srcBase64;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;

    // Crop to square from center
    const size = Math.min(width, height);
    const startX = (width - size) / 2;
    const startY = (height - size) / 2;

    canvas.width = maxWidth;
    canvas.height = maxHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, startX, startY, size, size, 0, 0, maxWidth, maxHeight);

    callback(canvas.toDataURL('image/jpeg', 0.88));
  };
}

// Fullscreen toggle
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.log('Error attempting fullscreen:', err);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// Toast notification helper
function showToast(message) {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg z-50 transition-opacity duration-300 opacity-0 pointer-events-none';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove('opacity-0');
  toast.classList.add('opacity-100');

  setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0');
  }, 2500);
}

// Escape HTML helper
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Register Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .then((reg) => console.log('Service Worker registered:', reg.scope))
        .catch((err) => console.log('Service Worker registration failed:', err));
    });
  }
}

// PWA Installation Support
function setupPWAInstall() {
  const installBtn = document.getElementById('pwaInstallBtn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
      installBtn.classList.remove('hidden');
    }
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted PWA installation');
        }
        deferredPrompt = null;
        installBtn.classList.add('hidden');
      } else {
        showToast('Para instalar: usa el menú de tu navegador "Agregar a pantalla principal"');
      }
    });
  }

  window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.classList.add('hidden');
    showToast('¡App instalada con éxito!');
  });
}
