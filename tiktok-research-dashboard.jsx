import { useState, useEffect } from "react";

const API = "http://localhost:8000"; // Change to your deployed backend URL

// ── MOCK DATA for demo (remove when connected to real backend) ──
const MOCK_VIDEOS = [
  { id: "v001", desc: "POV: You finally stopped snacking because of this one gut hack 🤯", author: "healthwithsam", cover_url: "", likes: 284000, views: 2100000, comments: 3400, shares: 12000, duration: 28 },
  { id: "v002", desc: "I gained 20lbs in 3 months doing THIS every morning (not what you think)", author: "nutritionnerds", cover_url: "", likes: 91000, views: 870000, comments: 2100, shares: 4300, duration: 45 },
  { id: "v003", desc: "Why doctors don't tell you THIS about bloating — and what actually works", author: "dr_gutcheck", cover_url: "", likes: 430000, views: 3800000, comments: 6700, shares: 28000, duration: 62 },
  { id: "v004", desc: "The 3am snack craving is NOT your fault — here's the science", author: "metabolicmaven", cover_url: "", likes: 55000, views: 490000, comments: 980, shares: 2100, duration: 33 },
];

const MOCK_ANALYSIS = {
  hook_analysis: {
    hook_type: "POV", hook_text: "POV: You finally stopped snacking because of this one gut hack", hook_score: 9,
    emotional_angle: "Curiosity + Pain Point Relief", format: "Talking head",
    pacing: "Fast cut", visual_style: "Clean kitchen, natural light, casual but credible",
    key_message: "Gut health is the root cause of uncontrollable snacking",
    why_it_works: "The POV format creates instant parasocial identification. 'Finally' implies a long struggle — the viewer nods. The word 'hack' promises a shortcut without diet-culture baggage.",
    swipe_risk: "Low",
    inspiration_angles: [
      "POV: Your brand's solution was the thing you were missing all along",
      "Bold claim: 'I haven't thought about food since I started doing this'",
      "Before/after day-in-the-life: cravings vs. no cravings"
    ]
  },
  comment_analysis: {
    top_questions: ["What exactly is the hack? Link?", "Does this work if you already eat healthy?", "How long until it works?"],
    pain_points: ["Tried everything and nothing sticks", "Bloating after every meal", "Can't stop eating at night"],
    viral_phrases: ["gut health is everything", "no one talks about this", "finally found something that works"],
    sentiment: "Positive",
    audience_signals: "This audience has tried and failed multiple times and is desperate for a root-cause fix rather than another restrictive diet. They speak in relatable hyperbole ('I literally can't stop eating') and reward content that validates their struggle before offering a solution."
  }
};

// ── COMPONENTS ──

const fmt = (n) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : n;

const ScoreBadge = ({ score }) => {
  const color = score >= 8 ? "#00ff87" : score >= 6 ? "#ffd700" : "#ff6b6b";
  return (
    <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 4, padding: "2px 8px", fontSize: 12, fontWeight: 700, fontFamily: "monospace" }}>
      {score}/10
    </span>
  );
};

const Tag = ({ children, color = "#ffffff22" }) => (
  <span style={{ background: color, color: "#fff", borderRadius: 4, padding: "2px 10px", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginRight: 6 }}>
    {children}
  </span>
);

const StatPill = ({ label, value, icon }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 14px", background: "#ffffff08", borderRadius: 8, border: "1px solid #ffffff10" }}>
    <span style={{ fontSize: 15, marginBottom: 2 }}>{icon}</span>
    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>{fmt(value)}</span>
    <span style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
  </div>
);

