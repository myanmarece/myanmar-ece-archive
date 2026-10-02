const API_BASE = window.ECE_API_BASE || "";
let liveData = [];

function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
function card(r){
  const icon={ "성경적 유아교육":"📖","수업·활동":"🎨","교사 자료":"🏫","유아교육과 학생":"📚","연구자료":"🔎","자료실":"⭐"}[r.domain]||"📄";
  return '<a class="card" href="resource-detail.html?id='+encodeURIComponent(r.id)+'"><div class="thumb pink">'+icon+'</div><div class="body"><span class="tag">'+esc(r.domain||"자료")+'</span><h2>'+esc(r.title)+'</h2><p>'+esc(r.description||"")+'</p><div class="meta"><span>'+esc(r.resource_type||"자료")+' · '+esc(r.language||"")+'</span><span>'+esc(r.audience||"")+' · '+esc(r.age||"")+'</span></div></div></a>';
}
function renderLive(){
  const q=(document.querySelector("#q").value||"").toLowerCase().trim();
  const a=document.querySelector("#audience").value, age=document.querySelector("#age").value, d=document.querySelector("#domain").value, l=document.querySelector("#lang").value;
  const out=liveData.filter(r=>(!q||[r.title,r.title_myanmar,r.description].join(" ").toLowerCase().includes(q))&&(!a||r.audience===a)&&(!age||r.age===age)&&(!d||r.domain===d)&&(!l||r.language===l));
  document.querySelector("#count").textContent=out.length+"개 자료";
  document.querySelector("#grid").innerHTML=out.length?out.map(card).join(""):'<div class="empty">조건에 맞는 자료가 없습니다.</div>';
}
async function loadResources(){
  try{
    const res=await fetch(API_BASE+"/api/resources");
    if(!res.ok)return;
    const data=await res.json();
    if(Array.isArray(data)){
      liveData=data;
      ["q","audience","age","domain","lang"].forEach(id=>document.querySelector("#"+id)?.addEventListener("input",renderLive));
      ["audience","age","domain","lang"].forEach(id=>document.querySelector("#"+id)?.addEventListener("change",renderLive));
      document.querySelector(".search button")?.addEventListener("click",renderLive);
      renderLive();
    }
  }catch(e){}
}
document.addEventListener("DOMContentLoaded",loadResources);