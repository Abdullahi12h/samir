import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Get all teachers
export const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find({})
            .populate('user', 'name username phone whatsapp')
            .populate('subjects', 'name')
            .populate({
                path: 'subjectId',
                populate: { path: 'classId', select: 'name' }
            })
            .populate('skills', 'name')
            .populate('classIds', 'name');
        res.json(teachers);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Create a new teacher (Admin only)
export const createTeacher = async (req, res) => {
    try {
        const { name, username, password, phone, whatsapp, subjectId, subjects, salary, photo, cv, address, educationLevel, specialization, experience, gender, skills, classIds } = req.body;

        // Create user first
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        user = await User.create({ name, username, password, role: 'Teacher', phone, whatsapp });

        // Limit classIds and subjects to max 6
        const limitedClassIds = Array.isArray(classIds) ? classIds.slice(0, 6) : [];
        const limitedSubjects = Array.isArray(subjects) ? subjects.slice(0, 6) : [];

        const teacher = await Teacher.create({
            user: user._id,
            teacherId: `TCH-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`,
            subjectId,
            subjects: limitedSubjects,
            salary,
            photo, cv, address, educationLevel, specialization, experience, gender,
            plainPassword: password,
            skills,
            classIds: limitedClassIds
        });
        res.status(201).json(teacher);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

export const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (teacher) {
            await User.findByIdAndDelete(teacher.user);
            await teacher.deleteOne();
            res.json({ message: 'Teacher deleted along with user' });
        } else {
            res.status(404).json({ message: 'Teacher not found' });
        }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateTeacher = async (req, res) => {
    try {
        const { name, username, password, phone, whatsapp, subjectId, subjects, salary, photo, cv, address, educationLevel, specialization, experience, gender, skills, classIds } = req.body;

        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Update User info
        const user = await User.findById(teacher.user);
        if (user) {
            if (name) user.name = name;
            if (username) user.username = username;
            if (password) {
                user.password = password;
                teacher.plainPassword = password;
            }
            if (phone) user.phone = phone;
            if (whatsapp) user.whatsapp = whatsapp;
            await user.save();
        }

        // Update Teacher info
        teacher.subjectId = subjectId || teacher.subjectId;
        teacher.salary = salary || teacher.salary;
        teacher.photo = photo || teacher.photo;
        teacher.cv = cv || teacher.cv;
        teacher.address = address || teacher.address;
        teacher.educationLevel = educationLevel || teacher.educationLevel;
        teacher.specialization = specialization || teacher.specialization;
        teacher.experience = experience || teacher.experience;
        teacher.gender = gender || teacher.gender;
        teacher.skills = skills || teacher.skills;
        // Update classIds and subjects (limit to 5)
        if (Array.isArray(classIds)) {
            teacher.classIds = classIds.slice(0, 5);
        }
        if (Array.isArray(subjects)) {
            teacher.subjects = subjects.slice(0, 5);
        }

        await teacher.save();
        res.json(teacher);
    } catch (error) { res.status(400).json({ message: error.message }); }
};
