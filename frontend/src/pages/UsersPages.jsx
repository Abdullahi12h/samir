import { useState, useEffect } from 'react';
import CrudPage from '../components/CrudPage';
import api from '../utils/api';
import { GraduationCap, FileText, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EMPTY_ARRAY = [];

const PasswordCell = ({ password }) => {
    const [visible, setVisible] = useState(false);
    return (
        <div className="flex items-center space-x-2">
            <span className={`font-mono font-bold tracking-widest ${visible ? 'text-pink-600' : 'text-slate-300'}`}>
                {visible ? (password || '******') : '••••••'}
            </span>
            <button
                onClick={() => setVisible(!visible)}
                className="text-slate-400 hover:text-blue-500 transition-colors"
                title={visible ? "Hide Password" : "Show Password"}
            >
                {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    );
};


const GraduateAction = ({ item, refresh }) => {
    const handleGraduate = async () => {
        if (!window.confirm(`Are you sure you want to graduate ${item.user.name}?`)) return;
        try {
            await api.put(`/users/students/${item._id}`, { status: 'Graduated' });
            refresh();
        } catch (error) {
            alert(error.response?.data?.message || 'Error graduating student');
        }
    };

    return (
        <button
            onClick={handleGraduate}
            className="text-indigo-500 hover:text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
            title="Graduate Student"
        >
            <GraduationCap className="h-4 w-4" />
        </button>
    );
};

const LockAction = ({ item, refresh }) => {
    const handleToggleLock = async () => {
        const newStatus = !item.isLocked;
        const msg = `Are you sure you want to ${newStatus ? 'LOCK' : 'UNLOCK'} results for ${item.user?.name || 'this student'}?`;
        if (!window.confirm(msg)) return;
        try {
            await api.put(`/users/students/${item._id}`, { isLocked: newStatus });
            refresh();
        } catch (error) {
            alert(error.response?.data?.message || 'Error toggling lock');
        }
    };

    return (
        <button
            onClick={handleToggleLock}
            className={`p-2 rounded-lg transition-colors ${item.isLocked ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
            title={item.isLocked ? "Unlock Results" : "Lock Results"}
        >
            {item.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </button>
    );
};

const studentCustomActions = [GraduateAction, LockAction];

const studentTransformEditData = (item) => ({
    ...item,
    name: item.user?.name || '',
    username: item.user?.username || '',
    phone: item.user?.phone || '',
    whatsapp: item.user?.whatsapp || '',
    classId: item.classId?._id || item.classId || '',
    batchId: item.batchId?._id || item.batchId || '',
    skillId: item.skillId?._id || item.skillId || '',
    password: item.plainPassword || ''
});

const teacherTransformEditData = (item) => ({
    ...item,
    name: item.user?.name || '',
    username: item.user?.username || '',
    phone: item.user?.phone || '',
    whatsapp: item.user?.whatsapp || '',
    password: '',
    joinDate: item.joinDate ? new Date(item.joinDate).toISOString().split('T')[0] : '',
    skills: Array.isArray(item.skills) ? item.skills.map(s => s._id || s) : [],
    classIds: Array.isArray(item.classIds) ? item.classIds.map(c => c._id || c) : [],
    subjects: Array.isArray(item.subjects) ? item.subjects.map(s => s._id || s) : [],
});

// --- Teachers Page Config ---
const teacherColumns = [
    { header: 'Photo', render: (item) => item.photo ? <img src={`http://localhost:5001${item.photo}`} alt="Teacher" className="w-10 h-10 rounded-full object-cover border border-slate-200" /> : '-' },
    { header: 'Name', render: (item) => item.user?.name },
    {
        header: 'Phone/WA', render: (item) => (
            <div className="flex flex-col text-[11px]">
                <span>P: {item.user?.phone || '-'}</span>
                <span>W: {item.user?.whatsapp || '-'}</span>
            </div>
        )
    },
    { header: 'Username', render: (item) => item.user?.username },
    { header: 'Password', render: (item) => <PasswordCell password={item.plainPassword} /> },
    { header: 'Gender', accessor: 'gender' },
    { header: 'Classes', render: (item) => Array.isArray(item.classIds) ? item.classIds.map(c => c.name || c).join(', ') : '-' },
    { header: 'Subjects', render: (item) => Array.isArray(item.subjects) ? item.subjects.map(s => s.name || s).join(', ') : '-' },
    { header: 'Specialization', accessor: 'specialization' },
    {
        header: 'Exp/Edu', render: (item) => (
            <div className="flex flex-col text-[11px]">
                <span>Exp: {item.experience || 0} yrs</span>
                <span>Edu: {item.educationLevel || '-'}</span>
            </div>
        )
    },
    { header: 'Salary', render: (item) => item.salary ? `$${item.salary}` : '-' },
    { header: 'Join Date', render: (item) => item.joinDate ? new Date(item.joinDate).toLocaleDateString() : '-' },
    { header: 'Address', accessor: 'address' },
    { header: 'CV', render: (item) => item.cv ? <a href={`http://localhost:5001${item.cv}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View CV</a> : '-' },
];

const teacherFields = [
    { name: 'name', label: 'FullName', required: true },
    { name: 'username', label: 'Username', required: true },
    { name: 'phone', label: 'Phone Number', required: true },
    { name: 'whatsapp', label: 'WhatsApp', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
    { name: 'gender', label: 'Gender', type: 'select', required: true, options: [{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }] },
    { name: 'specialization', label: 'Specialization', required: true },
    { name: 'skills', label: 'Assigned Skills', type: 'multi-select', optionsEndpoint: 'core/skills', optionsLabel: 'name', optionsValue: '_id' },
    { name: 'classIds', label: 'Assigned Classes', type: 'multi-select', optionsEndpoint: 'core/classes', optionsLabel: 'name', optionsValue: '_id', max: 6 },
    { name: 'subjects', label: 'Teaching Subjects', type: 'multi-select', optionsEndpoint: 'core/subjects', optionsLabel: 'name', optionsValue: '_id', max: 6 },
    { name: 'educationLevel', label: 'Education Level' },
    { name: 'experience', label: 'Experience (Years)', type: 'number' },
    { name: 'salary', label: 'Salary', type: 'number', required: true },
    { name: 'joinDate', label: 'Join Date', type: 'date', required: true },
    { name: 'address', label: 'Address' },
    { name: 'photo', label: 'Photo', type: 'file', accept: 'image/*' },
    { name: 'cv', label: 'CV', type: 'file', accept: '.pdf,.doc,.docx' },
];

export const TeachersPage = () => (
    <CrudPage
        title="Teachers"
        endpoint="/users/teachers"
        roleAccess={['Admin']}
        columns={teacherColumns}
        formFields={teacherFields}
        transformEditData={teacherTransformEditData}
    />
);

// --- Students Page Config ---
const studentFilters = [
    { name: 'classId', label: 'Class', type: 'select', optionsEndpoint: '/core/classes', optionsLabel: 'name' },
    { name: 'skillId', label: 'Skill', type: 'select', optionsEndpoint: '/core/skills', optionsLabel: 'name' }
];

const studentColumns = [
    { header: 'Photo', render: (item) => item.photo ? <img src={`http://localhost:5001${item.photo}`} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-slate-200" /> : '-' },
    { header: 'Name', render: (item) => item.user?.name },
    { header: 'Phone', render: (item) => item.user?.phone || '-' },
    { header: 'Enrollment No', accessor: 'enrollmentNo' },
    { header: 'Mother Name', accessor: 'motherName' },
    { header: 'Age', accessor: 'age' },
    { header: 'Username', render: (item) => item.user?.username },
    { header: 'Password', render: (item) => <PasswordCell password={item.plainPassword} /> },
    { header: 'Class', render: (item) => item.classId?.name },
    { header: 'Batch', render: (item) => item.batchId?.name },
    { header: 'Skill', render: (item) => item.skillId?.name },
    { header: 'Fee Type', accessor: 'registrationFee' },
    { header: 'Amount', render: (item) => `$${item.amount}` },
    {
        header: 'Results',
        render: (item) => (
            <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.isLocked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {item.isLocked ? 'CLOSED' : 'OPEN'}
            </span>
        )
    }
];

const studentFields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'phone', label: 'Phone Number', type: 'number', required: true },
    { name: 'whatsapp', label: 'WhatsApp Number', type: 'number', required: true },
    { name: 'motherName', label: 'Mother Name', required: true },
    { name: 'age', label: 'Age', type: 'number', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
    { name: 'photo', label: 'Student Photo', type: 'file', accept: 'image/*' },
    { name: 'classId', label: 'Class', type: 'select', required: true, optionsEndpoint: '/core/classes', optionsLabel: 'name', optionsValue: '_id' },
    { name: 'batchId', label: 'Batch', type: 'select', required: true, optionsEndpoint: '/core/batches', optionsLabel: 'name', optionsValue: '_id' },
    { name: 'skillId', label: 'Skill', type: 'select', required: true, optionsEndpoint: '/core/skills', optionsLabel: 'name', optionsValue: '_id' },
    {
        name: 'registrationFee',
        label: 'Registration Fee',
        type: 'select',
        required: true,
        options: [
            { label: 'Standard', value: 'Standard' },
            { label: 'Discounted', value: 'Discounted' },
            { label: 'Scholarship', value: 'Scholarship' }
        ]
    },
    { name: 'amount', label: 'Amount', type: 'number', required: true }
];

export const StudentsPage = () => (
    <CrudPage
        title="Active Students"
        endpoint="/users/students?status=Active"
        roleAccess={['Admin', 'Teacher']}
        customActions={studentCustomActions}
        filters={studentFilters}
        columns={studentColumns}
        formFields={studentFields}
        transformEditData={studentTransformEditData}
    />
);

const graduateColumns = [
    { header: 'Photo', render: (item) => item.photo ? <img src={`http://localhost:5001${item.photo}`} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-slate-200" /> : '-' },
    { header: 'Name', render: (item) => item.user?.name },
    { header: 'Phone', render: (item) => item.user?.phone || '-' },
    { header: 'Enrollment No', accessor: 'enrollmentNo' },
    { header: 'Username', render: (item) => item.user?.username },
    { header: 'Completed Batch', render: (item) => item.batchId?.name },
    { header: 'Skill', render: (item) => item.skillId?.name },
];

const ReportAction = ({ item }) => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(`/reports/graduated/${item.batchId?._id || item.batchId}`)}
            className="text-indigo-500 hover:text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
            title="Generate Batch Report"
        >
            <FileText className="h-4 w-4" />
        </button>
    );
};

export const GraduatesPage = () => (
    <CrudPage
        title="Graduated Students"
        endpoint="/users/students?status=Graduated"
        roleAccess={['Admin', 'Teacher']}
        writeAccessRoles={EMPTY_ARRAY}
        customActions={[ReportAction]}
        filters={studentFilters}
        columns={graduateColumns}
        formFields={EMPTY_ARRAY}
    />
);
