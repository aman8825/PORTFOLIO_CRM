import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { LayoutDashboard, Code2, Briefcase, Award, FolderKanban, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // We'll aggregate counts manually by hitting the APIs
        const [
          projectsRes, skillsRes, experienceRes, 
          achievementsRes, messagesRes, unreadRes
        ] = await Promise.all([
          axios.get('/projects'),
          axios.get('/skills'),
          axios.get('/experience'),
          axios.get('/achievements'),
          axios.get('/messages?limit=5'),
          axios.get('/messages?status=unread')
        ]);

        setStats({
          projects: projectsRes.data.count,
          skills: skillsRes.data.count,
          experience: experienceRes.data.count,
          achievements: achievementsRes.data.count,
          messages: messagesRes.data.count,
          unread: unreadRes.data.count
        });

        // Get first 5 messages
        setRecentMessages(messagesRes.data.data.slice(0, 5));
        
        // Get first 5 projects
        setRecentProjects(projectsRes.data.data.slice(0, 5));

      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statCards = [
    { title: 'Projects', value: stats?.projects, icon: FolderKanban, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Skills', value: stats?.skills, icon: Code2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Experience', value: stats?.experience, icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { title: 'Achievements', value: stats?.achievements, icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Dashboard...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="Dashboard Overview" 
        description="Welcome to your Portfolio CMS. Here's a summary of your content."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, idx) => (
          <Card key={idx}>
            <CardBody className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white">{stat.value || 0}</h3>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Messages Widget */}
        <Card>
          <CardHeader className="flex justify-between items-center pb-0 border-none">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Recent Messages</h3>
              {stats?.unread > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {stats.unread} New
                </span>
              )}
            </div>
            <Link to="/admin/messages" className="text-sm text-primary hover:text-blue-400 flex items-center gap-1 transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </CardHeader>
          <CardBody>
            <div className="divide-y divide-slate-700/50">
              {recentMessages.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm flex flex-col items-center">
                  <Mail size={32} className="mb-2 opacity-30" />
                  No messages yet.
                </div>
              ) : (
                recentMessages.map(msg => (
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

        {/* Projects Widget */}
        <Card>
          <CardHeader className="flex justify-between items-center pb-0 border-none">
            <h3 className="text-lg font-bold text-white">Recent Projects</h3>
            <Link to="/admin/projects" className="text-sm text-primary hover:text-blue-400 flex items-center gap-1 transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </CardHeader>
          <CardBody>
            <div className="divide-y divide-slate-700/50">
              {recentProjects.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm flex flex-col items-center">
                  <FolderKanban size={32} className="mb-2 opacity-30" />
                  No projects added yet.
                </div>
              ) : (
                recentProjects.map(proj => (
                  <div key={proj._id} className="py-3 flex justify-between items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{proj.title}</p>
                      <p className="text-xs text-slate-400 truncate">{proj.category}</p>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${proj.published ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                      {proj.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;
