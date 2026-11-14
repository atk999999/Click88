import { noticeSkillIcon, setSkillIcon } from './skill-icons.js';
// ============================================================================
// MODULE: STATE & CONSTANTS (Trạng thái dùng chung, Hằng số & Tiện ích cơ bản)
// ============================================================================

export const $ = (id) => document.getElementById(id);
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

export function hash(a, b) {
  let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

// Hằng số kích thước thế giới & nhân vật
export const CELL = 10;
export const CHUNK = 32;
export const WORLD_W = 4800;
export const WORLD_H = 2400;
export const CHAR_SCALE = 0.52;
export const CHAR_H = 238 * CHAR_SCALE;
export const GRAVITY = 840;
export const SPRITE_TEXTURE_SIZE = 128;

// Hitbox va chạm vật lý giữa Nhân vật và NPC (tính từ mốc chân y = 0)
export const HERO_HALF = 17;
export const HERO_HEIGHT = 100;
export const NPC_HALF = 23;
export const NPC_HEIGHT = 113;
export const CONTACT_EPS = 0.25;

// Danh sách 17 dải hoạt ảnh WebP của Diệp Tu: [tên_clip, số_khung, lặp_lại]
export const CLIPS = [
  ['idle', 8, true],
  ['walk', 8, true],
  ['run', 8, true],
  ['jump_start', 3, false],
  ['jump_air', 3, false],
  ['fall', 8, true],
  ['land', 3, false],
  ['hand_seal', 8, false],
  ['hurt', 8, false],
  ['knockdown', 8, false],
  ['down_idle', 8, true],
  ['getup', 8, false],
  ['fly_up', 6, false],
  ['hover', 8, true],
  ['charge_raise', 8, false],
  ['charge_hold', 4, true],
  ['cast_fire', 12, false],
];

export const clipMap = Object.fromEntries(
  CLIPS.map(([id, frames, loop]) => [id, { id, frames, loop }])
);

// Cùng hệ hành động nhưng Lăng Tiêu có nhiều khung chuyển tiếp hơn.
export const LING_TIEU_SHARED_OVERRIDES = {
  jump_start: { id: 'jump_start', frames: 8, loop: false },
  jump_air: { id: 'jump_air', frames: 8, loop: false },
  land: { id: 'land', frames: 8, loop: false },
};

// Hoạt ảnh đặc thù của Lăng Tiêu. 17 hành động cơ bản tiếp tục dùng CLIPS chung.
export const LING_TIEU_SWORD_CLIPS = {
  sword_attack: { id: 'sword_attack', frames: 16, loop: false },
  sword_guard: { id: 'sword_guard', frames: 16, loop: false },
  sword_cast: { id: 'sword_cast', frames: 12, loop: false },
  teleport: { id: 'teleport', frames: 16, loop: false },
};

export const sourceAssets = {
  diep_tu_giant: 'assets/sprites/diep_tu_cuong_bao.webp',
  tang_ma_base: 'assets/sprites/tang_ma/co_ban.webp',
  tang_ma_skills: 'assets/sprites/tang_ma/chieu_thuc.webp',
  hac_hoa_xa: 'assets/sprites/monsters/hac_hoa_xa.webp',
  phong_lang: 'assets/sprites/monsters/phong_lang.webp',
  loi_ung: 'assets/sprites/monsters/loi_ung.webp',
  u_minh_ma_buc: 'assets/sprites/monsters/u_minh_ma_buc.webp',
  ...Object.fromEntries([...CLIPS.map(([id]) => id), ...Object.keys(LING_TIEU_SWORD_CLIPS)].map(id => ['ling_tieu_' + id, 'assets/sprites/ling_tieu/' + (id === 'sword_cast' ? 'cast_fire' : id) + '.webp'])),
  ...Object.fromEntries(CLIPS.map(([id]) => ['huyet_du_' + id, 'assets/sprites/huyet_du_' + id + '.webp?v=hd256q1'])),
  sky: 'assets/backgrounds/01_Khong_Trung.webp',
  surface: 'assets/backgrounds/02_Phong_Canh_Mat_Dat.webp',
  cave: 'assets/backgrounds/03_Hang_Dong_Sau.webp',
  ...Object.fromEntries(CLIPS.map(([id]) => [id, 'assets/sprites/' + id + '.webp'])),
};

export const BASE_ZOOM = 0.5385; // Tầm nhìn thông thường mở rộng thêm 30% (từ 0.70 sang 0.70 / 1.30 ≈ 0.5385)
export const THAN_THUC_ZOOM = 0.175; // Tầm nhìn xa gấp 4 lần (0.70 / 4)

// Cài đặt người chơi
export const settings = {
  speed: 100,
  quality: 'high',
  fxQuality: 'medium',
  stats: false,
  geology: false,
  zoom: BASE_ZOOM,
  targetZoom: BASE_ZOOM,
  thanThuc: false,
  thanThucPulse: 0,
  character: 'diep_tu', // 'diep_tu' | 'huyet_du'
  orientation: 'landscape',
  soundEnabled: true,
  soundVolume: 70,
  musicEnabled: true,
  musicVolume: 28,
};

// Trạng thái vận hành game
export const game = {
  started: false,
  running: false,
  battlePhase: 'menu',
  menu: 'menu',
  quality: 'high',
  images: {},
  ready: false,
  viewW: 0,
  viewH: 0,
  dpr: 1,
  last: 0,
  acc: 0,
  elapsed: 0,
  fps: 60,
  frames: 0,
  fpsAcc: 0,
  hitStop: 0,
  noticeTimer: 0,
  statsTimer: 0,
  terrain: null,
  canvas: null,
  ctx: null,
};

export function initCanvas() {
  const canvas = $('scene');
  const ctx = canvas.getContext('2d', { alpha: false });
  game.canvas = canvas;
  game.ctx = ctx;
  return { canvas, ctx };
}

// Điều khiển đầu vào
export const keys = { left: false, right: false, up: false, down: false, slow: false };
export const analog = { moveX: 0, moveY: 0 };

export function movementSpeed(slow, flying, speedPercent = 100) {
  const base = flying ? (slow ? 290 : 570) : (slow ? 174 : 342);
  return base * (speedPercent / 100);
}

// Bảng thông số thuộc tính chuẩn của các Cảnh Giới Tu Tiên
export const REALM_SPECS = Object.freeze({
  luyen_khi: Object.freeze({
    id: 'luyen_khi',
    tier: 1,
    name: 'LUYỆN KHÍ · SƠ KỲ',
    shortName: 'Luyện Khí · Sơ Kỳ',
    maxHp: 500,
    maxMana: 100,
    manaRegen: 10,
    atk: 50,
    skillMult: 1.0,
    defenseReduction: 0.0,
  }),
  truc_co: Object.freeze({
    id: 'truc_co',
    tier: 2,
    name: 'TRÚC CƠ · SƠ KỲ',
    shortName: 'Trúc Cơ · Sơ Kỳ',
    maxHp: 1200,
    maxMana: 250,
    manaRegen: 16,
    atk: 80,
    skillMult: 1.25,
    defenseReduction: 0.08,
  }),
  kim_dan: Object.freeze({
    id: 'kim_dan',
    tier: 3,
    name: 'KIM ĐAN CẢNH',
    shortName: 'Kim Đan Cảnh',
    maxHp: 3000,
    maxMana: 300,
    manaRegen: 20,
    atk: 120,
    skillMult: 1.5,
    defenseReduction: 0.14,
  }),
  nguyen_anh: Object.freeze({
    id: 'nguyen_anh',
    tier: 4,
    name: 'NGUYÊN ANH CẢNH',
    shortName: 'Nguyên Anh Cảnh',
    maxHp: 6000,
    maxMana: 500,
    manaRegen: 32,
    atk: 200,
    skillMult: 1.9,
    defenseReduction: 0.22,
  }),
});

export function getRealmSpec(realmId = 'truc_co') {
  return REALM_SPECS[realmId] || REALM_SPECS.truc_co;
}

export function getRealmSuppressionScale(attackerTier = 2, defenderTier = 3) {
  const diff = (attackerTier || 2) - (defenderTier || 2);
  if (diff === 0) return 1.0;
  return diff > 0
    ? clamp(1 + diff * 0.12, 1.0, 1.5)
    : clamp(1 + diff * 0.08, 0.72, 1.0);
}

export function getCasterCollisionScale(caster = player) {
  const spec = getRealmSpec(caster?.realmId || 'truc_co');
  const atkRatio = (caster?.atk || spec.atk) / Math.max(1, spec.atk);
  return (caster?.skillMult || spec.skillMult || 1) * atkRatio;
}

export function getCasterDamageScale(caster = player, defender = dummy) {
  const rawScale = getCasterCollisionScale(caster);
  const suppression = getRealmSuppressionScale(caster?.realmTier || 2, defender?.realmTier || 3);
  const defRed = clamp(defender?.defenseReduction || 0, 0, 0.45);
  return rawScale * suppression * (1 - defRed * 0.5) * (caster?.cuongBaoMultiplier || 1);
}

// Trạng thái Nhân vật chính (Diệp Tu — Trúc Cơ · Sơ Kỳ)
export const player = {
  x: 520,
  y: 0,
  vx: 0,
  vy: 0,
  facing: 1,
  flying: false,
  grounded: false,
  anim: 'idle',
  animTime: 0,
  jumpTime: 999,
  landTime: 0,
  forceAnim: '',
  forceTime: 0,
  visualScale: 1,
  flash: 0,
  shieldActive: false,
  stun: 0,
  realmId: 'truc_co',
  realmTier: 2,
  realm: 'TRÚC CƠ · SƠ KỲ',
  atk: 80,
  skillMult: 1.25,
  defenseReduction: 0.08,
  maxHp: 1200,
  hp: 1200,
  maxMana: 250,
  mana: 250,
  manaRegen: 16,
  lastManaCost: 0,
};

// Trạng thái chuyển động & biến dạng đàn hồi của Nhân vật
export const motion = {
  action: null,
  jumpBuffer: 0,
  coyote: 0,
  gait: 0,
  lastFoot: -1,
  mode: 'idle',
  lean: 0,
  squashX: 1,
  squashY: 1,
  bobOffset: 0,
  afterimageTimer: 0,
  airTime: 0,
  landingSpeed: 0,
  strongImpact: null,
};

// Camera & hiệu ứng rung chấn
export const camera = {
  x: 520,
  y: 300,
  shakeTime: 0,
  shakeMag: 0,
  shakeX: 0,
  shakeY: 0,
};

// Danh sách hệ phái cận chiến (Kiếm, Quyền, Thể tu...). Nếu Boss không thuộc nhóm này sẽ ưu tiên Bay & Tấn công tầm xa.
export const MELEE_COMBAT_STYLES = Object.freeze([
  'melee',
  'kiem',
  'quyen',
  'dao',
  'thuong',
  'the_tu',
  'sword',
  'fist',
  'can_chien',
]);

export function isMeleeBoss(entity = dummy) {
  return MELEE_COMBAT_STYLES.includes(String(entity?.combatStyle || '').toLowerCase());
}

// Trạng thái Boss PK Vòng 1 (Huyết Dự · Kim Đan cảnh)
export const bossState = {
  active: false,
  round: 1,
  name: 'HUYẾT DỰ',
  realm: 'KIM ĐAN CẢNH',
  combatStyle: 'magic',
  stage: 'TẦNG BA',
  maxHp: 3000,
  hp: 3000,
  ghostHp: 3000,
};

// Trạng thái NPC mục tiêu (Boss Huyết Dự / Diệp Tu WebP)
export let dummy = {
  x: 660,
  y: 0,
  vx: 0,
  vy: 0,
  flying: false,
  combatStyle: 'magic',
  realmId: 'kim_dan',
  realmTier: 3,
  realm: 'KIM ĐAN CẢNH',
  atk: 120,
  skillMult: 1.5,
  defenseReduction: 0.14,
  maxHp: 3000,
  hp: 3000,
  isBoss: true,
  visible: false,
  facing: -1,
  bossWalk: false,
  bossAction: '',
  bossActionTime: 0,
  bossClipDuration: 0,
  bossClipLoop: false,
  bossClipStart: 0,
  bossOpacity: 1,
  shieldActive: false,
  hitSequence: 0,
  maxMana: 300,
  mana: 300,
  manaRegen: 14,
  skin: 'huyet_du',
  name: 'HUYẾT DỰ · KIM ĐAN CẢNH',
  flash: 0,
  shake: 0,
  damageTimer: 0,
  lastDamage: 100,
  respawn: 0,
  broken: false,
  burn: 0,
  burnTick: 0,
  burnPower: 0,
  stun: 0,
  slow: 0,
  trapped: false,
  recoil: 0,
  demoIndex: 0,
  demoAction: 'idle',
  demoElapsed: 0,
  demoTimer: 0,
  patrol: false,
  patrolDir: 1,
  patrolAnchor: 660,
  gait: 0,
  lastFoot: -1,
  visualScale: 1,
  lean: 0,
  squashX: 1,
  squashY: 1,
};

// Target binding is switched while updating each monster; boss play uses the original entity.
const bossDummy = dummy;
let combatTargets = null;
export function useDummy(entity = bossDummy) { dummy = entity; }
export function setCombatTargets(targets) { combatTargets = targets; }
export function getCombatTargets() { return combatTargets ?? [dummy]; }
export function withCombatTarget(entity, callback) {
  const previous=dummy;dummy=entity;
  try { return callback(); } finally { dummy=previous; }
}

export function addCameraShake(mag = 2.5, duration = 0.14) {
  if (settings.fxQuality === 'off') return;
  camera.shakeMag = Math.max(camera.shakeMag || 0, mag);
  camera.shakeTime = Math.max(camera.shakeTime || 0, duration);
}

export function triggerHitStop(duration = 0.032) {
  if (settings.fxQuality === 'off') return;
  game.hitStop = Math.max(game.hitStop || 0, duration);
}

export function showNotice(message) {
  const el = $('notice');
  if (!el) return;
  const label=$('noticeText'), icon=$('noticeSkillIcon'), picture=icon?.parentElement;
  if(label)label.textContent=message;else el.textContent=message;
  const name=noticeSkillIcon(message);if(icon){setSkillIcon('noticeSkillIcon',name);picture?.classList.toggle('hidden',!name);}
  el.classList.remove('hidden');
  game.noticeTimer = 2.1;
}

export function applyRealmToEntity(entity, realmId = 'truc_co', refill = true) {
  if (!entity) return;
  const spec = getRealmSpec(realmId);
  const hpRatio = entity.maxHp > 0 ? clamp(entity.hp / entity.maxHp, 0, 1) : 1;
  const mpRatio = entity.maxMana > 0 ? clamp(entity.mana / entity.maxMana, 0, 1) : 1;
  entity.realmId = spec.id;
  entity.realmTier = spec.tier;
  entity.realm = spec.name;
  entity.atk = spec.atk;
  entity.skillMult = spec.skillMult;
  entity.defenseReduction = spec.defenseReduction;
  entity.maxHp = spec.maxHp;
  entity.maxMana = spec.maxMana;
  entity.manaRegen = spec.manaRegen;
  if (refill) {
    entity.hp = spec.maxHp;
    entity.mana = spec.maxMana;
  } else {
    entity.hp = Math.max(1, Math.round(spec.maxHp * hpRatio));
    entity.mana = Math.round(spec.maxMana * mpRatio);
  }
}

export function applyCharacterRealm(charName = settings.character, refill = false) {
  const realmId = charName === 'huyet_du' ? 'kim_dan' : 'truc_co';
  applyRealmToEntity(player, realmId, refill);
}

export function updateVitals() {
  const hpRatio = clamp(player.hp / player.maxHp, 0, 1);
  const mpRatio = clamp(player.mana / player.maxMana, 0, 1);
  const hpFill = $('hpFill');
  const mpFill = $('mpFill');
  if (hpFill) hpFill.style.width = (hpRatio * 100).toFixed(1) + '%';
  if (mpFill) mpFill.style.width = (mpRatio * 100).toFixed(1) + '%';
  const hpText = $('hpText');
  const mpText = $('mpText');
  if (hpText) hpText.textContent = Math.round(player.hp) + ' / ' + player.maxHp;
  if (mpText) mpText.textContent = Math.round(player.mana) + ' / ' + player.maxMana;
  const barrier=$('fusionBarrierStatus');if(barrier){barrier.classList.toggle('hidden',!(player.fusionBarrier>0));barrier.textContent=`HỘ THỂ ${Math.ceil(player.fusionBarrier||0)}`;}
  const realmBadge = $('playerRealmBadge');
  if (realmBadge) realmBadge.textContent = settings.character === 'huyet_du' ? 'KIM ĐAN CẢNH' : (player.realm || 'TRÚC CƠ · SƠ KỲ');
  const nameEl = $('playerCharName');
  if (nameEl) nameEl.textContent = settings.character === 'huyet_du' ? 'HUYẾT DỰ' : 'DIỆP TU';
}

export function spendMana(amount) {
  if (player.mana < amount) {
    showNotice('Không đủ linh lực');
    return false;
  }
  player.mana = Math.max(0, player.mana - amount);
  player.lastManaCost = amount;
  updateVitals();
  return true;
}

export function setFlightUI() {
  const flightBtn = $('flightBtn');
  const moveCaption = $('moveCaption');
  if (flightBtn) {
    flightBtn.classList.toggle('on', player.flying);
    flightBtn.textContent = player.flying ? 'RƠI' : 'BAY';
  }
  if (moveCaption) {
    moveCaption.textContent = player.flying
      ? 'TRÁI / PHẢI · LÊN / XUỐNG'
      : 'ĐI / CHẠY · ĐỘ CAO';
  }
}

export function setThanThucUI() {
  const active = !!settings.thanThuc;
  const btn = $('thanThucBtn');
  const sub = $('thanThucSub');
  const hudBtn = $('hudThanThucBtn');
  const zoomOut = $('zoomOut');

  if (btn) {
    btn.classList.toggle('on', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  }
  if (sub) {
    sub.textContent = active ? '4× · ĐANG BẬT' : 'TẦM NHÌN 4×';
  }
  if (hudBtn) {
    hudBtn.classList.toggle('on', active);
    hudBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
  }
  if (zoomOut) {
    zoomOut.textContent = active ? '17.5% · Thần Thức 4×' : '53.8% · Bình thường (+30%)';
  }
}

export function setCharacterUI() {
  const isHuyetDu = settings.character === 'huyet_du';
  const charBtn = $('charBtn');
  const hudCharBtn = $('hudCharBtn');
  const nameEl = $('playerCharName');
  const realmBadge = $('playerRealmBadge');
  if (nameEl) nameEl.textContent = isHuyetDu ? 'HUYẾT DỰ' : 'DIỆP TU';
  if (realmBadge) realmBadge.textContent = isHuyetDu ? 'KIM ĐAN CẢNH' : (player.realm || 'TRÚC CƠ · SƠ KỲ');

  if (charBtn) {
    charBtn.classList.toggle('huyet-du', isHuyetDu);
    charBtn.innerHTML = isHuyetDu
      ? '<span class="char-pill blood">MA</span><b>HUYẾT DỰ</b>'
      : '<span class="char-pill tao">ĐẠO</span><b>DIỆP TU</b>';
  }
  if (hudCharBtn) {
    hudCharBtn.classList.toggle('huyet-du', isHuyetDu);
    hudCharBtn.textContent = isHuyetDu ? 'HUYẾT DỰ' : 'DIỆP TU';
  }
}

// Cập nhật thanh máu dài của Boss Huyết Dự (Trúc Cơ Kỳ)
export function updateBossUI(dt = 0.016) {
  const bossHud = $('bossHud');
  if (!bossHud) return;

  if (!bossState.active) {
    bossHud.classList.add('hidden');
    return;
  }
  bossHud.classList.remove('hidden');

  bossState.hp = Math.max(0, Math.min(dummy.maxHp, dummy.hp));
  bossState.maxHp = dummy.maxHp || 3000;

  // Hiệu ứng thanh ma sát thương chậm (ghost damage bar)
  if (bossState.ghostHp > bossState.hp) {
    const step = Math.max(220, (bossState.ghostHp - bossState.hp) * 3.5);
    bossState.ghostHp = Math.max(bossState.hp, bossState.ghostHp - dt * step);
  } else {
    bossState.ghostHp = bossState.hp;
  }

  const ratio = clamp(bossState.hp / bossState.maxHp, 0, 1);
  const ghostRatio = clamp(bossState.ghostHp / bossState.maxHp, 0, 1);

  const fill = $('bossHpFill');
  const ghost = $('bossHpGhost');
  const text = $('bossHpText');
  const pct = $('bossHpPercent');

  if (fill) fill.style.width = (ratio * 100).toFixed(1) + '%';
  if (ghost) ghost.style.width = (ghostRatio * 100).toFixed(1) + '%';
  if (text) text.textContent = `${Math.round(bossState.hp)} / ${bossState.maxHp}`;
  if (pct) pct.textContent = `${Math.ceil(ratio * 100)}%`;
}

let roundNoticeTimeout = null;
export function triggerRoundNotice(round = 1, bossName = 'HUYẾT DỰ', realm = 'KIM ĐAN CẢNH') {
  const el = $('roundNotice');
  if (!el) return;
  const roundNum = $('roundNumText');
  const nameEl = $('roundBossNameText');
  const realmEl = $('roundRealmText');
  if (roundNum) roundNum.textContent = `VÒNG ${round}`;
  if (nameEl) nameEl.textContent = `BOSS: ${bossName}`;
  if (realmEl) realmEl.textContent = realm;

  el.classList.remove('hidden');
  el.classList.remove('fade-out');

  // Khởi động lại hiệu ứng animation
  el.classList.remove('play-anim');
  void el.offsetWidth;
  el.classList.add('play-anim');

  if (roundNoticeTimeout) clearTimeout(roundNoticeTimeout);
  roundNoticeTimeout = setTimeout(() => {
    el.classList.add('fade-out');
    setTimeout(() => {
      el.classList.add('hidden');
      el.classList.remove('play-anim');
      el.classList.remove('fade-out');
    }, 600);
  }, 4200);
}



