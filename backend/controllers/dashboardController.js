import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Expense from '../models/Expense.js';
import Skill from '../models/Skill.js';
import Class from '../models/Class.js';
import SkillCategory from '../models/SkillCategory.js';
import StudentPayment from '../models/StudentPayment.js';
import SalaryPayment from '../models/SalaryPayment.js';
import ExamFee from '../models/ExamFee.js';
import Fee from '../models/Fee.js';

export const getDashboardStats = async (req, res) => {
    try {
        const { period } = req.query; // 'weekly', 'monthly', 'yearly', or 'all'

        let dateFilter = null;
        if (period === 'weekly') {
            const d = new Date(); d.setDate(d.getDate() - 7); dateFilter = { $gte: d };
        } else if (period === 'monthly') {
            const d = new Date(); d.setMonth(d.getMonth() - 1); dateFilter = { $gte: d };
        } else if (period === 'yearly') {
            const d = new Date(); d.setFullYear(d.getFullYear() - 1); dateFilter = { $gte: d };
        }

        const paymentQuery = dateFilter ? { paymentDate: dateFilter } : {};
        const expenseQuery = dateFilter ? { date: dateFilter } : {};
        const salaryQuery = dateFilter ? { paymentDate: dateFilter } : {};
        const creationQuery = dateFilter ? { createdAt: dateFilter } : {}; // Used for general counting of users/objects
        
        // Fee query for "Owed" - we consider pending fees
        // If there's a period, maybe we only want pending fees from that period
        const feeQuery = { status: 'Pending' };
        if (dateFilter) feeQuery.createdAt = dateFilter;

        const totalStudents = await Student.countDocuments(creationQuery);
        const totalTeachers = await Teacher.countDocuments(creationQuery);

        // Use actual salary payments for totalSalaries if they exist or if filtering by date, else fall back to theoretical for all.
        const salaryPayments = await SalaryPayment.find(salaryQuery);
        const totalSalaries = salaryPayments.length > 0 || dateFilter
            ? salaryPayments.reduce((acc, p) => acc + (p.amount || 0), 0)
            : (await Teacher.find({})).reduce((acc, t) => acc + (t.salary || 0), 0);

        const expenses = await Expense.find(expenseQuery);
        const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

        // Total Income = sum of all actual StudentPayment records
        const studentPayments = await StudentPayment.find(paymentQuery);
        const totalIncome = studentPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

        const examFees = await ExamFee.find(paymentQuery);
        const totalExamFees = examFees.reduce((acc, f) => acc + (f.amount || 0), 0);
        
        const pendingFees = await Fee.find(feeQuery);
        const totalOwed = pendingFees.reduce((acc, f) => acc + (f.amount || 0), 0);

        // Sum of monthly rates for all active students (Target Revenue)
        const activeStudents = await Student.find({ status: 'Active' });
        const expectedTotal = activeStudents.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

        // Sum of all-time payments stored on student records
        const allStudents = await Student.find({});
        const totalDeposits = allStudents.reduce((acc, s) => acc + (Number(s.totalPaid) || 0), 0);

        const grandTotalIncome = totalIncome + totalExamFees;

        // All-time Collections
        const allTimeSPayments = await StudentPayment.find({});
        const allTimeEFees = await ExamFee.find({});
        const allTimeTotalCash = allTimeSPayments.reduce((acc, p) => acc + (p.amount || 0), 0) + 
                                allTimeEFees.reduce((acc, f) => acc + (f.amount || 0), 0);

        console.log(`[Dashboard] Period: ${period || 'all'}, Grand: ${grandTotalIncome}, AllTimeTotal: ${allTimeTotalCash}`);

        const totalSkills = await Skill.countDocuments(creationQuery);
        const totalClasses = await Class.countDocuments(creationQuery);
        const totalSkillCategories = await SkillCategory.countDocuments(creationQuery);

        const totals = {
            totalStudents,
            totalTeachers,
            totalSalaries,
            totalExpenses,
            totalSkills,
            totalClasses,
            totalSkillCategories,
            totalIncome,
            totalExamFees,
            totalOwed,
            totalExpectedAmount: expectedTotal,
            totalDeposits,
            grandTotalIncome,
            allTimeTotalCash
        };

        console.log(`[Dashboard] Final Response:`, JSON.stringify(totals, null, 2));
        res.json(totals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
