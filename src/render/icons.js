// ============================================================
// BIỂU TƯỢNG PIXEL ART – MỖI BIỂU TƯỢNG LÀ MỘT HÀM VẼ RIÊNG
// Tất cả vẽ trên lưới nhỏ (thường 24x24), sau đó tự động thêm
// viền đen và phóng to bằng CSS (image-rendering: pixelated).
// ============================================================

import { C } from './palette.js';
import {
  createCanvas, rect, circle, ellipse, line, polygon, star,
  teardrop, fillShape, addOutline,
} from './pixel.js';

// ---------- Chủ đề TƯ TƯỞNG HỒ CHÍ MINH ----------

/** Lăng Chủ tịch Hồ Chí Minh: khối đá, hàng cột vuông, mái bậc */
export function drawMausoleum(ctx) {
  // Cột cờ nhỏ trên nóc lăng
  rect(ctx, 12, 0, 1, 4, C.brownDark);
  rect(ctx, 13, 0, 3, 2, C.red);
  // Bậc mái trên cùng
  rect(ctx, 7, 3, 10, 1, C.stoneDark);
  rect(ctx, 6, 4, 12, 2, C.stone);
  rect(ctx, 4, 6, 16, 2, C.stoneLight);
  // Diềm mái có dòng chữ đỏ
  rect(ctx, 3, 8, 18, 2, C.stone);
  rect(ctx, 8, 8, 8, 1, C.red);
  // Hàng cột
  rect(ctx, 4, 10, 16, 6, '#4a453d');
  for (let x = 4; x <= 18; x += 3) rect(ctx, x, 10, 2, 6, C.stoneLight);
  // Thân dưới và bậc tam cấp
  rect(ctx, 3, 16, 18, 2, C.stone);
  rect(ctx, 1, 18, 22, 2, C.stoneLight);
  rect(ctx, 0, 20, 24, 2, C.stoneDark);
  rect(ctx, 0, 22, 24, 1, C.greenDark);
}

/** Nhà sàn gỗ */
export function drawStiltHouse(ctx) {
  // Mái
  polygon(ctx, [[0.5, 10], [23.5, 10], [19, 3], [5, 3]], C.brownDark);
  rect(ctx, 5, 3, 14, 1, C.brownLight);
  for (let y = 5; y < 10; y += 2) rect(ctx, 3 + (9 - y) / 2, y, 18 - (9 - y), 1, '#5c3720');
  // Thân nhà ván gỗ
  rect(ctx, 4, 10, 16, 6, C.brown);
  for (let x = 5; x < 20; x += 3) rect(ctx, x, 10, 1, 6, C.brownLight);
  // Cửa sổ
  rect(ctx, 6, 12, 3, 2, C.brownDark);
  rect(ctx, 15, 12, 3, 2, C.brownDark);
  // Sàn và cột nhà
  rect(ctx, 3, 16, 18, 1, C.brownDark);
  [4, 9, 14, 19].forEach((x) => rect(ctx, x, 17, 1, 5, C.brownDark));
  // Cầu thang
  line(ctx, 0.5, 22, 3.5, 16.5, 1, C.brownLight);
  // Mặt đất cỏ
  rect(ctx, 0, 22, 24, 2, C.green);
  rect(ctx, 0, 23, 24, 1, C.greenDark);
}

/** Con tàu ở Bến Nhà Rồng */
export function drawShip(ctx) {
  // Khói
  circle(ctx, 17, 3.5, 1.6, C.greyLight);
  circle(ctx, 20, 1.8, 1.3, C.stoneLight);
  // Cột buồm
  rect(ctx, 5, 4, 1, 10, C.brownDark);
  rect(ctx, 20, 6, 1, 8, C.brownDark);
  // Ống khói
  rect(ctx, 13, 6, 3, 5, C.red);
  rect(ctx, 13, 6, 3, 1, C.black);
  // Cabin
  rect(ctx, 7, 11, 11, 3, C.cream);
  [8, 11, 14].forEach((x) => rect(ctx, x, 12, 1, 1, C.brown));
  // Thân tàu
  polygon(ctx, [[0.5, 14], [23.5, 14], [21, 19.5], [3, 19.5]], '#2b2b3a');
  rect(ctx, 3, 18, 18, 1, C.red);
  // Sóng nước
  rect(ctx, 0, 20, 24, 4, C.blue);
  for (let x = 0; x < 24; x += 4) rect(ctx, x + 1, 21, 2, 1, C.blueLight);
  for (let x = 2; x < 24; x += 5) rect(ctx, x, 23, 2, 1, C.blueDark);
}

