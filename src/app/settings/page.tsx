'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppStore } from '@/store/useAppStore';
import { User, Bell, Globe, Lock, Palette, Shield, Camera, Save, ChevronRight, Check, X, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const sections = [
  { id: 'profile',       label: 'Profile',       emoji: '👤' },
  { id: 'notifications', label: 'Notifications', emoji: '🔔' },
  { id: 'preferences',   label: 'Preferences',   emoji: '🌐' },
  { id: 'security',      label: 'Security',      emoji: '🔒' },
  { id: 'appearance',    label: 'Appearance',    emoji: '🎨' },
  { id: 'privacy',       label: 'Privacy',       emoji: '🛡️' },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${enabled ? 'bg-purple-500' : 'bg-gray-200'}`}>
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="fixed top-20 right-6 z-50 bg-white border border-purple-200 rounded-2xl px-5 py-3 shadow-xl text-sm font-medium text-gray-800 flex items-center gap-2">
      <Check className="w-4 h-4 text-emerald-500" />{msg}
    </motion.div>
  );
}

export default function SettingsPage() {
  const { user, setUser, theme, toggleTheme } = useAppStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [toast, setToast]   = useState('');
  const [notifs, setNotifs] = useState({ email: true, push: true, sms: false, marketing: false, tripReminders: true, priceAlerts: true });
  const [privacy, setPrivacy] = useState({ publicProfile: true, tripHistory: true, locationSharing: false, dataAnalytics: true });
  const [name, setName]     = useState(user?.name || '');
  const [email, setEmail]   = useState(user?.email || '');
  const [bio, setBio]       = useState('');
  const [currency, setCurrency] = useState('INR (₹)');
  const [language, setLanguage] = useState('Hindi');
  const [distUnit, setDistUnit] = useState('Kilometers');
  const [selectedTheme, setSelectedTheme] = useState(theme === 'dark' ? 'dark' : 'light');
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [pwd, setPwd]         = useState({ current: '', new: '', confirm: '' });
  const [pwdError, setPwdError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function handleSaveProfile() {
    if (!name.trim()) { showToast('❌ Naam required hai'); return; }
    setUser({ ...user!, name, email });
    showToast('✅ Profile save ho gayi!');
  }

  function handlePasswordUpdate() {
    if (!pwd.current) { setPwdError('Current password daalo'); return; }
    if (pwd.new.length < 6) { setPwdError('Naya password kam se kam 6 characters ka hona chahiye'); return; }
    if (pwd.new !== pwd.confirm) { setPwdError('Passwords match nahi kar rahe'); return; }
    setPwdError('');
    setPwd({ current: '', new: '', confirm: '' });
    showToast('✅ Password update ho gaya!');
  }

  function handleThemeSelect(id: string) {
    setSelectedTheme(id);
    if (id === 'dark' && theme !== 'dark') toggleTheme();
    if (id === 'light' && theme === 'dark') toggleTheme();
    showToast(`✅ ${id === 'dark' ? 'Dark' : id === 'light' ? 'Light' : 'System'} theme set!`);
  }

  return (
    <AppLayout>
      <AnimatePresence>
        {toast && <Toast msg={toast} onClose={() => setToast('')} />}
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Account Delete Karo?</h3>
                  <p className="text-xs text-red-500">Yeh action undo nahi ho sakta!</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">Confirm karne ke liye <strong>DELETE</strong> type karo:</p>
              <input value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 mb-4" />
              <div className="flex gap-3">
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Cancel</button>
                <button disabled={deleteInput !== 'DELETE'}
                  onClick={() => { showToast('Account deletion request submitted'); setShowDeleteConfirm(false); setDeleteInput(''); }}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Settings ⚙️</h1>
          <p className="text-sm text-gray-500 mt-1">Apna account aur preferences manage karo</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-3 shadow-card border border-purple-50 h-fit">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                  activeSection === s.id ? 'text-purple-700' : 'text-gray-600 hover:bg-purple-50'}`}
                style={activeSection === s.id ? { background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(219,39,119,0.05))' } : {}}>
                <span>{s.emoji}</span>{s.label}
                {activeSection === s.id && <ChevronRight className="w-3.5 h-3.5 ml-auto text-purple-400" />}
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-card border border-purple-50">

              {/* PROFILE */}
              {activeSection === 'profile' && (
                <div>
                  <h2 className="font-bold text-gray-800 text-lg mb-5">Profile Information 👤</h2>
                  <div className="flex items-center gap-5 mb-6 p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(219,39,119,0.04))' }}>
                    <div className="relative">
                      <img src={user?.avatar} alt={user?.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg" />
                      <button onClick={() => showToast('📸 Photo upload feature coming soon!')}
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center shadow-md"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                        <Camera className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <div className="flex gap-3 mt-2 text-xs text-gray-500">
                        <span>🗺️ {user?.statesVisited} states</span>
                        <span>✈️ {user?.tripsCount} trips</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Poora Naam',    value: name,           onChange: setName,  type: 'text',  placeholder: 'Apna naam' },
                      { label: 'Email Address', value: email,          onChange: setEmail, type: 'email', placeholder: 'email@example.com' },
                      { label: 'Shehar',        value: user?.location || '', onChange: () => {}, type: 'text', placeholder: 'Delhi, India' },
                      { label: 'Phone',         value: '+91 98765 43210', onChange: () => {}, type: 'tel', placeholder: '+91 XXXXX XXXXX' },
                    ].map(field => (
                      <div key={field.label}>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{field.label}</label>
                        <input type={field.type} value={field.value} placeholder={field.placeholder}
                          onChange={e => field.onChange(e.target.value)}
                          className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Bio</label>
                    <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)}
                      placeholder="Community ko apne baare mein batao..."
                      className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleSaveProfile}
                    className="mt-5 flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg text-sm"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                    <Save className="w-4 h-4" /> Save Karo
                  </motion.button>
                </div>
              )}

              {/* NOTIFICATIONS */}
              {activeSection === 'notifications' && (
                <div>
                  <h2 className="font-bold text-gray-800 text-lg mb-5">Notification Preferences 🔔</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'email',         label: 'Email Notifications', desc: 'Email pe updates milenge' },
                      { key: 'push',          label: 'Push Notifications',  desc: 'Browser aur mobile alerts' },
                      { key: 'sms',           label: 'SMS Alerts',          desc: 'Phone pe text messages' },
                      { key: 'tripReminders', label: 'Trip Reminders',      desc: 'Trip se pehle yaad dilayenge' },
                      { key: 'priceAlerts',   label: 'Price Alerts',        desc: 'Daam girne pe notify karenge' },
                      { key: 'marketing',     label: 'Promotional Emails',  desc: 'Deals aur offers ke baare mein' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between py-3 border-b border-purple-50 last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                        </div>
                        <Toggle enabled={notifs[item.key as keyof typeof notifs]}
                          onChange={() => { setNotifs(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifs] })); showToast(`✅ ${item.label} ${notifs[item.key as keyof typeof notifs] ? 'off' : 'on'} kar diya`); }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PREFERENCES */}
              {activeSection === 'preferences' && (
                <div>
                  <h2 className="font-bold text-gray-800 text-lg mb-5">App Preferences 🌐</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Bhasha (Language)</label>
                      <select value={language} onChange={e => { setLanguage(e.target.value); showToast(`✅ Language: ${e.target.value}`); }}
                        className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500">
                        {['Hindi', 'English', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada'].map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Currency</label>
                      <select value={currency} onChange={e => { setCurrency(e.target.value); showToast(`✅ Currency: ${e.target.value}`); }}
                        className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500">
                        {['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'AED', 'SGD'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Distance Unit</label>
                      <div className="flex gap-2">
                        {['Kilometers', 'Miles'].map(u => (
                          <button key={u} onClick={() => { setDistUnit(u); showToast(`✅ Distance unit: ${u}`); }}
                            className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                              distUnit === u ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`}>
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY */}
              {activeSection === 'security' && (
                <div>
                  <h2 className="font-bold text-gray-800 text-lg mb-5">Security Settings 🔒</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'current', label: 'Current Password' },
                      { key: 'new',     label: 'Naya Password'    },
                      { key: 'confirm', label: 'Password Confirm' },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{field.label}</label>
                        <div className="relative">
                          <input type={showPwd[field.key as keyof typeof showPwd] ? 'text' : 'password'}
                            value={pwd[field.key as keyof typeof pwd]}
                            onChange={e => setPwd(prev => ({ ...prev, [field.key]: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:border-purple-500" />
                          <button onClick={() => setShowPwd(prev => ({ ...prev, [field.key]: !prev[field.key as keyof typeof showPwd] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPwd[field.key as keyof typeof showPwd] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    {pwdError && <p className="text-xs text-red-500">{pwdError}</p>}
                    <button onClick={handlePasswordUpdate}
                      className="text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                      Password Update Karo
                    </button>
                    <div className="pt-4 border-t border-purple-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Two-Factor Authentication</p>
                          <p className="text-xs text-gray-400 mt-0.5">Extra security ke liye OTP enable karo</p>
                        </div>
                        <Toggle enabled={false} onChange={() => showToast('🔐 2FA setup coming soon!')} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* APPEARANCE */}
              {activeSection === 'appearance' && (
                <div>
                  <h2 className="font-bold text-gray-800 text-lg mb-5">Appearance 🎨</h2>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', label: 'Light ☀️' },
                      { id: 'dark',  label: 'Dark 🌙'  },
                      { id: 'auto',  label: 'System 💻' },
                    ].map(t => (
                      <button key={t.id} onClick={() => handleThemeSelect(t.id)}
                        className={`rounded-2xl p-3 border-2 transition-all ${selectedTheme === t.id ? 'border-purple-500 shadow-md' : 'border-gray-200 hover:border-purple-300'}`}>
                        <div className={`h-16 rounded-xl mb-2 overflow-hidden ${t.id === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                          <div className={`h-3 m-2 rounded ${t.id === 'dark' ? 'bg-gray-700' : 'bg-purple-100'}`} />
                          <div className={`h-2 mx-2 rounded opacity-60 ${t.id === 'dark' ? 'bg-gray-600' : 'bg-pink-100'}`} />
                        </div>
                        <p className="text-xs font-medium text-gray-700">{t.label}</p>
                        {selectedTheme === t.id && <Check className="w-3.5 h-3.5 text-purple-500 mx-auto mt-1" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PRIVACY */}
              {activeSection === 'privacy' && (
                <div>
                  <h2 className="font-bold text-gray-800 text-lg mb-5">Privacy Settings 🛡️</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'publicProfile',   label: 'Public Profile',       desc: 'Doosre log aapka profile dekh sakte hain' },
                      { key: 'tripHistory',      label: 'Trip History Dikhao',  desc: 'Aapki past trips publicly visible hongi' },
                      { key: 'locationSharing',  label: 'Location Sharing',     desc: 'Apni current location share karo' },
                      { key: 'dataAnalytics',    label: 'Data Analytics',       desc: 'TripNexus improve karne mein help karo' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between py-3 border-b border-purple-50 last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                        </div>
                        <Toggle enabled={privacy[item.key as keyof typeof privacy]}
                          onChange={() => { setPrivacy(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof privacy] })); showToast(`✅ ${item.label} updated`); }} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-5 border-t border-purple-50">
                    <button onClick={() => setShowDeleteConfirm(true)}
                      className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Account Delete Karo
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
