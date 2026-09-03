// IndexedDB ストレージ管理
const DB_NAME = 'CategoryClassifyDB';
const DB_VERSION = 4;
let db = null;

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains('config')) {
        database.createObjectStore('config', { keyPath: 'key' });
      }
      if (!database.objectStoreNames.contains('categories')) {
        database.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
      }
      if (!database.objectStoreNames.contains('items')) {
        database.createObjectStore('items', { keyPath: 'id', autoIncrement: true });
      }
      if (!database.objectStoreNames.contains('history')) {
        database.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = (e) => {
      db = e.target.result;
      resolve();
    };
    request.onerror = (e) => reject(e);
  });
}

function dbGetStore(storeName) {
  return new Promise((resolve) => {
    if (!db) return resolve([]);
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch (e) {
      resolve([]);
    }
  });
}

function dbSaveStore(storeName, items) {
  return new Promise((resolve) => {
    if (!db) return resolve();
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear().onsuccess = () => {
        let remaining = items.length;
        if (remaining === 0) return resolve();
        items.forEach(item => {
          store.put(item).onsuccess = () => {
            remaining--;
            if (remaining === 0) resolve();
          };
        });
      };
      tx.onerror = () => resolve();
    } catch (e) {
      resolve();
    }
  });
}

function dbAddHistory(entry) {
  return new Promise((resolve) => {
    if (!db) return resolve();
    try {
      const tx = db.transaction('history', 'readwrite');
      const store = tx.objectStore('history');
      store.add(entry).onsuccess = () => resolve();
    } catch (e) {
      resolve();
    }
  });
}

function dbClearHistory() {
  return new Promise((resolve) => {
    if (!db) return resolve();
    try {
      const tx = db.transaction('history', 'readwrite');
      const store = tx.objectStore('history');
      store.clear().onsuccess = () => resolve();
    } catch (e) {
      resolve();
    }
  });
}

// 初期カテゴリーデータ
const defaultCategories = [
  { id: 1, name: "やさい", color: "#d4edda", icon: "", enabled: true },
  { id: 2, name: "くだもの", color: "#ffe8d6", icon: "", enabled: true },
  { id: 3, name: "のりもの", color: "#d0ebff", icon: "", enabled: true },
  { id: 4, name: "どうぶつ", color: "#fce8e6", icon: "", enabled: true },
  { id: 6, name: "うみのいきもの", color: "#e7f5ff", icon: "", enabled: true },
  { id: 7, name: "むし", color: "#e6fcf5", icon: "", enabled: true },
  { id: 8, name: "ふく・はきもの", color: "#f3e8ff", icon: "", enabled: true },
  { id: 9, name: "ぶんぼうぐ", color: "#fff3bf", icon: "", enabled: true },
  { id: 10, name: "がっき", color: "#fcc2d7", icon: "", enabled: true },
  { id: 11, name: "しょっき", color: "#e3fafc", icon: "", enabled: true }
];

