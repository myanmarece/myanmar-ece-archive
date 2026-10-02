async function loadResources(){
  const cfg=window.SUPABASE_CONFIG;
  if(!cfg?.url||!cfg?.anonKey)return;
  if(!window.supabase)return;
  const client=window.supabase.createClient(cfg.url,cfg.anonKey);
  const {data,error}=await client.from("resources").select("*").order("created_at",{ascending:false});
  if(error||!data?.length)return;
  window.LIVE_RESOURCES=data;
  document.dispatchEvent(new CustomEvent("live-resources",{detail:data}));
}
document.addEventListener("DOMContentLoaded",loadResources);