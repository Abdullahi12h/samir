import express from 'express';
import { getTeachers, createTeacher, deleteTeacher, updateTeacher } from '../controllers/teacherController.js';
import { getStudents, createStudent, deleteStudent, updateStudent, graduateStudents } from '../controllers/studentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// GET all users (Admin only)
router.get('/all', protect, admin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE a user (Admin only)
router.delete('/all/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.route('/teachers')
    .get(protect, getTeachers)
    .post(protect, admin, createTeacher);
router.route('/teachers/:id')
    .put(protect, admin, updateTeacher)
    .delete(protect, admin, deleteTeacher);

router.route('/students')
    .get(protect, getStudents)
    .post(protect, admin, createStudent);
router.route('/students/graduate')
    .post(protect, admin, graduateStudents);
router.route('/students/:id')
    .put(protect, admin, updateStudent)
    .delete(protect, admin, deleteStudent);

export default router;
