/**
 * src/lib/intelligence-data.ts
 * Tourist density, analytics, and AI prediction data for India
 */

export interface TouristPlace {
  id: string;
  place_name: string;
  state: string;
  latitude: number;
  longitude: number;
  visitors_count: number;   // annual visitors in thousands
  popularity_score: number; // 0–100
  category: string;
  image: string;
  growth_trend: 'rising' | 'stable' | 'declining';
  is_offbeat: boolean;
}

export interface PredictionResult extends TouristPlace {
  predicted_score: number;
  trend_tag: '🔥 Rising' | '📉 Declining' | '➡️ Stable';
  growth_factor: number;
  insight: string;
}

// ─── DATASET: 30 Indian tourist places ────────────────────────────────────────
export const touristPlaces: TouristPlace[] = [
  // HIGH POPULARITY
  { id: 'p1',  place_name: 'Taj Mahal',          state: 'Uttar Pradesh',    latitude: 27.1751, longitude: 78.0421, visitors_count: 6260, popularity_score: 98, category: 'Heritage',   image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&q=80', growth_trend: 'stable',   is_offbeat: false },
  { id: 'p2',  place_name: 'Jaipur Pink City',   state: 'Rajasthan',        latitude: 26.9124, longitude: 75.7873, visitors_count: 5800, popularity_score: 95, category: 'Heritage',   image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=80', growth_trend: 'rising',   is_offbeat: false },
  { id: 'p3',  place_name: 'Goa Beaches',        state: 'Goa',              latitude: 15.2993, longitude: 74.1240, visitors_count: 8000, popularity_score: 92, category: 'Beach',      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80', growth_trend: 'stable',   is_offbeat: false },
  { id: 'p4',  place_name: 'Kerala Backwaters',  state: 'Kerala',           latitude: 9.4981,  longitude: 76.3388, visitors_count: 4200, popularity_score: 90, category: 'Nature',     image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80', growth_trend: 'rising',   is_offbeat: false },
  { id: 'p5',  place_name: 'Varanasi Ghats',     state: 'Uttar Pradesh',    latitude: 25.3176, longitude: 82.9739, visitors_count: 5200, popularity_score: 93, category: 'Spiritual',  image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=400&q=80', growth_trend: 'rising',   is_offbeat: false },
  { id: 'p6',  place_name: 'Manali',             state: 'Himachal Pradesh', latitude: 32.2396, longitude: 77.1887, visitors_count: 3800, popularity_score: 88, category: 'Mountains',  image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80', growth_trend: 'rising',   is_offbeat: false },
  { id: 'p7',  place_name: 'Ladakh',             state: 'Ladakh',           latitude: 34.1526, longitude: 77.5771, visitors_count: 2100, popularity_score: 85, category: 'Adventure',  image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', growth_trend: 'rising',   is_offbeat: false },
  { id: 'p8',  place_name: 'Mysore Palace',      state: 'Karnataka',        latitude: 12.3052, longitude: 76.6552, visitors_count: 3500, popularity_score: 87, category: 'Heritage',   image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80', growth_trend: 'stable',   is_offbeat: false },
  { id: 'p9',  place_name: 'Andaman Islands',    state: 'Andaman & Nicobar',latitude: 11.7401, longitude: 92.6586, visitors_count: 1800, popularity_score: 82, category: 'Beach',      image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=400&q=80', growth_trend: 'rising',   is_offbeat: false },
  { id: 'p10', place_name: 'Rishikesh',          state: 'Uttarakhand',      latitude: 30.0869, longitude: 78.2676, visitors_count: 3200, popularity_score: 86, category: 'Spiritual',  image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80', growth_trend: 'rising',   is_offbeat: false },
  // MEDIUM POPULARITY
  { id: 'p11', place_name: 'Hampi',              state: 'Karnataka',        latitude: 15.3350, longitude: 76.4600, visitors_count: 1200, popularity_score: 72, category: 'Heritage',   image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&q=80', growth_trend: 'rising',   is_offbeat: true  },
  { id: 'p12', place_name: 'Coorg',              state: 'Karnataka',        latitude: 12.3375, longitude: 75.8069, visitors_count: 1500, popularity_score: 74, category: 'Nature',     image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80', growth_trend: 'rising',   is_offbeat: false },
  { id: 'p13', place_name: 'Udaipur',            state: 'Rajasthan',        latitude: 24.5854, longitude: 73.7125, visitors_count: 2800, popularity_score: 83, category: 'Heritage',   image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=80', growth_trend: 'rising',   is_offbeat: false },
  { id: 'p14', place_name: 'Darjeeling',         state: 'West Bengal',      latitude: 27.0360, longitude: 88.2627, visitors_count: 1600, popularity_score: 76, category: 'Mountains',  image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80', growth_trend: 'stable',   is_offbeat: false },
  { id: 'p15', place_name: 'Ajanta Ellora',      state: 'Maharashtra',      latitude: 20.5519, longitude: 75.7033, visitors_count: 1400, popularity_score: 78, category: 'Heritage',   image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&q=80', growth_trend: 'stable',   is_offbeat: false },
  { id: 'p16', place_name: 'Spiti Valley',       state: 'Himachal Pradesh', latitude: 32.2461, longitude: 78.0338, visitors_count: 420,  popularity_score: 58, category: 'Adventure',  image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80', growth_trend: 'rising',   is_offbeat: true  },
  { id: 'p17', place_name: 'Rann of Kutch',      state: 'Gujarat',          latitude: 23.7337, longitude: 70.8022, visitors_count: 1100, popularity_score: 70, category: 'Nature',     image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&q=80', growth_trend: 'rising',   is_offbeat: false },
  { id: 'p18', place_name: 'Khajuraho',          state: 'Madhya Pradesh',   latitude: 24.8318, longitude: 79.9199, visitors_count: 900,  popularity_score: 68, category: 'Heritage',   image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&q=80', growth_trend: 'stable',   is_offbeat: false },
  // LOW / OFFBEAT
  { id: 'p19', place_name: 'Ziro Valley',        state: 'Arunachal Pradesh',latitude: 27.5330, longitude: 93.8330, visitors_count: 85,   popularity_score: 38, category: 'Nature',     image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80', growth_trend: 'rising',   is_offbeat: true  },
  { id: 'p20', place_name: 'Majuli Island',      state: 'Assam',            latitude: 26.9500, longitude: 94.1667, visitors_count: 120,  popularity_score: 42, category: 'Culture',    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80', growth_trend: 'rising',   is_offbeat: true  },
  { id: 'p21', place_name: 'Mawlynnong',         state: 'Meghalaya',        latitude: 25.2020, longitude: 91.9020, visitors_count: 95,   popularity_score: 40, category: 'Nature',     image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=400&q=80', growth_trend: 'rising',   is_offbeat: true  },
  { id: 'p22', place_name: 'Chopta',             state: 'Uttarakhand',      latitude: 30.4200, longitude: 79.2200, visitors_count: 180,  popularity_score: 45, category: 'Adventure',  image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', growth_trend: 'rising',   is_offbeat: true  },
  { id: 'p23', place_name: 'Dholavira',          state: 'Gujarat',          latitude: 23.8877, longitude: 70.2167, visitors_count: 65,   popularity_score: 35, category: 'Heritage',   image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&q=80', growth_trend: 'rising',   is_offbeat: true  },
  { id: 'p24', place_name: 'Tawang',             state: 'Arunachal Pradesh',latitude: 27.5860, longitude: 91.8590, visitors_count: 110,  popularity_score: 44, category: 'Spiritual',  image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', growth_trend: 'rising',   is_offbeat: true  },
  { id: 'p25', place_name: 'Gandikota',          state: 'Andhra Pradesh',   latitude: 14.8100, longitude: 78.2700, visitors_count: 75,   popularity_score: 36, category: 'Heritage',   image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&q=80', growth_trend: 'rising',   is_offbeat: true  },
  { id: 'p26', place_name: 'Dzukou Valley',      state: 'Nagaland',         latitude: 25.5500, longitude: 94.1000, visitors_count: 55,   popularity_score: 32, category: 'Nature',     image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80', growth_trend: 'rising',   is_offbeat: true  },
  { id: 'p27', place_name: 'Lonar Crater',       state: 'Maharashtra',      latitude: 19.9800, longitude: 76.5100, visitors_count: 45,   popularity_score: 28, category: 'Nature',     image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=400&q=80', growth_trend: 'rising',   is_offbeat: true  },
  { id: 'p28', place_name: 'Munsiyari',          state: 'Uttarakhand',      latitude: 30.0667, longitude: 80.2333, visitors_count: 160,  popularity_score: 48, category: 'Mountains',  image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80', growth_trend: 'rising',   is_offbeat: true  },
  { id: 'p29', place_name: 'Pattadakal',         state: 'Karnataka',        latitude: 15.9500, longitude: 75.8200, visitors_count: 88,   popularity_score: 39, category: 'Heritage',   image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&q=80', growth_trend: 'stable',   is_offbeat: true  },
  { id: 'p30', place_name: 'Nubra Valley',       state: 'Ladakh',           latitude: 34.6500, longitude: 77.5500, visitors_count: 320,  popularity_score: 55, category: 'Adventure',  image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', growth_trend: 'rising',   is_offbeat: false },
];

// ─── 1. HEATMAP DATA ───────────────────────────────────────────────────────────
export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number; // 0–1
  place_name: string;
  visitors_count: number;
}

export function generateHeatmapData(): HeatmapPoint[] {
  const maxVisitors = Math.max(...touristPlaces.map(p => p.visitors_count));
  return touristPlaces.map(p => ({
    lat: p.latitude,
    lng: p.longitude,
    intensity: p.visitors_count / maxVisitors,
    place_name: p.place_name,
    visitors_count: p.visitors_count,
  }));
}

// ─── 2. POPULARITY RANKING ─────────────────────────────────────────────────────
export function calculatePopularityRanking(): TouristPlace[] {
  return [...touristPlaces].sort((a, b) => b.popularity_score - a.popularity_score);
}

// ─── 3. TOP STATES ─────────────────────────────────────────────────────────────
export interface StateStats {
  state: string;
  total_visitors: number;
  place_count: number;
  avg_popularity: number;
  top_place: string;
}

export function getTopStates(): StateStats[] {
  const map = new Map<string, TouristPlace[]>();
  touristPlaces.forEach(p => {
    if (!map.has(p.state)) map.set(p.state, []);
    map.get(p.state)!.push(p);
  });
  return Array.from(map.entries())
    .map(([state, places]) => ({
      state,
      total_visitors: places.reduce((s, p) => s + p.visitors_count, 0),
      place_count: places.length,
      avg_popularity: Math.round(places.reduce((s, p) => s + p.popularity_score, 0) / places.length),
      top_place: places.sort((a, b) => b.popularity_score - a.popularity_score)[0].place_name,
    }))
    .sort((a, b) => b.total_visitors - a.total_visitors)
    .slice(0, 10);
}

// ─── 4. CATEGORY DISTRIBUTION ─────────────────────────────────────────────────
export interface CategoryStats {
  category: string;
  count: number;
  total_visitors: number;
  avg_score: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Heritage:  '#7c3aed', Beach:     '#06b6d4', Nature:    '#10b981',
  Mountains: '#3b82f6', Spiritual: '#f59e0b', Adventure: '#ef4444',
  Culture:   '#ec4899', Other:     '#6b7280',
};

export function getCategoryDistribution(): CategoryStats[] {
  const map = new Map<string, TouristPlace[]>();
  touristPlaces.forEach(p => {
    if (!map.has(p.category)) map.set(p.category, []);
    map.get(p.category)!.push(p);
  });
  return Array.from(map.entries())
    .map(([category, places]) => ({
      category,
      count: places.length,
      total_visitors: places.reduce((s, p) => s + p.visitors_count, 0),
      avg_score: Math.round(places.reduce((s, p) => s + p.popularity_score, 0) / places.length),
      color: CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other,
    }))
    .sort((a, b) => b.total_visitors - a.total_visitors);
}

// ─── 5. FUTURE POPULARITY PREDICTION ──────────────────────────────────────────
// Score = (current_popularity * 0.6) + (growth_factor * 0.4)
// Growth factor: offbeat+rising → high, crowded+stable → low
export function predictFuturePopularity(): PredictionResult[] {
  const categoryBoost: Record<string, number> = {
    Adventure: 15, Nature: 12, Heritage: 8, Beach: 6,
    Spiritual: 10, Mountains: 14, Culture: 9, Other: 5,
  };

  return touristPlaces.map(p => {
    const trendMultiplier = p.growth_trend === 'rising' ? 1.3 : p.growth_trend === 'declining' ? 0.7 : 1.0;
    const offbeatBoost    = p.is_offbeat ? 18 : 0;
    const crowdPenalty    = p.popularity_score > 85 ? -5 : 0;
    const catBoost        = categoryBoost[p.category] ?? 5;

    const growth_factor = Math.min(100,
      (catBoost + offbeatBoost + crowdPenalty) * trendMultiplier
    );

    const predicted_score = Math.min(100, Math.round(
      p.popularity_score * 0.6 + growth_factor * 0.4
    ));

    const delta = predicted_score - p.popularity_score;
    const trend_tag: PredictionResult['trend_tag'] =
      delta >= 5 ? '🔥 Rising' : delta <= -3 ? '📉 Declining' : '➡️ Stable';

    const insight =
      p.is_offbeat && trend_tag === '🔥 Rising'
        ? 'Hidden gem going viral — visit before crowds arrive!'
        : trend_tag === '🔥 Rising'
        ? 'Strong growth momentum — book early'
        : trend_tag === '📉 Declining'
        ? 'Losing popularity — consider alternatives'
        : 'Consistently popular — reliable choice';

    return { ...p, predicted_score, trend_tag, growth_factor: Math.round(growth_factor), insight };
  }).sort((a, b) => b.predicted_score - a.predicted_score);
}
