import express from 'express';
import { getTeachers, createTeacher, deleteTeacher, updateTeacher } from '../controllers/teacherController.js';
import { getStudents, createStudent, deleteStudent, updateStudent, graduateStudents } from '../controllers/studentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

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
