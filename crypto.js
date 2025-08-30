// Simple AES-GCM encryption helpers using Web Crypto
window.CryptoVault = (() => {
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();
  const state = { key: null, salt: null };

  async function deriveKey(password, salt) {
    const baseKey = await crypto.subtle.importKey(
      "raw",
      textEncoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function setPassword(pass) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(pass, salt);
    state.key = key;
    state.salt = salt;
    localStorage.setItem("ll_salt", btoa(String.fromCharCode(...salt)));
  }

  async function loadPassword(pass) {
    const b64 = localStorage.getItem("ll_salt");
    if (!b64) throw new Error("No password set");
    const salt = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const key = await deriveKey(pass, salt);
    state.key = key;
    state.salt = salt;
  }

  async function encrypt(plain) {
    if (!state.key) throw new Error("No key");
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, state.key, textEncoder.encode(plain));
    const bytes = new Uint8Array(enc);
    return JSON.stringify({ iv: btoa(String.fromCharCode(...iv)), data: btoa(String.fromCharCode(...bytes)) });
  }

  async function decrypt(json) {
    if (!state.key) throw new Error("No key");
    const obj = JSON.parse(json);
    const iv = Uint8Array.from(atob(obj.iv), c => c.charCodeAt(0));
    const data = Uint8Array.from(atob(obj.data), c => c.charCodeAt(0));
    const dec = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, state.key, data);
    return textDecoder.decode(dec);
  }

  return { setPassword, loadPassword, encrypt, decrypt, _state: state };
})();