import React, { useState } from 'react';
import { Lock, Mail, Loader2, Rocket, ShieldAlert } from 'lucide-react';
import { API_BASE_URL } from '../../config';

interface AdminLoginProps {
    onLoginSuccess: (token: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.token) {
                    localStorage.setItem('admin_token', data.token);
                    onLoginSuccess(data.token);
                } else {
                    setError('Received invalid response from server.');
                }
            } else {
                setError(data.message || 'Authentication failed. Please check your credentials.');
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] overflow-hidden relative font-sans selection:bg-indigo-100 italic-none">
            {/* Background decorative elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full"></div>
            </div>
            
            <div className="relative w-full max-w-lg p-6 sm:p-10 z-10 animate-in fade-in zoom-in-95 duration-1000">
                {/* Logo or Brand */}
                <div className="flex flex-col items-center mb-12 space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-tr from-slate-900 to-slate-800 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-slate-900/20 transform hover:rotate-6 transition-transform duration-500">
                        <Rocket className="text-white w-10 h-10" />
                    </div>
                    <div className="text-center">
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[3rem] p-8 sm:p-12 shadow-2xl shadow-slate-200/60 transition-all">
                    <form onSubmit={handleLogin} className="space-y-8">
                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake">
                                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-900 ml-1 uppercase tracking-widest">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 pl-14 pr-6 py-3 rounded-[1.5rem] focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none transition-all placeholder:text-slate-300 font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-black text-slate-900 uppercase tracking-widest">Password</label>
                                <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 pl-14 pr-6 py-3 rounded-[1.5rem] focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none transition-all placeholder:text-slate-300 font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3 mt-4 text-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    Login
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-slate-400 text-sm font-medium">
                        &copy; {new Date().getFullYear()} Cortex Systems. Unauthorized access is monitored.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
