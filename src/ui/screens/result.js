// ============================================================
// MÀN KẾT THÚC: số câu đúng/sai, danh hiệu, xem lại câu sai, chơi lại
// ============================================================

import { h, button } from '../dom.js';
import { makeIcon } from '../../render/icons.js';
import { rankFor } from '../../game/scoring.js';
import { TOPIC_NAME } from '../../game/config.js';
import { play } from '../../audio/sound.js';

export default function resultScreen(app, { session, again = false }) {
  const rank = rankFor(session.correctCount);
  const wrong = session.wrongAnswers;
  const good = session.correctCount >= 6;
  const percent = session.total ? Math.round((session.correctCount / session.total) * 100) : 0;

  app.scene.setMode(good ? 'celebrate' : 'dim');
  if (!again) setTimeout(() => play(good ? 'win' : 'lose'), 150);

  const stat = (v, l) => h('div', { class: 'stat' }, h('div', { class: 'v' }, v), h('div', { class: 'l' }, l));

  const el = h('div', { class: 'screen result-screen' },
    h('div', { class: 'result-card panel' },
      makeIcon(good ? 'star' : 'lotus', good ? 5 : 3),
      h('div', { class: 'rank-label' }, `${TOPIC_NAME} · Danh hiệu đạt được`),
      h('div', { class: 'rank' }, rank.title.toUpperCase()),
      h('div', { class: 'rank-note' }, rank.note),
      h('div', { class: 'stats' },
        stat(`${session.correctCount}/${session.total}`, 'Câu đúng'),
        stat(`${session.wrongCount}`, 'Câu sai'),
        stat(`${percent}%`, 'Tỉ lệ đúng'),
      ),
      h('div', { class: 'result-actions' },
        button(`Xem lại câu sai (${wrong.length})`, () => app.go('review', { session }), { disabled: wrong.length === 0 }),
        button('Chơi lại', () => app.go('quiz'), { className: 'red', sound: 'start' }),
        button('Menu', () => app.go('title')),
      ),
    ),
  );

  return {
    el,
    onShow() {
      el.querySelector('.result-actions .btn:not([disabled])')?.focus({ preventScroll: true });
    },
    onKey(e) {
      if (e.key === 'Escape') { app.go('title'); return true; }
      return false;
    },
  };
}
