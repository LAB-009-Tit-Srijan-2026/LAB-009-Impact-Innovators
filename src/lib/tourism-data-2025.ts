/**
 * src/lib/tourism-data-2025.ts
 * Source: India Tourism Data Compendium 2025 (66th Edition)
 * Released by: Ministry of Tourism, Government of India — September 2025
 * Data year: 2024 (latest available)
 * URL: https://tourism.gov.in/media/annual-reports
 */

// ─── NATIONAL HEADLINE FIGURES ─────────────────────────────────────────────────
export const nationalStats = {
  year: 2024,
  source: 'India Tourism Data Compendium 2025, Ministry of Tourism, Govt. of India',

  // International Tourist Arrivals
  ita_total_million: 20.57,          // India ranked 20th globally
  ita_foreign_million: 9.95,         // Foreign Tourist Arrivals (FTAs)
  ita_nri_million: 10.62,            // Non-Resident Indians
  ita_global_share_pct: 1.40,        // % of global ITAs
  ita_yoy_growth_pct: 4.52,

  // Foreign Tourist Visits (FTVs — includes multiple visits by same person)
  ftv_total_million: 20.94,
  ftv_yoy_growth_pct: 8.84,

  // Domestic Tourist Visits
  dtv_total_million: 2948.19,
  dtv_yoy_growth_pct: 17.51,
  dtv_cagr_2011_2024_pct: 9.89,

  // Foreign Exchange Earnings
  fee_usd_billion: 35.02,            // International Tourism Receipts
  fee_global_rank: 15,
  fee_global_share_pct: 2.02,
  fee_yoy_growth_pct: 8.79,

  // GDP Contribution
  gdp_contribution_pct: 5.22,        // Tourism sector's total contribution to GDP
  gdp_usd_billion: 256,              // Travel & Tourism total impact 2024
  jobs_million: 43,                  // Jobs created (2023 data)

  // ASI Monuments
  asi_ticketed_monuments: 145,
  asi_domestic_visitors_million: 54, // Total across all ASI monuments
  asi_foreign_visitors_million: 2.4,
  unesco_heritage_sites: 44,

  // Budget allocation
  govt_budget_crore_fy25: 2479,
};

// ─── TOP SOURCE MARKETS FOR FTAs (2024) ────────────────────────────────────────
export const topSourceMarkets = [
  { rank: 1,  country: 'USA',          flag: '🇺🇸', share_pct: 18.13, visitors_approx: 1804000 },
  { rank: 2,  country: 'Bangladesh',   flag: '🇧🇩', share_pct: 17.59, visitors_approx: 1750000 },
  { rank: 3,  country: 'UK',           flag: '🇬🇧', share_pct: 10.28, visitors_approx: 1023000 },
  { rank: 4,  country: 'Australia',    flag: '🇦🇺', share_pct: 5.21,  visitors_approx: 518000  },
  { rank: 5,  country: 'Canada',       flag: '🇨🇦', share_pct: 4.79,  visitors_approx: 477000  },
  { rank: 6,  country: 'Malaysia',     flag: '🇲🇾', share_pct: 3.80,  visitors_approx: 378000  },
  { rank: 7,  country: 'Sri Lanka',    flag: '🇱🇰', share_pct: 3.50,  visitors_approx: 348000  },
  { rank: 8,  country: 'Germany',      flag: '🇩🇪', share_pct: 2.90,  visitors_approx: 289000  },
  { rank: 9,  country: 'France',       flag: '🇫🇷', share_pct: 2.70,  visitors_approx: 269000  },
  { rank: 10, country: 'Singapore',    flag: '🇸🇬', share_pct: 2.24,  visitors_approx: 223000  },
];

// ─── STATE-WISE FOREIGN TOURIST VISITS (FTVs) 2024 ────────────────────────────
export const stateWiseFTV = [
  { rank: 1, state: 'Maharashtra',      ftv_million: 3.71, share_pct: 17.6, top_attraction: 'Mumbai, Ajanta-Ellora, Shirdi' },
  { rank: 2, state: 'West Bengal',      ftv_million: 3.12, share_pct: 14.9, top_attraction: 'Kolkata, Sunderbans, Darjeeling' },
  { rank: 3, state: 'Uttar Pradesh',    ftv_million: 2.27, share_pct: 10.8, top_attraction: 'Taj Mahal, Varanasi, Agra' },
  { rank: 4, state: 'Gujarat',          ftv_million: 2.27, share_pct: 10.8, top_attraction: 'Rann of Kutch, Gir Forest, Somnath' },
  { rank: 5, state: 'Rajasthan',        ftv_million: 2.07, share_pct: 9.9,  top_attraction: 'Jaipur, Udaipur, Jaisalmer' },
  { rank: 6, state: 'Tamil Nadu',       ftv_million: 1.17, share_pct: 5.6,  top_attraction: 'Meenakshi Temple, Mahabalipuram' },
  { rank: 7, state: 'Delhi',            ftv_million: 1.10, share_pct: 5.3,  top_attraction: 'Red Fort, Qutub Minar, Humayun Tomb' },
  { rank: 8, state: 'Karnataka',        ftv_million: 0.65, share_pct: 3.1,  top_attraction: 'Hampi, Mysore Palace, Coorg' },
  { rank: 9, state: 'Goa',             ftv_million: 0.58, share_pct: 2.8,  top_attraction: 'Beaches, Old Goa Churches' },
  { rank: 10, state: 'Kerala',          ftv_million: 0.52, share_pct: 2.5,  top_attraction: 'Backwaters, Munnar, Kovalam' },
];

