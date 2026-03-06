import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CrudPage from '../components/CrudPage';
import { Lock, Unlock, Edit3, Printer, AlertCircle, CheckCircle2, Wallet as WalletIcon, X } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';

const EMPTY_ARRAY = [];

const monthsList = [
    { label: 'January', value: '1' }, { label: 'February', value: '2' }, { label: 'March', value: '3' },
    { label: 'April', value: '4' }, { label: 'May', value: '5' }, { label: 'June', value: '6' },
    { label: 'July', value: '7' }, { label: 'August', value: '8' }, { label: 'September', value: '9' },
    { label: 'October', value: '10' }, { label: 'November', value: '11' }, { label: 'December', value: '12' }
];

// --- Expenses Page Config ---
const expensesColumns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Amount', render: (item) => `$${item.amount}` },
    { header: 'Date', render: (item) => new Date(item.date).toLocaleDateString() }
];

const expensesFields = [
    { name: 'title', label: 'Title', required: true },
    { name: 'amount', label: 'Amount', type: 'number', required: true },
    { name: 'date', label: 'Date', type: 'date' }
];

export const ExpensesPage = () => (
    <CrudPage
        title="Expenses"
        endpoint="/management/expenses"
        roleAccess={['Admin']}
        columns={expensesColumns}
        formFields={expensesFields}
    />
);

