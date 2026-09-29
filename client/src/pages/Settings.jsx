import { useState, useEffect } from 'react';
import { getSettings, updateSettings, updatePassword, logout, getBackups, triggerBackup, getTeam, inviteTeamMember, updateTeamMember, deleteTeamMember } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Save, LogOut, Shield, Mail, Globe, Database, Download, Play, Palette, Type, Users, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { setAdmin } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({ 
    adminEmail: '', 
    portfolioPublic: true, 
    maintenanceMode: false,
    maintenanceTitle: '',
    maintenanceMessage: '',
    maintenanceEstimatedReturn: '',
    themePrimaryColor: '#3b82f6',
    themeSecondaryColor: '#10b981',
    themeFontFamily: 'Inter'
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  const [settingsStatus, setSettingsStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [backupStatus, setBackupStatus] = useState(null);
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);

  const [team, setTeam] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', name: '', role: 'editor', password: '' });
  const [inviting, setInviting] = useState(false);
  const [teamStatus, setTeamStatus] = useState(null);

  const fetchBackups = async () => {
    try {
      setLoadingBackups(true);
      const res = await getBackups();
      setBackups(res.data.data);
    } catch (err) {
      console.error('Failed to load backups', err);
    } finally {
      setLoadingBackups(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettings();
        setSettings(res.data.data);
      } catch (err) {
        setSettingsStatus({ type: 'error', message: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };
    const fetchTeam = async () => {
      try {
        setLoadingTeam(true);
        const res = await getTeam();
        setTeam(res.data.data);
      } catch (err) {
        console.error('Failed to load team', err);
      } finally {
        setLoadingTeam(false);
      }
    };
    fetchSettings();
    fetchBackups();
    fetchTeam();
  }, []);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsStatus(null);
    try {
      await updateSettings(settings);
      setSettingsStatus({ type: 'success', message: 'Settings saved successfully' });
      setTimeout(() => setSettingsStatus(null), 3000);
    } catch (err) {
      setSettingsStatus({ type: 'error', message: err.response?.data?.message || 'Failed to save settings' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    setSavingPassword(true);
    setPasswordStatus(null);
    try {
      await updatePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswordStatus({ type: 'success', message: 'Password updated successfully' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordStatus(null), 3000);
    } catch (err) {
      setPasswordStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    setBackupStatus(null);
    try {
      await triggerBackup();
      setBackupStatus({ type: 'success', message: 'Backup created successfully' });
      fetchBackups();
      setTimeout(() => setBackupStatus(null), 3000);
    } catch (err) {
      setBackupStatus({ type: 'error', message: err.response?.data?.message || 'Failed to create backup' });
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleInviteTeam = async (e) => {
    e.preventDefault();
    setInviting(true);
    setTeamStatus(null);
    try {
      await inviteTeamMember(inviteData);
      setTeamStatus({ type: 'success', message: 'Team member invited successfully' });
      setInviteData({ email: '', name: '', role: 'editor', password: '' });
      const res = await getTeam();
      setTeam(res.data.data);
      setTimeout(() => setTeamStatus(null), 3000);
    } catch (err) {
      setTeamStatus({ type: 'error', message: err.response?.data?.message || 'Failed to invite team member' });
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (id, role) => {
    try {
      await updateTeamMember(id, { role });
      const res = await getTeam();
      setTeam(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteTeam = async (id) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await deleteTeamMember(id);
        const res = await getTeam();
        setTeam(res.data.data);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete team member');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setAdmin(null);
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Settings...</div>;

  return (
    <div>
      <PageHeader 
        title="Settings" 
        description="Manage your account, security, and global preferences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* System & Portfolio Settings */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Globe size={18} className="text-primary" /> Portfolio Preferences
              </h3>
            </CardHeader>
            <form onSubmit={handleSettingsSubmit}>
              <CardBody className="space-y-6">
                {settingsStatus && (
                  <div className={`p-3 rounded-lg text-sm border ${settingsStatus.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {settingsStatus.message}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div>
                      <h4 className="font-medium text-white text-sm">Public Portfolio</h4>
                      <p className="text-xs text-slate-400">Make your portfolio visible to visitors</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings.portfolioPublic} onChange={e => setSettings({...settings, portfolioPublic: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div>
                      <h4 className="font-medium text-white text-sm">Maintenance Mode</h4>
                      <p className="text-xs text-slate-400">Show a maintenance page to visitors</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings.maintenanceMode} onChange={e => setSettings({...settings, maintenanceMode: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                  
                  {settings.maintenanceMode && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-4">
                      <p className="text-sm text-amber-400 font-medium mb-2">Public visitors will see the maintenance page.</p>
                      <Input 
                        label="Maintenance Title" 
                        value={settings.maintenanceTitle} 
                        onChange={e => setSettings({...settings, maintenanceTitle: e.target.value})} 
                        placeholder="e.g. Under Maintenance"
                      />
                      <Input 
                        label="Maintenance Message" 
                        value={settings.maintenanceMessage} 
                        onChange={e => setSettings({...settings, maintenanceMessage: e.target.value})} 
                        placeholder="e.g. We are updating the portfolio."
                      />
                      <Input 
                        label="Estimated Return (Optional)" 
                        value={settings.maintenanceEstimatedReturn} 
                        onChange={e => setSettings({...settings, maintenanceEstimatedReturn: e.target.value})} 
                        placeholder="e.g. In 2 hours"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-700/50 pt-6">
                  <h4 className="font-medium text-white text-sm mb-4 flex items-center gap-2">
                    <Mail size={16} /> Notification Email
                  </h4>
                  <Input 
                    label="Admin Contact Email" 
                    type="email" 
                    value={settings.adminEmail} 
                    onChange={e => setSettings({...settings, adminEmail: e.target.value})} 
                    required 
                  />
                  <p className="text-xs text-slate-500 mt-2">Where contact form notifications are sent.</p>
                </div>

              </CardBody>
              <div className="p-4 border-t border-slate-700/50 bg-slate-800/20 flex justify-end">
                <Button type="submit" loading={savingSettings}>
                  <Save size={16} /> Save Preferences
                </Button>
              </div>
            </form>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Palette size={18} className="text-purple-400" /> Custom Theming
              </h3>
            </CardHeader>
            <form onSubmit={handleSettingsSubmit}>
              <CardBody className="space-y-6">
                <div>
                  <h4 className="font-medium text-white text-sm mb-4">Brand Colors</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={settings.themePrimaryColor || '#3b82f6'}
                          onChange={e => setSettings({...settings, themePrimaryColor: e.target.value})}
                          className="w-10 h-10 rounded cursor-pointer bg-slate-800 border border-slate-700/50 p-1"
                        />
                        <Input 
                          value={settings.themePrimaryColor || '#3b82f6'}
                          onChange={e => setSettings({...settings, themePrimaryColor: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Secondary Color</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={settings.themeSecondaryColor || '#10b981'}
                          onChange={e => setSettings({...settings, themeSecondaryColor: e.target.value})}
                          className="w-10 h-10 rounded cursor-pointer bg-slate-800 border border-slate-700/50 p-1"
                        />
                        <Input 
                          value={settings.themeSecondaryColor || '#10b981'}
                          onChange={e => setSettings({...settings, themeSecondaryColor: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-700/50 pt-6">
                  <h4 className="font-medium text-white text-sm mb-4 flex items-center gap-2">
                    <Type size={16} /> Typography
                  </h4>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Global Font Family</label>
                  <select
                    value={settings.themeFontFamily || 'Inter'}
                    onChange={e => setSettings({...settings, themeFontFamily: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="Inter">Inter (Sans Serif)</option>
                    <option value="Roboto">Roboto (Sans Serif)</option>
                    <option value="Outfit">Outfit (Modern)</option>
                    <option value="Playfair Display">Playfair Display (Serif)</option>
                    <option value="JetBrains Mono">JetBrains Mono (Monospace)</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-2">Changes the main font used across your public portfolio.</p>
                </div>
              </CardBody>
              <div className="p-4 border-t border-slate-700/50 bg-slate-800/20 flex justify-end">
                <Button type="submit" loading={savingSettings}>
                  <Save size={16} /> Save Theme
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Security Settings */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield size={18} className="text-red-400" /> Security
              </h3>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit}>
              <CardBody className="space-y-4">
                {passwordStatus && (
                  <div className={`p-3 rounded-lg text-sm border ${passwordStatus.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {passwordStatus.message}
                  </div>
                )}
                <Input 
                  label="Current Password" 
                  type="password" 
                  value={passwords.currentPassword} 
                  onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} 
                  required 
                />
                <Input 
                  label="New Password" 
                  type="password" 
                  value={passwords.newPassword} 
                  onChange={e => setPasswords({...passwords, newPassword: e.target.value})} 
                  required 
                />
                <Input 
                  label="Confirm New Password" 
                  type="password" 
                  value={passwords.confirmPassword} 
                  onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} 
                  required 
                />
              </CardBody>
              <div className="p-4 border-t border-slate-700/50 bg-slate-800/20 flex justify-end">
                <Button type="submit" variant="secondary" loading={savingPassword}>
                  Change Password
                </Button>
              </div>
            </form>
          </Card>

          <Card className="border-red-500/20">
            <CardBody className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-medium text-white mb-1">Session Management</h4>
                <p className="text-xs text-slate-400">Securely sign out of your admin session.</p>
              </div>
              <Button variant="danger" onClick={handleLogout}>
                <LogOut size={16} /> Sign Out
              </Button>
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Database size={18} className="text-blue-400" /> Database Backups
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {backupStatus && (
                <div className={`p-3 rounded-lg text-sm border ${backupStatus.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {backupStatus.message}
                </div>
              )}
              
              <div className="flex justify-between items-center bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <div>
                  <h4 className="font-medium text-white text-sm mb-1">Create Manual Backup</h4>
                  <p className="text-xs text-slate-400">Instantly archive a copy of your database.</p>
                </div>
                <Button onClick={handleCreateBackup} loading={creatingBackup}>
                  <Play size={14} className="mr-1" /> Run Backup
                </Button>
              </div>

              <div className="mt-4 border-t border-slate-700/50 pt-4">
                <h4 className="font-medium text-white text-sm mb-3">Available Backups</h4>
                {loadingBackups ? (
                  <p className="text-sm text-slate-400">Loading...</p>
                ) : backups.length === 0 ? (
                  <p className="text-sm text-slate-500 bg-slate-800/20 p-4 rounded-lg text-center">No backups found.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {backups.map(b => (
                      <div key={b.filename} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30 hover:border-slate-600 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-slate-200">{b.filename}</p>
                          <p className="text-[10px] text-slate-500">{(b.size / 1024).toFixed(2)} KB • {new Date(b.createdAt).toLocaleString()}</p>
                        </div>
                        <a 
                          href={`http://localhost:5000/api/backup/download/${b.filename}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-primary hover:text-blue-400 bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
                          title="Download Backup"
                        >
                          <Download size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users size={18} className="text-blue-400" /> Team & Roles
            </h3>
          </CardHeader>
          <CardBody className="space-y-6">
            {teamStatus && (
              <div className={`p-3 rounded-lg text-sm border ${teamStatus.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {teamStatus.message}
              </div>
            )}
            
            <form onSubmit={handleInviteTeam} className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-medium text-white text-sm mb-4">Invite New Admin/Editor</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <Input 
                  label="Name" 
                  value={inviteData.name}
                  onChange={e => setInviteData({...inviteData, name: e.target.value})}
                  required
                />
                <Input 
                  label="Email" 
                  type="email"
                  value={inviteData.email}
                  onChange={e => setInviteData({...inviteData, email: e.target.value})}
                  required
                />
                <Input 
                  label="Initial Password" 
                  type="password"
                  value={inviteData.password}
                  onChange={e => setInviteData({...inviteData, password: e.target.value})}
                  required
                />
                <Button type="submit" loading={inviting} className="mb-0.5">
                  <Plus size={16} className="mr-1" /> Invite
                </Button>
              </div>
            </form>

            <div className="border-t border-slate-700/50 pt-6">
              <h4 className="font-medium text-white text-sm mb-4">Current Team Members</h4>
              <div className="space-y-3">
                {team.map((member) => (
                  <div key={member._id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
                        {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member._id, e.target.value)}
                        className="bg-slate-900 border border-slate-700/50 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                      >
                        <option value="superadmin">Superadmin</option>
                        <option value="editor">Editor</option>
                      </select>
                      
                      <button 
                        onClick={() => handleDeleteTeam(member._id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Remove Member"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

    </div>
  );
};

export default Settings;
