(function(){
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // Tabs
  const tabs = $$(".tabs button");
  tabs.forEach(btn => btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    $$(".tab").forEach(s => s.classList.add("hidden"));
    document.getElementById(btn.dataset.tab).classList.remove("hidden");
  }));

  // Year
  $("#year").textContent = String(new Date().getFullYear());

  // Install PWA
  let deferredPrompt = null;
  const installBtn = $("#installBtn");
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); deferredPrompt = e; installBtn.style.display = "inline-block";
  });
  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
  });

  // License
  const licenseStatus = $("#licenseStatus");
  function isPremium() {
    if (!window.APP_CONFIG?.PREMIUM_ENABLED) return true;
    const key = DB.getLicense();
    return window.APP_CONFIG.LICENSE_KEYS.includes(key);
  }
  function renderLicense() {
    licenseStatus.textContent = isPremium()
      ? "Premium features unlocked."
      : "Premium locked. Enter a license key or click Buy to subscribe.";
  }
  $("#applyKey").addEventListener("click", () => {
    DB.setLicense($("#sKey").value.trim());
    renderLicense();
    alert(isPremium() ? "Premium unlocked." : "Key not recognized.");
  });
  $("#buyBtn").addEventListener("click", () => {
    const url = window.APP_CONFIG.STRIPE_CHECKOUT_URL || "";
    if (url) window.location.href = url;
    else alert("Add your Stripe Checkout URL in js/config.js to enable purchasing.");
  });
  renderLicense();

  // Dashboard quick add
  $("#quickAddReceipt").addEventListener("click", () => {
    tabs.find(b => b.dataset.tab === "receipts").click();
    $("#rTotal").focus();
  });
  $("#quickAddTask").addEventListener("click", () => {
    tabs.find(b => b.dataset.tab === "tasks").click();
    $("#tText").focus();
  });

  // Receipts
  $("#saveReceipt").addEventListener("click", async () => {
    const total = parseFloat($("#rTotal").value || "0");
    const date = $("#rDate").value || new Date().toISOString().slice(0,10);
    const cat = $("#rCat").value || "Other";
    const note = $("#rNote").value.trim();
    const file = $("#rPhoto").files[0];
    let photoData = null;
    if (file) {
      photoData = await fileToDataURL(file);
    }
    const rec = DB.addReceipt({ total, date, cat, note, photoData });
    $("#rTotal").value = ""; $("#rNote").value = ""; $("#rPhoto").value = "";
    renderReceipts();
    renderKPIs();
    pushLatest({ type: "receipt", note: note || cat, amount: total });
  });

  function renderReceipts() {
    const list = DB.listReceipts();
    const wrap = $("#receiptsList"); wrap.innerHTML = "";
    if (!list.length) { wrap.innerHTML = `<p class="small">No receipts yet.</p>`; return; }
    list.forEach(r => {
      const el = document.createElement("div");
      el.className = "card";
      el.innerHTML = `
        <div style="display:flex;gap:10px;align-items:center;">
          ${r.photoData ? `<img src="${r.photoData}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid var(--outline);" />` : ""}
          <div style="flex:1;">
            <div><strong>$${r.total.toFixed(2)}</strong> <span class="badge">${r.cat}</span></div>
            <div class="small">${r.date}${r.note ? " • " + escapeHtml(r.note) : ""}</div>
          </div>
        </div>
      `;
      wrap.appendChild(el);
    });
  }

  // Budgets
  $("#addBudget").addEventListener("click", () => {
    const cat = $("#bCat").value.trim();
    const limit = parseFloat($("#bLimit").value || "0");
    if (!cat) return alert("Category required");
    DB.upsertBudget(cat, limit);
    $("#bCat").value = ""; $("#bLimit").value = "";
    renderBudgets(); renderKPIs();
  });

  function renderBudgets() {
    const budgets = DB.listBudgets();
    const recs = DB.listReceipts();
    const wrap = $("#budgetList"); wrap.innerHTML = "";
    if (!budgets.length) { wrap.innerHTML = `<p class="small">No budgets. Add categories you actually spend on.</p>`; return; }
    budgets.forEach(b => {
      const spent = recs.filter(r => r.cat.toLowerCase() === b.cat.toLowerCase() && sameMonth(r.date, new Date()))
                        .reduce((s, r) => s + (r.total || 0), 0);
      const pct = b.limit > 0 ? Math.min(100, Math.round(spent / b.limit * 100)) : 0;
      const el = document.createElement("div");
      el.className = "card";
      el.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div><strong>${escapeHtml(b.cat)}</strong> <span class="small">Limit $${b.limit.toFixed(2)}</span></div>
          <div><strong>$${spent.toFixed(2)}</strong> <span class="small">(${pct}%)</span></div>
        </div>
        <div style="margin-top:8px;height:8px;background:#0c1014;border-radius:999px;overflow:hidden;border:1px solid var(--outline);">
          <div style="height:100%;width:${pct}%;background:var(--accent);"></div>
        </div>
      `;
      wrap.appendChild(el);
    });
  }

  // Tasks
  $("#addTask").addEventListener("click", () => {
    const text = $("#tText").value.trim();
    const due = $("#tDue").value;
    if (!text) return;
    DB.addTask({ text, due });
    $("#tText").value = ""; $("#tDue").value = "";
    renderTasks(); renderKPIs();
  });

  function renderTasks() {
    const tasks = DB.listTasks();
    const wrap = $("#taskList"); wrap.innerHTML = "";
    if (!tasks.length) { wrap.innerHTML = `<li class="small">No tasks. Add a few you’ll actually do.</li>`; return; }
    tasks.forEach(t => {
      const li = document.createElement("li");
      li.innerHTML = `
        <input type="checkbox" ${t.done ? "checked" : ""} data-id="${t.id}">
        <div style="flex:1;">
          <div>${escapeHtml(t.text)}</div>
          <div class="small">${t.due ? new Date(t.due).toLocaleString() : ""}</div>
        </div>
      `;
      li.querySelector("input").addEventListener("change", () => { DB.toggleTask(t.id); renderTasks(); renderKPIs(); });
      wrap.appendChild(li);
    });
  }

  // Vault
  $("#saveSecret").addEventListener("click", async () => {
    if (!isPremium()) return alert("Premium required");
    const title = $("#vTitle").value.trim();
    const body = $("#vBody").value;
    if (!title || !body) return;
    try {
      const enc = await CryptoVault.encrypt(JSON.stringify({ title, body, ts: Date.now() }));
      DB.addVaultItem({ enc });
      $("#vTitle").value = ""; $("#vBody").value = "";
      renderVault();
    } catch (e) {
      alert("Set or load your master password first (Settings).");
    }
  });
  $("#loadVault").addEventListener("click", renderVault);

  async function renderVault() {
    const wrap = $("#vaultList"); wrap.innerHTML = "";
    const rows = DB.listVaultItems();
    if (!rows.length) { wrap.innerHTML = `<p class="small">Empty. Save something after setting your password in Settings.</p>`; return; }
    for (const row of rows) {
      try {
        const dec = await CryptoVault.decrypt(row.enc);
        const obj = JSON.parse(dec);
        const el = document.createElement("div");
        el.className = "card";
        el.innerHTML = `<strong>${escapeHtml(obj.title)}</strong><div class="small">${new Date(obj.ts).toLocaleString()}</div><pre style="white-space:pre-wrap">${escapeHtml(obj.body)}</pre>`;
        wrap.appendChild(el);
      } catch {
        const el = document.createElement("div");
        el.className = "card";
        el.innerHTML = `<em>Locked. Load password to read.</em>`;
        wrap.appendChild(el);
      }
    }
  }

  // Settings: password
  $("#setPass").addEventListener("click", async () => {
    if (!isPremium()) return alert("Premium required");
    const pass = $("#sPass").value.trim();
    if (!pass) return alert("Enter a password first.");
    await CryptoVault.setPassword(pass);
    alert("Master password set.");
  });

  // Export / Import / Wipe
  $("#exportBtn").addEventListener("click", () => {
    if (!isPremium()) return alert("Premium required");
    const data = DB.exportAll();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ledger-and-lens-backup-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  });
  $("#importBtn").addEventListener("click", async () => {
    if (!isPremium()) return alert("Premium required");
    const f = $("#importFile").files[0]; if (!f) return alert("Choose a file first.");
    const text = await f.text(); DB.importAll(text);
    renderAll();
  });
  $("#wipeBtn").addEventListener("click", () => {
    if (!confirm("This wipes all unencrypted data (receipts, budgets, tasks). Vault items remain unless you imported a wipe as well.")) return;
    DB.wipeAll(); renderAll();
  });

  // KPIs and latest
  function renderKPIs() {
    const monthSpent = DB.listReceipts()
      .filter(r => sameMonth(r.date, new Date()))
      .reduce((s, r) => s + (r.total || 0), 0);
    $("#kpiSpent").innerHTML = `$${monthSpent.toFixed(2)} <small>spent this month</small>`;
    const weekTasks = DB.listTasks()
      .filter(t => inThisWeek(t.due ? new Date(t.due) : new Date()))
      .length;
    $("#kpiTasks").innerHTML = `${weekTasks} <small>tasks this week</small>`;
  }

  function pushLatest(item) {
    const el = document.createElement("li");
    el.className = "list-item";
    if (item.type === "receipt") {
      el.innerHTML = `<span class="badge">Receipt</span> $${(item.amount || 0).toFixed(2)} — ${escapeHtml(item.note || "")}`;
    } else if (item.type === "task") {
      el.innerHTML = `<span class="badge">Task</span> ${escapeHtml(item.text || "")}`;
    } else {
      el.textContent = JSON.stringify(item);
    }
    $("#latestList").prepend(el);
    while ($("#latestList").children.length > 6) $("#latestList").lastChild.remove();
  }

  function renderLatest() {
    $("#latestList").innerHTML = "";
    DB.listReceipts().slice(0,3).forEach(r => pushLatest({ type:"receipt", amount:r.total, note:r.note }));
    DB.listTasks().slice(0,3).forEach(t => pushLatest({ type:"task", text:t.text }));
  }

  // Helpers
  function fileToDataURL(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }
  function sameMonth(dateStrOrDate, refDate) {
    const d = (dateStrOrDate instanceof Date) ? dateStrOrDate : new Date(dateStrOrDate);
    return d.getFullYear() === refDate.getFullYear() && d.getMonth() === refDate.getMonth();
  }
  function inThisWeek(dt) {
    const now = new Date();
    const onejan = new Date(now.getFullYear(),0,1);
    const weekNow = Math.ceil((((now - onejan) / 86400000) + onejan.getDay()+1)/7);
    const weekDt = Math.ceil((((dt - onejan) / 86400000) + onejan.getDay()+1)/7);
    return weekNow === weekDt && now.getFullYear() === dt.getFullYear();
  }
  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function renderAll() {
    renderKPIs(); renderLatest(); renderReceipts(); renderBudgets(); renderTasks(); renderVault();
  }

  // Init
  renderAll();

  // Notifications permission hint (optional)
  if (Notification && Notification.permission === "default") {
    setTimeout(() => {
      Notification.requestPermission().catch(()=>{});
    }, 1500);
  }

})();