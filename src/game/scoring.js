// ============================================================
// LỜI NHẬN XÉT THEO SỐ CÂU ĐÚNG (game không tính điểm)
// ============================================================

/** Lời nhận xét theo số câu đúng (trên tổng 10 câu) */
const FEEDBACK = [
  { min: 10, note: 'Xuất sắc! Nắm vững toàn bộ kiến thức.' },
  { min: 8, note: 'Rất tốt! Chỉ cần ôn lại vài chỗ nhỏ.' },
  { min: 6, note: 'Khá! Hãy xem lại các câu sai nhé.' },
  { min: 4, note: 'Cần cố gắng thêm, ôn lại giáo trình.' },
  { min: 0, note: 'Đừng nản! Đọc kỹ lời giải thích và thử lại.' },
];

export function feedbackFor(correct) {
  return FEEDBACK.find((r) => correct >= r.min).note;
}
