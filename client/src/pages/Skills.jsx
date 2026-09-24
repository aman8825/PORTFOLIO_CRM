import { useState, useEffect } from 'react';
import { getSkills, createSkill, updateSkill, deleteSkill } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const initialForm = { name: '', category: 'Frontend', icon: '', order: 0, enabled: true };
  const [formData, setFormData] = useState(initialForm);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await getSkills();
      setSkills(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const openModal = (skill = null) => {
    if (skill) {
      setCurrentSkill(skill);
      setFormData(skill);
    } else {
      setCurrentSkill(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (currentSkill) {
        await updateSkill(currentSkill._id, formData);
      } else {
        await createSkill(formData);
      }
      setIsModalOpen(false);
      fetchSkills();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (skill) => {
    try {
      await updateSkill(skill._id, { enabled: !skill.enabled });
      setSkills(skills.map(s => s._id === skill._id ? { ...s, enabled: !skill.enabled } : s));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteSkill(currentSkill._id);
      setIsConfirmOpen(false);
      fetchSkills();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Skills" 
        description="Manage your technical skills and group them by category."
        action={
          <Button onClick={() => openModal()}>
            <Plus size={18} /> Add Skill
          </Button>
        }
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4">Skill Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center p-8">Loading...</td></tr>
              ) : skills.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-8 text-slate-500">No skills added yet.</td></tr>
              ) : (
                skills.map(skill => (
                  <tr key={skill._id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-medium text-white">{skill.name}</td>
                    <td className="px-6 py-4">{skill.category}</td>
                    <td className="px-6 py-4">{skill.order}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleEnabled(skill)} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${skill.enabled ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                        {skill.enabled ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {skill.enabled ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openModal(skill)} className="text-slate-400 hover:text-white transition-colors p-1">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => { setCurrentSkill(skill); setIsConfirmOpen(true); }} className="text-red-400 hover:text-red-300 transition-colors p-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit/Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentSkill ? 'Edit Skill' : 'Add Skill'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Skill Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
            <select 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option>Frontend</option>
              <option>Backend</option>
              <option>Database</option>
              <option>Authentication & APIs</option>
              <option>Tools</option>
              <option>Other</option>
            </select>
          </div>
          <Input label="Icon String (optional)" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} />
          <Input label="Sort Order" type="number" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
          
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/50">
            <input type="checkbox" id="enabled" checked={formData.enabled} onChange={e => setFormData({...formData, enabled: e.target.checked})} className="rounded bg-slate-800 border-slate-700 text-primary focus:ring-primary focus:ring-offset-background" />
            <label htmlFor="enabled" className="text-sm text-slate-300">Visible on public portfolio</label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Skill</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleDelete} 
        loading={saving}
        title="Delete Skill" 
        message={`Are you sure you want to delete ${currentSkill?.name}? This action cannot be undone.`} 
      />
    </div>
  );
};

export default Skills;
