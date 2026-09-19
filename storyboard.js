import{getApps,getApp}from"https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import{getFirestore,collection,addDoc,deleteDoc,doc,getDocs,limit,orderBy,query,updateDoc,where}from"https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const app=getApps().length?getApp():null;
if(!app)throw new Error('Firebase app unavailable');
const auth=getAuth(app),db=getFirestore(app);
let stories=[],editingId=null,publicStoryOwner=null;

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate=v=>{if(!v)return'';const d=new Date(v);return Number.isNaN(d.getTime())?v:d.toLocaleString([],{year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})};

function injectStyles(){
 const s=document.createElement('style');
 s.textContent=`
 .tabs-shell{display:grid;grid-template-columns:34px minmax(0,1fr) 34px;gap:6px;align-items:stretch;width:100%}
 .tabs-shell>.tabs-nav{display:flex!important;grid-template-columns:none!important;overflow-x:auto;overflow-y:hidden;white-space:nowrap;scroll-behavior:smooth;scrollbar-width:none;-ms-overflow-style:none;width:100%;min-width:0}
 .tabs-shell>.tabs-nav::-webkit-scrollbar{display:none}
 .tabs-shell>.tabs-nav .tab-btn{flex:1 0 auto;min-width:max-content;padding-left:14px;padding-right:14px}
 .tab-scroll-btn{border:1px solid var(--border-color);background:var(--card-bg);color:var(--text-color);border-radius:10px;cursor:pointer;font-size:1.2rem;font-weight:700;line-height:1;padding:0}
 .tab-scroll-btn:active{transform:scale(.96)}
 .story-form-note{font-size:.75rem;opacity:.6;margin:-3px 0 10px}
 #storyBodyInput{min-height:240px;height:36vh;font-family:'Courier New',Courier,monospace;line-height:1.65}
 .storyboard-list{display:flex;flex-direction:column;gap:12px;width:100%}
 .story-card{background:var(--card-bg);color:var(--text-color);border:1px solid var(--border-color);border-radius:12px;overflow:hidden}
 .story-head{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;padding:13px 15px;border:0;background:transparent;color:inherit;cursor:pointer}
 .story-head-copy{min-width:0}.story-head-title{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.story-head-date{font-size:.72rem;opacity:.6;margin-top:3px}.story-arrow{font-size:1rem;opacity:.65;transition:transform .2s}
 .story-card.open .story-arrow{transform:rotate(90deg)}
 .story-body{display:none;border-top:1px solid var(--border-color);padding:clamp(16px,3vw,28px);font-family:'Courier New',Courier,monospace;font-size:clamp(.92rem,1.8vw,1rem);line-height:1.85;white-space:pre-wrap;text-align:justify;overflow-wrap:anywhere}
 .story-card.open .story-body{display:block}
 .story-empty{text-align:center;padding:28px 12px;opacity:.6}
 .story-manager-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 @media(max-width:600px){.tabs-shell{grid-template-columns:30px minmax(0,1fr) 30px;gap:4px}.tabs-shell>.tabs-nav .tab-btn{flex:0 0 auto;min-width:88px}.tab-scroll-btn{border-radius:8px}.story-head{padding:12px}.story-body{padding:16px 13px;text-align:justify}}
 `;
 document.head.appendChild(s);
}

