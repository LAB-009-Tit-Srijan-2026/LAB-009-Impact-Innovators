import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
  tripsCount: number;
  statesVisited: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (val: boolean) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  activeRoute: string;
  setActiveRoute: (route: string) => void;

  favorites: string[];
  toggleFavorite: (id: string) => void;

  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;

  tripForm: {
    source: string;
    destination: string;
    budget: number[];
    duration: number;
    travelers: number;
    type: string;
  };
  setTripForm: (form: Partial<AppState['tripForm']>) => void;

  notifications: { id: string; message: string; type: string; read: boolean }[];
  addNotification: (n: { message: string; type: string }) => void;
  markAllRead: () => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: {
        id: 'u1',
        name: 'Rahul Sharma',
        email: 'rahul@tripnexus.in',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        location: 'Delhi, India',
        tripsCount: 14,
        statesVisited: 18,
      },
      isAuthenticated: true,
      setUser: (user) => set({ user }),
      setAuthenticated: (val) => set({ isAuthenticated: val }),

      sidebarOpen: true,
      setSidebarOpen: (val) => set({ sidebarOpen: val }),
      activeRoute: '/dashboard',
      setActiveRoute: (route) => set({ activeRoute: route }),

      favorites: [],
      toggleFavorite: (id) => {
        const { favorites } = get();
        set({
          favorites: favorites.includes(id)
            ? favorites.filter((f) => f !== id)
            : [...favorites, id],
        });
      },

      chatMessages: [
        {
          id: 'init',
          role: 'assistant',
          content: 'Namaste! 🙏 Main hoon aapka AI Travel Dost! India ke kisi bhi kone mein trip plan karna ho — Rajasthan ki haveliyan, Kerala ke backwaters, Ladakh ki pahaadiyan, ya Goa ke beaches — bas batao, main poora itinerary, budget, aur tips de dunga! Kahan jaana hai? ✈️',
          timestamp: new Date(),
        },
      ],
      addChatMessage: (msg) =>
        set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
      clearChat: () =>
        set({
          chatMessages: [
            {
              id: 'init',
              role: 'assistant',
              content: 'Namaste! 🙏 Naya safar shuru karte hain! Kahan jaana hai aapko? ✈️',
              timestamp: new Date(),
            },
          ],
        }),

      tripForm: {
        source: '',
        destination: '',
        budget: [5000, 25000],
        duration: 5,
        travelers: 2,
        type: 'Family Trip',
      },
      setTripForm: (form) =>
        set((state) => ({ tripForm: { ...state.tripForm, ...form } })),

      notifications: [
        { id: 'n1', message: '🏔️ Manali hotels mein 28% price drop!', type: 'pricing', read: false },
        { id: 'n2', message: '🌧️ Kerala mein monsoon alert — June 1-15', type: 'weather', read: false },
        { id: 'n3', message: '✈️ Aapki Jaipur trip 37 din baad hai!', type: 'reminder', read: true },
        { id: 'n4', message: '🎉 Ladakh permit season shuru ho gaya!', type: 'info', read: false },
      ],
      addNotification: (n) =>
        set((state) => ({
          notifications: [
            { id: Date.now().toString(), ...n, read: false },
            ...state.notifications,
          ],
        })),
      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      theme: 'light',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    { name: 'tripnexus-india-store', partialize: (state) => ({ favorites: state.favorites, theme: state.theme }) }
  )
);
