// ============================================================
// PHIÊN CHƠI: quản lý câu hỏi và số câu đúng/sai
// Không đụng tới giao diện -> dễ kiểm thử và chỉnh sửa luật.
// ============================================================

import { QUESTIONS_PER_ROUND } from './config.js';
import { shuffle, pickQuestions } from './random.js';

export class GameSession {
  constructor(bank) {
    // Chọn câu và xáo trộn thứ tự đáp án của từng câu
    this.questions = pickQuestions(bank, QUESTIONS_PER_ROUND).map((q) => {
      const options = shuffle(q.dapAn.map((text, i) => ({ text, correct: i === q.dapAnDung })));
      return { ...q, options, correctIndex: options.findIndex((o) => o.correct) };
    });
    this.index = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.history = []; // lịch sử để xem lại câu sai
  }

  get current() {
    return this.questions[this.index];
  }

  get total() {
    return this.questions.length;
  }

  /** Ghi nhận câu trả lời (choice: chỉ số đáp án đã chọn) */
  answer(choice) {
    const q = this.current;
    const isCorrect = choice === q.correctIndex;
    if (isCorrect) this.correctCount++;
    else this.wrongCount++;
    const record = { question: q, choice, isCorrect };
    this.history.push(record);
    return record;
  }

  /** Đã tới câu cuối chưa */
  get isOver() {
    return this.index >= this.total - 1;
  }

  next() {
    this.index++;
  }

  get wrongAnswers() {
    return this.history.filter((h) => !h.isCorrect);
  }
}
