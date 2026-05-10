'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { loginUser, signupUser, googleAuth } from '@/store/useAppStore';
import {
  Eye, EyeOff, Mail, Lock, User, MapPin, ArrowRight,
  Sparkles, CheckCircle2, AlertCircle, Loader2, Globe
} from 'lucide-react';

const INDIAN_CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kochi', 'Chandigarh'];

const FEATURES = [
  { emoji: '🗺️', text: 'AI-powered trip planning' },
  { emoji: '🌤️', text: 'Live weather for 10+ cities' },
  { emoji: '🧭', text: 'Local guide booking system' },
  { emoji: '📊', text: 'Tourism intelligence & heatmaps' },
  { emoji: '🏆', text: 'Rewards & loyalty program' },
  { emoji: '💎', text: 'Offbeat destination discovery' },
];

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setAuthenticated } = useAppStore();

  const [mode, setMode]           = useState<'login' | 'signup'>('login');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form fields
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [location, setLocation]   = useState('');
  const [gender, setGender]       = useState<'male' | 'female'>('male');

  function reset() {
    setError(''); setSuccess('');
    setName(''); setEmail(''); setPassword(''); setConfirm(''); setLocation('');
  }

  function switchMode(m: 'login' | 'signup') {
    setMode(m); reset();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');

    if (mode === 'signup' && password !== confirm) {
      setError('Passwords match nahi kar rahe'); return;
    }

    setLoading(true);
    try {
      const res = mode === 'login'
        ? await loginUser(email, password)
        : await signupUser(name, email, password, location, gender);

      if (!res.success) { setError(res.error); return; }

      setSuccess(res.message);
      setUser(res.user);
      setAuthenticated(true);
      setTimeout(() => router.replace('/dashboard'), 800);
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true); setError('');
    // Simulate Google OAuth with a demo account
    try {
      const res = await googleAuth('Google User', `google_${Date.now()}@gmail.com`);
      if (!res.success) { setError(res.error); return; }
      setSuccess('Google se login ho gaya! 🎉');
      setUser(res.user);
      setAuthenticated(true);
      setTimeout(() => router.replace('/dashboard'), 800);
    } catch {
      setError('Google login failed');
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin() {
    setEmail('rahul@tripnexus.in');
    setPassword('demo123');
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #fdf2f8 50%, #fff7ed 100%)' }}>

      {/* ── LEFT PANEL — Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 50%, #db2777 100%)' }}>
        {/* Animated blobs */}
        {[...Array(5)].map((_, i) => (
          <motion.div key={i}
            animate={{ x: [0, 20, 0], y: [0, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
            className="absolute w-64 h-64 bg-white/5 rounded-full blur-3xl"
            style={{ left: `${-10 + i * 25}%`, top: `${10 + (i % 3) * 25}%` }} />
        ))}

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xl bg-white/20 backdrop-blur-sm">
              🇮🇳
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white leading-none">TripNexus</p>
              <p className="text-white/60 text-sm">Incredible India AI Planner</p>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            India ka Safar,<br />
            <span className="text-yellow-300">AI ke Saath</span> 🚀
          </h1>
          <p className="text-white/75 text-lg mb-10 leading-relaxed">
            Rajasthan ke forts se Ladakh ki pahaadiyan tak — apna perfect trip plan karo AI ke saath.
          </p>

          <div className="space-y-3">
            {FEATURES.map((f, i) => (
              <motion.div key={f.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="flex items-center gap-3">
                <span className="text-xl w-8">{f.emoji}</span>
                <span className="text-white/85 text-sm font-medium">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="" className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <p className="text-white text-sm font-semibold">"Best travel app for India trips!"</p>
              <p className="text-white/60 text-xs mt-0.5">— Priya S., Delhi · ⭐⭐⭐⭐⭐</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">🇮🇳</span>
            <span className="text-xl font-extrabold text-gray-800">TripNexus</span>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-8">
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  mode === m ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {m === 'login' ? '🔑 Login' : '✨ Sign Up'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode}
              initial={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'signup' ? -20 : 20 }}
              transition={{ duration: 0.2 }}>

              <h2 className="text-2xl font-extrabold text-gray-800 mb-1">
                {mode === 'login' ? 'Wapas Aao! 🙏' : 'Safar Shuru Karo! 🚀'}
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                {mode === 'login'
                  ? 'Apne account mein login karo'
                  : 'Free account banao aur India explore karo'}
              </p>

              {/* Google button */}
              <button onClick={handleGoogle} disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 bg-white border-2 border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition-all mb-4 shadow-sm disabled:opacity-60">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google se {mode === 'login' ? 'Login' : 'Sign Up'} Karo
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">ya email se</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Poora Naam</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input value={name} onChange={e => setName(e.target.value)} required
                        placeholder="Rahul Sharma"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="rahul@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder={mode === 'signup' ? 'Kam se kam 6 characters' : '••••••••'}
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all" />
                    <button type="button" onClick={() => setShowPwd(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Password Confirm Karo</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} required
                          placeholder="••••••••"
                          className={`w-full pl-10 pr-10 py-3 bg-gray-50 border rounded-xl text-sm text-gray-700 outline-none focus:ring-2 transition-all ${
                            confirm && confirm !== password ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-100'}`} />
                        <button type="button" onClick={() => setShowConfirm(p => !p)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirm && confirm !== password && (
                        <p className="text-xs text-red-500 mt-1">Passwords match nahi kar rahe</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Shehar</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select value={location} onChange={e => setLocation(e.target.value)}
                            className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-purple-500 appearance-none">
                            <option value="">Select</option>
                            {INDIAN_CITIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Gender</label>
                        <div className="flex gap-2">
                          {(['male', 'female'] as const).map(g => (
                            <button key={g} type="button" onClick={() => setGender(g)}
                              className={`flex-1 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                                gender === g ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-purple-300'}`}>
                              {g === 'male' ? '👨 Male' : '👩 Female'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Error / Success */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <p className="text-sm text-emerald-700">{success}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className="w-full py-3.5 text-white font-bold rounded-2xl text-sm shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</>
                    : mode === 'login'
                    ? <><ArrowRight className="w-4 h-4" /> Login Karo</>
                    : <><Sparkles className="w-4 h-4" /> Account Banao</>}
                </motion.button>

                {/* Demo login hint */}
                {mode === 'login' && (
                  <p className="text-center text-xs text-gray-400">
                    Demo account:{' '}
                    <button type="button" onClick={handleDemoLogin}
                      className="text-purple-600 hover:underline font-medium">
                      rahul@tripnexus.in / demo123
                    </button>
                  </p>
                )}
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                {mode === 'login' ? "Account nahi hai? " : "Already account hai? "}
                <button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-purple-600 font-semibold hover:underline">
                  {mode === 'login' ? 'Sign Up Karo' : 'Login Karo'}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
