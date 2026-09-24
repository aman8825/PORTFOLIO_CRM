import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Archive, Trash2, Mail, MailOpen, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ReplyComposer from '../components/ReplyComposer';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]); // Re-fetch on status change. Search will be handled locally or via debounced API call.

  const fetchMessages = async (searchQuery = search) => {
    setLoading(true);
    try {
      const res = await axios.get(`/messages`, {
        params: { status: statusFilter, search: searchQuery }
      });
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMessages(search);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`/messages/${id}`, { status: newStatus });
      fetchMessages(); // Refresh list
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await axios.delete(`/messages/${id}`);
      fetchMessages();
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Failed to delete message', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Inbox List */}
      <div className="w-full lg:w-1/3 flex flex-col bg-surface rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/50 space-y-4">
          <h2 className="text-xl font-bold text-white">Inbox</h2>
          
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search messages..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
          </form>

          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800/50 border border-slate-700 text-sm rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center text-slate-500">
              <MailOpen size={48} className="mb-4 opacity-50" />
              <p>No messages found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {messages.map(msg => (
                <div 
                  key={msg._id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (msg.status === 'unread') updateStatus(msg._id, 'read');
                  }}
                  className={`p-4 cursor-pointer hover:bg-slate-800/50 transition-colors ${selectedMessage?._id === msg._id ? 'bg-slate-800 border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-medium truncate pr-4 ${msg.status === 'unread' ? 'text-white' : 'text-slate-300'}`}>
                      {msg.name}
                    </span>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-sm mb-1 truncate ${msg.status === 'unread' ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
                    {msg.subject}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${
                      msg.status === 'unread' ? 'bg-blue-500/20 text-blue-400' :
                      msg.status === 'replied' ? 'bg-green-500/20 text-green-400' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {msg.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className="w-full lg:w-2/3 flex flex-col bg-surface rounded-xl border border-slate-700/50 overflow-hidden">
        {selectedMessage ? (
          <>
            {/* Detail Header */}
            <div className="p-4 md:p-6 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{selectedMessage.subject}</h2>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="font-medium text-slate-200">{selectedMessage.name}</span>
                  <span>&lt;{selectedMessage.email}&gt;</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => updateStatus(selectedMessage._id, selectedMessage.status === 'archived' ? 'read' : 'archived')}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  title={selectedMessage.status === 'archived' ? "Unarchive" : "Archive"}
                >
                  <Archive size={18} />
                </button>
                <button 
                  onClick={() => deleteMessage(selectedMessage._id)}
                  className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Detail Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                <Clock size={14} />
                {formatDate(selectedMessage.createdAt)}
              </div>
              
              <div className="prose prose-invert max-w-none mb-8 text-slate-300 whitespace-pre-wrap">
                {selectedMessage.message}
              </div>

              {/* Reply History */}
              {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider border-b border-slate-700/50 pb-2">Reply History</h4>
                  {selectedMessage.replies.map((reply, idx) => (
                    <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                      <div className="flex justify-between items-center mb-3 text-xs text-slate-400">
                        <span className="font-medium text-primary">You (Admin)</span>
                        <span>{formatDate(reply.sentAt)}</span>
                      </div>
                      <div className="text-slate-300 text-sm whitespace-pre-wrap">
                        {reply.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Composer */}
              <ReplyComposer 
                message={selectedMessage} 
                onClose={() => {}} 
                onSuccess={() => {
                  fetchMessages();
                  // Re-fetch specific message to get new replies
                  axios.get(`/messages/${selectedMessage._id}`).then(res => {
                    setSelectedMessage(res.data.data);
                  });
                }} 
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
            <Mail size={48} className="mb-4 opacity-50" />
            <p className="text-lg">Select a message to view</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
