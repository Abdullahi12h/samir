import React from 'react';

const PrintHeader = ({ title, subtitle }) => {
    return (
        <div className="hidden print:block border-b-2 border-slate-900 pt-0 mt-0 pb-1 w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img src="/assets/logo.jpg" alt="Logo" className="h-52 w-52 object-contain mr-6" />
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Al-Hafiid Skills</h1>
                        <p className="text-xl font-bold text-slate-700 mt-2 italic">Hoyga Xirfadaha Casriga ah</p>
                    </div>
                </div>
                <div className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest self-end pb-1">
                    Management System Report
                </div>
            </div>
            {title && (
                <div className="mt-[-30px] mb-6 text-center">
                    <h3 className="text-3xl font-black text-slate-950 uppercase underline decoration-4 underline-offset-8 m-0">{title}</h3>
                    {subtitle && <p className="text-sm font-bold text-slate-700 mt-4 bg-slate-50 inline-block px-4 py-1 rounded-full border border-slate-200">{subtitle}</p>}
                </div>
            )}
        </div>
    );
};

export default PrintHeader;
