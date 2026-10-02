document.addEventListener("DOMContentLoaded",async()=>{\n const cfg=window.SUPABASE_CONFIG;\n if(!cfg?.url||!cfg?.anonKey){document.querySelector("#loginStatus").textContent="Supabase 설정이 필요합니다.";return;}\n\n const show=()=>{document.querySelector("#loginPanel").style.display="none";document.querySelector("#adminContent").style.display="block";};\n const {data:{session}}=await client.auth.getSession(); if(session) show();\n document.querySelector("#loginForm").addEventListener("submit",async e=>{e.preventDefault();const s=document.querySelector("#loginStatus");s.textContent="로그인 중...";const {error}=await client.auth.signInWithPassword({email:document.querySelector("#loginEmail").value,password:document.querySelector("#loginPassword").value});if(error){s.textContent="로그인 실패: "+error.message;return;}show();});
 const form=document.querySelector("#form"),status=document.querySelector("#status");
 if(!form)return;
 form.addEventListener("submit",async e=>{
  e.preventDefault(); status.textContent="등록 중...";
  const cfg=window.SUPABASE_CONFIG;
  if(!cfg?.url||!cfg?.anonKey){status.textContent="Supabase 설정이 필요합니다.";return;}
  const client=window.supabase.createClient(cfg.url,cfg.anonKey);
  const fd=new FormData(form), file=fd.get("file");
  let filePath=null,fileUrl=null;
  if(file&&file.size){
    filePath=Date.now()+"_"+file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
    const up=await client.storage.from("resources").upload(filePath,file);
    if(up.error){status.textContent="파일 업로드 실패: "+up.error.message;return;}
    fileUrl=client.storage.from("resources").getPublicUrl(filePath).data.publicUrl;
  }
  const row={title:fd.get("title"),title_myanmar:fd.get("title_myanmar")||null,description:fd.get("description")||null,audience:fd.get("audience"),age:fd.get("age")||null,domain:fd.get("domain"),language:fd.get("language"),resource_type:fd.get("resource_type")||null,author:fd.get("author")||null,file_path:filePath,file_url:fileUrl};
  const ins=await client.from("resources").insert(row);
  if(ins.error){status.textContent="자료 저장 실패: "+ins.error.message;return;}
  form.reset(); status.textContent="자료가 등록되었습니다.";
 });
});