import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FileText, Printer, Users, TrendingUp, Wallet, Download } from 'lucide-react';

const ReportsPage = () => {
    const [reportType, setReportType] = useState('Financial');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        year: new Date().getFullYear().toString()
    });

    const fetchReport = async () => {
        setReportData(null);
        setLoading(true);
        try {
            const endpoint = reportType === 'Financial' ? '/management/reports/financial' : '/management/reports/general';
            const params = reportType === 'Financial' ? filters : {};
            const res = await api.get(endpoint, { params });
            setReportData(res.data);
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const originalTitle = document.title;
        document.title = 'AI-HAFID SKILLS REPORT';
        fetchReport();
        return () => { document.title = originalTitle; };
    }, [reportType, filters.year]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
                <h2 className="text-2xl font-bold text-slate-800">Reports Center</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={handlePrint}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Report
                    </button>
                </div>
            </div>

            {/* Filters Section - Hidden on Print */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end no-print">
                <div className="flex flex-col flex-1 min-w-[200px]">
                    <label className="text-sm font-medium text-slate-700 mb-1">Report Type</label>
                    <select
                        className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                    >
                        <option value="Financial">Financial (Income/Expenses)</option>
                        <option value="General">General Summary (Census)</option>
                        <option value="Teachers">Teachers List</option>
                        <option value="Students">Students List</option>
                        <option value="Subjects">Subjects List</option>
                    </select>
                </div>
                {reportType === 'Financial' && (
                    <div className="flex flex-col flex-1 min-w-[150px]">
                        <label className="text-sm font-medium text-slate-700 mb-1">Select Year</label>
                        <select
                            className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        >
                            {[2023, 2024, 2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                )}
                <button
                    onClick={fetchReport}
                    className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium"
                >
                    Generate
                </button>
            </div>

            {/* Print Header - Visible ONLY on Print */}
            <div className="print-only hidden print:block text-center mb-0 pb-0">
                <div className="flex justify-center mb-0">
                    <img src="/assets/logo.jpg" alt="Logo" className="h-32 w-32 object-contain" />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
            ) : reportData && (
                <div className="report-content print:p-0">
                    {reportType === 'Financial' ? (
                        <div className="space-y-8">
                            {/* Financial Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:shadow-none print:border">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600"><TrendingUp className="h-6 w-6" /></div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Income</p>
                                            <p className="text-2xl font-bold text-slate-800">${reportData?.summary?.totalIncome || 0}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:shadow-none print:border">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-rose-100 p-3 rounded-xl text-rose-600"><Wallet className="h-6 w-6" /></div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</p>
                                            <p className="text-2xl font-bold text-slate-800">${reportData?.summary?.totalExpenses || 0}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:shadow-none print:border">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><FileText className="h-6 w-6" /></div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Balance</p>
                                            <p className={`text-2xl font-bold ${(reportData?.summary?.netBalance || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                ${reportData?.summary?.netBalance || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border">
                                <div className="p-6 border-b border-slate-100 bg-slate-50">
                                    <h3 className="font-bold text-slate-800">Financial Breakdown ({filters.year})</h3>
                                </div>
                                <div className="p-6">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-xs font-bold text-slate-500 uppercase border-b">
                                                <th className="pb-3 text-sm">Category</th>
                                                <th className="pb-3 text-right text-sm">Count</th>
                                                <th className="pb-3 text-right text-sm">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            <tr>
                                                <td className="py-4 text-sm font-medium text-slate-700">Student Tuition Fees</td>
                                                <td className="py-4 text-sm text-right text-slate-500">{reportData?.details?.fees || 0}</td>
                                                <td className="py-4 text-sm text-right text-emerald-600 font-bold">+${reportData?.summary?.totalIncome || 0}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-4 text-sm font-medium text-slate-700">General Operating Expenses</td>
                                                <td className="py-4 text-sm text-right text-slate-500">{reportData?.details?.expenses || 0}</td>
                                                <td className="py-4 text-sm text-right text-rose-600 font-bold">-${reportData?.summary?.totalExpenses || 0}</td>
                                            </tr>
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t-2 border-slate-100 bg-slate-50">
                                                <td className="py-2 px-2 text-base font-bold text-slate-800">Total Net</td>
                                                <td></td>
                                                <td className={`py-4 px-2 text-base text-right font-bold ${(reportData?.summary?.netBalance || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    ${reportData?.summary?.netBalance || 0}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : reportType === 'General' ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center print:shadow-none print:border">
                                    <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                                    <p className="text-2xl font-bold text-slate-800">{reportData?.counts?.students || 0}</p>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Total Students</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center print:shadow-none print:border">
                                    <Users className="h-8 w-8 mx-auto text-indigo-500 mb-2" />
                                    <p className="text-2xl font-bold text-slate-800">{reportData?.counts?.teachers || 0}</p>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Total Teachers</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center print:shadow-none print:border">
                                    <FileText className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                                    <p className="text-2xl font-bold text-slate-800">{reportData?.counts?.classes || 0}</p>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Total Classes</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center print:shadow-none print:border">
                                    <TrendingUp className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                                    <p className="text-2xl font-bold text-slate-800">{reportData?.counts?.subjects || 0}</p>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Total Subjects</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border-none">
                            <div className="p-6 border-b border-slate-100 bg-slate-50 print:bg-transparent print:p-0 print:mb-4">
                                <h3 className="font-bold text-slate-800 print:text-lg">{reportType} List</h3>
                            </div>
                            <div className="p-6 print:p-0">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-xs font-bold text-slate-500 uppercase border-b">
                                            <th className="pb-3 px-2">ID</th>
                                            <th className="pb-3 px-2">Name</th>
                                            {reportType === 'Teachers' && <th className="pb-3 px-2">Subject</th>}
                                            {reportType === 'Teachers' && <th className="pb-3 px-2">Skills</th>}
                                            {reportType === 'Students' && <th className="pb-3 px-2">Class</th>}
                                            {reportType === 'Subjects' && <th className="pb-3 px-2">ClassName</th>}
                                            <th className="pb-3 px-2">Contact</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {reportType === 'Teachers' && reportData?.lists?.teachers?.map(t => (
                                            <tr key={t._id}>
                                                <td className="py-2 px-2 text-xs font-bold text-blue-600">{t.teacherId}</td>
                                                <td className="py-2 px-2 text-sm font-semibold">{t.user?.name}</td>
                                                <td className="py-2 px-2 text-sm">{t.subjectId?.name || t.subjects?.[0]?.name || '-'}</td>
                                                <td className="py-2 px-2 text-xs text-slate-500">{(t.skills || []).map(s => s.name).join(', ') || '-'}</td>
                                                <td className="py-2 px-2 text-sm text-slate-600 font-medium">{t.user?.phone || '-'}</td>
                                            </tr>
                                        ))}
                                        {reportType === 'Students' && reportData?.lists?.students?.map(s => (
                                            <tr key={s._id}>
                                                <td className="py-2 px-2 text-xs font-bold text-indigo-600">{s.enrollmentNo}</td>
                                                <td className="py-2 px-2 text-sm font-semibold">{s.user?.name}</td>
                                                <td className="py-2 px-2 text-sm">{s.classId?.name || '-'}</td>
                                                <td className="py-2 px-2 text-sm text-slate-600 font-medium">{s.user?.phone || '-'}</td>
                                            </tr>
                                        ))}
                                        {reportType === 'Subjects' && reportData?.lists?.subjects?.map(s => (
                                            <tr key={s._id}>
                                                <td className="py-2 px-2 text-xs font-bold text-emerald-600">{s.code}</td>
                                                <td className="py-2 px-2 text-sm font-semibold">{s.name}</td>
                                                <td className="py-2 px-2 text-sm">{s.classId?.name || '-'}</td>
                                                <td className="py-2 px-2 text-sm text-slate-500 italic">Core Subject</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @media print {
                    @page { margin: 0; }
                    header, aside, .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { 
                        background: white !important; 
                        margin: 0 !important; 
                        padding: 5mm !important;
                    }
                    main { padding: 0 !important; margin: 0 !important; }
                    .report-content { margin-top: -20px !important; padding: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default ReportsPage;
