import { useState, useEffect } from 'react';
import { CreditCard, History, Search, Printer } from 'lucide-react';
import api from '../utils/api';

const StudentPaymentsPage = () => {
    const [students, setStudents] = useState([]);
    const [payments, setPayments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        Promise.all([
            api.get('/core/classes').then(res => setClasses(res.data)),
            api.get('/users/students?status=Active').then(res => setStudents(res.data))
        ]).catch(console.error);
    }, []);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const query = new URLSearchParams({
                    ...(selectedClassId && { classId: selectedClassId }),
                    ...(selectedMonth && { month: selectedMonth }),
                    ...(selectedYear && { year: selectedYear }),
                }).toString();
                const res = await api.get(`/management/student-payments?${query}`);
                setPayments(res.data);
            } catch (error) {
                console.error('Error fetching payments:', error);
            }
        };
        fetchPayments();
    }, [selectedClassId, selectedMonth, selectedYear]);

    const selectedStudent = students.find(s => s._id === selectedStudentId);
    // Student total fee is stored in 'amount', total paid is 'totalPaid'
    const totalFee = selectedStudent?.amount || 0;
    const totalPaid = selectedStudent?.totalPaid || 0;
    const remainingBalance = totalFee - totalPaid;


    const handlePayment = async (e) => {
        e.preventDefault();
        if (!selectedStudentId || !amount || amount <= 0) return alert('Enter a valid amount and select a student.');
        if (Number(amount) > remainingBalance) return alert('Payment exceeds remaining balance.');

        setLoading(true);
        try {
            await api.post('/management/student-payments', {
                studentId: selectedStudentId,
                amount: Number(amount)
            });
            // Refresh data
            const [studentsRes, paymentsRes] = await Promise.all([
                api.get('/users/students?status=Active'),
                api.get('/management/student-payments')
            ]);
            setStudents(studentsRes.data);
            setPayments(paymentsRes.data);
            setAmount('');
            alert('Payment recorded successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error processing payment');
        } finally {
            setLoading(false);
        }
    };

    const handlePrintReceipt = (payment) => {
        const printWindow = window.open('', '_blank');
        const content = `
            <html>
                <head>
                    <title>Receipt - ${payment.receiptNumber}</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #334155; }
                        .receipt-box { border: 2px solid #e2e8f0; padding: 40px; max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
                        .header { text-align: center; border-bottom: 2px solid #3b82f6; margin-bottom: 30px; padding-bottom: 20px; }
                        .header h1 { color: #1e293b; margin: 0; font-size: 28px; letter-spacing: -0.025em; }
                        .header p { color: #64748b; margin: 5px 0 0 0; font-weight: 500; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                        .info-item { display: flex; flex-direction: column; }
                        .label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }
                        .value { font-size: 15px; font-weight: 600; color: #1e293b; }
                        .amount-box { background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; }
                        .amount-label { font-size: 14px; font-weight: 600; color: #3b82f6; margin-bottom: 5px; }
                        .amount-value { font-size: 32px; font-weight: 800; color: #1d4ed8; }
                        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; }
                        .footer p { font-size: 12px; color: #94a3b8; margin: 0; }
                        .signature-line { margin-top: 50px; border-top: 1px solid #cbd5e1; width: 200px; margin-left: auto; margin-right: auto; padding-top: 8px; font-size: 12px; font-weight: 600; color: #64748b; }
                        @media print {
                            body { background: white; padding: 0; }
                            .receipt-box { box-shadow: none; border: 2px solid #000; margin: 0 auto; }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-box">
                        <div class="header">
                            <img src="/assets/logo.jpg" style="height: 80px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;" />
                            <h1>AL-HAFID SKILLS</h1>
                            <p>Official Payment Receipt</p>
                        </div>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">Receipt Number</span>
                                <span class="value">${payment.receiptNumber}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Date Issued</span>
                                <span class="value">${new Date(payment.paymentDate).toLocaleDateString()}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Student Name</span>
                                <span class="value">${payment.studentId?.user?.name || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Enrollment No</span>
                                <span class="value">${payment.studentId?.enrollmentNo || 'N/A'}</span>
                            </div>
                            <div class="info-item" style="grid-column: span 2;">
                                <span class="label">Course/Class</span>
                                <span class="value">${payment.studentId?.classId?.name || 'N/A'} (${payment.studentId?.skillId?.name || 'N/A'})</span>
                            </div>
                        </div>
                        <div class="amount-box">
                            <div class="amount-label">TOTAL AMOUNT PAID</div>
                            <div class="amount-value">$${payment.amount}</div>
                        </div>
                        <div class="footer">
                            <p>Thank you for choosing Al-Hafid Skills!</p>
                            <div class="signature-line">Authorized Signatory</div>
                        </div>
                    </div>
                    <script>
                        window.onload = function() { 
                            window.print(); 
                            setTimeout(function() { window.close(); }, 500);
                        }
                    </script>
                </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
    };

    const studentPaymentsHistory = payments.filter(p => p.studentId?._id === selectedStudentId);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    <CreditCard className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Student Payments</h1>
                    <p className="text-sm text-slate-500">Record part-payments and track balances</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">

                    {/* Payment Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <h2 className="font-bold text-slate-700">Record Payment</h2>
                        </div>
                        <form onSubmit={handlePayment} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Class</label>
                                <select
                                    className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    value={selectedClassId}
                                    onChange={(e) => {
                                        setSelectedClassId(e.target.value);
                                        setSelectedStudentId('');
                                        setAmount('');
                                    }}
                                >
                                    <option value="">-- Choose a Class --</option>
                                    {classes.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Student</label>
                                <select
                                    className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:opacity-50"
                                    value={selectedStudentId}
                                    onChange={(e) => { setSelectedStudentId(e.target.value); setAmount(''); }}
                                    disabled={!selectedClassId}
                                >
                                    <option value="">-- Choose a Student --</option>
                                    {students.filter(s => selectedClassId ? (s.classId?._id === selectedClassId || s.classId === selectedClassId) : true).map(s => (
                                        <option key={s._id} value={s._id}>{s.user?.name} ({s.enrollmentNo})</option>
                                    ))}
                                </select>
                            </div>

                            {selectedStudent && (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Total Course Fee:</span>
                                        <span className="font-semibold text-slate-700">${totalFee}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Total Paid:</span>
                                        <span className="font-semibold text-green-600">${totalPaid}</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
                                        <span className="text-slate-700 font-bold">Remaining Balance:</span>
                                        <span className="font-bold text-red-500">${remainingBalance}</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Amount ($)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={remainingBalance > 0 ? remainingBalance : 0}
                                    disabled={!selectedStudent || remainingBalance <= 0}
                                    className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:opacity-50"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!selectedStudent || loading || remainingBalance <= 0 || !amount}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Processing...' : 'Submit Payment'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* History Table */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-slate-700 font-bold">
                            <History className="w-5 h-5 text-slate-400" />
                            <h2>
                                Payment History
                                {selectedStudent ? ` for ${selectedStudent.user?.name}` :
                                    selectedClassId ? ` for ${classes.find(c => c._id === selectedClassId)?.name || ''}` :
                                        ' (Filtered List)'}
                            </h2>
                        </div>
                        <div className="flex items-center space-x-3 no-print">
                            <select
                                className="p-1.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>
                            <select
                                className="p-1.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <button
                                onClick={() => window.print()}
                                className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors flex items-center shadow-sm"
                            >
                                <Printer className="w-3.5 h-3.5 mr-1.5" />
                                Print Report
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-0">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Receipt</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                                    {!selectedStudent && <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Class</th>}
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider no-print">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {(() => {
                                    // Payments are now server-filtered, so we just display 'payments'
                                    let filtered = payments;

                                    // If a specific student is selected, we might still want to filter locally 
                                    // if the backend returned more (though with the current useEffect it's already filtered)
                                    if (selectedStudentId) {
                                        filtered = payments.filter(p => p.studentId?._id === selectedStudentId || p.studentId === selectedStudentId);
                                    }

                                    if (filtered.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                                                    No payment history found.
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return filtered.slice().reverse().map(payment => (
                                        <tr key={payment._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {new Date(payment.paymentDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">
                                                {payment.receiptNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">
                                                {payment.studentId?.user?.name || 'Unknown'}
                                            </td>
                                            {!selectedStudent && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 uppercase">
                                                        {payment.studentId?.classId?.name || '-'}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 text-right">
                                                +${payment.amount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right no-print">
                                                <button
                                                    onClick={() => handlePrintReceipt(payment)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                    title="Print Receipt"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentPaymentsPage;
