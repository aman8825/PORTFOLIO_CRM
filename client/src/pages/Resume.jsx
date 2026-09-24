import { useState, useEffect } from 'react';
import { getResumes, createResume, updateResume, deleteResume } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { FileText, Download, CheckCircle, Trash2, Plus, Eye } from 'lucide-react';

const Resume = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentRes, setCurrentRes] = useState(null);
  const [saving, setSaving] = useState(false);

  const initialForm = { fileName: '', fileUrl: '', fileSize: '', isActive: true };
  const [formData, setFormData] = useState(initialForm);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await getResumes();
      setResumes(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const openModal = () => {
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createResume(formData);
      setIsModalOpen(false);
      fetchResumes();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const setActive = async (res) => {
    if (res.isActive) return;
    try {
      await updateResume(res._id, { isActive: true });
      fetchResumes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteResume(currentRes._id);
      setIsConfirmOpen(false);
      fetchResumes();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Resume Management" 
        description="Manage your CV files. Only one resume can be active at a time."
        action={<Button onClick={openModal}><Plus size={18} /> Add Resume Link</Button>}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">Upload Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center p-8">Loading...</td></tr>
              ) : resumes.length === 0 ? (
                <tr><td colSpan="4" className="text-center p-8 text-slate-500">No resumes found.</td></tr>
              ) : (
                resumes.map(res => (
                  <tr key={res._id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700 rounded-lg text-slate-300"><FileText size={20} /></div>
                        <div>
                          <div className="font-medium text-white">{res.fileName}</div>
                          <div className="text-xs text-slate-400">{res.fileSize || 'Unknown size'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{new Date(res.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {res.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                          <CheckCircle size={14} /> Active
                        </span>
                      ) : (
                        <button onClick={() => setActive(res)} className="text-xs text-primary hover:text-blue-400 underline transition-colors">
                          Set Active
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors" title="Preview/Download">
                        <Eye size={16} />
                      </a>
                      <button onClick={() => { setCurrentRes(res); setIsConfirmOpen(true); }} className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors" title="Delete">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Resume Link">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="File Name (e.g. John_Doe_Resume_2026.pdf)" value={formData.fileName} onChange={e => setFormData({...formData, fileName: e.target.value})} required />
          <Input label="Direct File URL (e.g. Google Drive, AWS S3)" value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} required />
          <Input label="File Size (e.g. 2.4 MB)" value={formData.fileSize} onChange={e => setFormData({...formData, fileSize: e.target.value})} />
          
          <div className="flex items-center gap-2 pt-4 border-t border-slate-700/50">
            <input type="checkbox" id="active" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded bg-slate-800 border-slate-700 text-primary" />
            <label htmlFor="active" className="text-sm text-slate-300">Set as active resume immediately</label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Resume</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleDelete} loading={saving}
        title="Delete Resume" message={`Are you sure you want to delete ${currentRes?.fileName}? This action cannot be undone.`} 
      />
    </div>
  );
};

export default Resume;
