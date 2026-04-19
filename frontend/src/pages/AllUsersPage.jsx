import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import {
    Users, Search, Trash2, Shield, GraduationCap,
    UserSquare, RefreshCw, AlertCircle, User as UserIcon,
    Phone, Calendar, Hash
} from 'lucide-react';

const roleConfig = {
    Admin: {
        label: 'Admin',
        icon: Shield,
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
    },
    Teacher: {
        label: 'Teacher',
        icon: UserSquare,
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
    },
    Student: {
        label: 'Student',
        icon: GraduationCap,
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
    },
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const UserCard = ({ user, onDelete }) => {
    const cfg = roleConfig[user.role] || roleConfig.Student;
    const Icon = cfg.icon;

    const initials = (user.name || '?')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group h-full">
            {/* Role color strip */}
            <div className={`h-1 w-full ${cfg.dot}`} />

            <div className="p-5 flex-1 flex flex-col">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Avatar */}
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${cfg.bg} ${cfg.text}`}>
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-black text-sm leading-tight break-words">{user.name}</p>
                            <p className="text-xs text-black font-semibold mt-0.5 break-all">@{user.username}</p>
                        </div>
                    </div>

                    <div className="shrink-0">
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                        </span>
                    </div>
                </div>

                {/* Info rows */}
                <div className="space-y-2 mt-auto">
                    {user.phone && (
                        <div className="flex items-center gap-2 text-xs font-bold text-black">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span>{user.phone}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-xs font-bold text-black">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>Joined: {fmtDate(user.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-black">
                        <Hash className="h-3.5 w-3.5 shrink-0" />
                        <span className="font-mono text-[10px] truncate">{user._id}</span>
                    </div>
                </div>
            </div>

            {/* Always visible Full-width Delete Button at bottom */}
            <div className="p-3 pt-0 mt-auto">
                <button
                    onClick={() => onDelete(user)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-colors border border-red-100 hover:border-red-600 shadow-sm"
                    title="Delete user"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete User
                </button>
            </div>
        </div>
    );
};

export default function AllUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get('/users/all');
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (user) => {
        if (!window.confirm(`Ma hubtaa inaad tirtirto user-ka "${user.name}" (@${user.username})?`)) return;
        try {
            await api.delete(`/users/all/${user._id}`);
            setUsers((prev) => prev.filter((u) => u._id !== user._id));
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed.');
        }
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return users.filter((u) => {
            const matchRole = roleFilter === 'All' || u.role === roleFilter;
            const matchSearch =
                !q ||
                u.name?.toLowerCase().includes(q) ||
                u.username?.toLowerCase().includes(q) ||
                u.phone?.toLowerCase().includes(q);
            return matchRole && matchSearch;
        });
    }, [users, search, roleFilter]);

    // Count by role
    const counts = useMemo(() => ({
        All: users.length,
        Admin: users.filter((u) => u.role === 'Admin').length,
        Teacher: users.filter((u) => u.role === 'Teacher').length,
        Student: users.filter((u) => u.role === 'Student').length,
    }), [users]);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Users className="h-7 w-7 text-indigo-500" />
                        All Users
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                        Dhammaan isticmaalayaasha system-ka
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={load}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <RefreshCw className="h-3.5 w-3.5" /> Refresh
                    </button>
                    <Link
                        to="/register"
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
                    >
                        <Users className="h-3.5 w-3.5" /> Add New User
                    </Link>
                </div>
            </div>

            {/* Stats Strip */}
            {!loading && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['All', 'Admin', 'Teacher', 'Student'].map((r) => {
                        const cfg = roleConfig[r] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
                        const active = roleFilter === r;
                        return (
                            <button
                                key={r}
                                onClick={() => setRoleFilter(r)}
                                className={`rounded-2xl border px-4 py-3 text-center transition-all ${active
                                    ? `${r === 'All' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : `${cfg.bg} ${cfg.border} ${cfg.text}`} shadow-sm scale-[1.02]`
                                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                                    }`}
                            >
                                <div className="text-2xl font-black">{counts[r]}</div>
                                <div className="text-[10px] font-bold uppercase tracking-wide opacity-70 mt-0.5">{r}</div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Magaca, username, ama telefoonka ka raadi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-xs font-bold"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                        <div className="h-8 w-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Loading users...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    {error}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <UserIcon className="h-14 w-14 text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium">
                        {search ? `"${search}" ku jira user ma jiro.` : 'No users found.'}
                    </p>
                    {search && (
                        <button onClick={() => setSearch('')} className="mt-3 text-xs text-indigo-600 font-semibold hover:underline">
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <p className="text-xs text-slate-400 font-medium -mb-2">
                        Waxaa muuqda <span className="font-bold text-slate-600">{filtered.length}</span> user
                        {roleFilter !== 'All' && ` (${roleFilter})`}
                        {search && ` matching "${search}"`}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map((u) => (
                            <UserCard key={u._id} user={u} onDelete={handleDelete} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
