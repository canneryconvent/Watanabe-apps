// =============================================================================
// 特別支援学校小学部 指導要領アセスメント コアロジック（表形式完全対応版）
// =============================================================================

let FULL_CURRICULUM = [];
let OFFICIAL_CURRICULUM_STRANDS = [];

const ALL_SUBJECTS = ["生活", "国語", "算数", "音楽", "図画工作", "体育"];

const DOMAIN_DEFS = [
  { name: "🌱 生活", sub: "生活" },
  { name: "📖 国語", sub: "国語" },
  { name: "📐 算数", sub: "算数" },
  { name: "🎵 音楽", sub: "音楽" },
  { name: "🎨 図画工作", sub: "図画工作" },
  { name: "🏃 体育", sub: "体育" }
];

function buildCurriculumDatabase() {
  FULL_CURRICULUM = [
    ...(window.DATA_SEIKATSU || []),
    ...(window.DATA_KOKUGO || []),
    ...(window.DATA_SANSU || []),
    ...(window.DATA_ONGAKU || []),
    ...(window.DATA_ZUKO || []),
    ...(window.DATA_TAIIKU || [])
  ];

  OFFICIAL_CURRICULUM_STRANDS = [
    ...(window.STRANDS_SEIKATSU || []),
    ...(window.STRANDS_KOKUGO || []),
    ...(window.STRANDS_SANSU || []),
    ...(window.STRANDS_ONGAKU || []),
    ...(window.STRANDS_ZUKO || []),
    ...(window.STRANDS_TAIIKU || [])
  ];
}

let students = [
  { id: "student_1", label: "児童生徒①", date: new Date().toISOString().split("T")[0], assessor: "", evalState: {}, memoState: {} }
];
let currentStudentId = "student_1";

let currentMode = "input";
let currentParallelTab = "L_123";
let filterSub = "all";
let filterStage = "all";
let focusedIndex = 0;
let pendingFileContent = null;

function getCurrentStudent() {
  return students.find(s => s.id === currentStudentId) || students[0];
}

window.addEventListener("DOMContentLoaded", () => {
  buildCurriculumDatabase();
  renderStudentSelect();
  loadCurrentStudentMeta();
  renderItemList();
  updateVisuals();
  setupEvents();
  setupKeyboardNav();
});

window.renderStudentSelect = function() {
  const select = document.getElementById("studentSelect");
  if (!select) return;
  select.innerHTML = "";
  students.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.label;
    if (s.id === currentStudentId) opt.selected = true;
    select.appendChild(opt);
  });
};

window.changeStudent = function(id) {
  currentStudentId = id;
  loadCurrentStudentMeta();
  focusedIndex = 0;
  renderItemList();
  updateVisuals();
  if (currentMode === "view") renderParallelView();
};

window.addNewStudent = function() {
  const nextNum = students.length + 1;
  const newId = `student_${Date.now()}`;
  const newLabel = `児童生徒${toCircledNum(nextNum)}`;
  students.push({
    id: newId,
    label: newLabel,
    date: new Date().toISOString().split("T")[0],
    assessor: "",
    evalState: {},
    memoState: {}
  });
  currentStudentId = newId;
  renderStudentSelect();
  loadCurrentStudentMeta();
  renderItemList();
  updateVisuals();
  if (currentMode === "view") renderParallelView();
};

window.deleteCurrentStudent = function() {
  if (students.length <= 1) {
    alert("これ以上削除できません（最低1名のデータが必要です）。");
    return;
  }
  const cur = getCurrentStudent();
  if (confirm(`${cur.label} のデータを削除しますか？`)) {
    students = students.filter(s => s.id !== currentStudentId);
    currentStudentId = students[0].id;
    renderStudentSelect();
    loadCurrentStudentMeta();
    renderItemList();
    updateVisuals();
    if (currentMode === "view") renderParallelView();
  }
};

