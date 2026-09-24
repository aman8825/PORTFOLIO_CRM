import { useState } from 'react';
import axios from 'axios';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';

const TestContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: false });

    try {
      await axios.post('/messages', formData);
      setStatus({ loading: false, error: '', success: true });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ 
        loading: false, 
        error: err.response?.data?.message || 'Failed to send message', 
        success: false 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-slate-700/50 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Contact Me</h1>
          <p className="text-slate-400 text-sm">Send a message to test the public API</p>
        </div>

        {status.success ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <CheckCircle2 size={48} className="text-green-400" />
            <h3 className="text-xl font-medium text-white">Message Sent!</h3>
            <p className="text-slate-400 text-sm">We've received your message and will reply soon.</p>
            <button 
              onClick={() => setStatus({ ...status, success: false })}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Send Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                {status.error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Subject</label>
              <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Message</label>
              <textarea required rows="4" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
            </div>

            <button disabled={status.loading} type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
              {status.loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Send Message</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TestContactForm;
