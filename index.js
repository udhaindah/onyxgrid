import express from "express";
import cors from "cors";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"] }));

const profile = {
  id: "onyxgrid",
  name: "OnyxGrid",
  version: "1.0.0",
  tagline: "DeFi Intelligence Engine for the Base Ecosystem",
  description: "A high-precision yield tracking and liquidity monitoring runtime built for Base L2. OnyxGrid scans DeFi pools, evaluates token risk profiles, and delivers real-time portfolio analytics through MCP and A2A protocols.",
  heroLabel: "DeFi Command Center",
  author: "OnyxGrid Labs",
  contact: { email: "ops@onyxgrid.io", website: "https://8004scan.io" },
  theme: {
    page: "#0a0a0a",
    panel: "rgba(20, 16, 8, 0.9)",
    panelEdge: "rgba(245, 158, 11, 0.2)",
    accent: "#F59E0B",
    accentSoft: "#FCD34D",
    glow: "rgba(245, 158, 11, 0.15)",
  },
  agents: {
    scanner: (task) => `Scanner analyzed DeFi landscape for: ${task}.`,
    optimizer: (task) => `Optimizer calculated best yield paths for: ${task}.`,
    reporter: (task) => `Reporter compiled final analytics report for: ${task}.`,
  },
  tools: [
    {
      name: "yield_scanner",
      description: "Discover highest-yield farming opportunities across Base DEXes like Aerodrome and Uniswap.",
      inputSchema: { type: "object", properties: { min_apy: { type: "number", description: "Minimum APY threshold in percent" }, pool_type: { type: "string", enum: ["stable", "volatile", "concentrated"], description: "Type of liquidity pool" } }, required: ["pool_type"] },
    },
    {
      name: "token_radar",
      description: "Deep analysis of new tokens on Base: holder distribution, liquidity depth, contract verification status.",
      inputSchema: { type: "object", properties: { token_address: { type: "string", description: "Contract address of the token on Base" } }, required: ["token_address"] },
    },
    {
      name: "portfolio_risk",
      description: "Calculate a composite risk score for a DeFi portfolio based on asset exposure and volatility.",
      inputSchema: { type: "object", properties: { wallet: { type: "string", description: "Wallet address to evaluate" } }, required: ["wallet"] },
    },
    {
      name: "liquidity_heatmap",
      description: "Generate a heatmap visualization of liquidity concentrations across major Base pools.",
      inputSchema: { type: "object", properties: { dex: { type: "string", enum: ["aerodrome", "uniswap", "baseswap", "all"], description: "Target DEX platform" } }, required: ["dex"] },
    },
    {
      name: "trend_pulse",
      description: "Detect emerging volume and price trends in the last 24 hours on Base.",
      inputSchema: { type: "object", properties: { timeframe: { type: "string", enum: ["1h", "6h", "24h"], description: "Lookback window" } }, required: ["timeframe"] },
    },
  ],
  prompts: [
    { name: "yield_report", description: "Generate a markdown yield farming report from scanned pool data.", arguments: [{ name: "pool_data", description: "Raw JSON pool scan results", required: true }] },
    { name: "risk_assessment", description: "Create a portfolio risk breakdown narrative.", arguments: [{ name: "risk_data", description: "Risk score JSON", required: true }] },
  ],
  skills: [
    { name: "yield_scanner", description: "Finds optimal yield farming positions across Base DEXes." },
    { name: "token_radar", description: "Deep-dives into token fundamentals and on-chain metrics." },
    { name: "portfolio_risk", description: "Scores portfolio risk using multi-factor analysis." },
    { name: "liquidity_heatmap", description: "Maps liquidity density across pools." },
    { name: "trend_pulse", description: "Detects momentum shifts in real-time." },
    { name: "yield_report", description: "Compiles professional DeFi yield reports." },
  ],
  resources: [
    { uri: "resource://onyxgrid/pool-registry", name: "pool_registry", description: "Live registry of tracked Base liquidity pools with TVL and APY.", mimeType: "application/json" },
    { uri: "resource://onyxgrid/market-pulse", name: "market_pulse", description: "Aggregated 24h market pulse data for Base tokens.", mimeType: "application/json" },
  ],
};

