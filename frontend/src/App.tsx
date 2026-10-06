import { useEffect, useState } from 'react';
import { Activity, Bell, Box, CheckCircle2, ChevronRight, CircleAlert, Cpu, Database, LayoutDashboard, Menu, RefreshCw, Server, Settings, Wifi, X } from 'lucide-react';

type ServerItem = { id: number; name: string; hostname: string; ipAddress: string; status: string; cpuUsage: number; memoryUsage: number; diskUsage: number; uptime: string };
type ServiceItem = { id: number; name: string; status: string; responseTime: number; lastCheck?: string };
type Dashboard = { serversOnline: number; serversTotal: number; servicesOnline: number; servicesTotal: number; averageCpu: number; averageMemory: number; servers: ServerItem[]; services: ServiceItem[]; alerts: { title: string; detail: string; severity: string; time: string }[] };

const fallback: Dashboard = { serversOnline: 3, serversTotal: 4, servicesOnline: 5, servicesTotal: 6, averageCpu: 30, averageMemory: 52, servers: [], services: [], alerts: [] };

function App() {
  const [data, setData] = useState<Dashboard>(fallback);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [serverFormOpen, setServerFormOpen] = useState(false);
  const [serverForm, setServerForm] = useState({ name: '', hostname: '', ipAddress: '' });
  const [serviceFormOpen, setServiceFormOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({ name: '', url: '', serverId: '' });
  const [serverFormError, setServerFormError] = useState('');
  const [serviceFormError, setServiceFormError] = useState('');
  const [submittingForm, setSubmittingForm] = useState<'server' | 'service' | null>(null);
  const refresh = () => { setLoading(true); fetch('/api/dashboard').then(r => { if (!r.ok) throw new Error('API error'); return r.json(); }).then(result => { setData(result); setApiError(false); }).catch(() => setApiError(true)).finally(() => setLoading(false)); };
  useEffect(() => { refresh(); const interval = window.setInterval(refresh, 30000); return () => window.clearInterval(interval); }, []);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || submittingForm) return;
      setServerFormOpen(false);
      setServiceFormOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [submittingForm]);
  const onlineServerPct = data.serversTotal ? Math.round((data.serversOnline / data.serversTotal) * 100) : 0;
  const onlineServicePct = data.servicesTotal ? Math.round((data.servicesOnline / data.servicesTotal) * 100) : 0;
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
  const submitServer = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerFormError('');
    if (!serverForm.name.trim() || !serverForm.ipAddress.trim()) {
      setServerFormError('Enter a server name and IP address.');
      return;
    }
    setSubmittingForm('server');
    try {
      const response = await fetch('/api/servers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(serverForm) });
      if (!response.ok) throw new Error('The server could not be added. Check the details and try again.');
      setServerForm({ name: '', hostname: '', ipAddress: '' });
      setServerFormOpen(false);
      refresh();
    } catch (error) {
      setServerFormError(error instanceof Error ? error.message : 'The server could not be added.');
    } finally {
      setSubmittingForm(null);
    }
  };
  const submitService = async (event: React.FormEvent) => {
    event.preventDefault();
    setServiceFormError('');
    if (!serviceForm.name.trim() || !serviceForm.url.trim() || !serviceForm.serverId) {
      setServiceFormError('Complete every field before adding the service.');
      return;
    }
    setSubmittingForm('service');
    try {
      const response = await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: serviceForm.name, url: serviceForm.url, serverId: Number(serviceForm.serverId) }) });
      if (!response.ok) throw new Error('The service could not be added. Check the endpoint and try again.');
      setServiceForm({ name: '', url: '', serverId: '' });
      setServiceFormOpen(false);
      refresh();
    } catch (error) {
      setServiceFormError(error instanceof Error ? error.message : 'The service could not be added.');
    } finally {
      setSubmittingForm(null);
    }
  };
  return <div className="app-shell">
    <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
      <div className="brand"><div className="brand-mark"><Activity size={19}/></div><span>homelab<span className="accent">.</span></span><button className="close-menu" onClick={() => setMenuOpen(false)}><X size={18}/></button></div>
      <nav><p className="nav-label">Workspace</p><a className="active"><LayoutDashboard size={18}/>Overview</a><a><Server size={18}/>Servers</a><a><Wifi size={18}/>Services</a><a><Box size={18}/>Containers</a><a><Activity size={18}/>Metrics</a><p className="nav-label second">Manage</p><a><Bell size={18}/>Alerts<span className="nav-badge">2</span></a><a><Settings size={18}/>Settings</a></nav>
      <div className="sidebar-footer"><div className="connection-dot"></div><div><strong>All systems monitored</strong><span>Updated just now</span></div></div>
    </aside>
    <main className="main"><header><button className="menu-button" onClick={() => setMenuOpen(true)}><Menu size={21}/></button><div><p className="eyebrow">{today}</p><h1>Good evening, Alex<span className="accent">.</span></h1></div><div className="header-actions"><button className="icon-button refresh-button" onClick={refresh} title="Refresh dashboard"><RefreshCw size={17} className={loading ? 'spin' : ''}/></button><button className="icon-button"><Bell size={19}/><i></i></button><div className="avatar">A</div></div></header>
      <section className="hero"><div><span className={apiError ? 'status-pill error' : 'status-pill'}><span></span>{apiError ? 'API unavailable' : 'System overview'}</span><h2>Your homelab at a glance</h2><p>Monitor the health and performance of your infrastructure.</p></div><div className="last-sync"><span>Last sync</span><strong>{loading ? 'Updating…' : 'Just now'} <CheckCircle2 size={15}/></strong></div></section>
      <section className="stats-grid"><Stat icon={<Server/>} label="Servers" value={`${data.serversOnline} / ${data.serversTotal}`} caption="online" progress={onlineServerPct} color="purple"/><Stat icon={<Wifi/>} label="Services" value={`${data.servicesOnline} / ${data.servicesTotal}`} caption="operational" progress={onlineServicePct} color="blue"/><Stat icon={<Cpu/>} label="Avg. CPU usage" value={`${data.averageCpu}%`} caption="across servers" progress={data.averageCpu} color="orange"/><Stat icon={<Database/>} label="Avg. memory" value={`${data.averageMemory}%`} caption="across servers" progress={data.averageMemory} color="green"/></section>
      <section className="content-grid"><div className="panel"><div className="panel-title"><h3>Server status</h3><button onClick={() => { setServerFormError(''); setServerFormOpen(true); }}>Add server<ChevronRight size={15}/></button></div><div className="server-list">{data.servers.map(server => <div className="server-row" key={server.id}><div className={`server-icon ${statusTone(server.status)}`}><Server size={18}/></div><div className="server-name"><strong>{server.name}</strong><span>{server.ipAddress}</span></div><div className="server-metric"><span>CPU</span><strong>{server.cpuUsage}%</strong></div><div className="server-metric memory"><span>Memory</span><strong>{server.memoryUsage}%</strong></div><div className={`online-label ${statusTone(server.status)}`}><span></span>{server.status}</div><ChevronRight size={17} className="row-arrow"/></div>)}</div>{data.servers.length === 0 && <div className="empty">No servers registered yet.</div>}</div>
      <div className="panel"><PanelTitle title="Recent alerts" action="View all alerts"/><div className="alert-list">{data.alerts.map(alert => <div className="alert-row" key={alert.title}><div className={`alert-icon ${alert.severity}`}><CircleAlert size={17}/></div><div><strong>{alert.title}</strong><span>{alert.detail}</span></div><time>{alert.time}</time></div>)}</div>{data.alerts.length === 0 && <div className="empty">No recent alerts</div>}</div></section>
      <section className="panel services-panel"><div className="panel-title"><h3>Services</h3><button onClick={() => { setServiceFormError(''); setServiceFormOpen(true); }}>Add service<ChevronRight size={15}/></button></div><div className="services-grid">{data.services.map(service => <div className="service-card" key={service.id}><div className="service-top"><div className="service-logo">{service.name.slice(0,1)}</div><span className={`service-status ${statusTone(service.status)}`}><span></span>{service.status}</span></div><strong>{service.name}</strong><span className="response">{service.status === 'Online' ? `${service.responseTime}ms response time` : service.status === 'Offline' ? 'Check required' : 'Check pending'}</span><small className="last-check">{service.lastCheck ? `Checked ${formatRelativeTime(service.lastCheck)}` : 'Waiting for first check'}</small></div>)}</div>{data.services.length === 0 && <div className="empty">No services registered yet.</div>}</section>
      {serverFormOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target && !submittingForm) setServerFormOpen(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="server-form-title"><div className="modal-header"><h2 id="server-form-title">Add a server</h2><button className="modal-close" type="button" onClick={() => setServerFormOpen(false)} aria-label="Close server form" disabled={submittingForm === 'server'}><X size={18}/></button></div><p className="modal-description">Register a machine so its services and metrics have a home.</p><form onSubmit={submitServer}><label>Server name<input autoFocus required value={serverForm.name} onChange={event => setServerForm({ ...serverForm, name: event.target.value })} placeholder="e.g. TrueNAS" /></label><label>Hostname <span className="optional">Optional</span><input value={serverForm.hostname} onChange={event => setServerForm({ ...serverForm, hostname: event.target.value })} placeholder="truenas.local" /></label><label>IP address<input required inputMode="decimal" value={serverForm.ipAddress} onChange={event => setServerForm({ ...serverForm, ipAddress: event.target.value })} placeholder="192.168.1.10" /></label>{serverFormError && <p className="form-error" role="alert">{serverFormError}</p>}<div className="modal-actions"><button type="button" className="button secondary" onClick={() => setServerFormOpen(false)} disabled={submittingForm === 'server'}>Cancel</button><button type="submit" className="button primary" disabled={submittingForm === 'server'}>{submittingForm === 'server' ? 'Adding server…' : 'Add server'}</button></div></form></section></div>}
      {serviceFormOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target && !submittingForm) setServiceFormOpen(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="service-form-title"><div className="modal-header"><h2 id="service-form-title">Add a service</h2><button className="modal-close" type="button" onClick={() => setServiceFormOpen(false)} aria-label="Close service form" disabled={submittingForm === 'service'}><X size={18}/></button></div><p className="modal-description">Add an endpoint to monitor in your homelab.</p><form onSubmit={submitService}><label>Service name<input autoFocus required value={serviceForm.name} onChange={event => setServiceForm({ ...serviceForm, name: event.target.value })} placeholder="e.g. Home Assistant" /></label><label>Health check URL<input required type="url" value={serviceForm.url} onChange={event => setServiceForm({ ...serviceForm, url: event.target.value })} placeholder="https://service.example.local" /></label><label>Server<select required value={serviceForm.serverId} onChange={event => setServiceForm({ ...serviceForm, serverId: event.target.value })}><option value="">Select a server</option>{data.servers.map(server => <option value={server.id} key={server.id}>{server.name}</option>)}</select></label>{serviceFormError && <p className="form-error" role="alert">{serviceFormError}</p>}<div className="modal-actions"><button type="button" className="button secondary" onClick={() => setServiceFormOpen(false)} disabled={submittingForm === 'service'}>Cancel</button><button type="submit" className="button primary" disabled={submittingForm === 'service'}>{submittingForm === 'service' ? 'Adding service…' : 'Add service'}</button></div></form></section></div>}
      <footer><span>HomeLab Dashboard <b>v0.1.0</b></span><span><span className="footer-dot"></span> API connected</span></footer>
    </main>
  </div>;
}

function Stat({ icon, label, value, caption, progress, color }: { icon: React.ReactNode; label: string; value: string; caption: string; progress: number; color: string }) { return <div className="stat-card"><div className={`stat-icon ${color}`}>{icon}</div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{caption}</small></div><div className="ring" style={{'--progress': `${progress * 3.6}deg`} as React.CSSProperties}><div>{progress}%</div></div></div>; }
function PanelTitle({ title, action }: { title: string; action: string }) { return <div className="panel-title"><h3>{title}</h3><button>{action}<ChevronRight size={15}/></button></div>; }
function statusTone(status: string) { return status === 'Online' ? 'online' : status === 'Offline' ? 'offline' : 'pending'; }
function formatRelativeTime(value: string) { const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000)); if (seconds < 60) return 'just now'; const minutes = Math.floor(seconds / 60); return `${minutes}m ago`; }
export default App;
