// Va chạm liên tục giữa các chiêu thức của hai phe, tính theo thời gian trong khung hình.
let frame = null;
let strength = new WeakMap();
let struggle = null;
export const STRUGGLE_MANA_PER_SECOND = 18;
export function getSkillStruggle() { return struggle; }
export function isSkillStruggling(ref) { return !!ref?.skillClashHeld; }
function endStruggle(loser) {
  if (!struggle) return null;
  const old = struggle; struggle = null;
  old.a.ref.skillClashHeld = false; old.b.ref.skillClashHeld = false;
  for (const [side, seg] of [['player', old.a], ['boss', old.b]]) {
    if (loser === side || loser === 'both') { info(seg.ref, seg.power).ended = true; seg.onDestroy?.(); }
  }
  return loser;
}
export function cancelSkillStruggle(side = 'player') { return side === 'player' || side === 'boss' ? endStruggle(side) : null; }
export function updateSkillStruggle(dt, player, boss) {
  if (!struggle) return null;
  if (!player || !boss || player.hp <= 0 || boss.hp <= 0 || boss.broken || !boss.visible) return endStruggle('both');
  const step = Math.min(Math.max(0, dt), Math.max(0, player.mana) / STRUGGLE_MANA_PER_SECOND, Math.max(0, boss.mana) / STRUGGLE_MANA_PER_SECOND);
  player.mana = Math.max(0, player.mana - step * STRUGGLE_MANA_PER_SECOND);
  boss.mana = Math.max(0, boss.mana - step * STRUGGLE_MANA_PER_SECOND);
  struggle.elapsed += step;
  const p = player.mana <= 1e-7, b = boss.mana <= 1e-7;
  if (p || b) { if (p) player.mana = 0; if (b) boss.mana = 0; return endStruggle(p && b ? 'both' : p ? 'player' : 'boss'); }
  // A badly wounded boss may choose to abandon the contest to preserve mana.
  if (struggle.elapsed > 1.5 && boss.hp < boss.maxHp * .1 && boss.mana < 36) return endStruggle('boss');
  return null;
}
const clamp01 = n => Math.max(0, Math.min(1, n));

