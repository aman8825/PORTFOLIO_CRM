import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Code, Briefcase, FolderGit2, Award, FileText, MessageSquare, Settings, Menu, X, Bot, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Profile', path: '/admin/profile', icon: User },
  { name: 'Skills', path: '/admin/skills', icon: Code },
  { name: 'Experience', path: '/admin/experience', icon: Briefcase },
  { name: 'Projects', path: '/admin/projects', icon: FolderGit2 },
  { name: 'Achievements', path: '/admin/achievements', icon: Award },
  { name: 'Tasks', path: '/admin/tasks', icon: ClipboardList },
  { name: 'Resume', path: '/admin/resume', icon: FileText },
  { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
  { name: 'AI Assistant', path: '/admin/assistant', icon: Bot },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-slate-700/50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700/50">
          <span className="text-xl font-bold text-white tracking-wider">CMS<span className="text-primary">.</span></span>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </motion.div>
    </>
  );
};

export default Sidebar;
