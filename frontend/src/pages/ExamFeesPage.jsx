import React from 'react';
import CrudPage from '../components/CrudPage';

const examFeeColumns = [
    { header: '#', render: (item, index) => <span className="font-bold text-slate-500">{index + 1}</span> },
    { header: 'Date', render: (item) => new Date(item.paymentDate).toLocaleDateString() },
    { header: 'Receipt', accessor: 'receiptNumber' },
    { header: 'Student', render: (item) => item.studentId?.user?.name || 'Unknown' },
    { header: 'ID', render: (item) => item.studentId?.enrollmentNo || '-' },
    { header: 'Class', render: (item) => item.classId?.name || '-' },
    { header: 'Description', accessor: 'description' },
    { header: 'Amount', render: (item) => <span className="font-bold text-emerald-600">${item.amount}</span> },
];

const examFeeFields = [
    { 
        name: 'studentId', 
        label: 'Student', 
        type: 'select', 
        required: true, 
        optionsEndpoint: '/users/students?status=Active', 
        optionsLabel: 'user.name', 
        optionsValue: '_id' 
    },
    { name: 'amount', label: 'Exam Fee Amount ($)', type: 'number', required: true },
    { name: 'description', label: 'Description', default: 'Exam Fee' },
    { name: 'paymentDate', label: 'Payment Date', type: 'date', default: new Date().toISOString().split('T')[0] },
];

const ExamFeesPage = () => {
    return (
        <CrudPage
            title="Exam Fees Management"
            endpoint="/management/exam-fees"
            roleAccess={['Admin']}
            columns={examFeeColumns}
            formFields={examFeeFields}
            filters={[
                { name: 'classId', label: 'Class', type: 'select', optionsEndpoint: '/core/classes', optionsLabel: 'name' }
            ]}
        />
    );
};

export default ExamFeesPage;
