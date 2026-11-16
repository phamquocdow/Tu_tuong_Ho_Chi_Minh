// ============================================================
// MÀN HÌNH CHÍNH: tiêu đề Tư tưởng Hồ Chí Minh, nút Bắt đầu, bật/tắt âm thanh (góc phải)
// (Cờ đỏ sao vàng và Cờ Đảng tung bay được vẽ ở cảnh nền)
// ============================================================

import { h, button } from '../dom.js';

export default function titleScreen(app) {
  app.scene.setMode('title');

  const el = h('div', { class: 'screen title-screen' },
    h('h1', { class: 'title-text' }, 'TƯ TƯỞNG', h('br'), 'HỒ CHÍ MINH'),
    h('div', { class: 'menu-buttons' },
      button('Bắt đầu', () => app.go('quiz'), { className: 'red', sound: 'start' }),
    ),
    h('div', { class: 'footer-hint' }, 'Mỗi lượt 10 câu ngẫu nhiên · Enter: bắt đầu · M: bật/tắt âm thanh'),
  );

  return {
    el,
    onShow() {
      el.querySelector('.btn')?.focus({ preventScroll: true });
    },
  };
}
