import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Register = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Admin'); // Defaulting to Admin for this system setup
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const register = useAuthStore((state) => state.register);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const result = await register({ name, username, password, role });
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message || 'Registration failed');
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
                            Abuur akoon cusub
                        </h2>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-2 rounded text-xs text-center font-bold border bg-red-50 text-red-600 border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    className="appearance-none relative block w-full px-3 py-3 border border-[#ccd0d5] placeholder-[#a6a6a6] text-black bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    placeholder="Magaca oo dhammaystiran"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    className="appearance-none relative block w-full px-3 py-3 border border-[#ccd0d5] placeholder-[#a6a6a6] text-black bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    className="appearance-none relative block w-full px-3 py-3 border border-[#ccd0d5] placeholder-[#a6a6a6] text-black bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <select
                                    className="appearance-none relative block w-full px-3 py-3 border border-[#ccd0d5] text-black bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Teacher">Macallin</option>
                                    <option value="Student">Arday</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold text-white bg-[#1e88e5] hover:bg-[#1565c0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Akoonka ayaa la samaynayaa...' : 'Isqor'}
                            </button>
                        </div>
                        
                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-600">
                                Horay ma u lahayd Account?{' '}
                                <Link to="/login" className="text-[#1e88e5] font-bold hover:underline">
                                    Login halkaan
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
