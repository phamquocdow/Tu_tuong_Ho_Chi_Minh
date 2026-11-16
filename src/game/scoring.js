// ============================================================
// DANH HIỆU THEO SỐ CÂU ĐÚNG (game không tính điểm)
// ============================================================

/** Bảng danh hiệu theo số câu đúng (trên tổng 10 câu) */
const RANKS = [
  { min: 10, title: 'Đảng viên ưu tú', note: 'Xuất sắc! Nắm vững toàn bộ kiến thức.' },
  { min: 8, title: 'Đảng viên chính thức', note: 'Rất tốt! Chỉ cần ôn lại vài chỗ nhỏ.' },
  { min: 6, title: 'Đảng viên dự bị', note: 'Khá! Hãy xem lại các câu sai nhé.' },
  { min: 4, title: 'Cảm tình Đảng', note: 'Cần cố gắng thêm, ôn lại giáo trình.' },
  { min: 0, title: 'Đoàn viên', note: 'Đừng nản! Đọc kỹ lời giải thích và thử lại.' },
];

export function rankFor(correct) {
  return RANKS.find((r) => correct >= r.min);
}
