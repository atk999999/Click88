import {getFusionOptions,getFusionBaseId,CORE_SKILL_IDS,SWORD_REWARDS} from './fusion-skills.js';
import { resetGiantVisual, updateGiantVisual } from './diep-tu-cuong-bao.js';
import { resetTangMa, updateTangMaBoss, drawTangMa, forceTangMa } from './tang-ma-boss.js';
import { U_MINH_SPEC, resetUMinh, useUMinh, updateUMinh, drawUMinh, finishUMinh } from './u-minh-ma-buc.js';
import { drawBeastProjectileCores } from './beast-projectile-core.js';
import { ACQUIRED_SKILL_ICONS, CHARACTER_SKILL_ICONS, setSkillIcon } from './skill-icons.js';
import { MONSTER_SKILLS, TANG_MA_REWARDS, getLearnedSkill, castMonsterSkill, getMonsterSkillCooldown, updateMonsterSkills, resetMonsterSkills, getMonsterDash, cancelMonsterDash, updateMonsterDash, drawMonsterSkillProjectiles } from './ky-nang-quai.js';
import { HAC_HOA_XA_SPEC, resetHacHoaXa, useHacHoaXa, updateHacHoaXa, drawHacHoaXa, finishHacHoaXa, resetSnakePoison, getSnakePoison, updateSnakePoison } from './hac-hoa-xa.js';
import { advanceStrongImpulse } from './va-cham-manh.js';
import { PHONG_LANG_SPEC, resetPhongLang, getPhongLang, usePhongLang, updatePhongLang, drawPhongLang, finishPhongLang } from './phong-lang.js';
import { LOI_UNG_SPEC, resetLoiUng, getLoiUng, useLoiUng, updateLoiUng, drawLoiUng, finishLoiUng } from './loi-ung.js';
import { THIEN_KIEP_SPEC, createThienKiep, stepThienKiep } from './thien-kiep.js';
import { CULTIVATION_STAGES, KIM_DAN_STAGES, EXP_PER_STAGE, WOLF_EXP, BUFFS, createCultivation, addCultivationExp, restoreCultivationStats, chooseCultivationBuff } from './cultivation.js';
import { beginSkillCollisionFrame, endSkillCollisionFrame, getSkillStruggle, updateSkillStruggle, cancelSkillStruggle } from './va-cham-ky-nang.js';
// ============================================================================
// MODULE: ENGINE (Điều phối vòng lặp game, Nạp tài nguyên, Điều khiển & Giao diện)
// Cấu trúc mô-đun:
//  - ./state.js     : Hằng số thế giới, Trạng thái dùng chung & Tiện ích HUD/Camera
//  - ./audio.js     : Âm thanh hành động Foley (bước chân, tiếp đất)
//  - ./map.js       : Bản đồ, Địa hình, Hang động, Đào đất & Cảnh nền Parallax
//  - ./character.js : Nhân vật Diệp Tu, 17 Hoạt ảnh, Vật lý, Tàn ảnh & NPC
//  - ./skills.js    : Kỹ năng Hỏa Cầu, Tụ lực, Auto-Target 900 & Hiệu ứng PixelFX
// ============================================================================

import {
  $,
  clamp,
  CELL,
  WORLD_W,
  WORLD_H,
  GRAVITY,
  SPRITE_TEXTURE_SIZE,
  CLIPS,
  sourceAssets,
  BASE_ZOOM,
  THAN_THUC_ZOOM,
  settings,
  game,
  initCanvas,
  keys,
  analog,
  player,
  motion,
  camera,
  movementSpeed,
  dummy,
  getCombatTargets,
  useDummy,
  setCombatTargets,
  showNotice,
  updateVitals,
  setFlightUI,
  setThanThucUI,
  setCharacterUI,
  bossState,
  updateBossUI,
  triggerRoundNotice,
  applyCharacterRealm,
  applyRealmToEntity,
  addCameraShake,
} from './state.js';
import { actionAudio } from './audio.js';
let cultivation = createCultivation();
const BLOOD_REWARDS=Object.freeze({
  hand:{name:'HUYẾT THỦ',hint:'Chảy máu 8 giây',cast:'tap'},
  thread:{name:'HUYẾT KIM TUYẾN',hint:'Giữ tụ lực · tốn HP + MP',cast:'hold'},
  drain:{name:'THÔN LINH HUYẾT',hint:'Hút máu và linh lực',cast:'tap'},
  blast:{name:'HUYẾT BẠO',hint:'HP ≤ 10% · còn lại 1% HP',cast:'tap'},
});
let bloodSlots=Array(5).fill(null),coreSlots=[...CORE_SKILL_IDS],tribulation=null,pendingFusion=null,pendingMinorBreakthrough=false,pendingRewardMonster=null,pendingTangReward=null,practiceMode=false;
const MONSTER_REWARDS=Object.freeze({
  phong_lang:{name:'PHONG LANG',skills:['wolf_bite','wolf_wind']},
  loi_ung:{name:'LÔI ƯNG',skills:['eagle_orb','eagle_dive']},
  hac_hoa_xa:{name:'HẮC HỎA XÀ',skills:['snake_fang','snake_lunge']},
  u_minh_ma_buc:{name:'U MINH MA BỨC',skills:['bat_orb','bat_dive']},
});
const ROUND_MONSTER_TOTAL=20;
let monstersDefeated=0;
const MONSTER_WAVES=[3,3,3,3,4,4];
const KIM_DAN_WAVES=[3,3,4,4,4,4,4,4];
const KIM_DAN_MONSTER_TOTAL=30;
const U_MINH_WAVES=[3,3,4,4,4,4,4,4];
const U_MINH_TOTAL=30;
const isMonsterRound=()=>activeRound===0||activeRound===3||activeRound===5;
let monsterWave=0, monstersSpawned=0, monsters=[];
import { resetBossAI, updateBossAI, drawBossEffects } from './boss-ai.js';
import { resetLangTieuAI, updateLangTieuAI, drawLangTieuEffects } from './lang-tieu-ai.js';
import {
  surfaceAt,
  createTerrain,
  excavate as mapExcavate,
  drawEnvironment,
  drawTerrain,
} from './map.js';
import {
  reactionLocked,
  updatePlayerStun,
  canMove,
  startAction,
  resetMotion,
  updateAction,
  tryBufferedJump,
  toggleFlight,
  jump,
  selectPlayerAnimation,
  playerPose,
  updateAfterimages,
  drawAfterimages,
  drawPlayer,
  diepTuGiantVisual,
  moveBody,
  testAction,
  cycleCodeNpc,
  codeNpcPose,
  resetDummy,
  updateDummy,
  hitDummy,
  toggleNpcPatrol,
  dummyHitTest,
  drawDummy,
  npcShape,
  npcBodyOverlap,
  npcFeetSupport,
  applyUnblockedPlayerHit,
  applyStrongPlayerHit,
} from './character.js';
import {
  AUTO_TARGET_RANGE,
  getAutoTargetRange,
  SKILL_SLOTS,
  getCharge,
  castLocked,
  getFireballs,
  getHoaCauExplosions,
  getFxInstances,
  getLoiBaoBlast,
  getThoThuan,
  isThoThuanActive,
  getThuyKiem,
  getNguHanh,
  isNguHanhSustaining,
  resetSkills,
  fxEmit,
  emitSkillClash,
  fxDust,
  fxUpdate,
  fxDraw,
  fxClear,
  fxTakeoff,
  fireOrbPoint,
  beginCharge,
  endCharge,
  abortCharge,
  toggleThoThuan,
  castThuyKiem,
  toggleNguHanh,
  triggerLockedSkillSlot,
  updateCharge,
  updateChargeTarget,
  updateFireballs,
  lockedTargetForUI,
  drawTargetLock,
  castHuyetThuSkill,
  beginHuyetKimTuyenSkill,
  releaseHuyetKimTuyenSkill,
  castThonLinhHuyetSkill,
  castHuyetBaoSkill,
  getHuyetThu,
  getHuyetKimTuyen,
  getThonLinhHuyet,
  getHuyetBao,
  updateHuyetDuBtnUI,
  updateEarthBtnUI,
  receivePlayerDamage,
} from './skills.js';

initCanvas();

export function toggleThanThuc(forceState) {
  if (!game.running) return false;
  const next = typeof forceState === 'boolean' ? forceState : !settings.thanThuc;
  settings.thanThuc = next;
  settings.targetZoom = next ? THAN_THUC_ZOOM : BASE_ZOOM;
  if (next) {
    settings.thanThucPulse = 1.0;
    actionAudio.thanThucActivate();
    showNotice('Đã mở Thần Thức · Tầm nhìn xa gấp 4 lần & khóa mục tiêu 3600');
  } else {
    actionAudio.thanThucDeactivate();
    showNotice('Đã tắt Thần Thức · Trở về tầm nhìn bình thường');
  }
  if (getCharge()) {
    updateChargeTarget(getCharge(), 0);
  }
  setThanThucUI();
  return settings.thanThuc;
}

export function toggleCharacter(charName) {
  if (game.started && charName !== 'diep_tu') return settings.character;
  if (game.running && (castLocked() || getCharge())) {
    showNotice('Hãy hoàn tất chiêu thức trước khi đổi nhân vật.');
    return settings.character;
  }
  if (charName) {
    settings.character = charName;
  } else {
    settings.character = settings.character === 'huyet_du' ? 'diep_tu' : 'huyet_du';
  }
  actionAudio.stopAll();
  applyCharacterRealm(settings.character, false);
  setCharacterUI();
  updateVitals();
  updateHuyetDuBtnUI();
  if (settings.character === 'huyet_du') {
    // Hủy các trận pháp đang duy trì của Diệp Tu nếu có
    const tk = getThuyKiem();
    if (tk && tk.phase !== 'idle') {
      tk.phase = 'idle';
      tk.swords = [];
      tk.rays = [];
    }
    const nh = getNguHanh();
    if (nh && nh.phase !== 'idle') {
      nh.phase = 'idle';
      nh.pillars = [];
      nh.streams = [];
    }
    showNotice('Đã chuyển sang nhân vật: HUYẾT DỰ (Tóc đỏ · Áo đen · 5 Kỹ Năng Ma Đạo)');
  } else {
    updateEarthBtnUI();
    showNotice('Đã chuyển sang nhân vật: DIỆP TU (Thanh bào · 5 Kỹ Năng Đạo Pháp)');
  }
  return settings.character;
}

function excavate(x = player.x, y = player.y + 28, r = 76) {
  mapExcavate(x, y, r, fxDust);
}

function resetWorld() {
  actionAudio.stopAll();
  setInput(false);
  resetMotion();
  resetGiantVisual(diepTuGiantVisual);
  resetMonsterSkills();
  resetSkills();
  resetSnakePoison();
  $('poisonStatus')?.classList.add('hidden');
  const terrain = createTerrain();
  resetDummy();
  dummy.patrol = false;
  const patrolBtn = $('patrolBtn');
  if (patrolBtn) patrolBtn.textContent = 'NPC DI CHUYỂN: TẮT';

  player.x = 520;
  player.y = terrain.firstSolidY(player.x) - 0.5;
  // Chỉ tạo sẵn 2 chunk mặt đất ngay tại vị trí xuất phát để tránh đơ luồng chính khi bấm Xuất chiến
  terrain.renderChunk(1, 1);
  terrain.renderChunk(2, 1);
  player.vx = 0;
  player.vy = 0;
  player.flying = false;
  player.grounded = true;
  player.anim = 'idle';
  player.animTime = 0;
  player.jumpTime = 999;
  player.landTime = 0;
  player.forceAnim = '';
  player.forceTime = 0;
  player.visualScale = 1;
  player.flash = 0;
  player.facing = 1;
  if(cultivation.kimDan)applyRealmToEntity(player,'kim_dan',true);
  else applyCharacterRealm(settings.character, true);
  restoreCultivationStats(cultivation, player, true);
  player.lastManaCost = 0;

  camera.x = player.x;
  camera.y = player.y - 26;
  camera.shakeTime = 0;
  camera.shakeMag = 0;
  camera.shakeX = 0;
  camera.shakeY = 0;
  game.hitStop = 0;

  settings.thanThuc = false;
  settings.targetZoom = BASE_ZOOM;
  settings.zoom = BASE_ZOOM;
  settings.thanThucPulse = 0;

  setFlightUI();
  setThanThucUI();
  setCharacterUI();
  updateVitals();
  updateBossUI(0);
}

function loadImage(key, path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      game.images[key] = img;
      resolve(true);
    };
    img.onerror = () => {
      console.warn('Asset failed', key);
      resolve(false);
    };
    img.src = (import.meta.env?.BASE_URL || '/') + path;
  });
}

async function preload() {
  const names = Object.keys(sourceAssets);
  let n = 0;
  const errors = [];
  for (const k of names) {
    const ok = await loadImage(k, sourceAssets[k]);
    if (!ok) errors.push(k);
    n++;
    $('loadStatus').textContent = `Đã tải ${n}/${names.length} tài nguyên`;
  }
  game.ready = !!game.images.phong_lang && !!game.images.loi_ung && !!game.images.u_minh_ma_buc && !!game.images.tang_ma_base && !!game.images.tang_ma_skills && CLIPS.every(
    ([id, count]) =>
      !!game.images[id] && game.images[id].naturalWidth === count * SPRITE_TEXTURE_SIZE &&
      !!game.images['huyet_du_' + id] && [128, 256].includes(game.images['huyet_du_' + id].naturalHeight) && game.images['huyet_du_' + id].naturalWidth === count * game.images['huyet_du_' + id].naturalHeight
  );
  $('startBtn').disabled = !game.ready;
  $('loadStatus').textContent = !game.ready
    ? 'Lỗi tải ảnh nhân vật hoặc quái. Hãy tải lại game.'
    : errors.length
    ? `Tải thiếu ${errors.length} tài nguyên: ${errors.join(', ')}`
    : 'Sẵn sàng · Auto Target 900 · truy đuổi nhẹ';
}

