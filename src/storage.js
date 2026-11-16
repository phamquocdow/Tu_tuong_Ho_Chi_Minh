// ============================================================
// LƯU TRỮ: cài đặt (bật/tắt âm thanh) bằng localStorage
// Mọi thao tác đều bọc try/catch (chế độ ẩn danh, bị chặn
// cookie, hết dung lượng...). Khi lỗi sẽ dùng bộ nhớ tạm.
// ============================================================

const KEY_SETTINGS = 'mgct.settings.v1';

// Bộ nhớ dự phòng khi localStorage không dùng được
const memory = {};

function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return key in memory ? memory[key] : fallback;
    return JSON.parse(raw);
  } catch {
    return key in memory ? memory[key] : fallback;
  }
}

function writeJSON(key, value) {
  memory[key] = value;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ---------- Cài đặt ----------

export function getSetting(name, fallback) {
  const s = readJSON(KEY_SETTINGS, {});
  return s && name in s ? s[name] : fallback;
}

export function setSetting(name, value) {
  const s = readJSON(KEY_SETTINGS, {}) || {};
  s[name] = value;
  writeJSON(KEY_SETTINGS, s);
}
