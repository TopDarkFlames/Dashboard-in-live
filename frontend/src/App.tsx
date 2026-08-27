import { useEffect, useState } from 'react';
import { Activity, Bell, Box, CheckCircle2, ChevronRight, CircleAlert, Cpu, Database, LayoutDashboard, Menu, Server, Settings, Wifi, X } from 'lucide-react';

type ServerItem = { id: number; name: string; hostname: string; ipAddress: string; status: string; cpuUsage: number; memoryUsage: number; diskUsage: number; uptime: string };
type ServiceItem = { id: number; name: string; status: string; responseTime: number };
type Dashboard = { serversOnline: number; serversTotal: number; servicesOnline: number; servicesTotal: number; averageCpu: number; averageMemory: number; servers: ServerItem[]; services: ServiceItem[]; alerts: { title: string; detail: string; severity: string; time: string }[] };

const fallback: Dashboard = { serversOnline: 3, serversTotal: 4, servicesOnline: 5, servicesTotal: 6, averageCpu: 30, averageMemory: 52, servers: [], services: [], alerts: [] };

function App() {
  const [data, setData] = useState<Dashboard>(fallback);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { fetch('/api/dashboard').then(r => r.json()).then(setData).catch(() => undefined); }, []);
  const onlineServerPct = Math.round((data.serversOnline / data.serversTotal) * 100);
  const onlineServicePct = Math.round((data.servicesOnline / data.servicesTotal) * 100);
  return <div className="app-shell">
    <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
      <div className="brand"><div className="brand-mark"><Activity size={19}/></div><span>homelab<span className="accent">.</span></span><button className="close-menu" onClick={() => setMenuOpen(false)}><X size={18}/></button></div>
      <nav><p className="nav-label">Workspace</p><a className="active"><LayoutDashboard size={18}/>Overview</a><a><Server size={18}/>Servers</a><a><Wifi size={18}/>Services</a><a><Box size={18}/>Containers</a><a><Activity size={18}/>Metrics</a><p className="nav-label second">Manage</p><a><Bell size={18}/>Alerts<span className="nav-badge">2</span></a><a><Settings size={18}/>Settings</a></nav>
      <div className="sidebar-footer"><div className="connection-dot"></div><div><strong>All systems monitored</strong><span>Updated just now</span></div></div>
    </aside>
    <main className="main"><header><button className="menu-button" onClick={() => setMenuOpen(true)}><Menu size={21}/></button><div><p className="eyebrow">Thursday, August 27, 2026</p><h1>Good evening, Alex<span className="accent">.</span></h1></div><div className="header-actions"><button className="icon-button"><Bell size={19}/><i></i></button><div className="avatar">A</div></div></header>
      <section className="hero"><div><span className="status-pill"><span></span>System overview</span><h2>Your homelab at a glance</h2><p>Monitor the health and performance of your infrastructure.</p></div><div className="last-sync"><span>Last sync</span><strong>Just now <CheckCircle2 size={15}/></strong></div></section>
      <section className="stats-grid"><Stat icon={<Server/>} label="Servers" value={`${data.serversOnline} / ${data.serversTotal}`} caption="online" progress={onlineServerPct} color="purple"/><Stat icon={<Wifi/>} label="Services" value={`${data.servicesOnline} / ${data.servicesTotal}`} caption="operational" progress={onlineServicePct} color="blue"/><Stat icon={<Cpu/>} label="Avg. CPU usage" value={`${data.averageCpu}%`} caption="across servers" progress={data.averageCpu} color="orange"/><Stat icon={<Database/>} label="Avg. memory" value={`${data.averageMemory}%`} caption="across servers" progress={data.averageMemory} color="green"/></section>
      <section className="content-grid"><div className="panel"><PanelTitle title="Server status" action="View all servers"/><div className="server-list">{data.servers.map(server => <div className="server-row" key={server.id}><div className={`server-icon ${server.status === 'Online' ? 'online' : 'offline'}`}><Server size={18}/></div><div className="server-name"><strong>{server.name}</strong><span>{server.ipAddress}</span></div><div className="server-metric"><span>CPU</span><strong>{server.cpuUsage}%</strong></div><div className="server-metric memory"><span>Memory</span><strong>{server.memoryUsage}%</strong></div><div className={`online-label ${server.status === 'Online' ? '' : 'off'}`}><span></span>{server.status}</div><ChevronRight size={17} className="row-arrow"/></div>)}</div></div>
      <div className="panel"><PanelTitle title="Recent alerts" action="View all alerts"/><div className="alert-list">{data.alerts.map(alert => <div className="alert-row" key={alert.title}><div className={`alert-icon ${alert.severity}`}><CircleAlert size={17}/></div><div><strong>{alert.title}</strong><span>{alert.detail}</span></div><time>{alert.time}</time></div>)}</div>{data.alerts.length === 0 && <div className="empty">No recent alerts</div>}</div></section>
      <section className="panel services-panel"><PanelTitle title="Services" action="Manage services"/><div className="services-grid">{data.services.map(service => <div className="service-card" key={service.id}><div className="service-top"><div className="service-logo">{service.name.slice(0,1)}</div><span className={`service-status ${service.status === 'Online' ? '' : 'down'}`}><span></span>{service.status}</span></div><strong>{service.name}</strong><span className="response">{service.status === 'Online' ? `${service.responseTime}ms response time` : 'Check required'}</span></div>)}</div></section>
      <footer><span>HomeLab Dashboard <b>v0.1.0</b></span><span><span className="footer-dot"></span> API connected</span></footer>
    </main>
  </div>;
}

function Stat({ icon, label, value, caption, progress, color }: { icon: React.ReactNode; label: string; value: string; caption: string; progress: number; color: string }) { return <div className="stat-card"><div className={`stat-icon ${color}`}>{icon}</div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{caption}</small></div><div className="ring" style={{'--progress': `${progress * 3.6}deg`} as React.CSSProperties}><div>{progress}%</div></div></div>; }
function PanelTitle({ title, action }: { title: string; action: string }) { return <div className="panel-title"><h3>{title}</h3><button>{action}<ChevronRight size={15}/></button></div>; }
export default App;

