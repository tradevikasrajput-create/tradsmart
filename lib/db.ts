export type User = {
  id: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  plan: 'free' | 'pro';
  isBanned: boolean;
};

export type Trade = {
  id: string;
  userId: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  size: number;
  pnl: number;
  status: 'OPEN' | 'CLOSED';
  timestamp: string;
};

// In-memory database for demonstration purposes
// Note: In a real app, this would be PostgreSQL
export const db = {
  users: [
    {
      id: 'admin-1',
      email: 'admin@quant.com',
      passwordHash: 'admin123', // Mock hash
      role: 'admin',
      plan: 'pro',
      isBanned: false,
    }
  ] as User[],
  trades: [] as Trade[],
  system: {
    killSwitch: false,
  }
};