// 初期アイテムデータ（精査済み全88アイテム）
const defaultItems = [
  // やさい
  { name: "トマト", type: "emoji", value: "🍅", tags: ["やさい"] },
  { name: "なす", type: "emoji", value: "🍆", tags: ["やさい"] },
  { name: "とうもろこし", type: "emoji", value: "🌽", tags: ["やさい"] },
  { name: "ブロッコリー", type: "emoji", value: "🥦", tags: ["やさい"] },
  { name: "にんじん", type: "emoji", value: "🥕", tags: ["やさい"] },
  { name: "じゃがいも", type: "emoji", value: "🥔", tags: ["やさい"] },
  { name: "さつまいも", type: "emoji", value: "🍠", tags: ["やさい"] },
  { name: "えだまめ", type: "emoji", value: "🫛", tags: ["やさい"] },
  { name: "ピーマン", type: "emoji", value: "🫑", tags: ["やさい"] },
  { name: "たまねぎ", type: "emoji", value: "🧅", tags: ["やさい"] },
  { name: "にんにく", type: "emoji", value: "🧄", tags: ["やさい"] },
  { name: "きゅうり", type: "emoji", value: "🥒", tags: ["やさい"] },

  // くだもの
  { name: "りんご", type: "emoji", value: "🍎", tags: ["くだもの"] },
  { name: "いちご", type: "emoji", value: "🍓", tags: ["くだもの"] },
  { name: "バナナ", type: "emoji", value: "🍌", tags: ["くだもの"] },
  { name: "ぶどう", type: "emoji", value: "🍇", tags: ["くだもの"] },
  { name: "みかん", type: "emoji", value: "🍊", tags: ["くだもの"] },
  { name: "すいか", type: "emoji", value: "🍉", tags: ["くだもの"] },
  { name: "もも", type: "emoji", value: "🍑", tags: ["くだもの"] },
  { name: "メロン", type: "emoji", value: "🍈", tags: ["くだもの"] },
  { name: "パイナップル", type: "emoji", value: "🍍", tags: ["くだもの"] },
  { name: "キウイ", type: "emoji", value: "🥝", tags: ["くだもの"] },
  { name: "さくらんぼ", type: "emoji", value: "🍒", tags: ["くだもの"] },
  { name: "レモン", type: "emoji", value: "🍋", tags: ["くだもの"] },

  // のりもの
  { name: "くるま", type: "emoji", value: "🚗", tags: ["のりもの"] },
  { name: "バス", type: "emoji", value: "🚌", tags: ["のりもの"] },
  { name: "でんしゃ", type: "emoji", value: "🚃", tags: ["のりもの"] },
  { name: "しんかんせん", type: "emoji", value: "🚅", tags: ["のりもの"] },
  { name: "きゅうきゅうしゃ", type: "emoji", value: "🚑", tags: ["のりもの"] },
  { name: "しょうぼうしゃ", type: "emoji", value: "🚒", tags: ["のりもの"] },
  { name: "パトカー", type: "emoji", value: "🚓", tags: ["のりもの"] },
  { name: "ひこうき", type: "emoji", value: "✈️", tags: ["のりもの"] },
  { name: "ロケット", type: "emoji", value: "🚀", tags: ["のりもの"] },
  { name: "ヘリコプター", type: "emoji", value: "🚁", tags: ["のりもの"] },
  { name: "ふね", type: "emoji", value: "🚢", tags: ["のりもの"] },
  { name: "じてんしゃ", type: "emoji", value: "🚲", tags: ["のりもの"] },
  { name: "トラクター", type: "emoji", value: "🚜", tags: ["のりもの"] },

  // どうぶつ
  { name: "ねこ", type: "emoji", value: "🐱", tags: ["どうぶつ"] },
  { name: "いぬ", type: "emoji", value: "🐶", tags: ["どうぶつ"] },
  { name: "うさぎ", type: "emoji", value: "🐰", tags: ["どうぶつ"] },
  { name: "くま", type: "emoji", value: "🐻", tags: ["どうぶつ"] },
  { name: "パンダ", type: "emoji", value: "🐼", tags: ["どうぶつ"] },
  { name: "らいおん", type: "emoji", value: "🦁", tags: ["どうぶつ"] },
  { name: "ぞう", type: "emoji", value: "🐘", tags: ["どうぶつ"] },
  { name: "きりん", type: "emoji", value: "🦒", tags: ["どうぶつ"] },
  { name: "さる", type: "emoji", value: "🐵", tags: ["どうぶつ"] },
  { name: "コアラ", type: "emoji", value: "🐨", tags: ["どうぶつ"] },
  { name: "とら", type: "emoji", value: "🐯", tags: ["どうぶつ"] },
  { name: "ぶた", type: "emoji", value: "🐷", tags: ["どうぶつ"] },
  { name: "きつね", type: "emoji", value: "🦊", tags: ["どうぶつ"] },

  // うみのいきもの
  { name: "さかな", type: "emoji", value: "🐟", tags: ["うみのいきもの"] },
  { name: "たこ", type: "emoji", value: "🐙", tags: ["うみのいきもの"] },
  { name: "いか", type: "emoji", value: "🦑", tags: ["うみのいきもの"] },
  { name: "かに", type: "emoji", value: "🦀", tags: ["うみのいきもの"] },
  { name: "えび", type: "emoji", value: "🦐", tags: ["うみのいきもの"] },
  { name: "くじら", type: "emoji", value: "🐳", tags: ["うみのいきもの"] },
  { name: "いるか", type: "emoji", value: "🐬", tags: ["うみのいきもの"] },
  { name: "さめ", type: "emoji", value: "🦈", tags: ["うみのいきもの"] },
  { name: "かめ", type: "emoji", value: "🐢", tags: ["うみのいきもの"] },
  { name: "アザラシ", type: "emoji", value: "🦭", tags: ["うみのいきもの"] },
  { name: "クラゲ", type: "emoji", value: "🪼", tags: ["うみのいきもの"] },
  { name: "かい", type: "emoji", value: "🐚", tags: ["うみのいきもの"] },

  // むし
  { name: "はち", type: "emoji", value: "🐝", tags: ["むし"] },
  { name: "てんとうむし", type: "emoji", value: "🐞", tags: ["むし"] },
  { name: "ちょうちょう", type: "emoji", value: "🦋", tags: ["むし"] },
  { name: "あおむし", type: "emoji", value: "🐛", tags: ["むし"] },
  { name: "アリ", type: "emoji", value: "🐜", tags: ["むし"] },
  { name: "かぶとむし", type: "emoji", value: "🪲", tags: ["むし"] },
  { name: "ばった", type: "emoji", value: "🦗", tags: ["むし"] },

  // ふく・はきもの
  { name: "ぼうし", type: "emoji", value: "🧢", tags: ["ふく・はきもの"] },
  { name: "くつ", type: "emoji", value: "👞", tags: ["ふく・はきもの"] },
  { name: "くつした", type: "emoji", value: "🧦", tags: ["ふく・はきもの"] },
  { name: "シャツ", type: "emoji", value: "👕", tags: ["ふく・はきもの"] },
  { name: "ズボン", type: "emoji", value: "👖", tags: ["ふく・はきもの"] },
  { name: "スカート", type: "emoji", value: "👗", tags: ["ふく・はきもの"] },
  { name: "てぶくろ", type: "emoji", value: "🧤", tags: ["ふく・はきもの"] },
  { name: "ながぐつ", type: "emoji", value: "👢", tags: ["ふく・はきもの"] },
  { name: "スニーカー", type: "emoji", value: "👟", tags: ["ふく・はきもの"] },
  { name: "マフラー", type: "emoji", value: "🧣", tags: ["ふく・はきもの"] },

  // ぶんぼうぐ
  { name: "えんぴつ", type: "emoji", value: "✏️", tags: ["ぶんぼうぐ"] },
  { name: "はさみ", type: "emoji", value: "✂️", tags: ["ぶんぼうぐ"] },
  { name: "クレヨン", type: "emoji", value: "🖍️", tags: ["ぶんぼうぐ"] },
  { name: "ふで", type: "emoji", value: "🖌️", tags: ["ぶんぼうぐ"] },

  // がっき
  { name: "ピアノ", type: "emoji", value: "🎹", tags: ["がっき"] },
  { name: "たいこ", type: "emoji", value: "🥁", tags: ["がっき"] },
  { name: "ラッパ", type: "emoji", value: "🎺", tags: ["がっき"] },
  { name: "ギター", type: "emoji", value: "🎸", tags: ["がっき"] },
  { name: "すず", type: "emoji", value: "🔔", tags: ["がっき"] },
  { name: "バイオリン", type: "emoji", value: "🎻", tags: ["がっき"] },

  // しょっき
  { name: "コップ", type: "emoji", value: "🥛", tags: ["しょっき"] },
  { name: "おさら", type: "emoji", value: "🍽️", tags: ["しょっき"] },
  { name: "スプーン", type: "emoji", value: "🥄", tags: ["しょっき"] },
  { name: "フォーク", type: "emoji", value: "🍴", tags: ["しょっき"] },
  { name: "おわん", type: "emoji", value: "🥣", tags: ["しょっき"] }
];

