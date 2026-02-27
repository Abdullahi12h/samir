import CrudPage from '../components/CrudPage';

// --- Classes Page Config ---
const classesColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Skill', render: (item) => item.skillId?.name || item.skillId || '-' },
    { header: 'Description', accessor: 'description' },
    { header: 'Created', render: (item) => new Date(item.createdAt).toLocaleDateString() }
];

const classesFields = [
    { name: 'name', label: 'Class Name', required: true },
    { name: 'skillId', label: 'Skill', type: 'select', required: true, optionsEndpoint: '/core/skills', optionsLabel: 'name', optionsValue: '_id' },
    { name: 'description', label: 'Description' }
];

export const ClassesPage = () => (
    <CrudPage
        title="Classes"
        endpoint="/core/classes"
        roleAccess={['Admin']}
        transformEditData={(item) => ({
            ...item,
            skillId: item.skillId?._id || item.skillId || ''
        })}
        columns={classesColumns}
        formFields={classesFields}
    />
);

// --- Skill Categories Page Config ---
const skillCategoriesColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' }
];

const skillCategoriesFields = [
    { name: 'name', label: 'Category Name', required: true },
    { name: 'description', label: 'Description' }
];

export const SkillCategoriesPage = () => (
    <CrudPage
        title="Skill Categories"
        endpoint="/core/skill-categories"
        roleAccess={['Admin']}
        columns={skillCategoriesColumns}
        formFields={skillCategoriesFields}
    />
);
