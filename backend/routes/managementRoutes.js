import express from 'express';
import {
    getExpenses, createExpense, updateExpense, deleteExpense,
    getFees, createFee, updateFee, deleteFee,
    getAttendances, createAttendance, updateAttendance, deleteAttendance, getDailyAttendance, submitDailyAttendance,
    getExams, createExam, updateExam, deleteExam, toggleExamStatus, bulkToggleExamStatus, getStudentsForExam, bulkSubmitResults, getStudentsForConsolidatedEntry,
    getResults, createResult, updateResult, deleteResult, bulkToggleStudentResults,
    getFinancialReport, getGeneralReport,
    getSalaries, paySalary,
    getStudentPayments, createStudentPayment
} from '../controllers/managementController.js';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, admin, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/expenses').get(protect, admin, getExpenses).post(protect, admin, createExpense);
router.route('/expenses/:id').put(protect, admin, updateExpense).delete(protect, admin, deleteExpense);

router.route('/fees').get(protect, getFees).post(protect, admin, createFee);
router.route('/fees/:id').put(protect, admin, updateFee).delete(protect, admin, deleteFee);

router.route('/salaries').get(protect, admin, getSalaries).post(protect, admin, paySalary);
router.route('/student-payments').get(protect, admin, getStudentPayments).post(protect, admin, createStudentPayment);

router.route('/attendances').get(protect, getAttendances).post(protect, teacherOrAdmin, createAttendance);
router.route('/attendances/daily').get(protect, teacherOrAdmin, getDailyAttendance).post(protect, teacherOrAdmin, submitDailyAttendance);
router.route('/attendances/:id').put(protect, teacherOrAdmin, updateAttendance).delete(protect, teacherOrAdmin, deleteAttendance);

router.route('/exams').get(protect, teacherOrAdmin, getExams).post(protect, teacherOrAdmin, createExam);
router.route('/exams/:id').put(protect, teacherOrAdmin, updateExam).delete(protect, teacherOrAdmin, deleteExam);
router.route('/exams/bulk-results').post(protect, teacherOrAdmin, bulkSubmitResults);
router.route('/exams/consolidated-students').get(protect, teacherOrAdmin, getStudentsForConsolidatedEntry);
router.route('/exams/bulk-toggle').patch(protect, admin, bulkToggleExamStatus);
router.route('/exams/:id/toggle').patch(protect, admin, toggleExamStatus);
router.route('/exams/:id/students').get(protect, teacherOrAdmin, getStudentsForExam);

router.route('/results').get(protect, getResults).post(protect, teacherOrAdmin, createResult);
router.route('/results/bulk-lock').patch(protect, admin, bulkToggleStudentResults);
router.route('/results/:id').put(protect, teacherOrAdmin, updateResult).delete(protect, teacherOrAdmin, deleteResult);
router.route('/dashboard').get(protect, getDashboardStats);

router.route('/reports/financial').get(protect, admin, getFinancialReport);
router.route('/reports/general').get(protect, admin, getGeneralReport);

export default router;
