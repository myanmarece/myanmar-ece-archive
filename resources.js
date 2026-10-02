const API_BASE = window.ECE_API_BASE || "";
async function loadResources(){
  try{
    const res=await fetch(API_BASE+"/api/resources");
    if(!res.ok)return;
    const live=await res.json();
    if(Array.isArray(live)&&live.length)document.dispatchEvent(new CustomEvent("live-resources",{detail:live}));
  }catch(e){}
}
document.addEventListener("DOMContentLoaded",loadResources);