function setMenu(which) {
  actionAudio.stopAll();
  game.menu = which;
  $('overlay').classList.remove('hidden');
  $('menu').classList.toggle('hidden', which !== 'menu');
  $('settings').classList.toggle('hidden', which !== 'settings');
  $('about').classList.toggle('hidden', which !== 'about');
  $('characterSelect').classList.toggle('hidden', which !== 'select');
  $('swordPreview').classList.toggle('hidden', which !== 'swordPreview');
  $('tangMaTestControls')?.classList.add('hidden');
  $('tangMaPreview').classList.toggle('hidden', which !== 'tangMaPreview');
  $('battleResult').classList.toggle('hidden', which !== 'result');
  $('cultivationChoice').classList.toggle('hidden', which !== 'buff');
  $('monsterReward').classList.toggle('hidden', which !== 'monster_reward');
  $('bloodReward').classList.toggle('hidden', which !== 'loot');
  $('swordReward')?.classList.toggle('hidden', which !== 'sword_reward');
  $('tangReward')?.classList.toggle('hidden', which !== 'tang_reward' && which !== 'tang_replace');
  $('fusionReward').classList.toggle('hidden', which !== 'fusion');
  $('tribulationHud').classList.add('hidden');
  game.running = false;
  setInput(false);
  $('controls').classList.add('hidden');
  $('fxDemo')?.classList.add('hidden');
  $('hud').classList.add('hidden');
  $('vitals').classList.add('hidden');
  $('bossHud')?.classList.add('hidden');
  $('roundNotice')?.classList.add('hidden');
  $('hint').classList.add('hidden');
  $('startBtn').textContent = player.hp <= 0 ? 'Chơi lại' : game.started ? 'Tiếp tục' : 'Bắt đầu';
  const defeat = $('defeatMessage');
  if (defeat) defeat.classList.toggle('hidden', player.hp > 0);
  $('restartBtn').classList.toggle('hidden', !game.started);
}

function play() {
  if (!game.ready) {
    showNotice('Tài nguyên đang được tải');
    return;
  }
  actionAudio.unlock();
  if(game.battlePhase==='fusion'){setMenu('fusion');return;}
  if(game.battlePhase==='loot'){setMenu('loot');return;}
  if(game.battlePhase==='sword_reward'){setMenu('sword_reward');return;}
  if(game.battlePhase==='tang_reward'||game.battlePhase==='tang_replace'){setMenu(game.battlePhase);return;}
  if(game.battlePhase==='buff'){setMenu('buff');return;}
  if(game.battlePhase==='monster_reward'){setMenu('monster_reward');return;}
  if (!game.started || player.hp <= 0 || ['victory', 'defeat'].includes(game.battlePhase)) {
    setMenu('select');
    return;
  }
  const canControl = ['waiting', 'fight','tribulation'].includes(game.battlePhase);
  game.acc = 0;
  game.running = true;
  $('overlay').classList.add('hidden');
  $('controls').classList.toggle('hidden', !canControl);
  $('hud').classList.remove('hidden');
  $('vitals').classList.remove('hidden');
  $('tangMaTestControls')?.classList.add('hidden');
  $('roundMonsterCount')?.classList.toggle('hidden',!isMonsterRound());
  $('tribulationHud').classList.toggle('hidden',game.battlePhase!=='tribulation');
  updateVitals();
  updateBossUI(0);
  updatePrimarySkillSlots();
  $('hint').classList.toggle('hidden', !canControl);
  game.last = 0;
  setTimeout(() => {
    $('hint').classList.add('hidden');
  }, 6200);
}

let introClock = 0;
let introGroundY = 0;
let cueTime = 0;
const BOSS_SPAWN_DELAY = 5; // Vòng 1 chờ đủ 5 giây trước khi boss xuất hiện.
const BOSS_SPAWN_DISTANCE = 1900; // Xa gấp 2.5 lần (760 * 2.5 = 1900)
const BOSS_SPAWN_HEIGHT = 640;
const BOSS_CLOSEUP_ZOOM = 1.32;
const BOSS_TYPEWRITER_CPS = 36;
const HUYET_INTRO_QUOTE =
  '“Chỉ bằng cảnh giới Trúc Cơ nhỏ bé mà dám cản đường bản tọa? Hôm nay máu và linh lực của ngươi sẽ tế luyện cho Huyết Đan của ta!”';
let activeRound = 1;
const getIntroQuote = () => activeRound === 1 ? HUYET_INTRO_QUOTE : activeRound===4 ? '“Bổn tọa là Táng Ma. Ngươi đã dám xông vào ma vực, hãy tiếp lấy ma quyền của ta!”' : '“Kiếm tại tâm, tâm bất loạn. Hãy xem ngươi có thể tiếp được mấy kiếm của ta!”';
let lastIntroCharIndex = 0;

function advanceBossIntroDialogue() {
  if (game.battlePhase !== 'focus') return;
  const quoteEl = $('introBossQuote');
  const fullLen = getIntroQuote().length;
  const currentChars = Math.floor(introClock * BOSS_TYPEWRITER_CPS);
  // Nếu chữ đang chạy dở thì nhấn lần 1 sẽ hiện trọn vẹn câu thoại ngay lập tức
  if (currentChars < fullLen && quoteEl && quoteEl.textContent !== getIntroQuote()) {
    introClock = fullLen / BOSS_TYPEWRITER_CPS + 0.1;
    lastIntroCharIndex = fullLen;
    quoteEl.textContent = getIntroQuote();
    actionAudio.bossDialogueConfirm?.();
    return;
  }
  // Khi câu thoại đã hiện đủ, nhấn Tiếp tục sẽ thu camera về bình thường và vào trận
  actionAudio.bossDialogueConfirm?.();
  dummy.y = introGroundY;
  dummy.demoTimer = 0;
  settings.targetZoom = BASE_ZOOM;
  game.battlePhase = 'recenter';
  introClock = 0;
  $('introBoss')?.classList.add('hidden');
  $('introCue')?.classList.remove('hidden');
}