function wrapTabBars(){
 document.querySelectorAll('.tabs-nav').forEach(nav=>{
  if(nav.parentElement?.classList.contains('tabs-shell'))return;
  const shell=document.createElement('div');shell.className='tabs-shell';
  const prev=document.createElement('button');prev.type='button';prev.className='tab-scroll-btn';prev.setAttribute('aria-label','Previous tabs');prev.textContent='‹';
  const next=document.createElement('button');next.type='button';next.className='tab-scroll-btn';next.setAttribute('aria-label','Next tabs');next.textContent='›';
  nav.parentNode.insertBefore(shell,nav);shell.append(prev,nav,next);
  const move=d=>nav.scrollBy({left:d*Math.max(140,nav.clientWidth*.62),behavior:'smooth'});
  prev.onclick=()=>move(-1);next.onclick=()=>move(1);
  nav.addEventListener('click',e=>{const b=e.target.closest('.tab-btn');if(b)setTimeout(()=>b.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'}),0)});
 });
}

function addStoryboardUI(){
 const dashNav=document.querySelector('#dashboardContent .tabs-nav');
 const dashPanels=[...document.querySelectorAll('#dashboardContent>.tab-panel')];
 if(dashNav&&!document.getElementById('dashPanel5')){
  const b=document.createElement('button');b.className='tab-btn';b.textContent='StoryBoard';b.onclick=()=>window.switchDashboardTab?.(5);dashNav.appendChild(b);
  const p=document.createElement('div');p.className='tab-panel';p.id='dashPanel5';p.innerHTML=`<h2 id="storyFormHeader">Manage StoryBoard</h2><input id="editingStoryId" type="hidden"><div class="form-group"><label>Title</label><input id="storyTitleInput" maxlength="120" placeholder="Story title"></div><div class="form-group"><label>Date & Time</label><input id="storyDateInput" type="datetime-local"></div><div class="form-group"><label>Story</label><textarea id="storyBodyInput" maxlength="50000" placeholder="Write your story here...\n\nNew lines and paragraphs will be preserved."></textarea></div><div class="story-form-note">Plain text only · paragraphs and line breaks are preserved · 50,000 character limit</div><button class="action-btn" id="storySaveBtn" type="button">Publish Story</button><button class="action-btn" id="storyCancelBtn" type="button" style="display:none;background:#7f8c8d;color:#fff">Cancel Edit</button><div class="preview-box"><label style="margin-bottom:10px;display:block">Story List:</label><div id="storyManagerList"></div></div>`;
  document.getElementById('dashboardContent').appendChild(p);
  storySaveBtn.onclick=saveStory;storyCancelBtn.onclick=clearStoryForm;
 }
 const pubNav=document.querySelector('#publicProfileView .tabs-nav');
 if(pubNav&&!document.getElementById('pubPanel4')){
  const b=document.createElement('button');b.className='tab-btn';b.textContent='StoryBoard';b.onclick=()=>{window.switchPublicTab?.(4);loadPublicStories()};pubNav.appendChild(b);
  const panel=document.createElement('div');panel.className='tab-panel';panel.id='pubPanel4';panel.innerHTML='<div id="publicStoryList" class="storyboard-list"><div class="story-empty">No stories yet.</div></div>';
  const footer=document.getElementById('publicFooter');footer?.parentNode.insertBefore(panel,footer);
 }
 wrapTabBars();
}

function localNow(){const d=new Date(),z=n=>String(n).padStart(2,'0');return`${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`}
function clearStoryForm(){editingId=null;if(typeof storyTitleInput!=='undefined')storyTitleInput.value='';if(typeof storyBodyInput!=='undefined')storyBodyInput.value='';if(typeof storyDateInput!=='undefined')storyDateInput.value=localNow();if(typeof storyFormHeader!=='undefined')storyFormHeader.textContent='Manage StoryBoard';if(typeof storySaveBtn!=='undefined')storySaveBtn.textContent='Publish Story';if(typeof storyCancelBtn!=='undefined')storyCancelBtn.style.display='none'}
async function saveStory(){
 const u=auth.currentUser;if(!u)return alert('Please sign in first.');
 const title=storyTitleInput.value.trim(),body=storyBodyInput.value,date=storyDateInput.value||localNow();
 if(!title)return alert('Please enter a story title.');if(!body.trim())return alert('Please write the story.');if(body.length>50000)return alert('Story is too long. Maximum is 50,000 characters.');
 try{if(editingId)await updateDoc(doc(db,'users',u.uid,'stories',editingId),{title,body,date});else await addDoc(collection(db,'users',u.uid,'stories'),{title,body,date,position:Date.now()});clearStoryForm();await loadAdminStories(u.uid)}catch(e){console.error(e);alert('Could not save story. Check Firestore rules.')}
}
async function editStory(id){const s=stories.find(x=>x._id===id);if(!s)return;editingId=id;storyTitleInput.value=s.title||'';storyBodyInput.value=s.body||'';storyDateInput.value=(s.date||'').slice(0,16);storyFormHeader.textContent='Edit Story';storySaveBtn.textContent='Update Story';storyCancelBtn.style.display='block';storyTitleInput.scrollIntoView({behavior:'smooth',block:'center'})}
async function removeStory(id){const u=auth.currentUser;if(!u)return;try{await deleteDoc(doc(db,'users',u.uid,'stories',id));await loadAdminStories(u.uid)}catch(e){console.error(e);alert('Could not delete story.')}}
async function loadAdminStories(uid){
 try{const s=await getDocs(query(collection(db,'users',uid,'stories'),orderBy('position','desc')));stories=s.docs.map(d=>({_id:d.id,...d.data()}));renderManager()}catch(e){console.warn('StoryBoard unavailable:',e);stories=[];renderManager()}
}
function renderManager(){if(typeof storyManagerList==='undefined')return;storyManagerList.innerHTML='';if(!stories.length){storyManagerList.innerHTML='<div style="opacity:.6;font-size:.85rem">No stories yet.</div>';return}stories.forEach(s=>{const r=document.createElement('div');r.className='item-row';r.innerHTML=`<div class="story-manager-title"><b>${esc(s.title||'Story')}</b><div style="font-size:.72rem;opacity:.55">${esc(fmtDate(s.date))}</div></div><div style="display:flex;gap:5px;flex-shrink:0"><button class="edit-btn" type="button">Edit</button><button class="delete-btn" type="button">Delete</button></div>`;r.querySelector('.edit-btn').onclick=()=>editStory(s._id);r.querySelector('.delete-btn').onclick=()=>removeStory(s._id);storyManagerList.appendChild(r)})}

async function resolvePublicOwner(){
 const p=new URLSearchParams(location.search),slug=(p.get('slug')||location.hash.replace('#/','').replace('#','')).toLowerCase();
 if(slug){try{const s=await getDocs(query(collection(db,'users'),where('slug','==',slug),limit(1)));if(!s.empty)return s.docs[0].id}catch(e){console.warn(e)}}
 return auth.currentUser?.uid||null;
}
async function loadPublicStories(){
 const list=document.getElementById('publicStoryList');if(!list)return;
 publicStoryOwner=publicStoryOwner||await resolvePublicOwner();if(!publicStoryOwner){list.innerHTML='<div class="story-empty">No stories yet.</div>';return}
 list.innerHTML='<div class="story-empty">Loading stories...</div>';
 try{const s=await getDocs(query(collection(db,'users',publicStoryOwner,'stories'),orderBy('position','desc'),limit(100)));const rows=s.docs.map(d=>({_id:d.id,...d.data()}));list.innerHTML='';if(!rows.length){list.innerHTML='<div class="story-empty">No stories yet.</div>';return}rows.forEach(x=>{const c=document.createElement('article');c.className='story-card';const h=document.createElement('button');h.type='button';h.className='story-head';h.innerHTML=`<span class="story-head-copy"><span class="story-head-title">${esc(x.title||'Story')}</span><span class="story-head-date">${esc(fmtDate(x.date))}</span></span><span class="story-arrow">›</span>`;const body=document.createElement('div');body.className='story-body';body.textContent=x.body||'';h.onclick=()=>c.classList.toggle('open');c.append(h,body);list.appendChild(c)})}catch(e){console.warn('Could not load stories:',e);list.innerHTML='<div class="story-empty">StoryBoard unavailable.</div>'}
}
window.loadPublicStories=loadPublicStories;

injectStyles();
addStoryboardUI();
clearStoryForm();
onAuthStateChanged(auth,u=>{if(u)loadAdminStories(u.uid)});
const observer=new MutationObserver(()=>{if(getComputedStyle(document.getElementById('publicProfileView')).display!=='none'&&document.getElementById('pubPanel4')?.classList.contains('active'))loadPublicStories()});
const pv=document.getElementById('publicProfileView');if(pv)observer.observe(pv,{attributes:true,attributeFilter:['style','class']});
