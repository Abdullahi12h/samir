import Student from '../models/Student.js';
import User from '../models/User.js';
import Fee from '../models/Fee.js';

export const getStudents = async (req, res) => {
    try {
        const { status, batchId } = req.query;
        let query = {};
        if (status) query.status = status;
        if (batchId) query.batchId = batchId;

        // Teacher Restriction
        if (req.user.role === 'Teacher') {
            const { default: Teacher } = await import('../models/Teacher.js');
            const teacherRec = await Teacher.findOne({ user: req.user._id });
            if (teacherRec && teacherRec.classIds && teacherRec.classIds.length > 0) {
                query.classId = { $in: teacherRec.classIds };
            } else if (teacherRec) {
                // If teacher exists but has no classes, they see nothing
                return res.json([]);
            }
        }

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

        // Find the last student to determine the next actual sequential number
        const lastStudent = await Student.findOne().sort({ createdAt: -1 });
        let nextNumber = 1;

        if (lastStudent && lastStudent.enrollmentNo && lastStudent.enrollmentNo.startsWith('STU-')) {
            const lastNumStr = lastStudent.enrollmentNo.replace('STU-', '');
            const parsedNum = parseInt(lastNumStr, 10);
            if (!isNaN(parsedNum)) {
                nextNumber = parsedNum + 1;
            }
        } else {
            // Fallback in case there are only old formats or no students
            const studentCount = await Student.countDocuments();
            if (studentCount > 0) nextNumber = studentCount + 1;
        }

        const autoEnrollmentNo = `STU-${nextNumber.toString().padStart(4, '0')}`; // E.g., STU-0001

        const student = await Student.create({
            user: user._id,
            enrollmentNo: autoEnrollmentNo,
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

        // Create a Pending Fee record automatically for the student's first month
        if (amount) {
            console.log('[createStudent] Creating fee record...');
            const now = new Date();
            await Fee.create({ 
                studentId: student._id, 
                amount: Number(amount), 
                status: 'Pending',
                month: now.getMonth() + 1,
                year: now.getFullYear()
            });
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

        const oldAmount = student.amount;

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

        // Sync Amount change with Fee record if it changed
        if (amount !== undefined && Number(amount) !== oldAmount) {
            // Update the oldest Pending fee or the first fee if none pending
            const firstFee = await Fee.findOne({ studentId: student._id }).sort({ createdAt: 1 });
            if (firstFee) {
                firstFee.amount = Number(amount);
                await firstFee.save();
            }
        }

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
