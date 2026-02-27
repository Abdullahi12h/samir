import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, Layers, Users, Building,
    GraduationCap, ClipboardList, Wallet, FileText, CheckSquare,
    UserSquare, Database, X, MessageCircle
} from 'lucide-react';

const Sidebar = ({ role, isOpen, toggle }) => {
    const adminSections = [
        {
            title: 'General',
            links: [
                { name: 'Dashboard', path: '/', icon: LayoutDashboard },
                { name: 'Orders & Chat', path: '/orders', icon: MessageCircle },
                { name: 'Reports', path: '/reports', icon: FileText },
                { name: 'Backup & Restore', path: '/backup', icon: Database },
            ]
        },
        {
            title: 'Academic Setup',
            links: [
                { name: 'Skills', path: '/skills', icon: BookOpen },
                { name: 'Classes', path: '/classes', icon: Building },
                { name: 'Batches', path: '/batches', icon: Users },
                { name: 'Subjects', path: '/subjects', icon: BookOpen },
            ]
        },
        {
            title: 'Users Management',
            links: [
                { name: 'Teachers', path: '/teachers', icon: UserSquare },
                { name: 'Students', path: '/students', icon: GraduationCap },
                { name: 'Graduates', path: '/graduates', icon: GraduationCap },
            ]
        },
        {
            title: 'Academic Records',
            links: [
                { name: 'Daily Attendance', path: '/attendance-entry', icon: CheckSquare },
                { name: 'Attendance History', path: '/attendances', icon: FileText },
                { name: 'Exam Management', path: '/exams', icon: ClipboardList },
                { name: 'Mark Entry', path: '/mark-entry', icon: ClipboardList },
                { name: 'Results', path: '/results', icon: ClipboardList },
            ]
        },
        {
            title: 'Finance',
            links: [
                { name: 'Expenses', path: '/expenses', icon: Wallet },
                { name: 'Fee Management', path: '/fees', icon: Wallet },
                { name: 'Student Payments', path: '/student-payments', icon: Wallet },
                { name: 'Salaries', path: '/salaries', icon: Wallet },
            ]
        }
    ];

    const teacherLinks = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'My Subjects', path: '/subjects', icon: BookOpen },
        { name: 'Daily Attendance', path: '/attendance-entry', icon: CheckSquare },
        { name: 'Attendance History', path: '/attendances', icon: FileText },
        { name: 'Mark Entry', path: '/mark-entry', icon: ClipboardList },
        { name: 'Results', path: '/results', icon: ClipboardList },
    ];

    const studentLinks = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Orders & Chat', path: '/orders', icon: MessageCircle },
        { name: 'Profile', path: '/profile', icon: UserSquare },
        { name: 'My Attendance', path: '/my-attendance', icon: CheckSquare },
        { name: 'My Fees', path: '/fees', icon: Wallet },
        { name: 'My Results', path: '/results', icon: ClipboardList },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
                    onClick={toggle}
                />
            )}

            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0d47a1] text-white flex flex-col h-full shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="py-3 px-4 bg-[#0a2f6a] border-b border-blue-700/30 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded-lg object-contain bg-white p-0.5" />
                        <span className="text-white font-bold text-sm tracking-wide uppercase">
                            Al-Hafid Skills
                        </span>
                    </div>
                    <button onClick={toggle} className="lg:hidden text-white/70 hover:text-white ml-2">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto py-4 space-y-4">
                    {role === 'Admin' ? (
                        adminSections.map((section) => (
                            <div key={section.title} className="space-y-1">
                                <h3 className="px-6 text-[10px] font-bold text-blue-200/50 uppercase tracking-widest">
                                    {section.title}
                                </h3>
                                {section.links.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                        <NavLink
                                            key={link.name}
                                            to={link.path}
                                            onClick={toggle}
                                            className={({ isActive }) =>
                                                `flex items-center px-6 py-2 text-sm font-medium transition-colors ${isActive
                                                    ? 'bg-emerald-500 text-white border-l-4 border-white'
                                                    : 'hover:bg-blue-700/50 hover:text-white border-l-4 border-transparent text-blue-50'
                                                }`
                                            }
                                        >
                                            <Icon className="mr-3 h-4 w-4" />
                                            {link.name}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        ))
                    ) : (
                        (role === 'Teacher' ? teacherLinks : studentLinks).map((link) => {
                            const Icon = link.icon;
                            return (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    onClick={toggle}
                                    className={({ isActive }) =>
                                        `flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive
                                            ? 'bg-emerald-500 text-white border-l-4 border-white'
                                            : 'hover:bg-blue-700/50 hover:text-white border-l-4 border-transparent text-blue-50'
                                        }`
                                    }
                                >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {link.name}
                                </NavLink>
                            );
                        })
                    )}
                </nav>
                <div className="p-4 border-t border-blue-700/30 bg-[#0a2f6a] mt-auto">
                    <p className="text-[8px] font-bold text-blue-200/50 tracking-widest text-center uppercase">
                        Developed by <br />
                        <span className="text-white text-[9px]">Engr Abdullahi Abdinasir Hussein</span>
                    </p>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
