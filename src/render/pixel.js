// ============================================================
// TIỆN ÍCH VẼ PIXEL
// Mọi hình đều được vẽ bằng các ô vuông nguyên (fillRect),
// hình cong được "raster hóa" bằng cách lấy mẫu tại tâm ô.
// ============================================================

import { C } from './palette.js';

/** Tạo canvas nhỏ (độ phân giải thật) để vẽ pixel */
export function createCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

/** Vẽ hình chữ nhật đặc tại tọa độ nguyên */
export function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/** Vẽ 1 pixel */
export function px(ctx, x, y, color) {
  rect(ctx, x, y, 1, 1, color);
}

/**
 * Tô một hình bất kỳ được mô tả bằng hàm test(x, y) -> boolean.
 * Lấy mẫu ss x ss điểm trong mỗi ô, ô nào phủ >= 50% thì tô.
 */
export function fillShape(ctx, x0, y0, x1, y1, test, color, ss = 3) {
  ctx.fillStyle = color;
  const need = (ss * ss) / 2;
  for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
    for (let x = Math.floor(x0); x < Math.ceil(x1); x++) {
      let hit = 0;
      for (let j = 0; j < ss; j++) {
        for (let i = 0; i < ss; i++) {
          if (test(x + (i + 0.5) / ss, y + (j + 0.5) / ss)) hit++;
        }
      }
      if (hit >= need) ctx.fillRect(x, y, 1, 1);
    }
  }
}

/** Hình tròn pixel */
export function circle(ctx, cx, cy, r, color) {
  fillShape(ctx, cx - r - 1, cy - r - 1, cx + r + 1, cy + r + 1,
    (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r, color);
}

/** Hình elip pixel, có thể xoay (góc tính bằng độ) */
export function ellipse(ctx, cx, cy, rx, ry, color, angleDeg = 0) {
  const a = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(a), sin = Math.sin(a);
  const R = Math.max(rx, ry) + 1;
  fillShape(ctx, cx - R, cy - R, cx + R, cy + R, (x, y) => {
    const dx = x - cx, dy = y - cy;
    const u = dx * cos + dy * sin;
    const v = -dx * sin + dy * cos;
    return (u * u) / (rx * rx) + (v * v) / (ry * ry) <= 1;
  }, color);
}

/** Khoảng cách từ điểm tới đoạn thẳng */
export function distToSegment(x, y, x0, y0, x1, y1) {
  const dx = x1 - x0, dy = y1 - y0;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((x - x0) * dx + (y - y0) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const qx = x0 + t * dx, qy = y0 + t * dy;
  return Math.hypot(x - qx, y - qy);
}

/** Đường thẳng dày */
export function line(ctx, x0, y0, x1, y1, width, color) {
  const pad = width + 1;
  fillShape(ctx, Math.min(x0, x1) - pad, Math.min(y0, y1) - pad,
    Math.max(x0, x1) + pad, Math.max(y0, y1) + pad,
    (x, y) => distToSegment(x, y, x0, y0, x1, y1) <= width / 2, color);
}

/** Kiểm tra điểm trong đa giác (ray casting) */
export function pointInPolygon(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Tô đa giác */
export function polygon(ctx, pts, color) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  fillShape(ctx, Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys),
    (x, y) => pointInPolygon(x, y, pts), color);
}

/** Tạo 10 đỉnh của ngôi sao 5 cánh (cánh trên cùng hướng lên) */
export function starPoints(cx, cy, R, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? R : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]);
  }
  return pts;
}

/** Ngôi sao 5 cánh pixel */
export function star(ctx, cx, cy, R, color) {
  polygon(ctx, starPoints(cx, cy, R, R * 0.382), color);
}

/**
 * Hình giọt nước (ngọn lửa, cánh sen): đáy tròn bán kính r tại (cx, cy),
 * đỉnh nhọn cao h phía trên.
 */
export function teardrop(ctx, cx, cy, r, h, color) {
  fillShape(ctx, cx - r - 1, cy - h - 1, cx + r + 1, cy + r + 1, (x, y) => {
    if (y >= cy) return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
    const k = (y - (cy - h)) / h; // 0 ở đỉnh -> 1 ở tâm
    if (k < 0) return false;
    return Math.abs(x - cx) <= r * Math.sqrt(k);
  }, color);
}

/**
 * Vẽ theo bản đồ ký tự: mỗi dòng là một chuỗi, mỗi ký tự ứng với một màu
 * trong palette; '.' hoặc ' ' là trong suốt.
 */
export function drawMap(ctx, rows, palette, ox = 0, oy = 0) {
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const color = palette[ch];
      if (color) px(ctx, ox + x, oy + y, color);
    });
  });
}

/**
 * Thêm viền đen dày kiểu 8-bit quanh mọi pixel không trong suốt.
 * Duyệt 8 ô lân cận để viền liền mạch ở góc chéo.
 */
export function addOutline(canvas, color = C.black) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
  const mark = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (solid(x, y)) continue;
      let near = false;
      for (let j = -1; j <= 1 && !near; j++) {
        for (let i = -1; i <= 1; i++) {
          if ((i || j) && solid(x + i, y + j)) { near = true; break; }
        }
      }
      if (near) mark.push([x, y]);
    }
  }
  ctx.fillStyle = color;
  mark.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
}
