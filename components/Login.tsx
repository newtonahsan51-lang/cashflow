
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

type AuthStep = 'initial' | 'verification' | 'success';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState<AuthStep>('initial');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return setError("সঠিক ইমেইল দিন।");
    if (password.length < 6) return setError("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");
    if (isRegister && !name) return setError("আপনার নাম লিখুন।");

    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        await authService.sendVerificationCode(email, name, password);
        setStep('verification');
      } else {
        const user = await authService.login(email, password);
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await authService.register(name, email, password, otp);
      setStep('success');
      setTimeout(() => onLoginSuccess(user), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="relative w-full max-w-sm">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl transition-all duration-500">
          
          {step === 'initial' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
              <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white text-2xl mb-3 shadow-lg ring-2 ring-white/5">
                  <i className="fa-solid fa-vault"></i>
                </div>
                <h1 className="text-xl font-black text-white tracking-tight">FinSync Vault</h1>
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-0.5 opacity-80">PHP & MySQL Secured</p>
              </div>

              <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
                <button 
                  onClick={() => { setIsRegister(false); setError(null); }}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${!isRegister ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}
                >প্রবেশ</button>
                <button 
                  onClick={() => { setIsRegister(true); setError(null); }}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${isRegister ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}
                >নিবন্ধন</button>
              </div>

              <form onSubmit={handleInitialSubmit} className="space-y-3.5">
                {isRegister && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">নাম</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:ring-1 ring-blue-500/50 text-sm font-bold" />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">ইমেইল</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:ring-1 ring-blue-500/50 text-sm font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">পাসওয়ার্ড</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3.5 pr-10 rounded-xl text-white outline-none focus:ring-1 ring-blue-500/50 text-sm font-bold" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs">
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
                {error && <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[9px] font-black uppercase text-center">{error}</div>}
                <button type="submit" disabled={loading} className="w-full py-4 gradient-bg text-white rounded-xl font-black text-base shadow-xl active:scale-95 disabled:opacity-50 transition-all mt-2">
                  {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : (isRegister ? "OTP পাঠান" : "লগইন করুন")}
                </button>
              </form>
            </div>
          )}

          {step === 'verification' && (
            <div className="animate-in fade-in zoom-in duration-400 text-center py-2">
              <h2 className="text-lg font-black text-white mb-6">ভেরিফিকেশন কোড দিন</h2>
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <input type="text" maxLength={4} required value={otp} onChange={e => setOtp(e.target.value)} placeholder="0 0 0 0" className="w-40 bg-white/5 border border-white/10 p-3.5 rounded-xl text-white text-center text-xl font-black tracking-[0.4em] outline-none" />
                {error && <p className="text-red-400 text-[9px] font-black uppercase">{error}</p>}
                <button type="submit" disabled={loading} className="w-full py-4 gradient-bg text-white rounded-xl font-black text-base shadow-xl active:scale-95 transition-all">
                  {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "ভেরিফাই ও সাইন আপ"}
                </button>
              </form>
            </div>
          )}

          {step === 'success' && (
             <div className="text-center py-10 animate-in zoom-in">
               <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
                 <i className="fa-solid fa-check"></i>
               </div>
               <h2 className="text-xl font-black text-white">স্বাগতম!</h2>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
