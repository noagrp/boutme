const h=document.documentElement;
const clock=document.getElementById('publicClockBtn');
const pop=document.getElementById('publicClockPop');
const back=document.getElementById('backToDashBtn');
const header=document.querySelector('#publicProfileView>div:first-child');
const identity=document.querySelector('.public-identity');
let contactOpen=false,contactHub=null;

const svg={
 contact:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M6.8 18.2c.7-3 2.5-4.6 5.2-4.6s4.5 1.6 5.2 4.6"/><rect x="3.5" y="3.5" width="17" height="17" rx="4"/></svg>',
 email:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m5 7 7 5.3L19 7"/></svg>',
 phone:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.1 3.8 10 7.6 8.2 9.4c1.4 2.8 3.6 5 6.4 6.4l1.8-1.8 3.8 2.9-.9 2.5c-.3.8-1.1 1.3-2 1.2C9.8 19.7 4.3 14.2 3.4 6.7c-.1-.9.4-1.7 1.2-2z"/></svg>',
 web:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.8 12h16.4M12 3.5c2.2 2.4 3.3 5.2 3.3 8.5S14.2 18.1 12 20.5M12 3.5C9.8 5.9 8.7 8.7 8.7 12s1.1 6.1 3.3 8.5"/></svg>',
 address:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.5 6-11a6 6 0 1 0-12 0c0 5.5 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></svg>',
 switch:'<svg class="switch-view-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 7.1A6.6 6.6 0 0 1 18 9.2"/><path d="M17.9 5.8v3.7h-3.7"/><path d="M16.5 16.9A6.6 6.6 0 0 1 6 14.8"/><path d="M6.1 18.2v-3.7h3.7"/></svg>'
};

function makeContactHub(){
 if(!identity||contactHub)return;
 const oldName=document.getElementById('publicNameHeader');
 if(oldName)oldName.setAttribute('aria-hidden','true');
 const hub=document.createElement('div');
 hub.className='contact-hub';
 hub.innerHTML=`<button class="contact-main" type="button" aria-label="Contact" title="Contact">${svg.contact}</button><div class="contact-actions"><button type="button" data-contact="email" aria-label="Email" title="Email">${svg.email}</button><button type="button" data-contact="phone" aria-label="Phone" title="Phone">${svg.phone}</button><button type="button" data-contact="web" aria-label="Website" title="Website">${svg.web}</button><button type="button" data-contact="address" aria-label="Address" title="Address">${svg.address}</button></div>`;
 identity.insertBefore(hub,identity.firstChild);
 contactHub=hub;
 hub.querySelector('.contact-main').onclick=()=>{
  if(!syncContactActions())return;
  contactOpen=!contactOpen;
  hub.classList.toggle('open',contactOpen);
  hub.querySelector('.contact-main').setAttribute('aria-expanded',String(contactOpen));
 };
 hub.querySelectorAll('[data-contact]').forEach(b=>b.onclick=e=>{e.stopPropagation();contactAction(b.dataset.contact)});
 syncContactActions();
}

