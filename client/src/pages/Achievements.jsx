import { useState, useEffect } from 'react';
import { getAchievements, createAchievement, updateAchievement, deleteAchievement } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { ImageUploader } from '../components/ui/ImageUploader';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentAch, setCurrentAch] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Flip state for mobile tap
  const [flippedIds, setFlippedIds] = useState({});

  const initialForm = {
    title: '', issuer: '', date: '', description: '',
    score: '', badge: '', certificateImage: null, certificateUrl: '',
    order: 0, enabled: true
  };
  
  const [formData, setFormData] = useState(initialForm);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const res = await getAchievements();
      setAchievements(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const openModal = (ach = null) => {
    if (ach) {
      setCurrentAch(ach);
      const formatted = { ...ach };
      if (formatted.date) formatted.date = new Date(formatted.date).toISOString().split('T')[0];
      setFormData(formatted);
    } else {
      setCurrentAch(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (currentAch) {
        await updateAchievement(currentAch._id, formData);
      } else {
        await createAchievement(formData);
      }
      setIsModalOpen(false);
      fetchAchievements();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (ach) => {
    try {
      await updateAchievement(ach._id, { enabled: !ach.enabled });
      setAchievements(achievements.map(a => a._id === ach._id ? { ...a, enabled: !ach.enabled } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteAchievement(currentAch._id);
      setIsConfirmOpen(false);
      fetchAchievements();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleFlip = (id) => {
    setFlippedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      <PageHeader 
        title="Achievements" 
        description="Manage your certifications, awards, and milestones."
        action={<Button onClick={() => openModal()}><Plus size={18} /> Add Achievement</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-400">Loading...</div>
        ) : achievements.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 bg-surface border border-slate-700/50 rounded-xl">No achievements added yet.</div>
        ) : (
          achievements.map(ach => (
            <div key={ach._id} className="relative flex flex-col h-[320px] group perspective-1000" onClick={() => toggleFlip(ach._id)} tabIndex="0" onKeyDown={(e) => e.key === 'Enter' && toggleFlip(ach._id)}>
              {/* Flip Container */}
              <motion.div 
                className="w-full h-full relative preserve-3d transition-transform duration-500"
                animate={{ rotateY: flippedIds[ach._id] ? 180 : 0 }}
                whileHover={{ rotateY: 180 }}
              >
                {/* Front Face */}
                <Card className="absolute w-full h-full backface-hidden flex flex-col p-6 shadow-xl border-slate-700/50 bg-slate-800">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-primary/20 text-primary rounded-xl"><Award size={24} /></div>
                    {ach.badge && <span className="bg-amber-500/20 text-amber-500 text-xs font-bold px-2 py-1 rounded">{ach.badge}</span>}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">{ach.title}</h3>
                  <p className="text-sm text-primary mb-2">{ach.issuer}</p>
                  <p className="text-xs text-slate-400 mb-4">{new Date(ach.date).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-300 line-clamp-3 mb-auto">{ach.description}</p>
                  
                  {ach.score && <div className="mt-4 text-xs font-medium bg-slate-700/50 text-slate-300 px-3 py-2 rounded">Score: {ach.score}</div>}
                </Card>

                {/* Back Face */}
                <Card className="absolute w-full h-full backface-hidden flex flex-col shadow-xl border-slate-700/50 bg-slate-800" style={{ transform: 'rotateY(180deg)' }}>
                  {ach.certificateImage ? (
                    <img src={ach.certificateImage.url || ach.certificateImage} alt={ach.title} className="w-full h-full object-cover rounded-xl opacity-80" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                      <Award size={48} className="text-slate-600 mb-4" />
                      <p className="text-slate-400 text-sm">No certificate image provided.</p>
                    </div>
                  )}
                  {ach.certificateUrl && (
                    <a href={ach.certificateUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors" onClick={(e) => e.stopPropagation()}>
                      View Original
                    </a>
                  )}
                </Card>
              </motion.div>

              {/* Management Controls (outside flip logic) */}
              <div className="absolute -bottom-14 left-0 w-full flex justify-between items-center bg-surface border border-slate-700/50 p-2 rounded-lg z-10" onClick={e => e.stopPropagation()}>
                <button onClick={() => toggleEnabled(ach)} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${ach.enabled ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                  {ach.enabled ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  {ach.enabled ? 'Active' : 'Hidden'}
                </button>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openModal(ach)}><Edit2 size={14} /></Button>
                  <Button variant="danger" size="sm" onClick={() => { setCurrentAch(ach); setIsConfirmOpen(true); }}><Trash2 size={14} /></Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="h-16"></div> {/* Bottom padding for floating controls */}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentAch ? 'Edit Achievement' : 'Add Achievement'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Title/Award Name" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Issuer/Organization" value={formData.issuer} onChange={e => setFormData({...formData, issuer: e.target.value})} required />
            <Input label="Date Received" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
          </div>
          <Textarea label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Score/Grade (optional)" value={formData.score} onChange={e => setFormData({...formData, score: e.target.value})} />
            <Input label="Badge (e.g. Gold, Top 1%)" value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} />
          </div>

          <ImageUploader
            label="Certificate Image"
            folder="portfolio/certificates"
            value={formData.certificateImage}
            onChange={val => setFormData({ ...formData, certificateImage: val })}
          />
          <Input label="Certificate Verification URL" value={formData.certificateUrl} onChange={e => setFormData({...formData, certificateUrl: e.target.value})} />
          <Input label="Sort Order" type="number" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
          
          <div className="flex items-center gap-2 pt-4 border-t border-slate-700/50">
            <input type="checkbox" id="enabledAch" checked={formData.enabled} onChange={e => setFormData({...formData, enabled: e.target.checked})} className="rounded bg-slate-800 border-slate-700 text-primary" />
            <label htmlFor="enabledAch" className="text-sm text-slate-300">Visible on public portfolio</label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Achievement</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleDelete} loading={saving}
        title="Delete Achievement" message={`Are you sure you want to delete ${currentAch?.title}?`} 
      />
    </div>
  );
};

export default Achievements;
