document.addEventListener("DOMContentLoaded", async () => {
  const cfg = window.SUPABASE_CONFIG;
  const status = document.querySelector("#loginStatus");

  if (!cfg?.url || !cfg?.anonKey || !window.supabase) {
    status.textContent = "Supabase 설정을 확인해주세요.";
    return;
  }

  const client = window.supabase.createClient(cfg.url, cfg.anonKey);

  const showAdmin = () => {
    document.querySelector("#loginPanel").style.display = "none";
    document.querySelector("#adminContent").style.display = "block";
  };

  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) {
    status.textContent = "Supabase 연결 오류: " + sessionError.message;
    return;
  }
  if (sessionData.session) showAdmin();

  document.querySelector("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "로그인 중...";

    try {
      const email = document.querySelector("#loginEmail").value.trim();
      const password = document.querySelector("#loginPassword").value;

      const result = await Promise.race([
        client.auth.signInWithPassword({ email, password }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Supabase 연결 시간이 초과되었습니다.")), 10000)
        )
      ]);

      if (result.error) {
        status.textContent = "로그인 실패: " + result.error.message;
        return;
      }

      status.textContent = "";
      showAdmin();
    } catch (err) {
      status.textContent = "로그인 오류: " + (err?.message || String(err));
    }
  });

  const form = document.querySelector("#form");
  const uploadStatus = document.querySelector("#status");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    uploadStatus.textContent = "등록 중...";

    try {
      const fd = new FormData(form);
      const file = fd.get("file");
      let filePath = null;
      let fileUrl = null;

      if (file && file.size) {
        filePath = Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const up = await client.storage.from("resources").upload(filePath, file);

        if (up.error) {
          uploadStatus.textContent = "파일 업로드 실패: " + up.error.message;
          return;
        }

        fileUrl = client.storage.from("resources").getPublicUrl(filePath).data.publicUrl;
      }

      const row = {
        title: fd.get("title"),
        title_myanmar: fd.get("title_myanmar") || null,
        description: fd.get("description") || null,
        audience: fd.get("audience"),
        age: fd.get("age") || null,
        domain: fd.get("domain"),
        language: fd.get("language"),
        resource_type: fd.get("resource_type") || null,
        author: fd.get("author") || null,
        file_path: filePath,
        file_url: fileUrl
      };

      const ins = await client.from("resources").insert(row);

      if (ins.error) {
        uploadStatus.textContent = "자료 저장 실패: " + ins.error.message;
        return;
      }

      form.reset();
      uploadStatus.textContent = "자료가 등록되었습니다.";
    } catch (err) {
      uploadStatus.textContent = "등록 오류: " + (err?.message || String(err));
    }
  });
});