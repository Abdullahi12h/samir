import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import { User, Lock, Mail, Phone, MessageCircle, BookOpen, Layers, Users as UsersIcon } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: 'Student',
        phone: '',
        whatsapp: '',
        skillId: '',
        classId: '',
        batchId: '',
        amount: '',
        registrationFee: 'Standard'
    });

    const [skills, setSkills] = useState([]);
    const [classes, setClasses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const register = useAuthStore((state) => state.register);
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCoreData = async () => {
            try {
                const [skillsRes, classesRes, batchesRes] = await Promise.all([
                    api.get('/core/skills'),
                    api.get('/core/classes'),
                    api.get('/core/batches')
                ]);
                setSkills(skillsRes.data);
                setClasses(classesRes.data);
                setBatches(batchesRes.data);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };
        fetchCoreData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const isSelfRegister = !user || user.role !== 'Admin';
            const result = await register(formData, isSelfRegister);
            
            if (result.success) {
                if (isSelfRegister) {
                    navigate('/');
                } else {
                    // If admin created a user, stay on page or go to user list
                    alert(`User '${formData.username}' created successfully!`);
                    navigate('/all-users'); // or wherever appropriate
                }
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#2d3a4b] py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-xl w-full p-0 bg-[#eeeeee] rounded-none shadow-2xl flex flex-col items-center">
                {/* Logo Section */}
                <div className="pt-8 pb-4 w-full flex justify-center px-8 border-b border-gray-200">
                    <img
                        src="/assets/logo.jpg"
                        alt="Al-Hafid Logo"
                        className="w-48 sm:w-64 h-auto object-contain mix-blend-multiply"
                    />
                </div>

                <div className="w-full px-6 sm:px-12 py-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-black tracking-tight uppercase">
                            Abuur Akoon Cusub
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Fadlan buuxi macluumaadka hoose</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-3 rounded-lg text-sm text-center font-bold border bg-red-50 text-red-600 border-red-200 animate-pulse">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase ml-1">Magaca oo dhammaystiran</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="appearance-none relative block w-full px-3 py-3 border border-[#ccd0d5] placeholder-[#a6a6a6] text-black bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                                    placeholder="Tusaale: Maxamed Cali"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Username */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase ml-1">Username</label>
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    className="appearance-none relative block w-full px-3 py-3 border border-[#ccd0d5] placeholder-[#a6a6a6] text-black bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase ml-1">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none relative block w-full px-3 py-3 border border-[#ccd0d5] placeholder-[#a6a6a6] text-black bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase ml-1">Role (Nooca)</label>
                                <select
                                    name="role"
                                    className="appearance-none relative block w-full px-3 py-3 border border-[#ccd0d5] text-black bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="Student">Arday (Student)</option>
                                    {user?.role === 'Admin' && (
                                        <>
                                            <option value="Teacher">Macallin (Teacher)</option>
                                            <option value="Admin">Admin</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Phone */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase ml-1">Telefoonka</label>
                                <input
                                    name="phone"
                                    type="text"
                                    required
                                    className="appearance-none relative block w-full px-3 py-3 border border-[#ccd0d5] placeholder-[#a6a6a6] text-black bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                                    placeholder="61xxxxxxx"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* WhatsApp */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase ml-1">WhatsApp</label>
                                <input
                                    name="whatsapp"
                                    type="text"
                                    className="appearance-none relative block w-full px-3 py-3 border border-[#ccd0d5] placeholder-[#a6a6a6] text-black bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                                    placeholder="61xxxxxxx"
                                    value={formData.whatsapp}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Student Specific Fields */}
                        {formData.role === 'Student' && (
                            <div className="pt-4 border-t border-gray-200 mt-4 space-y-4">
                                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest text-center">Macluumaadka Waxbarashada</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase ml-1">Skill (Maadada)</label>
                                        <select
                                            name="skillId"
                                            required
                                            className="appearance-none relative block w-full px-3 py-3 border border-[#ccd0d5] text-black bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:text-sm"
                                            value={formData.skillId}
                                            onChange={handleChange}
                                        >
                                            <option value="">Dooro Skill</option>
                                            {skills.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase ml-1">Class (Fasalka)</label>
                                        <select
                                            name="classId"
                                            required
                                            className="appearance-none relative block w-full px-3 py-3 border border-[#ccd0d5] text-black bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:text-sm"
                                            value={formData.classId}
                                            onChange={handleChange}
                                        >
                                            <option value="">Dooro Class</option>
                                            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase ml-1">Batch (Dufcada)</label>
                                        <select
                                            name="batchId"
                                            required
                                            className="appearance-none relative block w-full px-3 py-3 border border-[#ccd0d5] text-black bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:text-sm"
                                            value={formData.batchId}
                                            onChange={handleChange}
                                        >
                                            <option value="">Dooro Batch</option>
                                            {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase ml-1">Lacagta Is qoraalka ($)</label>
                                        <input
                                            name="amount"
                                            type="number"
                                            required
                                            className="appearance-none relative block w-full px-3 py-3 border border-[#ccd0d5] placeholder-[#a6a6a6] text-black bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:text-sm"
                                            placeholder="Tusaale: 10"
                                            value={formData.amount}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent text-lg font-black text-white bg-[#1e88e5] hover:bg-[#1565c0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transform transition-all active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed uppercase tracking-wider"
                            >
                                {loading ? 'Akoonka ayaa la samaynayaa...' : 'Isqor Hadda'}
                            </button>
                        </div>
                        
                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-600 font-medium">
                                Horay ma u lahayd Account?{' '}
                                <Link to="/login" className="text-[#1e88e5] font-black hover:underline ml-1">
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
