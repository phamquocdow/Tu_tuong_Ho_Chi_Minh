// ============================================================
// CỜ PIXEL: Cờ đỏ sao vàng, Cờ Đảng (búa liềm) và hiệu ứng tung bay
// ============================================================

import { C } from './palette.js';
import { createCanvas, fillShape, star, distToSegment, rect, px } from './pixel.js';

/**
 * Vẽ biểu tượng búa liềm màu vàng.
 * Hình được mô tả trong lưới đơn vị 16x16 rồi co giãn theo `size`.
 */
export function drawHammerSickle(ctx, ox, oy, size, color = C.yellow) {
  const s = size / 16;
  const cx = 8.6, cy = 7.6; // tâm cung lưỡi liềm

  const test = (X, Y) => {
    const x = (X - ox) / s;
    const y = (Y - oy) / s;

    // --- Lưỡi liềm: một cung tròn, dày ở cán và nhọn dần về mũi ---
    const dx = x - cx, dy = y - cy;
    const r = Math.hypot(dx, dy);
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI; // -180..180, trục y hướng xuống
    const inBlade = deg <= 135 && deg >= -140 ? true : false;
    if (inBlade) {
      const t = (135 - deg) / 275; // 0 ở chỗ nối cán -> 1 ở mũi liềm
      const ri = 3.6 + t * 1.9;
      if (r >= ri && r <= 5.9) return true;
    }
    // --- Cán liềm ---
    if (distToSegment(x, y, 5.3, 11.0, 2.2, 14.2) <= 1.1) return true;

    // --- Cán búa (chéo từ giữa xuống góc dưới phải) ---
    if (distToSegment(x, y, 6.4, 6.4, 13.6, 13.6) <= 1.0) return true;

    // --- Đầu búa: hình chữ nhật xoay 45 độ ---
    const ux = x - 4.8, uy = y - 4.8;
    const along = (ux - uy) / Math.SQRT2; // dọc theo đầu búa
    const across = (ux + uy) / Math.SQRT2; // vuông góc
    if (Math.abs(along) <= 2.7 && Math.abs(across) <= 1.4) return true;

    return false;
  };

  fillShape(ctx, ox, oy, ox + size, oy + size, test, color, 4);
}

/** Cờ đỏ sao vàng (phẳng) tỉ lệ 3:2 */
export function makeNationalFlag(w = 48, h = 32) {
  const { canvas, ctx } = createCanvas(w, h);
  rect(ctx, 0, 0, w, h, C.red);
  star(ctx, w / 2, h / 2 + 0.6, w * 0.2, C.yellow);
  return canvas;
}

/** Cờ Đảng: nền đỏ, búa liềm vàng ở giữa */
export function makePartyFlag(w = 48, h = 32) {
  const { canvas, ctx } = createCanvas(w, h);
  rect(ctx, 0, 0, w, h, C.red);
  const size = Math.round(h * 0.68);
  drawHammerSickle(ctx, Math.round((w - size) / 2), Math.round((h - size) / 2), size);
  return canvas;
}

/**
 * Vẽ lá cờ đang tung bay: cắt lá cờ phẳng thành từng cột 1px,
 * dịch mỗi cột theo hàm sin (biên độ tăng dần về phía đuôi cờ),
 * kèm đổ bóng theo dải và viền đen.
 */
export function drawWavingFlag(ctx, flat, x, y, t, { amp = 3, speed = 3, freq = 0.22 } = {}) {
  const W = flat.width, H = flat.height;
  for (let i = 0; i < W; i++) {
    const phase = t * speed - i * freq;
    const k = Math.min(1, (i + 4) / W); // gần cán cờ thì ít lay động
    const off = Math.round(Math.sin(phase) * amp * k);
    const cx = x + i, cy = y + off;
    // Viền trên và dưới
    px(ctx, cx, cy - 1, C.black);
    px(ctx, cx, cy + H, C.black);
    // Thân cờ
    ctx.drawImage(flat, i, 0, 1, H, cx, cy, 1, H);
    // Đổ bóng theo độ dốc của sóng -> các dải sáng/tối kiểu 8-bit
    const slope = Math.cos(phase);
    if (slope > 0.55) {
      ctx.fillStyle = 'rgba(40, 0, 0, 0.28)';
      ctx.fillRect(cx, cy, 1, H);
    } else if (slope < -0.6) {
      ctx.fillStyle = 'rgba(255, 240, 200, 0.16)';
      ctx.fillRect(cx, cy, 1, H);
    }
  }
  // Viền đuôi cờ
  const lastOff = Math.round(Math.sin(t * speed - (W - 1) * freq) * amp);
  rect(ctx, x + W, y + lastOff - 1, 1, H + 2, C.black);
}

/** Cột cờ có quả cầu vàng trên đỉnh */
export function drawFlagPole(ctx, x, top, bottom) {
  rect(ctx, x - 1, top, 4, bottom - top, C.black); // viền
  rect(ctx, x, top, 2, bottom - top, C.stoneLight);
  rect(ctx, x + 1, top, 1, bottom - top, C.stoneDark);
  // Quả cầu đỉnh cột
  rect(ctx, x - 2, top - 4, 6, 5, C.black);
  rect(ctx, x - 1, top - 3, 4, 3, C.yellow);
  px(ctx, x - 1, top - 3, C.white);
  // Đế cột
  rect(ctx, x - 3, bottom - 3, 8, 3, C.black);
  rect(ctx, x - 2, bottom - 2, 6, 2, C.stoneDark);
}
