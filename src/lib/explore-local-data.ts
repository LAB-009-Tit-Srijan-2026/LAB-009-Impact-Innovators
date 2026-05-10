/**
 * src/lib/explore-local-data.ts
 * Data for Local Partner Marketplace — listings, guides, offbeat locations
 */

export type ListingCategory = 'stay' | 'food' | 'experience' | 'shop' | 'transport' | 'guide';
export type PricingType     = 'hour' | 'day' | 'night' | 'person' | 'fixed';
export type BudgetLevel     = 'low' | 'medium' | 'high';
export type GuideType       = 'trekking' | 'spiritual' | 'city' | 'wildlife' | 'heritage';

export interface Listing {
  id: string;
  title: string;
  category: ListingCategory;
  description: string;
  price: number;
  pricing_type: PricingType;
  images: string[];
  location: string;
  state: string;
  rating: number;
  reviews: number;
  tags: string[];
  partner_id: string;
  available: boolean;
}

export interface Guide extends Listing {
  category: 'guide';
  guide_type: GuideType;
  name: string;
  avatar: string;
  experience_years: number;
  languages: string[];
  speciality: string;
}

export interface OffbeatLocation {
  id: string;
  title: string;
  description: string;
  image: string;
  state: string;
  tags: string[];
  crowd_level: 'very_low' | 'low' | 'moderate';
  best_time: string;
  nearby_listing_ids: string[];
}

// ─── LISTINGS ──────────────────────────────────────────────────────────────────
export const listings: Listing[] = [
  // STAYS
  {
    id: 'l_s1', title: 'Himalayan Homestay — Manali', category: 'stay',
    description: 'Cozy room in a local family home with mountain views, home-cooked Himachali meals included.',
    price: 1200, pricing_type: 'night',
    images: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80'],
    location: 'Old Manali', state: 'Himachal Pradesh', rating: 4.8, reviews: 142,
    tags: ['Budget Friendly', 'Local', 'Meals Included'], partner_id: 'p1', available: true,
  },
  {
    id: 'l_s2', title: 'Backwater Houseboat Stay', category: 'stay',
    description: 'Traditional Kerala kettuvallam with AC bedroom, chef, and sunset cruise on Vembanad Lake.',
    price: 4500, pricing_type: 'night',
    images: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80'],
    location: 'Alleppey', state: 'Kerala', rating: 4.9, reviews: 287,
    tags: ['Premium', 'Unique', 'Romantic'], partner_id: 'p2', available: true,
  },
  {
    id: 'l_s3', title: 'Desert Camp — Jaisalmer', category: 'stay',
    description: 'Luxury tents in the Thar Desert with bonfire, folk music, and camel safari.',
    price: 3500, pricing_type: 'night',
    images: ['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80'],
    location: 'Sam Sand Dunes', state: 'Rajasthan', rating: 4.7, reviews: 198,
    tags: ['Offbeat', 'Unique', 'Adventure'], partner_id: 'p3', available: true,
  },
  // FOOD
  {
    id: 'l_f1', title: 'Kumaoni Thali Experience', category: 'food',
    description: 'Authentic Kumaoni meal — Bhatt ki Churkani, Aloo ke Gutke, Bal Mithai — cooked by local family.',
    price: 350, pricing_type: 'person',
    images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80'],
    location: 'Nainital', state: 'Uttarakhand', rating: 4.9, reviews: 89,
    tags: ['Local', 'Budget Friendly', 'Authentic'], partner_id: 'p4', available: true,
  },
  {
    id: 'l_f2', title: 'Varanasi Street Food Walk', category: 'food',
    description: 'Guided 2-hour walk through Kashi\'s best chaat, kachori, lassi, and paan spots.',
    price: 500, pricing_type: 'person',
    images: ['https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=600&q=80'],
    location: 'Dashashwamedh Ghat', state: 'Uttar Pradesh', rating: 4.8, reviews: 312,
    tags: ['Local', 'Budget Friendly', 'Guided'], partner_id: 'p5', available: true,
  },
  // EXPERIENCES
  {
    id: 'l_e1', title: 'Sunrise Yoga at Rishikesh Ghat', category: 'experience',
    description: 'Daily 90-min yoga & meditation session by certified instructor on the banks of Ganga.',
    price: 600, pricing_type: 'person',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'],
    location: 'Rishikesh', state: 'Uttarakhand', rating: 4.9, reviews: 445,
    tags: ['Wellness', 'Spiritual', 'Local'], partner_id: 'p6', available: true,
  },
  {
    id: 'l_e2', title: 'Pottery Workshop — Khurja', category: 'experience',
    description: 'Learn traditional blue pottery from master artisan. Take home your creation.',
    price: 800, pricing_type: 'person',
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80'],
    location: 'Khurja', state: 'Uttar Pradesh', rating: 4.7, reviews: 67,
    tags: ['Offbeat', 'Craft', 'Local'], partner_id: 'p7', available: true,
  },
  // TRANSPORT
  {
    id: 'l_t1', title: 'Royal Enfield Himalayan Rental', category: 'transport',
    description: 'Well-maintained RE Himalayan 411cc with helmet, toolkit, and route map. Perfect for Spiti/Ladakh.',
    price: 1200, pricing_type: 'day',
    images: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80'],
    location: 'Manali', state: 'Himachal Pradesh', rating: 4.6, reviews: 203,
    tags: ['Adventure', 'Budget Friendly'], partner_id: 'p8', available: true,
  },
  {
    id: 'l_t2', title: 'Tuk-Tuk City Tour — Jaipur', category: 'transport',
    description: 'Half-day auto-rickshaw tour of Pink City with local driver-guide. Covers 8 major spots.',
    price: 800, pricing_type: 'day',
    images: ['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80'],
    location: 'Jaipur', state: 'Rajasthan', rating: 4.8, reviews: 156,
    tags: ['Local', 'Budget Friendly', 'Guided'], partner_id: 'p9', available: true,
  },
  // SHOP
  {
    id: 'l_sh1', title: 'Pashmina Weaving Studio — Srinagar', category: 'shop',
    description: 'Buy authentic hand-woven Pashmina directly from artisan family. Certificate of authenticity included.',
    price: 2500, pricing_type: 'fixed',
    images: ['https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80'],
    location: 'Srinagar', state: 'J&K', rating: 4.9, reviews: 78,
    tags: ['Authentic', 'Local', 'Premium'], partner_id: 'p10', available: true,
  },
];

