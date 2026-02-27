import { useState, useEffect } from 'react';
import { CreditCard, History, Search } from 'lucide-react';
import api from '../utils/api';

const StudentPaymentsPage = () => {
    const [students, setStudents] = useState([]);
    const [payments, setPayments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        Promise.all([
            api.get('/core/classes').then(res => setClasses(res.data)),
            api.get('/users/students?status=Active').then(res => setStudents(res.data)),
            api.get('/management/student-payments').then(res => setPayments(res.data))
        ]).catch(console.error);
    }, []);

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
                                        ' (All)'}
                            </h2>
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
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {(() => {
                                    let filtered = payments;
                                    if (selectedStudentId) {
                                        filtered = payments.filter(p => p.studentId?._id === selectedStudentId || p.studentId === selectedStudentId);
                                    } else if (selectedClassId) {
                                        filtered = payments.filter(p => p.studentId?.classId?._id === selectedClassId || p.studentId?.classId === selectedClassId);
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
