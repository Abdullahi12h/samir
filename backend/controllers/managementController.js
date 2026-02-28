import Expense from '../models/Expense.js';
import Fee from '../models/Fee.js';
import Attendance from '../models/Attendance.js';
import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import SalaryPayment from '../models/SalaryPayment.js';
import StudentPayment from '../models/StudentPayment.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import fs from 'fs';

// Expenses
export const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({});
        res.json(expenses);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
export const createExpense = async (req, res) => {
    try {
        const expense = await Expense.create(req.body);
        res.status(201).json(expense);
    } catch (error) { res.status(400).json({ message: error.message }); }
};
export const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(expense);
    } catch (error) { res.status(400).json({ message: error.message }); }
};
export const deleteExpense = async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Fees
export const getFees = async (req, res) => {
    try {
        let query = {};
        const { classId, month, year, status } = req.query;

        try {
            fs.appendFileSync('results_debug.log', `[${new Date().toISOString()}] [getFees] Query: ${JSON.stringify(req.query)}\n`);
        } catch (e) { }

        // Base Student Role Filter
        if (req.user.role === 'Student') {
            const student = await Student.findOne({ user: req.user._id });
            if (student) query.studentId = student._id;
        }

        // Strict Filter by Month/Year (Educational Billing Style)
        if (month && month !== 'null' && month !== '') {
            query.month = Number(month);
        }
        if (year && year !== 'null' && year !== '') {
            query.year = Number(year);
        }

        // Filter by Status (Paid/Pending)
        if (status && status !== 'null' && status !== '') {
            query.status = status;
        }

        try {
            fs.appendFileSync('results_debug.log', `[${new Date().toISOString()}] [getFees] DB Query: ${JSON.stringify(query)}\n`);
        } catch (e) { }

        // Filter by Class (Only if Admin/Teacher)
        if (classId && classId !== 'null') {
            const studentsInClass = await Student.find({ classId }).select('_id');
            const studentIds = studentsInClass.map(s => s._id);
            query.studentId = { $in: studentIds };
        }

        const fees = await Fee.find(query).populate({
            path: 'studentId',
            populate: [
                { path: 'user', select: 'name phone' },
                { path: 'classId', select: 'name' }
            ]
        }).sort({ createdAt: -1 });
        res.json(fees);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
export const createFee = async (req, res) => {
    try {
        const fee = await Fee.create(req.body);
        res.status(201).json(fee);
    } catch (error) { res.status(400).json({ message: error.message }); }
};
export const updateFee = async (req, res) => {
    try {
        const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(fee);
    } catch (error) { res.status(400).json({ message: error.message }); }
};
export const deleteFee = async (req, res) => {
    try {
        await Fee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Salaries
export const getSalaries = async (req, res) => {
    try {
        const { period } = req.query; // e.g., '2026-02' (YYYY-MM)

        const teachers = await Teacher.find({}).populate('user', 'name');
        console.log(`[getSalaries] Found ${teachers.length} teachers in DB`);

        // Build date range query for the period
        let payments = [];
        if (period) {
            const [year, month] = period.split('-').map(Number);
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 1); // first day of next month
            payments = await SalaryPayment.find({
                paymentDate: { $gte: start, $lt: end }
            });
        } else {
            payments = await SalaryPayment.find({});
        }

        const data = teachers.map(teacher => {
            const payment = payments.find(p => p.teacherId.toString() === teacher._id.toString());
            return {
                ...teacher.toObject(),
                isPaid: !!payment,
                paymentDetails: payment || null
            };
        });

        res.json(data);
    } catch (error) {
        console.error('getSalaries error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const paySalary = async (req, res) => {
    try {
        const { teacherId, amount, period, paymentDate } = req.body;

        // Check if already paid for this period (using date range)
        let alreadyPaid = false;
        if (period) {
            const [year, month] = period.split('-').map(Number);
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 1);
            const existing = await SalaryPayment.findOne({
                teacherId,
                paymentDate: { $gte: start, $lt: end }
            });
            alreadyPaid = !!existing;
        }

        if (alreadyPaid) {
            return res.status(400).json({ message: `Salary already paid for this period` });
        }

        const payment = await SalaryPayment.create({
            teacherId,
            amount,
            period: period || '',
            paymentDate: paymentDate || new Date()
        });

        res.status(201).json(payment);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

// Student Payments (Advanced System)
export const getStudentPayments = async (req, res) => {
    try {
        const { classId, month, year } = req.query;
        let query = {};

        // Filter by Date (using paymentDate)
        if (month && month !== 'null' && year) {
            const start = new Date(Number(year), Number(month) - 1, 1);
            const end = new Date(Number(year), Number(month), 1);
            query.paymentDate = { $gte: start, $lt: end };
        } else if (year && year !== 'null') {
            const start = new Date(Number(year), 0, 1);
            const end = new Date(Number(year) + 1, 0, 1);
            query.paymentDate = { $gte: start, $lt: end };
        }

        // Handle filtering by Class
        if (classId && classId !== 'null') {
            const studentsInClass = await Student.find({ classId }).select('_id');
            const studentIds = studentsInClass.map(s => s._id);
            query.studentId = { $in: studentIds };
        }

        const payments = await StudentPayment.find(query)
            .populate({
                path: 'studentId',
                populate: [
                    { path: 'user', select: 'name username' },
                    { path: 'classId', select: 'name' }
                ]
            }).sort({ paymentDate: -1 });
        res.json(payments);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const createStudentPayment = async (req, res) => {
    try {
        const { studentId, amount, paymentDate } = req.body;
        const receiptNumber = `RCPT-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;

        const payment = await StudentPayment.create({
            studentId,
            amount: Number(amount),
            paymentDate: paymentDate || new Date(),
            receiptNumber
        });

        // Update Student totalPaid
        const student = await Student.findById(studentId);
        if (student) {
            student.totalPaid = (student.totalPaid || 0) + Number(amount);
            await student.save();
        }

        res.status(201).json(payment);
    } catch (error) {
        console.error('Error in createStudentPayment:', error);
        res.status(400).json({ message: error.message || 'Error processing payment on server' });
    }
};

// Attendance
export const getAttendances = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Student') {
            const student = await Student.findOne({ user: req.user._id });
            if (student) query.classId = student.classId;
        }
        const attendances = await Attendance.find(query).populate('classId batchId');
        res.json(attendances);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
export const createAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.create(req.body);
        res.status(201).json(attendance);
    } catch (error) { res.status(400).json({ message: error.message }); }
};
export const updateAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(attendance);
    } catch (error) { res.status(400).json({ message: error.message }); }
};
export const deleteAttendance = async (req, res) => {
    try {
        await Attendance.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getDailyAttendance = async (req, res) => {
    try {
        const { classId, date } = req.query;
        if (!classId || !date) return res.status(400).json({ message: 'Class and Date are required' });

        // Teachers can view attendance for any class

        const searchDate = new Date(date);
        searchDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(searchDate);
        nextDate.setDate(nextDate.getDate() + 1);

        let attendance = await Attendance.findOne({
            classId,
            date: { $gte: searchDate, $lt: nextDate }
        }).populate('records.studentId');

        if (!attendance) {
            // If no attendance found, get students of that class to start fresh
            const { default: Student } = await import('../models/Student.js');
            const students = await Student.find({ classId }).populate('user', 'name');
            const records = students.map(s => ({
                studentId: s,
                status: 'Present'
            }));
            return res.json({ classId, date, records, isNew: true });
        }

        res.json(attendance);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const submitDailyAttendance = async (req, res) => {
    try {
        const { classId, date, records } = req.body;

        // Teachers can submit attendance for any class

        const searchDate = new Date(date);
        searchDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(searchDate);
        nextDate.setDate(nextDate.getDate() + 1);

        let attendance = await Attendance.findOne({
            classId,
            date: { $gte: searchDate, $lt: nextDate }
        });

        if (attendance) {
            // Check 24 hour lock for non-admins
            if (req.user.role !== 'Admin') {
                const now = new Date();
                const diffHours = (now - attendance.createdAt) / (1000 * 60 * 60);
                if (diffHours > 24) {
                    return res.status(403).json({ message: 'Attendance is locked after 24 hours. Contact Admin to edit.' });
                }
            }
            attendance.records = records;
            await attendance.save();
        } else {
            // Create new
            const { default: Student } = await import('../models/Student.js');
            // Ensure batchId is fetched from a student of this class or provided. 
            // For now, let's just get any student from this class to find the batchId
            const firstStudent = await Student.findOne({ classId });
            attendance = await Attendance.create({
                classId,
                batchId: firstStudent ? firstStudent.batchId : null,
                date: searchDate,
                records
            });
        }

        res.json(attendance);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

// Exams
export const getExams = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Teacher') {
            const teacherData = await Teacher.findOne({ user: req.user._id });
            if (teacherData) {
                query.classId = { $in: teacherData.classIds || [] };
                query.subjectId = { $in: teacherData.subjects || [] };
            } else {
                return res.json([]);
            }
        }
        let exams = await Exam.find(query).populate('skillId classId subjectId');

        // Exclude legacy exams without a subject name ONLY for non-admins 
        // (Admins need to see them to assign subjects)
        if (req.user.role !== 'Admin') {
            exams = exams.filter(e => e.subjectId && e.subjectId.name);
        }

        res.json(exams);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
export const createExam = async (req, res) => {
    try {
        const exam = await Exam.create(req.body);
        res.status(201).json(exam);
    } catch (error) { res.status(400).json({ message: error.message }); }
};
export const updateExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(exam);
    } catch (error) { res.status(400).json({ message: error.message }); }
};
export const deleteExam = async (req, res) => {
    try {
        await Exam.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const toggleExamStatus = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (exam) {
            exam.status = exam.status === 'Open' ? 'Closed' : 'Open';
            const updatedExam = await exam.save();
            res.json(updatedExam);
        } else {
            res.status(404).json({ message: 'Exam not found' });
        }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const bulkToggleExamStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Open', 'Closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be "Open" or "Closed"' });
        }
        await Exam.updateMany({}, { status });
        res.json({ message: `Successfully updated all exams to ${status}` });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getStudentsForConsolidatedEntry = async (req, res) => {
    try {
        const { skillId, classId, subjectId } = req.query;
        if (!skillId || !classId || !subjectId) {
            return res.status(400).json({ message: 'Skill, Class, and Subject are required' });
        }

        const { default: Student } = await import('../models/Student.js');
        const students = await Student.find({ classId, skillId }).populate('user', 'name');

        const existingResults = await Result.find({ skillId, classId, subjectId });
        const unpaidFees = await Fee.find({ status: 'Pending' });

        const studentsData = students.map(student => {
            const hasUnpaid = unpaidFees.some(f => f.studentId.toString() === student._id.toString());
            const existingResult = existingResults.find(r => r.studentId.toString() === student._id.toString());
            return {
                ...student.toObject(),
                hasUnpaidFees: hasUnpaid,
                midterm: existingResult ? existingResult.midterm : 0,
                test: existingResult ? existingResult.test : 0,
                final: existingResult ? existingResult.final : 0,
                total: existingResult ? existingResult.total : 0
            };
        });

        res.json(studentsData);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const bulkSubmitResults = async (req, res) => {
    try {
        const { skillId, classId, subjectId, results } = req.body;

        if (!skillId || !classId || !subjectId) {
            return res.status(400).json({ message: 'Skill, Class, and Subject are required' });
        }

        // Validation loop
        for (const data of results) {
            const m = Number(data.midterm) || 0;
            const t = Number(data.test) || 0;
            const f = Number(data.final) || 0;

            if (m > 40 || t > 20 || f > 40) {
                return res.status(400).json({
                    message: `Invalid marks detected. Midterm max 40, Test max 20, Final max 40.`
                });
            }
        }

        // Upsert results for each student
        for (const data of results) {
            const { studentId, midterm, test, final } = data;

            // Check if exam is closed (only for safety, though bulk entry usually targets skill/class/subject)
            // If there's an exam document for this specific skill/class/subject, check its status
            const relatedExam = await Exam.findOne({ skillId, classId, subjectId });
            if (relatedExam && relatedExam.status === 'Closed') {
                return res.status(403).json({ message: `Cannot submit results. Exam for ${relatedExam.type} is CLOSED.` });
            }

            // Calculate total for sync
            const total = (Number(midterm) || 0) + (Number(test) || 0) + (Number(final) || 0);

            await Result.findOneAndUpdate(
                { studentId, subjectId, classId, skillId },
                {
                    midterm: Number(midterm) || 0,
                    test: Number(test) || 0,
                    final: Number(final) || 0,
                    total: total,
                    marksObtained: total // Sync for legacy
                },
                { upsert: true, new: true, runValidators: true }
            );
        }
        res.json({ message: 'Results saved successfully' });
    } catch (error) { res.status(400).json({ message: error.message }); }
};

// Legacy single-exam endpoint (keep for compatibility if needed elsewhere)
export const getStudentsForExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        const { default: Student } = await import('../models/Student.js');
        const students = await Student.find({ classId: exam.classId }).populate('user', 'name');

        const existingResults = await Result.find({ examId: exam._id });
        const unpaidFees = await Fee.find({ status: 'Pending' });

        const studentsData = students.map(student => {
            const hasUnpaid = unpaidFees.some(f => f.studentId.toString() === student._id.toString());
            const existingResult = existingResults.find(r => r.studentId.toString() === student._id.toString());
            return {
                ...student.toObject(),
                hasUnpaidFees: hasUnpaid,
                marksObtained: existingResult ? existingResult.marksObtained : ''
            };
        });

        res.json(studentsData);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Results
export const getResults = async (req, res) => {
    try {
        let query = {};
        const { classId } = req.query;

        const log = (msg) => {
            try {
                fs.appendFileSync('results_debug.log', `[${new Date().toISOString()}] ${msg}\n`);
            } catch (e) { }
            console.log(msg);
        };

        log(`[getResults] START - User: ${req.user?._id}, Role: ${req.user?.role}`);

        if (req.user.role === 'Student') {
            const studentData = await Student.findOne({ user: req.user._id });
            if (studentData) {
                if (studentData.isLocked === true) {
                    log(`[getResults] Student ${studentData._id} IS LOCKED. Returning empty results.`);
                    return res.json({ results: [], isLocked: true });
                }
                query.studentId = studentData._id;
            } else {
                log(`[getResults] Student NOT FOUND for user ${req.user._id}`);
                return res.json({ results: [] });
            }
        }

        const results = await Result.find(query)
            .populate({ path: 'studentId', populate: { path: 'user', select: 'name' }, select: '_id user enrollmentNo classId isLocked' })
            .populate({ path: 'examId', populate: [{ path: 'skillId', select: 'name' }, { path: 'subjectId', select: 'name' }] })
            .populate('subjectId', 'name')
            .populate('skillId', 'name')
            .populate('classId', 'name');

        log(`[getResults] Found ${results.length} total results. Pre-filtering for valid subjects...`);

        // Filter out results where subject is missing in both legacy and new structures
        let filteredResults = results.filter(r => {
            const hasLegacySubject = r.examId && r.examId.subjectId && r.examId.subjectId.name;
            const hasNewSubject = r.subjectId && r.subjectId.name;
            return hasLegacySubject || hasNewSubject;
        });

        log(`[getResults] Filtered to ${filteredResults.length} results after strict subject validation`);

        // Apply Teacher specific filtering
        if (req.user.role === 'Teacher') {
            const teacherData = await Teacher.findOne({ user: req.user._id });

            // REQUIRE subjectId for teachers
            if (!req.query.subjectId || req.query.subjectId === '') {
                log(`[getResults] Teacher requested results without subjectId filter - returning empty`);
                return res.json([]);
            }

            if (teacherData && teacherData.classIds && teacherData.classIds.length > 0) {
                const teacherClassIdsString = teacherData.classIds.map(id => id.toString());
                filteredResults = filteredResults.filter(r => {
                    const studentClassId = r.studentId?.classId?.toString();
                    return studentClassId && teacherClassIdsString.includes(studentClassId);
                });
                log(`[getResults] Filtered to ${filteredResults.length} results based on Teacher assigned classes`);
            } else {
                // If teacher has no classes assigned, they see nothing
                log(`[getResults] Teacher has no assigned classes, returning empty results`);
                filteredResults = [];
            }
        }

        // Filter by subjectId if provided
        if (req.query.subjectId && req.query.subjectId !== '') {
            const targetSubjectId = req.query.subjectId.toString();
            log(`[getResults] Filtering by specific subjectId: ${targetSubjectId}`);
            filteredResults = filteredResults.filter(r => {
                const legacySubjectId = (r.examId?.subjectId?._id || r.examId?.subjectId)?.toString();
                const newSubjectId = (r.subjectId?._id || r.subjectId)?.toString();
                const match = legacySubjectId === targetSubjectId || newSubjectId === targetSubjectId;
                return match;
            });
        } else if (req.user.role === 'Teacher') {
            log(`[getResults] Teacher requested results without subjectId - double safety check failed, returning empty`);
            return res.json([]);
        }

        if (classId) {
            log(`[getResults] Filtering by specific classId: ${classId}`);
            filteredResults = filteredResults.filter(r => {
                const legacyClassId = r.studentId?.classId?.toString();
                const newClassId = (r.classId?._id || r.classId)?.toString();
                return legacyClassId === classId || newClassId === classId;
            });
        }

        if (req.query.skillId) {
            log(`[getResults] Filtering by specific skillId: ${req.query.skillId}`);
            const targetSkillId = req.query.skillId.toString();
            filteredResults = filteredResults.filter(r => {
                const legacySkillId = (r.examId?.skillId?._id || r.examId?.skillId)?.toString();
                const newSkillId = (r.skillId?._id || r.skillId)?.toString();
                return legacySkillId === targetSkillId || newSkillId === targetSkillId;
            });
        }


        log(`[getResults] Returning ${filteredResults.length} results`);

        // Final Filter: Hide results for CLOSED exams from students
        if (req.user.role === 'Student') {
            const finalResults = [];
            for (const r of filteredResults) {
                // Determine IDs safely, accounting for legacy examId structure
                const sid = r.skillId?._id || r.skillId || r.examId?.skillId?._id || r.examId?.skillId;
                const cid = r.classId?._id || r.classId || r.studentId?.classId;
                const subid = r.subjectId?._id || r.subjectId || r.examId?.subjectId?._id || r.examId?.subjectId;

                // Check for ANY closed exam matching this result's context
                const examCheck = await Exam.findOne({
                    skillId: sid,
                    classId: cid,
                    subjectId: subid,
                    status: 'Closed'
                });

                if (examCheck) continue; // Hide if a matching closed exam exist

                // Also check if the specific linked exam or the result itself is closed/locked
                if (r.examId && r.examId.status === 'Closed') continue;
                if (r.isLocked === true) continue;

                finalResults.push(r);
            }
            return res.json({ results: finalResults });
        }

        res.json({ results: filteredResults });
    } catch (error) {
        console.error('[getResults] ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};
export const createResult = async (req, res) => {
    try {
        const { examId, skillId, classId, subjectId } = req.body;

        // Find exam status
        let examStatus = 'Open';
        if (examId) {
            const exam = await Exam.findById(examId);
            if (exam) examStatus = exam.status;
        } else {
            const exam = await Exam.findOne({ skillId, classId, subjectId });
            if (exam) examStatus = exam.status;
        }

        if (examStatus === 'Closed') {
            return res.status(403).json({ message: 'Exam is CLOSED. Cannot create result.' });
        }

        const result = await Result.create(req.body);
        res.status(201).json(result);
    } catch (error) { res.status(400).json({ message: error.message }); }
};
export const updateResult = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id).populate('examId');
        if (!result) return res.status(404).json({ message: 'Result not found' });

        let examStatus = 'Open';
        if (result.examId) {
            examStatus = result.examId.status;
        } else {
            const exam = await Exam.findOne({
                skillId: result.skillId,
                classId: result.classId,
                subjectId: result.subjectId
            });
            if (exam) examStatus = exam.status;
        }

        if (examStatus === 'Closed' && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Exam is CLOSED. Cannot edit result.' });
        }

        const updatedResult = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedResult);
    } catch (error) { res.status(400).json({ message: error.message }); }
};
export const deleteResult = async (req, res) => {
    try {
        await Result.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const bulkToggleStudentResults = async (req, res) => {
    try {
        const { isLocked } = req.body;
        if (typeof isLocked !== 'boolean') {
            return res.status(400).json({ message: 'Invalid lock status. Must be true or false' });
        }
        await Student.updateMany({}, { isLocked });
        res.json({ message: `Successfully ${isLocked ? 'LOCKED' : 'OPENED'} results for all students` });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Reports
export const getFinancialReport = async (req, res) => {
    try {
        const { startDate, endDate, year } = req.query;
        let query = {};

        if (year) {
            query.date = {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`)
            };
        } else if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const fees = await Fee.find(query);
        const expenses = await Expense.find(query);

        const totalIncome = fees.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        res.json({
            summary: {
                totalIncome,
                totalExpenses,
                netBalance: totalIncome - totalExpenses
            },
            details: {
                fees: fees.length,
                expenses: expenses.length
            }
        });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getGeneralReport = async (req, res) => {
    try {
        const { default: Student } = await import('../models/Student.js');
        const { default: Teacher } = await import('../models/Teacher.js');
        const { default: Class } = await import('../models/Class.js');
        const { default: Subject } = await import('../models/Subject.js');

        const students = await Student.find({}).populate('user', 'name email phone').populate('classId', 'name');
        const teachers = await Teacher.find({}).populate('user', 'name email phone').populate('subjectId', 'name').populate('skills', 'name');
        const classes = await Class.find({});
        const subjects = await Subject.find({}).populate('classId', 'name');

        res.json({
            counts: {
                students: students.length,
                teachers: teachers.length,
                classes: classes.length,
                subjects: subjects.length
            },
            lists: {
                students,
                teachers,
                classes,
                subjects
            },
            timestamp: new Date()
        });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
