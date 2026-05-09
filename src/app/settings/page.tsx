'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppStore } from '@/store/useAppStore';
import { User, Bell, Globe, Lock, Palette, Shield, Camera, Save, ChevronRight } from 'lucide-react';

const sections = [
  { id: 'profile', label: 'Profile', icon: User, emoji: '👤' },
  { id: 'notifications', label: 'Notifications', icon: Bell, emoji: '🔔' },
  { id: 'preferences', label: 'Preferences', icon: Globe, emoji: '🌐' },
  { id: 'security', label: 'Security', icon: Lock, emoji: '🔒' },
  { id: 'appearance', label: 'Appearance', icon: Palette, emoji: '🎨' },
  { id: 'privacy', label: 'Privacy', icon: Shield, emoji: '🛡️' },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${enabled ? 'bg-purple-500' : 'bg-gray-200'}`}>
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { user, theme, toggleTheme } = useAppStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [notifs, setNotifs] = useState({ email: true, push: true, sms: false, marketing: false, tripReminders: true, priceAlerts: true });
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState('INR');
  const [language, setLanguage] = useState('Hindi');

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Settings ⚙️</h1>
          <p className="text-sm text-gray-500 mt-1">Apna account aur preferences manage karo</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-white rounded-3xl p-3 shadow-card border border-purple-50 h-fit">
            {sections.map((s) => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                  activeSection === s.id ? 'text-purple-700' : 'text-gray-600 hover:bg-purple-50'
                }`}
                style={activeSection === s.id ? { background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(219,39,119,0.05))' } : {}}>
                <span>{s.emoji}</span>
                {s.label}
                {activeSection === s.id && <ChevronRight className="w-3.5 h-3.5 ml-auto text-purple-400" />}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-card border border-purple-50"
            >
              {activeSection === 'profile' && (
                <div>
                  <h2 className="font-bold text-gray-800 text-lg mb-5">Profile Information 👤</h2>
                  <div className="flex items-center gap-5 mb-6 p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(219,39,119,0.04))' }}>
                    <div className="relative">
                      <img src={user?.avatar} alt={user?.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg" />
                      <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center shadow-md"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                        <Camera className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <div className="flex gap-3 mt-2 text-xs text-gray-500">
                        <span>🗺️ {user?.statesVisited} states visited</span>
                        <span>✈️ {user?.tripsCount} trips</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Poora Naam', value: name, onChange: setName, type: 'text', placeholder: 'Apna naam likhiye' },
                      { label: 'Email Address', value: email, onChange: setEmail, type: 'email', placeholder: 'email@example.com' },
                      { label: 'Shehar', value: user?.location || '', onChange: () => {}, type: 'text', placeholder: 'Delhi, India' },
                      { label: 'Phone Number', value: '+91 98765 43210', onChange: () => {}, type: 'tel', placeholder: '+91 XXXXX XXXXX' },
                    ].map((field) => (
                      <div key={field.label}>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{field.label}</label>
                        <input type={field.type} value={field.value} placeholder={field.placeholder}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Bio</label>
                    <textarea rows={3} placeholder="Community ko apne baare mein batao..."
                      className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="mt-5 flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg text-sm"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                    <Save className="w-4 h-4" /> Save Karo
                  </motion.button>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div>
                  <h2 className="font-bold text-gray-800 text-lg mb-5">Notification Preferences 🔔</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'email', label: 'Email Notifications', desc: 'Email pe updates milenge' },
                      { key: 'push', label: 'Push Notifications', desc: 'Browser aur mobile alerts' },
                      { key: 'sms', label: 'SMS Alerts', desc: 'Phone pe text messages' },
                      { key: 'tripReminders', label: 'Trip Reminders', desc: 'Trip se pehle yaad dilayenge' },
                      { key: 'priceAlerts', label: 'Price Alerts', desc: 'Daam girne pe notify karenge' },
                      { key: 'marketing', label: 'Promotional Emails', desc: 'Deals aur offers ke baare mein' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-3 border-b border-purple-50 last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                        </div>
                        <Toggle enabled={notifs[item.key as keyof typeof notifs]}
                          onChange={() => setNotifs(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifs] }))} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'preferences' && (
                <div>
                  <h2 className="font-bold text-gray-800 text-lg mb-5">App Preferences 🌐</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Bhasha (Language)</label>
                      <select value={language} onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500">
                        {['Hindi', 'English', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada'].map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Currency</label>
                      <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                        className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500">
                        {['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'AED', 'SGD'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Distance</label>
                      <div className="flex gap-2">
                        {['Kilometers', 'Miles'].map(u => (
                          <button key={u} className="flex-1 py-2.5 rounded-xl border-2 border-purple-100 text-sm font-medium text-gray-600 hover:border-purple-400 hover:text-purple-700 transition-all">
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div>
                  <h2 className="font-bold text-gray-800 text-lg mb-5">Security Settings 🔒</h2>
                  <div className="space-y-4">
                    {['Current Password', 'Naya Password', 'Password Confirm Karo'].map((label) => (
                      <div key={label}>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{label}</label>
                        <input type="password" placeholder="••••••••"
                          className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500" />
                      </div>
                    ))}
                    <button className="text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                      Password Update Karo
                    </button>
                    <div className="pt-4 border-t border-purple-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Two-Factor Authentication</p>
                          <p className="text-xs text-gray-400 mt-0.5">Extra security ke liye OTP enable karo</p>
                        </div>
                        <Toggle enabled={false} onChange={() => {}} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'appearance' && (
                <div>
                  <h2 className="font-bold text-gray-800 text-lg mb-5">Appearance 🎨</h2>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', label: 'Light ☀️' },
                      { id: 'dark', label: 'Dark 🌙' },
                      { id: 'auto', label: 'System 💻' },
                    ].map((t) => (
                      <button key={t.id} onClick={toggleTheme}
                        className={`rounded-2xl p-3 border-2 transition-all ${theme === t.id ? 'border-purple-500' : 'border-gray-200'}`}>
                        <div className={`h-16 rounded-xl mb-2 overflow-hidden ${t.id === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                          <div className={`h-3 m-2 rounded ${t.id === 'dark' ? 'bg-gray-700' : 'bg-purple-100'}`} />
                          <div className={`h-2 mx-2 rounded opacity-60 ${t.id === 'dark' ? 'bg-gray-600' : 'bg-pink-100'}`} />
                        </div>
                        <p className="text-xs font-medium text-gray-700">{t.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'privacy' && (
                <div>
                  <h2 className="font-bold text-gray-800 text-lg mb-5">Privacy Settings 🛡️</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Public Profile', desc: 'Doosre log aapka profile dekh sakte hain' },
                      { label: 'Trip History Dikhao', desc: 'Aapki past trips publicly visible hongi' },
                      { label: 'Location Sharing', desc: 'Apni current location share karo' },
                      { label: 'Data Analytics', desc: 'TripNexus improve karne mein help karo' },
                    ].map((item, i) => (
                      <div key={item.label} className="flex items-center justify-between py-3 border-b border-purple-50 last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                        </div>
                        <Toggle enabled={i < 2} onChange={() => {}} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-5 border-t border-purple-50">
                    <button className="text-sm text-red-500 hover:text-red-600 font-medium">Account Delete Karo</button>
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
