const SHEET_ID = window.ECE_SHEET_ID || "";
const SHEET_NAME = window.ECE_SHEET_NAME || "Resources";
const DATA_API = window.ECE_DATA_API || "";
let liveData = [];

function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
function card(r){
  const icon={"성경적 유아교육":"📖","수업·활동":"🎨","교사 자료":"🏫","유아교육과 학생":"📚","연구자료":"🔎","자료실":"⭐"}[r.domain]||"📄";
  return '<a class="card" href="resource-detail.html?id='+encodeURIComponent(r.id)+'"><div class="thumb pink">'+icon+'</div><div class="body"><span class="tag">'+esc(r.domain||"자료")+'</span><h2>'+esc(r.title)+'</h2><p>'+esc(r.description||"")+'</p><div class="meta"><span>'+esc(r.resource_type||"자료")+' · '+esc(r.language||"")+'</span><span>'+esc(r.audience||"")+' · '+esc(r.age||"")+'</span></div></div></a>';
}
function renderLive(){
  const q=(document.querySelector("#q").value||"").toLowerCase().trim();
  const a=document.querySelector("#audience").value, age=document.querySelector("#age").value, d=document.querySelector("#domain").value, l=document.querySelector("#lang").value;
  const out=liveData.filter(r=>(!q||[r.title,r.title_myanmar,r.description,r.author].join(" ").toLowerCase().includes(q))&&(!a||r.audience===a)&&(!age||r.age===age)&&(!d||r.domain===d)&&(!l||r.language===l));
  document.querySelector("#count").textContent=out.length+"개 자료";
  document.querySelector("#grid").innerHTML=out.length?out.map(card).join(""):'<div class="empty">조건에 맞는 자료가 없습니다.</div>';
}
function finishLoad(rows){
  if(!Array.isArray(rows)||!rows.length){liveData=[];renderLive();return;}
  liveData=rows.filter(r=>r&&Object.keys(r).length).map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[String(k).trim(),String(v??"")])));
  ["q","audience","age","domain","lang"].forEach(id=>document.querySelector("#"+id)?.addEventListener("input",renderLive));
  ["audience","age","domain","lang"].forEach(id=>document.querySelector("#"+id)?.addEventListener("change",renderLive));
  renderLive();
}
function loadViaApi(){
  return new Promise((resolve,reject)=>{
    const callback="eceCallback_"+Date.now();
    const script=document.createElement("script");
    const timer=setTimeout(()=>{cleanup();reject(new Error("API timeout"));},10000);
    function cleanup(){clearTimeout(timer);delete window[callback];script.remove();}
    window[callback]=(rows)=>{cleanup();resolve(rows);};
    script.onerror=()=>{cleanup();reject(new Error("API error"));};
    script.src=DATA_API+"?callback="+callback+"&_="+Date.now();
    document.head.appendChild(script);
  });
}
async function loadResources(){
  try{
    if(DATA_API){finishLoad(await loadViaApi());return;}
    if(!SHEET_ID)throw new Error("no source");
    const url="https://docs.google.com/spreadsheets/d/"+encodeURIComponent(SHEET_ID)+"/gviz/tq?tqx=out:csv&sheet="+encodeURIComponent(SHEET_NAME);
    const res=await fetch(url); if(!res.ok)throw new Error();
    const rows=parseCSV(await res.text());
    if(rows.length<2){finishLoad([]);return;}
    const headers=rows.shift().map(x=>x.trim());
    finishLoad(rows.filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??""]))));
  }catch(e){document.querySelector("#grid").innerHTML='<div class="empty">자료를 불러오지 못했습니다. Google Sheet 연결 설정을 확인해 주세요.</div>';}
}
function parseCSV(text){
  const rows=[];let row=[],cell="",quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];
    if(c==='"'){if(quoted&&n==='"'){cell+='"';i++;}else quoted=!quoted;}
    else if(c===','&&!quoted){row.push(cell);cell="";}
    else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(cell);cell="";if(row.some(x=>x!==""))rows.push(row);row=[];}
    else cell+=c;
  }
  if(cell!==""||row.length){row.push(cell);if(row.some(x=>x!==""))rows.push(row);}
  return rows;
}
document.addEventListener("DOMContentLoaded",loadResources);