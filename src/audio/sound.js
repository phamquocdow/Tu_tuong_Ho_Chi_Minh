// ============================================================
// ÂM THANH CHIPTUNE 8-BIT BẰNG WEB AUDIO API
// Không dùng file âm thanh: mọi tiếng đều tổng hợp từ sóng
// vuông / tam giác / răng cưa và tiếng ồn trắng.
// ============================================================

import { getSetting, setSetting } from '../storage.js';

let audioCtx = null;
let master = null;
let enabled = getSetting('sound', true);

/** Khởi tạo AudioContext (trình duyệt chỉ cho phép sau thao tác của người dùng) */
function ensureCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
    master = audioCtx.createGain();
    master.gain.value = 0.18;
    master.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/** Phát một nốt */
function tone(freq, start, dur, { type = 'square', vol = 0.6, slideTo = null } = {}) {
  const ac = audioCtx;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  // Bao hình kiểu chip: bật nhanh, tắt dần
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(master);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

/** Tiếng ồn trắng ngắn (dùng cho tiếng "sai", "vụt") */
function noise(start, dur, vol = 0.4) {
  const ac = audioCtx;
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(g).connect(master);
  src.start(start);
}

/** Phát một chuỗi nốt [tần số, độ dài] liên tiếp */
function melody(notes, { type = 'square', vol = 0.5, gap = 0 } = {}) {
  let t = audioCtx.currentTime + 0.01;
  notes.forEach(([f, d]) => {
    if (f) tone(f, t, d * 0.95, { type, vol });
    t += d + gap;
  });
}

// Tần số nốt nhạc
const N = {
  C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9,
  C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784, A5: 880, C6: 1046.5,
};

/** Các hiệu ứng âm thanh của game */
const SFX = {
  // Di chuột / di chuyển lựa chọn
  hover() {
    tone(1200, audioCtx.currentTime, 0.03, { vol: 0.15 });
  },
  // Bấm chọn
  select() {
    const t = audioCtx.currentTime;
    tone(660, t, 0.05, { vol: 0.4 });
    tone(990, t + 0.05, 0.07, { vol: 0.4 });
  },
  // Bắt đầu lượt chơi
  start() {
    melody([[N.C5, 0.08], [N.E5, 0.08], [N.G5, 0.08], [N.C6, 0.2]], { vol: 0.45 });
  },
  // Trả lời đúng
  correct() {
    melody([[N.E5, 0.07], [N.G5, 0.07], [N.C6, 0.16]], { vol: 0.5 });
    tone(N.C4, audioCtx.currentTime, 0.3, { type: 'triangle', vol: 0.5 });
  },
  // Trả lời sai
  wrong() {
    const t = audioCtx.currentTime;
    tone(220, t, 0.35, { type: 'sawtooth', vol: 0.4, slideTo: 90 });
    noise(t, 0.18, 0.25);
  },
  // Kết thúc lượt: thắng (nhạc vui)
  win() {
    melody([
      [N.G4, 0.1], [N.C5, 0.1], [N.E5, 0.1], [N.G5, 0.2], [0, 0.05],
      [N.E5, 0.1], [N.G5, 0.35],
    ], { vol: 0.45 });
  },
  // Kết thúc lượt: kết quả chưa tốt
  lose() {
    melody([[N.G4, 0.18], [N.F4, 0.18], [N.E4, 0.18], [N.C4, 0.45]], { type: 'triangle', vol: 0.6 });
  },
};

/** Phát hiệu ứng theo tên (nếu đang bật âm thanh) */
export function play(name) {
  if (!enabled) return;
  try {
    if (!ensureCtx()) return;
    SFX[name]?.();
  } catch (err) {
    // Âm thanh lỗi không được làm hỏng game
    console.warn('Không phát được âm thanh:', err);
  }
}

export function isEnabled() {
  return enabled;
}

/** Bật/tắt âm thanh, lưu lựa chọn vào localStorage */
export function toggle() {
  enabled = !enabled;
  setSetting('sound', enabled);
  if (enabled) play('select');
  return enabled;
}

/** Gọi khi người dùng tương tác lần đầu để "mở khóa" âm thanh */
export function unlock() {
  if (enabled) {
    try { ensureCtx(); } catch { /* bỏ qua */ }
  }
}
