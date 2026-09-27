import { useState, useEffect } from 'react';
import api from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { BarChart2, Eye, Download, MessageSquare, TrendingUp, Filter, Activity } from 'lucide-react';
import { GlobalLoader } from '../components/ui/loader';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30'); // '1', '7', '30', 'all'

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/analytics/summary?period=${period}`);
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [period]);

  if (loading && !data) return <GlobalLoader />;

  const statCards = [
    { title: 'Total Views', value: data?.totalViews || 0, icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Resume Downloads', value: data?.totalDownloads || 0, icon: Download, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Contact Submissions', value: data?.totalSubmissions || 0, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Portfolio Analytics" 
          description="Track visitor engagement and content performance."
        />
        <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg">
          {['1', '7', '30', 'all'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                period === p ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p === '1' ? 'Today' : p === 'all' ? 'All Time' : `${p} Days`}
            </button>
          ))}
        </div>
      </div>

      {loading && data && <div className="text-sm text-slate-400 animate-pulse">Refreshing data...</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => (
          <Card key={idx}>
            <CardBody className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              Most Viewed Projects
            </h3>
          </CardHeader>
          <CardBody>
            {data?.mostViewedProjects?.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                <BarChart2 size={32} className="mx-auto mb-2 opacity-30" />
                No project views recorded for this period.
              </div>
            ) : (
              <div className="space-y-4">
                {data?.mostViewedProjects.map((project, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-600 w-4">{i + 1}.</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-slate-200 truncate">{project.title}</span>
                        <span className="text-xs font-bold text-primary">{project.views} views</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div 
                          className="bg-primary h-1.5 rounded-full" 
                          style={{ width: `${Math.min(100, (project.views / (data.mostViewedProjects[0].views || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              Views Over Time
            </h3>
          </CardHeader>
          <CardBody>
            {data?.viewsOverTime?.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                <BarChart2 size={32} className="mx-auto mb-2 opacity-30" />
                No views recorded for this period.
              </div>
            ) : (
              <div className="flex h-48 items-end gap-2 justify-between mt-4">
                {/* Simplified CSS Bar Chart for Dashboard */}
                {data?.viewsOverTime.map((day, i) => {
                  const maxViews = Math.max(...data.viewsOverTime.map(d => d.views));
                  const height = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
                  return (
                    <div key={i} className="flex flex-col items-center flex-1 group">
                      <div className="w-full relative flex items-end justify-center h-40 bg-slate-800/20 rounded-t-sm">
                        <div 
                          className="w-full bg-primary/40 group-hover:bg-primary transition-colors rounded-t-sm"
                          style={{ height: `${height}%` }}
                        ></div>
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                          {day.views} views
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-2 truncate max-w-full text-center">
                        {new Date(day._id).getDate()}/{new Date(day._id).getMonth() + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
