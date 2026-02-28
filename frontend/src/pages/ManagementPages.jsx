import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CrudPage from '../components/CrudPage';
import { Lock, Unlock, Edit3, Printer } from 'lucide-react';
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
        header: 'Student',
        render: (item) => (
            <div>
                <div className="font-semibold text-slate-800">
                    {item.studentId?.user?.name || (typeof item.studentId === 'string' ? item.studentId : (item.studentId?._id || 'Unknown'))}
                </div>
                <div className="flex flex-wrap gap-2 mt-0.5">
                    {item.studentId?.enrollmentNo && (
                        <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1 rounded">{item.studentId.enrollmentNo}</span>
                    )}
                    {item.studentId?.user?.phone && (
                        <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-1 rounded">{item.studentId.user.phone}</span>
                    )}
                    {item.studentId?.classId?.name && (
                        <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-1 rounded uppercase tracking-tighter">{item.studentId.classId.name}</span>
                    )}
                </div>
            </div>
        )
    },
    { header: 'Course Fee', render: (item) => `$${item.studentId?.amount || '-'}` },
    { header: 'Paid', render: (item) => <span className="text-green-600 font-bold">${item.studentId?.totalPaid || 0}</span> },
    {
        header: 'Balance',
        render: (item) => {
            const balance = (item.studentId?.amount || 0) - (item.studentId?.totalPaid || 0);
            return <span className={`font-bold ${balance > 0 ? 'text-red-500' : 'text-slate-500'}`}>${balance}</span>;
        }
    },
    {
        header: 'Status',
        render: (item) => (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {item.status || 'Pending'}
            </span>
        )
    },
    {
        header: 'Period',
        render: (item) => {
            const m = monthsList.find(ml => ml.value === String(item.month))?.label || '';
            return <span className="text-[11px] font-bold text-slate-500 uppercase">{m} {item.year}</span>;
        }
    }
];

const feesFields = [
    { name: 'studentId', label: 'Ardayga', type: 'select', required: true, optionsEndpoint: '/users/students', optionsLabel: 'user.name', optionsValue: '_id' },
    { name: 'month', label: 'Bisha', type: 'select', options: monthsList, required: true },
    { name: 'year', label: 'Sannadka', type: 'number', required: true },
    { name: 'amount', label: 'Cash (Fee Amount)', type: 'number', required: true },
    { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Paid', value: 'Paid' }, { label: 'Pending', value: 'Pending' }] }
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

export const FeesPage = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedStatus, setSelectedStatus] = useState('');
    const [classes, setClasses] = useState([]);

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
        setSelectedMonth((new Date().getMonth() + 1).toString());
        setSelectedYear(new Date().getFullYear().toString());
        setSelectedStatus('');
    };

    return (
        <div className="space-y-6">
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
                title="Fee Management"
                endpoint={endpoint}
                roleAccess={feesRoleAccess}
                writeAccessRoles={feesWriteAccess}
                extraHeaderActions={[PrintFeesAction]}
                transformEditData={(item) => ({
                    ...item,
                    studentId: item.studentId?._id || item.studentId || '',
                    year: item.year || new Date().getFullYear(),
                    month: item.month || (new Date().getMonth() + 1)
                })}
                columns={feesColumns}
                formFields={feesFields}
            />
        </div>
    );
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