let appState = {
  config: {
    categoryCount: 2,
    maxVisibleItems: 3,
    totalItemsPerQuestion: 8,
    questionCount: 3,
    showHomeButton: true
  },
  categories: [...defaultCategories],
  items: [...defaultItems]
};

// ゲーム進行状態
let currentGame = {
  currentQuestionIndex: 1,
  totalQuestions: 3,
  activeCategories: [],
  remainingQueue: [],
  slots: [],
  completedCount: 0,
  targetTotalCount: 0,
  sessionMistakes: 0,
  sessionTotalPlaced: 0
};

// 音響エフェクト
let audioCtx = null;
function warmUpAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSound(type) {
  warmUpAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  if (type === 'success') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880.00, now + 0.07);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.start(now);
    osc.stop(now + 0.28);
  } else if (type === 'error') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'clear') {
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(f, now + i * 0.1);
      gain.gain.setValueAtTime(0.2, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  }
}

// カテゴリーアイコン要素生成（常に80px固定・絵文字32pxを死守）
function createCategoryIconElement(cat) {
  const container = document.createElement('div');
  container.className = 'category-icon-box';
  container.style.cssText = `
    width: 80px;
    height: 80px;
    border-radius: 12px;
    background-color: ${cat.color || '#fff'};
    border: 1.5px solid rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  `;

  if (cat.icon) {
    const img = document.createElement('img');
    img.src = cat.icon;
    img.style.cssText = 'width: 100%; height: 100%; object-fit: contain; padding: 4px;';
    container.appendChild(img);
    return container;
  }

  const catItems = appState.items.filter(item => item.tags.includes(cat.name)).slice(0, 3);
  const posStyles = [
    'top: 4px; left: 50%; transform: translateX(-50%); font-size: 32px;',
    'bottom: 4px; left: 6px; font-size: 32px;',
    'bottom: 4px; right: 6px; font-size: 32px;'
  ];

  catItems.forEach((item, idx) => {
    const el = document.createElement('div');
    el.style.cssText = `position: absolute; line-height: 1; ${posStyles[idx]}`;

    if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.value;
      img.style.cssText = 'width: 28px; height: 28px; object-fit: contain;';
      el.appendChild(img);
    } else {
      el.textContent = item.value;
    }
    container.appendChild(el);
  });

  return container;
}

