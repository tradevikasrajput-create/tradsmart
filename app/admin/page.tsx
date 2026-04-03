'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Users, Power, Activity, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [killSwitch, setKillSwitch] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchUsers(token);
  }, []);

  const fetchUsers = async (token: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleKillSwitch = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/kill', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ killSwitch: !killSwitch })
      });
      if (res.ok) {
        setKillSwitch(!killSwitch);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateUser = async (userId: string, updates: any) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/update-plan', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, ...updates })
      });
      if (res.ok) {
        fetchUsers(token!);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          <span className="text-xl font-bold">Admin Control Panel</span>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
          }}
          className="text-sm text-slate-400 hover:text-white"
        >
          Logout
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        {/* System Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5"/> System Status</h2>
          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <div className="font-semibold">Global Kill Switch</div>
              <div className="text-sm text-slate-400">Instantly halt all trading signals and API executions.</div>
            </div>
            <button 
              onClick={toggleKillSwitch}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                killSwitch 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Power className="w-5 h-5" />
              {killSwitch ? 'SYSTEM HALTED' : 'HALT SYSTEM'}
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Users className="w-5 h-5"/> User Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-sm text-slate-400">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 font-mono text-xs text-slate-500">{u.id}</td>
                    <td className="py-4 font-medium">{u.email}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${u.plan === 'pro' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-slate-800 text-slate-300'}`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-4">
                      {u.isBanned ? (
                        <span className="flex items-center gap-1 text-red-500"><XCircle className="w-4 h-4"/> Banned</span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-500"><CheckCircle className="w-4 h-4"/> Active</span>
                      )}
                    </td>
                    <td className="py-4 text-right space-x-2">
                      {u.role !== 'admin' && (
                        <>
                          <button 
                            onClick={() => updateUser(u.id, { plan: u.plan === 'pro' ? 'free' : 'pro' })}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-medium transition-colors"
                          >
                            Toggle Plan
                          </button>
                          <button 
                            onClick={() => updateUser(u.id, { isBanned: !u.isBanned })}
                            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${u.isBanned ? 'bg-green-600/20 text-green-500 hover:bg-green-600/30' : 'bg-red-600/20 text-red-500 hover:bg-red-600/30'}`}
                          >
                            {u.isBanned ? 'Unban' : 'Ban'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
