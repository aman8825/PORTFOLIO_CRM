import { useState } from 'react';
import axios from 'axios';
import { Send, X, Loader2 } from 'lucide-react';

const ReplyComposer = ({ message, onClose, onSuccess }) => {
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!replyText.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      await axios.post(`/messages/${message._id}/reply`, { replyMessage: replyText });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const subjectPrefix = message.subject.toLowerCase().startsWith('re:') ? '' : 'Re: ';

  return (
    <div className="mt-6 border-t border-slate-700/50 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <Send size={18} className="text-primary" />
          Reply to {message.name}
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">To</label>
          <div className="text-sm text-slate-200 bg-slate-800/50 px-3 py-2 rounded border border-slate-700/50">
            {message.email}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Subject</label>
          <div className="text-sm text-slate-200 bg-slate-800/50 px-3 py-2 rounded border border-slate-700/50">
            {subjectPrefix}{message.subject}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Message</label>
          <textarea
            rows="6"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Type your reply here..."
          ></textarea>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !replyText.trim()}
            className="px-4 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Reply'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyComposer;