// データロード/セーブ
async function loadData() {
  try {
    await initDB();
    const cats = await dbGetStore('categories');
    const items = await dbGetStore('items');
    const configs = await dbGetStore('config');

    appState.categories = (cats && cats.length > 0) ? cats : [...defaultCategories];
    appState.items = (items && items.length > 0) ? items : [...defaultItems];

    if (configs && configs.length) {
      configs.forEach(c => { appState.config[c.key] = c.value; });
    }

    if (!cats || cats.length === 0) await dbSaveStore('categories', appState.categories);
    if (!items || items.length === 0) await dbSaveStore('items', appState.items);
  } catch (err) {
    console.error("DB読み込みフォールバック:", err);
    appState.categories = [...defaultCategories];
    appState.items = [...defaultItems];
  }

  updateConfigUI();
}

async function saveData() {
  await dbSaveStore('categories', appState.categories);
  await dbSaveStore('items', appState.items);
  const cfgItems = Object.keys(appState.config).map(k => ({ key: k, value: appState.config[k] }));
  await dbSaveStore('config', cfgItems);
}

// ゲーム開始・進行
document.getElementById('btn-start').addEventListener('click', () => {
  warmUpAudio();
  startNewSession();
});

document.getElementById('btn-home').addEventListener('click', () => {
  returnToHome();
});

function returnToHome() {
  document.getElementById('screen-game').classList.add('hidden');
  document.getElementById('screen-start').classList.remove('hidden');
}

function startNewSession() {
  currentGame.currentQuestionIndex = 1;
  currentGame.totalQuestions = appState.config.questionCount;
  currentGame.sessionMistakes = 0;
  currentGame.sessionTotalPlaced = 0;

  document.getElementById('screen-start').classList.add('hidden');
  document.getElementById('screen-game').classList.remove('hidden');

  setupSingleQuestion();
}

function setupSingleQuestion() {
  const oldBtn = document.querySelector('.next-btn-container');
  if (oldBtn) oldBtn.remove();

  const enabledCats = appState.categories.filter(c => c.enabled);
  if (enabledCats.length < 2) {
    alert("カテゴリーを2つ以上有効に設定してください。");
    returnToHome();
    return;
  }

  const shuffledCats = [...enabledCats].sort(() => Math.random() - 0.5);
  currentGame.activeCategories = shuffledCats.slice(0, appState.config.categoryCount);

  const activeNames = currentGame.activeCategories.map(c => c.name);
  const matchedItems = appState.items.filter(item => item.tags.some(t => activeNames.includes(t)));

  if (matchedItems.length === 0) {
    alert("選ばれたカテゴリーに対応するイラストがありません。");
    returnToHome();
    return;
  }

  const shuffledItems = [...matchedItems].sort(() => Math.random() - 0.5);
  const maxPerQ = appState.config.totalItemsPerQuestion;
  const targetNum = maxPerQ === 0 ? shuffledItems.length : Math.min(maxPerQ, shuffledItems.length);

  currentGame.remainingQueue = shuffledItems.slice(0, targetNum);
  currentGame.completedCount = 0;
  currentGame.targetTotalCount = currentGame.remainingQueue.length;
  
  const maxVis = appState.config.maxVisibleItems;
  currentGame.slots = new Array(maxVis).fill(null);

  renderGameBaseUI();
  fillSpawnArea();
}

function renderGameBaseUI() {
  const btnHome = document.getElementById('btn-home');
  if (appState.config.showHomeButton) {
    btnHome.classList.remove('hidden');
  } else {
    btnHome.classList.add('hidden');
  }

  document.getElementById('progress-display').textContent = `${currentGame.completedCount} / ${currentGame.targetTotalCount}`;
  document.getElementById('question-display').textContent = `${currentGame.currentQuestionIndex} / ${currentGame.totalQuestions}問`;

  const targetZones = document.getElementById('target-zones');
  targetZones.innerHTML = '';

  const isCompact = currentGame.activeCategories.length >= 4;
  targetZones.classList.toggle('compact-mode', isCompact);

  currentGame.activeCategories.forEach(cat => {
    const zone = document.createElement('div');
    zone.className = 'target-zone';
    zone.dataset.category = cat.name;
    zone.style.backgroundColor = cat.color;

    const title = document.createElement('div');
    title.className = 'zone-title';

    // 常に80pxのアイコンを生成
    const iconEl = createCategoryIconElement(cat);
    const label = document.createElement('span');
    label.textContent = cat.name;

    title.appendChild(iconEl);
    title.appendChild(label);

    const itemsBox = document.createElement('div');
    itemsBox.className = 'zone-items';

    zone.appendChild(title);
    zone.appendChild(itemsBox);
    targetZones.appendChild(zone);
  });

  document.getElementById('spawn-area').innerHTML = '';
}

