import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const SUPABASE_URL = 'https://iqkzlcuqnqniardrmfij.supabase.co';
const SUPABASE_KEY = 'sb_publishable_csvBET1dQRafHetiv7SxUw_X8CHtuHM';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
// ВРЕМЕНЕН ТЕСТОВ РЕЖИМ: премахни тестовата RPC функция след проверките.
const TEST_DRAW_MODE = true;
const modal = document.querySelector('#authModal');
const form = document.querySelector('#authForm');
const status = document.querySelector('#authStatus');
const panel = document.querySelector('#accountPanel');
let mode = 'register';
let currentUser = null;
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
  currentUser = user;
  if(!user){panel.hidden=true;document.querySelector('#registerBtn').hidden=false;document.querySelector('#loginBtn').hidden=false;return;}
  document.querySelector('#registerBtn').hidden=true;
  document.querySelector('#loginBtn').hidden=true;
  panel.hidden=false;
  const {data:profile,error}=await supabase.from('participants').select('display_name,approved,is_admin').eq('id',user.id).maybeSingle();
  let text='Профилът се зарежда. Ако току-що потвърди имейла, презареди след малко.';
  if(profile)text=profile.approved?'🎁 Профилът ти е одобрен! Можеш да провериш пробното си тайно назначение.':'⏳ Дядо Коледа разглежда заявката ти. Очаквай одобрение!';
  if(error)text='Не успяхме да заредим профила. Опитай да презаредиш страницата.';
  const secretCard = profile?.approved ? `<section class="secret-card" aria-labelledby="secretTitle">
    <span class="test-badge">🧪 ПРОБНО ТЕГЛЕНЕ</span>
    <h3 id="secretTitle">🎁 Моята тайна мисия</h3>
    <p>Само ти можеш да видиш за кого ще подготвяш подарък.</p>
    <button class="btn btn-primary" id="revealBtn" type="button">🎁 Разкрий моя получател</button>
    <p id="revealStatus" role="status" aria-live="polite"></p>
    <div id="revealResult" class="secret-recipient" hidden></div>
  </section>` : '';
  panel.innerHTML=`<h2>🎄 Здравей, ${safe(profile?.display_name || user.email)}</h2><p>${safe(text)}</p>${secretCard}${profile?.is_admin ? '<button class="btn btn-secondary" id="adminBtn" type="button">⚙️ Коледна администрация</button>' : ''}<button class="btn btn-outline" id="logoutBtn" type="button">Изход</button>`;
  if(profile?.approved)document.querySelector('#revealBtn').addEventListener('click',revealReceiver);
  if(profile?.is_admin)document.querySelector('#adminBtn').addEventListener('click',openAdmin);
  document.querySelector('#logoutBtn').addEventListener('click',async()=>{await supabase.auth.signOut();await refreshAccount();});
}
supabase.auth.onAuthStateChange(()=>{setTimeout(refreshAccount,0)});
refreshAccount();

// The RLS policy and RPC on Supabase enforce admin authorization.
const adminDialog = document.querySelector('#adminModal');
const adminList = document.querySelector('#adminList');
const adminStatus = document.querySelector('#adminStatus');
async function openAdmin(){
  adminDialog.showModal();
  await loadParticipants();
}
async function loadParticipants(){
  adminList.innerHTML = '<p>Зареждане на участниците…</p>';
  adminStatus.textContent = '';
  const {data, error} = await supabase.from('participants')
    .select('id,display_name,username,approved,is_admin,created_at')
    .order('created_at',{ascending:true});
  if(error){adminList.innerHTML='<p>Грешка при зареждане. Провери RLS настройките.</p>';return;}
  if(!data?.length){adminList.innerHTML='<p>Няма регистрирани участници.</p>';return;}
  const pending = data.filter(p=>!p.approved).length;
  adminStatus.textContent = `Общо: ${data.length} · Чакат одобрение: ${pending}`;
  adminList.innerHTML = data.map(p=>`<article class="admin-row">
    <div><strong>${safe(p.display_name)}</strong>${p.is_admin ? ' 👑' : ''}<small>${p.approved?'✅ Одобрен':'⏳ Чака одобрение'}</small></div>
    ${p.is_admin ? '<span class="admin-badge">Администратор</span>' : `<button type="button" class="btn ${p.approved?'btn-outline':'btn-primary'}" data-id="${p.id}" data-approve="${!p.approved}">${p.approved?'Отмени одобрението':'Одобри'}</button>`}
  </article>`).join('');
}
adminList.addEventListener('click',async e=>{
  const button=e.target.closest('button[data-id]');
  if(!button)return;
  const id=button.dataset.id, approved=button.dataset.approve==='true';
  button.disabled=true;
  adminStatus.textContent='Запазване…';
  const {error}=await supabase.rpc('set_participant_approval',{target_id:id,new_approved:approved});
  if(error){adminStatus.textContent='Грешка: '+error.message;button.disabled=false;return;}
  await loadParticipants();
});

// Сървърът връща само получателя на текущия потребител, без чужди назначения.
async function revealReceiver(){
  const button=document.querySelector('#revealBtn');
  const result=document.querySelector('#revealResult');
  const message=document.querySelector('#revealStatus');
  if(!button || !currentUser)return;
  button.disabled=true;message.textContent='🎄 Елфите проверяват тайната ти мисия…';
  const {data,error}=await supabase.rpc('get_my_test_receiver');
  if(!document.querySelector('#revealBtn'))return;
  button.disabled=false;
  if(error){message.textContent='Неуспешно разкриване: '+error.message+' (провери дали си изпълнил v4-test-setup.sql)';return;}
  if(!data){message.textContent='Все още няма назначен получател. Провери дали пробното теглене е направено.';return;}
  message.textContent='✨ Твоята тайна е разкрита!';
  result.textContent='🎁 '+data;result.hidden=false;
  button.textContent='🎄 Покажи отново';
}
