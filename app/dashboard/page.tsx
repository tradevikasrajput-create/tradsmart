'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, LogOut, ShieldAlert, Activity, DollarSign, Crown, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [signals, setSignals] = useState<{bullish: any[], bearish: any[]}>({ bullish: [], bearish: [] });
  const [pnl, setPnl] = useState({ totalPnL: 0, openPositions: 0, closedPositions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchData(token);

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => fetchData(token), 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (token: string) => {
    try {
      const [sigRes, pnlRes] = await Promise.all([
        fetch('/api/signals', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/pnl', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!sigRes.ok) {
        if (sigRes.status === 503) {
          setError('System halted by admin kill switch.');
          setSignals({ bullish: [], bearish: [] });
          return;
        }
        throw new Error('Failed to fetch signals');
      }

      const sigData = await sigRes.json();
      setSignals(sigData.signals);
      setError('');

      if (pnlRes.ok) {
        const pnlData = await pnlRes.json();
        setPnl(pnlData);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const token = localStorage.getItem('token');
      // Mock Razorpay flow
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const orderData = await orderRes.json();

      // Simulate successful payment verification
      const verifyRes = await fetch('/api/payments/verify-payment', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          razorpay_payment_id: 'mock_pay_id',
          razorpay_order_id: orderData.id,
          razorpay_signature: 'mock_sig'
        })
      });

      if (verifyRes.ok) {
        const updatedUser = { ...user, plan: 'pro' };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Successfully upgraded to PRO!');
      }
    } catch (err) {
      alert('Payment failed');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white"><RefreshCw className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-500" />
          <span className="text-xl font-bold tracking-tight">QuantTrade Pro</span>
          {user?.plan === 'pro' && <span className="ml-2 bg-yellow-500/20 text-yellow-500 text-xs px-2 py-0.5 rounded flex items-center gap-1 font-bold"><Crown className="w-3 h-3"/> PRO</span>}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-400 hidden sm:block">{user?.email}</div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3">
            <ShieldAlert className="w-6 h-6" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* PnL Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2"><DollarSign className="w-4 h-4"/> Total PnL</div>
            <div className={`text-3xl font-bold ${pnl.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ₹{pnl.totalPnL.toFixed(2)}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2"><Activity className="w-4 h-4"/> Open Positions</div>
            <div className="text-3xl font-bold text-white">{pnl.openPositions}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-slate-400 text-sm font-medium mb-1">Account Plan</div>
              <div className="text-xl font-bold capitalize">{user?.plan}</div>
            </div>
            {user?.plan === 'free' && (
              <button onClick={handleUpgrade} disabled={upgrading} className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50">
                {upgrading ? 'Processing...' : 'Upgrade to PRO'}
              </button>
            )}
          </div>
        </div>

        {/* Signals Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bullish */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-green-500">
              <TrendingUp className="w-6 h-6" /> Top Bullish Signals
            </h2>
            {signals.bullish.map((sig, i) => (
              <SignalCard key={i} signal={sig} isPro={user?.plan === 'pro'} />
            ))}
            {signals.bullish.length === 0 && !error && <div className="text-slate-500 text-center py-8 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">No bullish signals detected</div>}
          </div>

          {/* Bearish */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-red-500">
              <TrendingDown className="w-6 h-6" /> Top Bearish Signals
            </h2>
            {signals.bearish.map((sig, i) => (
              <SignalCard key={i} signal={sig} isPro={user?.plan === 'pro'} />
            ))}
            {signals.bearish.length === 0 && !error && <div className="text-slate-500 text-center py-8 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">No bearish signals detected</div>}
          </div>
        </div>
      </main>
    </div>
  );
}

function SignalCard({ signal, isPro }: { signal: any, isPro: boolean }) {
  const isBull = signal.type === 'BULLISH';
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-1 h-full ${isBull ? 'bg-green-500' : 'bg-red-500'}`}></div>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{signal.symbol}</h3>
          <span className="text-sm text-slate-400">{signal.buildUp}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">₹{signal.entry}</div>
          <div className={`text-sm font-medium ${signal.probability > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
            {signal.probability}% AI Score
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 bg-slate-950 rounded-xl p-3 border border-slate-800/50">
        <div>
          <div className="text-xs text-slate-500 mb-1">Target</div>
          <div className="font-semibold text-green-500">₹{signal.target}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Stop Loss</div>
          <div className="font-semibold text-red-500">₹{signal.stopLoss}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Rec. Size</div>
          <div className="font-semibold">{signal.positionSize} Qty</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-xs text-slate-400">
          <span title="OI Change">OI: +{signal.metrics.oiChangePercent}%</span>
          <span title="Volume Spike">Vol: {signal.metrics.volumeSpikeX}x</span>
        </div>
        <button 
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            isPro 
              ? (isBull ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white')
              : 'bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
          disabled={!isPro}
          title={!isPro ? 'Upgrade to PRO to auto-trade' : 'Execute Trade via Dhan'}
        >
          {isPro ? 'Auto Trade' : 'PRO Feature'}
        </button>
      </div>
    </div>
  );
}
