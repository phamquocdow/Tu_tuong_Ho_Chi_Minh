// ============================================================
// CẢNH NỀN ĐỘNG: trời hoàng hôn pixel, mặt trời sọc, đồi núi,
// mây trôi, sao lấp lánh, chim bay, hai lá cờ tung bay, pháo hoa.
// Vẽ trên canvas 320x180 rồi phóng to x4 = 1280x720.
// ============================================================

import { C } from './palette.js';
import { createCanvas, rect, px, drawMap } from './pixel.js';
import { makeNationalFlag, makePartyFlag, drawWavingFlag, drawFlagPole } from './flags.js';

export const SCENE_W = 320;
export const SCENE_H = 180;
const HORIZON = 132;

// Các dải màu bầu trời từ trên xuống
const SKY = ['#2b0f3a', '#3f1248', '#5a1650', '#7a1f52', '#9d2b4f', '#c0413f', '#dc5f32', '#ee842b', '#f7a836', '#fcca52'];

const CLOUD_MAP = [
  '.....hhhh.......',
  '...hhccccch.....',
  '.hhccccccccchh..',
  'hccccccccccccch.',
  'cccccccccccccccc',
  '.ssssssssssssss.',
];
const CLOUD_PAL = { h: '#ffcf9e', c: '#f59a6b', s: '#c25a4a' };

const BIRD = [
  ['k...k', '.k.k.', '..k..'],
  ['.....', 'kk.kk', '..k..'],
];

/** Hàm tạo số ngẫu nhiên có hạt giống (để cảnh luôn giống nhau) */
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Vẽ lớp tĩnh (trời, mặt trời, đồi) một lần vào bộ đệm */
function buildStaticLayer() {
  const { canvas, ctx } = createCanvas(SCENE_W, SCENE_H);
  const band = Math.ceil(HORIZON / SKY.length);

  // Bầu trời theo dải, có hòa trộn ô bàn cờ (dithering) ở ranh giới
  SKY.forEach((col, i) => rect(ctx, 0, i * band, SCENE_W, band, col));
  for (let i = 1; i < SKY.length; i++) {
    const y = i * band;
    for (let x = 0; x < SCENE_W; x++) {
      if (x % 2 === 0) px(ctx, x, y - 1, SKY[i]);
      if (x % 2 === 1) px(ctx, x, y, SKY[i - 1]);
      if (x % 4 === 0) px(ctx, x, y - 2, SKY[i]);
    }
  }

  // Mặt trời lớn có các sọc ngang kiểu retro
  const sx = 160, sy = 120, sr = 40;
  for (let y = sy - sr; y <= sy + sr; y++) {
    const rel = (y - (sy - sr)) / (2 * sr);
    // Các khe sọc dày dần về phía dưới
    if (rel > 0.5) {
      const k = Math.floor((rel - 0.5) * 20);
      if ((y + k) % 6 < 1 + Math.floor(k / 2)) continue;
    }
    const half = Math.floor(Math.sqrt(Math.max(0, sr * sr - (y - sy) ** 2)));
    const col = rel < 0.25 ? '#fff0a8' : rel < 0.45 ? C.yellow : rel < 0.65 ? '#ffc23d' : C.gold;
    rect(ctx, sx - half, y, half * 2, 1, col);
  }

  // Dãy đồi xa
  for (let x = 0; x < SCENE_W; x++) {
    const h = 14 + Math.sin(x * 0.028) * 8 + Math.sin(x * 0.071 + 1) * 4;
    rect(ctx, x, HORIZON - h, 1, h + 4, '#6b1d48');
  }
  // Dãy đồi gần
  for (let x = 0; x < SCENE_W; x++) {
    const h = 6 + Math.sin(x * 0.045 + 2) * 6 + Math.sin(x * 0.13) * 2;
    rect(ctx, x, HORIZON + 4 - h, 1, h + 10, '#3e1230');
  }
  // Hàng cây thông nhỏ trên đồi
  const rand = rng(7);
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(rand() * SCENE_W);
    const base = HORIZON + 8;
    const hgt = 5 + Math.floor(rand() * 6);
    for (let j = 0; j < hgt; j++) {
      const w = Math.max(1, Math.floor((j / hgt) * 4));
      rect(ctx, x - w, base - hgt + j, w * 2 + 1, 1, '#2a0c20');
    }
  }

  // Mặt đất phía trước
  rect(ctx, 0, 148, SCENE_W, SCENE_H - 148, '#2a160c');
  rect(ctx, 0, 148, SCENE_W, 2, C.brownDark);
  for (let x = 0; x < SCENE_W; x += 8) {
    rect(ctx, x + ((x / 8) % 2) * 4, 156, 3, 1, '#3d2213');
    rect(ctx, x + 2, 166, 2, 1, '#3d2213');
  }
  return canvas;
}

