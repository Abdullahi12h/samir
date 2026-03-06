import Assignment from '../models/Assignment.js';
import Student from '../models/Student.js';

// @desc  Get all assignments
// @route GET /api/assignments
// @access Private
export const getAssignments = async (req, res) => {
    try {
        let query = {};

        // Teachers can now see all assignments just like admins
        if (req.user.role === 'Student') {
            const student = await Student.findOne({ user: req.user._id });
            if (student) {
                // Return assignments for their class OR assignments with no specific class (general)
                query = { $or: [{ classId: student.classId }, { classId: null }] };
            }
        }

        const assignments = await Assignment.find(query).sort({ createdAt: -1 });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Create a new assignment
// @route POST /api/assignments
// @access Private (Admin/Teacher)
export const createAssignment = async (req, res) => {
    try {
        const { title, description, dueDate, subject, teacherId, teacherName, classId, className } = req.body;

        // Safe fallback for name (in case token user has no name)
        const creatorName = req.user.name || req.user.username || 'Unknown';

        // If the logged-in user is a Teacher and no teacherId selected, use themselves
        const resolvedTeacherId = teacherId || (req.user.role === 'Teacher' ? req.user._id : null);
        const resolvedTeacherName = teacherName || (req.user.role === 'Teacher' ? creatorName : '');

        const assignment = new Assignment({
            title,
            description,
            dueDate,
            subject,
            teacherId: resolvedTeacherId,
            teacherName: resolvedTeacherName,
            classId: classId || null,
            className: className || '',
            createdBy: req.user._id,
            createdByName: creatorName,
            submissions: [],
        });
        const created = await assignment.save();
        res.status(201).json(created);
    } catch (error) {
        console.error('[createAssignment] ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc  Delete an assignment
// @route DELETE /api/assignments/:id
// @access Private (Admin/Teacher)
export const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        // Authorization check: Admin OR Teacher can delete assignments
        if (req.user.role !== 'Admin' && req.user.role !== 'Teacher') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await assignment.deleteOne();
        res.json({ message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Submit assignment (student)
// @route POST /api/assignments/:id/submit
// @access Private
export const submitAssignment = async (req, res) => {
    try {
        const { studentName, submissionLink } = req.body;
        if (!studentName || !submissionLink) {
            return res.status(400).json({ message: 'Student name and submission link are required' });
        }
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        assignment.submissions.push({
            studentName,
            studentId: req.user._id,
            submissionLink,
        });
        const updated = await assignment.save();
        res.status(201).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Update submission status/grade
// @route PUT /api/assignments/:id/submissions/:subId
// @access Private (Admin/Teacher)
export const updateSubmission = async (req, res) => {
    try {
        const { status, grade, feedback } = req.body;
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        // Authorization check: Admin OR Teacher can grade assignments
        if (req.user.role !== 'Admin' && req.user.role !== 'Teacher') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const submission = assignment.submissions.id(req.params.subId);
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        if (status) submission.status = status;
        if (grade !== undefined) submission.grade = grade;
        if (feedback !== undefined) submission.feedback = feedback;

        const updated = await assignment.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