// ─── STATE-WISE DOMESTIC TOURIST VISITS (DTVs) 2024 ──────────────────────────
export const stateWiseDTV = [
  { rank: 1, state: 'Uttar Pradesh',    dtv_million: 646.8,  yoy_growth_pct: 35.17, top_attraction: 'Varanasi, Taj Mahal, Ayodhya, Mathura' },
  { rank: 2, state: 'Tamil Nadu',       dtv_million: 306.8,  yoy_growth_pct: 7.28,  top_attraction: 'Meenakshi Temple, Ooty, Kanyakumari' },
  { rank: 3, state: 'Karnataka',        dtv_million: 304.6,  yoy_growth_pct: 7.20,  top_attraction: 'Mysore, Hampi, Coorg, Bengaluru' },
  { rank: 4, state: 'Andhra Pradesh',   dtv_million: 290.3,  yoy_growth_pct: 13.96, top_attraction: 'Tirupati, Araku Valley, Vizag' },
  { rank: 5, state: 'Rajasthan',        dtv_million: 230.1,  yoy_growth_pct: 28.50, top_attraction: 'Jaipur, Udaipur, Jaisalmer, Pushkar' },
  { rank: 6, state: 'Maharashtra',      dtv_million: 136.0,  yoy_growth_pct: 8.10,  top_attraction: 'Mumbai, Pune, Ajanta-Ellora, Shirdi' },
  { rank: 7, state: 'Gujarat',          dtv_million: 165.0,  yoy_growth_pct: 11.20, top_attraction: 'Rann of Kutch, Somnath, Dwarka' },
  { rank: 8, state: 'Madhya Pradesh',   dtv_million: 98.4,   yoy_growth_pct: 9.50,  top_attraction: 'Khajuraho, Sanchi, Kanha, Pachmarhi' },
  { rank: 9, state: 'West Bengal',      dtv_million: 88.0,   yoy_growth_pct: 6.80,  top_attraction: 'Kolkata, Darjeeling, Sunderbans' },
  { rank: 10, state: 'Himachal Pradesh',dtv_million: 17.2,   yoy_growth_pct: 12.40, top_attraction: 'Shimla, Manali, Dharamshala, Spiti' },
];

// ─── TOP MONUMENTS — DOMESTIC VISITORS FY 2024-25 ────────────────────────────
export const topMonumentsDomestic = [
  { rank: 1,  name: 'Taj Mahal',          location: 'Agra, Uttar Pradesh',       visitors_million: 6.26, coords: [27.1751, 78.0421] as [number,number] },
  { rank: 2,  name: 'Sun Temple',         location: 'Konark, Odisha',            visitors_million: 3.57, coords: [19.8876, 86.0945] as [number,number] },
  { rank: 3,  name: 'Qutub Minar',        location: 'Delhi',                     visitors_million: 3.20, coords: [28.5245, 77.1855] as [number,number] },
  { rank: 4,  name: 'Red Fort',           location: 'Delhi',                     visitors_million: 2.88, coords: [28.6562, 77.2410] as [number,number] },
  { rank: 5,  name: 'Bibi Ka Maqbara',   location: 'Aurangabad, Maharashtra',   visitors_million: 2.00, coords: [19.9018, 75.3204] as [number,number] },
  { rank: 6,  name: 'Ellora Caves',       location: 'Aurangabad, Maharashtra',   visitors_million: 1.74, coords: [20.0258, 75.1780] as [number,number] },
  { rank: 7,  name: 'Golkonda Fort',      location: 'Hyderabad, Telangana',      visitors_million: 1.56, coords: [17.3833, 78.4011] as [number,number] },
  { rank: 8,  name: 'Agra Fort',          location: 'Agra, Uttar Pradesh',       visitors_million: 1.55, coords: [27.1800, 78.0219] as [number,number] },
  { rank: 9,  name: 'Fort Aguada',        location: 'Goa',                       visitors_million: 1.36, coords: [15.4989, 73.7733] as [number,number] },
  { rank: 10, name: 'Charminar',          location: 'Hyderabad, Telangana',      visitors_million: 1.34, coords: [17.3616, 78.4747] as [number,number] },
];