// 中央寄せ配置
function fillSpawnArea() {
  const spawnArea = document.getElementById('spawn-area');
  const maxVis = appState.config.maxVisibleItems;
  const rect = spawnArea.getBoundingClientRect();
  const areaWidth = rect.width || window.innerWidth;
  const areaHeight = rect.height || 300;

  const itemWidth = 120;
  const itemHeight = 120;
  const bottomMargin = 40;

  let gap = 20;
  let totalClusterWidth = maxVis * itemWidth + (maxVis - 1) * gap;

  if (totalClusterWidth > areaWidth - 40) {
    gap = Math.max(8, (areaWidth - 40 - maxVis * itemWidth) / Math.max(1, maxVis - 1));
    totalClusterWidth = maxVis * itemWidth + (maxVis - 1) * gap;
  }

  const startX = (areaWidth - totalClusterWidth) / 2;
  const posY = Math.max(10, (areaHeight - itemHeight - bottomMargin) / 2);

  for (let slotIndex = 0; slotIndex < maxVis; slotIndex++) {
    if (currentGame.slots[slotIndex] === null && currentGame.remainingQueue.length > 0) {
      const itemData = currentGame.remainingQueue.shift();

      const posX = startX + slotIndex * (itemWidth + gap);
      const initialPos = { x: Math.round(posX), y: Math.round(posY) };

      const itemEl = document.createElement('div');
      itemEl.className = 'drag-item';

      if (itemData.type === 'image') {
        itemEl.innerHTML = `<img class="drag-content-img" src="${itemData.value}">`;
      } else {
        itemEl.innerHTML = `<div class="drag-content-emoji">${itemData.value}</div>`;
      }

      currentGame.slots[slotIndex] = {
        itemData: itemData,
        element: itemEl,
        initialPos: initialPos
      };

      makeItemDraggable(itemEl, itemData, initialPos, spawnArea, slotIndex);
      spawnArea.appendChild(itemEl);
    }
  }
}

function makeItemDraggable(itemEl, itemData, initialPos, container, slotIndex) {
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  itemEl.style.left = `${initialPos.x}px`;
  itemEl.style.top = `${initialPos.y}px`;

  itemEl.addEventListener('pointerdown', (e) => {
    warmUpAudio();
    isDragging = true;
    itemEl.setPointerCapture(e.pointerId);
    itemEl.classList.add('dragging');

    const rect = itemEl.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
  });

  itemEl.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const containerRect = container.getBoundingClientRect();
    itemEl.style.left = `${e.clientX - containerRect.left - dragOffset.x}px`;
    itemEl.style.top = `${e.clientY - containerRect.top - dragOffset.y}px`;
  });

  const handlePointerEnd = (e) => {
    if (!isDragging) return;
    isDragging = false;
    itemEl.classList.remove('dragging');

    try { itemEl.releasePointerCapture(e.pointerId); } catch (err) {}

    const itemRect = itemEl.getBoundingClientRect();
    const itemCenter = { x: itemRect.left + itemRect.width / 2, y: itemRect.top + itemRect.height / 2 };

    let matchedZone = null;
    document.querySelectorAll('.target-zone').forEach(zone => {
      const zRect = zone.getBoundingClientRect();
      if (itemCenter.x >= zRect.left && itemCenter.x <= zRect.right &&
          itemCenter.y >= zRect.top && itemCenter.y <= zRect.bottom) {
        matchedZone = zone;
      }
    });

    if (matchedZone) {
      const catName = matchedZone.dataset.category;
      if (itemData.tags.includes(catName)) {
        playSound('success');
        itemEl.style.pointerEvents = 'none';

        const itemsBox = matchedZone.querySelector('.zone-items');
        const isCompact = currentGame.activeCategories.length >= 4;
        const targetItemSize = isCompact ? 46 : 72;
        const scaleVal = isCompact ? (46 / 120) : 0.6;

        const existingItems = Array.from(itemsBox.children);
        const firstPositions = existingItems.map(el => el.getBoundingClientRect());

        const dummy = document.createElement('div');
        dummy.style.cssText = `width:${targetItemSize}px; height:${targetItemSize}px; flex-shrink:0;`;
        itemsBox.appendChild(dummy);

        const targetRect = dummy.getBoundingClientRect();
        dummy.remove();

        existingItems.forEach((el, idx) => {
          const lastPos = el.getBoundingClientRect();
          const firstPos = firstPositions[idx];
          const dx = firstPos.left - lastPos.left;
          const dy = firstPos.top - lastPos.top;

          if (dx !== 0 || dy !== 0) {
            el.style.transition = 'none';
            el.style.transform = `translate(${dx}px, ${dy}px)`;
            requestAnimationFrame(() => {
              el.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)';
              el.style.transform = '';
            });
          }
        });

        const spawnRect = container.getBoundingClientRect();
        const startRect = itemEl.getBoundingClientRect();

        const currentX = startRect.left - spawnRect.left;
        const currentY = startRect.top - spawnRect.top;
        const destX = targetRect.left - spawnRect.left + (targetRect.width - 120) / 2;
        const destY = targetRect.top - spawnRect.top + (targetRect.height - 120) / 2;

        itemEl.style.left = `${currentX}px`;
        itemEl.style.top = `${currentY}px`;

        requestAnimationFrame(() => {
          itemEl.style.transition = 'left 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)';
          itemEl.style.left = `${destX}px`;
          itemEl.style.top = `${destY}px`;
          itemEl.style.transform = `scale(${scaleVal})`;
        });

        setTimeout(() => {
          itemEl.style.transition = '';
          itemEl.style.transform = '';
          itemEl.style.left = '';
          itemEl.style.top = '';
          itemsBox.appendChild(itemEl);

          currentGame.slots[slotIndex] = null;
          currentGame.completedCount++;
          currentGame.sessionTotalPlaced++;
          document.getElementById('progress-display').textContent = `${currentGame.completedCount} / ${currentGame.targetTotalCount}`;

          if (currentGame.completedCount >= currentGame.targetTotalCount) {
            setTimeout(() => {
              playSound('clear');
              handleQuestionCompleted();
            }, 100);
          } else {
            fillSpawnArea();
          }
        }, 250);

        return;
      } else {
        currentGame.sessionMistakes++;
        playSound('error');

        itemEl.style.transition = 'top 0.25s ease-out, left 0.25s ease-out';
        itemEl.style.left = `${initialPos.x}px`;
        itemEl.style.top = `${initialPos.y}px`;

        setTimeout(() => {
          itemEl.style.transition = '';
        }, 250);
      }
    } else {
      itemEl.style.transition = 'top 0.25s ease-out, left 0.25s ease-out';
      itemEl.style.left = `${initialPos.x}px`;
      itemEl.style.top = `${initialPos.y}px`;

      setTimeout(() => {
        itemEl.style.transition = '';
      }, 250);
    }
  };

  itemEl.addEventListener('pointerup', handlePointerEnd);
  itemEl.addEventListener('pointercancel', handlePointerEnd);
}

