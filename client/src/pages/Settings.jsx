import { useState, useEffect } from 'react';
import { getSettings, updateSettings, updatePassword, logout } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Save, LogOut, Shield, Mail, Globe } from 'lucide-react';
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
    maintenanceEstimatedReturn: ''
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  const [settingsStatus, setSettingsStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);

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
    fetchSettings();
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
        </div>

      </div>
    </div>
  );
};

export default Settings;
