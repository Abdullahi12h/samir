import fs from 'fs';
import { parse } from '@babel/parser';

const files = [
    'frontend/src/pages/ManagementPages.jsx',
    'frontend/src/pages/StudentPaymentsPage.jsx',
    'frontend/src/pages/GraduatedStudentsReport.jsx',
    'frontend/src/pages/ReportsPage.jsx',
    'backend/controllers/managementController.js'
];

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        parse(content, {
            sourceType: 'module',
            plugins: ['jsx']
        });
        console.log(`${file}: OK`);
    } catch (e) {
        console.log(`${file}: ERROR at ${e.loc?.line}:${e.loc?.column} - ${e.message}`);
    }
});
