CREATE TABLE IF NOT EXISTS resources (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL,
 title_myanmar TEXT,
 description TEXT,
 audience TEXT,
 age TEXT,
 domain TEXT,
 language TEXT,
 resource_type TEXT,
 author TEXT,
 institution TEXT,
 file_key TEXT,
 file_url TEXT,
 thumbnail_url TEXT,
 christian_relevance INTEGER DEFAULT 0,
 view_count INTEGER DEFAULT 0,
 download_count INTEGER DEFAULT 0,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_resources_domain ON resources(domain);
CREATE INDEX IF NOT EXISTS idx_resources_created ON resources(created_at);