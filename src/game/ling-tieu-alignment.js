// Dịch điểm neo khi vẽ (đơn vị pixel trong khung 128), không sửa ảnh gốc.
// Tư thế thuấn di giữ độ nghiêng và dịch chuyển chủ ý của thân người.
export const LING_TIEU_X_OFFSETS = Object.freeze({
  idle: [-4,-1,3,8,-4,-2,1,6],
  down_idle: [-3,-1,2,3,-3,-1,2,2],
  walk: [0,3,6,9,-2,1,3,5],
  run: [-5,-3,2,6,-2,0,3,5],
  hover: [2,1,0,-1,-1,0,1,1],
  fall: [-4,0,6,7,0,0,0,7],
  jump_start: [4,5,4,4,2,4,4,5],
  jump_air: [5,4,2,3,3,5,5,5],
  land: [6,6,6,6,5,4,5,3],
  sword_attack: [5,7,6,6,6,10,9,10,9,9,8,7,8,8,5,6],
  sword_guard: [4,11,11,11,4,8,12,10,4,8,11,12,7,8,8,6],
});
export function lingTieuOffset(id, frame) {
  return LING_TIEU_X_OFFSETS[id]?.[frame] ?? 0;
}
// steps(1,end) keeps each offset constant for the matching sprite frame.
export function lingTieuAlignmentCss() {
  return Object.entries(LING_TIEU_X_OFFSETS).map(([id, offsets]) => {
    const points = offsets.map((x, i) => `${100 * i / offsets.length}%{transform:translateX(${100*x/128}%);}`).join('');
    return `@keyframes ling-align-${id}{${points}100%{transform:translateX(${100*offsets[0]/128}%);}}`;
  }).join('\n');
}
