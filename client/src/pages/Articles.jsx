import { useState, useEffect } from 'react';
import { getArticles, createArticle, updateArticle, deleteArticle } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Edit2, Trash2, X, Eye, EyeOff, Save, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    coverImage: '',
    tags: '',
    isPublished: false
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await getArticles();
      if (res.data.success) {
        setArticles(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch articles', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        coverImage: article.coverImage || '',
        tags: article.tags ? article.tags.join(', ') : '',
        isPublished: article.isPublished
      });
    } else {
      setEditingArticle(null);
      setFormData({
        title: '',
        content: '',
        coverImage: '',
        tags: '',
        isPublished: false
      });
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      if (editingArticle) {
        await updateArticle(editingArticle._id, payload);
      } else {
        await createArticle(payload);
      }

      await fetchArticles();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(id);
        await fetchArticles();
      } catch (err) {
        console.error('Failed to delete article', err);
      }
    }
  };

  const togglePublish = async (article) => {
    try {
      await updateArticle(article._id, { isPublished: !article.isPublished });
      await fetchArticles();
    } catch (err) {
      console.error('Failed to toggle publish status', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Articles...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <PageHeader 
          title="Articles & Blog" 
          description="Write and publish technical articles or development logs."
        />
        <Button onClick={() => handleOpenModal()}>
          <Plus size={16} /> New Article
        </Button>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-slate-700/50">
          <FileText size={48} className="mx-auto text-slate-500 mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">No Articles Yet</h3>
          <p className="text-slate-400 mb-6">Start writing your first blog post or dev log.</p>
          <Button onClick={() => handleOpenModal()}>Create Article</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card key={article._id} className="flex flex-col">
              <CardBody className="flex-1 flex flex-col p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight">{article.title}</h3>
                  <button
                    onClick={() => togglePublish(article)}
                    title={article.isPublished ? 'Unpublish' : 'Publish'}
                    className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ml-2 ${
                      article.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {article.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                
                <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">
                  {article.content.substring(0, 150)}...
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-500">+{article.tags.length - 3}</span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
                  <span className="text-xs text-slate-500">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(article)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(article._id)}
                      className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Article Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-slate-700/50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-surface/80 backdrop-blur-md p-6 border-b border-slate-700/50 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-white">
                  {editingArticle ? 'Edit Article' : 'New Article'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    <Input 
                      label="Article Title" 
                      required 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g. My journey into Web3"
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Content (Markdown/HTML supported)</label>
                      <textarea
                        required
                        rows={15}
                        value={formData.content}
                        onChange={e => setFormData({...formData, content: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700/50 rounded-xl focus:outline-none focus:border-primary text-white resize-y font-mono text-sm leading-relaxed"
                        placeholder="Write your article here..."
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Input 
                      label="Cover Image URL (Optional)" 
                      value={formData.coverImage}
                      onChange={e => setFormData({...formData, coverImage: e.target.value})}
                      placeholder="https://..."
                    />
                    
                    <Input 
                      label="Tags (Comma separated)" 
                      value={formData.tags}
                      onChange={e => setFormData({...formData, tags: e.target.value})}
                      placeholder="React, JavaScript, Tutorial"
                    />

                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isPublished}
                          onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                          className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-primary focus:ring-primary focus:ring-offset-slate-800"
                        />
                        <div>
                          <p className="text-white font-medium">Publish Immediately</p>
                          <p className="text-xs text-slate-400">Make this article visible to the public</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-700/50">
                  <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={saving}>
                    <Save size={16} />
                    {editingArticle ? 'Update Article' : 'Save Article'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Articles;