export class Scene {
  constructor(canvas) {
    this.canvas = canvas;
    canvas.width = SCENE_W;
    canvas.height = SCENE_H;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.mode = 'title';
    this.staticLayer = buildStaticLayer();
    this.flagVN = makeNationalFlag(54, 36);
    this.flagParty = makePartyFlag(54, 36);

    const rand = rng(42);
    this.stars = Array.from({ length: 30 }, () => ({
      x: Math.floor(rand() * SCENE_W),
      y: Math.floor(rand() * 40),
      ph: rand() * 6.28,
      sp: 1 + rand() * 2,
    }));
    this.clouds = Array.from({ length: 5 }, (_, i) => ({
      x: i * 75 + rand() * 30,
      y: 30 + rand() * 50,
      sp: 2 + rand() * 3,
    }));
    this.birds = Array.from({ length: 3 }, (_, i) => ({
      x: -20 - i * 14, y: 60 + i * 5, sp: 9 + i * 2,
    }));
    this.sparks = [];
    this.nextBurst = 0;
    this.last = 0;
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  /** Đổi chế độ nền: 'title' | 'dim' | 'celebrate' */
  setMode(mode) {
    this.mode = mode;
    this.sparks = [];
  }

  _loop(now) {
    requestAnimationFrame(this._loop);
    // Giới hạn ~30 khung hình/giây cho đúng chất 8-bit
    if (now - this.last < 33) return;
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this._draw(now / 1000, dt);
  }

  _draw(t, dt) {
    const ctx = this.ctx;
    ctx.drawImage(this.staticLayer, 0, 0);

    // Sao lấp lánh
    this.stars.forEach((s) => {
      const v = Math.sin(t * s.sp + s.ph);
      if (v > 0.2) px(ctx, s.x, s.y, v > 0.85 ? C.white : '#d9a6c8');
      if (v > 0.92) {
        px(ctx, s.x - 1, s.y, '#d9a6c8');
        px(ctx, s.x + 1, s.y, '#d9a6c8');
      }
    });

    // Mây trôi
    this.clouds.forEach((c) => {
      c.x += c.sp * dt;
      if (c.x > SCENE_W + 10) c.x = -20;
      drawMap(ctx, CLOUD_MAP, CLOUD_PAL, Math.round(c.x), Math.round(c.y));
    });

    if (this.mode !== 'dim') {
      // Chim bay
      this.birds.forEach((b, i) => {
        b.x += b.sp * dt;
        if (b.x > SCENE_W + 20) b.x = -30 - i * 10;
        const frame = BIRD[Math.floor(t * 4 + i) % 2];
        drawMap(ctx, frame, { k: '#2a0c20' }, Math.round(b.x), Math.round(b.y + Math.sin(t + i) * 2));
      });

      // Hai cột cờ: Cờ đỏ sao vàng (trái) và Cờ Đảng (phải)
      drawFlagPole(ctx, 34, 56, 152);
      drawWavingFlag(ctx, this.flagVN, 36, 58, t, { amp: 3 });
      drawFlagPole(ctx, 228, 56, 152);
      drawWavingFlag(ctx, this.flagParty, 230, 58, t + 1.3, { amp: 3 });
    }

    if (this.mode === 'celebrate') this._fireworks(t, dt);

    if (this.mode === 'dim') {
      ctx.fillStyle = 'rgba(26, 15, 10, 0.5)';
      ctx.fillRect(0, 0, SCENE_W, SCENE_H);
    }
  }

  /** Pháo hoa pixel cho màn kết thúc */
  _fireworks(t, dt) {
    const ctx = this.ctx;
    if (t > this.nextBurst) {
      this.nextBurst = t + 0.7 + Math.random() * 0.6;
      const x = 100 + Math.random() * 120;
      const y = 18 + Math.random() * 40;
      const cols = [C.yellow, C.cream, C.redLight, C.gold];
      const col = cols[Math.floor(Math.random() * cols.length)];
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * Math.PI * 2;
        const sp = 22 + Math.random() * 10;
        this.sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1.1, col });
      }
    }
    this.sparks = this.sparks.filter((s) => (s.life -= dt) > 0);
    this.sparks.forEach((s) => {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 25 * dt;
      s.vx *= 0.97;
      if (s.life > 0.25 || Math.floor(t * 20) % 2) px(ctx, s.x, s.y, s.col);
    });
  }
}
