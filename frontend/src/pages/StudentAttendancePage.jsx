import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const StudentAttendancePage = () => {
    const user = useAuthStore(state => state.user);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyAttendance = async () => {
            try {
                // The backend getResults/getAttendances usually handles role-based filtering
                // For attendance, let's assume we fetch all and filter or have a specific endpoint
                const res = await api.get('/management/attendances');
                setAttendance(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyAttendance();
    }, []);

    // Filter records for the current student (handled by backend or filtered here)
    // Assuming backend returns only student-relevant records if role is Student

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">My Attendance History</h2>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading your records...</div>
                ) : attendance.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No attendance records found yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Class</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {attendance.map(record => {
                                    const myRecord = record.records?.find(r => r.studentId?._id === user.studentId || r.studentId === user.studentId || r.studentId?.user === user._id);
                                    const status = myRecord?.status || 'Not Marked';

                                    return (
                                        <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {record.classId?.name || 'Class'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${status === 'Present' ? 'bg-green-100 text-green-800' :
                                                    status === 'Absent' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAttendancePage;
