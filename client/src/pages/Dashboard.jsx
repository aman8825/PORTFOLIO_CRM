import { useState, useEffect } from 'react';
import api from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { LayoutDashboard, Code2, Briefcase, Award, FolderKanban, Mail, ArrowRight, Activity, Plus, CheckCircle2, AlertTriangle, Server, Database, Link as LinkIcon, RefreshCw, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [linkHealth, setLinkHealth] = useState(null);
  const [checkingLinks, setCheckingLinks] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const checkLinkHealth = async () => {
    setCheckingLinks(true);
    try {
      const res = await api.get('/dashboard/link-health');
      setLinkHealth(res.data.data);
    } catch (err) {
      console.error('Failed to check link health', err);
    } finally {
      setCheckingLinks(false);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-400">Loading Dashboard...</div>;
  }

  const { counts, healthScore, recentActivity, recentProjects, recentMessages, systemStatus } = data;

  const statCards = [
    { title: 'Projects', value: counts?.projects, icon: FolderKanban, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Achievements', value: counts?.achievements, icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Messages', value: counts?.messages, icon: Mail, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Tasks', value: counts?.tasks, icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div>
      <PageHeader 
        title="Dashboard Overview" 
        description="Welcome to your Portfolio CMS. Here's a summary of your content."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader className="border-none pb-0">
            <h3 className="text-lg font-bold text-white">Portfolio Overview</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {statCards.map((stat, idx) => (
                <div key={idx} className={`p-4 rounded-xl ${stat.bg} flex flex-col items-center justify-center text-center`}>
                  <stat.icon size={24} className={`${stat.color} mb-2`} />
                  <h3 className="text-2xl font-bold text-white">{stat.value || 0}</h3>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.title}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="border-none pb-0">
            <h3 className="text-lg font-bold text-white">Portfolio Health</h3>
          </CardHeader>
          <CardBody className="flex flex-col items-center justify-center py-6">
            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${healthScore >= 90 ? 'text-green-500' : healthScore >= 70 ? 'text-amber-500' : 'text-red-500'}`}
                  strokeDasharray={`${healthScore}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{healthScore}%</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 text-center">
              {healthScore === 100 ? 'Your portfolio is in excellent shape.' : 'There are a few things you could improve.'}
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader className="border-none pb-2">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Quick Actions</h3>
            </CardHeader>
            <CardBody className="pt-0 flex flex-col gap-2">
              <Link to="/admin/projects" className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-sm text-slate-200 transition-colors">
                <Plus size={16} className="text-blue-400" /> Create Project
              </Link>
              <Link to="/admin/achievements" className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-sm text-slate-200 transition-colors">
                <Plus size={16} className="text-emerald-400" /> Create Achievement
              </Link>
              <Link to="/admin/tasks" className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-sm text-slate-200 transition-colors">
                <Plus size={16} className="text-amber-400" /> Create Task
              </Link>
              <Link to="/admin/profile" className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-sm text-slate-200 transition-colors">
                <Plus size={16} className="text-indigo-400" /> Edit Profile
              </Link>
              <Link to="/admin/messages" className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-sm text-slate-200 transition-colors">
                <Mail size={16} className="text-purple-400" /> View Messages
              </Link>
              <Link to="/admin/health" className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-sm text-slate-200 transition-colors">
                <Activity size={16} className="text-rose-400" /> Open Portfolio Health
              </Link>
              <a href={import.meta.env.VITE_PORTFOLIO_URL || 'https://portfolio-frontend-exqgcct1y-ricr.vercel.app/'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-sm text-slate-200 transition-colors">
                <LinkIcon size={16} className="text-cyan-400" /> View Live Portfolio
              </a>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="border-none pb-2">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">System Status</h3>
            </CardHeader>
            <CardBody className="pt-0 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Server size={14} className="text-slate-400" /> API
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${systemStatus?.api === 'ONLINE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {systemStatus?.api || 'UNKNOWN'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Database size={14} className="text-slate-400" /> Database
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${systemStatus?.database === 'ONLINE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {systemStatus?.database || 'UNKNOWN'}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Messages Widget */}
          <Card>
            <CardHeader className="flex justify-between items-center pb-0 border-none">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Recent Messages</h3>
                {counts?.unreadMessages > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {counts.unreadMessages} New
                  </span>
                )}
              </div>
              <Link to="/admin/messages" className="text-sm text-primary hover:text-blue-400 flex items-center gap-1 transition-colors">
                View All <ArrowRight size={14} />
              </Link>
            </CardHeader>
            <CardBody>
              <div className="divide-y divide-slate-700/50">
                {recentMessages?.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-sm flex flex-col items-center">
                    <Mail size={32} className="mb-2 opacity-30" />
                    No messages yet.
                  </div>
                ) : (
                  recentMessages?.map(msg => (
                    <div key={msg._id} className="py-3 flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${msg.status === 'unread' ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                          {msg.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{msg.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 whitespace-nowrap mb-1">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </p>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${msg.status === 'unread' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                          {msg.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          {/* Activity Logs Widget */}
          <Card>
            <CardHeader className="flex justify-between items-center pb-0 border-none">
              <h3 className="text-lg font-bold text-white">Recent Activity</h3>
              <Link to="/admin/settings" className="text-sm text-primary hover:text-blue-400 flex items-center gap-1 transition-colors">
                View All <ArrowRight size={14} />
              </Link>
            </CardHeader>
            <CardBody>
              <div className="divide-y divide-slate-700/50">
                {recentActivity?.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-sm flex flex-col items-center">
                    <Activity size={32} className="mb-2 opacity-30" />
                    No recent activity.
                  </div>
                ) : (
                  recentActivity?.map(log => (
                    <div key={log._id} className="py-3 flex justify-between items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{log.description}</p>
                        <p className="text-xs text-slate-400 truncate">{log.action}</p>
                      </div>
                      <span className="text-[10px] text-slate-500">
                         {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          {/* Link Health Widget */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex justify-between items-center pb-0 border-none">
              <div className="flex items-center gap-2">
                <LinkIcon size={18} className="text-primary" />
                <h3 className="text-lg font-bold text-white">External Link Health</h3>
              </div>
              <button 
                onClick={checkLinkHealth}
                disabled={checkingLinks}
                className="text-sm text-primary hover:text-blue-400 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkingLinks ? <><RefreshCw size={14} className="animate-spin" /> Checking...</> : <><RefreshCw size={14} /> Run Check</>}
              </button>
            </CardHeader>
            <CardBody>
              {!linkHealth && !checkingLinks ? (
                <div className="py-8 text-center text-slate-500 text-sm flex flex-col items-center">
                  <LinkIcon size={32} className="mb-2 opacity-30" />
                  <p>Click 'Run Check' to verify all public portfolio links (GitHub, Demos, Socials).</p>
                </div>
              ) : checkingLinks ? (
                <div className="py-8 text-center text-slate-500 text-sm flex flex-col items-center">
                  <RefreshCw size={32} className="mb-2 opacity-30 animate-spin" />
                  <p>Pinging external servers...</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-6 mb-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                    <div className="flex-1 text-center border-r border-slate-700/50">
                      <p className="text-2xl font-bold text-white">{linkHealth.totalChecked}</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">Total Links</p>
                    </div>
                    <div className="flex-1 text-center border-r border-slate-700/50">
                      <p className="text-2xl font-bold text-green-400">{linkHealth.healthyCount}</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">Healthy</p>
                    </div>
                    <div className="flex-1 text-center">
                      <p className={`text-2xl font-bold ${linkHealth.brokenCount > 0 ? 'text-red-400' : 'text-slate-300'}`}>{linkHealth.brokenCount}</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">Broken</p>
                    </div>
                  </div>

                  {linkHealth.brokenCount > 0 ? (
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                      {linkHealth.brokenLinks.map((link, idx) => (
                        <div key={idx} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                          <XCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-red-200 truncate">{link.source} ({link.type})</p>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-red-300/70 hover:text-red-300 truncate block hover:underline">
                              {link.url}
                            </a>
                            <p className="text-[10px] text-red-400 mt-1 uppercase">Error: {link.error || `Status ${link.status}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center gap-2 text-green-400 text-sm">
                      <CheckCircle2 size={18} />
                      <span>All external links are responding correctly!</span>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
