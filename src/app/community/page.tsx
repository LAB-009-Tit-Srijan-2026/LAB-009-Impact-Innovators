'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { communityPosts, leaderboard } from '@/lib/dummy-data';
import { Heart, MessageCircle, Share2, Bookmark, MapPin, Trophy, TrendingUp, Plus, Search, X, Send } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

// Rotating travel tips
const TRAVEL_TIPS = [
  'Rajasthan trip ke liye October–March best time hai. Garmiyon mein 45°C tak temperature ho sakta hai! 🌡️',
  'Ladakh ke liye Inner Line Permit (ILP) zaroor lo — online apply karo lahdc.nic.in pe 🏔️',
  'Kerala houseboat booking 2–3 mahine pehle karo, especially December–February mein 🛶',
  'Goa mein November–February best season hai. Monsoon mein beaches band rehte hain 🏖️',
  'Varanasi mein Ganga Aarti dekhni hai toh Dashashwamedh Ghat pe 6 PM se pehle pahuncho 🪔',
  'Manali se Spiti Valley ke liye June–September hi jaao — baaki time road band rehta hai ❄️',
];

function ShareModal({ post, onClose }: { post: any; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = `https://tripnexus.vercel.app/community#${post.id}`;
  function copy() {
    navigator.clipboard.writeText(`${post.caption}\n\n${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Share Post</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="flex gap-3 mb-4">
          {[
            { label: 'WhatsApp', emoji: '💬', color: 'bg-green-500', action: () => window.open(`https://wa.me/?text=${encodeURIComponent(post.caption + '\n' + url)}`) },
            { label: 'Twitter',  emoji: '🐦', color: 'bg-sky-500',   action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.caption)}&url=${encodeURIComponent(url)}`) },
            { label: 'Copy',     emoji: copied ? '✅' : '��', color: 'bg-purple-500', action: copy },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl text-white text-xs font-semibold ${btn.color} hover:opacity-90 transition-opacity`}>
              <span className="text-xl">{btn.emoji}</span>{btn.label}
            </button>
          ))}
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-500 truncate">{url}</div>
      </motion.div>
    </motion.div>
  );
}

