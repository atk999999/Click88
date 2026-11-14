// One run of Trúc Cơ: EXP, breakthrough rewards and persistent bonuses.
export const CULTIVATION_STAGES = ['TRÚC CƠ · SƠ KỲ', 'TRÚC CƠ · TRUNG KỲ', 'TRÚC CƠ · HẬU KỲ'];
export const KIM_DAN_STAGES = ['KIM ĐAN · SƠ KỲ', 'KIM ĐAN · TRUNG KỲ', 'KIM ĐAN · HẬU KỲ'];
export const EXP_PER_STAGE = 100;
export const WOLF_EXP = 10;
export const BUFFS = Object.freeze({
  vitality: { name:'Sinh mệnh', description:'+250 máu tối đa và hồi 250 máu' },
  spirit: { name:'Linh lực', description:'+60 linh lực tối đa và hồi 60 linh lực' },
  recovery: { name:'Hồi phục', description:'Hồi 35% máu, linh lực và tăng hồi phục mỗi giây' },
  drain: { name:'Hút sinh lực', description:'Kỹ năng hút 6% máu và 2% linh lực theo sát thương thực tế' },
});
export function createCultivation() { return {stage:0,kimDan:false,kimDanStage:0,xp:0,pending:false,vitality:0,spirit:0,recovery:0,drain:0}; }
export function addCultivationExp(c, amount) {
  const key=c.kimDan?'kimDanStage':'stage';
  if(c.pending || c[key]>=2 || !Number.isFinite(amount) || amount<=0)return false;
  c.xp+=amount;
  if(c.xp<EXP_PER_STAGE)return false;
  c.xp-=EXP_PER_STAGE;c[key]++;c.pending=true;return true;
}
export function restoreCultivationStats(c,p,refill=false) {
  p.realm=c.kimDan?KIM_DAN_STAGES[c.kimDanStage||0]:CULTIVATION_STAGES[c.stage];p.maxHp+=c.vitality*250;p.maxMana+=c.spirit*60;
  p.lifeSteal=c.drain*.06;p.manaSteal=c.drain*.02;
  p.hpRegen=c.recovery*2;p.manaRegen+=c.recovery*2;
  if(refill){p.hp=p.maxHp;p.mana=p.maxMana;}
}
export function chooseCultivationBuff(c,p,id) {
  if(!c.pending || !BUFFS[id])return false;
  c.pending=false;
  if(id==='vitality'){c.vitality++;p.maxHp+=250;p.hp=Math.min(p.maxHp,p.hp+250);}
  if(id==='spirit'){c.spirit++;p.maxMana+=60;p.mana=Math.min(p.maxMana,p.mana+60);}
  if(id==='recovery'){c.recovery++;p.hpRegen=c.recovery*2;p.manaRegen=(p.manaRegen||0)+2;p.hp=Math.min(p.maxHp,p.hp+p.maxHp*.35);p.mana=Math.min(p.maxMana,p.mana+p.maxMana*.35);}
  if(id==='drain'){c.drain++;p.lifeSteal=c.drain*.06;p.manaSteal=c.drain*.02;}
  return true;
}
export function applySkillDrain(p, actualDamage) {
  if(actualDamage<=0)return;
  p.hp=Math.min(p.maxHp,p.hp+actualDamage*((p.lifeSteal||0)+(p.temporaryLifeSteal||0)));
  p.mana=Math.min(p.maxMana,p.mana+actualDamage*((p.manaSteal||0)+(p.temporaryManaSteal||0)));
}
