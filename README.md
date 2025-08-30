# Ledger & Lens (PWA SaaS Starter)

An offline-first, installable progressive web app that runs on iOS, Android, desktop, or straight from the browser. It gives real utility people will pay for:
- Receipts vault (photo upload), simple budgeting, and tasks
- Encrypted notes vault (client-side AES-GCM)
- Export/Import backups
- License-key gate for "premium" features
- 100% static hosting. No server required.

## Quick start

1. **Open `index.html`** locally to try it.
2. **Deploy free** on GitHub Pages:
   - Create a new repository called `ledger-and-lens`.
   - Upload every file in this folder.
   - In the repo settings, enable **Pages** with the branch set to `main` (or `master`) and folder `/root`.
   - Your app will be live at `https://<your-username>.github.io/ledger-and-lens/`.
3. **Install it** on your phone:
   - Visit your Pages URL.
   - On Android/desktop: "Install app" prompt. On iOS Safari: "Share" → "Add to Home Screen".

## Subscription (optional, when you're ready)

This starter uses a simple license-key list. Edit `js/config.js` and replace:
```js
LICENSE_KEYS: ["OPEN-ALL", "DEMO-123", "FAMILY-PLAN"]
```
with your own list. Anyone with a valid key unlocks premium (encryption, export, bulk import).

To charge money, paste your **Stripe Checkout** link into `STRIPE_CHECKOUT_URL` in `js/config.js`.

## Data storage

- Receipts, budgets, tasks: stored in `localStorage`.
- Photos: stored as data URLs (keep sizes sensible).
- Vault items: encrypted client-side; you control the password. If you lose it, data is unrecoverable.

## Wrap for the App Store / Play Store

If you want native binaries later, wrap this PWA with Capacitor or similar. For now you don't need it to use or sell the app.

## License

Yours. Fork it, rename it, sell it.