// ─── GUIDES ────────────────────────────────────────────────────────────────────
export const guides: Guide[] = [
  {
    id: 'g1', title: 'Rohan Thakur — Himalayan Trek Expert', category: 'guide',
    guide_type: 'trekking', name: 'Rohan Thakur',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    experience_years: 12, languages: ['Hindi', 'English', 'Pahadi'],
    speciality: 'Spiti Valley, Pin Parvati Pass, Hampta Pass',
    description: 'Certified mountaineer with 12 years leading high-altitude treks. ITBP trained, first-aid certified.',
    price: 2500, pricing_type: 'day',
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80'],
    location: 'Manali', state: 'Himachal Pradesh', rating: 4.9, reviews: 234,
    tags: ['Trekking', 'Adventure', 'Certified'], partner_id: 'g_p1', available: true,
  },
  {
    id: 'g2', title: 'Pandit Ramesh Sharma — Kashi Guide', category: 'guide',
    guide_type: 'spiritual', name: 'Pandit Ramesh Sharma',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    experience_years: 20, languages: ['Hindi', 'English', 'Sanskrit', 'Bengali'],
    speciality: 'Varanasi Ghats, Kashi Vishwanath, Sarnath, Ganga Aarti',
    description: 'Born and raised in Varanasi. Deep knowledge of Hindu rituals, temple history, and spiritual significance.',
    price: 1500, pricing_type: 'day',
    images: ['https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=600&q=80'],
    location: 'Varanasi', state: 'Uttar Pradesh', rating: 5.0, reviews: 412,
    tags: ['Spiritual', 'Heritage', 'Local Expert'], partner_id: 'g_p2', available: true,
  },
  {
    id: 'g3', title: 'Priya Nair — Kerala Backwaters Guide', category: 'guide',
    guide_type: 'city', name: 'Priya Nair',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    experience_years: 7, languages: ['Malayalam', 'English', 'Hindi', 'Tamil'],
    speciality: 'Alleppey Backwaters, Munnar Tea Gardens, Kochi Heritage Walk',
    description: 'Tourism graduate with deep knowledge of Kerala\'s culture, cuisine, and hidden waterways.',
    price: 1800, pricing_type: 'day',
    images: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80'],
    location: 'Kochi', state: 'Kerala', rating: 4.8, reviews: 189,
    tags: ['City Guide', 'Nature', 'Local Expert'], partner_id: 'g_p3', available: true,
  },
  {
    id: 'g4', title: 'Arjun Singh — Rajasthan Heritage Expert', category: 'guide',
    guide_type: 'heritage', name: 'Arjun Singh',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    experience_years: 15, languages: ['Hindi', 'English', 'Rajasthani', 'French'],
    speciality: 'Amber Fort, City Palace, Jaisalmer Fort, Mehrangarh',
    description: 'Rajput heritage expert. Knows every stone of Rajasthan\'s forts and their untold stories.',
    price: 2000, pricing_type: 'day',
    images: ['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80'],
    location: 'Jaipur', state: 'Rajasthan', rating: 4.9, reviews: 356,
    tags: ['Heritage', 'History', 'Multilingual'], partner_id: 'g_p4', available: true,
  },
  {
    id: 'g5', title: 'Tenzin Dorje — Ladakh Monastery Guide', category: 'guide',
    guide_type: 'spiritual', name: 'Tenzin Dorje',
    avatar: 'https://randomuser.me/api/portraits/men/88.jpg',
    experience_years: 9, languages: ['Ladakhi', 'Hindi', 'English', 'Tibetan'],
    speciality: 'Thiksey, Hemis, Diskit Monasteries, Pangong Lake, Nubra Valley',
    description: 'Local Ladakhi guide with deep Buddhist knowledge. Knows secret viewpoints and off-road routes.',
    price: 2200, pricing_type: 'day',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'],
    location: 'Leh', state: 'Ladakh', rating: 4.9, reviews: 178,
    tags: ['Spiritual', 'Adventure', 'Offbeat'], partner_id: 'g_p5', available: true,
  },
  {
    id: 'g6', title: 'Meera Devi — Budget City Guide Jaipur', category: 'guide',
    guide_type: 'city', name: 'Meera Devi',
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    experience_years: 4, languages: ['Hindi', 'English'],
    speciality: 'Jaipur local markets, street food, hidden havelis',
    description: 'Young local guide specializing in budget travel. Knows the best cheap eats and hidden gems.',
    price: 800, pricing_type: 'day',
    images: ['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80'],
    location: 'Jaipur', state: 'Rajasthan', rating: 4.6, reviews: 94,
    tags: ['Budget Friendly', 'Local', 'City Guide'], partner_id: 'g_p6', available: true,
  },
];