const memory = {};
function getBaseUrl(req) { const p = req.headers["x-forwarded-proto"] || req.protocol || "https"; return `${p}://${req.get("host")}`; }
function getSessionId(req) { return req.headers["x-session-id"] || "default"; }
function ensureSession(s) { if (!memory[s]) memory[s] = []; return memory[s]; }
function logEntry(s, e) { ensureSession(s).push({ timestamp: Date.now(), ...e }); }
function rpcSuccess(id, result) { return { jsonrpc: "2.0", id, result }; }
function rpcError(id, code, message) { return { jsonrpc: "2.0", id: id ?? null, error: { code, message } }; }
function makeText(text) { return { content: [{ type: "text", text }] }; }

function buildAgentCard(req) {
  const b = getBaseUrl(req);
  return { name: profile.name, description: profile.description, url: `${b}/`, version: profile.version, author: profile.author, contact: profile.contact, capabilities: ["mcp", "a2a", "tools", "prompts", "resources", "swarm"], endpoints: { mcp: `${b}/mcp`, a2a: `${b}/a2a`, health: `${b}/health`, agentCard: `${b}/.well-known/agent-card.json` }, skills: profile.skills };
}
function getOverview(req) {
  return { profile: profile.id, serverInfo: { name: profile.name, version: profile.version, env: "Base L2" }, protocol: "MCP over JSON-RPC 2.0", transport: { endpoint: `${getBaseUrl(req)}/mcp`, method: "POST", contentType: "application/json" }, capabilities: { tools: {}, prompts: {}, resources: {}, logging: {} }, tools: profile.tools, prompts: profile.prompts, resources: profile.resources };
}

function executeTool(name, args, sid) {
  logEntry(sid, { type: "tool", name, arguments: args });
  if (name === "yield_scanner") return makeText(`Found 12 pools matching "${args.pool_type}" with APY > ${args.min_apy || 5}%. Top: Aerodrome USDC/ETH at 18.4% APY.`);
  if (name === "token_radar") return makeText(`Token ${args.token_address}: 2,341 holders, $1.8M liquidity, contract VERIFIED. Risk: Low.`);
  if (name === "portfolio_risk") return makeText(`Portfolio risk for ${args.wallet}: Score 32/100 (Conservative). Main exposure: ETH 45%, USDC 30%.`);
  if (name === "liquidity_heatmap") return makeText(`Heatmap for ${args.dex}: Highest concentration in ETH/USDC ($42M), followed by cbETH/ETH ($18M).`);
  if (name === "trend_pulse") return makeText(`Trend pulse (${args.timeframe}): Volume up 23%, 4 tokens showing breakout patterns. Top mover: AERO +12.5%.`);
  throw new Error(`Unknown tool: ${name}`);
}
function getPrompt(name, args = {}) {
  if (name === "yield_report") return { description: "Yield Report Generator", messages: [{ role: "user", content: { type: "text", text: `Compile a DeFi yield report from: ${args.pool_data || "{}"}` } }] };
  if (name === "risk_assessment") return { description: "Risk Narrative Builder", messages: [{ role: "user", content: { type: "text", text: `Write a portfolio risk assessment from: ${args.risk_data || "{}"}` } }] };
  throw new Error(`Unknown prompt: ${name}`);
}
function readResource(uri) {
  if (uri === "resource://onyxgrid/pool-registry") return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ pools: [{ pair: "ETH/USDC", tvl: "$42M", apy: "8.2%" }, { pair: "cbETH/ETH", tvl: "$18M", apy: "5.1%" }, { pair: "AERO/USDC", tvl: "$9M", apy: "24.7%" }] }, null, 2) }] };
  if (uri === "resource://onyxgrid/market-pulse") return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ volume24h: "$128M", topGainer: "AERO +12.5%", activeWallets: 34200, avgGasFee: "0.001 Gwei" }, null, 2) }] };
  throw new Error(`Unknown resource: ${uri}`);
}
function runA2A(agent, task, sid) {
  const fn = profile.agents[agent];
  if (!fn) throw new Error(`Unknown agent: ${agent}`);
  logEntry(sid, { type: "a2a", agent, task });
  return { agent, result: fn(task || "default"), status: "ok", profile: profile.id };
}