function configureBossUI(round) {
  const ling = round === 2;
  const tang=round===4,displayRound=tang?3:round;
  const name = tang?'TÁNG MA':ling ? 'LĂNG TIÊU' : 'HUYẾT DỰ';
  const realm = tang?'HÓA THẦN KỲ':ling ? 'KIẾM TU ÁO TRẮNG' : 'KIM ĐAN CẢNH';
  const avatar = `${(import.meta.env?.BASE_URL || '/')}assets/avatars/${tang?'Tang_Ma_512.webp':ling ? 'Lang_Tieu_Game.webp' : 'Huyet_Du_Avatar_100KB.webp'}`;
  bossState.round=displayRound;bossState.name=name;bossState.realm=realm;
  for (const id of ['introBossName','bossName']) if ($(id)) $(id).textContent=name;
  for (const id of ['introBossRound','bossRound']) if ($(id)) $(id).textContent=`VÒNG ${displayRound}`;
  for (const id of ['introBossRealm','bossRealm']) if ($(id)) $(id).textContent=realm;
  for (const id of ['introBossAvatar','bossAvatar']) if ($(id)) { $(id).src=avatar; $(id).alt=name; }
  if ($('bossEpithet')) $('bossEpithet').textContent=tang?'MA THÂN KHỔNG LỒ':ling?'BẠCH Y KIẾM TU':'MA TU NGHỊCH MỆNH';
  if ($('introRound')) $('introRound').textContent=`VÒNG ${displayRound}`;
  if ($('bossHud')) $('bossHud').setAttribute('aria-label',`Thanh máu boss ${name}`);
}
function beginRound(round) {
  setCombatTargets(null);useDummy();monsters=[];
  activeRound=round;
  $('roundMonsterCount')?.classList.add('hidden');
  // Reset toàn bộ vật thể đang bay, trạng thái xấu và hồi phục giữa hai vòng.
  dummy.skin='huyet_du';dummy.combatStyle='magic';dummy.maxHp=3000;dummy.swordShield=null;
  resetWorld();resetBossAI();
  if(round===2){
    dummy.skin='ling_tieu';dummy.combatStyle='sword';dummy.flying=false;
    dummy.maxHp=6500;dummy.hp=6500;dummy.name='LĂNG TIÊU · BẠCH Y KIẾM TU';
    resetDummy();resetLangTieuAI();
  } else if(round===4){
    dummy.skin='tang_ma';dummy.combatStyle='melee';dummy.isBoss=true;dummy.flying=false;dummy.maxHp=9000;dummy.hp=9000;dummy.name='TÁNG MA · MA THÂN KHỔNG LỒ';
    resetDummy();resetTangMa();tangMaDeathTime=0;
  } else {dummy.skin='huyet_du';dummy.name='HUYẾT DỰ · KIM ĐAN CẢNH';}
  configureBossUI(round);
  game.started=true;game.battlePhase='waiting';introClock=0;lastIntroCharIndex=0;cueTime=0;
  dummy.visible=false;bossState.active=false;bossState.hp=bossState.maxHp=dummy.maxHp;bossState.ghostHp=dummy.maxHp;
  $('battleIntro').classList.remove('hidden');$('introRound').classList.remove('hidden');
  $('introBoss').classList.add('hidden');$('introCue').classList.add('hidden');
  updateBossUI(0);updateVitals();
}
function useMonster(monster){
  useDummy(monster.entity);
  if(monster.entity.skin==='u_minh_ma_buc')useUMinh(monster.ai);else if(monster.entity.skin==='hac_hoa_xa')useHacHoaXa(monster.ai);else if(monster.entity.skin==='loi_ung')useLoiUng(monster.ai);else usePhongLang(monster.ai);
}
function selectNearestMonster(){
  const living=monsters.filter(m=>!m.entity.broken&&m.entity.hp>0);
  const candidates=living.length?living:monsters;
  if(!candidates.length)return;
  let best=candidates[0],distance=Infinity;
  for(const m of candidates){const d=Math.hypot(m.entity.x-player.x,m.entity.y-50-(player.y-60));if(d<distance){best=m;distance=d;}}
  useMonster(best);
}
function beginPhongLangEncounter() {
  pendingRewardMonster=null;monstersDefeated=0;monsterWave=0;monstersSpawned=0;monsters=[];setCombatTargets(null);useDummy();
  activeRound=0;$('roundMonsterCount')?.classList.remove('hidden');dummy.skin='phong_lang';dummy.combatStyle='melee';dummy.isBoss=true;
  dummy.maxHp=PHONG_LANG_SPEC.hp;dummy.swordShield=null;resetWorld();
  bossState.active=false;game.started=true;game.battlePhase='fight';
  $('battleIntro').classList.add('hidden');$('introRound').classList.add('hidden');
  $('introBoss').classList.add('hidden');$('introCue').classList.add('hidden');
  spawnMonsterWave();updateBossUI(0);updateVitals();updateCultivationUI();
}
function beginKimDanEncounter() {
  pendingRewardMonster=null;monstersDefeated=0;monsterWave=0;monstersSpawned=0;monsters=[];setCombatTargets(null);useDummy();
  activeRound=3;$('roundMonsterCount')?.classList.remove('hidden');resetSnakePoison();bossState.active=false;dummy.visible=false;game.started=true;game.battlePhase='fight';
  $('battleIntro').classList.add('hidden');$('introRound').classList.add('hidden');$('introBoss').classList.add('hidden');$('introCue').classList.add('hidden');
  spawnMonsterWave();updateBossUI(0);updateVitals();updateCultivationUI();
}
function beginUMinhEncounter(practice=false){
  practiceMode=practice;
  pendingRewardMonster=null;monstersDefeated=0;monsterWave=0;monstersSpawned=0;monsters=[];setCombatTargets(null);useDummy();
  resetWorld();activeRound=5;$('roundMonsterCount')?.classList.remove('hidden');bossState.active=false;dummy.visible=false;game.started=true;game.battlePhase='fight';
  $('battleIntro').classList.add('hidden');$('introRound').classList.add('hidden');$('introBoss').classList.add('hidden');$('introCue').classList.add('hidden');
  spawnMonsterWave();updateBossUI(0);updateVitals();updateCultivationUI();showNotice('VÒNG 3 · U MINH MA BỨC');
}
let tangMaDeathTime=0;
function startTangMaTest(){
  if(!game.ready){showNotice('Tài nguyên đang được tải');return;}
  cultivation=createCultivation();bloodSlots=Array(5).fill(null);coreSlots=[...CORE_SKILL_IDS];tribulation=null;pendingFusion=null;pendingMinorBreakthrough=false;updateBloodSlots();restoreCoreSlotUI();settings.character='diep_tu';
  setCombatTargets(null);useDummy();monsters=[];activeRound=4;dummy.skin='tang_ma';dummy.isBoss=true;dummy.maxHp=9000;dummy.swordShield=null;
  resetWorld();dummy.skin='tang_ma';dummy.isBoss=true;dummy.maxHp=9000;dummy.hp=9000;dummy.x=1100;dummy.y=game.terrain.firstSolidY(dummy.x)-.5;dummy.visible=true;dummy.flying=false;dummy.combatStyle='melee';
  bossState.round=4;bossState.name='TÁNG MA';bossState.realm='HÓA THẦN KỲ';bossState.active=true;bossState.ghostHp=9000;
  $('bossHud')?.setAttribute('aria-label','Thanh máu boss Táng Ma');$('bossName').textContent='TÁNG MA';$('bossRealm').textContent='HÓA THẦN KỲ';$('bossRound').textContent='THỬ BOSS';$('bossEpithet').textContent='MA THÂN KHỔNG LỒ';$('bossAvatar').src=`${(import.meta.env?.BASE_URL || '/')}assets/avatars/Tang_Ma_512.webp`;
  resetTangMa();tangMaDeathTime=0;game.started=true;game.battlePhase='fight';$('battleIntro').classList.add('hidden');play();showNotice('TRẬN THỬ · TÁNG MA');
}
function startBattle() {
  practiceMode=false;pendingTangReward=null;cultivation=createCultivation();bloodSlots=Array(5).fill(null);coreSlots=[...CORE_SKILL_IDS];tribulation=null;pendingFusion=null;pendingMinorBreakthrough=false;updateBloodSlots();restoreCoreSlotUI();$('tribulationHud').classList.add('hidden');settings.character='diep_tu';beginPhongLangEncounter();play();
}
function updateCultivationUI(){
  const value=$('cultivationXp');if(value)value.textContent=(cultivation.kimDan?cultivation.kimDanStage:cultivation.stage)>=2?'EXP · HẬU KỲ':`EXP ${cultivation.xp} / ${EXP_PER_STAGE}`;
  const count=$('roundMonsterCount');if(count)count.textContent=activeRound===5?`VÒNG 3 · MA BỨC ${monstersDefeated} / ${U_MINH_TOTAL}`:activeRound===3?`KIM ĐAN · HẮC HỎA XÀ ${monstersDefeated} / ${KIM_DAN_MONSTER_TOTAL}`:`VÒNG 1 · QUÁI ${monstersDefeated} / ${ROUND_MONSTER_TOTAL}`;
}
function spawnMonsterWave(){
  const waves=activeRound===5?U_MINH_WAVES:activeRound===3?KIM_DAN_WAVES:MONSTER_WAVES;
  if(monsterWave>=waves.length)return;
  const count=waves[monsterWave++];
  const base={...dummy};
  for(let i=0;i<count;i++){
    const serial=monstersSpawned++,isBat=activeRound===5,isSnake=activeRound===3,isEagle=!isSnake&&!isBat&&serial%2===1,isFlyer=isSnake&&serial%2===1;
    const entity={...base,skin:isBat?'u_minh_ma_buc':isSnake?'hac_hoa_xa':isEagle?'loi_ung':'phong_lang',name:isBat?'U MINH MA BỨC':isSnake?'HẮC HỎA XÀ':isEagle?'LÔI ƯNG':'PHONG LANG',maxHp:isBat?U_MINH_SPEC.hp:isSnake?HAC_HOA_XA_SPEC.hp:isEagle?LOI_UNG_SPEC.hp:PHONG_LANG_SPEC.hp,maxMana:100,realmId:isSnake||isBat?'kim_dan':'truc_co',realmTier:isSnake||isBat?3:2,defenseReduction:.08,visible:true,isBoss:true,combatStyle:'melee',_targetId:`mob-${serial}`};
    useDummy(entity);resetDummy();
    // Spawn outside melee range, preferring the side with the most space.
    const rightSpace=WORLD_W-100-player.x,leftSpace=player.x-100;
    const direction=rightSpace>=leftSpace?1:-1;
    const distance=isBat?950+i*210:isSnake?(isFlyer?1150:1000)+i*390:(isEagle?1000:720)+i*185;
    entity.x=clamp(player.x+direction*distance,80,WORLD_W-80);
    entity.y=(isBat||isEagle||isFlyer)?Math.min(game.terrain.firstSolidY(entity.x)-180,player.y-(isSnake?250:200)-i*22):game.terrain.firstSolidY(entity.x)-.5;
    entity.visible=true;entity.facing=-direction;
    const ai=isBat?resetUMinh():isSnake?resetHacHoaXa(isFlyer):isEagle?resetLoiUng():resetPhongLang();
    // Stagger opening attacks so an entire group does not attack in the same frame.
    if(isSnake){ai.fangCooldown+=i*.5;ai.lungeCooldown+=i*.55;}else if(isEagle||isBat){ai.orbCooldown+=i*.45;ai.diveCooldown+=i*.5;}else{ai.windCooldown+=i*.45;ai.leapCooldown+=i*.4;}
    monsters.push({entity,ai});
  }
  setCombatTargets(monsters.map(m=>m.entity));selectNearestMonster();game.battlePhase='fight';
  updateVitals();updateCultivationUI();showNotice(`ĐỢT ${monsterWave} · ${count} QUÁI XUẤT HIỆN`);
}
function updateMonsterWave(dt){
  for(const m of monsters){
    useMonster(m);
    if(!dummy.broken&&dummy.hp>0)updateDummy(dt);
    if(dummy.skin==='u_minh_ma_buc')updateUMinh(dt);else if(dummy.skin==='hac_hoa_xa')updateHacHoaXa(dt);else if(dummy.skin==='loi_ung')updateLoiUng(dt);else updatePhongLang(dt);
  }
  selectNearestMonster();
}
function processDefeatedMonsters(){
  for(const m of [...monsters]){
    useMonster(m);
    const finished=dummy.skin==='u_minh_ma_buc'||dummy.skin==='hac_hoa_xa'||dummy.skin==='loi_ung'?!!m.ai.defeatedReady:m.ai.defeatTime>=PHONG_LANG_SPEC.defeatDuration;
    if(!finished)continue;
    if(dummy.skin==='u_minh_ma_buc')finishUMinh();else if(dummy.skin==='hac_hoa_xa')finishHacHoaXa();else if(dummy.skin==='loi_ung')finishLoiUng();else finishPhongLang();
    monsters.splice(monsters.indexOf(m),1);monstersDefeated++;
    setCombatTargets(monsters.map(q=>q.entity));
    const insight=activeRound===5&&!practiceMode&&(monstersDefeated===10||monstersDefeated===20);
    const breakthrough=activeRound===5?insight:addCultivationExp(cultivation,dummy.skin==='loi_ung'?LOI_UNG_SPEC.exp:WOLF_EXP);
    if(insight)cultivation.pending=true;
    updateCultivationUI();
    if(breakthrough){
      // Snapshot the defeated monster before switching focus to a survivor.
      pendingRewardMonster=m.entity.skin;
      player.realm=cultivation.kimDan?KIM_DAN_STAGES[cultivation.kimDanStage||0]:CULTIVATION_STAGES[cultivation.stage];
      $('cultivationStage').textContent=insight?'LĨNH NGỘ · U MINH MA BỨC':player.realm;$('cultivationSubtitle').textContent='Chọn 1 buff cho lượt chơi này';
      game.battlePhase='buff';setMenu('buff');actionAudio.progressCue('progress_breakthrough');selectNearestMonster();return true;
    }
  }
  if(monstersDefeated>=(activeRound===5?U_MINH_TOTAL:activeRound===3?KIM_DAN_MONSTER_TOTAL:ROUND_MONSTER_TOTAL)){beginRound(activeRound===5?4:activeRound===3?2:1);return true;}
  if(monsters.length===0)spawnMonsterWave();else selectNearestMonster();
  return false;
}
const PRIMARY_SLOT_UI=[
 ['skillBtn1','skill1Title','hoaCauSub'],['skillBtn2','skill2Title','loiBaoSub'],
 ['thoThuanBtn','skill3Title','thoThuanSub'],['thuyKiemBtn','thuyKiemTitle','thuyKiemSub'],['nguHanhBtn','nguHanhTitle','nguHanhSub']
];
function restoreCoreSlotUI(){
 updateHuyetDuBtnUI();CHARACTER_SKILL_ICONS.diep_tu.forEach((icon,i)=>setSkillIcon(`skill${i+1}Icon`,icon));
 for(const [btn] of PRIMARY_SLOT_UI)$(btn)?.classList.remove('fusion-equipped');
}
function updatePrimarySkillSlots(){
 if(settings.character!=='diep_tu')return;
 for(let i=0;i<coreSlots.length;i++){
  const spec=getLearnedSkill(coreSlots[i]);if(!spec)continue;
  const [btn,title,sub]=PRIMARY_SLOT_UI[i],button=$(btn),cooldown=getMonsterSkillCooldown(coreSlots[i]);
  if(button){button.classList.add('fusion-equipped');button.classList.toggle('cooldown',cooldown>0);button.setAttribute('aria-label',`Kỹ năng ${i+1}: ${spec.name}${cooldown>0?` · hồi ${Math.ceil(cooldown)} giây`:''}`);}
  if($(title))$(title).textContent=spec.name;if($(sub))$(sub).textContent=cooldown>0?`HỒI ${Math.ceil(cooldown)}S`:spec.hint;
  setSkillIcon(`skill${i+1}Icon`,ACQUIRED_SKILL_ICONS[coreSlots[i]]||'empty');
 }
}
function usePrimaryFusion(index){const id=coreSlots[index];return id!==CORE_SKILL_IDS[index]&&!!getLearnedSkill(id)?castMonsterSkill(id):false;}
function cleanupConsumedCore(index){
 const base=CORE_SKILL_IDS[index];
 if((base==='fire'||base==='lightning')&&getCharge()?.kind===base)abortCharge();
 if(base==='earth'){getThoThuan().active=false;player.shieldActive=false;}
 if(base==='water'){const tk=getThuyKiem();tk.phase='idle';tk.swords=[];tk.rays=[];}
 if(base==='five_elements'){const nh=getNguHanh();nh.phase='idle';nh.pillars=[];nh.streams=[];for(const target of getCombatTargets())target.trapped=false;}
}
function canEquipSeparate(source){return bloodSlots.includes(null)&&(source!=='monster'||activeRound!==0||bloodSlots.filter(Boolean).length<4);}
function availableFusionOptions(id){return getFusionOptions(id,bloodSlots,settings.character,coreSlots);}
function selectBreakthroughBuff(id){
  if(game.battlePhase!=='buff'||!chooseCultivationBuff(cultivation,player,id))return false;
  pendingMinorBreakthrough=true;updateCultivationUI();return openMonsterReward(pendingRewardMonster);
}
function openMonsterReward(monsterSkin){
  pendingRewardMonster=monsterSkin;
  const reward=MONSTER_REWARDS[monsterSkin];
  $('monsterRewardTitle').textContent=reward?`KỸ NĂNG · ${reward.name}`:'CHỌN KỸ NĂNG QUÁI';
  $('monsterRewardFoot').textContent=activeRound===0?'Có 5 ô kỹ năng nhận được. Một ô được dành cho phần thưởng Huyết Dự.':'Có thể trang bị vào ô trống, dung hợp hoặc bỏ qua.';
  for(const key of Object.keys(MONSTER_SKILLS)) {
    const button=$('monster-'+key);if(!button)continue;
    const allowed=!!reward?.skills.includes(key);
    button.classList.toggle('hidden',!allowed);
    button.disabled=!allowed||bloodSlots.includes(key)||(!canEquipSeparate('monster')&&!availableFusionOptions(key).length);
  }
  game.battlePhase='monster_reward';setMenu('monster_reward');actionAudio.progressCue('progress_reward');return true;
}
const FUSION_PAGE_SIZE=12;
function equippedFusionOptions(){
 const result=[],seen=new Set();
 for(let i=0;i<bloodSlots.length;i++){
  const incoming=bloodSlots[i];if(!incoming)continue;
  const otherSlots=bloodSlots.filter((_,j)=>j!==i);
  for(const option of getFusionOptions(incoming,otherSlots,settings.character,coreSlots)){
   const base=option.requires||getFusionBaseId(option.base);if(!base||base===incoming)continue;
   const key=option.id+':'+[base,incoming].sort().join(':');if(seen.has(key))continue;seen.add(key);
   result.push({...option,incoming,incomingSlot:i});
  }
 }
 return result;
}
function renderFusionPage(){
 const p=pendingFusion;if(!p)return;const pages=Math.max(1,Math.ceil(p.options.length/FUSION_PAGE_SIZE));p.page=Math.max(0,Math.min(p.page||0,pages-1));
 const start=p.page*FUSION_PAGE_SIZE;const list=$('fusionOptions');if(list)list.scrollTop=0;
 $('fusionEmpty').classList.toggle('hidden',p.options.length>0);
 $('fusionPagination').classList.toggle('hidden',pages<=1);$('fusionPage').textContent=`${p.page+1} / ${pages}`;
 $('fusionPrev').disabled=p.page===0;$('fusionNext').disabled=p.page>=pages-1;
 for(let i=0;i<FUSION_PAGE_SIZE;i++){const button=$(`fusionChoice${i}`),option=p.options[start+i];if(!button)continue;button.classList.toggle('hidden',!option);setSkillIcon(`fusionChoice${i}Icon`,option?(ACQUIRED_SKILL_ICONS[option.id]||'empty'):'empty');if(option){$(`fusionChoice${i}Name`).textContent=option.name;$(`fusionChoice${i}Description`).textContent=`MẤT ${option.base} + ${option.incomingName} · ${option.hint} · diện rộng ${option.aoe} · hồi ${option.cooldown} giây${option.base==='Thổ Thuẫn'?' · MẤT KHẢ NĂNG ĐỠ LÔI KIẾP':''}`;}}
}
function offerFusion(source,id){
 const options=availableFusionOptions(id);if(!options.length)return false;
 pendingFusion={source,id,options,page:0};
 $('fusionTitle').textContent='LĨNH NGỘ TUYỆT KỸ';$('fusionIncoming').textContent=`Dung hợp sẽ tiêu hao ${options[0].incomingName} và một kỹ năng đang sở hữu.`;
 $('fusionKeep').disabled=source!=='tang'&&!canEquipSeparate(source);$('fusionKeepTitle').textContent='Trang bị kỹ năng mới';$('fusionKeepSub').textContent=source==='tang'&&!bloodSlots.includes(null)?'Chọn ô muốn thay thế':'Nhận chiêu riêng, không dung hợp';$('fusionBack').classList.remove('hidden');
 setSkillIcon('fusionKeepIcon',ACQUIRED_SKILL_ICONS[id]||'empty');renderFusionPage();game.battlePhase='fusion';setMenu('fusion');return true;
}
function openBreakthroughFusion(stage){
 pendingFusion={source:stage,options:equippedFusionOptions(),page:0};
 $('fusionTitle').textContent='DUNG HỢP SAU ĐỘT PHÁ';
 $('fusionIncoming').textContent=stage==='major'?'Đột phá Kim Đan · chọn dung hợp kỹ năng đang sở hữu hoặc bỏ qua.':stage==='victory'?'Chọn hai kỹ năng đang sở hữu để dung hợp hoặc quay lại.':'Tiểu cảnh giới đột phá · chọn dung hợp kỹ năng đang sở hữu hoặc bỏ qua.';
 $('fusionKeep').disabled=false;$('fusionKeepTitle').textContent='Bỏ qua dung hợp';$('fusionKeepSub').textContent='Tiếp tục hành trình';$('fusionBack').classList.add('hidden');setSkillIcon('fusionKeepIcon','empty');
 renderFusionPage();game.battlePhase='fusion';setMenu('fusion');return true;
}
function resumeAfterMonsterReward(id){
 const total=activeRound===5?U_MINH_TOTAL:activeRound===3?KIM_DAN_MONSTER_TOTAL:ROUND_MONSTER_TOTAL;
 if(monstersDefeated>=total)beginRound(activeRound===5?4:activeRound===3?2:1);
 else if(monsters.length===0)spawnMonsterWave();
 else {selectNearestMonster();game.battlePhase='fight';}
 updateCultivationUI();play();if(id!=='skip')actionAudio.progressCue('progress_reward');return true;
}
function finishMonsterReward(id){
 pendingRewardMonster=null;
 if(pendingMinorBreakthrough){pendingMinorBreakthrough=false;return openBreakthroughFusion('minor');}
 return resumeAfterMonsterReward(id);
}

