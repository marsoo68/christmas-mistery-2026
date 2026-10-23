// Часовете са в България (през декември: UTC+02:00).
const DRAW_DATE = new Date('2026-12-01T20:00:00+02:00');
const REGISTRATION_START = new Date('2026-11-20T00:00:00+02:00');
const REGISTRATION_END = new Date('2026-12-01T00:00:00+02:00');
const HUNT_DATE = new Date('2026-12-15T09:00:00+02:00');
const pad = n => String(n).padStart(2, '0');
function updateCountdown(){
  const now = new Date();
  let diff = Math.max(0, DRAW_DATE - now);
  document.querySelector('#days').textContent = Math.floor(diff / 86400000);
  diff %= 86400000;
  document.querySelector('#hours').textContent = pad(Math.floor(diff / 3600000));
  diff %= 3600000;
  document.querySelector('#minutes').textContent = pad(Math.floor(diff / 60000));
  document.querySelector('#seconds').textContent = pad(Math.floor((diff % 60000) / 1000));
  if (now >= DRAW_DATE) document.querySelector('.eyebrow').textContent = 'ВРЕМЕ Е ЗА КОЛЕДНАТА МИСИЯ!';
}
updateCountdown(); setInterval(updateCountdown, 1000);
const rulesModal = document.querySelector('#rulesModal');
const previewModal = document.querySelector('#previewModal');
for (const id of ['rulesBtn', 'topRules']) document.getElementById(id).addEventListener('click', () => rulesModal.showModal());
function showPreview(title, message){document.querySelector('#previewTitle').textContent=title;document.querySelector('#previewText').textContent=message;previewModal.showModal();}
// Регистрацията и входът се управляват от auth.js.
for(const close of document.querySelectorAll('[data-close]')) close.addEventListener('click',()=>close.closest('dialog').close());
for(const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
const snow=document.querySelector('#snow');
for(let i=0;i<42;i++){
  const flake=document.createElement('span');flake.className='flake';flake.textContent='❄';
  flake.style.left=(Math.random()*100)+'%';flake.style.fontSize=(8+Math.random()*13)+'px';
  flake.style.animationDuration=(9+Math.random()*17)+'s';flake.style.animationDelay=(-Math.random()*22)+'s';
  flake.style.opacity=(.2+Math.random()*.45).toFixed(2);snow.appendChild(flake);
}
