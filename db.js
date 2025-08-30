// Minimal storage layer. Uses localStorage for structured JSON collections.
// Images stored as data URLs for simplicity.
window.DB = (() => {
  const LS = window.localStorage;
  const K = {
    receipts: "ll_receipts",
    budgets: "ll_budgets",
    tasks: "ll_tasks",
    vault: "ll_vault",
    license: "ll_license",
  };

  function _load(key) {
    try { return JSON.parse(LS.getItem(key) || "[]"); } catch { return []; }
  }
  function _save(key, arr) {
    LS.setItem(key, JSON.stringify(arr));
  }

  // Receipts
  function addReceipt(rec) {
    const arr = _load(K.receipts);
    arr.unshift({ id: crypto.randomUUID(), ...rec });
    _save(K.receipts, arr);
    return arr[0];
  }
  function listReceipts() { return _load(K.receipts); }

  // Budgets
  function upsertBudget(cat, limit) {
    const arr = _load(K.budgets);
    const i = arr.findIndex(x => x.cat.toLowerCase() === cat.toLowerCase());
    if (i >= 0) arr[i].limit = limit; else arr.push({ cat, limit });
    _save(K.budgets, arr);
  }
  function listBudgets() { return _load(K.budgets); }

  // Tasks
  function addTask(task) {
    const arr = _load(K.tasks);
    arr.unshift({ id: crypto.randomUUID(), done: false, ...task });
    _save(K.tasks, arr);
  }
  function toggleTask(id) {
    const arr = _load(K.tasks);
    const t = arr.find(x => x.id === id); if (t) t.done = !t.done;
    _save(K.tasks, arr);
  }
  function listTasks() { return _load(K.tasks); }

  // Vault (encrypted strings)
  function addVaultItem(item) {
    const arr = _load(K.vault);
    arr.unshift({ id: crypto.randomUUID(), ...item });
    _save(K.vault, arr);
  }
  function listVaultItems() { return _load(K.vault); }

  // License
  function setLicense(key) { LS.setItem(K.license, key); }
  function getLicense() { return LS.getItem(K.license) || ""; }

  // Export/Import
  function exportAll() {
    return JSON.stringify({
      receipts: listReceipts(),
      budgets: listBudgets(),
      tasks: listTasks(),
      vault: listVaultItems(),
      license: getLicense(),
      version: 1
    }, null, 2);
  }
  function importAll(json) {
    const obj = JSON.parse(json);
    if (obj.receipts) _save(K.receipts, obj.receipts);
    if (obj.budgets) _save(K.budgets, obj.budgets);
    if (obj.tasks) _save(K.tasks, obj.tasks);
    if (obj.vault) _save(K.vault, obj.vault);
    if (obj.license) setLicense(obj.license);
  }

  function wipeAll() {
    _save(K.receipts, []);
    _save(K.budgets, []);
    _save(K.tasks, []);
    _save(K.vault, []);
  }

  return {
    addReceipt, listReceipts,
    upsertBudget, listBudgets,
    addTask, toggleTask, listTasks,
    addVaultItem, listVaultItems,
    setLicense, getLicense,
    exportAll, importAll,
    wipeAll
  };
})();