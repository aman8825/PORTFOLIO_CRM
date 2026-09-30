import { useState, useEffect } from 'react';
import { getMedia, uploadImage, deleteImage } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Image as ImageIcon, Trash2, Copy, UploadCloud, File, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';

const MediaLibrary = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await getMedia();
      if (res.data.success) {
        setMedia(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch media', err);
      toast.error('Failed to load media library');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'portfolio/media-library');

    setUploading(true);
    toast.loading('Uploading file...', { id: 'upload' });
    try {
      await uploadImage(formData);
      toast.success('File uploaded successfully!', { id: 'upload' });
      fetchMedia();
    } catch (err) {
      toast.error('Upload failed', { id: 'upload' });
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleDelete = async (publicId) => {
    if (!window.confirm('Are you sure you want to permanently delete this file?')) return;
    try {
      toast.loading('Deleting file...', { id: 'delete' });
      await deleteImage(publicId);
      toast.success('File deleted', { id: 'delete' });
      fetchMedia();
    } catch (err) {
      toast.error('Delete failed', { id: 'delete' });
      console.error(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('URL copied to clipboard!');
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading && media.length === 0) {
    return <div className="p-8 text-center text-slate-400">Loading Media Library...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <PageHeader 
          title="Media Library" 
          description="Manage images and files uploaded across your portfolio."
        />
        
        <label className="relative cursor-pointer group">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload} 
            disabled={uploading}
          />
          <div className={`flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors font-medium text-sm ${uploading ? 'opacity-70 pointer-events-none' : ''}`}>
            {uploading ? <UploadCloud size={16} className="animate-bounce" /> : <ImagePlus size={16} />}
            {uploading ? 'Uploading...' : 'Upload Image'}
          </div>
        </label>
      </div>

      {media.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-slate-700/50">
          <ImageIcon size={48} className="mx-auto text-slate-500 mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">Library is Empty</h3>
          <p className="text-slate-400">Upload images to use in your articles and projects.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {media.map((item) => (
            <div key={item._id} className="group relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700/50 aspect-square">
              <img 
                src={item.url} 
                alt={item.filename} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => copyToClipboard(item.url)}
                    className="p-1.5 bg-slate-700/80 hover:bg-primary text-white rounded-md transition-colors"
                    title="Copy URL"
                  >
                    <Copy size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.publicId)}
                    className="p-1.5 bg-slate-700/80 hover:bg-red-500 text-white rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div>
                  <p className="text-white text-xs font-medium truncate mb-1" title={item.filename}>
                    {item.filename}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-300">
                    <span className="uppercase">{item.format}</span>
                    <span>{formatSize(item.size)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
