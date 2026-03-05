import express from 'express';
import {
    getAssignments,
    createAssignment,
    deleteAssignment,
    submitAssignment,
    updateSubmission,
} from '../controllers/assignmentController.js';
import { protect, admin, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all assignments (everyone logged in can see)
router.route('/')
    .get(protect, getAssignments)
    .post(protect, teacherOrAdmin, createAssignment); // Admin or Teacher only

// Delete assignment (Admin/Teacher only)
router.route('/:id')
    .delete(protect, teacherOrAdmin, deleteAssignment);

// Student submits to an assignment
router.route('/:id/submit')
    .post(protect, submitAssignment);

// Admin/Teacher reviews a submission
router.route('/:id/submissions/:subId')
    .put(protect, teacherOrAdmin, updateSubmission);

export default router;
