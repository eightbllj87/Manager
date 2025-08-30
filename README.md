# Ledger & Lens – Cross-Platform Offline-First Finance & Productivity PWA

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=flat&logo=google-chrome)](https://eightbllj87.github.io/Manager/)
![Static Badge](https://img.shields.io/badge/PWA-Installable-blue?style=flat&logo=android)
![License](https://img.shields.io/github/license/eightbllj87/Manager)
![GitHub stars](https://img.shields.io/github/stars/eightbllj87/Manager?style=social)

A privacy-first **progressive web app (PWA)** for **receipts, budgets, tasks, and an encrypted vault**.  
Runs completely **offline**, installs like a native app on iOS, Android, or desktop, and is ready to monetize out of the box with **license keys and Stripe Checkout**.

---

## 🌟 Features

- 📸 **Receipts Vault**  
  Snap or upload receipts, add totals, categories, and notes.  
- 📊 **Budgets Dashboard**  
  Track spending per category with progress bars and monthly KPIs.  
- ✅ **Task Manager**  
  Lightweight to-do tracking with due dates and weekly stats.  
- 🔒 **Encrypted Vault**  
  AES-GCM client-side encryption. Your password never leaves your device.  
- 🔐 **Premium Unlock**  
  Built-in license key validation and Stripe Checkout integration.  
- 🌐 **Offline-First PWA**  
  Works without internet after first load. Installable on any device.  
- 💾 **Data Portability**  
  Full JSON export/import so you own your data.

---

## 🛠️ Tech Stack

| Feature                  | Tech Used                                  |
|--------------------------|-------------------------------------------|
| Frontend                 | HTML5, CSS3, Vanilla JavaScript           |
| Offline Functionality    | Service Worker + Cache API                |
| Data Storage             | LocalStorage for receipts, tasks, budgets |
| Encryption               | WebCrypto AES-GCM                         |
| Cross-Platform           | PWA Manifest + Maskable Icons             |

---

## 🚀 Quick Deployment

1. **Fork or Upload**  
   Copy this repo to your GitHub account.

2. **Enable GitHub Pages**  
   - Go to **Settings → Pages**  
   - Branch: `main`  
   - Folder: `/ (root)`  
   - Save.

3. **Your Site is Live**  
   Visit:  4. **Install Like an App**  
- Android/Desktop: Tap “Install App” prompt.  
- iOS Safari: “Share” → “Add to Home Screen”.

---

## 🎨 Customization

- Edit `manifest.json` for app name, colors, and branding.  
- Swap `/assets/icons/*` with your logo.  
- Update `js/config.js` for license keys and Stripe Checkout link.

---

## 📸 Screenshots

<p align="center">
<img src="assets/screenshots/dashboard.png" width="250" alt="Dashboard"/>
<img src="assets/screenshots/receipts.png" width="250" alt="Receipts"/>
<img src="assets/screenshots/vault.png" width="250" alt="Encrypted Vault"/>
</p>

---

## 📜 License

MIT License – Fork, rebrand, sell, and build your own.

---
