import { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/api';

const SalariesPage = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [filter, setFilter] = useState('All'); // All, Paid, Unpaid
    const [payingId, setPayingId] = useState(null);

    const fetchSalaries = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/management/salaries?period=${period}`);
            setTeachers(res.data);
        } catch (error) {
            console.error('Error fetching salaries', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalaries();
    }, [period]);

    const handlePay = async (teacher) => {
        setPayingId(teacher._id);
        try {
            await api.post('/management/salaries', {
                teacherId: teacher._id,
                amount: teacher.salary || 0,
                period,
                paymentDate: new Date().toISOString()
            });
            await fetchSalaries();
        } catch (error) {
            alert(error.response?.data?.message || 'Error processing payment');
        } finally {
            setPayingId(null);
        }
    };

    const filteredTeachers = teachers.filter(t => {
        if (filter === 'Paid') return t.isPaid;
        if (filter === 'Unpaid') return !t.isPaid;
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-lg text-green-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Teacher Salaries</h1>
                        <p className="text-sm text-slate-500">Manage monthly salary payments</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Period (Month)</label>
                        <input
                            type="month"
                            className="p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium text-slate-700"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status Filter</label>
                        <select
                            className="p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium text-slate-700"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="All">All Teachers</option>
                            <option value="Paid">Paid Only</option>
                            <option value="Unpaid">Unpaid Only</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Salary</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Date</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading salaries...</td></tr>
                            ) : filteredTeachers.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No teachers found for this criteria.</td></tr>
                            ) : (
                                filteredTeachers.map((teacher) => (
                                    <tr key={teacher._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {teacher.photo ? (
                                                    <img src={`http://localhost:5001${teacher.photo}`} alt="" className="w-8 h-8 rounded-full border border-slate-200 mr-3 object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-3">
                                                        <span className="text-slate-500 font-bold text-xs">{(teacher.user?.name || '?').charAt(0)}</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-slate-800">{teacher.user?.name || 'Unknown Teacher'}</div>
                                                    <div className="text-xs text-slate-500">{teacher.teacherId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono font-medium text-slate-700">${teacher.salary || 0}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {teacher.isPaid ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                                    <XCircle className="w-3 h-3 mr-1" /> Not Paid
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {teacher.paymentDetails?.paymentDate ? new Date(teacher.paymentDetails.paymentDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            {!teacher.isPaid && (
                                                <button
                                                    onClick={() => handlePay(teacher)}
                                                    disabled={payingId === teacher._id}
                                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-70 shadow-sm"
                                                >
                                                    {payingId === teacher._id ? 'Processing...' : 'Pay Now'}
                                                </button>
                                            )}
                                            {teacher.isPaid && (
                                                <span className="text-slate-400 text-sm font-medium">Completed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalariesPage;
