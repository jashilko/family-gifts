// ===== basePath: вычисляем по фактическому URL app.js =====
function getBasePath() {
  // текущий <script> или резервный поиск по имени файла
  const current = document.currentScript || document.querySelector('script[src$="app.js"],script[src*="/app.js"]');
  if (!current) return "/"; // fallback
  const u = new URL(current.src, window.location.origin);
  // отрезаем имя файла -> остаётся каталог, напр. "/family-gifts/"
  return u.pathname.replace(/[^/]+$/, "");
}
const basePath = getBasePath();

// ===== если пришли с 404.html — восстановим путь в адресной строке =====
const savedPath = sessionStorage.getItem("redirectPath");
if (savedPath) {
  sessionStorage.removeItem("redirectPath");
  // чтобы не дёргать лишний раз history, проверим текущий URL после basePath
  const after = window.location.pathname.replace(basePath, "").replace(/^\/+|\/+$/g, "");
  if (after !== savedPath) {
    history.replaceState({}, "", basePath + savedPath);
  }
}

// ===== DOM =====
const giftListEl = document.getElementById("gift-list");
const hideGiftedEl = document.getElementById("hide-gifted");
const hideCanceledEl = document.getElementById("hide-canceled");
const tabs = document.querySelectorAll("#tabs a");

function getCurrentMember() {
  const path = window.location.pathname.replace(basePath, "").replace(/^\/+|\/+$/g, "");
  return ["kostya", "zhenya", "polina"].includes(path) ? path : "kostya";
}

async function loadGifts(member) {
  giftListEl.innerHTML = "<p>Загрузка...</p>";
  const url = `${basePath}data/${member}.json`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} при загрузке ${url}`);
    const gifts = await res.json();
    renderGifts(gifts);
  } catch (err) {
    console.error("[family-gifts] Ошибка:", err);
    giftListEl.innerHTML = `<p>Не удалось загрузить список подарков.</p>`;
  }
}

function renderGifts(gifts) {
  const hideGifted = hideGiftedEl.checked;
  const hideCanceled = hideCanceledEl.checked;

  const filtered = gifts.filter(g => {
    if (hideGifted && g.gifted) return false;
    if (hideCanceled && g.canceled) return false;
    return true;
  });

  if (filtered.length === 0) {
    giftListEl.innerHTML = "<p>Список пуст 🎉</p>";
    return;
  }

  giftListEl.innerHTML = "";
  filtered.forEach(g => {
    const el = document.createElement("div");
    el.className = "gift";
    el.innerHTML = `
      <img src="${g.image}" alt="${g.title}" />
      <div>
        <h3><a href="${g.link}" target="_blank" rel="noopener noreferrer">${g.title}</a></h3>
        <p>Цена: ${g.price}</p>
        ${g.gifted ? "<p>✅ Уже подарен</p>" : ""}
        ${g.canceled ? "<p>❌ Отменён</p>" : ""}
      </div>
    `;
    giftListEl.appendChild(el);
  });
}

function setActiveTab(member) {
  tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.member === member));
}

function navigate(member) {
  history.pushState({}, "", `${basePath}${member}`);
  setActiveTab(member);
  loadGifts(member);
}

// клики по табам
tabs.forEach(tab => tab.addEventListener("click", e => {
  e.preventDefault();
  navigate(tab.dataset.member);
}));

// фильтры
hideGiftedEl.addEventListener("change", () => loadGifts(getCurrentMember()));
hideCanceledEl.addEventListener("change", () => loadGifts(getCurrentMember()));

// переходы по истории
window.addEventListener("popstate", () => {
  const member = getCurrentMember();
  setActiveTab(member);
  loadGifts(member);
});

// init
const member = getCurrentMember();
setActiveTab(member);
loadGifts(member);
