import React from 'react';

const PrintHeader = ({ title, subtitle }) => {
    return (
        <div className="hidden print:block mb-8 border-b-2 border-slate-800 pb-6 w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img src="/assets/logo.jpg" alt="Logo" className="h-28 w-28 object-contain mr-6" />
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Al-Hafiid Skills</h1>
                        <p className="text-lg font-bold text-slate-600 mt-1 italic">Hoyga Xirfadaha Casriga ah</p>
                    </div>
                </div>
                <div className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest self-end pb-1">
                    Management System Report
                </div>
            </div>
            {title && (
                <div className="mt-6 text-center">
                    <h3 className="text-2xl font-black text-slate-900 uppercase underline decoration-2 underline-offset-8">{title}</h3>
                    {subtitle && <p className="text-sm font-bold text-slate-500 mt-3 bg-slate-50 inline-block px-4 py-1 rounded-full border border-slate-100">{subtitle}</p>}
                </div>
            )}
        </div>
    );
};

export default PrintHeader;
