import assert from 'node:assert/strict';
const all=new Map(),noop=()=>{};const cls={add:noop,remove:noop,toggle:noop};
function element(id){if(!all.has(id))all.set(id,{id,classList:cls,style:{},textContent:'',parentElement:{classList:cls},attributes:{},getAttribute(k){return this.attributes[k]},setAttribute(k,v){this.attributes[k]=v}});return all.get(id)}
globalThis.window=globalThis;window.localStorage={getItem:()=>null,setItem:noop};globalThis.document={hidden:false,getElementById:element,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({width:128,height:128,getContext:()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})})})};
await import('../src/game/pixelfx.js');const {settings,showNotice}=await import('../src/game/state.js');const {updateHuyetDuBtnUI}=await import('../src/game/skills.js');
for(const [character,icons] of [['diep_tu',['fire','lightning','earth','water','five']],['huyet_du',['hand','thread','drain','blast','bloodshield']],['diep_tu',['fire','lightning','earth','water','five']]]){settings.character=character;updateHuyetDuBtnUI();icons.forEach((icon,i)=>assert.equal(element(`skill${i+1}Icon`).getAttribute('href'),`#sk-${icon}`));}
showNotice('LĂNG TIÊU · VẠN KIẾM QUY TÔNG');assert.equal(element('noticeSkillIcon').getAttribute('href'),'#sk-swordarray');assert.equal(element('noticeText').textContent,'LĂNG TIÊU · VẠN KIẾM QUY TÔNG');
console.log('PASS icons change with the active character and boss announcement');
