import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import { User, Phone, MessageSquare, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';

const ProfilePage = () => {
    const user = useAuthStore((state) => state.user);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        phone: '',
        whatsapp: '',
    });
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                username: user.username || '',
                phone: user.phone || '',
                whatsapp: user.whatsapp || '',
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { data } = await api.put('/auth/profile', formData);
            // Update storage if needed, but usually authStore holds the main user object
            // For this app, authStore might need a refresh if name/username changed
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.put('/auth/profile', { ...formData, password: passwordData.newPassword });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Password change failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg flex items-center space-x-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="bg-white p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center space-x-2 mb-6 border-b pb-4">
                        <User className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-slate-800">Personal Information</h3>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-none outline-none text-sm"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
                            <input
                                type="text"
                                disabled
                                className="w-full px-4 py-2 border border-slate-100 bg-slate-50 text-slate-500 cursor-not-allowed rounded-none text-sm"
                                value={formData.username}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Username cannot be changed.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-none outline-none text-sm"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">WhatsApp</label>
                            <div className="relative">
                                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-none outline-none text-sm"
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors disabled:bg-slate-400"
                        >
                            <Save className="h-4 w-4" />
                            <span>{loading ? 'Saving...' : 'Update Profile'}</span>
                        </button>
                    </form>
                </div>

                {/* Password Change */}
                <div className="bg-white p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center space-x-2 mb-6 border-b pb-4">
                        <Lock className="h-5 w-5 text-orange-600" />
                        <h3 className="text-lg font-semibold text-slate-800">Security</h3>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="password"
                                    placeholder="Minimum 6 characters"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:ring-2 focus:ring-orange-500 rounded-none outline-none text-sm"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="password"
                                    placeholder="Verify new password"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:ring-2 focus:ring-orange-500 rounded-none outline-none text-sm"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !passwordData.newPassword}
                            className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold transition-colors disabled:bg-slate-400"
                        >
                            <Lock className="h-4 w-4" />
                            <span>{loading ? 'Processing...' : 'Change Password'}</span>
                        </button>
                    </form>

                    <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400">
                        <p className="text-xs text-blue-700 leading-relaxed">
                            <strong>Note:</strong> Password change will take effect immediately. Ensure you use a strong password to keep your account secure.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