// ─── OFFBEAT LOCATIONS ─────────────────────────────────────────────────────────
export const offbeatLocations: OffbeatLocation[] = [
  {
    id: 'ob1', title: 'Ziro Valley, Arunachal Pradesh',
    description: 'UNESCO tentative heritage site — lush paddy fields, Apatani tribe villages, and zero tourists.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    state: 'Arunachal Pradesh', tags: ['Offbeat', 'Tribal', 'Less Crowded', 'UNESCO'],
    crowd_level: 'very_low', best_time: 'Sep–Nov',
    nearby_listing_ids: ['g1', 'l_s1'],
  },
  {
    id: 'ob2', title: 'Majuli Island, Assam',
    description: 'World\'s largest river island — Vaishnavite monasteries, mask-making, and migratory birds.',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80',
    state: 'Assam', tags: ['Offbeat', 'Island', 'Less Crowded', 'Culture'],
    crowd_level: 'low', best_time: 'Oct–Mar',
    nearby_listing_ids: ['l_e2', 'l_f1'],
  },
  {
    id: 'ob3', title: 'Spiti Valley, Himachal Pradesh',
    description: 'Cold desert mountain valley at 12,500ft — ancient monasteries, snow leopards, and starry skies.',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
    state: 'Himachal Pradesh', tags: ['Offbeat', 'Adventure', 'Less Crowded', 'Himalayan'],
    crowd_level: 'low', best_time: 'Jun–Sep',
    nearby_listing_ids: ['g1', 'l_t1', 'l_s1'],
  },
  {
    id: 'ob4', title: 'Mawlynnong, Meghalaya',
    description: 'Asia\'s cleanest village — living root bridges, sky walk, and Khasi culture.',
    image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800&q=80',
    state: 'Meghalaya', tags: ['Offbeat', 'Eco', 'Less Crowded', 'Village'],
    crowd_level: 'very_low', best_time: 'Oct–May',
    nearby_listing_ids: ['l_e1', 'l_f1'],
  },
  {
    id: 'ob5', title: 'Dholavira, Gujarat',
    description: 'UNESCO World Heritage — 5,000-year-old Harappan city ruins in the Rann of Kutch.',
    image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&q=80',
    state: 'Gujarat', tags: ['Offbeat', 'Heritage', 'Less Crowded', 'UNESCO'],
    crowd_level: 'very_low', best_time: 'Oct–Feb',
    nearby_listing_ids: ['g4', 'l_t2'],
  },
  {
    id: 'ob6', title: 'Chopta, Uttarakhand',
    description: 'Mini Switzerland of India — rhododendron forests, Tungnath temple trek, and Chandrashila peak.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    state: 'Uttarakhand', tags: ['Offbeat', 'Trekking', 'Less Crowded', 'Himalayan'],
    crowd_level: 'low', best_time: 'Apr–Jun, Sep–Nov',
    nearby_listing_ids: ['g1', 'l_s1', 'l_e1'],
  },
];

