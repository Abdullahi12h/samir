import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';
import { Lock, Mail, User } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Student');
    const [phone, setPhone] = useState('');
    const [whatsapp, setWhatsapp] = useState('');

    // Student specific fields
    const [classId, setClassId] = useState('');
    const [batchId, setBatchId] = useState('');
    const [skillId, setSkillId] = useState('');
    const [registrationFee, setRegistrationFee] = useState('');
    const [amount, setAmount] = useState('');
    const [motherName, setMotherName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [age, setAge] = useState('');
    const [photo, setPhoto] = useState(null);

    // Teacher specific fields
    const [subjectId, setSubjectId] = useState('');
    const [cv, setCv] = useState(null);
    const [address, setAddress] = useState('');
    const [educationLevel, setEducationLevel] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [experience, setExperience] = useState('');
    const [gender, setGender] = useState('');
    const [salary, setSalary] = useState('');

    // Dynamic dropdown data
    const [classes, setClasses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [skills, setSkills] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // Fetch lookup data
    useEffect(() => {
        const fetchLookups = async () => {
            try {
                const [classesRes, batchesRes, skillsRes, subjectsRes] = await Promise.all([
                    api.get('/core/classes'),
                    api.get('/core/batches'),
                    api.get('/core/skills'),
                    api.get('/core/subjects')
                ]);
                setClasses(classesRes.data);
                setBatches(batchesRes.data);
                setSkills(skillsRes.data);
                setSubjects(subjectsRes.data);
            } catch (err) {
                console.error("Error fetching lookup data:", err);
            }
        };
        fetchLookups();
    }, []);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Upload photo if exists
            let photoUrl = '';
            if (photo) {
                const formData = new FormData();
                formData.append('file', photo);
                const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                photoUrl = res.data.file;
            }

            // Upload CV if exists
            let cvUrl = '';
            if (cv) {
                const formData = new FormData();
                formData.append('file', cv);
                const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                cvUrl = res.data.file;
            }

            // 1. Register the user
            await api.post('/auth/register', {
                name, username, password, role,
                phone, whatsapp,
                classId,
                batchId,
                skillId,
                registrationFee,
                amount: amount ? Number(amount) : undefined,
                motherName,
                dateOfBirth,
                age: age ? Number(age) : undefined,
                photo: photoUrl,
                subjectId,
                cv: cvUrl,
                address,
                educationLevel,
                specialization,
                experience: experience ? Number(experience) : undefined,
                gender,
                salary: salary ? Number(salary) : undefined
            });

            // 2. Automatically log them in
            const result = await login(username, password);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-2xl transform transition-all">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Al-Hafid Skills
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Create a new account
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                            {error}
                        </div>
                    )}
                    <div className="rounded-md shadow-sm space-y-4">

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <input
                                type="number"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-shadow"
                                placeholder="Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <input
                                type="number"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-shadow"
                                placeholder="WhatsApp Number"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <select
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="Student">Register As Student</option>
                                <option value="Teacher">Register As Teacher</option>
                                <option value="Admin">Register As Admin</option>
                            </select>
                        </div>

                        {role === 'Student' && (
                            <div className="space-y-4 pt-2 border-t border-slate-200 mt-4">
                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Student Details</h3>

                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-shadow"
                                        placeholder="Mother's Name"
                                        value={motherName}
                                        onChange={(e) => setMotherName(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block text-xs text-slate-500 mb-1 ml-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        required
                                        className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-shadow"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-shadow"
                                        placeholder="Age"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block text-xs text-slate-500 mb-1 ml-1">Student Photo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm bg-white"
                                        onChange={(e) => setPhoto(e.target.files[0])}
                                    />
                                </div>


                                <div className="relative">
                                    <select
                                        required
                                        className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm bg-white"
                                        value={classId}
                                        onChange={(e) => setClassId(e.target.value)}
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map((c) => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="relative">
                                    <select
                                        required
                                        className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm bg-white"
                                        value={batchId}
                                        onChange={(e) => setBatchId(e.target.value)}
                                    >
                                        <option value="">Select Batch</option>
                                        {batches.map((b) => (
                                            <option key={b._id} value={b._id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="relative">
                                    <select
                                        required
                                        className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm bg-white"
                                        value={skillId}
                                        onChange={(e) => setSkillId(e.target.value)}
                                    >
                                        <option value="">Select Skill</option>
                                        {skills.map((s) => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="relative">
                                    <select
                                        required
                                        className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm bg-white"
                                        value={registrationFee}
                                        onChange={(e) => setRegistrationFee(e.target.value)}
                                    >
                                        <option value="">Select Registration Fee Type</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Discounted">Discounted</option>
                                        <option value="Scholarship">Scholarship</option>
                                    </select>
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {role === 'Teacher' && (
                            <div className="space-y-4 pt-2 border-t border-slate-200 mt-4">
                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Teacher Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <select
                                            required
                                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm bg-white"
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <select
                                            required
                                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm bg-white"
                                            value={subjectId}
                                            onChange={(e) => setSubjectId(e.target.value)}
                                        >
                                            <option value="">Select Primary Subject</option>
                                            {subjects.map((s) => (
                                                <option key={s._id} value={s._id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <select
                                            required
                                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm bg-white"
                                            value={educationLevel}
                                            onChange={(e) => setEducationLevel(e.target.value)}
                                        >
                                            <option value="">Education Level</option>
                                            <option value="Bachelor">Bachelor</option>
                                            <option value="Master">Master</option>
                                            <option value="PhD">PhD</option>
                                            <option value="Diploma">Diploma</option>
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-shadow"
                                            placeholder="Specialization (e.g. Mathematics)"
                                            value={specialization}
                                            onChange={(e) => setSpecialization(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-shadow"
                                            placeholder="Years of Experience"
                                            value={experience}
                                            onChange={(e) => setExperience(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-shadow"
                                            placeholder="Home Address"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-shadow"
                                            placeholder="Salary (Optional)"
                                            value={salary}
                                            onChange={(e) => setSalary(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="block text-xs text-slate-500 mb-1 ml-1">Teacher Photo</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm bg-white"
                                            onChange={(e) => setPhoto(e.target.files[0])}
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="block text-xs text-slate-500 mb-1 ml-1">Upload CV (PDF/Doc)</label>
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm bg-white"
                                            onChange={(e) => setCv(e.target.files[0])}
                                        />
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 shadow-md"
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        Already have an account? Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
