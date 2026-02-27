import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (attempts >= 4) {
            setError('La xariir xafiiska');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const result = await login(username, password);
            if (result.success) {
                navigate('/');
            } else {
                const nextAttempts = attempts + 1;
                setAttempts(nextAttempts);
                if (nextAttempts >= 4) {
                    setError('La xariir xafiiska');
                } else {
                    setError(result.message || 'Invalid credentials');
                }
            }
        } catch (err) {
            setError('System error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#2d3a4b] py-6 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full p-0 bg-[#eeeeee] rounded-none shadow-xl flex flex-col items-center">
                {/* Logo Section */}
                <div className="pt-6 sm:pt-4 pb-4 sm:pb-3 w-full flex justify-center px-8">
                    <img
                        src="/assets/logo.jpg"
                        alt="Al-Hafid Logo"
                        className="w-48 sm:w-64 h-auto object-contain mix-blend-multiply"
                    />
                </div>

                <div className="w-full px-6 sm:px-12 pb-8 sm:pb-12">
                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-lg sm:text-xl font-bold text-black tracking-tight">
                            Please sign in to get access.
                        </h2>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className={`p-2 rounded text-xs text-center font-bold border ${attempts >= 4 ? 'bg-red-600 text-white border-red-800' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    disabled={attempts >= 4}
                                    className="appearance-none relative block w-full px-3 py-3 border border-[#ccd0d5] placeholder-[#a6a6a6] text-black bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm disabled:bg-gray-100"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    disabled={attempts >= 4}
                                    className="appearance-none relative block w-full px-3 py-3 border border-[#ccd0d5] placeholder-[#a6a6a6] text-black bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm disabled:bg-gray-100"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" className="text-xs text-[#b0b0b0] hover:text-slate-600 transition-colors">
                                Lost your password?
                            </button>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || attempts >= 4}
                                className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold text-white bg-[#1e88e5] hover:bg-[#1565c0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Logging in...' : attempts >= 4 ? 'Blocked' : 'Log in'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <Link to="/register" className="text-xs font-medium text-emerald-600 hover:text-emerald-500">
                            Don't have an account? Register
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
