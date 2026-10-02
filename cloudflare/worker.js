export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    };
    if (request.method === "OPTIONS") return new Response(null,{headers:cors});

    if (url.pathname === "/api/resources" && request.method === "GET") {
      const q = (url.searchParams.get("q") || "").trim();
      let stmt;
      if (q) {
        stmt = env.DB.prepare(
          "SELECT * FROM resources WHERE title LIKE ? OR title_myanmar LIKE ? OR description LIKE ? ORDER BY created_at DESC"
        ).bind("%"+q+"%","%"+q+"%","%"+q+"%");
      } else {
        stmt = env.DB.prepare("SELECT * FROM resources ORDER BY created_at DESC");
      }
      const {results} = await stmt.all();
      return Response.json(results,{headers:cors});
    }

    if (url.pathname === "/api/resources" && request.method === "POST") {
      const body = await request.json();
      const id = crypto.randomUUID();
      await env.DB.prepare(
        "INSERT INTO resources (id,title,title_myanmar,description,audience,age,domain,language,resource_type,author,institution,file_key,file_url,thumbnail_url,christian_relevance) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
      ).bind(id,body.title,body.title_myanmar||null,body.description||null,body.audience||null,body.age||null,body.domain||null,body.language||null,body.resource_type||null,body.author||null,body.institution||null,body.file_key||null,body.file_url||null,body.thumbnail_url||null,body.christian_relevance?1:0).run();
      return Response.json({id},{status:201,headers:cors});
    }

    return new Response("Not found",{status:404,headers:cors});
  }
};