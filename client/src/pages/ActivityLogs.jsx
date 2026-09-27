import { useState, useEffect } from 'react';
import api from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { Activity, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { GlobalLoader } from '../components/ui/loader';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `/activity?page=${page}&limit=15`;
      if (search) url += `&search=${search}`;
      if (actionFilter) url += `&action=${actionFilter}`;
      if (entityFilter) url += `&entityType=${entityFilter}`;
      
      const res = await api.get(url);
      setLogs(res.data.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load activity logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter]); // Trigger on pagination or filter change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  if (loading && logs.length === 0) return <GlobalLoader />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Activity Logs" 
        description="Track all administrative actions performed in the CMS."
      />

      <Card>
        <CardBody className="p-4 sm:p-6">
          {/* Filters Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search description..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary"
              />
            </div>
            
            <div className="flex gap-4">
              <select 
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary"
              >
                <option value="">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="PROJECT_CREATED">Project Created</option>
                <option value="PROJECT_UPDATED">Project Updated</option>
                <option value="PROJECT_DELETED">Project Deleted</option>
              </select>

              <select 
                value={entityFilter}
                onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary"
              >
                <option value="">All Entities</option>
                <option value="Admin">Admin</option>
                <option value="Project">Project</option>
                <option value="Achievement">Achievement</option>
                <option value="Message">Message</option>
              </select>
            </div>
            
            <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
              Apply
            </button>
          </form>

          {/* Logs List */}
          <div className="divide-y divide-slate-700/50 border border-slate-700/50 rounded-lg overflow-hidden">
            {logs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                <Activity size={32} className="mx-auto mb-2 opacity-30" />
                No activity logs found.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{log.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-primary/80">{log.action}</span>
                      <span>{log.entityType}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-400 mb-1">
                      {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[150px]">
                      User: {log.actor?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <span className="text-sm text-slate-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 bg-slate-800 border border-slate-700 rounded text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 bg-slate-800 border border-slate-700 rounded text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ActivityLogs;
