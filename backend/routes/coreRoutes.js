import express from 'express';
import { getSkillCategories, createSkillCategory, deleteSkillCategory } from '../controllers/skillCategoryController.js';
import { getSkills, createSkill, deleteSkill } from '../controllers/skillController.js';
import { getClasses, createClass, deleteClass } from '../controllers/classController.js';
import { getSubjects, createSubject, deleteSubject } from '../controllers/subjectController.js';
import { getBatches, createBatch, deleteBatch } from '../controllers/batchController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Categories
router.route('/skill-categories')
    .get(protect, getSkillCategories)
    .post(protect, admin, createSkillCategory);
router.route('/skill-categories/:id')
    .delete(protect, admin, deleteSkillCategory);

// Skills
router.get('/skills', getSkills);
router.post('/skills', protect, admin, createSkill);
router.route('/skills/:id')
    .delete(protect, admin, deleteSkill);

// Classes
router.get('/classes', getClasses);
router.post('/classes', protect, admin, createClass);
router.route('/classes/:id')
    .delete(protect, admin, deleteClass);

// Subjects
router.get('/subjects', getSubjects); // public for registration
router.post('/subjects', protect, admin, createSubject);
router.route('/subjects/:id')
    .delete(protect, admin, deleteSubject);

// Batches
router.route('/batches')
    .get(getBatches)
    .post(protect, admin, createBatch);
router.route('/batches/:id')
    .delete(protect, admin, deleteBatch);

export default router;
