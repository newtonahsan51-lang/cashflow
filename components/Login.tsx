
import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { GoogleUser } from '../types';

interface LoginProps {
  onLoginSuccess: (user: GoogleUser) => void;
}

type LoginStep = 'WELCOME' | 'PICK_ACCOUNT' | 'MANUAL_AUTH';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<LoginStep>('WELCOME');
  const [loading, setLoading] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<GoogleUser[]>([]);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  useEffect(() => {
    if (step === 'PICK_ACCOUNT') {
      authService.getAvailableAccounts().then(setAvailableAccounts);
    }
  }, [step]);

  const handleInitialClick = () => {
    setStep('PICK_ACCOUNT');
  };

  const handleSelectAccount = async (user: GoogleUser) => {
    setLoading(true);
    try {
      const loggedUser = await authService.loginWithSelected(user);
      onLoginSuccess(loggedUser);
    } catch (error) {
      console.error("Selection failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await authService.loginWithCredentials(credentials.email, credentials.password);
      onLoginSuccess(loggedUser);
    } catch (error) {
      console.error("Manual login failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="relative w-full max-w-md">
        {step === 'WELCOME' && (
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 shadow-2xl text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 gradient-bg rounded-3xl flex items-center justify-center text-white text-4xl mb-8 shadow-xl mx-auto ring-4 ring-white/5">
              <i className="fa-solid fa-vault"></i>
            </div>
            
            <h1 className="text-4xl font-black text-white mb-3 tracking-tight">FinSync Cloud</h1>
            <p className="text-slate-400 mb-10 leading-relaxed font-medium">
              Securely manage multiple accounts. Your data is AES-256 encrypted and synced to Google Drive.
            </p>

            <button
              onClick={handleInitialClick}
              className="w-full py-5 px-6 bg-white hover:bg-slate-50 transition-all rounded-2xl flex items-center justify-center gap-4 group active:scale-95"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-6 h-6" alt="Google" />
              <span className="text-slate-900 font-bold text-lg">Continue with Google</span>
            </button>

            <p className="mt-8 text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <i className="fa-solid fa-lock text-blue-500"></i>
              End-to-End Encrypted
            </p>
          </div>
        )}

        {step === 'PICK_ACCOUNT' && (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
            <div className="text-center mb-8">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-8 h-8 mx-auto mb-4" alt="Google" />
              <h2 className="text-2xl font-bold text-slate-900">Choose an account</h2>
              <p className="text-slate-500 text-sm">to continue to <span className="text-blue-600 font-bold">FinSync</span></p>
            </div>

            <div className="space-y-2 mb-6">
              {availableAccounts.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-slate-400">
                  <i className="fa-solid fa-circle-notch fa-spin text-2xl mb-2"></i>
                  <p className="text-sm">Finding accounts...</p>
                </div>
              ) : (
                availableAccounts.map(account => (
                  <button
                    key={account.email}
                    onClick={() => handleSelectAccount(account)}
                    disabled={loading}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group disabled:opacity-50"
                  >
                    <img src={account.picture} className="w-10 h-10 rounded-full border border-slate-100" alt={account.name} />
                    <div className="text-left flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-slate-800">{account.name}</p>
                      <p className="text-xs text-slate-500 truncate">{account.email}</p>
                    </div>
                    {loading && <i className="fa-solid fa-circle-notch fa-spin text-slate-300"></i>}
                  </button>
                ))
              )}

              <button
                onClick={() => setStep('MANUAL_AUTH')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <i className="fa-solid fa-user-plus text-sm"></i>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Use another account</p>
                </div>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              By continuing, Google will share your name, email address, and profile picture with FinSync.
            </p>
          </div>
        )}

        {step === 'MANUAL_AUTH' && (
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
             <button 
              onClick={() => setStep('PICK_ACCOUNT')}
              className="mb-6 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2 text-sm font-bold"
            >
              <i className="fa-solid fa-chevron-left"></i>
              Back to accounts
            </button>

            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sign in</h2>
              <p className="text-slate-500 font-medium">Use your Google Account</p>
            </div>

            <form onSubmit={handleManualLogin} className="space-y-6">
              <div className="space-y-2">
                <input
                  required
                  type="email"
                  value={credentials.email}
                  onChange={e => setCredentials({...credentials, email: e.target.value})}
                  placeholder="Email or phone"
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-2">
                <input
                  required
                  type="password"
                  value={credentials.password}
                  onChange={e => setCredentials({...credentials, password: e.target.value})}
                  placeholder="Enter your password"
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-between items-center py-2">
                <button type="button" className="text-blue-600 font-bold text-sm hover:underline">Forgot password?</button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 gradient-bg text-white font-bold rounded-2xl shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Next'}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-slate-400">
              Not your computer? Use Guest mode to sign in privately.
              <a href="#" className="text-blue-600 font-bold ml-1 hover:underline">Learn more</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
