const API_BASE = window.ECE_API_BASE || "";
document.addEventListener("DOMContentLoaded",()=>{
  const form=document.querySelector("#form"), status=document.querySelector("#status");
  if(!form)return;
  const token=document.createElement("input");
  token.name="admin_token"; token.type="password"; token.placeholder="관리자 토큰"; token.required=true;
  token.style.cssText="width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #e8e2dc;border-radius:11px;margin-bottom:12px;font:inherit";
  form.insertBefore(token,form.firstElementChild);
  form.addEventListener("submit",async e=>{
    e.preventDefault(); status.textContent="등록 중...";
    try{
      const fd=new FormData(form);
      const res=await fetch(API_BASE+"/api/resources",{method:"POST",headers:{"Authorization":"Bearer "+fd.get("admin_token")},body:fd});
      const data=await res.json().catch(()=>({}));
      if(!res.ok){status.textContent="자료 등록 실패: "+(data.error||res.status);return;}
      form.reset(); status.textContent="자료가 등록되었습니다.";
    }catch(err){status.textContent="연결 오류: "+err.message;}
  });
});