function toCircledNum(n) {
  const map = ["⓪","①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯","⑰","⑱","⑲","⑳"];
  return map[n] || `(${n})`;
}

function loadCurrentStudentMeta() {
  const cur = getCurrentStudent();
  const elDate = document.getElementById("metaDate");
  const elAssessor = document.getElementById("metaAssessor");
  if (elDate) elDate.value = cur.date || new Date().toISOString().split("T")[0];
  if (elAssessor) elAssessor.value = cur.assessor || "";
}

window.saveCurrentMeta = function() {
  const cur = getCurrentStudent();
  const elDate = document.getElementById("metaDate");
  const elAssessor = document.getElementById("metaAssessor");
  if (elDate) cur.date = elDate.value;
  if (elAssessor) cur.assessor = elAssessor.value;
};

window.setMode = function(mode) {
  currentMode = mode;
  document.getElementById("btnModeInput").classList.toggle("active", mode === "input");
  document.getElementById("btnModeView").classList.toggle("active", mode === "view");
  
  const kbBar = document.getElementById("kbGuideBar");
  if (kbBar) kbBar.style.display = mode === "input" ? "flex" : "none";

  if (mode === "input") {
    document.getElementById("inputLayout").style.display = "grid";
    document.getElementById("viewLayout").style.display = "none";
    renderItemList();
  } else {
    document.getElementById("inputLayout").style.display = "none";
    document.getElementById("viewLayout").style.display = "flex";
    renderParallelView();
  }
};

window.switchParallelView = function(tabType) {
  currentParallelTab = tabType;
  document.querySelectorAll(".view-mode-tabs .tab-btn").forEach(b => {
    b.classList.toggle("active", b.id === `tab_${tabType}`);
  });
  renderParallelView();
};

function getAspectTagInfo(aspect) {
  if (aspect === "知識及び技能") {
    return { cls: "tag-aspect-k", label: "知識・技能" };
  } else if (aspect === "思考力，判断力，表現力等") {
    return { cls: "tag-aspect-t", label: "思考・判断・表現" };
  } else if (aspect === "学びに向かう力，人間性等") {
    return { cls: "tag-aspect-a", label: "学びに向かう力" };
  }
  return { cls: "tag-aspect-k", label: aspect || "観点" };
}