// 1問完了時の判定処理
function handleQuestionCompleted() {
  const container = document.createElement('div');
  container.className = 'next-btn-container';

  const btn = document.createElement('button');
  btn.className = 'btn-main';

  if (currentGame.currentQuestionIndex < currentGame.totalQuestions) {
    btn.textContent = 'つぎへ';
    btn.onclick = () => {
      container.remove();
      currentGame.currentQuestionIndex++;
      setupSingleQuestion();
    };
  } else {
    btn.textContent = 'ホームへ';
    btn.onclick = () => {
      container.remove();
      recordHistory();
      returnToHome();
    };
  }

  container.appendChild(btn);
  document.getElementById('screen-game').appendChild(container);
}

// 履歴の記録
async function recordHistory() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
  
  const historyEntry = {
    date: dateStr,
    questionsCompleted: currentGame.totalQuestions,
    totalImagesPlaced: currentGame.sessionTotalPlaced,
    mistakes: currentGame.sessionMistakes
  };

  await dbAddHistory(historyEntry);
}

// 履歴トリプルタップ処理
let historyTapTimes = [];
document.getElementById('btn-history-trigger').addEventListener('pointerdown', (e) => {
  e.preventDefault();
  const now = Date.now();
  historyTapTimes.push(now);
  historyTapTimes = historyTapTimes.filter(t => now - t <= 600);

  if (historyTapTimes.length >= 3) {
    historyTapTimes = [];
    document.getElementById('modal-history').classList.remove('hidden');
    renderHistoryUI();
  }
});

document.getElementById('btn-close-history').addEventListener('click', () => {
  document.getElementById('modal-history').classList.add('hidden');
});

document.getElementById('btn-clear-history').addEventListener('click', async () => {
  if (confirm("履歴をすべて削除しますか？")) {
    await dbClearHistory();
    await renderHistoryUI();
  }
});

