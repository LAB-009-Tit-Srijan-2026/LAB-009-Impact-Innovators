import { NextRequest, NextResponse } from 'next/server';

// In-memory user store (swap for DB in production)
interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string; // hashed in prod — plain for demo
  avatar: string;
  location: string;
  tripsCount: number;
  statesVisited: number;
  createdAt: string;
}

const usersDB = new Map<string, StoredUser>();

// Seed demo user
usersDB.set('rahul@tripnexus.in', {
  id: 'u1',
  name: 'Rahul Sharma',
  email: 'rahul@tripnexus.in',
  password: 'demo123',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  location: 'Delhi, India',
  tripsCount: 14,
  statesVisited: 18,
  createdAt: '2024-01-01',
});

function generateId() {
  return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function getAvatar(name: string, gender: 'male' | 'female' = 'male') {
  const num = Math.floor(Math.random() * 70 + 1);
  return `https://randomuser.me/api/portraits/${gender === 'female' ? 'women' : 'men'}/${num}.jpg`;
}

/**
 * POST /api/auth
 * Body: { action: 'login' | 'signup' | 'logout', ...fields }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // ── LOGIN ──────────────────────────────────────────────────────────────
    if (action === 'login') {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ success: false, error: 'Email aur password required hai' }, { status: 400 });
      }

      const user = usersDB.get(email.toLowerCase().trim());
      if (!user) {
        return NextResponse.json({ success: false, error: 'Yeh email registered nahi hai' }, { status: 401 });
      }
      if (user.password !== password) {
        return NextResponse.json({ success: false, error: 'Password galat hai' }, { status: 401 });
      }

      const { password: _, ...safeUser } = user;
      return NextResponse.json({
        success: true,
        user: safeUser,
        message: `Welcome back, ${user.name.split(' ')[0]}! 🙏`,
      });
    }

    // ── SIGNUP ─────────────────────────────────────────────────────────────
    if (action === 'signup') {
      const { name, email, password, location = 'India', gender = 'male' } = body;

      if (!name || !email || !password) {
        return NextResponse.json({ success: false, error: 'Naam, email aur password required hai' }, { status: 400 });
      }
      if (name.trim().length < 2) {
        return NextResponse.json({ success: false, error: 'Naam kam se kam 2 characters ka hona chahiye' }, { status: 400 });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ success: false, error: 'Valid email address daalo' }, { status: 400 });
      }
      if (password.length < 6) {
        return NextResponse.json({ success: false, error: 'Password kam se kam 6 characters ka hona chahiye' }, { status: 400 });
      }

      const normalizedEmail = email.toLowerCase().trim();
      if (usersDB.has(normalizedEmail)) {
        return NextResponse.json({ success: false, error: 'Yeh email already registered hai. Login karo!' }, { status: 409 });
      }

      const newUser: StoredUser = {
        id: generateId(),
        name: name.trim(),
        email: normalizedEmail,
        password,
        avatar: getAvatar(name, gender),
        location: location || 'India',
        tripsCount: 0,
        statesVisited: 0,
        createdAt: new Date().toISOString(),
      };

      usersDB.set(normalizedEmail, newUser);
      const { password: _, ...safeUser } = newUser;

      return NextResponse.json({
        success: true,
        user: safeUser,
        message: `Welcome to TripNexus, ${name.split(' ')[0]}! 🎉`,
      }, { status: 201 });
    }

    // ── GOOGLE OAUTH (simulated) ───────────────────────────────────────────
    if (action === 'google') {
      const { name, email, avatar } = body;
      if (!email) return NextResponse.json({ success: false, error: 'Google auth failed' }, { status: 400 });

      const normalizedEmail = email.toLowerCase().trim();
      let user = usersDB.get(normalizedEmail);

      if (!user) {
        user = {
          id: generateId(),
          name: name ?? email.split('@')[0],
          email: normalizedEmail,
          password: '',
          avatar: avatar ?? getAvatar(name ?? 'user'),
          location: 'India',
          tripsCount: 0,
          statesVisited: 0,
          createdAt: new Date().toISOString(),
        };
        usersDB.set(normalizedEmail, user);
      }

      const { password: _, ...safeUser } = user;
      return NextResponse.json({ success: true, user: safeUser, message: `Welcome, ${safeUser.name.split(' ')[0]}! 🙏` });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
