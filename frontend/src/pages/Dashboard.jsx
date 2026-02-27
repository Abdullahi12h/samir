import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import {
    Users, UserSquare, Wallet,
    TrendingDown, TrendingUp, BookOpen,
    Building, Layers
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
    const user = useAuthStore((state) => state.user);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/management/dashboard');
                setStats(data);
            } catch (error) {
                console.error('Error fetching dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    const statCards = [
        { title: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'bg-blue-500' },
        { title: 'Total Teachers', value: stats?.totalTeachers || 0, icon: UserSquare, color: 'bg-indigo-500' },
        { title: 'Total Classes', value: stats?.totalClasses || 0, icon: Building, color: 'bg-emerald-500' },
        { title: 'Total Skills', value: stats?.totalSkills || 0, icon: BookOpen, color: 'bg-amber-500' },
        { title: 'Total Income', value: `$${stats?.totalIncome || 0}`, icon: TrendingUp, color: 'bg-green-600' },
        { title: 'Total Salaries', value: `$${stats?.totalSalaries || 0}`, icon: Wallet, color: 'bg-rose-500' },
        { title: 'General Expenses', value: `$${stats?.totalExpenses || 0}`, icon: TrendingDown, color: 'bg-red-500' },
    ];

    const chartData = [
        { name: 'Income', amount: stats?.totalIncome || 0 },
        { name: 'Salaries', amount: stats?.totalSalaries || 0 },
        { name: 'Expenses', amount: stats?.totalExpenses || 0 },
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 text-center sm:text-left">Welcome back, {user?.name}! 👋</h2>
                <p className="text-slate-500 text-center sm:text-left text-sm sm:text-base">Here is what's happening in your organization today.</p>
            </div>

            {user?.role === 'Admin' ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <div key={i} className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex items-center space-x-4 transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer duration-300">
                                    <div className={`${stat.color} p-4 rounded-xl text-white shadow-inner`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-500">{stat.title}</h3>
                                        <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Financial Overview</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-4 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2">
                                    <Users className="h-5 w-5" /> <span>Add Student</span>
                                </button>
                                <button className="p-4 bg-emerald-50 text-emerald-700 rounded-xl font-medium hover:bg-emerald-100 transition-colors flex items-center justify-center space-x-2">
                                    <UserSquare className="h-5 w-5" /> <span>Add Teacher</span>
                                </button>
                                <button className="p-4 bg-amber-50 text-amber-700 rounded-xl font-medium hover:bg-amber-100 transition-colors flex items-center justify-center space-x-2">
                                    <BookOpen className="h-5 w-5" /> <span>Manage Skills</span>
                                </button>
                                <button className="p-4 bg-rose-50 text-rose-700 rounded-xl font-medium hover:bg-rose-100 transition-colors flex items-center justify-center space-x-2">
                                    <Wallet className="h-5 w-5" /> <span>Record Expense</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-2xl shadow p-8 text-center border border-slate-100 mt-6">
                    <BookOpen className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-800">Your Personal Dashboard</h3>
                    <p className="text-slate-500 mt-2">Use the sidebar to navigate to your specific portals (Exams, Results, Attendances).</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
