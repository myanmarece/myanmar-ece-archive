const API_BASE = window.ECE_API_BASE || "";
const SESSION_KEY="ece_admin_session";
const ADMIN_AUTH_HEADER="Authorization";

document.addEventListener("DOMContentLoaded",()=>{
  const loginPanel=document.querySelector("#loginPanel"), uploadPanel=document.querySelector("#uploadPanel");
  const loginForm=document.querySelector("#loginForm"), loginStatus=document.querySelector("#loginStatus");
  const form=document.querySelector("#form"), status=document.querySelector("#status");
  const showUpload=()=>{loginPanel.classList.add("hidden");uploadPanel.classList.remove("hidden");};
  const showLogin=()=>{uploadPanel.classList.add("hidden");loginPanel.classList.remove("hidden");};

  if(localStorage.getItem(SESSION_KEY)) showUpload();

  loginForm.addEventListener("submit",async e=>{
    e.preventDefault(); loginStatus.textContent="로그인 중...";
    const fd=new FormData(loginForm);
    try{
      const loginBody=new URLSearchParams({email:fd.get("email"),password:fd.get("password")});
      const res=await fetch(API_BASE+"/api/admin/login",{method:"POST",body:loginBody});
      const data=await res.json().catch(()=>({}));
      if(!res.ok){loginStatus.textContent="로그인 실패: "+(data.error||res.status);return;}
      localStorage.setItem(SESSION_KEY,data.token); loginForm.reset(); loginStatus.textContent=""; showUpload();
    }catch(err){loginStatus.textContent="연결 오류: "+err.message;}
  });

  document.querySelector("#logout").addEventListener("click",()=>{localStorage.removeItem(SESSION_KEY);form.reset();showLogin();});

  form.addEventListener("submit",async e=>{
    e.preventDefault(); status.textContent="등록 중...";
    const token=localStorage.getItem(SESSION_KEY);
    if(!token){showLogin();return;}
    try{
      const fd=new FormData(form);
      const res=await fetch(API_BASE+"/api/resources",{method:"POST",headers:{[ADMIN_AUTH_HEADER]:"Bearer "+token},body:fd});
      const data=await res.json().catch(()=>({}));
      if(res.status===401){localStorage.removeItem(SESSION_KEY);status.textContent="세션이 만료되었습니다. 다시 로그인해 주세요.";showLogin();return;}
      if(!res.ok){status.textContent="자료 등록 실패: "+(data.error||res.status);return;}
      form.reset(); status.textContent="자료가 등록되었습니다.";
    }catch(err){status.textContent="연결 오류: "+err.message;}
  });
});