function contactData(){
 const d=window.appData||{};
 return {email:(d.email||'').trim(),phone:(d.telephone||'').trim(),web:(d.website||'').trim(),address:(d.address||'').trim()};
}
function syncContactActions(){
 if(!contactHub)return false;
 const d=contactData(),points=[[65,12],[51,43],[23,63],[-10,66]],visible=[];
 contactHub.querySelectorAll('[data-contact]').forEach(b=>{
  const key=b.dataset.contact,ok=!!d[key];
  b.hidden=!ok;
  if(ok)visible.push(b);
 });
 visible.forEach((b,i)=>{const p=points[Math.min(i,points.length-1)];b.style.setProperty('--cx',p[0]+'px');b.style.setProperty('--cy',p[1]+'px')});
 contactHub.classList.toggle('empty',visible.length===0);
 if(!visible.length&&contactOpen){contactOpen=false;contactHub.classList.remove('open')}
 return visible.length>0;
}
function contactAction(type){
 const d=contactData();
 if(type==='email'&&d.email)location.href='mailto:'+d.email;
 else if(type==='phone'&&d.phone)location.href='tel:'+d.phone;
 else if(type==='web'&&d.web){let u=d.web;if(!/^https?:\/\//i.test(u))u='https://'+u;window.open(u,'_blank','noopener')}
 else if(type==='address'&&d.address)window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(d.address),'_blank','noopener');
}

if(header&&clock){
 const legacyActions=back?.parentElement&&back.parentElement!==header?back.parentElement:null;
 let controls=header.querySelector('.public-round-controls');
 if(!controls){
  controls=legacyActions||document.createElement('div');
  controls.className='public-round-controls';
  controls.removeAttribute('style');
  if(!controls.parentElement)header.appendChild(controls);
 }
 let clockWrap=controls.querySelector('.clock-control-wrap');
 if(!clockWrap){clockWrap=document.createElement('div');clockWrap.className='clock-control-wrap';controls.appendChild(clockWrap)}
 clockWrap.appendChild(clock);if(pop)clockWrap.appendChild(pop);
 const oldTheme=[...controls.querySelectorAll('button'),...header.querySelectorAll('button')].find(b=>b!==clock&&b!==back&&/theme/i.test(b.textContent||''));
 if(oldTheme){oldTheme.textContent='';oldTheme.className='round-control theme-orb';oldTheme.id='publicThemeBtn';oldTheme.setAttribute('aria-label','Switch theme');oldTheme.removeAttribute('style');controls.appendChild(oldTheme)}
 if(back){back.innerHTML=svg.switch;back.className='round-control back-orb';back.removeAttribute('style');back.setAttribute('aria-label','Dashboard');back.title='Dashboard';controls.appendChild(back)}
 clock.classList.add('round-control','clock-orb');
 makeContactHub();
 [...header.children].forEach(child=>{if(child!==identity&&child!==controls&&!child.children.length&&!child.textContent.trim())child.remove()});
}

function nextTheme(){const current=h.getAttribute('data-theme')||'very-black';return current==='very-black'?'white':current==='white'?'chameleon':'very-black'}
function paintThemeOrb(){const b=document.getElementById('publicThemeBtn');if(!b)return;const n=nextTheme();b.dataset.nextTheme=n;b.title=`Switch to ${n==='very-black'?'black':n} theme`;b.setAttribute('aria-label',b.title)}
function applyTheme(next){h.setAttribute('data-theme',next);localStorage.setItem('hub_theme',next);paintThemeOrb()}
window.toggleTheme=()=>applyTheme(nextTheme());paintThemeOrb();

const style=document.createElement('style');
style.textContent=`
#publicProfileView>div:first-child{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;gap:10px!important;grid-auto-flow:column!important;overflow:visible!important}
.public-identity{min-width:0!important;display:flex!important;align-items:center!important;gap:9px!important;overflow:visible!important;position:relative!important}
.public-view-label{display:none!important}
.public-round-controls{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:7px!important;flex:0 0 auto!important;white-space:nowrap!important;overflow:visible!important}
.clock-control-wrap{position:relative!important;display:grid!important;place-items:center!important;flex:0 0 auto!important;overflow:visible!important}
.public-round-controls .round-control{position:relative;display:grid;place-items:center;width:40px!important;height:40px!important;min-width:40px!important;padding:0!important;margin:0!important;border-radius:50%!important;border:1px solid var(--border-color)!important;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease!important}
.public-round-controls .round-control:hover{transform:translateY(-1px) scale(1.04);box-shadow:0 6px 16px #0004}.public-round-controls .round-control:active{transform:scale(.95)}
.public-round-controls .clock-orb{background:var(--card-bg)!important;color:var(--text-color)!important}
.public-round-controls .theme-orb{overflow:hidden;border:2px solid var(--border-color)!important}.public-round-controls .theme-orb:after{content:'';position:absolute;inset:5px;border-radius:50%;box-shadow:inset 0 0 0 1px #fff5}
.public-round-controls .theme-orb[data-next-theme="very-black"]{background:#050505!important;border-color:#444!important}.public-round-controls .theme-orb[data-next-theme="white"]{background:#fff!important;border-color:#bbb!important}.public-round-controls .theme-orb[data-next-theme="chameleon"]{background:conic-gradient(from 30deg,#00e5ff,#34ff8b,#f6ff3b,#ff9a19,#ff3d91,#8b42ff,#00e5ff)!important;border-color:#fff8!important}
.public-round-controls .back-orb{background:var(--card-bg)!important;color:var(--text-color)!important}.switch-view-icon{width:20px;height:20px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.clock-control-wrap .clock-pop{left:50%!important;right:auto!important;top:50px!important;transform:translateX(-50%)!important}.clock-control-wrap .clock-pop:before{left:50%!important;transform:translateX(-50%) rotate(45deg)!important}
.contact-hub{position:relative;width:40px;height:40px;flex:0 0 40px;z-index:60;overflow:visible}.contact-main,.contact-actions button{position:absolute;inset:0;width:40px;height:40px;padding:0;border-radius:50%;border:1px solid var(--border-color);display:grid;place-items:center;background:var(--card-bg);color:var(--text-color);cursor:pointer;box-shadow:0 4px 12px #0003}.contact-main{z-index:3;transition:transform .18s ease,box-shadow .18s ease}.contact-main:hover{transform:scale(1.05);box-shadow:0 7px 18px #0004}.contact-main:active{transform:scale(.95)}.contact-hub.empty .contact-main{opacity:.45;cursor:default}.contact-hub svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}.contact-actions{position:absolute;inset:0;pointer-events:none}.contact-actions button{z-index:2;opacity:0;transform:translate(0,0) scale(.35);pointer-events:none;transition:transform .24s cubic-bezier(.2,.8,.2,1),opacity .16s ease,box-shadow .18s ease;background:color-mix(in srgb,var(--card-bg) 92%,var(--text-color) 8%)}.contact-hub.open .contact-actions button:not([hidden]){opacity:1;transform:translate(var(--cx),var(--cy)) scale(1);pointer-events:auto}.contact-actions button:hover{box-shadow:0 0 0 4px color-mix(in srgb,var(--text-color) 10%,transparent),0 8px 20px #0004;transform:translate(var(--cx),calc(var(--cy) - 2px)) scale(1.07)!important}.contact-actions button:active{transform:translate(var(--cx),var(--cy)) scale(.94)!important}.contact-actions button[hidden]{display:none!important}
@media(max-width:600px){#publicProfileView>div:first-child{gap:7px!important;padding-left:10px!important;padding-right:10px!important}.public-round-controls{gap:5px!important}.public-round-controls .round-control{width:36px!important;height:36px!important;min-width:36px!important}.switch-view-icon{width:18px;height:18px}.clock-control-wrap .clock-pop{top:46px!important}.contact-hub{width:36px;height:36px;flex-basis:36px}.contact-main,.contact-actions button{width:36px;height:36px}.contact-hub svg{width:18px;height:18px}}
`;
document.head.appendChild(style);

const refreshContacts=new MutationObserver(()=>syncContactActions());
if(document.getElementById('publicProfileView'))refreshContacts.observe(document.getElementById('publicProfileView'),{attributes:true,attributeFilter:['style']});
