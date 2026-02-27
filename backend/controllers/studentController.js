import Student from '../models/Student.js';
import User from '../models/User.js';
import Fee from '../models/Fee.js';

export const getStudents = async (req, res) => {
    try {
        const { status, batchId } = req.query;
        let query = {};
        if (status) query.status = status;
        if (batchId) query.batchId = batchId;

        const students = await Student.find(query).populate('user', 'name username phone whatsapp').populate('classId', 'name').populate('batchId', 'name').populate('skillId', 'name');
        res.json(students);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const createStudent = async (req, res) => {
    try {
        console.log('[createStudent] Received body:', JSON.stringify(req.body, null, 2));
        const { name, username, password, phone, whatsapp, classId, batchId, skillId, registrationFee, amount, photo, motherName, dateOfBirth, age } = req.body;

        let user = await User.findOne({ username });
        if (user) {
            console.log('[createStudent] User already exists:', username);
            return res.status(400).json({ message: 'User already exists' });
        }

        console.log('[createStudent] Creating user...');
        user = await User.create({ name, username, password, role: 'Student', phone, whatsapp });
        console.log('[createStudent] User created:', user._id);

        console.log('[createStudent] Creating student record...');
        const student = await Student.create({
            user: user._id,
            enrollmentNo: `EN-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`, // Auto generated
            classId,
            batchId,
            skillId,
            registrationFee,
            amount: Number(amount),
            photo,
            motherName,
            dateOfBirth,
            age,
            plainPassword: password
        });
        console.log('[createStudent] Student created:', student._id);

        // Let's also create a Fee record automatically for the student
        if (amount) {
            console.log('[createStudent] Creating fee record...');
            await Fee.create({ studentId: student._id, amount: Number(amount), status: 'Paid' });
            console.log('[createStudent] Fee record created.');
        }

        res.status(201).json(student);
    } catch (error) {
        console.error('[createStudent] ERROR:', error);
        res.status(400).json({ message: error.message });
    }
};

export const updateStudent = async (req, res) => {
    try {
        console.log('[updateStudent] Received body:', JSON.stringify(req.body, null, 2));
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const { name, username, password, phone, whatsapp, classId, batchId, skillId, registrationFee, amount, photo, motherName, dateOfBirth, age, isLocked } = req.body;

        const user = await User.findById(student.user);
        if (user) {
            user.name = name || user.name;
            user.username = username || user.username;
            if (password) user.password = password;
            user.phone = phone || user.phone;
            user.whatsapp = whatsapp || user.whatsapp;
            await user.save();
        }

        student.classId = classId || student.classId;
        student.batchId = batchId || student.batchId;
        student.skillId = skillId || student.skillId;
        student.registrationFee = registrationFee || student.registrationFee;
        student.amount = amount !== undefined ? Number(amount) : student.amount;
        student.photo = photo || student.photo;
        student.motherName = motherName || student.motherName;
        student.dateOfBirth = dateOfBirth || student.dateOfBirth;
        student.age = age !== undefined ? Number(age) : student.age;
        student.isLocked = isLocked !== undefined ? isLocked : student.isLocked;
        if (password) student.plainPassword = password;

        const updatedStudent = await student.save();
        console.log('[updateStudent] Student updated:', updatedStudent._id);
        res.json(updatedStudent);
    } catch (error) {
        console.error('[updateStudent] ERROR:', error);
        res.status(400).json({ message: error.message });
    }
};

export const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            await User.findByIdAndDelete(student.user);
            await student.deleteOne();
            res.json({ message: 'Student and related user deleted' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        console.error('[deleteStudent] ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

export const graduateStudents = async (req, res) => {
    try {
        const { studentIds, batchId } = req.body;
        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ message: 'No students provided' });
        }
        if (!batchId) {
            return res.status(400).json({ message: 'Target batch ID is required' });
        }

        await Student.updateMany(
            { _id: { $in: studentIds } },
            { $set: { status: 'Graduated', batchId: batchId } }
        );

        res.json({ message: 'Students successfully graduated' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
