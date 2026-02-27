import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log(`[authUser] Login attempt for: ${username}`);
        const user = await User.findOne({ username });

        if (user && (await user.matchPassword(password))) {
            console.log(`[authUser] Login successful for: ${username}, role: ${user.role}`);

            let classIds = [];
            let skills = [];
            let subjects = [];

            if (user.role === 'Teacher') {
                const { default: Teacher } = await import('../models/Teacher.js');
                const teacherRec = await Teacher.findOne({ user: user._id });
                if (teacherRec) {
                    classIds = teacherRec.classIds || [];
                    skills = teacherRec.skills || [];
                    subjects = teacherRec.subjects || [];
                }
            }

            res.json({
                _id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                classIds,
                skills,
                subjects,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user (Admin use mainly, or simple setup)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const {
        name, username, password, role, phone, whatsapp,
        classId, batchId, skillId, registrationFee, amount, motherName, dateOfBirth, age, photo,
        subjectId, cv, address, educationLevel, specialization, experience, gender
    } = req.body;

    try {
        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            username,
            password,
            role: role || 'Student',
            phone,
            whatsapp
        });

        // If registering a Student, create link to Student collection and Fee
        if (user.role === 'Student') {
            const { default: Student } = await import('../models/Student.js');
            const student = await Student.create({
                user: user._id,
                enrollmentNo: `EN-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`, // Auto Generated
                classId,
                batchId,
                skillId,
                registrationFee,
                amount,
                motherName,
                dateOfBirth,
                age,
                photo,
                plainPassword: password
            });

            if (amount) {
                const { default: Fee } = await import('../models/Fee.js');
                await Fee.create({ studentId: student._id, amount, status: 'Paid' });
            }
        } else if (user.role === 'Teacher') {
            const { default: Teacher } = await import('../models/Teacher.js');
            await Teacher.create({
                user: user._id,
                teacherId: `TCH-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`, // Auto Generated
                subjectId,
                photo,
                cv,
                address,
                educationLevel,
                specialization,
                experience,
                gender,
                plainPassword: password
            });
        }

        if (user) {
            console.log(`[registerUser] User created: ${user.username}, role: ${user.role}`);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            console.error(`[registerUser] Failed to create user object`);
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(`[registerUser] Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.username = req.body.username || user.username;
            user.phone = req.body.phone || user.phone;
            user.whatsapp = req.body.whatsapp || user.whatsapp;

            if (req.body.password) {
                user.password = req.body.password;

                // If teacher, sync plainPassword
                if (user.role === 'Teacher') {
                    const { default: Teacher } = await import('../models/Teacher.js');
                    await Teacher.findOneAndUpdate({ user: user._id }, { plainPassword: req.body.password });
                } else if (user.role === 'Student') {
                    const { default: Student } = await import('../models/Student.js');
                    await Student.findOneAndUpdate({ user: user._id }, { plainPassword: req.body.password });
                }
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
