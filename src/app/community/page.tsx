'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { communityPosts, leaderboard } from '@/lib/dummy-data';
import { Heart, MessageCircle, Share2, Bookmark, MapPin, Trophy, TrendingUp, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';

function PostCard({ post, index }: { post: any; index: number }) {
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.saved);
  const [likes, setLikes] = useState(post.likes);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl overflow-hidden shadow-card border border-purple-50"
    >
      {/* User header */}
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
              <MapPin className="w-3 h-3" />
              {post.destination}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{format(new Date(post.timestamp), 'MMM d')}</span>
          <button className="text-xs px-3 py-1 rounded-full font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
            Follow
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: '280px' }}>
        <img src={post.images[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
          <span className="text-xs">🇮🇳</span>
          <span className="text-white text-xs font-medium">{post.destination}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{post.caption}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag: string) => (
            <span key={tag} className="text-xs text-purple-600 hover:underline cursor-pointer font-medium">{tag}</span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-purple-50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setLiked(!liked); setLikes(liked ? likes - 1 : likes + 1); }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              <span className={liked ? 'text-red-500 font-medium' : ''}>{likes.toLocaleString()}</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors">
              <MessageCircle className="w-4 h-4" />
              {post.comments}
            </button>
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors">
              <Share2 className="w-4 h-4" />
              {post.shares}
            </button>
          </div>
          <button onClick={() => setSaved(!saved)} className="text-gray-400 hover:text-purple-600 transition-colors">
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-purple-500 text-purple-500' : ''}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CommunityPage() {
  const [search, setSearch] = useState('');

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Community 🇮🇳</h1>
          <p className="text-sm text-gray-500 mt-1">Indian travelers ki stories aur experiences</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg text-sm"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
        >
          <Plus className="w-4 h-4" /> Story Share Karo
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-2xl px-4 py-3 shadow-sm">
            <Search className="w-4 h-4 text-purple-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Posts, destinations, travelers dhundho..."
              className="bg-transparent text-sm outline-none text-gray-600 placeholder-gray-400 w-full"
            />
          </div>
          {communityPosts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Leaderboard */}
          <div className="bg-white rounded-3xl p-5 shadow-card border border-purple-50">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-gray-800">Top Explorers 🏆</h3>
            </div>
            <div className="space-y-3">
              {leaderboard.map((user) => (
                <div key={user.rank} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    user.rank === 1 ? 'bg-amber-100 text-amber-700' :
                    user.rank === 2 ? 'bg-gray-100 text-gray-600' :
                    user.rank === 3 ? 'bg-orange-100 text-orange-700' :
                    'bg-purple-50 text-purple-500'
                  }`}>
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

          {/* Trending */}
          <div className="bg-white rounded-3xl p-5 shadow-card border border-purple-50">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-gray-800">Trending Destinations 🔥</h3>
            </div>
            <div className="space-y-2">
              {[
                '🏰 Jaipur, Rajasthan',
                '🏔️ Ladakh, J&K',
                '🌴 Kerala Backwaters',
                '🏖️ Goa Beaches',
                '🕌 Varanasi, UP',
                '🌿 Coorg, Karnataka',
                '🏝️ Andaman Islands',
              ].map((dest, i) => (
                <div key={dest} className="flex items-center justify-between py-2 border-b border-purple-50 last:border-0">
                  <span className="text-sm text-gray-700">{dest}</span>
                  <span className="text-xs text-gray-400 font-medium">#{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* India travel tip */}
          <div className="rounded-3xl p-5 border border-orange-100" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.05))' }}>
            <p className="text-sm font-bold text-gray-800 mb-2">💡 Aaj ka Travel Tip</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Rajasthan trip ke liye October-March best time hai. Gर्मियों में 45°C tak temperature ho sakta hai! 🌡️
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
