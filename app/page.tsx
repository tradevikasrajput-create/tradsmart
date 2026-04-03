import Link from 'next/link';
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-500" />
          <span className="text-xl font-bold tracking-tight">QuantTrade Pro</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-blue-400 transition-colors">Login</Link>
          <Link href="/signup" className="text-sm font-medium bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">Sign Up</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-8 border border-blue-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Live F&O Signals
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
          Institutional Grade F&O Intraday Trading
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10">
          Detect top bullish and bearish stocks using Open Interest, Volume Spikes, and AI-driven probability scoring. Trade with confidence.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 active:scale-95">
            Start Trading Now <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all">
            View Dashboard
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <Zap className="w-10 h-10 text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">AI Probability Scoring</h3>
            <p className="text-slate-400">Our models analyze OI changes, volume, and momentum to score trades from 0-100%.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <TrendingUp className="w-10 h-10 text-green-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Smart Position Sizing</h3>
            <p className="text-slate-400">Automatically calculate position sizes based on your capital and risk tolerance.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <Shield className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Pro Auto-Trading</h3>
            <p className="text-slate-400">Upgrade to PRO to enable automated execution via Dhan API integration.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
