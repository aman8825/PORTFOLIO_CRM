import { useState, useEffect } from 'react';
import { getExperiences, createExperience, updateExperience, deleteExperience } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

const Experience = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentExp, setCurrentExp] = useState(null);
  const [saving, setSaving] = useState(false);

  const initialForm = {
    company: '', role: '', startDate: '', endDate: '',
    currentlyWorking: false, location: '', description: '',
    responsibilities: [''], technologies: [''], order: 0, enabled: true
  };
  
  const [formData, setFormData] = useState(initialForm);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const res = await getExperiences();
      setExperiences(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const openModal = (exp = null) => {
    if (exp) {
      setCurrentExp(exp);
      // Format dates for input[type=date] if needed, assuming they are stored as ISO strings
      const formattedExp = { ...exp };
      if (formattedExp.startDate) formattedExp.startDate = new Date(formattedExp.startDate).toISOString().split('T')[0];
      if (formattedExp.endDate) formattedExp.endDate = new Date(formattedExp.endDate).toISOString().split('T')[0];
      setFormData(formattedExp);
    } else {
      setCurrentExp(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Clean up empty array strings
      const cleanData = { ...formData };
      cleanData.responsibilities = cleanData.responsibilities.filter(r => r.trim() !== '');
      cleanData.technologies = cleanData.technologies.filter(t => t.trim() !== '');
      if (cleanData.currentlyWorking) cleanData.endDate = null;

      if (currentExp) {
        await updateExperience(currentExp._id, cleanData);
      } else {
        await createExperience(cleanData);
      }
      setIsModalOpen(false);
      fetchExperiences();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (exp) => {
    try {
      await updateExperience(exp._id, { enabled: !exp.enabled });
      setExperiences(experiences.map(e => e._id === exp._id ? { ...e, enabled: !exp.enabled } : e));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteExperience(currentExp._id);
      setIsConfirmOpen(false);
      fetchExperiences();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Experience" 
        description="Manage your professional work history."
        action={<Button onClick={() => openModal()}><Plus size={18} /> Add Experience</Button>}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4">Role & Company</th>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center p-8">Loading...</td></tr>
              ) : experiences.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-8 text-slate-500">No experience added yet.</td></tr>
              ) : (
                experiences.map(exp => (
                  <tr key={exp._id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{exp.role}</div>
                      <div className="text-xs text-slate-400">{exp.company}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(exp.startDate).getFullYear()} - {exp.currentlyWorking ? 'Present' : new Date(exp.endDate).getFullYear()}
                    </td>
                    <td className="px-6 py-4">{exp.location}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleEnabled(exp)} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${exp.enabled ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                        {exp.enabled ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {exp.enabled ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openModal(exp)} className="text-slate-400 hover:text-white p-1"><Edit2 size={16} /></button>
                      <button onClick={() => { setCurrentExp(exp); setIsConfirmOpen(true); }} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentExp ? 'Edit Experience' : 'Add Experience'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Role/Title" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required />
          <Input label="Company/Client" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
            <Input label="End Date" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} disabled={formData.currentlyWorking} required={!formData.currentlyWorking} />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <input type="checkbox" id="current" checked={formData.currentlyWorking} onChange={e => setFormData({...formData, currentlyWorking: e.target.checked})} className="rounded bg-slate-800 border-slate-700 text-primary" />
            <label htmlFor="current" className="text-sm text-slate-300">I currently work here</label>
          </div>
          <Input label="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          <Textarea label="Short Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="2" />
          
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Technologies</label>
            {formData.technologies.map((tech, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <Input className="flex-1" value={tech} onChange={e => handleArrayChange('technologies', idx, e.target.value)} placeholder="e.g. React.js" />
                <Button variant="danger" size="sm" onClick={() => removeArrayItem('technologies', idx)}><Trash2 size={14}/></Button>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => addArrayItem('technologies')}>+ Add Tech</Button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Responsibilities</label>
            {formData.responsibilities.map((resp, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <Input className="flex-1" value={resp} onChange={e => handleArrayChange('responsibilities', idx, e.target.value)} placeholder="Built full-stack feature..." />
                <Button variant="danger" size="sm" onClick={() => removeArrayItem('responsibilities', idx)}><Trash2 size={14}/></Button>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => addArrayItem('responsibilities')}>+ Add Responsibility</Button>
          </div>

          <Input label="Sort Order" type="number" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
          
          <div className="flex items-center gap-2 pt-4 border-t border-slate-700/50">
            <input type="checkbox" id="enabledExp" checked={formData.enabled} onChange={e => setFormData({...formData, enabled: e.target.checked})} className="rounded bg-slate-800 border-slate-700 text-primary" />
            <label htmlFor="enabledExp" className="text-sm text-slate-300">Visible on public portfolio</label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Experience</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleDelete} loading={saving}
        title="Delete Experience" message={`Are you sure you want to delete ${currentExp?.role} at ${currentExp?.company}?`} 
      />
    </div>
  );
};

export default Experience;
