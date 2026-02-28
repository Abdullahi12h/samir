import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Printer, ArrowLeft, GraduationCap, Phone, Info } from 'lucide-react';
import PrintHeader from '../components/PrintHeader';

const GraduatedStudentsReport = () => {
    const { batchId } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch students filtered by batch and status
                const studentRes = await api.get(`/users/students?batchId=${batchId}&status=Graduated`);
                setStudents(studentRes.data);

                // Fetch batch details for the header
                const batchRes = await api.get('/core/batches');
                const currentBatch = batchRes.data.find(b => b._id === batchId);
                setBatch(currentBatch);
            } catch (error) {
                console.error('Error fetching graduated students:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [batchId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto print-root">
            {/* Header - Hidden on Print */}
            <div className="flex justify-between items-center no-print bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                        title="Back"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Graduated Students Report</h2>
                        <p className="text-sm text-slate-500 font-medium">{batch?.name || 'Loading batch...'}</p>
                    </div>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm font-semibold"
                >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                </button>
            </div>

            <PrintHeader title="Graduated Students Report" subtitle={`Batch: ${batch?.name} | Total graduates: ${students.length}`} />

            {/* Main Content */}
            <div className="print-area bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border-none">
                <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between no-print">
                    <div className="flex items-center space-x-2 text-indigo-600">
                        <GraduationCap className="h-5 w-5" />
                        <span className="font-bold">Graduates List</span>
                    </div>
                    <span className="bg-white text-indigo-700 text-xs font-bold px-2 py-1 rounded-full border border-indigo-100">
                        {students.length} Students
                    </span>
                </div>

                <div className="overflow-x-auto p-6 print:p-0">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                                <th className="pb-3 px-2 text-center w-12">#</th>
                                <th className="pb-3 px-2">Enrollment</th>
                                <th className="pb-3 px-2">Student Name</th>
                                <th className="pb-3 px-2">Guardian / DOB</th>
                                <th className="pb-3 px-2">Contact</th>
                                <th className="pb-3 px-2 text-right">Fee</th>
                                <th className="pb-3 px-2 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.length > 0 ? (
                                students.map((s, i) => (
                                    <tr key={s._id} className="bg-white">
                                        <td className="py-3 px-2 text-center">
                                            <span className="text-xs font-bold text-slate-400">{i + 1}</span>
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded">
                                                {s.enrollmentNo}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2">
                                            <div className="font-bold text-slate-900 text-sm">{s.user?.name}</div>
                                        </td>
                                        <td className="py-3 px-2">
                                            <div className="text-[10px] text-slate-500">M: {s.motherName || 'N/A'}</div>
                                            <div className="text-[10px] text-slate-400">{s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString() : ''}</div>
                                        </td>
                                        <td className="py-3 px-2">
                                            <div className="text-xs text-slate-600 font-medium">{s.user?.phone || '-'}</div>
                                        </td>
                                        <td className="py-3 px-2 text-right">
                                            <div className="text-xs font-bold text-slate-700">${s.amount || 0}</div>
                                            <div className="text-[10px] text-slate-400 font-medium italic">{s.registrationFee || ''}</div>
                                        </td>
                                        <td className="py-3 px-2 text-center text-[10px]">
                                            <span className="font-bold text-emerald-600 uppercase">
                                                Certified
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-400 italic">
                                        No graduated students found for this batch.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer - Visible on Print */}
                <div className="hidden print:flex justify-between items-center mt-12 border-t border-slate-100 pt-6 px-6 pb-6">
                    <div className="flex items-center text-slate-400 text-[10px] font-medium italic">
                        <Info className="h-3 w-3 mr-1" />
                        Generated automatically by AI-Hafid Skills Management System
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-800 uppercase">Administrator Signature</p>
                        <div className="mt-8 border-t border-slate-300 w-48 ml-auto"></div>
                    </div>
                </div>
            </div >

            <style>{`
                @media print {
                    @page { 
                        margin: 10mm; 
                        size: auto; 
                    }
                    
                    /* Hide everything except the print-root */
                    header, aside, .no-print, nav, #sidebar {
                        display: none !important;
                    }
                    
                    body, html {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .print-root {
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .print-area { 
                        width: 100% !important;
                        box-shadow: none !important;
                        border: none !important;
                    }

                    * { 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                    }
                }
            `}</style>
        </div >
    );
};

export default GraduatedStudentsReport;
