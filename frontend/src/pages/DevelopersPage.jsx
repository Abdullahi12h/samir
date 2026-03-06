import React from 'react';
import { Code2, Terminal, UserCircle, Cpu, ShieldCheck, Zap } from 'lucide-react';

const DevelopersPage = () => {
    const developers = [
        {
            name: 'Engr Abdullahi Abdinasir Hussein',
            role: 'Lead Full-Stack Developer & Lead Architect',
            description: 'Responsible for the core architecture, backend systems, and overall project direction. Passionate about building scalable and secure applications.',
            icon: <Terminal className="h-10 w-10 text-blue-500" />,
            color: 'bg-blue-50 border-blue-200 text-blue-700',
            borderColor: 'group-hover:border-blue-500'
        },
        {
            name: 'Engr Samir Badane',
            role: 'Co-Developer & Software Engineer',
            description: 'Key contributor to the frontend design, user experience, and feature integrations. Focused on delivering beautiful and responsive user interfaces.',
            icon: <Code2 className="h-10 w-10 text-emerald-500" />,
            color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
            borderColor: 'group-hover:border-emerald-500'
        }
    ];

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-orange-100 rounded-full mb-4">
                    <Cpu className="h-8 w-8 sm:h-12 sm:w-12 text-orange-600" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mb-3">
                    Meet the Developers
                </h1>
                <p className="text-sm sm:text-lg text-slate-500 max-w-2xl mx-auto">
                    The creative minds and technical engineers behind the completely customized Al-Hafid Skill System. We built this from the ground up for maximum performance and reliability.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {developers.map((dev, idx) => (
                    <div
                        key={idx}
                        className={`group bg-white rounded-3xl p-8 border-2 border-slate-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${dev.borderColor}`}
                    >
                        <div className={`inline-block p-4 rounded-2xl mb-6 ${dev.color}`}>
                            {dev.icon}
                        </div>

                        <h2 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-black transition-colors">
                            {dev.name}
                        </h2>

                        <div className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg mb-4">
                            {dev.role}
                        </div>

                        <p className="text-slate-500 leading-relaxed font-medium">
                            {dev.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* System Highlights */}
            <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 text-white shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10">
                    <Code2 className="h-64 w-64 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-8 relative z-10 flex items-center">
                    <Zap className="h-6 w-6 text-yellow-400 mr-3" />
                    System Powered By
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative z-10">
                    <div className="flex flex-col">
                        <span className="text-3xl font-black text-white mb-1">MERN</span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Stack Core</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-black text-white mb-1">React+</span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Frontend UI</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-black text-white mb-1">Vite</span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Compiler Builder</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-black text-white mb-1">Node</span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Backend Logic</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DevelopersPage;