export default function App() {
  const [view, setView] = useState("search");
  const [projects, setProjects] = useState([
    { id: "p001", name: "Supergut Q2 Campaign", client: "Supergut", brand_bible: "Health brand targeting women 28-45. Tone: conversational, science-backed. Core: gut health fixes everything.", brief_template: "## Hook Strategy\n## Core Message\n## Creative Angles\n## Audience Language\n## CTA" }
  ]);
  const [activeProject, setActiveProject] = useState("p001");
  const [searchKw, setSearchKw] = useState("gut health supplement");
  const [searchCount, setSearchCount] = useState(10);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalyses, setSelectedAnalyses] = useState(new Set());
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [expandedAnalysis, setExpandedAnalysis] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", client: "", brand_bible: "", brief_template: "" });
  const [briefTab, setBriefTab] = useState("brief");

  const project = projects.find(p => p.id === activeProject);

  async function doSearch() {
    setLoading(true); setLoadingMsg("Searching TikTok...");
    try {
      const res = await fetch(`${API}/search`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: activeProject, keyword: searchKw, count: searchCount }) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSearchResults(data.videos);
    } catch {
      // Demo fallback
      setSearchResults(MOCK_VIDEOS);
    }
    setLoading(false); setView("results");
  }

  async function doAnalyze() {
    if (selectedVideos.size === 0) return;
    setLoading(true); setLoadingMsg(`Analyzing ${selectedVideos.size} videos with Gemini...`);
    try {
      const res = await fetch(`${API}/analyze`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: activeProject, video_ids: [...selectedVideos] }) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAnalyses(data.analyses);
    } catch {
      // Demo fallback
      const demoAnalyses = [...selectedVideos].map((vid, i) => ({
        id: `a00${i+1}`, video_id: vid, project_id: activeProject,
        desc: searchResults.find(v => v.id === vid)?.desc || "Video",
        views: searchResults.find(v => v.id === vid)?.views || 0,
        likes: searchResults.find(v => v.id === vid)?.likes || 0,
        ...MOCK_ANALYSIS, analyzed_at: new Date().toISOString()
      }));
      setAnalyses(demoAnalyses);
    }
    setLoading(false); setView("analysis");
  }

  async function doGenerateBrief() {
    if (selectedAnalyses.size === 0) return;
    setLoading(true); setLoadingMsg("Generating creative brief with Gemini...");
    try {
      const res = await fetch(`${API}/generate-brief`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: activeProject, analysis_ids: [...selectedAnalyses] }) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBrief(data);
    } catch {
      // Demo fallback
      setBrief({
        id: "b001", project_name: project?.name, client: project?.client, video_count: selectedAnalyses.size,
        created_at: new Date().toISOString(),
        content: `## Campaign Overview
**Campaign Name:** Gut First — Summer 2025
**Objective:** Drive trial signups via TikTok creator content
**Platform:** TikTok
**Timeline:** June–August 2025

## Target Audience
**Primary Persona:** "Frustrated Health Seeker" — Sarah, 34, has tried every diet
**Age Range:** 28–44
**Key Behaviors:** Watches health content, DMs creators, buys on impulse after education
**What Keeps Them Up At Night:** Feeling out of control with food. Bloating every day. Nothing working.

## Hook Strategy
**Recommended Hook Type:** POV + Bold Claim hybrid
**Hook Direction 1:** "POV: You finally stopped thinking about food — and this is why"
**Hook Direction 2:** "I haven't had a single craving in 3 weeks. Here's what changed."
**Hook Direction 3:** "Doctors don't tell you this about bloating because it's too simple"

## Core Message
**Single Sentence:** Your gut is controlling your cravings — fix your gut, break the cycle.
**Supporting Points:**
- Cravings aren't willpower — they're a gut microbiome signal
- Supergut feeds the bacteria that naturally suppress appetite
- Real results within 2 weeks for most users

## Creative Angles
**Angle 1:** Day-in-the-life contrast (before vs. after gut health)
**Angle 2:** Science explainer: "Why you're always hungry" → solution reveal
**Angle 3:** Comment reply videos: answer the exact questions your audience is asking

## Audience Language to Use
**Phrases:** "gut health is everything", "no one talks about this", "finally found something that works"
**Pain Points to Address:** bloating after eating, nighttime snacking, tried everything
**Questions to Answer:** "How long until it works?" "Does it work if I eat healthy?"

## Call to Action
**Primary CTA:** "Link in bio — try it for 30 days"
**Secondary CTA:** "Comment GUT and I'll DM you the science"

## Do's and Don'ts
**DO:** Validate the struggle before the solution. Lead with empathy, not product.
**DON'T:** Use the word "diet", "skinny", or show before/after weight photos.`
      });
    }
    setLoading(false); setView("brief");
  }

  function toggleVideo(id) { setSelectedVideos(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleAnalysis(id) { setSelectedAnalyses(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  const navItems = [
    { id: "search", label: "Search", icon: "⌕" },
    { id: "results", label: "Results", icon: "▤", badge: searchResults.length || null },
    { id: "analysis", label: "Analysis", icon: "◈", badge: analyses.length || null },
    { id: "brief", label: "Brief", icon: "✦", badge: brief ? 1 : null },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8e8", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        input, textarea, select { outline: none; } input::placeholder, textarea::placeholder { color: #444; }
        .nav-item { cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 8px; color: #555; font-size: 13px; font-weight: 500; letter-spacing: 0.03em; transition: all 0.15s; border: 1px solid transparent; }
        .nav-item:hover { color: #aaa; background: #ffffff08; }
        .nav-item.active { color: #fff; background: #ffffff12; border-color: #ffffff15; }
        .btn { cursor: pointer; border: none; border-radius: 8px; font-family: inherit; font-weight: 600; transition: all 0.15s; letter-spacing: 0.02em; }
        .btn-primary { background: #fff; color: #0a0a0f; padding: 10px 20px; font-size: 13px; }
        .btn-primary:hover { background: #e0ff87; }
        .btn-primary:disabled { background: #333; color: #666; cursor: not-allowed; }
        .btn-ghost { background: transparent; color: #666; border: 1px solid #333; padding: 9px 18px; font-size: 12px; }
        .btn-ghost:hover { border-color: #555; color: #aaa; }
        .btn-accent { background: #00ff87; color: #0a0a0f; padding: 10px 20px; font-size: 13px; }
        .btn-accent:hover { background: #00e87b; }
        .card { background: #111118; border: 1px solid #1e1e2a; border-radius: 12px; }
        .input-base { background: #0f0f18; border: 1px solid #1e1e2a; border-radius: 8px; color: #e8e8e8; padding: 10px 14px; font-family: inherit; font-size: 13px; transition: border-color 0.15s; width: 100%; }
        .input-base:focus { border-color: #ffffff33; }
        .analysis-card:hover { border-color: #333 !important; }
        .video-card { cursor: pointer; transition: all 0.15s; }
        .video-card:hover { border-color: #333 !important; transform: translateY(-1px); }
        .video-card.selected { border-color: #00ff8766 !important; background: #00ff8708 !important; }
        .tab { cursor: pointer; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #555; transition: all 0.15s; }
        .tab.active { background: #ffffff15; color: #fff; }
        .brief-content h2 { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 0.08em; color: #00ff87; margin: 20px 0 8px; }
        .brief-content p { color: #bbb; line-height: 1.7; margin-bottom: 8px; font-size: 13px; }
        .brief-content strong { color: #fff; }
        .loading-overlay { position: fixed; inset: 0; background: #0a0a0fcc; backdrop-filter: blur(4px); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #00ff87; animation: pulse 1.2s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        .modal-overlay { position: fixed; inset: 0; background: #000000cc; display: flex; align-items: center; justify-content: center; z-index: 50; }
      `}</style>

      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
              {[0,1,2].map(i => <div key={i} className="pulse-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
            </div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: "0.1em", color: "#fff", marginBottom: 8 }}>PROCESSING</div>
            <div style={{ color: "#555", fontSize: 13 }}>{loadingMsg}</div>
          </div>
        </div>
      )}

      {/* Project modal */}
      {showProjectModal && (
        <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
          <div className="card" style={{ width: 560, padding: 32, maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: "0.08em", marginBottom: 24, color: "#fff" }}>NEW PROJECT</div>
            {[["Project Name", "name", "Q2 TikTok Research"], ["Client Name", "client", "Acme Corp"]].map(([label, key, ph]) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</label>
                <input className="input-base" placeholder={ph} value={newProject[key]} onChange={e => setNewProject(p => ({...p, [key]: e.target.value}))} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Brand Bible</label>
              <textarea className="input-base" rows={5} placeholder="Describe your brand: tone, audience, product, messaging pillars, words to use/avoid..." value={newProject.brand_bible} onChange={e => setNewProject(p => ({...p, brand_bible: e.target.value}))} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Brief Template</label>
              <textarea className="input-base" rows={6} placeholder="## Hook Strategy&#10;## Core Message&#10;## Creative Angles&#10;## CTA" value={newProject.brief_template} onChange={e => setNewProject(p => ({...p, brief_template: e.target.value}))} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setShowProjectModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                if (!newProject.name) return;
                const pid = `p${Date.now()}`;
                setProjects(p => [...p, { id: pid, ...newProject }]);
                setActiveProject(pid);
                setNewProject({ name: "", client: "", brand_bible: "", brief_template: "" });
                setShowProjectModal(false);
              }}>Create Project</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div style={{ width: 220, borderRight: "1px solid #1a1a22", padding: "24px 12px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
        <div style={{ padding: "0 8px 24px", borderBottom: "1px solid #1a1a22", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: "0.12em", color: "#fff" }}>TIKTOK</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: "0.12em", color: "#00ff87" }}>RESEARCH</div>
          <div style={{ fontFamily: "'DM Mono'", fontSize: 9, color: "#333", letterSpacing: "0.1em", marginTop: 2 }}>AI AGENT v1.0</div>
        </div>

        {navItems.map(n => (
          <div key={n.id} className={`nav-item ${view === n.id ? "active" : ""}`} onClick={() => setView(n.id)}>
            <span style={{ fontFamily: "monospace", fontSize: 16 }}>{n.icon}</span>
            <span>{n.label}</span>
            {n.badge ? <span style={{ marginLeft: "auto", background: "#00ff8722", color: "#00ff87", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, fontFamily: "monospace" }}>{n.badge}</span> : null}
          </div>
        ))}

        <div style={{ flex: 1 }} />
        <div style={{ borderTop: "1px solid #1a1a22", paddingTop: 16, marginTop: 8 }}>
          <div style={{ fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, padding: "0 8px" }}>Projects</div>
          {projects.map(p => (
            <div key={p.id} className={`nav-item ${activeProject === p.id ? "active" : ""}`} onClick={() => setActiveProject(p.id)} style={{ fontSize: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: activeProject === p.id ? "#00ff87" : "#333", flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.client}</span>
            </div>
          ))}
          <div className="nav-item" onClick={() => setShowProjectModal(true)} style={{ fontSize: 12, color: "#444", marginTop: 4 }}>
            <span>+</span> <span>New Project</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid #1a1a22", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: "0.08em" }}>
              {view === "search" && "NEW RESEARCH"}
              {view === "results" && `SEARCH RESULTS — "${searchKw}"`}
              {view === "analysis" && "VIDEO ANALYSIS"}
              {view === "brief" && "CREATIVE BRIEF"}
            </div>
            {project && <div style={{ fontSize: 11, color: "#444", marginTop: 2, fontFamily: "'DM Mono'" }}>{project.client} · {project.name}</div>}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {view === "results" && selectedVideos.size > 0 && (
              <button className="btn btn-accent" onClick={doAnalyze}>
                Analyze {selectedVideos.size} video{selectedVideos.size > 1 ? "s" : ""} with Gemini →
              </button>
            )}
            {view === "analysis" && selectedAnalyses.size > 0 && (
              <button className="btn btn-primary" onClick={doGenerateBrief}>
                Generate Brief from {selectedAnalyses.size} video{selectedAnalyses.size > 1 ? "s" : ""} →
              </button>
            )}
            {view === "brief" && brief && (
              <a href={`${API}/export/docx/${brief.id}`} download>
                <button className="btn btn-ghost">⬇ Download DOCX</button>
              </a>
            )}
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>

          {/* SEARCH VIEW */}
          {view === "search" && (
            <div style={{ maxWidth: 640, margin: "0 auto" }}>
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 42, letterSpacing: "0.06em", lineHeight: 1, color: "#fff" }}>
                  FIND YOUR<br /><span style={{ color: "#00ff87" }}>NEXT BRIEF.</span>
                </div>
                <div style={{ color: "#444", fontSize: 13, marginTop: 12 }}>Search TikTok → analyze hooks → generate creative briefs. No manual scrolling.</div>
              </div>

              <div className="card" style={{ padding: 28 }}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Search Keyword</label>
                  <input className="input-base" style={{ fontSize: 15 }} value={searchKw} onChange={e => setSearchKw(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch()} placeholder="gut health supplement, skincare routine, protein powder..." />
                </div>

                <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Video Count</label>
                    <select className="input-base" value={searchCount} onChange={e => setSearchCount(Number(e.target.value))}>
                      {[5,10,20,30,50].map(n => <option key={n} value={n}>{n} videos</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Sort By</label>
                    <select className="input-base">
                      <option value="0">Relevance</option>
                      <option value="1">Most Liked</option>
                      <option value="2">Most Recent</option>
                    </select>
                  </div>
                </div>

                <button className="btn btn-primary" onClick={doSearch} style={{ width: "100%", padding: "13px 20px", fontSize: 14 }}>
                  Search TikTok →
                </button>
              </div>

              {project && (
                <div className="card" style={{ padding: 20, marginTop: 20 }}>
                  <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Active Project Context</div>
                  <div style={{ fontSize: 13, color: "#666", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{project.brand_bible || "No brand bible yet — edit in project settings."}</div>
                </div>
              )}
            </div>
          )}

          {/* RESULTS VIEW */}
          {view === "results" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "#555" }}>{searchResults.length} videos found · Click to select for analysis</div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost" onClick={() => setSelectedVideos(new Set(searchResults.map(v => v.id)))}>Select All</button>
                  <button className="btn btn-ghost" onClick={() => setSelectedVideos(new Set())}>Clear</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                {searchResults.map(v => (
                  <div key={v.id} className={`card video-card ${selectedVideos.has(v.id) ? "selected" : ""}`}
                    style={{ padding: 18, cursor: "pointer", border: "1px solid #1e1e2a", position: "relative" }}
                    onClick={() => toggleVideo(v.id)}>
                    {selectedVideos.has(v.id) && (
                      <div style={{ position: "absolute", top: 14, right: 14, width: 20, height: 20, borderRadius: "50%", background: "#00ff87", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✓</div>
                    )}
                    <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.5, marginBottom: 14, paddingRight: 28 }}>{v.desc}</div>
                    <div style={{ fontSize: 11, color: "#444", marginBottom: 14, fontFamily: "'DM Mono'" }}>@{v.author_handle || v.author}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <StatPill label="Views" value={v.views} icon="▶" />
                      <StatPill label="Likes" value={v.likes} icon="♥" />
                      <StatPill label="Comments" value={v.comments} icon="◎" />
                    </div>
                    {v.duration && <div style={{ marginTop: 12, fontSize: 11, color: "#333", fontFamily: "'DM Mono'" }}>{v.duration}s</div>}
                  </div>
                ))}
              </div>
              {selectedVideos.size > 0 && (
                <div style={{ position: "sticky", bottom: 0, padding: "16px 0", textAlign: "center" }}>
                  <button className="btn btn-accent" onClick={doAnalyze} style={{ padding: "12px 32px", fontSize: 14 }}>
                    Analyze {selectedVideos.size} selected video{selectedVideos.size > 1 ? "s" : ""} with Gemini →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ANALYSIS VIEW */}
          {view === "analysis" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "#555" }}>Select analyses to include in your brief</div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost" onClick={() => setSelectedAnalyses(new Set(analyses.map(a => a.id)))}>Select All</button>
                  <button className="btn btn-ghost" onClick={() => setSelectedAnalyses(new Set())}>Clear</button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {analyses.map(a => {
                  const h = a.hook_analysis || {};
                  const c = a.comment_analysis || {};
                  const isExpanded = expandedAnalysis === a.id;
                  const isSelected = selectedAnalyses.has(a.id);
                  return (
                    <div key={a.id} className={`card analysis-card`}
                      style={{ border: `1px solid ${isSelected ? "#00ff8744" : "#1e1e2a"}`, background: isSelected ? "#00ff8706" : "#111118" }}>
                      <div style={{ padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
                        <div style={{ cursor: "pointer", width: 20, height: 20, borderRadius: 4, border: `1.5px solid ${isSelected ? "#00ff87" : "#333"}`, background: isSelected ? "#00ff87" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0, marginTop: 2 }}
                          onClick={() => toggleAnalysis(a.id)}>
                          {isSelected && "✓"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.5, marginBottom: 12 }}>{a.desc}</div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
                            {h.hook_type && <Tag>{h.hook_type}</Tag>}
                            {h.format && <Tag color="#ffffff11">{h.format}</Tag>}
                            {h.hook_score && <ScoreBadge score={h.hook_score} />}
                            <StatPill label="Views" value={a.views} icon="▶" />
                            <StatPill label="Likes" value={a.likes} icon="♥" />
                          </div>
                          {h.hook_text && (
                            <div style={{ background: "#ffffff06", border: "1px solid #ffffff10", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                              <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Hook</div>
                              <div style={{ fontSize: 13, color: "#aaa", fontStyle: "italic" }}>"{h.hook_text}"</div>
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn btn-ghost" style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => setExpandedAnalysis(isExpanded ? null : a.id)}>
                              {isExpanded ? "▲ Collapse" : "▼ Full Analysis"}
                            </button>
                          </div>
                          {isExpanded && (
                            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                              <div className="card" style={{ padding: 16 }}>
                                <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Hook Analysis</div>
                                {[["Emotional Angle", h.emotional_angle], ["Pacing", h.pacing], ["Swipe Risk", h.swipe_risk], ["Format", h.format]].map(([k, v]) => v ? (
                                  <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
                                    <span style={{ color: "#444" }}>{k}</span>
                                    <span style={{ color: "#ccc" }}>{v}</span>
                                  </div>
                                ) : null)}
                                {h.why_it_works && <div style={{ marginTop: 12, fontSize: 12, color: "#777", lineHeight: 1.6, borderTop: "1px solid #1e1e2a", paddingTop: 12 }}>{h.why_it_works}</div>}
                              </div>
                              <div className="card" style={{ padding: 16 }}>
                                <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Comment Intelligence</div>
                                {c.top_questions?.length > 0 && (
                                  <div style={{ marginBottom: 12 }}>
                                    <div style={{ fontSize: 10, color: "#333", marginBottom: 6 }}>TOP QUESTIONS</div>
                                    {c.top_questions.map((q, i) => <div key={i} style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>· {q}</div>)}
                                  </div>
                                )}
                                {c.viral_phrases?.length > 0 && (
                                  <div style={{ marginBottom: 12 }}>
                                    <div style={{ fontSize: 10, color: "#333", marginBottom: 6 }}>VIRAL PHRASES</div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                      {c.viral_phrases.map((p, i) => <span key={i} style={{ background: "#ffffff08", border: "1px solid #ffffff10", borderRadius: 4, padding: "2px 8px", fontSize: 10, color: "#777" }}>"{p}"</span>)}
                                    </div>
                                  </div>
                                )}
                                {c.audience_signals && <div style={{ fontSize: 11, color: "#666", lineHeight: 1.6, borderTop: "1px solid #1e1e2a", paddingTop: 12 }}>{c.audience_signals}</div>}
                              </div>
                              {h.inspiration_angles?.length > 0 && (
                                <div className="card" style={{ padding: 16, gridColumn: "span 2" }}>
                                  <div style={{ fontSize: 10, color: "#00ff87", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>✦ Inspiration Angles</div>
                                  {h.inspiration_angles.map((angle, i) => (
                                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 12, color: "#bbb" }}>
                                      <span style={{ color: "#00ff87", fontFamily: "monospace" }}>{i + 1}.</span>
                                      <span>{angle}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {selectedAnalyses.size > 0 && (
                <div style={{ position: "sticky", bottom: 0, padding: "16px 0", textAlign: "center" }}>
                  <button className="btn btn-primary" onClick={doGenerateBrief} style={{ padding: "12px 32px", fontSize: 14 }}>
                    Generate Creative Brief →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* BRIEF VIEW */}
          {view === "brief" && brief && (
            <div style={{ maxWidth: 760, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: "0.06em" }}>{brief.client?.toUpperCase()} — CREATIVE BRIEF</div>
                  <div style={{ fontSize: 11, color: "#444", fontFamily: "'DM Mono'", marginTop: 2 }}>
                    Based on {brief.video_count} videos · Generated {new Date(brief.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <div style={{ display: "flex", background: "#ffffff08", borderRadius: 8, padding: 4 }}>
                    {[["brief", "Brief"], ["raw", "Raw"]].map(([id, label]) => (
                      <div key={id} className={`tab ${briefTab === id ? "active" : ""}`} onClick={() => setBriefTab(id)}>{label}</div>
                    ))}
                  </div>
                  <a href={`${API}/export/docx/${brief.id}`} download>
                    <button className="btn btn-ghost">⬇ DOCX</button>
                  </a>
                  <button className="btn btn-primary" onClick={() => { navigator.clipboard.writeText(brief.content); }}>Copy</button>
                </div>
              </div>

              <div className="card" style={{ padding: 36 }}>
                {briefTab === "raw" ? (
                  <pre style={{ fontFamily: "'DM Mono'", fontSize: 12, color: "#888", lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{brief.content}</pre>
                ) : (
                  <div className="brief-content">
                    {brief.content.split("\n").map((line, i) => {
                      if (line.startsWith("## ")) return <h2 key={i}>{line.slice(3)}</h2>;
                      if (line.startsWith("**") && line.endsWith("**")) return <p key={i}><strong>{line.slice(2,-2)}</strong></p>;
                      if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
                      const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                      return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "brief" && !brief && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", color: "#333", textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 48, letterSpacing: "0.08em", marginBottom: 12 }}>NO BRIEF YET</div>
              <div style={{ fontSize: 13 }}>Search → Analyze → Select analyses → Generate Brief</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
