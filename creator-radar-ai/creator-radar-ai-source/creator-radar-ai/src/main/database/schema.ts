import Database from 'better-sqlite3';

export function applySchema(db: Database.Database): void {
  db.exec(`CREATE TABLE IF NOT EXISTS app_config (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL DEFAULT '');`);
  db.exec(`CREATE TABLE IF NOT EXISTS recruiters (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', active INTEGER NOT NULL DEFAULT 1);`);
  db.exec(`CREATE TABLE IF NOT EXISTS dm_templates (id INTEGER PRIMARY KEY AUTOINCREMENT, tone TEXT NOT NULL, template_text TEXT NOT NULL DEFAULT '', is_default INTEGER NOT NULL DEFAULT 0);`);
  db.exec(`CREATE TABLE IF NOT EXISTS campaigns (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, target_niches TEXT NOT NULL DEFAULT '[]', min_followers INTEGER NOT NULL DEFAULT 0, max_followers INTEGER NOT NULL DEFAULT 9999999, min_recruit_score INTEGER NOT NULL DEFAULT 0, min_recruitability INTEGER NOT NULL DEFAULT 0, target_content_style TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', assigned_recruiters TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL DEFAULT (datetime('now')), status TEXT NOT NULL DEFAULT 'Active');`);
  db.exec(`
    CREATE TABLE IF NOT EXISTS creator_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL, display_name TEXT NOT NULL DEFAULT '', profile_url TEXT NOT NULL DEFAULT '',
      profile_image_url TEXT NOT NULL DEFAULT '', bio TEXT NOT NULL DEFAULT '',
      niche TEXT NOT NULL DEFAULT '', sub_niche TEXT NOT NULL DEFAULT '',
      followers INTEGER NOT NULL DEFAULT 0, estimated_likes INTEGER NOT NULL DEFAULT 0,
      estimated_avg_views INTEGER NOT NULL DEFAULT 0, engagement_rate REAL NOT NULL DEFAULT 0,
      live_activity TEXT NOT NULL DEFAULT 'Unknown', posting_frequency TEXT NOT NULL DEFAULT 'Unknown',
      recruit_score INTEGER NOT NULL DEFAULT 0, recruitability_score INTEGER NOT NULL DEFAULT 0,
      growth_potential_score INTEGER NOT NULL DEFAULT 0, priority_tier TEXT NOT NULL DEFAULT 'Tier 4',
      fit_summary TEXT NOT NULL DEFAULT '', why_good_candidate TEXT NOT NULL DEFAULT '',
      recruitability_reason TEXT NOT NULL DEFAULT '', growth_signals_summary TEXT NOT NULL DEFAULT '',
      growth_category TEXT NOT NULL DEFAULT 'Low Growth Signals',
      ai_summary TEXT NOT NULL DEFAULT '', ai_niche_detection TEXT NOT NULL DEFAULT '',
      ai_content_tags TEXT NOT NULL DEFAULT '[]', ai_live_potential TEXT NOT NULL DEFAULT 'Unknown',
      ai_outreach_angle TEXT NOT NULL DEFAULT '',
      suggested_dm_tone TEXT NOT NULL DEFAULT 'Warm', personalized_dm TEXT NOT NULL DEFAULT '',
      dm_short TEXT NOT NULL DEFAULT '', dm_standard TEXT NOT NULL DEFAULT '',
      dm_warm TEXT NOT NULL DEFAULT '', dm_professional TEXT NOT NULL DEFAULT '',
      dm_strong_cta TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'New Lead',
      assigned_recruiter_id INTEGER REFERENCES recruiters(id) ON DELETE SET NULL,
      campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
      tags TEXT NOT NULL DEFAULT '[]', notes TEXT NOT NULL DEFAULT '',
      date_contacted TEXT NOT NULL DEFAULT '', response_status TEXT NOT NULL DEFAULT 'Not Contacted',
      follow_up_date TEXT NOT NULL DEFAULT '', outcome_notes TEXT NOT NULL DEFAULT '',
      date_added TEXT NOT NULL DEFAULT (date('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  db.exec(`CREATE TABLE IF NOT EXISTS lead_notes (id INTEGER PRIMARY KEY AUTOINCREMENT, lead_id INTEGER NOT NULL REFERENCES creator_leads(id) ON DELETE CASCADE, note_text TEXT NOT NULL, author TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')));`);
  db.exec(`CREATE TABLE IF NOT EXISTS search_presets (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, filters TEXT NOT NULL DEFAULT '{}', pinned INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));`);
  db.exec(`CREATE TABLE IF NOT EXISTS review_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, queue_source TEXT NOT NULL DEFAULT 'unreviewed', queue_filters TEXT NOT NULL DEFAULT '{}', total_in_queue INTEGER NOT NULL DEFAULT 0, reviewed_count INTEGER NOT NULL DEFAULT 0, high_priority INTEGER NOT NULL DEFAULT 0, saved_leads INTEGER NOT NULL DEFAULT 0, skipped INTEGER NOT NULL DEFAULT 0, not_a_fit INTEGER NOT NULL DEFAULT 0, started_at TEXT NOT NULL DEFAULT (datetime('now')), completed_at TEXT NOT NULL DEFAULT '');`);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_leads_username ON creator_leads(username);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON creator_leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_niche ON creator_leads(niche);
    CREATE INDEX IF NOT EXISTS idx_leads_campaign ON creator_leads(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_leads_tier ON creator_leads(priority_tier);
    CREATE INDEX IF NOT EXISTS idx_leads_recruit_score ON creator_leads(recruit_score DESC);
    CREATE INDEX IF NOT EXISTS idx_leads_recruitability ON creator_leads(recruitability_score DESC);
    CREATE INDEX IF NOT EXISTS idx_leads_growth ON creator_leads(growth_potential_score DESC);
    CREATE INDEX IF NOT EXISTS idx_leads_date ON creator_leads(date_added);
    CREATE INDEX IF NOT EXISTS idx_presets_pinned ON search_presets(pinned DESC);
  `);

  // Seed DM templates
  const tc = (db.prepare('SELECT COUNT(*) AS n FROM dm_templates').get() as {n:number}).n;
  if (tc === 0) {
    const ins = db.prepare('INSERT INTO dm_templates (tone, template_text, is_default) VALUES (?,?,?)');
    const templates: [string,string,number][] = [
      ['Warm',"Hey {creator_name}! 👋 I came across your {niche} content and honestly loved your vibe. I work with {agency_name} and we help creators like you grow their audience, increase income, and build a real presence on LIVE. Would love to chat if you're open to it! 😊",1],
      ['Professional',"Hi {creator_name}, I'm reaching out from {agency_name}. We specialise in supporting {niche} creators in growing their platform and exploring monetisation opportunities. I'd love to connect and share more about what we offer. Let me know if you're interested.",0],
      ['Friendly',"Hey {creator_name}! Your {niche} content is really good — I've been following for a bit and your style stands out. I'm with {agency_name} and we work with creators to help them level up. No pressure, but would love to tell you more if you're curious! 🙌",0],
      ['High-energy',"{creator_name}!! Your content is 🔥 and we NEED to talk! I'm with {agency_name} and we're actively looking for {niche} creators to join our team. This could be a game-changer for your growth. Hit me back! 🚀",0],
      ['Soft Invite',"Hi {creator_name}, I wanted to reach out because your content really caught my attention. I'm with {agency_name} and we occasionally work with creators in the {niche} space. Just wanted to introduce myself in case it's something you'd ever want to explore. No rush at all! 😊",0],
      ['Direct',"Hi {creator_name}. I work with {agency_name} and we're recruiting {niche} creators. We offer audience growth support, monetisation opportunities, and LIVE coaching. Interested? Let me know and I'll send details.",0],
      ['Encouraging',"{creator_name}, your content shows real potential and I think you're just getting started! I'm with {agency_name} and we love supporting creators like you in the {niche} space. We'd love to help you grow. Would you be open to a quick chat? 🌟",0],
      ['Premium',"Hello {creator_name}, I represent {agency_name}, a creator development agency working with select {niche} talent. Your content demonstrates the quality and authenticity we look for in our network. I'd welcome the opportunity to discuss how we might support your growth.",0],
    ];
    for (const [t,tx,d] of templates) ins.run(t,tx,d);
  }

  // Seed presets
  const pc = (db.prepare('SELECT COUNT(*) AS n FROM search_presets').get() as {n:number}).n;
  if (pc === 0) {
    const ins = db.prepare('INSERT INTO search_presets (name, filters, pinned) VALUES (?,?,?)');
    const presets: [string,string,number][] = [
      ['High Priority Leads', JSON.stringify({priorityTier:'Tier 1',status:'New Lead'}), 1],
      ['Beauty Rising Creators', JSON.stringify({niche:'Beauty',minGrowthScore:70,minRecruitabilityScore:65}), 1],
      ['LIVE-Friendly Gamers', JSON.stringify({niche:'Gaming',liveActivity:'Active streamer'}), 1],
      ['Follow-Up Needed', JSON.stringify({status:'Follow Up Later'}), 0],
      ['New Leads To Review', JSON.stringify({status:'New Lead'}), 0],
      ['Ready To Contact', JSON.stringify({status:'Ready to Contact',minRecruitabilityScore:60}), 0],
    ];
    for (const [n,f,p] of presets) ins.run(n,f,p);
  }
}