export function resetSkillCollisions() { endStruggle('both'); frame = null; strength = new WeakMap(); }
export function beginSkillCollisionFrame(effect, contestants = null) { frame = { player: [], boss: [], impacts: [], effect, contestants }; }
function info(ref, power = 1) {
  let value = strength.get(ref);
  if (!value) { value = { initial: Math.max(0.001, power), power: Math.max(0.001, power), ended: false }; strength.set(ref, value); }
  return value;
}
export function skillCollisionRatio(ref) { const s = strength.get(ref); return s ? s.power / s.initial : 1; }
export function trackSkillSegment(segment) {
  if (!frame) return;
  const s = { t0: 0, t1: 1, ...segment };
  if (s.t1 < s.t0 || info(s.ref, s.power).ended) return;
  frame[s.side].push(s);
}
export function queueSkillImpact(ref, time, callback) {
  if (!frame) { callback(); return; }
  frame.impacts.push({ time: clamp01(time), ref, callback, type: 'impact' });
}
function at(s, t) {
  const q = s.t1 === s.t0 ? 1 : clamp01((t - s.t0) / (s.t1 - s.t0));
  return { x: s.x0 + (s.x1 - s.x0) * q, y: s.y0 + (s.y1 - s.y0) * q };
}
// Thời điểm hai hình tròn chuyển động gặp nhau, kể cả khi bay nhanh xuyên qua nhau.
export function segmentCircleTOI(x0, y0, x1, y1, cx, cy, radius) {
  const x = x0 - cx, y = y0 - cy, vx = x1 - x0, vy = y1 - y0;
  const c = x*x + y*y - radius*radius;
  if (c <= 0) return 0;
  const a = vx*vx + vy*vy;
  if (a < 1e-12) return null;
  const b = 2*(x*vx + y*vy), d = b*b - 4*a*c;
  if (d < 0) return null;
  const t = (-b - Math.sqrt(d)) / (2*a);
  return t >= 0 && t <= 1 ? t : null;
}
function collision(a, b) {
  const lo = Math.max(a.t0, b.t0), hi = Math.min(a.t1, b.t1);
  if (hi < lo) return null;
  const a0 = at(a, lo), b0 = at(b, lo), a1 = at(a, hi), b1 = at(b, hi);
  const u = segmentCircleTOI(a0.x-b0.x, a0.y-b0.y, a1.x-b1.x, a1.y-b1.y, 0, 0, a.radius+b.radius);
  if (u === null) return null;
  const time = lo + (hi-lo)*u, p = at(a, time), q = at(b, time);
  return { time, x: (p.x+q.x)/2, y: (p.y+q.y)/2, a, b, type: 'collision' };
}
export function endSkillCollisionFrame() {
  if (!frame) return;
  const f = frame; frame = null;
  const events = f.impacts.slice();
  for (const a of f.player) for (const b of f.boss) {
    if (a.kind === 'water_sword' && b.kind === 'blood_thread') continue;
    const hit = collision(a,b); if (hit) events.push(hit);
  }
  events.sort((a,b) => a.time-b.time || (a.type === 'collision' ? -1 : 1));
  let effects = 0;
  for (const event of events) {
    if (event.type === 'impact') {
      const s = info(event.ref); if (s.ended || isSkillStruggling(event.ref)) continue;
      s.ended = true; event.callback(); continue;
    }
    const a = info(event.a.ref, event.a.power), b = info(event.b.ref, event.b.power);
    if (a.ended || b.ended || isSkillStruggling(event.a.ref) || isSkillStruggling(event.b.ref)) continue;
    const p = f.contestants?.player, boss = f.contestants?.boss;
    if (!struggle && p?.hp > 0 && p.mana > 0 && boss?.visible && !boss.broken && boss.hp > 0 && boss.mana > 0 && event.a.canStruggle?.() && event.b.canStruggle?.()) {
      const pa = at(event.a, event.time), pb = at(event.b, event.time);
      event.a.ref.skillClashHeld = event.b.ref.skillClashHeld = true;
      event.a.onStruggle?.(pa.x, pa.y); event.b.onStruggle?.(pb.x, pb.y);
      struggle = {a:event.a,b:event.b,x:event.x,y:event.y,elapsed:0};
      f.contestants.onStart?.(struggle);
      continue;
    }
    // Một cặp đối tượng chỉ trao đổi sức mạnh một lần, dù có nhiều đoạn/điểm chạm.
    if (!a.met) a.met = new WeakSet();
    if (a.met.has(event.b.ref)) continue;
    a.met.add(event.b.ref);
    const ap = a.power, bp = b.power;
    a.power = Math.max(0, ap-bp); b.power = Math.max(0, bp-ap);
    if (a.power <= 1e-8) { a.ended = true; event.a.onDestroy?.(); }
    if (b.power <= 1e-8) { b.ended = true; event.b.onDestroy?.(); }
    if (effects++ < 4 && f.effect) {
      const dx=event.a.x1-event.a.x0, dy=event.a.y1-event.a.y0;
      const bx=event.b.x1-event.b.x0, by=event.b.y1-event.b.y0;
      const angle=Math.hypot(dx,dy)>1e-6 ? Math.atan2(dy,dx)
        : Math.hypot(bx,by)>1e-6 ? Math.atan2(-by,-bx) : 0;
      f.effect(event.x,event.y,{playerKind:event.a.kind,bossKind:event.b.kind,playerPower:ap,bossPower:bp,playerRemaining:a.power,bossRemaining:b.power,outcome:a.power>0?'player':b.power>0?'boss':'equal',angle});
    }
  }
}
