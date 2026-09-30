import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FolderGit2, User, Award, ClipboardList, LayoutDashboard, Settings, Activity, MessageSquare, Plus, Link as LinkIcon, FileText, Image as ImageIcon } from 'lucide-react';

const CommandPalette = ({ isOpen, setIsOpen }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const portfolioUrl = import.meta.env.VITE_PORTFOLIO_URL || 'https://portfolio-frontend-exqgcct1y-ricr.vercel.app/';

  const actions = [
    { id: 'go-dashboard', name: 'Go to Dashboard', icon: LayoutDashboard, category: 'Navigation', onSelect: () => navigate('/admin') },
    { id: 'go-profile', name: 'Go to Profile', icon: User, category: 'Navigation', onSelect: () => navigate('/admin/profile') },
    { id: 'go-projects', name: 'Go to Projects', icon: FolderGit2, category: 'Navigation', onSelect: () => navigate('/admin/projects') },
    { id: 'go-achievements', name: 'Go to Achievements', icon: Award, category: 'Navigation', onSelect: () => navigate('/admin/achievements') },
    { id: 'go-messages', name: 'Go to Messages', icon: MessageSquare, category: 'Navigation', onSelect: () => navigate('/admin/messages') },
    { id: 'go-articles', name: 'Go to Articles', icon: FileText, category: 'Navigation', onSelect: () => navigate('/admin/articles') },
    { id: 'go-testimonials', name: 'Go to Testimonials', icon: MessageSquare, category: 'Navigation', onSelect: () => navigate('/admin/testimonials') },
    { id: 'go-media', name: 'Go to Media Library', icon: ImageIcon, category: 'Navigation', onSelect: () => navigate('/admin/media') },
    { id: 'go-tasks', name: 'Go to Tasks', icon: ClipboardList, category: 'Navigation', onSelect: () => navigate('/admin/tasks') },
    { id: 'go-settings', name: 'Go to Settings', icon: Settings, category: 'Navigation', onSelect: () => navigate('/admin/settings') },
    { id: 'go-health', name: 'Go to Portfolio Health', icon: Activity, category: 'Navigation', onSelect: () => navigate('/admin/health') },
    
    { id: 'create-project', name: 'Create Project', icon: Plus, category: 'Creation', onSelect: () => navigate('/admin/projects?create=true') },
    { id: 'create-achievement', name: 'Create Achievement', icon: Plus, category: 'Creation', onSelect: () => navigate('/admin/achievements?create=true') },
    { id: 'create-task', name: 'Create Task', icon: Plus, category: 'Creation', onSelect: () => navigate('/admin/tasks?create=true') },
    
    { id: 'view-live', name: 'View Live Portfolio', icon: LinkIcon, category: 'External', onSelect: () => window.open(portfolioUrl, '_blank') },
  ];

  const filteredActions = query === '' 
    ? actions 
    : actions.filter(a => a.name.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredActions.length);
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
        }
        if (e.key === 'Enter' && filteredActions.length > 0) {
          e.preventDefault();
          filteredActions[selectedIndex].onSelect();
          setIsOpen(false);
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] sm:pt-[25vh]">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative w-[90%] max-w-xl bg-surface border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center px-4 border-b border-slate-700/50">
          <Search size={20} className="text-slate-400 mr-2" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent py-4 text-white outline-none placeholder:text-slate-500 text-lg"
            placeholder="Search commands... (Ctrl+K)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-slate-800 rounded border border-slate-700 text-xs text-slate-400 font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No results found for "{query}"
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredActions.map((action, idx) => {
                const Icon = action.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={action.id}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => {
                      action.onSelect();
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                      isSelected ? 'bg-primary/10 text-white' : 'text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon size={18} className={isSelected ? 'text-primary' : 'text-slate-400'} />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{action.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{action.category}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
