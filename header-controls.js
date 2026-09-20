const h=document.documentElement;
const clock=document.getElementById('publicClockBtn');
const pop=document.getElementById('publicClockPop');
const back=document.getElementById('backToDashBtn');
const header=document.querySelector('#publicProfileView>div:first-child');
const identity=document.querySelector('.public-identity');

if(header&&clock){
 let controls=header.querySelector('.public-round-controls');
 if(!controls){
  controls=document.createElement('div');
  controls.className='public-round-controls';
  header.appendChild(controls);
 }
 controls.appendChild(clock);

 const oldTheme=[...header.querySelectorAll('button')].find(b=>b!==clock&&b!==back&&/theme/i.test(b.textContent||''));
 if(oldTheme){
  oldTheme.textContent='';
  oldTheme.className='round-control theme-orb';
  oldTheme.id='publicThemeBtn';
  oldTheme.setAttribute('aria-label','Switch theme');
  oldTheme.removeAttribute('style');
  controls.appendChild(oldTheme);
 }
 if(back){
  back.textContent='‹';
  back.className='round-control back-orb';
  back.removeAttribute('style');
  back.setAttribute('aria-label','Back to dashboard');
  controls.appendChild(back);
 }
 clock.classList.add('round-control','clock-orb');
 if(pop&&identity)identity.appendChild(pop);
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
#publicProfileView>div:first-child{display:grid!important;grid-template-columns:minmax(0,1fr) auto;align-items:center!important;gap:10px!important}
.public-identity{min-width:0!important}
.public-round-controls{display:flex;align-items:center;gap:7px;flex:0 0 auto}
.public-round-controls .round-control{position:relative;display:grid;place-items:center;width:40px!important;height:40px!important;min-width:40px!important;padding:0!important;margin:0!important;border-radius:50%!important;border:1px solid var(--border-color)!important;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease!important}
.public-round-controls .round-control:hover{transform:translateY(-1px) scale(1.04);box-shadow:0 6px 16px #0004}
.public-round-controls .round-control:active{transform:scale(.95)}
.public-round-controls .clock-orb{background:var(--card-bg)!important;color:var(--text-color)!important}
.public-round-controls .theme-orb{overflow:hidden;border:2px solid var(--border-color)!important}
.public-round-controls .theme-orb:after{content:'';position:absolute;inset:5px;border-radius:50%;box-shadow:inset 0 0 0 1px #fff5}
.public-round-controls .theme-orb[data-next-theme="very-black"]{background:#050505!important;border-color:#444!important}
.public-round-controls .theme-orb[data-next-theme="white"]{background:#fff!important;border-color:#bbb!important}
.public-round-controls .theme-orb[data-next-theme="chameleon"]{background:conic-gradient(from 30deg,#00e5ff,#34ff8b,#f6ff3b,#ff9a19,#ff3d91,#8b42ff,#00e5ff)!important;border-color:#fff8!important}
.public-round-controls .back-orb{background:var(--card-bg)!important;color:var(--text-color)!important;font-size:28px!important;font-weight:300!important;line-height:1!important}
.clock-pop{left:auto!important;right:94px!important;top:50px!important}
@media(max-width:600px){.public-round-controls{gap:5px}.public-round-controls .round-control{width:38px!important;height:38px!important;min-width:38px!important}.clock-pop{right:86px!important;top:48px!important}}
`;
document.head.appendChild(style);