// ─── AI RECOMMENDATION LOGIC ───────────────────────────────────────────────────
export interface TripPreferences {
  budget: 'low' | 'medium' | 'high';
  group_size: number;
  travel_type: string;
  destination?: string;
}

export interface AIRecommendation {
  category: ListingCategory;
  label: string;
  emoji: string;
  item: Listing | Guide;
  reason: string;
}

export function getAIRecommendations(prefs: TripPreferences): AIRecommendation[] {
  const { budget, travel_type, destination } = prefs;
  const recs: AIRecommendation[] = [];

  const isTrekking  = travel_type.toLowerCase().includes('adventure') || travel_type.toLowerCase().includes('trek');
  const isSpiritual = travel_type.toLowerCase().includes('spiritual') || travel_type.toLowerCase().includes('pilgrimage');
  const needsGuide  = isTrekking || isSpiritual || !destination;

  // Best Stay
  if (budget === 'low') {
    recs.push({ category: 'stay', label: 'Best Stay', emoji: '🏡',
      item: listings.find(l => l.category === 'stay' && l.price <= 1500)!,
      reason: 'Budget homestay with local meals — best value for money' });
  } else if (budget === 'medium') {
    recs.push({ category: 'stay', label: 'Best Stay', emoji: '🏡',
      item: listings.find(l => l.category === 'stay' && l.price <= 3500)!,
      reason: 'Comfortable local stay with authentic experience' });
  } else {
    recs.push({ category: 'stay', label: 'Best Stay', emoji: '🏡',
      item: listings.find(l => l.category === 'stay' && l.price >= 3500)!,
      reason: 'Premium local experience — luxury with authenticity' });
  }

  // Best Food
  recs.push({ category: 'food', label: 'Best Food', emoji: '🍛',
    item: listings.find(l => l.category === 'food')!,
    reason: budget === 'low' ? 'Authentic local thali under ₹400' : 'Guided food experience with local flavors' });

  // Best Transport
  if (budget === 'low' || isTrekking) {
    recs.push({ category: 'transport', label: 'Best Transport', emoji: '🚗',
      item: listings.find(l => l.category === 'transport' && l.price <= 1200)!,
      reason: 'Bike rental — most flexible and budget-friendly for explorers' });
  } else {
    recs.push({ category: 'transport', label: 'Best Transport', emoji: '🚗',
      item: listings.find(l => l.category === 'transport')!,
      reason: 'Local transport with guide — covers all key spots' });
  }

  // Best Guide — always suggest for trekking, spiritual, or unknown destination
  if (needsGuide) {
    let guide: Guide;
    if (isTrekking) {
      guide = guides.find(g => g.guide_type === 'trekking')!;
    } else if (isSpiritual) {
      guide = guides.find(g => g.guide_type === 'spiritual')!;
    } else if (budget === 'low') {
      guide = guides.find(g => g.price <= 1000)!;
    } else {
      guide = guides[0];
    }
    recs.push({ category: 'guide', label: 'Best Guide', emoji: '🧭',
      item: guide,
      reason: isTrekking ? 'Certified trek guide — safety first in mountains'
        : isSpiritual ? 'Local spiritual guide — unlocks deeper meaning'
        : 'Local expert guide — discover hidden gems' });
  }

  return recs.filter(r => r.item != null);
}