function handleRpc(req, res) {
  const { id = null, method, params = {} } = req.body || {};
  const sid = getSessionId(req);
  if (!method) return res.status(400).json(rpcError(id, -32600, "Missing method"));
  try {
    if (method === "initialize") return res.json(rpcSuccess(id, { protocolVersion: "2024-11-05", capabilities: { tools: {}, prompts: {}, resources: {} }, serverInfo: { name: profile.name, version: profile.version }, instructions: "Use tools/list to explore OnyxGrid DeFi capabilities." }));
    if (method === "ping") return res.json(rpcSuccess(id, { status: "alive" }));
    if (method === "notifications/initialized") return id === null ? res.status(202).end() : res.json(rpcSuccess(id, {}));
    if (method === "tools/list") return res.json(rpcSuccess(id, { tools: profile.tools }));
    if (method === "tools/call") return res.json(rpcSuccess(id, executeTool(params.name, params.arguments || {}, sid)));
    if (method === "prompts/list") return res.json(rpcSuccess(id, { prompts: profile.prompts }));
    if (method === "prompts/get") return res.json(rpcSuccess(id, getPrompt(params.name, params.arguments || {})));
    if (method === "resources/list") return res.json(rpcSuccess(id, { resources: profile.resources }));
    if (method === "resources/read") return res.json(rpcSuccess(id, readResource(params.uri)));
    return res.status(404).json(rpcError(id, -32601, `Method not found: ${method}`));
  } catch (e) { return res.status(400).json(rpcError(id, -32000, e instanceof Error ? e.message : "Error")); }
}

