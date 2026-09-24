import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, updateTaskStatus, deleteTask } from '../services/api';
import { getProjects } from '../services/api'; // Assuming this exists, if not we will fetch via axios or remove.
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { Plus, Edit2, Trash2, CheckCircle, LayoutGrid, List, Search, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUSES = ['Todo', 'In Progress', 'Review', 'Completed', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const CATEGORIES = ['Development', 'Portfolio', 'Client', 'Job Search', 'Interview', 'Learning', 'Deployment', 'Personal', 'Other'];

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban'); // 'list' or 'kanban'
  
  // Filtering & Sorting
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [saving, setSaving] = useState(false);

  const initialForm = {
    title: '', description: '', status: 'Todo', priority: 'Medium', 
    category: 'Other', dueDate: '', project: '', tags: '', notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // Fetch projects for dropdown
    const fetchProj = async () => {
      try {
        const { data } = await getProjects();
        if (data?.data) setProjects(data.data);
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };
    fetchProj();
  }, []);

  const openModal = (task = null) => {
    if (task) {
      setCurrentTask(task);
      const formatted = { ...task };
      if (formatted.dueDate) formatted.dueDate = new Date(formatted.dueDate).toISOString().split('T')[0];
      if (formatted.tags && Array.isArray(formatted.tags)) formatted.tags = formatted.tags.join(', ');
      if (formatted.project && typeof formatted.project === 'object') formatted.project = formatted.project._id;
      setFormData(formatted);
    } else {
      setCurrentTask(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // clean empty project
      const payload = { ...formData };
      if (!payload.project) delete payload.project;

      if (currentTask) {
        await updateTask(currentTask._id, payload);
      } else {
        await createTask(payload);
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteTask(currentTask._id);
      setIsConfirmOpen(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickComplete = async (task, e) => {
    if (e) e.stopPropagation();
    try {
      const newStatus = task.status === 'Completed' ? 'Todo' : 'Completed';
      await updateTaskStatus(task._id, newStatus);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // Drag and Drop Logic
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      // Optimistic update
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      try {
        await updateTaskStatus(taskId, newStatus);
      } catch (err) {
        console.error(err);
        fetchTasks(); // Revert on failure
      }
    }
  };

  // Filtering Logic
  const filteredTasks = tasks.filter(t => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterCategory && t.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.description?.toLowerCase().includes(q) && !t.tags?.join(' ').toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const getPriorityColor = (prio) => {
    switch (prio) {
      case 'Urgent': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Low': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      default: return 'text-slate-400';
    }
  };

  const isOverdue = (date, status) => {
    if (!date || status === 'Completed' || status === 'Cancelled') return false;
    return new Date(date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Todo').length,
    inProgress: tasks.filter(t => t.status === 'In Progress' || t.status === 'Review').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    overdue: tasks.filter(t => isOverdue(t.dueDate, t.status)).length
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-shrink-0">
        <PageHeader 
          title="Task Management" 
          description="Manage your development workflow, portfolio tasks, and personal projects."
          action={<Button onClick={() => openModal()}><Plus size={18} /> New Task</Button>}
        />

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4 flex flex-col items-center justify-center bg-slate-800 border-slate-700/50">
            <span className="text-3xl font-bold text-white">{stats.total}</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">Total</span>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center bg-slate-800 border-slate-700/50">
            <span className="text-3xl font-bold text-slate-300">{stats.pending}</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">Pending</span>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center bg-slate-800 border-slate-700/50">
            <span className="text-3xl font-bold text-blue-500">{stats.inProgress}</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">In Progress</span>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center bg-slate-800 border-slate-700/50">
            <span className="text-3xl font-bold text-green-500">{stats.completed}</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">Completed</span>
          </Card>
          <Card className={`p-4 flex flex-col items-center justify-center bg-slate-800 ${stats.overdue > 0 ? 'border-red-500/30' : 'border-slate-700/50'}`}>
            <span className={`text-3xl font-bold ${stats.overdue > 0 ? 'text-red-500' : 'text-slate-500'}`}>{stats.overdue}</span>
            <span className={`text-xs uppercase tracking-wider mt-1 ${stats.overdue > 0 ? 'text-red-400' : 'text-slate-500'}`}>Overdue</span>
          </Card>
        </div>

        {/* Controls Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-surface p-3 rounded-xl border border-slate-700/50">
          <div className="flex flex-wrap gap-2 flex-1 w-full">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/50 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-slate-900 border border-slate-700/50 rounded-lg py-2 px-3 text-sm text-white focus:outline-none">
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="bg-slate-900 border border-slate-700/50 rounded-lg py-2 px-3 text-sm text-white focus:outline-none">
              <option value="">All Priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-slate-900 border border-slate-700/50 rounded-lg py-2 px-3 text-sm text-white focus:outline-none">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700/50">
            <button onClick={() => setView('kanban')} className={`p-1.5 rounded-md transition-colors ${view === 'kanban' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => setView('list')} className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-hidden min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400">Loading tasks...</div>
        ) : view === 'kanban' ? (
          /* KANBAN VIEW */
          <div className="h-full flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {STATUSES.map(status => {
              const columnTasks = filteredTasks.filter(t => t.status === status);
              return (
                <div 
                  key={status} 
                  className="flex-shrink-0 w-80 flex flex-col bg-slate-900/50 rounded-xl border border-slate-700/30 overflow-hidden"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  <div className="p-3 border-b border-slate-700/50 bg-surface/50 flex justify-between items-center sticky top-0">
                    <h3 className="font-semibold text-slate-200">{status}</h3>
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{columnTasks.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                    {columnTasks.map(task => (
                      <motion.div
                        layoutId={task._id}
                        key={task._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task._id)}
                        onClick={() => openModal(task)}
                        className={`bg-surface border ${isOverdue(task.dueDate, task.status) ? 'border-red-500/50' : 'border-slate-700/50'} p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors shadow-sm`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <button onClick={(e) => handleQuickComplete(task, e)} className={`text-slate-400 hover:text-green-500 transition-colors ${task.status === 'Completed' ? 'text-green-500' : ''}`}>
                            <CheckCircle size={16} />
                          </button>
                        </div>
                        <h4 className={`font-medium text-sm mb-2 ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {task.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          {task.category && <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">{task.category}</span>}
                          {task.dueDate && (
                            <span className={`flex items-center gap-1 ${isOverdue(task.dueDate, task.status) ? 'text-red-400 font-medium' : ''}`}>
                              {isOverdue(task.dueDate, task.status) ? <AlertCircle size={12} /> : <Clock size={12} />}
                              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                        {task.project && (
                          <div className="mt-3 text-xs text-primary/80 border-t border-slate-700/50 pt-2 flex items-center gap-1">
                            {task.project.title}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="h-full overflow-y-auto custom-scrollbar bg-surface border border-slate-700/50 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase border-b border-slate-700/50">Task</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase border-b border-slate-700/50">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase border-b border-slate-700/50">Priority</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase border-b border-slate-700/50">Due Date</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase border-b border-slate-700/50 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-slate-500">No tasks found.</td></tr>
                ) : (
                  filteredTasks.map(task => (
                    <tr key={task._id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className={`font-medium ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-white'}`}>{task.title}</span>
                          <span className="text-xs text-slate-500 mt-1 flex gap-2">
                            <span>{task.category}</span>
                            {task.project && <span className="text-primary/70">• {task.project.title}</span>}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">{task.status}</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        {task.dueDate ? (
                          <span className={`text-sm ${isOverdue(task.dueDate, task.status) ? 'text-red-400 font-medium' : 'text-slate-400'}`}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        ) : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => handleQuickComplete(task)} title="Toggle Complete">
                            <CheckCircle size={16} className={task.status === 'Completed' ? 'text-green-500' : 'text-slate-400'} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openModal(task)}><Edit2 size={16} /></Button>
                          <Button variant="danger" size="sm" onClick={() => { setCurrentTask(task); setIsConfirmOpen(true); }}><Trash2 size={16} /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentTask ? 'Edit Task' : 'New Task'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input 
            label="Task Title *" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            required 
            placeholder="e.g. Optimize image loading"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Priority</label>
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input 
              label="Due Date" 
              type="date" 
              value={formData.dueDate} 
              onChange={e => setFormData({...formData, dueDate: e.target.value})} 
            />
          </div>

          <Textarea 
            label="Description" 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            rows="2" 
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Link to Project (Optional)</label>
              <select value={formData.project || ''} onChange={e => setFormData({...formData, project: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none">
                <option value="">None</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>
            <Input 
              label="Tags (comma separated)" 
              value={formData.tags} 
              onChange={e => setFormData({...formData, tags: e.target.value})} 
              placeholder="e.g. React, SEO, UI"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700/50">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" loading={saving}>{currentTask ? 'Save Changes' : 'Create Task'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleDelete} 
        loading={saving}
        title="Delete Task" 
        message={`Are you sure you want to delete "${currentTask?.title}"?`} 
      />
    </div>
  );
};

export default Tasks;
