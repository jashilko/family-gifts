const giftListEl = document.getElementById("gift-list");
const hideGiftedEl = document.getElementById("hide-gifted");
const hideCanceledEl = document.getElementById("hide-canceled");
const tabs = document.querySelectorAll("#tabs a");

// базовый путь (для GitHub Pages)
const basePath = "/family-gifts/";

// если пришли из 404.html
const savedPath = sessionStorage.getItem("redirectPath");
if (savedPath) {
  sessionStorage.removeItem("redirectPath");
  history.replaceState({}, "", `${basePath}${savedPath}`);
}

function getCurrentMember() {
  const path = window.location.pathname.replace(basePath, "").replace(/^\/+|\/+$/g, "");
  return ["kostya", "zhenya", "polina"].includes(path) ? path : "kostya";
}

async function loadGifts(member) {
  giftListEl.innerHTML = "<p>Загрузка...</p>";
  try {
    const response = await fetch(`${basePath}data/${member}.json`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const gifts = await response.json();
    renderGifts(gifts);
  } catch (e) {
    console.error("Ошибка загрузки:", e);
    giftListEl.innerHTML = "<p>Не удалось загрузить список подарков.</p>";
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
        <h3><a href="${g.link}" target="_blank">${g.title}</a></h3>
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

tabs.forEach(tab => tab.addEventListener("click", e => {
  e.preventDefault();
  navigate(tab.dataset.member);
}));

hideGiftedEl.addEventListener("change", () => loadGifts(getCurrentMember()));
hideCanceledEl.addEventListener("change", () => loadGifts(getCurrentMember()));

window.addEventListener("popstate", () => {
  const member = getCurrentMember();
  setActiveTab(member);
  loadGifts(member);
});

// init
const member = getCurrentMember();
setActiveTab(member);
loadGifts(member);
