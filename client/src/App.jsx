import React, { useState, useEffect } from 'react';
import { Cpu, GitPullRequest, AlertCircle, ShieldAlert, Sparkles, Search, Server, Plus, Trash2, RotateCcw, CheckCircle2, Activity, FileText, Gauge, Boxes, Siren } from 'lucide-react';
import { fetchReportsHybrid, subscribeRealtimeReports, resetReportsHybrid, createReportHybrid, deleteReportHybrid } from './services/intelligenceClient';
import { Backdrop, Splash, Spot, Ring, Count, stagger } from './premium';

const RISK_BADGE = {
  'High Risk': 'risk risk-high',
  Moderate: 'risk risk-mid',
  Healthy: 'risk risk-ok',
};

const healthColors = (s) => (s >= 80 ? ['#34d399', '#22d3ee'] : s >= 60 ? ['#fbbf24', '#fb923c'] : ['#fb7185', '#f43f5e']);

export default function App() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState('repo-101');
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [backendConnected, setBackendConnected] = useState(false);
  const [repoName, setRepoName] = useState('');
  const [language, setLanguage] = useState('TypeScript');
  const [commitMessage, setCommitMessage] = useState('');
  const [prCount, setPrCount] = useState(14);
  const [openIssues, setOpenIssues] = useState(3);
  const [deployFreq, setDeployFreq] = useState('Daily');
  const [owner, setOwner] = useState('Sasidhar');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await fetchReportsHybrid();
      setItems(r.items); setBackendConnected(r.backendConnected);
      if (r.items[0]) setSelectedId(r.items[0].id);
    })();
    const unsub = subscribeRealtimeReports((liveItems, connected) => { setItems(liveItems); setBackendConnected(connected); });
    return () => unsub();
  }, []);

  const selected = items.find((x) => x.id === selectedId) || items[0] || null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!repoName.trim()) return;
    const r = await createReportHybrid({ repoName, language, commitMessage, prCount, openIssues, deployFreq, owner });
    if (r.item) { setSelectedId(r.item.id); setRepoName(''); setCommitMessage(''); setShowForm(false); }
    setBackendConnected(r.backendConnected);
  };

  const handleDelete = async (id) => {
    const r = await deleteReportHybrid(id);
    setBackendConnected(r.backendConnected);
    if (Array.isArray(r.items)) { setItems(r.items); setSelectedId(r.items[0]?.id || null); }
  };

  const handleReset = async () => {
    const r = await resetReportsHybrid();
    setItems(r.items); setBackendConnected(r.backendConnected);
    if (r.items[0]) setSelectedId(r.items[0].id);
  };

  const filtered = items.filter((item) => {
    const okRisk = riskFilter === 'All' || item.riskLevel === riskFilter;
    const q = search.trim().toLowerCase();
    const okQ = !q || item.repoName.toLowerCase().includes(q) || item.language.toLowerCase().includes(q) || item.owner.toLowerCase().includes(q);
    return okRisk && okQ;
  });

  const avgHealth = items.length ? Math.round(items.reduce((a, b) => a + (b.healthScore || 75), 0) / items.length) : 0;
  const totalPrs = items.reduce((a, b) => a + (b.prCount || 0), 0);
  const highRiskCount = items.filter((x) => x.riskLevel === 'High Risk').length;

  const selHealth = selected ? Math.max(0, Math.min(100, Number(selected.healthScore) || 0)) : 0;
  const selRisk = selected ? Math.max(0, Math.min(100, Number(selected.riskScore) || 0)) : 0;

  return (
    <>
      <Backdrop />
      <Splash icon={<Cpu />} title="DevPulse Intelligence" subtitle="Engineering velocity, PR throughput & AI release-risk scoring" />
      <div className="app-shell text-[15px]">
        <header className="hdr">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-10 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="brand-mark"><Cpu className="w-6 h-6" /></div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold">DevPulse <span className="grad-text">Intelligence</span></h1>
                  <span className="hidden sm:inline-flex chip" style={{ color: '#a5f3fc', borderColor: 'rgba(34,211,238,.35)', background: 'rgba(34,211,238,.08)' }}><span className="live-dot" style={{ '--dot': '34, 211, 238' }} /><Activity className="w-3.5 h-3.5" /> Live Telemetry</span>
                </div>
                <p className="text-sm mut mt-0.5">Engineering velocity, PR throughput & AI release-risk scoring</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button onClick={handleReset} className="btn btn-ghost"><RotateCcw className="w-4 h-4" /> Reset</button>
              <span className="chip" style={backendConnected ? { color: '#6ee7b7', borderColor: 'rgba(16,185,129,.4)', background: 'rgba(16,185,129,.1)', padding: '.6rem 1rem', fontSize: '.8rem' } : { color: 'var(--mut)', padding: '.6rem 1rem', fontSize: '.8rem' }}>
                {backendConnected && <span className="live-dot" />}<Server className="w-4 h-4" />{backendConnected ? 'API Connected' : 'Local Cache'}
              </span>
              <button onClick={() => setShowForm((v) => !v)} className="btn btn-primary"><Plus className="w-4 h-4 stroke-[2.5]" /> Analyze Repo</button>
            </div>
          </div>
        </header>

        <main className="max-w-[1440px] mx-auto px-5 sm:px-10 py-8 space-y-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Spot className="glass kpi rise" style={stagger(0, 90, 150)}>
              <div className="flex items-center justify-between"><div className="eyebrow">Tracked Repositories</div><div className="kpi-icon"><Boxes className="w-5 h-5" /></div></div>
              <div className="kpi-num mt-3"><Count value={items.length} /></div>
              <div className="text-sm mut mt-1">Active engineering services</div>
              <div className="dots">{items.slice(0, 18).map((it, i) => <i key={it.id} style={stagger(i, 45, 500)} />)}</div>
            </Spot>
            <Spot className="glass kpi rise" style={stagger(1, 90, 150)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="eyebrow">Mean Health Index</div>
                  <div className="kpi-num mt-3 grad-text"><Count value={avgHealth} /><span className="text-base font-semibold mut"> / 100</span></div>
                  <div className="text-sm mut mt-1">Code & release stability</div>
                </div>
                <Ring value={avgHealth} size={78} stroke={8} colors={healthColors(avgHealth)}><Gauge className="w-5 h-5 mut" /></Ring>
              </div>
            </Spot>
            <Spot className="glass kpi rise" style={stagger(2, 90, 150)}>
              <div className="flex items-center justify-between"><div className="eyebrow">Sprint Pull Requests</div><div className="kpi-icon"><GitPullRequest className="w-5 h-5" /></div></div>
              <div className="kpi-num mt-3"><Count value={totalPrs} /></div>
              <div className="text-sm mut mt-1">Merged & active PRs</div>
              <div className="kpi-bar"><i className="bar-grow" style={{ width: `${Math.min(100, totalPrs)}%` }} /></div>
            </Spot>
            <Spot className={`glass kpi rise ${highRiskCount > 0 ? 'kpi-alert' : ''}`} style={stagger(3, 90, 150)}>
              <div className="flex items-center justify-between"><div className="eyebrow">High-Risk Alerts</div><div className="kpi-icon" style={{ background: 'rgba(244,63,94,.14)', borderColor: 'rgba(244,63,94,.35)', color: '#fda4af' }}><Siren className="w-5 h-5" /></div></div>
              <div className="kpi-num mt-3" style={{ color: '#fb7185' }}><Count value={highRiskCount} /></div>
              <div className="text-sm mut mt-1 flex items-center gap-2">{highRiskCount > 0 && <span className="live-dot" style={{ '--dot': '244, 63, 94', background: '#f43f5e' }} />}Needs pre-release review</div>
            </Spot>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="glass aura form-card space-y-4 modal" style={{ borderRadius: 24 }}>
              <div className="flex items-center justify-between"><h2 className="text-base sm:text-lg font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 ai-spark" /> Run AI Release & Risk Assessment</h2><button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm">Close</button></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <input type="text" required value={repoName} onChange={(e) => setRepoName(e.target.value)} placeholder="org/repo-name (e.g., torstaq/auth-api)" className="field" />
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="field"><option>TypeScript</option><option>Node.js</option><option>Python</option><option>Go</option><option>React</option></select>
                <select value={owner} onChange={(e) => setOwner(e.target.value)} className="field"><option>Sasidhar</option><option>Vijaysimha</option></select>
              </div>
              <input type="text" value={commitMessage} onChange={(e) => setCommitMessage(e.target.value)} placeholder="Latest commit or PR summary (e.g., Hotfix auth token expiry & DB migration)..." className="field" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div><label className="eyebrow block mb-1.5">Pull Requests</label><input type="number" min={0} value={prCount} onChange={(e) => setPrCount(e.target.value)} className="field" /></div>
                <div><label className="eyebrow block mb-1.5">Open Issues</label><input type="number" min={0} value={openIssues} onChange={(e) => setOpenIssues(e.target.value)} className="field" /></div>
                <div><label className="eyebrow block mb-1.5">Deploy Cadence</label><select value={deployFreq} onChange={(e) => setDeployFreq(e.target.value)} className="field"><option>Daily</option><option>Multiple / day</option><option>Weekly</option></select></div>
              </div>
              <div className="flex justify-end"><button type="submit" className="btn btn-primary">Generate Intelligence Report</button></div>
            </form>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 rise" style={stagger(0, 80, 450)}>
                <div className="relative flex-1"><Search className="w-4 h-4 mut absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search repositories or owners..." className="field" style={{ paddingLeft: '2.6rem' }} /></div>
                <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="field sm:w-40"><option value="All">All Risks</option><option value="High Risk">High Risk</option><option value="Moderate">Moderate</option><option value="Healthy">Healthy</option></select>
              </div>
              <div className="space-y-3">
                {filtered.map((item, i) => {
                  const active = selected?.id === item.id;
                  const hs = Math.max(0, Math.min(100, Number(item.healthScore) || 0));
                  return (
                    <Spot as="button" key={item.id} onClick={() => setSelectedId(item.id)} className={`glass repo-item rise ${active ? 'is-active aura' : ''}`} style={stagger(i, 70, 520)}>
                      <Ring value={hs} size={54} stroke={6} colors={healthColors(hs)}><span className="num">{hs}</span></Ring>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between gap-2"><span className={RISK_BADGE[item.riskLevel] || RISK_BADGE.Moderate}>{item.riskLevel} · {item.riskScore}</span><span className="lang">{item.language}</span></div>
                        <div className="text-base font-semibold truncate">{item.repoName}</div>
                        <div className="flex items-center justify-between text-xs sm:text-sm mut"><span>Lead: <strong style={{ color: 'var(--ink)' }}>{item.owner}</strong></span><span>Health: <strong style={{ color: 'var(--ink)' }}>{item.healthScore}/100</strong></span></div>
                      </div>
                    </Spot>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-7">
              {selected ? (
                <div key={selected.id} className="glass aura panel swap space-y-6">
                  <div className="flex items-start justify-between gap-4 pb-5" style={{ borderBottom: '1px solid var(--line)' }}>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm mut"><span className="mono font-bold" style={{ color: '#a5b4fc' }}>{selected.language}</span><span>·</span><span>Owner: <strong style={{ color: 'var(--ink)' }}>{selected.owner}</strong></span><span>·</span><span>Deploy cadence: <strong style={{ color: 'var(--ink)' }}>{selected.deployFreq}</strong></span></div>
                      <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-words">{selected.repoName}</h2>
                      {selected.commitMessage && <p className="text-xs sm:text-sm mut mt-1.5">Latest signal: <span className="mono" style={{ color: 'var(--ink)' }}>{selected.commitMessage}</span></p>}
                    </div>
                    <button onClick={() => handleDelete(selected.id)} className="btn btn-danger btn-sm shrink-0"><Trash2 className="w-4 h-4" /> Remove</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center">
                    <div className="flex justify-center">
                      <Ring value={selHealth} size={156} stroke={13} colors={healthColors(selHealth)}>
                        <div>
                          <div className="tile-num" style={{ fontSize: '2.6rem' }}><Count value={selHealth} /></div>
                          <div className="eyebrow" style={{ marginTop: 2 }}>Health</div>
                        </div>
                      </Ring>
                    </div>
                    <div className="space-y-5">
                      <div className="grid grid-cols-3 gap-3 sm:gap-4">
                        <div className="tile"><div className="text-xs font-semibold mut inline-flex items-center gap-1.5"><GitPullRequest className="w-4 h-4" style={{ color: '#a5b4fc' }} /> Pull Requests</div><div className="tile-num mt-1.5"><Count value={selected.prCount} /></div></div>
                        <div className="tile"><div className="text-xs font-semibold mut inline-flex items-center gap-1.5"><AlertCircle className="w-4 h-4" style={{ color: '#fbbf24' }} /> Open Issues</div><div className="tile-num mt-1.5"><Count value={selected.openIssues} /></div></div>
                        <div className="tile"><div className="text-xs font-semibold mut inline-flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" style={{ color: '#fb7185' }} /> Risk Score</div><div className="tile-num mt-1.5"><Count value={selected.riskScore} /><span className="text-sm font-semibold mut"> / 100</span></div></div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between eyebrow mb-2.5"><span>Release risk meter</span><span className={RISK_BADGE[selected.riskLevel] || RISK_BADGE.Moderate}>{selected.riskLevel}</span></div>
                        <div className="meter"><i className="meter-mask" style={{ transform: `scaleX(${(100 - selRisk) / 100})` }} /><i className="meter-pin" style={{ left: `${selRisk}%` }} /></div>
                      </div>
                    </div>
                  </div>

                  <div className="ai-card space-y-2.5">
                    <div className="eyebrow flex items-center gap-1.5" style={{ color: '#c4b5fd' }}><Sparkles className="w-4 h-4 ai-spark" /> AI Synthesis</div>
                    <p className="text-sm sm:text-base leading-relaxed relative z-[1]" style={{ color: '#e6e9fb' }}>{selected.aiSummary}</p>
                  </div>

                  {selected.releaseNote && (
                    <div className="sub-card space-y-1.5">
                      <div className="eyebrow flex items-center gap-1.5"><FileText className="w-4 h-4" style={{ color: '#a5b4fc' }} /> Release Note Draft</div>
                      <p className="text-xs sm:text-sm mono leading-relaxed" style={{ color: '#cbd2ea' }}>{selected.releaseNote}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="sub-card space-y-3">
                      <h3 className="eyebrow">Detected Telemetry Signals</h3>
                      <ul className="space-y-2.5 text-sm" style={{ color: '#d5daf0' }}>{(selected.riskSignals || []).map((sig, i) => <li key={i} className="flex items-start gap-2.5 slide-left" style={stagger(i, 90, 250)}><CheckCircle2 className="w-4 h-4 sig-ic mt-0.5" /><span>{sig}</span></li>)}</ul>
                    </div>
                    <div className="sub-card space-y-3">
                      <h3 className="eyebrow">Actionable Engineering Playbook</h3>
                      <ul className="space-y-2.5 text-sm" style={{ color: '#d5daf0' }}>{(selected.recommendations || []).map((rec, i) => <li key={i} className="flex items-start gap-2.5 slide-left" style={stagger(i, 90, 350)}><span className="step-n mono">{i + 1}</span><span>{rec}</span></li>)}</ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass rounded-3xl p-12 text-center text-sm mut rise">Select a repository to inspect its AI intelligence report.</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
