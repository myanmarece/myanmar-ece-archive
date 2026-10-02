const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type, Authorization","Access-Control-Allow-Methods":"GET,POST,OPTIONS"};
const json=(d,s=200)=>Response.json(d,{status:s,headers:cors});

export default {async fetch(request,env){
 const url=new URL(request.url);
 if(request.method==="OPTIONS")return new Response(null,{headers:cors});

 if(url.pathname==="/api/admin/login"&&request.method==="POST"){
  const body=await request.json().catch(()=>({}));
  if(!body.email||!body.password)return json({error:"이메일과 비밀번호를 입력하세요."},400);
  if(body.email!==env.ADMIN_EMAIL||body.password!==env.ADMIN_PASSWORD)return json({error:"이메일 또는 비밀번호가 올바르지 않습니다."},401);
  return json({token:env.ADMIN_TOKEN});
 }

 if(url.pathname.startsWith("/files/")&&request.method==="GET"){
  const key=decodeURIComponent(url.pathname.slice("/files/".length));
  if(!key)return new Response("Not found",{status:404,headers:cors});
  const object=await env.RESOURCES.get(key);
  if(!object)return new Response("File not found",{status:404,headers:cors});
  const headers=new Headers(cors);
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control","public, max-age=31536000, immutable");
  return new Response(object.body,{headers});
 }

 if(url.pathname==="/api/resources"&&request.method==="GET"){
  const q=(url.searchParams.get("q")||"").trim();
  const stmt=q
   ?env.DB.prepare("SELECT * FROM resources WHERE title LIKE ? OR title_myanmar LIKE ? OR description LIKE ? ORDER BY created_at DESC").bind("%"+q+"%","%"+q+"%","%"+q+"%")
   :env.DB.prepare("SELECT * FROM resources ORDER BY created_at DESC");
  const {results}=await stmt.all();
  return json(results);
 }

 if(url.pathname==="/api/resources"&&request.method==="POST"){
  const form=await request.formData();
  if((form.get("admin_token")||"")!==env.ADMIN_TOKEN)return json({error:"관리자 인증이 필요합니다."},401);
  const file=form.get("file");
  const id=crypto.randomUUID();
  let fileKey=null,fileUrl=null;
  if(file&&typeof file.arrayBuffer==="function"&&file.size){
   fileKey=id+"_"+file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
   await env.RESOURCES.put(fileKey,file.stream(),{httpMetadata:{contentType:file.type||"application/octet-stream"}});
   fileUrl=url.origin+"/files/"+encodeURIComponent(fileKey);
  }
  await env.DB.prepare("INSERT INTO resources (id,title,title_myanmar,description,audience,age,domain,language,resource_type,author,file_key,file_url) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
   .bind(id,form.get("title"),form.get("title_myanmar")||null,form.get("description")||null,form.get("audience")||null,form.get("age")||null,form.get("domain")||null,form.get("language")||null,form.get("resource_type")||null,form.get("author")||null,fileKey,fileUrl)
   .run();
  return json({id},201);
 }

 return new Response("Not found",{status:404,headers:cors});
}};