import{initializeApp,getApps,getApp}from"https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import{getAuth}from"https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import{getFirestore,doc,setDoc,collection,getDocs,writeBatch}from"https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyAtEyvDp07Ej5KUiRaa6n0HMNrQBo6z33Y",authDomain:"boutme-3d364.firebaseapp.com",projectId:"boutme-3d364",storageBucket:"boutme-3d364.firebasestorage.app",messagingSenderId:"879605364049",appId:"1:879605364049:web:6b1b74869aaf7e00ca4f70",measurementId:"G-M4QQPYK2WT"};
const app=getApps().length?getApp():initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);

async function clearCollection(uid,name){
  const snap=await getDocs(collection(db,'users',uid,name));
  for(let i=0;i<snap.docs.length;i+=400){
    const batch=writeBatch(db);
    snap.docs.slice(i,i+400).forEach(d=>batch.delete(d.ref));
    await batch.commit();
  }
}

window.resetMyBoutmeProfile=async()=>{
  const user=auth.currentUser;
  if(!user)return alert('Please log in first.');
  if(!confirm('RESET YOUR boutME PROFILE?\n\nThis permanently clears your profile content, links, statuses and videos. Your login account will remain.'))return;
  if(!confirm('Final confirmation: permanently clear all of your boutME content?'))return;
  const btn=document.getElementById('resetProfileBtn');
  if(btn){btn.disabled=true;btn.textContent='Resetting...'}
  try{
    await Promise.all([
      clearCollection(user.uid,'links'),
      clearCollection(user.uid,'statuses'),
      clearCollection(user.uid,'videos')
    ]);
    await setDoc(doc(db,'users',user.uid),{
      slug:'',avatar:'',name:'',shortBio:'',email:'',website:'',telephone:'',longInfo:'',address:''
    });
    alert('Profile reset complete. Your login account was kept.');
    location.reload();
  }catch(e){
    console.error('Profile reset failed:',e);
    alert('Reset failed: '+(e?.message||e));
    if(btn){btn.disabled=false;btn.textContent='Reset My Profile'}
  }
};
