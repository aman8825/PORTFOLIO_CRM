import { useContext } from 'react';
import { Menu, LogOut, Bell, ExternalLink } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ toggleSidebar }) => {
  const { admin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Assuming the portfolio runs on a standard domain or localhost:5173
  // Since we don't know the exact URL, we'll try to infer it from env or default to localhost
  const portfolioUrl = import.meta.env.VITE_PORTFOLIO_URL || 'http://localhost:5173';

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 bg-surface/50 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="hidden lg:block text-slate-400 text-sm">
          Welcome back, <span className="text-white font-medium">{admin?.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <a 
          href={portfolioUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 hover:text-blue-300 rounded-md transition-colors text-sm font-medium"
        >
          <ExternalLink size={16} />
          <span className="hidden sm:inline">View Live Portfolio</span>
        </a>

        <div className="h-8 w-px bg-slate-700/50 mx-2"></div>
        
        <button className="text-slate-400 hover:text-white transition-colors relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-700/50 mx-2"></div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
