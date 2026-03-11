import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import {
    Users, UserSquare, Wallet,
    TrendingDown, TrendingUp, BookOpen,
    Building, Layers, AlertCircle
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
    const user = useAuthStore((state) => state.user);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('all');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/management/dashboard?period=${period}`);
                setStats(data);
            } catch (error) {
                console.error('Error fetching dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [period]);

    if (loading && !stats) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    const periodLabel = period === 'weekly' ? 'Weekly' : period === 'monthly' ? 'Monthly' : period === 'yearly' ? 'Yearly' : 'Total';

    const statCards = [
        { title: `${periodLabel} Students`, value: stats?.totalStudents || 0, icon: Users, color: 'bg-blue-500' },
        { title: `${periodLabel} Teachers`, value: stats?.totalTeachers || 0, icon: UserSquare, color: 'bg-indigo-500' },
        { title: `${periodLabel} Classes`, value: stats?.totalClasses || 0, icon: Building, color: 'bg-emerald-500' },
        { title: `${periodLabel} Skills`, value: stats?.totalSkills || 0, icon: BookOpen, color: 'bg-amber-500' },
        { title: `${periodLabel} Income`, value: `$${stats?.totalIncome || 0}`, icon: TrendingUp, color: 'bg-green-600' },
        { title: `Lacagta la Filayo (Expected)`, value: `$${stats?.totalExpectedAmount || 0}`, icon: Layers, color: 'bg-indigo-600' },
        { title: `${periodLabel} Exam Fees`, value: `$${stats?.totalExamFees || 0}`, icon: TrendingUp, color: 'bg-emerald-600' },
        { title: `${periodLabel} Salaries`, value: `$${stats?.totalSalaries || 0}`, icon: Wallet, color: 'bg-rose-500' },
        { title: `${periodLabel} Expenses`, value: `$${stats?.totalExpenses || 0}`, icon: TrendingDown, color: 'bg-red-500' },
    ];

    const chartData = [
        { name: 'Income', amount: Number(stats?.totalIncome) || 0 },
        { name: 'Exam Fees', amount: Number(stats?.totalExamFees) || 0 },
        { name: 'Salaries', amount: Number(stats?.totalSalaries) || 0 },
        { name: 'Expenses', amount: Number(stats?.totalExpenses) || 0 },
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 text-center sm:text-left">Welcome back, {user?.name}! 👋</h2>
                    <p className="text-slate-500 text-center sm:text-left text-sm sm:text-base">Here is what's happening in your organization.</p>
                </div>
                {user?.role === 'Admin' && (
                    <div className="flex items-center justify-center sm:justify-end">
                        <select
                            value={period}
                            onChange={e => setPeriod(e.target.value)}
                            className="bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 shadow-sm hover:border-indigo-300 transition-colors cursor-pointer outline-none"
                        >
                            <option value="all">🕒 Dhammaan (All Time)</option>
                            <option value="weekly">📅 Isbuucle (Weekly)</option>
                            <option value="monthly">📆 Bile (Monthly)</option>
                            <option value="yearly">🗓️ Sanadle (Yearly)</option>
                        </select>
                    </div>
                )}
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
