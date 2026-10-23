import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const SUPABASE_URL = 'https://iqkzlcuqnqniardrmfij.supabase.co';
const SUPABASE_KEY = 'sb_publishable_csvBET1dQRafHetiv7SxUw_X8CHtuHM';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const modal = document.querySelector('#authModal');
const form = document.querySelector('#authForm');
const status = document.querySelector('#authStatus');
const panel = document.querySelector('#accountPanel');
let mode = 'register';
const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function openAuth(nextMode){
  mode=nextMode; form.reset();status.textContent='';
  document.querySelector('#authTitle').textContent = mode==='register'?'Регистрация':'Вход в профила';
  document.querySelector('#nameWrap').hidden=mode!=='register';
  document.querySelector('#authName').required=mode==='register';
  document.querySelector('#authPassword').autocomplete=mode==='register'?'new-password':'current-password';
  document.querySelector('#authSubmit').textContent=mode==='register'?'🎁 Регистрирай ме':'🔑 Влез';
  modal.showModal();
}
document.querySelector('#registerBtn').addEventListener('click',()=>openAuth('register'));
document.querySelector('#loginBtn').addEventListener('click',()=>openAuth('login'));
form.addEventListener('submit',async event=>{
  event.preventDefault();
  const button=document.querySelector('#authSubmit');button.disabled=true;status.textContent='Моля, изчакай…';
  const email=document.querySelector('#authEmail').value.trim();
  const password=document.querySelector('#authPassword').value;
  try {
    if(mode==='register'){
      const display_name=document.querySelector('#authName').value.trim();
      if(!display_name)throw new Error('Въведи име за играта.');
      const {data,error}=await supabase.auth.signUp({email,password,options:{data:{display_name},emailRedirectTo:window.location.origin+window.location.pathname}});
      if(error)throw error;
      status.textContent=data.session?'Регистрацията е успешна! Очакваш одобрение.':'Провери имейла си и потвърди регистрацията. След това ще очакваш одобрение.';
    }else{
      const {error}=await supabase.auth.signInWithPassword({email,password});
      if(error)throw error;
      modal.close();
    }
    await refreshAccount();
  }catch(error){status.textContent='Грешка: '+(error.message||'Опитай отново.');}
  finally{button.disabled=false;}
});
async function refreshAccount(){
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){panel.hidden=true;document.querySelector('#registerBtn').hidden=false;document.querySelector('#loginBtn').hidden=false;return;}
  document.querySelector('#registerBtn').hidden=true;
  document.querySelector('#loginBtn').hidden=true;
  panel.hidden=false;
  const {data:profile,error}=await supabase.from('participants').select('display_name,approved,is_admin').eq('id',user.id).maybeSingle();
  let text='Профилът се зарежда. Ако току-що потвърди имейла, презареди след малко.';
  if(profile)text=profile.approved?'🎁 Профилът ти е одобрен! Личната мисия ще бъде активирана в следващата версия.':'⏳ Дядо Коледа разглежда заявката ти. Очаквай одобрение!';
  if(error)text='Не успяхме да заредим профила. Опитай да презаредиш страницата.';
  panel.innerHTML=`<h2>🎄 Здравей, ${safe(profile?.display_name || user.email)}</h2><p>${safe(text)}</p><button class="btn btn-outline" id="logoutBtn" type="button">Изход</button>`;
  document.querySelector('#logoutBtn').addEventListener('click',async()=>{await supabase.auth.signOut();await refreshAccount();});
}
supabase.auth.onAuthStateChange(()=>{setTimeout(refreshAccount,0)});
refreshAccount();
