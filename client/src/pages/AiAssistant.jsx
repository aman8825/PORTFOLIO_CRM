import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAiStats, getPendingQuestions, answerQuestion, getKnowledgeBase, createKnowledge, deleteKnowledge } from '../services/api';
import { Bot, MessageSquare, Database, Trash2, Edit } from 'lucide-react';

const AiAssistant = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [stats, setStats] = useState({ totalQuestions: 0, pendingQuestions: 0, answeredQuestions: 0, knowledgeEntries: 0 });
  const [pending, setPending] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [answerAliases, setAnswerAliases] = useState('');
  
  // New knowledge state
  const [newKnowledge, setNewKnowledge] = useState({ question: '', answer: '', category: 'general', aliases: '' });
  const [isCreatingKnowledge, setIsCreatingKnowledge] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, knowledgeRes] = await Promise.all([
        getAiStats(),
        getPendingQuestions(),
        getKnowledgeBase()
      ]);
      setStats(statsRes.data.data);
      setPending(pendingRes.data.data);
      setKnowledge(knowledgeRes.data.data);
    } catch (error) {
      console.error('Error fetching AI Assistant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answerText.trim() || !answering) return;
    
    try {
      await answerQuestion(answering._id, { answer: answerText, aliases: answerAliases });
      setAnswering(null);
      setAnswerText('');
      setAnswerAliases('');
      fetchData(); // Refresh all
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleCreateKnowledgeSubmit = async (e) => {
    e.preventDefault();
    if (!newKnowledge.question.trim() || !newKnowledge.answer.trim()) return;
    
    try {
      await createKnowledge(newKnowledge);
      setNewKnowledge({ question: '', answer: '', category: 'general', aliases: '' });
      setIsCreatingKnowledge(false);
      fetchData(); // Refresh all
    } catch (error) {
      console.error('Failed to create knowledge:', error);
    }
  };

  const handleDeleteKnowledge = async (id) => {
    if (window.confirm('Are you sure you want to delete this knowledge entry?')) {
      try {
        await deleteKnowledge(id);
        fetchData(); // Refresh
      } catch (error) {
        console.error('Failed to delete knowledge:', error);
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading AI Assistant data...</div>;
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Assistant</h1>
            <p className="text-slate-400">Manage pending questions and the assistant's knowledge base.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface p-6 rounded-2xl border border-slate-700/50 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Total Questions</p>
              <h3 className="text-3xl font-bold text-white">{stats.totalQuestions}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <MessageSquare size={24} />
            </div>
          </div>
          <div className="bg-surface p-6 rounded-2xl border border-slate-700/50 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Pending Questions</p>
              <h3 className="text-3xl font-bold text-amber-500">{stats.pendingQuestions}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <MessageSquare size={24} />
            </div>
          </div>
          <div className="bg-surface p-6 rounded-2xl border border-slate-700/50 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Answered</p>
              <h3 className="text-3xl font-bold text-green-500">{stats.answeredQuestions}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <Bot size={24} />
            </div>
          </div>
          <div className="bg-surface p-6 rounded-2xl border border-slate-700/50 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Knowledge Entries</p>
              <h3 className="text-3xl font-bold text-blue-500">{stats.knowledgeEntries}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Database size={24} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-slate-700/50 pb-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'pending' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Pending Questions
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'knowledge' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Knowledge Base
          </button>
        </div>

        {/* Pending Questions Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pending.length === 0 ? (
              <div className="bg-surface p-8 rounded-2xl border border-slate-700/50 text-center">
                <Bot className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No pending questions</h3>
                <p className="text-slate-400">The AI assistant has handled all inquiries successfully.</p>
              </div>
            ) : (
              pending.map((q) => (
                <div key={q._id} className="bg-surface p-6 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1">"{q.question}"</h4>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>Asked {q.askedCount} time{q.askedCount !== 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setAnswering(q); setAnswerText(''); }}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                  >
                    Answer
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === 'knowledge' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Verified Knowledge</h3>
              <button
                onClick={() => setIsCreatingKnowledge(!isCreatingKnowledge)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
              >
                {isCreatingKnowledge ? 'Cancel' : 'Add New Entry'}
              </button>
            </div>

            {isCreatingKnowledge && (
              <form onSubmit={handleCreateKnowledgeSubmit} className="bg-surface p-6 rounded-2xl border border-primary/30">
                <h4 className="text-lg font-semibold text-white mb-4">Add Manual Knowledge Entry</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Question / Topic</label>
                    <input
                      type="text"
                      required
                      value={newKnowledge.question}
                      onChange={(e) => setNewKnowledge({...newKnowledge, question: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:border-primary text-white"
                      placeholder="e.g. Do you have backend experience?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Verified Answer</label>
                    <textarea
                      required
                      rows={3}
                      value={newKnowledge.answer}
                      onChange={(e) => setNewKnowledge({...newKnowledge, answer: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:border-primary text-white resize-none"
                      placeholder="e.g. Yes, I have experience with Node.js and Express."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Aliases (comma separated)</label>
                    <input
                      type="text"
                      value={newKnowledge.aliases}
                      onChange={(e) => setNewKnowledge({...newKnowledge, aliases: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:border-primary text-white"
                      placeholder="e.g. Does Aman know backend, backend technologies"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCreatingKnowledge(false)}
                      className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                    >
                      Save Entry
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {knowledge.length === 0 && !isCreatingKnowledge ? (
                <div className="col-span-full text-center py-8 text-slate-400">
                  No manual knowledge entries yet.
                </div>
              ) : (
                knowledge.map((k) => (
                  <div key={k._id} className="bg-surface p-6 rounded-2xl border border-slate-700/50 flex flex-col h-full">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-2 line-clamp-2">Q: {k.question}</h4>
                      <p className="text-slate-400 text-sm line-clamp-4">A: {k.answer}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                      <span className="text-xs text-slate-500">
                        {new Date(k.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDeleteKnowledge(k._id)}
                        className="text-red-500 hover:text-red-400 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Answer Modal Overlay */}
        {answering && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface border border-slate-700/50 p-6 rounded-2xl w-full max-w-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">Answer Pending Question</h3>
              <p className="text-slate-400 mb-6">
                This answer will be saved to the Knowledge Base. Future visitors asking this or similar questions will receive this answer automatically.
              </p>
              
              <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-1">Visitor Asked:</p>
                <p className="text-lg font-medium text-white">"{answering.question}"</p>
              </div>

              <form onSubmit={handleAnswerSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Verified Answer
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700/50 rounded-xl focus:outline-none focus:border-primary text-white resize-none"
                    placeholder="Write a clear, professional answer..."
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Alternative Questions (Aliases)
                  </label>
                  <input
                    type="text"
                    value={answerAliases}
                    onChange={(e) => setAnswerAliases(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700/50 rounded-xl focus:outline-none focus:border-primary text-white"
                    placeholder="Comma separated e.g. Does Aman know Docker, Docker experience"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setAnswering(null); setAnswerText(''); setAnswerAliases(''); }}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                  >
                    Save & Approve
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAssistant;
