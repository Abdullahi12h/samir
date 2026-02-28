import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import useAuthStore from '../store/useAuthStore';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden relative">
            <div className="no-print">
                <Sidebar role={user.role} isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10 no-print">
                    <div className="mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="mr-4 lg:hidden text-slate-600 hover:text-slate-900 focus:outline-none"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 truncate max-w-[150px] sm:max-w-none">
                                Al-Hafid Skill System
                            </h1>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="hidden sm:flex items-center space-x-2 text-slate-600">
                                <UserIcon className="h-5 w-5" />
                                <span className="font-medium text-xs sm:text-sm">{user.name} ({user.role})</span>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                            >
                                <LogOut className="h-4 w-4 mr-1" />
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                    <Outlet />
                </main>
                <footer className="bg-white border-t border-slate-100 py-1.5 px-6 text-center no-print">
                    <p className="text-[9px] text-slate-400 tracking-wide">
                        Developed by <span className="text-orange-500 font-bold">Abdullahi Abdinasir Hussein</span>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default Layout;
