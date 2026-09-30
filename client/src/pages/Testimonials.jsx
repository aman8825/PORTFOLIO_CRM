import { useState, useEffect } from 'react';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Edit2, Trash2, X, Eye, EyeOff, Save, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '', role: '', company: '', message: '', profileImage: '', linkedinUrl: '', featured: false, published: true, order: 0
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTestimonials(); }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await getTestimonials();
      if (res.data.success) setTestimonials(res.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({ name: '', role: '', company: '', message: '', profileImage: '', linkedinUrl: '', featured: false, published: true, order: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) await updateTestimonial(editingItem._id, formData);
      else await createTestimonial(formData);
      await fetchTestimonials();
      setIsModalOpen(false);
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this testimonial?')) {
      await deleteTestimonial(id);
      fetchTestimonials();
    }
  };

  const togglePublish = async (item) => {
    await updateTestimonial(item._id, { published: !item.published });
    fetchTestimonials();
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <PageHeader title="Testimonials" description="Manage client reviews and endorsements." />
        <Button onClick={() => handleOpenModal()}><Plus size={16} /> New Testimonial</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((item) => (
          <Card key={item._id} className="flex flex-col">
            <CardBody className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {item.profileImage ? (
                    <img src={item.profileImage} alt={item.name} className="w-10 h-10 rounded-full object-cover bg-slate-800" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-white text-sm leading-tight">{item.name}</h4>
                    <p className="text-xs text-slate-400">{item.role} @ {item.company}</p>
                  </div>
                </div>
                <button
                  onClick={() => togglePublish(item)}
                  title={item.published ? 'Unpublish' : 'Publish'}
                  className={`p-1.5 rounded-lg transition-colors ${item.published ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}
                >
                  {item.published ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              <p className="text-sm text-slate-300 italic mb-4 flex-1">"{item.message}"</p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.featured ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                  {item.featured ? 'Featured' : 'Standard'}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(item._id)} className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface border border-slate-700/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-surface/80 backdrop-blur-md p-6 border-b border-slate-700/50 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-white">{editingItem ? 'Edit Testimonial' : 'New Testimonial'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  <Input label="Role" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                  <Input label="Company" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                  <Input label="LinkedIn URL" value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                  <textarea required rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-3 bg-slate-900 border border-slate-700/50 rounded-xl text-white focus:border-primary" />
                </div>
                <Input label="Profile Image URL" value={formData.profileImage} onChange={e => setFormData({...formData, profileImage: e.target.value})} />
                
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.published} onChange={e => setFormData({...formData, published: e.target.checked})} className="w-4 h-4" />
                    <span className="text-white text-sm">Published</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} className="w-4 h-4" />
                    <span className="text-white text-sm">Featured</span>
                  </label>
                </div>
                
                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-700/50">
                  <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" loading={saving}><Save size={16} /> Save</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Testimonials;