async function renderHistoryUI() {
  const histories = await dbGetStore('history');
  const listEl = document.getElementById('history-list');
  listEl.innerHTML = '';

  if (histories.length === 0) {
    listEl.innerHTML = '<p style="text-align:center; color:#888; padding:20px;">まだ履歴がありません。</p>';
    return;
  }

  histories.reverse().forEach(h => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-date">${h.date}</div>
      <div class="history-stats">解いた問題数: ${h.questionsCompleted} 問</div>
      <div class="history-detail">
        分けたイラスト数: <strong>${h.totalImagesPlaced}</strong> 個 / 間違えた回数: <strong style="color:${h.mistakes > 0 ? '#e03131' : '#495057'}">${h.mistakes}</strong> 回
      </div>
    `;
    listEl.appendChild(card);
  });
}

// 設定トリプルタップ処理
let settingsTapTimes = [];
document.getElementById('btn-settings-trigger').addEventListener('pointerdown', (e) => {
  e.preventDefault();
  const now = Date.now();
  settingsTapTimes.push(now);
  settingsTapTimes = settingsTapTimes.filter(t => now - t <= 600);

  if (settingsTapTimes.length >= 3) {
    settingsTapTimes = [];
    openSettings();
  }
});

function openSettings() {
  document.getElementById('modal-settings').classList.remove('hidden');
  renderSettings();
}

function closeSettingsModal() {
  saveData();
  document.getElementById('modal-settings').classList.add('hidden');
}

document.getElementById('btn-close-settings').addEventListener('click', closeSettingsModal);
document.getElementById('btn-back-play-config').addEventListener('click', closeSettingsModal);

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');

    const targetTab = e.target.dataset.tab;
    ['tab-play-config', 'tab-categories', 'tab-items', 'tab-data'].forEach(id => {
      document.getElementById(id).classList.toggle('hidden', id !== targetTab);
    });
  });
});

function updateConfigUI() {
  document.querySelectorAll('input[name="cfg-cat-count"]').forEach(radio => {
    radio.checked = (parseInt(radio.value) === appState.config.categoryCount);
  });

  document.querySelectorAll('input[name="cfg-visible-count"]').forEach(radio => {
    radio.checked = (parseInt(radio.value) === appState.config.maxVisibleItems);
  });

  document.getElementById('cfg-total-count').value = appState.config.totalItemsPerQuestion;
  document.getElementById('val-total-count').textContent = appState.config.totalItemsPerQuestion === 0 ? "全部" : appState.config.totalItemsPerQuestion;

  document.getElementById('cfg-question-count').value = appState.config.questionCount;
  document.getElementById('val-question-count').textContent = appState.config.questionCount;

  document.getElementById('cfg-show-home').checked = appState.config.showHomeButton;
}

// 設定入力イベントハンドラ
document.querySelectorAll('input[name="cfg-cat-count"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    appState.config.categoryCount = parseInt(e.target.value);
  });
});

document.querySelectorAll('input[name="cfg-visible-count"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    appState.config.maxVisibleItems = parseInt(e.target.value);
  });
});

document.getElementById('cfg-total-count').addEventListener('input', (e) => {
  const val = parseInt(e.target.value);
  appState.config.totalItemsPerQuestion = val;
  document.getElementById('val-total-count').textContent = val === 0 ? "全部" : val;
});

document.getElementById('cfg-question-count').addEventListener('input', (e) => {
  const val = parseInt(e.target.value);
  appState.config.questionCount = val;
  document.getElementById('val-question-count').textContent = val;
});

document.getElementById('cfg-show-home').addEventListener('change', (e) => {
  appState.config.showHomeButton = e.target.checked;
});

function renderSettings() {
  const catList = document.getElementById('category-list');
  catList.innerHTML = '';
  appState.categories.forEach((cat, idx) => {
    const row = document.createElement('div');
    row.className = 'setting-row';

    const iconPreviewEl = createCategoryIconElement(cat);

    const leftContainer = document.createElement('div');
    leftContainer.style.cssText = 'display:flex; align-items:center; gap:10px; flex-wrap:wrap;';

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = cat.color;
    colorPicker.onchange = (e) => {
      appState.categories[idx].color = e.target.value;
      renderSettings();
    };

    const nameSpan = document.createElement('span');
    nameSpan.style.cssText = 'font-weight:bold; min-width:80px;';
    nameSpan.textContent = cat.name;

    const iconBox = document.createElement('div');
    iconBox.style.cssText = 'display:flex; align-items:center; gap:6px;';
    iconBox.appendChild(iconPreviewEl);

    const fileLabel = document.createElement('label');
    fileLabel.className = 'btn-sub';
    fileLabel.style.cssText = 'padding: 2px 8px; font-size: 0.85rem; cursor:pointer;';
    fileLabel.textContent = '変更';
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.className = 'hidden';
    fileInput.onchange = (e) => updateCategoryIcon(idx, e.target);
    fileLabel.appendChild(fileInput);
    iconBox.appendChild(fileLabel);

    if (cat.icon) {
      const delBtn = document.createElement('button');
      delBtn.className = 'btn-sub';
      delBtn.style.cssText = 'padding: 2px 6px; font-size:0.8rem;';
      delBtn.textContent = '削除';
      delBtn.onclick = () => removeCategoryIcon(idx);
      iconBox.appendChild(delBtn);
    }

    leftContainer.appendChild(colorPicker);
    leftContainer.appendChild(nameSpan);
    leftContainer.appendChild(iconBox);

    const rightContainer = document.createElement('div');
    rightContainer.innerHTML = `
      <label style="margin-right:12px;">
        <input type="checkbox" ${cat.enabled ? 'checked' : ''} onchange="appState.categories[${idx}].enabled = this.checked"> 使用
      </label>
      <button class="btn-sub" style="color:red; padding:4px 8px;" onclick="deleteCategory(${idx})">削除</button>
    `;

    row.appendChild(leftContainer);
    row.appendChild(rightContainer);
    catList.appendChild(row);
  });

  const itemList = document.getElementById('item-list');
  itemList.innerHTML = '';
  appState.items.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'setting-row';

    const visualHTML = item.type === 'image' 
      ? `<img src="${item.value}" style="width:40px; height:40px; object-fit:contain;">`
      : `<span style="font-size:2rem;">${item.value}</span>`;

    let tagCheckboxesHTML = appState.categories.map(c => `
      <label style="font-size:0.85rem; margin-right:6px;">
        <input type="checkbox" ${item.tags.includes(c.name) ? 'checked' : ''} 
               onchange="toggleItemTag(${idx}, '${c.name}', this.checked)"> ${c.name}
      </label>
    `).join('');

    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; flex:1;">
        ${visualHTML}
        <span style="font-weight:bold; min-width:80px;">${item.name}</span>
        <div style="display:flex; flex-wrap:wrap;">${tagCheckboxesHTML}</div>
      </div>
      <button class="btn-sub" style="color:red; padding:4px 8px;" onclick="deleteItem(${idx})">削除</button>
    `;
    itemList.appendChild(row);
  });

  const tagsContainer = document.getElementById('new-item-tags');
  tagsContainer.innerHTML = '';
  appState.categories.forEach(cat => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" value="${cat.name}"> ${cat.name}`;
    tagsContainer.appendChild(label);
  });
}

