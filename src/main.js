// ============================================================
// ĐIỂM KHỞI ĐỘNG GAME
// - Nạp font, CSS, ngân hàng câu hỏi
// - Co giãn khung 1280x720 theo cửa sổ (giữ đúng tỉ lệ)
// - Điều hướng giữa các màn hình (không dùng router)
// - Xử lý bàn phím chung và nút bật/tắt âm thanh
// ============================================================

// Font VT323 cài qua npm. File index.css gồm 3 subset (latin, latin-ext,
// vietnamese) có unicode-range, trình duyệt chỉ tải phần cần dùng.
// Subset vietnamese chứa các chữ như "ắ, ậ, ượ, ữ"; subset latin chứa a–z.
import '@fontsource/vt323';
import './styles/main.css';

import rawQuestions from './data/questions.json';
import { TOPIC } from './game/config.js';
import { Scene } from './render/scene.js';
import { makeIcon } from './render/icons.js';
import * as sound from './audio/sound.js';
import { h } from './ui/dom.js';

import titleScreen from './ui/screens/title.js';
import quizScreen from './ui/screens/quiz.js';
import resultScreen from './ui/screens/result.js';
import reviewScreen from './ui/screens/review.js';

const STAGE_W = 1280;
const STAGE_H = 720;

const SCREENS = {
  title: titleScreen,
  quiz: quizScreen,
  result: resultScreen,
  review: reviewScreen,
};

// ---------- Chuẩn hóa & kiểm tra ngân hàng câu hỏi ----------
function loadBank(list) {
  const nfc = (s) => String(s).normalize('NFC');
  return list
    .filter((q) => q?.chuDe === TOPIC)
    .filter((q) => {
      const ok = q && Array.isArray(q.dapAn) && q.dapAn.length === 4
        && Number.isInteger(q.dapAnDung) && q.dapAnDung >= 0 && q.dapAnDung <= 3;
      if (!ok) console.warn('Bỏ qua câu hỏi sai định dạng:', q?.id);
      return ok;
    })
    .map((q) => ({
      ...q,
      cauHoi: nfc(q.cauHoi),
      dapAn: q.dapAn.map(nfc),
      giaiThich: nfc(q.giaiThich || ''),
    }));
}

// ---------- Co giãn khung game ----------
const stage = document.getElementById('stage');
function fit() {
  const margin = 16;
  const s = Math.min((window.innerWidth - margin) / STAGE_W, (window.innerHeight - margin) / STAGE_H);
  stage.style.transform = `scale(${Math.max(0.2, s)})`;
}
window.addEventListener('resize', fit);
fit();

// ---------- Đối tượng app dùng chung cho các màn hình ----------
const screenEl = document.getElementById('screen');
const shakeEl = document.getElementById('shake');
const flashEl = document.getElementById('flash');
let current = null;

const app = {
  stage,
  bank: loadBank(rawQuestions),
  scene: new Scene(document.getElementById('bg')),

  /** Chuyển sang màn hình khác */
  go(name, params = {}) {
    try { current?.destroy?.(); } catch (err) { console.error(err); }
    document.querySelectorAll('.modal-backdrop').forEach((m) => m.remove());
    screenEl.replaceChildren();
    current = SCREENS[name](app, params);
    screenEl.append(current.el);
    current.onShow?.();
  },

  /** Rung màn hình + chớp đỏ khi trả lời sai */
  shake() {
    shakeEl.classList.remove('shaking');
    flashEl.classList.remove('on');
    void shakeEl.offsetWidth; // ép trình duyệt chạy lại animation
    shakeEl.classList.add('shaking');
    flashEl.classList.add('on');
  },
};

// ---------- Nút bật/tắt âm thanh (luôn hiện ở góc phải) ----------
const soundBtn = h('button', { id: 'sound-btn', class: 'btn icon-btn', type: 'button', title: 'Bật/tắt âm thanh (phím M)' });
function renderSoundBtn() {
  soundBtn.replaceChildren(makeIcon(sound.isEnabled() ? 'soundOn' : 'soundOff', 2.5));
  soundBtn.setAttribute('aria-label', sound.isEnabled() ? 'Tắt âm thanh' : 'Bật âm thanh');
}
soundBtn.addEventListener('click', () => {
  sound.toggle();
  renderSoundBtn();
  soundBtn.blur();
});
renderSoundBtn();
stage.append(soundBtn);

// ---------- Bàn phím chung ----------
function moveFocus(dir) {
  const list = [...screenEl.querySelectorAll('button:not([disabled]), [tabindex="0"]')]
    .filter((b) => b.offsetParent !== null && !b.closest('.modal-backdrop'));
  if (!list.length) return;
  const i = list.indexOf(document.activeElement);
  const n = i < 0 ? 0 : (i + dir + list.length) % list.length;
  list[n].focus({ preventScroll: true });
  sound.play('hover');
}

document.addEventListener('keydown', (e) => {
  sound.unlock();
  if (e.target instanceof HTMLInputElement) return;
  if (document.querySelector('.modal-backdrop')) return; // hộp thoại tự xử lý phím
  if (e.repeat && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

  if (e.key === 'm' || e.key === 'M') {
    sound.toggle();
    renderSoundBtn();
    return;
  }
  if (current?.onKey?.(e)) {
    e.preventDefault();
    return;
  }
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); moveFocus(1); }
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); moveFocus(-1); }
});
document.addEventListener('pointerdown', () => sound.unlock(), { passive: true });

// ---------- Chờ font tải xong để tránh nháy chữ ----------
const root = document.documentElement;
const fontReady = document.fonts
  ? Promise.race([document.fonts.load('36px "VT323"', 'Aắậượữ'), new Promise((r) => setTimeout(r, 1500))])
  : Promise.resolve();
fontReady.finally(() => root.classList.remove('font-loading'));

app.go('title');