// 並列確認モード（表・スプレッドシート形式）
window.renderParallelView = function() {
  const thead = document.getElementById("parallelTableHead");
  const tbody = document.getElementById("parallelTableBody");
  if (!thead || !tbody) return;
  thead.innerHTML = "";
  tbody.innerHTML = "";

  const cur = getCurrentStudent();

  if (currentParallelTab.endsWith("_123")) {
    const subMap = { "L_123": "生活", "K_123": "国語", "S_123": "算数", "M_123": "音楽", "A_123": "図画工作", "P_123": "体育" };
    const targetSub = subMap[currentParallelTab];

    thead.innerHTML = `
      <tr>
        <th style="width: 220px;">指導要領 内容区分</th>
        <th style="width: 26%;">第1段階</th>
        <th style="width: 26%;">第2段階</th>
        <th style="width: 26%;">第3段階</th>
      </tr>
    `;

    const strands = OFFICIAL_CURRICULUM_STRANDS.filter(s => s.sub === targetSub);

    if (strands.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:30px; color:var(--text-muted);">${targetSub}科のデータファイルを読み込んでください。</td></tr>`;
      return;
    }

    strands.forEach(strand => {
      const tr = document.createElement("tr");
      const th = document.createElement("td");
      th.className = "strand-header-cell";
      th.innerHTML = `
        <div style="font-size:0.7rem; color:var(--accent); font-weight:bold;">${strand.section}</div>
        <div style="font-weight:600;">${strand.domTitle}</div>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">〔${strand.itemCode}〕</div>
      `;
      tr.appendChild(th);

      [1, 2, 3].forEach(st => {
        const td = document.createElement("td");
        const itemId = strand.items[st];
        td.innerHTML = buildTableCellHtml(itemId, st, cur);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

  } else {
    let targetStage = 1;
    if (currentParallelTab === "STAGE_2") targetStage = 2;
    if (currentParallelTab === "STAGE_3") targetStage = 3;

    thead.innerHTML = `
      <tr>
        <th style="width: 16%;">🌱 生活</th>
        <th style="width: 17%;">📖 国語</th>
        <th style="width: 17%;">📐 算数</th>
        <th style="width: 16%;">🎵 音楽</th>
        <th style="width: 17%;">🎨 図画工作</th>
        <th style="width: 17%;">🏃 体育</th>
      </tr>
    `;

    const itemsBySub = {};
    ALL_SUBJECTS.forEach(sub => {
      itemsBySub[sub] = FULL_CURRICULUM.filter(i => i.sub === sub && i.stage === targetStage);
    });

    const maxLen = Math.max(...ALL_SUBJECTS.map(sub => itemsBySub[sub].length));

    for (let idx = 0; idx < maxLen; idx++) {
      const tr = document.createElement("tr");
      ALL_SUBJECTS.forEach(sub => {
        const td = document.createElement("td");
        const item = itemsBySub[sub][idx];
        td.innerHTML = item ? buildTableCellHtml(item.id, targetStage, cur) : `<div style="text-align:center; color:var(--text-muted); padding:10px 0;">―</div>`;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }
  }
};

// 表セル用HTML生成（クリーンなテーブルUI）
function buildTableCellHtml(itemId, stage, student) {
  if (!itemId) return `<div style="text-align:center; color:var(--text-muted); padding:10px 0;">―</div>`;

  const item = FULL_CURRICULUM.find(i => i.id === itemId);
  if (!item) return `<div style="text-align:center; color:var(--text-muted); padding:10px 0;">―</div>`;

  const val = student.evalState[itemId];
  const memo = student.memoState[itemId] || "";
  const aspInfo = getAspectTagInfo(item.aspect);

  let valClass = "lv-none";
  let badgeText = "-";
  let tagClass = "tag-none";

  if (val === 3) { valClass = "lv-3"; badgeText = "◎"; tagClass = "tag-3"; }
  else if (val === 2) { valClass = "lv-2"; badgeText = "◯"; tagClass = "tag-2"; }
  else if (val === 1) { valClass = "lv-1"; badgeText = "△"; tagClass = "tag-1"; }
  else if (val === 0) { valClass = "lv-0"; badgeText = "✖"; tagClass = "tag-0"; }

  return `
    <div style="display:flex; flex-direction:column; gap:4px; height:100%;">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:4px; margin-bottom:2px;">
        <div style="display:flex; gap:3px; align-items:center; flex-wrap:wrap;">
          <span class="tag ${aspInfo.cls}">${aspInfo.label}</span>
          <span class="tag" style="background:var(--bg-main); color:var(--text-muted); border:1px solid var(--border-color);">${item.domLabel}</span>
        </div>
        <span class="p-eval-tag ${tagClass}">${badgeText}</span>
      </div>
      <div style="line-height:1.45; font-size:0.85rem; color:var(--text-main); font-weight:500;">${item.text}</div>
      ${memo ? `<div style="margin-top:auto; font-size:0.75rem; background:var(--bg-main); border-left:2px solid var(--accent); padding:3px 6px; border-radius:3px; color:var(--text-muted);">📝 ${memo}</div>` : ''}
    </div>
  `;
}

function getFilteredItems() {
  const cur = getCurrentStudent();
  const evalFilter = document.getElementById("evalFilter") ? document.getElementById("evalFilter").value : "all";
  return FULL_CURRICULUM.filter(item => {
    if (filterSub !== "all" && item.sub !== filterSub) return false;
    if (filterStage !== "all" && item.stage != filterStage) return false;
    
    const val = cur.evalState[item.id];
    const memo = cur.memoState[item.id];

    if (evalFilter === "unrated") return val === undefined;
    if (evalFilter === "rated") return val !== undefined;
    if (evalFilter === "ng_only") return val === 0;
    if (evalFilter === "has_memo") return memo && memo.trim().length > 0;
    return true;
  });
}

// 表形式（テーブルスタイル）での入力一覧レンダリング
window.renderItemList = function() {
  const container = document.getElementById("itemsList");
  if (!container) return;
  container.innerHTML = "";

  const cur = getCurrentStudent();
  const filtered = getFilteredItems();
  const counterBadge = document.getElementById("counterBadge");
  if (counterBadge) counterBadge.textContent = `表示: ${filtered.length} / 全${FULL_CURRICULUM.length}項目`;

  if (filtered.length === 0) {
    container.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-muted);">該当する項目がありません。</div>`;
    return;
  }

  const table = document.createElement("table");
  table.className = "eval-table";

  table.innerHTML = `
    <thead>
      <tr>
        <th style="width: 165px; text-align: center;">評価 [1-4]</th>
        <th style="width: 140px;">教科 / 段階 / 観点</th>
        <th>指導要領 項目・内容</th>
        <th style="width: 180px;">メモ</th>
      </tr>
    </thead>
    <tbody id="evalTableBody"></tbody>
  `;

  const tbody = table.querySelector("#evalTableBody");

  filtered.forEach((item, index) => {
    const val = cur.evalState[item.id];
    const memo = cur.memoState[item.id] || "";
    const isFocused = (index === focusedIndex) && (currentMode === "input");
    const aspInfo = getAspectTagInfo(item.aspect);

    const tr = document.createElement("tr");
    tr.className = `eval-row ${val !== undefined ? 'lv-' + val : 'lv-none'} ${isFocused ? 'focused' : ''}`;
    tr.id = `row-${item.id}`;
    tr.onclick = () => { focusedIndex = index; updateFocusUI(); };

    tr.innerHTML = `
      <td class="eval-btn-cell" style="text-align: center;">
        <div class="eval-btn-group-sm">
          <button class="eval-btn-sm b-0 ${val === 0 ? 'active' : ''}" title="[キー: 1] ✖" onclick="event.stopPropagation(); setEval('${item.id}', 0, ${index})">
            ✖<span class="key-sub">1</span>
          </button>
          <button class="eval-btn-sm b-1 ${val === 1 ? 'active' : ''}" title="[キー: 2] △" onclick="event.stopPropagation(); setEval('${item.id}', 1, ${index})">
            △<span class="key-sub">2</span>
          </button>
          <button class="eval-btn-sm b-2 ${val === 2 ? 'active' : ''}" title="[キー: 3] ◯" onclick="event.stopPropagation(); setEval('${item.id}', 2, ${index})">
            ◯<span class="key-sub">3</span>
          </button>
          <button class="eval-btn-sm b-3 ${val === 3 ? 'active' : ''}" title="[キー: 4] ◎" onclick="event.stopPropagation(); setEval('${item.id}', 3, ${index})">
            ◎<span class="key-sub">4</span>
          </button>
        </div>
      </td>
      <td style="white-space: nowrap;">
        <div style="display:flex; flex-direction:column; gap:3px; align-items:flex-start;">
          <div style="display:flex; gap:3px;">
            <span class="tag tag-sub-${item.sub}">${item.sub}</span>
            <span class="tag tag-stage tag-stage-${item.stage}">${item.stage}段階</span>
          </div>
          <span class="tag ${aspInfo.cls}">${aspInfo.label}</span>
          <span style="font-size:0.72rem; color:var(--text-muted);">${item.domLabel}</span>
        </div>
      </td>
      <td style="line-height: 1.45;">
        <div style="font-weight: 500;">${item.text}</div>
      </td>
      <td onclick="event.stopPropagation()">
        <textarea class="table-memo-input" rows="2" placeholder="📝 メモ..." oninput="saveMemo('${item.id}', this.value)">${memo}</textarea>
      </td>
    `;
    tbody.appendChild(tr);
  });

  container.appendChild(table);
};

function updateFocusUI() {
  if (currentMode !== "input") return;
  const filtered = getFilteredItems();
  filtered.forEach((item, idx) => {
    const row = document.getElementById(`row-${item.id}`);
    if (row) {
      if (idx === focusedIndex) {
        row.classList.add("focused");
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        row.classList.remove("focused");
      }
    }
  });
}

window.setEval = function(id, level, itemIndex = null) {
  const cur = getCurrentStudent();
  if (cur.evalState[id] === level) {
    delete cur.evalState[id];
  } else {
    cur.evalState[id] = level;
  }

  const filtered = getFilteredItems();
  if (itemIndex !== null && currentMode === "input") {
    focusedIndex = Math.min(itemIndex + 1, filtered.length - 1);
  }

  renderItemList();
  updateVisuals();
  updateFocusUI();
};

window.saveMemo = function(id, text) {
  const cur = getCurrentStudent();
  cur.memoState[id] = text;
};

function setupKeyboardNav() {
  window.addEventListener("keydown", (e) => {
    if (currentMode !== "input") return;
    if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;

    const filtered = getFilteredItems();
    if (filtered.length === 0) return;
    const currentItem = filtered[focusedIndex];
    if (!currentItem) return;

    if (e.key === "1") {
      e.preventDefault(); setEval(currentItem.id, 0, focusedIndex);
    } else if (e.key === "2") {
      e.preventDefault(); setEval(currentItem.id, 1, focusedIndex);
    } else if (e.key === "3") {
      e.preventDefault(); setEval(currentItem.id, 2, focusedIndex);
    } else if (e.key === "4") {
      e.preventDefault(); setEval(currentItem.id, 3, focusedIndex);
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      const cur = getCurrentStudent();
      delete cur.evalState[currentItem.id];
      renderItemList();
      updateVisuals();
    } else if (e.key === "ArrowDown" || e.key === "j") {
      e.preventDefault();
      focusedIndex = Math.min(focusedIndex + 1, filtered.length - 1);
      updateFocusUI();
    } else if (e.key === "ArrowUp" || e.key === "k") {
      e.preventDefault();
      focusedIndex = Math.max(focusedIndex - 1, 0);
      updateFocusUI();
    }
  });
}

window.setFontScale = function(size) {
  document.documentElement.style.setProperty('--font-scale', size);
  document.querySelectorAll(".header-ctrls .btn-tool").forEach(b => b.classList.remove("active"));
  if (event && event.target) event.target.classList.add("active");
};

function updateVisuals() {
  updateSummaryCounts();
  updateStageMatrix();
  updateDomainBars();
  updateAspectBars();
}

function updateSummaryCounts() {
  const cur = getCurrentStudent();
  const counts = { 3: 0, 2: 0, 1: 0, 0: 0 };
  Object.values(cur.evalState).forEach(v => {
    if (counts[v] !== undefined) counts[v]++;
  });
  const c3 = document.getElementById("cnt-3");
  const c2 = document.getElementById("cnt-2");
  const c1 = document.getElementById("cnt-1");
  const c0 = document.getElementById("cnt-0");
  if (c3) c3.textContent = counts[3];
  if (c2) c2.textContent = counts[2];
  if (c1) c1.textContent = counts[1];
  if (c0) c0.textContent = counts[0];
}

function updateStageMatrix() {
  const cur = getCurrentStudent();
  const stages = [1, 2, 3];
  const tbody = document.getElementById("matrixTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  ALL_SUBJECTS.forEach(sub => {
    const tr = document.createElement("tr");
    const th = document.createElement("td");
    th.style.fontWeight = "600";
    th.textContent = sub;
    tr.appendChild(th);

    stages.forEach(st => {
      const items = FULL_CURRICULUM.filter(i => i.sub === sub && i.stage === st);
      const td = document.createElement("td");
      td.className = "matrix-cell";

      if (items.length === 0) {
        td.textContent = "―";
        td.style.color = "var(--text-muted)";
      } else {
        let earned = 0;
        let evaluatedCount = 0;
        const max = items.length * 3;

        items.forEach(i => {
          if (cur.evalState[i.id] !== undefined) {
            earned += cur.evalState[i.id];
            evaluatedCount++;
          }
        });

        if (evaluatedCount === 0) {
          td.textContent = "-";
          td.style.color = "var(--text-muted)";
        } else {
          const pct = Math.round((earned / max) * 100);
          td.textContent = `${pct}% (${evaluatedCount}/${items.length})`;
          if (pct >= 80) td.style.background = "rgba(37, 99, 235, 0.4)";
          else if (pct >= 50) td.style.background = "rgba(5, 150, 105, 0.4)";
          else if (pct >= 25) td.style.background = "rgba(217, 119, 6, 0.4)";
          else td.style.background = "rgba(220, 38, 38, 0.4)";
          td.style.color = "#fff";
        }
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function updateDomainBars() {
  const cur = getCurrentStudent();
  const container = document.getElementById("domainBars");
  if (!container) return;
  container.innerHTML = "";

  DOMAIN_DEFS.forEach(d => {
    const items = FULL_CURRICULUM.filter(i => i.sub === d.sub);
    let earned = 0;
    let evaluatedCount = 0;
    const max = items.length * 3;

    items.forEach(i => {
      if (cur.evalState[i.id] !== undefined) {
        earned += cur.evalState[i.id];
        evaluatedCount++;
      }
    });

    const pct = (evaluatedCount > 0 && max > 0) ? Math.round((earned / max) * 100) : 0;
    let barColor = pct >= 80 ? "var(--lv-double-ok)" : (pct >= 50 ? "var(--lv-ok)" : (pct >= 25 ? "var(--lv-triangle)" : "var(--lv-ng)"));

    const row = document.createElement("div");
    row.className = "domain-row";
    row.innerHTML = `
      <div class="domain-label">
        <span class="name">${d.name}</span>
        <span class="score">${evaluatedCount > 0 ? pct + '%' : '未評価'} (${evaluatedCount}/${items.length}件)</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${pct}%; background: ${barColor};"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

function updateAspectBars() {
  const cur = getCurrentStudent();
  const container = document.getElementById("aspectBars");
  if (!container) return;
  container.innerHTML = "";

  const aspects = [
    { key: "知識及び技能", name: "知識及び技能", color: "#22d3ee" },
    { key: "思考力，判断力，表現力等", name: "思考力，判断力，表現力等", color: "#fbbf24" },
    { key: "学びに向かう力，人間性等", name: "学びに向かう力，人間性等", color: "#f472b6" }
  ];

  aspects.forEach(asp => {
    const items = FULL_CURRICULUM.filter(i => i.aspect === asp.key);
    let earned = 0;
    let evaluatedCount = 0;
    const max = items.length * 3;

    items.forEach(i => {
      if (cur.evalState[i.id] !== undefined) {
        earned += cur.evalState[i.id];
        evaluatedCount++;
      }
    });

    const pct = (evaluatedCount > 0 && max > 0) ? Math.round((earned / max) * 100) : 0;

    const row = document.createElement("div");
    row.className = "domain-row";
    row.innerHTML = `
      <div class="domain-label">
        <span class="name" style="color:${asp.color};">〔${asp.name}〕</span>
        <span class="score">${evaluatedCount > 0 ? pct + '%' : '未評価'} (${evaluatedCount}/${items.length}件)</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${pct}%; background: ${asp.color};"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

window.promptSaveEncrypted = function() {
  document.getElementById("pass1").value = "";
  document.getElementById("pass2").value = "";
  document.getElementById("saveModal").style.display = "flex";
};

window.closeSaveModal = function() {
  document.getElementById("saveModal").style.display = "none";
};

window.executeEncryptedSave = async function() {
  const p1 = document.getElementById("pass1").value;
  const p2 = document.getElementById("pass2").value;

  if (!p1 || p1.length < 4) {
    alert("パスワードは4文字以上で設定してください。");
    return;
  }
  if (p1 !== p2) {
    alert("入力された2つのパスワードが一致しません。");
    return;
  }

  saveCurrentMeta();
  const payload = {
    version: "7.0",
    timestamp: new Date().toISOString(),
    students: students
  };

  try {
    const encData = await encryptData(JSON.stringify(payload), p1);
    const blob = new Blob([JSON.stringify(encData)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `小学部全教科アセスメントデータ_${today}.enc`;
    a.click();
    URL.revokeObjectURL(url);
    closeSaveModal();
  } catch (err) {
    alert("暗号化処理中にエラーが発生しました: " + err.message);
  }
};

async function encryptData(text, password) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, enc.encode(text));

  return {
    salt: Array.from(salt),
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(encrypted))
  };
}

window.handleFileLoad = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      pendingFileContent = JSON.parse(e.target.result);
      document.getElementById("loadPass").value = "";
      document.getElementById("loadModal").style.display = "flex";
    } catch (err) {
      alert("正しい暗号化ファイルを選択してください。");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
};

window.closeLoadModal = function() {
  document.getElementById("loadModal").style.display = "none";
  pendingFileContent = null;
};

window.executeDecryptLoad = async function() {
  const password = document.getElementById("loadPass").value;
  if (!password) {
    alert("パスワードを入力してください。");
    return;
  }

  try {
    const decryptedJson = await decryptData(pendingFileContent, password);
    const data = JSON.parse(decryptedJson);

    if (data.students && Array.isArray(data.students)) {
      students = data.students;
      currentStudentId = students[0].id;
    }

    closeLoadModal();
    renderStudentSelect();
    loadCurrentStudentMeta();
    renderItemList();
    updateVisuals();
    if (currentMode === "view") renderParallelView();
    alert("暗号化データを正常に復号・読込しました。");
  } catch (err) {
    alert("復号に失敗しました。パスワードが間違っているかファイルが破損しています。");
  }
};

async function decryptData(pack, password) {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const salt = new Uint8Array(pack.salt);
  const iv = new Uint8Array(pack.iv);
  const ciphertext = new Uint8Array(pack.ciphertext);

  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ciphertext);
  return dec.decode(decrypted);
}

window.resetCurrentStudent = function() {
  const cur = getCurrentStudent();
  if (confirm(`${cur.label} の入力をリセットしますか？`)) {
    cur.evalState = {};
    cur.memoState = {};
    cur.assessor = "";
    loadCurrentStudentMeta();
    focusedIndex = 0;
    renderItemList();
    updateVisuals();
    if (currentMode === "view") renderParallelView();
  }
};

function setupEvents() {
  document.querySelectorAll(".filter-toolbar .btn-tool[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.filter;
      const val = btn.dataset.val;

      document.querySelectorAll(`.filter-toolbar .btn-tool[data-filter="${type}"]`).forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (type === "sub") filterSub = val;
      if (type === "stage") filterStage = val;

      focusedIndex = 0;
      renderItemList();
      updateFocusUI();
    });
  });
}

window.applyTheme = function(themeName) {
  document.documentElement.setAttribute("data-theme", themeName);
  localStorage.setItem("app_curriculum_theme", themeName);
  
  const select = document.getElementById("themeSelect");
  if (select && select.value !== themeName) {
    select.value = themeName;
  }
};

(function initTheme() {
  const savedTheme = localStorage.getItem("app_curriculum_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  window.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("themeSelect");
    if (select) select.value = savedTheme;
  });
})();