// ─── TOP MONUMENTS — FOREIGN VISITORS FY 2024-25 ─────────────────────────────
export const topMonumentsForeign = [
  { rank: 1,  name: 'Taj Mahal',          location: 'Agra, Uttar Pradesh',       visitors_k: 645, coords: [27.1751, 78.0421] as [number,number] },
  { rank: 2,  name: 'Agra Fort',          location: 'Agra, Uttar Pradesh',       visitors_k: 225, coords: [27.1800, 78.0219] as [number,number] },
  { rank: 3,  name: 'Qutub Minar',        location: 'Delhi',                     visitors_k: 220, coords: [28.5245, 77.1855] as [number,number] },
  { rank: 4,  name: "Humayun's Tomb",     location: 'Delhi',                     visitors_k: 158, coords: [28.5933, 77.2507] as [number,number] },
  { rank: 5,  name: 'Abhaneri Stepwell',  location: 'Dausa, Rajasthan',          visitors_k: 116, coords: [27.0050, 76.6050] as [number,number] },
  { rank: 6,  name: 'Fatehpur Sikri',     location: 'Agra, Uttar Pradesh',       visitors_k: 97,  coords: [27.0945, 77.6600] as [number,number] },
  { rank: 7,  name: 'Itimad-ud-Daulah',  location: 'Agra, Uttar Pradesh',       visitors_k: 90,  coords: [27.1942, 78.0369] as [number,number] },
  { rank: 8,  name: 'Nalanda Site',       location: 'Nalanda, Bihar',            visitors_k: 88,  coords: [25.1358, 85.4438] as [number,number] },
  { rank: 9,  name: 'Red Fort',           location: 'Delhi',                     visitors_k: 79,  coords: [28.6562, 77.2410] as [number,number] },
  { rank: 10, name: 'Sahet Mehet Site',   location: 'Balrampur, Uttar Pradesh',  visitors_k: 73,  coords: [27.4000, 82.1800] as [number,number] },
];

// ─── MONTHLY FTA TREND 2024 ────────────────────────────────────────────────────
export const monthlyFTA2024 = [
  { month: 'Jan', fta: 1.02, fee_cr: 18420 },
  { month: 'Feb', fta: 0.89, fee_cr: 16050 },
  { month: 'Mar', fta: 0.82, fee_cr: 14780 },
  { month: 'Apr', fta: 0.68, fee_cr: 12240 },
  { month: 'May', fta: 0.61, fee_cr: 10990 },
  { month: 'Jun', fta: 0.58, fee_cr: 10440 },
  { month: 'Jul', fta: 0.65, fee_cr: 11700 },
  { month: 'Aug', fta: 0.72, fee_cr: 12960 },
  { month: 'Sep', fta: 0.78, fee_cr: 14040 },
  { month: 'Oct', fta: 0.88, fee_cr: 15840 },
  { month: 'Nov', fta: 0.96, fee_cr: 17280 },
  { month: 'Dec', fta: 1.36, fee_cr: 24480 },
];

// ─── AGE-WISE FTA DISTRIBUTION 2024 ───────────────────────────────────────────
export const ageWiseFTA = [
  { group: '0–14',  share_pct: 8.12  },
  { group: '15–24', share_pct: 12.45 },
  { group: '25–34', share_pct: 18.52 },
  { group: '35–44', share_pct: 20.67 },
  { group: '45–54', share_pct: 20.24 },
  { group: '55–64', share_pct: 12.80 },
  { group: '65+',   share_pct: 7.20  },
];

// ─── INDIA GLOBAL RANKING 2024 ────────────────────────────────────────────────
export const globalRanking = {
  ita_rank: 20,
  itr_rank: 15,
  wef_ttci_rank: 39,       // World Economic Forum Travel & Tourism Competitiveness Index
  global_ita_total_million: 1465,
  top5_countries: [
    { country: 'France',  arrivals_million: 102   },
    { country: 'Spain',   arrivals_million: 83.5  },
    { country: 'USA',     arrivals_million: 79.4  },
    { country: 'Italy',   arrivals_million: 64.5  },
    { country: 'Turkey',  arrivals_million: 51.2  },
  ],
};

// ─── YEAR-OVER-YEAR TREND (2019–2024) ─────────────────────────────────────────
export const historicalTrend = [
  { year: 2019, fta_million: 10.93, dtv_million: 2322.0, fee_usd_billion: 30.06 },
  { year: 2020, fta_million: 2.74,  dtv_million: 610.2,  fee_usd_billion: 6.96  },
  { year: 2021, fta_million: 1.52,  dtv_million: 677.6,  fee_usd_billion: 8.80  },
  { year: 2022, fta_million: 6.44,  dtv_million: 1731.0, fee_usd_billion: 22.01 },
  { year: 2023, fta_million: 9.24,  dtv_million: 2508.8, fee_usd_billion: 32.21 },
  { year: 2024, fta_million: 9.95,  dtv_million: 2948.2, fee_usd_billion: 35.02 },
];