/** Bông sen */
export function drawLotus(ctx) {
  // Lá sen
  ellipse(ctx, 12, 20.5, 11.5, 2.6, C.greenDark);
  ellipse(ctx, 12, 20, 10, 1.8, C.green);
  // Cánh ngoài cùng
  ellipse(ctx, 5.6, 15.8, 2.2, 4.6, C.pinkDark, -62);
  ellipse(ctx, 18.4, 15.8, 2.2, 4.6, C.pinkDark, 62);
  // Cánh hai bên
  ellipse(ctx, 8.2, 13.2, 2.6, 5.6, C.pink, -30);
  ellipse(ctx, 15.8, 13.2, 2.6, 5.6, C.pink, 30);
  // Cánh giữa
  teardrop(ctx, 12, 13.5, 3.6, 10, C.pinkLight);
  rect(ctx, 12, 8, 1, 6, C.pink);
}

// ---------- Biểu tượng giao diện ----------

/** Ngôi sao vàng */
export function drawStarIcon(ctx) {
  star(ctx, 8, 8.6, 7.6, C.yellow);
  star(ctx, 7.4, 8, 3, C.white);
  star(ctx, 8, 8.6, 3, C.yellow);
}

/** Loa bật */
export function drawSoundOn(ctx) {
  rect(ctx, 1, 6, 3, 5, C.cream);
  polygon(ctx, [[4, 6], [8.5, 2], [8.5, 15], [4, 11]], C.cream);
  fillShape(ctx, 9, 2, 16, 16, (x, y) => {
    const r = Math.hypot(x - 8, y - 8.5);
    return x > 10 && ((r >= 2.6 && r <= 3.7) || (r >= 5.2 && r <= 6.3));
  }, C.yellow);
}

/** Loa tắt */
export function drawSoundOff(ctx) {
  rect(ctx, 1, 6, 3, 5, C.cream);
  polygon(ctx, [[4, 6], [8.5, 2], [8.5, 15], [4, 11]], C.cream);
  line(ctx, 10.5, 5.5, 15, 11.5, 1.6, C.redLight);
  line(ctx, 15, 5.5, 10.5, 11.5, 1.6, C.redLight);
}

// ---------- Danh mục và hàm tạo phần tử ----------

const ICONS = {
  mausoleum: { size: [24, 24], draw: drawMausoleum },
  stiltHouse: { size: [24, 24], draw: drawStiltHouse },
  ship: { size: [24, 24], draw: drawShip },
  lotus: { size: [24, 24], draw: drawLotus },
  star: { size: [16, 16], draw: drawStarIcon },
  soundOn: { size: [16, 17], draw: drawSoundOn },
  soundOff: { size: [16, 17], draw: drawSoundOff },
};

/** Biểu tượng chủ đề Tư tưởng Hồ Chí Minh (luân phiên theo từng câu) */
export const TOPIC_ICONS = ['mausoleum', 'stiltHouse', 'ship', 'lotus'];

/**
 * Tạo phần tử <canvas> chứa biểu tượng đã vẽ sẵn.
 * @param {string} name  tên biểu tượng trong ICONS
 * @param {number} scale số lần phóng to khi hiển thị
 */
export function makeIcon(name, scale = 4, className = '') {
  const def = ICONS[name];
  if (!def) throw new Error(`Không có biểu tượng: ${name}`);
  const [w, h] = def.size;
  const pad = def.outline === false ? 0 : 1;
  const { canvas, ctx } = createCanvas(w + pad * 2, h + pad * 2);
  ctx.translate(pad, pad);
  def.draw(ctx);
  if (pad) addOutline(canvas);
  canvas.className = `px-icon ${className}`.trim();
  canvas.style.width = `${canvas.width * scale}px`;
  canvas.style.height = `${canvas.height * scale}px`;
  canvas.setAttribute('aria-hidden', 'true');
  return canvas;
}
