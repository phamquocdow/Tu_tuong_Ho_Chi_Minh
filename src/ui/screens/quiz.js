// ============================================================
// MÀN CHƠI: hiển thị câu hỏi, chọn đáp án, hiệu ứng đúng/sai
// và bảng giải thích sau mỗi câu. Không giới hạn thời gian.
// ============================================================

import { h, button, flashPress, confirmDialog } from '../dom.js';
import { makeIcon, TOPIC_ICONS } from '../../render/icons.js';
import { GameSession } from '../../game/session.js';
import { TOPIC_NAME, DIFFICULTY_LABEL } from '../../game/config.js';
import { play } from '../../audio/sound.js';

const LETTERS = ['A', 'B', 'C', 'D'];
const KEY_MAP = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
const REVEAL_DELAY = 750; // ms hiển thị hiệu ứng trước khi hiện bảng giải thích

export default function quizScreen(app) {
  app.scene.setMode('dim');
  const session = new GameSession(app.bank);

  let phase = 'asking'; // asking | reveal | feedback
  let revealTimeout = 0;
  let feedbackEl = null;
  let lastRecord = null;

  // ---------- Thanh trạng thái (HUD) ----------
  const progressEl = h('div', { class: 'hud-box' });
  const tallyEl = h('div', { class: 'hud-box' });
  const quitBtn = button('Thoát', () => askQuit(), { className: 'small', title: 'Thoát lượt chơi (Esc)' });
  const hud = h('div', { class: 'hud' }, progressEl, tallyEl, h('div', { class: 'spacer' }), quitBtn);

  // ---------- Câu hỏi ----------
  const metaEl = h('div', { class: 'q-meta' });
  const qIconWrap = h('div');
  const qTextEl = h('div', { class: 'q-text' });
  const questionBox = h('div', { class: 'question-box panel' }, qIconWrap, qTextEl);

  // ---------- Đáp án ----------
  const answerBtns = LETTERS.map((L, i) => {
    const textEl = h('span', { class: 'a-text' });
    const btn = button([h('span', { class: 'key' }, L), textEl], () => choose(i), { className: 'answer', sound: null });
    btn.textEl = textEl;
    return btn;
  });
  const answersEl = h('div', { class: 'answers' }, answerBtns);

  const el = h('div', { class: 'screen quiz-screen' },
    hud, metaEl, questionBox, answersEl,
    h('div', { class: 'key-hint' }, 'Phím 1–4 hoặc A–D: chọn đáp án · Enter: tiếp · Esc: thoát'),
  );

  // ---------- Cập nhật HUD ----------
  function renderHud() {
    progressEl.replaceChildren('Câu ', h('b', {}, `${session.index + 1}/${session.total}`));
    tallyEl.replaceChildren('Đúng ', h('b', { class: 'ok' }, String(session.correctCount)),
      ' · Sai ', h('b', { class: 'bad' }, String(session.wrongCount)));
  }

  // ---------- Hiển thị một câu hỏi ----------
  function showQuestion() {
    const q = session.current;
    phase = 'asking';
    feedbackEl?.remove();
    feedbackEl = null;

    const icons = TOPIC_ICONS;
    qIconWrap.replaceChildren(makeIcon(icons[session.index % icons.length], 5));
    metaEl.replaceChildren(
      makeIcon('lotus', 1.5),
      h('span', { class: 'tag' }, TOPIC_NAME),
      h('span', { class: `tag diff-${q.doKho}` }, DIFFICULTY_LABEL[q.doKho] || q.doKho),
    );
    qTextEl.textContent = q.cauHoi;
    // Chữ nhỏ lại một chút nếu câu hỏi dài
    qTextEl.style.fontSize = q.cauHoi.length > 190 ? '31px' : q.cauHoi.length > 140 ? '33px' : '36px';

    answersEl.classList.remove('locked');
    answerBtns.forEach((b, i) => {
      b.className = 'btn answer';
      const text = q.options[i].text;
      b.textEl.textContent = text;
      b.style.fontSize = text.length > 80 ? '26px' : text.length > 60 ? '28px' : '30px';
      b.blur();
    });

    renderHud();
  }

  // ---------- Chọn đáp án ----------
  function choose(i) {
    if (phase !== 'asking') return;
    play('select');
    reveal(session.answer(i));
  }

  // ---------- Hiệu ứng đúng / sai ----------
  function reveal(rec) {
    phase = 'reveal';
    lastRecord = rec;
    answersEl.classList.add('locked');
    const q = rec.question;

    answerBtns.forEach((b, i) => {
      if (i === q.correctIndex) b.classList.add('correct');
      else if (i === rec.choice) b.classList.add('wrong');
      else b.classList.add('faded');
    });

    if (rec.isCorrect) {
      answerBtns[q.correctIndex].classList.add('blink');
      setTimeout(() => play('correct'), 60);
    } else {
      setTimeout(() => play('wrong'), 60);
      app.shake();
    }

    renderHud();
    revealTimeout = setTimeout(showFeedback, REVEAL_DELAY);
  }

  // ---------- Bảng giải thích sau mỗi câu ----------
  function showFeedback() {
    if (phase !== 'reveal') return;
    clearTimeout(revealTimeout);
    phase = 'feedback';
    const rec = lastRecord;
    const q = rec.question;
    const correctText = `${LETTERS[q.correctIndex]}. ${q.options[q.correctIndex].text}`;

    const verdict = rec.isCorrect
      ? h('div', { class: 'verdict ok' }, makeIcon('star', 3), 'CHÍNH XÁC!')
      : h('div', { class: 'verdict bad' }, 'CHƯA ĐÚNG!');
    verdict.append(h('div', { class: 'gain' }, `Đúng ${session.correctCount} · Sai ${session.wrongCount}`));

    const nextBtn = button(session.isOver ? 'Xem kết quả »' : 'Tiếp »', () => goNext(), { className: 'red' });
    feedbackEl = h('div', { class: 'feedback panel' },
      verdict,
      h('div', { class: 'correct-line' }, `Đáp án đúng: ${correctText}`),
      !rec.isCorrect && h('div', { class: 'your-line' }, `Bạn chọn: ${LETTERS[rec.choice]}. ${q.options[rec.choice].text}`),
      h('div', { class: 'explain' }, q.giaiThich),
      h('div', { class: 'actions' }, 'Nhấn Enter để tiếp tục', nextBtn),
    );
    el.append(feedbackEl);
  }

  function goNext() {
    if (phase !== 'feedback') return;
    if (session.isOver) {
      phase = 'done';
      app.go('result', { session });
      return;
    }
    session.next();
    showQuestion();
  }

  async function askQuit() {
    const ok = await confirmDialog(app.stage, 'Bỏ dở lượt chơi này và về màn hình chính?', 'Thoát', 'Chơi tiếp');
    if (ok) app.go('title');
  }

  showQuestion();

  return {
    el,
    onKey(e) {
      const k = e.key.toLowerCase();
      if (phase === 'asking' && k in KEY_MAP) {
        flashPress(answerBtns[KEY_MAP[k]]);
        choose(KEY_MAP[k]);
        return true;
      }
      if (k === 'enter' || k === ' ') {
        if (phase === 'asking') return false; // để Enter kích hoạt nút đang được focus (Tab)
        if (phase === 'reveal') showFeedback();
        else if (phase === 'feedback') { play('select'); goNext(); }
        return true;
      }
      if (k === 'escape') { askQuit(); return true; }
      return phase !== 'asking'; // chặn phím khác trong lúc hiệu ứng
    },
    destroy() {
      clearTimeout(revealTimeout);
    },
  };
}
