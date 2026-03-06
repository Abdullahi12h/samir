import { useState, useEffect, useCallback } from 'react';
import {
    ClipboardList, Plus, Trash2, Send, ExternalLink,
    ChevronDown, ChevronUp, User, Link2, CheckCircle,
    Clock, Award, X, RefreshCw, BookOpen
} from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';

/* ─── helpers ─────────────────────────────────────────────────── */
const statusColor = (s) => ({
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    Reviewed: 'bg-blue-100 text-blue-700 border-blue-200',
    Graded: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}[s] || 'bg-slate-100 text-slate-600');

const statusIcon = (s) => ({
    Pending: <Clock className="h-3 w-3" />,
    Reviewed: <CheckCircle className="h-3 w-3" />,
    Graded: <Award className="h-3 w-3" />,
}[s] || null);

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/* ─── Sub‑components ─────────────────────────────────────────── */

/** Card shown to students — lets them fill in name + link then submit */
const StudentSubmitCard = ({ assignment, onSubmitted, alreadySubmitted }) => {
    const user = useAuthStore(s => s.user);
    const [name, setName] = useState(user?.name || '');
    const [link, setLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !link.trim()) { setMsg({ type: 'err', text: 'Please fill all fields.' }); return; }
        setLoading(true);
        try {
            await api.post(`/assignments/${assignment._id}/submit`, {
                studentName: name.trim(),
                submissionLink: link.trim(),
            });
            setMsg({ type: 'ok', text: 'Assignment submitted successfully! ✅' });
            setLink('');
            setShowForm(false);
            onSubmitted?.();
        } catch (err) {
            setMsg({ type: 'err', text: err.response?.data?.message || 'Submission failed.' });
        } finally {
            setLoading(false);
        }
    };

    const mySubmission = assignment.submissions?.find(s => String(s.studentId) === String(user?._id));
    const isGraded = mySubmission?.status === 'Graded';
    const isReviewed = mySubmission?.status === 'Reviewed';
    const hasTeacherResponse = mySubmission && (mySubmission.grade || mySubmission.feedback || isReviewed || isGraded);

    // Card border color based on state
    const cardBorder = isGraded
        ? 'border-emerald-300 ring-1 ring-emerald-200'
        : isReviewed
            ? 'border-blue-200'
            : alreadySubmitted
                ? 'border-amber-200'
                : 'border-slate-100';

    return (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden animate-fadeIn ${cardBorder}`}>

            {/* Grade banner — shown prominently at very top if graded */}
            {isGraded && mySubmission?.grade && (
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-5 py-2.5 flex items-center justify-between">
                    <span className="text-white text-xs font-bold flex items-center gap-1.5">
                        <Award className="h-4 w-4" /> Macalinku jawaab buu ku celiyay!
                    </span>
                    <span className="bg-white text-emerald-700 font-black text-sm px-3 py-0.5 rounded-lg shadow">
                        Grade: {mySubmission.grade}
                    </span>
                </div>
            )}
            {isReviewed && !isGraded && (
                <div className="bg-blue-500 px-5 py-2 flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-white" />
                    <span className="text-white text-xs font-bold">Macalinku wuu eegay gudbintaada</span>
                </div>
            )}

            {/* Main card header */}
            <div className="flex items-start justify-between p-5 gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="h-4 w-4 text-indigo-500 shrink-0" />
                        <h3 className="font-bold text-slate-800 text-base truncate">{assignment.title}</h3>
                    </div>
                    {assignment.description && (
                        <p className="text-xs text-slate-500 mb-1 line-clamp-2">{assignment.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-1.5">
                        {assignment.subject && (
                            <span className="text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                                {assignment.subject}
                            </span>
                        )}
                        {assignment.dueDate && (
                            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                                Due: {fmtDate(assignment.dueDate)}
                            </span>
                        )}
                        {assignment.teacherName && (
                            <span className="text-[10px] font-bold bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-100">
                                👤 {assignment.teacherName}
                            </span>
                        )}
                        {mySubmission && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusColor(mySubmission.status)}`}>
                                {statusIcon(mySubmission.status)}{mySubmission.status}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action button */}
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${alreadySubmitted
                        ? 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                        : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                        }`}
                >
                    {showForm ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    {showForm ? 'Xir' : alreadySubmitted ? 'Wax ka beddel' : 'Gudbi'}
                </button>
            </div>

            {/* ── TEACHER RESPONSE SECTION — Always visible when there's a response ── */}
            {hasTeacherResponse && (
                <div className={`mx-5 mb-4 rounded-2xl border overflow-hidden ${isGraded ? 'border-emerald-200 bg-emerald-50/60' : 'border-blue-100 bg-blue-50/40'
                    }`}>
                    {/* Response header */}
                    <div className={`flex items-center justify-between px-4 py-2.5 border-b ${isGraded ? 'border-emerald-100 bg-emerald-50' : 'border-blue-100 bg-blue-50'
                        }`}>
                        <span className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isGraded ? 'text-emerald-700' : 'text-blue-700'
                            }`}>
                            <Award className="h-3.5 w-3.5" />
                            Jawaabta Macalinka (Teacher's Response)
                        </span>
                        <div className="flex items-center gap-2">
                            {mySubmission.grade && (
                                <span className={`text-xs font-black px-2.5 py-1 rounded-lg shadow-sm ${isGraded
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-blue-600 text-white'
                                    }`}>
                                    ✏️ {mySubmission.grade}
                                </span>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(mySubmission.status)}`}>
                                {mySubmission.status}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        {/* Grade row */}
                        {mySubmission.grade && (
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Award className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Dhibcahaaga (Your Grade)</p>
                                    <p className="text-xl font-black text-emerald-700">{mySubmission.grade}</p>
                                </div>
                            </div>
                        )}

                        {/* Feedback */}
                        {mySubmission.feedback ? (
                            <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    💬 Faallada Macalinka (Feedback)
                                </p>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                                    "{mySubmission.feedback}"
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">Macalinku faallo ma bixin wali.</p>
                        )}

                        {/* Submission info */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                            <span>Submitted: {fmtDate(mySubmission.submittedAt)}</span>
                            {mySubmission.submissionLink && (
                                <a
                                    href={mySubmission.submissionLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-blue-500 hover:text-blue-700 font-semibold hover:underline"
                                >
                                    <ExternalLink className="h-3 w-3" /> My Submission
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Pending submission notice */}
            {alreadySubmitted && !hasTeacherResponse && (
                <div className="mx-5 mb-4 flex items-center gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-amber-700">Gudbintaada waxaa la sugayaa jawaabta macalinka</p>
                        <p className="text-[10px] text-amber-600 mt-0.5">
                            Submitted: {fmtDate(mySubmission?.submittedAt)}
                            {mySubmission?.submissionLink && (
                                <a href={mySubmission.submissionLink} target="_blank" rel="noreferrer" className="ml-2 text-blue-500 hover:underline inline-flex items-center gap-0.5">
                                    <ExternalLink className="h-2.5 w-2.5" /> View
                                </a>
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* Submit / Resubmit Form */}
            {showForm && (
                <div className="border-t border-slate-100 bg-slate-50 p-5">
                    <form onSubmit={submit} className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                <User className="h-3 w-3 inline mr-1" />Magacaaga (Student Name)
                            </label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Magacaaga buuxa..."
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                <Link2 className="h-3 w-3 inline mr-1" />Assignment Link (Google Drive, GitHub, etc.)
                            </label>
                            <input
                                value={link}
                                onChange={e => setLink(e.target.value)}
                                placeholder="https://..."
                                type="url"
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                        {msg && (
                            <div className={`text-xs px-3 py-2 rounded-lg ${msg.type === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                {msg.text}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60"
                            >
                                <Send className="h-4 w-4" />
                                {loading ? 'Gudbinaya...' : alreadySubmitted ? 'Update Submission' : 'Submit Assignment'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};



/** Submission list shown to Admin/Teacher within an assignment card */
const SubmissionsList = ({ assignment, onGraded }) => {
    const [gradeData, setGradeData] = useState({});
    const [saving, setSaving] = useState(null);

    const handleGrade = async (subId) => {
        const d = gradeData[subId] || {};
        setSaving(subId);
        try {
            await api.put(`/assignments/${assignment._id}/submissions/${subId}`, {
                status: d.status || 'Reviewed',
                grade: d.grade || '',
                feedback: d.feedback || '',
            });
            onGraded?.();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving grade');
        } finally {
            setSaving(null);
        }
    };

    if (!assignment.submissions?.length) {
        return <p className="text-xs text-slate-400 italic py-2 px-4">No submissions yet.</p>;
    }

    return (
        <div className="divide-y divide-slate-50">
            {assignment.submissions.map(sub => (
                <div key={sub._id} className="px-5 py-4">
                    <div className="flex flex-wrap items-start gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                    {sub.studentName?.[0]?.toUpperCase() || 'S'}
                                </div>
                                <span className="font-semibold text-slate-800 text-sm">{sub.studentName}</span>
                                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(sub.status)}`}>
                                    {statusIcon(sub.status)}{sub.status}
                                </span>
                                {sub.grade && (
                                    <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full">
                                        Grade: {sub.grade}
                                    </span>
                                )}
                            </div>
                            <a
                                href={sub.submissionLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                                <ExternalLink className="h-3 w-3" />
                                View Submission
                            </a>
                            <span className="ml-3 text-[10px] text-slate-400">{fmtDate(sub.submittedAt)}</span>
                            {sub.feedback && (
                                <p className="mt-1 text-xs text-slate-500 italic">"{sub.feedback}"</p>
                            )}
                        </div>

                        {/* Quick grade panel */}
                        <div className="flex flex-wrap items-center gap-3 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 w-full lg:w-auto">
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Status</label>
                                <select
                                    value={gradeData[sub._id]?.status ?? sub.status}
                                    onChange={e => setGradeData(p => ({ ...p, [sub._id]: { ...p[sub._id], status: e.target.value } }))}
                                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 min-w-[100px]"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Reviewed">Reviewed</option>
                                    <option value="Graded">Graded</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Grade</label>
                                <input
                                    value={gradeData[sub._id]?.grade ?? (sub.grade || '')}
                                    onChange={e => setGradeData(p => ({ ...p, [sub._id]: { ...p[sub._id], grade: e.target.value } }))}
                                    placeholder="Score / Grade"
                                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 w-24 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                            </div>
                            <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Feedback</label>
                                <input
                                    value={gradeData[sub._id]?.feedback ?? (sub.feedback || '')}
                                    onChange={e => setGradeData(p => ({ ...p, [sub._id]: { ...p[sub._id], feedback: e.target.value } }))}
                                    placeholder="Add constructive feedback..."
                                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                            </div>
                            <button
                                onClick={() => handleGrade(sub._id)}
                                disabled={saving === sub._id}
                                className="self-end mb-0.5 flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg transition-all shadow-sm shadow-emerald-100 active:scale-95 disabled:opacity-60"
                            >
                                <CheckCircle className="h-3 w-3" />
                                {saving === sub._id ? 'Saving…' : 'Update Assessment'}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

/** Full card for Admin/Teacher view */
const AdminAssignmentCard = ({ assignment, onDeleted, onRefresh }) => {
    const [expanded, setExpanded] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm(`Delete assignment "${assignment.title}"?`)) return;
        setDeleting(true);
        try {
            await api.delete(`/assignments/${assignment._id}`);
            onDeleted?.();
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed');
            setDeleting(false);
        }
    };

    const submissionCount = assignment.submissions?.length || 0;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-start justify-between p-5 gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <ClipboardList className="h-4 w-4 text-indigo-500 shrink-0" />
                        <h3 className="font-bold text-slate-800 text-base truncate">{assignment.title}</h3>
                    </div>
                    {assignment.description && (
                        <p className="text-xs text-slate-500 mb-2">{assignment.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-1">
                        {assignment.subject && (
                            <span className="text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                                {assignment.subject}
                            </span>
                        )}
                        {assignment.dueDate && (
                            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                                Due: {fmtDate(assignment.dueDate)}
                            </span>
                        )}
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            {submissionCount} submission{submissionCount !== 1 ? 's' : ''}
                        </span>
                        {assignment.teacherName && (
                            <span className="text-[10px] font-bold bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-100">
                                Teacher: {assignment.teacherName}
                            </span>
                        )}
                        {assignment.className && (
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                                Class: {assignment.className}
                            </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium">By {assignment.createdByName}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        {expanded ? 'Hide' : 'View Submissions'}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete assignment"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-slate-100">
                    <SubmissionsList assignment={assignment} onGraded={onRefresh} />
                </div>
            )}
        </div>
    );
};

/* ─── Create Assignment Modal ─────────────────────────────────── */
const CreateModal = ({ onClose, onCreated }) => {
    const user = useAuthStore(s => s.user);
    const isStaff = user?.role === 'Admin' || user?.role === 'Teacher';

    const [form, setForm] = useState({
        title: '',
        description: '',
        subject: '',
        dueDate: '',
        teacherId: '',
        teacherName: '',
        classId: '',
        className: ''
    });
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    useEffect(() => {
        // Admin can assign to any teacher; Teacher auto-assigns to themselves
        if (user?.role === 'Admin') {
            api.get('/users/teachers').then(res => setTeachers(res.data)).catch(console.error);
        } else if (user?.role === 'Teacher') {
            // Pre-fill the teacher fields with logged-in teacher's own info
            setForm(p => ({ ...p, teacherId: user._id, teacherName: user.name || '' }));
        }
        api.get('/core/classes').then(res => setClasses(res.data)).catch(console.error);
    }, [user]);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleTeacherChange = (e) => {
        const userId = e.target.value;
        const name = teachers.find(t => t.user?._id === userId)?.user?.name || '';
        setForm(p => ({ ...p, teacherId: userId, teacherName: name }));
    };

    const handleClassChange = (e) => {
        const id = e.target.value;
        const name = classes.find(c => c._id === id)?.name || '';
        setForm(p => ({ ...p, classId: id, className: name }));
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { setErr('Title is required.'); return; }
        setLoading(true); setErr('');
        try {
            await api.post('/assignments', form);
            onCreated?.();
            onClose?.();
        } catch (e) {
            setErr(e.response?.data?.message || 'Failed to create.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 flex items-center justify-between">
                    <h2 className="text-white font-bold text-lg flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" /> New Assignment
                    </h2>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                            Assignment Title *
                        </label>
                        <input
                            value={form.title}
                            onChange={e => set('title', e.target.value)}
                            placeholder="e.g. Chapter 3 Exercise"
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    {user?.role === 'Admin' ? (
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                Assign to Teacher
                            </label>
                            <select
                                value={form.teacherId}
                                onChange={handleTeacherChange}
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                            >
                                <option value="">Select Teacher (Optional)</option>
                                {teachers.map(t => (
                                    <option key={t._id} value={t.user?._id}>{t.user?.name || 'Staff'}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 font-semibold">
                            👤 Assignment-kan magacaaga ({user?.name}) ayaa ku diiwaan-galinaysa
                        </div>
                    )}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                            Target Class
                        </label>
                        <select
                            value={form.classId}
                            onChange={handleClassChange}
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                        >
                            <option value="">Public (All Students)</option>
                            {classes.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                            Subject
                        </label>
                        <input
                            value={form.subject}
                            onChange={e => set('subject', e.target.value)}
                            placeholder="e.g. Mathematics"
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={e => set('description', e.target.value)}
                            placeholder="Instructions, details..."
                            rows={3}
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                            Due Date
                        </label>
                        <input
                            type="date"
                            value={form.dueDate}
                            onChange={e => set('dueDate', e.target.value)}
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    {err && (
                        <div className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg">
                            {err}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <Plus className="h-4 w-4" />
                        {loading ? 'Creating...' : 'Create Assignment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

/* ─── MAIN PAGE ───────────────────────────────────────────────── */
export default function AssignmentPage() {
    const user = useAuthStore(s => s.user);
    const role = user?.role;
    const isStaff = role === 'Admin' || role === 'Teacher';

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/assignments');
            setAssignments(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // Track which assignments the current student has already submitted to
    const submitted = new Set(
        assignments
            .filter(a => a.submissions?.some(s => String(s.studentId) === String(user?._id)))
            .map(a => a._id)
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <ClipboardList className="h-7 w-7 text-indigo-500" />
                        Assignments
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {isStaff
                            ? 'Create assignments and review student submissions'
                            : 'Submit your completed assignments below'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={load}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <RefreshCw className="h-3.5 w-3.5" /> Refresh
                    </button>
                    {isStaff && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
                        >
                            <Plus className="h-4 w-4" /> New Assignment
                        </button>
                    )}
                </div>
            </div>

            {/* Stats row (staff only) */}
            {isStaff && !loading && (
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total', value: assignments.length, color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
                        { label: 'Total Submissions', value: assignments.reduce((s, a) => s + (a.submissions?.length || 0), 0), color: 'bg-amber-50 text-amber-700 border-amber-100' },
                        { label: 'Graded', value: assignments.reduce((s, a) => s + (a.submissions?.filter(sub => sub.status === 'Graded').length || 0), 0), color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className={`rounded-2xl border px-4 py-3 text-center ${color}`}>
                            <div className="text-2xl font-black">{value}</div>
                            <div className="text-[10px] font-bold uppercase tracking-wide opacity-70">{label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                        <div className="h-8 w-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Loading assignments...</span>
                    </div>
                </div>
            ) : assignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <ClipboardList className="h-14 w-14 text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium">No assignments yet.</p>
                    {isStaff && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="mt-4 flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
                        >
                            <Plus className="h-4 w-4" /> Create First Assignment
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {assignments.map(a =>
                        isStaff ? (
                            <AdminAssignmentCard
                                key={a._id}
                                assignment={a}
                                onDeleted={load}
                                onRefresh={load}
                            />
                        ) : (
                            <StudentSubmitCard
                                key={a._id}
                                assignment={a}
                                onSubmitted={load}
                                alreadySubmitted={submitted.has(a._id)}
                            />
                        )
                    )}
                </div>
            )}

            {/* Create modal */}
            {showModal && (
                <CreateModal onClose={() => setShowModal(false)} onCreated={load} />
            )}
        </div>
    );
}
