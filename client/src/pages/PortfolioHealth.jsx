import { useState, useEffect } from 'react';
import api from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, Activity, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const PortfolioHealth = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Link Health State
  const [linkHealth, setLinkHealth] = useState(null);
  const [checkingLinks, setCheckingLinks] = useState(false);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get('/dashboard/health');
        setHealthData(res.data.data);
      } catch (err) {
        console.error('Failed to load health data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  const handleCheckLinks = async () => {
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

  if (loading || !healthData) {
    return <div className="p-8 text-center text-slate-400">Loading Portfolio Health...</div>;
  }

  const { overall, issues, checks } = healthData;

  const renderCheckIcon = (passed) => {
    return passed ? <CheckCircle2 size={16} className="text-green-400" /> : <AlertTriangle size={16} className="text-amber-400" />;
  };

  return (
    <div>
      <PageHeader 
        title="Portfolio Health" 
        description="Automatically inspects the current portfolio content and identifies missing, incomplete, or potentially problematic content."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1">
          <CardHeader className="border-none pb-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity size={20} className="text-primary" /> Overall Status
            </h3>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className={`p-6 rounded-xl flex flex-col items-center justify-center text-center border ${overall === 'PASS' ? 'bg-green-500/10 border-green-500/20 text-green-400' : overall === 'WARNING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              <div className="text-2xl font-bold mb-1">
                {overall === 'PASS' ? 'Healthy' : overall === 'WARNING' ? 'Needs Attention' : 'Critical Issues'}
              </div>
              <p className="text-xs opacity-80 uppercase tracking-wider">
                {issues.length} Issues Found
              </p>
            </div>

            <div className="space-y-3 mt-4">
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Checklist</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Profile Complete</span>
                {renderCheckIcon(checks.profile)}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Social Links</span>
                {renderCheckIcon(checks.social)}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Projects Ready</span>
                {renderCheckIcon(checks.projects)}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Achievements Verified</span>
                {renderCheckIcon(checks.achievements)}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">SEO Configured</span>
                {renderCheckIcon(checks.seo)}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Content Published</span>
                {renderCheckIcon(checks.content)}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-slate-700/50">
            <h3 className="text-lg font-bold text-white">Issues to Review</h3>
          </CardHeader>
          <CardBody className="p-0">
            {issues.length === 0 ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                <CheckCircle2 size={48} className="text-green-400 mb-4 opacity-50" />
                <p>Everything looks good! No health issues found.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/50">
                {issues.map((issue, idx) => (
                  <div key={idx} className="p-4 flex items-start gap-4 hover:bg-slate-800/30 transition-colors">
                    <div className="mt-1">
                      {issue.type === 'ERROR' ? (
                        <XCircle size={20} className="text-red-400" />
                      ) : (
                        <AlertTriangle size={20} className="text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${issue.type === 'ERROR' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {issue.category}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-200">{issue.message}</h4>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{issue.suggestion}</p>
                      
                      {issue.fixLink && (
                        <Link to={issue.fixLink} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-blue-400 transition-colors">
                          Fix this issue <ArrowRight size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card>
          <CardHeader className="border-b border-slate-700/50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe size={20} className="text-blue-400" /> External Link Health
            </h3>
            <button
              onClick={handleCheckLinks}
              disabled={checkingLinks}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${checkingLinks ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-600'}`}
            >
              {checkingLinks ? 'Scanning Links...' : 'Scan Links Now'}
            </button>
          </CardHeader>
          <CardBody>
            {!linkHealth ? (
              <div className="text-center p-8 text-slate-400">
                Click the button above to scan all external URLs across your projects, social profiles, and documents.
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 text-center">
                    <div className="text-2xl font-bold text-white mb-1">{linkHealth.totalChecked}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Total Links</div>
                  </div>
                  <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20 text-center text-green-400">
                    <div className="text-2xl font-bold mb-1">{linkHealth.healthyCount}</div>
                    <div className="text-xs uppercase tracking-wider">Healthy</div>
                  </div>
                  <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20 text-center text-red-400">
                    <div className="text-2xl font-bold mb-1">{linkHealth.brokenCount}</div>
                    <div className="text-xs uppercase tracking-wider">Broken</div>
                  </div>
                </div>

                {linkHealth.brokenLinks && linkHealth.brokenLinks.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-red-400 mb-2">Broken Links Found:</h4>
                    {linkHealth.brokenLinks.map((link, idx) => (
                      <div key={idx} className="bg-slate-800 p-3 rounded-lg border border-red-500/20 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 bg-slate-700 text-slate-300 rounded uppercase font-bold">{link.type}</span>
                          <span className="text-sm font-medium text-white">{link.source}</span>
                        </div>
                        <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline break-all">{link.url}</a>
                        <div className="text-xs text-red-400 mt-1">Error: {link.status || link.error}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioHealth;