// --- Fees Page Config ---
const feesColumns = [
    {
        header: 'Magaca & ID-ga',
        render: (item) => (
            <div>
                <div className="font-bold text-slate-800">
                    {item.studentId?.user?.name || 'Unknown'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">
                    ID: {item.studentId?.enrollmentNo || '-'}
                </div>
            </div>
        )
    },
    {
        header: 'Fasalka (Class)',
        render: (item) => <span className="text-xs font-bold text-slate-600">{item.studentId?.classId?.name || '-'}</span>
    },
    {
        header: 'Xisaabta bixinta',
        render: (item) => {
            const total = item.studentId?.amount || 0;
            const paid = item.studentId?.totalPaid || 0;
            const balance = total - paid;
            return (
                <div className="flex flex-col">
                    <span className="text-[11px] text-emerald-600 font-bold tracking-tighter">
                        Wuxuu Bixiyay: ${paid}
                    </span>
                    <span className={`font-black text-[11px] ${balance > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                        Wuxuu Harsan yahay: ${balance}
                    </span>
                </div>
            );
        }
    },
    {
        header: 'Xaaladda',
        render: (item) => (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {item.status || 'Pending'}
            </span>
        )
    },
    {
        header: 'Bisha / Sanadka',
        render: (item) => {
            const m = monthsList.find(ml => ml.value === String(item.month))?.label || '';
            return <span className="text-[11px] font-bold text-slate-500 uppercase">{m} {item.year}</span>;
        }
    }
];

const feesFields = [
    {
        name: 'studentId',
        label: 'Ardayga',
        type: 'select',
        required: true,
        optionsEndpoint: '/users/students',
        optionsLabel: 'user.name',
        optionsValue: '_id',
        autoFill: [{ target: 'amount', formula: 'balance' }]
    },
    {
        name: 'month',
        label: 'Bisha',
        type: 'select',
        options: monthsList,
        required: true,
        default: (new Date().getMonth() + 1).toString()
    },
    {
        name: 'year',
        label: 'Sannadka',
        type: 'select',
        options: [
            { label: '2024', value: '2024' },
            { label: '2025', value: '2025' },
            { label: '2026', value: '2026' },
            { label: '2027', value: '2027' }
        ],
        required: true,
        default: new Date().getFullYear().toString()
    },
    { name: 'amount', label: 'Haraaga (Payment Amount)', type: 'number', required: true },
    {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [{ label: 'Paid', value: 'Paid' }, { label: 'Pending', value: 'Pending' }],
        default: 'Pending'
    }
];

const feesRoleAccess = ['Admin', 'Student'];
const feesWriteAccess = ['Admin'];

const PrintFeesAction = () => (
    <button
        onClick={() => window.print()}
        className="flex items-center px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors text-[10px] font-bold shadow-sm no-print"
        title="Print this list"
    >
        <Printer className="h-3 w-3 mr-1" /> Print List
    </button>
);

// ─── Student Fees View ─────────────────────────────────────────

const StudentFeesView = () => {
    const [fees, setFees] = useState([]);
    const [debts, setDebts] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/management/fees'),
            api.get('/management/debts'),
            api.get('/management/student-payments')
        ])
            .then(([resFees, resDebts, resPayments]) => {
                setFees(Array.isArray(resFees?.data) ? resFees.data : []);
                setDebts(Array.isArray(resDebts?.data) ? resDebts.data : []);
                setPayments(Array.isArray(resPayments?.data) ? resPayments.data : []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Calulate totals:
    const totalFeesOwed = fees.reduce((sum, f) => sum + (f.amount || f.studentId?.amount || 0), 0);
    const totalDebtsOwed = debts.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalEverOwed = totalFeesOwed + totalDebtsOwed;

    const studentInfo = (fees[0]?.studentId || debts[0]?.studentId || payments[0]?.studentId) || {};
    const finalTotalPaid = typeof studentInfo === 'object' ? studentInfo.totalPaid || 0 : 0;

    const balance = totalEverOwed - finalTotalPaid;
    const allPaid = balance <= 0 && totalEverOwed > 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading your records...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <WalletIcon className="h-7 w-7 text-blue-500" /> My Fees & Payments
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">Xogta lacagaha aad bixisay iyo kuwa kugu dhiman</p>
            </div>

            {/* Summary banner */}
            <div className={`rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center gap-4 ${allPaid ? 'bg-emerald-50 border-emerald-200' : balance > 0 ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${allPaid ? 'bg-emerald-100' : balance > 0 ? 'bg-amber-100' : 'bg-blue-100'}`}>
                    {allPaid
                        ? <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                        : balance > 0 ? <AlertCircle className="h-7 w-7 text-amber-600" /> : <WalletIcon className="h-7 w-7 text-blue-600" />
                    }
                </div>
                <div className="flex-1">
                    <p className={`font-black text-lg ${allPaid ? 'text-emerald-700' : balance > 0 ? 'text-amber-700' : 'text-blue-700'}`}>
                        {allPaid ? 'Dhammaan lacagaha waad bixisay ✅' : balance > 0 ? `Waxaad hadhsan tahay: $${balance}` : `Waxaad u horraysay (Credit): $${Math.abs(balance)}`}
                    </p>
                    <p className={`text-xs mt-0.5 ${allPaid ? 'text-emerald-600' : balance > 0 ? 'text-amber-600' : 'text-blue-600'}`}>
                        Wadarta Lagu weydiiyo: ${totalEverOwed} &nbsp;|&nbsp; Wadarta aad bixisay: ${finalTotalPaid}
                    </p>
                </div>
            </div>

            {/* Extra Debts (Books, etc.) */}
            {debts.length > 0 && (
                <div>
                    <h2 className="text-lg font-black text-slate-800 mb-3 ml-1">Other Debts (Deyn Kale)</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {debts.map(debt => (
                            <div key={debt._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{debt.description}</p>
                                    <p className="font-bold text-slate-800">${debt.amount}</p>
                                </div>
                                <span className={`text-[9px] font-black px-2 py-1 rounded border ${debt.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                    {debt.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Monthly Fee records */}
            <h2 className="text-lg font-black text-slate-800 mb-3 ml-1">Monthly Fees (Bileedka)</h2>
            {fees.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm font-medium">No monthly fees records found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {fees.map(fee => {
                        const m = monthsList.find(ml => ml.value === String(fee.month))?.label || fee.month;
                        const isPaid = fee.status === 'Paid';
                        return (
                            <div key={fee._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{m} {fee.year}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Fee: <span className="font-semibold text-slate-600">${fee.amount || fee.studentId?.amount || '—'}</span>
                                    </p>
                                </div>
                                <span className={`flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full border ${isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                    {isPaid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                                    {isPaid ? 'Paid' : 'Pending'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Payment History Section */}
            <div>
                <h2 className="text-lg font-black text-slate-800 mb-3 ml-1">Payment History (Taariikhda Bixinta)</h2>
                {payments.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center text-slate-500 text-sm">
                        No payments found.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {payments.slice().map(payment => (
                            <div key={payment._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">${payment.amount}</p>
                                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-50 text-slate-500 border border-slate-200">
                                        {payment.receiptNumber}
                                    </span>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                    <p className="text-xs text-slate-500 font-medium">
                                        <span className="font-bold text-slate-700">Sharaxaad: </span>
                                        {payment.description || 'Wax sharaxaad ah laguma darin'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Quick Pay Panel (shown when a fee row student is selected) ─
const QuickPayPanel = ({ feeItem, onClose, onPaid }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    const studentId = feeItem?.studentId?._id || feeItem?.studentId;
    const feeId = feeItem?._id;
    const studentName = feeItem?.studentId?.user?.name || 'Unknown Student';
    const totalFee = feeItem?.studentId?.amount || 0;
    const totalPaid = feeItem?.studentId?.totalPaid || 0;
    const remaining = totalFee - totalPaid;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const num = Number(amount);
        if (!num || num <= 0) { setMsg({ type: 'err', text: 'Fadlan lacag sax ah geli.' }); return; }
        setLoading(true); setMsg(null);
        try {
            await api.post('/management/student-payments', {
                studentId,
                feeId,
                amount: num,
                description: description.trim(),
            });
            setMsg({ type: 'ok', text: `✅ $${num} si guul leh ayaa loo diiwaan geliyay!` });
            setAmount('');
            setDescription('');
            onPaid?.();
        } catch (err) {
            setMsg({ type: 'err', text: err.response?.data?.message || 'Khalad ayaa dhacay.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-white font-black text-lg">Quick Pay</h2>
                        <p className="text-blue-100 text-xs mt-0.5 font-medium">{studentName}</p>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Balance summary */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 grid grid-cols-3 gap-3 text-center">
                    {[
                        { label: 'Total Fee', value: `$${totalFee}`, color: 'text-slate-700' },
                        { label: 'Total Paid', value: `$${totalPaid}`, color: 'text-emerald-600' },
                        {
                            label: remaining > 0 ? 'Remaining' : 'Advance / Credit',
                            value: `$${Math.abs(remaining)}`,
                            color: remaining > 0 ? 'text-red-500' : 'text-emerald-500'
                        },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white rounded-xl py-3 border border-slate-100 shadow-sm">
                            <p className={`font-black text-lg ${color}`}>{value}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {remaining <= 0 && (
                        <div className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-lg font-semibold">
                            ✅ Ardaygan lacagtiisii hore ($ {totalFee}) waa uu bixiyay, laakiin wali lacag dheeraad ah waad ku dari kartaa.
                        </div>
                    )}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                            Lacagta (Amount) *
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="Enter amount..."
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:bg-slate-50"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                            Sharaxaad (Description)
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="e.g. Monthly fee March, Partial payment..."
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:bg-slate-50"
                        />
                    </div>
                    {msg && (
                        <div className={`text-xs px-3 py-2 rounded-lg border ${msg.type === 'ok' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                            {msg.text}
                        </div>
                    )}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !amount}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <WalletIcon className="h-4 w-4" />
                            {loading ? 'Processing...' : 'Submit Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Admin Fees View ──────────────────────────────────────────
const AdminFeesView = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [classes, setClasses] = useState([]);
    const [payFeeItem, setPayFeeItem] = useState(null); // the fee row being paid
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        api.get('/core/classes').then(res => setClasses(res.data)).catch(console.error);
    }, []);

    const endpoint = `/management/fees?${new URLSearchParams({
        ...(selectedClass && { classId: selectedClass }),
        ...(selectedMonth && { month: selectedMonth }),
        ...(selectedYear && { year: selectedYear }),
        ...(selectedStatus && { status: selectedStatus }),
    }).toString()}`;

    const handleClearFilters = () => {
        setSelectedClass('');
        setSelectedMonth('');
        setSelectedYear('');
        setSelectedStatus('');
    };

    // Custom action button shown on each fee row — opens Quick Pay panel
    const PayAction = ({ item }) => (
        <button
            onClick={() => setPayFeeItem(item)}
            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
            title="Record payment for this student"
        >
            <WalletIcon className="h-3.5 w-3.5" /> Pay
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="text-[10px] text-blue-500 font-bold bg-blue-50 p-2 rounded-lg border border-blue-100">
                SYSTEM DEBUG: {endpoint}
            </div>
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end no-print">
                <div className="flex flex-col flex-1 min-w-[150px]">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Filter by Class:</label>
                    <select
                        className="p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col flex-1 min-w-[150px]">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Choose Month:</label>
                    <select
                        className="p-2 border border-slate-300 rounded-lg bg-amber-50 border-amber-200 focus:ring-2 focus:ring-amber-500 outline-none text-sm font-bold text-amber-900"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        <option value="">All Months</option>
                        {monthsList.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                </div>
                <div className="flex flex-col w-[100px]">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Year:</label>
                    <select
                        className="p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <option value="">All Years</option>
                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="flex flex-col flex-1 min-w-[150px]">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Status:</label>
                    <select
                        className={`p-2 border border-slate-300 rounded-lg focus:ring-2 outline-none text-sm font-bold ${selectedStatus === 'Paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50'}`}
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="Paid">Paid (Wixii dhiibay)</option>
                        <option value="Pending">Pending (Wixii dhiman)</option>
                    </select>
                </div>
                <button
                    onClick={handleClearFilters}
                    className="p-2 text-slate-400 hover:text-slate-600 text-xs font-bold hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100"
                >
                    Reset
                </button>
            </div>

            <CrudPage
                key={refreshKey}
                title="Fee Management - SHAASHADDA CUSBOONEYSII"
                endpoint={endpoint}
                roleAccess={feesRoleAccess}
                writeAccessRoles={feesWriteAccess}
                extraHeaderActions={[PrintFeesAction]}
                customActions={[PayAction]}
                transformEditData={(item) => ({
                    ...item,
                    studentId: item.studentId?._id || item.studentId || '',
                    year: item.year || new Date().getFullYear(),
                    month: item.month || (new Date().getMonth() + 1)
                })}
                columns={feesColumns}
                formFields={feesFields}
            />

            {/* Quick Pay Modal */}
            {payFeeItem && (
                <QuickPayPanel
                    feeItem={payFeeItem}
                    onClose={() => setPayFeeItem(null)}
                    onPaid={() => {
                        setPayFeeItem(null);
                        setRefreshKey(k => k + 1); // force CrudPage refetch
                    }}
                />
            )}
        </div>
    );
};


// ─── FeesPage: router between Student view and Admin view ──────
export const FeesPage = () => {
    const user = useAuthStore(state => state.user);
    if (user?.role === 'Student') return <StudentFeesView />;
    return <AdminFeesView />;
};


// --- Exams Page Config ---
const examsColumns = [
    { header: 'Type', accessor: 'type' },
    { header: 'Subject', render: (item) => item.subjectId?.name || '-' },
    {
        header: 'Status', render: (item) => (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Closed' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {item.status || 'Open'}
            </span>
        )
    },
    { header: 'Date', render: (item) => new Date(item.date).toLocaleDateString() }
];

const examsFields = [
    { name: 'type', label: 'Exam Type', type: 'select', required: true, options: [{ label: 'Monthly Exam', value: 'Monthly Exam' }, { label: 'Final Exam', value: 'Final Exam' }, { label: 'Test', value: 'Test' }, { label: 'Midterm', value: 'Midterm' }] },
    { name: 'skillId', label: 'Xirfad', type: 'select', required: true, optionsEndpoint: '/core/skills', optionsLabel: 'name', optionsValue: '_id' },
    { name: 'classId', label: 'Class', type: 'select', required: true, optionsEndpoint: '/core/classes', optionsLabel: 'name', optionsValue: '_id' },
    { name: 'subjectId', label: 'Subject', type: 'select', required: true, optionsEndpoint: '/core/subjects', optionsLabel: 'name', optionsValue: '_id' },
    { name: 'date', label: 'Date', type: 'date', required: true }
];

const examsRoleAccess = ['Admin', 'Teacher'];
export const ExamsPage = () => {
    const user = useAuthStore(state => state.user);
    const navigate = useNavigate();

    const handleToggleStatus = async (item, refresh) => {
        try {
            await api.patch(`/management/exams/${item._id}/toggle`);
            refresh();
        } catch (error) {
            console.error('Error toggling status', error);
        }
    };

    const ToggleAction = ({ item, refresh }) => (
        <button onClick={() => handleToggleStatus(item, refresh)} className={`p-2 rounded-lg transition-colors ${item.status === 'Closed' ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`} title={item.status === 'Closed' ? "Open Exam (Allow visibility/editing)" : "Close Exam (Hide from students/prevent editing)"}>
            {item.status === 'Closed' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        </button>
    );

    const GlobalStatusIndicator = () => {
        const [isLocked, setIsLocked] = useState(null);

        const checkStatus = () => {
            api.get('/users/students?limit=1').then(res => {
                if (res.data && res.data.length > 0) {
                    setIsLocked(res.data[0].isLocked);
                }
            }).catch(console.error);
        };

        useEffect(() => {
            checkStatus();
            const interval = setInterval(checkStatus, 3000); // Check every 3 seconds
            return () => clearInterval(interval);
        }, []);

        if (isLocked === null) return null;

        return (
            <div className={`flex items-center px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all shadow-sm ${isLocked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                <span className="mr-2 uppercase opacity-70">Results Status:</span>
                <span className="flex items-center">
                    {isLocked ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
                    {isLocked ? 'CLOSED' : 'OPEN'}
                </span>
            </div>
        );
    };

    const handleBulkStudentLock = async (isLocked, refresh) => {
        const msg = `Are you sure you want to ${isLocked ? 'LOCK' : 'UNLOCK'} results for ALL students?`;
        if (!window.confirm(msg)) return;
        try {
            await api.patch('/management/results/bulk-lock', { isLocked });
            alert(`Results for ALL students have been ${isLocked ? 'LOCKED' : 'OPENED'}.`);
            refresh();
        } catch (error) {
            console.error('Error in bulk student lock', error);
            alert(error.response?.data?.message || 'Error updating all students');
        }
    };

    const BulkLockAction = ({ refresh }) => (
        <button onClick={() => handleBulkStudentLock(true, refresh)} className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-bold" title="Lock all results for students">
            <Lock className="h-3 w-3 mr-1" /> Lock All
        </button>
    );

    const BulkUnlockAction = ({ refresh }) => (
        <button onClick={() => handleBulkStudentLock(false, refresh)} className="flex items-center px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-xs font-bold" title="Unlock all results for students">
            <Unlock className="h-3 w-3 mr-1" /> Unlock All
        </button>
    );

    const EnterMarksAction = ({ item }) => (
        <button
            onClick={() => navigate(`/mark-entry?skillId=${item.skillId?._id || item.skillId}&classId=${item.classId?._id || item.classId}&subjectId=${item.subjectId?._id || item.subjectId}`)}
            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Enter Marks"
        >
            <Edit3 className="h-4 w-4" />
        </button>
    );

    return (
        <CrudPage
            title="Exams"
            endpoint="/management/exams"
            roleAccess={examsRoleAccess}
            writeAccessRoles={[]}
            customActions={[ToggleAction, EnterMarksAction]}
            extraHeaderActions={user?.role === 'Admin' ? [GlobalStatusIndicator, BulkLockAction, BulkUnlockAction] : []}
            transformEditData={(item) => ({
                ...item,
                skillId: item.skillId?._id || item.skillId || '',
                classId: item.classId?._id || item.classId || '',
                subjectId: item.subjectId?._id || item.subjectId || ''
            })}
            columns={examsColumns}
            formFields={examsFields}
        />
    );
};

// --- Results Page Helpers ---
const calculateGrade = (marks) => {
    if (marks >= 90) return { grade: 'A+', color: 'text-purple-600' };
    if (marks >= 80) return { grade: 'A', color: 'text-blue-600' };
    if (marks >= 70) return { grade: 'B', color: 'text-green-600' };
    if (marks >= 60) return { grade: 'C', color: 'text-amber-600' };
    return { grade: 'F', color: 'text-red-600' };
};

const getStatus = (marks) => {
    return marks >= 60
        ? { label: 'PASS', class: 'bg-green-100 text-green-800' }
        : { label: 'FAILED', class: 'bg-red-100 text-red-800' };
};

const resultsFields = [
    { name: 'studentId', label: 'Student', type: 'select', required: true, optionsEndpoint: '/users/students', optionsLabel: 'user.name', optionsValue: '_id' },
    { name: 'subjectId', label: 'Subject', type: 'select', required: true, optionsEndpoint: '/core/subjects', optionsLabel: 'name', optionsValue: '_id' },
    { name: 'midterm', label: 'Midterm Mark', type: 'number' },
    { name: 'test', label: 'Test Mark', type: 'number' },
    { name: 'final', label: 'Final Mark', type: 'number' }
];

const resultsTransformEditData = (item) => ({
    ...item,
    studentId: item.studentId?._id || item.studentId || '',
    subjectId: item.subjectId?._id || item.subjectId || (item.examId?.subjectId?._id) || ''
});

const resultsRoleAccess = ['Admin', 'Teacher', 'Student'];
const resultsWriteAccess = ['Admin', 'Teacher'];

export const ResultsPage = () => {
    const handleToggleLock = async (item, refresh) => {
        if (!item._id) return;
        const newStatus = !item.isLocked;
        const studentName = item.studentId?.user?.name || item.studentId?.enrollmentNo || 'this student';
        const msg = `Are you sure you want to ${newStatus ? 'LOCK' : 'UNLOCK'} results for ${studentName}?`;
        if (!window.confirm(msg)) return;

        try {
            await api.put(`/management/results/${item._id}`, { isLocked: newStatus });
            alert(`Result successfully ${newStatus ? 'LOCKED' : 'UNLOCKED'}`);
            refresh();
        } catch (error) {
            console.error('Error toggling lock', error);
            alert(error.response?.data?.message || 'Error toggling lock');
        }
    };

    const LockToggleAction = ({ item, refresh }) => {
        const isLocked = item.isLocked;
        return (
            <button
                onClick={() => handleToggleLock(item, refresh)}
                className={`p-2 rounded-lg transition-colors ${isLocked ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                title={isLocked ? "Unlock Result" : "Lock Result"}
            >
                {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </button>
        );
    };


    const user = useAuthStore(state => state.user);
    const role = user?.role;
    const userId = user?._id;

    const columns = useMemo(() => {
        const base = [
            {
                header: 'Subject',
                render: (item) => (
                    <div>
                        <div className="font-bold text-slate-800">{item.subjectId?.name || (item.examId?.subjectId?.name) || '-'}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-tighter">{item.examId?.type || 'Consolidated'}</div>
                    </div>
                )
            },
            {
                header: 'Student',
                render: (item) => {
                    const name = item.studentId?.user?.name || item.studentId?.enrollmentNo || 'Student';
                    return (
                        <div>
                            <div className="font-medium text-slate-800">{name}</div>
                            {item.studentId?.enrollmentNo && <div className="text-[10px] text-slate-500 font-mono">{item.studentId.enrollmentNo}</div>}
                        </div>
                    );
                }
            },
            { header: 'Midterm', accessor: 'midterm', render: (item) => item.midterm || 0 },
            { header: 'Test', accessor: 'test', render: (item) => item.test || 0 },
            { header: 'Final', accessor: 'final', render: (item) => item.final || 0 },
            {
                header: 'Total',
                render: (item) => <span className="font-black text-indigo-700">{item.total || item.marksObtained || 0}</span>
            },
            {
                header: 'Grade',
                render: (item) => {
                    const marks = item.total || item.marksObtained || 0;
                    const { grade, color } = calculateGrade(marks);
                    return <span className={`font-bold ${color}`}>{grade}</span>;
                }
            },
            {
                header: 'Status',
                render: (item) => {
                    const marks = item.total || item.marksObtained || 0;
                    const status = getStatus(marks);
                    return (
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${status.class}`}>
                            {status.label}
                        </span>
                    );
                }
            }
        ];

        if (role === 'Admin') {
            base.push({
                header: 'Access',
                render: (item) => (
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.isLocked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {item.isLocked ? 'CLOSED' : 'OPEN'}
                    </span>
                )
            });
        }
        return base;
    }, [role]);

    // Use stable selectors for dependencies
    const classIdsStr = JSON.stringify(user?.classIds || []);
    const skillsStr = JSON.stringify(user?.skills || []);
    const subjectsStr = JSON.stringify(user?.subjects || []);

    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSkill, setSelectedSkill] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    const [classes, setClasses] = useState([]);
    const [skills, setSkills] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const isFetchingMetadata = useRef(false);

    useEffect(() => {
        if (isFetchingMetadata.current) return;
        isFetchingMetadata.current = true;

        if (role && role !== 'Student') {
            const currentClassIds = user?.classIds || [];
            const currentSkills = user?.skills || [];
            const currentSubjects = user?.subjects || [];

            api.get('/core/classes').then(res => {
                let allItems = res.data;
                if (role === 'Teacher' && currentClassIds.length > 0) {
                    allItems = allItems.filter(c => currentClassIds.includes(c._id));
                }
                setClasses(allItems);
            }).catch(console.error);

            api.get('/core/skills').then(res => {
                let allItems = res.data;
                if (role === 'Teacher' && currentSkills.length > 0) {
                    allItems = allItems.filter(s => currentSkills.includes(s._id));
                }
                setSkills(allItems);
            }).catch(console.error);

            api.get('/core/subjects').then(res => {
                let allItems = res.data;
                if (role === 'Teacher' && currentSubjects.length > 0) {
                    allItems = allItems.filter(s => currentSubjects.includes(s._id));
                }
                setSubjects(allItems);
                if (role === 'Teacher' && allItems.length > 0 && !selectedSubject) {
                    setSelectedSubject(allItems[0]._id);
                }
            }).catch(console.error).finally(() => {
                isFetchingMetadata.current = false;
            });
        }
    }, [role, userId, classIdsStr, skillsStr, subjectsStr]);

    const endpoint = `/management/results?${new URLSearchParams({
        ...(selectedClass && { classId: selectedClass }),
        ...(selectedSkill && { skillId: selectedSkill }),
        ...(selectedSubject && { subjectId: selectedSubject }),
    }).toString()}`;

    return (
        <div className="space-y-6">
            {role !== 'Student' && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col flex-1 min-w-[150px]">
                        <label className="text-sm font-medium text-slate-700 mb-1">Filter by Skill:</label>
                        <select
                            className="p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            value={selectedSkill}
                            onChange={(e) => setSelectedSkill(e.target.value)}
                        >
                            <option value="">All Skills</option>
                            {skills.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col flex-1 min-w-[150px]">
                        <label className="text-sm font-medium text-slate-700 mb-1">Filter by Class:</label>
                        <select
                            className="p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col flex-1 min-w-[150px]">
                        <label className="text-sm font-medium text-slate-700 mb-1">Filter by Subject:</label>
                        <select
                            className="p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            {role !== 'Teacher' && <option value="">All Subjects</option>}
                            {role === 'Teacher' && <option value="" disabled>-- Choose Subject --</option>}
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
            )}

            <CrudPage
                title="Exam Results"
                endpoint={endpoint}
                roleAccess={resultsRoleAccess}
                writeAccessRoles={[]}
                canWrite={false}
                customActions={role === 'Admin' ? [LockToggleAction] : []}
                extraHeaderActions={[]}
                transformEditData={resultsTransformEditData}
                columns={columns}
                formFields={resultsFields}
            />
        </div>
    );
};

// --- Attendances Page Config ---
const attendanceColumns = [
    { header: 'Date', render: (item) => new Date(item.date).toLocaleDateString() },
    { header: 'Class', render: (item) => item.classId?.name || item.classId },
    { header: 'Batch', render: (item) => item.batchId?.name || item.batchId }
];

const attendanceFields = [
    { name: 'classId', label: 'Class ID', required: true },
    { name: 'batchId', label: 'Batch ID', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true }
];

const attendanceRoleAccess = ['Admin', 'Teacher', 'Student'];
const attendanceWriteAccess = ['Admin'];

export const AttendancesPage = () => (
    <CrudPage
        title="Attendances"
        endpoint="/management/attendances"
        roleAccess={attendanceRoleAccess}
        writeAccessRoles={attendanceWriteAccess}
        transformEditData={(item) => ({
            ...item,
            classId: item.classId?._id || item.classId || '',
            batchId: item.batchId?._id || item.batchId || ''
        })}
        columns={attendanceColumns}
        formFields={attendanceFields}
    />
);

// --- Debts Page Config ---
const debtColumns = [
    {
        header: 'Student',
        render: (item) => (
            <div>
                <div className="font-semibold text-slate-800">{item.studentId?.user?.name || item.studentId?.name || 'Unknown'}</div>
                <div className="text-[10px] text-slate-500 font-mono italic">{item.studentId?.enrollmentNo}</div>
            </div>
        )
    },
    {
        header: 'Description (Wixii loo qoray)',
        render: (item) => <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">{item.description}</span>
    },
    { header: 'Amount', render: (item) => <span className="font-black text-slate-700 font-mono">${item.amount}</span> },
    {
        header: 'Status',
        render: (item) => (
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${item.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                {item.status}
            </span>
        )
    },
    { header: 'Date', render: (item) => <span className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</span> }
];

const debtFields = [
    {
        name: 'studentId',
        label: 'Select Student',
        type: 'select',
        optionsEndpoint: '/users/students?status=Active',
        optionsLabel: 'user.name',
        required: true
    },
    { name: 'description', label: 'Description (e.g. Book, Ream, Uniform)', required: true },
    { name: 'amount', label: 'Amount ($)', type: 'number', required: true },
    {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
            { label: 'Pending', value: 'Pending' },
            { label: 'Paid', value: 'Paid' }
        ],
        required: true
    }
];

export const DebtsPage = () => (
    <CrudPage
        title="Extra Debts Management (Maamulka Deynka)"
        endpoint="/management/debts"
        roleAccess={['Admin']}
        columns={debtColumns}
        formFields={debtFields}
    />
);
