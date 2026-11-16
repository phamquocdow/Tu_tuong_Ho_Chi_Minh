// ============================================================
// HÀM NGẪU NHIÊN
// ============================================================

/** Xáo trộn mảng (Fisher–Yates), trả về mảng mới */
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Chọn ngẫu nhiên n câu hỏi */
export function pickQuestions(bank, n) {
  return shuffle(bank).slice(0, n);
}
