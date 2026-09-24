import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Save, UserCircle2, ArrowUp, ArrowDown, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { ImageUploader } from '../components/ui/ImageUploader';

const TABS = ['Basic', 'Professional', 'Social Links', 'Contact', 'Media & Resume', 'Availability', 'SEO & Visibility'];

const defaultProfile = {
  basic: { fullName: '', professionalName: '', headline: '', shortBio: '', longBio: '', location: '', profileImage: null },
  professional: { primaryRole: '', currentFocus: '', skills: [], currentStatus: '' },
  contact: { email: '', phone: '', whatsapp: '', contactPreference: 'email' },
  socialLinks: [],
  availability: { status: 'Available', message: '', visible: true },
  resume: { url: '', publicId: '', fileName: '', updatedAt: null },
  visibility: { email: true, phone: true, location: true, socialLinks: true, profileImage: true },
  seo: { title: '', description: '', keywords: '', ogTitle: '', ogDescription: '', ogImage: '' }
};

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('Basic');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState(defaultProfile);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        if (res.data.success && res.data.data) {
          setFormData({ ...defaultProfile, ...res.data.data });
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await updateProfile(formData);
      setStatus({ type: 'success', message: 'Profile updated successfully' });
      setHasUnsavedChanges(false);
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  // Social Links Handlers
  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: '', name: '', url: '', visible: true, order: prev.socialLinks.length + 1 }]
    }));
    setHasUnsavedChanges(true);
  };

  const updateSocialLink = (index, field, value) => {
    const newLinks = [...formData.socialLinks];
    newLinks[index][field] = value;
    setFormData(prev => ({ ...prev, socialLinks: newLinks }));
    setHasUnsavedChanges(true);
  };

  const removeSocialLink = (index) => {
    const newLinks = formData.socialLinks.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, socialLinks: newLinks }));
    setHasUnsavedChanges(true);
  };

  const moveSocialLink = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === formData.socialLinks.length - 1)) return;
    const newLinks = [...formData.socialLinks];
    const temp = newLinks[index];
    newLinks[index] = newLinks[index + direction];
    newLinks[index + direction] = temp;
    // Update order values
    newLinks.forEach((link, i) => { link.order = i + 1; });
    setFormData(prev => ({ ...prev, socialLinks: newLinks }));
    setHasUnsavedChanges(true);
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Profile Control Center...</div>;

  return (
    <div>
      <PageHeader 
        title="Profile & Portfolio Control Center" 
        description="Manage everything that represents you publicly."
      />

      {status && (
        <div className={`mb-6 p-4 rounded-lg text-sm border ${status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}

          {/* Small Live Preview Card */}
          <Card className="mt-8">
            <CardBody className="flex flex-col items-center text-center p-4">
              {formData.basic.profileImage ? (
                <img src={formData.basic.profileImage.url || formData.basic.profileImage} alt="Profile" className="w-20 h-20 rounded-full object-cover mb-3 border border-slate-700" />
              ) : (
                <UserCircle2 size={64} className="text-slate-600 mb-3" />
              )}
              <h3 className="text-md font-bold text-white">{formData.basic.fullName || 'Your Name'}</h3>
              <p className="text-primary text-xs font-medium">{formData.basic.headline || 'Professional Title'}</p>
            </CardBody>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardBody className="space-y-6">
                
                {/* BASIC PROFILE */}
                {activeTab === 'Basic' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white mb-4">Basic Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Full Name" value={formData.basic.fullName} onChange={e => handleChange('basic', 'fullName', e.target.value)} required />
                      <Input label="Professional Name (Optional)" value={formData.basic.professionalName} onChange={e => handleChange('basic', 'professionalName', e.target.value)} />
                      <Input label="Headline" value={formData.basic.headline} onChange={e => handleChange('basic', 'headline', e.target.value)} required />
                      <Input label="Location" value={formData.basic.location} onChange={e => handleChange('basic', 'location', e.target.value)} />
                    </div>
                    <Textarea label="Short Bio" value={formData.basic.shortBio} onChange={e => handleChange('basic', 'shortBio', e.target.value)} rows="3" />
                    <Textarea label="Long Bio" value={formData.basic.longBio} onChange={e => handleChange('basic', 'longBio', e.target.value)} rows="6" />
                  </div>
                )}

                {/* PROFESSIONAL */}
                {activeTab === 'Professional' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white mb-4">Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Primary Role" value={formData.professional.primaryRole} onChange={e => handleChange('professional', 'primaryRole', e.target.value)} />
                      <Input label="Current Focus" value={formData.professional.currentFocus} onChange={e => handleChange('professional', 'currentFocus', e.target.value)} />
                      <Input label="Current Status" value={formData.professional.currentStatus} onChange={e => handleChange('professional', 'currentStatus', e.target.value)} />
                      <Input label="Skills (Comma separated)" value={formData.professional.skills.join(', ')} onChange={e => handleChange('professional', 'skills', e.target.value.split(',').map(s => s.trim()))} />
                    </div>
                  </div>
                )}

                {/* SOCIAL LINKS */}
                {activeTab === 'Social Links' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-white">Social Links</h3>
                      <Button type="button" size="sm" onClick={addSocialLink}><Plus size={16} className="mr-2" /> Add Link</Button>
                    </div>
                    
                    {formData.socialLinks.map((link, index) => (
                      <div key={index} className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex flex-col gap-2 flex-grow w-full">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Platform (e.g. GitHub)" value={link.platform} onChange={e => updateSocialLink(index, 'platform', e.target.value)} required />
                            <Input label="URL (https://...)" type="url" value={link.url} onChange={e => updateSocialLink(index, 'url', e.target.value)} required />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                          <Button type="button" variant="ghost" size="icon" onClick={() => updateSocialLink(index, 'visible', !link.visible)}>
                            {link.visible ? <Eye size={16} className="text-green-400" /> : <EyeOff size={16} className="text-slate-500" />}
                          </Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => moveSocialLink(index, -1)} disabled={index === 0}>
                            <ArrowUp size={16} />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => moveSocialLink(index, 1)} disabled={index === formData.socialLinks.length - 1}>
                            <ArrowDown size={16} />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => removeSocialLink(index)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {formData.socialLinks.length === 0 && (
                      <p className="text-slate-400 text-sm text-center py-4">No social links added yet.</p>
                    )}
                  </div>
                )}

                {/* CONTACT */}
                {activeTab === 'Contact' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Email Address" type="email" value={formData.contact.email} onChange={e => handleChange('contact', 'email', e.target.value)} />
                      <Input label="Phone Number" value={formData.contact.phone} onChange={e => handleChange('contact', 'phone', e.target.value)} />
                      <Input label="WhatsApp Number" value={formData.contact.whatsapp} onChange={e => handleChange('contact', 'whatsapp', e.target.value)} />
                      <div className="flex flex-col">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Contact Preference</label>
                        <select 
                          value={formData.contact.contactPreference} 
                          onChange={e => handleChange('contact', 'contactPreference', e.target.value)}
                          className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="whatsapp">WhatsApp</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* MEDIA & RESUME */}
                {activeTab === 'Media & Resume' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Profile Image</h3>
                      <ImageUploader
                        label="Upload Image"
                        folder="portfolio/profile"
                        value={formData.basic.profileImage}
                        onChange={(val) => handleChange('basic', 'profileImage', val)}
                      />
                    </div>
                    
                    <div className="border-t border-slate-700/50 pt-8">
                      <h3 className="text-lg font-medium text-white mb-4">Resume Document</h3>
                      <Input 
                        label="Resume Public URL" 
                        placeholder="https://drive.google.com/..." 
                        value={formData.resume.url} 
                        onChange={e => handleChange('resume', 'url', e.target.value)} 
                      />
                      <p className="text-xs text-slate-400 mt-1">Provide a public link to your resume (PDF recommended).</p>
                    </div>
                  </div>
                )}

                {/* AVAILABILITY */}
                {activeTab === 'Availability' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white mb-4">Availability Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                        <select 
                          value={formData.availability.status} 
                          onChange={e => handleChange('availability', 'status', e.target.value)}
                          className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="Available">Available</option>
                          <option value="Open to Opportunities">Open to Opportunities</option>
                          <option value="Available for Freelance">Available for Freelance</option>
                          <option value="Currently Working">Currently Working</option>
                          <option value="Not Available">Not Available</option>
                        </select>
                      </div>
                      <Input label="Availability Message" placeholder="e.g. Open to Full Stack roles" value={formData.availability.message} onChange={e => handleChange('availability', 'message', e.target.value)} />
                    </div>
                  </div>
                )}

                {/* SEO & VISIBILITY */}
                {activeTab === 'SEO & Visibility' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">SEO / Identity</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Site Title" value={formData.seo.title} onChange={e => handleChange('seo', 'title', e.target.value)} />
                        <Input label="Keywords" value={formData.seo.keywords} onChange={e => handleChange('seo', 'keywords', e.target.value)} />
                      </div>
                      <div className="mt-4">
                        <Textarea label="Site Description" value={formData.seo.description} onChange={e => handleChange('seo', 'description', e.target.value)} rows="3" />
                      </div>
                    </div>

                    <div className="border-t border-slate-700/50 pt-8">
                      <h3 className="text-lg font-medium text-white mb-4">Public Visibility</h3>
                      <div className="space-y-3">
                        {Object.entries(formData.visibility).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                            <span className="text-sm text-slate-300 capitalize">Show {key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={value} 
                                onChange={e => handleChange('visibility', key, e.target.checked)} 
                                className="sr-only peer" 
                              />
                              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </CardBody>
              
              <div className="p-4 md:p-6 border-t border-slate-700/50 bg-slate-800/20 flex justify-between items-center">
                <div className="text-sm font-medium">
                  {hasUnsavedChanges ? <span className="text-amber-400">● Unsaved changes</span> : <span className="text-slate-500">All changes saved</span>}
                </div>
                <div className="flex gap-4">
                  <Button type="button" variant="secondary" onClick={() => window.location.reload()} disabled={!hasUnsavedChanges}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={saving} disabled={!hasUnsavedChanges}>
                    <Save size={18} className="mr-2" /> Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