function buildUi() {
  const toolsHtml = profile.tools.map((t, i) => `<div class="card reveal" style="--d:${i * 0.1}s"><div class="card-num">${String(i + 1).padStart(2, "0")}</div><h3>${t.name}</h3><p>${t.description}</p></div>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${profile.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0a0a0a;--s1:rgba(255,255,255,.03);--b:rgba(255,255,255,.06);--bh:rgba(245,158,11,.3);--amber:#F59E0B;--gold:#FCD34D;--honey:#FBBF24;--dim:#78716c;--text:#fafaf9;--muted:#a8a29e;--mono:'JetBrains Mono',monospace;--sans:'Sora',sans-serif}
html{scroll-behavior:smooth}
body{font-family:var(--sans);background:var(--bg);color:var(--text);overflow-x:hidden;min-height:100vh}

/* Grid BG */
.grid-bg{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(245,158,11,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,.04) 1px,transparent 1px);background-size:60px 60px;animation:gridShift 30s linear infinite}
@keyframes gridShift{0%{background-position:0 0}100%{background-position:60px 60px}}
.glow-orb{position:fixed;border-radius:50%;filter:blur(140px);opacity:.1;pointer-events:none;z-index:0}
.go1{width:500px;height:500px;background:var(--amber);top:-5%;right:-5%;animation:float1 22s ease-in-out infinite alternate}
.go2{width:400px;height:400px;background:var(--gold);bottom:-10%;left:10%;animation:float1 28s ease-in-out infinite alternate-reverse}
@keyframes float1{0%{transform:translate(0,0)}100%{transform:translate(-30px,25px)}}

.wrap{position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:60px 24px 100px}

/* Nav */
.nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:80px;opacity:0;animation:fadeIn .5s .1s forwards}
.logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:20px;letter-spacing:-.03em}
.logo-icon{width:28px;height:28px;border:2px solid var(--amber);transform:rotate(45deg);position:relative}
.logo-icon::after{content:'';position:absolute;inset:4px;background:var(--amber);opacity:.3}
.nav-links a{color:var(--muted);text-decoration:none;font-size:13px;font-weight:600;margin-left:20px;transition:color .2s}
.nav-links a:hover{color:var(--amber)}
@keyframes fadeIn{to{opacity:1}}

/* Hero */
.hero{text-align:center;margin-bottom:100px}
.hero-pill{display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:999px;border:1px solid var(--bh);background:rgba(245,158,11,.06);font-size:12px;font-weight:700;color:var(--amber);text-transform:uppercase;letter-spacing:.12em;margin-bottom:24px;opacity:0;animation:slideUp .6s .15s forwards}
.hero-pill .pulse{width:6px;height:6px;border-radius:50%;background:var(--amber);animation:blink 1.5s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.hero h1{font-size:clamp(40px,7vw,72px);font-weight:800;line-height:1;letter-spacing:-.04em;margin-bottom:20px;opacity:0;animation:slideUp .7s .25s forwards}
.hero h1 span{background:linear-gradient(135deg,var(--gold),var(--amber));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{max-width:560px;margin:0 auto 36px;font-size:16px;color:var(--muted);opacity:0;animation:slideUp .7s .35s forwards}
.hero-btns{display:flex;justify-content:center;gap:14px;flex-wrap:wrap;opacity:0;animation:slideUp .7s .45s forwards}
@keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}

/* Buttons */
.btn{padding:13px 28px;border:0;border-radius:12px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;text-decoration:none;transition:all .3s}
.btn-gold{background:linear-gradient(135deg,var(--amber),var(--gold));color:#0a0a0a;box-shadow:0 4px 20px rgba(245,158,11,.25)}
.btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(245,158,11,.4)}
.btn-outline{background:transparent;color:var(--muted);border:1px solid var(--b)}
.btn-outline:hover{color:var(--amber);border-color:var(--bh)}

/* Counter Stats */
.counters{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--b);border-radius:20px;overflow:hidden;margin-bottom:80px}
.counter{background:var(--bg);padding:36px 20px;text-align:center;transition:background .3s}
.counter:hover{background:rgba(245,158,11,.03)}
.counter-val{font-family:var(--mono);font-size:36px;font-weight:700;color:var(--gold);letter-spacing:-.02em}
.counter-lbl{font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.12em;margin-top:6px;font-weight:600}

/* Sections */
.section{margin-bottom:60px}
.sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.sec-head h2{font-size:20px;font-weight:800;letter-spacing:-.01em}
.pill{padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.pill-amber{color:var(--amber);border:1px solid rgba(245,158,11,.2);background:rgba(245,158,11,.06)}
.pill-green{color:#34d399;border:1px solid rgba(52,211,153,.2);background:rgba(52,211,153,.06)}

/* Glass */
.glass{background:rgba(255,255,255,.02);border:1px solid var(--b);border-radius:18px;padding:24px;backdrop-filter:blur(10px);transition:all .3s}
.glass:hover{border-color:var(--bh);box-shadow:0 0 40px rgba(245,158,11,.04)}

/* Lane */
.lanes{display:flex;flex-direction:column;gap:10px}
.lane{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-radius:14px;border:1px solid var(--b);transition:all .3s;background:rgba(0,0,0,.2)}
.lane:hover{border-color:var(--bh);transform:translateX(4px);background:rgba(245,158,11,.03)}
.lane strong{font-size:14px;font-weight:700}
.lane p{font-size:12px;color:var(--muted);margin-top:2px}
.spill{display:flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap}
.spill::before{content:'';width:7px;height:7px;border-radius:50%}
.sp-live{color:#34d399;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.15)}.sp-live::before{background:#34d399;box-shadow:0 0 6px #34d399;animation:blink 2s infinite}
.sp-scan{color:var(--amber);background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.15)}.sp-scan::before{background:var(--amber)}
.sp-idle{color:#93c5fd;background:rgba(147,197,253,.08);border:1px solid rgba(147,197,253,.15)}.sp-idle::before{background:#93c5fd}

/* Endpoints */
.ep-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}
.ep{padding:18px;border-radius:14px;border:1px solid var(--b);background:rgba(0,0,0,.3);transition:all .3s}
.ep:hover{border-color:var(--amber);transform:translateY(-2px)}
.ep-lbl{font-size:10px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px}
.ep code{display:block;font-family:var(--mono);font-size:13px;color:var(--gold);padding:8px 12px;border-radius:8px;background:rgba(245,158,11,.05)}

/* Tool Cards */
.tools{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}
.card{padding:28px;border-radius:18px;border:1px solid var(--b);background:rgba(255,255,255,.01);transition:all .4s;position:relative;overflow:hidden}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--amber),transparent);opacity:0;transition:opacity .4s}
.card:hover{border-color:var(--bh);transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.3)}
.card:hover::before{opacity:1}
.card-num{font-family:var(--mono);font-size:12px;color:var(--dim);margin-bottom:12px}
.card h3{font-size:15px;font-weight:700;margin-bottom:6px;color:var(--gold)}
.card p{font-size:13px;color:var(--muted)}

/* Console */
.con-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.con-bar button{font-family:var(--mono);padding:9px 18px;border:1px solid var(--b);border-radius:8px;background:rgba(0,0,0,.4);color:var(--muted);font-size:12px;font-weight:500;cursor:pointer;transition:all .2s}
.con-bar button:hover{border-color:var(--amber);color:var(--amber);background:rgba(245,158,11,.06)}
.con-out{min-height:200px;max-height:360px;overflow:auto;padding:18px;border-radius:14px;background:#050505;color:#78716c;font-family:var(--mono);font-size:13px;line-height:1.7;border:1px solid var(--b)}

/* Reveal */
.reveal{opacity:0;transform:translateY(20px);transition:opacity .6s,transform .6s;transition-delay:var(--d,0s)}
.reveal.vis{opacity:1;transform:translateY(0)}

@media(max-width:900px){.counters{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.wrap{padding:32px 16px}.counters{grid-template-columns:1fr}.hero h1{font-size:36px}}
</style>
</head>
<body>
<div class="grid-bg"></div>
<div class="glow-orb go1"></div>
<div class="glow-orb go2"></div>

<div class="wrap">
  <nav class="nav">
    <div class="logo"><div class="logo-icon"></div>OnyxGrid</div>
    <div class="nav-links"><a href="/.well-known/agent-card.json" target="_blank">A2A</a><a href="/health" target="_blank">Health</a><a href="#console">Console</a></div>
  </nav>

  <section class="hero">
    <div class="hero-pill"><span class="pulse"></span>DeFi Intelligence · Base L2</div>
    <h1>Yield Tracking,<br><span>Precision Engineered.</span></h1>
    <p>${profile.description}</p>
    <div class="hero-btns">
      <a class="btn btn-gold" href="#console">Open Terminal</a>
      <a class="btn btn-outline" href="/.well-known/agent-card.json" target="_blank">Agent Card →</a>
    </div>
  </section>

  <div class="counters reveal" style="--d:.1s">
    <div class="counter"><div class="counter-val">${Object.keys(profile.agents).length}</div><div class="counter-lbl">Agents</div></div>
    <div class="counter"><div class="counter-val">${profile.tools.length}</div><div class="counter-lbl">Tools</div></div>
    <div class="counter"><div class="counter-val">${profile.prompts.length}</div><div class="counter-lbl">Prompts</div></div>
    <div class="counter"><div class="counter-val">${profile.resources.length}</div><div class="counter-lbl">Resources</div></div>
  </div>

  <section class="section reveal" style="--d:.15s">
    <div class="sec-head"><h2>Operational Lanes</h2><span class="pill pill-green">Active</span></div>
    <div class="glass"><div class="lanes">
      <div class="lane"><div><strong>Yield Scanner</strong><p>Scanning Aerodrome, Uniswap, BaseSwap pools</p></div><span class="spill sp-live">Scanning</span></div>
      <div class="lane"><div><strong>Risk Engine</strong><p>Multi-factor portfolio risk scoring</p></div><span class="spill sp-scan">Processing</span></div>
      <div class="lane"><div><strong>Report Builder</strong><p>Compiling DeFi analytics into narratives</p></div><span class="spill sp-idle">Ready</span></div>
    </div></div>
  </section>

  <section class="section reveal" style="--d:.2s">
    <div class="sec-head"><h2>Endpoints</h2><span class="pill pill-amber">Routes</span></div>
    <div class="ep-row">
      <div class="ep"><div class="ep-lbl">Identity</div><code>/.well-known/agent-card.json</code></div>
      <div class="ep"><div class="ep-lbl">Health</div><code>/health</code></div>
      <div class="ep"><div class="ep-lbl">MCP</div><code>/mcp</code></div>
      <div class="ep"><div class="ep-lbl">A2A</div><code>/a2a</code></div>
    </div>
  </section>

  <section class="section">
    <div class="sec-head reveal" style="--d:.05s"><h2>Tools</h2><span class="pill pill-amber">MCP</span></div>
    <div class="tools">${toolsHtml}</div>
  </section>

  <section class="section reveal" style="--d:.1s" id="console">
    <div class="sec-head"><h2>Terminal</h2><span class="pill pill-amber">JSON-RPC</span></div>
    <div class="glass">
      <div class="con-bar">
        <button id="initBtn">init</button><button id="tlBtn">tools/list</button><button id="tcBtn">yield_scanner</button><button id="a2aBtn">a2a/scan</button>
      </div>
      <pre class="con-out" id="out">onyxgrid> awaiting command...</pre>
    </div>
  </section>
</div>

<script>
const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target)}})},{threshold:.15});
document.querySelectorAll('.reveal').forEach(e=>obs.observe(e));
document.querySelectorAll('.card').forEach(c=>{c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');c.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%')})});
async function rpc(body,ep='/mcp'){const r=await fetch(ep,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return r.json()}
async function run(fn){document.getElementById('out').textContent='onyxgrid> processing...';try{const d=await fn();document.getElementById('out').textContent='onyxgrid> '+JSON.stringify(d,null,2)}catch(e){document.getElementById('out').textContent='onyxgrid> error: '+e.message}}
document.getElementById('initBtn').onclick=()=>run(()=>rpc({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'onyx-ui',version:'1.0.0'}}}));
document.getElementById('tlBtn').onclick=()=>run(()=>rpc({jsonrpc:'2.0',id:2,method:'tools/list'}));
document.getElementById('tcBtn').onclick=()=>run(()=>rpc({jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'yield_scanner',arguments:{pool_type:'stable',min_apy:5}}}));
document.getElementById('a2aBtn').onclick=()=>run(()=>fetch('/a2a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({agent:'scanner',task:'Full Base pool sweep'})}).then(r=>r.json()));
</script>
</body>
</html>`;
}

app.get("/.well-known/agent-card.json", (req, res) => res.json(buildAgentCard(req)));
app.get("/health", (req, res) => res.json({ status: "healthy", timestamp: new Date().toISOString(), agent: profile.id }));
app.get("/mcp", (req, res) => res.json(getOverview(req)));
app.post("/mcp", (req, res) => { if (req.body?.jsonrpc === "2.0") return handleRpc(req, res); const sid = getSessionId(req); try { const r = executeTool(req.body?.tool || profile.tools[0].name, req.body?.input || {}, sid); return res.json({ output: { profile: profile.id, result: r.content[0].text, agent: profile.name } }); } catch { return res.status(400).json({ output: { profile: profile.id, result: "Error", agent: profile.name } }); } });
app.get("/resources/:name", (req, res) => { const r = profile.resources.find(i => i.name === req.params.name); if (!r) return res.status(404).json({ error: "Not found" }); return res.json(JSON.parse(readResource(r.uri).contents[0].text)); });
app.post("/a2a", (req, res) => { try { res.json(runA2A(req.body?.agent, req.body?.task, getSessionId(req))); } catch (e) { res.status(400).json({ error: e instanceof Error ? e.message : "A2A failed" }); } });
app.get("/", (req, res) => res.send(buildUi()));

if (process.env.NODE_ENV !== "production") { const PORT = process.env.PORT || 3000; app.listen(PORT, () => console.log(`OnyxGrid on http://localhost:${PORT}`)); }
export default app;
