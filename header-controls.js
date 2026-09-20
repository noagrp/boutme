const h=document.documentElement;
const clock=document.getElementById('publicClockBtn');
const pop=document.getElementById('publicClockPop');
const back=document.getElementById('backToDashBtn');
const header=document.querySelector('#publicProfileView>div:first-child');
const identity=document.querySelector('.public-identity');

if(header&&clock){
 const legacyActions=back?.parentElement&&back.parentElement!==header?back.parentElement:null;
 let controls=header.querySelector('.public-round-controls');
 if(!controls){
  controls=legacyActions||document.createElement('div');
  controls.className='public-round-controls';
  controls.removeAttribute('style');
  if(!controls.parentElement)header.appendChild(controls);
 }

 controls.appendChild(clock);

 const oldTheme=[...controls.querySelectorAll('button'),...header.querySelectorAll('button')].find(b=>b!==clock&&b!==back&&/theme/i.test(b.textContent||''));
 if(oldTheme){
  oldTheme.textContent='';
  oldTheme.className='round-control theme-orb';
  oldTheme.id='publicThemeBtn';
  oldTheme.setAttribute('aria-label','Switch theme');
  oldTheme.removeAttribute('style');
  controls.appendChild(oldTheme);
 }
 if(back){
  back.innerHTML='<svg class="switch-view-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 7.1A6.6 6.6 0 0 1 18 9.2"/><path d="M17.9 5.8v3.7h-3.7"/><path d="M16.5 16.9A6.6 6.6 0 0 1 6 14.8"/><path d="M6.1 18.2v-3.7h3.7"/></svg>';
  back.className='round-control back-orb';
  back.removeAttribute('style');
  back.setAttribute('aria-label','Dashboard');
  back.title='Dashboard';
  controls.appendChild(back);
 }
 clock.classList.add('round-control','clock-orb');
 if(pop&&identity)identity.appendChild(pop);

 [...header.children].forEach(child=>{
  if(child!==identity&&child!==controls&&!child.children.length&&!child.textContent.trim())child.remove();
 });
}

function nextTheme(){
 const current=h.getAttribute('data-theme')||'very-black';
 return current==='very-black'?'white':current==='white'?'chameleon':'very-black';
}
function paintThemeOrb(){
 const b=document.getElementById('publicThemeBtn');if(!b)return;
 const n=nextTheme();
 b.dataset.nextTheme=n;
 b.title=`Switch to ${n==='very-black'?'black':n} theme`;
 b.setAttribute('aria-label',b.title);
}
function applyTheme(next){
 h.setAttribute('data-theme',next);localStorage.setItem('hub_theme',next);paintThemeOrb();
}
window.toggleTheme=()=>applyTheme(nextTheme());
paintThemeOrb();

const style=document.createElement('style');
style.textContent=`
#publicProfileView>div:first-child{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;gap:10px!important;grid-auto-flow:column!important}
.public-identity{min-width:0!important;display:flex!important;align-items:center!important;gap:9px!important;overflow:visible!important}
.public-view-label{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
.public-round-controls{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:7px!important;flex:0 0 auto!important;white-space:nowrap!important}
.public-round-controls .round-control{position:relative;display:grid;place-items:center;width:40px!important;height:40px!important;min-width:40px!important;padding:0!important;margin:0!important;border-radius:50%!important;border:1px solid var(--border-color)!important;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease!important}
.public-round-controls .round-control:hover{transform:translateY(-1px) scale(1.04);box-shadow:0 6px 16px #0004}
.public-round-controls .round-control:active{transform:scale(.95)}
.public-round-controls .clock-orb{background:var(--card-bg)!important;color:var(--text-color)!important}
.public-round-controls .theme-orb{overflow:hidden;border:2px solid var(--border-color)!important}
.public-round-controls .theme-orb:after{content:'';position:absolute;inset:5px;border-radius:50%;box-shadow:inset 0 0 0 1px #fff5}
.public-round-controls .theme-orb[data-next-theme="very-black"]{background:#050505!important;border-color:#444!important}
.public-round-controls .theme-orb[data-next-theme="white"]{background:#fff!important;border-color:#bbb!important}
.public-round-controls .theme-orb[data-next-theme="chameleon"]{background:conic-gradient(from 30deg,#00e5ff,#34ff8b,#f6ff3b,#ff9a19,#ff3d91,#8b42ff,#00e5ff)!important;border-color:#fff8!important}
.public-round-controls .back-orb{background:var(--card-bg)!important;color:var(--text-color)!important}
.switch-view-icon{width:20px;height:20px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.clock-pop{left:auto!important;right:94px!important;top:50px!important}
@media(max-width:600px){#publicProfileView>div:first-child{gap:7px!important;padding-left:10px!important;padding-right:10px!important}.public-round-controls{gap:5px!important}.public-round-controls .round-control{width:36px!important;height:36px!important;min-width:36px!important}.switch-view-icon{width:18px;height:18px}.clock-pop{right:80px!important;top:46px!important}}
`;
document.head.appendChild(style);
