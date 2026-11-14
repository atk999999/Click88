import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ACQUIRED_SKILL_ICONS,CHARACTER_SKILL_ICONS,noticeSkillIcon,setSkillIcon} from '../src/game/skill-icons.js';
const source=fs.readFileSync('src/SkillIcons.tsx','utf8');const symbols=new Set([...source.matchAll(/id="sk-([a-z]+)"/g)].map(m=>m[1]));
const fusionKeys=Object.values(ACQUIRED_SKILL_ICONS);
assert.equal(new Set(fusionKeys).size,fusionKeys.length,'every acquired/fusion skill has its own unique icon');
for(const key of [...fusionKeys,...Object.values(CHARACTER_SKILL_ICONS).flat(),'eye','empty','heart','mana','recovery'])assert.ok(symbols.has(key),`missing sprite ${key}`);
for(const [name,key] of [['KIẾM TÂM','swordheart'],['THẬP LA TRẢM THIÊN','swordbeam'],['VẠN KIẾM QUY TÔNG','swordarray'],['KIẾM KHÍ HỘ THỂ','swordguard'],['NHÂN KIẾM HỢP NHẤT','swordunion'],['HUYẾT THỦ','hand'],['HUYẾT KIM TUYẾN','thread'],['THÔN LINH HUYẾT','drain'],['HUYẾT BẠO','blast'],['HUYẾT THUẪN','bloodshield'],['NGŨ HÀNH KIẾM ĐẾ QUYẾT','fusionswordunionfive']]){assert.ok(symbols.has(key));assert.equal(noticeSkillIcon('LĂNG TIÊU · '+name),key);}
assert.equal(noticeSkillIcon('VÒNG 1'),null);
const elements=new Map();globalThis.document={getElementById(id){if(!elements.has(id))elements.set(id,{value:null,writes:0,getAttribute(){return this.value},setAttribute(k,v){assert.equal(k,'href');this.value=v;this.writes++;}});return elements.get(id);}};
setSkillIcon('slot','wolfwind');setSkillIcon('slot','wolfwind');assert.equal(elements.get('slot').value,'#sk-wolfwind');assert.equal(elements.get('slot').writes,1,'same image is not rewritten every frame');setSkillIcon('slot',null);assert.equal(elements.get('slot').value,'#sk-empty');
const app=fs.readFileSync('src/App.tsx','utf8');for(let i=1;i<=5;i++)assert.ok(app.includes(`id="skill${i}Icon"`));for(let i=6;i<=10;i++)assert.ok(app.includes(`id="lootSlot${i}Icon"`));assert.ok(app.includes('id="fusionKeepIcon"'));assert.ok(app.includes('fusionChoice${i}Icon'));
console.log(`PASS ${symbols.size} shared vector icons (${fusionKeys.length} unique skill icons), skill mappings, notices and empty slots`);