window.updateCategoryIcon = function(idx, inputEl) {
  const file = inputEl.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      appState.categories[idx].icon = e.target.result;
      renderSettings();
    };
    reader.readAsDataURL(file);
  }
};

window.removeCategoryIcon = function(idx) {
  appState.categories[idx].icon = "";
  renderSettings();
};

window.toggleItemTag = function(itemIdx, catName, isChecked) {
  const tags = appState.items[itemIdx].tags;
  if (isChecked) {
    if (!tags.includes(catName)) tags.push(catName);
  } else {
    appState.items[itemIdx].tags = tags.filter(t => t !== catName);
  }
};

window.deleteCategory = function(idx) {
  appState.categories.splice(idx, 1);
  renderSettings();
};

window.deleteItem = function(idx) {
  appState.items.splice(idx, 1);
  renderSettings();
};

let newCatIconBase64 = "";
document.getElementById('new-cat-icon-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      newCatIconBase64 = evt.target.result;
      document.getElementById('cat-icon-preview').innerHTML = `<img src="${newCatIconBase64}" style="width:40px;height:40px;object-fit:contain;margin-top:8px;">`;
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById('btn-add-category').addEventListener('click', () => {
  const nameInput = document.getElementById('new-cat-name');
  const colorInput = document.getElementById('new-cat-color');
  const name = nameInput.value.trim();

  if (name) {
    appState.categories.push({ id: Date.now(), name, color: colorInput.value, icon: newCatIconBase64, enabled: true });
    nameInput.value = '';
    newCatIconBase64 = '';
    document.getElementById('cat-icon-preview').innerHTML = '';
    renderSettings();
  }
});

function toggleInputType(type) {
  document.getElementById('form-emoji').classList.toggle('hidden', type !== 'emoji');
  document.getElementById('form-image').classList.toggle('hidden', type !== 'image');
}

document.getElementById('btn-add-item').addEventListener('click', async () => {
  const inputType = document.querySelector('input[name="input-type"]:checked').value;
  const selectedTags = [];
  document.querySelectorAll('#new-item-tags input:checked').forEach(cb => selectedTags.push(cb.value));

  if (inputType === 'emoji') {
    const emoji = document.getElementById('new-item-emoji').value.trim();
    const name = document.getElementById('new-item-name-emoji').value.trim();
    if (emoji && name) {
      appState.items.push({ id: Date.now(), name, type: 'emoji', value: emoji, tags: selectedTags });
      document.getElementById('new-item-emoji').value = '';
      document.getElementById('new-item-name-emoji').value = '';
      renderSettings();
    }
  } else {
    const files = document.getElementById('new-item-files').files;
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await fileToBase64(file);
        const name = file.name.replace(/\.[^/.]+$/, "");
        appState.items.push({ id: Date.now() + i, name, type: 'image', value: base64, tags: [...selectedTags] });
      }
      document.getElementById('new-item-files').value = '';
      renderSettings();
    }
  }
});

function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

document.getElementById('btn-export-json').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(appState, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'category_classify_backup.json';
  a.click();
});

document.getElementById('file-import-json').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (evt) => {
    try {
      const imported = JSON.parse(evt.target.result);
      if (imported.categories && imported.items) {
        appState = imported;
        await saveData();
        renderSettings();
        updateConfigUI();
        alert("データを正常に復元しました。");
      }
    } catch (err) {
      alert("JSONファイルの読み込みに失敗しました。");
    }
  };
  reader.readAsText(file);
});

document.getElementById('btn-reset-default').addEventListener('click', async () => {
  if (confirm("初期状態に戻しますか？")) {
    appState.categories = [...defaultCategories];
    appState.items = [...defaultItems];
    await saveData();
    renderSettings();
    updateConfigUI();
  }
});

loadData();