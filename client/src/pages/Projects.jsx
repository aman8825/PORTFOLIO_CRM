import { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../services/api';
import { notify } from '../utils/toast';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { Plus, Edit2, Trash2, Globe, Star, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { ImageUploader } from '../components/ui/ImageUploader';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const initialForm = {
    title: '', slug: '', shortDescription: '', detailedDescription: '',
    category: '', technologies: [''], features: [''],
    githubUrl: '', liveDemoUrl: '', thumbnailImage: null, galleryImages: [],
    featured: false, published: true, order: 0,
    caseStudy: {
      enabled: false,
      summary: '', overview: '', problem: '', solution: '',
      features: [], challenges: [],
      implementation: '', architecture: '', outcome: '', role: '', duration: '', team: ''
    },
    documents: []
  };
  
  const [formData, setFormData] = useState(initialForm);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      setProjects(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openModal = (project = null) => {
    if (project) {
      setCurrentProject(project);
      setFormData(project);
    } else {
      setCurrentProject(null);
      setFormData(initialForm);
    }
    setActiveTab('basic');
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

  
  const handleNestedArrayChange = (parent, field, index, key, value) => {
    const newParent = { ...(formData[parent] || {}) };
    const newArray = [...(newParent[field] || [])];
    newArray[index] = { ...newArray[index], [key]: value };
    newParent[field] = newArray;
    setFormData({ ...formData, [parent]: newParent });
  };

  const addNestedArrayItem = (parent, field, emptyObj) => {
    const newParent = { ...(formData[parent] || {}) };
    newParent[field] = [...(newParent[field] || []), emptyObj];
    setFormData({ ...formData, [parent]: newParent });
  };

  const removeNestedArrayItem = (parent, field, index) => {
    const newParent = { ...(formData[parent] || {}) };
    const newArray = [...(newParent[field] || [])];
    newArray.splice(index, 1);
    newParent[field] = newArray;
    setFormData({ ...formData, [parent]: newParent });
  };

  const handleDocumentChange = (index, key, value) => {
    const newDocs = [...(formData.documents || [])];
    newDocs[index] = { ...newDocs[index], [key]: value };
    setFormData({ ...formData, documents: newDocs });
  };
  
  const addDocument = () => {
    const newDocs = [...(formData.documents || []), { title: '', url: '', type: 'Documentation', description: '', visible: true, order: (formData.documents?.length || 0) + 1 }];
    setFormData({ ...formData, documents: newDocs });
  };
  
  const removeDocument = (index) => {
    const newDocs = [...(formData.documents || [])];
    newDocs.splice(index, 1);
    setFormData({ ...formData, documents: newDocs });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleanData = { ...formData };
      cleanData.technologies = (cleanData.technologies || []).filter(t => typeof t === 'string' && t.trim() !== '');
      cleanData.features = (cleanData.features || []).filter(f => typeof f === 'string' && f.trim() !== '');
      
      delete cleanData._id;
      delete cleanData.createdAt;
      delete cleanData.updatedAt;
      delete cleanData.__v;

      // Ensure images are objects as expected by the schema, in case they are legacy strings
      if (typeof cleanData.thumbnailImage === 'string') {
        cleanData.thumbnailImage = { url: cleanData.thumbnailImage };
      }
      if (Array.isArray(cleanData.galleryImages)) {
        cleanData.galleryImages = cleanData.galleryImages.map(img => 
          typeof img === 'string' ? { url: img } : img
        );
      }

      if (currentProject) {
        await updateProject(currentProject._id, cleanData);
        notify.success('Project updated successfully.');
      } else {
        await createProject(cleanData);
        notify.success('Project created successfully.');
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
      notify.error('Unable to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (project, field) => {
    try {
      await updateProject(project._id, { [field]: !project[field] });
      setProjects(projects.map(p => p._id === project._id ? { ...p, [field]: !project[field] } : p));
      notify.success('Project updated successfully.');
    } catch (err) {
      console.error(err);
      notify.error('Unable to update project.');
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteProject(currentProject._id);
      setIsConfirmOpen(false);
      fetchProjects();
      notify.success('Project deleted successfully.');
    } catch (err) {
      console.error(err);
      notify.error('Unable to delete project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Projects" 
        description="Manage your portfolio projects and case studies."
        action={<Button onClick={() => openModal()}><Plus size={18} /> Add Project</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-400">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 bg-surface border border-slate-700/50 rounded-xl">No projects added yet.</div>
        ) : (
          projects.map(project => (
            <Card key={project._id} className="flex flex-col">
              <div className="relative h-48 bg-slate-800 border-b border-slate-700/50">
                {project.thumbnailImage ? (
                  <img src={project.thumbnailImage.url || project.thumbnailImage} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600"><ImageIcon size={48} /></div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  {project.featured && <span className="bg-amber-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded flex items-center gap-1"><Star size={12}/> Featured</span>}
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${project.published ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {project.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-1">{project.title}</h3>
                <p className="text-xs text-primary mb-3">{project.category}</p>
                <p className="text-sm text-slate-400 line-clamp-2 mb-4">{project.shortDescription}</p>
                
                <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-700/50">
                  <div className="flex gap-2">
                    <button onClick={() => toggleStatus(project, 'published')} className={`p-1.5 rounded-md transition-colors ${project.published ? 'text-green-400 hover:bg-green-400/10' : 'text-slate-500 hover:bg-slate-700'}`} title="Toggle Visibility"><Globe size={18} /></button>
                    <button onClick={() => toggleStatus(project, 'featured')} className={`p-1.5 rounded-md transition-colors ${project.featured ? 'text-amber-400 hover:bg-amber-400/10' : 'text-slate-500 hover:bg-slate-700'}`} title="Toggle Featured"><Star size={18} /></button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openModal(project)}><Edit2 size={14} /> Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => { setCurrentProject(project); setIsConfirmOpen(true); }}><Trash2 size={14} /></Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentProject ? 'Edit Project' : 'Add Project'}>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex border-b border-slate-700/50 mb-4 overflow-x-auto overflow-y-hidden">
            {['basic', 'media', 'links', 'caseStudy', 'documents'].map(tab => (
              <button 
                key={tab} type="button" 
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === tab ? 'text-white border-b-2 border-primary' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {tab === 'caseStudy' ? 'Case Study' : tab === 'basic' ? 'Basic Info' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className={`space-y-4 ${activeTab !== 'basic' ? 'hidden' : ''}`}>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Project Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              <Input label="Slug (URL friendly)" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
            </div>
            <Input label="Category (e.g. Full-Stack)" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
            <Textarea label="Short Description" value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} rows="2" required />
            <Textarea label="Detailed Description" value={formData.detailedDescription} onChange={e => setFormData({...formData, detailedDescription: e.target.value})} rows="4" />
            
            <div className="pt-2 border-t border-slate-700/50">
              <label className="block text-xs font-medium text-slate-400 mb-1">Technologies</label>
              {formData.technologies.map((tech, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input className="flex-1" value={tech} onChange={e => handleArrayChange('technologies', idx, e.target.value)} />
                  <Button type="button" variant="danger" size="sm" onClick={() => removeArrayItem('technologies', idx)}><Trash2 size={14}/></Button>
                </div>
              ))}
              <Button type="button" variant="secondary" size="sm" onClick={() => addArrayItem('technologies')}>+ Add Tech</Button>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Key Features</label>
              {formData.features.map((feature, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input className="flex-1" value={feature} onChange={e => handleArrayChange('features', idx, e.target.value)} />
                  <Button type="button" variant="danger" size="sm" onClick={() => removeArrayItem('features', idx)}><Trash2 size={14}/></Button>
                </div>
              ))}
              <Button type="button" variant="secondary" size="sm" onClick={() => addArrayItem('features')}>+ Add Feature</Button>
            </div>
          </div>

          <div className={`space-y-4 ${activeTab !== 'media' ? 'hidden' : ''}`}>
            <ImageUploader label="Thumbnail Image" folder="portfolio/projects" value={formData.thumbnailImage} onChange={val => setFormData({ ...formData, thumbnailImage: val })} />
            <ImageUploader label="Gallery Images" folder="portfolio/projects/gallery" multiple={true} value={formData.galleryImages} onChange={val => setFormData({ ...formData, galleryImages: val })} />
          </div>

          <div className={`space-y-4 ${activeTab !== 'links' ? 'hidden' : ''}`}>
            <div className="grid grid-cols-2 gap-4">
              <Input label="GitHub URL" value={formData.githubUrl || ''} onChange={e => setFormData({...formData, githubUrl: e.target.value})} />
              <Input label="Live Demo URL" value={formData.liveDemoUrl || ''} onChange={e => setFormData({...formData, liveDemoUrl: e.target.value})} />
            </div>
          </div>

          <div className={`space-y-4 ${activeTab !== 'caseStudy' ? 'hidden' : ''}`}>
            <div className="flex items-center gap-2 mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <input type="checkbox" id="cs-enabled" checked={formData.caseStudy?.enabled || false} onChange={e => setFormData({...formData, caseStudy: {...(formData.caseStudy || {}), enabled: e.target.checked}})} className="rounded bg-slate-800 border-slate-700" />
              <label htmlFor="cs-enabled" className="text-sm font-bold text-white">Enable Case Study Page</label>
            </div>
            
            {(formData.caseStudy?.enabled) && (
              <>
                <Textarea label="Summary (Hero)" value={formData.caseStudy.summary || ''} onChange={e => setFormData({...formData, caseStudy: {...formData.caseStudy, summary: e.target.value}})} rows="2" />
                <Textarea label="Overview" value={formData.caseStudy.overview || ''} onChange={e => setFormData({...formData, caseStudy: {...formData.caseStudy, overview: e.target.value}})} rows="3" />
                <Textarea label="The Problem" value={formData.caseStudy.problem || ''} onChange={e => setFormData({...formData, caseStudy: {...formData.caseStudy, problem: e.target.value}})} rows="3" />
                <Textarea label="The Solution" value={formData.caseStudy.solution || ''} onChange={e => setFormData({...formData, caseStudy: {...formData.caseStudy, solution: e.target.value}})} rows="3" />
                <Textarea label="Architecture" value={formData.caseStudy.architecture || ''} onChange={e => setFormData({...formData, caseStudy: {...formData.caseStudy, architecture: e.target.value}})} rows="3" />
                <Textarea label="Implementation Details" value={formData.caseStudy.implementation || ''} onChange={e => setFormData({...formData, caseStudy: {...formData.caseStudy, implementation: e.target.value}})} rows="3" />
                <Textarea label="Result / Outcome" value={formData.caseStudy.outcome || ''} onChange={e => setFormData({...formData, caseStudy: {...formData.caseStudy, outcome: e.target.value}})} rows="3" />
                
                <div className="grid grid-cols-3 gap-4">
                  <Input label="Role" value={formData.caseStudy.role || ''} onChange={e => setFormData({...formData, caseStudy: {...formData.caseStudy, role: e.target.value}})} />
                  <Input label="Duration" value={formData.caseStudy.duration || ''} onChange={e => setFormData({...formData, caseStudy: {...formData.caseStudy, duration: e.target.value}})} />
                  <Input label="Team Size" value={formData.caseStudy.team || ''} onChange={e => setFormData({...formData, caseStudy: {...formData.caseStudy, team: e.target.value}})} />
                </div>

                <div className="pt-4 border-t border-slate-700/50">
                  <label className="block text-xs font-medium text-slate-400 mb-2">Case Study Features</label>
                  {(formData.caseStudy?.features || []).map((feature, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg mb-2 space-y-2 relative">
                      <Button type="button" variant="danger" size="sm" className="absolute top-2 right-2" onClick={() => removeNestedArrayItem('caseStudy', 'features', idx)}><Trash2 size={14}/></Button>
                      <Input label="Title" value={feature.title || ''} onChange={e => handleNestedArrayChange('caseStudy', 'features', idx, 'title', e.target.value)} />
                      <Textarea label="Description" value={feature.description || ''} onChange={e => handleNestedArrayChange('caseStudy', 'features', idx, 'description', e.target.value)} rows="2" />
                    </div>
                  ))}
                  <Button type="button" variant="secondary" size="sm" onClick={() => addNestedArrayItem('caseStudy', 'features', { title: '', description: '' })}>+ Add Feature</Button>
                </div>

                <div className="pt-4 border-t border-slate-700/50">
                  <label className="block text-xs font-medium text-slate-400 mb-2">Challenges & Solutions</label>
                  {(formData.caseStudy?.challenges || []).map((challenge, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg mb-2 space-y-2 relative">
                      <Button type="button" variant="danger" size="sm" className="absolute top-2 right-2" onClick={() => removeNestedArrayItem('caseStudy', 'challenges', idx)}><Trash2 size={14}/></Button>
                      <Input label="Challenge Title" value={challenge.title || ''} onChange={e => handleNestedArrayChange('caseStudy', 'challenges', idx, 'title', e.target.value)} />
                      <Textarea label="Description" value={challenge.description || ''} onChange={e => handleNestedArrayChange('caseStudy', 'challenges', idx, 'description', e.target.value)} rows="2" />
                      <Textarea label="Solution" value={challenge.solution || ''} onChange={e => handleNestedArrayChange('caseStudy', 'challenges', idx, 'solution', e.target.value)} rows="2" />
                    </div>
                  ))}
                  <Button type="button" variant="secondary" size="sm" onClick={() => addNestedArrayItem('caseStudy', 'challenges', { title: '', description: '', solution: '' })}>+ Add Challenge</Button>
                </div>
              </>
            )}
          </div>

          <div className={`space-y-4 ${activeTab !== 'documents' ? 'hidden' : ''}`}>
            <p className="text-sm text-slate-400 mb-4">Add public Google Drive links or external resources related to this project.</p>
            {(formData.documents || []).map((doc, idx) => (
              <div key={idx} className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg mb-3 space-y-3 relative">
                <Button type="button" variant="danger" size="sm" className="absolute top-4 right-4" onClick={() => removeDocument(idx)}><Trash2 size={14}/></Button>
                <div className="grid grid-cols-2 gap-3 pr-10">
                  <Input label="Title" value={doc.title || ''} onChange={e => handleDocumentChange(idx, 'title', e.target.value)} />
                  <Input label="Type (e.g. Documentation, Presentation)" value={doc.type || ''} onChange={e => handleDocumentChange(idx, 'type', e.target.value)} />
                </div>
                <Input label="URL (Google Drive Link)" value={doc.url || ''} onChange={e => handleDocumentChange(idx, 'url', e.target.value)} />
                <Textarea label="Description" value={doc.description || ''} onChange={e => handleDocumentChange(idx, 'description', e.target.value)} rows="2" />
                <div className="flex items-center gap-2">
                  <input type="checkbox" id={`doc-visible-${idx}`} checked={doc.visible !== false} onChange={e => handleDocumentChange(idx, 'visible', e.target.checked)} className="rounded bg-slate-800 border-slate-700" />
                  <label htmlFor={`doc-visible-${idx}`} className="text-sm text-slate-300">Visible publicly</label>
                </div>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addDocument}>+ Add Document</Button>
          </div>

          <div className="flex gap-6 pt-4 border-t border-slate-700/50">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={formData.published} onChange={e => setFormData({...formData, published: e.target.checked})} className="rounded bg-slate-800 border-slate-700" />
              <label htmlFor="published" className="text-sm text-slate-300">Published</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} className="rounded bg-slate-800 border-slate-700" />
              <label htmlFor="featured" className="text-sm text-slate-300">Featured</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Project</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleDelete} loading={saving}
        title="Delete Project" message={`Are you sure you want to delete ${currentProject?.title}?`} 
      />
    </div>
  );
};

export default Projects;
