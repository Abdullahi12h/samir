import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';
import { Save, AlertCircle, GraduationCap } from 'lucide-react';

const MarkEntryPage = () => {
    const [searchParams] = useSearchParams();
    const user = useAuthStore(state => state.user);
    const [classes, setClasses] = useState([]);
    const [skills, setSkills] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skillId') || '');
    const [selectedClass, setSelectedClass] = useState(searchParams.get('classId') || '');
    const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subjectId') || '');

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const isFetchingMetadata = React.useRef(false);

    useEffect(() => {
        if (isFetchingMetadata.current) return;
        isFetchingMetadata.current = true;

        // Fetch classes
        api.get('/core/classes').then(res => {
            let allClasses = res.data;
            if (user?.role === 'Teacher' && user?.classIds?.length > 0) {
                allClasses = allClasses.filter(c => user.classIds.includes(c._id));
            }
            setClasses(allClasses);
        }).catch(console.error);

        // Fetch skills
        api.get('/core/skills').then(res => {
            let allSkills = res.data;
            if (user?.role === 'Teacher' && user?.skills?.length > 0) {
                allSkills = allSkills.filter(s => user.skills.includes(s._id));
            }
            setSkills(allSkills);
        }).catch(console.error);

        // Fetch subjects
        api.get('/core/subjects').then(res => {
            let allSubjects = res.data;
            if (user?.role === 'Teacher' && user?.subjects?.length > 0) {
                allSubjects = allSubjects.filter(s => user.subjects.includes(s._id));
            }
            setSubjects(allSubjects);

            // AUTO-SELECT first subject for teacher if none selected AND not in URL
            if (user?.role === 'Teacher' && allSubjects.length > 0 && !selectedSubject) {
                setSelectedSubject(allSubjects[0]._id);
            }
        }).catch(console.error).finally(() => {
            isFetchingMetadata.current = false;
        });
    }, [user?._id]);

    const loadStudents = async () => {
        if (!selectedSkill || !selectedClass || !selectedSubject) return;
        setLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            const res = await api.get('/management/exams/consolidated-students', {
                params: { skillId: selectedSkill, classId: selectedClass, subjectId: selectedSubject }
            });
            setStudents(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error loading students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedSkill && selectedClass && selectedSubject) loadStudents();
        else setStudents([]);
    }, [selectedSkill, selectedClass, selectedSubject]);

    const handleMarkChange = (studentId, field, value) => {
        const numValue = Number(value);
        const limits = { midterm: 40, test: 20, final: 40 };

        if (numValue > limits[field]) {
            setError(`${field.toUpperCase()} cannot exceed ${limits[field]} points!`);
            return;
        }
        setError('');

        setStudents(prev => prev.map(s => {
            if (s._id === studentId) {
                const updated = { ...s, [field]: value };
                // Calculate total dynamically on the frontend too for display
                updated.total = (Number(updated.midterm) || 0) + (Number(updated.test) || 0) + (Number(updated.final) || 0);
                return updated;
            }
            return s;
        }));
    };

    const handleSaveResults = async () => {
        try {
            setError('');
            setSuccessMsg('');

            // Final safety check before save
            const invalidEntry = students.find(s =>
                (Number(s.midterm) > 40) || (Number(s.test) > 20) || (Number(s.final) > 40)
            );

            if (invalidEntry) {
                setError(`Invalid marks detected for ${invalidEntry.user?.name}. Please check the limits.`);
                return;
            }

            const payload = {
                skillId: selectedSkill,
                classId: selectedClass,
                subjectId: selectedSubject,
                results: students.filter(s => !s.hasUnpaidFees).map(s => ({
                    studentId: s._id,
                    midterm: s.midterm,
                    test: s.test,
                    final: s.final
                }))
            };

            await api.post('/management/exams/bulk-results', payload);
            setSuccessMsg('All marks saved successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save results');
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 uppercase tracking-tight">Consolidated Exam Marks</h2>

            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row flex-wrap gap-4 items-stretch md:items-end">
                <div className="flex flex-col flex-1 min-w-[200px]">
                    <label className="text-sm font-bold text-slate-600 mb-1">Skill (Xirfad)</label>
                    <select
                        className="p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                        value={selectedSkill}
                        onChange={(e) => setSelectedSkill(e.target.value)}
                    >
                        <option value="">-- Choose Skill --</option>
                        {skills.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col flex-1 min-w-[200px]">
                    <label className="text-sm font-bold text-slate-600 mb-1">Class</label>
                    <select
                        className="p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="">-- Choose Class --</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col flex-1 min-w-[200px]">
                    <label className="text-sm font-bold text-slate-600 mb-1">Subject (Maado)</label>
                    <select
                        className="p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        <option value="">-- Choose Subject --</option>
                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            {error && <div className="p-4 bg-red-100 text-red-700 rounded-xl border border-red-200 shadow-sm font-medium">{error}</div>}
            {successMsg && <div className="p-4 bg-green-100 text-green-700 rounded-xl border border-green-200 shadow-sm font-medium">{successMsg}</div>}

            {selectedSubject && selectedClass && selectedSkill && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500 font-medium italic">Loading students & results...</div>
                    ) : students.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 font-medium italic">No students found for this selection.</div>
                    ) : (
                        <div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 border-b border-slate-100">STUDENT NAME</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 border-b border-slate-100">FEES</th>
                                            <th className="px-3 py-4 text-center text-xs font-bold text-slate-400 border-b border-slate-100">MID-TERM (40)</th>
                                            <th className="px-3 py-4 text-center text-xs font-bold text-slate-400 border-b border-slate-100">TEST (20)</th>
                                            <th className="px-3 py-4 text-center text-xs font-bold text-slate-400 border-b border-slate-100">FINAL (40)</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 border-b border-slate-100">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-50">
                                        {students.map(student => (
                                            <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-slate-800">{student.user?.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-mono">{student.enrollmentNo}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {student.hasUnpaidFees ? (
                                                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-50 text-rose-600 border border-rose-100">BLOCK</span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">CLEAR</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-center">
                                                    <input
                                                        type="number"
                                                        disabled={student.hasUnpaidFees}
                                                        className="w-16 p-2 text-center text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-300 font-bold bg-white"
                                                        value={student.midterm || 0}
                                                        onChange={(e) => handleMarkChange(student._id, 'midterm', e.target.value)}
                                                        min="0" max="40"
                                                    />
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-center">
                                                    <input
                                                        type="number"
                                                        disabled={student.hasUnpaidFees}
                                                        className="w-16 p-2 text-center text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-300 font-bold bg-white"
                                                        value={student.test || 0}
                                                        onChange={(e) => handleMarkChange(student._id, 'test', e.target.value)}
                                                        min="0" max="20"
                                                    />
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-center">
                                                    <input
                                                        type="number"
                                                        disabled={student.hasUnpaidFees}
                                                        className="w-16 p-2 text-center text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-300 font-bold bg-white"
                                                        value={student.final || 0}
                                                        onChange={(e) => handleMarkChange(student._id, 'final', e.target.value)}
                                                        min="0" max="40"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`text-sm font-black ${student.total >= 50 ? 'text-indigo-600' : 'text-rose-500'}`}>
                                                        {student.total || 0}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                                <p className="text-xs text-slate-400 font-medium italic">* Only students with cleared fees can have marks entered.</p>
                                <button
                                    onClick={handleSaveResults}
                                    className="flex items-center px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-md shadow-indigo-100 active:scale-95"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Consolidated Results
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MarkEntryPage;
