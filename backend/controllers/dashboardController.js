import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Expense from '../models/Expense.js';
import Skill from '../models/Skill.js';
import Class from '../models/Class.js';
import SkillCategory from '../models/SkillCategory.js';
import Fee from '../models/Fee.js';

export const getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments({});
        const totalTeachers = await Teacher.countDocuments({});

        const teachers = await Teacher.find({});
        const totalSalaries = teachers.reduce((acc, t) => acc + (t.salary || 0), 0);

        const expenses = await Expense.find({});
        const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

        const fees = await Fee.find({ status: 'Paid' });
        const totalIncome = fees.reduce((acc, f) => acc + f.amount, 0);

        const totalSkills = await Skill.countDocuments({});
        const totalClasses = await Class.countDocuments({});
        const totalSkillCategories = await SkillCategory.countDocuments({});

        res.json({
            totalStudents,
            totalTeachers,
            totalSalaries,
            totalExpenses,
            totalSkills,
            totalClasses,
            totalSkillCategories,
            totalIncome
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
