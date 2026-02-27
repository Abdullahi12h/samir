import CrudPage from '../components/CrudPage';
import { GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SkillsPage = () => (
    <CrudPage
        title="Skills"
        endpoint="/core/skills"
        roleAccess={['Admin']}
        transformEditData={(item) => ({
            ...item
        })}
        columns={[
            { header: 'Name', accessor: 'name' },
            { header: 'Description', accessor: 'description' }
        ]}
        formFields={[
            { name: 'name', label: 'Skill Name', required: true },
            { name: 'description', label: 'Description' }
        ]}
    />
);

export const BatchesPage = () => {
    const navigate = useNavigate();

    const ViewGraduatedAction = ({ item }) => (
        <button
            onClick={() => navigate(`/reports/graduated/${item._id}`)}
            className="text-indigo-500 hover:text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
            title="View Graduated Students"
        >
            <GraduationCap className="h-4 w-4" />
        </button>
    );

    return (
        <CrudPage
            title="Batches"
            endpoint="/core/batches"
            roleAccess={['Admin']}
            customActions={[ViewGraduatedAction]}
            transformEditData={(item) => ({
                ...item,
                classId: item.classId?._id || item.classId || ''
            })}
            columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Class ID', render: (item) => item.classId?.name || item.classId },
                { header: 'Duration (Months)', accessor: 'durationMonths' },
                { header: 'Start Date', render: (item) => item.startDate ? new Date(item.startDate).toLocaleDateString() : '-' },
                { header: 'Status', render: (item) => item.isClosed ? <span className="text-red-600 font-bold">Closed</span> : <span className="text-green-600 font-bold">Active</span> }
            ]}
            formFields={[
                { name: 'name', label: 'Batch Name', required: true },
                { name: 'classId', label: 'Class', type: 'select', required: true, optionsEndpoint: '/core/classes', optionsLabel: 'name', optionsValue: '_id' },
                { name: 'durationMonths', label: 'Duration (Months)', type: 'number', required: true },
                { name: 'startDate', label: 'Start Date', type: 'date', required: true }
            ]}
        />
    );
};

export const SubjectsPage = () => (
    <CrudPage
        title="Subjects"
        endpoint="/core/subjects"
        roleAccess={['Admin', 'Teacher']}
        writeAccessRoles={['Admin']}
        transformEditData={(item) => ({
            ...item,
            classId: item.classId?._id || item.classId || ''
        })}
        columns={[
            { header: 'Name', accessor: 'name' },
            { header: 'Class ID', render: (item) => item.classId?.name || item.classId }
        ]}
        formFields={[
            { name: 'name', label: 'Subject Name', required: true },
            { name: 'classId', label: 'Class', type: 'select', required: true, optionsEndpoint: '/core/classes', optionsLabel: 'name', optionsValue: '_id' }
        ]}
    />
);
