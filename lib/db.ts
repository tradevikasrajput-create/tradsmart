import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const hasDb = !!process.env.DATABASE_URL;
let pool: Pool | null = null;

if (hasDb) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // Initialize DB tables
  pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      plan VARCHAR(50) DEFAULT 'free',
      is_banned BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS trades (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      symbol VARCHAR(50) NOT NULL,
      type VARCHAR(20) NOT NULL,
      entry DECIMAL NOT NULL,
      size INTEGER NOT NULL,
      pnl DECIMAL DEFAULT 0,
      status VARCHAR(20) DEFAULT 'OPEN',
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      kill_switch BOOLEAN DEFAULT false
    );
    INSERT INTO system_settings (id, kill_switch) VALUES (1, false) ON CONFLICT DO NOTHING;
  `).then(async () => {
    // Create default admin if not exists
    const adminEmail = 'admin@quant.com';
    const adminHash = await bcrypt.hash('admin123', 10);
    await pool!.query(`
      INSERT INTO users (email, password_hash, role, plan) 
      VALUES ($1, $2, 'admin', 'pro') 
      ON CONFLICT (email) DO NOTHING;
    `, [adminEmail, adminHash]);
  }).catch(console.error);
}

// Mock state for local preview without Postgres
const mockDb = {
  users: [
    {
      id: 'admin-1',
      email: 'admin@quant.com',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      plan: 'pro',
      isBanned: false,
    }
  ] as any[],
  trades: [] as any[],
  system: { killSwitch: false }
};

// Helper to map DB row to User object
const mapUser = (row: any) => ({
  id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
  role: row.role,
  plan: row.plan,
  isBanned: row.is_banned
});

export const db = {
  async getUserByEmail(email: string) {
    if (pool) {
      const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return res.rows[0] ? mapUser(res.rows[0]) : null;
    }
    return mockDb.users.find(u => u.email === email) || null;
  },
  async getUserById(id: string) {
    if (pool) {
      const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return res.rows[0] ? mapUser(res.rows[0]) : null;
    }
    return mockDb.users.find(u => u.id === id) || null;
  },
  async createUser(email: string, passwordHash: string) {
    if (pool) {
      const res = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
        [email, passwordHash]
      );
      return mapUser(res.rows[0]);
    }
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      passwordHash,
      role: 'user' as const,
      plan: 'free' as const,
      isBanned: false,
    };
    mockDb.users.push(newUser);
    return newUser;
  },
  async getAllUsers() {
    if (pool) {
      const res = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
      return res.rows.map(mapUser);
    }
    return mockDb.users;
  },
  async updateUser(id: string, updates: { plan?: string; isBanned?: boolean }) {
    if (pool) {
      const sets = [];
      const values = [];
      let idx = 1;
      if (updates.plan !== undefined) {
        sets.push(`plan = $${idx++}`);
        values.push(updates.plan);
      }
      if (updates.isBanned !== undefined) {
        sets.push(`is_banned = $${idx++}`);
        values.push(updates.isBanned);
      }
      values.push(id);
      if (sets.length === 0) return this.getUserById(id);
      
      const res = await pool.query(
        `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );
      return res.rows[0] ? mapUser(res.rows[0]) : null;
    }
    const user = mockDb.users.find(u => u.id === id);
    if (user) {
      if (updates.plan !== undefined) user.plan = updates.plan as any;
      if (updates.isBanned !== undefined) user.isBanned = updates.isBanned;
    }
    return user;
  },
  async getKillSwitch() {
    if (pool) {
      const res = await pool.query('SELECT kill_switch FROM system_settings WHERE id = 1');
      return res.rows[0]?.kill_switch || false;
    }
    return mockDb.system.killSwitch;
  },
  async setKillSwitch(value: boolean) {
    if (pool) {
      await pool.query('UPDATE system_settings SET kill_switch = $1 WHERE id = 1', [value]);
      return value;
    }
    mockDb.system.killSwitch = value;
    return value;
  },
  async getUserTrades(userId: string) {
    if (pool) {
      const res = await pool.query('SELECT * FROM trades WHERE user_id = $1 ORDER BY timestamp DESC', [userId]);
      return res.rows;
    }
    return mockDb.trades.filter(t => t.userId === userId);
  }
};