function selectMonsterReward(id){
  if(game.battlePhase!=='monster_reward')return false;
  if(id==='skip')return finishMonsterReward(id);
  if(!MONSTER_REWARDS[pendingRewardMonster]?.skills.includes(id)||bloodSlots.includes(id))return false;
  if(offerFusion('monster',id))return true;
  if(!canEquipSeparate('monster'))return false;
  bloodSlots[bloodSlots.indexOf(null)]=id;updateBloodSlots();return finishMonsterReward(id);
}
function chooseFusion(choice){
 if(game.battlePhase!=='fusion'||!pendingFusion)return false;
 const pending=pendingFusion;let id;const stage=pending.source==='minor'||pending.source==='major'||pending.source==='victory';
 if(stage){
  if(choice!=='keep'){
   const shown=pending.options.find(o=>o.id===choice);if(!shown)return false;
   const option=equippedFusionOptions().find(o=>o.id===shown.id&&o.incoming===shown.incoming&&o.incomingSlot===shown.incomingSlot);if(!option)return false;
   const incomingSlot=option.incomingSlot;if(bloodSlots[incomingSlot]!==option.incoming)return false;
   if(option.requires){const baseSlot=bloodSlots.indexOf(option.requires);if(baseSlot<0||baseSlot===incomingSlot)return false;bloodSlots[baseSlot]=option.id;}
   else {const baseSlot=coreSlots.findIndex(value=>value===getFusionBaseId(option.base));if(baseSlot<0)return false;cleanupConsumedCore(baseSlot);coreSlots[baseSlot]=option.id;}
   bloodSlots[incomingSlot]=null;id=option.id;
  }else id='skip';
  pendingFusion=null;updateBloodSlots();updatePrimarySkillSlots();
  if(pending.source==='victory'){if(id!=='skip')$('resultText').textContent=`Diệp Tu đã dung hợp thành ${getLearnedSkill(id)?.name||id}.`;game.battlePhase='victory';setMenu('result');return true;}
  if(pending.source==='minor')return resumeAfterMonsterReward(id);
  beginKimDanEncounter();play();if(id!=='skip')actionAudio.progressCue('progress_reward');return true;
 }
 if(choice==='keep'){if(!canEquipSeparate(pending.source)){if(pending.source==='tang'){pendingFusion=null;return openTangReplace(pending.id);}return false;}id=pending.id;bloodSlots[bloodSlots.indexOf(null)]=id;}
 else {
  const option=availableFusionOptions(pending.id).find(o=>o.id===choice);if(!option)return false;id=option.id;
  if(option.requires){const slot=bloodSlots.indexOf(option.requires);if(slot<0)return false;bloodSlots[slot]=id;}
  else {const slot=coreSlots.findIndex(value=>value===getFusionBaseId(option.base));if(slot<0)return false;cleanupConsumedCore(slot);coreSlots[slot]=id;}
 }
 pendingFusion=null;updateBloodSlots();updatePrimarySkillSlots();
 if(pending.source==='monster')return finishMonsterReward(id);
 if(pending.source==='sword'){beginUMinhEncounter();play();actionAudio.progressCue('progress_reward');return true;}
 if(pending.source==='tang')return finishTangVictory(getLearnedSkill(id)?.name||id);
 beginTribulation();play();return true;
}

function backFusion(){
  if(game.battlePhase!=='fusion'||!pendingFusion)return false;const source=pendingFusion.source;if(source==='minor'||source==='major'||source==='victory')return chooseFusion('keep');pendingFusion=null;
  game.battlePhase=source==='monster'?'monster_reward':source==='sword'?'sword_reward':source==='tang'?'tang_reward':'loot';setMenu(game.battlePhase);return true;
}

function updateBloodSlots(){
  for(let i=0;i<bloodSlots.length;i++){
    const id=bloodSlots[i],spec=BLOOD_REWARDS[id]||getLearnedSkill(id),button=$(`lootSlot${i+6}`),title=$(`lootSlot${i+6}Title`),sub=$(`lootSlot${i+6}Sub`);
    if(!button)continue;button.disabled=!spec;button.classList.toggle('empty',!spec);
    if(title)title.textContent=spec?.name||'Ô TRỐNG';
    setSkillIcon(`lootSlot${i+6}Icon`,ACQUIRED_SKILL_ICONS[id]||'empty');
    let status=spec?.hint||'CHƯA CÓ';
    if(getLearnedSkill(id)&&getMonsterSkillCooldown(id)>0)status=`HỒI ${Math.ceil(getMonsterSkillCooldown(id))}S`;
    if(id==='hand'&&getHuyetThu().cooldown>0)status=`HỒI ${Math.ceil(getHuyetThu().cooldown)}S`;
    if(id==='thread'&&getHuyetKimTuyen().phase==='charge')status='THẢ ĐỂ PHÓNG';
    else if(id==='thread'&&getHuyetKimTuyen().cooldown>0)status=`HỒI ${Math.ceil(getHuyetKimTuyen().cooldown)}S`;
    if(id==='drain'&&getThonLinhHuyet().phase==='cooldown')status=`HỒI ${Math.ceil(getThonLinhHuyet().cd)}S`;
    if(id==='blast'&&getHuyetBao().usedOnce)status='ĐÃ DÙNG';
    if(sub)sub.textContent=status;button.setAttribute('aria-label',spec?`Kỹ năng ${i+6}: ${spec.name} · ${status}`:`Ô kỹ năng ${i+6} trống`);
  }
}
function useBloodSlot(index,pointerId){
  if(!game.running||!['fight','tribulation','waiting'].includes(game.battlePhase))return false;
  const id=bloodSlots[index];
  if(getLearnedSkill(id))return castMonsterSkill(id);
  if(id==='hand')return castHuyetThuSkill();
  if(id==='thread')return beginHuyetKimTuyenSkill(pointerId);
  if(id==='drain')return castThonLinhHuyetSkill();
  if(id==='blast')return castHuyetBaoSkill();
  return false;
}
function releaseBloodSlot(index,pointerId){if(bloodSlots[index]==='thread')return releaseHuyetKimTuyenSkill(pointerId);return false;}
function showBloodReward(){
  bossState.active=false;dummy.visible=false;game.battlePhase='loot';setMenu('loot');
}
function selectBloodReward(id){
  if(game.battlePhase!=='loot'||!BLOOD_REWARDS[id])return false;
  if(offerFusion('blood',id))return true;
  const free=bloodSlots.indexOf(null);if(free<0)return false;
  bloodSlots[free]=id;updateBloodSlots();beginTribulation();play();return true;
}
function showSwordReward(){
  bossState.active=false;dummy.visible=false;
  for(const key of Object.keys(SWORD_REWARDS)){
    const button=$('sword-'+key);
    if(button)button.disabled=bloodSlots.includes(key)||(!canEquipSeparate('sword')&&!availableFusionOptions(key).length);
  }
  game.battlePhase='sword_reward';setMenu('sword_reward');
}
function selectSwordReward(id){
  if(game.battlePhase!=='sword_reward')return false;
  if(id==='skip'){beginUMinhEncounter();play();return true;}
  if(!SWORD_REWARDS[id]||bloodSlots.includes(id))return false;
  if(offerFusion('sword',id))return true;
  if(!canEquipSeparate('sword'))return false;
  bloodSlots[bloodSlots.indexOf(null)]=id;updateBloodSlots();beginUMinhEncounter();play();actionAudio.progressCue('progress_reward');return true;
}
function showTangReward(){
 bossState.active=false;dummy.visible=false;pendingTangReward=null;
 $('tangRewardChoices').classList.remove('hidden');$('tangReplaceChoices').classList.add('hidden');
 game.battlePhase='tang_reward';setMenu('tang_reward');actionAudio.battleResult(true);
}
function finishTangReward(id,index){
 if(index<0||index>=bloodSlots.length||!TANG_MA_REWARDS[id])return false;
 bloodSlots[index]=id;pendingTangReward=null;updateBloodSlots();
 return finishTangVictory(TANG_MA_REWARDS[id].name);
}
function finishTangVictory(name){
 game.battlePhase='victory';$('resultTitle').textContent='CHIẾN THẮNG';
 $('resultText').textContent=`Diệp Tu đã đánh bại Táng Ma và nhận ${name}.`;
 $('resultContinue').classList.remove('hidden');$('resultFusion').classList.remove('hidden');setMenu('result');return true;
}
function selectTangReward(id){
 if(game.battlePhase!=='tang_reward'||!TANG_MA_REWARDS[id])return false;
 if(offerFusion('tang',id))return true;
 const free=bloodSlots.indexOf(null);if(free>=0)return finishTangReward(id,free);
 return openTangReplace(id);
}
function openTangReplace(id){
 pendingTangReward=id;
 for(let i=0;i<bloodSlots.length;i++)$('tangReplace'+i).textContent=`Ô ${i+6} · ${(BLOOD_REWARDS[bloodSlots[i]]||getLearnedSkill(bloodSlots[i]))?.name||'Ô TRỐNG'}`;
 $('tangRewardChoices').classList.add('hidden');$('tangReplaceChoices').classList.remove('hidden');
 game.battlePhase='tang_replace';setMenu('tang_replace');return true;
}
function chooseTangReplace(index){return game.battlePhase==='tang_replace'&&pendingTangReward?finishTangReward(pendingTangReward,index):false;}
function backTangReplace(){if(game.battlePhase!=='tang_replace')return false;showTangReward();return true;}
function beginTribulation(){
  actionAudio.stopAll();resetMotion();resetSkills();
  player.hp=player.maxHp;player.mana=player.maxMana;player.stun=0;player.flash=0;
  bossState.active=false;dummy.visible=false;settings.targetZoom=BASE_ZOOM;tribulation=createThienKiep();
  game.battlePhase='tribulation';$('battleIntro').classList.add('hidden');$('tribulationHud').textContent='LÔI KIẾP · 0 / 6 · KHÔNG THỂ NÉ';
  $('tribulationHud').classList.remove('hidden');updateVitals();actionAudio.progressCue('tribulation_start');showNotice(coreSlots[2]==='earth'?'LÔI KIẾP KHÓA MỤC TIÊU · DÙNG THỔ THUẪN ĐỂ ĐỠ':'LÔI KIẾP KHÓA MỤC TIÊU · THỔ THUẪN ĐÃ DUNG HỢP');
}
function advanceTribulation(dt){
  if(!tribulation||game.battlePhase!=='tribulation')return;
  if(tribulation.phase==='done'){
    if(!tribulation.breakthrough){
      tribulation.breakthrough=true;tribulation.successClock=0;cultivation.kimDan=true;
      applyRealmToEntity(player,'kim_dan',true);restoreCultivationStats(cultivation,player,true);
      updateVitals();updateCultivationUI();$('tribulationHud').textContent='ĐỘT PHÁ · KIM ĐAN CẢNH';actionAudio.progressCue('progress_breakthrough');showNotice('VƯỢT KIẾP THÀNH CÔNG · ĐỘT PHÁ KIM ĐAN CẢNH');
    }
    tribulation.successClock+=dt;
    if(tribulation.successClock>=2){$('tribulationHud').classList.add('hidden');tribulation=null;openBreakthroughFusion('major');}
    return;
  }
  stepThienKiep(tribulation,dt,()=>({x:player.x,groundY:player.y}),strike=>{
    $('tribulationHud').textContent=`LÔI KIẾP · ${strike.index} / 6 · KHÔNG THỂ NÉ`;
    fxEmit('thienKiepBolt',strike.x,strike.groundY,{index:strike.index},null,'front',{ox:96,oy:480,scale:2.35});
    fxEmit('groundBurst',strike.x,strike.groundY,{palette:['#17295e','#4852c0','#78beff','#e5faff','#ffffff'],count:20},null,'front',{scale:1.7});
    actionAudio.lightningThunder(strike.index);addCameraShake(7.5,0.28);
    const hit=receivePlayerDamage(strike.damage,{fromX:strike.x,notice:false});
    if(hit.hpLost>0&&player.hp>0){if(strike.index>=4)applyStrongPlayerHit({sourceX:strike.x,mode:'slam'});else applyUnblockedPlayerHit('hurt');}
    updateVitals();if(player.hp<=0){finishBattle(false);return false;}return true;
  },warning=>actionAudio.progressCue('tribulation_warning',warning.x));
}
function drawTribulationWarning(ctx){
  if(!tribulation||tribulation.phase!=='warning')return;
  const x=tribulation.targetX-camera.x+game.viewW/2,y=tribulation.groundY-camera.y+game.viewH/2;
  const pulse=1+tribulation.clock/THIEN_KIEP_SPEC.warning*.22;
  ctx.save();ctx.translate(x,y-3);ctx.strokeStyle='#ffdc74';ctx.fillStyle='rgba(255,185,65,.28)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,THIEN_KIEP_SPEC.hitRadius*pulse,16*pulse,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.setLineDash([8,7]);ctx.strokeStyle='rgba(193,229,255,.85)';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-620);ctx.stroke();ctx.restore();
}

