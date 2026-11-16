// ============================================================
// XEM LẠI CÁC CÂU SAI (kèm đáp án đúng và lời giải thích)
// ============================================================

import { h, button } from '../dom.js';
import { TOPIC_NAME } from '../../game/config.js';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function reviewScreen(app, { session }) {
  app.scene.setMode('dim');
  const back = () => app.go('result', { session, again: true });

  const items = session.wrongAnswers.map((rec, n) => {
    const q = rec.question;
    return h('div', { class: 'review-item' },
      h('span', { class: 'tag' }, `${n + 1}. ${TOPIC_NAME}`),
      h('div', { class: 'q' }, q.cauHoi),
      h('div', { class: 'you' }, `Bạn chọn: ${LETTERS[rec.choice]}. ${q.options[rec.choice].text}`),
      h('div', { class: 'right' }, `Đáp án đúng: ${LETTERS[q.correctIndex]}. ${q.options[q.correctIndex].text}`),
      h('div', { class: 'why' }, `Giải thích: ${q.giaiThich}`),
    );
  });

  const el = h('div', { class: 'screen list-screen' },
    button('« Quay lại', back, { className: 'small back-btn' }),
    h('h2', { class: 'heading' }, 'XEM LẠI CÂU SAI'),
    h('div', { class: 'scroll-panel panel', tabindex: '0' },
      items.length ? items : h('div', { class: 'empty' }, 'Không có câu sai nào. Tuyệt vời!')),
  );

  return {
    el,
    onShow() { el.querySelector('.scroll-panel').focus({ preventScroll: true }); },
    onKey(e) {
      if (e.key === 'Escape') { back(); return true; }
      return false;
    },
  };
}
