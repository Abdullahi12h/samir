import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Save, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const DailyAttendancePage = () => {
    const user = useAuthStore(state => state.user);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Today's date
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        api.get('/core/classes').then(res => {
            let allItems = res.data;
            if (user?.role === 'Teacher' && user?.classIds?.length > 0) {
                allItems = allItems.filter(c => user.classIds.includes(c._id));
            }
            setClasses(allItems);
        }).catch(console.error);
    }, [user?._id]);

    const fetchAttendance = async () => {
        if (!selectedClass || !date) return;
        setLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            const res = await api.get(`/management/attendances/daily?classId=${selectedClass}&date=${date}`);
            setRecords(res.data.records || []);

            // Check lock status
            if (res.data.createdAt && user.role !== 'Admin') {
                const now = new Date();
                const diffHours = (now - new Date(res.data.createdAt)) / (1000 * 60 * 60);
                setIsLocked(diffHours > 24);
            } else {
                setIsLocked(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error loading records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [selectedClass, date]);

    const handleStatusChange = (studentId, status) => {
        if (isLocked) return;
        setRecords(prev => prev.map(r =>
            (r.studentId?._id === studentId || r.studentId === studentId)
                ? { ...r, status }
                : r
        ));
    };

    const handleSave = async () => {
        try {
            setError('');
            setSuccessMsg('');
            const payload = {
                classId: selectedClass,
                date,
                records: records.map(r => ({
                    studentId: r.studentId?._id || r.studentId,
                    status: r.status
                }))
            };
            await api.post('/management/attendances/daily', payload);
            setSuccessMsg('Attendance saved successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
            fetchAttendance();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save attendance');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Daily Attendance</h2>
                <div className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium text-slate-600">
                    Date: {new Date(date).toLocaleDateString()}
                </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-slate-700 mb-1">Select Class</label>
                    <select
                        className="p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="">-- Choose Class --</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-slate-700 mb-1">Attendance Date</label>
                    <input
                        type="date"
                        className="p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none w-full"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>
            </div>

            {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">{error}</div>}
            {successMsg && <div className="p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">{successMsg}</div>}

            {isLocked && (
                <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Attendance for this date is locked (passed 24h). Only Admins can modify it.
                </div>
            )}

            {selectedClass && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Loading students...</div>
                    ) : records.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No students found for this class.</div>
                    ) : (
                        <div>
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Mark</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {records.map(record => {
                                        const student = record.studentId;
                                        return (
                                            <tr key={student?._id || record.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-slate-800">
                                                    {student?.user?.name || 'Unknown Student'}
                                                </td>
                                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center text-[10px] sm:text-xs">
                                                    <span className={`px-2 py-1 font-bold rounded-full ${record.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {(record.status || 'Unknown').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right space-x-1 sm:space-x-2">
                                                    <button
                                                        disabled={isLocked}
                                                        onClick={() => handleStatusChange(student?._id, 'Present')}
                                                        className={`p-2 rounded-lg transition-colors ${record.status === 'Present'
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-slate-100 text-slate-400 hover:bg-green-50 hover:text-green-600'
                                                            } disabled:opacity-50`}
                                                        title="Mark Present"
                                                    >
                                                        <CheckCircle className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        disabled={isLocked}
                                                        onClick={() => handleStatusChange(student?._id, 'Absent')}
                                                        className={`p-2 rounded-lg transition-colors ${record.status === 'Absent'
                                                            ? 'bg-red-600 text-white'
                                                            : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600'
                                                            } disabled:opacity-50`}
                                                        title="Mark Absent"
                                                    >
                                                        <XCircle className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {!isLocked && (
                                <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex justify-center sm:justify-end">
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center px-6 sm:px-8 py-2 sm:py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-200"
                                    >
                                        <Save className="w-5 h-5 mr-2" />
                                        Save Attendance
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DailyAttendancePage;