function CommentBox({ post, onClose }: { post: any; onClose: () => void }) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { id: 1, user: 'Priya S.', text: 'Wah! Bahut sundar photo hai 😍', time: '2h ago' },
    { id: 2, user: 'Arjun M.', text: 'Main bhi jaana chahta hoon! Kab gaye the?', time: '1h ago' },
  ]);
  function submit() {
    if (!comment.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), user: 'You', text: comment, time: 'Just now' }]);
    setComment('');
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Comments ({post.comments + comments.length - 2})</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto p-4 space-y-3">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 flex-shrink-0">
                {c.user[0]}
              </div>
              <div className="bg-gray-50 rounded-2xl px-3 py-2 flex-1">
                <p className="text-xs font-semibold text-gray-700">{c.user}</p>
                <p className="text-xs text-gray-600 mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-2">
          <input value={comment} onChange={e => setComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Comment likhiye..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-400" />
          <button onClick={submit} disabled={!comment.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PostCard({ post, index }: { post: any; index: number }) {
  const [liked, setLiked]       = useState(post.liked);
  const [saved, setSaved]       = useState(post.saved);
  const [likes, setLikes]       = useState(post.likes);
  const [following, setFollowing] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const router = useRouter();

  return (
    <>
      <AnimatePresence>
        {showShare    && <ShareModal post={post} onClose={() => setShowShare(false)} />}
        {showComments && <CommentBox post={post} onClose={() => setShowComments(false)} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-3xl overflow-hidden shadow-card border border-purple-50">
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-2xl object-cover" />
              {post.user.verified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{post.user.name}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />{post.destination}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{format(new Date(post.timestamp), 'MMM d')}</span>
            <button onClick={() => setFollowing(p => !p)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                following ? 'bg-gray-100 text-gray-600' : 'text-white'}`}
              style={following ? {} : { background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
              {following ? 'Following ✓' : 'Follow'}
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden cursor-pointer" style={{ height: '280px' }}
          onClick={() => router.push(`/dashboard?search=${encodeURIComponent(post.destination)}`)}>
          <img src={post.images[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
            <span className="text-xs">🇮🇳</span>
            <span className="text-white text-xs font-medium">{post.destination}</span>
          </div>
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
            <span className="text-white text-xs">Tap to explore →</span>
          </div>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">{post.caption}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.map((tag: string) => (
              <button key={tag} onClick={() => router.push(`/dashboard?search=${encodeURIComponent(tag.replace('#', ''))}`)}
                className="text-xs text-purple-600 hover:underline cursor-pointer font-medium">{tag}</button>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-purple-50">
            <div className="flex items-center gap-4">
              <button onClick={() => { setLiked(!liked); setLikes(liked ? likes - 1 : likes + 1); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors">
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                <span className={liked ? 'text-red-500 font-medium' : ''}>{likes.toLocaleString()}</span>
              </button>
              <button onClick={() => setShowComments(true)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors">
                <MessageCircle className="w-4 h-4" />{post.comments}
              </button>
              <button onClick={() => setShowShare(true)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors">
                <Share2 className="w-4 h-4" />{post.shares}
              </button>
            </div>
            <button onClick={() => setSaved(!saved)} className="text-gray-400 hover:text-purple-600 transition-colors">
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-purple-500 text-purple-500' : ''}`} />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function StoryShareModal({ onClose }: { onClose: () => void }) {
  const [caption, setCaption] = useState('');
  const [dest, setDest]       = useState('');
  const [submitted, setSubmitted] = useState(false);
  function submit() {
    if (!caption.trim() || !dest.trim()) return;
    setSubmitted(true);
    setTimeout(onClose, 2000);
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
        {submitted ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🎉</div>
            <p className="font-bold text-gray-800">Story share ho gayi!</p>
            <p className="text-sm text-gray-500 mt-1">Community dekh sakti hai aapki story</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg">Story Share Karo ✍️</h3>
              <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Destination</label>
                <input value={dest} onChange={e => setDest(e.target.value)} placeholder="e.g. Jaipur, Rajasthan"
                  className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Apna Experience</label>
                <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={4}
                  placeholder="Apna travel experience share karo..."
                  className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500 resize-none" />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                📸 Photo upload feature coming soon! Abhi text story share karo.
              </div>
            </div>
            <button onClick={submit} disabled={!caption.trim() || !dest.trim()}
              className="mt-5 w-full py-3 text-white font-semibold rounded-xl disabled:opacity-50 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
              Share Karo 🚀
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function CommunityPage() {
  const [search, setSearch]         = useState('');
  const [showStoryModal, setShowStoryModal] = useState(false);
  const tipIndex = new Date().getDate() % TRAVEL_TIPS.length;

  const filteredPosts = communityPosts.filter((post) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      post.caption.toLowerCase().includes(q) ||
      post.destination.toLowerCase().includes(q) ||
      post.user.name.toLowerCase().includes(q) ||
      post.tags.some((tag: string) => tag.toLowerCase().includes(q))
    );
  });

  return (
    <AppLayout>
      <AnimatePresence>
        {showStoryModal && <StoryShareModal onClose={() => setShowStoryModal(false)} />}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Community 🇮🇳</h1>
          <p className="text-sm text-gray-500 mt-1">Indian travelers ki stories aur experiences</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowStoryModal(true)}
          className="flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg text-sm"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
          <Plus className="w-4 h-4" /> Story Share Karo
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-2xl px-4 py-3 shadow-sm">
            <Search className="w-4 h-4 text-purple-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Posts, destinations, travelers dhundho..."
              className="bg-transparent text-sm outline-none text-gray-600 placeholder-gray-400 w-full" />
            {search && <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 text-xs flex-shrink-0">✕</button>}
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-purple-50">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-600 font-medium">Koi post nahi mila</p>
              <button onClick={() => setSearch('')} className="mt-4 text-sm text-purple-600 hover:underline">Search clear karo</button>
            </div>
          ) : (
            filteredPosts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-5 shadow-card border border-purple-50">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-gray-800">Top Explorers 🏆</h3>
            </div>
            <div className="space-y-3">
              {leaderboard.map((user) => (
                <div key={user.rank} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    user.rank === 1 ? 'bg-amber-100 text-amber-700' : user.rank === 2 ? 'bg-gray-100 text-gray-600' :
                    user.rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-purple-50 text-purple-500'}`}>
                    {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
                  </div>
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.states} states · {user.trips} trips</p>
                  </div>
                  <span className="text-xs font-bold text-purple-600">{user.points.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-card border border-purple-50">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-gray-800">Trending Destinations 🔥</h3>
            </div>
            <div className="space-y-2">
              {['🏰 Jaipur, Rajasthan','🏔️ Ladakh, J&K','🌴 Kerala Backwaters','🏖️ Goa Beaches','🕌 Varanasi, UP','🌿 Coorg, Karnataka','��️ Andaman Islands'].map((dest, i) => (
                <div key={dest} className="flex items-center justify-between py-2 border-b border-purple-50 last:border-0">
                  <span className="text-sm text-gray-700">{dest}</span>
                  <span className="text-xs text-gray-400 font-medium">#{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-5 border border-orange-100" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.05))' }}>
            <p className="text-sm font-bold text-gray-800 mb-2">💡 Aaj ka Travel Tip</p>
            <p className="text-xs text-gray-600 leading-relaxed">{TRAVEL_TIPS[tipIndex]}</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