function resolveBossSpawnX(heroX) {
  const rightCandidate = heroX + BOSS_SPAWN_DISTANCE;
  if (rightCandidate <= WORLD_W - 140) return rightCandidate;
  const leftCandidate = heroX - BOSS_SPAWN_DISTANCE;
  if (leftCandidate >= 140) return leftCandidate;
  return heroX < WORLD_W / 2 ? WORLD_W - 140 : 140;
}

function updateIntro(dt) {
  introClock += dt;
  if (game.battlePhase === 'waiting' && introClock >= BOSS_SPAWN_DELAY) {
    game.battlePhase = 'arrival';
    introClock = 0;
    actionAudio.roundArrival(player.x);
    setInput(false);
    player.vx = 0;
    dummy.x = resolveBossSpawnX(player.x);
    introGroundY = game.terrain.firstSolidY(dummy.x) - 0.5;
    // Nạp trước chunk mặt đất nơi Boss đáp xuống để tránh giật khung hình khi camera lia tới
    const bossChunkX = clamp(Math.floor(dummy.x / (CELL * 32)), 0, Math.ceil(WORLD_W / (CELL * 32)) - 1);
    const bossChunkY = clamp(Math.floor(introGroundY / (CELL * 32)), 0, Math.ceil(WORLD_H / (CELL * 32)) - 1);
    game.terrain.renderChunk(bossChunkX, bossChunkY);
    dummy.y = introGroundY - BOSS_SPAWN_HEIGHT;
    dummy.vy = 0;
    dummy.visible = true;
    dummy.facing = player.x < dummy.x ? -1 : 1;
    player.facing = dummy.x >= player.x ? 1 : -1;
    dummy.demoAction = 'fall';
    dummy.demoTimer = 20;
    dummy.demoElapsed = 0;
    bossState.active = true;
    updateBossUI(0);
    $('controls')?.classList.add('hidden');
    $('hint')?.classList.add('hidden');
    $('introRound').classList.add('hidden');
    $('introBoss').classList.add('hidden');
  }
  if (game.battlePhase === 'arrival') {
    const t = Math.min(1, introClock / 1.15);
    dummy.y = introGroundY - BOSS_SPAWN_HEIGHT * (1 - t) * (1 - t);
    dummy.demoElapsed += dt;
    // Bắt đầu lia camera từ trên cao và zoom dần lại gần Boss khi Boss giáng lâm
    const targetZ = BASE_ZOOM + (BOSS_CLOSEUP_ZOOM - BASE_ZOOM) * Math.min(1, t * 0.85);
    settings.zoom += (targetZ - settings.zoom) * (1 - Math.exp(-dt * 6.5));
    camera.x += (dummy.x - camera.x) * Math.min(1, dt * 6.5);
    camera.y += (dummy.y - 62 - camera.y) * Math.min(1, dt * 6.5);
    if (t >= 1) {
      dummy.y = introGroundY;
      dummy.demoAction = 'hand_seal';
      dummy.demoTimer = 0.78;
      dummy.demoElapsed = 0;
      fxDust('groundBurst', dummy.x, dummy.y, 1.45, 1);
      actionAudio.land(420, 1);
      actionAudio.bossDialogueOpen?.();
      game.battlePhase = 'focus';
      introClock = 0;
      lastIntroCharIndex = 0;
      const quoteEl = $('introBossQuote');
      if (quoteEl) quoteEl.textContent = '';
      $('introBoss').classList.remove('hidden');
    }
  } else if (game.battlePhase === 'focus') {
    // Cam giữ zoom sát vào Boss + hiển thị khung thoại chờ người chơi nhấn TIẾP TỤC
    settings.zoom += (BOSS_CLOSEUP_ZOOM - settings.zoom) * (1 - Math.exp(-dt * 9.5));
    camera.x += (dummy.x - camera.x) * Math.min(1, dt * 8.5);
    camera.y += (dummy.y - 52 - camera.y) * Math.min(1, dt * 8.5);
    const quoteEl = $('introBossQuote');
    if (quoteEl) {
      const chars = Math.min(getIntroQuote().length, Math.max(1, Math.floor(introClock * BOSS_TYPEWRITER_CPS)));
      if (chars > lastIntroCharIndex) {
        const ch = getIntroQuote()[chars - 1] || '';
        if (ch.trim() && !/[“”"',.?!;:·]/.test(ch)) {
          actionAudio.bossVoiceTick?.(ch.charCodeAt(0));
        }
        lastIntroCharIndex = chars;
      }
      quoteEl.textContent = getIntroQuote().slice(0, chars);
    }
    // Không tự động đóng thoại: chờ người chơi nhấn nút TIẾP TỤC / chạm hộp thoại / phím Space hoặc Enter
  } else if (game.battlePhase === 'recenter') {
    // Đưa camera và độ thu phóng (zoom) trở lại bình thường (BASE_ZOOM = 0.70) tại vị trí người chơi
    settings.targetZoom = BASE_ZOOM;
    settings.zoom += (BASE_ZOOM - settings.zoom) * (1 - Math.exp(-dt * 9.5));
    camera.x += (player.x - camera.x) * Math.min(1, dt * 7.5);
    camera.y += (player.y - 110 - camera.y) * Math.min(1, dt * 7.5);
    if (introClock >= 0.75) {
      settings.zoom = BASE_ZOOM;
      game.battlePhase = 'fight';
      introClock = 0;
      cueTime = 0.65;
      $('controls').classList.remove('hidden');
      $('hint').classList.remove('hidden');
      showNotice(`KHAI CHIẾN · DIỆP TU ĐỐI ĐẦU ${bossState.name}`);
    }
  }
}

function finishBattle(won) {
  if(won&&activeRound===1){showBloodReward();actionAudio.battleResult(true);return;}
  if(won&&activeRound===2){showSwordReward();actionAudio.battleResult(true);return;}
  if(won&&activeRound===4){showTangReward();return;}
  const defeatedByTribulation=game.battlePhase==='tribulation';
  game.battlePhase = won ? 'victory' : 'defeat';
  $('battleIntro').classList.add('hidden');
  $('resultTitle').textContent = won ? 'CHIẾN THẮNG' : 'BẠI TRẬN';
  $('resultText').textContent = won ? 'Diệp Tu đã đánh bại Táng Ma và vượt qua ba vòng chiến đấu.' : `Diệp Tu đã bại trận trước ${defeatedByTribulation?'Thiên Kiếp':isMonsterRound()?(dummy.skin==='u_minh_ma_buc'?'U Minh Ma Bức':dummy.skin==='hac_hoa_xa'?'Hắc Hỏa Xà':dummy.skin==='loi_ung'?'Lôi Ưng':'Phong Lang'):bossState.name}.`;
  $('resultContinue').classList.add('hidden');
  $('resultFusion').classList.add('hidden');
  setMenu('result');
  actionAudio.battleResult(won);
}

function rotated() {
  return $('game').classList.contains('rotate-cw')
    ? 1
    : $('game').classList.contains('rotate-ccw')
    ? -1
    : 0;
}

function pointerDelta(x, y, cx, cy) {
  const dx = x - cx;
  const dy = y - cy;
  const rot = rotated();
  return rot === 1 ? { x: dy, y: -dx } : rot === -1 ? { x: -dy, y: dx } : { x: dx, y: dy };
}

function setOrientation(mode, requestDevice = false) {
  settings.orientation = mode === 'portrait' ? 'portrait' : 'landscape';
  setInput(false);
  const gameEl = $('game');
  const overlayEl = $('overlay');
  const landscape = window.innerWidth >= window.innerHeight;
  const wantsLandscape = settings.orientation === 'landscape';
  const rotCw = !landscape && wantsLandscape;
  const rotCcw = landscape && !wantsLandscape;
  for (const el of [gameEl, overlayEl]) {
    if (!el) continue;
    el.classList.toggle('rotate-cw', rotCw);
    el.classList.toggle('rotate-ccw', rotCcw);
    el.classList.toggle('mode-landscape', wantsLandscape);
    el.classList.toggle('mode-portrait', !wantsLandscape);
  }
  document.body.classList.toggle('mode-landscape', wantsLandscape);
  document.body.classList.toggle('mode-portrait', !wantsLandscape);
  $('orientationMode').value = settings.orientation;
  $('orientationBtn').textContent = wantsLandscape ? 'NGANG' : 'DỌC';
  $('orientationBtn').setAttribute(
    'aria-label',
    `Đang ở chế độ ${wantsLandscape ? 'ngang' : 'dọc'}. Chạm để chuyển sang ${
      wantsLandscape ? 'dọc' : 'ngang'
    }`
  );
  if (requestDevice && screen.orientation && typeof screen.orientation.lock === 'function') {
    Promise.resolve()
      .then(() => screen.orientation.lock(wantsLandscape ? 'landscape' : 'portrait'))
      .catch(() => {});
  }
  resize();
  requestAnimationFrame(resize);
  if (requestDevice && game.running) {
    showNotice(
      wantsLandscape
        ? 'CHẾ ĐỘ MÀN HÌNH NGANG · ĐÃ ĐỒNG BỘ GIAO DIỆN & THÔNG BÁO'
        : 'CHẾ ĐỘ MÀN HÌNH DỌC · ĐÃ ĐỒNG BỘ GIAO DIỆN & THÔNG BÁO'
    );
  }
}

function resize() {
  const box = $('game');
  const overlayEl = $('overlay');
  const w = Math.max(1, box.clientWidth);
  const h = Math.max(1, box.clientHeight);
  const compactH = h <= 520;
  const compactW = w <= 680;
  for (const el of [box, overlayEl]) {
    if (!el) continue;
    el.classList.toggle('compact-h', compactH);
    el.classList.toggle('compact-w', compactW);
  }
  const dpr = Math.min(
    window.devicePixelRatio || 1,
    settings.quality === 'high' ? 2 : settings.quality === 'medium' ? 1.5 : 1
  );
  game.viewW = w;
  game.viewH = h;
  game.dpr = dpr;
  game.canvas.style.width = w + 'px';
  game.canvas.style.height = h + 'px';
  game.canvas.width = Math.round(w * dpr);
  game.canvas.height = Math.round(h * dpr);
  game.ctx.imageSmoothingEnabled = false;
}

function setInput(v) {
  abortCharge(true);
  motion.jumpBuffer = 0;
  for (const k of Object.keys(keys)) keys[k] = v;
  analog.moveX = analog.moveY = 0;
  document.querySelectorAll('[data-key]').forEach((x) => x.classList.remove('pressed'));
  for (const id of ['moveJoystick']) {
    const el = $(id);
    el.classList.remove('active');
    el._resetJoystick?.();
  }
}

function attachJoystick(id, axisX, axisY) {
  const el = $(id);
  const thumb = el.querySelector('.joy-thumb');
  let pointer = null;

  function updatePointer(e) {
    const r = el.getBoundingClientRect();
    const radius = el.offsetWidth * 0.33;
    const v = pointerDelta(e.clientX, e.clientY, r.left + r.width / 2, r.top + r.height / 2);
    const dx = v.x;
    const dy = v.y;
    const len = Math.hypot(dx, dy);
    const gain = Math.min(1, len / Math.max(radius, 1));
    const nx = (len > 0 ? dx / len : 0) * gain;
    const ny = (len > 0 ? dy / len : 0) * gain;
    const dead = 0.14;
    const remap = (val) =>
      Math.abs(val) <= dead ? 0 : Math.sign(val) * ((Math.abs(val) - dead) / (1 - dead));
    analog[axisX] = remap(nx);
    analog[axisY] = remap(ny);
    thumb.style.left = `calc(50% + ${nx * radius}px)`;
    thumb.style.top = `calc(50% + ${ny * radius}px)`;
  }

  const reset = () => {
    pointer = null;
    analog[axisX] = 0;
    analog[axisY] = 0;
    thumb.style.left = '50%';
    thumb.style.top = '50%';
    el.classList.remove('active');
  };
  el._resetJoystick = reset;

  el.addEventListener('pointerdown', (e) => {
    if (!game.running || pointer !== null) return;
    e.preventDefault();
    pointer = e.pointerId;
    el.setPointerCapture?.(pointer);
    el.classList.add('active');
    updatePointer(e);
  });
  el.addEventListener('pointermove', (e) => {
    if (e.pointerId === pointer) {
      e.preventDefault();
      updatePointer(e);
    }
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    el.addEventListener(name, (e) => {
      if (e.pointerId === pointer) {
        e.preventDefault();
        reset();
      }
    });
  }
}

function update(dt) {
  if (!game.running) return;
  game.elapsed += dt;
  if (['waiting', 'arrival', 'focus', 'recenter'].includes(game.battlePhase)) {
    updateIntro(dt);
    if (['arrival', 'focus', 'recenter'].includes(game.battlePhase)) {
      player.anim = player.flying ? 'hover' : 'idle';
      player.animTime += dt;
      updateDummy(dt);
      fxUpdate(dt);
      return;
    }
  }
  if (!['waiting', 'fight','tribulation'].includes(game.battlePhase)) return;
  if (cueTime > 0) {
    cueTime -= dt;
    if (cueTime <= 0) $('battleIntro').classList.add('hidden');
  }
  game.statsTimer += dt;
  player.flash = Math.max(0, (player.flash || 0) - dt);
  updateAfterimages(dt);

  if (camera.shakeTime > 0) {
    camera.shakeTime = Math.max(0, camera.shakeTime - dt);
    const strength = camera.shakeMag * (camera.shakeTime / 0.16);
    camera.shakeX = Math.sin(game.elapsed * 92) * strength;
    camera.shakeY = Math.cos(game.elapsed * 114) * strength * 0.82;
  } else {
    camera.shakeX = 0;
    camera.shakeY = 0;
    camera.shakeMag = 0;
  }

  if (game.hitStop > 0) {
    game.hitStop = Math.max(0, game.hitStop - dt);
    fxUpdate(dt);
    return;
  }

  updatePlayerStun(dt);
  motion.jumpBuffer = Math.max(0, motion.jumpBuffer - dt);
  motion.coyote = player.grounded ? 0.10 : Math.max(0, motion.coyote - dt);
  if (!player.grounded) motion.airTime += dt;

  const launchedBefore = player.jumpTime;
  updateAction(dt);
  tryBufferedJump();

  const keyboardAxis = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  const requestedAxis = keyboardAxis || analog.moveX;
  const axis = canMove() ? requestedAxis : 0;
  const isAnalog = !keyboardAxis && Math.abs(analog.moveX) > 0.02;
  const slow = keys.slow || (isAnalog && Math.abs(axis) < 0.67) || settings.speed < 75;
  const magnitude = Math.abs(axis);
  const moveFactor = isAnalog
    ? slow
      ? Math.min(1, magnitude / 0.67)
      : 0.75 + 0.25 * magnitude
    : magnitude;
  // Tăng tốc đi/chạy 20%; tốc độ bay giữ riêng để không làm đảo cảm giác bay.
  const speed = movementSpeed(slow, player.flying, settings.speed)*(player.temporarySpeedMultiplier||1);
  let targetV = Math.sign(axis) * moveFactor * speed;

  const reversing = axis && player.vx * axis < 0 && Math.abs(player.vx) > 30;
  if (reversing) targetV = 0;
  const a = motion.action;
  const isCastOrCharge =
    getCharge() ||
    reactionLocked() ||
    a?.name === 'hand_seal' ||
    getHuyetKimTuyen()?.phase === 'charge' ||
    getHuyetThu()?.phase === 'cast';
  if (axis && !reversing && !isCastOrCharge) {
    player.facing = axis > 0 ? 1 : -1;
  }

  let beastDash=getMonsterDash();
  if(beastDash&&(reactionLocked()||motion.strongImpact)){cancelMonsterDash();beastDash=null;}
  if(beastDash){player.vx=beastDash.dir*getLearnedSkill(beastDash.id).speed*Math.min(1,beastDash.remaining/Math.max(dt,1e-6));player.vy=0;player.facing=beastDash.dir;}
  else if(motion.strongImpact){
    advanceStrongImpulse(motion.strongImpact,player,dt,GRAVITY);
  }else{
    let stiffness = player.grounded ? 20 : player.flying ? 13 : 9.5;
    if (reversing || (!axis && player.grounded)) stiffness = 26;
    if (a && ['hurt', 'knockdown'].includes(a.name)) stiffness = player.grounded ? 9 : 2.6;
    if (
      (a && ['down_idle', 'getup', 'hand_seal', 'charge_recover'].includes(a.name)) ||
      getHuyetKimTuyen()?.phase === 'charge' ||
      getHuyetThu()?.phase === 'cast'
    ) {
      player.vx = 0;
    } else {
      player.vx += (targetV - player.vx) * (1 - Math.exp(-dt * stiffness));
    }
    if (Math.abs(player.vx) < 1 && !axis) player.vx = 0;

    if (player.flying) {
      const vertical = (keys.down ? 1 : 0) - (keys.up ? 1 : 0) || analog.moveY;
      const dir = isCastOrCharge ? 0 : vertical;
      const targetY = a?.name === 'takeoff' ? -310 : dir * 550 * (settings.speed / 100)*(player.temporarySpeedMultiplier||1);
      player.vy += (targetY - player.vy) * (1 - Math.exp(-dt * 10));
      if (Math.abs(dir) < 0.02 && a?.name !== 'takeoff') player.vy *= Math.exp(-4 * dt);
    } else {
      player.vy = Math.min(580, player.vy + GRAVITY * dt);
    }
  }

  if (!(launchedBefore > 0 && player.jumpTime === 0)) player.jumpTime += dt;
  if(player.hpRegen>0&&player.hp>0&&player.hp<player.maxHp)player.hp=Math.min(player.maxHp,player.hp+player.hpRegen*dt);
  const struggleResult = updateSkillStruggle(dt, player, dummy);
  if (struggleResult) {
    showNotice(struggleResult === 'player' ? 'CẠN LINH LỰC · KỸ NĂNG ĐỐI THỦ ÁP ĐẢO' : struggleResult === 'boss' ? 'ĐỐI THỦ BỎ CUỘC · KỸ NĂNG TIẾP TỤC' : 'HAI KỸ NĂNG CÙNG TAN');
    updateVitals();
  }
  const struggle = getSkillStruggle();
  const struggleHud = $('struggleHud');
  struggleHud?.classList.toggle('hidden', !struggle);
  if (struggle && struggleHud) {
    const manaLabel = `LINH LỰC ${Math.ceil(player.mana)} · ĐỊCH ${Math.ceil(dummy.mana)}`;
    if ($('struggleMana').textContent !== manaLabel) $('struggleMana').textContent = manaLabel;
    struggle.fxClock = (struggle.fxClock || 0) - dt;
    if (struggle.fxClock <= 0) { struggle.fxClock = .23; emitSkillClash(struggle.x, struggle.y, {playerKind: struggle.a.kind, bossKind: struggle.b.kind, playerPower: struggle.a.power, bossPower: struggle.b.power, outcome:'equal'}); }
  }
  if (!struggle && !isThoThuanActive() && !isNguHanhSustaining() && player.mana < player.maxMana) {
    player.mana = Math.min(player.maxMana, player.mana + player.manaRegen * dt);
  }

  const previousX = player.x, previousY = player.y;
  const wasMoving = ['walk', 'run'].includes(player.anim);
  moveBody(player.vx * dt, player.vy * dt, {ignoreNpc:!!beastDash});
  if(beastDash)updateMonsterDash(dt,previousX,previousY);

  if (
    !motion.action &&
    !getCharge() &&
    player.grounded &&
    !axis &&
    wasMoving &&
    Math.abs(player.vx) < 22
  ) {
    startAction('brake');
  }

  updateCharge(dt);
  selectPlayerAnimation(dt, player.x - previousX, axis, slow);
  updateGiantVisual(diepTuGiantVisual,dt);
  beginSkillCollisionFrame((x, y, collision) => { actionAudio.collision(x); emitSkillClash(x, y, collision); }, {player, boss: dummy, onStart: () => { actionAudio.collision(player.x); showNotice('GIẰNG CO LINH LỰC · HỦY PHÉP ĐỂ RÚT LUI'); }});
  if(isMonsterRound())selectNearestMonster();
  updateFireballs(dt);
  updateMonsterSkills(dt);
  updatePrimarySkillSlots();
  if(game.battlePhase==='fight'&&player.hp>0){
    if(isMonsterRound())updateMonsterWave(dt);
    else if(activeRound===4){updateDummy(dt);if(!dummy.broken)updateTangMaBoss(dt);else tangMaDeathTime+=dt;}
    else if(activeRound===2&&dummy.broken){updateDummy(dt);}
    else if(!dummy.broken&&dummy.hp>0){updateDummy(dt);if(activeRound===2)updateLangTieuAI(dt);else updateBossAI(dt);}
  }
  endSkillCollisionFrame();
  if(game.battlePhase==='fight') { updateSnakePoison(dt); const p=getSnakePoison(); $('poisonStatus')?.classList.toggle('hidden',p.remaining<=0); if(p.remaining>0&&$('poisonStatus')) $('poisonStatus').textContent=`☠ NHIỄM ĐỘC ${Math.ceil(p.remaining)}S`; }
  if(game.battlePhase==='tribulation'){advanceTribulation(dt);if(!game.running)return;}
  if(game.battlePhase==='fight'){
    if(player.hp<=0){finishBattle(false);return;}
    if(isMonsterRound()){if(processDefeatedMonsters()){fxUpdate(dt);return;}}
    else if(dummy.broken||dummy.hp<=0){if((activeRound!==4&&activeRound!==2)||(activeRound===2&&(dummy.deathTime||0)>=.85)||(activeRound===4&&tangMaDeathTime>=2.6)){finishBattle(true);return;}}
  }
  fxUpdate(dt);

  // Nội suy mượt góc nhìn camera giữa Bình thường (0.70) và Thần Thức 4x (0.175)
  const targetZ = settings.targetZoom ?? BASE_ZOOM;
  if (Math.abs(settings.zoom - targetZ) > 0.0005) {
    settings.zoom += (targetZ - settings.zoom) * (1 - Math.exp(-dt * 10.5));
    if (Math.abs(settings.zoom - targetZ) <= 0.0005) {
      settings.zoom = targetZ;
    }
  }
  if (settings.thanThucPulse > 0) {
    settings.thanThucPulse = Math.max(0, settings.thanThucPulse - dt * 1.6);
  }

  const cx = player.x + player.vx * 0.24;
  const surfaceY = surfaceAt(player.x);
  const depthBelowSurface = player.y - surfaceY;
  const verticalLift = player.flying ? 90 : depthBelowSurface < 120 ? 128 : 92;
  let baseCy = player.y - verticalLift;
  if (depthBelowSurface < 140) baseCy = Math.min(baseCy, surfaceY + 54);

  // Khi bật Thần Thức 4x: nâng góc nhìn camera lên cao để mặt đất nằm ở ~1/4 dưới màn hình
  // (~76% màn hình là bầu trời, mặt đất và không gian chiến đấu phía trên; chỉ hạ xuống khi nhân vật xuống hang sâu)
  const halfWorldH = game.viewH / (2 * settings.zoom);
  const surfaceOverviewCy = Math.min(
    surfaceY - halfWorldH * 0.52,
    player.y - halfWorldH * 0.18
  );
  const undergroundBlend = clamp((depthBelowSurface - 140) / 320, 0, 1);
  const thanThucCy =
    surfaceOverviewCy + (player.y - 80 - surfaceOverviewCy) * undergroundBlend;
  const zoomBlend = clamp(
    (BASE_ZOOM - settings.zoom) / (BASE_ZOOM - THAN_THUC_ZOOM),
    0,
    1
  );
  const cy = baseCy + (thanThucCy - baseCy) * zoomBlend;

  camera.x += (cx - camera.x) * Math.min(1, dt * 5.2);
  camera.y += (cy - camera.y) * Math.min(1, dt * 7.2);
  const max = game.viewW / (2 * settings.zoom);
  camera.x = clamp(camera.x, Math.min(max, WORLD_W / 2), Math.max(max, WORLD_W / 2));
  camera.y = Math.round(clamp(camera.y, -2600, WORLD_H - 160));
  camera.x = Math.round(camera.x * 10) / 10;

  if (game.noticeTimer > 0) {
    game.noticeTimer -= dt;
    if (game.noticeTimer <= 0) $('notice').classList.add('hidden');
  }

  if (game.statsTimer >= 0.14) {
    game.statsTimer = 0;
    const posEl = $('pos');
    const zoneEl = $('zone');
    const fpsEl = $('fps');
    if (posEl) {
      posEl.textContent = `X ${Math.round(player.x)} · ${
        depthBelowSurface <= 0 ? 'Cao' : 'Sâu'
      } ${Math.round(Math.abs(depthBelowSurface))}`;
      posEl.style.display = settings.stats ? '' : 'none';
    }
    if (zoneEl) {
      zoneEl.textContent =
        depthBelowSurface < -180
          ? 'Không trung'
          : depthBelowSurface < 60
          ? 'Mặt đất'
          : depthBelowSurface < 200
          ? 'Địa tầng đất sét'
          : depthBelowSurface < 720
          ? 'Tầng đá'
          : 'Lòng đất sâu';
      zoneEl.style.display = settings.stats ? '' : 'none';
    }
    if (fpsEl) {
      fpsEl.textContent = Math.round(game.fps) + ' FPS';
      fpsEl.style.display = settings.stats ? '' : 'none';
    }
    updateVitals();
    updateBloodSlots();
    updateBossUI(dt);
  }
}

function draw() {
  const ctx = game.ctx;
  const w = game.viewW;
  const h = game.viewH;
  if (!ctx || !w || !h) return;

  ctx.setTransform(game.dpr, 0, 0, game.dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  drawEnvironment();
  if(game.battlePhase==='tribulation'&&tribulation){ctx.save();ctx.fillStyle='rgba(6,9,32,.67)';ctx.fillRect(0,0,w,h);if(tribulation.flash>0){ctx.fillStyle=`rgba(190,215,255,${tribulation.flash*.36})`;ctx.fillRect(0,0,w,h);}ctx.restore();}

  ctx.save();
  const z = settings.zoom;
  ctx.translate(w / 2 + (camera.shakeX || 0), h / 2 + (camera.shakeY || 0));
  ctx.scale(z, z);
  ctx.translate(-w / 2, -h / 2);

  if (game.terrain) drawTerrain();
  drawTribulationWarning(ctx);
  fxDraw('back');
  if(isMonsterRound()){for(const m of monsters){useMonster(m);if(dummy.skin==='u_minh_ma_buc')drawUMinh();else if(dummy.skin==='hac_hoa_xa')drawHacHoaXa();else if(dummy.skin==='loi_ung')drawLoiUng();else drawPhongLang();drawBeastProjectileCores(m.ai.shots,dummy.skin==='u_minh_ma_buc'?'shadow':dummy.skin==='hac_hoa_xa'?'venom':dummy.skin==='loi_ung'?'lightning':'wind');}selectNearestMonster();}else if(activeRound===4)drawTangMa();else drawDummy();
  if (game.images.idle) {
    drawAfterimages();
    drawPlayer();
  }
  drawMonsterSkillProjectiles();
  fxDraw('front');
  if (activeRound === 2) drawLangTieuEffects(); else if(activeRound === 1&&game.battlePhase!=='tribulation') drawBossEffects();
  drawTargetLock();
  ctx.restore();

  if (game.running && settings.geology && game.terrain) {
    ctx.save();
    ctx.fillStyle = '#f9e6ba';
    ctx.font = '11px monospace';
    ctx.fillText(`Ô đất đã khoét: ${game.terrain.broken} · ${CELL}px/ô`, 13, h - 120);
    ctx.restore();
  }
}

function loop(now) {
  if (!game.last) game.last = now;
  const elapsed = clamp((now - game.last) / 1000, 0, 0.05);
  game.last = now;
  game.frames++;
  game.fpsAcc += elapsed;
  if (game.fpsAcc > 0.55) {
    game.fps = game.frames / game.fpsAcc;
    game.fpsAcc = 0;
    game.frames = 0;
  }
  if (game.running) {
    game.acc += elapsed;
    let count = 0;
    while (game.acc >= 1 / 60 && count < 4) {
      update(1 / 60);
      game.acc -= 1 / 60;
      count++;
    }
  }
  draw();
  requestAnimationFrame(loop);
}

function bindInput() {
  window.addEventListener(
    'pointerdown',
    () => {
      if (game.running) actionAudio.unlock();
    },
    { passive: true }
  );
  window.addEventListener('keydown', () => {
    if (game.running) actionAudio.unlock();
  });

  attachJoystick('moveJoystick', 'moveX', 'moveY');

  document.querySelectorAll('[data-key]').forEach((button) => {
    const key = button.dataset.key;
    const press = (e) => {
      e.preventDefault();
      if (!game.running) return;
      button.setPointerCapture?.(e.pointerId);
      button.classList.add('pressed');
      if (key === 'jump') jump();
      else keys[key] = true;
    };
    const release = (e) => {
      e.preventDefault();
      button.classList.remove('pressed');
      if (key !== 'jump') keys[key] = false;
    };
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
  });

  const flightButton = $('flightBtn');
  flightButton.addEventListener('pointerdown', (e) => {
    if (!game.running || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    flightButton.classList.add('pressed');
    toggleFlight();
  });
  const releaseFlight = () => flightButton.classList.remove('pressed');
  for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    flightButton.addEventListener(eventName, releaseFlight);
  }
  flightButton.addEventListener('click', (e) => {
    if (e.detail === 0 && !e.pointerType) toggleFlight();
  });

  ['thanThucBtn', 'hudThanThucBtn'].forEach((id) => {
    const btn = $(id);
    if (!btn) return;
    btn.addEventListener('pointerdown', (e) => {
      if (!game.running || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault();
      btn.classList.add('pressed');
      toggleThanThuc();
    });
    const releaseBtn = () => btn.classList.remove('pressed');
    for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      btn.addEventListener(eventName, releaseBtn);
    }
    btn.addEventListener('click', (e) => {
      if (e.detail === 0 && !e.pointerType) toggleThanThuc();
    });
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  ['charBtn', 'hudCharBtn'].forEach((id) => {
    const btn = $(id);
    if (!btn) return;
    btn.addEventListener('pointerdown', (e) => {
      if (!game.running || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault();
      btn.classList.add('pressed');
      toggleCharacter();
    });
    const releaseBtn = () => btn.classList.remove('pressed');
    for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      btn.addEventListener(eventName, releaseBtn);
    }
    btn.addEventListener('click', (e) => {
      if (e.detail === 0 && !e.pointerType) toggleCharacter();
    });
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  document.querySelectorAll('[data-charge]').forEach((button) => {
    button.addEventListener('pointerdown', (e) => {
      if (!game.running || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault();
      const primaryIndex=button.dataset.charge==='fire'?0:1;
      if(settings.character==='diep_tu'&&coreSlots[primaryIndex]!==CORE_SKILL_IDS[primaryIndex]){usePrimaryFusion(primaryIndex);return;}
      if (settings.character === 'huyet_du') {
        if (button.dataset.charge === 'fire') {
          castHuyetThuSkill();
        } else if (button.dataset.charge === 'lightning') {
          if (beginHuyetKimTuyenSkill(e.pointerId)) {
            button.setPointerCapture?.(e.pointerId);
          }
        }
        return;
      }
      if (beginCharge(button.dataset.charge, e.pointerId)) {
        button.setPointerCapture?.(e.pointerId);
      }
    });
    button.addEventListener('pointerup', (e) => {
      e.preventDefault();
      if (settings.character === 'huyet_du') {
        if (button.dataset.charge === 'lightning') {
          releaseHuyetKimTuyenSkill(e.pointerId);
        }
        return;
      }
      if (getCharge()?.pointerId === e.pointerId) endCharge(false);
    });
    button.addEventListener('pointercancel', (e) => {
      if (settings.character === 'huyet_du') {
        if (button.dataset.charge === 'lightning') {
          releaseHuyetKimTuyenSkill(e.pointerId);
        }
        return;
      }
      if (getCharge()?.pointerId === e.pointerId) endCharge(true);
    });
    button.addEventListener('lostpointercapture', (e) => {
      if (settings.character === 'huyet_du') {
        if (button.dataset.charge === 'lightning') {
          releaseHuyetKimTuyenSkill(e.pointerId);
        }
        return;
      }
      if (getCharge()?.pointerId === e.pointerId) endCharge(true);
    });
    button.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  document.querySelectorAll('[data-skill-toggle]').forEach((button) => {
    button.addEventListener('pointerdown', (e) => {
      if (!game.running || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault();
      const primaryIndex=button.dataset.skillToggle==='earth'?2:4;
      if(settings.character==='diep_tu'&&coreSlots[primaryIndex]!==CORE_SKILL_IDS[primaryIndex]){usePrimaryFusion(primaryIndex);return;}
      if (button.dataset.skillToggle === 'earth') {
        if (settings.character === 'huyet_du') {
          castThonLinhHuyetSkill();
        } else {
          toggleThoThuan();
        }
      } else if (button.dataset.skillToggle === 'five_elements') {
        if (settings.character === 'huyet_du') {
          toggleThoThuan(); // Huyết Thuẫn hộ thể ma đạo
          return;
        }
        toggleNguHanh();
      }
    });
    button.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  document.querySelectorAll('[data-skill-cast]').forEach((button) => {
    button.addEventListener('pointerdown', (e) => {
      if (!game.running || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault();
      if(settings.character==='diep_tu'&&coreSlots[3]!==CORE_SKILL_IDS[3]){usePrimaryFusion(3);return;}
      if (button.dataset.skillCast === 'water') {
        if (settings.character === 'huyet_du') {
          castHuyetBaoSkill();
          return;
        }
        castThuyKiem();
      }
    });
    button.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  document.querySelectorAll('[data-skill-locked]').forEach((button) => {
    button.addEventListener('pointerdown', (e) => {
      if (!game.running || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault();
      triggerLockedSkillSlot(Number(button.dataset.skillLocked));
    });
    button.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  document.querySelectorAll('[data-loot-slot]').forEach(button=>{
    const index=Number(button.dataset.lootSlot);
    button.addEventListener('pointerdown',e=>{
      if(!game.running||(e.pointerType==='mouse'&&e.button!==0))return;
      e.preventDefault();if(useBloodSlot(index,e.pointerId))button.setPointerCapture?.(e.pointerId);
    });
    const release=e=>{e.preventDefault();releaseBloodSlot(index,e.pointerId);};
    button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
    button.addEventListener('contextmenu',e=>e.preventDefault());
  });

  $('fxTestToggle')?.addEventListener('click', () => {
    $('fxDemo')?.classList.toggle('hidden');
  });
  $('hudBossBtn')?.addEventListener('click', () => {
    triggerRoundNotice(bossState.round, bossState.name, bossState.realm);
  });
  $('closeRoundNoticeBtn')?.addEventListener('click', () => {
    $('roundNotice')?.classList.add('hidden');
  });
  $('introContinueBtn')?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    advanceBossIntroDialogue();
  });
  $('introBoss')?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    advanceBossIntroDialogue();
  });
  document.querySelectorAll('[data-demo]').forEach((b) =>
    b.addEventListener('click', () =>
      b.dataset.demo === 'dummy'
        ? hitDummy(100)
        : b.dataset.demo === 'npc'
        ? cycleCodeNpc()
        : b.dataset.demo === 'patrol'
        ? toggleNpcPatrol()
        : b.dataset.demo === 'round1'
        ? triggerRoundNotice(bossState.round, bossState.name, bossState.realm)
        : b.dataset.demo === 'huyet_thu'
        ? castHuyetThuSkill()
        : b.dataset.demo === 'huyet_kim_tuyen'
        ? (() => {
            beginHuyetKimTuyenSkill('demo');
            setTimeout(() => releaseHuyetKimTuyenSkill('demo'), 1200);
          })()
        : b.dataset.demo === 'thon_linh'
        ? castThonLinhHuyetSkill()
        : b.dataset.demo === 'huyet_bao'
        ? castHuyetBaoSkill()
        : b.dataset.demo === 'wound_10'
        ? (() => {
            player.hp = Math.round(player.maxHp * 0.10);
            updateVitals();
            showNotice('Thương thế chí mạng: HP còn 10% — Huyết Bạo đã mở khóa!');
          })()
        : testAction(b.dataset.demo)
    )
  );

  game.canvas.addEventListener('pointerdown', (e) => {
    if (!game.running) return;
    if (game.battlePhase === 'focus') {
      advanceBossIntroDialogue();
      return;
    }
    const rect = game.canvas.getBoundingClientRect();
    const p = pointerDelta(
      e.clientX,
      e.clientY,
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );
    const wx = camera.x + p.x / settings.zoom;
    const wy = camera.y + p.y / settings.zoom;
    if (dummyHitTest(wx, wy)) {
      hitDummy(100);
    }
  });

  const keymap = {
    ArrowLeft: 'left',
    KeyA: 'left',
    ArrowRight: 'right',
    KeyD: 'right',
    ArrowUp: 'up',
    KeyW: 'up',
    ArrowDown: 'down',
    KeyS: 'down',
    ShiftLeft: 'slow',
    ShiftRight: 'slow',
  };

  window.addEventListener('keydown', (e) => {
    if (game.running && !['waiting', 'fight','tribulation'].includes(game.battlePhase)) {
      if (e.code === 'Escape') setMenu('menu');
      else if (['Space', 'Enter'].includes(e.code) && game.battlePhase === 'focus') {
        e.preventDefault();
        advanceBossIntroDialogue();
      }
      return;
    }
    if (e.code === 'KeyC' && getSkillStruggle()) { e.preventDefault(); if (!e.repeat) { cancelSkillStruggle('player'); $('struggleHud')?.classList.add('hidden'); showNotice('ĐÃ HỦY PHÉP · CẨN THẬN ĐÒN ĐỐI THỦ'); } return; }
    const name = keymap[e.code];
    if (name) {
      if (game.running) {
        keys[name] = true;
        e.preventDefault();
      }
      return;
    }
    if (getSkillStruggle() && /^Digit[0-9]$/.test(e.code)) { e.preventDefault(); if (!e.repeat) showNotice('ĐANG GIẰNG CO · HỦY PHÉP ĐỂ DÙNG CHIÊU KHÁC'); return; }
    if(['Digit6','Digit7','Digit8','Digit9','Digit0'].includes(e.code)){
      e.preventDefault();if(!e.repeat)useBloodSlot((e.code==='Digit0'?4:Number(e.code.slice(-1))-6),e.code);return;
    }
    if(settings.character==='diep_tu'&&/^Digit[1-5]$/.test(e.code)){const i=Number(e.code.slice(-1))-1;if(coreSlots[i]!==CORE_SKILL_IDS[i]){e.preventDefault();if(!e.repeat)usePrimaryFusion(i);return;}}
    if (e.code === 'Digit1') {
      e.preventDefault();
      if (!e.repeat) {
        if (settings.character === 'huyet_du') {
          castHuyetThuSkill();
        } else {
          beginCharge('fire', e.code);
        }
      }
      return;
    }
    if (e.code === 'Digit2') {
      e.preventDefault();
      if (!e.repeat) {
        if (settings.character === 'huyet_du') {
          beginHuyetKimTuyenSkill(e.code);
        } else {
          beginCharge('lightning', e.code);
        }
      }
      return;
    }
    if (e.code === 'Digit3') {
      e.preventDefault();
      if (!e.repeat) {
        if (settings.character === 'huyet_du') {
          castThonLinhHuyetSkill();
        } else {
          toggleThoThuan();
        }
      }
      return;
    }
    if (e.code === 'Digit4') {
      e.preventDefault();
      if (!e.repeat) {
        if (settings.character === 'huyet_du') {
          castHuyetBaoSkill();
        } else {
          castThuyKiem();
        }
      }
      return;
    }
    if (e.code === 'Digit5') {
      e.preventDefault();
      if (!e.repeat) {
        if (settings.character === 'huyet_du') {
          toggleThoThuan(); // Huyết Thuẫn hộ thể ma đạo
        } else {
          toggleNguHanh();
        }
      }
      return;
    }
    if (e.repeat) return;
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        jump();
        break;
      case 'KeyF':
        toggleFlight();
        break;
      case 'KeyP':
        // Vòng 1 chỉ có Diệp Tu là nhân vật được chọn.
        break;
      case 'KeyV':
      case 'Tab':
        e.preventDefault();
        toggleThanThuc();
        break;
      case 'Escape':
        if (game.running) setMenu('menu');
        else if (game.started) play();
        break;
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'KeyC' && getSkillStruggle()) { e.preventDefault(); if (!e.repeat) { cancelSkillStruggle('player'); $('struggleHud')?.classList.add('hidden'); showNotice('ĐÃ HỦY PHÉP · CẨN THẬN ĐÒN ĐỐI THỦ'); } return; }
    const name = keymap[e.code];
    if (name) keys[name] = false;
    if (getCharge()?.pointerId === e.code) endCharge(false);
    if(['Digit6','Digit7','Digit8','Digit9','Digit0'].includes(e.code))releaseBloodSlot((e.code==='Digit0'?4:Number(e.code.slice(-1))-6),e.code);
    if (e.code === 'Digit2' && settings.character === 'huyet_du') {
      releaseHuyetKimTuyenSkill(e.code);
    }
  });

  document
    .querySelectorAll('.joystick')
    .forEach((el) => el.addEventListener('contextmenu', (e) => e.preventDefault()));

  window.addEventListener('blur', () => {
    setInput(false);
    if (game.running) setMenu('menu');
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      actionAudio.stopMusic();
      setInput(false);
      if (game.running) setMenu('menu');
    } else if (!['locked', 'unavailable'].includes(actionAudio.status().state)) {
      actionAudio.unlock();
    }
  });
}

function bindUI() {
  actionAudio.restore();
  $('soundEnabled').checked = settings.soundEnabled;
  $('soundVolume').value = settings.soundVolume;
  $('soundVolumeOut').textContent = settings.soundVolume + '%';
  $('musicEnabled').checked = settings.musicEnabled;
  $('musicVolume').value = settings.musicVolume;
  $('musicVolumeOut').textContent = settings.musicVolume + '%';
  $('musicEnabled').onchange = (e) => actionAudio.changeMusic(e.target.checked, settings.musicVolume);
  $('musicVolume').oninput = (e) => {
    actionAudio.changeMusic(settings.musicEnabled, e.target.value);
    $('musicVolumeOut').textContent = settings.musicVolume + '%';
  };
  $('overlay')?.addEventListener('click', e => {
    if (e.target instanceof Element && e.target.closest('button')) actionAudio.uiSelect();
  });
  $('soundEnabled').onchange = (e) => actionAudio.change(e.target.checked, settings.soundVolume);
  $('soundVolume').oninput = (e) => {
    actionAudio.change(settings.soundEnabled, e.target.value);
    $('soundVolumeOut').textContent = settings.soundVolume + '%';
  };
  $('startBtn').disabled = true;
  $('startBtn').onclick = play;
  $('restartBtn').onclick = () => setMenu('select');
  $('selectDiepTu').onclick = () => {
    settings.character = 'diep_tu';
    $('selectDiepTu').setAttribute('aria-pressed', 'true');
  };
  $('confirmCharacter').onclick = startBattle;
  $('controls').addEventListener('pointerdown', e => { if (getSkillStruggle() && e.target instanceof Element && e.target.closest('.skill-deck')) { e.preventDefault(); e.stopPropagation(); showNotice('ĐANG GIẰNG CO · HỦY PHÉP ĐỂ DÙNG CHIÊU KHÁC'); } }, true);
  $('cancelStruggle').onclick = () => { if (cancelSkillStruggle('player')) { $('struggleHud').classList.add('hidden'); showNotice('ĐÃ HỦY PHÉP · CẨN THẬN ĐÒN ĐỐI THỦ'); } };
  for(const id of Object.keys(BLOOD_REWARDS)) $('reward-'+id).onclick=()=>selectBloodReward(id);
  for(const id of Object.keys(SWORD_REWARDS)){const btn=$('sword-'+id);if(btn)btn.onclick=()=>selectSwordReward(id);}
  if($('sword-skip'))$('sword-skip').onclick=()=>selectSwordReward('skip');
  for(const id of Object.keys(TANG_MA_REWARDS))$('tang-'+id).onclick=()=>selectTangReward(id);
  for(let i=0;i<5;i++)$('tangReplace'+i).onclick=()=>chooseTangReplace(i);
  $('tangReplaceBack').onclick=backTangReplace;
  for(const id of Object.keys(BUFFS)) $('buff-'+id).onclick=()=>selectBreakthroughBuff(id);
  for(const id of Object.keys(MONSTER_SKILLS)) $('monster-'+id).onclick=()=>selectMonsterReward(id);
  $('monster-skip').onclick=()=>selectMonsterReward('skip');
  $('fusionKeep').onclick=()=>chooseFusion('keep');$('fusionBack').onclick=backFusion;
  $('fusionPrev').onclick=()=>{if(pendingFusion){pendingFusion.page--;renderFusionPage();}};$('fusionNext').onclick=()=>{if(pendingFusion){pendingFusion.page++;renderFusionPage();}};
  for(let i=0;i<12;i++){const button=$(`fusionChoice${i}`);if(button)button.onclick=()=>{const option=pendingFusion?.options[(pendingFusion.page||0)*FUSION_PAGE_SIZE+i];if(option)chooseFusion(option.id);};}
  $('backCharacterSelect').onclick = () => setMenu(['victory', 'defeat'].includes(game.battlePhase) ? 'result' : 'menu');
  $('resultRetry').onclick = () => setMenu('select');
  $('resultContinue').onclick = () => {if(game.battlePhase==='victory'){beginUMinhEncounter(true);play();}};
  $('resultFusion').onclick = () => {if(game.battlePhase==='victory')openBreakthroughFusion('victory');};
  $('resultMenu').onclick = () => {
    game.started = false; game.battlePhase = 'menu'; player.hp = player.maxHp;
    bossState.active = false; dummy.visible = false;
    setMenu('menu');
  };
  $('pauseBtn').onclick = () => setMenu('menu');
  $('swordPreviewBtn').onclick = () => setMenu('swordPreview');
  $('tangMaPreviewBtn').onclick = () => setMenu('tangMaPreview');
  $('tangMaBattleBtn').onclick = startTangMaTest;
  for(let i=0;i<4;i++)$('tangMaCast'+i).onclick=()=>forceTangMa(i);
  $('backTangMaPreview').onclick = () => setMenu('menu');
  $('backSwordPreview').onclick = () => setMenu('menu');
  $('settingsBtn').onclick = () => setMenu('settings');
  $('aboutBtn').onclick = () => setMenu('about');
  $('backSettings').onclick = () => setMenu('menu');
  $('closeSettingsTop').onclick = () => setMenu('menu');
  $('backAbout').onclick = () => setMenu('menu');
  $('speedRange').oninput = (e) => {
    settings.speed = Number(e.target.value);
    $('speedOut').textContent = settings.speed + '%';
  };
  $('orientationBtn').onclick = () =>
    setOrientation(settings.orientation === 'landscape' ? 'portrait' : 'landscape', true);
  $('orientationMode').onchange = (e) => setOrientation(e.target.value, true);
  $('quality').onchange = (e) => {
    settings.quality = e.target.value;
    resize();
  };
  $('statsToggle').onchange = (e) => (settings.stats = e.target.checked);
  $('geoToggle').onchange = (e) => (settings.geology = e.target.checked);
  $('fxQuality').onchange = (e) => {
    const old = settings.fxQuality;
    settings.fxQuality = e.target.value;
    if (settings.fxQuality === 'off') fxClear();
    else if (old === 'off' && player.flying) fxTakeoff();
  };
  $('joystickSize').onchange = (e) => {
    $('game').classList.toggle('joy-small', e.target.value === 'small');
    $('game').classList.toggle('joy-large', e.target.value === 'large');
  };
  window.addEventListener('resize', () => setOrientation(settings.orientation));
  window.addEventListener('orientationchange', () =>
    setTimeout(() => setOrientation(settings.orientation), 250)
  );
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => setOrientation(settings.orientation));
  }
}

window.PK_QA = {
  spriteInfo: () => ({
    size: SPRITE_TEXTURE_SIZE,
    clips: CLIPS.length,
    frames: CLIPS.reduce((a, b) => a + b[1], 0),
    ready: game.ready,
    zoom: settings.zoom,
  }),
  hitDummy: () => hitDummy(100),
  snapshot: () => {
    const charge = getCharge();
    const fireballs = getFireballs();
    const fxInstances = getFxInstances();
    const loiBao = getLoiBaoBlast();
    return {
      dummyHp: dummy.hp,
      dummyX: dummy.x,
      dummyY: dummy.y,
      dummyStun: dummy.stun,
      npcHeight: npcShape().height,
      npcHalfWidth: npcShape().half,
      npcBodyOverlap: npcBodyOverlap(player.x, player.y),
      npcSupport: npcFeetSupport(player.x, player.y),
      dummyBroken: dummy.broken,
      dummyCodeAction: codeNpcPose().name,
      npcAtlasReady:
        !!game.images.idle && game.images.idle.complete && game.images.idle.naturalWidth > 0,
      x: player.x,
      y: player.y,
      vx: player.vx,
      vy: player.vy,
      facing: player.facing,
      running: game.running,
      audio: actionAudio.status(),
      action: motion.action ? { name: motion.action.name, time: motion.action.time } : null,
      motion: motion.mode,
      pose: playerPose(),
      jumpBuffer: motion.jumpBuffer,
      gait: motion.gait,
      visualScale: player.visualScale,
      cameraX: camera.x,
      cameraY: camera.y,
      flying: player.flying,
      grounded: player.grounded,
      anim: player.anim,
      fallFrame: player.anim === 'fall' ? Math.floor(player.animTime * 20) % 8 : null,
      skillSlots: SKILL_SLOTS,
      charge: charge
        ? {
            kind: charge.kind,
            time: charge.time,
            chargedSeconds: charge.chargedSeconds || 0,
            phase: charge.phase,
            power: charge.power,
            aimPitch: charge.aimPitch,
            targetArmDeg: charge.targetArmDeg,
            aimFrame: charge.aimFrame,
            orb: fireOrbPoint(charge),
            castFrame: charge.phase === 'cast' ? Math.floor(charge.castTime * 20) : null,
            fired: charge.fired,
          }
        : null,
      loiBao: loiBao
        ? {
            phase: loiBao.phase,
            chargedSeconds: loiBao.chargedSeconds,
            blastAge: loiBao.blastAge,
            targetId: loiBao.targetId,
          }
        : null,
      thoThuan: {
        active: getThoThuan().active,
        blockedDamage: getThoThuan().blockedDamage,
        blockedHits: getThoThuan().blockedHits,
        absorbedMana: getThoThuan().absorbedMana,
        shots: getThoThuan().shots.length,
      },
      thuyKiem: {
        phase: getThuyKiem().phase,
        cd: getThuyKiem().cd,
        cast: getThuyKiem().cast,
        swords: getThuyKiem().swords.length,
      },
      nguHanh: {
        phase: getNguHanh().phase,
        lockSec: getNguHanh().lockSec,
        pulses: getNguHanh().pulses,
      },
      huyetThu: {
        phase: getHuyetThu().phase,
        cd: getHuyetThu().cooldown,
      },
      huyetKimTuyen: {
        phase: getHuyetKimTuyen().phase,
        cd: getHuyetKimTuyen().cooldown,
      },
      thonLinhHuyet: {
        phase: getThonLinhHuyet().phase,
        cd: getThonLinhHuyet().cd,
        drainHp: getThonLinhHuyet().totalDrainHp,
      },
      huyetBao: {
        phase: getHuyetBao().phase,
        usedOnce: getHuyetBao().usedOnce,
        radius: getHuyetBao().radius,
      },
      hp: player.hp,
      mana: player.mana,
      fxCount: fxInstances.length,
      fxKinds: fxInstances.map((e) => e.fx.meta.name || 'custom'),
      hoaCauExplosions: getHoaCauExplosions().length,
      targetLock: {
        range: getAutoTargetRange(),
        baseRange: AUTO_TARGET_RANGE,
        turnRateDeg: 70,
        id: lockedTargetForUI(),
        chargeTarget: charge?.targetId || null,
      },
      thanThuc: settings.thanThuc,
      targetZoom: settings.targetZoom,
      patrol: dummy.patrol,
      fireballs: fireballs.map((f) => ({
        x: f.x,
        y: f.y,
        vx: f.vx,
        vy: f.vy,
        angle: Math.atan2(f.vy, f.vx),
        speed: f.speed,
        targetId: f.targetId,
        chargeTime: f.chargeTime,
        power: f.power,
      })),
      dummyBurn: dummy.burn,
      dummySlow: dummy.slow,
      dummyTrapped: dummy.trapped,
      broken: game.terrain?.broken,
      ready: game.ready,
      quality: settings.fxQuality,
      zoom: settings.zoom,
      orientation: settings.orientation,
      rotated: rotated(),
      viewW: game.viewW,
      viewH: game.viewH,
    };
  },
  testAction,
  beginCharge,
  endCharge,
  abortCharge,
  toggleThoThuan,
  castThuyKiem,
  toggleNguHanh,
  castHuyetThuSkill,
  beginHuyetKimTuyenSkill,
  releaseHuyetKimTuyenSkill,
  castThonLinhHuyetSkill,
  castHuyetBaoSkill,
  toggleThanThuc,
  toggleCharacter,
  toggleNpcPatrol,
  triggerRoundNotice,
  bossState,
  setNpcTestPosition: (x, y) => {
    dummy.patrol = false;
    dummy.x = Math.max(70, Math.min(WORLD_W - 70, Number(x)));
    dummy.y = Number.isFinite(y) ? Number(y) : game.terrain.firstSolidY(dummy.x) - 0.5;
    dummy.vy = 0;
    return { x: dummy.x, y: dummy.y };
  },
  setNpcTestBroken: (v) => {
    dummy.broken = !!v;
    if (!v) {
      dummy.hp = dummy.maxHp;
      dummy.respawn = 0;
    }
    return dummy.broken;
  },
};

function init() {
  bindUI();
  bindInput();
  setOrientation(settings.orientation);
  resize();
  resetWorld();
  updateVitals();
  requestAnimationFrame(loop);
  preload();
}

init();

// Các điểm kiểm thử vòng đấu, không thay đổi điều khiển người chơi.
export { beginRound, beginPhongLangEncounter, beginKimDanEncounter, beginUMinhEncounter, updateIntro, advanceBossIntroDialogue, finishBattle, spawnMonsterWave, updateMonsterWave, processDefeatedMonsters, selectBreakthroughBuff, openMonsterReward, selectMonsterReward, selectBloodReward, selectSwordReward, selectTangReward, chooseTangReplace, backTangReplace, chooseFusion, backFusion, openBreakthroughFusion, usePrimaryFusion, advanceTribulation, useBloodSlot, releaseBloodSlot };
