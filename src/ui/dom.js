// ============================================================
// TIỆN ÍCH TẠO PHẦN TỬ GIAO DIỆN
// ============================================================

import { play } from '../audio/sound.js';

/**
 * Tạo phần tử DOM gọn: h('div', { class: 'x', onclick }, 'chữ', con...)
 * Chuỗi luôn được gán bằng textContent nên an toàn với dữ liệu câu hỏi.
 */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  children.flat().forEach((c) => {
    if (c == null || c === false) return;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  });
  return el;
}

/** Nút pixel có âm thanh khi rê chuột và khi bấm */
export function button(label, onClick, { className = '', sound = 'select', ...rest } = {}) {
  const el = h('button', { class: `btn ${className}`.trim(), type: 'button', ...rest }, label);
  el.addEventListener('mouseenter', () => {
    if (!el.disabled) play('hover');
  });
  el.addEventListener('click', (e) => {
    if (el.disabled) return;
    if (sound) play(sound);
    onClick?.(e);
  });
  return el;
}

/** Hiệu ứng "nhấn" ngắn khi chọn bằng bàn phím */
export function flashPress(el) {
  el.classList.add('pressed');
  setTimeout(() => el.classList.remove('pressed'), 120);
}

/** Hộp thoại xác nhận kiểu pixel. Trả về Promise<boolean> */
export function confirmDialog(container, message, yes = 'Đồng ý', no = 'Hủy') {
  return new Promise((resolve) => {
    let done = false;
    const close = (val) => {
      if (done) return;
      done = true;
      document.removeEventListener('keydown', onKey, true);
      backdrop.remove();
      resolve(val);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(false); }
      if (e.key === 'Enter') { e.stopPropagation(); e.preventDefault(); close(true); }
    };
    const backdrop = h('div', { class: 'modal-backdrop' },
      h('div', { class: 'modal panel' },
        h('div', {}, message),
        h('div', { class: 'row' },
          button(yes, () => close(true), { className: 'red' }),
          button(no, () => close(false))),
      ));
    container.append(backdrop);
    document.addEventListener('keydown', onKey, true);
  });
}

/** Định dạng số có dấu chấm ngăn cách hàng nghìn */
export function fmt(n) {
  return Math.round(n).toLocaleString('vi-VN');
}
